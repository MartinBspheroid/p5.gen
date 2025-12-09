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
  height: 450,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(600, 450);
    p.background(240);

    const padding = 20;
    const spacingX = 200 - padding;
    const spacingY = 150 - padding;

    // Row 1: Order 2
    p.drawLabel(50, 20, "Order 2");
    const points2 = generatePeanoCurve(20, 50, spacingX, 2);
    p.drawCurve(points2);

    // Row 2: Order 3
    p.drawLabel(250, 20, "Order 3");
    const points3 = generatePeanoCurve(220, 50, spacingX, 3);
    p.drawCurve(points3);

    // Row 3: Order 4
    p.drawLabel(450, 20, "Order 4");
    const points4 = generatePeanoCurve(420, 50, spacingX, 4);
    p.drawCurve(points4);

    // Draw point counts as text
    const y2 = calculatePointCount(2);
    const y3 = calculatePointCount(3);
    const y4 = calculatePointCount(4);

    p.fill(100);
    p.textAlign(p.CENTER);
    p.textSize(11);
    p.text(\`Points: \${y2}\`, 100, 180);
    p.text(\`Points: \${y3}\`, 300, 180);
    p.text(\`Points: \${y4}\`, 500, 180);

    p.noLoop();
  };

  p.drawCurve = function(points) {
    p.stroke(33, 150, 243);
    p.strokeWeight(1.5);
    p.noFill();
    p.beginShape();
    for (let i = 0; i < points.length; i++) {
      p.vertex(points[i].x, points[i].y);
    }
    p.endShape();
  };

  p.drawLabel = function(x, y, label) {
    p.fill(50);
    p.textAlign(p.CENTER);
    p.textSize(14);
    p.text(label, x + 90, y + 15);
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
