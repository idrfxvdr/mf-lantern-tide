// drawPiers.js - the two market piers, the tide crossing (drifting bridge or narrow
// plank), moored boats in the channel, lanterns and their reflections.
import { PIER, CHANNEL } from './layout.js';

const WOOD = { dark: '#2a1808', mid: '#4a2e14', light: '#6b4422', top: '#8a5a30', rope: '#8a7048' };

export function drawPiers(ctx, state) {
  const t = state.time || 0;
  drawPier(ctx, PIER.left, t, false);
  drawPier(ctx, PIER.right, t, true);
  drawCrossing(ctx, state);
  boat(ctx, 585, 648, 78, t);
  boat(ctx, 692, 692, 54, t + 2.1);
}

function drawPier(ctx, P, t, isRight) {
  const g = ctx.createLinearGradient(0, P.y, 0, P.y + P.h);
  g.addColorStop(0, WOOD.top);
  g.addColorStop(0.07, WOOD.light);
  g.addColorStop(0.3, WOOD.mid);
  g.addColorStop(1, WOOD.dark);
  ctx.fillStyle = g;
  ctx.fillRect(P.x, P.y, P.w, P.h);

  ctx.strokeStyle = 'rgba(0,0,0,0.16)';
  ctx.lineWidth = 1;
  for (let y = P.y + 22; y < P.y + P.h; y += 22) {
    ctx.beginPath(); ctx.moveTo(P.x, y); ctx.lineTo(P.x + P.w, y); ctx.stroke();
  }
  ctx.fillStyle = WOOD.top;
  ctx.fillRect(P.x, P.y + P.h - 14, P.w, 14);
  ctx.fillStyle = WOOD.light;
  ctx.fillRect(P.x, P.y + P.h - 14, P.w, 4);
  ctx.strokeStyle = WOOD.light;
  ctx.lineWidth = 3;
  ctx.strokeRect(P.x, P.y, P.w, P.h);

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
  g.addColorStop(0, 'rgba(255,150,50,0.4)');
  g.addColorStop(0.45, 'rgba(255,120,30,0.13)');
  g.addColorStop(1, 'rgba(255,120,30,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-s * 3.4, -s * 3.4, s * 6.8, s * 6.8);
  ctx.fillStyle = '#ff8c20';
  ctx.beginPath(); ctx.ellipse(0, 0, s * 0.52, s * 0.68, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffbc55'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = WOOD.rope;
  ctx.fillRect(-s * 0.3, -s * 0.68, s * 0.6, s * 0.14);
  ctx.fillRect(-s * 0.24, s * 0.56, s * 0.48, s * 0.12);
  ctx.restore();
}

function drawCrossing(ctx, state) {
  const tide = state.tide;
  const t = state.time || 0;
  const x1 = CHANNEL.x1 + 4;
  const x2 = CHANNEL.x2 - 4;
  ctx.save();
  if (tide && tide.isHighTide) {
    const drift = Math.sin(t * 2.2) * 6;
    ctx.translate(0, drift);
    ctx.fillStyle = '#5a3820';
    ctx.fillRect(x1, CHANNEL.bridgeY, x2 - x1, 26);
    ctx.strokeStyle = '#7a5030'; ctx.lineWidth = 1;
    for (let x = x1; x < x2; x += 26) {
      ctx.beginPath(); ctx.moveTo(x, CHANNEL.bridgeY); ctx.lineTo(x, CHANNEL.bridgeY + 26); ctx.stroke();
    }
    ctx.strokeStyle = WOOD.rope; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x1, CHANNEL.bridgeY - 24); ctx.lineTo(x2, CHANNEL.bridgeY - 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x1, CHANNEL.bridgeY + 26); ctx.lineTo(x2, CHANNEL.bridgeY + 26); ctx.stroke();
    ctx.fillStyle = WOOD.mid;
    for (let x = x1 + 20; x < x2; x += 44) ctx.fillRect(x - 3, CHANNEL.bridgeY - 24, 6, 50);
    bridgeLabel(ctx, 'DRIFTING BRIDGE', CHANNEL.bridgeY - 38, '#ffd68a');
  } else if (tide && tide.isLowTide) {
    ctx.fillStyle = '#6b4422';
    ctx.fillRect(x1, CHANNEL.plankY, x2 - x1, 18);
    ctx.strokeStyle = '#8a5a30'; ctx.lineWidth = 1;
    for (let x = x1; x < x2; x += 18) {
      ctx.beginPath(); ctx.moveTo(x, CHANNEL.plankY); ctx.lineTo(x, CHANNEL.plankY + 18); ctx.stroke();
    }
    ctx.fillStyle = '#3a2410';
    ctx.fillRect(x1, CHANNEL.plankY + 18, x2 - x1, 4);
    bridgeLabel(ctx, 'NARROW PLANK', CHANNEL.plankY - 30, '#ffcf8a');
  } else {
    ctx.strokeStyle = 'rgba(255,150,60,0.5)';
    ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, CHANNEL.bridgeY + 10); ctx.lineTo(x2, CHANNEL.bridgeY + 10); ctx.stroke();
    ctx.setLineDash([]);
    bridgeLabel(ctx, 'MID TIDE · NO CROSSING', CHANNEL.bridgeY - 38, '#ff9a6a');
  }
  ctx.restore();
}

function bridgeLabel(ctx, text, y, color) {
  ctx.fillStyle = 'rgba(6,10,16,0.55)';
  ctx.font = 'bold 16px sans-serif';
  const w = ctx.measureText(text).width + 18;
  ctx.fillRect(640 - w / 2, y - 11, w, 22);
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 640, y + 1);
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
  ctx.strokeStyle = '#6b4422'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#c8a060';
  ctx.fillRect(-s * 0.2, -s * 0.3, s * 0.4, s * 0.18);
  ctx.restore();
}