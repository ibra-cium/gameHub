import { BALANCE } from '../config/balance.js';

export class Screens {
  constructor() {
    this.introCard = document.getElementById('level-intro-card');
    this.introActName = document.getElementById('intro-act-name');
    this.introLevelTitle = document.getElementById('intro-level-title');
    this.introObjectiveLine = document.getElementById('intro-objective-line');

    this.completeBanner = document.getElementById('level-complete-banner');
    this.completeLevelName = document.getElementById('complete-level-name');
    this.completeRegenTag = document.getElementById('complete-regen-tag');

    this.failedBanner = document.getElementById('level-failed-banner');
    this.failedPenaltyTag = document.getElementById('failed-penalty-tag');

    this.hostDeathOverlay = document.getElementById('host-death-screen');
    this.levelReachedText = document.getElementById('death-level-reached');
    this.germsKilledText = document.getElementById('death-germs-killed');
    this.hostRestartBtn = document.getElementById('btn-host-restart');

    this.introTimer = null;
    this.completeTimer = null;
    this.failedTimer = null;
    this.introDismissHandler = null;
    this.onRestart = null;

    if (this.hostRestartBtn) {
      this.hostRestartBtn.addEventListener('click', () => {
        this.hideHostDeath();
        if (typeof this.onRestart === 'function') {
          this.onRestart();
        }
      });
    }
  }

  showIntroCard({ actName = '', levelNumber = 1, levelName = '', introText = '', onDismiss = null } = {}) {
    this.hideAll();

    if (this.introActName) {
      this.introActName.textContent = actName || 'ACT I — SKIN & TISSUE';
    }
    if (this.introLevelTitle) {
      this.introLevelTitle.textContent = `LEVEL ${levelNumber}: ${levelName.toUpperCase()}`;
    }
    if (this.introObjectiveLine) {
      this.introObjectiveLine.textContent = introText;
    }

    if (this.introCard) {
      this.introCard.classList.remove('hidden');
      void this.introCard.offsetWidth;
      this.introCard.classList.add('active');
    }

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;

      if (this.introTimer) {
        clearTimeout(this.introTimer);
        this.introTimer = null;
      }

      if (this.introDismissHandler) {
        window.removeEventListener('keydown', this.introDismissHandler);
        window.removeEventListener('mousedown', this.introDismissHandler);
        window.removeEventListener('touchstart', this.introDismissHandler);
        this.introDismissHandler = null;
      }

      if (this.introCard) {
        this.introCard.classList.remove('active');
        setTimeout(() => {
          if (!this.introCard.classList.contains('active')) {
            this.introCard.classList.add('hidden');
          }
        }, 200);
      }

      if (typeof onDismiss === 'function') {
        onDismiss();
      }
    };

    this.introDismissHandler = () => dismiss();
    window.addEventListener('keydown', this.introDismissHandler, { once: true });
    window.addEventListener('mousedown', this.introDismissHandler, { once: true });
    window.addEventListener('touchstart', this.introDismissHandler, { once: true });

    const duration = BALANCE.screens.introCardDuration * 1000;
    this.introTimer = setTimeout(dismiss, duration);
  }

  showLevelComplete({ levelName = '', regenAmount = BALANCE.host.regenPerClearedLevel, onComplete = null } = {}) {
    this.hideAll();

    if (this.completeLevelName) {
      this.completeLevelName.textContent = `${levelName.toUpperCase()} SECURED`;
    }
    if (this.completeRegenTag) {
      if (regenAmount > 0) {
        this.completeRegenTag.textContent = `+${regenAmount}% HOST VITALITY RECOVERED`;
        this.completeRegenTag.style.display = 'block';
      } else {
        this.completeRegenTag.style.display = 'none';
      }
    }

    if (this.completeBanner) {
      this.completeBanner.classList.remove('hidden');
      void this.completeBanner.offsetWidth;
      this.completeBanner.classList.add('active');
    }

    const duration = BALANCE.screens.levelCompleteDelay * 1000;
    this.completeTimer = setTimeout(() => {
      if (this.completeBanner) {
        this.completeBanner.classList.remove('active');
        this.completeBanner.classList.add('hidden');
      }
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }, duration);
  }

  showLevelFailed({ penaltyAmount = BALANCE.host.failPenalty, onRetry = null } = {}) {
    this.hideAll();

    if (this.failedPenaltyTag) {
      this.failedPenaltyTag.textContent = `-${penaltyAmount}% HOST VITALITY PENALTY`;
    }

    if (this.failedBanner) {
      this.failedBanner.classList.remove('hidden');
      void this.failedBanner.offsetWidth;
      this.failedBanner.classList.add('active');
    }

    const duration = BALANCE.screens.levelFailedDelay * 1000;
    this.failedTimer = setTimeout(() => {
      if (this.failedBanner) {
        this.failedBanner.classList.remove('active');
        this.failedBanner.classList.add('hidden');
      }
      if (typeof onRetry === 'function') {
        onRetry();
      }
    }, duration);
  }

  showHostDeath({ level = 1, totalKills = 0, onRestart = null } = {}) {
    this.hideAll();
    this.onRestart = onRestart;

    if (this.levelReachedText) {
      this.levelReachedText.textContent = `${level}`;
    }
    if (this.germsKilledText) {
      this.germsKilledText.textContent = `${totalKills}`;
    }

    if (this.hostDeathOverlay) {
      this.hostDeathOverlay.classList.remove('hidden');
      void this.hostDeathOverlay.offsetWidth;
      this.hostDeathOverlay.classList.add('active');
    }
  }

  hideHostDeath() {
    if (this.hostDeathOverlay) {
      this.hostDeathOverlay.classList.remove('active');
      this.hostDeathOverlay.classList.add('hidden');
    }
  }

  hideAll() {
    if (this.introTimer) {
      clearTimeout(this.introTimer);
      this.introTimer = null;
    }
    if (this.completeTimer) {
      clearTimeout(this.completeTimer);
      this.completeTimer = null;
    }
    if (this.failedTimer) {
      clearTimeout(this.failedTimer);
      this.failedTimer = null;
    }

    if (this.introDismissHandler) {
      window.removeEventListener('keydown', this.introDismissHandler);
      window.removeEventListener('mousedown', this.introDismissHandler);
      window.removeEventListener('touchstart', this.introDismissHandler);
      this.introDismissHandler = null;
    }

    if (this.introCard) {
      this.introCard.classList.remove('active');
      this.introCard.classList.add('hidden');
    }
    if (this.completeBanner) {
      this.completeBanner.classList.remove('active');
      this.completeBanner.classList.add('hidden');
    }
    if (this.failedBanner) {
      this.failedBanner.classList.remove('active');
      this.failedBanner.classList.add('hidden');
    }
    this.hideHostDeath();
  }
}
