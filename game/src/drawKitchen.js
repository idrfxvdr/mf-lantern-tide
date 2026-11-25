// drawKitchen.js - composes the scene: water, piers, stations, chef, particles,
// an optional spotlight for close-up shots and a soft vignette.
import { W, H } from './layout.js';
import { drawWater } from './drawWater.js';
import { drawPiers } from './drawPiers.js';
import { drawStations } from './drawStations.js';
import { drawChef } from './drawChef.js';

export const C = {
  text: '#ffe0a8',
  dim: 'rgba(255,224,168,0.7)',
  lantern: '#ff9c30',
  green: '#4ade80',
  red: '#ff5555',
};

export function drawKitchen(ctx, state) {
  drawWater(ctx, state);
  drawPiers(ctx, state);
  drawStations(ctx, state);
  if (state.player) drawChef(ctx, state.player, state.time || 0);
  if (state.particles) state.particles.draw(ctx);
  if (state.spotlight) {
    const s = state.spotlight;
    const g = ctx.createRadialGradient(s.x, s.y, s.r * 0.35, s.x, s.y, s.r * 1.6);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(2,6,12,0.42)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  // Soft vignette so the lantern light feels warm and the edges fall away.
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.85);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

export { W, H };