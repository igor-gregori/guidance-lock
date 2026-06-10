import { sub, scale, normalize, length, cross, perp } from '../math/vector';
import { GuidanceFn } from './types';

const N = 4;

export const proportionalNav: GuidanceFn = (input) => {
  const los = sub(input.targetPos, input.missilePos);
  const losDist = length(los);
  if (losDist === 0) return { acceleration: { x: 0, y: 0 } };

  const relVel = sub(input.targetVel, input.missileVel);
  const losRate = cross(los, relVel) / (losDist * losDist);
  const speed = length(input.missileVel);
  const accMag = N * speed * losRate;
  const velPerp = normalize(perp(input.missileVel));

  return { acceleration: scale(velPerp, accMag) };
};
