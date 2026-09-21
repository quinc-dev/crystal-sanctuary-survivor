// Procedural Texture & Card Illustration Generator (Zero external assets)
import * as THREE from 'three';

export function createFloorTexture(size = 2048) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Deep ethereal slate
  const bgGrad = ctx.createRadialGradient(size / 2, size / 2, size * 0.1, size / 2, size / 2, size * 0.6);
  bgGrad.addColorStop(0, '#111728');
  bgGrad.addColorStop(0.5, '#0a0e1a');
  bgGrad.addColorStop(1, '#05070c');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle grid of elegant paving tiles
  const tileSize = 64;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= size; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Sacred Arcane Sanctuary Mandala
  const cx = size / 2;
  const cy = size / 2;

  function drawCircle(r, stroke, fill = null, dash = []) {
    ctx.beginPath();
    ctx.setLineDash(dash);
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // Soft glowing sanctuary center
  const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 380);
  centerGlow.addColorStop(0, 'rgba(100, 200, 255, 0.18)');
  centerGlow.addColorStop(0.5, 'rgba(80, 140, 255, 0.08)');
  centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  drawCircle(380, null, centerGlow);

  // Concentric intricate rune rings
  ctx.lineWidth = 3;
  drawCircle(180, 'rgba(140, 210, 255, 0.45)');
  drawCircle(240, 'rgba(180, 160, 255, 0.35)', null, [8, 8]);
  drawCircle(320, 'rgba(120, 220, 255, 0.5)');
  drawCircle(420, 'rgba(200, 220, 255, 0.25)', null, [16, 12, 4, 12]);
  drawCircle(580, 'rgba(140, 190, 255, 0.35)');
  drawCircle(780, 'rgba(180, 160, 255, 0.22)', null, [24, 16]);
  drawCircle(980, 'rgba(120, 220, 255, 0.3)');

  // 12-pointed sacred star
  ctx.save();
  ctx.translate(cx, cy);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(160, 220, 255, 0.35)';

  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    ctx.beginPath();
    ctx.moveTo(0, -580);
    ctx.lineTo(140, -220);
    ctx.lineTo(0, -90);
    ctx.lineTo(-140, -220);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -580, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(180, 240, 255, 0.8)';
    ctx.fill();
  }
  ctx.restore();

  // Edge vignette
  const vignette = ctx.createRadialGradient(cx, cy, size * 0.35, cx, cy, size * 0.5);
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.8, 'rgba(4, 6, 12, 0.7)');
  vignette.addColorStop(1, 'rgba(2, 3, 8, 0.98)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  return texture;
}

// Procedural Normal Map for Floor Relievo and 3D Depth
export function createFloorNormalTexture(size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Neutral tangent-space normal (RGB: 128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  // Beveled tile grooves in normal map
  const tileSize = 64 * (size / 2048);
  ctx.lineWidth = 2;
  for (let x = 0; x <= size; x += tileSize) {
    ctx.strokeStyle = 'rgb(90, 128, 255)'; // light bevel left
    ctx.beginPath();
    ctx.moveTo(x - 1, 0);
    ctx.lineTo(x - 1, size);
    ctx.stroke();

    ctx.strokeStyle = 'rgb(166, 128, 255)'; // light bevel right
    ctx.beginPath();
    ctx.moveTo(x + 1, 0);
    ctx.lineTo(x + 1, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += tileSize) {
    ctx.strokeStyle = 'rgb(128, 90, 255)';
    ctx.beginPath();
    ctx.moveTo(0, y - 1);
    ctx.lineTo(size, y - 1);
    ctx.stroke();

    ctx.strokeStyle = 'rgb(128, 166, 255)';
    ctx.beginPath();
    ctx.moveTo(0, y + 1);
    ctx.lineTo(size, y + 1);
    ctx.stroke();
  }

  // Concentric engraved rune relief in normal map
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 2048;

  function drawNormalRing(r, width) {
    ctx.lineWidth = width;
    ctx.strokeStyle = 'rgb(148, 148, 240)';
    ctx.beginPath();
    ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawNormalRing(180, 2);
  drawNormalRing(320, 3);
  drawNormalRing(580, 2.5);
  drawNormalRing(980, 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  return texture;
}

// Procedural Roughness / Specular Map for Floor
export function createFloorRoughnessTexture(size = 1024) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Baseline polished marble/granite roughness (~0.4)
  ctx.fillStyle = 'rgb(105, 105, 105)';
  ctx.fillRect(0, 0, size, size);

  // Grout lines are rougher (higher roughness, lighter grey ~0.8)
  const tileSize = 64 * (size / 2048);
  ctx.strokeStyle = 'rgb(210, 210, 210)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= size; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Sacred Mandala runes are glazed/vitrified (super smooth/specular, darker grey ~0.15)
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 2048;

  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgb(35, 35, 35)';
  [180, 240, 320, 420, 580, 780, 980].forEach(r => {
    ctx.beginPath();
    ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.anisotropy = 8;
  return texture;
}

// Soft radial particle glow texture
export function createGlowDotTexture(size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.25, 'rgba(125, 211, 252, 0.85)');
  grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.25)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}

export function createRingPulseTexture(size = 256) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const half = size / 2;
  ctx.clearRect(0, 0, size, size);

  ctx.beginPath();
  ctx.arc(half, half, half - 18, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(140, 220, 255, 0.95)';
  ctx.lineWidth = 10;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(half, half, half - 22, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(220, 245, 255, 0.7)';
  ctx.lineWidth = 5;
  ctx.stroke();

  return new THREE.CanvasTexture(canvas);
}

// Procedural Card Illustrations Generated on Canvas
export function getCardIllustrationDataUrl(archetype, cardId) {
  const size = 180;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2;
  const cy = size / 2;

  // Background frame
  const bg = ctx.createRadialGradient(cx, cy, 10, cx, cy, size * 0.55);
  bg.addColorStop(0, 'rgba(30, 42, 68, 0.95)');
  bg.addColorStop(1, 'rgba(10, 14, 24, 0.98)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Subtle background rune ring
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 55, 0, Math.PI * 2);
  ctx.stroke();

  if (archetype === 'Resonance') {
    // Floating crystal prism with 4 orbital gems and laser web
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    glow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    // Laser web lines
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const pts = [
      { x: cx, y: cy - 45 },
      { x: cx + 45, y: cy },
      { x: cx, y: cy + 45 },
      { x: cx - 45, y: cy }
    ];
    pts.forEach((p, i) => {
      const next = pts[(i + 1) % pts.length];
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(next.x, next.y);
      ctx.moveTo(cx, cy);
      ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Orbital gems
    pts.forEach(p => {
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Central Prism
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 20);
    ctx.lineTo(cx + 15, cy + 5);
    ctx.lineTo(cx, cy + 22);
    ctx.lineTo(cx - 15, cy + 5);
    ctx.closePath();
    ctx.fill();
  } else if (archetype === 'Prismatic') {
    // 3 Radiant elemental arcane spears/bolts bursting outward
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 65);
    glow.addColorStop(0, 'rgba(168, 85, 247, 0.45)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    const colors = ['#38bdf8', '#f43f5e', '#a855f7'];
    const angles = [-Math.PI / 2, -Math.PI / 6, -5 * Math.PI / 6];

    angles.forEach((ang, i) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(ang + Math.PI / 2);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -50);
      ctx.stroke();

      // Bolt arrow head
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -56);
      ctx.lineTo(7, -42);
      ctx.lineTo(-7, -42);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  } else if (archetype === 'Kinetic') {
    // Concentric seismic shockwave blast with flying sparks
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 65);
    glow.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 42, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, 58, 0, Math.PI * 2);
    ctx.stroke();

    // Central flash
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
  } else if (archetype === 'Legendary') {
    // Imperial Crown above celestial Supernova
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
    glow.addColorStop(0, 'rgba(251, 191, 36, 0.7)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    // Crown
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 35, cy + 15);
    ctx.lineTo(cx - 30, cy - 22);
    ctx.lineTo(cx - 15, cy - 5);
    ctx.lineTo(cx, cy - 32);
    ctx.lineTo(cx + 15, cy - 5);
    ctx.lineTo(cx + 30, cy - 22);
    ctx.lineTo(cx + 35, cy + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sparkles
    ctx.fillStyle = '#ffffff';
    [-30, 0, 30].forEach(ox => {
      ctx.beginPath();
      ctx.arc(cx + ox, cy - (ox === 0 ? 32 : 22), 4, 0, Math.PI * 2);
      ctx.fill();
    });
  } else {
    // Utility (Shield, Magnet, Boots)
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
    glow.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, size, size);

    // Shield crest
    ctx.fillStyle = '#10b981';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 35);
    ctx.lineTo(cx + 28, cy - 20);
    ctx.lineTo(cx + 24, cy + 15);
    ctx.lineTo(cx, cy + 38);
    ctx.lineTo(cx - 24, cy + 15);
    ctx.lineTo(cx - 28, cy - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ornate decorative card border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, size - 8, size - 8);

  return canvas.toDataURL();
}
