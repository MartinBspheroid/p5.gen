/**
 * 2D Vector utilities for geometric calculations and transformations.
 * All functions are pure and return new vectors without mutation.
 */

/** 2D vector represented as a tuple [x, y] */
export type Vec2 = readonly [number, number];

/** Default arc resolution in steps */
const DEFAULT_ARC_STEPS = 40;

/** Minimum vector length to avoid division by zero */
const MIN_VECTOR_LENGTH = 1e-9;

/**
 * Collection of immutable 2D vector operations.
 * All methods return new vectors without modifying inputs.
 */
export const v2 = {
  /**
   * Add two vectors component-wise.
   * @param a - First vector
   * @param b - Second vector
   * @returns New vector representing a + b
   */
  add(a: Vec2, b: Vec2): Vec2 {
    const [ax, ay] = a;
    const [bx, by] = b;
    return [ax + bx, ay + by];
  },

  /**
   * Subtract vector b from vector a component-wise.
   * @param a - First vector
   * @param b - Second vector to subtract
   * @returns New vector representing a - b
   */
  sub(a: Vec2, b: Vec2): Vec2 {
    const [ax, ay] = a;
    const [bx, by] = b;
    return [ax - bx, ay - by];
  },

  /**
   * Scale a vector by a scalar value.
   * @param v - Vector to scale
   * @param s - Scalar multiplier
   * @returns New scaled vector
   */
  scale(v: Vec2, s: number): Vec2 {
    const [ax, ay] = v;
    return [ax * s, ay * s];
  },

  /**
   * Create a unit vector from an angle.
   * @param angle - Angle in radians (0 = right, π/2 = up)
   * @param len - Optional length (default: 1)
   * @returns Vector pointing in the given direction
   */
  fromAngle(angle: number, len = 1): Vec2 {
    return [Math.cos(angle) * len, Math.sin(angle) * len];
  },

  /**
   * Calculate the length (magnitude) of a vector.
   * @param v - Vector to measure
   * @returns Euclidean length of the vector
   */
  length(v: Vec2): number {
    const [x, y] = v;
    return Math.hypot(x, y);
  },

  /**
   * Normalize a vector to unit length.
   * Returns a zero-length vector if input is near zero.
   * @param v - Vector to normalize
   * @returns Unit vector in same direction, or zero vector if too small
   */
  normalize(v: Vec2): Vec2 {
    const len = v2.length(v) || MIN_VECTOR_LENGTH;
    return v2.scale(v, 1 / len);
  },

  /**
   * Rotate a vector by an angle around the origin.
   * @param v - Vector to rotate
   * @param angle - Rotation angle in radians (counter-clockwise)
   * @returns Rotated vector
   */
  rotate(v: Vec2, angle: number): Vec2 {
    const [x, y] = v;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [x * c - y * s, x * s + y * c];
  },
} as const;

/**
 * Generate discrete points along a circular arc.
 * Points are evenly spaced along the arc from startAngle to endAngle.
 *
 * @param center - Center point of the arc [x, y]
 * @param r - Radius of the arc
 * @param startAngle - Starting angle in radians
 * @param endAngle - Ending angle in radians
 * @param steps - Number of segments (default: 40)
 * @returns Array of points [x, y] along the arc
 *
 * @example
 * ```ts
 * // Quarter circle from 0 to π/2
 * const points = arcPoints([100, 100], 50, 0, Math.PI / 2, 20);
 * ```
 */
export function arcPoints(
  center: Vec2,
  r: number,
  startAngle: number,
  endAngle: number,
  steps = DEFAULT_ARC_STEPS
): Vec2[] {
  const pts: Vec2[] = [];
  const [cx, cy] = center;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = startAngle + (endAngle - startAngle) * t;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    pts.push([x, y]);
  }

  return pts;
}
