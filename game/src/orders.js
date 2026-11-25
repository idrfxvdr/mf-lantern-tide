// Order system: generate orders, track patience, scoring
import { RECIPES, RECIPE_MAP } from './recipes.js';
import { makeRng, pick, shuffle } from './rng.js';
import * as Audio from './audio.js';

export class OrderManager {
  constructor(seed = 9999) {
    this.rng = makeRng(seed);
    this.orders = [];
    this.maxOrders = 4;
    this.basePatience = 40; // seconds
    this.generated = 0;
  }

  generateOrder(shift) {
    // More complex recipes as shifts progress
    const difficulty = Math.min(RECIPES.length, 4 + shift);
    const pool = RECIPES.slice(0, difficulty);
    return pick(pool, this.rng);
  }

  spawnOrders(shift) {
    while (this.orders.length < this.maxOrders) {
      const recipe = this.generateOrder(shift);
      this.orders.push({
        id: `order_${Date.now()}_${Math.random()}`,
        recipe,
        patience: this.basePatience - shift * 3,
        maxPatience: this.basePatience - shift * 3,
        served: false,
        failed: false,
        partial: false,
      });
      this.generated++;
      Audio.playOrder();
    }
  }

  update(dt, shift) {
    // Spawn more orders if needed
    if (this.orders.length < this.maxOrders && this.rng() > 0.7) {
      this.spawnOrders(shift);
    }

    for (const o of this.orders) {
      if (!o.served && !o.failed) {
        o.patience -= dt;
        if (o.patience <= 0) {
          o.failed = true;
        }
      }
    }

    // Remove old orders
    this.orders = this.orders.filter(o => !o.failed || o.patience > -5);
  }

  checkServe(plateContents) {
    for (const o of this.orders) {
      if (o.served || o.failed) continue;
      const match = this.matchRecipe(o.recipe, plateContents);
      if (match) {
        o.served = true;
        return { order: o, points: o.recipe.points, perfect: match === 'perfect' };
      }
    }
    return null;
  }

  matchRecipe(recipe, plate) {
    if (!plate || plate.length === 0) return false;
    const steps = recipe.steps;
    // Check if plate has all required steps in any order
    const plateSig = plate.map(p => `${p.ing}:${p.state}`).sort().join('|');
    const reqSig = steps.map(s => `${s.ing}:${s.state}`).sort().join('|');
    if (plateSig === reqSig) return 'perfect';
    // Partial match: has at least half the ingredients correct
    let matchCount = 0;
    for (const step of steps) {
      if (plate.some(p => p.ing === step.ing && p.state === step.state)) {
        matchCount++;
      }
    }
    if (matchCount >= Math.ceil(steps.length / 2)) return 'partial';
    return false;
  }

  getActiveOrders() {
    return this.orders.filter(o => !o.served && !o.failed);
  }

  reset() {
    this.orders = [];
  }
}
