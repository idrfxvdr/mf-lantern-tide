// drawTickets.js - four large paper order tickets along the top, with dish pictures.
import { TICKETS } from './layout.js';
import { drawFoodItem } from './drawFood.js';

const STATE_ICON = { raw: '', chopped: 'CH', fried: 'FR', steamed: 'ST', burned: 'BU' };

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawTickets(ctx, state) {
  const live = (state.orders || []).filter((o) => !o.served && !o.failed);
  TICKETS.forEach((box, i) => ticket(ctx, box, live[i] || null));
}

function ticket(ctx, b, order) {
  ctx.save();
  // Paper
  rrect(ctx, b.x, b.y, b.w, b.h, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fill();
  rrect(ctx, b.x, b.y, b.w, b.h, 8);
  const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
  if (order) {
    g.addColorStop(0, '#fdf3d8');
    g.addColorStop(1, '#e6d3a8');
  } else {
    g.addColorStop(0, '#4a4038');
    g.addColorStop(1, '#332c26');
  }
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = order ? '#b99a68' : '#5a5048';
  ctx.stroke();

  if (!order) {
    ctx.fillStyle = 'rgba(255,224,168,0.45)';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WAITING', b.x + b.w / 2, b.y + b.h / 2);
    ctx.restore();
    return;
  }

  const r = order.recipe;
  const frac = Math.max(0, order.patience / order.maxPatience);
  const bar = frac > 0.5 ? '#2fb457' : frac > 0.25 ? '#e0a020' : '#d83a3a';

  // Dish picture
  const dishX = b.x + 52;
  const dishY = b.y + b.h / 2 - 4;
  ctx.fillStyle = '#efe6cf';
  ctx.beginPath(); ctx.ellipse(dishX, dishY, 44, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9bb9a';
  ctx.lineWidth = 2;
  ctx.stroke();
  const step = r.steps[0];
  drawFoodItem(ctx, dishX, dishY - 4, step.ing, step.state, 52);
  if (r.steps[1]) drawFoodItem(ctx, dishX + 24, dishY + 2, r.steps[1].ing, r.steps[1].state, 40);

  // Name
  ctx.fillStyle = '#3a2412';
  ctx.font = 'bold 19px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(r.name, b.x + 104, b.y + 10);

  // Required ingredients with state icons
  r.steps.forEach((s, j) => {
    const ix = b.x + 116 + j * 62;
    const iy = b.y + 54;
    drawFoodItem(ctx, ix, iy, s.ing, s.state, 34);
    ctx.fillStyle = '#5a4630';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(STATE_ICON[s.state] || '', ix, iy + 18);
  });

  // Patience bar
  ctx.fillStyle = 'rgba(60,44,26,0.35)';
  ctx.fillRect(b.x + 12, b.y + b.h - 16, b.w - 24, 9);
  ctx.fillStyle = bar;
  ctx.fillRect(b.x + 12, b.y + b.h - 16, (b.w - 24) * frac, 9);

  // Points
  ctx.fillStyle = 'rgba(58,36,18,0.85)';
  rrect(ctx, b.x + b.w - 62, b.y + 8, 54, 24, 6);
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('+' + r.points, b.x + b.w - 35, b.y + 21);
  ctx.restore();
}