// drawCrates.js - ingredient crates with food heaped in them, labels directly underneath.
import { CRATES } from './layout.js';
import { INGREDIENTS } from './recipes.js';
import { drawFoodItem } from './drawFood.js';

export function drawCrates(ctx, state) {
  for (const c of CRATES) {
    const info = INGREDIENTS[c.ing];
    const x = c.x - c.w / 2;
    const y = c.y - c.h / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(x + 6, y + 8, c.w, c.h);

    // Wooden crate body
    const g = ctx.createLinearGradient(0, y, 0, y + c.h);
    g.addColorStop(0, '#9a6a38');
    g.addColorStop(0.35, '#6b4422');
    g.addColorStop(1, '#452a12');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, c.w, c.h);

    // Food heaped above the rim
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y - 26, c.w, c.h + 26);
    ctx.clip();
    drawFoodItem(ctx, c.x - 22, y + 4, c.ing, 'raw', 48);
    drawFoodItem(ctx, c.x + 20, y + 2, c.ing, 'raw', 52);
    drawFoodItem(ctx, c.x, y - 14, c.ing, 'raw', 50);
    ctx.restore();

    // Front slats and rim
    ctx.strokeStyle = '#3d2410';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, c.w, c.h);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + c.h * 0.42); ctx.lineTo(x + c.w, y + c.h * 0.42);
    ctx.moveTo(x, y + c.h * 0.74); ctx.lineTo(x + c.w, y + c.h * 0.74);
    ctx.stroke();
    ctx.fillStyle = '#a8763f';
    ctx.fillRect(x - 4, y - 6, c.w + 8, 10);

    // Label directly under the crate
    ctx.fillStyle = '#ffe0a8';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(info.name, c.x, c.labelY);
  }
}