// stations.js - Station definitions for new layout
import { INGREDIENTS, nextState } from './recipes.js';
import * as Audio from './audio.js';

export const ST = {
  CRATE:'crate', CHOP:'chop', STOVE:'stove', STEAMER:'steamer',
  PLATE:'plate', SERVE:'serve', TRASH:'trash',
};

export function createStations() {
  const stations = [];
  const ingKeys = Object.keys(INGREDIENTS);

  // Left pier: ingredient crates (2 rows × 4 cols)
  // Row 1 at y=190, Row 2 at y=340, cols at x=70,190,310,430
  ingKeys.forEach((key, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    stations.push({
      id: 'crate_' + key,
      type: ST.CRATE,
      x: 70 + col * 120,
      y: 190 + row * 150,
      radius: 36,
      ingredient: key,
      label: INGREDIENTS[key].name,
      color: INGREDIENTS[key].color,
      accent: INGREDIENTS[key].accent,
    });
  });

  // Chopping board (center of left pier middle)
  stations.push({
    id: 'chop_board', type: ST.CHOP,
    x: 250, y: 540, radius: 40,
    label: 'CHOP', contents: null, progress: 0,
    burning: false, burnTimer: 0,
  });

  // Trash (bottom left)
  stations.push({
    id: 'trash', type: ST.TRASH,
    x: 80, y: 680, radius: 28, label: 'TRASH',
  });

  // Stove/wok (bottom right of left pier)
  stations.push({
    id: 'stove_pan', type: ST.STOVE,
    x: 430, y: 640, radius: 44,
    label: 'PAN', contents: null, progress: 0,
    burning: false, burnTimer: 0,
  });

  // Steamer (bottom center of left pier)
  stations.push({
    id: 'steamer_pot', type: ST.STEAMER,
    x: 120, y: 680, radius: 38,
    label: 'STEAM', contents: null, progress: 0,
    burning: false, burnTimer: 0,
  });

  // Plate counter (right pier)
  stations.push({
    id: 'plate_counter', type: ST.PLATE,
    x: 940, y: 560, radius: 44,
    label: 'PLATE', contents: [],
  });

  // Serving window (right pier upper)
  stations.push({
    id: 'serve_window', type: ST.SERVE,
    x: 1140, y: 300, radius: 52,
    label: 'SERVE', contents: null,
  });

  return stations;
}

export function getStationById(stations, id) {
  return stations.find(s => s.id === id);
}

export function interactWithStation(station, player) {
  if (!station) return;
  const T = station.type;

  if (T === ST.CRATE) {
    if (!player.carrying) {
      player.pickup({ ing: station.ingredient, state: 'raw', stepIdx: -1, recipeId: null });
    }
    return;
  }

  if (T === ST.CHOP) {
    if (player.carrying && !station.contents) {
      if (player.carrying.state === 'raw') {
        const item = player.drop();
        item.state = 'chopped';
        station.contents = item;
        station.progress = 0;
        Audio.playChop();
      }
    } else if (!player.carrying && station.contents) {
      player.pickup(station.contents);
      station.contents = null;
    }
    return;
  }

  if (T === ST.STOVE) {
    if (player.carrying && !station.contents) {
      const from = player.carrying.state;
      if (from === 'raw' || from === 'chopped') {
        const item = player.drop();
        item.state = nextState(from);
        station.contents = item;
        station.progress = 0;
        station.burning = false; station.burnTimer = 0;
        Audio.playFry();
      }
    } else if (!player.carrying && station.contents) {
      player.pickup(station.contents);
      station.contents = null;
      station.progress = 0; station.burning = false;
    }
    return;
  }

  if (T === ST.STEAMER) {
    if (player.carrying && !station.contents) {
      const from = player.carrying.state;
      if (from === 'raw' || from === 'chopped') {
        const item = player.drop();
        item.state = 'steamed';
        station.contents = item;
        station.progress = 0;
        station.burning = false; station.burnTimer = 0;
        Audio.playSteam();
      }
    } else if (!player.carrying && station.contents) {
      player.pickup(station.contents);
      station.contents = null;
      station.progress = 0; station.burning = false;
    }
    return;
  }

  if (T === ST.PLATE) {
    if (player.carrying && station.contents.length < 6) {
      station.contents.push({ ...player.carrying });
      player.drop();
    } else if (!player.carrying && station.contents.length > 0) {
      const item = station.contents.pop();
      player.pickup(item);
    }
    return;
  }

  if (T === ST.SERVE) {
    // Handle from main loop
    return;
  }

  if (T === ST.TRASH) {
    if (player.carrying) player.trash();
  }
}

export function updateStations(stations, dt) {
  for (const s of stations) {
    if (s.type === ST.CHOP || s.type === ST.STOVE || s.type === ST.STEAMER) {
      if (s.contents) {
        s.progress = Math.min(1, s.progress + dt / 1.5);
        if (s.progress >= 1) {
          s.burnTimer += dt;
          if (s.burnTimer > 5) {
            s.contents.state = 'burned';
            s.progress = 0; s.burnTimer = 0; s.burning = true;
            Audio.playBurn();
          }
        }
      }
    }
  }
}
