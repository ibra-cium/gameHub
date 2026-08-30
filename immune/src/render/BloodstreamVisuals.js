import { Vec2 } from '../core/Vec2.js';
import { BALANCE } from '../config/balance.js';

export class BloodstreamVisuals {
  constructor(bounds) {
    this.bounds = bounds;
    this.deepRBCs = [];
    this.redBloodCells = [];
    this.floaters = [];
    this.init();
  }

  init() {
    this.deepRBCs = [];
    const deepCount = BALANCE.environment.deepRbcCount || 36;
    for (let i = 0; i < deepCount; i++) {
      this.deepRBCs.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        vel: new Vec2(
          (Math.random() * 18 + 10) * (Math.random() < 0.5 ? 1 : -1),
          (Math.random() * 12 - 6)
        ),
        radiusX: 13 + Math.random() * 7,
        radiusY: 9 + Math.random() * 5,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.25,
        colorIndex: Math.random() < 0.5 ? 0 : 1,
        alpha: 0.14 + Math.random() * 0.16
      });
    }

    this.redBloodCells = [];
    const rbcCount = BALANCE.environment.rbcCount || 52;
    for (let i = 0; i < rbcCount; i++) {
      this.redBloodCells.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        vel: new Vec2(
          (Math.random() * 30 + 20) * (Math.random() < 0.5 ? 1 : -1),
          (Math.random() * 20 - 10)
        ),
        radiusX: 20 + Math.random() * 13,
        radiusY: 13 + Math.random() * 8,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.45,
        colorIndex: Math.random() < 0.5 ? 0 : 1,
        alpha: 0.32 + Math.random() * 0.28,
        highlightPhase: Math.random() * Math.PI * 2
      });
    }

    this.floaters = [];
    const floaterCount = BALANCE.environment.floaterCount || 110;
    const speedMin = BALANCE.environment.floaterSpeedMin || 16;
    const speedMax = BALANCE.environment.floaterSpeedMax || 38;
    for (let i = 0; i < floaterCount; i++) {
      this.floaters.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        size: 1.5 + Math.random() * 3.2,
        speed: speedMin + Math.random() * (speedMax - speedMin),
        alpha: 0.18 + Math.random() * 0.42,
        sparkleSpeed: 2.0 + Math.random() * 3.5,
        sparklePhase: Math.random() * Math.PI * 2
      });
    }
  }

  update(dt, time, bounds, isCalm, currentField = null) {
    this.bounds = bounds;
    const speedMult = isCalm ? BALANCE.objectives.patrol.calmParticleSpeedFactor : 1.0;
    const hasCurrent = currentField && currentField.strength > 0;

    // 1. Deep background erythrocytes (slower parallax drift)
    this.deepRBCs.forEach((drbc) => {
      if (hasCurrent) {
        const flow = currentField.getFlow(drbc.pos.x, drbc.pos.y);
        drbc.pos.x += (flow.x * 0.45 + drbc.vel.x * 0.15) * dt * speedMult;
        drbc.pos.y += (flow.y * 0.45 + drbc.vel.y * 0.15) * dt * speedMult;
        if (flow.magSq() > 0.01) {
          drbc.rot = flow.angle();
        }
      } else {
        drbc.pos.x += drbc.vel.x * dt * speedMult * 0.6;
        drbc.pos.y += drbc.vel.y * dt * speedMult * 0.6;
        drbc.rot += drbc.rotSpeed * dt * speedMult;
      }

      if (drbc.pos.x < this.bounds.x - 60) drbc.pos.x = this.bounds.x + this.bounds.w + 60;
      if (drbc.pos.x > this.bounds.x + this.bounds.w + 60) drbc.pos.x = this.bounds.x - 60;
      if (drbc.pos.y < this.bounds.y - 60) drbc.pos.y = this.bounds.y + this.bounds.h + 60;
      if (drbc.pos.y > this.bounds.y + this.bounds.h + 60) drbc.pos.y = this.bounds.y - 60;
    });

    // 2. Midground flowing erythrocytes (aligning with current vector)
    this.redBloodCells.forEach((rbc) => {
      if (hasCurrent) {
        const flow = currentField.getFlow(rbc.pos.x, rbc.pos.y);
        rbc.pos.x += (flow.x * 0.88 + rbc.vel.x * 0.12) * dt * speedMult;
        rbc.pos.y += (flow.y * 0.88 + rbc.vel.y * 0.12) * dt * speedMult;
        if (flow.magSq() > 0.01) {
          rbc.rot = flow.angle();
        }
      } else {
        rbc.pos.x += rbc.vel.x * dt * speedMult;
        rbc.pos.y += rbc.vel.y * dt * speedMult;
        rbc.rot += rbc.rotSpeed * dt * speedMult;
      }

      rbc.highlightPhase += dt * 1.5;

      if (rbc.pos.x < this.bounds.x - 70) rbc.pos.x = this.bounds.x + this.bounds.w + 70;
      if (rbc.pos.x > this.bounds.x + this.bounds.w + 70) rbc.pos.x = this.bounds.x - 70;
      if (rbc.pos.y < this.bounds.y - 70) rbc.pos.y = this.bounds.y + this.bounds.h + 70;
      if (rbc.pos.y > this.bounds.y + this.bounds.h + 70) rbc.pos.y = this.bounds.y - 70;
    });

    // 3. Ambient floaters / plasma micro-vesicles
    this.floaters.forEach((f) => {
      f.sparklePhase += dt * f.sparkleSpeed;
      if (hasCurrent) {
        const flow = currentField.getFlow(f.pos.x, f.pos.y);
        const floatFactor = (f.speed / 20.0);
        f.pos.x += flow.x * floatFactor * dt * speedMult;
        f.pos.y += flow.y * floatFactor * dt * speedMult;
      } else {
        f.pos.y -= f.speed * dt * speedMult;
        f.pos.x += Math.sin(time * 1.5 + f.speed) * 0.6;
      }

      if (f.pos.x < this.bounds.x - 20) f.pos.x = this.bounds.x + this.bounds.w + 20;
      if (f.pos.x > this.bounds.x + this.bounds.w + 20) f.pos.x = this.bounds.x - 20;
      if (f.pos.y < this.bounds.y - 20) f.pos.y = this.bounds.y + this.bounds.h + 20;
      if (f.pos.y > this.bounds.y + this.bounds.h + 20) f.pos.y = this.bounds.y - 20;
    });
  }

  draw(ctx, bounds, time, palette, isCalm, currentField = null) {
    const envPal = palette.environment || {};
    const bg = isCalm ? envPal.calmBackground || palette.background : palette.background;
    const bgGrad = ctx.createRadialGradient(
      bounds.x + bounds.w * 0.5,
      bounds.y + bounds.h * 0.5,
      bounds.w * 0.08,
      bounds.x + bounds.w * 0.5,
      bounds.y + bounds.h * 0.5,
      bounds.w * 0.85
    );
    bgGrad.addColorStop(0, bg[0]);
    bgGrad.addColorStop(0.5, bg[1]);
    bgGrad.addColorStop(1, bg[2] || palette.backgroundDeep);

    ctx.fillStyle = bgGrad;
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);

    // Faint current streamline filaments in flow direction
    if (currentField && currentField.strength > 0) {
      currentField.draw(ctx, bounds, time, palette);
    }

    // 1. Draw deep parallax RBCs
    const deepRbcColors = isCalm ? envPal.calmRbc || envPal.rbc : envPal.rbcDeep || envPal.rbc;
    this.deepRBCs.forEach((drbc) => {
      ctx.save();
      ctx.translate(drbc.pos.x, drbc.pos.y);
      ctx.rotate(drbc.rot);
      ctx.globalAlpha = isCalm ? drbc.alpha * 0.6 : drbc.alpha;

      ctx.fillStyle = deepRbcColors ? deepRbcColors[drbc.colorIndex] : palette.tissue;
      ctx.beginPath();
      ctx.ellipse(0, 0, drbc.radiusX, drbc.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = envPal.rbcCenter || palette.backgroundDeep;
      ctx.beginPath();
      ctx.ellipse(0, 0, drbc.radiusX * 0.40, drbc.radiusY * 0.40, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 2. Draw ambient plasma floaters
    const floaterPrefix = isCalm ? envPal.calmFloaterPrefix || palette.dustMote : envPal.floaterPrefix || palette.dustMote;
    this.floaters.forEach((f) => {
      const alphaPulse = f.alpha * (0.75 + 0.25 * Math.sin(f.sparklePhase));
      ctx.fillStyle = floaterPrefix + alphaPulse + ')';
      ctx.beginPath();
      ctx.arc(f.pos.x, f.pos.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw midground flowing erythrocytes
    const rbcColors = isCalm ? envPal.calmRbc || envPal.rbc : envPal.rbc;
    const highlightColor = envPal.rbcHighlight || 'rgba(255, 100, 130, 0.45)';
    this.redBloodCells.forEach((rbc) => {
      ctx.save();
      ctx.translate(rbc.pos.x, rbc.pos.y);
      ctx.rotate(rbc.rot);
      ctx.globalAlpha = isCalm ? rbc.alpha * 0.75 : rbc.alpha;

      // Outer biconcave erythrocyte body
      ctx.fillStyle = rbcColors ? rbcColors[rbc.colorIndex] : palette.tissue;
      ctx.beginPath();
      ctx.ellipse(0, 0, rbc.radiusX, rbc.radiusY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Oxygenated highlight rim
      if (!isCalm) {
        ctx.strokeStyle = highlightColor;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(0, 0, rbc.radiusX * 0.88, rbc.radiusY * 0.88, 0, -Math.PI * 0.6, Math.PI * 0.4);
        ctx.stroke();
      }

      // Central biconcave depression
      ctx.fillStyle = envPal.rbcCenter || palette.backgroundDeep;
      ctx.beginPath();
      ctx.ellipse(0, 0, rbc.radiusX * 0.44, rbc.radiusY * 0.44, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // 4. Vessel boundary walls with procedural endothelial lining
    this.drawVesselBoundaries(ctx, bounds, time, palette, isCalm);
  }

  drawVesselBoundaries(ctx, bounds, time, palette, isCalm) {
    const envPal = palette.environment || {};
    const wallThick = BALANCE.environment.wallThickness || 46;
    const wave = Math.sin(time * (BALANCE.environment.wallWaveSpeed || 2.2)) * (BALANCE.environment.wallWaveAmp || 6);

    const baseWallFill = isCalm ? envPal.calmVesselFill || palette.wallFill : envPal.vesselFill || palette.wallFill;
    const baseWallBorder = isCalm ? envPal.calmVesselBorder || palette.wallBorder : envPal.vesselBorder || palette.wallBorder;
    const endotheliumColor = envPal.vesselEndothelium || palette.wallEndothelium || '#9e1b2d';
    const nucleusColor = envPal.vesselEndotheliumNucleus || palette.wallEndotheliumNucleus || '#500913';
    const cellLength = BALANCE.environment.endothelialCellLength || 52;
    const nucleusRadius = BALANCE.environment.endothelialNucleusRadius || 3.5;

    ctx.save();

    // 1. Muscular vessel wall background fill
    ctx.fillStyle = baseWallFill;
    ctx.fillRect(bounds.x, bounds.y, bounds.w, wallThick + wave);
    ctx.fillRect(bounds.x, bounds.y + bounds.h - wallThick - wave, bounds.w, wallThick + wave);
    ctx.fillRect(bounds.x, bounds.y, wallThick + wave, bounds.h);
    ctx.fillRect(bounds.x + bounds.w - wallThick - wave, bounds.y, wallThick + wave, bounds.h);

    // 2. Procedural endothelial cell lining along vessel lumen margins
    ctx.fillStyle = endotheliumColor;
    ctx.strokeStyle = baseWallBorder;
    ctx.lineWidth = 2.0;

    // Top boundary endothelial cells
    const topY = bounds.y + wallThick + wave;
    for (let x = bounds.x + wallThick; x < bounds.x + bounds.w - wallThick; x += cellLength) {
      const segW = Math.min(cellLength, bounds.x + bounds.w - wallThick - x);
      const midX = x + segW * 0.5;
      const cellWave = Math.sin(time * 2.0 + x * 0.015) * 2.5;

      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.quadraticCurveTo(midX, topY + 7 + cellWave, x + segW, topY);
      ctx.stroke();

      // Endothelial cell nucleus
      ctx.fillStyle = nucleusColor;
      ctx.beginPath();
      ctx.arc(midX, topY - 5 + cellWave * 0.5, nucleusRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bottom boundary endothelial cells
    const botY = bounds.y + bounds.h - wallThick - wave;
    for (let x = bounds.x + wallThick; x < bounds.x + bounds.w - wallThick; x += cellLength) {
      const segW = Math.min(cellLength, bounds.x + bounds.w - wallThick - x);
      const midX = x + segW * 0.5;
      const cellWave = Math.sin(time * 2.0 + x * 0.015 + Math.PI) * 2.5;

      ctx.beginPath();
      ctx.moveTo(x, botY);
      ctx.quadraticCurveTo(midX, botY - 7 - cellWave, x + segW, botY);
      ctx.stroke();

      ctx.fillStyle = nucleusColor;
      ctx.beginPath();
      ctx.arc(midX, botY + 5 - cellWave * 0.5, nucleusRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Left boundary endothelial cells
    const leftX = bounds.x + wallThick + wave;
    for (let y = bounds.y + wallThick; y < bounds.y + bounds.h - wallThick; y += cellLength) {
      const segH = Math.min(cellLength, bounds.y + bounds.h - wallThick - y);
      const midY = y + segH * 0.5;
      const cellWave = Math.sin(time * 2.0 + y * 0.015) * 2.5;

      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.quadraticCurveTo(leftX + 7 + cellWave, midY, leftX, y + segH);
      ctx.stroke();

      ctx.fillStyle = nucleusColor;
      ctx.beginPath();
      ctx.arc(leftX - 5 + cellWave * 0.5, midY, nucleusRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Right boundary endothelial cells
    const rightX = bounds.x + bounds.w - wallThick - wave;
    for (let y = bounds.y + wallThick; y < bounds.y + bounds.h - wallThick; y += cellLength) {
      const segH = Math.min(cellLength, bounds.y + bounds.h - wallThick - y);
      const midY = y + segH * 0.5;
      const cellWave = Math.sin(time * 2.0 + y * 0.015 + Math.PI) * 2.5;

      ctx.beginPath();
      ctx.moveTo(rightX, y);
      ctx.quadraticCurveTo(rightX - 7 - cellWave, midY, rightX, y + segH);
      ctx.stroke();

      ctx.fillStyle = nucleusColor;
      ctx.beginPath();
      ctx.arc(rightX + 5 - cellWave * 0.5, midY, nucleusRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Outer boundary framing stroke
    ctx.strokeStyle = baseWallBorder;
    ctx.lineWidth = 4;
    ctx.strokeRect(
      bounds.x + wallThick + wave,
      bounds.y + wallThick + wave,
      bounds.w - (wallThick + wave) * 2,
      bounds.h - (wallThick + wave) * 2
    );

    ctx.restore();
  }
}

