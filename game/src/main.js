// main.js - canvas bootstrap, input, rendering and the frame loop.
import { W, H } from './layout.js';
import { newGame, startShift, updateGame, interact, clickAt, move, SHIFTS } from './game.js';
import { drawKitchen } from './drawKitchen.js';
import { drawHUD, drawTitleScreen, drawPauseScreen, drawShiftResult, drawWinScreen, drawLoseScreen } from './hud.js';
import { setupInput, keys, wasKeyPressed, consumeKeys } from './input.js';
import { setupShot } from './shots.js';
import * as Audio from './audio.js';

const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
canvas.width = W;
canvas.height = H;

const params = new URLSearchParams(location.search);
const shot = parseInt(params.get('shot') || '0', 10);

const muteBtn = document.getElementById('muteBtn');
muteBtn.addEventListener('click', () => {
  const m = Audio.isMuted();
  Audio.setMuted(!m);
  muteBtn.textContent = m ? 'SOUND OFF' : 'SOUND ON';
});

setupInput(canvas);

const g = newGame(9999);
if (shot > 0) setupShot(g, shot);

function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
}

canvas.addEventListener('mousemove', (e) => {
  const p = toCanvas(e);
  g.mouseX = p.x;
  g.mouseY = p.y;
});

canvas.addEventListener('click', (e) => {
  Audio.initAudio();
  const p = toCanvas(e);
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

function playInput() {
  if (wasKeyPressed('up')) move(g, 0, -34);
  if (wasKeyPressed('down')) move(g, 0, 34);
  if (wasKeyPressed('left')) move(g, -34, 0);
  if (wasKeyPressed('right')) move(g, 34, 0);
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

let last = 0;
function frame(ts) {
  const dt = Math.min((ts - last) / 1000, 0.05);
  last = ts;
  screenInput();
  if (g.screen === 'play') playInput();
  updateGame(g, dt);
  render();
  if (shot > 0) flattenFrame();
  consumeKeys();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Expose the frozen state so the headless test can inspect a real render.
window.__lanternTide = g;