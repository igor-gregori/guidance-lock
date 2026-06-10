import { vec2, add, sub, scale, normalize, distance } from '../math/vector';
const MAX_TRAIL = 500;
const WAYPOINT_THRESHOLD = 10;
export function createTarget(config) {
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
export function updateTarget(target, dt, mousePos) {
    if (!target.alive)
        return;
    if (target.mode === 'mouse' && mousePos) {
        const dir = sub(mousePos, target.pos);
        const dist = distance(mousePos, target.pos);
        if (dist > 1) {
            target.vel = scale(normalize(dir), Math.min(target.speed, dist / dt));
        }
        else {
            target.vel = vec2(0, 0);
        }
    }
    else if (target.waypoints.length > 0) {
        const wp = target.waypoints[target.waypointIndex];
        const dir = sub(wp.pos, target.pos);
        if (distance(wp.pos, target.pos) < WAYPOINT_THRESHOLD) {
            target.waypointIndex = (target.waypointIndex + 1) % target.waypoints.length;
        }
        target.vel = scale(normalize(dir), target.speed);
    }
    target.pos = add(target.pos, scale(target.vel, dt));
    target.trail.push({ ...target.pos });
    if (target.trail.length > MAX_TRAIL)
        target.trail.shift();
}
