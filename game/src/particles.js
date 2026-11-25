// Particles, steam, and visual effects
export class Particles {
  constructor() {
    this.items = [];
  }

  emit(x, y, type = 'steam', count = 5, opts = {}) {
    for (let i = 0; i < count; i++) {
      this.items.push({
        x, y,
        vx: (Math.random() - 0.5) * (opts.spread || 30),
        vy: -(Math.random() * (opts.upSpeed || 40) + 10),
        life: opts.life || 1.5,
        maxLife: opts.life || 1.5,
        size: opts.size || (4 + Math.random() * 4),
        type,
        color: opts.color || '#ffffff',
        alpha: 1,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 4,
        squash: 1,
        stretch: 1,
      });
    }
  }

  emitSteam(x, y) {
    this.emit(x, y, 'steam', 3, {
      color: 'rgba(220,230,240,0.6)',
      upSpeed: 50,
      spread: 20,
      life: 1.2,
      size: 6,
    });
  }

  emitChop(x, y) {
    this.emit(x, y, 'chop', 8, {
      color: '#8B6914',
      upSpeed: 80,
      spread: 60,
      life: 0.6,
      size: 5,
    });
  }

  emitServe(x, y) {
    this.emit(x, y, 'serve', 12, {
      color: '#ffd700',
      upSpeed: 100,
      spread: 80,
      life: 0.8,
      size: 6,
    });
  }

  emitBurn(x, y) {
    this.emit(x, y, 'smoke', 6, {
      color: '#555555',
      upSpeed: 30,
      spread: 25,
      life: 2,
      size: 10,
    });
  }

  emitCombo(x, y, mult) {
    for (let i = 0; i < mult * 3; i++) {
      const angle = (i / (mult * 3)) * Math.PI * 2;
      this.items.push({
        x, y,
        vx: Math.cos(angle) * 80,
        vy: Math.sin(angle) * 80 - 30,
        life: 0.8,
        maxLife: 0.8,
        size: 8,
        type: 'sparkle',
        color: ['#ffd700', '#ff6b6b', '#6bff6b', '#6b6bff'][i % 4],
        alpha: 1,
        rot: 0,
        rotV: 0,
        squash: 1,
        stretch: 1,
      });
    }
  }

  update(dt) {
    for (const p of this.items) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 30 * dt; // gravity for some
      if (p.type === 'steam' || p.type === 'smoke') {
        p.vy -= 20 * dt; // float up
        p.size += dt * 3;
        p.vx += (Math.random() - 0.5) * 20 * dt;
      }
      if (p.rotV) p.rot += p.rotV * dt;
      const t = p.life / p.maxLife;
      p.alpha = t;
      p.life -= dt;
      // Squash and stretch
      if (p.type === 'chop' || p.type === 'sparkle') {
        p.squash = 0.5 + 0.5 * t;
        p.stretch = 1.5 - 0.5 * t;
      }
    }
    this.items = this.items.filter(p => p.life > 0);
  }

  draw(ctx) {
    for (const p of this.items) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.type === 'steam' || p.type === 'smoke') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.type === 'chop') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2 * p.squash, -p.size / 2 * p.stretch,
                      p.size * p.squash, p.size * p.stretch);
      } else if (p.type === 'serve' || p.type === 'sparkle') {
        ctx.fillStyle = p.color;
        const s = p.size * (0.5 + p.alpha * 0.5);
        // Star shape
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
