import { Vec2 } from './Vec2.js';
import { Camera } from './Camera.js';
import { InputManager } from './InputManager.js';
import { AudioEngine } from '../systems/AudioEngine.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { Environment } from '../render/Environment.js';
import { CurrentField } from '../systems/CurrentField.js';
import { LevelRunner } from '../systems/LevelRunner.js';
import { LEVELS } from '../levels/levels.js';
import { ACTS } from '../levels/acts.js';
import { HostVitality } from '../systems/HostVitality.js';
import { Player } from '../entities/Player.js';
import { Pickup } from '../entities/Pickup.js';
import { Hud } from '../ui/Hud.js';
import { Screens } from '../ui/Screens.js';
import { WORLD_BOUNDS, MAX_DELTA_TIME } from '../config/constants.js';
import { BALANCE } from '../config/balance.js';
import { PALETTE, setActPalette } from '../config/palettes.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    this.worldBounds = { ...WORLD_BOUNDS };
    this.state = 'TITLE';
    this.currentLevelId = 1;

    this.soundFx = new AudioEngine();
    this.camera = new Camera();
    this.input = new InputManager(this.canvas);
    this.particleSys = new ParticleSystem();
    this.environment = new Environment(this.worldBounds);
    this.currentField = new CurrentField(this.worldBounds);
    this.levelRunner = new LevelRunner(this);
    this.levelRunner.onComplete = (level) => this.handleLevelComplete(level);
    this.levelRunner.onFail = (level) => this.handleLevelFail(level);
    this.hostVitality = new HostVitality();
    this.hud = new Hud();
    this.hud.bindHostVitality(this.hostVitality);
    this.screens = new Screens();
    this.vitalityLogTimer = 0;

    this.player = new Player(0, 0);
    this.enemies = [];
    this.bodyCells = [];
    this.debris = [];
    this.splinters = [];
    this.pickups = [];
    this.escortTarget = null;
    this.infectionSource = null;

    this.respawnTimer = 0;

    this.respawnTargetPos = new Vec2(0, 0);
    this.isRespawning = false;

    this.lastTime = performance.now();
    this.totalKills = 0;

    this.initDOM();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  setWorldBounds(newBounds) {
    this.worldBounds = { ...newBounds };
    if (this.environment) {
      this.environment.bounds = this.worldBounds;
    }
    if (this.currentField) {
      this.currentField.bounds = this.worldBounds;
    }
  }

  initDOM() {
    this.respawnBanner = document.getElementById('respawn-banner');
    this.respawnCountdown = document.getElementById('respawn-countdown');

    this.startModal = document.getElementById('start-modal');
    this.victoryModal = document.getElementById('victory-modal');
    this.victoryStats = document.getElementById('victory-stats');
    this.levelSelectModal = document.getElementById('level-select-modal');

    document.getElementById('btn-start')?.addEventListener('click', () => {
      this.tryRequestFullscreen();
      this.startModal?.classList.remove('active');
      this.startModal?.classList.add('hidden');
      this.startGame(1);
    });

    document.getElementById('btn-start-level-select')?.addEventListener('click', () => {
      this.showLevelSelectModal();
    });

    document.getElementById('btn-death-level-select')?.addEventListener('click', () => {
      this.screens.hideHostDeath();
      this.showLevelSelectModal();
    });

    document.getElementById('btn-victory-level-select')?.addEventListener('click', () => {
      this.victoryModal?.classList.add('hidden');
      this.victoryModal?.classList.remove('active');
      this.showLevelSelectModal();
    });

    document.getElementById('btn-close-level-select')?.addEventListener('click', () => {
      this.hideLevelSelectModal();
    });

    document.getElementById('wave-badge')?.addEventListener('click', () => {
      this.showLevelSelectModal();
    });

    document.getElementById('btn-play-again')?.addEventListener('click', () => {
      this.tryRequestFullscreen();
      this.victoryModal?.classList.add('hidden');
      this.victoryModal?.classList.remove('active');
      this.startGame(1);
    });

    document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    document.addEventListener('fullscreenchange', () => {
      this.resizeCanvas();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'l' || e.key === 'L') {
        if (this.levelSelectModal && this.levelSelectModal.classList.contains('active')) {
          this.hideLevelSelectModal();
        } else {
          this.showLevelSelectModal();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      } else if (e.key === 'Escape') {
        this.hideLevelSelectModal();
      }
    });

    this.buildLevelSelectGrid();
  }

  tryRequestFullscreen() {
    if (!document.fullscreenElement) {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.tryRequestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  buildLevelSelectGrid() {
    const grid = document.getElementById('level-grid');
    if (!grid) return;
    grid.innerHTML = '';

    LEVELS.forEach((level) => {
      const btn = document.createElement('button');
      btn.className = `level-btn ${level.id === this.currentLevelId ? 'active-level' : ''}`;
      
      const objType = level.objective?.type || 'purge';
      const badgeClass = `level-badge-${objType}`;
      
      let spawnsText = 'No germs';
      if (level.spawns && level.spawns.length > 0) {
        spawnsText = level.spawns.map((s) => `${s.count} ${s.type}`).join(', ');
      } else if (level.objective?.debrisCount) {
        spawnsText = `${level.objective.debrisCount} debris`;
      }

      btn.innerHTML = `
        <div class="level-btn-top">
          <span class="level-num">L${level.id}</span>
          <span class="level-badge ${badgeClass}">${objType}</span>
        </div>
        <div class="level-name">${level.name}</div>
        <div class="level-spawns-summary">${spawnsText}</div>
      `;

      btn.addEventListener('click', () => {
        this.tryRequestFullscreen();
        this.hideLevelSelectModal();
        this.startModal?.classList.remove('active');
        this.startModal?.classList.add('hidden');
        this.victoryModal?.classList.remove('active');
        this.victoryModal?.classList.add('hidden');
        this.screens?.hideAll();
        this.startGame(level.id);
      });

      grid.appendChild(btn);
    });
  }

  showLevelSelectModal() {
    this.buildLevelSelectGrid();
    if (this.levelSelectModal) {
      this.levelSelectModal.classList.remove('hidden');
      this.levelSelectModal.classList.add('active');
    }
  }

  hideLevelSelectModal() {
    if (this.levelSelectModal) {
      this.levelSelectModal.classList.remove('active');
      this.levelSelectModal.classList.add('hidden');
    }
  }

  resizeCanvas() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  startGame(levelId = 1) {
    this.state = 'PLAYING';
    this.currentLevelId = levelId || 1;
    this.totalKills = 0;

    this.hostVitality = new HostVitality();
    this.hud.bindHostVitality(this.hostVitality);
    this.hud.reset();
    this.screens.hideAll();
    this.hideLevelSelectModal();
    this.vitalityLogTimer = 0;
    this.isRespawning = false;
    this.respawnTimer = 0;
    if (this.respawnBanner) this.respawnBanner.classList.remove('active');
    if (this.respawnCountdown) this.respawnCountdown.textContent = '';
    this.hud.show();
    this.soundFx.init();
    this.soundFx.startHeartbeat();

    this.loadLevel(this.currentLevelId);
  }

  loadLevel(levelId) {
    this.currentLevelId = levelId;
    const level = LEVELS.find((l) => l.id === levelId);
    if (!level) {
      this.showVictoryModal();
      return;
    }

    if (this.levelRunner) {
      this.levelRunner.active = false;
    }

    this.player = new Player(0, 0);
    this.enemies = [];
    this.bodyCells = [];
    this.debris = [];
    this.splinters = [];
    this.pickups = [];
    this.escortTarget = null;
    this.infectionSource = null;
    this.isRespawning = false;
    this.respawnTimer = 0;
    if (this.respawnBanner) this.respawnBanner.classList.remove('active');
    if (this.respawnCountdown) this.respawnCountdown.textContent = '';

    const act = ACTS.find((a) => a.id === level.act);
    const actKey = level.act || 'skin';
    setActPalette(actKey);
    if (this.environment) {
      this.environment.setAct(actKey);
    }
    if (this.currentField) {
      this.currentField.initForLevel(level, this.worldBounds);
    }
    const actIndex = ACTS.findIndex((a) => a.id === level.act);
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    const actNum = actIndex >= 0 ? romanNumerals[actIndex] : 'I';
    const actName = act ? `ACT ${actNum} — ${act.name.toUpperCase()}` : 'ACT I — SKIN & TISSUE';
    const introText = level.intro || 'Neutralize the foreign organisms.';

    this.soundFx.playLevelIntro();

    this.screens.showIntroCard({
      actName: actName,
      levelNumber: level.id,
      levelName: level.name,
      introText: introText,
      onDismiss: () => {
        this.levelRunner.load(level.id);
      }
    });
  }

  handleLevelComplete(level) {
    this.soundFx.playWaveComplete();
    const regen = BALANCE.host.regenPerClearedLevel;
    if (regen > 0) {
      this.hostVitality.heal(regen);
    }

    const nextLevelId = level.id + 1;
    const nextLevel = LEVELS.find((l) => l.id === nextLevelId);

    this.screens.showLevelComplete({
      levelName: level.name,
      regenAmount: regen,
      onComplete: () => {
        if (nextLevel) {
          this.loadLevel(nextLevelId);
        } else {
          this.showVictoryModal();
        }
      }
    });
  }

  handleLevelFail(level) {
    if (this.hostVitality.isDead()) {
      this.triggerHostDeath();
      return;
    }

    const penalty = BALANCE.host.failPenalty;
    this.hostVitality.damage(penalty);

    if (this.hostVitality.isDead()) {
      this.triggerHostDeath();
      return;
    }

    this.soundFx.playLevelFailed();
    this.screens.showLevelFailed({
      penaltyAmount: penalty,
      onRetry: () => {
        this.loadLevel(this.currentLevelId);
      }
    });
  }

  getRandomWorldEdgePos() {
    const margin = BALANCE.player.radius + BALANCE.player.bodyMargin + 40;
    const minX = this.worldBounds.x + margin;
    const maxX = this.worldBounds.x + this.worldBounds.w - margin;
    const minY = this.worldBounds.y + margin;
    const maxY = this.worldBounds.y + this.worldBounds.h - margin;

    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0: // Top
        return new Vec2(minX + Math.random() * (maxX - minX), minY);
      case 1: // Bottom
        return new Vec2(minX + Math.random() * (maxX - minX), maxY);
      case 2: // Left
        return new Vec2(minX, minY + Math.random() * (maxY - minY));
      case 3: // Right
      default:
        return new Vec2(maxX, minY + Math.random() * (maxY - minY));
    }
  }

  emitRespawnStreamParticles() {
    const count = 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 90 + Math.random() * 160;
      const startX = this.respawnTargetPos.x + Math.cos(angle) * dist;
      const startY = this.respawnTargetPos.y + Math.sin(angle) * dist;
      const flightDuration = 0.36;
      const vx = (-Math.cos(angle) * dist) / flightDuration;
      const vy = (-Math.sin(angle) * dist) / flightDuration;

      this.particleSys.emit({
        pos: new Vec2(startX, startY),
        vel: new Vec2(vx, vy),
        size: 3 + Math.random() * 4,
        endSize: 0,
        color: Math.random() < 0.5 ? PALETTE.player.membrane : PALETTE.player.respawnStream,
        life: flightDuration,
        friction: 1.0,
        type: 'blob'
      });
    }
  }

  triggerHostDeath() {
    this.state = 'HOST_DEAD';
    this.soundFx.stopHeartbeat();
    this.hud.hide();
    if (this.respawnBanner) {
      this.respawnBanner.classList.remove('active');
    }
    this.screens.showHostDeath({
      level: this.currentLevelId,
      totalKills: this.totalKills,
      onRestart: () => this.startGame(1)
    });
  }

  showVictoryModal() {
    this.state = 'VICTORY';
    this.soundFx.stopHeartbeat();
    this.hud.hide();
    this.screens.hideAll();
    this.victoryStats.innerHTML = `<span>STATUS: STERILIZED</span><span>TOTAL KILLS: ${this.totalKills}</span>`;
    this.victoryModal.classList.remove('hidden');
    this.victoryModal.classList.add('active');
  }

  updateHUD() {
    if (this.hud && this.state === 'PLAYING') {
      this.hud.update(this.player, this.levelRunner, this.enemies.length);
    }
  }

  gameLoop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, MAX_DELTA_TIME);
    this.lastTime = time;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  update(dt) {
    this.input.updateWorldMouse(this.camera);

    if (this.state === 'PLAYING') {
      if (this.currentField) {
        this.currentField.update(dt);
      }

      if (this.player.alive) {
        if (this.input.consumeVent()) {
          const ventTargets = this.infectionSource && this.infectionSource.alive ? [...this.enemies, this.infectionSource, ...this.splinters] : [...this.enemies, ...this.splinters];
          const vented = this.player.vent(this.soundFx, this.particleSys, this.camera, ventTargets);
          if (!vented && this.player.mass < BALANCE.player.vent.minMass) {
            this.hud.flashMassDenied();
          }
        }

        const attackTargets = this.infectionSource && this.infectionSource.alive
          ? [...this.enemies, this.infectionSource, ...this.splinters]
          : [...this.enemies, ...this.splinters];
        this.player.update(dt, this.input, this.soundFx, this.particleSys, this.camera, this.worldBounds, this.currentField, attackTargets);

        const attackHit = this.player.getAttackHitCircle();
        if (attackHit && !this.player.attackHitboxTriggered) {
          let hitSomeone = false;
          this.enemies.forEach((enemy) => {
            if (enemy.isBeingEngulfed) return;
            const d = enemy.pos.dist(new Vec2(attackHit.x, attackHit.y));
            if (d < attackHit.radius + enemy.radius) {
              const hitDir = enemy.pos.copy().sub(this.player.pos).norm();
              enemy.takeDamage(attackHit.damage, hitDir, this.soundFx, this.particleSys, this.camera);
              hitSomeone = true;
            }
          });

          this.splinters.forEach((splinter) => {
            if (splinter.isBeingEngulfed) return;
            const d = splinter.pos.dist(new Vec2(attackHit.x, attackHit.y));
            if (d < attackHit.radius + splinter.radius) {
              const hitDir = splinter.pos.copy().sub(this.player.pos).norm();
              splinter.takeDamage(attackHit.damage, hitDir, this.soundFx, this.particleSys, this.camera);
              hitSomeone = true;
            }
          });

          if (this.infectionSource && this.infectionSource.alive) {
            const d = this.infectionSource.pos.dist(new Vec2(attackHit.x, attackHit.y));
            if (d < attackHit.radius + this.infectionSource.radius) {
              const hitDir = this.infectionSource.pos.copy().sub(this.player.pos).norm();
              this.infectionSource.takeDamage(attackHit.damage, hitDir, this.soundFx, this.particleSys, this.camera);
              hitSomeone = true;
            }
          }

          if (hitSomeone) {
            this.player.attackHitboxTriggered = true;
          }
        }

        // Trigger phagocytosis engulfing when overlapping splinters or weakened enemies
        if (!this.player.isEngulfing) {
          for (const splinter of this.splinters) {
            if (splinter.alive && !splinter.isBeingEngulfed) {
              const overlapDist = this.player.baseRadius + splinter.radius * BALANCE.splinter.engulfOverlapRadius;
              if (this.player.pos.dist(splinter.pos) <= overlapDist) {
                this.player.startEngulf(splinter, this.soundFx);
                break;
              }
            }
          }

          if (!this.player.isEngulfing) {
            for (const enemy of this.enemies) {
              if (enemy.alive && enemy.isWeakened && !enemy.isBeingEngulfed) {
                const overlapDist = this.player.baseRadius + enemy.radius * BALANCE.player.engulfOverlapRadius;
                if (this.player.pos.dist(enemy.pos) <= overlapDist) {
                  this.player.startEngulf(enemy, this.soundFx);
                  break;
                }
              }
            }
          }
        }

        // Heal infected body cells within the first 40% of their infection timer on touch
        this.bodyCells.forEach((cell) => {
          if (cell.isHealable()) {
            const touchDist = this.player.baseRadius + cell.radius;
            if (this.player.pos.dist(cell.pos) <= touchDist) {
              cell.heal(this.soundFx, this.particleSys);
            }
          }
        });
      }

      const enemyTarget = (this.escortTarget && this.escortTarget.alive) ? this.escortTarget : this.player;
      const newOffspring = [];
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        enemy.update(dt, enemyTarget, this.worldBounds, this.soundFx, this.particleSys, this.currentField, this.bodyCells);
        if (enemy.pendingOffspring) {
          newOffspring.push(enemy.pendingOffspring);
          enemy.pendingOffspring = null;
        }

        // Enemies infect healthy body cells on contact (Viruses infect via latching)
        if (!enemy.isWeakened && !enemy.isBeingEngulfed && enemy.type !== 'virus') {
          this.bodyCells.forEach((cell) => {
            if (cell.state === 'healthy') {
              const infectDist = enemy.radius + cell.radius;
              if (enemy.pos.dist(cell.pos) <= infectDist) {
                cell.infect(enemy.type, this.soundFx, this.particleSys);
              }
            }
          });
        }

        if (this.player.alive && !enemy.isWeakened && !enemy.isBeingEngulfed && enemy.pos.dist(this.player.pos) < enemy.radius + this.player.baseRadius * 0.75) {
          if (enemy.type === 'parasite') {
            if (enemy.state === 'chase' && !this.player.isEngulfing && this.player.invulnerableTime <= 0) {
              if (this.player.mass > 0) {
                const stolen = this.player.stealMass(BALANCE.parasite.stealAmount || 4);
                if (stolen > 0) {
                  enemy.stealMass(stolen);
                  this.soundFx.playParasiteSteal();
                  this.camera.shake(5, 0.15);
                  this.particleSys.emitBurst(enemy.pos.x, enemy.pos.y, 16, {
                    color: PALETTE.enemy?.parasite?.stolenMassCore || '#38bdf8',
                    size: 5,
                    minSpeed: 3,
                    maxSpeed: 8,
                    life: 0.35,
                    type: 'blob'
                  });
                  const pushDir = enemy.pos.copy().sub(this.player.pos).norm();
                  enemy.vel.set(pushDir.x * 200, pushDir.y * 200);
                }
              } else {
                // Zero mass: parasite deals normal contact damage
                const damaged = this.player.takeDamage(enemy.damage, this.soundFx, this.particleSys, this.camera);
                if (damaged) {
                  const pushDir = enemy.pos.copy().sub(this.player.pos).norm();
                  enemy.vel.add(pushDir.mult(BALANCE.enemyBase.playerPushback));
                }
              }
            }
          } else {
            const damaged = this.player.takeDamage(enemy.damage, this.soundFx, this.particleSys, this.camera);
            if (damaged) {
              const pushDir = enemy.pos.copy().sub(this.player.pos).norm();
              enemy.vel.add(pushDir.mult(BALANCE.enemyBase.playerPushback));
            }
          }
        }

        // Contact damage against escort RBC
        if (this.escortTarget && this.escortTarget.alive && !enemy.isWeakened && !enemy.isBeingEngulfed && enemy.pos.dist(this.escortTarget.pos) < enemy.radius + this.escortTarget.radius) {
          const hitDir = this.escortTarget.pos.copy().sub(enemy.pos).norm();
          this.escortTarget.takeDamage(enemy.damage, hitDir, this.soundFx, this.particleSys, this.camera);
          enemy.vel.add(hitDir.copy().mult(-BALANCE.enemyBase.playerPushback * 0.5));
        }
      }

      if (newOffspring.length > 0) {
        this.enemies.push(...newOffspring);
      }

      // Update scattered debris items
      this.debris.forEach((item) => {
        item.update(dt, this.worldBounds, this.currentField);
      });

      // Update dropped mass pickups
      this.pickups.forEach((pickup) => {
        pickup.update(dt, this.player, this.soundFx, this.particleSys, this.worldBounds, this.currentField);
      });
      this.pickups = this.pickups.filter((p) => p.alive);

      // Update splinters & deal contact damage to player when not being engulfed
      for (const splinter of this.splinters) {
        if (!splinter.alive) continue;
        splinter.update(dt, this.worldBounds);

        if (this.player.alive && !splinter.isBeingEngulfed && splinter.pos.dist(this.player.pos) < splinter.radius + this.player.baseRadius * 0.75) {
          this.player.takeDamage(splinter.damage, this.soundFx, this.particleSys, this.camera);
        }
      }
      this.splinters = this.splinters.filter((s) => s.alive);

      // Update foreground body cells and handle enemy spawn on infection rupture
      this.bodyCells.forEach((cell) => {
        cell.update(dt, this.worldBounds, this.soundFx, this.particleSys, this.currentField);
        if (cell.pendingEnemySpawn) {
          this.levelRunner.spawnEnemy(cell.pendingEnemySpawn, cell.pos.copy());
          cell.pendingEnemySpawn = null;
        }
      });

      const deadEnemies = this.enemies.filter((e) => !e.alive);
      if (deadEnemies.length > 0) {
        deadEnemies.forEach((e) => {
          if (e.type === 'parasite' && e.stolenMass > 0 && !e.escaped) {
            const count = e.stolenMass;
            for (let i = 0; i < count; i++) {
              const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
              const spd = BALANCE.pickup.burstMinSpeed + Math.random() * (BALANCE.pickup.burstMaxSpeed - BALANCE.pickup.burstMinSpeed);
              const pVel = new Vec2(Math.cos(angle) * spd, Math.sin(angle) * spd);
              this.pickups.push(new Pickup(e.pos.x, e.pos.y, 1, pVel));
            }
            e.stolenMass = 0;
          }
        });
        this.totalKills += deadEnemies.length;
        this.enemies = this.enemies.filter((e) => e.alive);
      }

      // Marrow respawn lifecycle on player death
      if (this.player.dead && !this.isRespawning) {
        this.isRespawning = true;
        this.respawnTimer = BALANCE.player.respawnDelay;
        this.respawnTargetPos = this.getRandomWorldEdgePos();
        if (this.respawnCountdown) {
          this.respawnCountdown.textContent = `${this.respawnTimer.toFixed(1)}s`;
        }
        if (this.respawnBanner) {
          this.respawnBanner.classList.add('active');
        }
      }

      if (this.isRespawning) {
        this.respawnTimer -= dt;
        if (this.respawnCountdown) {
          this.respawnCountdown.textContent = `${Math.max(0, this.respawnTimer).toFixed(1)}s`;
        }

        this.emitRespawnStreamParticles();

        if (this.respawnTimer <= 0) {
          this.isRespawning = false;
          if (this.respawnBanner) {
            this.respawnBanner.classList.remove('active');
          }
          if (this.respawnCountdown) {
            this.respawnCountdown.textContent = '';
          }
          this.player = new Player(this.respawnTargetPos.x, this.respawnTargetPos.y, true);
          this.soundFx.playRespawn();
          this.particleSys.emitBurst(this.respawnTargetPos.x, this.respawnTargetPos.y, 35, {
            color: PALETTE.player.membrane,
            size: 6,
            minSpeed: 3,
            maxSpeed: 9,
            life: 0.5,
            type: 'blob'
          });
          this.particleSys.emitShockwave(this.respawnTargetPos.x, this.respawnTargetPos.y, 90, PALETTE.player.dashShockwave, 0.35);
        }
      }

      const livingEnemies = this.enemies.filter((e) => e.alive).length;
      const unitDrain = this.levelRunner.currentLevel ? this.levelRunner.vitalityDrain : BALANCE.host.baseDrainPerActiveEnemy;
      let drainRate = livingEnemies * unitDrain;
      if (this.isRespawning || this.player.dead) {
        drainRate += BALANCE.host.drainWhilePlayerDead;
      }
      this.hostVitality.drain(drainRate, dt);

      if (this.hostVitality.isDead()) {
        this.triggerHostDeath();
        return;
      }

      this.vitalityLogTimer += dt;
      if (this.vitalityLogTimer >= 1.0) {
        this.vitalityLogTimer = 0;
        console.log(`[HostVitality] ${this.hostVitality.current.toFixed(2)} / ${this.hostVitality.max} (${(this.hostVitality.getRatio() * 100).toFixed(1)}%) | Drain: ${drainRate.toFixed(2)}/s (Enemies: ${livingEnemies}${this.isRespawning ? ' + Dead Player Drain' : ''})`);
      }

      this.levelRunner.update(dt);
      this.hud.update(this.player, this.levelRunner, this.enemies.length);
      this.soundFx.update(dt, this.hostVitality.getRatio());
    }

    this.environment.update(dt, this.currentField);
    this.particleSys.update(dt);
    const cameraTarget = (this.player && this.player.alive) ? this.player.pos : this.respawnTargetPos;
    this.camera.update(dt, cameraTarget, this.width, this.height, this.worldBounds);
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.ctx.save();
    this.camera.applyTransform(this.ctx);

    this.environment.draw(this.ctx, {
      x: this.camera.pos.x,
      y: this.camera.pos.y,
      w: this.width,
      h: this.height
    }, this.currentField);

    // Foreground body cells
    this.bodyCells.forEach((cell) => {
      cell.draw(this.ctx);
    });

    // Static splinters embedded in tissue (drawn before player)
    this.splinters.forEach((splinter) => {
      if (!splinter.isBeingEngulfed) {
        splinter.draw(this.ctx);
      }
    });

    // Scattered debris items
    this.debris.forEach((item) => {
      item.draw(this.ctx);
    });

    // Dropped mass pickups
    this.pickups.forEach((pickup) => {
      pickup.draw(this.ctx);
    });

    // Non-engulfed enemies drawn behind the player
    this.enemies.forEach((enemy) => {
      if (enemy.isBeingEngulfed) return;
      enemy.draw(this.ctx);
      enemy.drawHealthBar(this.ctx);
    });

    this.player.draw(this.ctx);

    // Engulfed enemies drawn after the player so the shrink animation
    // is visible on top of the membrane, not hidden beneath the body fill.
    this.enemies.forEach((enemy) => {
      if (!enemy.isBeingEngulfed) return;
      enemy.draw(this.ctx);
    });

    // Engulfed splinters drawn after player during phagosome absorption
    this.splinters.forEach((splinter) => {
      if (splinter.isBeingEngulfed) {
        splinter.draw(this.ctx);
      }
    });

    this.particleSys.draw(this.ctx);

    // Objective layer (exit zones, escort entity, infection source, radar/pointer HUD overlays)
    if (this.levelRunner?.objective?.draw) {
      this.levelRunner.objective.draw(this.ctx, this.camera, this.width, this.height);
    }

    this.ctx.restore();

    // Render off-screen HUD indicators for distant / off-screen enemies
    const halfW = this.width * 0.5;
    const halfH = this.height * 0.5;
    const defaultMargin = BALANCE.hud?.enemyIndicatorMargin || 34;

    this.enemies.forEach((enemy) => {
      if (!enemy.alive || enemy.isBeingEngulfed) return;

      const screenX = enemy.pos.x - this.camera.pos.x;
      const screenY = enemy.pos.y - this.camera.pos.y;
      const isOffScreen = screenX < -25 || screenX > this.width + 25 || screenY < -25 || screenY > this.height + 25;

      if (!isOffScreen) return;

      const isFleeingParasite = enemy.type === 'parasite' && enemy.state === 'fleeing' && enemy.stolenMass > 0;
      const dx = screenX - halfW;
      const dy = screenY - halfH;
      const angle = Math.atan2(dy, dx);
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      if (isFleeingParasite) {
        // High-priority large warning arrow for parasites fleeing with stolen mass
        const margin = BALANCE.parasite?.warningArrowMargin || 40;
        const availW = halfW - margin;
        const availH = halfH - margin;
        const scaleX = availW / Math.max(0.001, Math.abs(cosA));
        const scaleY = availH / Math.max(0.001, Math.abs(sinA));
        const scale = Math.min(scaleX, scaleY);

        const edgeX = halfW + cosA * scale;
        const edgeY = halfH + sinA * scale;

        this.ctx.save();
        this.ctx.translate(edgeX, edgeY);
        this.ctx.rotate(angle);

        const pulse = Math.sin((enemy.timeAlive || 0) * (BALANCE.parasite?.warningArrowPulseSpeed || 9.0)) * 3;
        const sz = (BALANCE.parasite?.warningArrowSize || 18) + pulse;

        this.ctx.shadowColor = PALETTE.enemy?.parasite?.warningArrowGlow || 'rgba(251, 191, 36, 0.85)';
        this.ctx.shadowBlur = 12;
        this.ctx.fillStyle = PALETTE.enemy?.parasite?.warningArrow || '#fbbf24';
        this.ctx.strokeStyle = PALETTE.enemy?.parasite?.warningArrowBorder || '#fef08a';
        this.ctx.lineWidth = 2;

        this.ctx.beginPath();
        this.ctx.moveTo(sz, 0);
        this.ctx.lineTo(-sz * 0.7, -sz * 0.65);
        this.ctx.lineTo(-sz * 0.35, 0);
        this.ctx.lineTo(-sz * 0.7, sz * 0.65);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
      } else {
        // Standard off-screen enemy indicator pointer
        const availW = halfW - defaultMargin;
        const availH = halfH - defaultMargin;
        const scaleX = availW / Math.max(0.001, Math.abs(cosA));
        const scaleY = availH / Math.max(0.001, Math.abs(sinA));
        const scale = Math.min(scaleX, scaleY);

        const edgeX = halfW + cosA * scale;
        const edgeY = halfH + sinA * scale;

        this.ctx.save();
        this.ctx.translate(edgeX, edgeY);
        this.ctx.rotate(angle);

        const pulseRate = enemy.isWeakened
          ? (BALANCE.hud?.enemyIndicatorWeakenedPulseSpeed || 7.5)
          : (BALANCE.hud?.enemyIndicatorPulseSpeed || 4.5);
        const pulse = Math.sin((enemy.timeAlive || 0) * pulseRate) * 1.5;
        const sz = (BALANCE.hud?.enemyIndicatorSize || 11) + pulse;

        let fillCol = PALETTE.enemy?.indicator?.bacteria || '#4ade80';
        let borderCol = PALETTE.enemy?.indicator?.bacteriaBorder || '#bbf7d0';
        let glowCol = PALETTE.enemy?.indicator?.bacteriaGlow || 'rgba(74, 222, 128, 0.75)';

        if (enemy.isWeakened) {
          fillCol = PALETTE.enemy?.indicator?.weakened || '#38bdf8';
          borderCol = PALETTE.enemy?.indicator?.weakenedBorder || '#ffffff';
          glowCol = PALETTE.enemy?.indicator?.weakenedGlow || 'rgba(56, 189, 248, 0.85)';
        } else if (enemy.type === 'virus') {
          fillCol = PALETTE.enemy?.indicator?.virus || '#c084fc';
          borderCol = PALETTE.enemy?.indicator?.virusBorder || '#f5d0fe';
          glowCol = PALETTE.enemy?.indicator?.virusGlow || 'rgba(192, 132, 252, 0.75)';
        } else if (enemy.type === 'parasite') {
          fillCol = PALETTE.enemy?.indicator?.parasite || '#f59e0b';
          borderCol = PALETTE.enemy?.indicator?.parasiteBorder || '#fef08a';
          glowCol = PALETTE.enemy?.indicator?.parasiteGlow || 'rgba(245, 158, 11, 0.75)';
        }

        this.ctx.shadowColor = glowCol;
        this.ctx.shadowBlur = 8;
        this.ctx.fillStyle = fillCol;
        this.ctx.strokeStyle = borderCol;
        this.ctx.lineWidth = 1.5;

        // Elegant soft chevron arrow
        this.ctx.beginPath();
        this.ctx.moveTo(sz, 0);
        this.ctx.lineTo(-sz * 0.65, -sz * 0.55);
        this.ctx.lineTo(-sz * 0.3, 0);
        this.ctx.lineTo(-sz * 0.65, sz * 0.55);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
      }
    });
  }
}
