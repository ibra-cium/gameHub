import { Entity } from './Entity.js';
import { Vec2 } from '../core/Vec2.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class Pickup extends Entity {
  constructor(x, y, value = 1, initialVel = null) {
    super(x, y, BALANCE.pickup.radius);
    this.value = value;
    this.timeAlive = Math.random() * 10;
    this.bobPhase = Math.random() * Math.PI * 2;
    this.magnetRange = BALANCE.pickup.magnetRadius;
    this.magnetSpeed = BALANCE.pickup.magnetSpeed;

    if (initialVel) {
      this.vel = initialVel.copy();
    } else {
      const angle = Math.random() * Math.PI * 2;
      const spd = BALANCE.pickup.burstMinSpeed + Math.random() * (BALANCE.pickup.burstMaxSpeed - BALANCE.pickup.burstMinSpeed);
      this.vel = new Vec2(Math.cos(angle) * spd, Math.sin(angle) * spd);
    }
  }

  update(dt, player, soundFx, particleSys, worldBounds, currentField = null) {
    this.timeAlive += dt;

    let isMagnetized = false;
    if (player && player.alive) {
      const d = this.pos.dist(player.pos);
      if (d <= player.baseRadius + this.radius) {
        this.collect(player, soundFx, particleSys);
        return;
      } else if (d <= this.magnetRange + player.baseRadius) {
        isMagnetized = true;
        const toPlayer = player.pos.copy().sub(this.pos).norm();
        const pull = this.magnetSpeed * (1.0 - (d / (this.magnetRange + player.baseRadius)) * 0.5);
        this.vel.lerp(toPlayer.mult(pull), 0.18);
      }
    }

    if (!isMagnetized) {
      this.vel.mult(BALANCE.pickup.friction);
    }

    let currentVx = 0;
    let currentVy = 0;
    if (currentField && currentField.strength > 0) {
      const flow = currentField.getFlow(this.pos.x, this.pos.y, 0);
      currentVx = flow.x * 0.5;
      currentVy = flow.y * 0.5;
    }

    this.pos.x += (this.vel.x + currentVx) * dt;
    this.pos.y += (this.vel.y + currentVy) * dt;

    if (worldBounds) {
      const margin = this.radius + 10;
      this.pos.x = Math.max(worldBounds.x + margin, Math.min(this.pos.x, worldBounds.x + worldBounds.w - margin));
      this.pos.y = Math.max(worldBounds.y + margin, Math.min(this.pos.y, worldBounds.y + worldBounds.h - margin));
    }
  }

  collect(player, soundFx, particleSys) {
    if (!this.alive) return;
    this.destroy();

    player.mass = Math.min(BALANCE.player.mass.max, player.mass + this.value);

    if (soundFx) {
      soundFx.playPickupCollect();
    }

    if (particleSys) {
      particleSys.emitBurst(this.pos.x, this.pos.y, 14, {
        color: PALETTE.pickup?.collectBurst || PALETTE.player.membrane,
        size: 5,
        minSpeed: 3,
        maxSpeed: 8,
        life: 0.35,
        type: 'blob'
      });
      particleSys.emitBurst(this.pos.x, this.pos.y, 8, {
        color: PALETTE.pickup?.collectSparkle || PALETTE.player.base,
        size: 3,
        minSpeed: 2,
        maxSpeed: 6,
        life: 0.45,
        type: 'sparkle'
      });
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();

    const bob = Math.sin(this.timeAlive * BALANCE.pickup.bobSpeed + this.bobPhase) * BALANCE.pickup.bobAmp;
    const pulse = 0.5 + 0.5 * Math.sin(this.timeAlive * 6.0);
    const renderX = this.pos.x;
    const renderY = this.pos.y + bob;
    const r = this.radius + pulse * 1.5;

    ctx.translate(renderX, renderY);

    // Outer soft glow
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 2.2);
    glowGrad.addColorStop(0, PALETTE.pickup?.innerGlow || 'rgba(186, 230, 253, 0.6)');
    glowGrad.addColorStop(0.5, PALETTE.pickup?.membraneGlow || 'rgba(56, 189, 248, 0.35)');
    glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Mass pellet membrane
    const bodyGrad = ctx.createRadialGradient(-1, -1, 1, 0, 0, r);
    bodyGrad.addColorStop(0, PALETTE.pickup?.core || '#ffffff');
    bodyGrad.addColorStop(0.4, PALETTE.player.membrane || '#bae6fd');
    bodyGrad.addColorStop(1, PALETTE.pickup?.membrane || '#38bdf8');
    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = PALETTE.player.membrane || '#e0f2fe';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bright concentrated condensed core
    ctx.fillStyle = PALETTE.pickup?.core || '#ffffff';
    ctx.shadowColor = PALETTE.pickup?.membrane || '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
