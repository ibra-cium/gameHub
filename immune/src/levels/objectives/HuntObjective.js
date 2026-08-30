import { Objective } from './Objective.js';
import { InfectionSource } from '../../entities/InfectionSource.js';
import { Vec2 } from '../../core/Vec2.js';
import { WORLD_BOUNDS } from '../../config/constants.js';
import { BALANCE } from '../../config/balance.js';
import { PALETTE } from '../../config/palettes.js';

export class HuntObjective extends Objective {
  constructor(config = {}, game) {
    super(config, game);
    this.worldScale = config.worldScale ?? BALANCE.objectives.hunt.defaultWorldScale;
    this.sourceHp = config.sourceHp ?? BALANCE.objectives.hunt.defaultSourceHp;
    this.spawnInterval = config.spawnInterval ?? BALANCE.infectionSource.defaultSpawnInterval;
    this.enemyTypes = config.enemyTypes || null;

    this.source = null;
    this.pulseTimer = 0;
    this.pulseIntensity = 0;
    this.originalBounds = null;
  }

  start() {
    if (this.game) {
      this.originalBounds = { ...WORLD_BOUNDS };
      const scaledW = WORLD_BOUNDS.w * this.worldScale;
      const scaledH = WORLD_BOUNDS.h * this.worldScale;
      const scaledBounds = {
        x: -scaledW * 0.5,
        y: -scaledH * 0.5,
        w: scaledW,
        h: scaledH
      };

      this.game.setWorldBounds(scaledBounds);

      // Place hidden infection source in a far quadrant away from player start (0,0)
      const minDistance = Math.min(scaledW, scaledH) * 0.5 * BALANCE.objectives.hunt.minSpawnDistanceRatio;
      const angle = Math.random() * Math.PI * 2;
      const dist = minDistance + Math.random() * (minDistance * 0.4);
      const sourceX = Math.cos(angle) * dist;
      const sourceY = Math.sin(angle) * dist;

      this.source = new InfectionSource(sourceX, sourceY, {
        hp: this.sourceHp,
        spawnInterval: this.spawnInterval,
        enemyTypes: this.enemyTypes
      });

      this.game.infectionSource = this.source;
    }

    this.pulseTimer = 0.5;
    this.pulseIntensity = 0;
  }

  cleanup() {
    if (this.game && this.originalBounds) {
      this.game.setWorldBounds(this.originalBounds);
      this.game.infectionSource = null;
    }
  }

  update(dt) {
    if (!this.source || !this.source.alive) {
      if (this.game?.infectionSource === this.source) {
        this.game.infectionSource = null;
      }
      return;
    }

    this.source.update(dt, this.game?.worldBounds);

    if (this.source.pendingEnemySpawn && this.game?.levelRunner) {
      this.game.levelRunner.spawnEnemy(this.source.pendingEnemySpawn, this.source.pos.copy());
      this.source.pendingEnemySpawn = null;
    }

    // Proximity cue calculations
    const player = this.game?.player;
    if (player && player.alive) {
      const dist = player.pos.dist(this.source.pos);
      const bounds = this.game.worldBounds;
      const maxDist = Math.hypot(bounds.w * 0.5, bounds.h * 0.5);
      const urgency = Math.max(0, Math.min(1, 1 - dist / maxDist));

      const minInterval = BALANCE.objectives.hunt.minPulseInterval;
      const maxInterval = BALANCE.objectives.hunt.maxPulseInterval;
      const currentInterval = maxInterval - urgency * (maxInterval - minInterval);

      this.pulseTimer -= dt;
      if (this.pulseTimer <= 0) {
        this.pulseTimer = currentInterval;
        this.pulseIntensity = 1.0;
        if (this.game?.soundFx) {
          this.game.soundFx.playProximityPulse(urgency);
        }
      }
    }

    if (this.pulseIntensity > 0) {
      this.pulseIntensity -= dt / BALANCE.objectives.hunt.pulseFadeDuration;
      if (this.pulseIntensity < 0) this.pulseIntensity = 0;
    }
  }

  isComplete() {
    return this.source && !this.source.alive;
  }

  isFailed() {
    return false;
  }

  getProgressColor() {
    if (this.source && this.source.hp < this.source.maxHp * 0.5) {
      return PALETTE.hud.progressWarning;
    }
    return PALETTE.hud.progressNormal;
  }

  getProgressText() {
    if (!this.source || !this.source.alive) return 'NIDUS PURGED';
    if (this.source.hp < this.source.maxHp) {
      return `SOURCE ${Math.max(0, Math.ceil(this.source.hp))}/${this.source.maxHp}`;
    }
    return 'HUNT NIDUS';
  }

  getIntroText() {
    return this.config.intro || this.game?.levelRunner?.currentLevel?.intro || 'Locate and destroy the deep infection source.';
  }

  draw(ctx, camera, screenWidth, screenHeight) {
    // Draw the infection source entity in world space
    if (this.source && this.source.alive) {
      this.source.draw(ctx);
    }

    // Directional proximity pulse on the screen perimeter
    if (this.source && this.source.alive && this.pulseIntensity > 0) {
      const player = this.game?.player;
      if (!player) return;

      const toSource = this.source.pos.copy().sub(player.pos);
      const angle = toSource.angle();

      ctx.save();
      ctx.resetTransform();

      const halfW = screenWidth * 0.5;
      const halfH = screenHeight * 0.5;
      const margin = 20;
      const availW = halfW - margin;
      const availH = halfH - margin;

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const scaleX = availW / Math.max(0.001, Math.abs(cosA));
      const scaleY = availH / Math.max(0.001, Math.abs(sinA));
      const scale = Math.min(scaleX, scaleY);

      const edgeX = halfW + cosA * scale;
      const edgeY = halfH + sinA * scale;

      const alpha = this.pulseIntensity;
      const arcRadius = BALANCE.objectives.hunt.pulseArcRadius * (1 + (1 - alpha) * 0.4);

      ctx.translate(edgeX, edgeY);
      ctx.rotate(angle);

      // Radiant glowing bio-sonar arc
      const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, arcRadius);
      grad.addColorStop(0, `${PALETTE.infectionSource.pulseCueGlow}${alpha * 0.85})`);
      grad.addColorStop(0.5, `${PALETTE.infectionSource.pulseCue}${alpha * 0.45})`);
      grad.addColorStop(1, `${PALETTE.infectionSource.pulseCue}0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, arcRadius, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Sharp perimeter crest
      ctx.strokeStyle = `${PALETTE.infectionSource.pulseCueGlow}${alpha})`;
      ctx.lineWidth = 3.5 * alpha;
      ctx.beginPath();
      ctx.arc(0, 0, arcRadius * 0.75, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();

      ctx.restore();
    }
  }
}
