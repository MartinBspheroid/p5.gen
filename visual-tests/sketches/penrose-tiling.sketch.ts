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
    p.createCanvas(400, 400);
    p.background(250, 248, 240);

    // Create Penrose tilings at different iterations
    const t1 = createPenroseTiling(2, 100);
    const t2 = createPenroseTiling(3, 80);
    const t3 = createPenroseTiling(4, 60);

    p.fill(50);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text('Penrose Tiling Analysis:', 10, 30);

    // Iteration 2
    const c1 = t1.getTileTypeCounts();
    const r1 = t1.getKiteToDartRatio();
    p.textSize(10);
    p.text(\`Iter 2: Tiles=\${t1.getTileCount()} Kites=\${c1.kites} Darts=\${c1.darts}\`, 10, 50);
    p.text(\`  Ratio: \${r1.toFixed(4)}\`, 10, 63);

    // Iteration 3
    const c2 = t2.getTileTypeCounts();
    const r2 = t2.getKiteToDartRatio();
    p.text(\`Iter 3: Tiles=\${t2.getTileCount()} Kites=\${c2.kites} Darts=\${c2.darts}\`, 10, 85);
    p.text(\`  Ratio: \${r2.toFixed(4)}\`, 10, 98);

    // Iteration 4
    const c3 = t3.getTileTypeCounts();
    const r3 = t3.getKiteToDartRatio();
    p.text(\`Iter 4: Tiles=\${t3.getTileCount()} Kites=\${c3.kites} Darts=\${c3.darts}\`, 10, 120);
    p.text(\`  Ratio: \${r3.toFixed(4)}\`, 10, 133);

    p.text('Golden Ratio (φ) ≈ 1.618', 10, 160);

    p.noLoop();
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
