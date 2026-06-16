import { Vec2, vec2, add, scale, normalize, length } from '../math/vector';
import { GuidanceType, GuidanceFn, GuidanceInput } from '../guidance/types';

export interface MissileState {
  pos: Vec2;
  vel: Vec2;
  speed: number;
  maxLateralAcc: number;
  alive: boolean;
  launched: boolean;
  launchDelay: number;
  trail: Vec2[];
  guidanceType: GuidanceType;
  color: string;
  totalAccUsed: number;
}

export interface MissileConfig {
  pos: Vec2;
  speed: number;
  maxLateralAcc: number;
  guidanceType: GuidanceType;
  color: string;
  guidanceFn: GuidanceFn;
  launchDelay: number;
}

const MAX_TRAIL = 500;

export function createMissile(config: MissileConfig): MissileState {
  return {
    pos: { ...config.pos },
    vel: vec2(0, -config.speed),
    speed: config.speed,
    maxLateralAcc: config.maxLateralAcc,
    alive: true,
    launched: config.launchDelay <= 0,
    launchDelay: config.launchDelay,
    trail: [{ ...config.pos }],
    guidanceType: config.guidanceType,
    color: config.color,
    totalAccUsed: 0,
  };
}

export function updateMissile(
  missile: MissileState,
  guidanceFn: GuidanceFn,
  input: GuidanceInput,
  dt: number
) {
  if (!missile.alive) return;

  const { acceleration } = guidanceFn(input);
  const accLen = length(acceleration);
  const clampedAcc = accLen > missile.maxLateralAcc
    ? scale(normalize(acceleration), missile.maxLateralAcc)
    : acceleration;

  missile.totalAccUsed += length(clampedAcc) * dt;
  missile.vel = add(missile.vel, scale(clampedAcc, dt));
  missile.vel = scale(normalize(missile.vel), missile.speed);
  missile.pos = add(missile.pos, scale(missile.vel, dt));

  missile.trail.push({ ...missile.pos });
  if (missile.trail.length > MAX_TRAIL) missile.trail.shift();
}
