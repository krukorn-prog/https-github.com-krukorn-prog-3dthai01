import * as THREE from 'three';
import { WordItem } from '../../types';
import { createWordTexture, getWordColorTheme, CardColorTheme } from './wordTexture';

export interface WordTargetInstance {
  group: THREE.Group;
  cardMesh: THREE.Mesh;
  glowMesh: THREE.Mesh;
  word: WordItem;
  theme: CardColorTheme;
  themeIndex: number;
  x: number;
  y: number;
  z: number;
  vy: number;
  vx: number;
  bobPhase: number;
  shakeTime: number;
  isTargeted: boolean;
  isDying: boolean;
  dispose: () => void;
}

export function createWordTarget(
  word: WordItem,
  startX: number,
  startY: number,
  startZ: number,
  speedY = 1.0,
  themeIndex = 0
): WordTargetInstance {
  const group = new THREE.Group();
  group.position.set(startX, startY, startZ);

  // 2x Enriched Dimensions in Three.js world units
  // Previous was width: 3.6, height: 1.8 -> Now width: 5.6, height: 2.8 for 2x readability!
  const width = 5.4;
  const height = 2.7;
  const depth = 0.35;

  const theme = getWordColorTheme(word, themeIndex);

  // Normal texture and Hover texture
  const normalTexture = createWordTexture(word, false, themeIndex);

  // Side face materials with themed metallic rim
  const sideMat = new THREE.MeshStandardMaterial({
    color: theme.sideColor,
    metalness: 0.65,
    roughness: 0.25,
  });

  const backMat = new THREE.MeshStandardMaterial({
    color: 0x090d16,
    metalness: 0.9,
    roughness: 0.3,
  });

  const frontMat = new THREE.MeshBasicMaterial({
    map: normalTexture,
    transparent: true,
  });

  const materials = [sideMat, sideMat, sideMat, sideMat, frontMat, backMat];
  const boxGeom = new THREE.BoxGeometry(width, height, depth);

  const cardMesh = new THREE.Mesh(boxGeom, materials);
  cardMesh.userData = { word, isWordTarget: true };
  group.add(cardMesh);

  // Outer glow aura rim plane behind card
  const glowGeom = new THREE.PlaneGeometry(width + 0.5, height + 0.5);
  const glowMat = new THREE.MeshBasicMaterial({
    color: theme.glowColor,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const glowMesh = new THREE.Mesh(glowGeom, glowMat);
  glowMesh.position.z = -0.06;
  group.add(glowMesh);

  let isTargeted = false;
  let shakeTime = 0;

  const dispose = () => {
    boxGeom.dispose();
    glowGeom.dispose();
    materials.forEach((m) => m.dispose());
    glowMat.dispose();
  };

  return {
    group,
    cardMesh,
    glowMesh,
    word,
    theme,
    themeIndex,
    x: startX,
    y: startY,
    z: startZ,
    vy: speedY,
    vx: (Math.random() - 0.5) * 0.25,
    bobPhase: Math.random() * Math.PI * 2,
    shakeTime,
    isTargeted,
    isDying: false,
    dispose,
  };
}

export function setWordTargetHover(instance: WordTargetInstance, hovered: boolean) {
  if (instance.isTargeted === hovered) return;
  instance.isTargeted = hovered;

  const texture = createWordTexture(instance.word, hovered, instance.themeIndex);
  const mats = instance.cardMesh.material as THREE.Material[];
  const frontMat = mats[4] as THREE.MeshBasicMaterial;
  frontMat.map = texture;
  frontMat.needsUpdate = true;

  const glowMat = instance.glowMesh.material as THREE.MeshBasicMaterial;
  glowMat.opacity = hovered ? 0.85 : 0;
}
