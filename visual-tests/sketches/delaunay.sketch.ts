/**
 * Test sketch for Delaunay triangulation.
 * Creates mesh from random points.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "delaunay",
  description: "Tests triangulate() - Delaunay triangulation mesh generation",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(20);

    // Generate random points using Poisson disc for nice distribution
    const sampler = new PoissonDiscSampler(380, 380, 40, 42);
    sampler.generate();

    // Offset points to center
    const points = sampler.points.map(pt => createVector(pt.x + 10, pt.y + 10));

    // Add corner points for full coverage
    points.push(createVector(5, 5));
    points.push(createVector(395, 5));
    points.push(createVector(5, 395));
    points.push(createVector(395, 395));

    // Triangulate
    const triangulation = triangulate(points);

    // Draw triangles with color based on area
    p.strokeWeight(1);

    for (const tri of triangulation.triangles) {
      // Calculate centroid for coloring
      const cx = (tri.p1.x + tri.p2.x + tri.p3.x) / 3;
      const cy = (tri.p1.y + tri.p2.y + tri.p3.y) / 3;

      // Color based on position
      const r = p.map(cx, 0, 400, 50, 150);
      const g = p.map(cy, 0, 400, 100, 200);
      const b = 200;

      p.fill(r, g, b, 100);
      p.stroke(r + 50, g + 50, b + 50, 200);

      p.triangle(
        tri.p1.x, tri.p1.y,
        tri.p2.x, tri.p2.y,
        tri.p3.x, tri.p3.y
      );
    }

    // Draw points
    p.fill(255);
    p.noStroke();
    for (const pt of points) {
      p.circle(pt.x, pt.y, 4);
    }

    // Info
    p.fill(255);
    p.textSize(12);
    p.text(points.length + ' points, ' + triangulation.triangles.length + ' triangles', 10, 390);

    p.noLoop();
  };

  p.draw = function() {};
`;
