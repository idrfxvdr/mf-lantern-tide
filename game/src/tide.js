// Tide mechanic: rises and falls, determines bridge/plank availability
// At high tide: left pier connects to right via drifting bridge
// At low tide: narrow plank connects both piers

export const TIDE_PERIOD = 45; // seconds for full cycle
export const HIGH_TIDE_THRESHOLD = 0.6; // 0-1, above this is high tide
export const LOW_TIDE_THRESHOLD = 0.4;  // below this is low tide

export class Tide {
  constructor(seed = 12345) {
    this.seed = seed;
    this.phase = 0; // 0 to 1
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
    // Deterministic wave using sine of time
    this.phase = (Math.sin(this.time * (2 * Math.PI / TIDE_PERIOD)) + 1) / 2;
  }

  get level() {
    return this.phase;
  }

  get isHighTide() {
    return this.phase > HIGH_TIDE_THRESHOLD;
  }

  get isLowTide() {
    return this.phase < LOW_TIDE_THRESHOLD;
  }

  // Which route connects left and right
  get routeConnected() {
    // Bridge always connects (the plank path changes)
    return true;
  }

  // Plank available only at low tide
  get plankAvailable() {
    return this.isLowTide;
  }

  // Bridge drifts at high tide
  get bridgeDrifting() {
    return this.isHighTide;
  }

  // Visual height 0-1 for rendering
  get visualHeight() {
    return this.phase;
  }
}
