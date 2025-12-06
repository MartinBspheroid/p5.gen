/**
 * Test sketch for Catmull-Rom spline interpolation.
 * Creates smooth curves through control points.
 */

import type { SketchMeta } from "../lib/types";

export const meta: SketchMeta = {
  name: "catmull-rom",
  description: "Tests CatmullRomSpline - smooth curve interpolation",
  width: 400,
  height: 400,
  frameCount: 1,
  seed: 42,
};

export const sketch = `
  p.setup = function() {
    p.createCanvas(400, 400);
    p.background(240);

    // Define control points
    const controlPoints = [
      createVector(50, 350),
      createVector(100, 100),
      createVector(200, 300),
      createVector(300, 50),
      createVector(350, 200),
    ];

    // Create spline
    const spline = createCatmullRomSpline(controlPoints, {
      tension: 0.5,
      closed: false,
    });

    // Get interpolated points
    const curvePoints = spline.getPoints(100);

    // Draw the smooth curve
    p.stroke(60, 100, 200);
    p.strokeWeight(3);
    p.noFill();
    p.beginShape();
    for (const pt of curvePoints) {
      p.vertex(pt.x, pt.y);
    }
    p.endShape();

    // Draw control points
    p.fill(200, 60, 100);
    p.noStroke();
    for (const pt of controlPoints) {
      p.circle(pt.x, pt.y, 12);
    }

    // Draw connecting lines between control points
    p.stroke(200, 60, 100, 100);
    p.strokeWeight(1);
    for (let i = 0; i < controlPoints.length - 1; i++) {
      p.line(
        controlPoints[i].x, controlPoints[i].y,
        controlPoints[i + 1].x, controlPoints[i + 1].y
      );
    }

    // Test closed spline
    const closedPoints = [
      createVector(200, 280),
      createVector(150, 320),
      createVector(180, 370),
      createVector(220, 370),
      createVector(250, 320),
    ];

    const closedSpline = createCatmullRomSpline(closedPoints, {
      tension: 0.5,
      closed: true,
    });

    const closedCurve = closedSpline.getPoints(50);

    p.stroke(100, 180, 100);
    p.strokeWeight(2);
    p.noFill();
    p.beginShape();
    for (const pt of closedCurve) {
      p.vertex(pt.x, pt.y);
    }
    p.endShape(p.CLOSE);

    // Labels
    p.fill(50);
    p.noStroke();
    p.textSize(11);
    p.text('Open spline', 50, 30);
    p.text('Closed spline', 150, 265);

    p.noLoop();
  };

  p.draw = function() {};
`;
