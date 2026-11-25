// Cooking stations: ingredient crates, chopping board, stove pan, steamer pot, plating counter, serving window
import { INGREDIENTS, nextState, STATES } from './recipes.js';
import * as Audio from './audio.js';

// Station types
export const ST = {
  CRATE: 'crate',
  CHOP: 'chop',
  STOVE: 'stove',
  STEAMER: 'steamer',
  PLATE: 'plate',
  SERVE: 'serve',
  TRASH: 'trash',
};

// Create all stations for the kitchen layout
// Layout: Left pier has ingredient crates + chop station
// Center has steamer + stove
// Right pier has plating + serving
// Player walks between stations

export function createStations() {
  const stations = [];

  // --- LEFT PIER (ingredient area) ---
  const ingKeys = Object.keys(INGREDIENTS);
  const crateStartX = 80;
  const crateY = 200;
  const crateSpacing = 52;

  ingKeys.forEach((key, i) => {
    stations.push({
      id: `crate_${key}`,
      type: ST.CRATE,
      x: crateStartX + (i % 4) * crateSpacing,
      y: crateY + Math.floor(i / 4) * 52,
      radius: 20,
      ingredient: key,
      label: INGREDIENTS[key].name,
      color: INGREDIENTS[key].color,
    });
  });

  // Chopping board
  stations.push({
    id: 'chop_board',
    type: ST.CHOP,
    x: 300,
    y: 260,
    radius: 28,
    label: 'CHOP',
    contents: null, // item being processed
    progress: 0,
    burning: false,
    burnTimer: 0,
  });

  // Trash bin
  stations.push({
    id: 'trash',
    type: ST.TRASH,
    x: 220,
    y: 320,
    radius: 20,
    label: 'TRASH',
  });

  // --- CENTER (cooking area) ---
  // Stove pan
  stations.push({
    id: 'stove_pan',
    type: ST.STOVE,
    x: 640,
    y: 280,
    radius: 32,
    label: 'PAN',
    contents: null,
    progress: 0,
    burning: false,
    burnTimer: 0,
  });

  // Steamer pot
  stations.push({
    id: 'steamer_pot',
    type: ST.STEAMER,
    x: 480,
    y: 280,
    radius: 30,
    label: 'STEAM',
    contents: null,
    progress: 0,
    burning: false,
    burnTimer: 0,
  });

  // --- RIGHT PIER (assembly area) ---
  // Plating counter
  stations.push({
    id: 'plate_counter',
    type: ST.PLATE,
    x: 900,
    y: 260,
    radius: 30,
    label: 'PLATE',
    contents: [], // assembled steps so far
  });

  // Serving window
  stations.push({
    id: 'serve_window',
    type: ST.SERVE,
    x: 1060,
    y: 280,
    radius: 28,
    label: 'SERVE',
  });

  return stations;
}

export function getStationById(stations, id) {
  return stations.find(s => s.id === id);
}

export function interactWithStation(station, player, stations) {
  if (!station) return;

  switch (station.type) {
    case ST.CRATE: {
      if (!player.carrying) {
        player.pickup({
          ing: station.ingredient,
          state: 'raw',
          stepIdx: -1,
          recipeId: null,
        });
      }
      break;
    }

    case ST.CHOP: {
      if (player.carrying && !station.contents) {
        if (player.carrying.state === 'raw') {
          station.contents = player.drop();
          station.contents.state = 'chopped';
          station.progress = 0;
          Audio.playChop();
        }
      } else if (station.contents && !player.carrying) {
        player.pickup(station.contents);
        station.contents = null;
      }
      break;
    }

    case ST.STOVE: {
      if (player.carrying && !station.contents) {
        const from = player.carrying.state;
        if (from === 'raw' || from === 'chopped') {
          station.contents = player.drop();
          station.contents.state = nextState(from);
          station.progress = 0;
          station.burning = false;
          station.burnTimer = 0;
          Audio.playFry();
        }
      } else if (station.contents && !player.carrying) {
        player.pickup(station.contents);
        station.contents = null;
        station.progress = 0;
        station.burning = false;
      }
      break;
    }

    case ST.STEAMER: {
      if (player.carrying && !station.contents) {
        const from = player.carrying.state;
        if (from === 'raw' || from === 'chopped') {
          station.contents = player.drop();
          station.contents.state = nextState(from);
          if (station.contents.state === 'chopped') station.contents.state = 'steamed';
          station.progress = 0;
          station.burning = false;
          station.burnTimer = 0;
          Audio.playSteam();
        }
      } else if (station.contents && !player.carrying) {
        player.pickup(station.contents);
        station.contents = null;
        station.progress = 0;
        station.burning = false;
      }
      break;
    }

    case ST.PLATE: {
      if (player.carrying && station.contents.length < 5) {
        station.contents.push({ ...player.carrying });
        player.carrying = null;
        Audio.playDrop();
      } else if (!player.carrying && station.contents.length > 0) {
        // Take last item back
        const item = station.contents.pop();
        player.pickup(item);
      }
      break;
    }

    case ST.SERVE: {
      // This is handled in orders.js - collect completed plate
      break;
    }

    case ST.TRASH: {
      if (player.carrying) {
        player.trash();
      }
      break;
    }
  }
}

// Process station timers
export function updateStations(stations, dt) {
  for (const s of stations) {
    if (s.type === ST.CHOP || s.type === ST.STOVE || s.type === ST.STEAMER) {
      if (s.contents) {
        s.progress = Math.min(1, s.progress + dt / 1.5);
        // Auto-burn after sitting too long (4 seconds after done)
        if (s.progress >= 1) {
          s.burnTimer += dt;
          if (s.burnTimer > 4) {
            s.contents.state = 'burned';
            s.progress = 0;
            s.burnTimer = 0;
            s.burning = true;
            Audio.playBurn();
          }
        }
      }
    }
  }
}
