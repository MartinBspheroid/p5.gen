/**
 * Test sketch for polygon clipping and hatching.
 * Demonstrates pen-plotter style hatching.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "polygon-hatching",
  description: "Tests Poly - polygon hatching for pen plotters",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(250);

    // Hatching is generated around origin - create shapes centered at (0,0), then translate when drawing

    // Create a hexagon centered at origin
    const hexagon = new Poly();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * TWO_PI - PI / 2;
      hexagon.addPoints(createVector(
        Math.cos(angle) * 100,
        Math.sin(angle) * 100
      ));
    }
    hexagon.addOutline();
    hexagon.addHatching(PI / 4, 6);

    // Create a square centered at origin
    const square = new Poly();
    square.addPoints(
      createVector(-50, -50),
      createVector(50, -50),
      createVector(50, 50),
      createVector(-50, 50)
    );
    square.addOutline();
    square.addHatching(-PI / 4, 6);

    // Create a circle centered at origin
    const circle = new Poly();
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * TWO_PI;
      circle.addPoints(createVector(
        Math.cos(angle) * 60,
        Math.sin(angle) * 60
      ));
    }
    circle.addOutline();
    circle.addHatching(PI / 3, 6);

    // Draw hexagon (translated to 150, 200)
    p.stroke(100, 100, 200);
    p.strokeWeight(1);
    hexagon.drawWith((p0, p1) => {
      p.line(p0.x + 150, p0.y + 200, p1.x + 150, p1.y + 200);
    });

    // Draw square (translated to 300, 150)
    p.stroke(200, 100, 100);
    square.drawWith((p0, p1) => {
      p.line(p0.x + 300, p0.y + 150, p1.x + 300, p1.y + 150);
    });

    // Draw circle (translated to 300, 300)
    p.stroke(100, 200, 100);
    circle.drawWith((p0, p1) => {
      p.line(p0.x + 300, p0.y + 300, p1.x + 300, p1.y + 300);
    });

    p.noLoop();
  };

  p.draw = function() {};
`;
