// drawPiers.js - the two market piers, the bridge over the channel, boats, lanterns.
import { W, H, PIER, CHANNEL } from './layout.js';

const WOOD = { dark: '#2a1808', mid: '#4a2e14', light: '#6b4422', top: '#8a5a30', rope: '#8a7048' };

export function drawPiers(ctx, state) {
  const t = state.time || 0;
  drawPier(ctx, PIER.left, t, false);
  drawPier(ctx, PIER.right, t, true);
  drawBridge(ctx, state);
  boat(ctx, 470, 760, 96, t);
  boat(ctx, 800, 745, 84, t + 2.1);
  boat(ctx, 600, 700, 68, t + 1.1);
}

function drawPier(ctx, P, t, isRight) {
  // Body
  const g = ctx.createLinearGradient(0, P.y, 0, P.y + P.h);
  g.addColorStop(0, WOOD.top);
  g.addColorStop(0.07, WOOD.light);
  g.addColorStop(0.3, WOOD.mid);
  g.addColorStop(1, WOOD.dark);
  ctx.fillStyle = g;
  ctx.fillRect(P.x, P.y, P.w, P.h);

  // Planks
  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.lineWidth = 1;
  for (let y = P.y + 22; y < P.y + P.h; y += 22) {
    ctx.beginPath(); ctx.moveTo(P.x, y); ctx.lineTo(P.x + P.w, y); ctx.stroke();
  }
  // Front edge with thickness
  ctx.fillStyle = WOOD.top;
  ctx.fillRect(P.x, P.y + P.h - 14, P.w, 14);
  ctx.fillStyle = WOOD.light;
  ctx.fillRect(P.x, P.y + P.h - 14, P.w, 4);
  ctx.strokeStyle = WOOD.light;
  ctx.lineWidth = 3;
  ctx.strokeRect(P.x, P.y, P.w, P.h);

  // Lantern string along the pier's top edge, below the ticket strip
  const xs = isRight ? [800, 920, 1040, 1160, 1230] : [70, 190, 310, 430, 500];
  ctx.strokeStyle = WOOD.rope;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(P.x, P.y - 26);
  ctx.quadraticCurveTo(P.x + P.w / 2, P.y - 6, P.x + P.w, P.y - 26);
  ctx.stroke();
  for (const lx of xs) lantern(ctx, lx, P.y - 16, 15, t + lx);
}

function lantern(ctx, x, y, s, t) {
  const sway = Math.sin(t * 1.6) * 2;
  ctx.save();
  ctx.translate(x + sway, y);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, s * 3.4);
  g.addColorStop(0, 'rgba(255,150,50,0.38)');
  g.addColorStop(0.45, 'rgba(255,120,30,0.12)');
  g.addColorStop(1, 'rgba(255,120,30,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-s * 3.4, -s * 3.4, s * 6.8, s * 6.8);
  ctx.fillStyle = '#ff8c20';
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.52, s * 0.68, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffbc55';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = WOOD.rope;
  ctx.fillRect(-s * 0.3, -s * 0.68, s * 0.6, s * 0.14);
  ctx.fillRect(-s * 0.24, s * 0.56, s * 0.48, s * 0.12);
  ctx.restore();
}

function drawBridge(ctx, state) {
  const tide = state.tide;
  const drift = tide && tide.isHighTide ? Math.sin((state.time || 0) * 2.2) * 6 : 0;
  const y = CHANNEL.bridgeY;
  const x1 = CHANNEL.x1 + 6;
  const x2 = CHANNEL.x2 - 6;

  ctx.save();
  ctx.translate(0, drift);
  // Planks
  ctx.fillStyle = '#5a3820';
  ctx.fillRect(x1, y, x2 - x1, 26);
  ctx.strokeStyle = '#7a5030';
  ctx.lineWidth = 1;
  for (let x = x1; x < x2; x += 26) {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 26); ctx.stroke();
  }
  // Ropes and posts
  ctx.strokeStyle = WOOD.rope;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x1, y - 26); ctx.lineTo(x2, y - 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x1, y + 26); ctx.lineTo(x2, y + 26); ctx.stroke();
  ctx.fillStyle = WOOD.mid;
  for (let x = x1 + 20; x < x2; x += 44) ctx.fillRect(x - 3, y - 26, 6, 54);
  ctx.fillStyle = 'rgba(255,214,140,0.55)';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(tide && tide.isHighTide ? 'DRIFTING BRIDGE' : 'PLANK BRIDGE', (x1 + x2) / 2, y + 52);
  ctx.restore();
}

function boat(ctx, x, y, s, t) {
  const bob = Math.sin(t * 1.3 + x * 0.01) * 5;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = '#3d1e08';
  ctx.beginPath();
  ctx.moveTo(-s / 2, 0);
  ctx.quadraticCurveTo(-s * 0.62, s * 0.2, -s / 3, s * 0.24);
  ctx.lineTo(s / 3, s * 0.24);
  ctx.quadraticCurveTo(s * 0.62, s * 0.2, s / 2, 0);
  ctx.lineTo(s * 0.38, -s * 0.14);
  ctx.lineTo(-s * 0.38, -s * 0.14);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#6b4422';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Cargo
  ctx.fillStyle = '#c8a060';
  ctx.fillRect(-s * 0.2, -s * 0.3, s * 0.4, s * 0.18);
  ctx.restore();
}