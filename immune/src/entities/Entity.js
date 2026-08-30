import { Vec2 } from '../core/Vec2.js';

let nextEntityId = 1;

export class Entity {
  constructor(x = 0, y = 0, radius = 0) {
    this.id = nextEntityId++;
    this.pos = new Vec2(x, y);
    this.vel = new Vec2(0, 0);
    this.radius = radius;
    this.alive = true;
    this.timeAlive = 0;

    this.squashX = 1.0;
    this.squashY = 1.0;

    this.numPoints = 0;
    this.points = [];
    this.pointOffsets = [];
    this.pointSprings = [];
  }

  get dead() {
    return !this.alive;
  }

  set dead(val) {
    this.alive = !val;
  }

  initPoints(numPoints = this.numPoints) {
    this.numPoints = numPoints;
    this.points = [];
    this.pointOffsets = [];
    this.pointSprings = [];
    for (let i = 0; i < this.numPoints; i++) {
      this.points.push(new Vec2());
      this.pointOffsets.push(0);
      this.pointSprings.push(0);
    }
  }

  destroy() {
    this.alive = false;
  }

  sampleCurrent(currentField, massRatio = 0) {
    if (!currentField || currentField.strength <= 0) return new Vec2(0, 0);
    return currentField.getFlow(this.pos.x, this.pos.y, massRatio);
  }

  update(dt) {
    this.timeAlive += dt;
    this.pos.x += this.vel.x * dt;
    this.pos.y += this.vel.y * dt;
  }

  draw(ctx) {}
}
