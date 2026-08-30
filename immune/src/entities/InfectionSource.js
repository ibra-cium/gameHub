import { Entity } from './Entity.js';
import { drawSmoothClosedCurve } from '../render/drawUtils.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class InfectionSource extends Entity {
  constructor(x, y, config = {}) {
    super(x, y, BALANCE.infectionSource.radius);
    this.hp = config.hp ?? BALANCE.infectionSource.hp;
    this.maxHp = this.hp;
    this.spawnInterval = config.spawnInterval ?? BALANCE.infectionSource.defaultSpawnInterval;
    this.spawnTimer = 2.0; // Initial delay before first spawn
    this.enemyTypes = config.enemyTypes || ['bacteria', 'virus', 'parasite'];

    this.flashTimer = 0;
    this.timeAlive = Math.random() * 20;
    this.squashX = 1.0;
    this.squashY = 1.0;

    this.tendrils = [];
    for (let t = 0; t < BALANCE.infectionSource.tendrilCount; t++) {
      this.tendrils.push({
        baseAngle: (t / BALANCE.infectionSource.tendrilCount) * Math.PI * 2,
        length: BALANCE.infectionSource.tendrilLength * (0.8 + Math.random() * 0.4),
        phase: Math.random() * Math.PI * 2,
        speed: 2.0 + Math.random() * 2.0
      });
    }

    this.spores = [];
    for (let s = 0; s < BALANCE.infectionSource.sporeCount; s++) {
      const angle = (s / BALANCE.infectionSource.sporeCount) * Math.PI * 2 + Math.random() * 0.4;
      const dist = this.radius * (0.35 + Math.random() * 0.35);
      this.spores.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        r: 7 + Math.random() * 6,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 3 + Math.random() * 2
      });
    }

    this.pendingEnemySpawn = null;
    this.initPoints(BALANCE.infectionSource.numPoints);
  }

  takeDamage(amount, hitDir, soundFx, particleSys, camera) {
    if (!this.alive) return false;
    this.hp -= amount;
    this.flashTimer = BALANCE.infectionSource.flashDuration;

    this.squashX = 0.85;
    this.squashY = 1.2;

    if (soundFx) soundFx.playHit();
    if (camera) camera.shake(BALANCE.infectionSource.hitShakeIntensity, BALANCE.infectionSource.hitShakeDuration);
    if (particleSys) {
      particleSys.emitBurst(this.pos.x, this.pos.y, 14, {
        color: PALETTE.infectionSource.blood,
        size: 5,
        minSpeed: 3,
        maxSpeed: 7,
        life: 0.4
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
    if (camera) camera.shake(BALANCE.infectionSource.deathShakeIntensity, BALANCE.infectionSource.deathShakeDuration);
    if (particleSys) {
      particleSys.emitShockwave(this.pos.x, this.pos.y, BALANCE.infectionSource.deathShockwaveRadius, PALETTE.infectionSource.membrane, 0.55);
      particleSys.emitBurst(this.pos.x, this.pos.y, BALANCE.infectionSource.deathParticleCount, {
        color: PALETTE.infectionSource.blood,
        size: 6,
        minSpeed: 3,
        maxSpeed: 10,
        life: 0.8,
        type: 'blob'
      });
    }
  }

  update(dt, worldBounds) {
    if (!this.alive) return;
    this.timeAlive += dt;

    if (this.flashTimer > 0) {
      this.flashTimer -= dt;
    }

    this.squashX += (1.0 - this.squashX) * 0.12;
    this.squashY += (1.0 - this.squashY) * 0.12;

    // Continuous enemy reproduction
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = this.spawnInterval;
      const chosenType = this.enemyTypes[Math.floor(Math.random() * this.enemyTypes.length)] || 'bacteria';
      this.pendingEnemySpawn = chosenType;
    }

    // Undulating soft-body membrane vertices
    const wobbleSpeed = BALANCE.infectionSource.wobbleSpeed;
    const wobbleAmp = BALANCE.infectionSource.wobbleAmp;

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      const wave = Math.sin(this.timeAlive * wobbleSpeed + i * 1.6) * wobbleAmp;
      const r = this.radius + wave;
      this.points[i].set(Math.cos(angle) * r, Math.sin(angle) * r);
    }
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.scale(this.squashX, this.squashY);

    // Anchoring tendrils
    ctx.strokeStyle = PALETTE.infectionSource.tendril;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    this.tendrils.forEach((t) => {
      const wobble = Math.sin(this.timeAlive * t.speed + t.phase) * 0.25;
      const angle = t.baseAngle + wobble;
      const sx = Math.cos(angle) * (this.radius * 0.7);
      const sy = Math.sin(angle) * (this.radius * 0.7);
      const tx = Math.cos(angle) * (this.radius + t.length);
      const ty = Math.sin(angle) * (this.radius + t.length);
      const midX = (sx + tx) * 0.5 + Math.sin(this.timeAlive * 3 + t.phase) * 10;
      const midY = (sy + ty) * 0.5 + Math.cos(this.timeAlive * 3 + t.phase) * 10;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(midX, midY, tx, ty);
      ctx.stroke();
    });

    if (this.flashTimer > 0) {
      const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, this.radius * 1.2);
      grad.addColorStop(0, PALETTE.infectionSource.flash[0]);
      grad.addColorStop(1, PALETTE.infectionSource.flash[1]);
      ctx.fillStyle = grad;
      ctx.strokeStyle = PALETTE.infectionSource.membrane;
      ctx.lineWidth = 4;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();
    } else {
      // Glow
      ctx.shadowColor = PALETTE.infectionSource.glow;
      ctx.shadowBlur = 18;

      // Body Gradient
      const grad = ctx.createRadialGradient(0, 0, 8, 0, 0, this.radius * 1.2);
      grad.addColorStop(0, PALETTE.infectionSource.grad[0]);
      grad.addColorStop(0.4, PALETTE.infectionSource.grad[1]);
      grad.addColorStop(1, PALETTE.infectionSource.grad[2]);

      ctx.fillStyle = grad;
      ctx.strokeStyle = PALETTE.infectionSource.membrane;
      ctx.lineWidth = 4;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Dark pulsing central core
      const corePulse = Math.sin(this.timeAlive * 2.8) * 4;
      ctx.fillStyle = PALETTE.infectionSource.core;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.4 + corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Surface spore pods
      this.spores.forEach((spore) => {
        const p = Math.sin(this.timeAlive * spore.pulseSpeed + spore.phase) * 2;
        ctx.fillStyle = PALETTE.infectionSource.spores;
        ctx.beginPath();
        ctx.arc(spore.x, spore.y, spore.r + p, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();

    this.drawHealthBar(ctx);
  }

  drawHealthBar(ctx) {
    if (this.hp < this.maxHp && this.hp > 0) {
      const barW = this.radius * 2.4;
      const barH = 7;
      const barX = this.pos.x - barW / 2;
      const barY = this.pos.y - this.radius - 22;
      const pct = Math.max(0, this.hp / this.maxHp);

      ctx.save();
      ctx.fillStyle = PALETTE.enemy.base.healthBarBg;
      ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.fillStyle = PALETTE.infectionSource.grad[1];
      ctx.fillRect(barX, barY, barW * pct, barH);
      ctx.strokeStyle = PALETTE.enemy.base.healthBarBorder;
      ctx.lineWidth = 1;
      ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);
      ctx.restore();
    }
  }
}
