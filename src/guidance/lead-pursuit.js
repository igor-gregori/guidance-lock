import { sub, add, scale, normalize, length, distance } from '../math/vector';
export const leadPursuit = (input) => {
    const dist = distance(input.targetPos, input.missilePos);
    const closingSpeed = length(input.missileVel);
    if (closingSpeed === 0)
        return { acceleration: { x: 0, y: 0 } };
    const tGo = dist / closingSpeed;
    const predictedPos = add(input.targetPos, scale(input.targetVel, tGo));
    const toTarget = normalize(sub(predictedPos, input.missilePos));
    const speed = length(input.missileVel);
    const steer = sub(scale(toTarget, speed), input.missileVel);
    const steerMag = length(steer);
    if (steerMag === 0)
        return { acceleration: { x: 0, y: 0 } };
    return { acceleration: scale(normalize(steer), speed * 2) };
};
