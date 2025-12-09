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
export function generatePeanoCurve(
  x: number,
  y: number,
  size: number,
  order: number,
): readonly p5.Vector[] {
  // Generate L-system string
  let lsystem = 'L';
  for (let i = 0; i < order; i++) {
    lsystem = lsystem.replace(/L/g, 'LFRFL-F-RFLFR+F+LFRFL').replace(/R/g, 'RFLFR+F+LFRFL-F-RFLFR');
  }

  // Generate curve relative to origin with unit step size
  const curvePoints: p5.Vector[] = [];
  let px = 0;
  let py = 0;
  curvePoints.push(createVector(px, py));

  let angle = -Math.PI / 2; // Start pointing down
  const unitStep = 1; // Use unit step for initial generation

  for (const char of lsystem) {
    if (char === 'F') {
      // Move forward
      px += unitStep * Math.cos(angle);
      py -= unitStep * Math.sin(angle);
      curvePoints.push(createVector(px, py));
    } else if (char === '+') {
      // Turn left 90°
      angle += Math.PI / 2;
    } else if (char === '-') {
      // Turn right 90°
      angle -= Math.PI / 2;
    }
  }

  // Calculate bounding box of generated curve
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const p of curvePoints) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  // Scale and translate to fit into the desired bounding box
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  const scale = Math.min(size / width, size / height);

  const points: p5.Vector[] = [];
  for (const p of curvePoints) {
    const scaledX = (p.x - minX) * scale;
    const scaledY = (p.y - minY) * scale;
    points.push(createVector(x + scaledX, y + scaledY));
  }

  return points;
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
