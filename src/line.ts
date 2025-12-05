import { v2, type Vec2 } from "./vec2";

/**
 * Options for lerping points along a line.
 * Either specify the number of steps or the distance per step in pixels.
 */

export type LerpOptions =
  | { steps: number }
  | { pixelsPerStep: number };

/**
 * Calculates the Euclidean distance between two points.
 */
export function distance(p1: Vec2, p2: Vec2): number {
  return v2.length(v2.sub(p2, p1));
}

/**
 * Linearly interpolates between two points.
 */
export function lerp(p1: Vec2, p2: Vec2, t: number): Vec2 {
  const [x1, y1] = p1;
  const [x2, y2] = p2;
  return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
}

/**
 * Returns an array of points along a line defined by two points.
 * Includes both start and end points.
 *
 * @param start - The starting point of the line
 * @param end - The ending point of the line
 * @param options - Either { steps: number } or { pixelsPerStep: number }
 * @returns Array of points including start, interpolated points, and end
 *
 * @example
 * // Using step count (returns 6 points: start + 4 intermediate + end)
 * lerpLine([0, 0], [100, 0], { steps: 4 })
 *
 * @example
 * // Using pixels per step (spacing determined by distance)
 * lerpLine([0, 0], [100, 0], { pixelsPerStep: 25 })
 */
export function lerpLine(start: Vec2, end: Vec2, options: LerpOptions): Vec2[] {
  const points: Vec2[] = [];
  let stepCount: number;

  if ("steps" in options) {
    stepCount = options.steps;
  } else {
    const lineLength = distance(start, end);
    // Calculate steps based on pixels per step, ensuring at least 0 steps
    stepCount = Math.max(0, Math.floor(lineLength / options.pixelsPerStep));
  }

  // Total segments = steps + 1 (to include both start and end)
  const totalSegments = stepCount + 1;

  for (let i = 0; i <= totalSegments; i++) {
    const t = i / totalSegments;
    points.push(lerp(start, end, t));
  }

  return points;
}
