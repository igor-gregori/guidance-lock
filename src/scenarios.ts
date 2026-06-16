import { Vec2, vec2 } from './math/vector';
import { Waypoint } from './entities/target';

export interface Scenario {
  name: string;
  targetStart: (w: number, h: number) => Vec2;
  waypoints: (w: number, h: number) => Waypoint[];
  targetSpeed: number;
}

export const scenarios: Scenario[] = [
  {
    name: 'Straight',
    targetSpeed: 200,
    targetStart: (w, h) => vec2(w * 0.1, h * 0.3),
    waypoints: (w, h) => [{ pos: vec2(w * 0.9, h * 0.3) }],
  },
  {
    name: 'Break Turn',
    targetSpeed: 220,
    targetStart: (w, h) => vec2(w * 0.2, h * 0.25),
    waypoints: (w, h) => [
      { pos: vec2(w * 0.6, h * 0.25) },
      { pos: vec2(w * 0.6, h * 0.7) },
    ],
  },
  {
    name: 'Jinking',
    targetSpeed: 200,
    targetStart: (w, h) => vec2(w * 0.15, h * 0.3),
    waypoints: (w, h) => [
      { pos: vec2(w * 0.3, h * 0.15) },
      { pos: vec2(w * 0.45, h * 0.45) },
      { pos: vec2(w * 0.6, h * 0.15) },
      { pos: vec2(w * 0.75, h * 0.45) },
      { pos: vec2(w * 0.9, h * 0.15) },
    ],
  },
  {
    name: 'S-Curve',
    targetSpeed: 190,
    targetStart: (w, h) => vec2(w * 0.15, h * 0.3),
    waypoints: (w, h) => [
      { pos: vec2(w * 0.4, h * 0.15) },
      { pos: vec2(w * 0.6, h * 0.5) },
      { pos: vec2(w * 0.85, h * 0.35) },
    ],
  },
  {
    name: 'Circular',
    targetSpeed: 180,
    targetStart: (w, h) => vec2(w * 0.5, h * 0.15),
    waypoints: (w, h) => {
      const cx = w * 0.5;
      const cy = h * 0.35;
      const r = Math.min(w, h) * 0.2;
      const pts: Waypoint[] = [];
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        pts.push({ pos: vec2(cx + Math.cos(a) * r, cy + Math.sin(a) * r) });
      }
      return pts;
    },
  },
  {
    name: 'Head-On',
    targetSpeed: 250,
    targetStart: (w, h) => vec2(w * 0.5, h * 0.05),
    waypoints: (w, h) => [{ pos: vec2(w * 0.5, h * 0.95) }],
  },
];
