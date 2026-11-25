// Lantern Tide - entry point
import { makeRng } from './rng.js';
import { RECIPES } from './recipes.js';
import { ST, createStations, interactWithStation, updateStations } from './stations.js';
import { Tide } from './tide.js';
import { Player } from './player.js';
import { OrderManager } from './orders.js';
import { Particles } from './particles.js';
import { drawKitchen } from './drawKitchen.js';
import { drawHUD, drawTitleScreen, drawPauseScreen, drawShiftResult, drawWinScreen, drawLoseScreen } from './hud.js';
import * as Audio from './audio.js';
import { keys, setupInput, wasKeyPressed, consumeKeys } from './input.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const W = 1280, H = 800;
canvas.width = W; canvas.height = H;
canvas.style.width = W + 'px'; canvas.style.height = H + 'px';

const params = new URLSearchParams(window.location.search);
const shotMode = parseInt(params.get('shot') || '0');

const muteBtn = document.getElementById('muteBtn');
muteBtn.addEventListener('click', () => {
  const m = Audio.isMuted();
  Audio.setMuted(!m);
  muteBtn.textContent = !m ? 'MUTE' : 'SOUND';
});

setupInput(canvas);

function newState(seed) {
  return {
    screen: 'title', currentShift: 1, shiftTimer: 0, shiftDuration: 60,
    score: 0, shiftScore: 0, combo: 0, comboTimer: 0, shiftPassed: false,
    orders: [], stations: createStations(),
    player: new Player(200, 250),
    tide: new Tide(42),
    orderManager: new OrderManager(seed),
    particles: new Particles(),
    time: 0, bgRng: makeRng(42),
    hoverStation: null, mouseX: 0, mouseY: 0,
  };
}

let state = newState(9999);

function setupShot(s, num) {
  s.bgRng = makeRng(42 + num);
  s.time = num * 2;
  if (num === 1) {
    s.screen = 'play'; s.currentShift = 1; s.shiftTimer = 35; s.shiftDuration = 60;
    s.score = 340; s.combo = 2; s.comboTimer = 3;
    s.orders = RECIPES.slice(0, 4).map((r, i) => ({
      id: 's1_' + i, recipe: r, patience: 18 + i * 8, maxPatience: 25 + i * 8, served: false, failed: false,
    }));
    s.player.x = 900; s.player.y = 260;
    s.player.carrying = { ing: 'fish', state: 'chopped', stepIdx: 0, recipeId: null };
    const plate = s.stations.find(st => st.id === 'plate_counter');
    if (plate) plate.contents = [{ ing: 'rice', state: 'steamed' }, { ing: 'fish', state: 'chopped' }];
    const steamer = s.stations.find(st => st.id === 'steamer_pot');
    if (steamer) { steamer.contents = { ing: 'rice', state: 'steamed' }; steamer.progress = 1; }
    const stove = s.stations.find(st => st.id === 'stove_pan');
    if (stove) { stove.contents = { ing: 'shrimp', state: 'fried' }; stove.progress = 0.7; }
    const serve = s.stations.find(st => st.id === 'serve_window');
    if (serve) serve.contents = [{ ing: 'rice', state: 'steamed' }, { ing: 'fish', state: 'chopped' }];
  } else if (num === 2) {
    s.screen = 'play'; s.currentShift = 4; s.shiftTimer = 50; s.shiftDuration = 60;
    s.score = 1200; s.combo = 3; s.comboTimer = 4;
    s.orders = RECIPES.slice(2, 6).map((r, i) => ({
      id: 's2_' + i, recipe: r, patience: 6 + i * 4, maxPatience: 15 + i * 4, served: false, failed: false,
    }));
    s.player.x = 640; s.player.y = 280;
    s.player.carrying = { ing: 'egg', state: 'fried', stepIdx: 0, recipeId: null };
    s.time = 6;
    for (let i = 0; i < 5; i++) s.particles.emitSteam(480, 270);
  } else if (num === 3) {
    s.screen = 'play'; s.currentShift = 2; s.shiftTimer = 20; s.shiftDuration = 60;
    s.score = 580; s.combo = 1;
    s.orders = [
      { id: 's3_0', recipe: RECIPES[3], patience: 12, maxPatience: 20, served: false, failed: false },
      { id: 's3_1', recipe: RECIPES[0], patience: 22, maxPatience: 32, served: false, failed: false },
    ];
    s.player.x = 300; s.player.y = 260; s.player.carrying = null; s.time = 4;
    const chop = s.stations.find(st => st.id === 'chop_board');
    if (chop) { chop.contents = { ing: 'cabbage', state: 'chopped' }; chop.progress = 0.8; }
    const plate2 = s.stations.find(st => st.id === 'plate_counter');
    if (plate2) plate2.contents = [{ ing: 'cabbage', state: 'chopped' }, { ing: 'mushroom', state: 'chopped' }];
    s.particles.emitChop(300, 240); s.particles.emitSteam(480, 270); s.particles.emitSteam(480, 260);
  } else if (num === 4) {
    s.screen = 'shiftResult'; s.currentShift = 2; s.shiftScore = 340;
    s.shiftPassed = true; s.score = 870; s.orders = [];
    s.player.carrying = null;
  }
}

if (shotMode > 0) setupShot(state, shotMode);

function getStationAt(mx, my) {
  for (const st of state.stations) {
    const dx = st.x - mx, dy = st.y - my;
    if (Math.sqrt(dx * dx + dy * dy) < st.radius + 20) return st;
  }
  return null;
}

function handleInteract() {
  const p = state.player;
  let nearest = null, nd = 60;
  for (const st of state.stations) {
    const d = Math.sqrt((st.x - p.x) ** 2 + (st.y - p.y) ** 2);
    if (d < nd) { nearest = st; nd = d; }
  }
  if (!nearest) return;
  interactWithStation(nearest, p, state.stations);
  if (nearest.id === 'serve_window') {
    const plate = state.stations.find(st => st.id === 'plate_counter');
    if (plate && plate.contents && plate.contents.length > 0) {
      const result = state.orderManager.checkServe(plate.contents);
      if (result) {
        nearest.contents = [...plate.contents]; plate.contents = [];
        state.shiftScore += result.points; state.score += result.points;
        state.combo++; state.comboTimer = 5;
        Audio.playServe();
        state.particles.emitServe(nearest.x, nearest.y);
        if (state.combo > 1) { state.particles.emitCombo(640, 400, state.combo); Audio.playCombo(state.combo); }
        state.orders = state.orders.filter(o => o.id !== result.order.id);
      }
    }
  }
}

function startShift(shift) {
  state.screen = 'play'; state.currentShift = shift; state.shiftTimer = 0;
  state.shiftDuration = 60 - (shift - 1) * 5; state.shiftScore = 0;
  state.shiftPassed = false; state.combo = 0; state.comboTimer = 0;
  state.orderManager = new OrderManager(shift * 100 + (Date.now() % 10000));
  state.orderManager.spawnOrders(shift);
  state.orders = state.orderManager.orders;
  state.particles = new Particles();
  state.player = new Player(200, 250);
  state.tide = new Tide(shift * 42); state.time = 0;
  for (const st of state.stations) {
    if (st.contents) st.contents = null;
    if (st.type === ST.PLATE) st.contents = [];
    st.progress = 0; st.burnTimer = 0; st.burning = false;
  }
}

function updateGame(dt) {
  state.time += dt;
  state.tide.update(dt);
  if (state.screen === 'title') return;
  if (state.screen !== 'play') return;

  const p = state.player;
  // WASD movement (instant, one-shot)
  if (wasKeyPressed('up')) p.y = Math.max(140, p.y - 30);
  if (wasKeyPressed('down')) p.y = Math.min(H - 30, p.y + 30);
  if (wasKeyPressed('left')) { p.x = Math.max(30, p.x - 30); p.facing = -1; }
  if (wasKeyPressed('right')) { p.x = Math.min(W - 30, p.x + 30); p.facing = 1; }

  p.update(dt);
  state.hoverStation = getStationAt(state.mouseX, state.mouseY);

  if (wasKeyPressed('interact')) handleInteract();
  if (wasKeyPressed('pause') || wasKeyPressed('escape')) { state.screen = 'paused'; return; }

  updateStations(state.stations, dt);
  state.orderManager.update(dt, state.currentShift);
  state.orders = state.orderManager.orders;
  state.shiftTimer += dt;
  if (state.shiftTimer >= state.shiftDuration) {
    state.shiftPassed = state.orders.filter(o => !o.served && !o.failed).length === 0 || state.shiftScore > 0;
    state.screen = 'shiftResult'; Audio.playShiftEnd();
    return;
  }
  if (state.comboTimer > 0) { state.comboTimer -= dt; if (state.comboTimer <= 0) state.combo = Math.max(0, state.combo - 1); }
  state.particles.update(dt);
  const steamer = state.stations.find(st => st.id === 'steamer_pot');
  if (steamer && steamer.contents && Math.random() < 0.05 * dt * 60) state.particles.emitSteam(steamer.x, steamer.y - 15);
}

function handleScreenInput() {
  // Pause toggle
  if (wasKeyPressed('pause') || wasKeyPressed('escape')) {
    if (state.screen === 'play') { state.screen = 'paused'; return; }
    if (state.screen === 'paused') { state.screen = 'play'; return; }
  }
  // Title: any key or click to start
  if (state.screen === 'title' && (wasKeyPressed('interact') || wasKeyPressed('enter'))) {
    startShift(1); return;
  }
  // Paused: resume
  if (state.screen === 'paused' && (wasKeyPressed('interact') || wasKeyPressed('enter'))) {
    state.screen = 'play'; return;
  }
  // Shift result / win / lose: advance
  if (state.screen === 'shiftResult') {
    if (wasKeyPressed('interact') || wasKeyPressed('enter')) {
      if (state.shiftPassed) startShift(Math.min(5, state.currentShift + 1));
      else startShift(state.currentShift);
    }
    return;
  }
  if (state.screen === 'win' || state.screen === 'lose') {
    if (wasKeyPressed('interact') || wasKeyPressed('enter')) {
      state = newState(9999); state.screen = 'title';
    }
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);
  switch (state.screen) {
    case 'title': drawTitleScreen(ctx, W, H); break;
    case 'play': case 'paused':
      drawKitchen(ctx, W, H, state); drawHUD(ctx, W, H, state);
      if (state.screen === 'paused') drawPauseScreen(ctx, W, H); break;
    case 'shiftResult': drawKitchen(ctx, W, H, state); drawShiftResult(ctx, W, H, state); break;
    case 'win': drawWinScreen(ctx, W, H, state); break;
    case 'lose': drawLoseScreen(ctx, W, H, state); break;
  }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (W / rect.width);
  const my = (e.clientY - rect.top) * (H / rect.height);
  if (state.screen === 'title') { startShift(1); return; }
  if (state.screen === 'shiftResult' || state.screen === 'win' || state.screen === 'lose') {
    if (state.screen === 'shiftResult') startShift(state.shiftPassed ? Math.min(5, state.currentShift + 1) : state.currentShift);
    else { state = newState(9999); state.screen = 'title'; }
    return;
  }
  if (state.screen !== 'play') return;
  const st = getStationAt(mx, my);
  if (st) state.player.walkTo(st);
});

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  state.mouseX = (e.clientX - rect.left) * (W / rect.width);
  state.mouseY = (e.clientY - rect.top) * (H / rect.height);
});

let lastTime = 0;
function loop(ts) {
  const dt = Math.min((ts - lastTime) / 1000, 0.05);
  lastTime = ts;
  handleScreenInput();
  updateGame(dt);
  render();
  consumeKeys();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
