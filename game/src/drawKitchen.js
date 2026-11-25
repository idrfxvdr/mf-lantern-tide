// drawKitchen.js - composes the scene: water, piers, stations, chef, particles,
// an optional spotlight for close-up shots and a soft vignette.
import { W, H } from './layout.js';
import { drawWater } from './drawWater.js';
import { drawPiers } from './drawPiers.js';
import { drawStations } from './drawStations.js';
import { drawProps } from './drawProps.js';
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
  drawProps(ctx, state);
  drawStations(ctx, state);
  if (state.player) drawChef(ctx, state.player, state.time || 0);
  if (state.particles) state.particles.draw(ctx);
  // Warm light pool for close-up shots: a soft (255,190,110) glow, never a black dimmer,
  // so the whole kitchen stays readable (review: alpha at most 0.12 everywhere).
  if (state.spotlight) {
    const s = state.spotlight;
    const g = ctx.createRadialGradient(s.x, s.y, s.r * 0.3, s.x, s.y, s.r * 1.7);
    g.addColorStop(0, 'rgba(255,190,110,0.12)');
    g.addColorStop(0.6, 'rgba(255,190,110,0.05)');
    g.addColorStop(1, 'rgba(255,190,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  // Very soft vignette (alpha 0.12 max) so the lantern light feels warm without
  // dimming the floor, crates, stations or labels.
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

export { W, H };