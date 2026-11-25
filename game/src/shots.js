// Screenshot states for ?shot=1..4
import { INGREDIENTS, RECIPES } from './recipes.js';
import { ST } from './stations.js';
import { makeRng } from './rng.js';

export function setupShot(state, shotNum) {
  const seed = 4242 + shotNum;
  const rng = makeRng(seed);
  state.bgRng = makeRng(42 + shotNum);
  state.time = 0;
  state.particles.items = [];

  if (shotNum === 1) {
    // Cover shot: full kitchen, 4 orders, ingredient crates, one dish mid-assembly, big timer, finished plate at serve, player carrying
    state.screen = 'play';
    state.currentShift = 1;
    state.shiftTimer = 35;
    state.shiftDuration = 60;
    state.score = 340;
    state.combo = 2;
    state.shiftPassed = false;

    // Spawn 4 orders
    state.orders = [];
    for (let i = 0; i < 4; i++) {
      const r = RECIPES[i % RECIPES.length];
      state.orders.push({
        id: `shot_order_${i}`,
        recipe: r,
        patience: 20 + i * 10,
        maxPatience: 30 + i * 10,
        served: false,
        failed: false,
        partial: false,
      });
    }

    // Player position and carrying
    state.player.x = 900;
    state.player.y = 260;
    state.player.carrying = { ing: 'fish', state: 'chopped', stepIdx: 0, recipeId: 'fish_platter' };
    state.player.carryCount = 1;

    // Plate counter has items (mid-assembly)
    const plateCounter = state.stations.find(s => s.id === 'plate_counter');
    if (plateCounter) {
      plateCounter.contents = [
        { ing: 'rice', state: 'steamed' },
        { ing: 'fish', state: 'chopped' },
      ];
    }

    // Steamer has rice
    const steamer = state.stations.find(s => s.id === 'steamer_pot');
    if (steamer) {
      steamer.contents = { ing: 'rice', state: 'steamed' };
      steamer.progress = 1;
    }

    // Serve window has a finished plate
    const serve = state.stations.find(s => s.id === 'serve_window');
    if (serve) {
      serve.readyPlate = [
        { ing: 'fish', state: 'chopped' },
        { ing: 'rice', state: 'steamed' },
      ];
    }
  } else if (shotNum === 2) {
    // Service rush: many orders, high pressure
    state.screen = 'play';
    state.currentShift = 4;
    state.shiftTimer = 50;
    state.shiftDuration = 60;
    state.score = 1200;
    state.combo = 3;
    state.shiftPassed = false;

    state.orders = [];
    for (let i = 0; i < 4; i++) {
      const r = RECIPES[(i + 2) % RECIPES.length];
      state.orders.push({
        id: `rush_${i}`,
        recipe: r,
        patience: 8 + i * 5,
        maxPatience: 20 + i * 5,
        served: false,
        failed: false,
        partial: false,
      });
    }

    state.player.x = 640;
    state.player.y = 280;
    state.player.carrying = { ing: 'egg', state: 'fried', stepIdx: 0, recipeId: null };
    state.player.carryCount = 1;

    // Steam rising from steamer
    state.time = 5;
  } else if (shotNum === 3) {
    // Chopping/plating close moment with effects
    state.screen = 'play';
    state.currentShift = 2;
    state.shiftTimer = 20;
    state.shiftDuration = 60;
    state.score = 580;
    state.combo = 1;

    state.orders = [
      {
        id: 'chop_focus',
        recipe: RECIPES[3], // Veggie Mix
        patience: 15,
        maxPatience: 25,
        served: false, failed: false, partial: false,
      },
      {
        id: 'normal_1',
        recipe: RECIPES[0],
        patience: 22,
        maxPatience: 35,
        served: false, failed: false, partial: false,
      },
    ];

    state.player.x = 300;
    state.player.y = 260;
    state.player.carrying = null;
    state.player.carryCount = 0;

    // Chopping board has cabbage mid-chop
    const chop = state.stations.find(s => s.id === 'chop_board');
    if (chop) {
      chop.contents = { ing: 'cabbage', state: 'chopped' };
      chop.progress = 0.7;
    }

    // Plate has partial assembly
    const plate = state.stations.find(s => s.id === 'plate_counter');
    if (plate) {
      plate.contents = [{ ing: 'cabbage', state: 'chopped' }];
    }

    // Steam from steamer
    state.time = 3.5;

    // Particles at chop board
    state.particles.emitChop(300, 240);
    state.particles.emitSteam(480, 270);
  } else if (shotNum === 4) {
    // Shift result
    state.screen = 'shiftResult';
    state.currentShift = 2;
    state.shiftTimer = 0;
    state.shiftDuration = 60;
    state.score = 870;
    state.shiftScore = 340;
    state.shiftPassed = true;
    state.currentShift = 2;

    state.orders = [];
    state.player.x = 640;
    state.player.y = 280;
    state.player.carrying = null;
  }
}

export function renderShot(state, shotNum) {
  setupShot(state, shotNum);
}
