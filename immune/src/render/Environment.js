import { BALANCE } from '../config/balance.js';
import { PALETTE } from '../config/palettes.js';
import { SkinTissueVisuals } from './SkinTissueVisuals.js';
import { BloodstreamVisuals } from './BloodstreamVisuals.js';

export class Environment {
  constructor(bounds, actKey = 'skin') {
    this.bounds = bounds;
    this.time = 0;
    this.isCalm = false;
    this.currentAct = actKey;

    this.visuals = {
      skin: new SkinTissueVisuals(bounds),
      tissue: new SkinTissueVisuals(bounds),
      bloodstream: new BloodstreamVisuals(bounds),
      vessel: new BloodstreamVisuals(bounds),
      lungs: new SkinTissueVisuals(bounds),
      gut: new SkinTissueVisuals(bounds),
      lymph: new SkinTissueVisuals(bounds),
      sepsis: new SkinTissueVisuals(bounds),
      brain: new SkinTissueVisuals(bounds)
    };

    this.currentVisual = this.visuals[actKey] || this.visuals.skin;
  }

  setAct(actKey) {
    this.currentAct = actKey;
    this.currentVisual = this.visuals[actKey] || this.visuals.skin;
    if (this.currentVisual.bounds !== this.bounds) {
      this.currentVisual.bounds = this.bounds;
    }
  }

  setCalmMode(enabled) {
    this.isCalm = !!enabled;
  }

  update(dt, currentField = null) {
    const waveFactor = this.isCalm ? BALANCE.objectives.patrol.calmWaveSpeedFactor : 1.0;
    this.time += dt * waveFactor;
    this.currentVisual.update(dt, this.time, this.bounds, this.isCalm, currentField);
  }

  draw(ctx, viewport, currentField = null) {
    this.currentVisual.draw(ctx, this.bounds, this.time, PALETTE, this.isCalm, currentField);
  }
}
