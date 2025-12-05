/**
 * Gray-Scott reaction-diffusion simulation for generating organic patterns.
 * Includes integration with marching squares for vector contour extraction.
 */

import {
  marchingSquares,
  marchingSquaresToSegments,
  getPathsFromMarchingSquaresResult,
  type LineSegment,
  type Polygon,
  type MarchingSquareCell,
} from "./marchingSquares";

/** Initial random seed bound */
const DEFAULT_RANDOM_SEED_BOUND = 10000000;

/** Seed sine multiplier for pseudorandom generation */
const RANDOM_SINE_MULTIPLIER = 10000;

/** Initial value for chemical A */
const INITIAL_A_VALUE = 1;

/** Initial value for chemical B */
const INITIAL_B_VALUE = 0;

/** Default time step for simulation */
const DEFAULT_TIME_STEP = 1;

/** Seed grid size (2x2 cells per seed) */
const SEED_GRID_SIZE = 2;

/** Laplacian weight for adjacent cells */
const LAPLACIAN_ADJACENT_WEIGHT = 0.2;

/** Laplacian weight for diagonal cells */
const LAPLACIAN_DIAGONAL_WEIGHT = 0.05;

/** Center weight for Laplacian (negative) */
const LAPLACIAN_CENTER_WEIGHT = -1;

/** Default scalar field value range */
const SCALAR_FIELD_MAX_VALUE = 255;

/** Marching squares threshold for contours */
const MARCHING_SQUARES_THRESHOLD = 128;

/** Default number of RD seeds */
const DEFAULT_NUMBER_OF_SEEDS = 150;

/** Default Gray-Scott grid size */
const DEFAULT_GRAY_SCOTT_SIZE = 250;

/** Default kill rate for mitosis patterns */
const DEFAULT_KILL_RATE = 0.063;

/** Default feed rate for organic patterns */
const DEFAULT_FEED_RATE = 0.05;

/** Default simulation steps */
const DEFAULT_SIMULATION_STEPS = 2000;

/** Alternative kill rate for different patterns */
const ALT_KILL_RATE = 0.06;

/** Alternative feed rate for different patterns */
const ALT_FEED_RATE = 0.06;

/** Default random seed */
const DEFAULT_RANDOM_SEED = 12345;

/** Default diffusion rate for chemical A */
const DEFAULT_DIFFUSION_A = 1;

/** Default diffusion rate for chemical B */
const DEFAULT_DIFFUSION_B = 0.5;

/** Minimum seed coordinate offset to stay within bounds */
const SEED_COORDINATE_OFFSET = 2;

/**
 * Seeded pseudorandom number generator using sine-based hashing.
 * Produces deterministic sequences for reproducible patterns.
 *
 * @example
 * ```ts
 * const rng = new SeededRandom(42);
 * const value = rng.next(); // [0, 1)
 * const inRange = rng.nextBetween(10, 20); // [10, 20)
 * ```
 */
export class SeededRandom {
  private val: number;

  constructor(public readonly seed: number = Math.random() * DEFAULT_RANDOM_SEED_BOUND) {
    this.val = seed;
  }

  /**
   * Generate next random number in [0, 1).
   * @returns Random value
   */
  next(): number {
    const x = Math.sin(this.val++) * RANDOM_SINE_MULTIPLIER;
    return x - Math.floor(x);
  }

  /**
   * Generate random number in range [min, max).
   * @param min - Minimum value (inclusive)
   * @param max - Maximum value (exclusive)
   * @returns Random value in range
   */
  nextBetween(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

/**
 * Cell state in reaction-diffusion simulation.
 * Contains concentrations of chemicals A and B.
 */
class Cell {
  constructor(
    public a: number = INITIAL_A_VALUE,
    public b: number = INITIAL_B_VALUE
  ) {}
}

/**
 * Callback for iterating over cells with normalized values.
 */
export type CellCallback = (
  x: number,
  y: number,
  a: number,
  b: number,
  normA: number,
  normB: number
) => void;

/**
 * Gray-Scott reaction-diffusion simulator.
 * Simulates pattern formation through chemical reactions and diffusion.
 *
 * Common parameter ranges:
 * - Mitosis: k=0.062-0.065, f=0.03-0.06
 * - Coral: k=0.062, f=0.062
 * - Spots: k=0.062, f=0.035
 * - Worms: k=0.063, f=0.058
 *
 * @example
 * ```ts
 * const gs = new GrayScott(100, 100, 0.063, 0.05);
 * const rng = new SeededRandom(42);
 * gs.addInitialSeed(50, 50, rng);
 * gs.stepMany(2000);
 * const field = gs.toScalarField("a");
 * ```
 */
export class GrayScott {
  private readonly dt: number = DEFAULT_TIME_STEP;
  private _t = 0;

  /** Minimum concentration of B across grid */
  public minB = Number.POSITIVE_INFINITY;

  /** Maximum concentration of B across grid */
  public maxB = Number.NEGATIVE_INFINITY;

  /** Minimum concentration of A across grid */
  public minA = Number.POSITIVE_INFINITY;

  /** Maximum concentration of A across grid */
  public maxA = Number.NEGATIVE_INFINITY;

  private buffer: Cell[][];
  private nextFrameBuffer: Cell[][];

  /**
   * Create a new Gray-Scott simulation.
   * @param width - Grid width
   * @param height - Grid height
   * @param k - Kill rate (typically 0.06-0.065)
   * @param f - Feed rate (typically 0.03-0.06)
   * @param DA - Diffusion rate for A (default: 1.0)
   * @param DB - Diffusion rate for B (default: 0.5)
   */
  constructor(
    public readonly width: number,
    public readonly height: number,
    public readonly k: number,
    public readonly f: number,
    public readonly DA: number = DEFAULT_DIFFUSION_A,
    public readonly DB: number = DEFAULT_DIFFUSION_B
  ) {
    this.buffer = this.createArray();
    this.nextFrameBuffer = this.createArray();
  }

  /**
   * Current simulation time step.
   */
  get t(): number {
    return this._t;
  }

  /**
   * Create and initialize a 2D grid of cells.
   */
  private createArray(): Cell[][] {
    const arr = new Array<Cell[]>(this.width);
    for (let x = 0; x < this.width; x++) {
      arr[x] = new Array<Cell>(this.height);
      for (let y = 0; y < this.height; y++) {
        arr[x]![y]! = new Cell();
      }
    }
    return arr;
  }

  /**
   * Add initial catalyst seed at position (x, y).
   * Seeds a 2x2 region with random B values.
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param rng - Seeded random number generator
   */
  addInitialSeed(x: number, y: number, rng: SeededRandom): void {
    for (let i = 0; i < SEED_GRID_SIZE; i++) {
      for (let j = 0; j < SEED_GRID_SIZE; j++) {
        const cx = Math.floor(x + i);
        const cy = Math.floor(y + j);
        this.buffer[cx]![cy]!.a = INITIAL_A_VALUE;
        this.buffer[cx]![cy]!.b = rng.next();
      }
    }
  }

  /**
   * Execute one simulation step using Gray-Scott equations.
   * Updates all cells based on reaction and diffusion.
   */
  step(): void {
    this.minA = Number.POSITIVE_INFINITY;
    this.minB = Number.POSITIVE_INFINITY;
    this.maxA = Number.NEGATIVE_INFINITY;
    this.maxB = Number.NEGATIVE_INFINITY;

    const W = this.width;
    const H = this.height;

    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        const oldA = this.buffer[x]![y]!.a;
        const oldB = this.buffer[x]![y]!.b;

        // Calculate Laplacian for A using 9-point stencil
        let middle = oldA * LAPLACIAN_CENTER_WEIGHT;
        let adjacent = 0;
        let diag = 0;

        let left = x - 1;
        let right = x + 1;
        let top = y - 1;
        let bottom = y + 1;

        // Wrap around at boundaries
        if (left < 0) left = W - 1;
        if (right >= W) right %= W;
        if (top < 0) top = H - 1;
        if (bottom >= H) bottom %= H;

        adjacent += this.buffer[x]![bottom]!.a * LAPLACIAN_ADJACENT_WEIGHT;
        adjacent += this.buffer[x]![top]!.a * LAPLACIAN_ADJACENT_WEIGHT;
        adjacent += this.buffer[left]![y]!.a * LAPLACIAN_ADJACENT_WEIGHT;
        adjacent += this.buffer[right]![y]!.a * LAPLACIAN_ADJACENT_WEIGHT;

        diag += this.buffer[right]![bottom]!.a * LAPLACIAN_DIAGONAL_WEIGHT;
        diag += this.buffer[right]![top]!.a * LAPLACIAN_DIAGONAL_WEIGHT;
        diag += this.buffer[left]![top]!.a * LAPLACIAN_DIAGONAL_WEIGHT;
        diag += this.buffer[left]![bottom]!.a * LAPLACIAN_DIAGONAL_WEIGHT;

        const factor2 = oldA * oldB * oldB;
        const laplaceA = middle + adjacent + diag;

        const newA =
          (oldA + (this.DA * laplaceA - factor2) + this.f * (1 - oldA)) * this.dt;

        // Calculate Laplacian for B
        middle = oldB * LAPLACIAN_CENTER_WEIGHT;
        adjacent = 0;
        diag = 0;

        adjacent += this.buffer[x]![bottom]!.b * LAPLACIAN_ADJACENT_WEIGHT;
        adjacent += this.buffer[x]![top]!.b * LAPLACIAN_ADJACENT_WEIGHT;
        adjacent += this.buffer[left]![y]!.b * LAPLACIAN_ADJACENT_WEIGHT;
        adjacent += this.buffer[right]![y]!.b * LAPLACIAN_ADJACENT_WEIGHT;

        diag += this.buffer[right]![bottom]!.b * LAPLACIAN_DIAGONAL_WEIGHT;
        diag += this.buffer[right]![top]!.b * LAPLACIAN_DIAGONAL_WEIGHT;
        diag += this.buffer[left]![top]!.b * LAPLACIAN_DIAGONAL_WEIGHT;
        diag += this.buffer[left]![bottom]!.b * LAPLACIAN_DIAGONAL_WEIGHT;

        const laplaceB = middle + adjacent + diag;

        const newB =
          (oldB + (this.DB * laplaceB + factor2) - (this.k + this.f) * oldB) *
          this.dt;

        // Track min/max for normalization
        if (newB < this.minB) this.minB = newB;
        if (newA < this.minA) this.minA = newA;
        if (newB > this.maxB) this.maxB = newB;
        if (newA > this.maxA) this.maxA = newA;

        this.nextFrameBuffer[x]![y]!.a = newA;
        this.nextFrameBuffer[x]![y]!.b = newB;
      }
    }

    this.swapBuffers();
    this._t++;
  }

  /**
   * Execute multiple simulation steps.
   * @param n - Number of steps to execute
   */
  stepMany(n: number): void {
    for (let i = 0; i < n; i++) {
      this.step();
    }
  }

  /**
   * Swap current and next frame buffers (double buffering).
   * NOTE: This mutates internal state for performance.
   */
  private swapBuffers(): void {
    const tmp = this.buffer;
    this.buffer = this.nextFrameBuffer;
    this.nextFrameBuffer = tmp;
  }

  /**
   * Iterate over all cells with normalized values.
   * @param cb - Callback (x, y, a, b, normA, normB) => void
   */
  foreachCell(cb: CellCallback): void {
    const rangeA = this.maxA - this.minA || 1;
    const rangeB = this.maxB - this.minB || 1;

    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const c = this.buffer[x]![y]!;
        const normA = (c.a - this.minA) / rangeA;
        const normB = (c.b - this.minB) / rangeB;
        cb(x, y, c.a, c.b, normA, normB);
      }
    }
  }

  /**
   * Export simulation state as 2D scalar field [y][x].
   * Values are normalized to [0, 255].
   *
   * @param which - Which chemical to export ("a" or "b")
   * @returns 2D array of values in range [0, 255]
   */
  toScalarField(which: "a" | "b" = "a"): number[][] {
    const H = this.height;
    const W = this.width;
    const field = new Array<number[]>(H);

    const rangeA = this.maxA - this.minA || 1;
    const rangeB = this.maxB - this.minB || 1;

    for (let y = 0; y < H; y++) {
      field[y] = new Array<number>(W);
    }

    for (let x = 0; x < W; x++) {
      for (let y = 0; y < H; y++) {
        const c = this.buffer[x]![y]!;
        let v: number;
        if (which === "a") {
          v = (c.a - this.minA) / rangeA;
        } else {
          v = (c.b - this.minB) / rangeB;
        }
        field[y]![x]! = Math.floor(v * SCALAR_FIELD_MAX_VALUE);
      }
    }

    return field;
  }
}

/**
 * Run Gray-Scott simulation and extract marching squares contours.
 * Produces organic pattern contours ready for vector rendering.
 *
 * @param randomSeed - Random seed for reproducibility
 * @param nrOfSeeds - Number of initial catalyst seeds
 * @param grayScottSize - Grid size (square)
 * @param k - Kill rate
 * @param f - Feed rate
 * @param steps - Number of simulation steps
 * @returns Marching squares cell grid
 */
export function getMarchingSquaresResultFromReactionDiffusion(
  randomSeed: number,
  nrOfSeeds: number,
  grayScottSize: number,
  k: number,
  f: number,
  steps: number
): MarchingSquareCell[][] {
  const gs = new GrayScott(grayScottSize, grayScottSize, k, f);
  const rng = new SeededRandom(randomSeed);

  for (let s = 0; s < nrOfSeeds; s++) {
    const x = Math.floor(rng.next() * (grayScottSize - SEED_COORDINATE_OFFSET));
    const y = Math.floor(rng.next() * (grayScottSize - SEED_COORDINATE_OFFSET));
    gs.addInitialSeed(x, y, rng);
  }

  gs.stepMany(steps);

  const field = gs.toScalarField("a");

  // Invert field for marching squares
  for (let y = 0; y < grayScottSize; y++) {
    for (let x = 0; x < grayScottSize; x++) {
      field[y]![x]! = SCALAR_FIELD_MAX_VALUE - field[y]![x]!;
    }
  }

  const result = marchingSquares(
    field,
    MARCHING_SQUARES_THRESHOLD,
    grayScottSize,
    grayScottSize,
    true
  );

  return result;
}

/**
 * Generate line segments from reaction-diffusion pattern.
 * Convenience wrapper for full RD → marching squares → segments pipeline.
 *
 * @param scale - Output scale in world units
 * @param randomSeed - Random seed (default: 12345)
 * @param numberOfSeeds - Number of catalyst seeds (default: 150)
 * @param grayScottSize - Grid size (default: 250)
 * @param k - Kill rate (default: 0.063)
 * @param f - Feed rate (default: 0.05)
 * @param steps - Simulation steps (default: 2000)
 * @returns Array of line segments
 *
 * @example
 * ```ts
 * const segments = getReactionDiffusionSegments(500);
 * segments.forEach(seg => {
 *   line(seg.x1, seg.y1, seg.x2, seg.y2);
 * });
 * ```
 */
export function getReactionDiffusionSegments(
  scale: number,
  randomSeed = DEFAULT_RANDOM_SEED,
  numberOfSeeds = DEFAULT_NUMBER_OF_SEEDS,
  grayScottSize = DEFAULT_GRAY_SCOTT_SIZE,
  k = DEFAULT_KILL_RATE,
  f = DEFAULT_FEED_RATE,
  steps = DEFAULT_SIMULATION_STEPS
): LineSegment[] {
  const cellSize = scale / grayScottSize;
  const result = getMarchingSquaresResultFromReactionDiffusion(
    randomSeed,
    numberOfSeeds,
    grayScottSize,
    k,
    f,
    steps
  );

  return marchingSquaresToSegments(result, grayScottSize, grayScottSize, cellSize);
}

/**
 * Generate closed polygon paths from reaction-diffusion pattern.
 * Convenience wrapper for full RD → marching squares → paths pipeline.
 *
 * @param scale - Output scale in world units
 * @param randomSeed - Random seed (default: 12345)
 * @param numberOfSeeds - Number of catalyst seeds (default: 150)
 * @param grayScottSize - Grid size (default: 250)
 * @param k - Kill rate (default: 0.06)
 * @param f - Feed rate (default: 0.06)
 * @param steps - Simulation steps (default: 2000)
 * @returns Array of polygons with contours
 *
 * @example
 * ```ts
 * const polygons = getReactionDiffusionPath(500);
 * polygons.forEach(poly => {
 *   beginShape();
 *   poly.segments[0].forEach(pt => vertex(pt.x, pt.y));
 *   endShape(CLOSE);
 * });
 * ```
 */
export function getReactionDiffusionPath(
  scale: number,
  randomSeed = DEFAULT_RANDOM_SEED,
  numberOfSeeds = DEFAULT_NUMBER_OF_SEEDS,
  grayScottSize = DEFAULT_GRAY_SCOTT_SIZE,
  k = ALT_KILL_RATE,
  f = ALT_FEED_RATE,
  steps = DEFAULT_SIMULATION_STEPS
): Polygon[] {
  const cellSize = scale / grayScottSize;
  const result = getMarchingSquaresResultFromReactionDiffusion(
    randomSeed,
    numberOfSeeds,
    grayScottSize,
    k,
    f,
    steps
  );

  const polygons = getPathsFromMarchingSquaresResult(
    result,
    grayScottSize,
    grayScottSize,
    cellSize
  );

  return polygons;
}
