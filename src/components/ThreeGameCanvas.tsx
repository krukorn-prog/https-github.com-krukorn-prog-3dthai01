import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import confetti from 'canvas-confetti';
import { WordItem, GameStatus, GameMode } from '../types';
import { TRUE_CLUSTERS, FALSE_CLUSTERS } from '../data/words';
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
  gameStatus, gameMode, level, soundEnabled, voiceEnabled,
  onHitWord, onMissTrueWord, onAimChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ gameStatus, gameMode, level, soundEnabled, voiceEnabled, onHitWord, onMissTrueWord, onAimChange });

  useEffect(() => {
    stateRef.current = { gameStatus, gameMode, level, soundEnabled, voiceEnabled, onHitWord, onMissTrueWord, onAimChange };
  }, [gameStatus, gameMode, level, soundEnabled, voiceEnabled, onHitWord, onMissTrueWord, onAimChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let animationFrameId = 0;
    let isDisposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b19);
    scene.fog = new THREE.FogExp2(0x070b19, 0.025);
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 14.5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const dirLight = new THREE.DirectionalLight(0x93c5fd, 2);
    dirLight.position.set(5, 10, 8);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.2);
    rimLight.position.set(-8, -4, 5);
    scene.add(rimLight);

    const starsCount = 400;
    const starsGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 50;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 35;
      starPos[i * 3 + 2] = -5 - Math.random() * 25;
      const cyan = Math.random() > 0.4;
      starColors[i * 3] = cyan ? 0.35 : 0.8;
      starColors[i * 3 + 1] = cyan ? 0.8 : 0.85;
      starColors[i * 3 + 2] = 1;
    }
    starsGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starsGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starsMat = new THREE.PointsMaterial({ size: 0.18, vertexColors: true, transparent: true, opacity: 0.8 });
    const stars = new THREE.Points(starsGeom, starsMat);
    scene.add(stars);

    const spaceEnv: SpaceEnvironment = createSpaceEnvironment();
    scene.add(spaceEnv.group);
    const grid = new THREE.GridHelper(26, 26, 0x0284c7, 0x1e293b);
    grid.position.set(0, -6.3, 2);
    grid.rotation.x = 0.15;
    scene.add(grid);

    let activeTargets: WordTargetInstance[] = [];
    const usedWordIds = new Set<string>();
    let spawnTimer = 0.5;
    let themeCounter = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hovered: WordTargetInstance | null = null;

    const spawnTarget = () => {
      if (activeTargets.length >= Math.min(4 + stateRef.current.level, 6)) return;
      const pool = Math.random() < 0.65 ? TRUE_CLUSTERS : FALSE_CLUSTERS;
      const available = pool.filter(w => !usedWordIds.has(w.id));
      const word = available.length ? available[Math.floor(Math.random() * available.length)] : pool[Math.floor(Math.random() * pool.length)];
      usedWordIds.add(word.id);
      const x = (Math.random() - 0.5) * 11;
      const speed = stateRef.current.gameMode === 'zen' ? 0.55 : 0.85 + Math.min(stateRef.current.level * 0.15, 1.2);
      const target = createWordTarget(word, x, 8.5, (Math.random() - 0.5) * 1.5, speed, themeCounter++);
      scene.add(target.group);
      activeTargets.push(target);
    };

    const selectTarget = (target: WordTargetInstance) => {
      if (stateRef.current.gameStatus !== 'playing' || target.isDying) return;
      target.isDying = true;
      const correct = target.word.type === 'true';
      const point = target.group.position.clone();
      if (correct) {
        try {
          confetti({ particleCount: 28, spread: 60, origin: {
            x: Math.max(0, Math.min(1, 0.5 + point.x / 28)),
            y: Math.max(0, Math.min(1, 0.5 - point.y / 18)),
          }});
        } catch { /* optional visual effect */ }
        if (stateRef.current.soundEnabled) SoundEffects.playCorrect(stateRef.current.level);
      } else if (stateRef.current.soundEnabled) {
        SoundEffects.playWrong();
      }
      if (stateRef.current.voiceEnabled) speakThaiWord(target.word.text);
      stateRef.current.onHitWord(target.word, correct);
      scene.remove(target.group);
      target.dispose();
      usedWordIds.delete(target.word.id);
      activeTargets = activeTargets.filter(item => item !== target);
      if (hovered === target) hovered = null;
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const meshes = activeTargets.filter(t => !t.isDying).map(t => t.cardMesh);
      const hits = raycaster.intersectObjects(meshes, false);
      const next = hits.length ? activeTargets.find(t => t.cardMesh === hits[0].object && !t.isDying) || null : null;
      if (next !== hovered) {
        if (hovered) setWordTargetHover(hovered, false);
        if (next) setWordTargetHover(next, true);
        hovered = next;
      }
      stateRef.current.onAimChange(event.clientX, event.clientY, hovered?.word || null);
      return next;
    };

    const handlePointerMove = (event: PointerEvent) => { updatePointer(event); };
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType !== 'touch') return;
      const target = updatePointer(event);
      if (target) selectTarget(target);
    };
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerdown', handlePointerDown);

    const resizeObserver = new ResizeObserver(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    resizeObserver.observe(container);

    const clock = new THREE.Clock();
    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();
      stars.rotation.y = elapsed * 0.02;
      spaceEnv.update(delta, elapsed);

      if (stateRef.current.gameStatus === 'playing') {
        spawnTimer -= delta;
        if (spawnTimer <= 0) {
          spawnTarget();
          spawnTimer = 1.4 + Math.random() - Math.min(stateRef.current.level * 0.1, 0.6);
        }
        for (let i = activeTargets.length - 1; i >= 0; i--) {
          const target = activeTargets[i];
          if (target.isDying) continue;
          target.y -= target.vy * delta;
          target.x += Math.sin(elapsed * 1.5 + target.bobPhase) * 0.01;
          target.group.position.set(target.x, target.y + Math.sin(elapsed * 2.5 + target.bobPhase) * 0.1, target.z);
          target.group.rotation.y = Math.sin(elapsed * 2 + target.bobPhase) * 0.1;
          target.group.rotation.x = Math.cos(elapsed * 1.5 + target.bobPhase) * 0.05;
          if (target.y < -5.2) {
            scene.remove(target.group);
            target.dispose();
            usedWordIds.delete(target.word.id);
            activeTargets.splice(i, 1);
            if (hovered === target) hovered = null;
            if (target.word.type === 'true') stateRef.current.onMissTrueWord(target.word);
          }
        }
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerdown', handlePointerDown);
      activeTargets.forEach(t => { scene.remove(t.group); t.dispose(); });
      spaceEnv.dispose();
      scene.remove(spaceEnv.group);
      starsGeom.dispose();
      starsMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="relative w-full h-full cursor-pointer overflow-hidden touch-manipulation" />;
};
