import { Entity } from './Entity.js';
import { Vec2 } from '../core/Vec2.js';
import { drawSmoothClosedCurve } from '../render/drawUtils.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class Player extends Entity {
  constructor(x, y, isSpawning = false) {
    super(x, y, BALANCE.player.radius);
    this.targetVel = new Vec2(0, 0);
    this.baseRadius = BALANCE.player.radius;
    this.speed = BALANCE.player.speed;
    this.dashSpeed = BALANCE.player.dashSpeed;

    this.maxHp = BALANCE.player.maxHp;
    this.hp = this.maxHp;
    this.invulnerableTime = isSpawning ? BALANCE.player.respawnInvulnerability : 0;
    this.invulnerableDuration = BALANCE.player.invulnerableDuration;

    this.formingDuration = BALANCE.player.respawnFormDuration;
    this.formingTimer = isSpawning ? this.formingDuration : 0;

    // Cooldowns
    this.dashCooldown = BALANCE.player.dashCooldown;
    this.dashTimer = 0;
    this.dashDuration = BALANCE.player.dashDuration;
    this.isDashing = false;
    this.dashTimeRemaining = 0;
    this.dashDir = new Vec2(1, 0);

    this.attackCooldown = BALANCE.player.attackCooldown;
    this.attackTimer = 0;
    this.attackDamage = BALANCE.player.attackDamage;
    this.isAttacking = false;
    this.attackProgress = 0;
    this.attackDuration = BALANCE.player.attackDuration;
    this.attackTarget = new Vec2(0, 0);
    this.attackHitboxTriggered = false;

    // Vent mechanics
    this.ventCooldown = BALANCE.player.vent.cooldown;
    this.ventTimer = 0;
    this.ventSpeedBoostTimer = 0;

    // Engulfing (phagocytosis) and Mass mechanics
    this.mass = 0;
    this.interpolatedMass = 0;
    this.wobbleTime = 0;
    this.isEngulfing = false;
    this.engulfingTarget = null;
    this.engulfTimer = 0;
    this.engulfDuration = BALANCE.player.engulfDuration;
    this.engulfStartEnemyPos = new Vec2(0, 0);

    // Soft-body procedural mesh points
    this.initPoints(BALANCE.player.numPoints);

    // Pseudopods (soft organic reaching tentacles)
    this.pseudopods = BALANCE.player.pseudopods.map((pod) => ({
      baseAngleOffset: pod.baseAngleOffset,
      length: 0,
      targetLen: 0,
      wobbleSpeed: pod.wobbleSpeed,
      phase: pod.phase
    }));

    this.targetSquashX = 1.0;
    this.targetSquashY = 1.0;
    this.aimAngle = 0;
    this.bodyRotation = 0;
  }

  startEngulf(enemy, soundFx) {
    if (this.isEngulfing || !enemy.isWeakened || enemy.isBeingEngulfed || this.dead) {
      return false;
    }
    this.isEngulfing = true;
    this.engulfingTarget = enemy;
    this.engulfTimer = 0;
    this.engulfDuration = enemy.type === 'splinter'
      ? BALANCE.player.engulfDuration * (BALANCE.splinter?.engulfDurationMultiplier || 2.0)
      : BALANCE.player.engulfDuration;
    this.engulfStartEnemyPos = enemy.pos.copy();
    enemy.isBeingEngulfed = true;
    enemy.engulfProgress = 0;
    soundFx.playEngulf();
    return true;
  }

  cancelEngulf() {
    if (!this.isEngulfing) return;
    if (this.engulfingTarget && this.engulfingTarget.alive) {
      this.engulfingTarget.releaseFromEngulf();
      if (this.engulfingTarget.type !== 'splinter') {
        const away = this.engulfingTarget.pos.copy().sub(this.pos);
        if (away.magSq() > 0.01) {
          away.norm().mult(90);
        } else {
          away.set(60, 0);
        }
        this.engulfingTarget.vel.set(away.x, away.y);
      }
    }
    this.isEngulfing = false;
    this.engulfingTarget = null;
    this.engulfTimer = 0;
  }

  takeDamage(amount, soundFx, particleSys, camera) {
    if (this.invulnerableTime > 0 || !this.alive) return false;
    if (this.isEngulfing) {
      this.cancelEngulf();
    }
    this.hp = Math.max(0, this.hp - amount);
    this.invulnerableTime = this.invulnerableDuration;

    for (let i = 0; i < this.numPoints; i++) {
      this.pointSprings[i] -= BALANCE.player.damageSpringDeflect + Math.random() * BALANCE.player.damageSpringRandom;
    }

    soundFx.playPlayerDamage();
    camera.shake(BALANCE.player.damageShakeIntensity, BALANCE.player.damageShakeDuration);

    particleSys.emitBurst(this.pos.x, this.pos.y, 16, {
      color: PALETTE.player.damageFlash,
      size: 5,
      minSpeed: 3,
      maxSpeed: 8,
      life: 0.4
    });

    if (this.hp <= 0) {
      this.mass = 0;
      this.interpolatedMass = 0;
      this.ventSpeedBoostTimer = 0;
      this.destroy();
      particleSys.emitBurst(this.pos.x, this.pos.y, 60, {
        color: PALETTE.player.deathBurst,
        size: 7,
        minSpeed: 4,
        maxSpeed: 14,
        life: 1.2
      });
      particleSys.emitShockwave(this.pos.x, this.pos.y, 160, PALETTE.player.deathShockwave, 0.6);
    }
    return true;
  }

  stealMass(amount) {
    if (this.mass <= 0 || this.dead || this.isEngulfing) return 0;
    const stolen = Math.min(this.mass, amount);
    this.mass = Math.max(0, this.mass - stolen);
    return stolen;
  }

  vent(soundFx, particleSys, camera, enemies) {
    if (this.ventTimer > 0 || this.dead) return false;

    if (this.mass < BALANCE.player.vent.minMass) {
      soundFx.playVentDenied();
      return false;
    }

    if (this.isEngulfing) {
      this.cancelEngulf();
    }

    const spentMass = this.mass;
    const minMass = BALANCE.player.vent.minMass;
    const maxMass = BALANCE.player.mass.max;
    const massT = Math.max(0, Math.min(1.0, (spentMass - minMass) / Math.max(1, maxMass - minMass)));

    // Instantly dump all mass to zero
    this.mass = 0;
    this.interpolatedMass = 0;

    this.ventTimer = this.ventCooldown;
    this.ventSpeedBoostTimer = BALANCE.player.vent.speedBoostDuration;

    soundFx.playVent();

    // Body violently squashes then snaps back
    this.squashX = BALANCE.player.vent.squashX;
    this.squashY = BALANCE.player.vent.squashY;
    for (let i = 0; i < this.numPoints; i++) {
      this.pointSprings[i] -= BALANCE.player.vent.springImpulse;
    }

    const shockwaveRadius = BALANCE.player.vent.baseRadius + massT * (BALANCE.player.vent.maxRadius - BALANCE.player.vent.baseRadius);
    const ventDamage = BALANCE.player.vent.baseDamage + massT * (BALANCE.player.vent.maxDamage - BALANCE.player.vent.baseDamage);
    const knockbackForce = BALANCE.player.vent.baseKnockback + massT * (BALANCE.player.vent.maxKnockback - BALANCE.player.vent.baseKnockback);
    const shakeIntensity = BALANCE.player.vent.cameraShakeBase + massT * (BALANCE.player.vent.cameraShakeMax - BALANCE.player.vent.cameraShakeBase);

    camera.shake(shakeIntensity, BALANCE.player.vent.cameraShakeDuration);
    particleSys.emitShockwave(this.pos.x, this.pos.y, shockwaveRadius, PALETTE.player.ventShockwave, 0.4);

    const particleCount = Math.round(BALANCE.player.vent.particleCountBase + massT * (BALANCE.player.vent.particleCountMax - BALANCE.player.vent.particleCountBase));
    particleSys.emitBurst(this.pos.x, this.pos.y, particleCount, {
      color: PALETTE.player.ventBurst,
      size: 5 + massT * 4,
      minSpeed: 4,
      maxSpeed: 10 + massT * 8,
      life: 0.45 + massT * 0.3,
      type: 'blob'
    });

    if (enemies && enemies.length > 0) {
      for (const enemy of enemies) {
        if (!enemy.alive || enemy.isBeingEngulfed) continue;
        const d = enemy.pos.dist(this.pos);
        if (d <= shockwaveRadius + enemy.radius) {
          let kbDir = enemy.pos.copy().sub(this.pos);
          if (kbDir.magSq() > 0.001) {
            kbDir.norm();
          } else {
            const randAngle = Math.random() * Math.PI * 2;
            kbDir.set(Math.cos(randAngle), Math.sin(randAngle));
          }
          enemy.takeDamage(ventDamage, kbDir, soundFx, particleSys, camera);
          enemy.vel.set(kbDir.x * knockbackForce, kbDir.y * knockbackForce);
          enemy.hitStunTimer = BALANCE.enemyBase.hitStunDuration * 1.4;
        }
      }
    }

    return true;
  }

  dash(moveDir, soundFx, particleSys, camera) {
    if (this.dashTimer > 0 || this.dead) return;
    this.dashTimer = this.dashCooldown;
    this.isDashing = true;
    this.dashTimeRemaining = this.dashDuration;

    if (moveDir.magSq() > 0.01) {
      this.dashDir = moveDir.copy().norm();
    } else {
      this.dashDir = new Vec2(Math.cos(this.aimAngle), Math.sin(this.aimAngle));
    }

    this.squashX = BALANCE.player.dashSquashX;
    this.squashY = BALANCE.player.dashSquashY;

    soundFx.playDash();
    camera.shake(BALANCE.player.dashShakeIntensity, BALANCE.player.dashShakeDuration);

    particleSys.emitBurst(this.pos.x, this.pos.y, 20, {
      color: PALETTE.player.dashBurst,
      size: 6,
      minSpeed: 2,
      maxSpeed: 8,
      friction: 0.92,
      life: 0.5,
      type: 'blob'
    });
    particleSys.emitShockwave(this.pos.x, this.pos.y, 70, PALETTE.player.dashShockwave, 0.25);
  }

  attack(targetWorldPos, soundFx, particleSys, camera) {
    if (this.attackTimer > 0 || this.dead) return;
    this.attackTimer = this.attackCooldown;
    this.isAttacking = true;
    this.attackProgress = 0;
    this.attackHitboxTriggered = false;
    this.attackTarget = targetWorldPos.copy();

    const diff = targetWorldPos.copy().sub(this.pos);
    this.aimAngle = diff.angle();

    this.squashX = BALANCE.player.attackSquashX;
    this.squashY = BALANCE.player.attackSquashY;

    soundFx.playAttack();
  }

  update(dt, input, soundFx, particleSys, camera, worldBounds, currentField = null, targets = []) {
    this.timeAlive += dt;

    if (this.formingTimer > 0) this.formingTimer -= dt;
    if (this.dashTimer > 0) this.dashTimer -= dt;
    if (this.ventTimer > 0) this.ventTimer -= dt;
    if (this.ventSpeedBoostTimer > 0) this.ventSpeedBoostTimer -= dt;
    if (this.attackTimer > 0) this.attackTimer -= dt;
    if (this.invulnerableTime > 0) this.invulnerableTime -= dt;

    // Smoothly interpolate effective mass for fluid gameplay scaling
    const massLerp = 1.0 - Math.exp(-BALANCE.player.mass.interpSpeed * dt);
    this.interpolatedMass += (this.mass - this.interpolatedMass) * massLerp;
    const massRatio = Math.max(0, Math.min(1.0, this.interpolatedMass / BALANCE.player.mass.max));

    // Derive smooth mass attributes
    const targetRadius = BALANCE.player.radius * (1.0 + (BALANCE.player.mass.radiusScale - 1.0) * massRatio);
    this.baseRadius = targetRadius;
    this.radius = targetRadius;

    const isSpeedBoosted = this.ventSpeedBoostTimer > 0;
    const speedBoostMult = isSpeedBoosted ? BALANCE.player.vent.speedBoostMultiplier : 1.0;
    this.speed = (BALANCE.player.speed * (1.0 + (BALANCE.player.mass.speedScale - 1.0) * massRatio)) * speedBoostMult;

    const prevMaxHp = this.maxHp;
    const targetMaxHp = BALANCE.player.maxHp * (1.0 + (BALANCE.player.mass.maxHpScale - 1.0) * massRatio);
    this.maxHp = targetMaxHp;
    if (prevMaxHp > 0) {
      // Scale current HP with max HP proportionally so absorbing does not act as a free heal
      this.hp = Math.min(this.maxHp, (this.hp / prevMaxHp) * this.maxHp);
    }

    this.dashCooldown = BALANCE.player.dashCooldown * (1.0 + (BALANCE.player.mass.dashCooldownScale - 1.0) * massRatio);
    const reachScale = 1.0 + (BALANCE.player.mass.reachScale - 1.0) * massRatio;

    const aimTargetPos = input.getAimTarget ? input.getAimTarget(this, targets) : input.mouseWorld;
    const aimDiff = aimTargetPos.copy().sub(this.pos);
    if (aimDiff.magSq() > 0.001) {
      this.aimAngle = aimDiff.angle();
    }

    const moveInput = input.getMovementVector();
    if (input.consumeDash()) {
      this.dash(moveInput, soundFx, particleSys, camera);
    }

    const currentSpeed = this.isEngulfing ? this.speed * BALANCE.player.engulfSpeedMultiplier : this.speed;

    if (this.isDashing) {
      this.dashTimeRemaining -= dt;
      this.vel.set(this.dashDir.x * this.dashSpeed, this.dashDir.y * this.dashSpeed);

      if (Math.random() < 0.8) {
        particleSys.emit({
          pos: this.pos.copy().add(new Vec2((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20)),
          vel: new Vec2(-this.dashDir.x * 2 + (Math.random() - 0.5) * 2, -this.dashDir.y * 2 + (Math.random() - 0.5) * 2),
          size: 8 + Math.random() * 8,
          endSize: 0,
          color: PALETTE.player.dashTrail,
          life: 0.35,
          type: 'blob'
        });
      }

      if (this.dashTimeRemaining <= 0) {
        this.isDashing = false;
      }
    } else {
      this.targetVel.set(moveInput.x * currentSpeed, moveInput.y * currentSpeed);
      this.vel.lerp(this.targetVel, 0.2);

      if (isSpeedBoosted && (this.vel.magSq() > 100 || Math.random() < 0.5)) {
        particleSys.emit({
          pos: this.pos.copy().add(new Vec2((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20)),
          vel: new Vec2(-this.vel.x * 0.15 + (Math.random() - 0.5) * 2, -this.vel.y * 0.15 + (Math.random() - 0.5) * 2),
          size: 4 + Math.random() * 5,
          endSize: 0,
          color: PALETTE.player.ventSpeedTrail,
          life: 0.3,
          type: 'blob'
        });
      } else if (this.vel.magSq() > 1000 && Math.random() < 0.3) {
        particleSys.emit({
          pos: this.pos.copy().add(new Vec2((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15)),
          vel: new Vec2(-this.vel.x * 0.1, -this.vel.y * 0.1),
          size: 4 + Math.random() * 4,
          endSize: 0,
          color: PALETTE.player.swimTrail,
          life: 0.25,
          type: 'blob'
        });
      }
    }

    // Velocity contribution from the ambient blood current field
    // Do not apply current during engulfing sequence
    let currentVx = 0;
    let currentVy = 0;
    if (currentField && currentField.strength > 0 && !this.isEngulfing) {
      const flow = currentField.getFlow(this.pos.x, this.pos.y, massRatio);
      currentVx = flow.x;
      currentVy = flow.y;
    }

    this.pos.x += (this.vel.x + currentVx) * dt;
    this.pos.y += (this.vel.y + currentVy) * dt;

    const margin = this.baseRadius + BALANCE.player.bodyMargin;
    this.pos.x = Math.max(worldBounds.x + margin, Math.min(this.pos.x, worldBounds.x + worldBounds.w - margin));
    this.pos.y = Math.max(worldBounds.y + margin, Math.min(this.pos.y, worldBounds.y + worldBounds.h - margin));

    // Handle phagocytosis engulfing progress
    if (this.isEngulfing) {
      if (!this.engulfingTarget || !this.engulfingTarget.alive) {
        this.isEngulfing = false;
        this.engulfingTarget = null;
        this.engulfTimer = 0;
      } else {
        this.engulfTimer += dt;
        const progress = Math.min(1.0, this.engulfTimer / this.engulfDuration);
        this.engulfingTarget.engulfProgress = progress;

        // Smoothly draw enemy inward toward player cell center
        const pullT = Math.pow(progress, 1.15);
        this.engulfingTarget.pos.set(
          this.engulfStartEnemyPos.x + (this.pos.x - this.engulfStartEnemyPos.x) * pullT,
          this.engulfStartEnemyPos.y + (this.pos.y - this.engulfStartEnemyPos.y) * pullT
        );

        if (this.engulfTimer >= this.engulfDuration) {
          const target = this.engulfingTarget;
          let massGain = 1;
          if (target.type === 'bacteria') {
            massGain = BALANCE.player.mass.perBacteria;
          } else if (target.type === 'virus') {
            massGain = BALANCE.player.mass.perVirus;
          } else if (target.type === 'parasite') {
            massGain = BALANCE.player.mass.perParasite;
          } else if (target.type === 'splinter') {
            massGain = 0;
          }

          // Accumulate mass up to maximum capacity if massGain > 0
          if (massGain > 0) {
            this.mass = Math.min(BALANCE.player.mass.max, this.mass + massGain);
          }
          target.destroy();
          if (typeof target.onDestroy === 'function') {
            target.onDestroy(soundFx, particleSys, camera);
          }

          // Outward spring impulse for quick swell-and-settle
          for (let i = 0; i < this.numPoints; i++) {
            this.pointSprings[i] += BALANCE.player.engulfSwellImpulse;
          }

          // Small ring of particles at closure point
          const closureDir = target.pos.copy().sub(this.pos);
          const closureNorm = closureDir.magSq() > 0.01 ? closureDir.norm() : new Vec2(1, 0);
          const closurePos = this.pos.copy().add(closureNorm.mult(this.baseRadius * 0.75));

          particleSys.emitRing(closurePos.x, closurePos.y, BALANCE.player.engulfParticleCount, {
            color: PALETTE.player.engulfRing,
            speed: BALANCE.player.engulfParticleSpeed,
            size: 4,
            radius: 10
          });

          // Very small camera nudge
          camera.shake(BALANCE.player.engulfCameraShakeIntensity, BALANCE.player.engulfCameraShakeDuration);

          this.isEngulfing = false;
          this.engulfingTarget = null;
          this.engulfTimer = 0;
        }
      }
    }

    if (input.consumeAttack() || (input.attackHeld && this.attackTimer <= 0)) {
      this.attack(aimTargetPos, soundFx, particleSys, camera);
    }

    if (this.isAttacking) {
      this.attackProgress += dt / this.attackDuration;
      if (this.attackProgress >= 1.0) {
        this.isAttacking = false;
        this.attackProgress = 0;
      }
    }

    const speedFraction = this.vel.mag() / (this.speed || 1);
    const moveAngle = this.vel.angle();
    if (this.isDashing) {
      this.bodyRotation = this.dashDir.angle();
      this.targetSquashX = 1.9;
      this.targetSquashY = 0.55;
    } else if (speedFraction > 0.1) {
      this.bodyRotation = moveAngle;
      this.targetSquashX = 1 + speedFraction * 0.28;
      this.targetSquashY = 1 - speedFraction * 0.22;
    } else {
      this.bodyRotation = this.aimAngle;
      this.targetSquashX = 1.0;
      this.targetSquashY = 1.0;
    }

    this.squashX += (this.targetSquashX - this.squashX) * 0.18;
    this.squashY += (this.targetSquashY - this.squashY) * 0.18;

    let engulfLocalAngle = 0;
    let engulfEnvelope = 0;
    let engulfProgress = 0;
    if (this.isEngulfing && this.engulfingTarget) {
      engulfProgress = Math.min(1.0, this.engulfTimer / this.engulfDuration);
      engulfEnvelope = Math.sin(engulfProgress * Math.PI);
      const toEnemy = this.engulfingTarget.pos.copy().sub(this.pos);
      const enemyAngle = toEnemy.angle();
      engulfLocalAngle = enemyAngle - this.bodyRotation;
    }

    // Soft-body heavier oscillation and momentum deformation at high mass
    const wobbleFreq = 1.0 - (1.0 - BALANCE.player.mass.wobbleFreqScale) * massRatio;
    this.wobbleTime += dt * 3.5 * wobbleFreq;
    const wobbleAmp = 1.0 + (BALANCE.player.mass.wobbleAmpScale - 1.0) * massRatio;
    const springStiffness = 0.22 * (1.0 - 0.35 * massRatio);
    const springDamping = 0.82 + 0.08 * massRatio;

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const wobble = (Math.sin(this.wobbleTime + i * 0.9) * 3.5 +
                     Math.cos(this.wobbleTime * 1.48 - i * 1.4) * 2.0 +
                     Math.sin(this.wobbleTime * 0.51 + i * 2.5) * 2.5) * wobbleAmp;

      this.pointSprings[i] += (0 - this.pointOffsets[i]) * springStiffness;
      this.pointSprings[i] *= springDamping;
      this.pointOffsets[i] += this.pointSprings[i];

      // Organic inertia sag along direction of travel
      const moveAngleDiff = angle - (this.vel.magSq() > 10 ? moveAngle : this.bodyRotation);
      const sag = -Math.cos(moveAngleDiff) * speedFraction * (BALANCE.player.mass.sagAmp * massRatio);

      let r = this.baseRadius + wobble + this.pointOffsets[i] + sag;

      if (engulfEnvelope > 0) {
        let angleDiff = ((angle - engulfLocalAngle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;

        // Leading forward swell at enemy-facing point during early progress
        const leadFactor = Math.max(0, 1.0 - Math.abs(angleDiff) / 0.35);
        const leadSwell = Math.pow(leadFactor, 2.0) * 12.0 * Math.max(0, engulfEnvelope * (1.0 - engulfProgress * 1.6));

        // Pseudopod lobes reaching around the enemy and pinching closed
        const lipAngle = BALANCE.player.engulfLipAngle * (1.0 - engulfProgress * 0.60);
        const dArm1 = Math.abs(angleDiff - lipAngle);
        const dArm2 = Math.abs(angleDiff + lipAngle);
        const minArmDist = Math.min(dArm1, dArm2);
        const armFactor = Math.max(0, 1.0 - minArmDist / BALANCE.player.engulfArmWidth);
        const armReach = Math.pow(armFactor, 1.3) * BALANCE.player.engulfArmReach * engulfEnvelope;

        // Inward pocket indentation behind target, deepens as arms close
        const pocketSpan = lipAngle * 1.1;
        const centerFactor = Math.max(0, 1.0 - Math.abs(angleDiff) / pocketSpan);
        const pocketIndent = Math.pow(centerFactor, 1.8) * BALANCE.player.engulfPocketDepth * engulfEnvelope;

        r = r + leadSwell + armReach - pocketIndent;
      }

      this.points[i].set(Math.cos(angle) * r, Math.sin(angle) * r);
    }

    this.pseudopods.forEach((pod) => {
      let targetLength = (12 + Math.sin(this.timeAlive * pod.wobbleSpeed + pod.phase) * 8) * reachScale;
      if (this.isAttacking) {
        const strikeExtension = Math.sin(this.attackProgress * Math.PI) * 95 * reachScale;
        targetLength += strikeExtension;
      }
      if (engulfEnvelope > 0) {
        targetLength += engulfEnvelope * 18 * reachScale;
      }
      pod.length += (targetLength - pod.length) * 0.25;
    });
  }

  getAttackHitCircle() {
    if (!this.isAttacking) return null;
    if (this.attackProgress < 0.2 || this.attackProgress > 0.8) return null;

    const massRatio = Math.max(0, Math.min(1.0, this.interpolatedMass / BALANCE.player.mass.max));
    const reachScale = 1.0 + (BALANCE.player.mass.reachScale - 1.0) * massRatio;
    const reach = this.baseRadius + (BALANCE.player.attackReach + Math.sin(this.attackProgress * Math.PI) * BALANCE.player.attackReachExtend) * reachScale;
    const hitX = this.pos.x + Math.cos(this.aimAngle) * reach;
    const hitY = this.pos.y + Math.sin(this.aimAngle) * reach;
    return {
      x: hitX,
      y: hitY,
      radius: BALANCE.player.attackRadius * (1.0 + (BALANCE.player.mass.reachScale - 1.0) * 0.4 * massRatio),
      damage: this.attackDamage
    };
  }

  draw(ctx) {
    if (this.dead) return;

    const formProgress = this.formingDuration > 0 && this.formingTimer > 0
      ? Math.min(1.0, 1.0 - (this.formingTimer / this.formingDuration))
      : 1.0;
    const formScale = this.formingTimer > 0
      ? Math.sin(formProgress * Math.PI * 0.5)
      : 1.0;

    const sizeScale = this.baseRadius / BALANCE.player.radius;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime * 20) % 2 === 0) {
      ctx.globalAlpha = 0.55;
    }

    // 1. Draw Organic Pseudopods
    this.pseudopods.forEach((pod, idx) => {
      const podAngle = this.aimAngle + pod.baseAngleOffset + Math.sin(this.timeAlive * 2 + pod.phase) * 0.15;
      const baseDist = this.baseRadius * 0.75 * formScale;
      const startX = Math.cos(podAngle) * baseDist;
      const startY = Math.sin(podAngle) * baseDist;

      const tipDist = baseDist + pod.length * formScale;
      const tipX = Math.cos(podAngle) * tipDist;
      const tipY = Math.sin(podAngle) * tipDist;

      const ctrlAngle = podAngle + Math.sin(this.timeAlive * 3 + idx) * 0.3;
      const ctrlDist = baseDist + pod.length * 0.55 * formScale;
      const ctrlX = Math.cos(ctrlAngle) * ctrlDist;
      const ctrlY = Math.sin(ctrlAngle) * ctrlDist;

      ctx.save();
      ctx.strokeStyle = PALETTE.player.pseudopodStem;
      ctx.lineWidth = Math.max(6, (18 - (pod.length / 10))) * formScale * Math.sqrt(sizeScale);
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(ctrlX, ctrlY, tipX, tipY);
      ctx.stroke();

      ctx.fillStyle = PALETTE.player.pseudopodTip;
      ctx.beginPath();
      ctx.arc(tipX, tipY, Math.max(1, ctx.lineWidth * 0.65), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 2. Body Outer Soft Glow
    ctx.save();
    ctx.rotate(this.bodyRotation);
    ctx.scale(this.squashX * formScale, this.squashY * formScale);

    const glowGrad = ctx.createRadialGradient(0, 0, this.baseRadius * 0.5, 0, 0, this.baseRadius * 1.5);
    glowGrad.addColorStop(0, PALETTE.player.bodyGlow[0]);
    glowGrad.addColorStop(0.7, PALETTE.player.bodyGlow[1]);
    glowGrad.addColorStop(1, PALETTE.player.bodyGlow[2]);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.baseRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Primary Soft-Body Membrane
    const bodyGrad = ctx.createRadialGradient(-10 * sizeScale, -12 * sizeScale, 6 * sizeScale, 0, 0, this.baseRadius * 1.1);
    bodyGrad.addColorStop(0, PALETTE.player.bodyGrad[0]);
    bodyGrad.addColorStop(0.45, PALETTE.player.bodyGrad[1]);
    bodyGrad.addColorStop(0.8, PALETTE.player.bodyGrad[2]);
    bodyGrad.addColorStop(1, PALETTE.player.bodyGrad[3]);

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = PALETTE.player.membrane;
    ctx.lineWidth = 4 * Math.sqrt(sizeScale);
    drawSmoothClosedCurve(ctx, this.points);
    ctx.fill();
    ctx.stroke();

    // 4. Internal Organelles / Nucleus Lobes (scaled dynamically)
    ctx.fillStyle = PALETTE.player.organelleLobe;
    const lobeTime = this.timeAlive * 1.5;
    for (let l = 0; l < 3; l++) {
      const lobeAngle = (l / 3) * Math.PI * 2 + Math.sin(lobeTime + l) * 0.2;
      const lx = Math.cos(lobeAngle) * 12 * sizeScale;
      const ly = Math.sin(lobeAngle) * 12 * sizeScale;
      const lr = (9 + Math.sin(lobeTime * 2 + l * 1.5) * 2) * Math.sqrt(sizeScale);
      ctx.beginPath();
      ctx.arc(lx, ly, lr, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Cytoplasmic Granules (scaled distribution)
    ctx.fillStyle = PALETTE.player.granules;
    for (let g = 0; g < 7; g++) {
      const gx = Math.sin(g * 12.3 + lobeTime) * 20 * sizeScale;
      const gy = Math.cos(g * 7.7 - lobeTime) * 18 * sizeScale;
      ctx.beginPath();
      ctx.arc(gx, gy, 2.2 * Math.sqrt(sizeScale), 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Engulf Vacuole / Phagosome — glowing membrane tracking engulfed target
    if (this.isEngulfing && this.engulfingTarget) {
      const p = Math.min(1.0, this.engulfTimer / this.engulfDuration);
      const toEnemy = this.engulfingTarget.pos.copy().sub(this.pos);
      const dist = toEnemy.mag() * 0.72;
      const angle = toEnemy.angle() - this.bodyRotation;
      const vx = Math.cos(angle) * dist;
      const vy = Math.sin(angle) * dist;
      const vr = (this.engulfingTarget.radius || 20) * (1.35 - p * 0.85);
      const vacAlpha = Math.min(1, p * 3.0) * (1.0 - p * 0.6);

      ctx.save();
      ctx.globalAlpha = vacAlpha;

      // Radial glow surrounding the engulfed target interior position
      const vacGrad = ctx.createRadialGradient(vx, vy, 0, vx, vy, vr * 1.6);
      vacGrad.addColorStop(0, PALETTE.player.engulfVacuoleGrad[0]);
      vacGrad.addColorStop(0.5, PALETTE.player.engulfVacuoleGrad[1]);
      vacGrad.addColorStop(1, PALETTE.player.engulfVacuoleGrad[2]);
      ctx.fillStyle = vacGrad;
      ctx.beginPath();
      ctx.arc(vx, vy, vr * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Contracting ring — membrane closing around target
      ctx.strokeStyle = PALETTE.player.engulfVacuoleBorder;
      ctx.lineWidth = Math.max(0.5, 2.5 * (1 - p));
      ctx.beginPath();
      ctx.arc(vx, vy, vr, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();

    // 7. Draw Attack Strike Impact Visual
    if (this.isAttacking && this.attackProgress > 0.2 && this.attackProgress < 0.8) {
      const massRatio = Math.max(0, Math.min(1.0, this.interpolatedMass / BALANCE.player.mass.max));
      const reachMult = 1.0 + (BALANCE.player.mass.reachScale - 1.0) * massRatio;
      const reach = this.baseRadius + (60 + Math.sin(this.attackProgress * Math.PI) * 55) * reachMult;
      const strikeX = Math.cos(this.aimAngle) * reach;
      const strikeY = Math.sin(this.aimAngle) * reach;

      ctx.save();
      ctx.strokeStyle = PALETTE.player.attackStrike;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(strikeX, strikeY, 24 * Math.sin(this.attackProgress * Math.PI) * (1.0 + 0.4 * massRatio), 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = PALETTE.player.attackGlow;
      ctx.beginPath();
      ctx.arc(strikeX, strikeY, 10 * Math.sin(this.attackProgress * Math.PI) * (1.0 + 0.4 * massRatio), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }
}
