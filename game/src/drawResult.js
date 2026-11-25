// drawResult.js - a warm shift-result card held over the still-visible kitchen:
// stars, orders served/failed, tips, best combo, the dishes served and the next shift.
import { RECIPES } from './recipes.js';
import { drawFoodItem } from './drawFood.js';

export function drawResult(ctx, state) {
  const W = 1280, H = 800;
  const cw = 660, ch = 500;
  const x = (W - cw) / 2;
  const y = (H - ch) / 2 - 6;
  const passed = state.shiftPassed;
  const served = state.servedThisShift || 0;
  const failed = state.failedThisShift || 0;
  const target = state.shiftTarget || 3;
  const stars = passed ? (served >= target + 2 ? 3 : 2) : 0;

  ctx.fillStyle = 'rgba(6,10,16,0.22)';
  ctx.fillRect(0, 0, W, H);

  // Warm glow behind the card so the result reads at a glance.
  const glow = ctx.createRadialGradient(W / 2, y + ch / 2, 40, W / 2, y + ch / 2, 460);
  glow.addColorStop(0, passed ? 'rgba(255,170,60,0.28)' : 'rgba(255,90,70,0.22)');
  glow.addColorStop(1, 'rgba(255,170,60,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const g = ctx.createLinearGradient(x, y, x, y + ch);
  g.addColorStop(0, passed ? '#4a3418' : '#46201c');
  g.addColorStop(1, '#22150a');
  ctx.fillStyle = g;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, cw, ch, 20); else ctx.rect(x, y, cw, ch);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = passed ? '#ffb347' : '#ff6a5a';
  ctx.stroke();

  // Stars
  ctx.font = '54px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < stars ? '#ffd24a' : 'rgba(120,100,70,0.45)';
    ctx.fillText('★', x + cw / 2 - 100 + i * 100, y + 64);
  }

  ctx.fillStyle = passed ? '#8ce89a' : '#ff8a7a';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(passed ? 'SHIFT ' + state.currentShift + ' COMPLETE' : 'SHIFT ' + state.currentShift + ' FAILED', x + cw / 2, y + 132);

  // Stats
  const rows = [
    ['Orders served', served + ' / ' + target + ' needed'],
    ['Orders failed', String(failed)],
    ['Shift score', String(state.shiftScore || 0)],
    ['Tips earned', '+' + (state.tips || 0)],
    ['Best combo', 'x' + Math.max(1, state.bestCombo || 1)],
  ];
  ctx.textAlign = 'left';
  rows.forEach((r, i) => {
    const ry = y + 184 + i * 34;
    ctx.fillStyle = '#c8a878';
    ctx.font = '18px sans-serif';
    ctx.fillText(r[0], x + 64, ry);
    ctx.fillStyle = '#ffe6b0';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(r[1], x + 330, ry);
  });

  // Row of served dishes
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c8a878';
  ctx.font = '16px sans-serif';
  ctx.fillText('Served tonight', x + cw / 2, y + 366);
  const shown = (state.orders || []).filter((o) => o.served).slice(0, 5);
  const list = shown.length ? shown : RECIPES.slice(0, Math.min(3, served || 3)).map((r) => ({ recipe: r }));
  list.forEach((o, i) => {
    const dx = x + cw / 2 + (i - (list.length - 1) / 2) * 98;
    ctx.fillStyle = '#efe6cf';
    ctx.beginPath(); ctx.ellipse(dx, y + 404, 42, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9bb9a'; ctx.lineWidth = 2; ctx.stroke();
    const st = o.recipe.steps[0];
    drawFoodItem(ctx, dx, y + 400, st.ing, st.state, 40);
  });

  // Next step / preview
  ctx.fillStyle = '#ffd68a';
  ctx.font = 'bold 18px sans-serif';
  let next;
  if (passed && state.currentShift >= 5) next = 'All five shifts done — press ENTER';
  else if (passed) next = 'Next: shift ' + (state.currentShift + 1) + ' · ' + (3 + state.currentShift) + ' orders · press ENTER';
  else if (state.currentShift >= 5) next = 'The night is lost — press ENTER to try again';
  else next = 'Press ENTER to retry shift ' + state.currentShift;
  ctx.fillText(next, x + cw / 2, y + ch - 40);
}