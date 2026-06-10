import { vec2, add, scale, normalize, length } from '../math/vector';
const MAX_TRAIL = 500;
export function createMissile(config) {
    return {
        pos: { ...config.pos },
        vel: vec2(0, -config.speed),
        speed: config.speed,
        maxLateralAcc: config.maxLateralAcc,
        alive: true,
        trail: [{ ...config.pos }],
        guidanceType: config.guidanceType,
        color: config.color,
        totalAccUsed: 0,
    };
}
export function updateMissile(missile, guidanceFn, input, dt) {
    if (!missile.alive)
        return;
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
    if (missile.trail.length > MAX_TRAIL)
        missile.trail.shift();
}
