/**
 * Tests for circle test/check functions: pointInCircle, circlesIntersect, areConcentric
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

import { pointInCircle, circlesIntersect, areConcentric } from './circle';

// ============================================================================
// pointInCircle tests
// ============================================================================

describe('pointInCircle', () => {
  test('point at center should be inside', () => {
    const point = createVector(0, 0);
    const center = createVector(0, 0);
    expect(pointInCircle(point, center, 10)).toBe(true);
  });

  test('point on boundary should be inside (within epsilon)', () => {
    const point = createVector(10, 0);
    const center = createVector(0, 0);
    expect(pointInCircle(point, center, 10)).toBe(true);
  });

  test('point on boundary at diagonal should be inside', () => {
    const r = 10;
    const point = createVector(r * Math.cos(Math.PI / 4), r * Math.sin(Math.PI / 4));
    const center = createVector(0, 0);
    expect(pointInCircle(point, center, r)).toBe(true);
  });

  test('point just inside boundary should be inside', () => {
    const point = createVector(9.9, 0);
    const center = createVector(0, 0);
    expect(pointInCircle(point, center, 10)).toBe(true);
  });

  test('point just outside boundary should be outside', () => {
    const point = createVector(10.1, 0);
    const center = createVector(0, 0);
    expect(pointInCircle(point, center, 10)).toBe(false);
  });

  test('point far outside should be outside', () => {
    const point = createVector(100, 100);
    const center = createVector(0, 0);
    expect(pointInCircle(point, center, 10)).toBe(false);
  });

  test('works with positive center offset', () => {
    const point = createVector(55, 55);
    const center = createVector(50, 50);
    expect(pointInCircle(point, center, 10)).toBe(true);
  });

  test('works with negative coordinates', () => {
    const point = createVector(-5, -5);
    const center = createVector(-10, -10);
    expect(pointInCircle(point, center, 10)).toBe(true);
  });

  test('point exactly on boundary (top)', () => {
    const point = createVector(0, 10);
    const center = createVector(0, 0);
    expect(pointInCircle(point, center, 10)).toBe(true);
  });

  test('large radius', () => {
    const point = createVector(500, 500);
    const center = createVector(0, 0);
    expect(pointInCircle(point, center, 1000)).toBe(true);
  });

  test('very small radius', () => {
    const point = createVector(0.005, 0);
    const center = createVector(0, 0);
    expect(pointInCircle(point, center, 0.01)).toBe(true);
  });

  test('zero radius - point at center', () => {
    const point = createVector(5, 5);
    const center = createVector(5, 5);
    expect(pointInCircle(point, center, 0)).toBe(true);
  });

  test('zero radius - point not at center', () => {
    const point = createVector(5.1, 5);
    const center = createVector(5, 5);
    expect(pointInCircle(point, center, 0)).toBe(false);
  });
});

// ============================================================================
// circlesIntersect tests
// ============================================================================

describe('circlesIntersect', () => {
  test('overlapping circles should intersect', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(5, 0);
    expect(circlesIntersect(c1, 10, c2, 10)).toBe(true);
  });

  test('touching circles (externally tangent) should intersect', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(20, 0);
    expect(circlesIntersect(c1, 10, c2, 10)).toBe(true);
  });

  test('separated circles should not intersect', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(30, 0);
    expect(circlesIntersect(c1, 10, c2, 10)).toBe(false);
  });

  test('one circle inside another should intersect (overlap)', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(2, 0);
    expect(circlesIntersect(c1, 20, c2, 5)).toBe(true);
  });

  test('concentric circles of different sizes should intersect', () => {
    const c1 = createVector(50, 50);
    const c2 = createVector(50, 50);
    expect(circlesIntersect(c1, 10, c2, 20)).toBe(true);
  });

  test('same circle should intersect', () => {
    const c1 = createVector(10, 10);
    const c2 = createVector(10, 10);
    expect(circlesIntersect(c1, 15, c2, 15)).toBe(true);
  });

  test('diagonal separation - intersecting', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(10, 10);
    // Distance = sqrt(200) ≈ 14.14, radii sum = 20
    expect(circlesIntersect(c1, 10, c2, 10)).toBe(true);
  });

  test('diagonal separation - not intersecting', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(100, 100);
    // Distance = sqrt(20000) ≈ 141.4, radii sum = 20
    expect(circlesIntersect(c1, 10, c2, 10)).toBe(false);
  });

  test('negative coordinates - intersecting', () => {
    const c1 = createVector(-10, -10);
    const c2 = createVector(-5, -5);
    expect(circlesIntersect(c1, 10, c2, 10)).toBe(true);
  });

  test('negative coordinates - not intersecting', () => {
    const c1 = createVector(-100, -100);
    const c2 = createVector(100, 100);
    expect(circlesIntersect(c1, 10, c2, 10)).toBe(false);
  });

  test('zero radius circles at same point', () => {
    const c1 = createVector(5, 5);
    const c2 = createVector(5, 5);
    expect(circlesIntersect(c1, 0, c2, 0)).toBe(true);
  });

  test('zero radius circles at different points', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(1, 0);
    expect(circlesIntersect(c1, 0, c2, 0)).toBe(false);
  });

  test('internally tangent circles', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(10, 0);
    // Distance = 10, r1 - r2 = 20 - 10 = 10, so internally tangent
    expect(circlesIntersect(c1, 20, c2, 10)).toBe(true);
  });
});

// ============================================================================
// areConcentric tests
// ============================================================================

describe('areConcentric', () => {
  test('same point should be concentric', () => {
    const c1 = createVector(10, 20);
    const c2 = createVector(10, 20);
    expect(areConcentric(c1, c2)).toBe(true);
  });

  test('origin and origin should be concentric', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(0, 0);
    expect(areConcentric(c1, c2)).toBe(true);
  });

  test('very close points (within epsilon) should be concentric', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(1e-10, 1e-10);
    expect(areConcentric(c1, c2)).toBe(true);
  });

  test('different points should not be concentric', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(1, 1);
    expect(areConcentric(c1, c2)).toBe(false);
  });

  test('points just beyond epsilon should not be concentric', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(1e-8, 0);
    expect(areConcentric(c1, c2)).toBe(false);
  });

  test('points differing only in x', () => {
    const c1 = createVector(10, 5);
    const c2 = createVector(11, 5);
    expect(areConcentric(c1, c2)).toBe(false);
  });

  test('points differing only in y', () => {
    const c1 = createVector(5, 10);
    const c2 = createVector(5, 11);
    expect(areConcentric(c1, c2)).toBe(false);
  });

  test('negative coordinates - same point', () => {
    const c1 = createVector(-50, -50);
    const c2 = createVector(-50, -50);
    expect(areConcentric(c1, c2)).toBe(true);
  });

  test('negative coordinates - different points', () => {
    const c1 = createVector(-50, -50);
    const c2 = createVector(-51, -51);
    expect(areConcentric(c1, c2)).toBe(false);
  });

  test('large coordinates - same point', () => {
    const c1 = createVector(1000000, 1000000);
    const c2 = createVector(1000000, 1000000);
    expect(areConcentric(c1, c2)).toBe(true);
  });

  test('large coordinates - different points', () => {
    const c1 = createVector(1000000, 1000000);
    const c2 = createVector(1000001, 1000000);
    expect(areConcentric(c1, c2)).toBe(false);
  });

  test('mixed positive and negative - same point', () => {
    const c1 = createVector(-25, 75);
    const c2 = createVector(-25, 75);
    expect(areConcentric(c1, c2)).toBe(true);
  });

  test('mixed positive and negative - different points', () => {
    const c1 = createVector(-25, 75);
    const c2 = createVector(25, -75);
    expect(areConcentric(c1, c2)).toBe(false);
  });
});
