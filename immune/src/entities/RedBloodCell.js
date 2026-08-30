import { Entity } from './Entity.js';
import { Vec2 } from '../core/Vec2.js';
import { drawSmoothClosedCurve } from '../render/drawUtils.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class RedBloodCell extends Entity {
  constructor(x, y, config = {}) {
    super(x, y, BALANCE.redBloodCell.radius);
    this.hp = config.hp ?? BALANCE.redBloodCell.hp;
    this.maxHp = this.hp;
    this.speed = config.speed ?? BALANCE.redBloodCell.speed;
    this.path = Array.isArray(config.path) && config.path.length > 0
      ? config.path.map((p) => new Vec2(p.x, p.y))
      : [new Vec2(x, y)];
    this.currentWaypointIndex = 0;
    this.reachedExit = false;

    this.flashTimer = 0;
    this.timeAlive = Math.random() * 10;
    this.bodyAngle = 0;
    this.squashX = 1.0;
    this.squashY = 1.0;

    this.initPoints(BALANCE.redBloodCell.numPoints);
  }

  takeDamage(amount, hitDir, soundFx, particleSys, camera) {
    if (!this.alive) return false;
    this.hp -= amount;
    this.flashTimer = BALANCE.redBloodCell.flashDuration;

    if (hitDir) {
      this.vel.x += hitDir.x * 60;
      this.vel.y += hitDir.y * 60;
    }

    this.squashX = 0.75;
    this.squashY = 1.35;

    if (soundFx) soundFx.playHit();
    if (camera) camera.shake(BALANCE.redBloodCell.hitShakeIntensity, BALANCE.redBloodCell.hitShakeDuration);
    if (particleSys) {
      particleSys.emitBurst(this.pos.x, this.pos.y, 10, {
        color: PALETTE.redBloodCell.blood,
        size: 4,
        minSpeed: 2,
        maxSpeed: 6,
        life: 0.35
      });
    }

    if (this.hp <= 0) {
      this.hp = 0;
      this.destroy();
      this.onDeath(soundFx, particleSys, camera);
    }
    return true;
  }

  onDeath(soundFx, particleSys, camera) {
    if (soundFx) soundFx.playEnemyDeath();
    if (camera) camera.shake(BALANCE.redBloodCell.deathShakeIntensity, BALANCE.redBloodCell.deathShakeDuration);
    if (particleSys) {
      particleSys.emitShockwave(this.pos.x, this.pos.y, this.radius * 2.2, PALETTE.redBloodCell.membrane, 0.4);
      particleSys.emitBurst(this.pos.x, this.pos.y, BALANCE.redBloodCell.deathParticleCount, {
        color: PALETTE.redBloodCell.blood,
        size: 5,
        minSpeed: 3,
        maxSpeed: 8,
        life: 0.6,
        type: 'blob'
      });
    }
  }

  update(dt, worldBounds, currentField = null) {
    if (!this.alive) return;
    this.timeAlive += dt;

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
    }

    this.squashX += (1.0 - this.squashX) * 0.15;
    this.squashY += (1.0 - this.squashY) * 0.15;

    // Follow waypoints
    if (!this.reachedExit && this.path.length > 0) {
      const targetWp = this.path[this.currentWaypointIndex];
      const toTarget = targetWp.copy().sub(this.pos);
      const dist = toTarget.mag();

      if (dist <= BALANCE.redBloodCell.exitReachDistance) {
        if (this.currentWaypointIndex < this.path.length - 1) {
          this.currentWaypointIndex++;
        } else {
          this.reachedExit = true;
          this.vel.set(0, 0);
        }
      } else {
        toTarget.norm();
        const moveVel = toTarget.mult(this.speed);
        this.vel.lerp(moveVel, 0.1);
      }
    }

    let currentVx = 0;
    let currentVy = 0;
    if (currentField && currentField.strength > 0 && !this.reachedExit) {
      const flow = currentField.getFlow(this.pos.x, this.pos.y);
      currentVx = flow.x * 0.65;
      currentVy = flow.y * 0.65;
    }

    this.pos.x += (this.vel.x + currentVx) * dt;
    this.pos.y += (this.vel.y + currentVy) * dt;
    this.vel.mult(BALANCE.redBloodCell.knockbackDecay);

    if (this.vel.magSq() > 1 || (currentVx * currentVx + currentVy * currentVy > 1)) {
      this.bodyAngle = Math.atan2(this.vel.y + currentVy, this.vel.x + currentVx);
    }

    // Soft body deformation for biconcave disc
    const wobbleSpeed = BALANCE.redBloodCell.wobbleSpeed;
    const wobbleAmp = BALANCE.redBloodCell.wobbleAmp;

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const wobble = Math.sin(this.timeAlive * wobbleSpeed + i * 1.3) * wobbleAmp;
      const r = this.radius + wobble;
      this.points[i].set(Math.cos(angle) * r, Math.sin(angle) * (r * 0.85));
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.bodyAngle);
    ctx.scale(this.squashX, this.squashY);

    if (this.flashTimer > 0) {
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius);
      grad.addColorStop(0, PALETTE.redBloodCell.flash[0]);
      grad.addColorStop(1, PALETTE.redBloodCell.flash[1]);
      ctx.fillStyle = grad;
      ctx.strokeStyle = PALETTE.redBloodCell.membrane;
      ctx.lineWidth = 3;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();
    } else {
      // Outer glowing halo
      ctx.shadowColor = PALETTE.redBloodCell.glow;
      ctx.shadowBlur = 12;

      // Erythrocyte Body Gradient
      const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, this.radius * 1.1);
      grad.addColorStop(0, PALETTE.redBloodCell.grad[0]);
      grad.addColorStop(0.5, PALETTE.redBloodCell.grad[1]);
      grad.addColorStop(1, PALETTE.redBloodCell.grad[2]);

      ctx.fillStyle = grad;
      ctx.strokeStyle = PALETTE.redBloodCell.membrane;
      ctx.lineWidth = 3.5;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Inner biconcave depression ring and dimple
      const dimpleR = this.radius * BALANCE.redBloodCell.dimpleRatio;
      ctx.fillStyle = PALETTE.redBloodCell.dimple;
      ctx.beginPath();
      ctx.ellipse(0, 0, dimpleR * 1.1, dimpleR * 0.85, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = PALETTE.redBloodCell.dimpleRing;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    this.drawHealthBar(ctx);
  }

  drawHealthBar(ctx) {
    if (this.hp < this.maxHp && this.hp > 0) {
      const barW = this.radius * 2.2;
      const barH = 5;
      const barX = this.pos.x - barW / 2;
      const barY = this.pos.y - this.radius - 16;
      const pct = Math.max(0, this.hp / this.maxHp);

      ctx.save();
      ctx.fillStyle = PALETTE.enemy.base.healthBarBg;
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = PALETTE.redBloodCell.grad[1];
      ctx.fillRect(barX, barY, barW * pct, barH);
      ctx.strokeStyle = PALETTE.enemy.base.healthBarBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.restore();
    }
  }
}
