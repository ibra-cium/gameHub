import { Vec2 } from '../core/Vec2.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class Particle {
  constructor(opt = {}) {
    this.pos = opt.pos ? opt.pos.copy() : new Vec2();
    this.vel = opt.vel ? opt.vel.copy() : new Vec2();
    this.acc = opt.acc ? opt.acc.copy() : new Vec2();
    this.friction = opt.friction || BALANCE.particles.defaultFriction;
    this.life = opt.life || BALANCE.particles.defaultLife;
    this.maxLife = this.life;
    this.size = opt.size || BALANCE.particles.defaultSize;
    this.endSize = opt.endSize !== undefined ? opt.endSize : 0;
    this.color = opt.color || PALETTE.particles.defaultColor;
    this.alpha = opt.alpha !== undefined ? opt.alpha : 1.0;
    this.rot = opt.rot || Math.random() * Math.PI * 2;
    this.rotSpeed = opt.rotSpeed || (Math.random() - 0.5) * 4;
    this.type = opt.type || 'circle'; // circle, blob, ring, rbc
    this.radiusX = opt.radiusX || this.size;
    this.radiusY = opt.radiusY || this.size * 0.6;
    this.dead = false;
  }

  update(dt) {
    this.vel.add(this.acc);
    this.vel.mult(this.friction);
    this.pos.x += this.vel.x * dt * 60;
    this.pos.y += this.vel.y * dt * 60;
    this.rot += this.rotSpeed * dt;
    this.life -= dt;
    if (this.life <= 0) {
      this.dead = true;
    }
  }

  draw(ctx) {
    const progress = 1 - Math.max(0, this.life / this.maxLife);
    const currentAlpha = Math.max(0, this.alpha * (1 - progress));
    const currentSize = Math.max(0.1, this.size + (this.endSize - this.size) * progress);

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = currentAlpha;

    if (this.type === 'ring') {
      ctx.strokeStyle = this.color;
      ctx.lineWidth = Math.max(1, 4 * (1 - progress));
      ctx.beginPath();
      ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.type === 'blob') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, currentSize, currentSize * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'rbc') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.environment.rbcParticleCenter;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radiusX * 0.45, this.radiusY * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'sparkle') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      const s = currentSize * 1.5;
      const inner = s * 0.25;
      ctx.moveTo(0, -s);
      ctx.quadraticCurveTo(0, -inner, inner, 0);
      ctx.quadraticCurveTo(0, inner, 0, s);
      ctx.quadraticCurveTo(0, inner, -inner, 0);
      ctx.quadraticCurveTo(0, -inner, 0, -s);
      ctx.fill();
    } else if (this.type === 'shard') {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      const s = currentSize;
      ctx.moveTo(-s * 0.35, -s);
      ctx.lineTo(s * 0.45, -s * 0.5);
      ctx.lineTo(s * 0.25, s * 0.9);
      ctx.lineTo(-s * 0.5, s * 0.4);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(0, 0, currentSize, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  emit(opt) {
    this.particles.push(new Particle(opt));
  }

  emitBurst(x, y, count, options = {}) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (options.minSpeed || 1.5) + Math.random() * ((options.maxSpeed || 7.0) - (options.minSpeed || 1.5));
      this.emit({
        pos: new Vec2(x, y),
        vel: new Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        size: options.size || (3 + Math.random() * 5),
        endSize: options.endSize || 0,
        color: options.color || PALETTE.particles.defaultColor,
        life: options.life || (BALANCE.particles.burstMinLife + Math.random() * BALANCE.particles.burstRandLife),
        friction: options.friction || BALANCE.particles.burstFriction,
        type: options.type || 'circle'
      });
    }
  }

  emitSparkleBurst(x, y, count, options = {}) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (options.minSpeed || 1.0) + Math.random() * ((options.maxSpeed || 4.5) - (options.minSpeed || 1.0));
      this.emit({
        pos: new Vec2(x, y),
        vel: new Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        size: options.size || (3.5 + Math.random() * 3.5),
        endSize: 0,
        color: options.color || PALETTE.debris.sparkleBurst || PALETTE.particles.defaultColor,
        life: options.life || (0.35 + Math.random() * 0.35),
        friction: options.friction || 0.94,
        rotSpeed: (Math.random() - 0.5) * 6,
        type: 'sparkle'
      });
    }
  }

  emitShockwave(x, y, maxRadius, color = PALETTE.particles.defaultColor, duration = BALANCE.particles.shockwaveDuration) {
    this.emit({
      pos: new Vec2(x, y),
      size: 4,
      endSize: maxRadius,
      color: color,
      life: duration,
      type: 'ring',
      friction: 1.0
    });
  }

  emitRing(x, y, count, options = {}) {
    const radius = options.radius || 12;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = options.speed || 2.5;
      this.emit({
        pos: new Vec2(x + Math.cos(angle) * radius, y + Math.sin(angle) * radius),
        vel: new Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        size: options.size || (3 + Math.random() * 3),
        endSize: 0,
        color: options.color || PALETTE.particles.defaultColor,
        life: options.life || 0.35,
        friction: options.friction || 0.92,
        type: options.type || 'blob'
      });
    }
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(dt);
      if (p.dead) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].draw(ctx);
    }
  }
}
