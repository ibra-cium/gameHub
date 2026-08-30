export class Objective {
  constructor(config = {}, game) {
    this.config = config;
    this.game = game;
  }

  start() {}

  update(dt) {}

  isComplete() {
    return false;
  }

  isFailed() {
    return false;
  }

  getProgressText() {
    return '';
  }

  getIntroText() {
    return this.config.intro || this.game?.levelRunner?.currentLevel?.intro || '';
  }
}
