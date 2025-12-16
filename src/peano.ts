/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * PEANO CURVE ALGORITHM
 *
 * A space-filling fractal curve discovered by Giuseppe Peano in 1890.
 * This implementation uses an L-system (Lindenmayer system) approach.
 *
 * L-System Rules (Paul Bourke):
 * - Axiom: "X"
 * - X → XFYFX+F+YFXFY-F-XFYFX
 * - Y → YFXFY-F-XFYFX+F+YFXFY
 *
 * Turtle Graphics Interpretation:
 * - F: Move forward one unit
 * - +: Turn right 90 degrees
 * - -: Turn left 90 degrees
 * - X, Y: Placeholders (not rendered)
 *
 * Properties:
 * - Continuous path without jumps
 * - Self-similar fractal structure
 * - Fills a square area completely at infinite recursion
 * - 9-way subdivision pattern (3x3 grid)
 *
 * @see https://paulbourke.net/fractals/lsys/
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
 * L-System production rules for the Peano curve
 */
const PEANO_RULES: Record<string, string> = {
  X: 'XFYFX+F+YFXFY-F-XFYFX',
  Y: 'YFXFY-F-XFYFX+F+YFXFY',
};

/**
 * Generate L-system string by iteratively applying production rules
 *
 * @param axiom - Starting string
 * @param rules - Production rules mapping characters to replacement strings
 * @param iterations - Number of iterations to apply
 * @returns Final L-system string after all iterations
 */
function generateLSystem(axiom: string, rules: Record<string, string>, iterations: number): string {
  let current = axiom;

  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const ch of current) {
      if (rules[ch]) {
        next += rules[ch];
      } else {
        next += ch;
      }
    }
    current = next;
  }

  return current;
}

/**
 * Convert L-system commands to path points using turtle graphics
 *
 * @param commands - L-system string with F, +, - commands
 * @returns Array of points in arbitrary coordinate space
 */
function buildPath(commands: string): Array<{ x: number; y: number }> {
  let x = 0;
  let y = 0;
  let angle = 0; // 0 = right, 90 = down, etc.
  const RAD = Math.PI / 180;

  const points: Array<{ x: number; y: number }> = [];
  points.push({ x, y });

  for (const c of commands) {
    if (c === 'F') {
      x += Math.cos(angle * RAD);
      y += Math.sin(angle * RAD);
      points.push({ x, y });
    } else if (c === '+') {
      angle += 90;
    } else if (c === '-') {
      angle -= 90;
    }
    // X, Y are placeholders - ignored during rendering
  }

  return points;
}

/**
 * Normalize path points to fit within a target bounding box
 *
 * @param pts - Raw path points
 * @param targetX - Target top-left X coordinate
 * @param targetY - Target top-left Y coordinate
 * @param targetSize - Target size (width and height)
 * @param margin - Margin to leave around the edges
 * @returns Normalized points as p5.Vector array
 */
function normalizePath(
  pts: Array<{ x: number; y: number }>,
  targetX: number,
  targetY: number,
  targetSize: number,
  margin: number,
): p5.Vector[] {
  if (pts.length === 0) return [];

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const w = maxX - minX;
  const h = maxY - minY;

  // Scale to fit within target size minus margins
  const availableSize = targetSize - 2 * margin;
  const scale = Math.min(availableSize / w, availableSize / h);

  // Center the curve within the target area
  const scaledW = w * scale;
  const scaledH = h * scale;
  const offsetX = targetX + margin + (availableSize - scaledW) / 2;
  const offsetY = targetY + margin + (availableSize - scaledH) / 2;

  const result: p5.Vector[] = [];
  for (const p of pts) {
    const nx = (p.x - minX) * scale + offsetX;
    const ny = (p.y - minY) * scale + offsetY;
    result.push(createVector(nx, ny));
  }

  return result;
}

/**
 * Generate Peano curve using L-system approach
 *
 * The Peano curve is a space-filling fractal that creates a continuous
 * path filling a square area. This implementation uses Lindenmayer system
 * production rules with turtle graphics interpretation.
 *
 * @param x - Starting x coordinate (top-left corner)
 * @param y - Starting y coordinate (top-left corner)
 * @param size - Size of the bounding square
 * @param order - Recursion depth (1-4 recommended, higher = more detail)
 * @returns Array of p5.Vector points forming the curve
 *
 * @example
 * // Generate a Peano curve of order 3
 * const points = generatePeanoCurve(0, 0, 400, 3);
 * // Use the points to draw the curve
 * beginShape();
 * for (const p of points) vertex(p.x, p.y);
 * endShape();
 */
export function generatePeanoCurve(
  x: number,
  y: number,
  size: number,
  order: number,
): readonly p5.Vector[] {
  // Generate L-system commands
  const commands = generateLSystem('X', PEANO_RULES, order);

  // Build path from turtle graphics interpretation
  const rawPath = buildPath(commands);

  // Normalize and scale to target bounding box
  const margin = size * 0.02; // 2% margin
  return normalizePath(rawPath, x, y, size, margin);
}

/**
 * Calculate the approximate number of points for a given order
 *
 * The L-system approach generates points based on F commands.
 * Each iteration roughly triples the number of segments in each dimension.
 *
 * @param order - Recursion depth
 * @returns Approximate number of points
 *
 * @example
 * calculatePointCount(1); // ~10 points
 * calculatePointCount(2); // ~82 points
 * calculatePointCount(3); // ~730 points
 */
export function calculatePointCount(order: number): number {
  // For Peano L-system: the number of F commands follows a pattern
  // At order n, approximately 3^(2n) points (since it's a 3x3 subdivision)
  // More precisely: (3^(2n) - 1) / 8 * 8 + 1 segments
  // Simplified: 9^n points approximately
  return Math.pow(9, order) + 1;
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
