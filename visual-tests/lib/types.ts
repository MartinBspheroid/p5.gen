/**
 * Type definitions for the visual test infrastructure.
 */

/**
 * Configuration for the visual test runner.
 */
export type TestConfig = {
  readonly sketchFilter?: string;
  readonly width: number;
  readonly height: number;
  readonly timeout: number;
  readonly verbose: boolean;
};

/**
 * Metadata for a test sketch.
 */
export type SketchMeta = {
  readonly name: string;
  readonly description: string;
  readonly width?: number;
  readonly height?: number;
  /** Number of frames to render before capture. Defaults to 1. */
  readonly frameCount?: number;
  /** Seed for deterministic randomness. */
  readonly seed?: number;
  /** Use explicit window.__sketchComplete signal instead of frameCount. */
  readonly completionSignal?: boolean;
};

/**
 * Result of running a single visual test.
 */
export type TestResult = {
  readonly name: string;
  readonly success: boolean;
  readonly outputPath: string;
  readonly error?: string;
  readonly durationMs: number;
};

/**
 * Sketch module interface - what each .sketch.ts file exports.
 */
export type SketchModule = {
  readonly meta: SketchMeta;
  /** Sketch code as string (injected into browser context). */
  readonly sketch: string;
};
