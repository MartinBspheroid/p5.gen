/**
 * Polygon clipping and hatching engine for pen plotter art.
 * Implements spatial hashing, boolean operations, and hatching patterns.
 * Inspired by Reinder Nijhoff and Lionel Lemarie's techniques.
 */

/** Spatial grid size for polygon bucketing */
const GRID_SIZE = 25;

/** World bounds for spatial grid */
const WORLD_BOUNDS = 200;

/** Half world bounds (center offset) */
const WORLD_CENTER_OFFSET = 100;

/** Large value for infinite bounds */
const INFINITE_BOUND = 1e5;

/** Small value for infinite negative bounds */
const NEGATIVE_INFINITE_BOUND = -1e5;

/** Ray-casting test point offset */
const RAY_TEST_OFFSET_X = 0.1;

/** Ray-casting test point offset Y (large negative) */
const RAY_TEST_OFFSET_Y = -1e3;

/** Minimum squared distance for segment deduplication */
const MIN_SEGMENT_DISTANCE_SQUARED = 0.001;

/** Hatching pattern offset multiplier */
const HATCH_OFFSET_MULTIPLIER = 200;

/** Hatching pattern start offset */
const HATCH_START_OFFSET = 0.5;

/** Hatching pattern max iterations divisor */
const HATCH_MAX_ITERATIONS = 150;

/** Midpoint calculation divisor */
const MIDPOINT_DIVISOR = 2;

/** Segment intersection lower bound */
const SEGMENT_INTERSECTION_MIN = 0;

/** Segment intersection upper bound */
const SEGMENT_INTERSECTION_MAX = 1;

/** Initial min value for AABB calculation */
const AABB_INITIAL_MIN = 1e5;

/** Initial max value for AABB calculation */
const AABB_INITIAL_MAX = -1e5;

/**
 * Get infinite polygon corners for hatching clip region.
 * Returns new vectors each time to avoid mutation issues.
 */
function getInfinitePolygonCorners(): p5.Vector[] {
  return [
    createVector(NEGATIVE_INFINITE_BOUND, NEGATIVE_INFINITE_BOUND),
    createVector(INFINITE_BOUND, NEGATIVE_INFINITE_BOUND),
    createVector(INFINITE_BOUND, INFINITE_BOUND),
    createVector(NEGATIVE_INFINITE_BOUND, INFINITE_BOUND),
  ];
}

/**
 * Axis-aligned bounding box [minX, minY, maxX, maxY].
 */
export type AABB = readonly [number, number, number, number];

/**
 * Draw function callback for rendering segments.
 */
export type DrawSegmentFunction = (p0: p5.Vector, p1: p5.Vector) => void;

/**
 * Polygon with contour points and drawable segments.
 * Supports clipping, hatching, and boolean operations.
 */
export class Poly {
  /** Contour points defining the polygon boundary */
  private cp: p5.Vector[] = [];

  /** Drawable segments (pairs of points) */
  private dp: p5.Vector[] = [];

  /** Axis-aligned bounding box */
  private aabb: AABB = [0, 0, 0, 0];

  /**
   * Add contour points to define polygon boundary.
   * @param pts - p5.Vector points to add
   */
  addPoints(...pts: p5.Vector[]): void {
    let minX = AABB_INITIAL_MIN;
    let maxX = AABB_INITIAL_MAX;
    let minY = AABB_INITIAL_MIN;
    let maxY = AABB_INITIAL_MAX;

    this.cp = [...this.cp, ...pts];
    this.cp.forEach((p) => {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    });
    this.aabb = [minX, minY, maxX, maxY];
  }

  /**
   * Add drawable line segments.
   * @param segs - Pairs of points defining segments
   */
  addSegments(...segs: p5.Vector[]): void {
    segs.forEach((s) => this.dp.push(s));
  }

  /**
   * Add polygon outline as drawable segments.
   * Connects contour points in order.
   */
  addOutline(): void {
    for (let i = 0, n = this.cp.length; i < n; i++) {
      this.dp.push(this.cp[i]!, this.cp[(i + 1) % n]!);
    }
  }

  /**
   * Draw all segments using provided callback.
   * @param drawSegment - Function to draw each segment
   */
  drawWith(drawSegment: DrawSegmentFunction): void {
    for (let i = 0; i < this.dp.length; i += 2) {
      const p0 = this.dp[i]!;
      const p1 = this.dp[i + 1]!;
      drawSegment(p0, p1);
    }
  }

  /**
   * Add hatching lines at specified angle and spacing.
   * Clips hatching lines to polygon boundary.
   *
   * @param angle - Hatching angle in radians
   * @param spacing - Distance between hatch lines
   */
  addHatching(angle: number, spacing: number): void {
    const clipPoly = new Poly();
    clipPoly.cp.push(...getInfinitePolygonCorners());

    const sa = Math.sin(angle) * spacing;
    const ca = Math.cos(angle) * spacing;
    const offsetX = HATCH_OFFSET_MULTIPLIER * Math.sin(angle);
    const offsetY = HATCH_OFFSET_MULTIPLIER * Math.cos(angle);

    for (let t = HATCH_START_OFFSET; t < HATCH_MAX_ITERATIONS / spacing; t++) {
      clipPoly.dp.push(
        createVector(sa * t + offsetX, ca * t - offsetY),
        createVector(sa * t - offsetX, ca * t + offsetY),
      );
      clipPoly.dp.push(
        createVector(-sa * t + offsetX, -ca * t - offsetY),
        createVector(-sa * t - offsetX, -ca * t + offsetY),
      );
    }

    clipPoly.boolean(this, false);
    this.dp = [...this.dp, ...clipPoly.dp];
  }

  /**
   * Test if a point is inside the polygon using ray-casting.
   * @param p - Point to test
   * @returns true if point is inside
   */
  inside(p: p5.Vector): boolean {
    let count = 0;
    for (let i = 0, n = this.cp.length; i < n; i++) {
      const a = this.cp[i]!;
      const b = this.cp[(i + 1) % n]!;
      if (this.segmentIntersect(p, createVector(RAY_TEST_OFFSET_X, RAY_TEST_OFFSET_Y), a, b)) {
        count++;
      }
    }
    return (count & 1) === 1;
  }

  /**
   * Perform boolean operation with another polygon.
   * Clips drawable segments against the other polygon's boundary.
   *
   * @param other - Polygon to clip against
   * @param keepInside - If true, keep segments inside other polygon
   * @returns true if any segments remain after clipping
   */
  boolean(other: Poly, keepInside = true): boolean {
    const resultSegs: p5.Vector[] = [];

    for (let i = 0, n = this.dp.length; i < n; i += 2) {
      const A = this.dp[i]!;
      const B = this.dp[i + 1]!;
      const intersections: p5.Vector[] = [];

      for (let j = 0, m = other.cp.length; j < m; j++) {
        const C = other.cp[j]!;
        const D = other.cp[(j + 1) % m]!;
        const pt = this.segmentIntersect(A, B, C, D);
        if (pt !== false) intersections.push(pt);
      }

      if (intersections.length === 0) {
        if (keepInside !== other.inside(A)) {
          resultSegs.push(A, B);
        }
      } else {
        intersections.push(A, B);
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        intersections.sort(
          (p1, p2) =>
            (p1.x - A.x) * dx + (p1.y - A.y) * dy - ((p2.x - A.x) * dx + (p2.y - A.y) * dy),
        );
        for (let k = 0; k < intersections.length - 1; k++) {
          const p1 = intersections[k]!;
          const p2 = intersections[k + 1]!;
          const mid = createVector(
            (p1.x + p2.x) / MIDPOINT_DIVISOR,
            (p1.y + p2.y) / MIDPOINT_DIVISOR,
          );
          if (
            (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 >= MIN_SEGMENT_DISTANCE_SQUARED &&
            keepInside !== other.inside(mid)
          ) {
            resultSegs.push(p1, p2);
          }
        }
      }
    }

    this.dp = resultSegs;
    return this.dp.length > 0;
  }

  /**
   * Calculate intersection point of two line segments.
   * @param A - First point of first segment
   * @param B - Second point of first segment
   * @param C - First point of second segment
   * @param D - Second point of second segment
   * @returns Intersection point or false if no intersection
   */
  private segmentIntersect(
    A: p5.Vector,
    B: p5.Vector,
    C: p5.Vector,
    D: p5.Vector,
  ): p5.Vector | false {
    const denom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
    if (denom === 0) return false;

    const uA = ((D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x)) / denom;
    const uB = ((B.x - A.x) * (A.y - C.y) - (B.y - A.y) * (A.x - C.x)) / denom;

    if (
      uA >= SEGMENT_INTERSECTION_MIN &&
      uA <= SEGMENT_INTERSECTION_MAX &&
      uB >= SEGMENT_INTERSECTION_MIN &&
      uB <= SEGMENT_INTERSECTION_MAX
    ) {
      return createVector(A.x + uA * (B.x - A.x), A.y + uA * (B.y - A.y));
    }
    return false;
  }

  /**
   * Get the axis-aligned bounding box.
   */
  get boundingBox(): AABB {
    return this.aabb;
  }
}

/**
 * Polygon manager with spatial hashing for efficient clipping.
 */
export interface PolygonManager {
  /** Get all registered polygons */
  list(): Poly[];

  /** Create a new polygon */
  create(): Poly;

  /**
   * Draw a polygon with automatic clipping against registered polygons.
   * @param drawFn - Function to draw each segment
   * @param polygon - Polygon to draw
   * @param register - Whether to register this polygon (default: true)
   */
  draw(drawFn: DrawSegmentFunction, polygon: Poly, register?: boolean): void;
}

/**
 * Create a new polygon manager with spatial hashing.
 * Efficiently manages multiple polygons with automatic clipping.
 *
 * @returns Polygon manager interface
 *
 * @example
 * ```ts
 * const polys = Polygons();
 * const p = polys.create();
 * p.addPoints(createVector(0, 0), createVector(100, 0), createVector(100, 100), createVector(0, 100));
 * p.addOutline();
 * p.addHatching(Math.PI / 4, 5);
 * polys.draw((p0, p1) => line(p0.x, p0.y, p1.x, p1.y), p);
 * ```
 */
export function Polygons(): PolygonManager {
  const polys: Poly[] = [];
  const bins: number[][] = Array.from({ length: GRID_SIZE ** 2 }, () => []);

  /**
   * Get polygons that potentially overlap with the given AABB.
   * Uses spatial hashing for efficient lookup.
   */
  function reducedPolygonList(aabb: AABB): Poly[] {
    const found: Record<number, number> = {};
    const cellSize = WORLD_BOUNDS / GRID_SIZE;

    for (let gx = 0; gx < GRID_SIZE; gx++) {
      const minX = gx * cellSize - WORLD_CENTER_OFFSET;
      const cell = [minX, 0, minX + cellSize, 0];

      if (!(aabb[2] < cell[0]! || aabb[0] > cell[2]!)) {
        for (let gy = 0; gy < GRID_SIZE; gy++) {
          const minY = gy * cellSize - WORLD_CENTER_OFFSET;
          cell[1] = minY;
          cell[3] = minY + cellSize;

          if (!(aabb[3] < cell[1]! || aabb[1] > cell[3]!)) {
            bins[gx + gy * GRID_SIZE]!.forEach((idx) => {
              const p = polys[idx]!;
              if (
                !(
                  aabb[3] < p.boundingBox[1] ||
                  aabb[1] > p.boundingBox[3] ||
                  aabb[2] < p.boundingBox[0] ||
                  aabb[0] > p.boundingBox[2]
                )
              ) {
                found[idx] = 1;
              }
            });
          }
        }
      }
    }

    return Object.keys(found).map((i) => polys[Number.parseInt(i)]!);
  }

  /**
   * Register a polygon in the spatial hash grid.
   */
  function registerPoly(p: Poly): void {
    polys.push(p);
    const idx = polys.length - 1;
    const cellSize = WORLD_BOUNDS / GRID_SIZE;

    bins.forEach((bucket, index) => {
      const gx = index % GRID_SIZE;
      const gy = (index / GRID_SIZE) | 0;
      const minX = gx * cellSize - WORLD_CENTER_OFFSET;
      const minY = gy * cellSize - WORLD_CENTER_OFFSET;
      const cell: AABB = [minX, minY, minX + cellSize, minY + cellSize];

      if (
        !(
          cell[3] < p.boundingBox[1] ||
          cell[1] > p.boundingBox[3] ||
          cell[2] < p.boundingBox[0] ||
          cell[0] > p.boundingBox[2]
        )
      ) {
        bucket.push(idx);
      }
    });
  }

  return {
    list: () => polys,
    create: () => new Poly(),
    draw(drawFn: DrawSegmentFunction, polygon: Poly, register = true): void {
      const neighbors = reducedPolygonList(polygon.boundingBox);
      for (let i = 0; i < neighbors.length && polygon.boolean(neighbors[i]!); i++) {}
      polygon.drawWith(drawFn);
      if (register) registerPoly(polygon);
    },
  };
}
