// hud.js - score, tide, carried item, help, mute, combo tips and the full-screen cards.
// Every panel box comes from layout.js so nothing overlaps (see overlap.mjs).
import { HUD } from './layout.js';
import { INGREDIENTS } from './recipes.js';
import { drawFoodItem } from './drawFood.js';
import { drawTickets } from './drawTickets.js';
import { drawClock } from './drawClock.js';
import { drawResult } from './drawResult.js';
import * as Audio from './audio.js';

function panel(ctx, b) {
  ctx.fillStyle = 'rgba(14,20,28,0.84)';
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, 12);
  else ctx.rect(b.x, b.y, b.w, b.h);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255,180,80,0.5)';
  ctx.stroke();
}

export function drawHUD(ctx, state) {
  drawTickets(ctx, state);
  drawClock(ctx, state);
  score(ctx, state);
  tide(ctx, state);
  held(ctx, state);
  help(ctx, state);
  mute(ctx);
  if ((state.combo || 0) > 1) combo(ctx, state);
  if (state.toast) toast(ctx, state);
}

function score(ctx, state) {
  const b = HUD.score;
  panel(ctx, b);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#c8a878';
  ctx.font = '16px sans-serif';
  ctx.fillText('SCORE', b.x + 16, b.y + 10);
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(String(state.score || 0).padStart(5, '0'), b.x + 16, b.y + 30);
  ctx.fillStyle = '#9ec48a';
  ctx.font = '16px sans-serif';
  ctx.fillText('shift +' + (state.shiftScore || 0), b.x + 140, b.y + 46);
}

function tide(ctx, state) {
  const b = HUD.tide;
  const t = state.tide;
  panel(ctx, b);
  const level = t ? t.level : 0.5;
  const label = level > 0.62 ? 'HIGH' : level < 0.38 ? 'LOW' : 'MID';
  const col = level > 0.62 ? '#7fc4e8' : level < 0.38 ? '#f0a860' : '#9ab8d0';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#c8a878';
  ctx.font = '16px sans-serif';
  ctx.fillText('TIDE', b.x + 60, b.y + 10);
  ctx.fillStyle = col;
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(label, b.x + 60, b.y + 30);
  const gx = b.x + 14, gy = b.y + 14, gw = 34, gh = 54;
  ctx.fillStyle = '#0a141c';
  ctx.fillRect(gx, gy, gw, gh);
  ctx.fillStyle = col;
  ctx.fillRect(gx, gy + gh * (1 - level), gw, gh * level);
  ctx.strokeStyle = 'rgba(255,200,120,0.6)';
  ctx.lineWidth = 2;
  ctx.strokeRect(gx, gy, gw, gh);
  ctx.fillStyle = '#a89070';
  ctx.font = '16px sans-serif';
  ctx.fillText(level > 0.62 ? 'bridge drifts' : level < 0.38 ? 'plank is out' : 'no crossing', b.x + 60, b.y + 58);
}

function held(ctx, state) {
  const p = state.player;
  const b = HUD.held;
  panel(ctx, b);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#c8a878';
  ctx.font = '16px sans-serif';
  ctx.fillText('CARRYING', b.x + b.w / 2, b.y + 8);
  if (!p || !p.carrying) {
    ctx.fillStyle = 'rgba(200,168,120,0.6)';
    ctx.font = '16px sans-serif';
    ctx.fillText('nothing', b.x + b.w / 2, b.y + 46);
    return;
  }
  const info = INGREDIENTS[p.carrying.ing];
  drawFoodItem(ctx, b.x + 34, b.y + 48, p.carrying.ing, p.carrying.state, 56);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffe6b0';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(info ? info.name : p.carrying.ing, b.x + 68, b.y + 28, 76);
  ctx.fillStyle = '#c8a878';
  ctx.font = '16px sans-serif';
  ctx.fillText(p.carrying.state, b.x + 68, b.y + 50, 76);
}

function help(ctx, state) {
  const b = HUD.help;
  panel(ctx, b);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#d8c09a';
  ctx.font = '16px sans-serif';
  ctx.fillText('WASD/Arrows move   E use   Click walk+use   P pause', b.x + b.w / 2, b.y + 26);
  ctx.fillStyle = '#a89070';
  ctx.fillText('crate → chop → pan or steamer → plate → serve hatch', b.x + b.w / 2, b.y + 56);
}

function mute(ctx) {
  const b = HUD.mute;
  panel(ctx, b);
  const on = !Audio.isMuted();
  const cx = b.x + 34, cy = b.y + b.h / 2;
  ctx.fillStyle = on ? '#ffd68a' : '#7a6a58';
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 6); ctx.lineTo(cx - 2, cy - 6); ctx.lineTo(cx + 6, cy - 14);
  ctx.lineTo(cx + 6, cy + 14); ctx.lineTo(cx - 2, cy + 6); ctx.lineTo(cx - 10, cy + 6);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = on ? '#ffd68a' : '#7a6a58';
  ctx.lineWidth = 2;
  if (on) {
    ctx.beginPath(); ctx.arc(cx + 8, cy, 8, -0.9, 0.9); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 8, cy, 13, -0.8, 0.8); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.moveTo(cx + 10, cy - 6); ctx.lineTo(cx + 18, cy + 6);
    ctx.moveTo(cx + 18, cy - 6); ctx.lineTo(cx + 10, cy + 6); ctx.stroke();
  }
  ctx.fillStyle = '#ffe6b0';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(on ? 'SOUND' : 'MUTED', b.x + 56, cy - 9);
  ctx.fillStyle = '#a89070';
  ctx.font = '16px sans-serif';
  ctx.fillText('click', b.x + 56, cy + 11);
}

function combo(ctx, state) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(255,150,40,0.95)';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('x' + state.combo + ' COMBO', 640, 292);
  ctx.fillStyle = '#ffe6b0';
  ctx.font = '16px sans-serif';
  ctx.fillText('tips +' + Math.round(state.combo * 10) + '%', 640, 316);
}

function toast(ctx, state) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 18px sans-serif';
  const w = ctx.measureText(state.toast).width + 28;
  ctx.fillStyle = 'rgba(20,10,6,0.85)';
  ctx.fillRect(640 - w / 2, 672, w, 28);
  ctx.fillStyle = '#ffb060';
  ctx.fillText(state.toast, 640, 687);
}

export function drawTitleScreen(ctx) {
  const W = 1280, H = 800;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#02060f');
  g.addColorStop(1, '#0b1a26');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 300, 20, W / 2, 300, 440);
  glow.addColorStop(0, 'rgba(255,150,50,0.22)');
  glow.addColorStop(1, 'rgba(255,150,50,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd68a';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('LANTERN TIDE', W / 2, 210);
  ctx.fillStyle = '#ff9c30';
  ctx.font = '24px sans-serif';
  ctx.fillText('a night kitchen on the floating market', W / 2, 268);
  const lines = [
    'WASD or arrows — walk the two piers',
    'E — use the station you are standing at',
    'click a station — walk there and use it',
    'crate → chop → pan or steamer → plate → serve',
    'high tide: drifting bridge    low tide: narrow plank',
    'mid tide: no crossing — plan the route',
    '',
    'press ENTER or click to open the kitchen',
  ];
  ctx.font = '20px sans-serif';
  lines.forEach((l, i) => {
    ctx.fillStyle = i >= 6 ? '#ffe6b0' : '#c8b090';
    ctx.fillText(l, W / 2, 350 + i * 38);
  });
}

export function drawPauseScreen(ctx) {
  const W = 1280, H = 800;
  ctx.fillStyle = 'rgba(4,8,14,0.6)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd68a';
  ctx.font = 'bold 46px sans-serif';
  ctx.fillText('PAUSED', W / 2, H / 2 - 20);
  ctx.fillStyle = '#c8a878';
  ctx.font = '20px sans-serif';
  ctx.fillText('press P or ESC to keep cooking', W / 2, H / 2 + 40);
}

export function drawShiftResult(ctx, state) {
  drawResult(ctx, state);
}

export function drawWinScreen(ctx, state) {
  const W = 1280, H = 800;
  ctx.fillStyle = 'rgba(4,8,14,0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffd24a';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText('ALL SHIFTS CLEARED', W / 2, H / 2 - 70);
  ctx.fillStyle = '#ffe6b0';
  ctx.font = '28px sans-serif';
  ctx.fillText('final score ' + (state.score || 0), W / 2, H / 2);
  ctx.fillStyle = '#c8a878';
  ctx.font = '20px sans-serif';
  ctx.fillText('press ENTER to open a new night', W / 2, H / 2 + 70);
}

export function drawLoseScreen(ctx, state) {
  const W = 1280, H = 800;
  ctx.fillStyle = 'rgba(10,4,4,0.75)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ff7a6a';
  ctx.font = 'bold 52px sans-serif';
  ctx.fillText('THE RAFT CLOSES', W / 2, H / 2 - 60);
  ctx.fillStyle = '#ffe6b0';
  ctx.font = '26px sans-serif';
  ctx.fillText('score ' + (state.score || 0), W / 2, H / 2 + 10);
  ctx.fillStyle = '#c8a878';
  ctx.font = '20px sans-serif';
  ctx.fillText('press ENTER to try the night again', W / 2, H / 2 + 70);
}