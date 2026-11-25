// player.js - the cook's position, walk-to-target and carried ingredient.
import * as Audio from './audio.js';

export const PLAYER_SPEED = 320;

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walkTo = null;
    this.carrying = null;
    this.facing = 1;
    this.bobTime = 0;
  }

  update(dt) {
    this.bobTime += dt * 9;
    if (!this.walkTo) return;
    const dx = this.walkTo.x - this.x;
    const dy = this.walkTo.y - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 6) {
      this.x = this.walkTo.x;
      this.y = this.walkTo.y;
      this.walkTo = null;
      return;
    }
    const step = Math.min(PLAYER_SPEED * dt, dist);
    this.x += (dx / dist) * step;
    this.y += (dy / dist) * step;
    if (Math.abs(dx) > 2) this.facing = dx > 0 ? 1 : -1;
  }

  goTo(point) {
    this.walkTo = { x: point.x, y: point.y };
  }

  isMoving() {
    return this.walkTo !== null;
  }

  pickup(item) {
    if (this.carrying) return false;
    this.carrying = item;
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

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }
}