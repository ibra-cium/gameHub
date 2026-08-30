import { Objective } from './Objective.js';
import { RedBloodCell } from '../../entities/RedBloodCell.js';
import { Vec2 } from '../../core/Vec2.js';
import { BALANCE } from '../../config/balance.js';
import { PALETTE } from '../../config/palettes.js';

export class EscortObjective extends Objective {
  constructor(config = {}, game) {
    super(config, game);
    this.escortHp = config.escortHp ?? BALANCE.objectives.escort.defaultHp;
    this.escortSpeed = config.escortSpeed ?? BALANCE.objectives.escort.defaultSpeed;
    this.path = config.path || null;
    this.escort = null;
    this.exitPos = null;
    this.time = 0;
  }

  start() {
    const bounds = this.game?.worldBounds || { x: -1200, y: -1200, w: 2400, h: 2400 };
    const pad = 240;

    let pathWaypoints = [];
    if (Array.isArray(this.path) && this.path.length > 1) {
      pathWaypoints = this.path.map((p) => new Vec2(p.x, p.y));
    } else {
      // Default cross-arena pathway from left-center to right-center with gentle midpoint curves
      const startX = bounds.x + pad;
      const startY = bounds.y + bounds.h * 0.5 + (Math.random() - 0.5) * 200;
      const midX1 = bounds.x + bounds.w * 0.35;
      const midY1 = bounds.y + bounds.h * 0.3 + (Math.random() - 0.5) * 150;
      const midX2 = bounds.x + bounds.w * 0.65;
      const midY2 = bounds.y + bounds.h * 0.7 + (Math.random() - 0.5) * 150;
      const exitX = bounds.x + bounds.w - pad;
      const exitY = bounds.y + bounds.h * 0.5 + (Math.random() - 0.5) * 200;

      pathWaypoints = [
        new Vec2(startX, startY),
        new Vec2(midX1, midY1),
        new Vec2(midX2, midY2),
        new Vec2(exitX, exitY)
      ];
    }

    const startPos = pathWaypoints[0];
    this.exitPos = pathWaypoints[pathWaypoints.length - 1];

    this.escort = new RedBloodCell(startPos.x, startPos.y, {
      hp: this.escortHp,
      speed: this.escortSpeed,
      path: pathWaypoints
    });

    if (this.game) {
      this.game.escortTarget = this.escort;
    }
  }

  update(dt) {
    this.time += dt;
    if (!this.escort) return;

    this.escort.update(dt, this.game?.worldBounds, this.game?.currentField);

    if (!this.escort.alive && this.game?.escortTarget === this.escort) {
      this.game.escortTarget = null;
    }
  }

  isComplete() {
    return this.escort && this.escort.alive && this.escort.reachedExit;
  }

  isFailed() {
    return this.escort && !this.escort.alive;
  }

  getProgressColor() {
    if (!this.escort || this.escort.hp / this.escort.maxHp < 0.4) {
      return PALETTE.hud.progressWarning;
    }
    return PALETTE.hud.progressNormal;
  }

  getProgressText() {
    if (!this.escort) return 'ESCORT READY';
    if (!this.escort.alive) return 'ESCORT LOST';
    if (this.escort.reachedExit) return 'EXIT REACHED';
    return `RBC ${Math.max(0, Math.ceil(this.escort.hp))}/${this.escort.maxHp}`;
  }

  getIntroText() {
    return this.config.intro || this.game?.levelRunner?.currentLevel?.intro || 'Escort the red blood cell to the exit.';
  }

  draw(ctx, camera, screenWidth, screenHeight) {
    if (!this.escort) return;

    // Draw exit portal destination zone in world space
    if (this.exitPos && this.escort.alive) {
      ctx.save();
      const pulse = 0.5 + 0.5 * Math.sin(this.time * 3);
      const r = BALANCE.objectives.escort.exitZoneRadius + pulse * 6;

      ctx.fillStyle = PALETTE.redBloodCell.exitMarker;
      ctx.beginPath();
      ctx.arc(this.exitPos.x, this.exitPos.y, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = PALETTE.redBloodCell.exitRing;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 6]);
      ctx.lineDashOffset = -this.time * 20;
      ctx.stroke();

      ctx.shadowColor = PALETTE.redBloodCell.exitRingGlow;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(this.exitPos.x, this.exitPos.y, 12 + pulse * 4, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.redBloodCell.exitRing;
      ctx.fill();

      ctx.restore();
    }

    // Draw the escort entity in world space
    this.escort.draw(ctx);

    // Draw off-screen directional arrow indicator in screen coordinates
    if (this.escort.alive) {
      const halfW = screenWidth * 0.5;
      const halfH = screenHeight * 0.5;
      const dx = this.escort.pos.x - camera.pos.x;
      const dy = this.escort.pos.y - camera.pos.y;

      const isOffScreen = Math.abs(dx) > halfW - 40 || Math.abs(dy) > halfH - 40;

      if (isOffScreen) {
        ctx.save();
        ctx.resetTransform();

        const angle = Math.atan2(dy, dx);
        const margin = BALANCE.objectives.escort.arrowMargin;
        const availW = halfW - margin;
        const availH = halfH - margin;

        let edgeX = halfW;
        let edgeY = halfH;

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);

        // Intersect ray with screen perimeter box
        const scaleX = availW / Math.max(0.001, Math.abs(cosA));
        const scaleY = availH / Math.max(0.001, Math.abs(sinA));
        const scale = Math.min(scaleX, scaleY);

        edgeX = halfW + cosA * scale;
        edgeY = halfH + sinA * scale;

        ctx.translate(edgeX, edgeY);
        ctx.rotate(angle);

        const arrowPulse = Math.sin(this.time * BALANCE.objectives.escort.arrowPulseSpeed) * 3;
        const sz = BALANCE.objectives.escort.arrowSize + arrowPulse;

        ctx.shadowColor = PALETTE.redBloodCell.arrowGlow;
        ctx.shadowBlur = 12;

        ctx.fillStyle = PALETTE.redBloodCell.arrow;
        ctx.strokeStyle = PALETTE.redBloodCell.arrowBorder;
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(sz, 0);
        ctx.lineTo(-sz * 0.7, -sz * 0.65);
        ctx.lineTo(-sz * 0.35, 0);
        ctx.lineTo(-sz * 0.7, sz * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }
    }
  }
}
