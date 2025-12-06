/**
 * Tests for basic circle calculation functions
 * These tests cover: circumference, area, radiusFromCircumference, radiusFromArea,
 * chordLength, arcLength, and sectorArea
 */
import { test, expect, describe } from 'bun:test';
import './globals'; // This sets up PI and TWO_PI
import {
  circumference,
  area,
  radiusFromCircumference,
  radiusFromArea,
  chordLength,
  arcLength,
  sectorArea,
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
