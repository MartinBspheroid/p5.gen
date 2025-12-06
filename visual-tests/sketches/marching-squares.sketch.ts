/**
 * Test sketch for Marching Squares algorithm.
 * Extracts contours from a scalar field.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "marching-squares",
  description: "Tests marchingSquares() - contour extraction from scalar field",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(20);

    const noise = new SimplexNoise2D(42);
    const resolution = 5;
    const cols = Math.ceil(400 / resolution);
    const rows = Math.ceil(400 / resolution);

    // Create scalar field from noise
    // Note: fbm2D expects raw pixel coords and high frequency (gets divided by 1000 internally)
    const field = [];
    for (let y = 0; y < rows; y++) {
      field[y] = [];
      for (let x = 0; x < cols; x++) {
        // Use pixel-space coords with high frequency value
        field[y][x] = fbm2D(noise, x * resolution, y * resolution, 150, 4);
      }
    }

    // Extract contours at different thresholds
    const thresholds = [-0.3, 0, 0.3];
    const colors = [
      [60, 100, 200],
      [200, 200, 200],
      [200, 100, 60],
    ];

    for (let i = 0; i < thresholds.length; i++) {
      const result = marchingSquares(field, thresholds[i], cols, rows);
      const segments = marchingSquaresToSegments(result, cols, rows, resolution);

      p.stroke(...colors[i], 200);
      p.strokeWeight(1.5);
      p.noFill();

      for (const seg of segments) {
        p.line(seg.x1, seg.y1, seg.x2, seg.y2);
      }
    }

    // Legend
    p.noStroke();
    p.textSize(10);
    for (let i = 0; i < thresholds.length; i++) {
      p.fill(...colors[i]);
      p.rect(10, 10 + i * 20, 15, 15);
      p.fill(255);
      p.text('threshold: ' + thresholds[i], 30, 22 + i * 20);
    }

    p.noLoop();
  };

  p.draw = function() {};
`;
