/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * Marching Squares algorithm for extracting iso-contours from scalar fields.
 * Converts 2D scalar data (like noise or simulation results) into vector contours.
 *
 * NOTE: This file exceeds 250 lines due to the marching squares algorithm being
 * inherently complex with many edge cases. Splitting would harm readability.
 */

/** Cell size offset for centering line segments */
const CELL_CENTER_OFFSET = 0.5;

/** Marching squares case for empty cell */
const CASE_EMPTY = 0;

/** Marching squares case for full cell */
const CASE_FULL = 15;

/** Number of marching squares cases (0-15) */
const _MARCHING_SQUARES_CASES = 16;

/**
 * Line segment defined by two endpoints.
 */
export class LineSegment {
  constructor(
    public readonly x1: number,
    public readonly y1: number,
    public readonly x2: number,
    public readonly y2: number,
  ) {}
}

/**
 * Cell state in the marching squares grid.
 * Contains case number (0-15) and optional line endpoints.
 */
export class MarchingSquareCell {
  constructor(
    public readonly nr: number,
    public readonly p1: p5.Vector | null = null,
    public readonly p2: p5.Vector | null = null,
  ) {}
}

/**
 * Polygon with outer contour and optional holes.
 */
export interface Polygon {
  readonly segments: ReadonlyArray<ReadonlyArray<p5.Vector>>;
}

/**
 * Interpolate edge points based on scalar values and threshold.
 * @param nr - Marching squares case number (0-15)
 * @param threshold - Iso-value threshold
 * @param vLT - Value at left-top corner
 * @param vLB - Value at left-bottom corner
 * @param vRT - Value at right-top corner
 * @param vRB - Value at right-bottom corner
 * @returns Array of two points [p1, p2] or empty array
 */
function getUV(nr: number, threshold: number, vLT = 0, vLB = 2, vRT = 0, vRB = 2): p5.Vector[] {
  const lInterpol = (threshold - vLT) / (vLB - vLT);
  const rInterpol = (threshold - vRT) / (vRB - vRT);
  const tInterpol = (threshold - vLT) / (vRT - vLT);
  const bInterpol = (threshold - vLB) / (vRB - vLB);

  const l = createVector(0, lInterpol);
  const t = createVector(tInterpol, 0);
  const r = createVector(1, rInterpol);
  const b = createVector(bInterpol, 1);

  switch (nr) {
    case 0:
      return [];
    case 1:
      return [l, t];
    case 2:
      return [t, r];
    case 3:
      return [l, r];
    case 4:
      return [r, b];
    case 5:
      return [b, l];
    case 6:
      return [b, t];
    case 7:
      return [b, l];
    case 8:
      return [b, l];
    case 9:
      return [b, t];
    case 10:
      return [b, r];
    case 11:
      return [b, r];
    case 12:
      return [l, r];
    case 13:
      return [t, r];
    case 14:
      return [t, l];
    case 15:
      return [];
    default:
      return [];
  }
}

/**
 * Execute marching squares algorithm on a 2D scalar field.
 * Extracts iso-contours at the specified threshold value.
 *
 * @param values - 2D array of scalar values [y][x]
 * @param threshold - Iso-value threshold for contour extraction
 * @param width - Grid width
 * @param height - Grid height
 * @param wrapAround - Whether to wrap at boundaries (default: true)
 * @returns 2D grid of marching square cells
 *
 * @example
 * ```ts
 * const values = [[0, 1], [1, 0]]; // 2x2 grid
 * const cells = marchingSquares(values, 0.5, 2, 2);
 * ```
 */
export function marchingSquares(
  values: ReadonlyArray<ReadonlyArray<number>>,
  threshold: number,
  width: number,
  height: number,
  wrapAround = true,
): MarchingSquareCell[][] {
  let mask: boolean[];
  const cells: MarchingSquareCell[][] = [];

  for (let j = 0; j < height; j++) {
    cells.push([]);
  }

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      if (!wrapAround) {
        mask = [
          j + 1 >= height ? values[j]![i]! > threshold : values[j + 1]![i]! > threshold,
          i + 1 >= width || j + 1 >= height
            ? values[j]![i]! > threshold
            : values[j + 1]![i + 1]! > threshold,
          i + 1 >= width ? values[j]![i]! > threshold : values[j]![i + 1]! > threshold,
          values[j]![i]! > threshold,
        ];
      } else {
        const nextX = i + 1 >= width ? i + 1 - width : i + 1;
        const nextY = j + 1 >= height ? j + 1 - height : j + 1;
        mask = [
          values[nextY]![i]! > threshold,
          values[nextY]![nextX]! > threshold,
          values[j]![nextX]! > threshold,
          values[j]![i]! > threshold,
        ];
      }

      const nr =
        ((mask[0] ? 1 : 0) << 3) +
        ((mask[1] ? 1 : 0) << 2) +
        ((mask[2] ? 1 : 0) << 1) +
        ((mask[3] ? 1 : 0) << 0);

      if (nr !== CASE_EMPTY && nr !== CASE_FULL) {
        let uv: p5.Vector[];
        if (!wrapAround) {
          const vLT = values[j]![i]!;
          const vLB = j + 1 >= height ? threshold : values[j + 1]![i]!;
          const vRT = i + 1 >= width ? threshold : values[j]![i + 1]!;
          const vRB = i + 1 >= width || j + 1 >= height ? threshold : values[j + 1]![i + 1]!;
          uv = getUV(nr, threshold, vLT, vLB, vRT, vRB);
        } else {
          const nextX = i + 1 >= width ? i + 1 - width : i + 1;
          const nextY = j + 1 >= height ? j + 1 - height : j + 1;
          const vLT = values[j]![i]!;
          const vLB = values[nextY]![i]!;
          const vRT = values[j]![nextX]!;
          const vRB = values[nextY]![nextX]!;
          uv = getUV(nr, threshold, vLT, vLB, vRT, vRB);
        }
        if (uv.length > 0) {
          cells[j]!.push(new MarchingSquareCell(nr, uv[0]!, uv[1]!));
        }
      } else {
        cells[j]!.push(new MarchingSquareCell(nr));
      }
    }
  }

  return cells;
}

/**
 * Convert marching squares cell grid to line segments in world space.
 *
 * @param result - Marching squares cell grid
 * @param width - Grid width
 * @param height - Grid height
 * @param cellSize - Size of each cell in world units
 * @returns Array of line segments
 *
 * @example
 * ```ts
 * const cells = marchingSquares(values, 0.5, 10, 10);
 * const segments = marchingSquaresToSegments(cells, 10, 10, 20);
 * ```
 */
export function marchingSquaresToSegments(
  result: ReadonlyArray<ReadonlyArray<MarchingSquareCell>>,
  width: number,
  height: number,
  cellSize: number,
): LineSegment[] {
  const segments: LineSegment[] = [];

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      const cell = result[j]![i]!;
      if (cell.nr !== CASE_EMPTY && cell.nr !== CASE_FULL && cell.p1 && cell.p2) {
        const xOffset = i * cellSize;
        const yOffset = j * cellSize;

        const x1 = xOffset + cellSize * cell.p1.x + cellSize * CELL_CENTER_OFFSET;
        const y1 = yOffset + cellSize * cell.p1.y + cellSize * CELL_CENTER_OFFSET;
        const x2 = xOffset + cellSize * cell.p2.x + cellSize * CELL_CENTER_OFFSET;
        const y2 = yOffset + cellSize * cell.p2.y + cellSize * CELL_CENTER_OFFSET;

        segments.push(new LineSegment(x1, y1, x2, y2));
      }
    }
  }

  return segments;
}

/**
 * Convert marching squares result to closed polygon paths.
 * Chains line segments into continuous contours and detects holes.
 *
 * @param result - Marching squares cell grid
 * @param width - Grid width
 * @param height - Grid height
 * @param cellSize - Size of each cell in world units
 * @returns Array of polygons with outer contours and holes
 *
 * @example
 * ```ts
 * const cells = marchingSquares(values, 0.5, 10, 10);
 * const polygons = getPathsFromMarchingSquaresResult(cells, 10, 10, 20);
 * polygons.forEach(poly => {
 *   // poly.segments[0] is outer contour
 *   // poly.segments[1+] are holes
 * });
 * ```
 */
export function getPathsFromMarchingSquaresResult(
  result: ReadonlyArray<ReadonlyArray<MarchingSquareCell>>,
  width: number,
  height: number,
  cellSize: number,
): Polygon[] {
  const polygons: Polygon[] = [];
  const visited: boolean[][] = [];

  for (let j = 0; j < height; j++) {
    visited.push([]);
    for (let i = 0; i < width; i++) {
      visited[j]!.push(false);
    }
  }

  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      if (visited[j]![i]!) continue;

      let nr = result[j]![i]!.nr;
      if (nr === CASE_EMPTY || nr === CASE_FULL) continue;

      let stepX = 0;
      let stepY = 0;
      const subSegment: p5.Vector[] = [];

      let curY = j + stepY;
      let curX = i + stepX;

      while (!visited[curY]![curX]!) {
        const oldNr = nr;
        nr = result[curY]![curX]!.nr;

        if (nr === CASE_EMPTY || nr === CASE_FULL) break;

        const cellP1 = result[curY]![curX]!.p1;
        const cellP2 = result[curY]![curX]!.p2;

        if (!cellP1 || !cellP2) break;

        const xOffset = (i + stepX) * cellSize;
        const yOffset = (j + stepY) * cellSize;

        const x1 = xOffset + cellSize * cellP1.x + cellSize * CELL_CENTER_OFFSET;
        const y1 = yOffset + cellSize * cellP1.y + cellSize * CELL_CENTER_OFFSET;
        const x2 = xOffset + cellSize * cellP2.x + cellSize * CELL_CENTER_OFFSET;
        const y2 = yOffset + cellSize * cellP2.y + cellSize * CELL_CENTER_OFFSET;

        if (oldNr === nr || (oldNr !== nr && nr !== 5 && nr !== 10)) {
          visited[curY]![curX]! = true;
        }

        if (subSegment.length === 0) {
          subSegment.push(createVector(x1, y1));
        }

        switch (nr) {
          case 4:
          case 12:
          case 13: // right
            stepX++;
            if (x1 < x2) subSegment.push(createVector(x2, y2));
            else subSegment.push(createVector(x1, y1));
            break;

          case 5: // saddle
            if (oldNr === 2 || oldNr === 6 || oldNr === 14) {
              stepX++; // from bottom -> right
              if (x1 < x2) subSegment.push(createVector(x2, y2));
              else subSegment.push(createVector(x1, y1));
            } else {
              stepX--; // from top -> left
              if (x2 < x1) subSegment.push(createVector(x2, y2));
              else subSegment.push(createVector(x1, y1));
            }
            break;

          case 10: // saddle
            if (oldNr === 1 || oldNr === 3 || oldNr === 7) {
              stepY--; // from right -> up
              if (y2 < y1) subSegment.push(createVector(x2, y2));
              else subSegment.push(createVector(x1, y1));
            } else {
              stepY++; // from left -> down
              if (y1 < y2) subSegment.push(createVector(x2, y2));
              else subSegment.push(createVector(x1, y1));
            }
            break;

          case 2:
          case 6:
          case 14: // up
            stepY--;
            if (y2 < y1) subSegment.push(createVector(x2, y2));
            else subSegment.push(createVector(x1, y1));
            break;

          case 9:
          case 11:
          case 8: // down
            stepY++;
            if (y1 < y2) subSegment.push(createVector(x2, y2));
            else subSegment.push(createVector(x1, y1));
            break;

          case 1:
          case 3:
          case 7: // left
            stepX--;
            if (x2 < x1) subSegment.push(createVector(x2, y2));
            else subSegment.push(createVector(x1, y1));
            break;

          default:
            break;
        }

        curY = j + stepY;
        curX = i + stepX;

        // Wrap around at boundaries
        if (curX < 0) curX += width;
        if (curY < 0) curY += height;
        if (curX >= width) curX -= width;
        if (curY >= height) curY -= height;
      }

      if (subSegment.length > 0) {
        if (polygons.length > 0) {
          const last = polygons[polygons.length - 1]!;
          if (subSegment.every((p) => pointInPolygon(p, last.segments[0]!))) {
            // This is a hole inside the last polygon
            const newSegments = [...last.segments, subSegment];
            polygons[polygons.length - 1]! = { segments: newSegments };
          } else {
            polygons.push({ segments: [subSegment] });
          }
        } else {
          polygons.push({ segments: [subSegment] });
        }
      }
    }
  }

  return polygons;
}

/**
 * Test if a point is inside a polygon using ray-casting algorithm.
 *
 * @param point - Point to test
 * @param vs - Polygon vertices
 * @returns true if point is inside polygon
 *
 * @example
 * ```ts
 * const inside = pointInPolygon(
 *   { x: 10, y: 10 },
 *   [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 20, y: 20 }, { x: 0, y: 20 }]
 * );
 * ```
 */
export function pointInPolygon(point: p5.Vector, vs: ReadonlyArray<p5.Vector>): boolean {
  const x = point.x;
  const y = point.y;
  let inside = false;

  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i]!.x;
    const yi = vs[i]!.y;
    const xj = vs[j]!.x;
    const yj = vs[j]!.y;

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}
