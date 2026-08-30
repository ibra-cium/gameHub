import { Vec2 } from './Vec2.js';
import { BALANCE } from '../config/balance.js';

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mouse = new Vec2(window.innerWidth / 2, window.innerHeight / 2);
    this.mouseWorld = new Vec2(0, 0);
    this.attackPressed = false;
    this.attackHeld = false;
    this.dashPressed = false;
    this.ventPressed = false;

    this.isTouchDevice = false;
    this.lastInputWasTouch = false;
    this.touchMoveDir = new Vec2(0, 0);
    this.touchJoystickActive = false;
    this.touchJoystickOrigin = new Vec2(0, 0);
    this.joystickTouchId = null;

    this.initListeners();
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      this.lastInputWasTouch = false;
      if (e.code) this.keys[e.code] = true;
      if (e.key) {
        this.keys[e.key] = true;
        this.keys[e.key.toLowerCase()] = true;
      }
      if (e.code === 'Space' || e.key === ' ') {
        this.dashPressed = true;
        e.preventDefault();
      }
      const key = (e.key || '').toLowerCase();
      if (e.code === 'KeyQ' || key === 'q') {
        this.ventPressed = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code) this.keys[e.code] = false;
      if (e.key) {
        this.keys[e.key] = false;
        this.keys[e.key.toLowerCase()] = false;
      }
    });

    window.addEventListener('blur', () => {
      this.keys = {};
      this.attackHeld = false;
      this.attackPressed = false;
      this.dashPressed = false;
      this.ventPressed = false;
      this.resetJoystick();
    });

    window.addEventListener('mousemove', (e) => {
      this.lastInputWasTouch = false;
      this.mouse.set(e.clientX, e.clientY);
    });

    window.addEventListener('mousedown', (e) => {
      if (e.target && e.target.closest && (e.target.closest('#hud') || e.target.closest('.modal-overlay') || e.target.closest('.touch-action-cluster'))) {
        return;
      }
      this.lastInputWasTouch = false;
      this.mouse.set(e.clientX, e.clientY);
      if (e.button === 0) {
        this.attackPressed = true;
        this.attackHeld = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.attackHeld = false;
      }
    });

    this.initTouchControls();
  }

  initTouchControls() {
    const joystickZone = document.getElementById('joystick-zone');
    const joystickBase = document.getElementById('joystick-base');
    const joystickKnob = document.getElementById('joystick-knob');
    const dashBtn = document.getElementById('touch-dash-btn');
    const attackBtn = document.getElementById('touch-attack-btn');
    const ventBtn = document.getElementById('touch-vent-btn');
    const touchLayer = document.getElementById('touch-controls');

    const maxRadius = BALANCE.touch?.joystickRadius || 54;
    const deadzone = BALANCE.touch?.joystickDeadzone || 6;
    const followDist = BALANCE.touch?.joystickFollowDistance || 95;

    const checkTouch = () => {
      if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        this.isTouchDevice = true;
        if (touchLayer) {
          touchLayer.classList.remove('hidden');
        }
      }
    };
    checkTouch();
    window.addEventListener('touchstart', () => {
      this.isTouchDevice = true;
      this.lastInputWasTouch = true;
      if (touchLayer) touchLayer.classList.remove('hidden');
    }, { passive: true });

    // Set initial resting position for floating joystick base (bottom-left)
    const setRestingJoystickPos = () => {
      if (!joystickBase) return;
      const restX = Math.max(70, window.innerWidth * 0.15);
      const restY = window.innerHeight - Math.max(90, window.innerHeight * 0.22);
      joystickBase.style.left = `${restX}px`;
      joystickBase.style.top = `${restY}px`;
    };
    setRestingJoystickPos();
    window.addEventListener('resize', () => {
      if (!this.touchJoystickActive) {
        setRestingJoystickPos();
      }
    });

    const updateJoystickPos = (clientX, clientY) => {
      let dx = clientX - this.touchJoystickOrigin.x;
      let dy = clientY - this.touchJoystickOrigin.y;
      const dist = Math.hypot(dx, dy);

      // Follow thumb if dragged beyond follow distance
      if (dist > followDist) {
        const excess = dist - followDist;
        const angle = Math.atan2(dy, dx);
        this.touchJoystickOrigin.x += Math.cos(angle) * excess;
        this.touchJoystickOrigin.y += Math.sin(angle) * excess;
        if (joystickBase) {
          joystickBase.style.left = `${this.touchJoystickOrigin.x}px`;
          joystickBase.style.top = `${this.touchJoystickOrigin.y}px`;
        }
        dx = clientX - this.touchJoystickOrigin.x;
        dy = clientY - this.touchJoystickOrigin.y;
      }

      if (dist < deadzone) {
        if (joystickKnob) joystickKnob.style.transform = 'translate(0px, 0px)';
        this.touchMoveDir.set(0, 0);
        return;
      }

      const angle = Math.atan2(dy, dx);
      const clampedDist = Math.min(dist, maxRadius);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      if (joystickKnob) {
        joystickKnob.style.transform = `translate(${knobX}px, ${knobY}px)`;
      }

      const normDist = (clampedDist - deadzone) / (maxRadius - deadzone);
      this.touchMoveDir.set(Math.cos(angle) * normDist, Math.sin(angle) * normDist);
    };

    const handleJoystickStart = (e) => {
      this.lastInputWasTouch = true;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (this.joystickTouchId !== null) continue;

        this.joystickTouchId = touch.identifier;
        this.touchJoystickActive = true;
        this.touchJoystickOrigin.set(touch.clientX, touch.clientY);

        if (joystickBase) {
          joystickBase.style.left = `${touch.clientX}px`;
          joystickBase.style.top = `${touch.clientY}px`;
          joystickBase.classList.add('joystick-active');
        }

        updateJoystickPos(touch.clientX, touch.clientY);
        break;
      }
    };

    const handleJoystickMove = (e) => {
      if (!this.touchJoystickActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          updateJoystickPos(touch.clientX, touch.clientY);
          break;
        }
      }
    };

    const handleJoystickEnd = (e) => {
      if (!this.touchJoystickActive) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === this.joystickTouchId) {
          this.resetJoystick();
          setRestingJoystickPos();
          break;
        }
      }
    };

    if (joystickZone) {
      joystickZone.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleJoystickStart(e);
      }, { passive: false });
    }

    window.addEventListener('touchmove', handleJoystickMove, { passive: true });
    window.addEventListener('touchend', handleJoystickEnd, { passive: true });
    window.addEventListener('touchcancel', handleJoystickEnd, { passive: true });

    // Ergonomic Action Cluster Listeners
    if (attackBtn) {
      attackBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.lastInputWasTouch = true;
        this.attackPressed = true;
        this.attackHeld = true;
        attackBtn.classList.add('touch-active');
      }, { passive: false });

      attackBtn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.attackHeld = false;
        attackBtn.classList.remove('touch-active');
      }, { passive: false });

      attackBtn.addEventListener('touchcancel', () => {
        this.attackHeld = false;
        attackBtn.classList.remove('touch-active');
      });
    }

    if (dashBtn) {
      dashBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.lastInputWasTouch = true;
        this.dashPressed = true;
        dashBtn.classList.add('touch-active');
      }, { passive: false });

      dashBtn.addEventListener('touchend', () => {
        dashBtn.classList.remove('touch-active');
      });

      dashBtn.addEventListener('touchcancel', () => {
        dashBtn.classList.remove('touch-active');
      });
    }

    if (ventBtn) {
      ventBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.lastInputWasTouch = true;
        this.ventPressed = true;
        ventBtn.classList.add('touch-active');
      }, { passive: false });

      ventBtn.addEventListener('touchend', () => {
        ventBtn.classList.remove('touch-active');
      });

      ventBtn.addEventListener('touchcancel', () => {
        ventBtn.classList.remove('touch-active');
      });
    }
  }

  resetJoystick() {
    this.touchJoystickActive = false;
    this.joystickTouchId = null;
    this.touchMoveDir.set(0, 0);
    const joystickKnob = document.getElementById('joystick-knob');
    const joystickBase = document.getElementById('joystick-base');
    if (joystickKnob) {
      joystickKnob.style.transform = 'translate(0px, 0px)';
    }
    if (joystickBase) {
      joystickBase.classList.remove('joystick-active');
    }
  }

  getMovementVector() {
    const v = new Vec2(0, 0);
    if (this.keys['KeyW'] || this.keys['w'] || this.keys['ArrowUp'] || this.keys['Up']) v.y -= 1;
    if (this.keys['KeyS'] || this.keys['s'] || this.keys['ArrowDown'] || this.keys['Down']) v.y += 1;
    if (this.keys['KeyA'] || this.keys['a'] || this.keys['ArrowLeft'] || this.keys['Left']) v.x -= 1;
    if (this.keys['KeyD'] || this.keys['d'] || this.keys['ArrowRight'] || this.keys['Right']) v.x += 1;

    if (this.touchJoystickActive && this.touchMoveDir.magSq() > 0.01) {
      v.add(this.touchMoveDir);
    }

    if (v.magSq() > 1) {
      v.norm();
    }
    return v;
  }

  updateWorldMouse(camera) {
    this.mouseWorld.set(
      this.mouse.x + camera.pos.x + camera.shakeOffset.x,
      this.mouse.y + camera.pos.y + camera.shakeOffset.y
    );
  }

  /**
   * Calculates smart target world position for player strikes.
   * On desktop, uses exact crosshair mouse position.
   * On touch/mobile, auto-locks onto the closest hostile target within range.
   */
  getAimTarget(player, targets = []) {
    if (!this.lastInputWasTouch || !this.isTouchDevice) {
      return this.mouseWorld;
    }

    if (!targets || targets.length === 0) {
      // Default: strike along movement vector or current body orientation
      const moveVec = this.getMovementVector();
      if (moveVec.magSq() > 0.05) {
        return player.pos.copy().add(moveVec.mult(120));
      }
      return player.pos.copy().add(new Vec2(Math.cos(player.aimAngle) * 120, Math.sin(player.aimAngle) * 120));
    }

    const autoAimRadius = BALANCE.touch?.autoAimRadius || 460;
    const moveVec = this.getMovementVector();
    let bestTarget = null;
    let bestScore = Infinity;

    for (const target of targets) {
      if (!target.alive || target.isBeingEngulfed) continue;
      const toTarget = target.pos.copy().sub(player.pos);
      const dist = toTarget.mag();
      if (dist > autoAimRadius) continue;

      let score = dist;
      // Prioritize targets in front of movement direction
      if (moveVec.magSq() > 0.05) {
        const dot = (toTarget.x * moveVec.x + toTarget.y * moveVec.y) / dist;
        score -= dot * (BALANCE.touch?.autoAimAngleWeight || 0.45) * autoAimRadius;
      }
      // Prioritize weakened enemies ready for engulfing
      if (target.isWeakened) {
        score -= 80;
      }

      if (score < bestScore) {
        bestScore = score;
        bestTarget = target;
      }
    }

    if (bestTarget) {
      return bestTarget.pos.copy();
    }

    // Fallback: strike forward along movement direction
    if (moveVec.magSq() > 0.05) {
      return player.pos.copy().add(moveVec.mult(120));
    }
    return player.pos.copy().add(new Vec2(Math.cos(player.aimAngle) * 120, Math.sin(player.aimAngle) * 120));
  }

  consumeAttack() {
    const p = this.attackPressed;
    this.attackPressed = false;
    return p;
  }

  consumeDash() {
    const d = this.dashPressed;
    this.dashPressed = false;
    return d;
  }

  consumeVent() {
    const v = this.ventPressed;
    this.ventPressed = false;
    return v;
  }
}
