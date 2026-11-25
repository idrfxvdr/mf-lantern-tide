// pathing.js - route planning across the tide channel and movement clamping.
// The two piers are only joined while the tide is high (drifting bridge) or low
// (narrow plank). At mid tide the channel is impassable, so the cook plans around it.
import { PIER, CHANNEL, W } from './layout.js';

const LEFT_EDGE = PIER.left.x + PIER.left.w;   // 520
const RIGHT_EDGE = PIER.right.x;               // 760
const HALF_BRIDGE = 24;                        // walkable half-width of a crossing

export function sideOf(x) {
  return x < (LEFT_EDGE + RIGHT_EDGE) / 2 ? 'left' : 'right';
}

export function onPier(x, y) {
  const inLeft = x >= PIER.left.x + 8 && x <= LEFT_EDGE - 4 && y >= PIER.left.y + 30 && y <= PIER.left.y + PIER.left.h - 12;
  const inRight = x >= RIGHT_EDGE + 4 && x <= PIER.right.x + PIER.right.w - 8 && y >= PIER.right.y + 30 && y <= PIER.right.y + PIER.right.h - 12;
  return inLeft || inRight;
}

export function onCrossing(x, y, tide) {
  const c = tide.crossing;
  return c.open && x > LEFT_EDGE - 30 && x < RIGHT_EDGE + 30 && Math.abs(y - c.y) <= HALF_BRIDGE;
}

// Full waypoint list from a to b, or null when the tide blocks the crossing.
export function planPath(from, to, tide) {
  if (sideOf(from.x) === sideOf(to.x)) return [{ x: to.x, y: to.y }];
  const c = tide.crossing;
  if (!c.open) return null;
  const y = c.y;
  if (sideOf(from.x) === 'left') {
    return [
      { x: from.x, y },
      { x: LEFT_EDGE - 16, y },
      { x: RIGHT_EDGE + 16, y },
      { x: to.x, y },
      { x: to.x, y: to.y },
    ];
  }
  return [
    { x: from.x, y },
    { x: RIGHT_EDGE + 16, y },
    { x: LEFT_EDGE - 16, y },
    { x: to.x, y },
    { x: to.x, y: to.y },
  ];
}

// Clamp a keyboard step so the cook cannot walk into open water.
export function clampStep(from, nx, ny, tide) {
  nx = Math.max(PIER.left.x + 16, Math.min(W - 40, nx));
  ny = Math.max(PIER.left.y + 40, Math.min(PIER.left.y + PIER.left.h - 16, ny));
  const inChannel = nx > LEFT_EDGE - 6 && nx < RIGHT_EDGE + 6;
  if (inChannel) {
    if (!onCrossing(nx, ny, tide)) {
      // Keep the cook on whichever pier they are already on.
      nx = from.x < (LEFT_EDGE + RIGHT_EDGE) / 2 ? LEFT_EDGE - 18 : RIGHT_EDGE + 18;
    }
  }
  return { x: nx, y: ny };
}