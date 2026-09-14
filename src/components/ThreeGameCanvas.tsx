import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { WordItem, GameStatus, GameMode } from '../types';
import { ALL_WORDS, TRUE_CLUSTERS, FALSE_CLUSTERS } from '../data/words';
import { createCannonModel, CannonController } from './game/cannonModel';
import { ParticleSystem } from './game/particleEffects';
import { createWordTarget, setWordTargetHover, WordTargetInstance } from './game/wordMesh';
import { createSpaceEnvironment, SpaceEnvironment } from './game/spaceEnvironment';
import { SoundEffects, speakThaiWord } from '../utils/audio';

interface Props {
  gameStatus: GameStatus;
  gameMode: GameMode;
  level: number;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  onHitWord: (word: WordItem, isCorrect: boolean) => void;
  onMissTrueWord: (word: WordItem) => void;
  onAimChange: (screenX: number, screenY: number, hoveredWord: WordItem | null) => void;
}

export const ThreeGameCanvas: React.FC<Props> = ({
  gameStatus,
  gameMode,
  level,
  soundEnabled,
  voiceEnabled,
  onHitWord,
  onMissTrueWord,
  onAimChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable refs for gameplay state inside animation loop
  const stateRef = useRef({
    gameStatus,
    gameMode,
    level,
    soundEnabled,
    voiceEnabled,
    onHitWord,
    onMissTrueWord,
    onAimChange,
  });

  // Keep stateRef up to date
  useEffect(() => {
    stateRef.current = {
      gameStatus,
      gameMode,
      level,
      soundEnabled,
      voiceEnabled,
      onHitWord,
      onMissTrueWord,
      onAimChange,
    };
  }, [gameStatus, gameMode, level, soundEnabled, voiceEnabled, onHitWord, onMissTrueWord, onAimChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;
    let isDisposed = false;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b19);
    scene.fog = new THREE.FogExp2(0x070b19, 0.025);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 14.5);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x93c5fd, 2.0);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.2);
    rimLight.position.set(-8, -4, 5);
    scene.add(rimLight);

    // 5. Starfield & Space Atmosphere
    const starsCount = 400;
    const starsGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 50;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      starPos[i * 3 + 2] = -5 - Math.random() * 25;

      const isCyan = Math.random() > 0.4;
      starColors[i * 3] = isCyan ? 0.35 : 0.8;
      starColors[i * 3 + 1] = isCyan ? 0.8 : 0.85;
      starColors[i * 3 + 2] = 1.0;
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starsGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starsMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starsGeom, starsMat);
    scene.add(stars);

    // Procedural 3D Deep Space & Asteroids Environment
    const spaceEnv: SpaceEnvironment = createSpaceEnvironment();
    scene.add(spaceEnv.group);

    // Cyber Defense Line / Barrier at the bottom
    const gridHelper = new THREE.GridHelper(26, 26, 0x0284c7, 0x1e293b);
    gridHelper.position.set(0, -6.3, 2);
    gridHelper.rotation.x = 0.15;
    scene.add(gridHelper);

    // 6. 3D Cannon Model
    const cannon: CannonController = createCannonModel();
    scene.add(cannon.group);

    // 7. Particle System (projectiles, bursts, shockwaves)
    const particleSystem = new ParticleSystem(scene);

    // 8. Word Targets Management
    let activeTargets: WordTargetInstance[] = [];
    const usedWordIds = new Set<string>();
    let spawnTimer = 0.5;
    let targetThemeCounter = 0;

    // Mouse aiming raycasting
    const raycaster = new THREE.Raycaster();
    const mouseNorm = new THREE.Vector2(0, 0);
    const aimWorldPos = new THREE.Vector3(0, 2, 0);
    const targetPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Z=0 plane

    let hoveredTarget: WordTargetInstance | null = null;

    // Spawn Helper
    const spawnTarget = () => {
      if (activeTargets.length >= Math.min(4 + stateRef.current.level, 6)) return;

      // Select next word: 60% chance True cluster, 40% False cluster
      const wantTrue = Math.random() < 0.65;
      const pool = wantTrue ? TRUE_CLUSTERS : FALSE_CLUSTERS;
      const available = pool.filter((w) => !usedWordIds.has(w.id));
      const chosenWord =
        available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : pool[Math.floor(Math.random() * pool.length)];

      usedWordIds.add(chosenWord.id);

      // Random horizontal position, avoiding overlapping existing targets
      const spawnX = (Math.random() - 0.5) * 11;
      const spawnY = 8.5;
      const spawnZ = (Math.random() - 0.5) * 1.5;

      // Speed scale with level & mode
      const baseSpeed =
        stateRef.current.gameMode === 'zen'
          ? 0.55
          : 0.85 + Math.min(stateRef.current.level * 0.15, 1.2);

      // Cycle colors to ensure rich visual variety
      const currentThemeIndex = targetThemeCounter++;
      const target = createWordTarget(chosenWord, spawnX, spawnY, spawnZ, baseSpeed, currentThemeIndex);
      scene.add(target.group);
      activeTargets.push(target);
    };

    // Shoot Action
    const handleShoot = () => {
      if (stateRef.current.gameStatus !== 'playing') return;

      // Trigger cannon recoil and sound
      cannon.triggerRecoil();
      if (stateRef.current.soundEnabled) {
        SoundEffects.playLaser();
      }

      const muzzlePos = cannon.getMuzzlePosition();
      const currentAim = aimWorldPos.clone();

      // Check hit with raycaster
      raycaster.setFromCamera(mouseNorm, camera);
      const targetMeshes = activeTargets.filter((t) => !t.isDying).map((t) => t.cardMesh);
      const intersects = raycaster.intersectObjects(targetMeshes, false);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object as THREE.Mesh;
        const hitTarget = activeTargets.find((t) => t.cardMesh === hitMesh && !t.isDying);

        if (hitTarget) {
          const hitPoint = intersects[0].point;
          // Spawn bolt towards the exact hit point
          particleSystem.spawnLaserBolt(muzzlePos, hitPoint, () => {
            handleTargetHit(hitTarget, hitPoint);
          });
          return;
        }
      }

      // If missed, spawn bolt to aim point
      particleSystem.spawnLaserBolt(muzzlePos, currentAim);
    };

    const handleTargetHit = (target: WordTargetInstance, hitPoint: THREE.Vector3) => {
      target.isDying = true;
      const isTrue = target.word.type === 'true';

      // 3D Explosion
      particleSystem.spawnWordExplosion(hitPoint, isTrue);

      if (isTrue) {
        // Confetti burst for children on true cluster hit!
        try {
          confetti({
            particleCount: 25,
            spread: 55,
            origin: {
              x: (container.clientWidth / 2 + (hitPoint.x / 14) * (container.clientWidth / 2)) / container.clientWidth,
              y: (container.clientHeight / 2 - (hitPoint.y / 9) * (container.clientHeight / 2)) / container.clientHeight,
            },
            colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e'],
          });
        } catch {
          // ignore
        }

        if (stateRef.current.soundEnabled) {
          SoundEffects.playCorrect(stateRef.current.level);
        }
      } else {
        if (stateRef.current.soundEnabled) {
          SoundEffects.playWrong();
        }
      }

      if (stateRef.current.voiceEnabled) {
        speakThaiWord(target.word.text);
      }

      // Notify parent component
      stateRef.current.onHitWord(target.word, isTrue);

      // Remove target from scene
      scene.remove(target.group);
      target.dispose();
      usedWordIds.delete(target.word.id);
      activeTargets = activeTargets.filter((t) => t !== target);

      if (hoveredTarget === target) {
        hoveredTarget = null;
      }
    };

    // Mouse Listeners
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseNorm.x = (x / rect.width) * 2 - 1;
      mouseNorm.y = -(y / rect.height) * 2 + 1;

      // Project mouse onto target plane Z=0
      raycaster.setFromCamera(mouseNorm, camera);
      raycaster.ray.intersectPlane(targetPlane, aimWorldPos);

      // Raycast against word targets for hover state
      const targetMeshes = activeTargets.filter((t) => !t.isDying).map((t) => t.cardMesh);
      const intersects = raycaster.intersectObjects(targetMeshes, false);

      let foundHover: WordTargetInstance | null = null;
      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        foundHover = activeTargets.find((t) => t.cardMesh === hitMesh && !t.isDying) || null;
      }

      if (foundHover !== hoveredTarget) {
        if (hoveredTarget) setWordTargetHover(hoveredTarget, false);
        if (foundHover) setWordTargetHover(foundHover, true);
        hoveredTarget = foundHover;
      }

      stateRef.current.onAimChange(x, y, hoveredTarget?.word || null);
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (e.button === 0) {
        handleShoot();
      }
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('pointerdown', handlePointerDown);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // 1. Rotate Cannon to face mouse aiming point
      cannon.aimAt(aimWorldPos);
      cannon.update(delta);

      // 2. Starfield slow drift & 3D Space Environment Update
      stars.rotation.y = elapsedTime * 0.02;
      spaceEnv.update(delta, elapsedTime);

      // 3. Gameplay logic when playing
      if (stateRef.current.gameStatus === 'playing') {
        spawnTimer -= delta;
        if (spawnTimer <= 0) {
          spawnTarget();
          spawnTimer = 1.4 + Math.random() * 1.0 - Math.min(stateRef.current.level * 0.1, 0.6);
        }

        // Update active targets
        for (let i = activeTargets.length - 1; i >= 0; i--) {
          const t = activeTargets[i];
          if (t.isDying) continue;

          // Move down
          t.y -= t.vy * delta;
          t.x += Math.sin(elapsedTime * 1.5 + t.bobPhase) * 0.01;

          t.group.position.set(
            t.x,
            t.y + Math.sin(elapsedTime * 2.5 + t.bobPhase) * 0.1,
            t.z
          );

          // Gentle 3D rock
          t.group.rotation.y = Math.sin(elapsedTime * 2 + t.bobPhase) * 0.1;
          t.group.rotation.x = Math.cos(elapsedTime * 1.5 + t.bobPhase) * 0.05;

          // Check if reached bottom boundary (Y < -5.2)
          if (t.y < -5.2) {
            scene.remove(t.group);
            t.dispose();
            usedWordIds.delete(t.word.id);
            activeTargets.splice(i, 1);

            // If it was a TRUE cluster and player didn't shoot it!
            if (t.word.type === 'true') {
              stateRef.current.onMissTrueWord(t.word);
            }
          }
        }
      }

      // 4. Update Particle System
      particleSystem.update(delta);

      // 5. Render
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('pointerdown', handlePointerDown);

      activeTargets.forEach((t) => {
        scene.remove(t.group);
        t.dispose();
      });
      activeTargets = [];

      spaceEnv.dispose();
      scene.remove(spaceEnv.group);

      particleSystem.clear();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="relative w-full h-full cursor-none overflow-hidden" />;
};
