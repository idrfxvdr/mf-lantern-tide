// drawClock.js - the big round lantern clock at the top centre. It turns urgent
// (red, pulsing) under 15 seconds and shows the shift number underneath.
import { HUD } from './layout.js';

export function drawClock(ctx, state) {
  const { x: cx, y: cy, r } = HUD.clock;
  const dur = state.shiftDuration || 60;
  const rem = Math.max(0, dur - (state.shiftTimer || 0));
  const frac = rem / dur;
  const urgent = rem < 15;
  const pulse = urgent ? 0.5 + 0.5 * Math.sin((state.time || 0) * 10) : 0;
  const mins = Math.floor(rem / 60);
  const secs = Math.floor(rem % 60);

  const halo = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.9);
  halo.addColorStop(0, urgent ? `rgba(255,80,30,${0.28 + pulse * 0.2})` : 'rgba(255,170,60,0.26)');
  halo.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = halo;
  ctx.fillRect(cx - r * 2, cy - r * 2, r * 4, r * 4);

  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#1c1206'; ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = urgent ? '#ff5a2a' : '#ff9c30';
  ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const big = i % 3 === 0;
    ctx.strokeStyle = urgent ? '#ff9a6a' : '#d08a40';
    ctx.lineWidth = big ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r - (big ? 13 : 8)), cy + Math.sin(a) * (r - (big ? 13 : 8)));
    ctx.lineTo(cx + Math.cos(a) * (r - 4), cy + Math.sin(a) * (r - 4));
    ctx.stroke();
  }

  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.strokeStyle = urgent ? '#ff3b1f' : frac > 0.35 ? '#4ade80' : '#ffb020';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 7, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
  ctx.stroke();
  ctx.lineCap = 'butt';

  ctx.beginPath(); ctx.arc(cx, cy, r - 16, 0, Math.PI * 2);
  ctx.fillStyle = urgent ? '#3a1206' : '#241606';
  ctx.fill();

  const mA = (mins / 60) * Math.PI * 2 - Math.PI / 2;
  ctx.strokeStyle = urgent ? '#ffb08a' : '#ffcf7a';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(mA) * (r * 0.42), cy + Math.sin(mA) * (r * 0.42));
  ctx.stroke();
  const sA = (rem % 1) * Math.PI * 2 - Math.PI / 2;
  ctx.lineWidth = 2;
  ctx.strokeStyle = urgent ? '#ff5a3a' : '#c08a40';
  ctx.beginPath(); ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(sA) * (r * 0.6), cy + Math.sin(sA) * (r * 0.6));
  ctx.stroke();

  ctx.fillStyle = urgent ? '#ffd0c0' : '#ffe6b0';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(mins + ':' + String(secs).padStart(2, '0'), cx, cy + r * 0.48);

  ctx.fillStyle = 'rgba(255,214,140,0.9)';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('SHIFT ' + (state.currentShift || 1) + '/5', cx, cy + r + 12);
}