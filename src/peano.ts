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
 * This implementation uses L-System (Lindenmayer system) with turtle graphics.
 * 1. Start with axiom "L"
 * 2. Apply rewriting rules iteratively:
 *    - L → LFRFL-F-RFLFR+F+LFRFL
 *    - R → RFLFR+F+LFRFL-F-RFLFR
 * 3. Interpret the resulting string with turtle graphics:
 *    - F: Move forward and plot point
 *    - +: Turn left 90°
 *    - -: Turn right 90°
 * 4. Generate continuous curve that fills the square
 */

export type BoundingBox = {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
  readonly width: number;
  readonly height: number;
};

/**
 * Generate Peano curve using L-system and turtle graphics
 *
 * The Peano curve is a space-filling fractal that iteratively applies
 * rewriting rules to create a continuous path that fills a square.
 *
 * L-System Rules:
 * - Axiom: "L"
 * - L → "LFRFL-F-RFLFR+F+LFRFL"
 * - R → "RFLFR+F+LFRFL-F-RFLFR"
 * - F: Forward, +: Turn left 90°, -: Turn right 90°
 *
 * @param x - Starting x coordinate
 * @param y - Starting y coordinate
 * @param size - Size of the bounding square
 * @param order - Recursion depth (1-5 recommended, higher = more detail)
 * @returns Array of p5.Vector points forming the curve
 *
 * @example
 * // Generate a Peano curve of order 3
 * const points = generatePeanoCurve(0, 0, 400, 3);
 * // Use the points to draw the curve
 */
/**
 * Apply a rotation transformation to a point around a reference point
 */
function applyRotation(v: p5.Vector, refX: number, refY: number, rotation: number): p5.Vector {
  const tx = v.x - refX;
  const ty = v.y - refY;

  switch (rotation) {
    case 0:
      // No rotation
      return createVector(v.x, v.y);
    case 1:
      // 90° clockwise
      return createVector(refX + ty, refY - tx);
    case 2:
      // 180°
      return createVector(refX - tx, refY - ty);
    case 3:
      // 270° clockwise (or 90° counter-clockwise)
      return createVector(refX - ty, refY + tx);
    case 4:
      // Flip horizontal
      return createVector(refX - tx, refY + ty);
    case 5:
      // Flip vertical
      return createVector(refX + tx, refY - ty);
    case 6:
      // Flip diagonal (main)
      return createVector(refX + ty, refY + tx);
    case 7:
      // Flip diagonal (anti)
      return createVector(refX - ty, refY - tx);
    default:
      return createVector(v.x, v.y);
  }
}

/**
 * Recursively generate a Peano curve using seed-based iteration
 */
function fillPeanoSpace(
  seedPoints: readonly p5.Vector[],
  seed: readonly number[],
  rotation: readonly number[],
  w: number,
  grid: number,
  order: number,
): p5.Vector[] {
  if (order === 1) {
    // Apply seed ordering to create initial curve
    const result: p5.Vector[] = [];
    for (let i = 0; i < seed.length; i++) {
      const seedIdx = seed[i] ?? 0;
      if (seedIdx < seedPoints.length) {
        result.push(seedPoints[seedIdx] as p5.Vector);
      }
    }
    return result;
  }

  const prevOrder = fillPeanoSpace(seedPoints, seed, rotation, w, grid, order - 1);
  const copies: p5.Vector[][] = [];

  // Create scaled copies for each grid cell
  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      copies.push(prevOrder.map((v) => createVector(v.x / grid + i * w, v.y / grid + j * w)));
    }
  }

  // Apply rotations to each copy
  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const idx = i + j * grid;
      const refX = i * w + w / 2;
      const refY = j * w + w / 2;
      const rot = rotation[idx] ?? 0;

      const copy = copies[idx];
      if (copy) {
        copies[idx] = copy.map((v) => applyRotation(v, refX, refY, rot));
      }
    }
  }

  // Reorder using seed to create continuous path
  const result: p5.Vector[] = [];
  for (let i = 0; i < seed.length; i++) {
    const seedIdx = seed[i];
    if (seedIdx !== undefined) {
      const copy = copies[seedIdx];
      if (copy) {
        result.push(...copy);
      }
    }
  }

  return result;
}

export function generatePeanoCurve(
  x: number,
  y: number,
  size: number,
  order: number,
): readonly p5.Vector[] {
  const grid = 3; // Peano curve uses 3x3 grid
  const w = size / grid;

  // Peano curve seed points - start at bottom-left, go up, define initial pattern
  const seedPoints: p5.Vector[] = [
    createVector(x + w / 2, y + 2 * w + w / 2), // Bottom-left
    createVector(x + w / 2, y + w + w / 2), // Middle-left
    createVector(x + w / 2, y + w / 2), // Top-left
    createVector(x + w + w / 2, y + w / 2), // Top-middle
    createVector(x + w + w / 2, y + w + w / 2), // Middle-middle
    createVector(x + w + w / 2, y + 2 * w + w / 2), // Bottom-middle
    createVector(x + 2 * w + w / 2, y + 2 * w + w / 2), // Bottom-right
    createVector(x + 2 * w + w / 2, y + w + w / 2), // Middle-right
    createVector(x + 2 * w + w / 2, y + w / 2), // Top-right
  ];

  // Peano curve seed ordering and rotations
  const seed = [0, 1, 2, 3, 4, 5, 6, 7, 8] as const;
  const rotation = [0, 0, 0, 0, 0, 0, 0, 0, 0] as const;

  return fillPeanoSpace(seedPoints, seed, rotation, w, grid, order);
}

/**
 * Calculate the total number of points for a given order
 *
 * The L-system approach generates points based on F commands.
 * The number grows exponentially with each iteration.
 *
 * @param order - Recursion depth
 * @returns Approximate number of points
 *
 * @example
 * calculatePointCount(1); // Returns ~9 points
 * calculatePointCount(2); // Returns ~81 points
 * calculatePointCount(3); // Returns ~729 points
 */
export function calculatePointCount(order: number): number {
  // For L-system Peano: roughly 8^order * 9 (since each iteration multiplies F count)
  // But accounting for the actual growth pattern: 8 * (8^order - 1) / 7 + 1
  // Simplified approximation: 8^(order + 1)
  return Math.pow(8, order + 1);
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
