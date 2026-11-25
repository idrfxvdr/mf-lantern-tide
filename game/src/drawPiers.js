// drawPiers.js - Two big vertical piers with bridge and lanterns
const PC = {dark:'#2a1808',mid:'#4a2e14',light:'#6b4422',top:'#8a5a30',rope:'#7a6040'};

export function drawPiers(ctx, W, H, state) {
  const time = state.time || 0;
  const LP = {x:20, y:100, w:500, h:680};
  const RP = {x:780, y:100, w:480, h:680};
  const waterY = H * 0.52;

  // Shadow under piers into water
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(LP.x+8, waterY, LP.w, H-waterY);
  ctx.fillRect(RP.x+8, waterY, RP.w, H-waterY);

  drawPierFull(ctx, LP, time, false);
  drawPierFull(ctx, RP, time, true);
  drawBridge(ctx, W, H, state);
  drawBoat(ctx, LP.x + 30, waterY + 60, 90, time);
  drawBoat(ctx, RP.x + RP.w - 80, waterY + 50, 75, time + 2.5);
  drawBoat(ctx, 560, waterY + 30, 60, time + 1.2);
}

function drawPierFull(ctx, P, time, isRight) {
  // Main pier body
  const g = ctx.createLinearGradient(0, P.y, 0, P.y + P.h);
  g.addColorStop(0, PC.top); g.addColorStop(0.08, PC.light); g.addColorStop(0.25, PC.mid); g.addColorStop(1, PC.dark);
  ctx.fillStyle = g; ctx.fillRect(P.x, P.y, P.w, P.h);

  // Wood planks (horizontal)
  ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1;
  for (let py = P.y + 16; py < P.y + P.h; py += 16) {
    ctx.beginPath(); ctx.moveTo(P.x, py); ctx.lineTo(P.x + P.w, py); ctx.stroke();
  }
  // Vertical joints every 65px
  ctx.strokeStyle = 'rgba(0,0,0,0.1)';
  for (let px = P.x + 65; px < P.x + P.w; px += 65) {
    ctx.beginPath(); ctx.moveTo(px, P.y); ctx.lineTo(px, P.y + P.h); ctx.stroke();
  }

  // Top edge thick bar
  ctx.fillStyle = PC.top; ctx.fillRect(P.x, P.y, P.w, 10);
  ctx.fillStyle = PC.light; ctx.fillRect(P.x, P.y + 10, P.w, 4);
  // Front face edge
  ctx.strokeStyle = PC.light; ctx.lineWidth = 2;
  ctx.strokeRect(P.x, P.y, P.w, P.h);

  // Posts at corners
  ctx.fillStyle = PC.mid;
  ctx.fillRect(P.x + 10, P.y, 8, 14);
  ctx.fillRect(P.x + P.w - 18, P.y, 8, 14);

  // Lantern strings along top edge
  const lxs = isRight ? [820, 950, 1080, 1210] : [70, 200, 340, 470];
  for (const lx of lxs) {
    // Rope
    ctx.strokeStyle = PC.rope; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(lx, P.y); ctx.lineTo(lx, P.y - 20); ctx.stroke();
    drawLantern(ctx, lx, P.y - 20, 16);
  }

  // Decorative rope railings along pier edges
  drawRailing(ctx, P.x, P.y + P.h - 14, P.w, false);
}

function drawRailing(ctx, x, y, w, horizontal) {
  ctx.strokeStyle = PC.rope; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.stroke();
  ctx.fillStyle = PC.mid;
  const spacing = 55;
  for (let rx = x + 30; rx < x + w - 20; rx += spacing) {
    ctx.fillRect(rx - 2, y - 22, 4, 22);
  }
}

function drawLantern(ctx, x, y, size) {
  ctx.save();
  const g2 = ctx.createRadialGradient(x, y, 2, x, y, size * 3.5);
  g2.addColorStop(0, 'rgba(255,140,32,0.35)');
  g2.addColorStop(0.4, 'rgba(255,110,20,0.12)');
  g2.addColorStop(1, 'transparent');
  ctx.fillStyle = g2; ctx.fillRect(x - size*3.5, y - size*3.5, size*7, size*7);

  ctx.fillStyle = '#ff8c20';
  ctx.beginPath(); ctx.ellipse(x, y, size*0.5, size*0.65, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = '#ffb040'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = PC.rope;
  ctx.fillRect(x - size*0.3, y - size*0.65, size*0.6, size*0.12);
  ctx.fillRect(x - size*0.25, y + size*0.55, size*0.5, size*0.1);
  ctx.restore();
}

function drawBridge(ctx, W, H, state) {
  const tide = state.tide;
  const wobble = tide && tide.isHighTide ? Math.sin((state.time||0) * 2.5) * 5 : 0;
  const bx = 530, bw = 240, by = H/2 + 5;

  ctx.save(); ctx.translate(0, wobble);

  // Water under bridge
  const wg = ctx.createLinearGradient(0, by, 0, by + 80);
  wg.addColorStop(0, '#0a1e28'); wg.addColorStop(1, '#060f18');
  ctx.fillStyle = wg; ctx.fillRect(bx, by, bw, 80);

  // Bridge planks
  ctx.fillStyle = '#5a3820'; ctx.fillRect(bx, by - 5, bw, 22);
  ctx.strokeStyle = '#7a5030'; ctx.lineWidth = 1;
  for (let px = bx; px < bx + bw; px += 28) {
    ctx.beginPath(); ctx.moveTo(px, by - 5); ctx.lineTo(px, by + 17); ctx.stroke();
  }
  // Rope railings
  ctx.strokeStyle = PC.rope; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(bx, by - 22); ctx.lineTo(bx+bw, by - 22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx, by + 17); ctx.lineTo(bx+bw, by + 17); ctx.stroke();
  ctx.fillStyle = PC.mid;
  for (let px = bx + 40; px < bx + bw - 20; px += 48) {
    ctx.fillRect(px - 2, by - 22, 4, 40);
  }
  // Label
  ctx.fillStyle = 'rgba(255,200,100,0.45)';
  ctx.font = 'bold 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(tide && tide.isHighTide ? 'DRIFTING' : 'BRIDGE', bx + bw/2, by + 55);

  ctx.restore();
}

function drawBoat(ctx, x, y, size, time) {
  const bob = Math.sin(time * 1.4 + x * 0.008) * 4;
  ctx.save(); ctx.translate(x + size/2, y + bob);

  // Hull
  ctx.fillStyle = '#3d1e08';
  ctx.beginPath();
  ctx.moveTo(-size/2, 0);
  ctx.quadraticCurveTo(-size*0.6, 18, -size/3, 22);
  ctx.lineTo(size/3, 22);
  ctx.quadraticCurveTo(size*0.6, 18, size/2, 0);
  ctx.lineTo(size*0.38, -12);
  ctx.lineTo(-size*0.38, -12);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#5a3820'; ctx.lineWidth = 1.5; ctx.stroke();

  // Small lantern
  ctx.fillStyle = '#ff8c20';
  ctx.beginPath(); ctx.ellipse(0, -18, 4, 6, 0, 0, Math.PI*2); ctx.fill();
  const lg = ctx.createRadialGradient(0, -18, 2, 0, -18, 22);
  lg.addColorStop(0, 'rgba(255,140,32,0.22)'); lg.addColorStop(1, 'transparent');
  ctx.fillStyle = lg; ctx.fillRect(-22, -40, 44, 44);

  ctx.restore();
}
