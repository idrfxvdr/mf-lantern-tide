// shots.js - frozen states used by ?shot=1..4 for the screenshots.
import { RECIPES } from './recipes.js';
import { makeRng } from './rng.js';
import { ST } from './stations.js';

function ticket(recipe, patience, maxPatience, i) {
  return { id: 'shot' + i, recipe, patience, maxPatience, served: false, failed: false };
}

export function setupShot(g, n) {
  g.bgRng = makeRng(4200 + n);
  g.time = n * 3;
  g.screen = 'play';

  if (n === 1) {
    g.currentShift = 1;
    g.shiftTimer = 26;
    g.shiftDuration = 62;
    g.score = 340;
    g.shiftScore = 120;
    g.combo = 2;
    g.bestCombo = 3;
    g.orders = [
      ticket(RECIPES[0], 26, 40, 0),
      ticket(RECIPES[1], 20, 40, 1),
      ticket(RECIPES[5], 14, 40, 2),
      ticket(RECIPES[6], 9, 40, 3),
    ];
    // Chef beside the plating counter, carrying a chopped ingredient.
    g.player.x = 900;
    g.player.y = 580;
    g.player.carrying = { ing: 'shrimp', state: 'chopped', stepIdx: 0, recipeId: null };
    const plate = g.stations.find((s) => s.id === 'plate_counter');
    plate.contents = [
      { ing: 'rice', state: 'steamed' },
      { ing: 'nori', state: 'raw' },
    ];
    const steamer = g.stations.find((s) => s.id === 'steamer_pot');
    steamer.contents = { ing: 'rice', state: 'steamed' };
    steamer.progress = 1;
    const pan = g.stations.find((s) => s.id === 'stove_pan');
    pan.contents = { ing: 'fish', state: 'fried' };
    pan.progress = 0.72;
    const hatch = g.stations.find((s) => s.id === 'serve_window');
    hatch.contents = [
      { ing: 'rice', state: 'steamed' },
      { ing: 'fish', state: 'chopped' },
    ];
    g.particles.emitSteam(1100, 220);
    g.particles.emitSteam(900, 220);
  } else if (n === 2) {
    g.currentShift = 4;
    g.shiftTimer = 48;
    g.shiftDuration = 50;
    g.score = 1240;
    g.shiftScore = 260;
    g.combo = 3;
    g.bestCombo = 4;
    g.orders = [
      ticket(RECIPES[2], 6, 24, 0),
      ticket(RECIPES[3], 9, 24, 1),
      ticket(RECIPES[4], 5, 24, 2),
      ticket(RECIPES[7], 12, 24, 3),
    ];
    g.player.x = 1100;
    g.player.y = 350;
    g.player.carrying = { ing: 'egg', state: 'fried', stepIdx: 0, recipeId: null };
    const pan = g.stations.find((s) => s.id === 'stove_pan');
    pan.contents = { ing: 'shrimp', state: 'fried' };
    pan.progress = 0.9;
    const steamer = g.stations.find((s) => s.id === 'steamer_pot');
    steamer.contents = { ing: 'tofu', state: 'steamed' };
    steamer.progress = 0.6;
    const plate = g.stations.find((s) => s.id === 'plate_counter');
    plate.contents = [{ ing: 'mushroom', state: 'chopped' }];
    for (let i = 0; i < 4; i++) g.particles.emitSteam(1100, 210);
  } else if (n === 3) {
    g.currentShift = 2;
    g.shiftTimer = 34;
    g.shiftDuration = 56;
    g.score = 580;
    g.shiftScore = 150;
    g.combo = 2;
    g.orders = [
      ticket(RECIPES[3], 18, 36, 0),
      ticket(RECIPES[1], 24, 36, 1),
      ticket(RECIPES[4], 12, 36, 2),
      ticket(RECIPES[0], 28, 36, 3),
    ];
    g.player.x = 160;
    g.player.y = 700;
    g.player.carrying = null;
    const chop = g.stations.find((s) => s.id === 'chop_board');
    chop.contents = { ing: 'cabbage', state: 'chopped' };
    chop.progress = 0.82;
    const plate = g.stations.find((s) => s.id === 'plate_counter');
    plate.contents = [
      { ing: 'cabbage', state: 'chopped' },
      { ing: 'mushroom', state: 'chopped' },
    ];
    g.particles.emitChop(160, 600);
    g.particles.emitSteam(1100, 210);
  } else {
    g.screen = 'shiftResult';
    g.currentShift = 3;
    g.shiftScore = 410;
    g.shiftPassed = true;
    g.score = 1580;
    g.bestCombo = 5;
    g.orders = [
      { id: 'r0', recipe: RECIPES[0], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r1', recipe: RECIPES[1], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r2', recipe: RECIPES[5], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r3', recipe: RECIPES[6], served: false, failed: true, patience: 0, maxPatience: 1 },
    ];
    g.player.x = 900;
    g.player.y = 580;
    g.player.carrying = null;
    const hatch = g.stations.find((s) => s.id === ST.SERVE ? 'serve_window' : 'serve_window');
    hatch.contents = [{ ing: 'rice', state: 'steamed' }, { ing: 'fish', state: 'chopped' }];
  }
}