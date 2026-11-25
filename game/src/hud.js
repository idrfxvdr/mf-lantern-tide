// HUD: order board, shift timer, score, combo tips
import { INGREDIENTS, RECIPES } from './recipes.js';
import { C } from './drawKitchen.js';
import { drawFoodItem } from './drawFood.js';


// Round rect polyfill for drawHUD
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}
export function drawHUD(ctx, W, H, state) {
  drawTimer(ctx, W, H, state);
  drawOrders(ctx, W, H, state);
  drawScore(ctx, W, H, state);
  drawShiftInfo(ctx, W, H, state);
  drawControls(ctx, W, H, state);
  drawCarryIndicator(ctx, W, H, state);
  drawTideIndicator(ctx, W, H, state);
}

function drawTimer(ctx, W, H, state) {
  const shift = state.currentShift || 1;
  const timer = state.shiftTimer || 0;
  const maxTimer = state.shiftDuration || 60;
  const remaining = Math.max(0, maxTimer - timer);
  const frac = remaining / maxTimer;

  // Big timer at top center
  const tx = W / 2, ty = 30;
  ctx.fillStyle = `rgba(${frac > 0.3 ? '0,0,0' : '80,20,20'},0.5)`;
  ctx.beginPath();
  rrect(ctx,tx - 90, ty - 20, 180, 40, 6);
  ctx.fill();

  ctx.strokeStyle = frac > 0.3 ? C.text : C.red;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = frac > 0.3 ? C.text : C.red;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const mins = Math.floor(remaining / 60);
  const secs = Math.floor(remaining % 60);
  ctx.fillText(`SHIFT ${shift}  ${mins}:${String(secs).padStart(2,'0')}`, tx, ty);

  // Timer bar
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(tx - 80, ty + 15, 160, 6);
  ctx.fillStyle = frac > 0.3 ? C.green : (frac > 0.1 ? C.orange : C.red);
  ctx.fillRect(tx - 80, ty + 15, 160 * frac, 6);
}

function drawOrders(ctx, W, H, state) {
  const orders = state.orders || [];
  const bx = W - 280, by = 75;
  const ow = 260, oh = 180;

  // Board background
  ctx.fillStyle = 'rgba(20,15,10,0.85)';
  ctx.beginPath();
  rrect(ctx,bx - 10, by - 30, ow, oh + 20, 8);
  ctx.fill();
  ctx.strokeStyle = '#7a5030';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = C.text;
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('ORDERS', bx, by - 22);

  const active = orders.filter(o => !o.served && !o.failed).slice(0, 4);
  active.forEach((o, i) => {
    const oy = by + i * 42;
    const patienceFrac = Math.max(0, o.patience / o.maxPatience);

    // Order card
    ctx.fillStyle = 'rgba(40,30,20,0.7)';
    ctx.beginPath();
    rrect(ctx,bx, oy, ow - 10, 36, 4);
    ctx.fill();
    ctx.strokeStyle = patienceFrac > 0.5 ? '#5a8a50' : (patienceFrac > 0.2 ? '#8a7030' : '#8a3030');
    ctx.lineWidth = 1;
    ctx.stroke();

    // Recipe name
    ctx.fillStyle = C.white;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(o.recipe.name, bx + 8, oy + 4);

    // Required ingredients
    const steps = o.recipe.steps;
    for (let j = 0; j < steps.length; j++) {
      const step = steps[j];
      const ix = bx + 8 + j * 28;
      const iy = oy + 18;
      drawFoodItem(ctx, ix + 10, iy + 10, step.ing, step.state, 16);
    }

    // Patience bar
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(bx + 8, oy + 30, ow - 26, 4);
    const barColor = patienceFrac > 0.5 ? '#44cc66' : (patienceFrac > 0.2 ? '#ffaa22' : '#ff4444');
    ctx.fillStyle = barColor;
    ctx.fillRect(bx + 8, oy + 30, (ow - 26) * patienceFrac, 4);
  });

  if (active.length === 0) {
    ctx.fillStyle = C.textDim;
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('No orders yet...', bx + ow / 2 - 10, by + 60);
  }
}

function drawScore(ctx, W, H, state) {
  const score = state.score || 0;
  const combo = state.combo || 0;

  // Score at top left
  ctx.fillStyle = 'rgba(20,15,10,0.7)';
  ctx.beginPath();
  rrect(ctx,15, 15, 160, 50, 6);
  ctx.fill();
  ctx.strokeStyle = '#7a5030';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = C.text;
  ctx.font = 'bold 11px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('SCORE', 25, 22);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(score.toString().padStart(6, '0'), 25, 36);

  if (combo > 1) {
    ctx.fillStyle = C.orange;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`x${combo} COMBO!`, 165, 42);
  }
}

function drawShiftInfo(ctx, W, H, state) {
  const shift = state.currentShift || 1;
  ctx.fillStyle = 'rgba(20,15,10,0.7)';
  ctx.beginPath();
  rrect(ctx,W / 2 + 100, 10, 110, 28, 4);
  ctx.fill();
  ctx.fillStyle = C.text;
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`SHIFT ${shift}/5`, W / 2 + 110, 24);
}

function drawControls(ctx, W, H, state) {
  if (state.screen !== 'play') return;
  ctx.fillStyle = 'rgba(20,15,10,0.6)';
  ctx.fillRect(15, H - 30, 200, 25);
  ctx.fillStyle = C.textDim;
  ctx.font = '10px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('WASD move | E interact | P pause', 20, H - 18);
}

function drawCarryIndicator(ctx, W, H, state) {
  const player = state.player;
  if (!player || !player.carrying) return;
  const item = player.carrying;
  const ix = 40, iy = H - 50;
  ctx.fillStyle = 'rgba(20,15,10,0.8)';
  ctx.beginPath();
  rrect(ctx,ix - 5, iy - 5, 80, 40, 6);
  ctx.fill();
  drawFoodItem(ctx, ix + 30, iy + 15, item.ing, item.state, 28);
  ctx.fillStyle = C.text;
  ctx.font = '10px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  const info = INGREDIENTS[item.ing];
  ctx.fillText(info ? info.name : item.ing, ix + 30, iy - 8);
  ctx.fillStyle = C.textDim;
  ctx.fillText(item.state.toUpperCase(), ix + 30, iy + 38);
}

function drawTideIndicator(ctx, W, H, state) {
  const tide = state.tide;
  if (!tide) return;
  const tx = 40, ty = 75;
  ctx.fillStyle = 'rgba(20,15,10,0.7)';
  ctx.beginPath();
  rrect(ctx,tx, ty, 100, 30, 4);
  ctx.fill();
  const level = tide.level;
  ctx.fillStyle = '#1a3a4a';
  ctx.fillRect(tx + 5, ty + 5, 90, 8);
  ctx.fillStyle = level > 0.6 ? '#4488aa' : (level < 0.4 ? '#884422' : '#446688');
  ctx.fillRect(tx + 5, ty + 5, 90 * level, 8);
  ctx.fillStyle = C.textDim;
  ctx.font = '8px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('TIDE', tx, ty + 16);
  ctx.fillStyle = C.text;
  ctx.font = '10px monospace';
  ctx.fillText(level > 0.6 ? 'HIGH' : (level < 0.4 ? 'LOW' : 'MID'), tx + 5, ty + 16);
}

// Screens
export function drawTitleScreen(ctx, W, H) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#050a10');
  bg.addColorStop(1, '#0a1520');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Title glow
  const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 300);
  glow.addColorStop(0, 'rgba(255,140,32,0.15)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ffd27d';
  ctx.font = 'bold 56px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('LANTERN TIDE', W / 2, H * 0.3);

  ctx.fillStyle = '#ff8c20';
  ctx.font = '16px monospace';
  ctx.fillText('A Night Kitchen on the Floating Market', W / 2, H * 0.38);

  ctx.fillStyle = '#a08050';
  ctx.font = '12px monospace';
  const lines = [
    'WASD / ARROWS — Move',
    'E — Interact with stations',
    'Collect ingredients, cook, plate, and serve!',
    'Watch the tide — plan your route!',
    '',
    'Press ENTER or click to start',
  ];
  lines.forEach((l, i) => {
    ctx.fillStyle = l.startsWith('WASD') || l.startsWith('E —') || l.startsWith('Collect') || l.startsWith('Watch') ? '#c0a070' : '#ffd27d';
    ctx.fillText(l, W / 2, H * 0.52 + i * 24);
  });
}

export function drawPauseScreen(ctx, W, H) {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffd27d';
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('PAUSED', W / 2, H * 0.45);
  ctx.fillStyle = '#a08050';
  ctx.font = '14px monospace';
  ctx.fillText('Press P or ESC to resume', W / 2, H * 0.55);
}

export function drawShiftResult(ctx, W, H, state) {
  ctx.fillStyle = 'rgba(0,0,0,0.8)';
  ctx.fillRect(0, 0, W, H);

  const shift = state.currentShift;
  const score = state.score;
  const shiftScore = state.shiftScore || 0;
  const passed = state.shiftPassed;

  ctx.fillStyle = passed ? '#44cc66' : '#ff4444';
  ctx.font = 'bold 32px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(passed ? `SHIFT ${shift} COMPLETE!` : `SHIFT ${shift} FAILED`, W / 2, H * 0.3);

  ctx.fillStyle = '#ffd27d';
  ctx.font = '20px monospace';
  ctx.fillText(`Shift Score: ${shiftScore}`, W / 2, H * 0.42);
  ctx.fillText(`Total Score: ${score}`, W / 2, H * 0.50);

  ctx.fillStyle = '#a08050';
  ctx.font = '14px monospace';
  if (passed) {
    ctx.fillText('Press ENTER for next shift', W / 2, H * 0.62);
  } else {
    ctx.fillText('Press ENTER to try again', W / 2, H * 0.62);
  }
}

export function drawWinScreen(ctx, W, H, state) {
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SHIFTS COMPLETE!', W / 2, H * 0.3);

  ctx.fillStyle = '#ffd27d';
  ctx.font = '24px monospace';
  ctx.fillText(`Final Score: ${state.score}`, W / 2, H * 0.45);

  ctx.fillStyle = '#44cc66';
  ctx.font = '16px monospace';
  ctx.fillText('You conquered the Lantern Tide!', W / 2, H * 0.55);

  ctx.fillStyle = '#a08050';
  ctx.font = '14px monospace';
  ctx.fillText('Press ENTER to play again', W / 2, H * 0.68);
}

export function drawLoseScreen(ctx, W, H, state) {
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 40px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', W / 2, H * 0.3);

  ctx.fillStyle = '#ffd27d';
  ctx.font = '20px monospace';
  ctx.fillText(`Score: ${state.score}`, W / 2, H * 0.45);

  ctx.fillStyle = '#a08050';
  ctx.font = '14px monospace';
  ctx.fillText('Press ENTER to try again', W / 2, H * 0.6);
}
