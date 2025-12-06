/**
 * Comprehensive tests for circle intersection functions
 * Tests circleIntersectionPoints and circleLineIntersection from circle.ts
 */
import { test, expect, describe, beforeAll } from "bun:test";

// Create a minimal p5.Vector mock to avoid p5.js DOM issues
class Vector {
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}

  static sub(v1: Vector, v2: Vector): Vector {
    return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
}

// Set up createVector global
beforeAll(() => {
  // @ts-expect-error - Mocking createVector for tests
  globalThis.createVector = (x: number = 0, y: number = 0, z: number = 0) => new Vector(x, y, z);
  // @ts-expect-error - Mocking p5.Vector for tests
  globalThis.p5 = { Vector };
});

// Import after setting up mocks
const { circleIntersectionPoints, circleLineIntersection } = require("./circle");

// Helper function to check if a point is on a circle
function isPointOnCircle(point: Vector, center: Vector, radius: number, tolerance = 1e-6): boolean {
  const dist = Math.hypot(point.x - center.x, point.y - center.y);
  return Math.abs(dist - radius) < tolerance;
}

// Helper function to check if a point is on a line segment
function isPointOnLineSegment(point: Vector, lineStart: Vector, lineEnd: Vector, tolerance = 1e-6): boolean {
  const { x: px, y: py } = point;
  const { x: x1, y: y1 } = lineStart;
  const { x: x2, y: y2 } = lineEnd;

  // Check if point is within bounding box of line segment
  const minX = Math.min(x1, x2) - tolerance;
  const maxX = Math.max(x1, x2) + tolerance;
  const minY = Math.min(y1, y2) - tolerance;
  const maxY = Math.max(y1, y2) + tolerance;

  if (px < minX || px > maxX || py < minY || py > maxY) {
    return false;
  }

  // Check if point is on the line
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lineLength = Math.hypot(dx, dy);

  if (lineLength < tolerance) {
    // Line segment is a point
    return Math.hypot(px - x1, py - y1) < tolerance;
  }

  // Calculate perpendicular distance from point to line
  const distFromLine = Math.abs((dy * px - dx * py + x2 * y1 - y2 * x1) / lineLength);
  return distFromLine < tolerance;
}

describe("circleIntersectionPoints", () => {
  describe("no intersection cases", () => {
    test("circles too far apart (no intersection)", () => {
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(20, 0);
      const r2 = 5;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(0);
    });

    test("one circle inside another (no intersection)", () => {
      const c1 = createVector(0, 0);
      const r1 = 10;
      const c2 = createVector(2, 0);
      const r2 = 3;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(0);
    });

    test("identical circles (infinite intersections)", () => {
      const c1 = createVector(5, 5);
      const r1 = 7;
      const c2 = createVector(5, 5);
      const r2 = 7;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(0);
    });
  });

  describe("single intersection point (tangent)", () => {
    test("circles touching externally (externally tangent)", () => {
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(10, 0);
      const r2 = 5;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(1);

      // Check that the point is at (5, 0)
      expect(result[0]?.x).toBeCloseTo(5, 6);
      expect(result[0]?.y).toBeCloseTo(0, 6);

      // Verify point is on both circles
      expect(isPointOnCircle(result[0]!, c1, r1)).toBe(true);
      expect(isPointOnCircle(result[0]!, c2, r2)).toBe(true);
    });

    test("circles touching internally (internally tangent)", () => {
      const c1 = createVector(0, 0);
      const r1 = 10;
      const c2 = createVector(5, 0);
      const r2 = 5;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(1);

      // Check that the point is at (10, 0)
      expect(result[0]?.x).toBeCloseTo(10, 6);
      expect(result[0]?.y).toBeCloseTo(0, 6);

      // Verify point is on both circles
      expect(isPointOnCircle(result[0]!, c1, r1)).toBe(true);
      expect(isPointOnCircle(result[0]!, c2, r2)).toBe(true);
    });

    test("vertical tangent point", () => {
      const c1 = createVector(0, 0);
      const r1 = 3;
      const c2 = createVector(0, 6);
      const r2 = 3;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(1);

      // Check that the point is at (0, 3)
      expect(result[0]?.x).toBeCloseTo(0, 6);
      expect(result[0]?.y).toBeCloseTo(3, 6);
    });
  });

  describe("two intersection points", () => {
    test("two intersecting circles (horizontal separation)", () => {
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(6, 0);
      const r2 = 5;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(2);

      // Verify both points are on both circles
      for (const point of result) {
        expect(isPointOnCircle(point, c1, r1)).toBe(true);
        expect(isPointOnCircle(point, c2, r2)).toBe(true);
      }

      // The intersection points should be symmetric about the x-axis
      expect(result[0]?.y).toBeCloseTo(-result[1]!.y, 6);
      expect(result[0]?.x).toBeCloseTo(result[1]!.x, 6);
    });

    test("two intersecting circles (vertical separation)", () => {
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(0, 6);
      const r2 = 5;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(2);

      // Verify both points are on both circles
      for (const point of result) {
        expect(isPointOnCircle(point, c1, r1)).toBe(true);
        expect(isPointOnCircle(point, c2, r2)).toBe(true);
      }

      // The intersection points should be symmetric about the y-axis
      expect(result[0]?.x).toBeCloseTo(-result[1]!.x, 6);
      expect(result[0]?.y).toBeCloseTo(result[1]!.y, 6);
    });

    test("two intersecting circles (diagonal separation)", () => {
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(4, 4);
      const r2 = 5;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(2);

      // Verify both points are on both circles
      for (const point of result) {
        expect(isPointOnCircle(point, c1, r1)).toBe(true);
        expect(isPointOnCircle(point, c2, r2)).toBe(true);
      }
    });

    test("known intersection points (unit circles)", () => {
      // Two unit circles: one at origin, one at (1, 0)
      const c1 = createVector(0, 0);
      const r1 = 1;
      const c2 = createVector(1, 0);
      const r2 = 1;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(2);

      // Expected intersection points: (0.5, ±sqrt(3)/2)
      const expectedY = Math.sqrt(3) / 2;

      // One point should be (0.5, sqrt(3)/2) and the other (0.5, -sqrt(3)/2)
      const sortedByY = result.sort((a: Vector, b: Vector) => a.y - b.y);

      expect(sortedByY[0]?.x).toBeCloseTo(0.5, 6);
      expect(sortedByY[0]?.y).toBeCloseTo(-expectedY, 6);
      expect(sortedByY[1]?.x).toBeCloseTo(0.5, 6);
      expect(sortedByY[1]?.y).toBeCloseTo(expectedY, 6);
    });

    test("different sized circles intersecting", () => {
      const c1 = createVector(0, 0);
      const r1 = 3;
      const c2 = createVector(4, 0);
      const r2 = 5;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(2);

      // Verify both points are on both circles
      for (const point of result) {
        expect(isPointOnCircle(point, c1, r1)).toBe(true);
        expect(isPointOnCircle(point, c2, r2)).toBe(true);
      }
    });
  });

  describe("edge cases with negative coordinates", () => {
    test("circles in negative coordinate space", () => {
      const c1 = createVector(-10, -5);
      const r1 = 4;
      const c2 = createVector(-7, -5);
      const r2 = 4;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(2);

      // Verify both points are on both circles
      for (const point of result) {
        expect(isPointOnCircle(point, c1, r1)).toBe(true);
        expect(isPointOnCircle(point, c2, r2)).toBe(true);
      }
    });
  });
});

describe("circleLineIntersection", () => {
  describe("no intersection cases", () => {
    test("line segment misses circle entirely (above)", () => {
      const lineStart = createVector(-5, 10);
      const lineEnd = createVector(5, 10);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(0);
    });

    test("line segment misses circle entirely (to the side)", () => {
      const lineStart = createVector(10, -5);
      const lineEnd = createVector(10, 5);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(0);
    });

    test("line segment entirely inside circle (no boundary intersection)", () => {
      const lineStart = createVector(-1, 0);
      const lineEnd = createVector(1, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(0);
    });

    test("infinite line would intersect, but segment is too short", () => {
      const lineStart = createVector(10, 0);
      const lineEnd = createVector(8, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(0);
    });
  });

  describe("single intersection point", () => {
    test("horizontal line tangent to circle", () => {
      const lineStart = createVector(-10, 5);
      const lineEnd = createVector(10, 5);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(1);

      // Tangent point should be at (0, 5)
      expect(result[0]?.x).toBeCloseTo(0, 6);
      expect(result[0]?.y).toBeCloseTo(5, 6);

      // Verify point is on circle
      expect(isPointOnCircle(result[0]!, center, radius)).toBe(true);

      // Verify point is on line segment
      expect(isPointOnLineSegment(result[0]!, lineStart, lineEnd)).toBe(true);
    });

    test("vertical line tangent to circle", () => {
      const lineStart = createVector(3, -10);
      const lineEnd = createVector(3, 10);
      const center = createVector(0, 0);
      const radius = 3;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(1);

      // Tangent point should be at (3, 0)
      expect(result[0]?.x).toBeCloseTo(3, 6);
      expect(result[0]?.y).toBeCloseTo(0, 6);
    });

    test("line segment starts inside and exits circle (one intersection)", () => {
      const lineStart = createVector(0, 0);
      const lineEnd = createVector(10, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(1);

      // Exit point should be at (5, 0)
      expect(result[0]?.x).toBeCloseTo(5, 6);
      expect(result[0]?.y).toBeCloseTo(0, 6);

      // Verify point is on circle
      expect(isPointOnCircle(result[0]!, center, radius)).toBe(true);
    });

    test("line segment ends inside circle (one intersection)", () => {
      const lineStart = createVector(-10, 0);
      const lineEnd = createVector(0, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(1);

      // Entry point should be at (-5, 0)
      expect(result[0]?.x).toBeCloseTo(-5, 6);
      expect(result[0]?.y).toBeCloseTo(0, 6);
    });
  });

  describe("two intersection points", () => {
    test("horizontal line through center (chord is diameter)", () => {
      const lineStart = createVector(-10, 0);
      const lineEnd = createVector(10, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Sort by x coordinate
      const sortedByX = result.sort((a: Vector, b: Vector) => a.x - b.x);

      // Intersection points should be at (-5, 0) and (5, 0)
      expect(sortedByX[0]?.x).toBeCloseTo(-5, 6);
      expect(sortedByX[0]?.y).toBeCloseTo(0, 6);
      expect(sortedByX[1]?.x).toBeCloseTo(5, 6);
      expect(sortedByX[1]?.y).toBeCloseTo(0, 6);

      // Verify both points are on circle
      for (const point of result) {
        expect(isPointOnCircle(point, center, radius)).toBe(true);
        expect(isPointOnLineSegment(point, lineStart, lineEnd)).toBe(true);
      }
    });

    test("vertical line through center (chord is diameter)", () => {
      const lineStart = createVector(0, -10);
      const lineEnd = createVector(0, 10);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Sort by y coordinate
      const sortedByY = result.sort((a: Vector, b: Vector) => a.y - b.y);

      // Intersection points should be at (0, -5) and (0, 5)
      expect(sortedByY[0]?.x).toBeCloseTo(0, 6);
      expect(sortedByY[0]?.y).toBeCloseTo(-5, 6);
      expect(sortedByY[1]?.x).toBeCloseTo(0, 6);
      expect(sortedByY[1]?.y).toBeCloseTo(5, 6);

      // Verify both points are on circle
      for (const point of result) {
        expect(isPointOnCircle(point, center, radius)).toBe(true);
        expect(isPointOnLineSegment(point, lineStart, lineEnd)).toBe(true);
      }
    });

    test("diagonal line through circle (45 degrees)", () => {
      const lineStart = createVector(-10, -10);
      const lineEnd = createVector(10, 10);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // For a 45-degree line through center, intersection points are at distance r from center
      // Points should be at (-r/sqrt(2), -r/sqrt(2)) and (r/sqrt(2), r/sqrt(2))
      const expected = radius / Math.sqrt(2);

      const sortedByX = result.sort((a: Vector, b: Vector) => a.x - b.x);

      expect(sortedByX[0]?.x).toBeCloseTo(-expected, 6);
      expect(sortedByX[0]?.y).toBeCloseTo(-expected, 6);
      expect(sortedByX[1]?.x).toBeCloseTo(expected, 6);
      expect(sortedByX[1]?.y).toBeCloseTo(expected, 6);

      // Verify both points are on circle
      for (const point of result) {
        expect(isPointOnCircle(point, center, radius)).toBe(true);
        expect(isPointOnLineSegment(point, lineStart, lineEnd)).toBe(true);
      }
    });

    test("horizontal chord not through center", () => {
      const lineStart = createVector(-10, 3);
      const lineEnd = createVector(10, 3);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Using Pythagorean theorem: x^2 + 3^2 = 5^2, so x = ±4
      const sortedByX = result.sort((a: Vector, b: Vector) => a.x - b.x);

      expect(sortedByX[0]?.x).toBeCloseTo(-4, 6);
      expect(sortedByX[0]?.y).toBeCloseTo(3, 6);
      expect(sortedByX[1]?.x).toBeCloseTo(4, 6);
      expect(sortedByX[1]?.y).toBeCloseTo(3, 6);

      // Verify both points are on circle
      for (const point of result) {
        expect(isPointOnCircle(point, center, radius)).toBe(true);
        expect(isPointOnLineSegment(point, lineStart, lineEnd)).toBe(true);
      }
    });

    test("vertical chord not through center", () => {
      const lineStart = createVector(4, -10);
      const lineEnd = createVector(4, 10);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Using Pythagorean theorem: 4^2 + y^2 = 5^2, so y = ±3
      const sortedByY = result.sort((a: Vector, b: Vector) => a.y - b.y);

      expect(sortedByY[0]?.x).toBeCloseTo(4, 6);
      expect(sortedByY[0]?.y).toBeCloseTo(-3, 6);
      expect(sortedByY[1]?.x).toBeCloseTo(4, 6);
      expect(sortedByY[1]?.y).toBeCloseTo(3, 6);
    });

    test("arbitrary angled line intersecting circle", () => {
      const lineStart = createVector(-5, 2);
      const lineEnd = createVector(5, 8);
      const center = createVector(0, 5);
      const radius = 4;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Verify both points are on circle and line segment
      for (const point of result) {
        expect(isPointOnCircle(point, center, radius)).toBe(true);
        expect(isPointOnLineSegment(point, lineStart, lineEnd)).toBe(true);
      }
    });
  });

  describe("edge cases", () => {
    test("circle with center not at origin", () => {
      const lineStart = createVector(5, 5);
      const lineEnd = createVector(15, 5);
      const center = createVector(10, 5);
      const radius = 3;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      const sortedByX = result.sort((a: Vector, b: Vector) => a.x - b.x);

      expect(sortedByX[0]?.x).toBeCloseTo(7, 6);
      expect(sortedByX[0]?.y).toBeCloseTo(5, 6);
      expect(sortedByX[1]?.x).toBeCloseTo(13, 6);
      expect(sortedByX[1]?.y).toBeCloseTo(5, 6);
    });

    test("negative coordinates", () => {
      const lineStart = createVector(-15, -5);
      const lineEnd = createVector(-5, -5);
      const center = createVector(-10, -5);
      const radius = 3;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Verify both points are on circle
      for (const point of result) {
        expect(isPointOnCircle(point, center, radius)).toBe(true);
        expect(isPointOnLineSegment(point, lineStart, lineEnd)).toBe(true);
      }
    });

    test("line segment exactly at circle boundary", () => {
      const lineStart = createVector(-5, 0);
      const lineEnd = createVector(5, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Both endpoints should be intersection points
      const sortedByX = result.sort((a: Vector, b: Vector) => a.x - b.x);
      expect(sortedByX[0]?.x).toBeCloseTo(-5, 6);
      expect(sortedByX[0]?.y).toBeCloseTo(0, 6);
      expect(sortedByX[1]?.x).toBeCloseTo(5, 6);
      expect(sortedByX[1]?.y).toBeCloseTo(0, 6);
    });
  });

  describe("precision tests", () => {
    test("near-tangent line should have close intersection points", () => {
      const lineStart = createVector(-10, 4.9999);
      const lineEnd = createVector(10, 4.9999);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      // Should have 2 intersection points very close together
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(2);

      // All points should be on the circle
      for (const point of result) {
        expect(isPointOnCircle(point, center, radius)).toBe(true);
      }
    });
  });
});
