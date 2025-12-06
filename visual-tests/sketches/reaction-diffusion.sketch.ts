/**
 * Test sketch for Gray-Scott reaction-diffusion.
 * Simulates organic pattern formation.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "reaction-diffusion",
  description: "Tests GrayScott - reaction-diffusion pattern simulation",
  width: 200,
  height: 200,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(200, 200);
    p.background(20);

    // Create Gray-Scott simulation (width, height, k, f)
    const gs = new GrayScott(200, 200, 0.062, 0.055);
    const rng = new SeededRandom(42);

    // Seed with some initial patterns
    gs.addInitialSeed(100, 100, rng);
    gs.addInitialSeed(50, 50, rng);
    gs.addInitialSeed(150, 150, rng);
    gs.addInitialSeed(50, 150, rng);
    gs.addInitialSeed(150, 50, rng);
    gs.addInitialSeed(75, 125, rng);
    gs.addInitialSeed(125, 75, rng);

    // Run simulation for many iterations
    for (let i = 0; i < 3000; i++) {
      gs.step();
    }

    // Render the result using foreachCell
    p.loadPixels();
    gs.foreachCell((x, y, a, b, normA, normB) => {
      const brightness = normB * 255;
      const idx = (x + y * 200) * 4;
      p.pixels[idx] = brightness * 0.4;
      p.pixels[idx + 1] = brightness * 0.7;
      p.pixels[idx + 2] = brightness;
      p.pixels[idx + 3] = 255;
    });
    p.updatePixels();

    p.noLoop();
  };

  p.draw = function() {};
`;
