// drawWater.js - sky, moon, stars, far shore, water, reflections.
import { W, H, CHANNEL } from './layout.js';

export function drawWater(ctx, state) {
  const t = state.time || 0;

  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, CHANNEL.waterY);
  sky.addColorStop(0, '#02060f');
  sky.addColorStop(0.55, '#071120');
  sky.addColorStop(1, '#0d1e2c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, CHANNEL.waterY);

  // Stars
  const rng = state.bgRng;
  for (let i = 0; i < 70; i++) {
    const sx = rng() * W;
    const sy = rng() * 260;
    ctx.globalAlpha = 0.25 + rng() * 0.6;
    ctx.fillStyle = '#fffbe0';
    ctx.beginPath();
    ctx.arc(sx, sy, 0.6 + rng() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Moon in the channel gap, clear of the ticket strip
  const mx = 640, my = 210;
  const halo = ctx.createRadialGradient(mx, my, 6, mx, my, 130);
  halo.addColorStop(0, 'rgba(255,246,200,0.22)');
  halo.addColorStop(1, 'rgba(255,246,200,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(mx - 130, my - 130, 260, 260);
  ctx.fillStyle = '#ffeeb0';
  ctx.beginPath();
  ctx.arc(mx, my, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(206,168,92,0.28)';
  ctx.beginPath(); ctx.arc(mx - 11, my - 8, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mx + 13, my + 11, 5, 0, Math.PI * 2); ctx.fill();

  // Far shoreline with harbour lights (seen through the channel gap and above the piers)
  ctx.fillStyle = '#0a1622';
  ctx.beginPath();
  ctx.moveTo(0, CHANNEL.waterY);
  for (let x = 0; x <= W; x += 40) {
    ctx.lineTo(x, CHANNEL.waterY - 46 + Math.sin(x * 0.01) * 9);
  }
  ctx.lineTo(W, CHANNEL.waterY);
  ctx.closePath();
  ctx.fill();
  for (const bx of [560, 600, 680, 720, 120, 300, 980, 1180]) {
    ctx.fillStyle = '#0d1c2a';
    ctx.fillRect(bx - 16, CHANNEL.waterY - 74, 32, 32);
    ctx.fillStyle = 'rgba(255,196,90,0.5)';
    ctx.fillRect(bx - 8, CHANNEL.waterY - 66, 5, 6);
    ctx.fillRect(bx + 3, CHANNEL.waterY - 56, 5, 6);
  }

  // Water
  const wg = ctx.createLinearGradient(0, CHANNEL.waterY, 0, H);
  wg.addColorStop(0, '#16303f');
  wg.addColorStop(0.35, '#0b1a26');
  wg.addColorStop(1, '#040a12');
  ctx.fillStyle = wg;
  ctx.fillRect(0, CHANNEL.waterY, W, H - CHANNEL.waterY);

  // Ripples
  for (let i = 0; i < 12; i++) {
    const wy = CHANNEL.waterY + 12 + i * 30;
    ctx.strokeStyle = 'rgba(46,110,146,' + (0.16 - i * 0.01) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 14) {
      const y = wy + Math.sin(x * 0.013 + t * (0.8 + i * 0.12)) * (2.5 + i * 0.25);
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Moon and lantern reflections
  reflect(ctx, mx, CHANNEL.waterY, 'rgba(255,236,170,0.16)', 46);
  for (const lx of [90, 210, 340, 470, 810, 930, 1060, 1190]) {
    reflect(ctx, lx, CHANNEL.waterY + 40, 'rgba(255,140,40,0.13)', 40);
  }
}

function reflect(ctx, x, y, color, w) {
  const g = ctx.createLinearGradient(x, y, x, y + 120);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - w / 2, y, w, 120);
}