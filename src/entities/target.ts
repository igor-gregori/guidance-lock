import { Vec2, vec2, add, sub, scale, normalize, distance } from '../math/vector';

export type TargetMode = 'waypoints' | 'mouse' | 'keyboard';

export interface Waypoint {
  pos: Vec2;
}

export interface TargetState {
  pos: Vec2;
  vel: Vec2;
  speed: number;
  mode: TargetMode;
  waypoints: Waypoint[];
  waypointIndex: number;
  trail: Vec2[];
  alive: boolean;
}

export interface TargetConfig {
  pos: Vec2;
  speed: number;
  waypoints: Waypoint[];
}

const MAX_TRAIL = 500;
const WAYPOINT_THRESHOLD = 10;

export function createTarget(config: TargetConfig): TargetState {
  return {
    pos: { ...config.pos },
    vel: vec2(0, 0),
    speed: config.speed,
    mode: 'waypoints',
    waypoints: config.waypoints,
    waypointIndex: 0,
    trail: [{ ...config.pos }],
    alive: true,
  };
}

export function updateTarget(target: TargetState, dt: number, mousePos?: Vec2, keyDir?: Vec2) {
  if (!target.alive) return;

  if (target.mode === 'keyboard' && keyDir) {
    const len = Math.sqrt(keyDir.x * keyDir.x + keyDir.y * keyDir.y);
    if (len > 0) {
      target.vel = scale(normalize(keyDir), target.speed);
    } else {
      target.vel = vec2(0, 0);
    }
  } else if (target.mode === 'mouse' && mousePos) {
    const dir = sub(mousePos, target.pos);
    const dist = distance(mousePos, target.pos);
    if (dist > 1) {
      target.vel = scale(normalize(dir), Math.min(target.speed, dist / dt));
    } else {
      target.vel = vec2(0, 0);
    }
  } else if (target.waypoints.length > 0) {
    const wp = target.waypoints[target.waypointIndex];
    const dir = sub(wp.pos, target.pos);
    if (distance(wp.pos, target.pos) < WAYPOINT_THRESHOLD) {
      target.waypointIndex = (target.waypointIndex + 1) % target.waypoints.length;
    }
    target.vel = scale(normalize(dir), target.speed);
  }

  target.pos = add(target.pos, scale(target.vel, dt));
  target.trail.push({ ...target.pos });
  if (target.trail.length > MAX_TRAIL) target.trail.shift();
}
