/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * PEANO CURVE ALGORITHM
 *
 * A space-filling fractal curve discovered by Giuseppe Peano in 1890.
 * Unlike the Hilbert curve which divides space into 4 regions (2x2),
 * the Peano curve divides space into 9 regions (3x3 grid).
 *
 * The curve follows a specific recursive pattern that ensures:
 * - Complete coverage of the square area at infinite recursion
 * - Continuous path without jumps
 * - Self-similar fractal structure
 *
 * Algorithm approach:
 * 1. Divide the current square into 9 equal subsquares (3x3 grid)
 * 2. Visit each subsquare in a specific order that maintains continuity
 * 3. Recursively apply the pattern to each subsquare
 * 4. Use rotation/reflection to ensure the path connects properly
 */

export type BoundingBox = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
};

type PatternEntry = readonly [row: number, col: number, newOrientation: number];
type Pattern = readonly [
  PatternEntry,
  PatternEntry,
  PatternEntry,
  PatternEntry,
  PatternEntry,
  PatternEntry,
  PatternEntry,
  PatternEntry,
  PatternEntry,
];
type Patterns = readonly [Pattern, Pattern, Pattern, Pattern];

/**
 * Generate the Peano curve path
 *
 * @param x - Starting x coordinate
 * @param y - Starting y coordinate
 * @param size - Size of the current square
 * @param order - Current recursion level (higher = more detail, 1-5 recommended)
 * @param orientation - Rotation state (0-3), optional
 * @returns Array of p5.Vector points forming the curve
 *
 * @example
 * // Generate a Peano curve of order 3
 * const points = generatePeanoCurve(0, 0, 400, 3);
 * // Use the points to draw the curve
 */
export function generatePeanoCurve(
  x: number,
  y: number,
  size: number,
  order: number,
  orientation: number = 0,
): readonly p5.Vector[] {
  const points: p5.Vector[] = [];

  if (order === 0) {
    // Base case: return center point
    points.push(createVector(x + size / 2, y + size / 2));
    return points;
  }

  // Size of each subsquare in the 3x3 grid
  const step: number = size / 3;

  // The Peano curve visits 9 subsquares in a specific pattern
  // Pattern depends on orientation to ensure path continuity
  const patterns: Patterns = [
    // Orientation 0: Standard Peano pattern (bottom-left to top-right)
    [
      [0, 2, 0] as const,
      [0, 1, 1] as const,
      [0, 0, 0] as const,
      [1, 0, 1] as const,
      [1, 1, 2] as const,
      [1, 2, 1] as const,
      [2, 2, 0] as const,
      [2, 1, 1] as const,
      [2, 0, 0] as const,
    ] as const,
    // Orientation 1: 90° counter-clockwise rotation
    [
      [2, 0, 1] as const,
      [1, 0, 2] as const,
      [0, 0, 1] as const,
      [0, 1, 0] as const,
      [1, 1, 3] as const,
      [2, 1, 0] as const,
      [2, 2, 1] as const,
      [1, 2, 2] as const,
      [0, 2, 1] as const,
    ] as const,
    // Orientation 2: 180° rotation
    [
      [2, 0, 2] as const,
      [2, 1, 3] as const,
      [2, 2, 2] as const,
      [1, 2, 3] as const,
      [1, 1, 0] as const,
      [1, 0, 3] as const,
      [0, 0, 2] as const,
      [0, 1, 3] as const,
      [0, 2, 2] as const,
    ] as const,
    // Orientation 3: 90° clockwise rotation
    [
      [0, 2, 3] as const,
      [1, 2, 0] as const,
      [2, 2, 3] as const,
      [2, 1, 2] as const,
      [1, 1, 1] as const,
      [0, 1, 2] as const,
      [0, 0, 3] as const,
      [1, 0, 0] as const,
      [2, 0, 3] as const,
    ] as const,
  ] as const;

  const patternIndex = orientation % 4;
  const pattern: Pattern = patterns[patternIndex]!;

  // Generate points for each subsquare in the pattern
  for (let i = 0; i < 9; i++) {
    const patternEntry: PatternEntry = pattern[i]!;
    const [row, col, newOrientation]: PatternEntry = patternEntry;
    const subX: number = x + col * step;
    const subY: number = y + row * step;

    const subPoints: readonly p5.Vector[] = generatePeanoCurve(
      subX,
      subY,
      step,
      order - 1,
      newOrientation,
    );

    points.push(...subPoints);
  }

  return points;
}

/**
 * Calculate the total number of points for a given order
 *
 * @param order - Recursion depth
 * @returns Number of points (9^order)
 *
 * @example
 * calculatePointCount(2); // Returns 81 (9^2)
 */
export function calculatePointCount(order: number): number {
  return Math.pow(9, order);
}

/**
 * Get bounding box for a set of points
 *
 * Calculates the minimum bounding rectangle that contains all points,
 * useful for centering or scaling the curve.
 *
 * @param points - Array of p5.Vector points
 * @returns Bounding box with minX, minY, maxX, maxY, width, height
 * @returns null if points array is empty
 *
 * @example
 * const points = generatePeanoCurve(0, 0, 400, 3);
 * const bbox = getBoundingBox(points);
 * if (bbox) {
 *   console.log(`Curve size: ${bbox.width}x${bbox.height}`);
 * }
 */
export function getBoundingBox(points: readonly p5.Vector[]): BoundingBox | null {
  if (points.length === 0) return null;

  let minX: number = Infinity;
  let minY: number = Infinity;
  let maxX: number = -Infinity;
  let maxY: number = -Infinity;

  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}
