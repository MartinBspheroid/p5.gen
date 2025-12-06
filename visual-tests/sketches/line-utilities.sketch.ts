/**
 * Test sketch for line utilities.
 * Tests distance, lerp, and lerpLine functions.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "line-utilities",
  description: "Tests distance(), lerp(), lerpLine() - line interpolation",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(240);

    // Test lerpLine - interpolate points along a line
    const p1 = createVector(50, 350);
    const p2 = createVector(350, 50);

    // Draw the main line
    p.stroke(200);
    p.strokeWeight(2);
    p.line(p1.x, p1.y, p2.x, p2.y);

    // Generate interpolated points
    const interpolated = lerpLine(p1, p2, { steps: 10 });

    // Draw interpolated points with varying sizes
    p.noStroke();
    for (let i = 0; i < interpolated.length; i++) {
      const pt = interpolated[i];
      const t = i / (interpolated.length - 1);

      // Color gradient from blue to red
      p.fill(p.lerpColor(p.color(60, 100, 200), p.color(200, 60, 100), t));
      p.circle(pt.x, pt.y, 15 + t * 15);
    }

    // Show distance calculation
    const dist = distance(p1, p2);
    p.fill(50);
    p.noStroke();
    p.textAlign(p.CENTER);
    p.textSize(14);
    p.text('distance: ' + dist.toFixed(1) + 'px', 200, 380);

    // Test lerp with single point
    const midPoint = lerp(p1, p2, 0.5);
    p.stroke(50);
    p.strokeWeight(2);
    p.noFill();
    p.circle(midPoint.x, midPoint.y, 30);

    p.noLoop();
  };

  p.draw = function() {};
`;
