import { Vec2 } from '../math/vector';

export type GuidanceType = 'pure-pursuit' | 'lead-pursuit' | 'proportional-nav' | 'augmented-pn';

export interface GuidanceInput {
  missilePos: Vec2;
  missileVel: Vec2;
  targetPos: Vec2;
  targetVel: Vec2;
  dt: number;
}

export interface GuidanceOutput {
  acceleration: Vec2;
}

export type GuidanceFn = (input: GuidanceInput) => GuidanceOutput;
