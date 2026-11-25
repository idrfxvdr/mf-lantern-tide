// layout.js - THE one layout table shared by drawing and game logic.
// Every station's position, size, label and hit area comes from here.

export const W = 1280;
export const H = 800;

// Piers: left holds crates + chop + trash, right holds pan + steamer + plate + serve.
export const PIER = {
  left:  { x: 40,  y: 150, w: 480, h: 550 },
  right: { x: 760, y: 150, w: 480, h: 550 },
};

// Water channel between the piers, with the bridge as its centre.
export const CHANNEL = { x1: 520, x2: 760, waterY: 430, bridgeY: 470 };

// HUD bands (nothing else may be drawn here).
export const HUD = {
  ticketY: 4, ticketH: 92,
  leftTickets:  { x: 12, w: 244, gap: 8, count: 2 },
  rightTickets: { x: 780, w: 244, gap: 8, count: 2 },
  clock: { x: 640, y: 54, r: 46 },
  score: { x: 16, y: 706, w: 250, h: 82 },
  tide:  { x: 1014, y: 706, w: 250, h: 82 },
  held:  { x: 282, y: 706, w: 150, h: 82 },
  help:  { x: 448, y: 706, w: 550, h: 82 },
};

// Ingredient crates: 4 columns x 2 rows on the left pier, labels directly under each crate.
const CRATE_COLS = [100, 220, 340, 460];
const CRATE_ROWS = [250, 400];

export const CRATES = [
  { ing: 'rice',     col: 0, row: 0 },
  { ing: 'fish',     col: 1, row: 0 },
  { ing: 'shrimp',   col: 2, row: 0 },
  { ing: 'cabbage',  col: 3, row: 0 },
  { ing: 'tofu',     col: 0, row: 1 },
  { ing: 'egg',      col: 1, row: 1 },
  { ing: 'mushroom', col: 2, row: 1 },
  { ing: 'nori',     col: 3, row: 1 },
].map((c) => ({
  ing: c.ing,
  x: CRATE_COLS[c.col],
  y: CRATE_ROWS[c.row],
  w: 104,
  h: 92,
  labelY: CRATE_ROWS[c.row] + 62,
}));

// Fixed stations. Left: chop + trash. Right: pan, steamer, plate, serve.
export const STATIONS = [
  { id: 'chop_board',   type: 'chop',    x: 160, y: 610, r: 62, label: 'CHOP' },
  { id: 'trash',        type: 'trash',   x: 460, y: 620, r: 40, label: 'TRASH' },
  { id: 'stove_pan',    type: 'stove',   x: 900, y: 250, r: 58, label: 'PAN' },
  { id: 'steamer_pot',  type: 'steamer', x: 1100, y: 250, r: 54, label: 'STEAM' },
  { id: 'plate_counter',type: 'plate',   x: 900, y: 470, r: 74, label: 'PLATE' },
  { id: 'serve_window', type: 'serve',   x: 1120, y: 500, r: 70, label: 'SERVE' },
];

// Ticket rectangles, in order: two left of the clock, two right.
export const TICKETS = [
  { x: HUD.leftTickets.x, y: HUD.ticketY, w: HUD.leftTickets.w, h: HUD.ticketH },
  { x: HUD.leftTickets.x + HUD.leftTickets.w + HUD.leftTickets.gap, y: HUD.ticketY, w: HUD.leftTickets.w, h: HUD.ticketH },
  { x: HUD.rightTickets.x, y: HUD.ticketY, w: HUD.rightTickets.w, h: HUD.ticketH },
  { x: HUD.rightTickets.x + HUD.rightTickets.w + HUD.rightTickets.gap, y: HUD.ticketY, w: HUD.rightTickets.w, h: HUD.ticketH },
];

// Where the chef stands for each station (beside it, never on it).
export const STAND = {
  chop_board:    { x: 160, y: 690 },
  trash:         { x: 460, y: 700 },
  stove_pan:     { x: 900, y: 340 },
  steamer_pot:   { x: 1100, y: 340 },
  plate_counter: { x: 900, y: 570 },
  serve_window:  { x: 1120, y: 600 },
};

export function crateAt(mx, my) {
  for (const c of CRATES) {
    if (Math.abs(mx - c.x) <= c.w / 2 + 6 && Math.abs(my - c.y) <= c.h / 2 + 6) return c;
  }
  return null;
}

export function stationAt(mx, my) {
  for (const s of STATIONS) {
    if (Math.hypot(mx - s.x, my - s.y) <= s.r + 10) return s;
  }
  return null;
}