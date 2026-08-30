import { Entity } from './Entity.js';
import { Vec2 } from '../core/Vec2.js';
import { drawSmoothClosedCurve } from '../render/drawUtils.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class BodyCell extends Entity {
  constructor(x = 0, y = 0) {
    super(x, y, BALANCE.bodyCell.radius);
    this.baseRadius = BALANCE.bodyCell.radius;
    this.radius = this.baseRadius;
    this.state = 'healthy'; // 'healthy' | 'infected' | 'dead'
    this.infectingType = null; // 'bacteria' | 'virus' | 'parasite'
    this.infectionTimer = 0;
    this.pendingEnemySpawn = null;

    const angle = Math.random() * Math.PI * 2;
    const speed = BALANCE.bodyCell.driftSpeedMin + Math.random() * (BALANCE.bodyCell.driftSpeedMax - BALANCE.bodyCell.driftSpeedMin);
    this.vel = new Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed);

    this.rotation = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.25;

    this.spots = [];
    this.organelles = [];
    for (let i = 0; i < BALANCE.bodyCell.organelleCount; i++) {
      const oAngle = (i / BALANCE.bodyCell.organelleCount) * Math.PI * 2 + Math.random() * 0.4;
      const oDist = this.baseRadius * (0.35 + Math.random() * 0.35);
      this.organelles.push({
        x: Math.cos(oAngle) * oDist,
        y: Math.sin(oAngle) * oDist,
        size: 2.0 + Math.random() * 2.2,
        phase: Math.random() * Math.PI * 2
      });
    }
    this.twitchTimer = 0;
    this.twitchOffset = new Vec2(0, 0);
    this.initPoints(BALANCE.bodyCell.numPoints);
  }

  isHealable() {
    if (this.state !== 'infected') return false;
    const progress = this.infectionTimer / BALANCE.bodyCell.infectionDuration;
    return progress <= BALANCE.bodyCell.healableRatio;
  }

  infect(infectingType = 'virus', soundFx = null, particleSys = null) {
    if (this.state !== 'healthy') return false;
    this.state = 'infected';
    this.infectingType = infectingType;
    this.infectionTimer = 0;
    this.generateInfectionSpots();
    if (soundFx) soundFx.playInfect();
    if (particleSys) {
      const pColor = PALETTE.enemy[this.infectingType]?.membrane || PALETTE.player.membrane;
      particleSys.emitBurst(this.pos.x, this.pos.y, 6, {
        color: pColor,
        size: 3,
        minSpeed: 1,
        maxSpeed: 4,
        life: 0.3
      });
    }
    return true;
  }

  generateInfectionSpots() {
    this.spots = [];
    const count = 7 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const spotAngle = Math.random() * Math.PI * 2;
      const spotDist = (0.2 + Math.random() * 0.65) * this.baseRadius;
      this.spots.push({
        x: Math.cos(spotAngle) * spotDist,
        y: Math.sin(spotAngle) * spotDist,
        size: 2.2 + Math.random() * 3.4
      });
    }
  }

  heal(soundFx = null, particleSys = null) {
    if (!this.isHealable()) return false;
    this.state = 'healthy';
    this.infectingType = null;
    this.infectionTimer = 0;
    this.spots = [];
    this.twitchOffset.set(0, 0);
    if (soundFx) soundFx.playHeal();
    if (particleSys) {
      particleSys.emitBurst(this.pos.x, this.pos.y, BALANCE.bodyCell.healBurstParticleCount, {
        color: PALETTE.bodyCell.healBurst,
        size: 4.5,
        minSpeed: 2,
        maxSpeed: 6,
        life: 0.45,
        type: 'blob'
      });
      particleSys.emitShockwave(this.pos.x, this.pos.y, this.radius * 1.6, PALETTE.bodyCell.healBurst, 0.28);
    }
    return true;
  }

  update(dt, worldBounds, soundFx = null, particleSys = null, currentField = null) {
    this.timeAlive += dt;
    this.rotation += this.rotSpeed * dt;
    if (this.state === 'infected') {
      this.infectionTimer += dt;
      this.twitchTimer -= dt;
      if (this.twitchTimer <= 0) {
        this.twitchTimer = BALANCE.bodyCell.twitchIntervalMin + Math.random() * BALANCE.bodyCell.twitchIntervalRand;
        const j = BALANCE.bodyCell.twitchJitter;
        this.twitchOffset.set((Math.random() * 2 - 1) * j, (Math.random() * 2 - 1) * j);
      }
      if (this.infectionTimer >= BALANCE.bodyCell.infectionDuration) {
        this.state = 'dead';
        this.pendingEnemySpawn = this.infectingType || 'virus';
        if (soundFx) soundFx.playInfectionRupture();
        if (particleSys) {
          const ruptureColor = PALETTE.enemy[this.infectingType]?.blood || PALETTE.bodyCell.dead.membrane;
          particleSys.emitShockwave(this.pos.x, this.pos.y, this.radius * 2.2, ruptureColor, 0.35);
          particleSys.emitBurst(this.pos.x, this.pos.y, 20, {
            color: ruptureColor,
            size: 5,
            minSpeed: 3,
            maxSpeed: 8,
            life: 0.55,
            type: 'blob'
          });
        }
      }
    }
    let currentVelX = this.vel.x;
    let currentVelY = this.vel.y;
    if (this.state === 'dead') {
      currentVelX *= BALANCE.bodyCell.deadSpeedMult;
      currentVelY *= BALANCE.bodyCell.deadSpeedMult;
      this.radius = this.baseRadius * BALANCE.bodyCell.deadRadiusMult;
    } else {
      this.radius = this.baseRadius;
    }

    let currentVx = 0;
    let currentVy = 0;
    if (currentField && currentField.strength > 0) {
      const flow = currentField.getFlow(this.pos.x, this.pos.y);
      const res = this.state === 'dead' ? 0.9 : 0.7;
      currentVx = flow.x * res;
      currentVy = flow.y * res;
    }

    this.pos.x += (currentVelX + currentVx + (this.state === 'infected' ? this.twitchOffset.x : 0)) * dt;
    this.pos.y += (currentVelY + currentVy + (this.state === 'infected' ? this.twitchOffset.y : 0)) * dt;
    if (worldBounds) {
      const margin = this.radius + 30;
      const minX = worldBounds.x + margin;
      const maxX = worldBounds.x + worldBounds.w - margin;
      const minY = worldBounds.y + margin;
      const maxY = worldBounds.y + worldBounds.h - margin;
      if (this.pos.x < minX) { this.pos.x = minX; this.vel.x = Math.abs(this.vel.x); }
      else if (this.pos.x > maxX) { this.pos.x = maxX; this.vel.x = -Math.abs(this.vel.x); }
      if (this.pos.y < minY) { this.pos.y = minY; this.vel.y = Math.abs(this.vel.y); }
      else if (this.pos.y > maxY) { this.pos.y = maxY; this.vel.y = -Math.abs(this.vel.y); }
    }
    this.updatePoints();
  }

  updatePoints() {
    const isInf = this.state === 'infected';
    const isDead = this.state === 'dead';

    const wobbleSpeed = isDead
      ? BALANCE.bodyCell.deadWobbleSpeed
      : isInf
      ? BALANCE.bodyCell.infectedWobbleSpeed
      : BALANCE.bodyCell.healthyWobbleSpeed;

    const wobbleAmp = isDead
      ? BALANCE.bodyCell.deadWobbleAmp
      : isInf
      ? BALANCE.bodyCell.infectedWobbleAmp
      : BALANCE.bodyCell.healthyWobbleAmp;

    for (let i = 0; i < this.numPoints; i++) {
      const angle = (i / this.numPoints) * Math.PI * 2;
      // Multi-harmonic organic contour
      const h1 = Math.sin(this.timeAlive * wobbleSpeed + angle * 2.0) * (wobbleAmp * 0.65);
      const h2 = Math.cos(this.timeAlive * wobbleSpeed * 1.3 + angle * 3.0) * (wobbleAmp * 0.35);
      let r = this.radius + h1 + h2;

      if (isInf) {
        r += (Math.random() - 0.5) * BALANCE.bodyCell.twitchJitter * 0.6;
      } else if (isDead) {
        // Dented, deflated organic contour
        r += (i % 3 === 0 ? -3 : 1.5);
      }

      this.points[i].set(Math.cos(angle) * r, Math.sin(angle) * r);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);
    ctx.rotate(this.rotation);

    if (this.state === 'healthy') {
      this.drawHealthy(ctx);
    } else if (this.state === 'infected') {
      this.drawInfected(ctx);
    } else {
      this.drawDead(ctx);
    }

    ctx.restore();
  }

  drawHealthy(ctx) {
    const pal = PALETTE.bodyCell.healthy;

    // 1. Outer soft glow
    ctx.shadowColor = pal.glow;
    ctx.shadowBlur = 14;

    // 2. Translucent cytoplasm multi-stop gradient
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, this.radius);
    grad.addColorStop(0, pal.grad[0]);
    grad.addColorStop(0.35, pal.grad[1]);
    grad.addColorStop(0.70, pal.grad[2]);
    grad.addColorStop(1, pal.grad[3] || pal.grad[2]);

    ctx.fillStyle = grad;
    ctx.strokeStyle = pal.membrane;
    ctx.lineWidth = 2.4;

    drawSmoothClosedCurve(ctx, this.points);
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // 3. Inner sub-membrane ring for lipid bilayer depth
    if (pal.membraneSub) {
      ctx.strokeStyle = pal.membraneSub;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 4. Cytoplasmic organelle granules
    const organelleColor = pal.organelle || pal.nucleusInner;
    this.organelles.forEach((org) => {
      const orgWobble = Math.sin(this.timeAlive * 1.5 + org.phase) * 1.0;
      ctx.fillStyle = organelleColor;
      ctx.beginPath();
      ctx.arc(org.x, org.y, Math.max(1, org.size + orgWobble * 0.4), 0, Math.PI * 2);
      ctx.fill();
    });

    // 5. Spherical healthy nucleus with chromatin depth and nucleolus
    const nRad = this.radius * 0.32;
    const nWobble = Math.sin(this.timeAlive * 1.8) * 0.8;
    const effNRad = Math.max(2, nRad + nWobble);

    // Nuclear halo/shadow
    if (pal.nucleusGlow) {
      ctx.shadowColor = pal.nucleusGlow;
      ctx.shadowBlur = 6;
    }

    const nGrad = ctx.createRadialGradient(-effNRad * 0.25, -effNRad * 0.25, effNRad * 0.1, 0, 0, effNRad);
    nGrad.addColorStop(0, pal.nucleus);
    nGrad.addColorStop(0.8, pal.nucleusInner);
    nGrad.addColorStop(1, pal.nucleusInner);

    ctx.fillStyle = nGrad;
    ctx.beginPath();
    ctx.arc(0, 0, effNRad, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Nucleolus inner core
    ctx.fillStyle = pal.nucleusInner;
    ctx.beginPath();
    ctx.arc(-effNRad * 0.2, -effNRad * 0.2, effNRad * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }

  drawInfected(ctx) {
    const shiftProgress = Math.min(1.0, this.infectionTimer / BALANCE.bodyCell.colorShiftDuration);
    const typeKey = this.infectingType || 'virus';
    const targetPal = PALETTE.bodyCell.infected[typeKey] || PALETTE.bodyCell.infected.fallback;
    const healthyPal = PALETTE.bodyCell.healthy;

    // 1. Draw base healthy body
    const baseGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius);
    baseGrad.addColorStop(0, healthyPal.grad[0]);
    baseGrad.addColorStop(0.55, healthyPal.grad[1]);
    baseGrad.addColorStop(1, healthyPal.grad[2]);

    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = healthyPal.membrane;
    ctx.lineWidth = 2.5;

    drawSmoothClosedCurve(ctx, this.points);
    ctx.fill();
    ctx.stroke();

    // 2. Cross-fade infected pathogen tint over 2 seconds
    if (shiftProgress > 0) {
      ctx.save();
      ctx.globalAlpha = shiftProgress;

      const infGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, this.radius);
      infGrad.addColorStop(0, targetPal.grad[0]);
      infGrad.addColorStop(0.55, targetPal.grad[1]);
      infGrad.addColorStop(1, targetPal.grad[2]);

      ctx.fillStyle = infGrad;
      ctx.strokeStyle = targetPal.membrane;
      ctx.lineWidth = 2.5;

      drawSmoothClosedCurve(ctx, this.points);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 3. Nucleus
    ctx.fillStyle = shiftProgress > 0.5 ? targetPal.nucleus : healthyPal.nucleus;
    ctx.beginPath();
    const nRad = this.radius * (0.32 + shiftProgress * 0.08);
    const nWobble = Math.sin(this.timeAlive * 6.0) * 2.0;
    ctx.arc(0, 0, Math.max(1, nRad + nWobble), 0, Math.PI * 2);
    ctx.fill();

    // 4. Dark infection spots
    const spotAlpha = Math.min(0.9, this.infectionTimer / 1.5);
    if (spotAlpha > 0.05) {
      ctx.fillStyle = PALETTE.bodyCell.infected.spots;
      ctx.save();
      ctx.globalAlpha = spotAlpha;
      for (const s of this.spots) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5. Pulsing heal aura indicator during first 40% window
    if (this.isHealable()) {
      const pulse = 0.5 + 0.5 * Math.sin(this.timeAlive * 6.0);
      ctx.save();
      ctx.strokeStyle = PALETTE.bodyCell.infected.healAura;
      ctx.lineWidth = 2.0 + pulse * 1.5;
      ctx.globalAlpha = 0.4 + pulse * 0.5;
      drawSmoothClosedCurve(ctx, this.points);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawDead(ctx) {
    const pal = PALETTE.bodyCell.dead;

    // Deflated grey gradient
    const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, this.radius);
    grad.addColorStop(0, pal.grad[0]);
    grad.addColorStop(0.6, pal.grad[1]);
    grad.addColorStop(1, pal.grad[2]);

    ctx.fillStyle = grad;
    ctx.strokeStyle = pal.membrane;
    ctx.lineWidth = 2.0;

    drawSmoothClosedCurve(ctx, this.points);
    ctx.fill();
    ctx.stroke();

    // Dark shriveled nucleus
    ctx.fillStyle = pal.nucleus;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Dead dark spots
    ctx.fillStyle = pal.spots;
    for (const s of this.spots) {
      ctx.beginPath();
      ctx.arc(s.x * 0.7, s.y * 0.7, Math.max(1.5, s.size * 0.8), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
