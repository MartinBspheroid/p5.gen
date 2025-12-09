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
    p.createCanvas(500, 520);
    p.background(245, 243, 240);

    p.fill(40);
    p.textAlign(p.LEFT);
    p.textSize(13);
    p.text("Penrose Tiling - Aperiodic Kite and Dart Pattern", 15, 25);

    // Create Penrose tiling at 2 iterations with moderate scale
    const tiling = createPenroseTiling(2, 150);
    const tiles = tiling.getTiles();
    const counts = tiling.getTileTypeCounts();
    const ratio = tiling.getKiteToDartRatio();

    // Render tiles
    p.stroke(80);
    p.strokeWeight(2);

    const centerX = 250;
    const centerY = 260;

    for (const tile of tiles) {
      // Get tile vertices
      const vertices = tiling.getTileVertices(tile);

      // Set fill color based on tile type (0 = KITE, 1 = DART)
      if (tile.type === 0) {
        p.fill(255, 200, 100, 220);
      } else {
        p.fill(100, 180, 255, 220);
      }

      // Draw quadrilateral
      p.beginShape();
      for (let i = 0; i < 4; i++) {
        const v = vertices[i];
        p.vertex(v.x + centerX, v.y + centerY);
      }
      p.endShape(p.CLOSE);
    }

    // Draw legend and statistics
    p.fill(255, 200, 100);
    p.rect(15, 480, 14, 14);
    p.fill(40);
    p.textSize(10);
    p.text(\`Kites: \${counts.kites}\`, 35, 490);

    p.fill(100, 180, 255);
    p.rect(140, 480, 14, 14);
    p.fill(40);
    p.text(\`Darts: \${counts.darts}\`, 160, 490);

    p.fill(100);
    p.textSize(10);
    p.text(\`Total: \${tiling.getTileCount()} | Ratio: \${ratio.toFixed(3)} (φ≈1.618)\`, 280, 490);

    p.noLoop();
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
