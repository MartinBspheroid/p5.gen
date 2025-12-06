/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * Domain warping utilities for procedural textures and geometry.
 * Implements domain distortion techniques from computer graphics literature.
 *
 * Domain warping distorts the input space before evaluating a function,
 * creating organic, flowing patterns. The basic idea is: f(p + h(p))
 * where f is the base function and h is the warping function.
 */

import { SimplexNoise2D, fbm2D } from "./simplexCurl";

/**
 * Type for 2D noise/scalar field functions.
 */
export type NoiseFunction2D = (x: number, y: number) => number;

/**
 * Configuration for domain warping operations.
 */
export type WarpConfig = {
  /** Base function to evaluate in warped space */
  readonly baseFn: NoiseFunction2D;
  /** Warping function that distorts the domain */
  readonly warpFn: NoiseFunction2D;
  /** Strength/amplitude of the warping distortion */
  readonly strength: number;
  /** Number of warp levels (1-3). Higher levels create more complex patterns */
  readonly levels: 1 | 2 | 3;
};

/**
 * Apply domain warping to a 2D function.
 * Distorts the input coordinates before evaluating the base function.
 *
 * @param baseFn - Function to evaluate in warped space (e.g., fbm2D)
 * @param warpFn - Function used to distort the domain (e.g., fbm2D)
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param strength - Warping strength/amplitude (default: 4.0)
 * @param levels - Number of warp levels (1-3, default: 1)
 * @returns Warped function value
 *
 * @example
 * ```ts
 * const noise = new SimplexNoise2D(42);
 * const baseFn = (x, y) => fbm2D(noise, x, y);
 * const warpFn = (x, y) => fbm2D(noise, x, y, 0.5, 2);
 * const value = warp2D(baseFn, warpFn, 100, 200, 4.0, 2);
 * ```
 */
export function warp2D(
  baseFn: NoiseFunction2D,
  warpFn: NoiseFunction2D,
  x: number,
  y: number,
  strength = 4.0,
  levels: 1 | 2 | 3 = 1
): number {
  let warpedX = x;
  let warpedY = y;

  // Apply multiple levels of warping
  for (let level = 0; level < levels; level++) {
    // Get warping displacement at current position
    const warpX = warpFn(warpedX, warpedY);
    const warpY = warpFn(warpedX + 5.2, warpedY + 1.3); // Offset for 2D variation

    // Apply warping to position
    warpedX = x + strength * warpX;
    warpedY = y + strength * warpY;
  }

  // Evaluate base function at final warped position
  return baseFn(warpedX, warpedY);
}

/**
 * Convenience function for FBM-based domain warping.
 * Uses Simplex noise FBM for both base pattern and warping function.
 *
 * @param noise - SimplexNoise2D instance for deterministic results
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param baseFrequency - Base frequency for the pattern (default: 0.3)
 * @param baseOctaves - Octaves for base FBM (default: 3)
 * @param warpFrequency - Frequency for warping function (default: 0.3)
 * @param warpOctaves - Octaves for warp FBM (default: 3)
 * @param strength - Warping strength (default: 4.0)
 * @param levels - Number of warp levels (default: 1)
 * @returns Warped FBM value
 *
 * @example
 * ```ts
 * const noise = new SimplexNoise2D(42);
 * const value = warpFbm2D(noise, 100, 200, 0.3, 3, 0.5, 2, 4.0, 2);
 * ```
 */
export function warpFbm2D(
  noise: SimplexNoise2D,
  x: number,
  y: number,
  baseFrequency = 0.3,
  baseOctaves = 3,
  warpFrequency = 0.3,
  warpOctaves = 3,
  strength = 4.0,
  levels: 1 | 2 | 3 = 1
): number {
  const baseFn = (px: number, py: number) => fbm2D(noise, px, py, baseFrequency, baseOctaves);
  const warpFn = (px: number, py: number) => fbm2D(noise, px, py, warpFrequency, warpOctaves);

  return warp2D(baseFn, warpFn, x, y, strength, levels);
}

/**
 * Advanced domain warping with intermediate value access.
 * Returns both the final warped value and intermediate warp values for visualization.
 *
 * @param baseFn - Base function
 * @param warpFn - Warping function
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param strength - Warping strength (default: 4.0)
 * @param levels - Number of warp levels (default: 1)
 * @returns Object with final value and intermediate warp values
 */
export function warp2DWithIntermediates(
  baseFn: NoiseFunction2D,
  warpFn: NoiseFunction2D,
  x: number,
  y: number,
  strength = 4.0,
  levels: 1 | 2 | 3 = 1
): { value: number; intermediates: readonly number[] } {
  let warpedX = x;
  let warpedY = y;
  const intermediates: number[] = [];

  // Apply multiple levels of warping, collecting intermediates
  for (let level = 0; level < levels; level++) {
    const warpX = warpFn(warpedX, warpedY);
    const warpY = warpFn(warpedX + 5.2, warpedY + 1.3);

    // Store intermediate warp magnitude for visualization
    intermediates.push(Math.sqrt(warpX * warpX + warpY * warpY));

    warpedX = x + strength * warpX;
    warpedY = y + strength * warpY;
  }

  const value = baseFn(warpedX, warpedY);
  return { value, intermediates };
}