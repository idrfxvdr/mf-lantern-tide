// drawService.js - the plating counter, the serving hatch with waiting customers,
// and the trash bin. Food is drawn by drawFood.js.
import { STATIONS } from './layout.js';
import { drawPlate } from './drawFood.js';

const S = { text: '#ffe0a8', woodDark: '#3d2410' };

export function drawService(ctx, state) {
  for (const s of STATIONS) {
    if (s.type !== 'plate' && s.type !== 'serve' && s.type !== 'trash') continue;
    ctx.save();
    if (s.type === 'plate') plate(ctx, s, state);
    else if (s.type === 'serve') serve(ctx, s, state);
    else trash(ctx, s);
    ctx.restore();
  }
}

function label(ctx, s, color) {
  ctx.fillStyle = color || S.text;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(s.label, s.x, s.y + s.r + 20);
}

function steamWisps(ctx, x, y, t) {
  ctx.strokeStyle = 'rgba(230,238,246,0.55)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * 16;
    ctx.beginPath();
    for (let k = 0; k <= 8; k++) {
      const yy = y - k * 7;
      const xx = x + ox + Math.sin(t * 2 + k * 0.7 + i) * 5;
      if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.lineCap = 'butt';
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
  ctx.fillRect(s.x - s.r, s.y + 28, s.r * 2, 16);
  const contents = st ? st.contents : [];
  drawPlate(ctx, s.x, s.y - 8, contents, 132, st ? st.ghost : null);
  if (contents && contents.length) steamWisps(ctx, s.x, s.y - 26, state.time || 0);
  label(ctx, s);
}

function serve(ctx, s, state) {
  const st = state.stations.find((q) => q.id === s.id);
  const t = state.time || 0;
  // Hatch frame
  ctx.fillStyle = '#5a3820';
  ctx.fillRect(s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
  ctx.fillStyle = '#22150a';
  ctx.fillRect(s.x - s.r + 12, s.y - s.r + 18, s.r * 2 - 24, s.r * 2 - 44);
  // Awning above the opening (scalloped), never over the faces
  ctx.fillStyle = '#d24a2a';
  ctx.beginPath();
  ctx.moveTo(s.x - s.r - 14, s.y - s.r - 4);
  ctx.lineTo(s.x + s.r + 14, s.y - s.r - 4);
  ctx.lineTo(s.x + s.r + 22, s.y - s.r + 22);
  ctx.lineTo(s.x - s.r - 22, s.y - s.r + 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2e2c4';
  for (let i = 0; i < 5; i++) ctx.fillRect(s.x - s.r - 8 + i * 28, s.y - s.r - 4, 13, 26);
  // Waiting customers with faces, inside the opening below the awning
  for (const dx of [-26, 26]) {
    const fx = s.x + dx, fy = s.y - 16;
    ctx.fillStyle = '#f0c48a';
    ctx.beginPath(); ctx.arc(fx, fy, 15, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2b2b2b';
    ctx.beginPath(); ctx.arc(fx - 5, fy - 2, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(fx + 5, fy - 2, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8a4a32'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(fx, fy + 3, 5, 0.2, Math.PI - 0.2); ctx.stroke();
    ctx.fillStyle = '#3a6a8a';
    ctx.fillRect(fx - 14, fy + 13, 28, 10);
  }
  // Counter lip
  ctx.fillStyle = '#8a5a30';
  ctx.fillRect(s.x - s.r - 6, s.y + 20, s.r * 2 + 12, 14);
  // Bell
  ctx.fillStyle = '#ffd24a';
  ctx.beginPath(); ctx.arc(s.x + s.r - 12, s.y - s.r + 12, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c99a1e';
  ctx.beginPath(); ctx.arc(s.x + s.r - 12, s.y - s.r + 4, 7, Math.PI, 0); ctx.fill();
  // Ready plate at the hatch
  const contents = st && st.contents ? st.contents : [];
  drawPlate(ctx, s.x, s.y + 42, contents, 118);
  if (contents.length) steamWisps(ctx, s.x, s.y + 18, t);
  label(ctx, s);
}

function trash(ctx, s) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(s.x + 6, s.y + 8, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a2020';
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6b3030';
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.76, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a1010'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#ff8a8a';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('X', s.x, s.y);
  label(ctx, s, '#ffb0b0');
}