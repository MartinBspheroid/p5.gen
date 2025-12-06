/**
 * Tests for basic circle calculation functions
 * These tests cover: circumference, area, radiusFromCircumference, radiusFromArea,
 * chordLength, arcLength, and sectorArea
 */
import { test, expect, describe, beforeAll } from 'bun:test';
import './globals'; // This sets up PI and TWO_PI

// Create a p5.Vector mock for testing
class Vector {
  constructor(
    public x = 0,
    public y = 0,
    public z = 0,
  ) {}

  static sub(v1: Vector, v2: Vector): Vector {
    return new Vector(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
  }

  static lerp(v1: Vector, v2: Vector, t: number): Vector {
    return new Vector(v1.x + (v2.x - v1.x) * t, v1.y + (v2.y - v1.y) * t, v1.z + (v2.z - v1.z) * t);
  }

  mag(): number {
    return Math.hypot(this.x, this.y, this.z);
  }

  dist(other: Vector): number {
    return Math.hypot(this.x - other.x, this.y - other.y, this.z - other.z);
  }

  copy(): Vector {
    return new Vector(this.x, this.y, this.z);
  }
}

// Set up p5.js-like globals for testing
beforeAll(() => {
  // @ts-expect-error - Assigning mock to global
  globalThis.createVector = (x = 0, y = 0, z = 0) => new Vector(x, y, z);
  // @ts-expect-error - Assigning to global
  globalThis.p5 = { Vector };
});

import {
  circumference,
  area,
  radiusFromCircumference,
  radiusFromArea,
  chordLength,
  arcLength,
  sectorArea,
  circumcenter,
  tangentPoints,
  smallestEnclosingCircle,
} from './circle';

describe('Basic Circle Calculations', () => {
  describe('circumference', () => {
    test('r=1 should return 2π (≈ 6.283)', () => {
      expect(circumference(1)).toBeCloseTo(2 * Math.PI, 5);
      expect(circumference(1)).toBeCloseTo(6.283185307179586, 5);
    });

    test('r=10 should return 20π', () => {
      expect(circumference(10)).toBeCloseTo(20 * Math.PI, 5);
      expect(circumference(10)).toBeCloseTo(62.83185307179586, 5);
    });

    test('r=0 should return 0', () => {
      expect(circumference(0)).toBe(0);
    });

    test('r=0.5 should return π', () => {
      expect(circumference(0.5)).toBeCloseTo(Math.PI, 5);
      expect(circumference(0.5)).toBeCloseTo(3.141592653589793, 5);
    });
  });

  describe('area', () => {
    test('r=1 should return π (≈ 3.14159)', () => {
      expect(area(1)).toBeCloseTo(Math.PI, 5);
      expect(area(1)).toBeCloseTo(3.141592653589793, 5);
    });

    test('r=10 should return 100π', () => {
      expect(area(10)).toBeCloseTo(100 * Math.PI, 5);
      expect(area(10)).toBeCloseTo(314.1592653589793, 5);
    });

    test('r=0 should return 0', () => {
      expect(area(0)).toBe(0);
    });

    test('r=0.5 should return 0.25π', () => {
      expect(area(0.5)).toBeCloseTo(0.25 * Math.PI, 5);
      expect(area(0.5)).toBeCloseTo(0.7853981633974483, 5);
    });
  });

  describe('radiusFromCircumference', () => {
    test('c=2π should return 1', () => {
      expect(radiusFromCircumference(2 * Math.PI)).toBeCloseTo(1, 5);
    });

    test('c=0 should return 0', () => {
      expect(radiusFromCircumference(0)).toBe(0);
    });

    test('should be inverse of circumference', () => {
      const testRadii = [1, 5, 10, 0.5, 100];
      for (const r of testRadii) {
        const c = circumference(r);
        expect(radiusFromCircumference(c)).toBeCloseTo(r, 5);
      }
    });

    test('c=20π should return 10', () => {
      expect(radiusFromCircumference(20 * Math.PI)).toBeCloseTo(10, 5);
    });
  });

  describe('radiusFromArea', () => {
    test('a=π should return 1', () => {
      expect(radiusFromArea(Math.PI)).toBeCloseTo(1, 5);
    });

    test('a=0 should return 0', () => {
      expect(radiusFromArea(0)).toBe(0);
    });

    test('should be inverse of area', () => {
      const testRadii = [1, 5, 10, 0.5, 100];
      for (const r of testRadii) {
        const a = area(r);
        expect(radiusFromArea(a)).toBeCloseTo(r, 5);
      }
    });

    test('a=100π should return 10', () => {
      expect(radiusFromArea(100 * Math.PI)).toBeCloseTo(10, 5);
    });
  });

  describe('chordLength', () => {
    test('r=1, angle=π (diameter) should return 2', () => {
      expect(chordLength(1, Math.PI)).toBeCloseTo(2, 5);
    });

    test('r=1, angle=π/2 should return √2', () => {
      // chord = 2r*sin(angle/2) = 2*1*sin(π/4) = 2*√2/2 = √2
      expect(chordLength(1, Math.PI / 2)).toBeCloseTo(Math.sqrt(2), 5);
      expect(chordLength(1, Math.PI / 2)).toBeCloseTo(1.4142135623730951, 5);
    });

    test('r=1, angle=0 should return 0', () => {
      expect(chordLength(1, 0)).toBeCloseTo(0, 5);
    });

    test('r=10, angle=π should return 20', () => {
      expect(chordLength(10, Math.PI)).toBeCloseTo(20, 5);
    });

    test('r=5, angle=2π/3 should return 5√3', () => {
      // chord = 2*5*sin(π/3) = 10*(√3/2) = 5√3
      expect(chordLength(5, (2 * Math.PI) / 3)).toBeCloseTo(5 * Math.sqrt(3), 5);
      expect(chordLength(5, (2 * Math.PI) / 3)).toBeCloseTo(8.660254037844387, 5);
    });
  });

  describe('arcLength', () => {
    test('r=1, angle=2π (full circle) should equal circumference', () => {
      expect(arcLength(1, 2 * Math.PI)).toBeCloseTo(circumference(1), 5);
      expect(arcLength(1, 2 * Math.PI)).toBeCloseTo(6.283185307179586, 5);
    });

    test('r=1, angle=π (half circle) should return π', () => {
      expect(arcLength(1, Math.PI)).toBeCloseTo(Math.PI, 5);
      expect(arcLength(1, Math.PI)).toBeCloseTo(3.141592653589793, 5);
    });

    test('should handle negative angles (absolute value)', () => {
      expect(arcLength(1, -Math.PI)).toBeCloseTo(Math.PI, 5);
      expect(arcLength(5, -Math.PI / 2)).toBeCloseTo((5 * Math.PI) / 2, 5);
    });

    test('r=10, angle=π/2 should return 5π', () => {
      expect(arcLength(10, Math.PI / 2)).toBeCloseTo(5 * Math.PI, 5);
      expect(arcLength(10, Math.PI / 2)).toBeCloseTo(15.707963267948966, 5);
    });

    test('r=0, any angle should return 0', () => {
      expect(arcLength(0, Math.PI)).toBe(0);
      expect(arcLength(0, 2 * Math.PI)).toBe(0);
    });
  });

  describe('sectorArea', () => {
    test('r=1, angle=2π (full circle) should equal area of full circle', () => {
      expect(sectorArea(1, 2 * Math.PI)).toBeCloseTo(area(1), 5);
      expect(sectorArea(1, 2 * Math.PI)).toBeCloseTo(Math.PI, 5);
    });

    test('r=1, angle=π (half circle) should return π/2', () => {
      expect(sectorArea(1, Math.PI)).toBeCloseTo(Math.PI / 2, 5);
      expect(sectorArea(1, Math.PI)).toBeCloseTo(1.5707963267948966, 5);
    });

    test('should handle negative angles (absolute value)', () => {
      expect(sectorArea(1, -Math.PI)).toBeCloseTo(Math.PI / 2, 5);
      expect(sectorArea(5, -Math.PI / 2)).toBeCloseTo((0.5 * 25 * Math.PI) / 2, 5);
    });

    test('r=10, angle=π/2 should return 25π', () => {
      expect(sectorArea(10, Math.PI / 2)).toBeCloseTo(25 * Math.PI, 5);
      expect(sectorArea(10, Math.PI / 2)).toBeCloseTo(78.53981633974483, 5);
    });

    test('r=0, any angle should return 0', () => {
      expect(sectorArea(0, Math.PI)).toBe(0);
      expect(sectorArea(0, 2 * Math.PI)).toBe(0);
    });

    test('quarter circle (r=2, angle=π/2) should return π', () => {
      // sector = 0.5 * 4 * π/2 = π
      expect(sectorArea(2, Math.PI / 2)).toBeCloseTo(Math.PI, 5);
    });
  });
});

// ============================================================================
// Circle Intersection Tests
// ============================================================================

// Helper function to check if a point is on a circle
function isPointOnCircle(
  point: p5.Vector,
  center: p5.Vector,
  radius: number,
  tolerance = 1e-6,
): boolean {
  const dist = Math.hypot(point.x - center.x, point.y - center.y);
  return Math.abs(dist - radius) < tolerance;
}

// Helper function to check if a point is on a line segment
function isPointOnLineSegment(
  point: p5.Vector,
  lineStart: p5.Vector,
  lineEnd: p5.Vector,
  tolerance = 1e-6,
): boolean {
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

describe('circleIntersectionPoints', () => {
  describe('no intersection cases', () => {
    test('circles too far apart (no intersection)', () => {
      const { circleIntersectionPoints } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(20, 0);
      const r2 = 5;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(0);
    });

    test('one circle inside another (no intersection)', () => {
      const { circleIntersectionPoints } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 10;
      const c2 = createVector(2, 0);
      const r2 = 3;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(0);
    });

    test('identical circles (infinite intersections)', () => {
      const { circleIntersectionPoints } = require('./circle');
      const c1 = createVector(5, 5);
      const r1 = 7;
      const c2 = createVector(5, 5);
      const r2 = 7;

      const result = circleIntersectionPoints(c1, r1, c2, r2);

      expect(result).toHaveLength(0);
    });
  });

  describe('single intersection point (tangent)', () => {
    test('circles touching externally (externally tangent)', () => {
      const { circleIntersectionPoints } = require('./circle');
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

    test('circles touching internally (internally tangent)', () => {
      const { circleIntersectionPoints } = require('./circle');
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

    test('vertical tangent point', () => {
      const { circleIntersectionPoints } = require('./circle');
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

  describe('two intersection points', () => {
    test('two intersecting circles (horizontal separation)', () => {
      const { circleIntersectionPoints } = require('./circle');
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

    test('two intersecting circles (vertical separation)', () => {
      const { circleIntersectionPoints } = require('./circle');
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

    test('known intersection points (unit circles)', () => {
      const { circleIntersectionPoints } = require('./circle');
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
      const sortedByY = result.sort((a: p5.Vector, b: p5.Vector) => a.y - b.y);

      expect(sortedByY[0]?.x).toBeCloseTo(0.5, 6);
      expect(sortedByY[0]?.y).toBeCloseTo(-expectedY, 6);
      expect(sortedByY[1]?.x).toBeCloseTo(0.5, 6);
      expect(sortedByY[1]?.y).toBeCloseTo(expectedY, 6);
    });

    test('different sized circles intersecting', () => {
      const { circleIntersectionPoints } = require('./circle');
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

  describe('edge cases with negative coordinates', () => {
    test('circles in negative coordinate space', () => {
      const { circleIntersectionPoints } = require('./circle');
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

describe('circleLineIntersection', () => {
  describe('no intersection cases', () => {
    test('line segment misses circle entirely (above)', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(-5, 10);
      const lineEnd = createVector(5, 10);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(0);
    });

    test('line segment misses circle entirely (to the side)', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(10, -5);
      const lineEnd = createVector(10, 5);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(0);
    });

    test('line segment entirely inside circle (no boundary intersection)', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(-1, 0);
      const lineEnd = createVector(1, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(0);
    });

    test('infinite line would intersect, but segment is too short', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(10, 0);
      const lineEnd = createVector(8, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(0);
    });
  });

  describe('single intersection point', () => {
    test('horizontal line tangent to circle', () => {
      const { circleLineIntersection } = require('./circle');
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

    test('vertical line tangent to circle', () => {
      const { circleLineIntersection } = require('./circle');
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

    test('line segment starts inside and exits circle (one intersection)', () => {
      const { circleLineIntersection } = require('./circle');
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

    test('line segment ends inside circle (one intersection)', () => {
      const { circleLineIntersection } = require('./circle');
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

  describe('two intersection points', () => {
    test('horizontal line through center (chord is diameter)', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(-10, 0);
      const lineEnd = createVector(10, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Sort by x coordinate
      const sortedByX = result.sort((a: p5.Vector, b: p5.Vector) => a.x - b.x);

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

    test('vertical line through center (chord is diameter)', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(0, -10);
      const lineEnd = createVector(0, 10);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Sort by y coordinate
      const sortedByY = result.sort((a: p5.Vector, b: p5.Vector) => a.y - b.y);

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

    test('diagonal line through circle (45 degrees)', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(-10, -10);
      const lineEnd = createVector(10, 10);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // For a 45-degree line through center, intersection points are at distance r from center
      // Points should be at (-r/sqrt(2), -r/sqrt(2)) and (r/sqrt(2), r/sqrt(2))
      const expected = radius / Math.sqrt(2);

      const sortedByX = result.sort((a: p5.Vector, b: p5.Vector) => a.x - b.x);

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

    test('horizontal chord not through center', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(-10, 3);
      const lineEnd = createVector(10, 3);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Using Pythagorean theorem: x^2 + 3^2 = 5^2, so x = ±4
      const sortedByX = result.sort((a: p5.Vector, b: p5.Vector) => a.x - b.x);

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

    test('vertical chord not through center', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(4, -10);
      const lineEnd = createVector(4, 10);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Using Pythagorean theorem: 4^2 + y^2 = 5^2, so y = ±3
      const sortedByY = result.sort((a: p5.Vector, b: p5.Vector) => a.y - b.y);

      expect(sortedByY[0]?.x).toBeCloseTo(4, 6);
      expect(sortedByY[0]?.y).toBeCloseTo(-3, 6);
      expect(sortedByY[1]?.x).toBeCloseTo(4, 6);
      expect(sortedByY[1]?.y).toBeCloseTo(3, 6);
    });

    test('arbitrary angled line intersecting circle', () => {
      const { circleLineIntersection } = require('./circle');
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

  describe('edge cases', () => {
    test('circle with center not at origin', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(5, 5);
      const lineEnd = createVector(15, 5);
      const center = createVector(10, 5);
      const radius = 3;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      const sortedByX = result.sort((a: p5.Vector, b: p5.Vector) => a.x - b.x);

      expect(sortedByX[0]?.x).toBeCloseTo(7, 6);
      expect(sortedByX[0]?.y).toBeCloseTo(5, 6);
      expect(sortedByX[1]?.x).toBeCloseTo(13, 6);
      expect(sortedByX[1]?.y).toBeCloseTo(5, 6);
    });

    test('negative coordinates', () => {
      const { circleLineIntersection } = require('./circle');
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

    test('line segment exactly at circle boundary', () => {
      const { circleLineIntersection } = require('./circle');
      const lineStart = createVector(-5, 0);
      const lineEnd = createVector(5, 0);
      const center = createVector(0, 0);
      const radius = 5;

      const result = circleLineIntersection(lineStart, lineEnd, center, radius);

      expect(result).toHaveLength(2);

      // Both endpoints should be intersection points
      const sortedByX = result.sort((a: p5.Vector, b: p5.Vector) => a.x - b.x);
      expect(sortedByX[0]?.x).toBeCloseTo(-5, 6);
      expect(sortedByX[0]?.y).toBeCloseTo(0, 6);
      expect(sortedByX[1]?.x).toBeCloseTo(5, 6);
      expect(sortedByX[1]?.y).toBeCloseTo(0, 6);
    });
  });

  describe('precision tests', () => {
    test('near-tangent line should have close intersection points', () => {
      const { circleLineIntersection } = require('./circle');
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

// ============================================================================
// Advanced Geometry - circumcenter() tests
// ============================================================================

describe('circumcenter', () => {
  test('right triangle (0,0), (4,0), (0,3) → circumcenter at (2, 1.5)', () => {
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

  test('equilateral triangle → circumcenter at centroid', () => {
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

  test('isoceles triangle', () => {
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

  test('collinear points → returns null', () => {
    const p1 = createVector(0, 0);
    const p2 = createVector(2, 2);
    const p3 = createVector(4, 4);

    const center = circumcenter(p1, p2, p3);

    expect(center).toBeNull();
  });

  test('collinear horizontal points → returns null', () => {
    const p1 = createVector(0, 5);
    const p2 = createVector(3, 5);
    const p3 = createVector(7, 5);

    const center = circumcenter(p1, p2, p3);

    expect(center).toBeNull();
  });

  test('verify circumcenter is equidistant from all three points', () => {
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

  test('triangle with negative coordinates', () => {
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

describe('tangentPoints', () => {
  test('point inside circle → returns []', () => {
    const point = createVector(1, 1);
    const center = createVector(0, 0);
    const r = 5;

    const tangents = tangentPoints(point, center, r);

    expect(tangents).toEqual([]);
  });

  test('point on circle boundary → returns 1 point (the point itself)', () => {
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

  test('point outside circle → returns 2 points', () => {
    const point = createVector(10, 0);
    const center = createVector(0, 0);
    const r = 5;

    const tangents = tangentPoints(point, center, r);

    expect(tangents.length).toBe(2);
  });

  test('verify tangent points are on the circle', () => {
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

  test('verify lines from external point to tangent points are perpendicular to radius', () => {
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

  test('point directly to the right of circle', () => {
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

  test('point at 45 degrees from circle', () => {
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

  test('point on negative side of circle', () => {
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

describe('smallestEnclosingCircle', () => {
  test('empty array → returns null', () => {
    const points: p5.Vector[] = [];
    const circle = smallestEnclosingCircle(points);

    expect(circle).toBeNull();
  });

  test('single point → returns circle with radius 0 at that point', () => {
    const points = [createVector(3, 4)];
    const circle = smallestEnclosingCircle(points);

    expect(circle).not.toBeNull();
    if (circle !== null) {
      expect(circle.center.x).toBeCloseTo(3, 5);
      expect(circle.center.y).toBeCloseTo(4, 5);
      expect(circle.radius).toBeCloseTo(0, 5);
    }
  });

  test('two points → returns circle with diameter between them', () => {
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

  test('three points forming a triangle → circumscribed circle', () => {
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

  test('four points in a square → circle should enclose all', () => {
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

  test('points in a line → smallest circle with all points', () => {
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

  test('verify all input points are inside or on the returned circle', () => {
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

  test('verify the circle is minimal - random points', () => {
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

  test('three collinear points', () => {
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

  test('points with negative coordinates', () => {
    const points = [
      createVector(-2, -2),
      createVector(2, -2),
      createVector(2, 2),
      createVector(-2, 2),
    ];
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

  test('many points in a circle', () => {
    // Create points on a circle of radius 5
    const centerX = 10;
    const centerY = 10;
    const radius = 5;
    const numPoints = 8;

    const points: p5.Vector[] = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * (2 * Math.PI);
      points.push(
        createVector(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)),
      );
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

describe('Tests and Checks', () => {
  // Small value for floating-point comparisons (matches circle.ts)
  const EPSILON = 1e-9;

  describe('pointInCircle', () => {
    test('point at center should be inside', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(10, 10);
      const point = createVector(10, 10);
      const r = 5;
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('point on boundary should be inside', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const point = createVector(5, 0); // exactly r away
      const r = 5;
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('point on boundary (diagonal) should be inside', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const r = 5;
      const point = createVector(r * Math.cos(Math.PI / 4), r * Math.sin(Math.PI / 4)); // on boundary at 45°
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('point just inside boundary should be inside', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const r = 5;
      const point = createVector(4.9, 0); // just inside
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('point just outside boundary should be outside', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const r = 5;
      const point = createVector(5.1, 0); // just outside
      expect(pointInCircle(point, center, r)).toBe(false);
    });

    test('point far outside should be outside', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const r = 5;
      const point = createVector(100, 100); // far away
      expect(pointInCircle(point, center, r)).toBe(false);
    });

    test('with non-origin center (positive offset)', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(50, 50);
      const point = createVector(53, 54); // inside
      const r = 10;
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('with non-origin center (negative offset)', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(-20, -30);
      const point = createVector(-25, -30); // exactly r away
      const r = 5;
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('with large radius', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const r = 1000;
      const point = createVector(500, 500); // inside
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('with very small radius', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const r = 0.001;
      const point = createVector(0.0005, 0); // inside
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('edge case: point within epsilon of boundary (should be inside)', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const r = 5;
      const point = createVector(5 + EPSILON * 0.5, 0); // within epsilon tolerance
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('edge case: point just beyond epsilon of boundary (should be outside)', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const r = 5;
      const point = createVector(5 + EPSILON * 2, 0); // beyond epsilon tolerance
      expect(pointInCircle(point, center, r)).toBe(false);
    });

    test('with zero radius (point at center)', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(5, 5);
      const point = createVector(5, 5);
      const r = 0;
      expect(pointInCircle(point, center, r)).toBe(true);
    });

    test('with zero radius (point not at center)', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(5, 5);
      const point = createVector(5.01, 5);
      const r = 0;
      expect(pointInCircle(point, center, r)).toBe(false);
    });

    test('point on boundary at various angles', () => {
      const { pointInCircle } = require('./circle');
      const center = createVector(0, 0);
      const r = 10;
      const angles = [
        0,
        Math.PI / 6,
        Math.PI / 4,
        Math.PI / 3,
        Math.PI / 2,
        Math.PI,
        (3 * Math.PI) / 2,
      ];

      for (const angle of angles) {
        const point = createVector(r * Math.cos(angle), r * Math.sin(angle));
        expect(pointInCircle(point, center, r)).toBe(true);
      }
    });
  });

  describe('circlesIntersect', () => {
    test('overlapping circles should intersect', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(3, 0); // 3 units apart, r1+r2 = 8
      const r2 = 3;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('touching circles (exactly r1+r2 apart) should intersect', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(8, 0); // exactly r1+r2 = 8 apart
      const r2 = 3;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('separated circles should not intersect', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(10, 0); // 10 units apart, r1+r2 = 8
      const r2 = 3;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(false);
    });

    test('one circle inside another (smaller completely inside larger) should intersect', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 10;
      const c2 = createVector(2, 0); // small circle inside large one
      const r2 = 3;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('concentric circles of different sizes should intersect', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(5, 5);
      const r1 = 10;
      const c2 = createVector(5, 5); // same center
      const r2 = 3;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('same circle (same center and radius) should intersect', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(7, 7);
      const r1 = 5;
      const c2 = createVector(7, 7);
      const r2 = 5;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('diagonal separation (no intersection)', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 2;
      const c2 = createVector(10, 10); // far diagonal
      const r2 = 2;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(false);
    });

    test('diagonal separation (with intersection)', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(4, 3); // 5 units apart (3-4-5 triangle)
      const r2 = 5;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('circles with negative coordinates', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(-10, -10);
      const r1 = 5;
      const c2 = createVector(-7, -10); // 3 units apart
      const r2 = 3;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('edge case: just within epsilon of touching (should intersect)', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(8 - EPSILON * 0.5, 0); // just within epsilon
      const r2 = 3;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('edge case: just beyond epsilon of touching (should not intersect)', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 5;
      const c2 = createVector(8 + EPSILON * 2, 0); // just beyond epsilon
      const r2 = 3;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(false);
    });

    test('circles with zero radius at same point should intersect', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(5, 5);
      const r1 = 0;
      const c2 = createVector(5, 5);
      const r2 = 0;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('circles with zero radius at different points should not intersect', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(5, 5);
      const r1 = 0;
      const c2 = createVector(6, 5);
      const r2 = 0;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(false);
    });

    test('one zero-radius circle inside normal circle should intersect', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 10;
      const c2 = createVector(3, 4); // inside
      const r2 = 0;
      expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
    });

    test('circles touching at various angles', () => {
      const { circlesIntersect } = require('./circle');
      const c1 = createVector(0, 0);
      const r1 = 5;
      const r2 = 3;
      const distance = r1 + r2;
      const angles = [0, Math.PI / 6, Math.PI / 4, Math.PI / 3, Math.PI / 2];

      for (const angle of angles) {
        const c2 = createVector(distance * Math.cos(angle), distance * Math.sin(angle));
        expect(circlesIntersect(c1, r1, c2, r2)).toBe(true);
      }
    });
  });

  describe('areConcentric', () => {
    test('same point should be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(5, 5);
      const c2 = createVector(5, 5);
      expect(areConcentric(c1, c2)).toBe(true);
    });

    test('origin and origin should be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(0, 0);
      const c2 = createVector(0, 0);
      expect(areConcentric(c1, c2)).toBe(true);
    });

    test('very close points (within epsilon) should be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(10, 10);
      const c2 = createVector(10 + EPSILON * 0.5, 10 + EPSILON * 0.5);
      expect(areConcentric(c1, c2)).toBe(true);
    });

    test('different points should not be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(0, 0);
      const c2 = createVector(5, 5);
      expect(areConcentric(c1, c2)).toBe(false);
    });

    test('slightly different points (beyond epsilon) should not be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(10, 10);
      const c2 = createVector(10 + EPSILON * 2, 10);
      expect(areConcentric(c1, c2)).toBe(false);
    });

    test('points differing only in x should not be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(0, 5);
      const c2 = createVector(1, 5);
      expect(areConcentric(c1, c2)).toBe(false);
    });

    test('points differing only in y should not be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(5, 0);
      const c2 = createVector(5, 1);
      expect(areConcentric(c1, c2)).toBe(false);
    });

    test('negative coordinates (same point) should be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(-10, -20);
      const c2 = createVector(-10, -20);
      expect(areConcentric(c1, c2)).toBe(true);
    });

    test('negative coordinates (different points) should not be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(-10, -20);
      const c2 = createVector(-10.1, -20);
      expect(areConcentric(c1, c2)).toBe(false);
    });

    test('edge case: exactly at epsilon distance (should not be concentric)', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(0, 0);
      const c2 = createVector(EPSILON, 0);
      expect(areConcentric(c1, c2)).toBe(false);
    });

    test('edge case: just below epsilon distance (should be concentric)', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(0, 0);
      const c2 = createVector(EPSILON * 0.9, 0);
      expect(areConcentric(c1, c2)).toBe(true);
    });

    test('large coordinates (same point) should be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(10000, 20000);
      const c2 = createVector(10000, 20000);
      expect(areConcentric(c1, c2)).toBe(true);
    });

    test('large coordinates (different points) should not be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(10000, 20000);
      const c2 = createVector(10001, 20000);
      expect(areConcentric(c1, c2)).toBe(false);
    });

    test('diagonal difference (small) should not be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(0, 0);
      const c2 = createVector(0.001, 0.001);
      expect(areConcentric(c1, c2)).toBe(false);
    });

    test('mixed positive and negative coordinates (same point) should be concentric', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(-5, 10);
      const c2 = createVector(-5, 10);
      expect(areConcentric(c1, c2)).toBe(true);
    });

    test('points very close to epsilon boundary (diagonal)', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(0, 0);
      const offset = EPSILON * 0.6;
      const c2 = createVector(offset, offset);
      // Distance = sqrt(2 * offset^2) = offset * sqrt(2) ≈ 0.85 * EPSILON < EPSILON
      expect(areConcentric(c1, c2)).toBe(true);
    });

    test('points just beyond epsilon boundary (diagonal)', () => {
      const { areConcentric } = require('./circle');
      const c1 = createVector(0, 0);
      const offset = EPSILON * 0.8;
      const c2 = createVector(offset, offset);
      // Distance = sqrt(2 * offset^2) = offset * sqrt(2) ≈ 1.13 * EPSILON > EPSILON
      expect(areConcentric(c1, c2)).toBe(false);
    });
  });
});
