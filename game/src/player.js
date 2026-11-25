// Player: position, movement, carrying state
import * as Audio from './audio.js';

export const PLAYER_SPEED = 140; // pixels per second

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.carrying = null; // { ing, state, stepIdx, recipeId }
    this.carryCount = 0;
    this.walkToStation = null;
    this.bobOffset = 0;
    this.bobTime = 0;
    this.facing = 1; // 1=right, -1=left
  }

  update(dt) {
    this.bobTime += dt * 8;
    this.bobOffset = Math.sin(this.bobTime) * 2;

    if (this.walkToStation) {
      const dx = this.walkToStation.x - this.x;
      const dy = this.walkToStation.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 5) {
        this.x = this.walkToStation.x;
        this.y = this.walkToStation.y;
        this.walkToStation = null;
      } else {
        const spd = PLAYER_SPEED * dt;
        this.x += (dx / dist) * Math.min(spd, dist);
        this.y += (dy / dist) * Math.min(spd, dist);
        if (dx !== 0) this.facing = dx > 0 ? 1 : -1;
      }
    }
  }

  walkTo(station) {
    this.walkToStation = station;
  }

  isMoving() {
    return this.walkToStation !== null;
  }

  pickup(item) {
    if (this.carrying) return false;
    this.carrying = item;
    this.carryCount++;
    Audio.playPickup();
    return true;
  }

  drop() {
    const item = this.carrying;
    this.carrying = null;
    if (item) Audio.playDrop();
    return item;
  }

  trash() {
    const item = this.carrying;
    this.carrying = null;
    if (item) Audio.playTrash();
    return item;
  }

  getX() { return this.x; }
  getY() { return this.y + this.bobOffset; }
}
