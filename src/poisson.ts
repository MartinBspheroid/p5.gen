/**
 * Poisson-disc sampling utilities for blue-noise point distribution.
 * Provides both unbounded (PoissonDiscGrid) and bounded (PoissonDiscSampler) implementations.
 */

/** Poisson disc cell size divisor */
const POISSON_CELL_DIVISOR = Math.sqrt(2);

/** Default max attempts for Bridson's algorithm */
const DEFAULT_MAX_ATTEMPTS = 30;

/** Annulus inner radius multiplier */
const ANNULUS_INNER = 1;

/** Annulus outer radius multiplier */
const ANNULUS_OUTER = 2;

/**
 * Poisson-disc grid for blue-noise point distribution.
 * Maintains minimum distance between points for even spatial distribution.
 * Unbounded - works with any coordinate range using spatial hashing.
 *
 * @example
 * ```ts
 * const grid = new PoissonDiscGrid(10); // min distance = 10
 * grid.insert(createVector(100, 100)); // true
 * grid.insert(createVector(105, 105)); // false (too close)
 * grid.insert(createVector(120, 100)); // true
 * ```
 */
export class PoissonDiscGrid {
  private readonly cellSize: number;
  private readonly radius2: number;
  private readonly cellMap: Map<string, p5.Vector[]>;

  /** All successfully inserted points, accessible as an array */
  readonly points: p5.Vector[] = [];

  /**
   * Create a new Poisson-disc grid.
   * @param radius - Minimum distance between points
   */
  constructor(radius: number) {
    this.cellSize = 1 / POISSON_CELL_DIVISOR / radius;
    this.radius2 = radius * radius;
    this.cellMap = new Map();
  }

  /**
   * Try inserting a point into the grid.
   * @param p - Point to insert
   * @returns true if inserted successfully, false if too close to existing points
   */
  insert(p: p5.Vector): boolean {
    const cx = (p.x * this.cellSize) | 0;
    const cy = (p.y * this.cellSize) | 0;
    const key = `${cx},${cy}`;

    // Check neighboring cells for conflicts
    for (let xi = cx - 1; xi <= cx + 1; xi++) {
      for (let yi = cy - 1; yi <= cy + 1; yi++) {
        const bucket = this.cellMap.get(`${xi},${yi}`);
        if (!bucket) continue;

        for (let i = 0; i < bucket.length; i++) {
          const q = bucket[i]!;
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          if (dx * dx + dy * dy < this.radius2) {
            return false;
          }
        }
      }
    }

    // Add to cell bucket (create if needed)
    let bucket = this.cellMap.get(key);
    if (!bucket) {
      bucket = [];
      this.cellMap.set(key, bucket);
    }
    bucket.push(p);

    // Add to flat points array for easy access
    this.points.push(p);
    return true;
  }

  /**
   * Clear all points from the grid.
   */
  clear(): void {
    this.cellMap.clear();
    this.points.length = 0;
  }
}

/**
 * Bounded Poisson-disc sampler using Bridson's algorithm.
 * Fills a rectangular space with blue-noise distributed points.
 *
 * @example
 * ```ts
 * const sampler = new PoissonDiscSampler(400, 400, 10, 12345);
 * sampler.generate(); // fills space with points
 * console.log(sampler.points.length); // ~1200 points
 * ```
 */
export class PoissonDiscSampler {
  private readonly width: number;
  private readonly height: number;
  private readonly radius: number;
  private readonly radius2: number;
  private readonly cellSize: number;
  private readonly cols: number;
  private readonly rows: number;
  private readonly maxAttempts: number;
  private rngState: number;

  /** 2D grid for O(1) cell lookup */
  readonly grid: (p5.Vector | undefined)[][];

  /** All generated points as a flat array */
  readonly points: p5.Vector[] = [];

  /**
   * Create a new bounded Poisson-disc sampler.
   * @param width - Width of the sampling area
   * @param height - Height of the sampling area
   * @param radius - Minimum distance between points
   * @param seed - Optional seed for reproducible results (default: Date.now())
   * @param maxAttempts - Max attempts per point in Bridson's algorithm (default: 30)
   */
  constructor(
    width: number,
    height: number,
    radius: number,
    seed?: number,
    maxAttempts = DEFAULT_MAX_ATTEMPTS
  ) {
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.radius2 = radius * radius;
    this.cellSize = radius / POISSON_CELL_DIVISOR;
    this.cols = Math.ceil(width / this.cellSize);
    this.rows = Math.ceil(height / this.cellSize);
    this.maxAttempts = maxAttempts;
    this.rngState = seed ?? Date.now();

    // Initialize empty 2D grid
    this.grid = new Array(this.cols);
    for (let i = 0; i < this.cols; i++) {
      this.grid[i] = new Array(this.rows).fill(undefined);
    }
  }

  /**
   * Seeded random number generator (mulberry32).
   * @returns Random number in [0, 1)
   */
  private random(): number {
    let t = (this.rngState += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generate points to fill the bounded space using Bridson's algorithm.
   * @param startX - Optional starting X coordinate (default: center)
   * @param startY - Optional starting Y coordinate (default: center)
   * @returns The points array for chaining
   */
  generate(startX?: number, startY?: number): p5.Vector[] {
    // Clear any previous generation
    this.points.length = 0;
    for (let i = 0; i < this.cols; i++) {
      this.grid[i]!.fill(undefined);
    }

    // Step 1: Initialize with seed point
    const x0 = startX ?? this.width / 2;
    const y0 = startY ?? this.height / 2;
    const seedPoint = createVector(x0, y0);

    const col = Math.floor(x0 / this.cellSize);
    const row = Math.floor(y0 / this.cellSize);
    this.grid[col]![row] = seedPoint;
    this.points.push(seedPoint);

    const active: p5.Vector[] = [seedPoint];

    // Step 2: Process active list
    while (active.length > 0) {
      const idx = Math.floor(this.random() * active.length);
      const point = active[idx]!;
      let found = false;

      // Try up to maxAttempts samples in the annulus
      for (let n = 0; n < this.maxAttempts; n++) {
        const angle = this.random() * Math.PI * 2;
        const mag =
          this.radius * ANNULUS_INNER +
          this.random() * this.radius * (ANNULUS_OUTER - ANNULUS_INNER);
        const sampleX = point.x + Math.cos(angle) * mag;
        const sampleY = point.y + Math.sin(angle) * mag;

        // Check bounds
        if (
          sampleX < 0 ||
          sampleX >= this.width ||
          sampleY < 0 ||
          sampleY >= this.height
        ) {
          continue;
        }

        const sampleCol = Math.floor(sampleX / this.cellSize);
        const sampleRow = Math.floor(sampleY / this.cellSize);

        // Skip if outside grid bounds or cell already occupied
        if (
          sampleCol < 0 ||
          sampleCol >= this.cols ||
          sampleRow < 0 ||
          sampleRow >= this.rows ||
          this.grid[sampleCol]![sampleRow] !== undefined
        ) {
          continue;
        }

        // Check distance to neighbors (±1 cells, standard for r/sqrt(2) cell size)
        let ok = true;
        for (
          let i = Math.max(0, sampleCol - 1);
          i <= Math.min(this.cols - 1, sampleCol + 1);
          i++
        ) {
          for (
            let j = Math.max(0, sampleRow - 1);
            j <= Math.min(this.rows - 1, sampleRow + 1);
            j++
          ) {
            const neighbor = this.grid[i]![j];
            if (neighbor) {
              const dx = sampleX - neighbor.x;
              const dy = sampleY - neighbor.y;
              if (dx * dx + dy * dy < this.radius2) {
                ok = false;
                break;
              }
            }
          }
          if (!ok) break;
        }

        if (ok) {
          found = true;
          const sample = createVector(sampleX, sampleY);
          this.grid[sampleCol]![sampleRow] = sample;
          this.points.push(sample);
          active.push(sample);
        }
      }

      if (!found) {
        // Remove from active list using swap-and-pop for O(1)
        active[idx] = active[active.length - 1]!;
        active.pop();
      }
    }

    return this.points;
  }

  /**
   * Clear all generated points and reset the grid.
   */
  clear(): void {
    this.points.length = 0;
    for (let i = 0; i < this.cols; i++) {
      this.grid[i]!.fill(undefined);
    }
  }
}
