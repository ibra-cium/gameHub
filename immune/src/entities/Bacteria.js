import { Vec2 } from '../core/Vec2.js';
import { Enemy } from './Enemy.js';
import { drawSmoothClosedCurve } from '../render/drawUtils.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class Bacteria extends Enemy {
  constructor(x, y, generation = 0) {
    super(x, y, 'bacteria');
    this.generation = generation;
    const genScale = Math.pow(BALANCE.bacteria.splitSizeMultiplier, this.generation);

    this.baseRadius = BALANCE.bacteria.radius * genScale;
    this.radius = this.baseRadius;
    this.speed = BALANCE.bacteria.speed;
    this.hp = BALANCE.bacteria.hp * genScale;
    this.maxHp = BALANCE.bacteria.maxHp * genScale;
    this.damage = BALANCE.bacteria.damage;
    this.numPoints = BALANCE.bacteria.numPoints;
    this.initPoints(this.numPoints);

    // Initial staggered split timer so initial spawn splits in 3.5-6.5s
    this.splitTimer = (generation === 0) ? (2.5 + Math.random() * 3.5) : 0;
    this.damageDelayTimer = 0;
    this.isSplitting = false;
    this.splitAnimTimer = 0;
    this.pendingOffspring = null;

    this.flagellaCount = BALANCE.bacteria.flagellaCount;
    this.flagella = [];
    for (let f = 0; f < this.flagellaCount; f++) {
      this.flagella.push({
        baseAngle: (f / this.flagellaCount) * Math.PI * 2,
        length: (BALANCE.bacteria.flagellaMinLen + Math.random() * BALANCE.bacteria.flagellaRandLen) * genScale,
        phase: Math.random() * Math.PI * 2,
        speed: BALANCE.bacteria.flagellaMinSpeed + Math.random() * BALANCE.bacteria.flagellaRandSpeed
      });
    }
  }

  getBloodColor() { return PALETTE.enemy.bacteria.blood; }
  getAccentColor() { return PALETTE.enemy.bacteria.accent; }

  takeDamage(amount, hitDir, soundFx, particleSys, camera) {
    super.takeDamage(amount, hitDir, soundFx, particleSys, camera);
    if (!this.alive) return;

    // Attacking delays splitting and cancels any active fission sequence
    this.damageDelayTimer = BALANCE.bacteria.splitDamageDelay;
    this.isSplitting = false;
    this.splitAnimTimer = 0;
    this.splitTimer = Math.max(0, Math.min(this.splitTimer, BALANCE.bacteria.splitInterval - BALANCE.bacteria.splitTellDuration - 1.0));
  }

  update(dt, target, worldBounds, soundFx, particleSys, currentField = null) {
    this.updateBase(dt);

    if (this.isBeingEngulfed) {
      this.vel.set(0, 0);
      this.isSplitting = false;
      return;
    }

    if (this.damageDelayTimer > 0) {
      this.damageDelayTimer -= dt;
    }

    // Binary fission splitting logic
    const canSplit = this.generation < BALANCE.bacteria.splitMaxGeneration &&
      !this.isWeakened &&
      !this.isBeingEngulfed &&
      this.alive &&
      this.damageDelayTimer <= 0;

    if (canSplit && !this.isSplitting) {
      this.splitTimer += dt;
      if (this.splitTimer >= BALANCE.bacteria.splitInterval) {
        this.isSplitting = true;
        this.splitAnimTimer = 0;
      }
    }

    const isTellActive = canSplit && !this.isSplitting &&
      (this.splitTimer >= BALANCE.bacteria.splitInterval - BALANCE.bacteria.splitTellDuration);
    const tellProgress = isTellActive
      ? Math.min(1.0, (this.splitTimer - (BALANCE.bacteria.splitInterval - BALANCE.bacteria.splitTellDuration)) / BALANCE.bacteria.splitTellDuration)
      : 0;

    let splitProgress = 0;
    if (this.isSplitting) {
      this.splitAnimTimer += dt;
      splitProgress = Math.min(1.0, this.splitAnimTimer / BALANCE.bacteria.splitAnimDuration);
      this.vel.mult(0.82);

      if (splitProgress >= 1.0) {
        this.performSplit(soundFx, particleSys);
        splitProgress = 0;
      }
    }

    const p = this.getWeakenedProgress();
    const targetRadiusMult = this.isWeakened 
      ? 1.0 - p * (1.0 - BALANCE.enemy.weakenedRadiusMultiplier) 
      : 1.0;

    let swellScale = 1.0;
    if (isTellActive) {
      swellScale = 1.0 + tellProgress * (0.28 + 0.08 * Math.sin(this.timeAlive * 16));
    }
    this.radius = this.baseRadius * targetRadiusMult * swellScale;

    const currentSpeed = this.isWeakened 
      ? this.speed * BALANCE.enemy.weakenedSpeedMultiplier 
      : this.speed;

    let currentVx = 0;
    let currentVy = 0;
    if (currentField && currentField.strength > 0) {
      const flow = currentField.getFlow(this.pos.x, this.pos.y);
      const res = 1.0 - (BALANCE.current?.enemyResistance || 0.25);
      currentVx = flow.x * res;
      currentVy = flow.y * res;
    }

    if (!this.isSplitting) {
      if (this.hitStunTimer <= 0 && target && target.pos) {
        const toTarget = target.pos.copy().sub(this.pos);
        const dist = toTarget.mag();
        if (dist > 5) {
          toTarget.norm();
          const wanderSpeed = this.isWeakened 
            ? BALANCE.bacteria.wanderSpeed * BALANCE.enemy.weakenedWobbleSpeedMult 
            : (isTellActive ? BALANCE.bacteria.wanderSpeed * 1.6 : BALANCE.bacteria.wanderSpeed);
          const wander = Math.sin(this.timeAlive * wanderSpeed) * BALANCE.bacteria.wanderAmplitude;
          const moveAngle = toTarget.angle() + wander;
          const targetVel = new Vec2(Math.cos(moveAngle) * currentSpeed, Math.sin(moveAngle) * currentSpeed);
          this.vel.lerp(targetVel, BALANCE.bacteria.steerLerp);
        }
      } else if (this.hitStunTimer > 0) {
        this.vel.mult(BALANCE.bacteria.hitStunDecay);
      }

      this.pos.x += (this.vel.x + currentVx) * dt;
      this.pos.y += (this.vel.y + currentVy) * dt;
      this.clampToWorldBounds(worldBounds, 10);
      this.bodyAngle = this.vel.angle();
    } else {
      this.pos.x += (this.vel.x + currentVx) * dt;
      this.pos.y += (this.vel.y + currentVy) * dt;
      this.clampToWorldBounds(worldBounds, 10);
    }

    let wobbleSpeed = BALANCE.bacteria.wobbleSpeed;
    let wobbleAmp = BALANCE.bacteria.wobbleAmp;
    if (this.isWeakened) {
      wobbleSpeed *= BALANCE.enemy.weakenedWobbleSpeedMult;
      wobbleAmp *= BALANCE.enemy.weakenedWobbleAmpMult;
    } else if (isTellActive) {
      wobbleSpeed += tellProgress * 16;
      wobbleAmp += tellProgress * 2.5;
    }

    const stretchX = this.isSplitting ? 1.0 + splitProgress * 0.95 : 1.0;
    const pinchAmount = this.isSplitting ? Math.pow(splitProgress, 1.2) * 0.88 : 0;

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const rx = this.radius * BALANCE.bacteria.rxMult * stretchX;
      const ry = this.radius * BALANCE.bacteria.ryMult;

      const waistWeight = 1.0 - cosA * cosA;
      const pinchFactor = 1.0 - pinchAmount * waistWeight;
      const wobble = Math.sin(this.timeAlive * wobbleSpeed + i * 1.2) * wobbleAmp;

      const px = cosA * (rx + wobble);
      const py = sinA * (ry * pinchFactor + wobble * (1.0 - pinchAmount * 0.5));
      this.points[i].set(px, py);
    }
  }

  performSplit(soundFx, particleSys) {
    this.isSplitting = false;
    this.splitAnimTimer = 0;
    this.splitTimer = 0;

    const nextGen = this.generation + 1;
    const moveAngle = this.bodyAngle || 0;
    const u = new Vec2(Math.cos(moveAngle), Math.sin(moveAngle));
    const offsetDist = this.baseRadius * 0.55;

    // Apply generation reduction to parent
    this.generation = nextGen;
    this.baseRadius = this.baseRadius * BALANCE.bacteria.splitSizeMultiplier;
    this.radius = this.baseRadius;
    this.maxHp = this.maxHp * BALANCE.bacteria.splitSizeMultiplier;
    this.hp = Math.min(this.maxHp, this.hp * BALANCE.bacteria.splitSizeMultiplier);

    // Parent pushes backward along fission axis
    this.pos.sub(u.copy().mult(offsetDist));
    this.vel.set(-u.x * BALANCE.bacteria.splitPushSpeed, -u.y * BALANCE.bacteria.splitPushSpeed);

    // Spawn child pushing forward along fission axis
    const childPos = this.pos.copy().add(u.copy().mult(offsetDist * 2));
    const child = new Bacteria(childPos.x, childPos.y, nextGen);
    child.hp = this.hp;
    child.bodyAngle = this.bodyAngle;
    child.vel.set(u.x * BALANCE.bacteria.splitPushSpeed, u.y * BALANCE.bacteria.splitPushSpeed);
    child.splitTimer = 0;
    this.pendingOffspring = child;

    if (soundFx && typeof soundFx.playBacteriaSplit === 'function') {
      soundFx.playBacteriaSplit();
    }

    if (particleSys) {
      const midX = this.pos.x + u.x * offsetDist;
      const midY = this.pos.y + u.y * offsetDist;
      particleSys.emitBurst(midX, midY, BALANCE.bacteria.splitParticleCount, {
        color: this.getBloodColor(),
        size: 4,
        minSpeed: 2,
        maxSpeed: 6.5,
        life: 0.45,
        type: 'blob'
      });
      particleSys.emitRing(midX, midY, 8, {
        radius: 8,
        speed: 2.8,
        color: PALETTE.enemy.bacteria.membrane
      });
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.bodyAngle);

    const engulfScale = this.isBeingEngulfed ? Math.max(0.01, 1.0 - this.engulfProgress) : 1.0;
    if (this.isBeingEngulfed) {
      ctx.globalAlpha = Math.max(0, 1.0 - this.engulfProgress * 0.85);
    }
    ctx.scale(this.squashX * engulfScale, this.squashY * engulfScale);

    const p = this.getWeakenedProgress();
    const canSplit = this.generation < BALANCE.bacteria.splitMaxGeneration &&
      !this.isWeakened &&
      !this.isBeingEngulfed &&
      this.alive &&
      this.damageDelayTimer <= 0;
    const isTellActive = canSplit && !this.isSplitting &&
      (this.splitTimer >= BALANCE.bacteria.splitInterval - BALANCE.bacteria.splitTellDuration);
    const tellProgress = isTellActive
      ? Math.min(1.0, (this.splitTimer - (BALANCE.bacteria.splitInterval - BALANCE.bacteria.splitTellDuration)) / BALANCE.bacteria.splitTellDuration)
      : 0;

    // Flagella appendages
    ctx.strokeStyle = this.isWeakened 
      ? PALETTE.enemy.bacteria.weakenedFlagella 
      : PALETTE.enemy.bacteria.flagella;
    ctx.lineWidth = 2.5;
    const flagSpeedMult = this.isWeakened 
      ? BALANCE.enemy.weakenedWobbleSpeedMult 
      : (isTellActive ? 1.0 + tellProgress * 1.8 : 1.0);

    this.flagella.forEach((flag) => {
      const fx = Math.cos(flag.baseAngle) * this.radius * 0.9;
      const fy = Math.sin(flag.baseAngle) * this.radius * 0.7;
      const wave = Math.sin(this.timeAlive * flag.speed * flagSpeedMult + flag.phase) * (this.isWeakened ? 4 : 8);
      const tx = fx - Math.cos(flag.baseAngle) * flag.length + wave * 0.5;
      const ty = fy + wave;

      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.quadraticCurveTo(fx - flag.length * 0.5, fy + wave * 1.2, tx, ty);
      ctx.stroke();
    });

    // Body Fill & Membrane
    if (this.flashTimer > 0) {
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius * 1.4);
      grad.addColorStop(0, PALETTE.enemy.bacteria.flash[0]);
      grad.addColorStop(1, PALETTE.enemy.bacteria.flash[1]);
      ctx.fillStyle = grad;
      ctx.strokeStyle = PALETTE.enemy.bacteria.membrane;
      ctx.lineWidth = 3;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();
    } else {
      // Base normal body
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius * 1.4);
      grad.addColorStop(0, PALETTE.enemy.bacteria.grad[0]);
      grad.addColorStop(0.5, PALETTE.enemy.bacteria.grad[1]);
      grad.addColorStop(1, PALETTE.enemy.bacteria.grad[2]);
      ctx.fillStyle = grad;
      ctx.strokeStyle = PALETTE.enemy.bacteria.membrane;
      ctx.lineWidth = 3;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();

      // Desaturated overlay for weakened state transition
      if (p > 0) {
        ctx.save();
        ctx.globalAlpha = p;
        const wGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius * 1.4);
        wGrad.addColorStop(0, PALETTE.enemy.bacteria.weakenedGrad[0]);
        wGrad.addColorStop(0.5, PALETTE.enemy.bacteria.weakenedGrad[1]);
        wGrad.addColorStop(1, PALETTE.enemy.bacteria.weakenedGrad[2]);
        ctx.fillStyle = wGrad;
        ctx.strokeStyle = PALETTE.enemy.bacteria.weakenedMembrane;
        ctx.lineWidth = 3;
        drawSmoothClosedCurve(ctx, this.points);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }

    // Pulsing outline around weakened body
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

    // Nucleoid DNA strand (splits into two during binary fission)
    ctx.strokeStyle = this.isWeakened 
      ? PALETTE.enemy.bacteria.weakenedNucleoid 
      : PALETTE.enemy.bacteria.nucleoid;
    ctx.lineWidth = 3;

    if (this.isSplitting) {
      const t = Math.min(1.0, this.splitAnimTimer / BALANCE.bacteria.splitAnimDuration);
      const stretchX = 1.0 + t * 0.95;
      const lobeDist = this.radius * 0.5 * stretchX;
      const dnaSpeed = (BALANCE.bacteria.dnaOscillationSpeed + 8) * (this.isWeakened ? BALANCE.enemy.weakenedWobbleSpeedMult : 1.0);
      const dnaAmp = BALANCE.bacteria.dnaOscillationAmp * 0.7;

      [-lobeDist, lobeDist].forEach((cx) => {
        ctx.beginPath();
        for (let s = -10; s <= 10; s += 4) {
          const sy = Math.sin(s * 0.4 + this.timeAlive * dnaSpeed) * dnaAmp;
          if (s === -10) ctx.moveTo(cx + s, sy);
          else ctx.lineTo(cx + s, sy);
        }
        ctx.stroke();
      });
    } else {
      const dnaSpeed = this.isWeakened 
        ? BALANCE.bacteria.dnaOscillationSpeed * BALANCE.enemy.weakenedWobbleSpeedMult 
        : (isTellActive ? BALANCE.bacteria.dnaOscillationSpeed + tellProgress * 12 : BALANCE.bacteria.dnaOscillationSpeed);
      const dnaAmp = isTellActive ? BALANCE.bacteria.dnaOscillationAmp + tellProgress * 3 : BALANCE.bacteria.dnaOscillationAmp;

      ctx.beginPath();
      for (let s = -18; s <= 18; s += 6) {
        const sy = Math.sin(s * 0.3 + this.timeAlive * dnaSpeed) * dnaAmp;
        if (s === -18) ctx.moveTo(s, sy);
        else ctx.lineTo(s, sy);
      }
      ctx.stroke();
    }

    ctx.restore();
  }
}
