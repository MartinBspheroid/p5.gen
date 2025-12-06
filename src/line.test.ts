import { test, expect, describe, beforeAll } from 'bun:test';

// Create a simple p5.Vector mock for testing
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
}

// Set up p5.js-like globals for testing
beforeAll(() => {
  // @ts-expect-error - Assigning mock to global
  globalThis.createVector = (x = 0, y = 0, z = 0) => new Vector(x, y, z);
  // @ts-expect-error - Assigning to global
  globalThis.p5 = { Vector };
});

import { distance, lerp, lerpLine } from './line';

/**
 * Helper function to check if two p5.Vectors are approximately equal
 */
function vectorsApproxEqual(v1: p5.Vector, v2: p5.Vector, epsilon = 0.0001): boolean {
  return (
    Math.abs(v1.x - v2.x) < epsilon &&
    Math.abs(v1.y - v2.y) < epsilon &&
    Math.abs(v1.z - v2.z) < epsilon
  );
}

describe('distance', () => {
  test('calculates horizontal distance correctly', () => {
    const p1 = createVector(0, 0);
    const p2 = createVector(10, 0);
    expect(distance(p1, p2)).toBe(10);
  });

  test('calculates vertical distance correctly', () => {
    const p1 = createVector(0, 0);
    const p2 = createVector(0, 10);
    expect(distance(p1, p2)).toBe(10);
  });

  test('calculates diagonal distance correctly (Pythagorean theorem)', () => {
    const p1 = createVector(0, 0);
    const p2 = createVector(3, 4);
    // 3^2 + 4^2 = 9 + 16 = 25, sqrt(25) = 5
    expect(distance(p1, p2)).toBe(5);
  });

  test('calculates diagonal distance with different coordinates', () => {
    const p1 = createVector(1, 2);
    const p2 = createVector(4, 6);
    // dx = 3, dy = 4, distance = 5
    expect(distance(p1, p2)).toBe(5);
  });

  test('returns zero for the same point', () => {
    const p1 = createVector(5, 10);
    const p2 = createVector(5, 10);
    expect(distance(p1, p2)).toBe(0);
  });

  test('handles negative coordinates correctly', () => {
    const p1 = createVector(-3, -4);
    const p2 = createVector(0, 0);
    // Distance from (-3, -4) to (0, 0) is 5
    expect(distance(p1, p2)).toBe(5);
  });

  test('handles both points with negative coordinates', () => {
    const p1 = createVector(-5, -2);
    const p2 = createVector(-2, -6);
    // dx = 3, dy = -4, distance = 5
    expect(distance(p1, p2)).toBe(5);
  });

  test('handles large coordinates correctly', () => {
    const p1 = createVector(1000, 2000);
    const p2 = createVector(1300, 2400);
    // dx = 300, dy = 400, distance = 500
    expect(distance(p1, p2)).toBe(500);
  });

  test("distance is symmetric (order doesn't matter)", () => {
    const p1 = createVector(10, 20);
    const p2 = createVector(30, 40);
    expect(distance(p1, p2)).toBe(distance(p2, p1));
  });

  test('handles floating point coordinates', () => {
    const p1 = createVector(1.5, 2.5);
    const p2 = createVector(4.5, 6.5);
    // dx = 3, dy = 4, distance = 5
    expect(distance(p1, p2)).toBeCloseTo(5, 10);
  });
});

describe('lerp', () => {
  describe('basic interpolation', () => {
    test('returns p1 when t=0', () => {
      const p1 = createVector(10, 20);
      const p2 = createVector(30, 40);
      const result = lerp(p1, p2, 0);
      expect(result.x).toBe(10);
      expect(result.y).toBe(20);
    });

    test('returns p2 when t=1', () => {
      const p1 = createVector(10, 20);
      const p2 = createVector(30, 40);
      const result = lerp(p1, p2, 1);
      expect(result.x).toBe(30);
      expect(result.y).toBe(40);
    });

    test('returns midpoint when t=0.5', () => {
      const p1 = createVector(10, 20);
      const p2 = createVector(30, 40);
      const result = lerp(p1, p2, 0.5);
      expect(result.x).toBe(20);
      expect(result.y).toBe(30);
    });

    test('returns quarter point when t=0.25', () => {
      const p1 = createVector(0, 0);
      const p2 = createVector(100, 100);
      const result = lerp(p1, p2, 0.25);
      expect(result.x).toBe(25);
      expect(result.y).toBe(25);
    });

    test('returns three-quarter point when t=0.75', () => {
      const p1 = createVector(0, 0);
      const p2 = createVector(100, 100);
      const result = lerp(p1, p2, 0.75);
      expect(result.x).toBe(75);
      expect(result.y).toBe(75);
    });
  });

  describe('negative coordinates', () => {
    test('handles negative start point', () => {
      const p1 = createVector(-10, -20);
      const p2 = createVector(10, 20);
      const result = lerp(p1, p2, 0.5);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    test('handles negative end point', () => {
      const p1 = createVector(10, 20);
      const p2 = createVector(-10, -20);
      const result = lerp(p1, p2, 0.5);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    test('handles both negative points', () => {
      const p1 = createVector(-30, -40);
      const p2 = createVector(-10, -20);
      const result = lerp(p1, p2, 0.5);
      expect(result.x).toBe(-20);
      expect(result.y).toBe(-30);
    });
  });

  describe('floating point values', () => {
    test('handles floating point coordinates', () => {
      const p1 = createVector(1.5, 2.5);
      const p2 = createVector(3.5, 4.5);
      const result = lerp(p1, p2, 0.5);
      expect(result.x).toBeCloseTo(2.5, 10);
      expect(result.y).toBeCloseTo(3.5, 10);
    });

    test('handles precise interpolation values', () => {
      const p1 = createVector(0, 0);
      const p2 = createVector(10, 10);
      const result = lerp(p1, p2, 0.333);
      expect(result.x).toBeCloseTo(3.33, 2);
      expect(result.y).toBeCloseTo(3.33, 2);
    });
  });

  describe('edge cases with t outside [0,1]', () => {
    test('extrapolates when t > 1', () => {
      const p1 = createVector(0, 0);
      const p2 = createVector(10, 10);
      const result = lerp(p1, p2, 1.5);
      expect(result.x).toBe(15);
      expect(result.y).toBe(15);
    });

    test('extrapolates when t < 0', () => {
      const p1 = createVector(10, 10);
      const p2 = createVector(20, 20);
      const result = lerp(p1, p2, -0.5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    test('extrapolates with t = 2', () => {
      const p1 = createVector(0, 0);
      const p2 = createVector(10, 20);
      const result = lerp(p1, p2, 2);
      expect(result.x).toBe(20);
      expect(result.y).toBe(40);
    });
  });

  describe('special cases', () => {
    test('handles identical points', () => {
      const p1 = createVector(5, 5);
      const p2 = createVector(5, 5);
      const result = lerp(p1, p2, 0.5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    test('handles horizontal line', () => {
      const p1 = createVector(0, 5);
      const p2 = createVector(10, 5);
      const result = lerp(p1, p2, 0.3);
      expect(result.x).toBe(3);
      expect(result.y).toBe(5);
    });

    test('handles vertical line', () => {
      const p1 = createVector(5, 0);
      const p2 = createVector(5, 10);
      const result = lerp(p1, p2, 0.3);
      expect(result.x).toBe(5);
      expect(result.y).toBe(3);
    });
  });

  describe('independence of coordinates', () => {
    test('x and y interpolate independently', () => {
      const p1 = createVector(0, 100);
      const p2 = createVector(100, 0);
      const result = lerp(p1, p2, 0.25);
      expect(result.x).toBe(25);
      expect(result.y).toBe(75);
    });
  });
});

describe('lerpLine', () => {
  describe('with { steps: number } option', () => {
    test('steps=0 should return 2 points: start and end', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 0);
      const result = lerpLine(start, end, { steps: 0 });

      expect(result.length).toBe(2);
      expect(vectorsApproxEqual(result[0]!, start)).toBe(true);
      expect(vectorsApproxEqual(result[1]!, end)).toBe(true);
    });

    test('steps=1 should return 3 points', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 0);
      const result = lerpLine(start, end, { steps: 1 });

      expect(result.length).toBe(3);
      expect(vectorsApproxEqual(result[0]!, start)).toBe(true);
      expect(vectorsApproxEqual(result[1]!, createVector(50, 0))).toBe(true);
      expect(vectorsApproxEqual(result[2]!, end)).toBe(true);
    });

    test('steps=4 should return 6 points', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 0);
      const result = lerpLine(start, end, { steps: 4 });

      expect(result.length).toBe(6);
    });

    test('first point should equal start', () => {
      const start = createVector(10, 20);
      const end = createVector(110, 120);
      const result = lerpLine(start, end, { steps: 5 });

      expect(vectorsApproxEqual(result[0]!, start)).toBe(true);
    });

    test('last point should equal end', () => {
      const start = createVector(10, 20);
      const end = createVector(110, 120);
      const result = lerpLine(start, end, { steps: 5 });

      expect(vectorsApproxEqual(result[result.length - 1]!, end)).toBe(true);
    });

    test('points should be evenly spaced - horizontal line', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 0);
      const result = lerpLine(start, end, { steps: 4 });

      // With 4 steps, we have 5 segments, so spacing = 100/5 = 20
      const expectedSpacing = 20;

      for (let i = 1; i < result.length; i++) {
        const dist = distance(result[i - 1]!, result[i]!);
        expect(Math.abs(dist - expectedSpacing)).toBeLessThan(0.0001);
      }
    });

    test('points should be evenly spaced - vertical line', () => {
      const start = createVector(0, 0);
      const end = createVector(0, 100);
      const result = lerpLine(start, end, { steps: 4 });

      // With 4 steps, we have 5 segments, so spacing = 100/5 = 20
      const expectedSpacing = 20;

      for (let i = 1; i < result.length; i++) {
        const dist = distance(result[i - 1]!, result[i]!);
        expect(Math.abs(dist - expectedSpacing)).toBeLessThan(0.0001);
      }
    });

    test('points should be evenly spaced - diagonal line', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 100);
      const result = lerpLine(start, end, { steps: 3 });

      // Line length is sqrt(100^2 + 100^2) = sqrt(20000) ≈ 141.42
      // With 3 steps, we have 4 segments
      const lineLength = distance(start, end);
      const expectedSpacing = lineLength / 4;

      for (let i = 1; i < result.length; i++) {
        const dist = distance(result[i - 1]!, result[i]!);
        expect(Math.abs(dist - expectedSpacing)).toBeLessThan(0.0001);
      }
    });

    test('points should have correct positions - steps=2', () => {
      const start = createVector(0, 0);
      const end = createVector(90, 60);
      const result = lerpLine(start, end, { steps: 2 });

      // Should return 4 points: [0,0], [30,20], [60,40], [90,60]
      expect(result.length).toBe(4);
      expect(vectorsApproxEqual(result[0]!, createVector(0, 0))).toBe(true);
      expect(vectorsApproxEqual(result[1]!, createVector(30, 20))).toBe(true);
      expect(vectorsApproxEqual(result[2]!, createVector(60, 40))).toBe(true);
      expect(vectorsApproxEqual(result[3]!, createVector(90, 60))).toBe(true);
    });
  });

  describe('with { pixelsPerStep: number } option', () => {
    test('horizontal line 100px with pixelsPerStep=25 should return 6 points', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 0);
      const result = lerpLine(start, end, { pixelsPerStep: 25 });

      // Line length = 100, pixelsPerStep = 25
      // steps = floor(100/25) = 4
      // points = 4 + 2 = 6 points total
      expect(result.length).toBe(6);
    });

    test('horizontal line 100px with pixelsPerStep=25 should have correct spacing', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 0);
      const result = lerpLine(start, end, { pixelsPerStep: 25 });

      // Line is divided into 5 equal segments
      const expectedSpacing = 100 / 5;

      for (let i = 1; i < result.length; i++) {
        const dist = distance(result[i - 1]!, result[i]!);
        expect(Math.abs(dist - expectedSpacing)).toBeLessThan(0.0001);
      }
    });

    test('diagonal line with pixelsPerStep', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 100);
      const result = lerpLine(start, end, { pixelsPerStep: 50 });

      // Line length = sqrt(100^2 + 100^2) ≈ 141.42
      // steps = floor(141.42 / 50) = 2
      // points = 2 + 2 = 4 points total
      expect(result.length).toBe(4);

      const lineLength = distance(start, end);
      const expectedSpacing = lineLength / 3;

      for (let i = 1; i < result.length; i++) {
        const dist = distance(result[i - 1]!, result[i]!);
        expect(Math.abs(dist - expectedSpacing)).toBeLessThan(0.0001);
      }
    });

    test('pixelsPerStep larger than line length should return 2 points (start/end)', () => {
      const start = createVector(0, 0);
      const end = createVector(50, 0);
      const result = lerpLine(start, end, { pixelsPerStep: 100 });

      // Line length = 50, pixelsPerStep = 100
      // steps = floor(50/100) = 0
      // points = 0 + 2 = 2 points
      expect(result.length).toBe(2);
      expect(vectorsApproxEqual(result[0]!, start)).toBe(true);
      expect(vectorsApproxEqual(result[1]!, end)).toBe(true);
    });

    test('very small pixelsPerStep should create many points', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 0);
      const result = lerpLine(start, end, { pixelsPerStep: 5 });

      // Line length = 100, pixelsPerStep = 5
      // steps = floor(100/5) = 20
      // points = 20 + 2 = 22 points
      expect(result.length).toBe(22);

      // Verify spacing is approximately correct
      const lineLength = distance(start, end);
      const expectedSpacing = lineLength / 21;

      for (let i = 1; i < result.length; i++) {
        const dist = distance(result[i - 1]!, result[i]!);
        expect(Math.abs(dist - expectedSpacing)).toBeLessThan(0.0001);
      }
    });

    test('pixelsPerStep with 3D vectors', () => {
      const start = createVector(0, 0, 0);
      const end = createVector(100, 100, 100);
      const result = lerpLine(start, end, { pixelsPerStep: 50 });

      // Line length = sqrt(100^2 + 100^2 + 100^2) = sqrt(30000) ≈ 173.21
      // steps = floor(173.21 / 50) = 3
      // points = 3 + 2 = 5 points
      expect(result.length).toBe(5);

      expect(vectorsApproxEqual(result[0]!, start)).toBe(true);
      expect(vectorsApproxEqual(result[result.length - 1]!, end)).toBe(true);
    });
  });

  describe('edge cases', () => {
    test('zero-length line (start equals end) with steps', () => {
      const start = createVector(50, 50);
      const end = createVector(50, 50);
      const result = lerpLine(start, end, { steps: 5 });

      // Should return 7 points, all at the same location
      expect(result.length).toBe(7);

      for (const point of result) {
        expect(vectorsApproxEqual(point, start)).toBe(true);
      }
    });

    test('zero-length line (start equals end) with pixelsPerStep', () => {
      const start = createVector(50, 50);
      const end = createVector(50, 50);
      const result = lerpLine(start, end, { pixelsPerStep: 25 });

      // Line length = 0, steps = floor(0/25) = 0
      // points = 0 + 2 = 2 points
      expect(result.length).toBe(2);

      for (const point of result) {
        expect(vectorsApproxEqual(point, start)).toBe(true);
      }
    });

    test('negative coordinates - horizontal line', () => {
      const start = createVector(-100, -50);
      const end = createVector(0, -50);
      const result = lerpLine(start, end, { steps: 2 });

      expect(result.length).toBe(4);
      expect(vectorsApproxEqual(result[0]!, start)).toBe(true);
      expect(vectorsApproxEqual(result[1]!, createVector(-66.6667, -50))).toBe(true);
      expect(vectorsApproxEqual(result[2]!, createVector(-33.3333, -50))).toBe(true);
      expect(vectorsApproxEqual(result[3]!, end)).toBe(true);
    });

    test('negative coordinates - diagonal line', () => {
      const start = createVector(-50, -50);
      const end = createVector(50, 50);
      const result = lerpLine(start, end, { steps: 1 });

      expect(result.length).toBe(3);
      expect(vectorsApproxEqual(result[0]!, start)).toBe(true);
      expect(vectorsApproxEqual(result[1]!, createVector(0, 0))).toBe(true);
      expect(vectorsApproxEqual(result[2]!, end)).toBe(true);
    });

    test('negative coordinates with pixelsPerStep', () => {
      const start = createVector(-100, 0);
      const end = createVector(100, 0);
      const result = lerpLine(start, end, { pixelsPerStep: 50 });

      // Line length = 200, pixelsPerStep = 50
      // steps = floor(200/50) = 4
      // points = 4 + 2 = 6 points
      expect(result.length).toBe(6);

      const expectedSpacing = 200 / 5;
      for (let i = 1; i < result.length; i++) {
        const dist = distance(result[i - 1]!, result[i]!);
        expect(Math.abs(dist - expectedSpacing)).toBeLessThan(0.0001);
      }
    });

    test('fractional coordinates', () => {
      const start = createVector(0.5, 0.25);
      const end = createVector(10.5, 5.25);
      const result = lerpLine(start, end, { steps: 1 });

      expect(result.length).toBe(3);
      expect(vectorsApproxEqual(result[0]!, start)).toBe(true);
      expect(vectorsApproxEqual(result[1]!, createVector(5.5, 2.75))).toBe(true);
      expect(vectorsApproxEqual(result[2]!, end)).toBe(true);
    });
  });

  describe('mathematical correctness', () => {
    test('verify linear interpolation values - horizontal', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 0);
      const result = lerpLine(start, end, { steps: 4 });

      // Expected points: [0,0], [20,0], [40,0], [60,0], [80,0], [100,0]
      expect(vectorsApproxEqual(result[0]!, createVector(0, 0))).toBe(true);
      expect(vectorsApproxEqual(result[1]!, createVector(20, 0))).toBe(true);
      expect(vectorsApproxEqual(result[2]!, createVector(40, 0))).toBe(true);
      expect(vectorsApproxEqual(result[3]!, createVector(60, 0))).toBe(true);
      expect(vectorsApproxEqual(result[4]!, createVector(80, 0))).toBe(true);
      expect(vectorsApproxEqual(result[5]!, createVector(100, 0))).toBe(true);
    });

    test('verify linear interpolation values - diagonal', () => {
      const start = createVector(0, 0);
      const end = createVector(100, 50);
      const result = lerpLine(start, end, { steps: 4 });

      // Expected points at t = 0, 0.2, 0.4, 0.6, 0.8, 1.0
      expect(vectorsApproxEqual(result[0]!, createVector(0, 0))).toBe(true);
      expect(vectorsApproxEqual(result[1]!, createVector(20, 10))).toBe(true);
      expect(vectorsApproxEqual(result[2]!, createVector(40, 20))).toBe(true);
      expect(vectorsApproxEqual(result[3]!, createVector(60, 30))).toBe(true);
      expect(vectorsApproxEqual(result[4]!, createVector(80, 40))).toBe(true);
      expect(vectorsApproxEqual(result[5]!, createVector(100, 50))).toBe(true);
    });

    test('verify total distance equals line length', () => {
      const start = createVector(10, 20);
      const end = createVector(110, 80);
      const lineLength = distance(start, end);

      const result = lerpLine(start, end, { steps: 10 });

      let totalDistance = 0;
      for (let i = 1; i < result.length; i++) {
        totalDistance += distance(result[i - 1]!, result[i]!);
      }

      expect(Math.abs(totalDistance - lineLength)).toBeLessThan(0.0001);
    });

    test('verify 3D interpolation', () => {
      const start = createVector(0, 0, 0);
      const end = createVector(100, 50, 25);
      const result = lerpLine(start, end, { steps: 1 });

      expect(result.length).toBe(3);
      expect(vectorsApproxEqual(result[0]!, start)).toBe(true);
      expect(vectorsApproxEqual(result[1]!, createVector(50, 25, 12.5))).toBe(true);
      expect(vectorsApproxEqual(result[2]!, end)).toBe(true);
    });
  });
});
