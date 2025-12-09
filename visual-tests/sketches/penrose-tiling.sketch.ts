/**
 * Visual test for Penrose Tiling algorithm
 *
 * Displays a Penrose tiling using L-System generation
 * showing the aperiodic, non-repeating rhombus pattern
 */

import type { SketchMeta } from '../lib/types';

export const meta: SketchMeta = {
  name: 'penrose-tiling',
  description: 'Tests Penrose L-System tiling generation',
  width: 710,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(710, 400);
    p.background(0);

    p.fill(255);
    p.textAlign(p.LEFT);
    p.textSize(13);
    p.text("Penrose Tiling - L-System Generation (5 generations)", 15, 20);

    // Create Penrose L-system tiling with 5 generations
    const tiling = createPenroseTiling(5, 460);

    // Get render commands and draw them
    const commands = tiling.getRenderCommands();

    p.push();
    p.translate(p.width / 2, p.height / 2);
    p.stroke(255, 100);
    p.strokeWeight(0.5);
    p.noFill();

    for (const cmd of commands) {
      if (cmd.type === 'line') {
        p.line(cmd.x1, cmd.y1, cmd.x2, cmd.y2);
      }
    }

    p.pop();

    p.noLoop();
  };

  p.draw = function() {
    // Required for frameCount to increment
  };
`;
