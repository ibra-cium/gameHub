import { Objective } from './Objective.js';
import { BALANCE } from '../../config/balance.js';
import { PALETTE } from '../../config/palettes.js';

export class SurviveObjective extends Objective {
  constructor(config = {}, game) {
    super(config, game);
    this.duration = config.duration ?? BALANCE.objectives.survive.defaultDuration;
    this.timeRemaining = this.duration;

    if (typeof config.spawnInterval === 'number') {
      this.spawnInterval = config.spawnInterval;
    } else if (typeof config.spawnRate === 'number') {
      this.spawnInterval = config.spawnRate <= 0.5 ? 1 / config.spawnRate : config.spawnRate;
    } else {
      this.spawnInterval = BALANCE.objectives.survive.defaultSpawnInterval;
    }

    this.spawnTimer = 0.5; // Short initial delay before continuous spawns start
    this.tensionTimer = 0;
    this.enemyTypes = config.enemyTypes || null;
  }

  start() {
    this.timeRemaining = this.duration;
    this.spawnTimer = 0.5;
    this.tensionTimer = 0;
  }

  getEnemyTypes() {
    if (Array.isArray(this.enemyTypes) && this.enemyTypes.length > 0) {
      return this.enemyTypes;
    }
    const currentSpawns = this.game?.levelRunner?.currentLevel?.spawns;
    if (Array.isArray(currentSpawns) && currentSpawns.length > 0) {
      return currentSpawns.map((s) => s.type);
    }
    return ['bacteria', 'virus'];
  }

  spawnContinuousEnemy() {
    if (!this.game?.levelRunner) return;
    const types = this.getEnemyTypes();
    const type = types[Math.floor(Math.random() * types.length)] || 'bacteria';
    this.game.levelRunner.spawnEnemy(type);
  }

  update(dt) {
    if (this.timeRemaining > 0) {
      this.timeRemaining -= dt;
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
      }

      // Continuous enemy spawning for whole duration
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnContinuousEnemy();
        this.spawnTimer = this.spawnInterval;
      }

      // Rising tension audio cues in the last 10 seconds
      const threshold = BALANCE.objectives.survive.tensionThreshold;
      if (this.timeRemaining <= threshold && this.timeRemaining > 0) {
        this.tensionTimer -= dt;
        if (this.tensionTimer <= 0) {
          if (this.game?.soundFx) {
            this.game.soundFx.playTensionCue(this.timeRemaining);
          }
          const urgency = Math.max(0, Math.min(1, (threshold - this.timeRemaining) / threshold));
          const minInt = BALANCE.objectives.survive.tensionPulseIntervalMin;
          const maxInt = BALANCE.objectives.survive.tensionPulseIntervalMax;
          this.tensionTimer = maxInt - urgency * (maxInt - minInt);
        }
      }
    }
  }

  isComplete() {
    return this.timeRemaining <= 0;
  }

  isFailed() {
    return false;
  }

  getProgressColor() {
    if (this.timeRemaining <= BALANCE.objectives.survive.tensionThreshold) {
      return PALETTE.hud.progressWarning;
    }
    return PALETTE.hud.progressNormal;
  }

  getProgressText() {
    const seconds = Math.max(0, Math.ceil(this.timeRemaining));
    return `SURVIVE ${seconds}s`;
  }

  getIntroText() {
    return this.config.intro || this.game?.levelRunner?.currentLevel?.intro || 'Survive until reinforcements arrive.';
  }
}
