/**
 * Visual test for Peano Curve algorithm
 *
 * Displays Peano curves at different recursion orders (2, 3, 4)
 * to verify the space-filling fractal curve generation
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "peano-curve",
  description:
    "Tests generatePeanoCurve() - space-filling fractal curve at different orders",
  width: 600,
  height: 240,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(600, 240);
    p.background(245);

    const tileSize = 140;
    const tileWidth = tileSize;
    const tileHeight = tileSize;

    // Row 1: Order 2
    p.fill(50);
    p.textAlign(p.LEFT);
    p.textSize(12);
    p.text("Order 2", 10, 20);

    p.fill(255);
    p.stroke(200);
    p.strokeWeight(1);
    p.rect(5, 30, tileWidth, tileHeight);

    const points2 = generatePeanoCurve(10, 35, tileWidth - 10, 2);
    p.drawCurve(points2);

    p.fill(100);
    p.textSize(10);
    p.text(\`Points: \${points2.length}\`, 10, 190);

    // Row 2: Order 3
    p.fill(50);
    p.textSize(12);
    p.text("Order 3", 210, 20);

    p.fill(255);
    p.stroke(200);
    p.strokeWeight(1);
    p.rect(205, 30, tileWidth, tileHeight);

    const points3 = generatePeanoCurve(210, 35, tileWidth - 10, 3);
    p.drawCurve(points3);

    p.fill(100);
    p.textSize(10);
    p.text(\`Points: \${points3.length}\`, 210, 190);

    // Row 3: Order 4
    p.fill(50);
    p.textSize(12);
    p.text("Order 4", 410, 20);

    p.fill(255);
    p.stroke(200);
    p.strokeWeight(1);
    p.rect(405, 30, tileWidth, tileHeight);

    const points4 = generatePeanoCurve(410, 35, tileWidth - 10, 4);
    p.drawCurve(points4);

    p.fill(100);
    p.textSize(10);
    p.text(\`Points: \${points4.length}\`, 410, 190);

    p.fill(50);
    p.textSize(11);
    p.text("Space-filling Peano Curve - L-System (Paul Bourke)", 10, 220);

    p.noLoop();
  };

  p.drawCurve = function(points) {
    p.stroke(33, 150, 243);
    p.strokeWeight(1);
    p.noFill();
    if (points.length > 1) {
      p.beginShape();
      for (let i = 0; i < points.length; i++) {
        p.vertex(points[i].x, points[i].y);
      }
      p.endShape();
    }
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
