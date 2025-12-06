/**
 * Test sketch for Poisson disc sampling.
 * Generates blue-noise distributed points.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "poisson-disc",
  description: "Tests PoissonDiscSampler - blue-noise point distribution",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(20);

    // Create sampler with minimum distance of 15px
    const sampler = new PoissonDiscSampler(400, 400, 15, 42);
    sampler.generate();

    // Draw points with varying colors based on position
    p.noStroke();

    for (const pt of sampler.points) {
      // Color based on position
      const hue = p.map(pt.x + pt.y, 0, 800, 150, 250);
      p.fill(hue, 200, 255, 200);
      p.circle(pt.x, pt.y, 6);
    }

    // Show point count
    p.fill(255);
    p.textAlign(p.CENTER);
    p.textSize(14);
    p.text(sampler.points.length + ' points', 200, 385);

    p.noLoop();
  };

  p.draw = function() {};
`;
