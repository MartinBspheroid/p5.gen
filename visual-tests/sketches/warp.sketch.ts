/**
 * Test sketch for domain warping.
 * Demonstrates progressive domain distortion using FBM noise.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "warp",
  description: "Tests domain warping - organic pattern distortion using noise",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(240);

    // Create noise generator with fixed seed for reproducible results
    const noise = new SimplexNoise2D(42);

    // Draw 4 quadrants showing warping progression
    const quadSize = 200;

    // Frequency settings - fbm2D divides by 1000, so these give ~3-4 noise units across 200px
    const baseFreq = 18;   // ~3.6 noise periods across quadrant for smooth patterns
    const warpFreq = 12;   // Lower frequency for warping to create larger distortions

    // Top-left: Basic FBM pattern (no warping)
    drawFbmQuadrant(0, 0, quadSize, noise, baseFreq);

    // Top-right: Single warp - fbm(p + 4.0 * fbm(p))
    drawWarpQuadrant(200, 0, quadSize, noise, 1, baseFreq, warpFreq);

    // Bottom-left: Double warp - fbm(p + 4.0 * fbm(p + 4.0 * fbm(p)))
    drawWarpQuadrant(0, 200, quadSize, noise, 2, baseFreq, warpFreq);

    // Bottom-right: Colored warp visualization using intermediate values
    drawColoredWarpQuadrant(200, 200, quadSize, noise, baseFreq, warpFreq);

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
    p.text('Basic FBM', 5, 5);
    p.text('Single Warp', 205, 5);
    p.text('Double Warp', 5, 205);
    p.text('Colored Warp', 205, 205);

    p.noLoop();
  };

  // Normalize FBM value from approx [-1.75, 1.75] to [0, 1]
  function normalizeFbm(value) {
    return Math.max(0, Math.min(1, (value + 1.75) / 3.5));
  }

  function drawFbmQuadrant(startX, startY, size, noise, freq) {
    p.loadPixels();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Basic FBM pattern
        const value = fbm2D(noise, x, y, freq, 4);

        // Normalize and convert to grayscale
        const normalized = normalizeFbm(value);
        const gray = Math.floor(normalized * 255);

        // Set pixel
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

  function drawWarpQuadrant(startX, startY, size, noise, levels, baseFreq, warpFreq) {
    p.loadPixels();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Warped FBM pattern with appropriate frequencies
        const value = warpFbm2D(noise, x, y, baseFreq, 4, warpFreq, 3, 4.0, levels);

        // Normalize and convert to grayscale
        const normalized = normalizeFbm(value);
        const gray = Math.floor(normalized * 255);

        // Set pixel
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

  function drawColoredWarpQuadrant(startX, startY, size, noise, baseFreq, warpFreq) {
    p.loadPixels();

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // Get warped value with intermediate warp values
        const result = warp2DWithIntermediates(
          (px, py) => fbm2D(noise, px, py, baseFreq, 4),
          (px, py) => fbm2D(noise, px, py, warpFreq, 3),
          x, y, 4.0, 2
        );

        // Normalize and map to primary colors:
        // Red: Final warped value
        // Green: First warp intermediate (magnitude, already positive)
        // Blue: Second warp intermediate (magnitude, already positive)
        const red = Math.floor(normalizeFbm(result.value) * 255);
        const green = result.intermediates[0] ? Math.floor(Math.min(1, result.intermediates[0] * 0.7) * 255) : 0;
        const blue = result.intermediates[1] ? Math.floor(Math.min(1, result.intermediates[1] * 0.7) * 255) : 0;

        // Set pixel
        const px = startX + x;
        const py = startY + y;
        const idx = (px + py * 400) * 4;
        p.pixels[idx] = red;
        p.pixels[idx + 1] = green;
        p.pixels[idx + 2] = blue;
        p.pixels[idx + 3] = 255;
      }
    }

    p.updatePixels();
  }

  p.draw = function() {};
`;