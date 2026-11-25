// drawCookware.js - the chopping board, the wok on its flame and the bamboo steamer.
// The plating counter, serving hatch and trash live in drawService.js.
import { STATIONS, FONT_STACK } from './layout.js';
import { BURN_TIME } from './stations.js';
import { drawFoodItem } from './drawFood.js';
import { drawService } from './drawService.js';

const S = { text: '#FFF3D6', green: '#4ade80', red: '#ff5555', woodDark: '#3d2410' };
const RING = { cook: '#5BE37D', ready: '#FFD34D', burn: '#FF5A4D', track: 'rgba(10,6,4,0.62)', gap: 12 };

export function drawCookware(ctx, state) {
  for (const s of STATIONS) {
    if (s.type === 'plate' || s.type === 'serve' || s.type === 'trash') continue;
    ctx.save();
    if (s.type === 'chop') chop(ctx, s, state);
    else if (s.type === 'stove') stove(ctx, s, state);
    else if (s.type === 'steamer') steamer(ctx, s, state);
    ctx.restore();
  }
  drawService(ctx, state);
}

function label(ctx, s, color) {
  ctx.fillStyle = color || S.text;
  ctx.font = `bold 18px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(s.label, s.x, s.y + s.r + 20);
}

// Progress ring drawn outside the vessel: a dark 12px track, a bright 10px arc
// clockwise from the top (green cooking, gold ready, red about to burn), plus a
// tick mark at the top once the food is ready.
function ring(ctx, s, st) {
  const rad = s.r + RING.gap;
  const frac = Math.max(0, Math.min(1, st ? st.progress || 0 : 0));
  const ready = frac >= 1;
  const aboutToBurn = ready && !st.burning && st.burnTimer > BURN_TIME * 0.5;
  const burning = !!(st && st.burning);
  const color = burning || aboutToBurn ? RING.burn : ready ? RING.ready : RING.cook;

  ctx.save();
  ctx.lineCap = 'butt';
  // Dark track.
  ctx.strokeStyle = RING.track;
  ctx.lineWidth = 12;
  ctx.beginPath(); ctx.arc(s.x, s.y, rad, 0, Math.PI * 2); ctx.stroke();
  // Bright arc, clockwise from the top.
  if (frac > 0.002) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(s.x, s.y, rad, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
  }
  // Ready tick just outside the top of the ring.
  if (ready) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    const ty = s.y - rad;
    ctx.beginPath();
    ctx.moveTo(s.x - 8, ty - 10);
    ctx.lineTo(s.x - 2, ty - 4);
    ctx.lineTo(s.x + 8, ty - 16);
    ctx.stroke();
  }
  ctx.restore();
}

function choppedBits(ctx, x, y, ing, n = 5) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + 0.6;
    drawFoodItem(ctx, x + Math.cos(a) * 24, y + Math.sin(a) * 12, ing, 'chopped', 26);
  }
}

function chop(ctx, s, state) {
  const st = state.stations.find((q) => q.id === s.id);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(s.x - s.r + 8, s.y - s.r * 0.7 + 10, s.r * 2, s.r * 1.4);
  const g = ctx.createLinearGradient(s.x, s.y - s.r, s.x, s.y + s.r);
  g.addColorStop(0, '#b98650');
  g.addColorStop(1, '#6b4422');
  ctx.fillStyle = g;
  ctx.fillRect(s.x - s.r, s.y - s.r * 0.7, s.r * 2, s.r * 1.4);
  ctx.strokeStyle = S.woodDark;
  ctx.lineWidth = 4;
  ctx.strokeRect(s.x - s.r, s.y - s.r * 0.7, s.r * 2, s.r * 1.4);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0,0,0,0.14)';
  for (let y = s.y - s.r * 0.55; y < s.y + s.r * 0.6; y += 12) {
    ctx.beginPath(); ctx.moveTo(s.x - s.r + 4, y); ctx.lineTo(s.x + s.r - 4, y); ctx.stroke();
  }
  // Cleaver
  ctx.save();
  ctx.translate(s.x + s.r * 0.52, s.y - s.r * 0.42);
  ctx.rotate(-0.55);
  ctx.fillStyle = '#d8dce2'; ctx.fillRect(-6, -44, 12, 44);
  ctx.fillStyle = '#9aa0a8'; ctx.fillRect(-6, -44, 12, 10);
  ctx.fillStyle = '#2b2b2b'; ctx.fillRect(-5, 0, 10, 20);
  ctx.restore();
  if (st && st.contents) {
    if (st.contents.state === 'chopped') choppedBits(ctx, s.x - 8, s.y + 2, st.contents.ing, 5);
    else drawFoodItem(ctx, s.x - 10, s.y + 2, st.contents.ing, st.contents.state, 54);
  }
  if (st && st.contents) ring(ctx, s, st);
  label(ctx, s);
}

function stove(ctx, s, state) {
  const st = state.stations.find((q) => q.id === s.id);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(s.x + 8, s.y + 10, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a3a2c';
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a1e14'; ctx.lineWidth = 4; ctx.stroke();
  const t = state.time || 0;
  const f = Math.sin(t * 9) * 3;
  ctx.fillStyle = 'rgba(255,120,20,0.4)';
  ctx.beginPath(); ctx.arc(s.x, s.y + f, s.r * 0.82, 0, Math.PI * 2); ctx.fill();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + t * 2;
    ctx.fillStyle = i % 2 ? 'rgba(255,170,50,0.8)' : 'rgba(255,90,20,0.75)';
    ctx.beginPath();
    ctx.ellipse(s.x + Math.cos(a) * s.r * 0.5, s.y + Math.sin(a) * s.r * 0.4 + f, 10, 20, a, 0, Math.PI * 2);
    ctx.fill();
  }
  // Wok
  ctx.fillStyle = '#20242a';
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.74, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#3c4450'; ctx.lineWidth = 5; ctx.stroke();
  ctx.fillStyle = '#2b3038';
  ctx.fillRect(s.x - s.r * 0.74 - 26, s.y - 7, 28, 14);
  ctx.fillRect(s.x + s.r * 0.74 - 2, s.y - 7, 28, 14);
  if (st && st.contents) drawFoodItem(ctx, s.x, s.y, st.contents.ing, st.contents.state, 64);
  if (st && st.contents) ring(ctx, s, st);
  label(ctx, s);
}

function steamer(ctx, s, state) {
  const st = state.stations.find((q) => q.id === s.id);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.arc(s.x + 8, s.y + 10, s.r, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createRadialGradient(s.x, s.y, 4, s.x, s.y, s.r);
  g.addColorStop(0, '#e6c485');
  g.addColorStop(1, '#a97c3c');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#6b4422'; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = '#8a5a2c'; ctx.lineWidth = 3;
  for (const k of [0.4, 0.66, 0.88]) {
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r * k, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = '#6b4422';
  ctx.fillRect(s.x - 16, s.y - s.r - 14, 32, 12);
  ctx.fillRect(s.x - 8, s.y - s.r - 24, 16, 12);
  if (st && st.contents) drawFoodItem(ctx, s.x, s.y, st.contents.ing, st.contents.state, 56);
  if (st && st.contents) ring(ctx, s, st);
  label(ctx, s);
}