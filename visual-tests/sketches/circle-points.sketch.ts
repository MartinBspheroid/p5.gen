/**
 * Test sketch for circlePoints utility.
 * Generates evenly spaced points along a circle's circumference.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "circle-points",
  description: "Tests circlePoints() - generates evenly spaced points on a circle",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(240);

    const center = createVector(200, 200);
    const points = circlePoints(center, 150, 24);

    // Draw the circle outline
    p.noFill();
    p.stroke(200);
    p.strokeWeight(1);
    p.circle(center.x, center.y, 300);

    // Draw points
    p.fill(50, 100, 200);
    p.noStroke();
    for (const pt of points) {
      p.circle(pt.x, pt.y, 12);
    }

    // Draw connections
    p.stroke(50, 100, 200, 100);
    p.strokeWeight(1);
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      p.line(a.x, a.y, b.x, b.y);
    }

    p.noLoop();
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
