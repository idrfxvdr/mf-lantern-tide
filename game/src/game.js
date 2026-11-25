// game.js - the simulation: state, shifts, orders, serving, scoring and the tide route.
import { makeRng } from './rng.js';
import { RECIPES } from './recipes.js';
import { createStations, interactWithStation, nearestStation, stationUnder, standPoint, crateStandPoint, updateStations, ST } from './stations.js';
import { Tide } from './tide.js';
import { Player } from './player.js';
import { OrderManager } from './orders.js';
import { Particles } from './particles.js';
import { planPath, clampStep } from './pathing.js';
import { W, H } from './layout.js';
import * as Audio from './audio.js';

export const SHIFTS = 5;

export function newGame(seed = 9999) {
  return {
    screen: 'title',
    currentShift: 1,
    shiftTimer: 0,
    shiftDuration: 62,
    shiftTarget: 3,
    score: 0,
    shiftScore: 0,
    combo: 0,
    bestCombo: 1,
    comboTimer: 0,
    shiftPassed: false,
    servedThisShift: 0,
    failedThisShift: 0,
    tips: 0,
    orders: [],
    stations: createStations(),
    player: new Player(790, 620),
    tide: new Tide(42),
    orderManager: new OrderManager(seed),
    particles: new Particles(makeRng(seed + 11)),
    fxRng: makeRng(seed + 23),
    time: 0,
    bgRng: makeRng(42),
    hoverStation: null,
    pendingStation: null,
    toast: '',
    toastTimer: 0,
    steamAcc: 0,
    seed,
  };
}

export function startShift(g, shift) {
  g.screen = 'play';
  g.currentShift = shift;
  g.shiftTimer = 0;
  g.shiftDuration = Math.max(34, 62 - (shift - 1) * 6);
  g.shiftTarget = 2 + shift;
  g.shiftScore = 0;
  g.shiftPassed = false;
  g.servedThisShift = 0;
  g.failedThisShift = 0;
  g.tips = 0;
  g.combo = 0;
  g.comboTimer = 0;
  g.bestCombo = 1;
  g.orderManager = new OrderManager(g.seed + shift * 137 + 7);
  g.orderManager.basePatience = Math.max(24, 44 - shift * 3);
  g.orderManager.spawnOrders(shift);
  g.orders = g.orderManager.orders;
  g.particles = new Particles(makeRng(g.seed + shift * 31));
  g.player = new Player(790, 620);
  g.tide = new Tide(g.seed + shift * 42);
  g.tide.setTime(shift * 3.7);
  g.time = 0;
  g.pendingStation = null;
  g.toast = '';
  g.toastTimer = 0;
  g.steamAcc = 0;
  for (const s of g.stations) {
    s.contents = s.type === ST.PLATE ? [] : null;
    s.progress = 0;
    s.burnTimer = 0;
    s.burning = false;
  }
}

export function useStation(g, station) {
  interactWithStation(station, g.player);
  if (station.type === ST.SERVE) serve(g);
}

export function interact(g) {
  const s = nearestStation(g.player, g.stations);
  if (s) useStation(g, s);
}

function toast(g, text, seconds = 2.2) {
  g.toast = text;
  g.toastTimer = seconds;
}

// Click a station: plan a tide-aware route, then use it on arrival.
export function clickAt(g, mx, my) {
  const s = stationUnder(mx, my, g.stations);
  if (!s) return false;
  g.hoverStation = s;
  const target = s.type === ST.CRATE ? crateStandPoint(s.ingredient) : standPoint(s.id);
  if (Math.hypot(g.player.x - target.x, g.player.y - target.y) < 100 && !g.player.isMoving()) {
    useStation(g, s);
    return true;
  }
  const path = planPath(g.player, target, g.tide);
  if (!path) {
    toast(g, 'Mid tide: wait for the bridge or the plank');
    Audio.playDrop();
    return false;
  }
  g.pendingStation = s;
  g.player.setPath(path);
  return true;
}

export function move(g, dx, dy) {
  const p = g.player;
  p.stop();
  const next = clampStep(p, p.x + dx, p.y + dy, g.tide);
  p.x = next.x;
  p.y = next.y;
  if (dx) p.facing = dx > 0 ? 1 : -1;
}

// Serve whatever is on the plating counter. Returns the matched result or null.
export function serve(g) {
  const plate = g.stations.find((s) => s.id === 'plate_counter');
  const hatch = g.stations.find((s) => s.id === 'serve_window');
  if (!plate || !hatch || !plate.contents.length) return null;
  const contents = plate.contents.slice();
  const result = g.orderManager.checkServe(contents);
  hatch.contents = contents;
  plate.contents = [];
  if (!result) {
    g.combo = 0;
    Audio.playTrash();
    g.particles.emitSmoke(hatch.x, hatch.y - 20);
    return null;
  }
  const order = result.order;
  const frac = Math.max(0, order.patience / order.maxPatience);
  const tip = Math.round(result.points * 0.5 * frac);
  const mult = 1 + Math.max(0, g.combo) * 0.1;
  const pts = Math.round((result.points + 10) * mult) + tip;
  g.shiftScore += pts;
  g.score += pts;
  g.tips += tip;
  g.servedThisShift += 1;
  g.combo += 1;
  g.comboTimer = 6;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  Audio.playServe();
  g.particles.emitServe(hatch.x, hatch.y - 20);
  if (g.combo > 1) {
    g.particles.emitCombo(hatch.x, hatch.y - 40, g.combo);
    Audio.playCombo(g.combo);
  }
  g.orders = g.orders.filter((o) => o.id !== order.id);
  g.orderManager.orders = g.orderManager.orders.filter((o) => o.id !== order.id);
  return result;
}

export function updateGame(g, dt) {
  g.time += dt;
  g.tide.update(dt);
  if (g.toastTimer > 0) {
    g.toastTimer -= dt;
    if (g.toastTimer <= 0) g.toast = '';
  }
  if (g.screen !== 'play') {
    if (g.particles) g.particles.update(dt);
    return;
  }

  g.player.update(dt);
  if (g.pendingStation && !g.player.isMoving()) {
    const s = g.pendingStation;
    g.pendingStation = null;
    useStation(g, s);
  }
  g.hoverStation = nearestStation(g.player, g.stations);

  updateStations(g.stations, dt);
  const failedNow = g.orderManager.update(dt, g.currentShift);
  for (const o of failedNow) {
    g.failedThisShift += 1;
    g.combo = 0;
    g.particles.emitSmoke(640, 250);
  }
  g.orders = g.orderManager.orders.filter((o) => !o.served);

  g.shiftTimer += dt;
  if (g.shiftTimer >= g.shiftDuration) {
    g.shiftPassed = g.servedThisShift >= g.shiftTarget;
    g.screen = 'shiftResult';
    if (!g.shiftPassed && g.currentShift >= SHIFTS) g.screen = 'lose';
    if (g.shiftPassed && g.currentShift >= SHIFTS) g.screen = 'win';
    Audio.playShiftEnd();
    return;
  }

  if (g.comboTimer > 0) {
    g.comboTimer -= dt;
    if (g.comboTimer <= 0) g.combo = Math.max(0, g.combo - 1);
  }
  g.particles.update(dt);

  // Steam over the steamer and pan, on a fixed accumulator so it is frame-rate safe.
  g.steamAcc += dt * 7;
  while (g.steamAcc >= 1) {
    g.steamAcc -= 1;
    const steamer = g.stations.find((s) => s.id === 'steamer_pot');
    if (steamer && steamer.contents) g.particles.emitSteam(steamer.x, steamer.y - 34);
    const pan = g.stations.find((s) => s.id === 'stove_pan');
    if (pan && pan.contents) g.particles.emitSteam(pan.x, pan.y - 20);
  }
  const hatch = g.stations.find((s) => s.id === 'serve_window');
  if (hatch && hatch.contents && hatch.contents.length) g.particles.emitSteam(hatch.x, hatch.y - 30);
}

export function recipePool() {
  return RECIPES;
}