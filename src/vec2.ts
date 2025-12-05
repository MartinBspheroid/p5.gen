/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * 2D Vector utilities for geometric calculations and transformations.
 * All functions are pure and return new vectors without mutation.
 */

/** Default arc resolution in steps */
const DEFAULT_ARC_STEPS = 40;

/**
 * Generate discrete points along a circular arc.
 * Points are evenly spaced along the arc from startAngle to endAngle.
 *
 * @param center - Center point of the arc as p5.Vector
 * @param r - Radius of the arc
 * @param startAngle - Starting angle in radians
 * @param endAngle - Ending angle in radians
 * @param steps - Number of segments (default: 40)
 * @returns Array of p5.Vector points along the arc
 *
 * @example
 * ```ts
 * // Quarter circle from 0 to π/2
 * const points = arcPoints(createVector(100, 100), 50, 0, Math.PI / 2, 20);
 * ```
 */
export function arcPoints(
  center: p5.Vector,
  r: number,
  startAngle: number,
  endAngle: number,
  steps = DEFAULT_ARC_STEPS
): p5.Vector[] {
  const pts: p5.Vector[] = [];
  const cx = center.x;
  const cy = center.y;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = startAngle + (endAngle - startAngle) * t;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    pts.push(createVector(x, y));
  }

  return pts;
}
