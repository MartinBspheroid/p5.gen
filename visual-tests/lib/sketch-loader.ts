/**
 * Sketch discovery and loading utilities.
 */

import { Glob } from "bun";
import type { SketchModule } from "./types";

const SKETCHES_DIR = `${import.meta.dirname}/../sketches`;

/**
 * Discover all sketch files, optionally filtered by name.
 * @param filter - Partial name match filter
 * @returns Array of absolute paths to sketch files
 */
export async function discoverSketches(filter?: string): Promise<string[]> {
  const glob = new Glob("*.sketch.ts");
  const sketches: string[] = [];

  for await (const file of glob.scan(SKETCHES_DIR)) {
    const name = file.replace(".sketch.ts", "");
    if (!filter || name.includes(filter)) {
      sketches.push(`${SKETCHES_DIR}/${file}`);
    }
  }

  return sketches.toSorted();
}

/**
 * Load a sketch module and extract its metadata and code.
 * @param sketchPath - Absolute path to the sketch file
 * @returns The validated sketch module
 */
export async function loadSketch(sketchPath: string): Promise<SketchModule> {
  const module = await import(sketchPath);

  if (!module.meta || typeof module.meta !== "object") {
    throw new Error(
      `Invalid sketch module: ${sketchPath}. Must export 'meta' object.`
    );
  }

  if (!module.sketch || typeof module.sketch !== "string") {
    throw new Error(
      `Invalid sketch module: ${sketchPath}. Must export 'sketch' string.`
    );
  }

  return {
    meta: module.meta,
    sketch: module.sketch,
  };
}
