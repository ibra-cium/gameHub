import { Objective } from './Objective.js';
import { BALANCE } from '../../config/balance.js';
import { PALETTE } from '../../config/palettes.js';

export class ContainObjective extends Objective {
  constructor(config = {}, game) {
    super(config, game);
    this.maxInfected = config.maxInfected ?? BALANCE.objectives.contain.defaultMaxInfected;
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

  getDeadBodyCellCount() {
    if (!this.game?.bodyCells) return 0;
    return this.game.bodyCells.filter((c) => c.state === 'dead').length;
  }

  getRemainingEnemiesCount() {
    const queueCount = this.game?.levelRunner?.spawnQueue?.length || 0;
    const activeCount = this.game?.enemies ? this.game.enemies.filter((e) => e.alive).length : 0;
    return queueCount + activeCount;
  }

  update(dt) {
    const remaining = this.getRemainingEnemiesCount();
    if (remaining > this.totalEnemies) {
      this.totalEnemies = remaining;
    }
  }

  isComplete() {
    if (this.isFailed()) return false;
    return this.getRemainingEnemiesCount() === 0;
  }

  isFailed() {
    return this.getDeadBodyCellCount() > this.maxInfected;
  }

  isWarning() {
    const deadCount = this.getDeadBodyCellCount();
    return this.maxInfected - deadCount <= 1;
  }

  getProgressColor() {
    if (this.isWarning()) {
      return PALETTE.hud.progressWarning;
    }
    return PALETTE.hud.progressNormal;
  }

  getProgressText() {
    const deadCount = this.getDeadBodyCellCount();
    return `LOST ${deadCount}/${this.maxInfected}`;
  }

  getIntroText() {
    return this.config.intro || this.game?.levelRunner?.currentLevel?.intro || 'Contain infection spread.';
  }
}
