// orders.js - deterministic order generation, patience, exact recipe matching and scoring.
import { RECIPES } from './recipes.js';
import { matchesRecipe } from './assembly.js';
import { makeRng, pick } from './rng.js';
import * as Audio from './audio.js';

export class OrderManager {
  constructor(seed = 9999) {
    this.rng = makeRng(seed);
    this.orders = [];
    this.maxOrders = 4;
    this.basePatience = 40;
    this.generated = 0;
    this.nextId = 0;
    this.servedCount = 0;
    this.failedCount = 0;
    this.spawnTimer = 2.5;
  }

  generateOrder(shift) {
    // The menu widens as the night goes on: 4 recipes in shift 1, all 8 by shift 5.
    const difficulty = Math.min(RECIPES.length, 3 + shift);
    return pick(RECIPES.slice(0, difficulty), this.rng);
  }

  spawnOne(shift) {
    const recipe = this.generateOrder(shift);
    const patience = Math.max(14, this.basePatience - shift * 2);
    this.orders.push({
      id: 'order_' + this.nextId++,
      recipe,
      patience,
      maxPatience: patience,
      served: false,
      failed: false,
    });
    this.generated++;
    Audio.playOrder();
  }

  spawnOrders(shift) {
    while (this.orders.length < this.maxOrders) this.spawnOne(shift);
  }

  // Returns the orders that failed this tick so the game can react (combo, stats).
  update(dt, shift) {
    const failedNow = [];
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      if (this.orders.length < this.maxOrders) this.spawnOne(shift);
      this.spawnTimer = Math.max(2.2, 6 - shift * 0.6);
    }
    for (const o of this.orders) {
      if (o.served || o.failed) continue;
      o.patience -= dt;
      if (o.patience <= 0) {
        o.patience = 0;
        o.failed = true;
        this.failedCount++;
        failedNow.push(o);
        Audio.playTrash();
      }
    }
    this.orders = this.orders.filter((o) => !o.failed || o.patience > -4);
    return failedNow;
  }

  // Exact multiset match only: a half-built plate is never accepted.
  matchRecipe(recipe, plate) {
    return matchesRecipe(recipe.steps, plate);
  }

  checkServe(plateContents) {
    for (const o of this.orders) {
      if (o.served || o.failed) continue;
      if (this.matchRecipe(o.recipe, plateContents)) {
        o.served = true;
        this.servedCount++;
        return { order: o, points: o.recipe.points, perfect: true };
      }
    }
    return null;
  }

  getActiveOrders() {
    return this.orders.filter((o) => !o.served && !o.failed);
  }

  reset() {
    this.orders = [];
    this.servedCount = 0;
    this.failedCount = 0;
    this.nextId = 0;
    this.spawnTimer = 2.5;
  }
}