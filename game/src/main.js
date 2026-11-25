// main.js - canvas bootstrap, input, rendering, the frame loop and the headless hooks.
import { W, H, HUD } from './layout.js';
import { newGame, startShift, updateGame, interact, clickAt, move, SHIFTS } from './game.js';
import { drawKitchen } from './drawKitchen.js';
import { drawHUD, drawTitleScreen, drawPauseScreen, drawShiftResult, drawWinScreen, drawLoseScreen } from './hud.js';
import { setupInput, wasKeyPressed, consumeKeys, keys } from './input.js';
import { setupShot } from './shots.js';
import { runSelfTest } from './selftest.js';
import * as Audio from './audio.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const params = new URLSearchParams(location.search);
const shot = parseInt(params.get('shot') || '0', 10);
const testMode = params.get('test') === '1';

// Surface any runtime error so the headless test can fail loudly.
const errors = [];
window.__errors = errors;
window.addEventListener('error', (e) => errors.push(String(e.message || e.error)));
window.addEventListener('unhandledrejection', (e) => errors.push(String(e.reason)));

setupInput(canvas);

const g = newGame(9999);
if (shot > 0) setupShot(g, shot);

function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
}

function inBox(p, b) {
  return p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
}

canvas.addEventListener('mousemove', (e) => {
  const p = toCanvas(e);
  g.mouseX = p.x;
  g.mouseY = p.y;
});

canvas.addEventListener('click', (e) => {
  if (!Audio.isMuted()) Audio.initAudio();
  const p = toCanvas(e);
  if (inBox(p, HUD.mute)) {
    const m = Audio.isMuted();
    Audio.setMuted(!m);
    return;
  }
  if (g.screen === 'title') return startShift(g, 1);
  if (g.screen === 'shiftResult') return startShift(g, g.shiftPassed ? Math.min(SHIFTS, g.currentShift + 1) : g.currentShift);
  if (g.screen === 'win' || g.screen === 'lose') {
    Object.assign(g, newGame(9999));
    g.screen = 'title';
    return;
  }
  if (g.screen === 'play') clickAt(g, p.x, p.y);
});

function screenInput() {
  if (wasKeyPressed('pause') || wasKeyPressed('escape')) {
    if (g.screen === 'play') g.screen = 'paused';
    else if (g.screen === 'paused') g.screen = 'play';
  }
  const go = wasKeyPressed('enter') || wasKeyPressed('interact');
  if (g.screen === 'title' && go) return startShift(g, 1);
  if (g.screen === 'paused' && go) return (g.screen = 'play');
  if (g.screen === 'shiftResult' && go) return startShift(g, g.shiftPassed ? Math.min(SHIFTS, g.currentShift + 1) : g.currentShift);
  if ((g.screen === 'win' || g.screen === 'lose') && go) {
    Object.assign(g, newGame(9999));
    g.screen = 'title';
  }
}

function playInput(dt) {
  // Held keys walk continuously; E / Space act once per press.
  const speed = 330 * dt;
  if (keys.up) move(g, 0, -speed);
  if (keys.down) move(g, 0, speed);
  if (keys.left) move(g, -speed, 0);
  if (keys.right) move(g, speed, 0);
  if (wasKeyPressed('interact')) interact(g);
  if (wasKeyPressed('action')) interact(g);
}

function render() {
  ctx.clearRect(0, 0, W, H);
  if (g.screen === 'title') return drawTitleScreen(ctx);
  drawKitchen(ctx, g);
  if (g.screen === 'play' || g.screen === 'paused') {
    drawHUD(ctx, g);
    if (g.screen === 'paused') drawPauseScreen(ctx);
    return;
  }
  if (g.screen === 'shiftResult') return drawShiftResult(ctx, g);
  if (g.screen === 'win') return drawWinScreen(ctx, g);
  drawLoseScreen(ctx, g);
}

// Capture mode flattens the frame to a compact lantern palette so the stored
// screenshot stays small; the live game is never quantised.
function flattenFrame() {
  const img = ctx.getImageData(0, 0, W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = (d[i] >> 3) << 3;
    d[i + 1] = (d[i + 1] >> 3) << 3;
    d[i + 2] = (d[i + 2] >> 3) << 3;
  }
  ctx.putImageData(img, 0, 0);
}

// Headless self-test: drive a whole order with synthetic keyboard events, then report.
if (testMode) {
  Audio.setMuted(true);
  const result = runSelfTest(g);
  result.errors = errors.slice();
  const ok = result.ok && errors.length === 0;
  const pre = document.createElement('pre');
  pre.id = 'testResult';
  pre.textContent = JSON.stringify({ ok, steps: result.steps, errors: result.errors });
  document.body.appendChild(pre);
  document.title = ok ? 'SELFTEST PASS' : 'SELFTEST FAIL';
  render();
  if (shot > 0) flattenFrame();
  window.__lanternTide = g;
} else if (shot > 0) {
  // Frozen capture: render one real frame and report any error through the title.
  try { render(); flattenFrame(); } catch (e) { errors.push(String(e && e.message || e)); }
  document.title = errors.length ? 'SHOT FAIL' : 'SHOT OK';
  window.__lanternTide = g;
} else {
  let last = 0;
  function frame(ts) {
    const dt = Math.min((ts - last) / 1000, 0.05);
    last = ts;
    screenInput();
    if (g.screen === 'play') playInput(dt);
    updateGame(g, dt);
    render();
    consumeKeys();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__lanternTide = g;
}