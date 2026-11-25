// Game loop - update and render cycle
import { keys, wasKeyPressed, wasMouseClicked, setupInput } from './input.js';
import { wasKeyPressed as wkp } from './input.js';
import * as Audio from './audio.js';
import { createStations, ST, interactWithStation, updateStations } from './stations.js';
import { Tide } from './tide.js';
import { Player } from './player.js';
import { OrderManager } from './orders.js';
import { Particles } from './particles.js';
import { drawKitchen, C } from './drawKitchen.js';
import { drawHUD, drawTitleScreen, drawPauseScreen, drawShiftResult, drawWinScreen, drawLoseScreen } from './hud.js';
import { autoServe } from './assembly.js';
import { wasKeyPressed } from './input.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.W = 1280;
    this.H = 800;
    canvas.width = this.W;
    canvas.height = this.H;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);

    this.state = this.newGame();
    this.lastTime = 0;
    this.running = false;
    this.shotMode = false;
    this.shotFrame = 0;

    setupInput(canvas);
  }

  newGame() {
    const rng = Math.random;
    return {
      screen: 'title',
      currentShift: 1,
      shiftTimer: 0,
      shiftDuration: 60,
      score: 0,
      shiftScore: 0,
      combo: 0,
      comboTimer: 0,
      shiftPassed: false,
      orders: [],
      stations: createStations(),
      player: new Player(200, 250),
      tide: new Tide(42),
      orderManager: new OrderManager(99),
      particles: new Particles(),
      time: 0,
      bgRng: null,
      hoverStation: null,
    };
  }

  startShift(shift) {
    const s = this.state;
    s.screen = 'play';
    s.currentShift = shift;
    s.shiftTimer = 0;
    s.shiftDuration = 60 - (shift - 1) * 5;
    s.shiftScore = 0;
    s.shiftPassed = false;
    s.orders = [];
    s.orderManager = new OrderManager(shift * 100 + Date.now() % 10000);
    s.orderManager.spawnOrders(shift);
    s.particles = new Particles();
    // Clear station contents
    for (const st of s.stations) {
      if (st.contents) st.contents = null;
      if (st.type === ST.PLATE) st.contents = [];
      st.progress = 0;
      st.burnTimer = 0;
      st.burning = false;
    }
    s.player = new Player(200, 250);
    s.tide = new Tide(shift * 42);
  }

  update(dt) {
    const s = this.state;
    s.time += dt;

    if (s.screen === 'title') {
      s.tide.update(dt);
      return;
    }

    if (s.screen !== 'play') return;

    // Tide
    s.tide.update(dt);

    // Shift timer
    s.shiftTimer += dt;
    if (s.shiftTimer >= s.shiftDuration) {
      // Check if shift passed
      const activeOrders = s.orders.filter(o => !o.served && !o.failed);
      s.shiftPassed = activeOrders.length === 0 || s.shiftScore > 0;
      s.screen = 'shiftResult';
      Audio.playShiftEnd();
      return;
    }

    // Combo timer
    if (s.comboTimer > 0) {
      s.comboTimer -= dt;
      if (s.comboTimer <= 0) s.combo = Math.max(0, s.combo - 1);
    }

    // Tide timer warning
    if (s.tide.isHighTide && Math.floor(s.time * 2) % 2 === 0) {
      if (s.tide.level > 0.92 || s.tide.level < 0.08) {
        // nothing extra
      }
    }

    // Orders
    s.orders = s.orderManager.orders;
    s.orderManager.update(dt, s.currentShift);

    // Player
    const prevX = s.player.x;
    s.player.update(dt);
    this.handleMovement();

    // Hover detection
    s.hoverStation = this.getStationAt(s.mouseX || 0, s.mouseY || 0);

    // Interactions
    if (wasKeyPressed('interact')) {
      this.handleInteract();
    }

    // Stations
    updateStations(s.stations, dt);

    // Particles
    s.particles.update(dt);

    // Auto-serve check
    const serveStation = s.stations.find(st => st.id === 'serve_window');
    if (serveStation) {
      const plate = serveStation.contents;
      if (plate && plate.length > 0) {
        const result = autoServe(serveStation, s.orderManager, this, s.particles);
        if (result) {
          this.onOrderServed(result);
        }
      }
    }

    // Steam particles from steamer
    const steamer = s.stations.find(st => st.id === 'steamer_pot');
    if (steamer && steamer.contents && Math.random() < 0.1) {
      s.particles.emitSteam(steamer.x, steamer.y - 10);
    }
  }

  handleMovement() {
    const s = this.state;
    const p = s.player;
    const spd = 140;

    if (wasKeyPressed('up')) p.y -= 30;
    if (wasKeyPressed('down')) p.y += 30;
    if (wasKeyPressed('left')) { p.x -= 30; p.facing = -1; }
    if (wasKeyPressed('right')) { p.x += 30; p.facing = 1; }

    // Clamp to canvas
    p.x = Math.max(30, Math.min(this.W - 30, p.x));
    p.y = Math.max(140, Math.min(this.H - 30, p.y));

    // Auto-walk to clicked station
    if (this.mouseClicked) {
      const st = this.getStationAt(this.mouseX || 0, this.mouseY || 0);
      if (st) {
        p.walkTo(st);
      }
      this.mouseClicked = false;
    }
  }

  handleInteract() {
    const s = this.state;
    const p = s.player;
    let nearest = null;
    let nearestDist = 60;

    for (const st of s.stations) {
      const dx = st.x - p.x;
      const dy = st.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < nearestDist) {
        nearest = st;
        nearestDist = dist;
      }
    }

    if (nearest) {
      interactWithStation(nearest, p, s.stations);

      // Serve: try to serve plate contents
      if (nearest.id === 'serve_window') {
        const plate = s.stations.find(st => st.id === 'plate_counter');
        if (plate && plate.contents && plate.contents.length > 0) {
          // Copy to serve
          nearest.contents = [...plate.contents];
          const result = s.orderManager.checkServe(plate.contents);
          if (result) {
            plate.contents = [];
            this.onOrderServed(result);
          }
        }
      }
    }
  }

  onOrderServed(result) {
    const s = this.state;
    const pts = result.points;
    s.shiftScore += pts;
    s.score += pts;
    s.combo++;
    s.comboTimer = 5;
    Audio.playServe();
    s.particles.emitServe(s.stations.find(st => st.id === 'serve_window').x, s.stations.find(st => st.id === 'serve_window').y);
    if (s.combo > 1) {
      s.particles.emitCombo(640, 400, s.combo);
      Audio.playCombo(s.combo);
    }
    // Remove served order from list
    s.orders = s.orders.filter(o => o.id !== result.order.id);
  }

  getStationAt(mx, my) {
    for (const st of this.state.stations) {
      const dx = st.x - mx;
      const dy = st.y - my;
      if (Math.sqrt(dx * dx + dy * dy) < st.radius + 15) return st;
    }
    return null;
  }

  handleInput() {
    const s = this.state;
    const k = keys;

    if (wasKeyPressed('pause') || wasKeyPressed('escape')) {
      if (s.screen === 'play') s.screen = 'paused';
      else if (s.screen === 'paused') s.screen = 'play';
    }

    if (wasKeyPressed('interact')) {
      // Enter on title/play result screens
      if (s.screen === 'title') {
        this.startShift(1);
        return;
      }
      if (s.screen === 'paused') {
        s.screen = 'play';
        return;
      }
    }

    // Enter to advance screens
    if (keys['enter'] || wasKeyPressed('interact')) {
      if (s.screen === 'shiftResult') {
        if (s.shiftPassed) {
          if (s.currentShift >= 5) {
            s.screen = 'win';
          } else {
            this.startShift(s.currentShift + 1);
          }
        } else {
          // Retry same shift
          this.startShift(s.currentShift);
        }
      }
      if (s.screen === 'win' || s.screen === 'lose') {
        Object.assign(s, this.newGame());
        s.screen = 'title';
      }
    }

    // WASD/arrows: check movement
    if (s.screen === 'play') {
      if (wasKeyPressed('up')) this.state.player.y -= 30;
      if (wasKeyPressed('down')) this.state.player.y += 30;
      if (wasKeyPressed('left')) { this.state.player.x -= 30; this.state.player.facing = -1; }
      if (wasKeyPressed('right')) { this.state.player.x += 30; this.state.player.facing = 1; }
      // Clamp
      this.state.player.x = Math.max(30, Math.min(this.W - 30, this.state.player.x));
      this.state.player.y = Math.max(140, Math.min(this.H - 30, this.state.player.y));
    }
  }

  render() {
    const ctx = this.ctx;
    const s = this.state;
    const W = this.W, H = this.H;

    ctx.clearRect(0, 0, W, H);
    ctx.save();

    switch (s.screen) {
      case 'title':
        drawTitleScreen(ctx, W, H);
        break;
      case 'play':
      case 'paused':
        drawKitchen(ctx, W, H, s);
        drawHUD(ctx, W, H, s);
        if (s.screen === 'paused') drawPauseScreen(ctx, W, H);
        break;
      case 'shiftResult':
        drawKitchen(ctx, W, H, s);
        drawShiftResult(ctx, W, H, s);
        break;
      case 'win':
        drawWinScreen(ctx, W, H, s);
        break;
      case 'lose':
        drawLoseScreen(ctx, W, H, s);
        break;
    }

    ctx.restore();
  }

  loop(ts) {
    if (!this.running) return;
    const dt = Math.min((ts - this.lastTime) / 1000, 0.05);
    this.lastTime = ts;

    this.handleInput();
    this.update(dt);

    // Mouse tracking for hover
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = (this.mouseX || 0);
    this.mouseY = (this.mouseY || 0);

    this.render();
    requestAnimationFrame((t) => this.loop(t));
  }

  start() {
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  stop() { this.running = false; }
}

export function createGame(canvas) {
  return new Game(canvas);
}
