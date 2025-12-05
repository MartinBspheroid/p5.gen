/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * 2D Simplex noise generation with fractal Brownian motion (FBM) and curl noise.
 */

/** Simplex noise scale factor to normalize output to approximately [-1, 1] */
const NOISE_SCALE_FACTOR = 70;

/** Skew factor for 2D simplex noise */
const SIMPLEX_SKEW_2D = (Math.sqrt(3) - 1) / 2;

/** Unskew factor for 2D simplex noise */
const SIMPLEX_UNSKEW_2D = (3 - Math.sqrt(3)) / 6;

/** Corner contribution threshold for simplex noise */
const CORNER_THRESHOLD = 0.5;

/** Permutation table size */
const PERM_SIZE = 512;

/** Permutation mask for wrapping */
const PERM_MASK = 255;

/** Hash multiplier for seeded randomization */
const HASH_MULTIPLIER = 1103515245;

/** Number of gradient vectors */
const GRADIENT_COUNT = 12;

/** Default FBM frequency divisor */
const DEFAULT_FBM_FREQUENCY_DIVISOR = 1000;

/** Default FBM octave shift */
const DEFAULT_FBM_OCTAVE_SHIFT = 32;

/** FBM frequency multiplier per octave */
const FBM_FREQUENCY_MULTIPLIER = 2;

/** Default curl noise epsilon for numerical differentiation */
const DEFAULT_CURL_EPSILON = 0.01;

/** Curl noise epsilon multiplier */
const CURL_EPSILON_MULTIPLIER = 2;

/** Curl noise gradient normalization factor */
const CURL_GRADIENT_NORMALIZATION = 0.99;

/** Minimum gradient length to avoid division by zero */
const MIN_GRADIENT_LENGTH = 1e-9;

/** Gradient vectors for simplex noise (12 unit vectors) */
const GRADIENT_VECTORS: ReadonlyArray<readonly [number, number]> = [
  [1, 1],
  [-1, 1],
  [1, -1],
  [-1, -1],
  [1, 0],
  [-1, 0],
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [0, 1],
  [0, -1],
] as const;

/**
 * Seeded 2D Simplex noise generator.
 * Produces smooth, continuous noise in the range approximately [-1, 1].
 *
 * @example
 * ```ts
 * const noise = new SimplexNoise2D(12345);
 * const value = noise.noise2D(10.5, 20.3); // ~[-1, 1]
 * ```
 */
export class SimplexNoise2D {
  private readonly perm: Uint8Array;

  /**
   * Create a new seeded simplex noise generator.
   * @param seed - Integer seed for reproducible noise (default: 1)
   */
  constructor(seed = 1) {
    this.perm = new Uint8Array(PERM_SIZE);

    // Initialize permutation table
    for (let i = 0; i < PERM_SIZE; i++) {
      this.perm[i] = i & PERM_MASK;
    }

    // Shuffle with seeded hash
    for (let i = 0; i < PERM_MASK; i++) {
      const r = (seed = SimplexNoise2D.hash(i + seed)) % (PERM_MASK + 1 - i) + i;
      const swp = this.perm[i]!;
      this.perm[i + PERM_MASK + 1] = this.perm[i] = this.perm[r]!;
      this.perm[r + PERM_MASK + 1] = this.perm[r] = swp;
    }
  }

  /**
   * Sample 2D simplex noise at coordinates (x, y).
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Noise value in approximately [-1, 1]
   */
  noise2D(x: number, y: number): number {
    // Skew input space to determine which simplex cell we're in
    const s = (x + y) * SIMPLEX_SKEW_2D;
    const cx = Math.floor(x + s);
    const cy = Math.floor(y + s);

    const i = cx & PERM_MASK;
    const j = cy & PERM_MASK;

    // Unskew back to (x0, y0) in simplex cell
    const t = (cx + cy) * SIMPLEX_UNSKEW_2D;
    const x0 = x - cx + t;
    const y0 = y - cy + t;

    // Determine which simplex triangle we're in
    const oX = x0 > y0 ? 1 : 0;
    const oY = x0 > y0 ? 0 : 1;

    // Offsets for second and third corners
    const x1 = x0 - oX + SIMPLEX_UNSKEW_2D;
    const y1 = y0 - oY + SIMPLEX_UNSKEW_2D;
    const x2 = x0 - 1 + 2 * SIMPLEX_UNSKEW_2D;
    const y2 = y0 - 1 + 2 * SIMPLEX_UNSKEW_2D;

    // Calculate corner contributions
    let n0 = 0;
    let n1 = 0;
    let n2 = 0;

    let t0 = CORNER_THRESHOLD - x0 * x0 - y0 * y0;
    if (t0 > 0) {
      t0 *= t0;
      const gi0 = this.perm[i + this.perm[j]!]! % GRADIENT_COUNT;
      const g = GRADIENT_VECTORS[gi0]!;
      n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
    }

    let t1 = CORNER_THRESHOLD - x1 * x1 - y1 * y1;
    if (t1 > 0) {
      t1 *= t1;
      const gi1 = this.perm[i + oX + this.perm[j + oY]!]! % GRADIENT_COUNT;
      const g = GRADIENT_VECTORS[gi1]!;
      n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
    }

    let t2 = CORNER_THRESHOLD - x2 * x2 - y2 * y2;
    if (t2 > 0) {
      t2 *= t2;
      const gi2 = this.perm[i + 1 + this.perm[j + 1]!]! % GRADIENT_COUNT;
      const g = GRADIENT_VECTORS[gi2]!;
      n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
    }

    // Scale to approximately [-1, 1]
    return NOISE_SCALE_FACTOR * (n0 + n1 + n2);
  }

  /**
   * Integer hash function for seeded random permutation.
   * @param i - Input integer
   * @returns Hashed integer
   */
  private static hash(i: number): number {
    i = HASH_MULTIPLIER * ((i >> 1) ^ i);
    const h32 = HASH_MULTIPLIER * (i ^ (i >> 3));
    return h32 ^ (h32 >> 16);
  }
}

/**
 * Fractal Brownian Motion (FBM) using layered octaves of simplex noise.
 * Creates more natural-looking, multi-scale noise patterns.
 *
 * @param noise - SimplexNoise2D instance to use
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param frequency - Base frequency multiplier (default: 0.3)
 * @param octaves - Number of noise layers to combine (default: 3)
 * @returns Combined noise value
 *
 * @example
 * ```ts
 * const noise = new SimplexNoise2D(42);
 * const value = fbm2D(noise, 100, 200, 0.5, 4);
 * ```
 */
export function fbm2D(
  noise: SimplexNoise2D,
  x: number,
  y: number,
  frequency = 0.3,
  octaves = 3
): number {
  x *= frequency / DEFAULT_FBM_FREQUENCY_DIVISOR;
  y *= frequency / DEFAULT_FBM_FREQUENCY_DIVISOR;

  let f = 1;
  let v = 0;

  for (let i = 0; i < octaves; i++) {
    v += noise.noise2D(x * f, y * f) / f;
    f *= FBM_FREQUENCY_MULTIPLIER;
    x += DEFAULT_FBM_OCTAVE_SHIFT;
  }

  return v;
}

/**
 * Type for FBM function that can be passed to curlNoise2D.
 */
export type FbmFunction = (x: number, y: number) => number;

/**
 * Generate curl noise from a scalar FBM field using numerical differentiation.
 * Curl noise produces divergence-free vector fields ideal for fluid-like particle motion.
 *
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param fbmFn - FBM function to sample (x, y) => value
 * @param radius - Flow field radius/strength (default: 1.8)
 * @param eps - Epsilon for numerical differentiation (default: 0.01)
 * @returns Velocity vector as p5.Vector
 *
 * @example
 * ```ts
 * const noise = new SimplexNoise2D(123);
 * const fbmFn = (x: number, y: number) => fbm2D(noise, x, y);
 * const vel = curlNoise2D(10, 20, fbmFn);
 * ```
 */
export function curlNoise2D(
  x: number,
  y: number,
  fbmFn: FbmFunction,
  radius = 1.8,
  eps = DEFAULT_CURL_EPSILON
): p5.Vector {
  const fwdY = fbmFn(x, y + eps);
  const backY = fbmFn(x, y - eps);
  const fwdX = fbmFn(x + eps, y);
  const backX = fbmFn(x - eps, y);

  const dx = (fwdY - backY) / (CURL_EPSILON_MULTIPLIER * eps);
  const dy = (fwdX - backX) / (CURL_EPSILON_MULTIPLIER * eps);

  const gradLen = Math.hypot(dx, dy) || MIN_GRADIENT_LENGTH;
  const l = (gradLen / radius) * CURL_GRADIENT_NORMALIZATION;

  return createVector(dx / l, -dy / l);
}
