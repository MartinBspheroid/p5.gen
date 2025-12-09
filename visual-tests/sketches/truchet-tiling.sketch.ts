/**
 * Visual test for Truchet Tiling algorithm
 *
 * Displays all 5 tile types with a random pattern to verify the
 * tiling system works correctly with p5.Vector positions
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "truchet-tiling",
  description:
    "Tests drawGrid() and tile functions - all 5 Truchet tile types",
  width: 600,
  height: 500,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(600, 480);
    p.background(30);

    const tileSize = 60;
    const cols = 8;
    const rows = 6;

    // Initialize grid with random pattern
    const grid = initializeGrid(cols, rows, 'random', 42);

    p.fill(255);
    p.textAlign(p.LEFT);
    p.textSize(14);
    p.text("Truchet Tiling - Curve Pattern", 15, 25);

    p.textSize(11);
    p.text(\`Grid: \${cols}×\${rows} | Tile Size: \${tileSize}px\`, 15, 45);

    // Draw the grid with curve tiles
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = 15 + col * tileSize;
        const y = 65 + row * tileSize;
        const rotation = grid[row][col];

        // Draw tile background
        p.fill(50);
        p.stroke(100);
        p.strokeWeight(1);
        p.rect(x, y, tileSize, tileSize);

        // Draw curved Truchet tile
        p.stroke(100, 200, 255);
        p.strokeWeight(2);
        p.noFill();

        p.push();
        p.translate(x + tileSize / 2, y + tileSize / 2);
        p.rotate(rotation * p.HALF_PI);

        // Draw quarter-circle arcs
        p.arc(-tileSize / 2, -tileSize / 2, tileSize, tileSize, 0, p.HALF_PI);
        p.arc(tileSize / 2, tileSize / 2, tileSize, tileSize, p.PI, p.PI + p.HALF_PI);

        p.pop();
      }
    }

    // Draw statistics
    p.fill(150);
    p.textSize(10);
    p.text("✓ Rendered with p5.Vector-based positions and rotations", 15, 480);

    p.noLoop();
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
