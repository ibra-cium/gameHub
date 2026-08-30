import { PALETTE } from '../config/palettes.js';
import { BALANCE } from '../config/balance.js';
import { LEVELS } from '../levels/levels.js';

export class Hud {
  constructor() {
    this.hudElement = document.getElementById('hud');
    this.hpFill = document.getElementById('hp-bar-fill');
    this.hpGhost = document.getElementById('hp-bar-ghost');
    this.hpText = document.getElementById('hp-text');
    this.dashFill = document.getElementById('dash-cd-fill');
    this.dashCdText = document.getElementById('dash-cd-text');
    this.waveBadge = document.getElementById('wave-badge');
    this.germCount = document.getElementById('germ-count');

    this.hostContainer = document.getElementById('host-vitality-container');
    this.hostBarFill = document.getElementById('host-bar-fill');
    this.hostPctText = document.getElementById('host-pct-text');

    this.massTracker = document.querySelector('.mass-tracker');
    this.massLabel = document.getElementById('mass-label');
    this.massText = document.getElementById('mass-text');
    this.massSegmentsContainer = document.getElementById('mass-segments-container');
    this.massCooldownOverlay = document.getElementById('mass-cooldown-overlay');
    this.massSegments = [];

    // Touch HUD elements
    this.touchDashRing = document.getElementById('touch-dash-ring');
    this.touchVentRing = document.getElementById('touch-vent-ring');
    this.touchVentBtn = document.getElementById('touch-vent-btn');
    this.touchVentSub = document.getElementById('touch-vent-sub');

    this.ringCircumference = 175.9; // 2 * PI * 28

    this.initMassSegments();

    this.hostRevealed = false;
    this.hostVitality = null;
  }

  initMassSegments() {
    if (!this.massSegmentsContainer) return;
    this.massSegmentsContainer.innerHTML = '';
    this.massSegments = [];
    const maxMass = BALANCE.player.mass.max;
    for (let i = 0; i < maxMass; i++) {
      const seg = document.createElement('div');
      seg.className = 'mass-segment';
      this.massSegmentsContainer.appendChild(seg);
      this.massSegments.push(seg);
    }
  }

  flashMassDenied() {
    if (this.massTracker) {
      this.massTracker.classList.remove('mass-denied');
      void this.massTracker.offsetWidth; // trigger reflow
      this.massTracker.classList.add('mass-denied');
    }
  }

  bindHostVitality(hostVitality) {
    this.hostVitality = hostVitality;
    if (this.hostVitality) {
      this.hostVitality.onChange = (current, max, ratio) => {
        this.onHostVitalityChange(current, max, ratio);
      };
    }
  }

  onHostVitalityChange(current, max, ratio) {
    if (!this.hostRevealed && current < max) {
      this.revealHostBar();
    }

    const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    if (this.hostPctText) {
      this.hostPctText.textContent = `${pct}%`;
    }

    if (this.hostBarFill) {
      this.hostBarFill.style.width = `${Math.max(0, ratio * 100)}%`;

      if (ratio <= BALANCE.hud.hostCriticalThreshold) {
        this.hostBarFill.style.background = PALETTE.hud.hostCritical;
        this.hostBarFill.style.boxShadow = `0 0 12px ${PALETTE.hud.hostGlowCritical}`;
      } else if (ratio <= BALANCE.hud.hostWarningThreshold) {
        this.hostBarFill.style.background = PALETTE.hud.hostWarning;
        this.hostBarFill.style.boxShadow = `0 0 10px ${PALETTE.hud.hostGlowWarning}`;
      } else {
        this.hostBarFill.style.background = PALETTE.hud.hostCalm;
        this.hostBarFill.style.boxShadow = `0 0 10px ${PALETTE.hud.hostGlowCalm}`;
      }
    }
  }

  revealHostBar() {
    this.hostRevealed = true;
    if (this.hostContainer) {
      this.hostContainer.classList.remove('host-bar-hidden');
      this.hostContainer.classList.add('host-bar-revealed');
    }
  }

  reset() {
    this.hostRevealed = false;
    if (this.hostContainer) {
      this.hostContainer.classList.add('host-bar-hidden');
      this.hostContainer.classList.remove('host-bar-revealed');
    }
    if (this.hostBarFill) {
      this.hostBarFill.style.width = '100%';
      this.hostBarFill.style.background = PALETTE.hud.hostCalm;
      this.hostBarFill.style.boxShadow = `0 0 10px ${PALETTE.hud.hostGlowCalm}`;
    }
    if (this.hostPctText) {
      this.hostPctText.textContent = '100%';
    }
    if (this.massText) {
      this.massText.textContent = `0/${BALANCE.player.mass.max}`;
    }
    if (this.massLabel) {
      this.massLabel.textContent = 'MASS';
    }
    if (this.massCooldownOverlay) {
      this.massCooldownOverlay.style.width = '0%';
    }
    if (this.massTracker) {
      this.massTracker.classList.remove('maxed', 'on-vent-cd');
    }
    this.massSegments.forEach((seg) => {
      seg.classList.remove('filled', 'full-capacity');
    });
    if (this.germCount) {
      this.germCount.style.color = PALETTE.hud.progressNormal;
      this.germCount.style.textShadow = `0 0 12px ${PALETTE.hud.progressNormal}`;
    }
    if (this.dashCdText) {
      this.dashCdText.textContent = 'READY';
    }
    if (this.touchDashRing) {
      this.touchDashRing.style.strokeDashoffset = '0';
    }
    if (this.touchVentRing) {
      this.touchVentRing.style.strokeDashoffset = '0';
    }
    if (this.touchVentBtn) {
      this.touchVentBtn.classList.remove('vent-ready');
      this.touchVentBtn.classList.add('vent-disabled');
    }
  }

  show() {
    if (this.hudElement) {
      this.hudElement.classList.remove('hidden');
    }
  }

  hide() {
    if (this.hudElement) {
      this.hudElement.classList.add('hidden');
    }
  }

  update(player, levelRunner, livingEnemyCount) {
    if (!player) return;

    const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
    if (this.hpFill) {
      this.hpFill.style.width = `${hpPct}%`;
      if (hpPct < 30) {
        this.hpFill.style.background = PALETTE.hud.hpCritical;
      } else {
        this.hpFill.style.background = PALETTE.hud.hpNormal;
      }
    }
    if (this.hpGhost) {
      this.hpGhost.style.width = `${hpPct}%`;
    }
    const roundedMaxHp = Math.round(player.maxHp);
    const displayHp = Math.min(roundedMaxHp, Math.max(0, Math.ceil(player.hp)));
    if (this.hpText) {
      this.hpText.textContent = `${displayHp} / ${roundedMaxHp}`;
    }

    // Update Mass Counter and Segmented Bar
    const currentMass = player.mass || 0;
    const maxMass = BALANCE.player.mass.max;
    if (this.massText) {
      this.massText.textContent = `${currentMass}/${maxMass}`;
    }
    if (this.massTracker) {
      this.massTracker.classList.toggle('maxed', currentMass >= maxMass);
      this.massTracker.classList.toggle('on-vent-cd', player.ventTimer > 0);
    }

    // Vent Cooldown visual indicator on the mass bar & touch button
    if (player.ventTimer > 0) {
      const cdPct = (player.ventTimer / player.ventCooldown) * 100;
      if (this.massCooldownOverlay) {
        this.massCooldownOverlay.style.width = `${cdPct}%`;
      }
      if (this.massLabel) {
        this.massLabel.textContent = `VENT (${player.ventTimer.toFixed(1)}s)`;
      }
      if (this.touchVentRing) {
        const offset = (player.ventTimer / player.ventCooldown) * this.ringCircumference;
        this.touchVentRing.style.strokeDashoffset = `${offset}`;
      }
    } else {
      if (this.massCooldownOverlay) {
        this.massCooldownOverlay.style.width = '0%';
      }
      if (this.massLabel) {
        this.massLabel.textContent = 'MASS';
      }
      if (this.touchVentRing) {
        this.touchVentRing.style.strokeDashoffset = '0';
      }
    }

    // Touch Vent button state and subtext
    const minMass = BALANCE.player.vent.minMass;
    const canVent = currentMass >= minMass && player.ventTimer <= 0;
    if (this.touchVentBtn) {
      this.touchVentBtn.classList.toggle('vent-ready', canVent);
      this.touchVentBtn.classList.toggle('vent-disabled', currentMass < minMass);
    }
    if (this.touchVentSub) {
      this.touchVentSub.textContent = `${currentMass}/${minMass}`;
    }

    const isAtMaxCapacity = currentMass >= maxMass;
    for (let i = 0; i < this.massSegments.length; i++) {
      const isFilled = i < currentMass;
      this.massSegments[i].classList.toggle('filled', isFilled);
      this.massSegments[i].classList.toggle('full-capacity', isFilled && isAtMaxCapacity);
    }

    // Dash recharge meter & touch progress ring
    if (this.dashFill) {
      const isReady = player.dashTimer <= 0;
      const dashPct = isReady ? 100 : (1 - player.dashTimer / player.dashCooldown) * 100;
      this.dashFill.style.width = `${dashPct}%`;
      if (this.dashCdText) {
        this.dashCdText.textContent = isReady ? 'READY' : `${player.dashTimer.toFixed(1)}s`;
      }
      if (this.touchDashRing) {
        const offset = isReady ? 0 : (player.dashTimer / player.dashCooldown) * this.ringCircumference;
        this.touchDashRing.style.strokeDashoffset = `${offset}`;
      }
    }

    if (this.waveBadge && levelRunner) {
      const currentId = levelRunner.currentLevel ? levelRunner.currentLevel.id : 1;
      const badgeTextEl = this.waveBadge.querySelector('.badge-text');
      if (badgeTextEl) {
        badgeTextEl.textContent = `LVL ${currentId}/${LEVELS.length}`;
      } else {
        this.waveBadge.textContent = `LVL ${currentId}/${LEVELS.length}`;
      }
    }

    if (this.germCount) {
      if (levelRunner && levelRunner.getProgressText) {
        this.germCount.textContent = levelRunner.getProgressText() || `${livingEnemyCount}`;
      } else {
        this.germCount.textContent = `${livingEnemyCount}`;
      }

      const color = levelRunner?.objective?.getProgressColor?.() || PALETTE.hud.progressNormal;
      this.germCount.style.color = color;
      this.germCount.style.textShadow = `0 0 12px ${color}`;
    }
  }
}
