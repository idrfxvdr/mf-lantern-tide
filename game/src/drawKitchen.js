// drawKitchen.js - composes the scene: water, piers, stations, chef, particles.
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
}

export { W, H };