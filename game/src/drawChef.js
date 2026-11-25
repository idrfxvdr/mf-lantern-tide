// drawChef.js - Chef character rendering
export function drawChef(ctx, x, y, carrying, facing, bob) {
  ctx.save();
  ctx.translate(x, y + bob);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(2, 22, 14, 5, 0, 0, Math.PI*2); ctx.fill();

  // Body (apron over white shirt)
  ctx.fillStyle = '#f0e0c0';
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI*2); ctx.fill();
  // Apron
  ctx.fillStyle = '#c84040';
  ctx.fillRect(-10, -8, 20, 20);
  ctx.fillStyle = '#a03030';
  ctx.fillRect(-8, -6, 16, 2);

  // Arms
  ctx.fillStyle = '#f0d0a0';
  const armX = facing * 1;
  // Left arm
  ctx.fillRect(-16, -8, 8, 5);
  // Right arm (holding item)
  ctx.fillRect(8, -8, 8, 5);

  // Head
  ctx.fillStyle = '#f0d0a0';
  ctx.beginPath(); ctx.arc(0, -22, 11, 0, Math.PI*2); ctx.fill();
  // Chef hat
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-8, -42, 16, 14);
  ctx.beginPath(); ctx.arc(0, -42, 8, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#c84040';
  ctx.fillRect(-8, -30, 16, 4);
  // Eyes
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(-4, -23, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -23, 2, 0, Math.PI*2); ctx.fill();

  // Carrying item
  if (carrying) {
    const ix = 0 + facing * 18;
    ctx.save();
    ctx.translate(ix, -12);
    const { drawFoodItem } = require('./drawFood.js');
    // Fallback if ES module import fails
    ctx.restore();
  }

  ctx.restore();
}

export function drawChefSimple(ctx, x, y, carrying, facing) {
  // Simplified version using basic canvas primitives
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(2, 24, 14, 5, 0, 0, Math.PI*2); ctx.fill();

  // Body
  ctx.fillStyle = '#f0e0c0';
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI*2); ctx.fill();
  // Apron
  ctx.fillStyle = '#c84040';
  ctx.fillRect(-10, -8, 20, 20);

  // Head
  ctx.fillStyle = '#f0d0a0';
  ctx.beginPath(); ctx.arc(0, -22, 11, 0, Math.PI*2); ctx.fill();
  // Chef hat
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(-9, -43, 18, 15);
  ctx.beginPath(); ctx.arc(0, -43, 9, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#c84040';
  ctx.fillRect(-9, -30, 18, 4);
  // Eyes
  ctx.fillStyle = '#333';
  ctx.beginPath(); ctx.arc(-4, -23, 2, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(4, -23, 2, 0, Math.PI*2); ctx.fill();

  // Arms
  ctx.fillStyle = '#f0d0a0';
  ctx.fillRect(-18, -10, 8, 5);
  if (carrying) {
    ctx.fillRect(10, -10, 10, 5);
    // Item above hand
    ctx.save();
    ctx.translate(14, -18);
    ctx.restore();
  } else {
    ctx.fillRect(10, -10, 8, 5);
  }

  ctx.restore();
}

// Import drawFoodItem dynamically - we'll call it separately
export function drawChefWithItem(ctx, x, y, carrying, facing, time) {
  const bob = Math.sin(time * 3) * 2;
  drawChefSimple(ctx, x, y, !!carrying, facing);
  if (carrying) {
    const { drawFoodItem } = window._drawFood || {};
    const ix = x + facing * 16;
    const iy = y - 18 + bob;
    // Draw a colored circle for the item if drawFoodItem not available
    const state = carrying.state;
    const ing = carrying.ing;
    ctx.fillStyle = state === 'burned' ? '#333' :
                    state === 'fried' ? '#c8860a' :
                    state === 'steamed' ? '#e8c8d0' : '#ffd080';
    ctx.beginPath(); ctx.arc(ix, iy, 18, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#7a5030'; ctx.lineWidth = 2; ctx.stroke();
    // Ingredient name
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(ing ? ing.slice(0,4) : '?', ix, iy);
  }
}
