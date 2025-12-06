/**
 * Line interpolation utilities for p5.js.
 * All functions use p5.Vector for coordinates.
 */

/**
 * Options for lerping points along a line.
 * Either specify the number of steps or the distance per step in pixels.
 */

export type LerpOptions = { steps: number } | { pixelsPerStep: number };

/**
 * Calculates the Euclidean distance between two points.
 */
export function distance(p1: p5.Vector, p2: p5.Vector): number {
  return p5.Vector.sub(p2, p1).mag();
}

/**
 * Linearly interpolates between two points.
 */
export function lerp(p1: p5.Vector, p2: p5.Vector, t: number): p5.Vector {
  return p5.Vector.lerp(p1, p2, t);
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
export function lerpLine(start: p5.Vector, end: p5.Vector, options: LerpOptions): p5.Vector[] {
  const points: p5.Vector[] = [];
  let stepCount: number;

  if ('steps' in options) {
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
