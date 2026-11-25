// shots.js - frozen states used by ?shot=1..4 for the screenshots. Each one loads the
// real game state and renders it; nothing here is a mock drawing.
import { RECIPES } from './recipes.js';
import { makeRng } from './rng.js';

function ticket(recipe, frac, maxPatience, i) {
  return { id: 'shot' + i, recipe, patience: maxPatience * frac, maxPatience, served: false, failed: false };
}

function setPlayer(g, x, y, facing = 1) {
  g.player.x = x;
  g.player.y = y;
  g.player.facing = facing;
  g.player.path = [];
  g.player.walkTo = null;
}

export function setupShot(g, n) {
  g.bgRng = makeRng(4200 + n);
  g.time = n * 3;
  g.screen = 'play';
  g.toast = '';
  g.toastTimer = 0;
  g.hoverStation = null;
  g.pendingStation = null;

  if (n === 1) {
    // Cover: whole kitchen, four different orders, a half-built plate, a finished
    // plate at the hatch, the chef carrying something beside the plating counter.
    g.currentShift = 1;
    g.shiftTimer = 26;
    g.shiftDuration = 62;
    g.shiftTarget = 3;
    g.servedThisShift = 1;
    g.failedThisShift = 0;
    g.score = 340;
    g.shiftScore = 120;
    g.combo = 2;
    g.bestCombo = 3;
    g.tips = 30;
    g.orders = [
      ticket(RECIPES[0], 0.82, 40, 0),
      ticket(RECIPES[1], 0.55, 40, 1),
      ticket(RECIPES[5], 0.3, 40, 2),
      ticket(RECIPES[6], 0.12, 40, 3),
    ];
    g.tide.setTime(18); // high tide: the drifting bridge is the visual centre
    setPlayer(g, 790, 600, 1);
    g.player.carrying = { ing: 'shrimp', state: 'chopped', stepIdx: 0, recipeId: null };
    const plate = g.stations.find((s) => s.id === 'plate_counter');
    plate.contents = [{ ing: 'rice', state: 'steamed' }, { ing: 'nori', state: 'raw' }];
    plate.ghost = [{ ing: 'fish', state: 'chopped' }];
    const steamer = g.stations.find((s) => s.id === 'steamer_pot');
    steamer.contents = { ing: 'rice', state: 'steamed' };
    steamer.progress = 1;
    const pan = g.stations.find((s) => s.id === 'stove_pan');
    pan.contents = { ing: 'fish', state: 'fried' };
    pan.progress = 0.72;
    const hatch = g.stations.find((s) => s.id === 'serve_window');
    hatch.contents = [{ ing: 'fish', state: 'chopped' }, { ing: 'rice', state: 'steamed' }];
    g.particles.emitSteam(1100, 214);
    g.particles.emitSteam(900, 220);
    g.particles.emitSteam(1120, 470);
  } else if (n === 2) {
    // Service rush: shift 4, clock almost out, four impatient tickets, combo alive.
    g.currentShift = 4;
    g.shiftTimer = 48;
    g.shiftDuration = 50;
    g.shiftTarget = 6;
    g.servedThisShift = 4;
    g.failedThisShift = 1;
    g.score = 1240;
    g.shiftScore = 260;
    g.combo = 3;
    g.bestCombo = 4;
    g.tips = 90;
    g.orders = [
      ticket(RECIPES[2], 0.22, 24, 0),
      ticket(RECIPES[3], 0.4, 24, 1),
      ticket(RECIPES[4], 0.12, 24, 2),
      ticket(RECIPES[7], 0.5, 24, 3),
    ];
    g.tide.setTime(3); // low tide: the narrow plank is out
    setPlayer(g, 1020, 300, -1);
    g.player.carrying = { ing: 'egg', state: 'fried', stepIdx: 0, recipeId: null };
    const pan = g.stations.find((s) => s.id === 'stove_pan');
    pan.contents = { ing: 'shrimp', state: 'fried' };
    pan.progress = 0.9;
    const steamer = g.stations.find((s) => s.id === 'steamer_pot');
    steamer.contents = { ing: 'tofu', state: 'steamed' };
    steamer.progress = 0.6;
    const plate = g.stations.find((s) => s.id === 'plate_counter');
    plate.contents = [{ ing: 'mushroom', state: 'chopped' }];
    plate.ghost = [{ ing: 'cabbage', state: 'chopped' }];
    for (let i = 0; i < 5; i++) g.particles.emitSteam(1100, 210);
    g.particles.emitCombo(1050, 460, 3);
  } else if (n === 3) {
    // Close moment: chopping on the left, plating on the right, effects in the air.
    g.currentShift = 2;
    g.shiftTimer = 20;
    g.shiftDuration = 56;
    g.shiftTarget = 4;
    g.servedThisShift = 2;
    g.failedThisShift = 0;
    g.score = 580;
    g.shiftScore = 150;
    g.combo = 2;
    g.bestCombo = 2;
    g.orders = [
      ticket(RECIPES[3], 0.5, 36, 0),
      ticket(RECIPES[1], 0.66, 36, 1),
      ticket(RECIPES[4], 0.33, 36, 2),
      ticket(RECIPES[0], 0.78, 36, 3),
    ];
    g.tide.setTime(12);
    setPlayer(g, 85, 560, 1);
    g.player.carrying = null;
    const chop = g.stations.find((s) => s.id === 'chop_board');
    chop.contents = { ing: 'cabbage', state: 'chopped' };
    chop.progress = 0.82;
    const plate = g.stations.find((s) => s.id === 'plate_counter');
    plate.contents = [{ ing: 'cabbage', state: 'chopped' }, { ing: 'mushroom', state: 'chopped' }];
    plate.ghost = null;
    g.spotlight = { x: 150, y: 520, r: 150 };
    g.particles.emitChop(150, 512);
    g.particles.emitSteam(1120, 470);
    g.particles.emitSteam(900, 220);
  } else {
    // Shift result: warm card over the still-visible kitchen.
    g.screen = 'shiftResult';
    g.currentShift = 3;
    g.shiftScore = 410;
    g.shiftPassed = true;
    g.shiftTarget = 5;
    g.servedThisShift = 7;
    g.failedThisShift = 1;
    g.score = 1580;
    g.bestCombo = 5;
    g.tips = 120;
    g.orders = [
      { id: 'r0', recipe: RECIPES[0], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r1', recipe: RECIPES[1], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r2', recipe: RECIPES[5], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r3', recipe: RECIPES[6], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r4', recipe: RECIPES[2], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r5', recipe: RECIPES[3], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r6', recipe: RECIPES[4], served: true, failed: false, patience: 0, maxPatience: 1 },
      { id: 'r7', recipe: RECIPES[7], served: false, failed: true, patience: 0, maxPatience: 1 },
    ];
    setPlayer(g, 790, 600, 1);
    g.player.carrying = null;
    const hatch = g.stations.find((s) => s.id === 'serve_window');
    hatch.contents = [{ ing: 'rice', state: 'steamed' }, { ing: 'fish', state: 'chopped' }];
    g.tide.setTime(22);
  }
}