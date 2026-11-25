// drawStations.js - draws every station by delegating to the crate and cookware renderers.
import { drawCrates } from './drawCrates.js';
import { drawCookware } from './drawCookware.js';

export function drawStations(ctx, state) {
  drawCrates(ctx, state);
  drawCookware(ctx, state);

  // Highlight the station the chef is standing at.
  const near = state.hoverStation;
  if (!near) return;
  const x = near.x !== undefined ? near.x : near.col;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,190,90,0.9)';
  ctx.lineWidth = 4;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.arc(x, near.y, (near.r || 46) + 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}