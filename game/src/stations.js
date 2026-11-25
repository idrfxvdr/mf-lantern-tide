// stations.js - station state and interactions, positioned from layout.js.
import { CRATES, STATIONS, STAND, CRATE_STAND, crateAt } from './layout.js';
import { INGREDIENTS } from './recipes.js';
import { addToPlate, removeFromPlate } from './assembly.js';
import * as Audio from './audio.js';

export const ST = {
  CRATE: 'crate', CHOP: 'chop', STOVE: 'stove', STEAMER: 'steamer',
  PLATE: 'plate', SERVE: 'serve', TRASH: 'trash',
};

export const COOK_TIME = 1.6;   // seconds on the pan / in the steamer before it is ready
export const BURN_TIME = 5.0;   // extra seconds before a ready item burns

export function createStations() {
  const list = [];
  for (const c of CRATES) {
    list.push({
      id: 'crate_' + c.ing, type: ST.CRATE, x: c.x, y: c.y, r: 46,
      w: c.w, h: c.h, labelY: c.labelY, ingredient: c.ing,
      label: INGREDIENTS[c.ing].name, color: INGREDIENTS[c.ing].color, accent: INGREDIENTS[c.ing].accent,
    });
  }
  for (const s of STATIONS) {
    list.push({
      id: s.id, type: s.type, x: s.x, y: s.y, r: s.r, label: s.label,
      contents: s.type === 'plate' ? [] : null, progress: 0, burning: false, burnTimer: 0,
    });
  }
  return list;
}

export function standPoint(id) {
  return STAND[id] || { x: 640, y: 660 };
}

export function crateStandPoint(ing) {
  return CRATE_STAND[ing] || { x: 640, y: 660 };
}

export function stationUnder(mx, my, stations) {
  const c = crateAt(mx, my);
  if (c) return stations.find((s) => s.id === 'crate_' + c.ing) || null;
  let best = null;
  let bestD = Infinity;
  for (const s of stations) {
    if (s.type === ST.CRATE) continue;
    const d = Math.hypot(mx - s.x, my - s.y);
    if (d <= s.r + 12 && d < bestD) { best = s; bestD = d; }
  }
  return best;
}

export function nearestStation(player, stations) {
  let best = null;
  let bestD = 130;
  for (const s of stations) {
    const d = Math.hypot(player.x - s.x, player.y - s.y);
    if (d < bestD) { best = s; bestD = d; }
  }
  return best;
}

export function interactWithStation(station, player) {
  if (!station) return;
  switch (station.type) {
    case ST.CRATE:
      if (!player.carrying) player.pickup({ ing: station.ingredient, state: 'raw', stepIdx: -1, recipeId: null });
      break;
    case ST.CHOP:
      if (player.carrying && !station.contents && player.carrying.state === 'raw') {
        const item = player.drop();
        item.state = 'chopped';
        station.contents = item;
        station.progress = 0;
        Audio.playChop();
      } else if (!player.carrying && station.contents) {
        player.pickup(station.contents);
        station.contents = null;
        station.progress = 0;
      }
      break;
    case ST.STOVE:
      if (player.carrying && !station.contents && (player.carrying.state === 'raw' || player.carrying.state === 'chopped')) {
        const item = player.drop();
        item.state = 'fried';
        station.contents = item;
        station.progress = 0;
        station.burning = false;
        station.burnTimer = 0;
        Audio.playFry();
      } else if (!player.carrying && station.contents) {
        player.pickup(station.contents);
        station.contents = null;
        station.progress = 0;
        station.burning = false;
      }
      break;
    case ST.STEAMER:
      if (player.carrying && !station.contents && (player.carrying.state === 'raw' || player.carrying.state === 'chopped')) {
        const item = player.drop();
        item.state = 'steamed';
        station.contents = item;
        station.progress = 0;
        station.burning = false;
        station.burnTimer = 0;
        Audio.playSteam();
      } else if (!player.carrying && station.contents) {
        player.pickup(station.contents);
        station.contents = null;
        station.progress = 0;
        station.burning = false;
      }
      break;
    case ST.PLATE:
      if (player.carrying) {
        if (addToPlate(station.contents, player.carrying)) player.drop();
      } else {
        const item = removeFromPlate(station.contents);
        if (item) player.pickup(item);
      }
      break;
    case ST.TRASH:
      if (player.carrying) player.trash();
      break;
    default:
      break;
  }
}

export function updateStations(stations, dt) {
  for (const s of stations) {
    if (s.type !== ST.STOVE && s.type !== ST.STEAMER) continue;
    if (!s.contents) continue;
    if (s.progress < 1) {
      s.progress = Math.min(1, s.progress + dt / COOK_TIME);
    } else {
      s.burnTimer += dt;
      if (s.burnTimer > BURN_TIME) {
        s.contents.state = 'burned';
        s.progress = 0;
        s.burnTimer = 0;
        s.burning = true;
        Audio.playBurn();
      }
    }
  }
}