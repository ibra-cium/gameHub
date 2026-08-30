import { Vec2 } from './Vec2.js';

export class Camera {
  constructor() {
    this.pos = new Vec2(0, 0);
    this.target = new Vec2(0, 0);
    this.shakeMag = 0;
    this.shakeDuration = 0;
    this.shakeOffset = new Vec2(0, 0);
    this.smoothness = 0.12;
    this.shakeEnabled = true;
  }

  shake(magnitude = 8, duration = 0.25) {
    if (!this.shakeEnabled) return;
    this.shakeMag = Math.max(this.shakeMag, magnitude);
    this.shakeDuration = Math.max(this.shakeDuration, duration);
  }

  update(dt, targetPos, viewportW, viewportH, worldBounds) {
    this.target.set(targetPos.x - viewportW / 2, targetPos.y - viewportH / 2);
    this.pos.lerp(this.target, this.smoothness);

    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt;
      const angle = Math.random() * Math.PI * 2;
      const dist = this.shakeMag * (this.shakeDuration / 0.25);
      this.shakeOffset.set(Math.cos(angle) * dist, Math.sin(angle) * dist);
      if (this.shakeDuration <= 0) {
        this.shakeMag = 0;
        this.shakeOffset.set(0, 0);
      }
    } else {
      this.shakeOffset.set(0, 0);
    }

    const minX = worldBounds.x;
    const minY = worldBounds.y;
    const maxX = worldBounds.x + worldBounds.w - viewportW;
    const maxY = worldBounds.y + worldBounds.h - viewportH;

    this.pos.x = Math.max(minX, Math.min(this.pos.x, maxX));
    this.pos.y = Math.max(minY, Math.min(this.pos.y, maxY));
  }

  applyTransform(ctx) {
    ctx.translate(-Math.round(this.pos.x + this.shakeOffset.x), -Math.round(this.pos.y + this.shakeOffset.y));
  }
}
