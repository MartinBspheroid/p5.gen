/**
 * Visual test for Penrose Tiling algorithm
 *
 * Displays a Penrose tiling with kite and dart tiles at 4 iterations
 * showing the aperiodic, non-repeating fractal-like pattern
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "penrose-tiling",
  description:
    "Tests PenroseTiling - aperiodic tiling with kite and dart tiles",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(600, 450);
    p.background(250, 248, 240);

    p.fill(50);
    p.textAlign(p.LEFT);
    p.textSize(14);
    p.text("Penrose Tiling - Kite and Dart Aperiodic Tiling", 20, 30);

    p.textSize(11);
    p.fill(80);

    // Create tilings at different iterations and analyze
    let y = 70;
    const configs = [
      { iter: 2, scale: 120, desc: "2 Iterations" },
      { iter: 3, scale: 100, desc: "3 Iterations" },
      { iter: 4, scale: 80, desc: "4 Iterations" },
      { iter: 5, scale: 60, desc: "5 Iterations" }
    ];

    for (const cfg of configs) {
      const tiling = createPenroseTiling(cfg.iter, cfg.scale);
      const counts = tiling.getTileTypeCounts();
      const ratio = tiling.getKiteToDartRatio();

      // Draw colored squares for kites and darts
      p.fill(255, 200, 100);
      p.rect(20, y - 10, 12, 12);
      p.fill(100, 180, 255);
      p.rect(40, y - 10, 12, 12);

      p.fill(60);
      p.textSize(10);
      p.text(
        \`\${cfg.desc}: \${tiling.getTileCount()} tiles | Kites: \${counts.kites} Darts: \${counts.darts} | Ratio: \${ratio.toFixed(4)}\`,
        60,
        y
      );

      y += 30;
    }

    p.fill(100);
    p.textSize(10);
    p.text(
      "Golden Ratio (φ) = 1.618... | All tilings generated with full p5.Vector support",
      20,
      y + 20
    );

    p.noLoop();
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
