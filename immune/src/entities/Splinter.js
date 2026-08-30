import { Entity } from './Entity.js';
import { Vec2 } from '../core/Vec2.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class Splinter extends Entity {
  constructor(x = 0, y = 0) {
    super(x, y, BALANCE.splinter.radius);
    this.type = 'splinter';
    this.isWeakened = true; // Permitted for phagocytosis engulfing
    this.isBeingEngulfed = false;
    this.engulfProgress = 0;

    this.damage = BALANCE.splinter.contactDamage;
    this.vel = new Vec2(0, 0); // Static, never moves

    // Foreign fixed orientation embedded into tissue
    this.angle = Math.random() * Math.PI * 2;
    this.aspectRatio = BALANCE.splinter.aspectRatio;

    // Hard angular polygonal shard facets
    this.facets = [];
    this.generateShardGeometry();
  }

  generateShardGeometry() {
    const len = this.radius * this.aspectRatio;
    const halfWidth = this.radius * 0.65;

    // Sharp polygonal apex and base anchor points (in local space)
    const tip = { x: 0, y: -len * 0.65 };
    const baseL = { x: -halfWidth * 0.8, y: len * 0.45 };
    const baseR = { x: halfWidth * 0.8, y: len * 0.40 };
    const midL = { x: -halfWidth * 1.1, y: -len * 0.05 };
    const midR = { x: halfWidth * 0.7, y: -len * 0.15 };
    const spineMid = { x: -halfWidth * 0.15, y: -len * 0.1 };
    const spineBase = { x: 0, y: len * 0.55 };

    this.facets = [
      // Left dark shadow facet
      {
        poly: [tip, spineMid, spineBase, baseL, midL],
        colorKey: 'facetDark'
      },
      // Right illuminated facet
      {
        poly: [tip, midR, baseR, spineBase, spineMid],
        colorKey: 'facetLight'
      },
      // Central high-contrast fracture facet
      {
        poly: [tip, spineMid, midL],
        colorKey: 'facetMid'
      }
    ];

    // Sharp razor-sharp contour outline
    this.contour = [tip, midR, baseR, spineBase, baseL, midL];

    // Internal longitudinal fracture veins
    this.fractureLines = [
      { from: tip, to: spineBase },
      { from: midL, to: { x: spineMid.x + 3, y: spineMid.y + 8 } },
      { from: { x: midR.x * 0.5, y: midR.y * 0.7 }, to: { x: baseR.x * 0.6, y: baseR.y * 0.6 } }
    ];
  }

  releaseFromEngulf() {
    this.isBeingEngulfed = false;
    this.engulfProgress = 0;
    this.vel.set(0, 0); // Remain strictly static
  }

  takeDamage(amount, hitDir, soundFx, particleSys, camera) {
    // Splinters cannot be killed by attacking; strikes bounce off with a hard clink
    if (this.isBeingEngulfed || !this.alive) return;

    if (soundFx) {
      soundFx.playSplinterDeflect();
    }

    if (camera) {
      camera.shake(4, 0.12);
    }

    if (particleSys) {
      particleSys.emitBurst(this.pos.x, this.pos.y, BALANCE.splinter.deflectParticleCount, {
        color: PALETTE.splinter.deflectBurst,
        size: 3.5,
        minSpeed: 2.0,
        maxSpeed: 6.0,
        life: 0.25,
        type: 'shard'
      });
    }
  }

  onDestroy(soundFx, particleSys, camera) {
    if (particleSys) {
      particleSys.emitBurst(this.pos.x, this.pos.y, BALANCE.splinter.shatterParticleCount, {
        color: PALETTE.splinter.shatterBurst,
        size: 4.5,
        minSpeed: 2.5,
        maxSpeed: 7.5,
        life: 0.45,
        type: 'shard'
      });
      particleSys.emitShockwave(this.pos.x, this.pos.y, this.radius * 2.0, PALETTE.splinter.edge, 0.25);
    }
  }

  update(dt, worldBounds) {
    if (!this.alive) return;
    this.timeAlive += dt;
    // Maintain absolute static position
    this.vel.set(0, 0);
  }

  draw(ctx) {
    if (!this.alive) return;

    ctx.save();
    ctx.translate(this.pos.x, this.pos.y);

    const pal = PALETTE.splinter;
    const p = this.isBeingEngulfed ? this.engulfProgress : 0;
    const scale = Math.max(0.01, 1.0 - p * 0.9);

    // 1. Biological Tissue Irritation / Puncture Halo underneath
    if (p < 0.8) {
      ctx.save();
      const irritAlpha = (1.0 - p) * (0.8 + Math.sin(this.timeAlive * 3.0) * 0.2);
      ctx.globalAlpha = Math.max(0, Math.min(1, irritAlpha));

      const haloGrad = ctx.createRadialGradient(0, 0, this.radius * 0.3, 0, 0, this.radius * 1.8);
      haloGrad.addColorStop(0, pal.irritationCore);
      haloGrad.addColorStop(0.5, pal.irritation);
      haloGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.ellipse(0, this.radius * 0.2, this.radius * 1.6, this.radius * 1.1, this.angle, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.rotate(this.angle);
    ctx.scale(scale, scale);

    if (this.isBeingEngulfed) {
      ctx.globalAlpha = Math.max(0, 1.0 - p * 0.7);
    }

    // 2. Foreign Shard Outer Contrast Glow
    ctx.shadowColor = pal.glow;
    ctx.shadowBlur = 10;

    // 3. Draw Hard Angular Polygonal Facets (Straight lines ONLY, breaking organic softness)
    for (const facet of this.facets) {
      ctx.fillStyle = pal[facet.colorKey] || pal.body;
      ctx.beginPath();
      const poly = facet.poly;
      ctx.moveTo(poly[0].x, poly[0].y);
      for (let i = 1; i < poly.length; i++) {
        ctx.lineTo(poly[i].x, poly[i].y);
      }
      ctx.closePath();
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    // 4. Longitudinal Fracture & Grain Lines
    ctx.strokeStyle = pal.grain;
    ctx.lineWidth = 1.4;
    for (const line of this.fractureLines) {
      ctx.beginPath();
      ctx.moveTo(line.from.x, line.from.y);
      ctx.lineTo(line.to.x, line.to.y);
      ctx.stroke();
    }

    // 5. Hard Razor-Sharp Perimeter Edge & Highlight
    ctx.strokeStyle = pal.edge;
    ctx.lineWidth = 2.0;
    ctx.lineJoin = 'miter';
    ctx.beginPath();
    ctx.moveTo(this.contour[0].x, this.contour[0].y);
    for (let i = 1; i < this.contour.length; i++) {
      ctx.lineTo(this.contour[i].x, this.contour[i].y);
    }
    ctx.closePath();
    ctx.stroke();

    // 6. Specular Glint along the sharpest apex ridge
    ctx.strokeStyle = pal.edgeHighlight;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(this.contour[0].x, this.contour[0].y);
    ctx.lineTo(this.contour[1].x, this.contour[1].y);
    ctx.stroke();

    ctx.restore();
  }
}
