import { Vec2 } from '../core/Vec2.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';

export class CurrentField {
  constructor(bounds = { x: -800, y: -600, w: 1600, h: 1200 }) {
    this.bounds = bounds;
    this.strength = 0; // 0 disables field
    this.seed = 1;
    this.mainAngle = 0;
    this.phase1 = 0;
    this.phase2 = 0;
    this.laneFrequency = 0.0035;
    this.undulationFreq = BALANCE.current?.laneUndulationFreq || 0.0016;
    this.undulationAmp = BALANCE.current?.laneUndulationAmp || 0.20;
    this.streaks = [];
    this.time = 0;

    this.init(1, 0, bounds);
  }

  // Seeded deterministic pseudo-random number generator
  _seededRandom(offset = 0) {
    const s = Math.sin(this.seed * 9301 + offset * 49297 + 233280) * 10000;
    return s - Math.floor(s);
  }

  initForLevel(level, bounds) {
    const levelSeed = (level?.id || 1) * 31 + (level?.seed || 0);
    const strength = level?.currentStrength !== undefined ? level.currentStrength : 0;
    this.init(levelSeed, strength, bounds || this.bounds);
  }

  init(seed = 1, strength = 0, bounds = this.bounds) {
    this.seed = seed;
    this.strength = strength;
    this.bounds = bounds;
    this.time = 0;

    if (this.strength <= 0) {
      this.streaks = [];
      return;
    }

    // Deterministic flow angle and wave phases from seed
    // Bloodstream flows along primary vessel axis with subtle seeded directional tilt
    const angleVariant = (this._seededRandom(1) - 0.5) * 0.45;
    const isReverse = this._seededRandom(2) < 0.35;
    this.mainAngle = isReverse ? (Math.PI + angleVariant) : angleVariant;

    this.phase1 = this._seededRandom(3) * Math.PI * 2;
    this.phase2 = this._seededRandom(4) * Math.PI * 2;
    this.undulationFreq = BALANCE.current?.laneUndulationFreq || 0.0016;
    this.undulationAmp = BALANCE.current?.laneUndulationAmp || 0.20;

    // Initialize visual streamline filaments
    const streakCount = BALANCE.current?.streakCount || 30;
    this.streaks = [];

    for (let i = 0; i < streakCount; i++) {
      const x = this.bounds.x + this._seededRandom(10 + i * 4) * this.bounds.w;
      const y = this.bounds.y + this._seededRandom(11 + i * 4) * this.bounds.h;
      const minLen = BALANCE.current?.streakMinLength || 80;
      const maxLen = BALANCE.current?.streakMaxLength || 170;
      const length = minLen + this._seededRandom(12 + i * 4) * (maxLen - minLen);
      const alpha = 0.12 + this._seededRandom(13 + i * 4) * 0.16;
      const width = 1.2 + this._seededRandom(14 + i * 4) * 1.6;
      const speedMult = 0.85 + this._seededRandom(15 + i * 4) * 0.35;

      this.streaks.push({
        pos: new Vec2(x, y),
        length: length,
        alpha: alpha,
        width: width,
        speedMult: speedMult,
        lifePhase: this._seededRandom(16 + i * 4) * Math.PI * 2
      });
    }
  }

  getFlow(x, y, massRatio = 0) {
    if (this.strength <= 0) {
      return new Vec2(0, 0);
    }

    // Project coordinates into longitudinal (u) and cross-stream (v) coordinates
    const cosM = Math.cos(this.mainAngle);
    const sinM = Math.sin(this.mainAngle);
    const u = x * cosM + y * sinM;
    const v = -x * sinM + y * cosM;

    // Multi-frequency smooth wave undulation along the streamline
    const wave = Math.sin(u * this.undulationFreq + this.phase1) * this.undulationAmp +
                 0.4 * Math.sin(u * this.undulationFreq * 2.3 + this.phase2) * this.undulationAmp;
    const flowAngle = this.mainAngle + wave;

    // Gaussian-like smooth lane modulation across the vessel width
    const laneMod = 1.0 + 0.32 * Math.sin(v * this.laneFrequency + this.phase1) +
                    0.18 * Math.sin(v * this.laneFrequency * 2.7 + this.phase2);

    // Base current speed scaled by balance and level strength
    const baseSpeed = this.strength * BALANCE.current.strength * laneMod;

    // Mass resistance: heavier entities (higher massRatio) hold position and resist drift
    const resistance = 1.0 - massRatio * BALANCE.current.playerMassResistance;
    const effectiveSpeed = Math.max(0, baseSpeed * resistance);

    return new Vec2(
      Math.cos(flowAngle) * effectiveSpeed,
      Math.sin(flowAngle) * effectiveSpeed
    );
  }

  update(dt) {
    if (this.strength <= 0) return;

    this.time += dt;
    const speedFactor = BALANCE.current?.streakSpeedFactor || 1.15;
    const margin = 120;

    for (let i = 0; i < this.streaks.length; i++) {
      const s = this.streaks[i];
      const flow = this.getFlow(s.pos.x, s.pos.y, 0);
      s.pos.x += flow.x * dt * speedFactor * s.speedMult;
      s.pos.y += flow.y * dt * speedFactor * s.speedMult;
      s.lifePhase += dt * 1.5;

      // Wrap streak position around world bounds
      if (s.pos.x < this.bounds.x - margin) s.pos.x = this.bounds.x + this.bounds.w + margin;
      if (s.pos.x > this.bounds.x + this.bounds.w + margin) s.pos.x = this.bounds.x - margin;
      if (s.pos.y < this.bounds.y - margin) s.pos.y = this.bounds.y + this.bounds.h + margin;
      if (s.pos.y > this.bounds.y + this.bounds.h + margin) s.pos.y = this.bounds.y - margin;
    }
  }

  draw(ctx, bounds = this.bounds, time = this.time, palette = PALETTE) {
    if (this.strength <= 0 || this.streaks.length === 0) return;

    const currentPal = palette.current || {};
    const streakPrefix = currentPal.streak || 'rgba(255, 120, 140, ';
    const glowPrefix = currentPal.streakGlow || 'rgba(255, 180, 200, ';

    ctx.save();
    ctx.lineCap = 'round';

    for (let i = 0; i < this.streaks.length; i++) {
      const s = this.streaks[i];
      const flow = this.getFlow(s.pos.x, s.pos.y, 0);
      const speed = flow.mag();
      if (speed < 0.1) continue;

      const dirX = flow.x / speed;
      const dirY = flow.y / speed;

      // Calculate tail position backward along the flow vector
      const tailX = s.pos.x - dirX * s.length;
      const tailY = s.pos.y - dirY * s.length;

      // Dynamic breathing alpha pulse
      const alphaPulse = s.alpha * (0.8 + 0.2 * Math.sin(s.lifePhase));

      // Luminous gradient along streak length from transparent tail to bright head
      const grad = ctx.createLinearGradient(tailX, tailY, s.pos.x, s.pos.y);
      grad.addColorStop(0, `${streakPrefix}0)`);
      grad.addColorStop(0.65, `${streakPrefix}${alphaPulse * 0.6})`);
      grad.addColorStop(1, `${glowPrefix}${alphaPulse})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = s.width;

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      // Midpoint gentle curve following local lane undulation
      const midX = (tailX + s.pos.x) * 0.5 - dirY * 4.0;
      const midY = (tailY + s.pos.y) * 0.5 + dirX * 4.0;
      ctx.quadraticCurveTo(midX, midY, s.pos.x, s.pos.y);
      ctx.stroke();

      // Subtle luminous head droplet
      ctx.fillStyle = `${glowPrefix}${alphaPulse * 1.2})`;
      ctx.beginPath();
      ctx.arc(s.pos.x, s.pos.y, s.width * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
