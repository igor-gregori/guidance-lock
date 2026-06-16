import { Vec2, angle } from './math/vector';
import { MissileState } from './entities/missile';
import { TargetState } from './entities/target';
import { Simulation } from './simulation';

export interface Renderer {
  draw(sim: Simulation): void;
}

export function createRenderer(ctx: CanvasRenderingContext2D): Renderer {
  function drawTrail(trail: Vec2[], color: string) {
    if (trail.length < 2) return;
    const len = trail.length;
    for (let i = 1; i < len; i++) {
      ctx.strokeStyle = color;
      ctx.globalAlpha = i / len * 0.6;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawMissile(m: MissileState) {
    drawTrail(m.trail, m.color);
    if (!m.alive) return;

    const a = angle(m.vel);
    ctx.save();
    ctx.translate(m.pos.x, m.pos.y);
    ctx.rotate(a + Math.PI / 2);
    ctx.fillStyle = m.color;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.lineTo(-3, 4);
    ctx.lineTo(3, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawTarget(t: TargetState) {
    drawTrail(t.trail, 'rgba(255,255,255,0.4)');
    if (!t.alive) return;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(t.pos.x, t.pos.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHud(sim: Simulation) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(`t = ${sim.time.toFixed(2)}s`, 10, 20);
  }

  return {
    draw(sim: Simulation) {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.lineWidth = 1;

      drawTarget(sim.target);
      for (const m of sim.missiles) drawMissile(m);
      drawHud(sim);
    },
  };
}
