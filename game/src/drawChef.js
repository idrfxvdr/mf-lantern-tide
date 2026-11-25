// drawChef.js - the cook: a thick readable silhouette about 120px tall, with the
// ingredient actually carried drawn in front. Stands beside stations via layout.js.
import { drawFoodItem } from './drawFood.js';

export function drawChef(ctx, player, time) {
  const x = player.getX();
  const y = player.getY();
  const walk = player.isMoving() ? Math.sin(time * 12) * 3 : Math.sin(time * 3) * 1.2;
  const f = player.facing || 1;

  ctx.save();
  ctx.translate(x, y + walk);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.beginPath(); ctx.ellipse(2, 8, 28, 10, 0, 0, Math.PI * 2); ctx.fill();

  // Legs
  ctx.fillStyle = '#33425f';
  ctx.fillRect(-15, -18, 12, 28);
  ctx.fillRect(3, -18, 12, 28);
  ctx.fillStyle = '#1d2940';
  ctx.fillRect(-18, 6, 16, 9);
  ctx.fillRect(2, 6, 16, 9);

  // Body / jacket
  ctx.fillStyle = '#f4ead6';
  ctx.beginPath(); ctx.ellipse(0, -46, 28, 32, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9b48e'; ctx.lineWidth = 2; ctx.stroke();
  // Apron
  ctx.fillStyle = '#c8443c';
  ctx.beginPath();
  ctx.moveTo(-21, -62); ctx.lineTo(21, -62); ctx.lineTo(17, -18); ctx.lineTo(-17, -18);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#a03028';
  ctx.fillRect(-19, -42, 38, 6);
  ctx.fillStyle = '#ffe0a8';
  ctx.beginPath(); ctx.arc(0, -54, 3.4, 0, Math.PI * 2); ctx.fill();

  // Arms
  ctx.fillStyle = '#f4ead6';
  ctx.fillRect(-36, -58, 15, 13);
  ctx.fillRect(21, -58, 15, 13);
  ctx.fillStyle = '#f0cfa2';
  ctx.beginPath(); ctx.arc(-29, -45, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(29, -45, 9, 0, Math.PI * 2); ctx.fill();

  // Head
  ctx.fillStyle = '#f6d6a8';
  ctx.beginPath(); ctx.arc(0, -82, 19, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d0a878'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath(); ctx.arc(-6 + f * 2, -84, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6 + f * 2, -84, 2.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#b07050'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(f * 2, -77, 6, 0.2, Math.PI - 0.2); ctx.stroke();

  // Chef hat
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-17, -110, 34, 15);
  ctx.beginPath();
  ctx.arc(-10, -110, 10, Math.PI, 0);
  ctx.arc(10, -110, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#c8443c';
  ctx.fillRect(-17, -97, 34, 7);

  // Carried ingredient, drawn large in front of the chef
  if (player.carrying) {
    const ix = f * 38;
    drawFoodItem(ctx, ix, -54, player.carrying.ing, player.carrying.state, 66);
  }

  ctx.restore();
}