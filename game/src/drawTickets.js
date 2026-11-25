// drawTickets.js - Order tickets strip
import { INGREDIENTS } from './recipes.js';
import { drawFoodItem } from './drawFood.js';

export function drawTickets(ctx, W, H, state) {
  const orders = (state.orders||[]).filter(o=>!o.served&&!o.failed);
  const num = 4;
  const ticketW = Math.min(290, Math.floor((W - 60) / num));
  const ticketH = 82;
  const totalW = num * ticketW + (num-1) * 10;
  const startX = (W - totalW) / 2;
  const ticketY = 6;

  for (let i = 0; i < num; i++) {
    const x = startX + i * (ticketW + 10);
    const o = orders[i] || null;
    drawTicket(ctx, x, ticketY, ticketW, ticketH, o, state.time||0);
  }
}

function drawTicket(ctx, x, y, w, h, order, t) {
  if (!order) {
    // Empty slot
    ctx.fillStyle = 'rgba(40,30,20,0.45)';
    ctx.beginPath(); ctx.roundRect(x,y,w,h,5); ctx.fill();
    ctx.strokeStyle = 'rgba(100,80,60,0.3)'; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle='rgba(130,100,70,0.4)';
    ctx.font='12px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('WAITING',x+w/2,y+h/2);
    return;
  }
  const r = order.recipe;
  const frac = Math.max(0, order.patience/order.maxPatience);
  const bc = frac>0.5?'#44cc66':(frac>0.25?'#ffaa22':'#ff4444');

  // Paper background
  ctx.save();
  ctx.beginPath(); ctx.roundRect(x,y,w,h,5); ctx.clip();
  const pg = ctx.createLinearGradient(x,y,x,y+h);
  pg.addColorStop(0,'#f5e8c8'); pg.addColorStop(1,'#e8d8b0');
  ctx.fillStyle=pg; ctx.fill();
  // Left color stripe
  ctx.fillStyle=bc; ctx.fillRect(x,y,5,h);
  ctx.restore();
  ctx.beginPath(); ctx.roundRect(x,y,w,h,5); ctx.strokeStyle='#c8b080'; ctx.lineWidth=1.5; ctx.stroke();

  // Dish name
  ctx.fillStyle='#3d2010';
  ctx.font='bold 14px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.fillText(r.name,x+10,y+6);

  // Ingredients icons
  const steps = r.steps;
  const iconStartX = x+10;
  const iconY = y+h-34;
  for(let j=0;j<steps.length;j++){
    const step=steps[j];
    const ix=iconStartX+j*38;
    drawFoodItem(ctx,ix+12,iconY+14,step.ing,step.state,20);
    // State badge
    const sc=step.state==='chopped'?'#8B6914':step.state==='fried'?'#c8860a':step.state==='steamed'?'#a06060':'#888';
    ctx.fillStyle=sc; ctx.beginPath(); ctx.arc(ix+12,iconY+26,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 7px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(step.state[0].toUpperCase(),ix+12,iconY+26);
  }

  // Patience bar
  const barX=x+10, barY=y+h-8, barW=w-20, barH=5;
  ctx.fillStyle='#1a1a1a'; ctx.fillRect(barX,barY,barW,barH);
  ctx.fillStyle=bc; ctx.fillRect(barX,barY,barW*frac,barH);

  // Points badge
  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.roundRect(x+w-40,y+5,34,16,3); ctx.fill();
  ctx.fillStyle='#ffd700'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('+'+r.points,x+w-23,y+13);
}
