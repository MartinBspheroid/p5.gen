/**
 * Tests for advanced circle geometry functions:
 * - circumcenter
 * - tangentPoints
 * - smallestEnclosingCircle
 */
import { test, expect, describe, beforeAll } from "bun:test";

// Create a simple p5.Vector mock for testing
class Vector {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0
  ) {}

  static sub(v1: Vector, v2: Vector): Vector {
    return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  mag(): number {
    return Math.hypot(this.x, this.y, this.z);
  }

  dist(v: Vector): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.hypot(dx, dy, dz);
  }
}

// Set up p5.js-like globals for testing
beforeAll(() => {
  // @ts-expect-error - Assigning mock to global
  globalThis.createVector = (x = 0, y = 0, z = 0) => new Vector(x, y, z);
  // @ts-expect-error - Assigning to global
  globalThis.p5 = { Vector };
});

import { circumcenter, tangentPoints, smallestEnclosingCircle } from "./circle";

// ============================================================================
// Advanced Geometry - circumcenter() tests
// ============================================================================

describe("circumcenter", () => {
  test("right triangle (0,0), (4,0), (0,3) → circumcenter at (2, 1.5)", () => {
    const p1 = createVector(0, 0);
    const p2 = createVector(4, 0);
    const p3 = createVector(0, 3);

    const center = circumcenter(p1, p2, p3);

    expect(center).not.toBeNull();
    if (center !== null) {
      expect(center.x).toBeCloseTo(2, 5);
      expect(center.y).toBeCloseTo(1.5, 5);
    }
  });

  test("equilateral triangle → circumcenter at centroid", () => {
    // Equilateral triangle with side length 2
    const p1 = createVector(0, 0);
    const p2 = createVector(2, 0);
    const p3 = createVector(1, Math.sqrt(3));

    const center = circumcenter(p1, p2, p3);
    expect(center).not.toBeNull();

    if (center !== null) {
      // Centroid of equilateral triangle
      const centroidX = (p1.x + p2.x + p3.x) / 3;
      const centroidY = (p1.y + p2.y + p3.y) / 3;

      expect(center.x).toBeCloseTo(centroidX, 5);
      expect(center.y).toBeCloseTo(centroidY, 5);
    }
  });

  test("isoceles triangle", () => {
    const p1 = createVector(0, 0);
    const p2 = createVector(4, 0);
    const p3 = createVector(2, 3);

    const center = circumcenter(p1, p2, p3);

    expect(center).not.toBeNull();
    if (center !== null) {
      // Verify circumcenter is equidistant from all three points
      const d1 = center.dist(p1);
      const d2 = center.dist(p2);
      const d3 = center.dist(p3);

      expect(d1).toBeCloseTo(d2, 5);
      expect(d2).toBeCloseTo(d3, 5);
      expect(d1).toBeCloseTo(d3, 5);
    }
  });

  test("collinear points → returns null", () => {
    const p1 = createVector(0, 0);
    const p2 = createVector(2, 2);
    const p3 = createVector(4, 4);

    const center = circumcenter(p1, p2, p3);

    expect(center).toBeNull();
  });

  test("collinear horizontal points → returns null", () => {
    const p1 = createVector(0, 5);
    const p2 = createVector(3, 5);
    const p3 = createVector(7, 5);

    const center = circumcenter(p1, p2, p3);

    expect(center).toBeNull();
  });

  test("verify circumcenter is equidistant from all three points", () => {
    const p1 = createVector(1, 1);
    const p2 = createVector(5, 1);
    const p3 = createVector(3, 4);

    const center = circumcenter(p1, p2, p3);

    expect(center).not.toBeNull();
    if (center !== null) {
      const d1 = center.dist(p1);
      const d2 = center.dist(p2);
      const d3 = center.dist(p3);

      expect(d1).toBeCloseTo(d2, 5);
      expect(d2).toBeCloseTo(d3, 5);
      expect(d1).toBeCloseTo(d3, 5);
    }
  });

  test("triangle with negative coordinates", () => {
    const p1 = createVector(-2, -2);
    const p2 = createVector(2, -2);
    const p3 = createVector(0, 2);

    const center = circumcenter(p1, p2, p3);

    expect(center).not.toBeNull();
    if (center !== null) {
      const d1 = center.dist(p1);
      const d2 = center.dist(p2);
      const d3 = center.dist(p3);

      expect(d1).toBeCloseTo(d2, 5);
      expect(d2).toBeCloseTo(d3, 5);
    }
  });
});

// ============================================================================
// Advanced Geometry - tangentPoints() tests
// ============================================================================

describe("tangentPoints", () => {
  test("point inside circle → returns []", () => {
    const point = createVector(1, 1);
    const center = createVector(0, 0);
    const r = 5;

    const tangents = tangentPoints(point, center, r);

    expect(tangents).toEqual([]);
  });

  test("point on circle boundary → returns 1 point (the point itself)", () => {
    const center = createVector(0, 0);
    const r = 5;
    const point = createVector(5, 0);

    const tangents = tangentPoints(point, center, r);

    expect(tangents.length).toBe(1);
    if (tangents[0]) {
      expect(tangents[0].x).toBeCloseTo(point.x, 5);
      expect(tangents[0].y).toBeCloseTo(point.y, 5);
    }
  });

  test("point outside circle → returns 2 points", () => {
    const point = createVector(10, 0);
    const center = createVector(0, 0);
    const r = 5;

    const tangents = tangentPoints(point, center, r);

    expect(tangents.length).toBe(2);
  });

  test("verify tangent points are on the circle", () => {
    const point = createVector(10, 0);
    const center = createVector(0, 0);
    const r = 5;

    const tangents = tangentPoints(point, center, r);

    expect(tangents.length).toBe(2);

    if (tangents[0] && tangents[1]) {
      const dist1 = center.dist(tangents[0]);
      const dist2 = center.dist(tangents[1]);

      expect(dist1).toBeCloseTo(r, 5);
      expect(dist2).toBeCloseTo(r, 5);
    }
  });

  test("verify lines from external point to tangent points are perpendicular to radius", () => {
    const point = createVector(10, 0);
    const center = createVector(0, 0);
    const r = 5;

    const tangents = tangentPoints(point, center, r);

    expect(tangents.length).toBe(2);

    if (tangents[0] && tangents[1]) {
      // Vector from center to tangent point
      const radius1 = createVector(tangents[0].x - center.x, tangents[0].y - center.y);
      const radius2 = createVector(tangents[1].x - center.x, tangents[1].y - center.y);

      // Vector from tangent point to external point
      const toPoint1 = createVector(point.x - tangents[0].x, point.y - tangents[0].y);
      const toPoint2 = createVector(point.x - tangents[1].x, point.y - tangents[1].y);

      // Dot product should be zero for perpendicular vectors
      const dot1 = radius1.x * toPoint1.x + radius1.y * toPoint1.y;
      const dot2 = radius2.x * toPoint2.x + radius2.y * toPoint2.y;

      expect(dot1).toBeCloseTo(0, 5);
      expect(dot2).toBeCloseTo(0, 5);
    }
  });

  test("point directly to the right of circle", () => {
    const point = createVector(13, 0);
    const center = createVector(0, 0);
    const r = 5;

    const tangents = tangentPoints(point, center, r);

    expect(tangents.length).toBe(2);

    if (tangents[0] && tangents[1]) {
      // Both tangent points should be on the circle
      expect(center.dist(tangents[0])).toBeCloseTo(r, 5);
      expect(center.dist(tangents[1])).toBeCloseTo(r, 5);

      // One should be above x-axis, one below
      const y1 = tangents[0].y;
      const y2 = tangents[1].y;
      expect(y1 * y2).toBeLessThan(0.01); // Different signs or very close to zero
    }
  });

  test("point at 45 degrees from circle", () => {
    const point = createVector(10, 10);
    const center = createVector(0, 0);
    const r = 5;

    const tangents = tangentPoints(point, center, r);

    expect(tangents.length).toBe(2);

    if (tangents[0] && tangents[1]) {
      // Verify both points are on the circle
      expect(center.dist(tangents[0])).toBeCloseTo(r, 5);
      expect(center.dist(tangents[1])).toBeCloseTo(r, 5);

      // Verify both are equidistant from the external point
      expect(point.dist(tangents[0])).toBeCloseTo(point.dist(tangents[1]), 5);
    }
  });

  test("point on negative side of circle", () => {
    const point = createVector(-10, 0);
    const center = createVector(0, 0);
    const r = 3;

    const tangents = tangentPoints(point, center, r);

    expect(tangents.length).toBe(2);

    if (tangents[0] && tangents[1]) {
      expect(center.dist(tangents[0])).toBeCloseTo(r, 5);
      expect(center.dist(tangents[1])).toBeCloseTo(r, 5);
    }
  });
});

// ============================================================================
// Advanced Geometry - smallestEnclosingCircle() tests
// ============================================================================

describe("smallestEnclosingCircle", () => {
  test("empty array → returns null", () => {
    const points: p5.Vector[] = [];
    const circle = smallestEnclosingCircle(points);

    expect(circle).toBeNull();
  });

  test("single point → returns circle with radius 0 at that point", () => {
    const points = [createVector(3, 4)];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      expect(circle.center.x).toBeCloseTo(3, 5);
      expect(circle.center.y).toBeCloseTo(4, 5);
      expect(circle.radius).toBeCloseTo(0, 5);
    }
  });

  test("two points → returns circle with diameter between them", () => {
    const points = [createVector(0, 0), createVector(4, 0)];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      // Center should be at midpoint
      expect(circle.center.x).toBeCloseTo(2, 5);
      expect(circle.center.y).toBeCloseTo(0, 5);
      // Radius should be half the distance
      expect(circle.radius).toBeCloseTo(2, 5);
    }
  });

  test("three points forming a triangle → circumscribed circle", () => {
    const points = [createVector(0, 0), createVector(4, 0), createVector(0, 3)];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      // Verify all points are on or inside the circle
      for (const point of points) {
        const dist = circle.center.dist(point);
        expect(dist).toBeLessThanOrEqual(circle.radius + 0.00001);
      }

      // For a right triangle, circumcenter should be at midpoint of hypotenuse
      const hypotenuse = Math.sqrt(4 * 4 + 3 * 3);
      expect(circle.radius).toBeCloseTo(hypotenuse / 2, 5);
    }
  });

  test("four points in a square → circle should enclose all", () => {
    const points = [createVector(0, 0), createVector(2, 0), createVector(2, 2), createVector(0, 2)];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      // Center should be at center of square
      expect(circle.center.x).toBeCloseTo(1, 5);
      expect(circle.center.y).toBeCloseTo(1, 5);

      // Radius should be diagonal distance / 2 = sqrt(2)
      expect(circle.radius).toBeCloseTo(Math.sqrt(2), 5);

      // Verify all points are enclosed
      for (const point of points) {
        const dist = circle.center.dist(point);
        expect(dist).toBeLessThanOrEqual(circle.radius + 0.00001);
      }
    }
  });

  test("points in a line → smallest circle with all points", () => {
    const points = [createVector(0, 0), createVector(1, 0), createVector(2, 0), createVector(3, 0)];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      // Center should be at midpoint of endpoints
      expect(circle.center.x).toBeCloseTo(1.5, 5);
      expect(circle.center.y).toBeCloseTo(0, 5);

      // Radius should be half the total length
      expect(circle.radius).toBeCloseTo(1.5, 5);

      // Verify all points are enclosed
      for (const point of points) {
        const dist = circle.center.dist(point);
        expect(dist).toBeLessThanOrEqual(circle.radius + 0.00001);
      }
    }
  });

  test("verify all input points are inside or on the returned circle", () => {
    const points = [
      createVector(1, 1),
      createVector(5, 1),
      createVector(5, 5),
      createVector(1, 5),
      createVector(3, 3),
    ];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      for (const point of points) {
        const dist = circle.center.dist(point);
        expect(dist).toBeLessThanOrEqual(circle.radius + 0.00001);
      }
    }
  });

  test("verify the circle is minimal - random points", () => {
    const points = [
      createVector(0, 0),
      createVector(3, 0),
      createVector(1, 2),
      createVector(2, 3),
      createVector(4, 1),
    ];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      // All points should be inside or on the circle
      for (const point of points) {
        const dist = circle.center.dist(point);
        expect(dist).toBeLessThanOrEqual(circle.radius + 0.00001);
      }

      // At least one point should be on the boundary (or very close)
      let hasPointOnBoundary = false;
      for (const point of points) {
        const dist = circle.center.dist(point);
        if (Math.abs(dist - circle.radius) < 0.00001) {
          hasPointOnBoundary = true;
          break;
        }
      }
      expect(hasPointOnBoundary).toBe(true);
    }
  });

  test("three collinear points", () => {
    const points = [createVector(0, 0), createVector(5, 0), createVector(10, 0)];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      // Should use the two endpoints as diameter
      expect(circle.center.x).toBeCloseTo(5, 5);
      expect(circle.center.y).toBeCloseTo(0, 5);
      expect(circle.radius).toBeCloseTo(5, 5);
    }
  });

  test("points with negative coordinates", () => {
    const points = [createVector(-2, -2), createVector(2, -2), createVector(2, 2), createVector(-2, 2)];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      expect(circle.center.x).toBeCloseTo(0, 5);
      expect(circle.center.y).toBeCloseTo(0, 5);

      for (const point of points) {
        const dist = circle.center.dist(point);
        expect(dist).toBeLessThanOrEqual(circle.radius + 0.00001);
      }
    }
  });

  test("many points in a circle", () => {
    // Create points on a circle of radius 5
    const centerX = 10;
    const centerY = 10;
    const radius = 5;
    const numPoints = 8;

    const points: p5.Vector[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * (2 * Math.PI);
      points.push(createVector(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)));
    }

    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      expect(circle.center.x).toBeCloseTo(centerX, 2);
      expect(circle.center.y).toBeCloseTo(centerY, 2);
      expect(circle.radius).toBeCloseTo(radius, 2);
    }
  });
});
