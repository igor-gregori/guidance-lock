import { sub, normalize, scale, length } from '../math/vector';
import { GuidanceFn } from './types';

export const purePursuit: GuidanceFn = (input) => {
  const toTarget = normalize(sub(input.targetPos, input.missilePos));
  const speed = length(input.missileVel);
  const steer = sub(scale(toTarget, speed), input.missileVel);
  const steerMag = length(steer);
  if (steerMag === 0) return { acceleration: { x: 0, y: 0 } };
  return { acceleration: scale(normalize(steer), speed * 2) };
};
