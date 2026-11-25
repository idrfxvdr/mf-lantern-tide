// drawCookware.js - chopping board, wok on a flame, bamboo steamer, plating counter,
// serving hatch with awning and bell, and the trash bin.
import { STATIONS } from './layout.js';
import { drawFoodItem, drawPlate } from './drawFood.js';

const S = {
  text: '#ffe0a8',
  dim: 'rgba(255,224,168,0.72)',
  green: '#4ade80',
  red: '#ff5555',
  wood: '#6b4422',
  woodDark: '#3d2410',
};

export function drawCookware(ctx, state) {
  for (const s of STATIONS) {
    ctx.save();
    switch (s.type) {
      case 'chop': chop(ctx, s, state); break;
      case 'stove': stove(ctx, s, state); break;
      case 'steamer': steamer(ctx, s, state); break;
      case 'plate': plate(ctx, s, state); break;
      case 'serve': serve(ctx, s, state); break;
      default: trash(ctx, s); break;
    }
    ctx.restore();
  }
}

function label(ctx, s, color) {
  ctx.fillStyle = color || S.text;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(s.label, s.x, s.y + s.r + 8);
}

function ring(ctx, s, color) {
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r + 12, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(s.x, s.y, s.r + 12, -Math.PI / 2, -Math.PI / 2 + s.progress * Math.PI * 2);
  ctx.stroke();
}

function chop(ctx, s, state) {
  const st = state.stations.find((q) => q.id === s.id);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(s.x - s.r + 8, s.y - s.r + 10, s.r * 2, s.r * 1.5);
  const g = ctx.createLinearGradient(s.x, s.y - s.r, s.x, s.y + s.r);
  g.addColorStop(0, '#a97a4a');
  g.addColorStop(1, '#6b4422');
  ctx.fillStyle = g;
  ctx.fillRect(s.x - s.r, s.y - s.r * 0.75, s.r * 2, s.r * 1.5);
  ctx.strokeStyle = S.woodDark;
  ctx.lineWidth = 4;
  ctx.strokeRect(s.x - s.r, s.y - s.r * 0.75, s.r * 2, s.r * 1.5);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  for (let y = s.y - s.r * 0.6; y < s.y + s.r * 0.7; y += 12) {
    ctx.beginPath(); ctx.moveTo(s.x - s.r + 4, y); ctx.lineTo(s.x + s.r - 4, y); ctx.stroke();
  }
  // Cleaver
  ctx.save();
  ctx.translate(s.x + s.r * 0.55, s.y - s.r * 0.5);
  ctx.rotate(-0.55);
  ctx.fillStyle = '#d8dce2';
  ctx.fillRect(-6, -46, 12, 46);
  ctx.fillStyle = '#9aa0a8';
  ctx.fillRect(-6, -46, 12, 10);
  ctx.fillStyle = '#2b2b2b';
  ctx.fillRect(-5, 0, 10, 20);
  ctx.restore();
  if (st && st.contents) drawFoodItem(ctx, s.x - 10, s.y + 4, st.contents.ing, st.contents.state, 56);
  if (st && st.contents && st.progress > 0) ring(ctx, s, st.progress >= 1 ? S.green : '#ffb347');
  label(ctx, s);
}

function stove(ctx, s, state) {
  const st = state.stations.find((q) => q.id === s.id);
  // Brick base
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(s.x + 8, s.y + 10, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a3a2c';
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a1e14';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Fire
  const t = state.time || 0;
  const f = Math.sin(t * 9) * 3;
  ctx.fillStyle = 'rgba(255,120,20,0.35)';
  ctx.beginPath(); ctx.arc(s.x, s.y + f, s.r * 0.8, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + t * 2;
    ctx.fillStyle = i % 2 ? 'rgba(255,160,40,0.75)' : 'rgba(255,90,20,0.7)';
    ctx.beginPath();
    ctx.ellipse(s.x + Math.cos(a) * s.r * 0.5, s.y + Math.sin(a) * s.r * 0.4 + f, 9, 18, a, 0, Math.PI * 2);
    ctx.fill();
  }
  // Wok
  ctx.fillStyle = '#20242a';
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.72, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3c4450';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#2b3038';
  ctx.fillRect(s.x - s.r * 0.72 - 26, s.y - 7, 28, 14);
  ctx.fillRect(s.x + s.r * 0.72 - 2, s.y - 7, 28, 14);
  if (st && st.contents) drawFoodItem(ctx, s.x, s.y, st.contents.ing, st.contents.state, 62);
  if (st && st.contents && st.progress > 0) ring(ctx, s, st.progress >= 1 ? S.green : '#ffb347');
  label(ctx, s);
}

function steamer(ctx, s, state) {
  const st = state.stations.find((q) => q.id === s.id);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(s.x + 8, s.y + 10, s.r, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.r);
  g.addColorStop(0, '#e0bb7a');
  g.addColorStop(1, '#a97c3c');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#6b4422';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.strokeStyle = '#8a5a2c';
  ctx.lineWidth = 3;
  for (const k of [0.4, 0.66, 0.88]) {
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r * k, 0, Math.PI * 2); ctx.stroke();
  }
  // Lid handle
  ctx.fillStyle = '#6b4422';
  ctx.fillRect(s.x - 16, s.y - s.r - 14, 32, 12);
  ctx.fillRect(s.x - 8, s.y - s.r - 24, 16, 12);
  if (st && st.contents) drawFoodItem(ctx, s.x, s.y, st.contents.ing, st.contents.state, 54);
  if (st && st.contents && st.progress > 0) ring(ctx, s, st.progress >= 1 ? S.green : '#ffb347');
  label(ctx, s);
}

function plate(ctx, s, state) {
  const st = state.stations.find((q) => q.id === s.id);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(s.x - s.r + 8, s.y - 44 + 10, s.r * 2, 88);
  const g = ctx.createLinearGradient(0, s.y - 44, 0, s.y + 44);
  g.addColorStop(0, '#9a6a38');
  g.addColorStop(1, '#5a3820');
  ctx.fillStyle = g;
  ctx.fillRect(s.x - s.r, s.y - 44, s.r * 2, 88);
  ctx.strokeStyle = S.woodDark;
  ctx.lineWidth = 4;
  ctx.strokeRect(s.x - s.r, s.y - 44, s.r * 2, 88);
  ctx.fillStyle = '#b07c42';
  ctx.fillRect(s.x - s.r, s.y + 30, s.r * 2, 14);
  drawPlate(ctx, s.x, s.y - 6, st ? st.contents : [], 132);
  label(ctx, s);
}

function serve(ctx, s, state) {
  const st = state.stations.find((q) => q.id === s.id);
  // Hatch frame
  ctx.fillStyle = '#5a3820';
  ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
  ctx.fillStyle = '#2a1a0e';
  ctx.fillRect(s.x - s.r + 12, s.y - s.r + 16, s.r * 2 - 24, s.r * 2 - 40);
  // Counter lip
  ctx.fillStyle = '#8a5a30';
  ctx.fillRect(s.x - s.r - 8, s.y + s.r - 26, s.r * 2 + 16, 16);
  // Awning
  ctx.fillStyle = '#d24a2a';
  ctx.beginPath();
  ctx.moveTo(s.x - s.r - 16, s.y - s.r - 6);
  ctx.lineTo(s.x + s.r + 16, s.y - s.r - 6);
  ctx.lineTo(s.x + s.r + 26, s.y - s.r + 24);
  ctx.lineTo(s.x - s.r - 26, s.y - s.r + 24);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2e2c4';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(s.x - s.r - 10 + i * 30, s.y - s.r - 6, 14, 30);
  }
  // Bell
  ctx.fillStyle = '#ffd24a';
  ctx.beginPath(); ctx.arc(s.x + s.r - 6, s.y - s.r + 6, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c99a1e';
  ctx.beginPath(); ctx.arc(s.x + s.r - 6, s.y - s.r - 2, 7, Math.PI, 0); ctx.fill();
  // Ready plate at the hatch
  drawPlate(ctx, s.x, s.y + 6, st && st.contents ? st.contents : [], 136);
  // Waiting customer silhouettes
  ctx.fillStyle = 'rgba(10,20,28,0.75)';
  for (const dx of [-40, 0, 40]) {
    ctx.beginPath(); ctx.arc(s.x + dx, s.y - s.r - 26, 12, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(s.x + dx - 14, s.y - s.r - 16, 28, 18);
  }
  label(ctx, s);
}

function trash(ctx, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(s.x + 6, s.y + 8, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a2020';
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b3030';
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.76, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a1010';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#ff8a8a';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('X', s.x, s.y);
  label(ctx, s, '#ffb0b0');
}