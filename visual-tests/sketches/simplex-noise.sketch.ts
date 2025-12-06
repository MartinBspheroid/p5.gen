/**
 * Test sketch for Simplex noise, FBM, and Curl noise.
 * Visualizes different noise functions.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "simplex-noise",
  description: "Tests SimplexNoise2D, fbm2D, curlNoise2D - noise generation",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 12345,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(20);

    const noise = new SimplexNoise2D(12345);
    const simplexScale = 0.02;

    // Draw simplex noise as grayscale in top-left (raw simplex needs manual scaling)
    p.loadPixels();
    for (let x = 0; x < 200; x++) {
      for (let y = 0; y < 200; y++) {
        const val = noise.noise2D(x * simplexScale, y * simplexScale);
        const brightness = p.map(val, -1, 1, 0, 255);
        const idx = (x + y * 400) * 4;
        p.pixels[idx] = brightness;
        p.pixels[idx + 1] = brightness;
        p.pixels[idx + 2] = brightness;
        p.pixels[idx + 3] = 255;
      }
    }

    // Draw FBM noise in top-right (pass raw pixel coords - fbm2D handles scaling internally)
    // Frequency needs to be high (100+) because it gets divided by 1000 internally
    for (let x = 200; x < 400; x++) {
      for (let y = 0; y < 200; y++) {
        const val = fbm2D(noise, x - 200, y, 100, 4);
        const brightness = p.map(val, -2, 2, 0, 255);
        const idx = (x + y * 400) * 4;
        p.pixels[idx] = brightness;
        p.pixels[idx + 1] = brightness * 0.8;
        p.pixels[idx + 2] = brightness * 0.6;
        p.pixels[idx + 3] = 255;
      }
    }
    p.updatePixels();

    // Draw curl noise flow field in bottom half (use raw pixel coords)
    const fbmFn = (x, y) => fbm2D(noise, x, y, 100, 4);

    p.stroke(100, 200, 255, 150);
    p.strokeWeight(1);

    const step = 15;
    const len = 12;

    for (let x = step; x < 400; x += step) {
      for (let y = 200 + step; y < 400; y += step) {
        const vel = curlNoise2D(x, y, fbmFn, 1.0);
        vel.normalize().mult(len);

        p.line(x, y, x + vel.x, y + vel.y);
      }
    }

    // Labels
    p.fill(255);
    p.noStroke();
    p.textSize(12);
    p.textAlign(p.CENTER);
    p.text('Simplex', 100, 190);
    p.text('FBM', 300, 190);
    p.text('Curl Noise Flow Field', 200, 390);

    p.noLoop();
  };

  p.draw = function() {};
`;
