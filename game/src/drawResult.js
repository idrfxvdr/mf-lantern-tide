// drawResult.js - warm shift-result card held over the still-visible kitchen.
import { RECIPES } from './recipes.js';
import { drawFoodItem } from './drawFood.js';

export function drawResult(ctx, state) {
  const W = 1280, H = 800;
  const cw = 620, ch = 470;
  const x = (W - cw) / 2;
  const y = (H - ch) / 2 - 10;
  const passed = state.shiftPassed;

  ctx.fillStyle = 'rgba(6,10,16,0.45)';
  ctx.fillRect(0, 0, W, H);

  // Card
  const g = ctx.createLinearGradient(x, y, x, y + ch);
  g.addColorStop(0, passed ? '#2a1c0c' : '#2c1210');
  g.addColorStop(1, '#140c06');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, cw, ch, 18) : ctx.rect(x, y, cw, ch);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = passed ? '#ffb347' : '#ff6a5a';
  ctx.stroke();

  // Stars
  const stars = passed ? 3 : 1;
  ctx.font = '52px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < stars ? '#ffd24a' : 'rgba(120,100,70,0.5)';
    ctx.fillText('★', x + cw / 2 - 90 + i * 90, y + 62);
  }

  // Title
  ctx.fillStyle = passed ? '#8ce89a' : '#ff8a7a';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(passed ? 'SHIFT ' + state.currentShift + ' COMPLETE' : 'SHIFT ' + state.currentShift + ' FAILED', x + cw / 2, y + 128);

  // Stats
  const served = (state.orders || []).filter((o) => o.served).length;
  const failed = (state.orders || []).filter((o) => o.failed).length;
  const rows = [
    ['Shift score', String(state.shiftScore || 0)],
    ['Total score', String(state.score || 0)],
    ['Best combo', 'x' + Math.max(1, state.bestCombo || state.combo || 1)],
    ['Orders served', served + '  (' + failed + ' failed)'],
  ];
  ctx.textAlign = 'left';
  rows.forEach((r, i) => {
    const ry = y + 186 + i * 38;
    ctx.fillStyle = '#c8a878';
    ctx.font = '20px sans-serif';
    ctx.fillText(r[0], x + 60, ry);
    ctx.fillStyle = '#ffe6b0';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(r[1], x + 300, ry);
  });

  // Row of served dishes
  ctx.textAlign = 'center';
  ctx.fillStyle = '#c8a878';
  ctx.font = '18px sans-serif';
  ctx.fillText('Served tonight', x + cw / 2, y + 344);
  const shown = (state.orders || []).filter((o) => o.served).slice(0, 5);
  const fallback = RECIPES.slice(0, 3);
  const list = shown.length ? shown : fallback.map((r) => ({ recipe: r }));
  list.forEach((o, i) => {
    const dx = x + cw / 2 + (i - (list.length - 1) / 2) * 96;
    ctx.fillStyle = '#efe6cf';
    ctx.beginPath(); ctx.ellipse(dx, y + 384, 42, 18, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#c9bb9a'; ctx.lineWidth = 2; ctx.stroke();
    const st = o.recipe.steps[0];
    drawFoodItem(ctx, dx, y + 380, st.ing, st.state, 40);
  });

  // Next step
  ctx.fillStyle = '#ffd68a';
  ctx.font = 'bold 20px sans-serif';
  const next = passed
    ? (state.currentShift >= 5 ? 'All five shifts done — press ENTER' : 'Next: shift ' + (state.currentShift + 1) + ' — press ENTER')
    : 'Press ENTER to retry this shift';
  ctx.fillText(next, x + cw / 2, y + ch - 34);
}