// Food item drawing for canvas 2D
import { INGREDIENTS } from './recipes.js';

const STATE_COLORS = {
  raw: null, // use ingredient color
  chopped: null,
  fried: '#c8860a',
  steamed: '#d4a8b0',
  burned: '#2a2a2a',
};

export function drawFoodItem(ctx, x, y, ing, state, size = 24, bob = 0) {
  const info = INGREDIENTS[ing];
  if (!info) return;

  ctx.save();
  ctx.translate(x, y + bob);

  const baseColor = info.color;
  const edgeColor = info.accent;
  let mainColor = baseColor;

  if (state === 'fried') mainColor = '#c8860a';
  else if (state === 'steamed') mainColor = '#e8c8d0';
  else if (state === 'burned') mainColor = '#333';

  const r = size / 2;

  // Squash and stretch based on state
  let sx = 1, sy = 1;
  if (state === 'chopped') { sx = 0.8; sy = 1.2; }
  else if (state === 'fried') { sx = 1.1; sy = 0.9; }
  else if (state === 'burned') { sx = 1; sy = 0.7; }
  ctx.scale(sx, sy);

  // Draw based on ingredient type
  switch (ing) {
    case 'rice':
      drawRice(ctx, r, mainColor, edgeColor);
      break;
    case 'fish':
      drawFish(ctx, r, mainColor, edgeColor);
      break;
    case 'shrimp':
      drawShrimp(ctx, r, mainColor, edgeColor);
      break;
    case 'cabbage':
      drawCabbage(ctx, r, mainColor, edgeColor);
      break;
    case 'tofu':
      drawTofu(ctx, r, mainColor, edgeColor);
      break;
    case 'egg':
      drawEgg(ctx, r, mainColor, edgeColor, state);
      break;
    case 'mushroom':
      drawMushroom(ctx, r, mainColor, edgeColor);
      break;
    case 'nori':
      drawNori(ctx, r, mainColor, edgeColor);
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = mainColor;
      ctx.fill();
  }

  ctx.restore();
}

function drawRice(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.9, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rice grains texture
  ctx.fillStyle = edge;
  for (let i = 0; i < 5; i++) {
    const gx = (Math.sin(i * 1.3) * r * 0.5);
    const gy = (Math.cos(i * 0.8) * r * 0.25);
    ctx.beginPath();
    ctx.ellipse(gx, gy, r * 0.12, r * 0.06, i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFish(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.9, r * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Tail
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, 0);
  ctx.lineTo(-r * 1.1, -r * 0.4);
  ctx.lineTo(-r * 1.1, r * 0.4);
  ctx.closePath();
  ctx.fillStyle = edge;
  ctx.fill();
  // Eye
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(r * 0.4, -r * 0.05, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(r * 0.42, -r * 0.05, r * 0.06, 0, Math.PI * 2);
  ctx.fill();
}

function drawShrimp(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, 0);
  ctx.quadraticCurveTo(0, -r * 0.5, r * 0.6, -r * 0.1);
  ctx.quadraticCurveTo(r * 0.8, 0, r * 0.6, r * 0.1);
  ctx.quadraticCurveTo(0, r * 0.5, -r * 0.7, 0);
  ctx.fill();
  // Segments
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const sx = -r * 0.4 + i * r * 0.3;
    ctx.beginPath();
    ctx.moveTo(sx, -r * 0.3);
    ctx.lineTo(sx, r * 0.3);
    ctx.stroke();
  }
  // Antennae
  ctx.beginPath();
  ctx.moveTo(r * 0.5, -r * 0.05);
  ctx.quadraticCurveTo(r * 0.9, -r * 0.3, r * 1.1, -r * 0.2);
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawCabbage(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.8, 0, Math.PI * 2);
  ctx.fill();
  // Leaf lines
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.6);
  ctx.lineTo(0, r * 0.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-r * 0.5, 0);
  ctx.lineTo(r * 0.5, 0);
  ctx.stroke();
}

function drawTofu(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.fillRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-r * 0.7, -r * 0.7, r * 1.4, r * 1.4);
  // Grid lines
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.7);
  ctx.lineTo(0, r * 0.7);
  ctx.moveTo(-r * 0.7, 0);
  ctx.lineTo(r * 0.7, 0);
  ctx.stroke();
}

function drawEgg(ctx, r, main, edge, state) {
  if (state === 'fried') {
    // Sunny side up
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb800';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Raw egg shape
    ctx.fillStyle = main;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.6, r * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawMushroom(ctx, r, main, edge) {
  // Cap
  ctx.fillStyle = main;
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.1, r * 0.8, r * 0.5, 0, Math.PI, 0);
  ctx.fill();
  // Stem
  ctx.fillStyle = '#e8d8b8';
  ctx.fillRect(-r * 0.3, -r * 0.1, r * 0.6, r * 0.7);
  // Spots
  ctx.fillStyle = edge;
  ctx.beginPath();
  ctx.arc(-r * 0.25, -r * 0.3, r * 0.12, 0, Math.PI * 2);
  ctx.arc(r * 0.15, -r * 0.25, r * 0.08, 0, Math.PI * 2);
  ctx.fill();
}

function drawNori(ctx, r, main, edge) {
  ctx.fillStyle = main;
  ctx.fillRect(-r * 0.6, -r * 0.8, r * 1.2, r * 1.6);
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1;
  ctx.strokeRect(-r * 0.6, -r * 0.8, r * 1.2, r * 1.6);
  // Texture lines
  ctx.strokeStyle = '#1a3a18';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.6 + i * r * 0.3);
    ctx.lineTo(r * 0.5, -r * 0.6 + i * r * 0.3);
    ctx.stroke();
  }
}

export function drawPlate(ctx, x, y, contents, size = 50) {
  // Plate base
  ctx.fillStyle = '#e8e0d0';
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c8c0b0';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Rim
  ctx.strokeStyle = '#b8b0a0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.75, size * 0.4, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (!contents || contents.length === 0) return;

  const spacing = (size * 1.4) / Math.max(contents.length, 3);
  const startX = x - (contents.length - 1) * spacing / 2;
  for (let i = 0; i < contents.length; i++) {
    const item = contents[i];
    const ix = startX + i * spacing;
    const iy = y - 4;
    drawFoodItem(ctx, ix, iy, item.ing, item.state, 20, 0);
  }
}

export function drawItemIcon(ctx, x, y, item, size = 28) {
  drawFoodItem(ctx, x, y, item.ing, item.state, size, 0);
}
