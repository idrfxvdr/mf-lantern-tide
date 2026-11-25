// layout.js - THE one layout table shared by drawing, game logic and overlap.mjs.
// Every station's position, size, label and hit area comes from here, and every
// HUD panel and text box is declared here so overlap.mjs can prove they never collide.

export const W = 1280;
export const H = 800;

// Piers: left holds crates + chop + trash, right holds pan + steamer + plate + serve.
export const PIER = {
  left:  { x: 40,  y: 150, w: 480, h: 550 },
  right: { x: 760, y: 150, w: 480, h: 550 },
};

// Water channel between the piers. The tide decides which crossing is open:
// high tide = wide drifting bridge at bridgeY, low tide = narrow plank at plankY.
export const CHANNEL = { x1: 520, x2: 760, waterY: 400, bridgeY: 468, plankY: 566 };

// HUD bands (nothing else may be drawn here).
export const HUD = {
  ticketY: 4, ticketH: 100,
  leftTickets:  { x: 12,  w: 250, gap: 8, count: 2 },
  rightTickets: { x: 760, w: 250, gap: 8, count: 2 },
  clock: { x: 640, y: 56, r: 52 },
  score: { x: 12,   y: 706, w: 230, h: 82 },
  held:  { x: 250,  y: 706, w: 150, h: 82 },
  help:  { x: 408,  y: 706, w: 470, h: 82 },
  tide:  { x: 886,  y: 706, w: 230, h: 82 },
  mute:  { x: 1124, y: 706, w: 144, h: 82 },
};

// Text metrics used by both the renderer and the overlap checker.
export const FONT = {
  label: 18,      // station labels
  crate: 17,      // crate labels
  ticketName: 18,
  small: 16,      // never draw text below this
};

// Ingredient crates: 4 columns x 2 rows on the left pier, labels directly under each crate.
const CRATE_COLS = [100, 220, 340, 460];
const CRATE_ROWS = [218, 352];

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
  h: 82,
  labelY: CRATE_ROWS[c.row] + 48,
}));

// Fixed stations. Left: chop + trash. Right: pan, steamer, plate, serve.
export const STATIONS = [
  { id: 'chop_board',    type: 'chop',    x: 150, y: 520, r: 56, label: 'CHOP' },
  { id: 'trash',         type: 'trash',   x: 452, y: 528, r: 38, label: 'TRASH' },
  { id: 'stove_pan',     type: 'stove',   x: 900, y: 250, r: 58, label: 'PAN' },
  { id: 'steamer_pot',   type: 'steamer', x: 1100, y: 250, r: 54, label: 'STEAM' },
  { id: 'plate_counter', type: 'plate',   x: 880, y: 470, r: 72, label: 'PLATE' },
  { id: 'serve_window',  type: 'serve',   x: 1120, y: 500, r: 66, label: 'SERVE' },
];

// Where the chef stands for each station (beside it, never on it or its label).
export const STAND = {
  chop_board:    { x: 85,   y: 560 },
  trash:         { x: 390,  y: 600 },
  stove_pan:     { x: 830,  y: 300 },
  steamer_pot:   { x: 1020, y: 300 },
  plate_counter: { x: 790,  y: 555 },
  serve_window:  { x: 1050, y: 545 },
};

// Where the chef stands to take from each crate: directly in front, in the aisle.
export const CRATE_STAND = {
  rice:     { x: 100, y: 274 },
  fish:     { x: 220, y: 274 },
  shrimp:   { x: 340, y: 274 },
  cabbage:  { x: 460, y: 274 },
  tofu:     { x: 100, y: 408 },
  egg:      { x: 220, y: 408 },
  mushroom: { x: 340, y: 408 },
  nori:     { x: 460, y: 408 },
};

// Ticket rectangles, in order: two left of the clock, two right.
export const TICKETS = [
  { x: HUD.leftTickets.x, y: HUD.ticketY, w: HUD.leftTickets.w, h: HUD.ticketH },
  { x: HUD.leftTickets.x + HUD.leftTickets.w + HUD.leftTickets.gap, y: HUD.ticketY, w: HUD.leftTickets.w, h: HUD.ticketH },
  { x: HUD.rightTickets.x, y: HUD.ticketY, w: HUD.rightTickets.w, h: HUD.ticketH },
  { x: HUD.rightTickets.x + HUD.rightTickets.w + HUD.rightTickets.gap, y: HUD.ticketY, w: HUD.rightTickets.w, h: HUD.ticketH },
];

// Ticket internal layout, relative to each ticket's top-left. Shared by the
// renderer and the overlap checker so the name, dish, icons, bar and price never collide.
export const TICKET_INNER = {
  name:  { x: 10, y: 6,  w: 230, h: 24 },
  dish:  { cx: 42, cy: 54, rx: 34, ry: 15 },
  icons: { x: 92, y: 48, step: 46, size: 28, stateY: 62 },
  bar:   { x: 10, y: 82, w: 150, h: 9 },
  price: { x: 180, y: 80, w: 60, h: 16 },
};

// ---- box helpers (used by draw code and overlap.mjs) ----

export function crateBox(c) {
  return { x: c.x - c.w / 2, y: c.y - c.h / 2, w: c.w, h: c.h };
}

export function crateLabelBox(c, name) {
  const w = String(name).length * (FONT.crate * 0.62);
  return { x: c.x - w / 2, y: c.labelY, w, h: FONT.crate + 4 };
}

export function stationLabelBox(s) {
  const w = String(s.label).length * (FONT.label * 0.62);
  return { x: s.x - w / 2, y: s.y + s.r + 20, w, h: FONT.label + 4 };
}

export function clockBox() {
  const c = HUD.clock;
  return { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 };
}

export function clockLabelBox() {
  const c = HUD.clock;
  const w = 96;
  return { x: c.x - w / 2, y: c.y + c.r + 10, w, h: FONT.label + 4 };
}

export function ticketInnerBoxes(t) {
  const I = TICKET_INNER;
  return {
    name: { x: t.x + I.name.x, y: t.y + I.name.y, w: I.name.w, h: I.name.h },
    dish: { x: t.x + I.dish.cx - I.dish.rx, y: t.y + I.dish.cy - I.dish.ry, w: I.dish.rx * 2, h: I.dish.ry * 2 },
    bar: { x: t.x + I.bar.x, y: t.y + I.bar.y, w: I.bar.w, h: I.bar.h },
    price: { x: t.x + I.price.x, y: t.y + I.price.y, w: I.price.w, h: I.price.h },
  };
}

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