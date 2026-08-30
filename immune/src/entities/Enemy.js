import { Entity } from './Entity.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class Enemy extends Entity {
  constructor(x, y, type) {
    super(x, y, BALANCE.enemyBase.radius);
    this.type = type;
    this.baseRadius = BALANCE.enemyBase.radius;
    this.speed = BALANCE.enemyBase.speed;
    this.hp = BALANCE.enemyBase.hp;
    this.maxHp = BALANCE.enemyBase.maxHp;
    this.damage = BALANCE.enemyBase.damage;
    this.timeAlive = Math.random() * 100;
    this.hitStunTimer = 0;
    this.flashTimer = 0;
    this.bodyAngle = 0;
    this.isWeakened = false;
    this.weakenedTimer = 0;
    this.isBeingEngulfed = false;
    this.engulfProgress = 0;

    this.initPoints(BALANCE.enemyBase.numPoints);
  }

  getWeakenedProgress() {
    if (!this.isWeakened) return 0;
    return Math.min(1.0, this.weakenedTimer / BALANCE.enemy.weakenedTransitionDuration);
  }

  getWeakenedOutlineColor(alpha = 1) {
    const prefix = PALETTE.enemy[this.type]?.weakenedOutline || PALETTE.enemy.base.weakenedOutline;
    return `${prefix}${alpha})`;
  }

  releaseFromEngulf() {
    this.isBeingEngulfed = false;
    this.engulfProgress = 0;
    this.hp = this.maxHp * BALANCE.enemy.engulfThreshold;
    this.isWeakened = true;
  }

  takeDamage(amount, hitDir, soundFx, particleSys, camera) {
    if (this.isBeingEngulfed || !this.alive) return;
    this.hp -= amount;
    this.flashTimer = BALANCE.enemyBase.flashDuration;
    this.hitStunTimer = BALANCE.enemyBase.hitStunDuration;

    this.vel.x += hitDir.x * BALANCE.enemyBase.knockbackVelocity;
    this.vel.y += hitDir.y * BALANCE.enemyBase.knockbackVelocity;

    this.squashX = BALANCE.enemyBase.hitSquashX;
    this.squashY = BALANCE.enemyBase.hitSquashY;

    soundFx.playHit();
    camera.shake(BALANCE.enemyBase.hitShakeIntensity, BALANCE.enemyBase.hitShakeDuration);

    particleSys.emitBurst(this.pos.x, this.pos.y, 8, {
      color: this.getBloodColor(),
      size: 4,
      minSpeed: 2,
      maxSpeed: 6,
      life: 0.35
    });

    if (this.hp <= 0) {
      this.destroy();
      this.onDeath(soundFx, particleSys, camera);
    } else if (!this.isWeakened && (this.hp / this.maxHp <= BALANCE.enemy.engulfThreshold)) {
      this.isWeakened = true;
      this.weakenedTimer = 0;
      soundFx.playEnemyWeakened();
    }
  }

  onDeath(soundFx, particleSys, camera) {
    soundFx.playEnemyDeath();
    camera.shake(BALANCE.enemyBase.deathShakeIntensity, BALANCE.enemyBase.deathShakeDuration);
    particleSys.emitShockwave(this.pos.x, this.pos.y, this.radius * 2.5, this.getAccentColor(), 0.35);
    particleSys.emitBurst(this.pos.x, this.pos.y, 24, {
      color: this.getBloodColor(),
      size: 5,
      minSpeed: 3,
      maxSpeed: 9,
      life: 0.65,
      type: 'blob'
    });
  }

  getBloodColor() { return PALETTE.enemy.base.blood; }
  getAccentColor() { return PALETTE.enemy.base.accent; }

  updateBase(dt) {
    this.timeAlive += dt;
    if (this.flashTimer > 0) this.flashTimer -= dt;
    if (this.hitStunTimer > 0) this.hitStunTimer -= dt;
    if (this.isWeakened) this.weakenedTimer += dt;

    this.squashX += (1.0 - this.squashX) * BALANCE.enemyBase.squashRecovery;
    this.squashY += (1.0 - this.squashY) * BALANCE.enemyBase.squashRecovery;
  }

  clampToWorldBounds(worldBounds, marginOffset = 0) {
    if (!worldBounds) return;
    const margin = this.radius + marginOffset;
    const minX = worldBounds.x + margin;
    const maxX = worldBounds.x + worldBounds.w - margin;
    const minY = worldBounds.y + margin;
    const maxY = worldBounds.y + worldBounds.h - margin;

    if (this.pos.x < minX) {
      this.pos.x = minX;
      if (this.vel.x < 0) this.vel.x = -this.vel.x * 0.4;
    } else if (this.pos.x > maxX) {
      this.pos.x = maxX;
      if (this.vel.x > 0) this.vel.x = -this.vel.x * 0.4;
    }

    if (this.pos.y < minY) {
      this.pos.y = minY;
      if (this.vel.y < 0) this.vel.y = -this.vel.y * 0.4;
    } else if (this.pos.y > maxY) {
      this.pos.y = maxY;
      if (this.vel.y > 0) this.vel.y = -this.vel.y * 0.4;
    }
  }

  drawHealthBar(ctx) {
    if (this.hp < this.maxHp && this.hp > 0 && !this.isBeingEngulfed) {
      const barW = this.radius * 2;
      const barH = 5;
      const barX = this.pos.x - barW / 2;
      const barY = this.pos.y - this.radius - 14;
      const pct = Math.max(0, this.hp / this.maxHp);

      ctx.save();
      ctx.fillStyle = PALETTE.enemy.base.healthBarBg;
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = PALETTE.enemy.base.healthBarFill;
      ctx.fillRect(barX, barY, barW * pct, barH);
      ctx.strokeStyle = PALETTE.enemy.base.healthBarBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.restore();
    }
  }
}
