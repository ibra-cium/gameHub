import { Vec2 } from '../core/Vec2.js';
import { Enemy } from './Enemy.js';
import { drawSmoothClosedCurve } from '../render/drawUtils.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class Virus extends Enemy {
  constructor(x, y) {
    super(x, y, 'virus');
    this.radius = BALANCE.virus.radius;
    this.speed = BALANCE.virus.speed;
    this.hp = BALANCE.virus.hp;
    this.maxHp = BALANCE.virus.maxHp;
    this.damage = BALANCE.virus.damage;
    this.numSpikes = BALANCE.virus.numSpikes;
    this.spikes = [];
    for (let s = 0; s < this.numSpikes; s++) {
      this.spikes.push({
        baseAngle: (s / this.numSpikes) * Math.PI * 2,
        length: BALANCE.virus.spikeMinLen + Math.random() * BALANCE.virus.spikeRandLen,
        phase: Math.random() * Math.PI * 2,
        wobbleRate: BALANCE.virus.spikeMinWobble + Math.random() * BALANCE.virus.spikeRandWobble
      });
    }

    this.dashTimer = BALANCE.virus.dashCooldownMin + Math.random() * BALANCE.virus.dashCooldownRand;
    this.isSurging = false;
    this.surgeDuration = BALANCE.virus.surgeDuration;
    this.surgeTimeRemaining = 0;
    this.surgeDir = new Vec2();

    // Surge telegraphing state
    this.isTelegraphing = false;
    this.telegraphTimer = 0;

    // Body cell latching state
    this.isLatched = false;
    this.latchedCell = null;
    this.latchTimer = 0;
    this.latchAngle = 0;
    this.latchCooldown = 0;
  }

  getBloodColor() { return PALETTE.enemy.virus.blood; }
  getAccentColor() { return PALETTE.enemy.virus.accent; }

  detachFromCell() {
    this.isLatched = false;
    this.latchedCell = null;
    this.latchTimer = 0;
  }

  takeDamage(amount, hitDir, soundFx, particleSys, camera) {
    if (this.isBeingEngulfed || !this.alive) return;

    let effectiveAmount = amount;
    if (this.isLatched) {
      effectiveAmount = amount * BALANCE.virus.latchedDamageMultiplier;
      this.detachFromCell();
      this.latchCooldown = BALANCE.virus.latchCooldown;
    }

    if (this.isTelegraphing) {
      this.isTelegraphing = false;
      this.dashTimer = BALANCE.virus.dashCooldownMin;
    }

    super.takeDamage(effectiveAmount, hitDir, soundFx, particleSys, camera);
  }

  update(dt, target, worldBounds, soundFx, particleSys, currentField = null, bodyCells = []) {
    this.updateBase(dt);

    if (this.isBeingEngulfed) {
      if (this.isLatched) this.detachFromCell();
      this.vel.set(0, 0);
      this.isSurging = false;
      this.isTelegraphing = false;
      return;
    }

    const p = this.getWeakenedProgress();
    const targetRadiusMult = this.isWeakened 
      ? 1.0 - p * (1.0 - BALANCE.enemy.weakenedRadiusMultiplier) 
      : 1.0;
    this.radius = this.baseRadius * targetRadiusMult;

    const currentSpeed = this.isWeakened 
      ? this.speed * BALANCE.enemy.weakenedSpeedMultiplier 
      : this.speed;

    if (this.isWeakened) {
      if (this.isLatched) this.detachFromCell();
      this.isSurging = false;
      this.isTelegraphing = false;
    }

    if (this.latchCooldown > 0) {
      this.latchCooldown -= dt;
    }

    // 1. Latched State Lifecycle
    if (this.isLatched) {
      if (!this.latchedCell || this.latchedCell.state !== 'healthy') {
        this.detachFromCell();
      } else {
        const attachDist = this.latchedCell.radius + this.radius * (1.0 - BALANCE.virus.latchGripDepth);
        this.pos.x = this.latchedCell.pos.x + Math.cos(this.latchAngle) * attachDist;
        this.pos.y = this.latchedCell.pos.y + Math.sin(this.latchAngle) * attachDist;
        this.vel.set(0, 0);
        this.bodyAngle = this.latchAngle + Math.PI;

        this.latchTimer += dt;
        const tremor = (this.latchTimer / BALANCE.virus.latchDuration) * 1.2;
        this.pos.x += (Math.random() - 0.5) * tremor;
        this.pos.y += (Math.random() - 0.5) * tremor;

        if (this.latchTimer >= BALANCE.virus.latchDuration) {
          this.latchedCell.infect('virus', soundFx, particleSys);
          this.detachFromCell();
          this.latchCooldown = BALANCE.virus.latchCooldown;
          this.dashTimer = BALANCE.virus.dashCooldownMin;
        }

        this.updatePoints();
        return;
      }
    }

    // 2. Surge Telegraph & Dash Execution
    if (this.isTelegraphing && !this.isWeakened) {
      this.telegraphTimer -= dt;
      this.vel.mult(0.85);
      this.squashX = BALANCE.virus.surgeTelegraphSquashX;
      this.squashY = BALANCE.virus.surgeTelegraphSquashY;
      this.bodyAngle = this.surgeDir.angle();

      if (this.telegraphTimer <= 0) {
        this.isTelegraphing = false;
        this.isSurging = true;
        this.surgeTimeRemaining = this.surgeDuration;
        this.squashX = BALANCE.virus.surgeSquashX;
        this.squashY = BALANCE.virus.surgeSquashY;
      }
    } else if (this.isSurging && !this.isWeakened) {
      this.surgeTimeRemaining -= dt;
      this.vel.set(this.surgeDir.x * BALANCE.virus.surgeSpeed, this.surgeDir.y * BALANCE.virus.surgeSpeed);
      this.bodyAngle = this.surgeDir.angle();
      if (this.surgeTimeRemaining <= 0) {
        this.isSurging = false;
        this.dashTimer = BALANCE.virus.surgeCooldownReset + Math.random() * BALANCE.virus.dashCooldownRand;
      }
    } else {
      // 3. Normal Steering & Target Selection
      if (!this.isWeakened && this.dashTimer > 0) {
        this.dashTimer -= dt;
      }

      let chosenTargetPos = null;
      let isTargetingCell = false;
      let targetCell = null;

      // Priority: Seek closest healthy BodyCell within seekRadius
      if (!this.isWeakened && this.latchCooldown <= 0 && Array.isArray(bodyCells) && bodyCells.length > 0) {
        let nearestDist = BALANCE.virus.seekRadius;
        for (const cell of bodyCells) {
          if (cell.state === 'healthy') {
            const d = this.pos.dist(cell.pos);
            if (d < nearestDist) {
              nearestDist = d;
              targetCell = cell;
              chosenTargetPos = cell.pos;
              isTargetingCell = true;
            }
          }
        }
      }

      // Fallback: Chase Player / Escort Target
      if (!chosenTargetPos && target && target.pos) {
        chosenTargetPos = target.pos;
        isTargetingCell = false;
      }

      if (this.hitStunTimer <= 0 && chosenTargetPos) {
        const toTarget = chosenTargetPos.copy().sub(this.pos);
        const dist = toTarget.mag();

        if (isTargetingCell && targetCell) {
          const latchThreshold = targetCell.radius + this.radius * (1.0 - BALANCE.virus.latchGripDepth) + 4;
          if (dist <= latchThreshold) {
            // Latch onto the cell surface
            this.isLatched = true;
            this.latchedCell = targetCell;
            this.latchTimer = 0;
            this.latchAngle = Math.atan2(this.pos.y - targetCell.pos.y, this.pos.x - targetCell.pos.x);
            this.vel.set(0, 0);
            this.bodyAngle = this.latchAngle + Math.PI;
          } else {
            toTarget.norm();
            this.vel.lerp(new Vec2(toTarget.x * currentSpeed, toTarget.y * currentSpeed), BALANCE.virus.pursuitLerp);
          }
        } else if (dist > 5) {
          toTarget.norm();
          if (!this.isWeakened && dist < BALANCE.virus.surgeTriggerDistance && this.dashTimer <= 0) {
            // Initiate surge telegraph windup
            this.isTelegraphing = true;
            this.telegraphTimer = BALANCE.virus.surgeTelegraphDuration;
            this.surgeDir = toTarget.copy();
            this.squashX = BALANCE.virus.surgeTelegraphSquashX;
            this.squashY = BALANCE.virus.surgeTelegraphSquashY;
          } else {
            this.vel.lerp(new Vec2(toTarget.x * currentSpeed, toTarget.y * currentSpeed), BALANCE.virus.pursuitLerp);
          }
        }
      } else if (this.hitStunTimer > 0) {
        this.vel.mult(BALANCE.virus.hitStunDecay);
      }
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

    if (!this.isLatched) {
      this.clampToWorldBounds(worldBounds, 10);
    }

    if (!this.isLatched && !this.isTelegraphing && !this.isSurging && this.vel.magSq() > 4) {
      this.bodyAngle = this.vel.angle();
    }

    this.updatePoints();
  }

  updatePoints() {
    const wobbleSpeed = this.isWeakened ? 5 * BALANCE.enemy.weakenedWobbleSpeedMult : (this.isTelegraphing ? 14 : 5);
    const wobbleAmp = this.isWeakened ? 2 * BALANCE.enemy.weakenedWobbleAmpMult : (this.isTelegraphing ? 3.5 : 2);

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const r = this.radius + Math.sin(this.timeAlive * wobbleSpeed + i * 1.5) * wobbleAmp;
      this.points[i].set(Math.cos(angle) * r, Math.sin(angle) * r);
    }
  }

  drawLatchTether(ctx) {
    if (!this.isLatched || !this.latchedCell || this.latchedCell.state !== 'healthy') return;

    const progress = Math.min(1.0, this.latchTimer / BALANCE.virus.latchDuration);
    const pulseFreq = 8 + progress * 16;
    const pulse = 0.5 + 0.5 * Math.sin(this.timeAlive * pulseFreq);

    ctx.save();

    // 1. Broad outer glowing corona
    const beamWidth = BALANCE.virus.latchBeamWidthMin + progress * (BALANCE.virus.latchBeamWidthMax - BALANCE.virus.latchBeamWidthMin);
    ctx.strokeStyle = PALETTE.enemy.virus.latchGlow;
    ctx.lineWidth = beamWidth * 2.6;
    ctx.shadowColor = PALETTE.enemy.virus.latchBeam;
    ctx.shadowBlur = 12 + progress * 18;
    ctx.globalAlpha = 0.45 + progress * 0.45 + pulse * 0.1;

    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.latchedCell.pos.x, this.latchedCell.pos.y);
    ctx.stroke();

    // 2. High-brightness core tether
    ctx.strokeStyle = PALETTE.enemy.virus.latchBeamCore;
    ctx.lineWidth = beamWidth * 0.8;
    ctx.shadowBlur = 4;
    ctx.globalAlpha = 0.85 + progress * 0.15;

    ctx.beginPath();
    ctx.moveTo(this.pos.x, this.pos.y);
    ctx.lineTo(this.latchedCell.pos.x, this.latchedCell.pos.y);
    ctx.stroke();

    // 3. Flowing bio-electric pulse nodes toward cell center
    const nodeCount = 3 + Math.floor(progress * 4);
    for (let i = 0; i < nodeCount; i++) {
      const offset = (this.timeAlive * (1.5 + progress * 2.5) + (i / nodeCount)) % 1.0;
      const nx = this.pos.x + (this.latchedCell.pos.x - this.pos.x) * offset;
      const ny = this.pos.y + (this.latchedCell.pos.y - this.pos.y) * offset;

      ctx.fillStyle = PALETTE.enemy.virus.latchBeam;
      ctx.shadowColor = PALETTE.enemy.virus.latchBeamCore;
      ctx.shadowBlur = 6;
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5 + progress * 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Grip zone spreading contaminant halo
    const gripAngle = this.latchAngle;
    const gripX = this.latchedCell.pos.x + Math.cos(gripAngle) * this.latchedCell.radius;
    const gripY = this.latchedCell.pos.y + Math.sin(gripAngle) * this.latchedCell.radius;
    ctx.fillStyle = PALETTE.enemy.virus.latchGrip;
    ctx.shadowColor = PALETTE.enemy.virus.latchBeam;
    ctx.shadowBlur = 10;
    ctx.globalAlpha = 0.6 + progress * 0.4;
    ctx.beginPath();
    ctx.arc(gripX, gripY, 4 + progress * 8 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  draw(ctx) {
    if (this.isLatched) {
      this.drawLatchTether(ctx);
    }

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.bodyAngle);

    const engulfScale = this.isBeingEngulfed ? Math.max(0.01, 1.0 - this.engulfProgress) : 1.0;
    if (this.isBeingEngulfed) {
      ctx.globalAlpha = Math.max(0, 1.0 - this.engulfProgress * 0.85);
    }
    ctx.scale(this.squashX * engulfScale, this.squashY * engulfScale);

    const p = this.getWeakenedProgress();
    const spikeSpeedMult = this.isWeakened ? BALANCE.enemy.weakenedWobbleSpeedMult : (this.isTelegraphing ? 2.5 : 1.0);

    // Glycoprotein Spikes
    this.spikes.forEach((spike) => {
      const wobble = Math.sin(this.timeAlive * spike.wobbleRate * spikeSpeedMult + spike.phase) * (this.isWeakened ? 0.08 : 0.2);
      let angle = spike.baseAngle + wobble;

      let spikeLen = spike.length;
      if (this.isWeakened) {
        spikeLen *= 0.75;
      } else if (this.isTelegraphing) {
        // Retract spikes into capsid during telegraph windup (Requirement 6)
        const tP = Math.max(0, this.telegraphTimer / BALANCE.virus.surgeTelegraphDuration);
        spikeLen *= (0.25 + tP * 0.75);
      } else if (this.isLatched) {
        // Front spikes curve and grip tightly into body cell surface (Requirement 2)
        const forwardDot = Math.cos(spike.baseAngle);
        if (forwardDot > 0.2) {
          angle += (forwardDot * 0.3) * Math.sin(spike.baseAngle);
          spikeLen *= 0.85;
        }
      }

      const sx = Math.cos(angle) * (this.radius * 0.8);
      const sy = Math.sin(angle) * (this.radius * 0.8);
      const tx = Math.cos(angle) * (this.radius + spikeLen);
      const ty = Math.sin(angle) * (this.radius + spikeLen);

      let strokeCol = this.isWeakened 
        ? PALETTE.enemy.virus.weakenedSpikes 
        : (this.isTelegraphing ? PALETTE.enemy.virus.telegraphSpikes : PALETTE.enemy.virus.spikes);
      let knobCol = this.isWeakened 
        ? PALETTE.enemy.virus.weakenedSpikeKnobs 
        : (this.isTelegraphing ? PALETTE.enemy.virus.telegraphGlow : PALETTE.enemy.virus.spikeKnobs);

      if (this.isLatched && Math.cos(spike.baseAngle) > 0.3) {
        strokeCol = PALETTE.enemy.virus.latchGrip;
        knobCol = PALETTE.enemy.virus.latchBeamCore;
      }

      ctx.strokeStyle = strokeCol;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(tx, ty);
      ctx.stroke();

      ctx.fillStyle = knobCol;
      ctx.beginPath();
      ctx.arc(tx, ty, this.isWeakened ? 3.5 : 4.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Central Capsid
    if (this.flashTimer > 0) {
      const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, this.radius);
      grad.addColorStop(0, PALETTE.enemy.virus.flash[0]);
      grad.addColorStop(1, PALETTE.enemy.virus.flash[1]);
      ctx.fillStyle = grad;
      ctx.strokeStyle = PALETTE.enemy.virus.membrane;
      ctx.lineWidth = 3;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();
    } else {
      const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, this.radius);
      grad.addColorStop(0, PALETTE.enemy.virus.grad[0]);
      grad.addColorStop(0.5, PALETTE.enemy.virus.grad[1]);
      grad.addColorStop(1, PALETTE.enemy.virus.grad[2]);
      ctx.fillStyle = grad;
      ctx.strokeStyle = this.isTelegraphing ? PALETTE.enemy.virus.telegraphSpikes : PALETTE.enemy.virus.membrane;
      ctx.lineWidth = 3;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();

      if (p > 0) {
        ctx.save();
        ctx.globalAlpha = p;
        const wGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, this.radius);
        wGrad.addColorStop(0, PALETTE.enemy.virus.weakenedGrad[0]);
        wGrad.addColorStop(0.5, PALETTE.enemy.virus.weakenedGrad[1]);
        wGrad.addColorStop(1, PALETTE.enemy.virus.weakenedGrad[2]);
        ctx.fillStyle = wGrad;
        ctx.strokeStyle = PALETTE.enemy.virus.weakenedMembrane;
        ctx.lineWidth = 3;
        drawSmoothClosedCurve(ctx, this.points);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Outline indicator for weakened state
    if (this.isWeakened) {
      const pulse = 0.5 + 0.5 * Math.sin(this.timeAlive * BALANCE.enemy.weakenedPulseSpeed);
      const outlineAlpha = (0.3 + pulse * 0.6) * p;
      ctx.save();
      ctx.strokeStyle = this.getWeakenedOutlineColor(outlineAlpha);
      ctx.lineWidth = BALANCE.enemy.weakenedOutlineWidth + pulse * 2.0;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.stroke();
      ctx.restore();
    }

    // RNA Core
    let rnaCol = this.isWeakened ? PALETTE.enemy.virus.weakenedRna : PALETTE.enemy.virus.rna;
    if (this.isTelegraphing) {
      rnaCol = PALETTE.enemy.virus.telegraphGlow;
    } else if (this.isLatched) {
      rnaCol = PALETTE.enemy.virus.latchBeamCore;
    }
    ctx.fillStyle = rnaCol;
    ctx.beginPath();
    const rnaPulse = this.isWeakened 
      ? Math.sin(this.timeAlive * 4 * BALANCE.enemy.weakenedWobbleSpeedMult) * 1 
      : Math.sin(this.timeAlive * (this.isTelegraphing ? 18 : 4)) * 2;
    ctx.arc(0, 0, (this.isWeakened ? 5 : 7) + rnaPulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
