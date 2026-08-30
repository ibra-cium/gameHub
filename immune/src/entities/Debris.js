import { Entity } from './Entity.js';
import { Vec2 } from '../core/Vec2.js';
import { drawSmoothClosedCurve } from '../render/drawUtils.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class Debris extends Entity {
  constructor(x = 0, y = 0, variant = 'debris') {
    super(x, y, BALANCE.debris.baseRadius);
    this.variant = variant; // 'debris' | 'deadCell' | 'dustClump'
    this.collected = false;

    const angle = Math.random() * Math.PI * 2;
    const speed = BALANCE.debris.driftSpeedMin + Math.random() * (BALANCE.debris.driftSpeedMax - BALANCE.debris.driftSpeedMin);
    this.vel = new Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed);

    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.35;

    this.spots = [];
    this.dustParticles = [];
    this.irregularities = [];

    this.initPoints(BALANCE.debris.numPoints);
    this.generateDetails();
  }

  generateDetails() {
    this.spots = [];
    this.dustParticles = [];
    this.irregularities = [];

    for (let i = 0; i < this.numPoints; i++) {
      if (this.variant === 'deadCell') {
        this.irregularities.push((Math.sin(i * 1.8) * 3.5) + ((i % 3 === 0) ? -3.0 : 1.5));
      } else if (this.variant === 'dustClump') {
        this.irregularities.push((Math.random() - 0.5) * 5.0);
      } else {
        this.irregularities.push((i % 2 === 0 ? -3.0 : 2.5) + (i % 3 === 0 ? 2.5 : -1.5));
      }
    }

    if (this.variant === 'deadCell') {
      const spotCount = 4;
      for (let i = 0; i < spotCount; i++) {
        const spotAngle = Math.random() * Math.PI * 2;
        const spotDist = (0.2 + Math.random() * 0.45) * this.radius;
        this.spots.push({
          x: Math.cos(spotAngle) * spotDist,
          y: Math.sin(spotAngle) * spotDist,
          size: 1.5 + Math.random() * 2.0
        });
      }
    } else if (this.variant === 'dustClump') {
      const clumpCount = 7 + Math.floor(Math.random() * 5);
      for (let i = 0; i < clumpCount; i++) {
        const pAngle = Math.random() * Math.PI * 2;
        const pDist = (0.15 + Math.random() * 0.7) * this.radius;
        this.dustParticles.push({
          x: Math.cos(pAngle) * pDist,
          y: Math.sin(pAngle) * pDist,
          size: 1.8 + Math.random() * 2.6,
          phase: Math.random() * Math.PI * 2
        });
      }
    } else {
      const spotCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < spotCount; i++) {
        const spotAngle = Math.random() * Math.PI * 2;
        const spotDist = (0.2 + Math.random() * 0.5) * this.radius;
        this.spots.push({
          x: Math.cos(spotAngle) * spotDist,
          y: Math.sin(spotAngle) * spotDist,
          size: 1.5 + Math.random() * 2.0
        });
      }
    }
  }

  collect(soundFx = null, particleSys = null) {
    if (this.collected) return false;
    this.collected = true;

    if (soundFx) {
      soundFx.playDebrisCollect();
    }

    if (particleSys) {
      particleSys.emitSparkleBurst(this.pos.x, this.pos.y, BALANCE.debris.collectParticleCount, {
        color: PALETTE.debris.sparkleBurst || '#ffffff',
        size: 4.5,
        minSpeed: 1.2,
        maxSpeed: 4.8
      });
      particleSys.emitBurst(this.pos.x, this.pos.y, 8, {
        color: PALETTE.debris.collectBurst,
        size: 3.5,
        minSpeed: 1.5,
        maxSpeed: 5.0,
        life: 0.4,
        type: 'blob'
      });
      particleSys.emitShockwave(this.pos.x, this.pos.y, this.radius * 1.6, PALETTE.debris.collectBurst, 0.22);
    }
    return true;
  }

  update(dt, worldBounds, currentField = null) {
    if (this.collected) return;
    this.timeAlive += dt;
    this.rotation += this.rotSpeed * dt;

    let currentVx = 0;
    let currentVy = 0;
    if (currentField && currentField.strength > 0) {
      const flow = currentField.getFlow(this.pos.x, this.pos.y);
      currentVx = flow.x * 0.85;
      currentVy = flow.y * 0.85;
    }

    this.pos.x += (this.vel.x + currentVx) * dt;
    this.pos.y += (this.vel.y + currentVy) * dt;

    if (worldBounds) {
      const margin = this.radius + 30;
      const minX = worldBounds.x + margin;
      const maxX = worldBounds.x + worldBounds.w - margin;
      const minY = worldBounds.y + margin;
      const maxY = worldBounds.y + worldBounds.h - margin;

      if (this.pos.x < minX) {
        this.pos.x = minX;
        this.vel.x = Math.abs(this.vel.x);
      } else if (this.pos.x > maxX) {
        this.pos.x = maxX;
        this.vel.x = -Math.abs(this.vel.x);
      }

      if (this.pos.y < minY) {
        this.pos.y = minY;
        this.vel.y = Math.abs(this.vel.y);
      } else if (this.pos.y > maxY) {
        this.pos.y = maxY;
        this.vel.y = -Math.abs(this.vel.y);
      }
    }

    this.updatePoints();
  }

  updatePoints() {
    const wobbleSpeed = BALANCE.debris.wobbleSpeed;
    const wobbleAmp = BALANCE.debris.wobbleAmp;

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const irregularity = this.irregularities[i] || 0;
      const r = Math.max(4, this.radius + irregularity + Math.sin(this.timeAlive * wobbleSpeed + i * 1.5) * wobbleAmp);
      this.points[i].set(Math.cos(angle) * r, Math.sin(angle) * r);
    }
  }

  draw(ctx) {
    if (this.collected) return;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rotation);

    const pal = PALETTE.debris;

    ctx.shadowColor = pal.glow;
    ctx.shadowBlur = 8;

    if (this.variant === 'deadCell') {
      // Shrunken, collapsed dead cell husk with faint pyknotic nucleus
      const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, this.radius);
      grad.addColorStop(0, pal.deadHusk[0]);
      grad.addColorStop(0.6, pal.deadHusk[1]);
      grad.addColorStop(1, pal.deadHusk[2]);

      ctx.fillStyle = grad;
      ctx.strokeStyle = pal.membrane;
      ctx.lineWidth = 1.6;

      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Faint collapsed nucleus remnant
      ctx.fillStyle = pal.spots;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 0.38, this.radius * 0.26, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      for (const s of this.spots) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.variant === 'dustClump') {
      // Fluffy cluster of drifting particulate motes
      ctx.shadowBlur = 0;
      ctx.fillStyle = pal.dustMote || pal.spots;
      for (const p of this.dustParticles) {
        const offset = Math.sin(this.timeAlive * 1.5 + p.phase) * 1.2;
        ctx.beginPath();
        ctx.arc(p.x + offset, p.y + offset, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = pal.membrane;
      ctx.lineWidth = 1.0;
      ctx.globalAlpha = 0.45;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.stroke();
    } else {
      // Small irregular cellular fragment
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, this.radius);
      grad.addColorStop(0, pal.grad[0]);
      grad.addColorStop(0.6, pal.grad[1]);
      grad.addColorStop(1, pal.grad[2]);

      ctx.fillStyle = grad;
      ctx.strokeStyle = pal.membrane;
      ctx.lineWidth = 1.8;

      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;

      ctx.fillStyle = pal.spots;
      for (const s of this.spots) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
