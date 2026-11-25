// tide.js - the tide clock. It rises and falls on a fixed period and decides which
// crossing between the two piers is open:
//   high tide -> the wide drifting bridge at CHANNEL.bridgeY
//   low tide  -> the narrow plank at CHANNEL.plankY
//   mid tide  -> no crossing, so the cook must plan the route and wait.
import { CHANNEL } from './layout.js';

export const TIDE_PERIOD = 40;          // seconds for a full rise-and-fall
export const HIGH_TIDE_THRESHOLD = 0.62;
export const LOW_TIDE_THRESHOLD = 0.38;

export class Tide {
  constructor(seed = 12345) {
    this.seed = seed;
    this.time = 0;
    this.phase = 0.5;
    this.update(0);
  }

  update(dt) {
    this.time += dt;
    // Deterministic: a pure sine of elapsed time, no random.
    this.phase = (Math.sin((this.time / TIDE_PERIOD) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
  }

  setTime(t) {
    this.time = t;
    this.update(0);
  }

  get level() { return this.phase; }
  get isHighTide() { return this.phase > HIGH_TIDE_THRESHOLD; }
  get isLowTide() { return this.phase < LOW_TIDE_THRESHOLD; }
  get isMidTide() { return !this.isHighTide && !this.isLowTide; }

  // The crossing the cook may use right now, or null when the tide is mid.
  get crossing() {
    if (this.isHighTide) return { open: true, kind: 'bridge', y: CHANNEL.bridgeY };
    if (this.isLowTide) return { open: true, kind: 'plank', y: CHANNEL.plankY };
    return { open: false, kind: 'none', y: CHANNEL.bridgeY };
  }

  get routeConnected() { return this.crossing.open; }
  get bridgeDrifting() { return this.isHighTide; }
  get plankAvailable() { return this.isLowTide; }
  get visualHeight() { return this.phase; }
}