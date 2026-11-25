// drawChef.js - the cook: 120px tall, hat, apron, and the ingredient actually carried.
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
  ctx.beginPath(); ctx.ellipse(2, 8, 26, 9, 0, 0, Math.PI * 2); ctx.fill();

  // Legs
  ctx.fillStyle = '#3a4a6a';
  ctx.fillRect(-14, -18, 11, 26);
  ctx.fillRect(3, -18, 11, 26);
  ctx.fillStyle = '#22304a';
  ctx.fillRect(-16, 4, 14, 8);
  ctx.fillRect(2, 4, 14, 8);

  // Body / jacket
  ctx.fillStyle = '#f4ead6';
  ctx.beginPath();
  ctx.ellipse(0, -44, 26, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  // Apron
  ctx.fillStyle = '#c8443c';
  ctx.beginPath();
  ctx.moveTo(-20, -58);
  ctx.lineTo(20, -58);
  ctx.lineTo(16, -18);
  ctx.lineTo(-16, -18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#a03028';
  ctx.fillRect(-18, -40, 36, 5);
  // Buttons
  ctx.fillStyle = '#ffe0a8';
  ctx.beginPath(); ctx.arc(0, -50, 3, 0, Math.PI * 2); ctx.fill();

  // Arms
  ctx.fillStyle = '#f4ead6';
  ctx.fillRect(-34, -56, 14, 12);
  ctx.fillRect(20, -56, 14, 12);
  ctx.fillStyle = '#f0cfa2';
  ctx.beginPath(); ctx.arc(-27, -44, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(27, -44, 8, 0, Math.PI * 2); ctx.fill();

  // Head
  ctx.fillStyle = '#f6d6a8';
  ctx.beginPath(); ctx.arc(0, -78, 18, 0, Math.PI * 2); ctx.fill();
  // Eyes
  ctx.fillStyle = '#2b2b2b';
  ctx.beginPath(); ctx.arc(-6 + f * 2, -80, 2.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(6 + f * 2, -80, 2.6, 0, Math.PI * 2); ctx.fill();
  // Smile
  ctx.strokeStyle = '#b07050';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(f * 2, -74, 6, 0.2, Math.PI - 0.2); ctx.stroke();

  // Chef hat
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-16, -104, 32, 14);
  ctx.beginPath();
  ctx.arc(-9, -104, 9, Math.PI, 0);
  ctx.arc(9, -104, 9, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#c8443c';
  ctx.fillRect(-16, -92, 32, 6);

  // Carried ingredient, drawn at 64px in front of the chef
  if (player.carrying) {
    const ix = f * 34;
    drawFoodItem(ctx, ix, -52, player.carrying.ing, player.carrying.state, 64);
  }

  ctx.restore();
}