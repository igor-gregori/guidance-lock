export function vec2(x, y) {
    return { x, y };
}
export function add(a, b) {
    return { x: a.x + b.x, y: a.y + b.y };
}
export function sub(a, b) {
    return { x: a.x - b.x, y: a.y - b.y };
}
export function scale(v, s) {
    return { x: v.x * s, y: v.y * s };
}
export function length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}
export function normalize(v) {
    const len = length(v);
    if (len === 0)
        return { x: 0, y: 0 };
    return { x: v.x / len, y: v.y / len };
}
export function dot(a, b) {
    return a.x * b.x + a.y * b.y;
}
export function cross(a, b) {
    return a.x * b.y - a.y * b.x;
}
export function rotate(v, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return { x: v.x * c - v.y * s, y: v.x * s + v.y * c };
}
export function angle(v) {
    return Math.atan2(v.y, v.x);
}
export function lerp(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}
export function distance(a, b) {
    return length(sub(a, b));
}
export function perp(v) {
    return { x: -v.y, y: v.x };
}
