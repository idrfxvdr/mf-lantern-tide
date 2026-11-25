// selftest.js - a real keyboard-driven smoke test used by ?test=1 in headless Chromium.
// It cooks one Tide Rice from crate to serving hatch using only synthetic key events,
// then reports whether the order was served and no runtime error was raised.
import { startShift, updateGame, interact, move } from './game.js';
import { planPath } from './pathing.js';
import { wasKeyPressed, consumeKeys } from './input.js';
import { RECIPES } from './recipes.js';

const STEP = 18; // keyboard step, small enough to land on a waypoint without oscillating

export function runSelfTest(g) {
  const steps = [];
  const log = (s) => steps.push(s);
  let ticks = 0;

  function tick(dt = 1 / 60) {
    if (wasKeyPressed('up')) move(g, 0, -STEP);
    if (wasKeyPressed('down')) move(g, 0, STEP);
    if (wasKeyPressed('left')) move(g, -STEP, 0);
    if (wasKeyPressed('right')) move(g, STEP, 0);
    if (wasKeyPressed('interact')) interact(g);
    updateGame(g, dt);
    consumeKeys();
    ticks++;
  }

  function tap(code, key) {
    window.dispatchEvent(new KeyboardEvent('keydown', { code, key, bubbles: true, cancelable: true }));
    tick();
    window.dispatchEvent(new KeyboardEvent('keyup', { code, key, bubbles: true, cancelable: true }));
    consumeKeys(); // sync the "previous frame" snapshot now that the key is up
  }

  function walkTo(target, limit = 600) {
    let n = 0;
    while (n++ < limit) {
      const dx = target.x - g.player.x;
      const dy = target.y - g.player.y;
      if (Math.hypot(dx, dy) < 14) return true;
      if (Math.abs(dx) > Math.abs(dy)) tap(dx > 0 ? 'ArrowRight' : 'ArrowLeft', dx > 0 ? 'ArrowRight' : 'ArrowLeft');
      else tap(dy > 0 ? 'ArrowDown' : 'ArrowUp', dy > 0 ? 'ArrowDown' : 'ArrowUp');
    }
    return false;
  }

  function routeTo(target) {
    const path = planPath(g.player, target, g.tide);
    if (!path) { log('no crossing at mid tide'); return false; }
    for (const wp of path) if (!walkTo(wp)) { log('stuck walking'); return false; }
    return true;
  }

  function wait(seconds) {
    const n = Math.round(seconds * 60);
    for (let i = 0; i < n; i++) tick();
  }

  function finish(ok) {
    const pass = ok && g.servedThisShift >= 1 && g.score > 0 && ticks > 0;
    log(pass ? 'PASS' : 'FAIL');
    return { ok: pass, steps, ticks };
  }

  startShift(g, 1);
  const order = { id: 't1', recipe: RECIPES[0], patience: 60, maxPatience: 60, served: false, failed: false };
  g.orderManager.orders = [order];
  g.orderManager.spawnTimer = 999;
  g.orders = [order];
  log('shift started, order = ' + order.recipe.name);

  if (!routeTo({ x: 100, y: 274 })) return finish(false);
  tap('KeyE', 'e');
  log('at rice crate, carrying = ' + (g.player.carrying ? g.player.carrying.ing + '/' + g.player.carrying.state : 'nothing'));
  if (!g.player.carrying) return finish(false);

  if (!routeTo({ x: 1020, y: 300 })) return finish(false);
  tap('KeyE', 'e');
  const steamer = g.stations.find((s) => s.id === 'steamer_pot');
  log('steamer holds ' + (steamer.contents ? steamer.contents.ing + '/' + steamer.contents.state : 'nothing'));
  wait(2.4);
  tap('KeyE', 'e');
  log('picked from steamer = ' + (g.player.carrying ? g.player.carrying.state : 'nothing'));
  if (!g.player.carrying) return finish(false);

  if (!routeTo({ x: 820, y: 530 })) return finish(false);
  tap('KeyE', 'e');
  if (!routeTo({ x: 1050, y: 545 })) return finish(false);
  tap('KeyE', 'e');
  log('served this shift = ' + g.servedThisShift + ', score = ' + g.score);

  return finish(g.servedThisShift >= 1 && g.score > 0);
}