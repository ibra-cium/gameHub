import { Vec2 } from '../core/Vec2.js';
import { Bacteria } from '../entities/Bacteria.js';
import { Virus } from '../entities/Virus.js';
import { Parasite } from '../entities/Parasite.js';
import { BodyCell } from '../entities/BodyCell.js';
import { Splinter } from '../entities/Splinter.js';
import { BALANCE } from '../config/balance.js';
import { LEVELS } from '../levels/levels.js';
import { OBJECTIVES } from '../levels/objectives/index.js';

export class LevelRunner {
  constructor(game) {
    this.game = game;
    this.currentLevel = null;
    this.active = false;
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnInterval = BALANCE.levelRunner.trickleInterval;
    this.levelClearDelay = BALANCE.levelRunner.levelClearDelay;
    this.levelClearTimer = 0;
    this.vitalityDrain = BALANCE.host.baseDrainPerActiveEnemy;
    this.timeRemaining = null;
    this.objective = null;
    this.onComplete = null;
    this.onFail = null;
  }

  load(levelId) {
    const level = LEVELS.find((l) => l.id === levelId);
    if (!level) {
      console.error(`[LevelRunner] Level with id ${levelId} not found.`);
      return false;
    }

    if (this.objective && typeof this.objective.cleanup === 'function') {
      this.objective.cleanup();
    }

    this.currentLevel = level;
    this.active = true;
    this.levelClearTimer = 0;
    this.vitalityDrain = level.vitalityDrain ?? BALANCE.host.baseDrainPerActiveEnemy;
    this.timeRemaining = level.timeLimit ?? null;

    // Reset calm mode, camera shake, and targets before objective start
    if (this.game?.camera) {
      this.game.camera.shakeEnabled = true;
    }
    if (this.game?.environment) {
      this.game.environment.setCalmMode(false);
    }
    if (this.game) {
      this.game.debris = [];
      this.game.splinters = [];
      this.game.escortTarget = null;
      this.game.infectionSource = null;
    }

    const objType = level.objective?.type || 'purge';
    const ObjectiveClass = OBJECTIVES[objType] || OBJECTIVES.purge;
    this.objective = new ObjectiveClass(level.objective, this.game);
    this.objective.start();

    // Spawn foreground body cells owned by game
    this.game.bodyCells = [];
    const cellCount = level.bodyCellCount ?? 0;
    for (let i = 0; i < cellCount; i++) {
      this.spawnBodyCell();
    }

    const enemiesToSpawn = [];
    if (Array.isArray(level.spawns)) {
      for (const spawn of level.spawns) {
        const count = spawn.count || 0;
        for (let i = 0; i < count; i++) {
          enemiesToSpawn.push(spawn.type);
        }
      }
    }

    if (level.spawnMode === 'trickle') {
      this.spawnQueue = [...enemiesToSpawn];
      this.spawnTimer = 0;
    } else {
      this.spawnQueue = [];
      for (const type of enemiesToSpawn) {
        this.spawnEnemy(type);
      }
    }

    this.game.updateHUD();
    return true;
  }

  spawnBodyCell() {
    const bounds = this.game.worldBounds;
    const padding = BALANCE.player.radius + BALANCE.player.bodyMargin + 40;
    const x = bounds.x + padding + Math.random() * (bounds.w - padding * 2);
    const y = bounds.y + padding + Math.random() * (bounds.h - padding * 2);
    const cell = new BodyCell(x, y);
    this.game.bodyCells.push(cell);
    return cell;
  }

  spawnEnemy(type, customPos = null) {
    const pos = customPos || (type === 'splinter' ? this.getHazardSpawnPosition() : this.getRandomSpawnPosition());
    let enemy = null;
    if (type === 'bacteria') enemy = new Bacteria(pos.x, pos.y);
    else if (type === 'virus') enemy = new Virus(pos.x, pos.y);
    else if (type === 'parasite') enemy = new Parasite(pos.x, pos.y);
    else if (type === 'splinter') {
      const splinter = new Splinter(pos.x, pos.y);
      this.game.splinters.push(splinter);
      return splinter;
    }

    if (enemy) {
      this.game.enemies.push(enemy);
    }
    return enemy;
  }

  getHazardSpawnPosition() {
    const bounds = this.game.worldBounds;
    const padding = BALANCE.player.radius + BALANCE.player.bodyMargin + 70;
    const x = bounds.x + padding + Math.random() * (bounds.w - padding * 2);
    const y = bounds.y + padding + Math.random() * (bounds.h - padding * 2);
    return new Vec2(x, y);
  }


  getRandomSpawnPosition() {
    const bounds = this.game.worldBounds;
    const padding = BALANCE.levelRunner.spawnPadding;
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;

    if (side === 0) {
      x = bounds.x + padding + Math.random() * (bounds.w - padding * 2);
      y = bounds.y + padding;
    } else if (side === 1) {
      x = bounds.x + bounds.w - padding;
      y = bounds.y + padding + Math.random() * (bounds.h - padding * 2);
    } else if (side === 2) {
      x = bounds.x + padding + Math.random() * (bounds.w - padding * 2);
      y = bounds.y + bounds.h - padding;
    } else {
      x = bounds.x + padding;
      y = bounds.y + padding + Math.random() * (bounds.h - padding * 2);
    }
    return new Vec2(x, y);
  }

  getProgressText() {
    return this.objective ? this.objective.getProgressText() : '';
  }

  update(dt) {
    if (!this.active || !this.currentLevel) return;

    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        const nextType = this.spawnQueue.shift();
        this.spawnEnemy(nextType);
        this.spawnTimer = this.spawnInterval;
      }
    }

    if (this.timeRemaining !== null) {
      this.timeRemaining -= dt;
      if (this.timeRemaining <= 0) {
        this.triggerFail();
        return;
      }
    }

    if (this.objective) {
      this.objective.update(dt);

      if (this.objective.isFailed()) {
        this.triggerFail();
        return;
      }

      if (this.objective.isComplete()) {
        this.triggerComplete();
        return;
      }
    }
  }

  triggerComplete() {
    this.active = false;
    if (this.onComplete) {
      this.onComplete(this.currentLevel);
    }
  }

  triggerFail() {
    this.active = false;
    if (this.onFail) {
      this.onFail(this.currentLevel);
    }
  }
}

