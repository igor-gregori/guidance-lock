import { sub, scale, normalize, length, cross, perp, dot } from '../math/vector';
const N = 4;
export function createAugmentedPN() {
    let prevVel = null;
    return (input) => {
        const los = sub(input.targetPos, input.missilePos);
        const losDist = length(los);
        if (losDist === 0)
            return { acceleration: { x: 0, y: 0 } };
        const relVel = sub(input.targetVel, input.missileVel);
        const losRate = cross(los, relVel) / (losDist * losDist);
        const speed = length(input.missileVel);
        const velPerp = normalize(perp(input.missileVel));
        let targetAcc = { x: 0, y: 0 };
        if (prevVel && input.dt > 0) {
            targetAcc = scale(sub(input.targetVel, prevVel), 1 / input.dt);
        }
        prevVel = { ...input.targetVel };
        const targetAccNormal = dot(targetAcc, velPerp);
        const accMag = N * speed * losRate + (N / 2) * targetAccNormal;
        return { acceleration: scale(velPerp, accMag) };
    };
}
