/**
 * Test sketch for arcPoints utility.
 * Generates points along an arc segment.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "arc-points",
  description: "Tests arcPoints() - generates points along an arc",
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

    // Draw multiple arcs with different angles
    const arcs = [
      { start: 0, end: PI / 2, radius: 150, color: [220, 60, 60] },
      { start: PI / 2, end: PI, radius: 120, color: [60, 180, 60] },
      { start: PI, end: PI * 1.5, radius: 90, color: [60, 60, 220] },
      { start: PI * 1.5, end: TWO_PI, radius: 60, color: [220, 160, 60] },
    ];

    for (const arc of arcs) {
      const points = arcPoints(center, arc.radius, arc.start, arc.end, 12);

      // Draw arc line
      p.stroke(...arc.color, 100);
      p.strokeWeight(2);
      p.noFill();
      p.beginShape();
      for (const pt of points) {
        p.vertex(pt.x, pt.y);
      }
      p.endShape();

      // Draw points
      p.fill(...arc.color);
      p.noStroke();
      for (const pt of points) {
        p.circle(pt.x, pt.y, 8);
      }
    }

    // Draw center
    p.fill(50);
    p.circle(center.x, center.y, 10);

    p.noLoop();
  };

  p.draw = function() {};
`;
