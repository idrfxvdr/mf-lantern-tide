// layout.js - THE one layout table shared by drawing, game logic and overlap.mjs.
// Every station's position, size, label and hit area comes from here, and every
// HUD panel, ticket row and text box is declared here so overlap.mjs can prove
// that nothing drawn on top of anything else.

export const W = 1280;
export const H = 800;

// One rounded sans-serif stack for every piece of canvas text (review: no monospace).
export const FONT_STACK = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

// Piers: left holds crates + chop + trash, right holds pan + steamer + plate + serve.
// Both span y=150..700 so the kitchen fills the frame instead of a thin strip.
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
  { id: 'plate_counter', type: 'plate',   x: 880, y: 470, r: 72, reach: 180, label: 'PLATE' },
  { id: 'serve_window',  type: 'serve',   x: 1120, y: 500, r: 66, label: 'SERVE' },
];

// Where the chef stands for each station (beside it, never on it or its label).
export const STAND = {
  chop_board:    { x: 85,   y: 560 },
  trash:         { x: 390,  y: 600 },
  stove_pan:     { x: 830,  y: 300 },
  steamer_pot:   { x: 1020, y: 300 },
  plate_counter: { x: 790,  y: 600 },
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
  dish:  { cx: 40, cy: 54, rx: 32, ry: 15 },
  icons: { x: 92, y: 50, step: 46, size: 40, stateY: 64 },
  bar:   { x: 10, y: 82, w: 146, h: 9 },
  price: { x: 180, y: 78, w: 60, h: 18 },
};

// Decoration on the lower piers. Declared here so drawProps.js draws from the same
// table overlap.mjs checks against: nothing may sit on a label.
export const PROPS = [
  { kind: 'barrel',  x: 74,   y: 660, s: 30 },
  { kind: 'barrel',  x: 236,  y: 668, s: 26 },
  { kind: 'sack',    x: 330,  y: 660, s: 30 },
  { kind: 'rope',    x: 470,  y: 682, s: 22 },
  { kind: 'barrel',  x: 806,  y: 660, s: 28 },
  { kind: 'sack',    x: 1218, y: 664, s: 28 },
  { kind: 'rope',    x: 1000, y: 684, s: 20 },
  { kind: 'bollard', x: 52,   y: 590 },
  { kind: 'bollard', x: 1228, y: 590 },
  { kind: 'brazier', x: 398,  y: 676 },
  // Dressing for the empty floor: a spice shelf between the crates and CHOP, two
  // hanging utensil racks and a lantern post between the right-pier stations.
  { kind: 'spice_shelf',  x: 300,  y: 442 },
  { kind: 'utensil_rack', x: 1000, y: 208 },
  { kind: 'utensil_rack', x: 1018, y: 360 },
  { kind: 'lantern_post', x: 1002, y: 458 },
];

// Bounding box of a prop, used by overlap.mjs (a brazier is taller than it is wide).
export function propBox(p) {
  if (p.kind === 'bollard') return { x: p.x - 10, y: p.y - 28, w: 20, h: 32 };
  if (p.kind === 'brazier') return { x: p.x - 26, y: p.y - 34, w: 52, h: 50 };
  if (p.kind === 'spice_shelf') return { x: p.x - 75, y: p.y - 17, w: 150, h: 34 };
  if (p.kind === 'utensil_rack') return { x: p.x - 34, y: p.y - 44, w: 68, h: 88 };
  if (p.kind === 'lantern_post') return { x: p.x - 15, y: p.y - 52, w: 30, h: 96 };
  const s = p.s || 26;
  return { x: p.x - s, y: p.y - s, w: s * 2, h: s * 1.6 };
}

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
    icons: { x: t.x + I.icons.x - I.icons.size / 2, y: t.y + I.icons.y - I.icons.size / 2, w: I.icons.step * 2 + I.icons.size, h: I.icons.size + 4 },
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