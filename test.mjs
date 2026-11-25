// test.mjs - headless tests (Node, no dependencies).
// Run: node test.mjs
// Part 1 simulates the game: one served order for every recipe, a burnt pan, an
// order failed by patience, a finished shift (pass/win/lose) and the tide rules.
// Part 2 launches headless Chromium against the real page (?test=1) and checks that
// a whole order can be cooked and served with synthetic keyboard input, with no
// console error.
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { newGame, startShift, updateGame, serve, SHIFTS } from './game/src/game.js';
import { interactWithStation, updateStations, COOK_TIME, BURN_TIME } from './game/src/stations.js';
import { addToPlate } from './game/src/assembly.js';
import { RECIPES, INGREDIENTS } from './game/src/recipes.js';
import { planPath } from './game/src/pathing.js';
import { Tide } from './game/src/tide.js';
import * as Audio from './game/src/audio.js';

Audio.setMuted(true);

let passed = 0;
let failed = 0;
function check(name, cond, detail = '') {
  if (cond) { passed++; console.log('PASS  ' + name + (detail ? '  — ' + detail : '')); }
  else { failed++; console.log('FAIL  ' + name + (detail ? '  — ' + detail : '')); }
}

function fresh(shift = 1) {
  const g = newGame(1234);
  startShift(g, shift);
  return g;
}

function orderFor(recipe, patience = 60) {
  return { id: 'test_' + recipe.id, recipe, patience, maxPatience: patience, served: false, failed: false };
}

function platesteps(g, plate, steps) {
  for (const s of steps) addToPlate(plate.contents, { ing: s.ing, state: s.state });
}

// 1. One served order for every recipe, through the real serve() path.
for (const recipe of RECIPES) {
  const g = fresh(1);
  const order = orderFor(recipe);
  g.orderManager.orders = [order];
  g.orderManager.spawnTimer = 999;
  g.orders = [order];
  const plate = g.stations.find((s) => s.id === 'plate_counter');
  const steps = recipe.steps;
  const half = Math.floor(steps.length / 2);
  platesteps(g, plate, steps.slice(0, half));
  const partial = serve(g) === null && g.servedThisShift === 0;
  platesteps(g, plate, steps);
  const result = serve(g);
  check('serve ' + recipe.name, partial && !!result && g.servedThisShift === 1 && g.score > 0,
    'partial accepted? ' + !partial + (result ? '  +' + g.score + ' pts' : '  no match'));
}

// 2. Burn one pan: raw fish -> fried -> burned after COOK_TIME + BURN_TIME.
{
  const g = fresh(1);
  const stove = g.stations.find((s) => s.id === 'stove_pan');
  g.player.carrying = { ing: 'fish', state: 'raw' };
  interactWithStation(stove, g.player);
  const fried = stove.contents && stove.contents.state === 'fried';
  for (let i = 0; i < Math.ceil((COOK_TIME + BURN_TIME + 1) * 60); i++) updateStations(g.stations, 1 / 60);
  check('pan fries then burns', fried && stove.contents.state === 'burned' && stove.burning,
    'state=' + (stove.contents && stove.contents.state));
}

// 3. Fail one order by patience through updateGame.
{
  const g = fresh(2);
  const order = orderFor(RECIPES[0], 0.4);
  g.orderManager.orders = [order];
  g.orderManager.spawnTimer = 999;
  g.orders = [order];
  updateGame(g, 0.6);
  check('order fails by patience', order.failed === true && g.failedThisShift === 1,
    'failedThisShift=' + g.failedThisShift);
}

// 4. Finish a shift: pass, win on shift 5, lose on shift 5.
{
  const g = fresh(1);
  g.servedThisShift = g.shiftTarget;
  g.shiftTimer = g.shiftDuration - 0.05;
  updateGame(g, 0.1);
  check('shift passes', g.screen === 'shiftResult' && g.shiftPassed === true, 'screen=' + g.screen);
}
{
  const g = fresh(SHIFTS);
  g.servedThisShift = g.shiftTarget;
  g.shiftTimer = g.shiftDuration - 0.05;
  updateGame(g, 0.1);
  check('shift 5 win', g.screen === 'win', 'screen=' + g.screen);
}
{
  const g = fresh(SHIFTS);
  g.servedThisShift = 0;
  g.shiftTimer = g.shiftDuration - 0.05;
  updateGame(g, 0.1);
  check('shift 5 lose', g.screen === 'lose', 'screen=' + g.screen);
}

// 5. Tide route rules: bridge at high, plank at low, blocked at mid.
{
  const high = new Tide(1); high.setTime(18);
  const low = new Tide(1); low.setTime(3);
  const mid = new Tide(1); mid.setTime(10);
  const from = { x: 150, y: 600 };
  const to = { x: 1000, y: 400 };
  check('high tide bridge open', high.crossing.kind === 'bridge' && planPath(from, to, high) !== null, high.crossing.kind);
  check('low tide plank open', low.crossing.kind === 'plank' && planPath(from, to, low) !== null, low.crossing.kind);
  check('mid tide blocked', mid.crossing.open === false && planPath(from, to, mid) === null, mid.crossing.kind);
}

// 6. Content checks: 8 ingredients, 8 recipes, all recipes distinct.
check('8 ingredients', Object.keys(INGREDIENTS).length === 8, String(Object.keys(INGREDIENTS).length));
check('8 recipes', RECIPES.length === 8, String(RECIPES.length));
check('recipes distinct', new Set(RECIPES.map((r) => r.id)).size === RECIPES.length);

// 7. Real browser check: cook and serve one order with synthetic keyboard input.
async function browserCheck() {
  const chrome = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'].find(existsSync);
  if (!chrome) { check('browser: cook+serve, no console error', false, 'chromium not found'); return; }
  const port = 8098;
  const server = spawn(process.execPath, ['serve.ts', '--port', String(port)], { stdio: 'ignore' });
  let up = false;
  for (let i = 0; i < 60 && !up; i++) {
    try { const r = await fetch(`http://127.0.0.1:${port}/index.html`); up = r.ok; } catch { /* not up yet */ }
    if (!up) await new Promise((r) => setTimeout(r, 100));
  }
  if (!up) { server.kill(); check('browser: server starts', false, 'port ' + port); return; }
  const dom = await new Promise((resolve) => {
    const c = spawn(chrome, [
      '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars',
      '--window-size=1280,800', '--virtual-time-budget=4000', '--dump-dom',
      `http://127.0.0.1:${port}/?test=1`,
    ], { stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    c.stdout.on('data', (d) => { out += d; });
    c.on('close', () => resolve(out));
    setTimeout(() => { try { c.kill(); } catch { /* already gone */ } resolve(out); }, 30000);
  });
  server.kill();
  const m = dom.match(/<pre id="testResult">([^<]*)/);
  let ok = false;
  let detail = 'no testResult in DOM';
  if (m) {
    try {
      const j = JSON.parse(m[1]);
      ok = j.ok === true && (!j.errors || j.errors.length === 0);
      detail = (j.steps || []).join(' | ') + (j.errors && j.errors.length ? ' ERR:' + j.errors.join(',') : '');
    } catch { detail = 'unparsable testResult'; }
  }
  check('browser: cook+serve with keyboard, no console error', ok, detail);
}

await browserCheck();

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);