// drawTickets.js - four large paper order tickets along the top. Each ticket has its
// own name row, dish picture, ingredient icons with a state glyph, patience bar and price.
import { TICKETS, TICKET_INNER, FONT_STACK } from './layout.js';
import { drawFoodItem } from './drawFood.js';

function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function patienceColor(frac) {
  if (frac > 0.66) return '#2fb457';
  if (frac > 0.4) return '#e0c020';
  if (frac > 0.2) return '#e07a20';
  return '#d83a3a';
}

// A tiny state glyph: knife (chopped), flame (fried), steam (steamed), dot (raw), X (burned).
function stateIcon(ctx, x, y, state) {
  ctx.save();
  ctx.translate(x, y);
  if (state === 'chopped') {
    ctx.fillStyle = '#cfd6de';
    ctx.beginPath(); ctx.moveTo(-7, 3); ctx.lineTo(5, -5); ctx.lineTo(7, -2); ctx.lineTo(-5, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6b4422'; ctx.fillRect(-8, 3, 5, 4);
  } else if (state === 'fried') {
    ctx.fillStyle = '#ff8a20';
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.quadraticCurveTo(7, -1, 3, 6); ctx.quadraticCurveTo(0, 8, -3, 6); ctx.quadraticCurveTo(-7, -1, 0, -8); ctx.fill();
    ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.arc(0, 2, 2.4, 0, Math.PI * 2); ctx.fill();
  } else if (state === 'steamed') {
    ctx.strokeStyle = '#b8c8d8'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (const dx of [-4, 0, 4]) {
      ctx.beginPath(); ctx.moveTo(dx, 6);
      ctx.quadraticCurveTo(dx + 3, 1, dx, -3);
      ctx.quadraticCurveTo(dx - 3, -6, dx, -8);
      ctx.stroke();
    }
    ctx.lineCap = 'butt';
  } else if (state === 'burned') {
    ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-5, -5); ctx.lineTo(5, 5); ctx.moveTo(5, -5); ctx.lineTo(-5, 5); ctx.stroke();
  } else {
    ctx.fillStyle = '#8a7048'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

export function drawTickets(ctx, state) {
  const live = (state.orders || []).filter((o) => !o.served && !o.failed);
  TICKETS.forEach((box, i) => ticket(ctx, box, live[i] || null));
}

function ticket(ctx, b, order) {
  const I = TICKET_INNER;
  ctx.save();
  rrect(ctx, b.x, b.y, b.w, b.h, 8);
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.fill();
  rrect(ctx, b.x, b.y, b.w, b.h, 8);
  const g = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
  if (order) { g.addColorStop(0, '#fdf3d8'); g.addColorStop(1, '#e6d3a8'); }
  else { g.addColorStop(0, '#4a4038'); g.addColorStop(1, '#332c26'); }
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = order ? '#b99a68' : '#5a5048';
  ctx.stroke();

  if (!order) {
    ctx.fillStyle = 'rgba(255,224,168,0.45)';
    ctx.font = `bold 18px ${FONT_STACK}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WAITING', b.x + b.w / 2, b.y + b.h / 2);
    ctx.restore();
    return;
  }

  const r = order.recipe;
  const frac = Math.max(0, order.patience / order.maxPatience);
  const bar = patienceColor(frac);

  // Name on its own row, condensed to fit if long.
  ctx.fillStyle = '#3a2412';
  ctx.font = `bold 18px ${FONT_STACK}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(r.name, b.x + I.name.x, b.y + I.name.y, I.name.w);

  // Dish picture
  const dx = b.x + I.dish.cx, dy = b.y + I.dish.cy;
  ctx.fillStyle = '#efe6cf';
  ctx.beginPath(); ctx.ellipse(dx, dy, I.dish.rx, I.dish.ry, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9bb9a'; ctx.lineWidth = 2; ctx.stroke();
  r.steps.slice(0, 3).forEach((s, j) => {
    const ox = (j - (Math.min(r.steps.length, 3) - 1) / 2) * 22;
    drawFoodItem(ctx, dx + ox, dy - 3, s.ing, s.state, 32);
  });

  // Ingredient icons with state glyphs
  r.steps.forEach((s, j) => {
    const ix = b.x + I.icons.x + j * I.icons.step;
    const iy = b.y + I.icons.y;
    drawFoodItem(ctx, ix, iy, s.ing, s.state, I.icons.size);
    stateIcon(ctx, ix, b.y + I.icons.stateY, s.state);
  });

  // Patience bar
  ctx.fillStyle = 'rgba(60,44,26,0.35)';
  ctx.fillRect(b.x + I.bar.x, b.y + I.bar.y, I.bar.w, I.bar.h);
  ctx.fillStyle = bar;
  ctx.fillRect(b.x + I.bar.x, b.y + I.bar.y, I.bar.w * frac, I.bar.h);

  // Price, bottom right
  rrect(ctx, b.x + I.price.x, b.y + I.price.y, I.price.w, I.price.h, 6);
  ctx.fillStyle = 'rgba(58,36,18,0.9)';
  ctx.fill();
  ctx.fillStyle = '#ffd76a';
  ctx.font = `bold 16px ${FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('+' + r.points, b.x + I.price.x + I.price.w / 2, b.y + I.price.y + I.price.h / 2 + 1);
  ctx.restore();
}