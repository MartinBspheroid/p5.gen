/**
 * Visual test for Penrose Tiling algorithms
 *
 * Displays both Penrose tiling variants:
 * - Left: P3 Rhombus (L-System approach)
 * - Right: P2 Kite-Dart (Deflation/subdivision approach)
 */

import type { SketchMeta } from '../lib/types';

export const meta: SketchMeta = {
  name: 'penrose-tiling',
  description: 'Tests both Penrose tiling variants (P3 Rhombus & P2 Kite-Dart)',
  width: 900,
  height: 450,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(900, 450);
    p.background(0);

    // Title
    p.fill(255);
    p.textAlign(p.CENTER);
    p.textSize(14);
    p.text("Penrose Tiling Variants", p.width / 2, 20);

    // Left side: P3 Rhombus (L-System)
    p.textSize(11);
    p.textAlign(p.LEFT);
    p.text("P3 Rhombus (L-System)", 30, 45);

    const rhombus = createPenroseTiling(5, 350);
    const rhombusCommands = rhombus.getRenderCommands();

    p.push();
    p.translate(225, 250);
    p.stroke(255, 100);
    p.strokeWeight(0.5);
    p.noFill();

    for (const cmd of rhombusCommands) {
      if (cmd.type === 'line') {
        p.line(cmd.x1, cmd.y1, cmd.x2, cmd.y2);
      }
    }
    p.pop();

    // Right side: P2 Kite-Dart (Deflation)
    p.fill(255);
    p.text("P2 Kite-Dart (Deflation)", 480, 45);

    const kiteDart = createKiteDartTiling(5, 150);
    const kiteDartCommands = kiteDart.getRenderCommands();

    p.push();
    p.translate(675, 250);

    // Draw filled triangles with colors
    for (const cmd of kiteDartCommands) {
      if (cmd.type === 'triangle') {
        const [a, b, c] = cmd.vertices;

        // Color based on triangle type (0=thin/dart, 1=fat/kite)
        if (cmd.triangleType === 0) {
          p.fill(100, 150, 200, 80); // Blue-ish for thin (dart)
        } else {
          p.fill(200, 150, 100, 80); // Orange-ish for fat (kite)
        }

        p.stroke(255, 60);
        p.strokeWeight(0.3);
        p.triangle(a.x, a.y, b.x, b.y, c.x, c.y);
      }
    }

    // Draw edges on top
    p.noFill();
    p.stroke(255, 120);
    p.strokeWeight(0.5);
    for (const cmd of kiteDartCommands) {
      if (cmd.type === 'triangle') {
        const [a, b, c] = cmd.vertices;
        p.triangle(a.x, a.y, b.x, b.y, c.x, c.y);
      }
    }
    p.pop();

    // Stats
    p.fill(180);
    p.textSize(10);
    p.textAlign(p.LEFT);
    p.text("Generations: 5", 30, p.height - 20);
    p.text("Triangles: " + kiteDart.getTriangleCount() + " (Fat: " + kiteDart.getFatCount() + ", Thin: " + kiteDart.getThinCount() + ")", 480, p.height - 20);
    p.text("Fat/Thin ratio: " + kiteDart.getFatToThinRatio().toFixed(4) + " (φ ≈ 1.6180)", 480, p.height - 8);

    p.noLoop();
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
