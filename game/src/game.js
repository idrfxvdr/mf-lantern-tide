// game.js - the simulation: state, shifts, orders, serving and scoring.
import { makeRng } from './rng.js';
import { RECIPES } from './recipes.js';
import { createStations, interactWithStation, nearestStation, stationUnder, standPoint, updateStations, ST } from './stations.js';
import { Tide } from './tide.js';
import { Player } from './player.js';
import { OrderManager } from './orders.js';
import { Particles } from './particles.js';
import { W, H } from './layout.js';
import * as Audio from './audio.js';

export const SHIFTS = 5;

export function newGame(seed = 9999) {
  return {
    screen: 'title',
    currentShift: 1,
    shiftTimer: 0,
    shiftDuration: 60,
    score: 0,
    shiftScore: 0,
    combo: 0,
    bestCombo: 1,
    comboTimer: 0,
    shiftPassed: false,
    orders: [],
    stations: createStations(),
    player: new Player(160, 690),
    tide: new Tide(42),
    orderManager: new OrderManager(seed),
    particles: new Particles(),
    time: 0,
    bgRng: makeRng(42),
    hoverStation: null,
    pendingStation: null,
  };
}

export function startShift(g, shift) {
  g.screen = 'play';
  g.currentShift = shift;
  g.shiftTimer = 0;
  g.shiftDuration = Math.max(32, 62 - (shift - 1) * 6);
  g.shiftScore = 0;
  g.shiftPassed = false;
  g.combo = 0;
  g.comboTimer = 0;
  g.bestCombo = 1;
  g.orderManager = new OrderManager(shift * 137 + 7);
  g.orderManager.basePatience = Math.max(22, 46 - shift * 4);
  g.orderManager.spawnOrders(shift);
  g.orders = g.orderManager.orders;
  g.particles = new Particles();
  g.player = new Player(160, 690);
  g.tide = new Tide(shift * 42);
  g.time = 0;
  g.pendingStation = null;
  for (const s of g.stations) {
    s.contents = s.type === ST.PLATE ? [] : null;
    s.progress = 0;
    s.burnTimer = 0;
    s.burning = false;
  }
}

function useStation(g, station) {
  interactWithStation(station, g.player);
  if (station.type === ST.SERVE) serve(g);
}

export function interact(g) {
  const s = nearestStation(g.player, g.stations);
  if (s) useStation(g, s);
}

export function clickAt(g, mx, my) {
  const s = stationUnder(mx, my, g.stations);
  if (!s) return;
  g.hoverStation = s;
  g.pendingStation = s;
  g.player.goTo(standPoint(s.id));
}

export function move(g, dx, dy) {
  const p = g.player;
  p.walkTo = null;
  p.x = Math.max(60, Math.min(W - 60, p.x + dx));
  p.y = Math.max(180, Math.min(H - 120, p.y + dy));
  if (dx) p.facing = dx > 0 ? 1 : -1;
}

function serve(g) {
  const plate = g.stations.find((s) => s.id === 'plate_counter');
  const hatch = g.stations.find((s) => s.id === 'serve_window');
  if (!plate || !hatch || !plate.contents.length) return;
  const result = g.orderManager.checkServe(plate.contents);
  hatch.contents = plate.contents.slice();
  plate.contents = [];
  if (!result) {
    g.combo = 0;
    Audio.playTrash();
    return;
  }
  const pts = result.points + (result.perfect ? 10 : 0);
  g.shiftScore += pts;
  g.score += pts;
  g.combo += 1;
  g.comboTimer = 6;
  g.bestCombo = Math.max(g.bestCombo, g.combo);
  Audio.playServe();
  g.particles.emitServe(hatch.x, hatch.y - 20);
  if (g.combo > 1) {
    g.particles.emitCombo(hatch.x, hatch.y - 40, g.combo);
    Audio.playCombo(g.combo);
  }
  g.orders = g.orders.filter((o) => o.id !== result.order.id);
  g.orderManager.orders = g.orders;
}

export function updateGame(g, dt) {
  g.time += dt;
  g.tide.update(dt);
  if (g.screen !== 'play') return;

  g.player.update(dt);
  if (g.pendingStation && !g.player.isMoving()) {
    const s = g.pendingStation;
    g.pendingStation = null;
    if (Math.hypot(g.player.x - s.x, g.player.y - s.y) < s.r + 130) useStation(g, s);
  }
  g.hoverStation = nearestStation(g.player, g.stations);

  updateStations(g.stations, dt);
  g.orderManager.update(dt, g.currentShift);
  g.orders = g.orderManager.orders.filter((o) => o.patience > -6);

  g.shiftTimer += dt;
  if (g.shiftTimer >= g.shiftDuration) {
    g.shiftPassed = g.shiftScore > 0;
    g.screen = 'shiftResult';
    if (g.shiftPassed && g.currentShift >= SHIFTS) g.screen = 'win';
    Audio.playShiftEnd();
    return;
  }

  if (g.comboTimer > 0) {
    g.comboTimer -= dt;
    if (g.comboTimer <= 0) g.combo = Math.max(0, g.combo - 1);
  }
  g.particles.update(dt);

  const steamer = g.stations.find((s) => s.id === 'steamer_pot');
  if (steamer && steamer.contents && Math.random() < dt * 6) {
    g.particles.emitSteam(steamer.x, steamer.y - 30);
  }
}

export function recipePool() {
  return RECIPES;
}