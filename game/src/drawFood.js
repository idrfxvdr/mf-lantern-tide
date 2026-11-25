// drawFood.js - hand-drawn-looking food, canvas 2D only.
import { INGREDIENTS } from './recipes.js';

const COOK = {
  raw: null,
  chopped: null,
  fried: '#c8860a',
  steamed: '#e6c2cc',
  burned: '#2b2b2b',
};

export function drawFoodItem(ctx, x, y, ing, state, size, bob = 0) {
  const info = INGREDIENTS[ing];
  if (!info) return;
  const r = size / 2;
  ctx.save();
  ctx.translate(x, y + bob);
  let sx = 1, sy = 1;
  if (state === 'chopped') { sx = 0.86; sy = 1.16; }
  else if (state === 'fried') { sx = 1.1; sy = 0.92; }
  else if (state === 'burned') { sx = 1.02; sy = 0.8; }
  ctx.scale(sx, sy);
  const main = COOK[state] || info.color;
  const edge = info.accent;
  switch (ing) {
    case 'rice': rice(ctx, r, main, edge); break;
    case 'fish': fish(ctx, r, main, edge); break;
    case 'shrimp': shrimp(ctx, r, main, edge); break;
    case 'cabbage': cabbage(ctx, r, main, edge); break;
    case 'tofu': tofu(ctx, r, main, edge); break;
    case 'egg': egg(ctx, r, main, edge, state); break;
    case 'mushroom': mushroom(ctx, r, main, edge); break;
    default: nori(ctx, r, main, edge); break;
  }
  ctx.restore();
}

function rice(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.95, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = edge;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.ellipse(Math.sin(i * 1.7) * r * 0.55, Math.cos(i * 1.1) * r * 0.3, r * 0.14, r * 0.07, i * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

function fish(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.9, r * 0.44, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-r * 0.72, 0); ctx.lineTo(-r * 1.08, -r * 0.42); ctx.lineTo(-r * 1.08, r * 0.42);
  ctx.closePath(); ctx.fillStyle = edge; ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(r * 0.42, -r * 0.06, r * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath(); ctx.arc(r * 0.45, -r * 0.06, r * 0.07, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = Math.max(1, r * 0.06);
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath(); ctx.moveTo(i * r * 0.22, -r * 0.3); ctx.lineTo(i * r * 0.22, r * 0.3); ctx.stroke();
  }
}

function shrimp(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, 0);
  ctx.quadraticCurveTo(0, -r * 0.55, r * 0.6, -r * 0.12);
  ctx.quadraticCurveTo(r * 0.85, 0, r * 0.6, r * 0.12);
  ctx.quadraticCurveTo(0, r * 0.55, -r * 0.7, 0);
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1, r * 0.07);
  for (let i = 0; i < 4; i++) {
    const x = -r * 0.4 + i * r * 0.3;
    ctx.beginPath(); ctx.moveTo(x, -r * 0.3); ctx.lineTo(x, r * 0.3); ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(r * 0.5, -r * 0.06);
  ctx.quadraticCurveTo(r * 0.95, -r * 0.34, r * 1.15, -r * 0.2);
  ctx.stroke();
}

function cabbage(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1.4, r * 0.08);
  for (const k of [0.28, 0.52, 0.74]) {
    ctx.beginPath(); ctx.arc(0, 0, r * k, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0, -r * 0.7); ctx.lineTo(0, r * 0.7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * 0.7, 0); ctx.lineTo(r * 0.7, 0); ctx.stroke();
}

function tofu(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.fillRect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44);
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1.4, r * 0.08);
  ctx.strokeRect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44);
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.72); ctx.lineTo(0, r * 0.72);
  ctx.moveTo(-r * 0.72, 0); ctx.lineTo(r * 0.72, 0);
  ctx.stroke();
}

function egg(ctx, r, main, edge, state) {
  if (state === 'fried' || state === 'burned') {
    ctx.fillStyle = state === 'burned' ? '#3a2a12' : '#fffdf2';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = state === 'burned' ? '#1d1408' : '#ffcf33';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.42, 0, Math.PI * 2); ctx.fill();
    return;
  }
  ctx.fillStyle = main;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.6, r * 0.82, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1.2, r * 0.07);
  ctx.stroke();
}

function mushroom(ctx, r, main, edge) {
  ctx.fillStyle = '#efe0c2';
  ctx.fillRect(-r * 0.3, -r * 0.1, r * 0.6, r * 0.75);
  ctx.fillStyle = main;
  ctx.beginPath(); ctx.ellipse(0, -r * 0.12, r * 0.82, r * 0.52, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = edge;
  ctx.beginPath(); ctx.arc(-r * 0.26, -r * 0.3, r * 0.13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(r * 0.18, -r * 0.24, r * 0.09, 0, Math.PI * 2); ctx.fill();
}

function nori(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.fillRect(-r * 0.62, -r * 0.82, r * 1.24, r * 1.64);
  ctx.strokeStyle = edge;
  ctx.lineWidth = Math.max(1.2, r * 0.07);
  ctx.strokeRect(-r * 0.62, -r * 0.82, r * 1.24, r * 1.64);
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.6 + i * r * 0.4);
    ctx.lineTo(r * 0.5, -r * 0.6 + i * r * 0.4);
    ctx.stroke();
  }
}

export function drawPlate(ctx, x, y, contents, w = 120, ghosts = null) {
  ctx.fillStyle = '#e9e1d1';
  ctx.beginPath(); ctx.ellipse(x, y, w / 2, w / 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#bfb6a4';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = '#d6cdbb';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(x, y, w * 0.36, w * 0.14, 0, 0, Math.PI * 2); ctx.stroke();
  // Ghosted missing parts of a half-built dish.
  if (ghosts && ghosts.length) {
    ctx.save();
    ctx.globalAlpha = 0.4;
    const ggap = Math.min(52, (w * 0.8) / (contents.length + ghosts.length));
    const gstart = x - ((contents.length + ghosts.length - 1) * ggap) / 2 + contents.length * ggap;
    ghosts.forEach((it, i) => {
      ctx.setLineDash([5, 4]);
      drawFoodItem(ctx, gstart + i * ggap, y - 6, it.ing, it.state, 40);
    });
    ctx.restore();
  }
  if (!contents || !contents.length) return;
  const gap = Math.min(52, (w * 0.8) / contents.length);
  const startX = x - ((contents.length - 1) * gap) / 2;
  contents.forEach((it, i) => {
    drawFoodItem(ctx, startX + i * gap, y - 6, it.ing, it.state, 44);
  });
}