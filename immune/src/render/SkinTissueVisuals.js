import { Vec2 } from '../core/Vec2.js';
import { BALANCE } from '../config/balance.js';

export class SkinTissueVisuals {
  constructor(bounds) {
    this.bounds = bounds;
    this.stromaNodes = [];
    this.deepStrands = [];
    this.strands = [];
    this.lipidDroplets = [];
    this.dustMotes = [];
    this.init();
  }

  init() {
    const envBal = BALANCE.environment;

    // 1. Deep out-of-focus stroma cellular nodes (bokeh background)
    this.stromaNodes = [];
    for (let i = 0; i < envBal.stromaNodeCount; i++) {
      const radius = envBal.stromaMinRadius + Math.random() * envBal.stromaRandRadius;
      const speed = envBal.stromaDriftSpeedMin + Math.random() * (envBal.stromaDriftSpeedMax - envBal.stromaDriftSpeedMin);
      const angle = Math.random() * Math.PI * 2;
      this.stromaNodes.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        radius: radius,
        radiusY: radius * (0.75 + Math.random() * 0.5),
        rot: Math.random() * Math.PI,
        vel: new Vec2(Math.cos(angle) * speed, Math.sin(angle) * speed),
        alpha: 0.15 + Math.random() * 0.25,
        pulseSpeed: 0.4 + Math.random() * 0.6,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // 2. Deep extracellular matrix collagen bundles
    this.deepStrands = [];
    for (let i = 0; i < envBal.collagenDeepStrandCount; i++) {
      const len = envBal.collagenMinLength * 1.3 + Math.random() * envBal.collagenRandLength;
      const angle = (Math.random() - 0.5) * 1.2;
      const speed = envBal.collagenDriftSpeedMin * 0.6 + Math.random() * 3;
      this.deepStrands.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        length: len,
        angle: angle,
        driftVel: new Vec2(Math.cos(angle + Math.PI * 0.5) * speed, Math.sin(angle + Math.PI * 0.5) * speed * 0.4),
        width: envBal.collagenMinWidth * 2.0 + Math.random() * 3.5,
        alpha: 0.14 + Math.random() * 0.18,
        curvature: (Math.random() - 0.5) * 80,
        wobbleSpeed: envBal.collagenWobbleSpeed * 0.7,
        wobblePhase: Math.random() * Math.PI * 2
      });
    }

    // 3. Mid/Foreground fine collagen & elastin fibrils
    this.strands = [];
    for (let i = 0; i < envBal.collagenStrandCount; i++) {
      const len = envBal.collagenMinLength + Math.random() * envBal.collagenRandLength;
      const angle = (Math.random() - 0.5) * 0.9;
      const speed = envBal.collagenDriftSpeedMin + Math.random() * (envBal.collagenDriftSpeedMax - envBal.collagenDriftSpeedMin);
      this.strands.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        length: len,
        angle: angle,
        driftVel: new Vec2(
          Math.cos(angle + Math.PI * 0.5) * speed * (Math.random() < 0.5 ? 1 : -1),
          Math.sin(angle + Math.PI * 0.5) * speed * 0.5
        ),
        width: envBal.collagenMinWidth + Math.random() * envBal.collagenRandWidth,
        alpha: 0.28 + Math.random() * 0.35,
        curvature: (Math.random() - 0.5) * 55,
        wobbleSpeed: envBal.collagenWobbleSpeed + Math.random() * 0.5,
        wobblePhase: Math.random() * Math.PI * 2,
        isBright: Math.random() < 0.35
      });
    }

    // 4. Refractive floating lipid micro-droplets
    this.lipidDroplets = [];
    for (let i = 0; i < envBal.lipidDropletCount; i++) {
      const r = envBal.lipidDropletMinRadius + Math.random() * envBal.lipidDropletRandRadius;
      const speed = envBal.lipidDropletSpeedMin + Math.random() * (envBal.lipidDropletSpeedMax - envBal.lipidDropletSpeedMin);
      this.lipidDroplets.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        radius: r,
        speed: speed,
        alpha: 0.22 + Math.random() * 0.30,
        phase: Math.random() * Math.PI * 2,
        wobbleRate: 0.8 + Math.random() * 0.8
      });
    }

    // 5. Glowing interstitial fluid dust motes
    this.dustMotes = [];
    for (let i = 0; i < envBal.dustMoteCount; i++) {
      this.dustMotes.push({
        pos: new Vec2(
          this.bounds.x + Math.random() * this.bounds.w,
          this.bounds.y + Math.random() * this.bounds.h
        ),
        size: envBal.dustMoteSizeMin + Math.random() * (envBal.dustMoteSizeMax - envBal.dustMoteSizeMin),
        speed: envBal.dustMoteSpeedMin + Math.random() * (envBal.dustMoteSpeedMax - envBal.dustMoteSpeedMin),
        alpha: 0.25 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        rate: envBal.dustMoteWobbleSpeed + Math.random() * 0.6
      });
    }
  }

  update(dt, time, bounds, isCalm, currentField = null) {
    this.bounds = bounds;
    const speedMult = isCalm ? BALANCE.objectives.patrol.calmParticleSpeedFactor : 1.0;

    this.stromaNodes.forEach((node) => {
      node.pos.x += node.vel.x * dt * speedMult;
      node.pos.y += node.vel.y * dt * speedMult;
      const m = node.radius + 60;
      if (node.pos.x < this.bounds.x - m) node.pos.x = this.bounds.x + this.bounds.w + m;
      if (node.pos.x > this.bounds.x + this.bounds.w + m) node.pos.x = this.bounds.x - m;
      if (node.pos.y < this.bounds.y - m) node.pos.y = this.bounds.y + this.bounds.h + m;
      if (node.pos.y > this.bounds.y + this.bounds.h + m) node.pos.y = this.bounds.y - m;
    });

    this.deepStrands.forEach((s) => {
      s.pos.x += s.driftVel.x * dt * speedMult;
      s.pos.y += s.driftVel.y * dt * speedMult;
      const margin = s.length + 80;
      if (s.pos.x < this.bounds.x - margin) s.pos.x = this.bounds.x + this.bounds.w + margin;
      if (s.pos.x > this.bounds.x + this.bounds.w + margin) s.pos.x = this.bounds.x - margin;
      if (s.pos.y < this.bounds.y - margin) s.pos.y = this.bounds.y + this.bounds.h + margin;
      if (s.pos.y > this.bounds.y + this.bounds.h + margin) s.pos.y = this.bounds.y - margin;
    });

    this.strands.forEach((s) => {
      s.pos.x += s.driftVel.x * dt * speedMult;
      s.pos.y += s.driftVel.y * dt * speedMult;
      const margin = s.length + 80;
      if (s.pos.x < this.bounds.x - margin) s.pos.x = this.bounds.x + this.bounds.w + margin;
      if (s.pos.x > this.bounds.x + this.bounds.w + margin) s.pos.x = this.bounds.x - margin;
      if (s.pos.y < this.bounds.y - margin) s.pos.y = this.bounds.y + this.bounds.h + margin;
      if (s.pos.y > this.bounds.y + this.bounds.h + margin) s.pos.y = this.bounds.y - margin;
    });

    this.lipidDroplets.forEach((d) => {
      d.pos.y -= d.speed * dt * speedMult;
      d.pos.x += Math.sin(time * d.wobbleRate + d.phase) * 0.4;
      if (d.pos.y < this.bounds.y - 30) d.pos.y = this.bounds.y + this.bounds.h + 30;
      if (d.pos.x < this.bounds.x - 30) d.pos.x = this.bounds.x + this.bounds.w + 30;
      if (d.pos.x > this.bounds.x + this.bounds.w + 30) d.pos.x = this.bounds.x - 30;
    });

    this.dustMotes.forEach((m) => {
      m.pos.y -= m.speed * dt * speedMult;
      m.pos.x += Math.sin(time * m.rate + m.phase) * BALANCE.environment.dustMoteWobbleAmp;
      if (m.pos.y < this.bounds.y - 20) m.pos.y = this.bounds.y + this.bounds.h + 20;
      if (m.pos.x < this.bounds.x - 20) m.pos.x = this.bounds.x + this.bounds.w + 20;
      if (m.pos.x > this.bounds.x + this.bounds.w + 20) m.pos.x = this.bounds.x - 20;
    });
  }

  draw(ctx, bounds, time, palette, isCalm, currentField = null) {
    const bg = isCalm && palette.environment?.calmBackground ? palette.environment.calmBackground : palette.background;
    
    // 1. Multi-stage subcutaneous dermal gradient
    const bgGrad = ctx.createRadialGradient(
      bounds.x + bounds.w * 0.5,
      bounds.y + bounds.h * 0.35,
      bounds.w * 0.05,
      bounds.x + bounds.w * 0.5,
      bounds.y + bounds.h * 0.5,
      bounds.w * 0.75
    );
    bgGrad.addColorStop(0, bg[0]);
    bgGrad.addColorStop(0.35, bg[1]);
    bgGrad.addColorStop(0.70, bg[2]);
    bgGrad.addColorStop(1, bg[3] || palette.backgroundDeep);

    ctx.fillStyle = bgGrad;
    ctx.fillRect(bounds.x, bounds.y, bounds.w, bounds.h);

    if (currentField && currentField.strength > 0) {
      currentField.draw(ctx, bounds, time, palette);
    }

    // 2. Out-of-focus background stroma cellular nodes (deep soft bokeh)
    this.drawStromaNodes(ctx, time, palette, isCalm);

    // 3. Fluid caustics ribbons (interstitial flow shimmer)
    this.drawFluidCaustics(ctx, bounds, time, palette);

    // 4. Deep extracellular matrix fiber network
    this.drawCollagenFibers(ctx, this.deepStrands, palette.tissueStrandDeep, time, isCalm);

    // 5. Mid/foreground fine collagen fibrils
    this.drawCollagenFibers(ctx, this.strands, palette.tissueStrand, time, isCalm, palette.tissueStrandBright);

    // 6. Refractive lipid micro-droplets
    this.drawLipidDroplets(ctx, time, palette, isCalm);

    // 7. Subsurface top lighting dispersion
    this.drawTopLighting(ctx, bounds, palette);

    // 8. Glowing interstitial fluid motes
    this.drawDustMotes(ctx, time, palette);

    // 9. Soft organic tissue boundary walls
    this.drawTissueBoundaries(ctx, bounds, time, palette, isCalm);
  }

  drawStromaNodes(ctx, time, palette, isCalm) {
    ctx.save();
    this.stromaNodes.forEach((node) => {
      const pulse = 1.0 + 0.06 * Math.sin(time * node.pulseSpeed + node.pulsePhase);
      const radX = node.radius * pulse;
      const radY = node.radiusY * pulse;

      ctx.save();
      ctx.translate(node.pos.x, node.pos.y);
      ctx.rotate(node.rot);

      const grad = ctx.createRadialGradient(0, 0, radX * 0.1, 0, 0, radX);
      grad.addColorStop(0, palette.stromaNodeGlow || palette.tissueGlow);
      grad.addColorStop(0.6, palette.stromaNode || palette.tissueGlow);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.globalAlpha = isCalm ? node.alpha * 0.65 : node.alpha;
      ctx.beginPath();
      ctx.ellipse(0, 0, radX, radY, 0, 0, Math.PI * 2);
      ctx.fill();

      // Delicate out-of-focus membrane rim
      ctx.strokeStyle = palette.stromaNodeRim || palette.tissueGlow;
      ctx.lineWidth = 2.0;
      ctx.stroke();

      ctx.restore();
    });
    ctx.restore();
  }

  drawFluidCaustics(ctx, bounds, time, palette) {
    const ribbonCount = BALANCE.environment.causticRibbonCount;
    const ribbonW = BALANCE.environment.causticRibbonWidth;
    const speed = BALANCE.environment.causticRibbonSpeed;

    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < ribbonCount; i++) {
      const offset = (time * speed + i * (bounds.h / ribbonCount)) % bounds.h;
      const y = bounds.y + offset;
      const grad = ctx.createLinearGradient(bounds.x, y, bounds.x, y + ribbonW);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, palette.causticRibbon || palette.tissueGlow);
      grad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(bounds.x, y);
      const steps = 6;
      for (let s = 1; s <= steps; s++) {
        const x = bounds.x + (bounds.w / steps) * s;
        const waveY = y + Math.sin(time * 0.8 + s * 1.2 + i) * 18;
        ctx.lineTo(x, waveY);
      }
      ctx.lineTo(bounds.x + bounds.w, y + ribbonW);
      ctx.lineTo(bounds.x, y + ribbonW);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  drawCollagenFibers(ctx, strandList, baseColor, time, isCalm, brightColor = null) {
    ctx.save();
    ctx.lineCap = 'round';

    strandList.forEach((s) => {
      const halfLen = s.length * 0.5;
      const wobble = Math.sin(time * s.wobbleSpeed + s.wobblePhase) * BALANCE.environment.collagenWobbleAmp;
      const cosA = Math.cos(s.angle);
      const sinA = Math.sin(s.angle);
      const perpX = -sinA;
      const perpY = cosA;

      const p0x = s.pos.x - cosA * halfLen;
      const p0y = s.pos.y - sinA * halfLen;
      const p3x = s.pos.x + cosA * halfLen;
      const p3y = s.pos.y + sinA * halfLen;

      const cp1Offset = s.curvature + wobble;
      const cp2Offset = -s.curvature - wobble * 0.85;

      const cp1x = s.pos.x - cosA * (halfLen * 0.35) + perpX * cp1Offset;
      const cp1y = s.pos.y - sinA * (halfLen * 0.35) + perpY * cp1Offset;
      const cp2x = s.pos.x + cosA * (halfLen * 0.35) + perpX * cp2Offset;
      const cp2y = s.pos.y + sinA * (halfLen * 0.35) + perpX * cp2Offset;

      ctx.strokeStyle = (s.isBright && brightColor) ? brightColor : baseColor;
      ctx.lineWidth = s.width;
      ctx.globalAlpha = isCalm ? s.alpha * 0.7 : s.alpha;

      ctx.beginPath();
      ctx.moveTo(p0x, p0y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p3x, p3y);
      ctx.stroke();
    });

    ctx.restore();
  }

  drawLipidDroplets(ctx, time, palette, isCalm) {
    ctx.save();
    this.lipidDroplets.forEach((d) => {
      const pulse = 1.0 + 0.05 * Math.sin(time * d.wobbleRate + d.phase);
      const rad = d.radius * pulse;

      ctx.save();
      ctx.translate(d.pos.x, d.pos.y);
      ctx.globalAlpha = isCalm ? d.alpha * 0.7 : d.alpha;

      const grad = ctx.createRadialGradient(rad * 0.2, -rad * 0.2, 1, 0, 0, rad);
      grad.addColorStop(0, palette.lipidDropletCore || palette.tissueGlow);
      grad.addColorStop(0.7, palette.lipidDroplet || palette.tissueGlow);
      grad.addColorStop(1, palette.lipidDropletRim || palette.tissue);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();

      // Refractive highlight rim
      ctx.strokeStyle = palette.lipidDropletRim || palette.tissue;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Specular highlight crescent
      ctx.fillStyle = palette.dustMote + '0.7)';
      ctx.beginPath();
      ctx.arc(-rad * 0.35, -rad * 0.35, rad * 0.25, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
    ctx.restore();
  }

  drawTopLighting(ctx, bounds, palette) {
    const h = bounds.h * BALANCE.environment.topLightHeightRatio;
    const topLightGrad = ctx.createLinearGradient(bounds.x, bounds.y, bounds.x, bounds.y + h);
    topLightGrad.addColorStop(0, palette.lightGradientTop[0]);
    topLightGrad.addColorStop(0.45, palette.lightGradientTop[1]);
    topLightGrad.addColorStop(1, palette.lightGradientTop[2]);

    ctx.fillStyle = topLightGrad;
    ctx.fillRect(bounds.x, bounds.y, bounds.w, h);
  }

  drawDustMotes(ctx, time, palette) {
    const motePrefix = palette.dustMote;
    const moteGlowPrefix = palette.dustMoteGlow || palette.dustMote;
    ctx.save();
    this.dustMotes.forEach((m) => {
      const pulseAlpha = m.alpha * (0.75 + 0.25 * Math.sin(time * m.rate + m.phase));

      // Outer soft halo
      ctx.fillStyle = moteGlowPrefix + (pulseAlpha * 0.45) + ')';
      ctx.beginPath();
      ctx.arc(m.pos.x, m.pos.y, m.size * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      ctx.fillStyle = motePrefix + pulseAlpha + ')';
      ctx.beginPath();
      ctx.arc(m.pos.x, m.pos.y, m.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  drawTissueBoundaries(ctx, bounds, time, palette, isCalm) {
    const wallThick = BALANCE.environment.tissueWallThickness;
    const wave = Math.sin(time * BALANCE.environment.tissueWallWaveSpeed) * BALANCE.environment.tissueWallWaveAmp;

    ctx.save();
    ctx.fillStyle = isCalm && palette.calmWallFill ? palette.calmWallFill : palette.wallFill;
    ctx.strokeStyle = isCalm && palette.calmWallBorder ? palette.calmWallBorder : palette.wallBorder;
    ctx.lineWidth = 5;

    ctx.fillRect(bounds.x, bounds.y, bounds.w, wallThick + wave);
    ctx.fillRect(bounds.x, bounds.y + bounds.h - wallThick - wave, bounds.w, wallThick + wave);
    ctx.fillRect(bounds.x, bounds.y, wallThick + wave, bounds.h);
    ctx.fillRect(bounds.x + bounds.w - wallThick - wave, bounds.y, wallThick + wave, bounds.h);

    ctx.strokeRect(
      bounds.x + wallThick + wave,
      bounds.y + wallThick + wave,
      bounds.w - (wallThick + wave) * 2,
      bounds.h - (wallThick + wave) * 2
    );
    ctx.restore();
  }
}
