/**
 * Test sketch for recursive triangle subdivision.
 * Creates fractal triangle patterns.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "triangle-subdivision",
  description: "Tests subdivideTriangleRoot() - recursive triangle subdivision",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(240);

    // Custom random function with seed
    const rng = new SeededRandom(42);
    const randomFn = () => rng.next();

    // Subdivide from root position
    const position = createVector(200, 50);
    const heading = PI / 2;  // pointing down
    const height = 300;

    const triangles = subdivideTriangleRoot(position, heading, height, {
      splitProbability: 0.85,
      startRes: 5,
      minRes: 1,
      rng: randomFn,
    });

    // Draw triangles
    p.strokeWeight(1);

    for (const tri of triangles) {
      const verts = triangleVertices(tri);

      // Color based on generation
      const gen = tri.generation;
      const hue = p.map(gen, 1, 5, 180, 280);
      const sat = p.map(gen, 1, 5, 100, 200);
      p.fill(hue, sat, 240, 40);
      p.stroke(hue - 20, sat, 150);

      p.triangle(
        verts[0].x, verts[0].y,
        verts[1].x, verts[1].y,
        verts[2].x, verts[2].y
      );
    }

    // Info
    p.fill(50);
    p.noStroke();
    p.textSize(12);
    p.text(triangles.length + ' triangles', 10, 390);

    p.noLoop();
  };

  p.draw = function() {};
`;
