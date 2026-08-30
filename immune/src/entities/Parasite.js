import { Vec2 } from '../core/Vec2.js';
import { Enemy } from './Enemy.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class Parasite extends Enemy {
  constructor(x, y) {
    super(x, y, 'parasite');
    this.radius = BALANCE.parasite.radius;
    this.speed = BALANCE.parasite.speed;
    this.hp = BALANCE.parasite.hp;
    this.maxHp = BALANCE.parasite.maxHp;
    this.damage = BALANCE.parasite.damage;
    this.segments = BALANCE.parasite.segments;
    this.history = [];
    for (let i = 0; i < BALANCE.parasite.historyLength; i++) {
      this.history.push(this.pos.copy());
    }

    this.state = 'chase'; // 'chase' | 'fleeing'
    this.stolenMass = 0;
    this.escaped = false;
    this.fleeTrailTimer = 0;
  }

  getBloodColor() { return PALETTE.enemy.parasite.blood; }
  getAccentColor() { return PALETTE.enemy.parasite.accent; }

  stealMass(amount) {
    this.stolenMass = amount;
    this.state = 'fleeing';
  }

  getNearestWorldEdgeDir(worldBounds) {
    if (!worldBounds) return new Vec2(1, 0);

    const dLeft = this.pos.x - worldBounds.x;
    const dRight = (worldBounds.x + worldBounds.w) - this.pos.x;
    const dTop = this.pos.y - worldBounds.y;
    const dBottom = (worldBounds.y + worldBounds.h) - this.pos.y;

    const minDist = Math.min(dLeft, dRight, dTop, dBottom);

    if (minDist === dLeft) return new Vec2(-1, 0);
    if (minDist === dRight) return new Vec2(1, 0);
    if (minDist === dTop) return new Vec2(0, -1);
    return new Vec2(0, 1);
  }

  update(dt, target, worldBounds, soundFx = null, particleSys = null, currentField = null) {
    this.updateBase(dt);

    if (this.isBeingEngulfed) {
      this.vel.set(0, 0);
      return;
    }

    const p = this.getWeakenedProgress();
    const targetRadiusMult = this.isWeakened 
      ? 1.0 - p * (1.0 - BALANCE.enemy.weakenedRadiusMultiplier) 
      : 1.0;

    const massRatio = Math.min(1.0, this.stolenMass / (BALANCE.parasite.stealAmount || 4));
    const bulgeMult = 1.0 + massRatio * (BALANCE.parasite.bulgeScale || 0.65);
    this.radius = this.baseRadius * targetRadiusMult * bulgeMult;

    const baseSpeed = this.state === 'fleeing' ? BALANCE.parasite.fleeSpeed : this.speed;
    const currentSpeed = this.isWeakened 
      ? baseSpeed * BALANCE.enemy.weakenedSpeedMultiplier 
      : baseSpeed;

    if (this.hitStunTimer <= 0) {
      if (this.state === 'fleeing') {
        const edgeDir = this.getNearestWorldEdgeDir(worldBounds);
        const slitherSpeed = BALANCE.parasite.fleeSlitherSpeed || 16;
        const slitherAmp = BALANCE.parasite.fleeSlitherAmplitude || 0.75;
        const slither = Math.sin(this.timeAlive * slitherSpeed) * slitherAmp;
        const angle = edgeDir.angle() + slither;
        const targetVel = new Vec2(Math.cos(angle) * currentSpeed, Math.sin(angle) * currentSpeed);
        this.vel.lerp(targetVel, BALANCE.parasite.fleeSteerLerp || 0.12);

        // Emit high-visibility bright trail while fleeing with stolen mass
        this.fleeTrailTimer -= dt;
        if (this.fleeTrailTimer <= 0 && particleSys) {
          this.fleeTrailTimer = BALANCE.parasite.fleeTrailInterval || 0.035;
          particleSys.emit({
            pos: this.pos.copy().add(new Vec2((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8)),
            vel: new Vec2(-this.vel.x * 0.08 + (Math.random() - 0.5) * 20, -this.vel.y * 0.08 + (Math.random() - 0.5) * 20),
            size: 4 + Math.random() * 4,
            endSize: 0,
            color: Math.random() < 0.6 ? (PALETTE.enemy.parasite.fleeTrail || '#fde047') : (PALETTE.enemy.parasite.stolenMassCore || '#38bdf8'),
            life: 0.35,
            friction: 0.95,
            type: 'blob'
          });
        }

        // Check if reached world edge margin to complete escape
        if (worldBounds) {
          const margin = BALANCE.parasite.escapeMargin || 16;
          const isAtEdge = this.pos.x <= worldBounds.x + margin ||
                           this.pos.x >= worldBounds.x + worldBounds.w - margin ||
                           this.pos.y <= worldBounds.y + margin ||
                           this.pos.y >= worldBounds.y + worldBounds.h - margin;

          if (isAtEdge) {
            this.escaped = true;
            this.destroy();
            if (soundFx) {
              soundFx.playParasiteEscape();
            }
            if (particleSys) {
              particleSys.emitBurst(this.pos.x, this.pos.y, 20, {
                color: PALETTE.enemy.parasite.fleeTrail || '#fde047',
                size: 5,
                minSpeed: 3,
                maxSpeed: 8,
                life: 0.45,
                type: 'blob'
              });
              particleSys.emitShockwave(this.pos.x, this.pos.y, 60, PALETTE.enemy.parasite.accent, 0.3);
            }
            return;
          }
        }
      } else if (target && target.pos) {
        const toTarget = target.pos.copy().sub(this.pos);
        const dist = toTarget.mag();
        if (dist > 5) {
          toTarget.norm();
          const slitherSpeed = this.isWeakened 
            ? BALANCE.parasite.slitherSpeed * BALANCE.enemy.weakenedWobbleSpeedMult 
            : BALANCE.parasite.slitherSpeed;
          const slitherAmp = this.isWeakened 
            ? BALANCE.parasite.slitherAmplitude * 0.5 
            : BALANCE.parasite.slitherAmplitude;
          const slither = Math.sin(this.timeAlive * slitherSpeed) * slitherAmp;
          const angle = toTarget.angle() + slither;
          const targetVel = new Vec2(Math.cos(angle) * currentSpeed, Math.sin(angle) * currentSpeed);
          this.vel.lerp(targetVel, BALANCE.parasite.steerLerp);
        }
      }
    } else if (this.hitStunTimer > 0) {
      this.vel.mult(BALANCE.parasite.hitStunDecay);
    }

    let currentVx = 0;
    let currentVy = 0;
    if (currentField && currentField.strength > 0) {
      const flow = currentField.getFlow(this.pos.x, this.pos.y);
      const res = 1.0 - (BALANCE.current?.enemyResistance || 0.25);
      currentVx = flow.x * res;
      currentVy = flow.y * res;
    }

    this.pos.x += (this.vel.x + currentVx) * dt;
    this.pos.y += (this.vel.y + currentVy) * dt;

    if (this.state !== 'fleeing') {
      this.clampToWorldBounds(worldBounds, 10);
    }

    this.bodyAngle = this.vel.angle();

    const curSpeed = this.vel.mag();
    this.squashX = 1 + (curSpeed / Math.max(1, this.speed)) * BALANCE.parasite.squashSpeedFactorX;
    this.squashY = Math.max(0.4, 1 - (curSpeed / Math.max(1, this.speed)) * BALANCE.parasite.squashSpeedFactorY);

    this.history.unshift(this.pos.copy());
    if (this.history.length > BALANCE.parasite.historyLength) {
      this.history.pop();
    }
  }

  draw(ctx) {
    ctx.save();

    const engulfScale = this.isBeingEngulfed ? Math.max(0.01, 1.0 - this.engulfProgress) : 1.0;
    if (this.isBeingEngulfed) {
      ctx.globalAlpha = Math.max(0, 1.0 - this.engulfProgress * 0.85);
    }

    const p = this.getWeakenedProgress();
    const massRatio = Math.min(1.0, this.stolenMass / (BALANCE.parasite.stealAmount || 4));
    const bulgeMult = 1.0 + massRatio * (BALANCE.parasite.bulgeScale || 0.65);

    for (let s = this.history.length - 1; s >= 0; s -= 3) {
      const pos = this.history[s];
      const frac = 1 - s / this.history.length;
      // Trailing segments bulge along with the head if carrying stolen mass
      const segBulge = 1.0 + massRatio * (0.8 - frac * 0.4);
      const segRadius = Math.max(1, this.radius * frac * 0.8 * engulfScale * segBulge);

      if (this.flashTimer > 0) {
        ctx.fillStyle = PALETTE.enemy.parasite.tailFlash;
      } else if (this.isWeakened) {
        ctx.fillStyle = (s === 0 ? PALETTE.enemy.parasite.weakenedTailSeg1 : PALETTE.enemy.parasite.weakenedTailSeg2);
      } else {
        ctx.fillStyle = (s === 0 ? PALETTE.enemy.parasite.tailSeg1 : PALETTE.enemy.parasite.tailSeg2);
      }

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, segRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.bodyAngle);
    ctx.scale(this.squashX * engulfScale, this.squashY * engulfScale);

    if (this.flashTimer > 0) {
      const grad = ctx.createRadialGradient(-3, 0, 2, 0, 0, this.radius);
      grad.addColorStop(0, PALETTE.enemy.parasite.flash[0]);
      grad.addColorStop(1, PALETTE.enemy.parasite.flash[1]);
      ctx.fillStyle = grad;
      ctx.strokeStyle = PALETTE.enemy.parasite.membrane;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 1.2, this.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // Base normal body
      const grad = ctx.createRadialGradient(-3, 0, 2, 0, 0, this.radius);
      grad.addColorStop(0, PALETTE.enemy.parasite.grad[0]);
      grad.addColorStop(0.5, PALETTE.enemy.parasite.grad[1]);
      grad.addColorStop(1, PALETTE.enemy.parasite.grad[2]);
      ctx.fillStyle = grad;
      ctx.strokeStyle = PALETTE.enemy.parasite.membrane;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 1.2, this.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Desaturated overlay for weakened state transition
      if (p > 0) {
        ctx.save();
        ctx.globalAlpha = p;
        const wGrad = ctx.createRadialGradient(-3, 0, 2, 0, 0, this.radius);
        wGrad.addColorStop(0, PALETTE.enemy.parasite.weakenedGrad[0]);
        wGrad.addColorStop(0.5, PALETTE.enemy.parasite.weakenedGrad[1]);
        wGrad.addColorStop(1, PALETTE.enemy.parasite.weakenedGrad[2]);
        ctx.fillStyle = wGrad;
        ctx.strokeStyle = PALETTE.enemy.parasite.weakenedMembrane;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.radius * 1.2, this.radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Luminous pulsating stolen mass bulge inside the belly
    if (this.stolenMass > 0 && !this.isBeingEngulfed) {
      const pulse = 0.5 + 0.5 * Math.sin(this.timeAlive * 12.0);
      const coreR = this.radius * (0.35 + massRatio * 0.3) + pulse * 1.5;

      ctx.save();
      const coreGrad = ctx.createRadialGradient(-1, 0, 1, -1, 0, coreR * 1.8);
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.5, PALETTE.enemy.parasite.stolenMassCore || '#38bdf8');
      coreGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(-this.radius * 0.2, 0, coreR * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = PALETTE.enemy.parasite.stolenMassCore || '#38bdf8';
      ctx.shadowColor = PALETTE.enemy.parasite.stolenMassGlow || 'rgba(56, 189, 248, 0.85)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(-this.radius * 0.2, 0, coreR * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Pulsing outline around weakened parasite head
    if (this.isWeakened) {
      const pulse = 0.5 + 0.5 * Math.sin(this.timeAlive * BALANCE.enemy.weakenedPulseSpeed);
      const outlineAlpha = (0.3 + pulse * 0.6) * p;
      ctx.save();
      ctx.strokeStyle = this.getWeakenedOutlineColor(outlineAlpha);
      ctx.lineWidth = BALANCE.enemy.weakenedOutlineWidth + pulse * 2.0;
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 1.2, this.radius * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Biting mouth hooks
    ctx.fillStyle = this.isWeakened ? PALETTE.enemy.parasite.weakenedMouthHooks : PALETTE.enemy.parasite.mouthHooks;
    ctx.beginPath();
    ctx.moveTo(this.radius * 0.9, -4);
    ctx.lineTo(this.radius * 1.4, 0);
    ctx.lineTo(this.radius * 0.9, 4);
    ctx.fill();

    ctx.restore();
  }
}

