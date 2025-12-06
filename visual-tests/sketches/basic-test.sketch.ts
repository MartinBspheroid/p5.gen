/**
 * Basic test sketch - no library dependencies.
 * Verifies p5.js is loading correctly.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "basic-test",
  description: "Basic p5.js test without library dependencies",
  width: 200,
  height: 200,
  frameCount: 1,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(200, 200);
    p.background(100, 150, 200);

    p.fill(255);
    p.noStroke();
    p.ellipse(100, 100, 100, 100);

    p.fill(50, 50, 50);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(16);
    p.text('p5.js works!', 100, 100);

    p.noLoop();
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
