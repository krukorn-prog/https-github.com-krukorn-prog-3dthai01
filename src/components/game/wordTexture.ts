import * as THREE from 'three';
import { WordItem } from '../../types';

// Diverse bright kid-friendly color palettes
export interface CardColorTheme {
  name: string;
  cardBgTop: string;
  cardBgBottom: string;
  sideColor: number;
  glowColor: number;
  badgeBgStart: string;
  badgeBgEnd: string;
  textColorStart: string;
  textColorMid: string;
  textColorEnd: string;
  hoverGlowHex: string;
}

export const COLOR_THEMES: CardColorTheme[] = [
  // 1. Cyber Emerald / Jade (Green)
  {
    name: 'emerald',
    cardBgTop: 'rgba(6, 44, 34, 0.95)',
    cardBgBottom: 'rgba(2, 26, 20, 0.95)',
    sideColor: 0x065f46,
    glowColor: 0x10b981,
    badgeBgStart: '#059669',
    badgeBgEnd: '#10b981',
    textColorStart: '#ffffff',
    textColorMid: '#a7f3d0',
    textColorEnd: '#34d399',
    hoverGlowHex: '#34d399',
  },
  // 2. Cosmic Cyan / Azure (Blue)
  {
    name: 'cyan',
    cardBgTop: 'rgba(8, 47, 73, 0.95)',
    cardBgBottom: 'rgba(12, 74, 110, 0.95)',
    sideColor: 0x0284c7,
    glowColor: 0x38bdf8,
    badgeBgStart: '#0284c7',
    badgeBgEnd: '#38bdf8',
    textColorStart: '#ffffff',
    textColorMid: '#bae6fd',
    textColorEnd: '#38bdf8',
    hoverGlowHex: '#38bdf8',
  },
  // 3. Galactic Purple / Violet (Purple)
  {
    name: 'violet',
    cardBgTop: 'rgba(59, 7, 100, 0.95)',
    cardBgBottom: 'rgba(30, 27, 75, 0.95)',
    sideColor: 0x7c3aed,
    glowColor: 0xc084fc,
    badgeBgStart: '#7c3aed',
    badgeBgEnd: '#a855f7',
    textColorStart: '#ffffff',
    textColorMid: '#f3e8ff',
    textColorEnd: '#d8b4fe',
    hoverGlowHex: '#c084fc',
  },
  // 4. Solar Flare Gold / Amber (Orange/Gold)
  {
    name: 'amber',
    cardBgTop: 'rgba(69, 26, 3, 0.95)',
    cardBgBottom: 'rgba(41, 14, 0, 0.95)',
    sideColor: 0xd97706,
    glowColor: 0xfbbf24,
    badgeBgStart: '#d97706',
    badgeBgEnd: '#f59e0b',
    textColorStart: '#ffffff',
    textColorMid: '#fef08a',
    textColorEnd: '#f59e0b',
    hoverGlowHex: '#fbbf24',
  },
  // 5. Ruby Nebula / Coral Pink (Pink/Red)
  {
    name: 'ruby',
    cardBgTop: 'rgba(76, 5, 25, 0.95)',
    cardBgBottom: 'rgba(40, 2, 12, 0.95)',
    sideColor: 0xe11d48,
    glowColor: 0xf43f5e,
    badgeBgStart: '#e11d48',
    badgeBgEnd: '#fb7185',
    textColorStart: '#ffffff',
    textColorMid: '#ffe4e6',
    textColorEnd: '#fb7185',
    hoverGlowHex: '#f43f5e',
  },
  // 6. Deep Indigo Space (Indigo)
  {
    name: 'indigo',
    cardBgTop: 'rgba(30, 27, 75, 0.95)',
    cardBgBottom: 'rgba(15, 23, 42, 0.95)',
    sideColor: 0x4f46e5,
    glowColor: 0x818cf8,
    badgeBgStart: '#4338ca',
    badgeBgEnd: '#6366f1',
    textColorStart: '#ffffff',
    textColorMid: '#e0e7ff',
    textColorEnd: '#818cf8',
    hoverGlowHex: '#818cf8',
  },
];

// Helper to choose a theme deterministically by word or index
export function getWordColorTheme(word: WordItem, themeIndex?: number): CardColorTheme {
  if (typeof themeIndex === 'number' && themeIndex >= 0) {
    return COLOR_THEMES[themeIndex % COLOR_THEMES.length];
  }
  // Deterministic hash based on word text
  let hash = 0;
  for (let i = 0; i < word.text.length; i++) {
    hash = (hash << 5) - hash + word.text.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % COLOR_THEMES.length;
  return COLOR_THEMES[idx];
}

// Cache textures by key
const textureCache = new Map<string, THREE.CanvasTexture>();

export function createWordTexture(
  word: WordItem,
  isTargeted = false,
  themeIndex?: number
): THREE.CanvasTexture {
  const theme = getWordColorTheme(word, themeIndex);
  const cacheKey = `${word.id}-${theme.name}-${isTargeted ? 'hover' : 'normal'}`;

  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  // 1024x512 canvas for crystal-clear sharp Thai glyphs at 2x size
  const width = 1024;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  ctx.clearRect(0, 0, width, height);

  const radius = 64;
  const pad = 24;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;

  // Outer glowing stroke if targeted
  if (isTargeted) {
    ctx.save();
    ctx.shadowColor = theme.hoverGlowHex;
    ctx.shadowBlur = 40;
    ctx.lineWidth = 18;
    ctx.strokeStyle = theme.hoverGlowHex;
    roundRect(ctx, pad, pad, cardW, cardH, radius);
    ctx.stroke();
    ctx.restore();
  }

  // Card background gradient with rich theme colors
  const bgGrad = ctx.createLinearGradient(0, pad, 0, pad + cardH);
  if (isTargeted) {
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.98)');
    bgGrad.addColorStop(1, theme.cardBgBottom);
  } else {
    bgGrad.addColorStop(0, theme.cardBgTop);
    bgGrad.addColorStop(1, theme.cardBgBottom);
  }

  ctx.fillStyle = bgGrad;
  roundRect(ctx, pad, pad, cardW, cardH, radius);
  ctx.fill();

  // Vibrant Multi-color Border
  ctx.lineWidth = isTargeted ? 12 : 8;
  const borderGrad = ctx.createLinearGradient(0, 0, width, height);
  if (isTargeted) {
    borderGrad.addColorStop(0, '#ffffff');
    borderGrad.addColorStop(0.5, theme.hoverGlowHex);
    borderGrad.addColorStop(1, '#ffffff');
  } else {
    borderGrad.addColorStop(0, theme.badgeBgEnd);
    borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
    borderGrad.addColorStop(1, theme.badgeBgStart);
  }
  ctx.strokeStyle = borderGrad;
  roundRect(ctx, pad, pad, cardW, cardH, radius);
  ctx.stroke();

  // Glossy light glass reflection at the top half
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, pad + 10, pad + 10, cardW - 20, (cardH - 20) * 0.42, radius - 8);
  const glossGrad = ctx.createLinearGradient(0, pad, 0, pad + cardH * 0.42);
  glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
  glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = glossGrad;
  ctx.fill();
  ctx.restore();

  // Top Badge (Cluster category indicator)
  ctx.save();
  ctx.font = '700 38px "Prompt", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const badgeY = pad + 64;
  const badgeW = 320;
  const badgeH = 58;
  const badgeGrad = ctx.createLinearGradient(width / 2 - badgeW / 2, 0, width / 2 + badgeW / 2, 0);
  badgeGrad.addColorStop(0, theme.badgeBgStart);
  badgeGrad.addColorStop(1, theme.badgeBgEnd);
  ctx.fillStyle = badgeGrad;
  roundRect(ctx, width / 2 - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 29);
  ctx.fill();

  // Badge outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  roundRect(ctx, width / 2 - badgeW / 2, badgeY - badgeH / 2, badgeW, badgeH, 29);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 6;
  ctx.fillText(`ควบ: ${word.cluster}`, width / 2, badgeY + 2);
  ctx.restore();

  // 2x ENLARGED Main Thai Word Text
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Significantly larger font sizes for 2x readability
  const fontSize = word.text.length > 7 ? 125 : word.text.length > 4 ? 148 : 172;
  ctx.font = `900 ${fontSize}px "Kanit", "Prompt", sans-serif`;

  // Deep Drop Shadow for visual pop
  ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;

  // Text Fill with vibrant themed gradient
  const textGrad = ctx.createLinearGradient(0, height / 2 - 40, 0, height / 2 + 80);
  if (isTargeted) {
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(0.4, '#fef08a');
    textGrad.addColorStop(1, '#f59e0b');
  } else {
    textGrad.addColorStop(0, '#ffffff');
    textGrad.addColorStop(0.4, theme.textColorMid);
    textGrad.addColorStop(1, theme.textColorEnd);
  }
  ctx.fillStyle = textGrad;
  ctx.fillText(word.text, width / 2, height / 2 + 52);

  // Outer dark contour stroke for crisp high contrast
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(10, 15, 30, 0.95)';
  ctx.strokeText(word.text, width / 2, height / 2 + 52);
  ctx.restore();

  // Pronunciation aid for false clusters
  if (word.reading) {
    ctx.save();
    ctx.font = '600 42px "Prompt", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fde047';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fillText(`(อ่านว่า ${word.reading})`, width / 2, height - pad - 42);
    ctx.restore();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
