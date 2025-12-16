/// <reference path="../node_modules/@types/p5/global.d.ts" />
/**
 * Voronoi Diagram generation with multiple distance metrics.
 *
 * A Voronoi diagram partitions space into regions based on proximity to seed points.
 * Each region contains all points closest to a particular seed.
 *
 * This implementation uses a naive pixel-based approach (scanning each pixel)
 * rather than Fortune's algorithm, making it intuitive and flexible for creative coding.
 *
 * KEY CONCEPTS:
 * - Seeds: Points that define the Voronoi regions
 * - Cells: Regions where all points are closest to a specific seed
 * - Distance Metrics: Different ways to measure proximity
 *
 * Uses:
 * - Spatial analysis and clustering
 * - Procedural generation (organic patterns, terrain, textures)
 * - Nearest neighbor visualization
 * - Artistic patterns and mosaics
 *
 * All functions are pure where possible. The VoronoiDiagram class maintains
 * seed state for incremental building.
 */

// ============================================================================
// Type Definitions
// ============================================================================

/** Distance metric for Voronoi calculations */
export type DistanceMetric = 'euclidean' | 'manhattan' | 'chebyshev' | 'minkowski';

/** Rectangular bounds */
export type VoronoiBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/** Configuration for Voronoi diagram */
export type VoronoiConfig = {
  /** Distance metric to use */
  readonly distanceMetric?: DistanceMetric;
  /** Minkowski p parameter (only used when metric is 'minkowski') */
  readonly minkowskiP?: number;
  /** Resolution for pixel-based operations (1 = every pixel) */
  readonly resolution?: number;
  /** Threshold for edge detection */
  readonly edgeThreshold?: number;
};

/** Result of finding nearest seed */
export type NearestSeedResult = {
  readonly index: number;
  readonly distance: number;
};

/** Region query result */
export type RegionQuery = {
  readonly seedIndex: number;
  readonly seed: p5.Vector | null;
  readonly distance: number;
};

/** Edge point with associated seeds */
export type EdgePoint = {
  readonly point: p5.Vector;
  readonly seed1Index: number;
  readonly seed2Index: number;
};

// ============================================================================
// Constants
// ============================================================================

/** Default configuration */
const DEFAULT_CONFIG: Required<VoronoiConfig> = {
  distanceMetric: 'euclidean',
  minkowskiP: 3,
  resolution: 1,
  edgeThreshold: 2,
};

// ============================================================================
// Distance Functions
// ============================================================================

/**
 * Calculate Euclidean distance between two points.
 * Standard straight-line distance: sqrt((x1-x2)² + (y1-y2)²)
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Euclidean distance
 */
export function euclideanDistance(p1: p5.Vector, p2: p5.Vector): number {
  return p1.dist(p2);
}

/**
 * Calculate Manhattan distance between two points.
 * City-block distance: |x1-x2| + |y1-y2|
 * Creates diamond-shaped Voronoi cells.
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Manhattan distance
 */
export function manhattanDistance(p1: p5.Vector, p2: p5.Vector): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

/**
 * Calculate Chebyshev distance between two points.
 * Chessboard distance: max(|x1-x2|, |y1-y2|)
 * Creates square-shaped Voronoi cells.
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Chebyshev distance
 */
export function chebyshevDistance(p1: p5.Vector, p2: p5.Vector): number {
  return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
}

/**
 * Calculate Minkowski distance between two points.
 * Generalized distance: (|x1-x2|^p + |y1-y2|^p)^(1/p)
 * - p=1 gives Manhattan distance
 * - p=2 gives Euclidean distance
 * - p→∞ gives Chebyshev distance
 * @param p1 - First point
 * @param p2 - Second point
 * @param p - Minkowski parameter (default: 3)
 * @returns Minkowski distance
 */
export function minkowskiDistance(p1: p5.Vector, p2: p5.Vector, p = 3): number {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);
  return Math.pow(Math.pow(dx, p) + Math.pow(dy, p), 1 / p);
}

/**
 * Get a distance function for a given metric.
 * @param metric - Distance metric name
 * @param minkowskiP - Minkowski p parameter
 * @returns Distance function
 */
export function getDistanceFunction(
  metric: DistanceMetric,
  minkowskiP = 3,
): (p1: p5.Vector, p2: p5.Vector) => number {
  switch (metric) {
    case 'manhattan':
      return manhattanDistance;
    case 'chebyshev':
      return chebyshevDistance;
    case 'minkowski':
      return (p1, p2) => minkowskiDistance(p1, p2, minkowskiP);
    case 'euclidean':
    default:
      return euclideanDistance;
  }
}

// ============================================================================
// Voronoi Diagram Class
// ============================================================================

/**
 * Voronoi diagram generator with seed management and region queries.
 */
export class VoronoiDiagram {
  private readonly config: Required<VoronoiConfig>;
  private _seeds: p5.Vector[];
  private distanceFn: (p1: p5.Vector, p2: p5.Vector) => number;

  /**
   * Create a new Voronoi diagram.
   * @param config - Configuration options
   */
  constructor(config: VoronoiConfig = {}) {
    this.config = {
      distanceMetric: config.distanceMetric ?? DEFAULT_CONFIG.distanceMetric,
      minkowskiP: config.minkowskiP ?? DEFAULT_CONFIG.minkowskiP,
      resolution: config.resolution ?? DEFAULT_CONFIG.resolution,
      edgeThreshold: config.edgeThreshold ?? DEFAULT_CONFIG.edgeThreshold,
    };

    this._seeds = [];
    this.distanceFn = getDistanceFunction(this.config.distanceMetric, this.config.minkowskiP);
  }

  /**
   * Get the current seeds.
   */
  get seeds(): readonly p5.Vector[] {
    return this._seeds;
  }

  /**
   * Get the distance metric.
   */
  get distanceMetric(): DistanceMetric {
    return this.config.distanceMetric;
  }

  /**
   * Add a seed point.
   * @param x - X coordinate
   * @param y - Y coordinate
   */
  addSeed(x: number, y: number): void {
    this._seeds.push(createVector(x, y));
  }

  /**
   * Add a seed from a vector.
   * @param seed - Seed point
   */
  addSeedVector(seed: p5.Vector): void {
    this._seeds.push(seed.copy());
  }

  /**
   * Remove all seeds.
   */
  clearSeeds(): void {
    this._seeds = [];
  }

  /**
   * Set all seeds at once.
   * @param seeds - Array of seed points
   */
  setSeeds(seeds: readonly p5.Vector[]): void {
    this._seeds = seeds.map((s) => s.copy());
  }

  /**
   * Generate random seeds within bounds.
   * @param count - Number of seeds to generate
   * @param bounds - Bounds for seed placement
   */
  generateRandomSeeds(count: number, bounds: VoronoiBounds): void {
    this.clearSeeds();

    for (let i = 0; i < count; i++) {
      const x = bounds.x + Math.random() * bounds.width;
      const y = bounds.y + Math.random() * bounds.height;
      this.addSeed(x, y);
    }
  }

  /**
   * Generate seeds in a grid pattern with slight randomness.
   * @param cols - Number of columns
   * @param rows - Number of rows
   * @param bounds - Bounds for grid
   * @param jitter - Amount of random jitter (0-1, default 0.2)
   */
  generateGridSeeds(cols: number, rows: number, bounds: VoronoiBounds, jitter = 0.2): void {
    this.clearSeeds();

    const cellW = bounds.width / cols;
    const cellH = bounds.height / rows;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const jitterX = (Math.random() - 0.5) * cellW * jitter * 2;
        const jitterY = (Math.random() - 0.5) * cellH * jitter * 2;
        const x = bounds.x + (i + 0.5) * cellW + jitterX;
        const y = bounds.y + (j + 0.5) * cellH + jitterY;
        this.addSeed(x, y);
      }
    }
  }

  /**
   * Calculate distance between two points using configured metric.
   * @param p1 - First point
   * @param p2 - Second point
   * @returns Distance
   */
  calculateDistance(p1: p5.Vector, p2: p5.Vector): number {
    return this.distanceFn(p1, p2);
  }

  /**
   * Find the index of the nearest seed to a point.
   * @param point - Query point
   * @returns Index of nearest seed (-1 if no seeds)
   */
  findNearestSeedIndex(point: p5.Vector): number {
    if (this._seeds.length === 0) return -1;

    let minDist = Infinity;
    let nearestIndex = 0;

    for (let i = 0; i < this._seeds.length; i++) {
      const seed = this._seeds[i];
      if (!seed) continue;
      const d = this.distanceFn(point, seed);
      if (d < minDist) {
        minDist = d;
        nearestIndex = i;
      }
    }

    return nearestIndex;
  }

  /**
   * Find the nearest seed with distance information.
   * @param point - Query point
   * @returns Nearest seed result
   */
  findNearestSeed(point: p5.Vector): NearestSeedResult {
    if (this._seeds.length === 0) {
      return { index: -1, distance: Infinity };
    }

    let minDist = Infinity;
    let nearestIndex = 0;

    for (let i = 0; i < this._seeds.length; i++) {
      const seed = this._seeds[i];
      if (!seed) continue;
      const d = this.distanceFn(point, seed);
      if (d < minDist) {
        minDist = d;
        nearestIndex = i;
      }
    }

    return { index: nearestIndex, distance: minDist };
  }

  /**
   * Check if a point is on or near a Voronoi edge.
   * An edge is where the distance to two seeds is approximately equal.
   * @param point - Point to check
   * @param threshold - Distance difference threshold (default: config.edgeThreshold)
   * @returns True if point is on an edge
   */
  isOnEdge(point: p5.Vector, threshold?: number): boolean {
    if (this._seeds.length < 2) return false;

    const edgeThreshold = threshold ?? this.config.edgeThreshold;

    // Calculate distances to all seeds and sort
    const distances = this._seeds.map((seed) => this.distanceFn(point, seed));
    distances.sort((a, b) => a - b);

    // Check if two closest are within threshold
    const d0 = distances[0];
    const d1 = distances[1];
    if (d0 === undefined || d1 === undefined) return false;

    return Math.abs(d0 - d1) < edgeThreshold;
  }

  /**
   * Query which region a point belongs to.
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Region query result
   */
  queryRegion(x: number, y: number): RegionQuery {
    const point = createVector(x, y);
    const result = this.findNearestSeed(point);

    return {
      seedIndex: result.index,
      seed: result.index >= 0 ? (this._seeds[result.index]?.copy() ?? null) : null,
      distance: result.distance,
    };
  }

  /**
   * Get all points in a specific region (expensive operation).
   * Scans all points within bounds and checks which belong to the region.
   * @param seedIndex - Index of the seed/region
   * @param bounds - Bounds to scan
   * @returns Array of points in the region
   */
  getRegionPoints(seedIndex: number, bounds: VoronoiBounds): p5.Vector[] {
    if (seedIndex < 0 || seedIndex >= this._seeds.length) return [];

    const points: p5.Vector[] = [];
    const res = this.config.resolution;

    for (let x = bounds.x; x < bounds.x + bounds.width; x += res) {
      for (let y = bounds.y; y < bounds.y + bounds.height; y += res) {
        const point = createVector(x, y);
        if (this.findNearestSeedIndex(point) === seedIndex) {
          points.push(point);
        }
      }
    }

    return points;
  }

  /**
   * Get edge points (points on Voronoi edges).
   * @param bounds - Bounds to scan
   * @returns Array of edge points with associated seeds
   */
  getEdgePoints(bounds: VoronoiBounds): EdgePoint[] {
    if (this._seeds.length < 2) return [];

    const edges: EdgePoint[] = [];
    const res = this.config.resolution;

    for (let x = bounds.x; x < bounds.x + bounds.width; x += res) {
      for (let y = bounds.y; y < bounds.y + bounds.height; y += res) {
        const point = createVector(x, y);

        // Get two closest seeds
        const distances: Array<{ index: number; distance: number }> = this._seeds.map(
          (seed, i) => ({
            index: i,
            distance: this.distanceFn(point, seed),
          }),
        );
        distances.sort((a, b) => a.distance - b.distance);

        const d0 = distances[0];
        const d1 = distances[1];
        if (d0 === undefined || d1 === undefined) continue;

        if (Math.abs(d0.distance - d1.distance) < this.config.edgeThreshold) {
          edges.push({
            point,
            seed1Index: d0.index,
            seed2Index: d1.index,
          });
        }
      }
    }

    return edges;
  }

  /**
   * Get the region index for each point in a grid.
   * Useful for bulk processing or rendering.
   * @param bounds - Bounds to scan
   * @returns 2D array of region indices
   */
  getRegionGrid(bounds: VoronoiBounds): number[][] {
    const res = this.config.resolution;
    const cols = Math.ceil(bounds.width / res);
    const rows = Math.ceil(bounds.height / res);

    const grid: number[][] = [];

    for (let i = 0; i < cols; i++) {
      const row: number[] = [];
      for (let j = 0; j < rows; j++) {
        const x = bounds.x + i * res;
        const y = bounds.y + j * res;
        const point = createVector(x, y);
        row.push(this.findNearestSeedIndex(point));
      }
      grid.push(row);
    }

    return grid;
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a Voronoi diagram with default settings.
 * @param config - Configuration options
 * @returns VoronoiDiagram instance
 */
export function createVoronoi(config: VoronoiConfig = {}): VoronoiDiagram {
  return new VoronoiDiagram(config);
}

/**
 * Find the region index for a point given an array of seeds.
 * Standalone function for one-off queries without creating a VoronoiDiagram.
 * @param point - Query point
 * @param seeds - Array of seed points
 * @param metric - Distance metric (default: euclidean)
 * @param minkowskiP - Minkowski p parameter
 * @returns Index of nearest seed
 */
export function findRegion(
  point: p5.Vector,
  seeds: readonly p5.Vector[],
  metric: DistanceMetric = 'euclidean',
  minkowskiP = 3,
): number {
  if (seeds.length === 0) return -1;

  const distFn = getDistanceFunction(metric, minkowskiP);
  let minDist = Infinity;
  let nearestIndex = 0;

  for (let i = 0; i < seeds.length; i++) {
    const seed = seeds[i];
    if (!seed) continue;
    const d = distFn(point, seed);
    if (d < minDist) {
      minDist = d;
      nearestIndex = i;
    }
  }

  return nearestIndex;
}

export type VoronoiCell = {
  readonly seedIndex: number;
  readonly seed: p5.Vector;
  /** Convex polygon, CCW, NOT repeated last point. Empty => no visible region in bounds. */
  readonly polygon: readonly p5.Vector[];
  readonly area: number;
};

const EPS = 1e-9;

export function computeVoronoiCellsEuclidean(
  seeds: readonly p5.Vector[],
  bounds: VoronoiBounds,
): VoronoiCell[] {
  const n = seeds.length;
  const out: VoronoiCell[] = [];

  for (let i = 0; i < n; i++) {
    const si = seeds[i];
    if (!si) continue;

    let poly = rectPolygon(bounds);

    for (let j = 0; j < n; j++) {
      if (j === i) continue;
      const sj = seeds[j];
      if (!sj) continue;

      // Perpendicular bisector half-plane:
      // keep points p where |p - si|^2 <= |p - sj|^2
      // which is equivalent to dot(p - mid, (sj - si)) <= 0
      const mid = createVector((si.x + sj.x) * 0.5, (si.y + sj.y) * 0.5);
      const normal = createVector(sj.x - si.x, sj.y - si.y);

      poly = clipPolygonHalfPlane(poly, mid, normal);
      if (poly.length === 0) break;
    }

    const area = polygonArea(poly);
    out.push({
      seedIndex: i,
      seed: si.copy(),
      polygon: poly,
      area,
    });
  }

  return out;
}

/** Number of seeds (nominal regions). Some regions can be empty in the chosen bounds. */
export function regionCount(seeds: readonly p5.Vector[]): number {
  return seeds.length;
}

/** Regions that actually have non-empty area in the given bounds. */
export function activeRegionCount(cells: readonly VoronoiCell[], minArea = 1e-6): number {
  return cells.reduce((acc, c) => acc + (c.area > minArea ? 1 : 0), 0);
}

// ------------------------
// Geometry helpers
// ------------------------

function rectPolygon(b: VoronoiBounds): p5.Vector[] {
  const x0 = b.x;
  const y0 = b.y;
  const x1 = b.x + b.width;
  const y1 = b.y + b.height;
  return [createVector(x0, y0), createVector(x1, y0), createVector(x1, y1), createVector(x0, y1)];
}

/**
 * Sutherland–Hodgman clip against a half-plane:
 * keep p where dot(p - linePoint, normal) <= 0
 */
function clipPolygonHalfPlane(
  poly: readonly p5.Vector[],
  linePoint: p5.Vector,
  normal: p5.Vector,
): p5.Vector[] {
  if (poly.length === 0) return [];

  const inside = (p: p5.Vector) =>
    (p.x - linePoint.x) * normal.x + (p.y - linePoint.y) * normal.y <= EPS;

  const intersect = (a: p5.Vector, b: p5.Vector): p5.Vector => {
    // segment a->b with infinite line dot(p - linePoint, normal) = 0
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const denom = abx * normal.x + aby * normal.y;

    if (Math.abs(denom) < EPS) {
      // Parallel-ish; return a to avoid NaNs (caller should only call when crossing)
      return a.copy();
    }

    const t = ((linePoint.x - a.x) * normal.x + (linePoint.y - a.y) * normal.y) / denom;

    return createVector(a.x + abx * t, a.y + aby * t);
  };

  const out: p5.Vector[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % poly.length]!;
    const aIn = inside(a);
    const bIn = inside(b);

    if (aIn && bIn) {
      out.push(b.copy());
    } else if (aIn && !bIn) {
      out.push(intersect(a, b));
    } else if (!aIn && bIn) {
      out.push(intersect(a, b));
      out.push(b.copy());
    }
  }

  // De-duplicate near-identical consecutive points
  return dedupeConsecutive(out);
}

function dedupeConsecutive(points: p5.Vector[], eps = 1e-7): p5.Vector[] {
  if (points.length === 0) return points;
  const out: p5.Vector[] = [points[0]!.copy()];
  for (let i = 1; i < points.length; i++) {
    const p = points[i]!;
    const q = out[out.length - 1]!;
    if (Math.hypot(p.x - q.x, p.y - q.y) > eps) out.push(p.copy());
  }
  // also remove closing duplicate if it happens to match start
  if (out.length >= 2) {
    const a = out[0]!;
    const b = out[out.length - 1]!;
    if (Math.hypot(a.x - b.x, a.y - b.y) < eps) out.pop();
  }
  return out;
}

function polygonArea(poly: readonly p5.Vector[]): number {
  const n = poly.length;
  if (n < 3) return 0;
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const a = poly[i]!;
    const b = poly[(i + 1) % n]!;
    sum += a.x * b.y - b.x * a.y;
  }
  return Math.abs(sum) * 0.5;
}
