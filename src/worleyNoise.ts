/// <reference path="../node_modules/@types/p5/global.d.ts" />
/**
 * WORLEY NOISE (CELLULAR NOISE) IMPLEMENTATION FOR P5.JS
 *
 * Worley noise creates organic, cellular patterns by computing distances to randomly
 * placed feature points. Unlike Perlin noise which creates smooth gradients, Worley
 * noise produces cell-like structures useful for:
 * - Organic textures (stone, skin, scales)
 * - Voronoi diagrams
 * - Natural patterns (cracked earth, cell structures)
 * - Procedural terrain features
 *
 * Algorithm Overview:
 * 1. Divide space into a grid of cells
 * 2. Place random feature point(s) in each cell
 * 3. For any query point, find the nearest feature points
 * 4. Return distance to nearest (F1), second-nearest (F2), or combinations
 *
 * This implementation uses p5.Vector for vector operations.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Distance metric for Worley calculations */
export type WorleyDistanceMetric = "euclidean" | "manhattan" | "chebyshev" | "minkowski";

/** Value function determining which distance(s) to use */
export type WorleyValueFunction = "F1" | "F2" | "F2-F1";

/** Configuration for Worley noise generation */
export type WorleyConfiguration = {
  /** Grid scale - smaller values = smaller cells (more detail). Default: 50 */
  readonly scale: number;
  /** Number of feature points per cell (typically 1-4). Default: 1 */
  readonly pointsPerCell: number;
  /** Distance metric. Default: 'euclidean' */
  readonly distanceMetric: WorleyDistanceMetric;
  /** Minkowski distance parameter (p=2 is Euclidean, p=1 is Manhattan). Default: 2 */
  readonly minkowskiP: number;
  /** Value function: 'F1' (nearest), 'F2' (second nearest), 'F2-F1' (difference). Default: 'F1' */
  readonly valueFunction: WorleyValueFunction;
  /** Seed for reproducible patterns. Default: 12345 */
  readonly seed: number;
  /** Number of layers (1 = simple Worley). Default: 1 */
  readonly octaves: number;
  /** Frequency multiplier per octave. Default: 2.0 */
  readonly lacunarity: number;
  /** Amplitude multiplier per octave. Default: 0.5 */
  readonly gain: number;
  /** Invert output (0-1 becomes 1-0). Default: false */
  readonly invert: boolean;
  /** Normalization range (approximate max distance). Set to null for auto-calculation. */
  readonly normalizationFactor: number | null;
};

// ============================================================================
// CONSTANTS
// ============================================================================

/** Default Worley noise configuration */
export const DEFAULT_WORLEY_CONFIG: WorleyConfiguration = {
  scale: 50,
  pointsPerCell: 1,
  distanceMetric: "euclidean",
  minkowskiP: 2,
  valueFunction: "F1",
  seed: 12345,
  octaves: 1,
  lacunarity: 2.0,
  gain: 0.5,
  invert: false,
  normalizationFactor: null,
};

// ============================================================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================================================

/**
 * Simple seeded random number generator for deterministic noise.
 * Uses a linear congruential generator algorithm.
 */
class WorleyRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /** Set the seed value */
  seed(value: number): void {
    this.state = value;
  }

  /** Get next random number in range [0, 1) */
  next(): number {
    // Linear congruential generator
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }
}

// Module-level random generator
const worleyRng = new WorleyRandom(12345);

// ============================================================================
// CORE WORLEY NOISE FUNCTIONS
// ============================================================================

/**
 * Main Worley noise function - returns distance value at given coordinates.
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param config - Configuration object (uses defaults if not provided)
 * @returns Normalized distance value (typically 0-1)
 */
export function worley(x: number, y: number, config: Partial<WorleyConfiguration> = {}): number {
  const cfg = { ...DEFAULT_WORLEY_CONFIG, ...config };

  // Seed the random number generator for reproducibility
  worleyRng.seed(cfg.seed);

  // Scale the input coordinates
  const scaledX = x / cfg.scale;
  const scaledY = y / cfg.scale;

  // Create query point
  const point = createVector(scaledX, scaledY);

  // Find distances to nearest feature points
  const distances = findNearestFeaturePoints(point, cfg);

  // Calculate value based on configured function
  let value: number;
  switch (cfg.valueFunction) {
    case "F1":
      value = distances[0] ?? 0;
      break;
    case "F2":
      value = distances[1] ?? distances[0] ?? 0;
      break;
    case "F2-F1":
      value = (distances[1] ?? distances[0] ?? 0) - (distances[0] ?? 0);
      break;
    default:
      value = distances[0] ?? 0;
  }

  // Normalize the value
  const normFactor = cfg.normalizationFactor ?? cfg.scale * 0.75;
  value = Math.min(Math.max((value * cfg.scale) / normFactor, 0), 1);

  // Invert if configured
  if (cfg.invert) {
    value = 1 - value;
  }

  return value;
}

/**
 * Multi-scale (fractal) Worley noise - combines multiple octaves.
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param config - Configuration object
 * @returns Normalized distance value
 */
export function worleyFractal(
  x: number,
  y: number,
  config: Partial<WorleyConfiguration> = {}
): number {
  const cfg = { ...DEFAULT_WORLEY_CONFIG, ...config };

  let total = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;

  for (let i = 0; i < cfg.octaves; i++) {
    // Create octave config with adjusted scale and seed
    const octaveConfig: WorleyConfiguration = {
      ...cfg,
      scale: cfg.scale / frequency,
      seed: cfg.seed + i,
    };

    // Get Worley noise value for this octave
    const value = worley(x, y, octaveConfig);

    // Accumulate
    total += value * amplitude;
    maxValue += amplitude;

    // Update frequency and amplitude for next octave
    frequency *= cfg.lacunarity;
    amplitude *= cfg.gain;
  }

  // Normalize by total possible amplitude
  return total / maxValue;
}

/**
 * Finds the nearest feature points to a given point.
 * @param point - Query point in scaled space
 * @param config - Configuration object
 * @returns Array of distances [F1, F2, F3, ...]
 */
export function findNearestFeaturePoints(
  point: p5.Vector,
  config: WorleyConfiguration
): readonly number[] {
  // Determine which cell the point is in
  const cellX = Math.floor(point.x);
  const cellY = Math.floor(point.y);

  // We need to check neighboring cells too (9 cells total in 2D)
  const minDistances: number[] = [];

  // Check all neighboring cells (3x3 grid around point)
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const neighborX = cellX + dx;
      const neighborY = cellY + dy;

      // Get feature points in this cell
      const featurePoints = getCellFeaturePoints(neighborX, neighborY, config);

      // Calculate distances to all feature points in this cell
      for (const featurePoint of featurePoints) {
        const dist = calculateWorleyDistance(point, featurePoint, config);
        minDistances.push(dist);
      }
    }
  }

  // Sort distances to find F1 (nearest), F2 (second nearest), etc.
  minDistances.sort((a, b) => a - b);

  // Ensure we have at least 2 distances (for F2-F1 calculations)
  if (minDistances.length === 0) {
    return [0, 0];
  } else if (minDistances.length === 1) {
    const d = minDistances[0];
    return d !== undefined ? [d, d] : [0, 0];
  }
  return minDistances;
}

/**
 * Generates feature points for a specific cell using deterministic randomness.
 * @param cellX - Cell X coordinate
 * @param cellY - Cell Y coordinate
 * @param config - Configuration object
 * @returns Array of feature points
 */
export function getCellFeaturePoints(
  cellX: number,
  cellY: number,
  config: WorleyConfiguration
): readonly p5.Vector[] {
  const points: p5.Vector[] = [];

  // Use cell coordinates to seed randomness (deterministic based on cell position)
  const cellSeed = hashCellCoordinates(cellX, cellY, config.seed);
  worleyRng.seed(cellSeed);

  // Generate feature points within this cell
  for (let i = 0; i < config.pointsPerCell; i++) {
    // Random position within the cell [0, 1) + cell offset
    const px = cellX + worleyRng.next();
    const py = cellY + worleyRng.next();
    points.push(createVector(px, py));
  }

  return points;
}

/**
 * Calculates distance between two points using configured metric.
 * @param p1 - First point
 * @param p2 - Second point
 * @param config - Configuration object
 * @returns Distance value
 */
export function calculateWorleyDistance(
  p1: p5.Vector,
  p2: p5.Vector,
  config: WorleyConfiguration
): number {
  const dx = Math.abs(p1.x - p2.x);
  const dy = Math.abs(p1.y - p2.y);

  switch (config.distanceMetric) {
    case "euclidean":
      // Standard Euclidean distance: sqrt(dx² + dy²)
      return Math.sqrt(dx * dx + dy * dy);

    case "manhattan":
      // Manhattan (taxicab) distance: |dx| + |dy|
      return dx + dy;

    case "chebyshev":
      // Chebyshev (chessboard) distance: max(|dx|, |dy|)
      return Math.max(dx, dy);

    case "minkowski":
      // Minkowski distance: (|dx|^p + |dy|^p)^(1/p)
      const p = config.minkowskiP;
      return Math.pow(Math.pow(dx, p) + Math.pow(dy, p), 1 / p);

    default:
      return Math.sqrt(dx * dx + dy * dy);
  }
}

/**
 * Hash function to generate deterministic seed from cell coordinates.
 * @param x - Cell X coordinate
 * @param y - Cell Y coordinate
 * @param baseSeed - Base seed value
 * @returns Hash value
 */
export function hashCellCoordinates(x: number, y: number, baseSeed: number): number {
  // Simple hash function combining coordinates and base seed
  // This ensures same cell always gets same feature points
  let h = baseSeed;
  h = (h * 73856093) ^ Math.floor(x * 19349663);
  h = (h * 83492791) ^ Math.floor(y * 19349663);
  return Math.abs(h) % 2147483647;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get Worley noise value and map it to a grayscale value (0-255).
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param config - Configuration object
 * @returns Grayscale value (0-255)
 */
export function worleyToGray(x: number, y: number, config: Partial<WorleyConfiguration> = {}): number {
  const cfg = { ...DEFAULT_WORLEY_CONFIG, ...config };
  const value = cfg.octaves > 1 ? worleyFractal(x, y, cfg) : worley(x, y, cfg);
  return value * 255;
}

/**
 * Generate a 2D array of Worley noise values.
 * @param width - Width of array
 * @param height - Height of array
 * @param config - Configuration object
 * @returns 2D array of values
 */
export function worleyField(
  width: number,
  height: number,
  config: Partial<WorleyConfiguration> = {}
): readonly (readonly number[])[] {
  const cfg = { ...DEFAULT_WORLEY_CONFIG, ...config };
  const field: number[][] = [];

  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const value = cfg.octaves > 1 ? worleyFractal(x, y, cfg) : worley(x, y, cfg);
      row.push(value);
    }
    field.push(row);
  }

  return field;
}

/**
 * Worley noise generator class for stateful operations and caching.
 */
export class WorleyNoiseGenerator {
  private readonly config: WorleyConfiguration;
  private readonly rng: WorleyRandom;

  /**
   * Create a new Worley noise generator.
   * @param config - Configuration options
   */
  constructor(config: Partial<WorleyConfiguration> = {}) {
    this.config = { ...DEFAULT_WORLEY_CONFIG, ...config };
    this.rng = new WorleyRandom(this.config.seed);
  }

  /**
   * Get noise value at coordinates.
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Normalized value (0-1)
   */
  get(x: number, y: number): number {
    return this.config.octaves > 1
      ? worleyFractal(x, y, this.config)
      : worley(x, y, this.config);
  }

  /**
   * Get noise value mapped to grayscale (0-255).
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns Grayscale value (0-255)
   */
  getGray(x: number, y: number): number {
    return this.get(x, y) * 255;
  }

  /**
   * Generate a 2D field of noise values.
   * @param width - Width of field
   * @param height - Height of field
   * @returns 2D array of values
   */
  getField(width: number, height: number): readonly (readonly number[])[] {
    return worleyField(width, height, this.config);
  }

  /**
   * Get the current configuration.
   */
  getConfig(): WorleyConfiguration {
    return { ...this.config };
  }
}

/**
 * Create a Worley noise generator with the given configuration.
 * @param config - Configuration options
 * @returns WorleyNoiseGenerator instance
 */
export function createWorleyNoise(config: Partial<WorleyConfiguration> = {}): WorleyNoiseGenerator {
  return new WorleyNoiseGenerator(config);
}
