// overlap.mjs - layout guard. Asserts that no two HUD panels, tickets, the clock,
// crate labels, station labels or ticket sub-boxes from layout.js intersect.
// Run: node overlap.mjs   (exit 0 = clean, 1 = collisions printed)
import {
  HUD, TICKETS, CRATES, STATIONS, TICKET_INNER,
  crateBox, crateLabelBox, stationLabelBox, clockBox, clockLabelBox, ticketInnerBoxes,
} from './game/src/layout.js';
import { INGREDIENTS } from './game/src/recipes.js';

const boxes = [];
const add = (name, b, parent = null) => boxes.push({ name, parent, ...b });

// HUD panels
for (const [k, b] of Object.entries(HUD)) {
  if (k === 'ticketY' || k === 'ticketH' || k === 'leftTickets' || k === 'rightTickets') continue;
  if (b && typeof b.x === 'number' && typeof b.w === 'number') add('HUD.' + k, b);
}

// Tickets and their internal rows
TICKETS.forEach((t, i) => {
  add('ticket' + i, t);
  const inner = ticketInnerBoxes(t);
  add('ticket' + i + '.name', inner.name, 'ticket' + i);
  add('ticket' + i + '.dish', inner.dish, 'ticket' + i);
  add('ticket' + i + '.bar', inner.bar, 'ticket' + i);
  add('ticket' + i + '.price', inner.price, 'ticket' + i);
});

// Clock and its caption
add('clock', clockBox());
add('clock.label', clockLabelBox());

// Crates and their labels
for (const c of CRATES) {
  add('crate.' + c.ing, crateBox(c));
  add('crateLabel.' + c.ing, crateLabelBox(c, INGREDIENTS[c.ing].name));
}

// Station labels
for (const s of STATIONS) add('stationLabel.' + s.id, stationLabelBox(s));

// Pairwise intersection with a 1px tolerance (touching edges is fine).
function overlap(a, b) {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return ox > 1 && oy > 1 ? { ox, oy } : null;
}

const hits = [];
for (let i = 0; i < boxes.length; i++) {
  for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.parent && a.parent === b.name) continue; // inner box is inside its own ticket
    if (b.parent && b.parent === a.name) continue;
    const o = overlap(a, b);
    if (o) hits.push(`${a.name}  ×  ${b.name}  (${o.ox.toFixed(1)}×${o.oy.toFixed(1)}px)`);
  }
}

// Also assert no box escapes the 1280x800 canvas.
const outside = boxes.filter((b) => b.x < -0.5 || b.y < -0.5 || b.x + b.w > 1280.5 || b.y + b.h > 800.5)
  .map((b) => `${b.name} at ${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.w.toFixed(0)}x${b.h.toFixed(0)}`);

if (hits.length || outside.length) {
  console.error('OVERLAP FAIL');
  for (const h of hits) console.error('  collide:', h);
  for (const o of outside) console.error('  outside:', o);
  process.exit(1);
}
console.log(`overlap.mjs: OK - ${boxes.length} boxes, no intersections, all inside 1280x800.`);