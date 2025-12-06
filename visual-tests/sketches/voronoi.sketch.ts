/**
 * Test sketch for Voronoi diagrams.
 * Spatial partitioning visualization.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "voronoi",
  description: "Tests VoronoiDiagram - spatial partitioning",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(240);

    // Create Voronoi diagram
    const voronoi = createVoronoi({
      resolution: 2,
      edgeThreshold: 5,
    });

    // Generate and add seed points
    const rng = new SeededRandom(42);
    const seeds = [];
    for (let i = 0; i < 20; i++) {
      const x = 30 + rng.next() * 340;
      const y = 30 + rng.next() * 340;
      voronoi.addSeed(x, y);
      seeds.push(createVector(x, y));
    }

    // Generate colors for each region
    const colors = [];
    for (let i = 0; i < seeds.length; i++) {
      const hue = (i * 137.5) % 360;
      colors.push([
        Math.floor(p.map(Math.sin(hue * 0.017), -1, 1, 100, 220)),
        Math.floor(p.map(Math.cos(hue * 0.017), -1, 1, 100, 200)),
        Math.floor(p.map(Math.sin((hue + 90) * 0.017), -1, 1, 150, 230))
      ]);
    }

    // Draw regions by querying each pixel
    p.loadPixels();
    for (let x = 0; x < 400; x++) {
      for (let y = 0; y < 400; y++) {
        const query = voronoi.queryRegion(x, y);
        const col = colors[query.seedIndex];
        const idx = (x + y * 400) * 4;
        p.pixels[idx] = col[0];
        p.pixels[idx + 1] = col[1];
        p.pixels[idx + 2] = col[2];
        p.pixels[idx + 3] = 255;
      }
    }
    p.updatePixels();

    // Draw edges
    const bounds = { x: 0, y: 0, width: 400, height: 400 };
    const edges = voronoi.getEdgePoints(bounds);

    p.stroke(50, 50, 50, 100);
    p.strokeWeight(1);
    for (const edge of edges) {
      p.point(edge.point.x, edge.point.y);
    }

    // Draw seed points
    p.fill(30);
    p.noStroke();
    for (const seed of seeds) {
      p.circle(seed.x, seed.y, 8);
    }

    // White dot in center of each seed
    p.fill(255);
    for (const seed of seeds) {
      p.circle(seed.x, seed.y, 3);
    }

    p.noLoop();
  };

  p.draw = function() {};
`;
