import { distance } from './math/vector';
import { createMissile, updateMissile } from './entities/missile';
import { createTarget, updateTarget } from './entities/target';
const KILL_RADIUS = 8;
const FIXED_DT = 1 / 120;
export function createSimulation(missileConfigs, targetConfig, guidanceFns) {
    return {
        missiles: missileConfigs.map(createMissile),
        target: createTarget(targetConfig),
        time: 0,
        running: true,
        results: [],
        guidanceFns,
    };
}
export function stepSimulation(sim, mousePos) {
    if (!sim.running)
        return;
    updateTarget(sim.target, FIXED_DT, mousePos);
    for (let i = 0; i < sim.missiles.length; i++) {
        const m = sim.missiles[i];
        if (!m.alive)
            continue;
        const input = {
            missilePos: m.pos,
            missileVel: m.vel,
            targetPos: sim.target.pos,
            targetVel: sim.target.vel,
            dt: FIXED_DT,
        };
        updateMissile(m, sim.guidanceFns[i], input, FIXED_DT);
        const dist = distance(m.pos, sim.target.pos);
        if (dist < KILL_RADIUS) {
            m.alive = false;
            sim.results.push({
                guidanceType: m.guidanceType,
                hit: true,
                missDistance: 0,
                time: sim.time,
                totalAccUsed: m.totalAccUsed,
                color: m.color,
            });
        }
    }
    sim.time += FIXED_DT;
    if (sim.missiles.every((m) => !m.alive)) {
        sim.running = false;
    }
}
export function getFixedDt() {
    return FIXED_DT;
}
