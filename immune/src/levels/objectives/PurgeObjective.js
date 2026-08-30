import { Objective } from './Objective.js';

export class PurgeObjective extends Objective {
  constructor(config = {}, game) {
    super(config, game);
    this.totalEnemies = 0;
  }

  start() {
    const spawns = this.game?.levelRunner?.currentLevel?.spawns;
    if (Array.isArray(spawns)) {
      this.totalEnemies = spawns.reduce((sum, s) => sum + (s.count || 0), 0);
    } else if (this.game?.enemies) {
      this.totalEnemies = this.game.enemies.length;
    } else {
      this.totalEnemies = 0;
    }
  }

  getRemainingCount() {
    const queueCount = this.game?.levelRunner?.spawnQueue?.length || 0;
    const activeCount = this.game?.enemies ? this.game.enemies.filter((e) => e.alive).length : 0;
    return queueCount + activeCount;
  }

  update(dt) {
    const remaining = this.getRemainingCount();
    if (remaining > this.totalEnemies) {
      this.totalEnemies = remaining;
    }
  }

  isComplete() {
    return this.getRemainingCount() === 0;
  }

  isFailed() {
    return false;
  }

  getProgressText() {
    const remaining = this.getRemainingCount();
    if (this.totalEnemies > 0) {
      return `GERMS ${remaining}/${this.totalEnemies}`;
    }
    return `GERMS ${remaining}`;
  }

  getIntroText() {
    return this.config.intro || this.game?.levelRunner?.currentLevel?.intro || 'Purge all pathogens.';
  }
}
