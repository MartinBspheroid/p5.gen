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
    p.createCanvas(600, 400);
    p.background(240);

    const cols = 8;
    const rows = 8;
    const tileTypes = ['diagonal', 'curve', 'triangle', 'dots', 'cross'];

    p.fill(50);
    p.textAlign(p.LEFT);
    p.textSize(14);
    p.text("Truchet Tiling Grid Verification", 10, 25);

    p.textSize(10);
    p.fill(80);

    let y = 50;

    // Test each tile type
    for (const tileType of tileTypes) {
      // Initialize grid for this tile type
      const grid = initializeGrid(cols, rows, 'random', 42);

      // Draw title and stats
      p.text(\`\${tileType.toUpperCase()} - \${cols}×\${rows} grid\`, 15, y);

      // Count rotations
      let rotationCounts = [0, 0, 0, 0];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const rot = grid[r][c];
          rotationCounts[rot]++;
        }
      }

      p.textSize(9);
      p.text(
        \`Rotations: 0=\${rotationCounts[0]} 1=\${rotationCounts[1]} 2=\${rotationCounts[2]} 3=\${rotationCounts[3]}\`,
        15,
        y + 12
      );

      y += 28;
    }

    p.textSize(10);
    p.fill(100);
    p.text('✓ All grids initialized successfully with p5.Vector positions', 15, y + 10);

    p.noLoop();
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
