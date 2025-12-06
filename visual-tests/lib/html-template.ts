/**
 * HTML template generation for p5.js sketch rendering.
 */

import type { SketchModule } from "./types";

const LIBRARY_ENTRY = `${import.meta.dirname}/../../src/index.ts`;

/**
 * Bundle the p5.gen library into a single IIFE string for browser injection.
 * Post-processes to expose exports to window global.
 */
async function bundleLibrary(): Promise<string> {
  const result = await Bun.build({
    entrypoints: [LIBRARY_ENTRY],
    format: "iife",
    target: "browser",
    minify: false,
  });

  if (!result.success) {
    const errors = result.logs.map((log) => log.message).join("\n");
    throw new Error(`Failed to bundle library: ${errors}`);
  }

  const artifact = result.outputs[0];
  if (!artifact) {
    throw new Error("No output artifact from library bundle");
  }

  let code = await artifact.text();

  // Expose exports to window by inserting before the closing })();
  // The IIFE ends with })(); and we need to add Object.assign(window, exports_src);
  code = code.replace(
    /\}\)\(\);[\s]*$/,
    "Object.assign(window, exports_src);\n})();"
  );

  return code;
}

/**
 * Generate HTML template for running a p5.js sketch with the library.
 * @param sketchModule - The sketch to render
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns HTML string ready for Puppeteer
 */
export async function generateHtmlTemplate(
  sketchModule: SketchModule,
  width: number,
  height: number
): Promise<string> {
  const { meta, sketch } = sketchModule;
  const libraryCode = await bundleLibrary();

  const seedSetup =
    meta.seed !== undefined
      ? `p.randomSeed(${meta.seed}); p.noiseSeed(${meta.seed});`
      : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${meta.name}</title>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; background: #fff; }
    canvas { display: block; }
  </style>
</head>
<body>
  <!-- Load p5.js from CDN -->
  <script src="https://cdn.jsdelivr.net/npm/p5@1.11.0/lib/p5.min.js"></script>

  <!-- Global constants that the library expects -->
  <script>
    window.PI = Math.PI;
    window.TWO_PI = 2 * Math.PI;
  </script>

  <!-- Bundled p5.gen library -->
  <script>
    ${libraryCode}
  </script>

  <!-- Test sketch -->
  <script>
    (function() {
      const sketchFn = function(p) {
        // Bind p5 createVector to window for library compatibility
        window.createVector = function(x, y, z) {
          return p.createVector(x, y, z);
        };

        // Seed setup for deterministic rendering
        ${seedSetup}

        // Sketch code
        ${sketch}
      };

      window._p5Instance = new p5(sketchFn);
    })();
  </script>
</body>
</html>`;
}
