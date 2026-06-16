import { Vec2, vec2, add, scale } from './math/vector';

export interface Particle {
  pos: Vec2;
  vel: Vec2;
  life: number;
  maxLife: number;
  color: string;
}

export interface ParticleSystem {
  particles: Particle[];
}

export function createParticleSystem(): ParticleSystem {
  return { particles: [] };
}

export function spawnExplosion(ps: ParticleSystem, pos: Vec2, color: string) {
  const count = 20;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
    const speed = 80 + Math.random() * 120;
    ps.particles.push({
      pos: { ...pos },
      vel: vec2(Math.cos(angle) * speed, Math.sin(angle) * speed),
      life: 0.6 + Math.random() * 0.4,
      maxLife: 1,
      color,
    });
  }
}

export function updateParticles(ps: ParticleSystem, dt: number) {
  for (let i = ps.particles.length - 1; i >= 0; i--) {
    const p = ps.particles[i];
    p.pos = add(p.pos, scale(p.vel, dt));
    p.vel = scale(p.vel, 0.96);
    p.life -= dt;
    if (p.life <= 0) ps.particles.splice(i, 1);
  }
}

export function drawParticles(ps: ParticleSystem, ctx: CanvasRenderingContext2D) {
  for (const p of ps.particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
