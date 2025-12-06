/**
 * Test sketch for circle packing.
 * Fills space with non-overlapping circles.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "circle-packing",
  description: "Tests CirclePacker, quickPack - space-filling circle layouts",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(20);

    // Use quickPack for simple circle packing
    const packed = quickPack({
      bounds: { x: 20, y: 20, width: 360, height: 360 },
      minRadius: 5,
      maxRadius: 40,
      padding: 2,
      maxCircles: 200,
      seed: 42,
    });

    // Draw circles with gradient colors
    p.noStroke();

    for (const circle of packed) {
      // Color based on size
      const t = p.map(circle.radius, 5, 40, 0, 1);
      const r = p.lerp(60, 220, t);
      const g = p.lerp(180, 80, t);
      const b = p.lerp(220, 120, t);

      p.fill(r, g, b, 200);
      p.circle(circle.x, circle.y, circle.radius * 2);

      // Add highlight
      p.fill(255, 255, 255, 50);
      p.circle(
        circle.x - circle.radius * 0.2,
        circle.y - circle.radius * 0.2,
        circle.radius * 0.6
      );
    }

    // Info
    p.fill(255);
    p.textSize(12);
    p.text(packed.length + ' circles', 10, 390);

    p.noLoop();
  };

  p.draw = function() {};
`;
