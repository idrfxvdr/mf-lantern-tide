// drawProps.js - the dressing that fills the lower piers: barrels, rice sacks,
// rope coils, a brazier and mooring bollards. Every position comes from PROPS in
// layout.js, the same table overlap.mjs checks, so nothing lands on a label.
import { PROPS } from './layout.js';

export function drawProps(ctx, state) {
  const t = state.time || 0;
  PROPS.forEach((p, i) => {
    const phase = t + i * 1.7;
    if (p.kind === 'barrel') barrel(ctx, p.x, p.y, p.s, phase);
    else if (p.kind === 'sack') sack(ctx, p.x, p.y, p.s);
    else if (p.kind === 'rope') rope(ctx, p.x, p.y, p.s);
    else if (p.kind === 'bollard') bollard(ctx, p.x, p.y);
    else if (p.kind === 'spice_shelf') spiceShelf(ctx, p.x, p.y);
    else if (p.kind === 'utensil_rack') utensilRack(ctx, p.x, p.y);
    else if (p.kind === 'lantern_post') lanternPost(ctx, p.x, p.y, t);
    else brazier(ctx, p.x, p.y, t);
  });
}

// A low wooden spice shelf with a row of labelled jars.
function spiceShelf(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-72, 12, 144, 8);
  ctx.fillStyle = '#8a5a30';
  ctx.fillRect(-75, -2, 150, 14);
  ctx.fillStyle = '#ba7a41';
  ctx.fillRect(-75, -2, 150, 4);
  ctx.strokeStyle = '#3d2410'; ctx.lineWidth = 2;
  ctx.strokeRect(-75, -2, 150, 14);
  const jars = ['#d24a2a', '#e0a020', '#5a8a3a', '#8a5a2c', '#c05050'];
  jars.forEach((c, i) => {
    const jx = -60 + i * 30;
    ctx.fillStyle = c;
    ctx.fillRect(jx - 9, -17, 18, 15);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(jx - 9, -17, 18, 4);
    ctx.fillStyle = '#6b4422';
    ctx.fillRect(jx - 8, -20, 16, 4);
  });
  ctx.restore();
}

// A rail with hooks and three utensils hanging from it.
function utensilRack(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#6b4422'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-32, -42); ctx.lineTo(32, -42); ctx.stroke();
  ctx.strokeStyle = '#3d2410'; ctx.lineWidth = 2;
  for (const hx of [-22, 0, 22]) {
    ctx.beginPath(); ctx.moveTo(hx, -42); ctx.lineTo(hx, -34); ctx.stroke();
  }
  // Ladle
  ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-22, -34); ctx.lineTo(-22, -6); ctx.stroke();
  ctx.fillStyle = '#9aa0a8';
  ctx.beginPath(); ctx.arc(-22, 0, 8, 0, Math.PI); ctx.fill();
  // Spatula
  ctx.strokeStyle = '#8a5a30'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(0, -6); ctx.stroke();
  ctx.fillStyle = '#c9ced6';
  ctx.beginPath(); ctx.ellipse(0, 0, 8, 11, 0, 0, Math.PI * 2); ctx.fill();
  // Whisk
  ctx.strokeStyle = '#c9ced6'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(22, -34); ctx.lineTo(22, -16); ctx.stroke();
  for (let k = -1; k <= 1; k++) {
    ctx.beginPath();
    ctx.moveTo(22, -16);
    ctx.quadraticCurveTo(22 + k * 8, -6, 22, 6);
    ctx.stroke();
  }
  ctx.restore();
}

// A slim post with a lit lantern at the top; glow stays within the prop box.
function lanternPost(ctx, x, y, t) {
  const sway = Math.sin(t * 1.4) * 1.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 44, 12, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(-4, -30, 8, 74);
  ctx.fillStyle = '#6b4422';
  ctx.fillRect(-10, 40, 20, 6);
  ctx.translate(sway, -34);
  const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 34);
  g.addColorStop(0, 'rgba(255,170,70,0.5)');
  g.addColorStop(1, 'rgba(255,140,40,0)');
  ctx.fillStyle = g;
  ctx.fillRect(-34, -34, 68, 68);
  ctx.fillStyle = '#ff8c20';
  ctx.beginPath(); ctx.ellipse(0, 0, 9, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffbc55'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(-5, -14, 10, 3);
  ctx.fillRect(-4, 11, 8, 3);
  ctx.restore();
}


function barrel(ctx, x, y, s, t) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(4, s * 0.5, s * 0.9, s * 0.32, 0, 0, Math.PI * 2); ctx.fill();
  const g = ctx.createLinearGradient(-s, 0, s, 0);
  g.addColorStop(0, '#4a2c14');
  g.addColorStop(0.45, '#8a5a30');
  g.addColorStop(1, '#3d2410');
  ctx.fillStyle = g;
  ctx.fillRect(-s * 0.8, -s * 0.9, s * 1.6, s * 1.4);
  ctx.fillStyle = '#6b4422';
  ctx.beginPath(); ctx.ellipse(0, -s * 0.9, s * 0.8, s * 0.26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#2a1808'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, -s * 0.9, s * 0.8, s * 0.26, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#3a2410'; ctx.lineWidth = 2;
  for (const k of [-0.45, 0.15]) {
    ctx.beginPath(); ctx.moveTo(-s * 0.8, s * k); ctx.lineTo(s * 0.8, s * k); ctx.stroke();
  }
  ctx.restore();
}

function sack(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(3, s * 0.42, s * 0.85, s * 0.28, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#c8b184';
  ctx.beginPath();
  ctx.moveTo(-s * 0.7, s * 0.4);
  ctx.quadraticCurveTo(-s * 0.95, -s * 0.5, -s * 0.3, -s * 0.75);
  ctx.quadraticCurveTo(0, -s * 0.95, s * 0.3, -s * 0.75);
  ctx.quadraticCurveTo(s * 0.95, -s * 0.5, s * 0.7, s * 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#a08c60'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#8a7048';
  ctx.fillRect(-s * 0.22, -s * 0.95, s * 0.44, s * 0.16);
  ctx.restore();
}

function rope(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = '#a08050';
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(0, 0, s - i * 5, (s - i * 5) * 0.42, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function bollard(ctx, x, y) {
  ctx.fillStyle = '#3d2410';
  ctx.fillRect(x - 7, y - 26, 14, 30);
  ctx.fillStyle = '#5a3820';
  ctx.beginPath(); ctx.ellipse(x, y - 26, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#a08050'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x - 9, y - 14); ctx.lineTo(x + 9, y - 10); ctx.stroke();
}

function brazier(ctx, x, y, t) {
  const f = Math.sin(t * 8) * 3;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath(); ctx.ellipse(x, y + 16, 30, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#2a2a2e';
  ctx.beginPath();
  ctx.moveTo(x - 24, y + 12);
  ctx.lineTo(x + 24, y + 12);
  ctx.lineTo(x + 16, y - 8);
  ctx.lineTo(x - 16, y - 8);
  ctx.closePath();
  ctx.fill();
  const g = ctx.createRadialGradient(x, y - 16, 3, x, y - 16, 46);
  g.addColorStop(0, 'rgba(255,190,80,0.55)');
  g.addColorStop(1, 'rgba(255,140,40,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - 46, y - 62, 92, 92);
  for (let i = 0; i < 3; i++) {
    const ox = (i - 1) * 9;
    ctx.fillStyle = i === 1 ? '#ffd24a' : '#ff8a20';
    ctx.beginPath();
    ctx.moveTo(x + ox - 7, y - 6);
    ctx.quadraticCurveTo(x + ox, y - 30 - f + i * 3, x + ox + 7, y - 6);
    ctx.closePath();
    ctx.fill();
  }
}