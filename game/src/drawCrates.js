// drawCrates.js - ingredient crates with the food sitting down inside them,
// labels directly underneath, all positioned from layout.js.
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

    // Back of the crate
    const back = ctx.createLinearGradient(0, y, 0, y + c.h);
    back.addColorStop(0, '#7a5028');
    back.addColorStop(1, '#3a2410');
    ctx.fillStyle = back;
    ctx.fillRect(x, y, c.w, c.h);

    // Food heaped down inside the crate (clipped so it never crosses the rim)
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 5, y + 7, c.w - 10, c.h * 0.66);
    ctx.clip();
    drawFoodItem(ctx, c.x - 24, y + 34, c.ing, 'raw', 46);
    drawFoodItem(ctx, c.x + 22, y + 30, c.ing, 'raw', 50);
    drawFoodItem(ctx, c.x - 2, y + 16, c.ing, 'raw', 48);
    ctx.restore();

    // Front panel with thickness, drawn over the lower food
    const front = ctx.createLinearGradient(0, y + c.h * 0.5, 0, y + c.h);
    front.addColorStop(0, '#8a5a30');
    front.addColorStop(1, '#4a2c14');
    ctx.fillStyle = front;
    ctx.fillRect(x, y + c.h * 0.54, c.w, c.h * 0.46);
    ctx.strokeStyle = '#3d2410';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, c.w, c.h);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + c.h * 0.72); ctx.lineTo(x + c.w, y + c.h * 0.72);
    ctx.stroke();

    // Top rim
    ctx.fillStyle = '#a8763f';
    ctx.fillRect(x - 4, y - 5, c.w + 8, 11);
    ctx.fillStyle = '#c08a4a';
    ctx.fillRect(x - 4, y - 5, c.w + 8, 3);

    // Label directly under the crate
    ctx.fillStyle = '#ffe0a8';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(info.name, c.x, c.labelY);
  }
}