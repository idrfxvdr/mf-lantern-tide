// particles.js - steam, smoke, chop flecks, serve sparkles and combo bursts.
// A seeded rng is injected so replays and screenshots are deterministic.
export class Particles {
  constructor(rng = Math.random) {
    this.items = [];
    this.rng = rng;
  }

  emit(x, y, type = 'steam', count = 5, opts = {}) {
    const r = this.rng;
    for (let i = 0; i < count; i++) {
      this.items.push({
        x, y,
        vx: (r() - 0.5) * (opts.spread || 30),
        vy: -(r() * (opts.upSpeed || 40) + 10),
        life: opts.life || 1.5,
        maxLife: opts.life || 1.5,
        size: opts.size || (4 + r() * 4),
        type,
        color: opts.color || '#ffffff',
        alpha: 1,
        rot: r() * Math.PI * 2,
        rotV: (r() - 0.5) * 4,
        squash: 1,
        stretch: 1,
      });
    }
  }

  emitSteam(x, y) {
    this.emit(x, y, 'steam', 3, { color: 'rgba(225,235,245,0.65)', upSpeed: 50, spread: 20, life: 1.3, size: 6 });
  }

  emitSmoke(x, y) {
    this.emit(x, y, 'smoke', 5, { color: 'rgba(70,66,62,0.7)', upSpeed: 30, spread: 26, life: 1.8, size: 10 });
  }

  emitChop(x, y) {
    this.emit(x, y, 'chop', 9, { color: '#8B6914', upSpeed: 90, spread: 70, life: 0.6, size: 5 });
  }

  emitServe(x, y) {
    this.emit(x, y, 'serve', 14, { color: '#ffd700', upSpeed: 110, spread: 90, life: 0.9, size: 6 });
  }

  emitBurn(x, y) {
    this.emit(x, y, 'smoke', 6, { color: '#4a4a4a', upSpeed: 30, spread: 25, life: 2, size: 10 });
  }

  emitCombo(x, y, mult) {
    const r = this.rng;
    for (let i = 0; i < mult * 3; i++) {
      const angle = (i / (mult * 3)) * Math.PI * 2;
      this.items.push({
        x, y,
        vx: Math.cos(angle) * 90,
        vy: Math.sin(angle) * 90 - 30,
        life: 0.9, maxLife: 0.9, size: 8, type: 'sparkle',
        color: ['#ffd700', '#ff6b6b', '#6bff6b', '#6b9bff'][i % 4],
        alpha: 1, rot: 0, rotV: r() * 6 - 3, squash: 1, stretch: 1,
      });
    }
  }

  update(dt) {
    for (const p of this.items) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 26 * dt;
      if (p.type === 'steam' || p.type === 'smoke') {
        p.vy -= 22 * dt;
        p.size += dt * 3;
        p.vx += (this.rng() - 0.5) * 18 * dt;
      }
      if (p.rotV) p.rot += p.rotV * dt;
      const t = Math.max(0, p.life / p.maxLife);
      p.alpha = t;
      p.life -= dt;
      if (p.type === 'chop' || p.type === 'sparkle') {
        p.squash = 0.5 + 0.5 * t;
        p.stretch = 1.5 - 0.5 * t;
      }
    }
    this.items = this.items.filter((p) => p.life > 0);
  }

  draw(ctx) {
    for (const p of this.items) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      if (p.type === 'steam' || p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'chop') {
        ctx.fillStyle = p.color;
        ctx.fillRect((-p.size / 2) * p.squash, (-p.size / 2) * p.stretch, p.size * p.squash, p.size * p.stretch);
      } else if (p.type === 'serve' || p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        const s = p.size * (0.5 + p.alpha * 0.5);
        ctx.beginPath();
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          ctx.lineTo(Math.cos(a) * s, Math.sin(a) * s);
          const a2 = ((i + 0.5) / 4) * Math.PI * 2;
          ctx.lineTo(Math.cos(a2) * s * 0.3, Math.sin(a2) * s * 0.3);
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }
}