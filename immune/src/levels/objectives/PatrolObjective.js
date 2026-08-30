import { Objective } from './Objective.js';
import { Debris } from '../../entities/Debris.js';
import { BALANCE } from '../../config/balance.js';
import { PALETTE } from '../../config/palettes.js';

export class PatrolObjective extends Objective {
  constructor(config = {}, game) {
    super(config, game);
    this.debrisCount = config.debrisCount ?? BALANCE.objectives.patrol.defaultDebrisCount;
    this.collected = 0;
  }

  start() {
    this.collected = 0;

    // Apply calm atmosphere: no camera shake, calm environment palette & speeds
    if (this.game?.camera) {
      this.game.camera.shakeEnabled = false;
    }
    if (this.game?.environment) {
      this.game.environment.setCalmMode(true);
    }

    // Ensure enemies array is empty for Patrol
    if (this.game) {
      this.game.enemies = [];
      this.game.debris = [];
    }

    // Spawn scattered debris
    this.spawnDebrisField();
  }

  spawnDebrisField() {
    if (!this.game) return;
    this.game.debris = [];

    const bounds = this.game.worldBounds;
    const padding = BALANCE.player.radius + BALANCE.player.bodyMargin + 50;

    const variants = ['debris', 'deadCell', 'dustClump'];
    for (let i = 0; i < this.debrisCount; i++) {
      const x = bounds.x + padding + Math.random() * (bounds.w - padding * 2);
      const y = bounds.y + padding + Math.random() * (bounds.h - padding * 2);
      const variant = variants[i % variants.length];
      const item = new Debris(x, y, variant);
      this.game.debris.push(item);
    }
  }

  update(dt) {
    if (!this.game) return;

    // Player collects debris on contact
    const player = this.game.player;
    if (player && player.alive && Array.isArray(this.game.debris)) {
      for (const item of this.game.debris) {
        if (!item.collected) {
          const contactDist = player.baseRadius + item.radius;
          if (player.pos.dist(item.pos) <= contactDist) {
            if (item.collect(this.game.soundFx, this.game.particleSys)) {
              this.collected++;
            }
          }
        }
      }
    }
  }

  isComplete() {
    return this.collected >= this.debrisCount;
  }

  isFailed() {
    return false;
  }

  getProgressColor() {
    return PALETTE.hud.progressCalm;
  }

  getProgressText() {
    return `CLEARED ${this.collected}/${this.debrisCount}`;
  }

  getIntroText() {
    return this.config.intro || this.game?.levelRunner?.currentLevel?.intro || 'Clear all debris and cellular waste.';
  }
}
