// drawKitchen.js - Full kitchen scene with split modules
import { drawWater } from './drawWater.js';
import { drawPiers } from './drawPiers.js';
import { drawStations } from './drawStations.js';
import { drawChefWithItem } from './drawChef.js';
import { drawFoodItem, drawPlate } from './drawFood.js';
import { ST } from './stations.js';

const C = {
  water:'#0d2b3a', waterLight:'#1a4a5a',
  pier:'#3d2510', pierLight:'#5a3820', pierTop:'#7a5030',
  lantern:'#ff8c20', sky:'#0a1520', horizon:'#1a2830',
  text:'#ffd27d', textDim:'rgba(255,210,120,0.6)', white:'#f5e8d0',
  red:'#ff4444', green:'#44cc66', orange:'#ff9944',
};

export function drawKitchen(ctx, W, H, state) {
  // Layer 1: Background (water, sky, shore, moon)
  drawWater(ctx, W, H, state);
  // Layer 2: Piers, bridge, boats
  drawPiers(ctx, W, H, state);
  // Layer 3: Stations on piers
  drawStations(ctx, state);
  // Layer 4: Chef
  if (state.player) {
    const p = state.player;
    drawChefWithItem(ctx, p.getX(), p.getY(), p.carrying, p.facing, state.time||0);
  }
  // Layer 5: Particles
  if (state.particles) state.particles.draw(ctx);
}

export { C };
