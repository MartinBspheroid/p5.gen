/**
 * Test sketch for Worley noise (cellular noise).
 * Demonstrates different value functions and distance metrics.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "worley-noise",
  description: "Tests Worley noise - cellular/organic texture generation",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(240);

    // Draw 4 quadrants showing different Worley noise configurations
    const quadSize = 200;

    // Top-left: Basic F1 (nearest distance) with Euclidean metric
    drawWorleyQuadrant(0, 0, quadSize, {
      scale: 40,
      valueFunction: 'F1',
      distanceMetric: 'euclidean',
      seed: 42,
    });

    // Top-right: F2-F1 (cell borders) - creates a Voronoi-like pattern
    drawWorleyQuadrant(200, 0, quadSize, {
      scale: 40,
      valueFunction: 'F2-F1',
      distanceMetric: 'euclidean',
      invert: true,
      seed: 42,
    });

    // Bottom-left: Manhattan distance - creates diamond-shaped cells
    drawWorleyQuadrant(0, 200, quadSize, {
      scale: 40,
      valueFunction: 'F1',
      distanceMetric: 'manhattan',
      seed: 42,
    });

    // Bottom-right: Fractal Worley noise with multiple octaves
    drawWorleyQuadrant(200, 200, quadSize, {
      scale: 50,
      valueFunction: 'F1',
      distanceMetric: 'euclidean',
      octaves: 3,
      lacunarity: 2.0,
      gain: 0.5,
      seed: 42,
    });

    // Draw grid lines separating quadrants
    p.stroke(100);
    p.strokeWeight(2);
    p.line(200, 0, 200, 400);
    p.line(0, 200, 400, 200);

    // Add labels
    p.fill(0);
    p.noStroke();
    p.textSize(10);
    p.textAlign(p.LEFT, p.TOP);
    p.text('F1 Euclidean', 5, 5);
    p.text('F2-F1 (borders)', 205, 5);
    p.text('F1 Manhattan', 5, 205);
    p.text('Fractal (3 octaves)', 205, 205);

    p.noLoop();
  };

  function drawWorleyQuadrant(startX, startY, size, config) {
    p.loadPixels();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Get Worley noise value
        const value = config.octaves && config.octaves > 1
          ? worleyFractal(x, y, config)
          : worley(x, y, config);

        // Convert to grayscale
        const gray = Math.floor(value * 255);

        // Set pixel (accounting for position in canvas)
        const px = startX + x;
        const py = startY + y;
        const idx = (px + py * 400) * 4;
        p.pixels[idx] = gray;
        p.pixels[idx + 1] = gray;
        p.pixels[idx + 2] = gray;
        p.pixels[idx + 3] = 255;
      }
    }

    p.updatePixels();
  }

  p.draw = function() {};
`;
