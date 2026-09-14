export type ClusterType = 'true' | 'false';

export interface WordItem {
  id: string;
  text: string;
  type: ClusterType;
  cluster: string; // e.g. "กร", "ขร", "ทร -> ซ"
  reading?: string; // e.g. "อ่านว่า จิง"
  explanation: string;
  categoryName: string; // "คำควบกล้ำแท้" or "คำควบกล้ำไม่แท้"
}

export type GameMode = 'arcade' | 'zen' | 'timer';
export type GameStatus = 'ready' | 'playing' | 'paused' | 'gameover' | 'victory';

export interface FloatingTarget {
  id: string;
  word: WordItem;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  vRotY: number;
  vRotZ: number;
  width: number;
  height: number;
  depth: number;
  scale: number;
  isHit: boolean;
  hitProgress: number; // 0 to 1 for hit animation
  bobPhase: number;
  colorTheme: string;
}

export interface LaserBeam {
  id: string;
  startX: number;
  startY: number;
  startZ: number;
  targetX: number;
  targetY: number;
  targetZ: number;
  progress: number;
  color: string;
}

export interface ExplosionParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface FloatingTextPopup {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  createdAt: number;
}
