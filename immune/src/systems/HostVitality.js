import { BALANCE } from '../config/balance.js';

export class HostVitality {
  constructor(max = BALANCE.host.maxVitality) {
    this.max = max;
    this.current = max;
    this.onChange = null;
  }

  drain(amountPerSecond, dt) {
    if (amountPerSecond <= 0 || dt <= 0 || this.current <= 0) return;
    const prev = this.current;
    this.current = Math.max(0, this.current - amountPerSecond * dt);
    if (this.current !== prev && typeof this.onChange === 'function') {
      this.onChange(this.current, this.max, this.getRatio());
    }
  }

  heal(amount) {
    if (amount <= 0 || this.current >= this.max) return;
    const prev = this.current;
    this.current = Math.min(this.max, this.current + amount);
    if (this.current !== prev && typeof this.onChange === 'function') {
      this.onChange(this.current, this.max, this.getRatio());
    }
  }

  damage(amount) {
    if (amount <= 0 || this.current <= 0) return;
    const prev = this.current;
    this.current = Math.max(0, this.current - amount);
    if (this.current !== prev && typeof this.onChange === 'function') {
      this.onChange(this.current, this.max, this.getRatio());
    }
  }

  getRatio() {
    return this.max > 0 ? this.current / this.max : 0;
  }

  isDead() {
    return this.current <= 0;
  }
}
