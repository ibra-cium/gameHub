export class Vec2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) { this.x = x; this.y = y; return this; }
  add(v) { this.x += v.x; this.y += v.y; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; return this; }
  mult(s) { this.x *= s; this.y *= s; return this; }
  div(s) { if (s !== 0) { this.x /= s; this.y /= s; } return this; }
  magSq() { return this.x * this.x + this.y * this.y; }
  mag() { return Math.sqrt(this.magSq()); }
  norm() { const m = this.mag(); if (m > 0) this.div(m); return this; }
  copy() { return new Vec2(this.x, this.y); }
  neg() { this.x = -this.x; this.y = -this.y; return this; }
  dist(v) { return Math.hypot(this.x - v.x, this.y - v.y); }
  angle() { return Math.atan2(this.y, this.x); }
  lerp(v, t) { this.x += (v.x - this.x) * t; this.y += (v.y - this.y) * t; return this; }
}
