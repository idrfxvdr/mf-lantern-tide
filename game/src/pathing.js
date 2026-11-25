// Pathing and route planning between stations
// The kitchen has two piers connected by a bridge or plank depending on tide

// Zone layout (x coordinates):
// LEFT ZONE: 0-400 (crates, chop, trash)
// CENTER ZONE: 400-760 (steamer, stove)
// RIGHT ZONE: 760-1200 (plate, serve)

export const ZONES = {
  LEFT: { x1: 0, x2: 400, label: 'Left Pier' },
  CENTER: { x1: 400, x2: 760, label: 'Central Kitchen' },
  RIGHT: { x1: 760, x2: 1200, label: 'Right Pier' },
};

export function getZone(x) {
  if (x < ZONES.LEFT.x2) return 'LEFT';
  if (x < ZONES.CENTER.x2) return 'CENTER';
  return 'RIGHT';
}

// Route is always available (bridge is always traversable)
// but at low tide the plank (direct middle route) is available too
export function canTraverse(fromZone, toZone, tide) {
  // Bridge always connects LEFT-CENTER and CENTER-RIGHT
  if (fromZone !== toZone) return true; // bridge always works
  return true;
}

// Check if a path between two x positions is blocked by tide
export function isPathBlocked(x1, x2, tide) {
  // No blocking in this simple model - bridge/plank just visual
  return false;
}

// Find which stations are reachable from current position
export function reachableStations(player, stations, tide) {
  return stations.filter(s => {
    const dx = s.x - player.x;
    const dy = s.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < 600;
  });
}
