// drawWater.js - Water layer: sky, moon, stars, water ripples, reflections
export function drawWater(ctx, W, H, state) {
  const time = state.time || 0;
  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.55);
  sky.addColorStop(0, '#020a18');
  sky.addColorStop(0.5, '#060f1e');
  sky.addColorStop(1, '#0d1e2e');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.55);

  // Moon glow
  const mx = W * 0.72, my = 80;
  const mg = ctx.createRadialGradient(mx, my, 5, mx, my, 160);
  mg.addColorStop(0, 'rgba(255,248,200,0.18)');
  mg.addColorStop(0.5, 'rgba(255,220,120,0.05)');
  mg.addColorStop(1, 'transparent');
  ctx.fillStyle = mg; ctx.fillRect(mx - 160, my - 160, 320, 320);
  ctx.fillStyle = '#ffe8a0';
  ctx.beginPath(); ctx.arc(mx, my, 32, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(200,160,80,0.25)';
  ctx.beginPath(); ctx.arc(mx - 10, my - 6, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(mx + 12, my + 10, 5, 0, Math.PI * 2); ctx.fill();

  // Stars
  ctx.fillStyle = 'rgba(255,255,220,0.7)';
  const rng = state.bgRng;
  for (let i = 0; i < 60; i++) {
    const sx = rng() * W, sy = rng() * H * 0.32;
    const ss = rng() * 1.5 + 0.4, sa = 0.3 + rng() * 0.7;
    ctx.globalAlpha = sa;
    ctx.beginPath(); ctx.arc(sx, sy, ss, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Horizon warm glow
  const hg = ctx.createLinearGradient(0, H * 0.35, 0, H * 0.52);
  hg.addColorStop(0, 'transparent');
  hg.addColorStop(0.5, 'rgba(255,140,50,0.08)');
  hg.addColorStop(1, 'transparent');
  ctx.fillStyle = hg; ctx.fillRect(0, H * 0.35, W, H * 0.17);

  // Far shore silhouette
  ctx.fillStyle = 'rgba(8,18,28,0.8)';
  ctx.beginPath(); ctx.moveTo(0, H * 0.50);
  for (let x = 0; x <= W; x += 50) {
    ctx.lineTo(x, H * 0.50 + Math.sin(x * 0.008) * 10 - 12);
  }
  ctx.lineTo(W, H * 0.50 + 8); ctx.lineTo(W, H * 0.50);
  ctx.closePath(); ctx.fill();

  // Shore buildings silhouettes with warm window lights
  ctx.fillStyle = 'rgba(10,22,32,0.9)';
  const buildings = [[30, 40], [100, 55], [200, 35], [350, 50], [500, 38],
                    [W-60, 45], [W-130, 52], [W-230, 40]];
  for (const [bx, bh] of buildings) {
    const bw = 28 + (bx % 20);
    const by = H * 0.50 - bh;
    ctx.fillRect(bx - bw/2, by, bw, bh + 5);
    ctx.fillStyle = 'rgba(255,190,70,0.25)';
    ctx.fillRect(bx - 6, by + 4, 5, 6);
    ctx.fillRect(bx + 1, by + 14, 5, 6);
    ctx.fillStyle = 'rgba(10,22,32,0.9)';
  }

  // Water body
  const waterY = H * 0.52;
  const wg = ctx.createLinearGradient(0, waterY, 0, H);
  wg.addColorStop(0, '#162838');
  wg.addColorStop(0.4, '#0c1a24');
  wg.addColorStop(1, '#040c14');
  ctx.fillStyle = wg; ctx.fillRect(0, waterY, W, H - waterY);

  // Water ripples
  for (let i = 0; i < 10; i++) {
    const wy = waterY + 10 + i * 38;
    const al = 0.12 - i * 0.01;
    ctx.strokeStyle = `rgba(40,100,140,${al})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 12) {
      const wave = Math.sin(x * 0.012 + time * (0.7 + i * 0.1)) * (2.5 + i * 0.3);
      if (x === 0) ctx.moveTo(x, wy + wave); else ctx.lineTo(x, wy + wave);
    }
    ctx.stroke();
  }

  // Moon reflection
  const rg = ctx.createLinearGradient(mx, waterY, mx, waterY + 100);
  rg.addColorStop(0, 'rgba(255,230,150,0.18)');
  rg.addColorStop(1, 'transparent');
  ctx.fillStyle = rg; ctx.fillRect(mx - 40, waterY, 80, 110);

  // Lantern reflections in water
  const lpos = [[90, waterY + 130], [310, waterY + 110], [580, waterY + 140],
                [850, waterY + 120], [1100, waterY + 130]];
  for (const [lx, ly] of lpos) {
    const wr = ctx.createRadialGradient(lx, ly, 0, lx, ly, 55);
    wr.addColorStop(0, 'rgba(255,140,32,0.14)');
    wr.addColorStop(1, 'transparent');
    ctx.fillStyle = wr; ctx.fillRect(lx - 55, ly - 30, 110, 60);
  }
}
