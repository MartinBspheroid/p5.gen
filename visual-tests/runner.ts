#!/usr/bin/env bun
/**
 * Visual test runner CLI for p5.gen library.
 * Renders p5.js sketches to PNG files using Puppeteer.
 *
 * Usage:
 *   bun visual-tests/runner.ts                    # Run all sketches
 *   bun visual-tests/runner.ts --sketch circle    # Run specific sketch
 *   bun visual-tests/runner.ts --verbose          # Show detailed output
 */

import { parseArgs } from "util";
import { runVisualTests } from "./lib/test-runner";
import type { TestConfig } from "./lib/types";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    sketch: { type: "string", short: "s" },
    width: { type: "string", default: "400" },
    height: { type: "string", default: "400" },
    timeout: { type: "string", default: "10000" },
    verbose: { type: "boolean", short: "v", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help) {
  console.log(`
Visual Test Runner for p5.gen

Usage:
  bun visual-tests/runner.ts [options]

Options:
  -s, --sketch <name>   Filter sketches by name (partial match)
  --width <px>          Canvas width (default: 400)
  --height <px>         Canvas height (default: 400)
  --timeout <ms>        Max wait time for sketch completion (default: 10000)
  -v, --verbose         Show detailed output
  -h, --help            Show this help message

Examples:
  bun visual-tests/runner.ts
  bun visual-tests/runner.ts --sketch circle
  bun visual-tests/runner.ts -s poisson -v
`);
  process.exit(0);
}

const config: TestConfig = {
  sketchFilter: values.sketch,
  width: parseInt(values.width ?? "400", 10),
  height: parseInt(values.height ?? "400", 10),
  timeout: parseInt(values.timeout ?? "10000", 10),
  verbose: values.verbose ?? false,
};

console.log("p5.gen Visual Test Runner\n");

await runVisualTests(config);
