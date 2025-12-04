/// <reference path="../globals.d.ts" />
/**
 * Circle geometry utilities for calculations and transformations.
 * All functions are pure and return new values without mutation.
 */

import { v2, arcPoints, type Vec2 } from "./vec2";

/** Small value for floating-point comparisons */
const EPSILON = 1e-9;

/** Axis-aligned bounding box */
export type BoundingBox = {
  readonly min: Vec2;
  readonly max: Vec2;
};

/** Polar coordinate representation */
export type PolarCoord = {
  readonly r: number;
  readonly theta: number;
};

// ============================================================================
// Basic Calculations
// ============================================================================

/**
 * Calculate the circumference of a circle.
 * @param r - Radius of the circle
 * @returns Circumference (2πr)
 */
export function circumference(r: number): number {
  return TWO_PI * r;
}

/**
 * Calculate the area of a circle.
 * @param r - Radius of the circle
 * @returns Area (πr²)
 */
export function area(r: number): number {
  return PI * r * r;
}

/**
 * Derive radius from circumference.
 * @param c - Circumference value
 * @returns Radius (C / 2π)
 */
export function radiusFromCircumference(c: number): number {
  return c / TWO_PI;
}

/**
 * Derive radius from area.
 * @param a - Area value
 * @returns Radius (√(A/π))
 */
export function radiusFromArea(a: number): number {
  return Math.sqrt(a / PI);
}

/**
 * Calculate chord length from central angle.
 * @param r - Radius of the circle
 * @param angle - Central angle in radians
 * @returns Length of the chord
 */
export function chordLength(r: number, angle: number): number {
  return 2 * r * Math.sin(angle / 2);
}

/**
 * Calculate arc length from central angle.
 * @param r - Radius of the circle
 * @param angle - Central angle in radians
 * @returns Length of the arc
 */
export function arcLength(r: number, angle: number): number {
  return r * Math.abs(angle);
}

/**
 * Calculate sector area from central angle.
 * @param r - Radius of the circle
 * @param angle - Central angle in radians
 * @returns Area of the sector
 */
export function sectorArea(r: number, angle: number): number {
  return 0.5 * r * r * Math.abs(angle);
}

// ============================================================================
// Coordinate Conversions
// ============================================================================

/**
 * Convert polar coordinates to Cartesian coordinates.
 * @param r - Radial distance from origin
 * @param theta - Angle in radians (0 = right, π/2 = up)
 * @param origin - Optional origin point (default: [0, 0])
 * @returns Cartesian point [x, y]
 */
export function polarToCartesian(r: number, theta: number, origin: Vec2 = [0, 0]): Vec2 {
  const [ox, oy] = origin;
  return [ox + r * Math.cos(theta), oy + r * Math.sin(theta)];
}

/**
 * Convert Cartesian coordinates to polar coordinates.
 * @param point - Cartesian point [x, y]
 * @param origin - Optional origin point (default: [0, 0])
 * @returns Polar coordinates { r, theta }
 */
export function cartesianToPolar(point: Vec2, origin: Vec2 = [0, 0]): PolarCoord {
  const [px, py] = point;
  const [ox, oy] = origin;
  const dx = px - ox;
  const dy = py - oy;
  return {
    r: Math.hypot(dx, dy),
    theta: Math.atan2(dy, dx),
  };
}

// ============================================================================
// Point Generation
// ============================================================================

/**
 * Generate evenly spaced points along a circle's circumference.
 * @param center - Center point of the circle
 * @param r - Radius of the circle
 * @param steps - Number of points (default: 40)
 * @returns Array of points on the circumference
 */
export function circlePoints(center: Vec2, r: number, steps = 40): Vec2[] {
  return arcPoints(center, r, 0, TWO_PI, steps).slice(0, -1);
}

/**
 * Compute the minimal axis-aligned bounding box enclosing a circle.
 * @param center - Center point of the circle
 * @param r - Radius of the circle
 * @returns Bounding box with min and max corners
 */
export function circleBoundingBox(center: Vec2, r: number): BoundingBox {
  const [cx, cy] = center;
  return {
    min: [cx - r, cy - r],
    max: [cx + r, cy + r],
  };
}

// ============================================================================
// Tests and Checks
// ============================================================================

/**
 * Check whether a point lies inside or on the boundary of a circle.
 * @param point - Point to test
 * @param center - Center of the circle
 * @param r - Radius of the circle
 * @returns True if point is inside or on boundary
 */
export function pointInCircle(point: Vec2, center: Vec2, r: number): boolean {
  const dist = v2.length(v2.sub(point, center));
  return dist <= r + EPSILON;
}

/**
 * Check if two circles overlap (collision detection).
 * @param c1 - Center of first circle
 * @param r1 - Radius of first circle
 * @param c2 - Center of second circle
 * @param r2 - Radius of second circle
 * @returns True if circles overlap or touch
 */
export function circlesIntersect(c1: Vec2, r1: number, c2: Vec2, r2: number): boolean {
  const dist = v2.length(v2.sub(c2, c1));
  return dist <= r1 + r2 + EPSILON;
}

/**
 * Check if two circles share the same center.
 * @param c1 - Center of first circle
 * @param c2 - Center of second circle
 * @returns True if centers are the same (within epsilon)
 */
export function areConcentric(c1: Vec2, c2: Vec2): boolean {
  return v2.length(v2.sub(c2, c1)) < EPSILON;
}

// ============================================================================
// Intersections
// ============================================================================

/**
 * Find intersection points between two circles.
 * @param c1 - Center of first circle
 * @param r1 - Radius of first circle
 * @param c2 - Center of second circle
 * @param r2 - Radius of second circle
 * @returns Array of 0, 1, or 2 intersection points (empty if no intersection or identical circles)
 */
export function circleIntersectionPoints(c1: Vec2, r1: number, c2: Vec2, r2: number): Vec2[] {
  const d = v2.length(v2.sub(c2, c1));

  // No intersection: circles too far apart or one inside the other
  if (d > r1 + r2 + EPSILON || d < Math.abs(r1 - r2) - EPSILON) {
    return [];
  }

  // Identical circles: infinite intersections
  if (d < EPSILON && Math.abs(r1 - r2) < EPSILON) {
    return [];
  }

  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const h2 = r1 * r1 - a * a;

  // Single point: circles touch
  if (h2 < EPSILON) {
    const [c1x, c1y] = c1;
    const [c2x, c2y] = c2;
    const px = c1x + (a / d) * (c2x - c1x);
    const py = c1y + (a / d) * (c2y - c1y);
    return [[px, py]];
  }

  const h = Math.sqrt(h2);
  const [c1x, c1y] = c1;
  const [c2x, c2y] = c2;

  const px = c1x + (a / d) * (c2x - c1x);
  const py = c1y + (a / d) * (c2y - c1y);

  const dx = (h / d) * (c2y - c1y);
  const dy = (h / d) * (c2x - c1x);

  return [
    [px + dx, py - dy],
    [px - dx, py + dy],
  ];
}

/**
 * Find intersection points between a line segment and a circle.
 * @param lineStart - Start point of line segment
 * @param lineEnd - End point of line segment
 * @param center - Center of the circle
 * @param r - Radius of the circle
 * @returns Array of 0, 1, or 2 intersection points
 */
export function circleLineIntersection(
  lineStart: Vec2,
  lineEnd: Vec2,
  center: Vec2,
  r: number
): Vec2[] {
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  const [cx, cy] = center;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;

  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < -EPSILON) {
    return [];
  }

  const points: Vec2[] = [];
  const sqrtDisc = Math.sqrt(Math.max(0, discriminant));

  const t1 = (-b - sqrtDisc) / (2 * a);
  const t2 = (-b + sqrtDisc) / (2 * a);

  if (t1 >= -EPSILON && t1 <= 1 + EPSILON) {
    points.push([x1 + t1 * dx, y1 + t1 * dy]);
  }

  if (Math.abs(discriminant) > EPSILON && t2 >= -EPSILON && t2 <= 1 + EPSILON) {
    points.push([x1 + t2 * dx, y1 + t2 * dy]);
  }

  return points;
}

// ============================================================================
// Advanced Geometry
// ============================================================================

/**
 * Compute the center of the unique circle passing through three non-collinear points.
 * @param p1 - First point
 * @param p2 - Second point
 * @param p3 - Third point
 * @returns Circumcenter point, or null if points are collinear
 */
export function circumcenter(p1: Vec2, p2: Vec2, p3: Vec2): Vec2 | null {
  const [ax, ay] = p1;
  const [bx, by] = p2;
  const [cx, cy] = p3;

  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));

  if (Math.abs(d) < EPSILON) {
    return null;
  }

  const aSq = ax * ax + ay * ay;
  const bSq = bx * bx + by * by;
  const cSq = cx * cx + cy * cy;

  const ux = (aSq * (by - cy) + bSq * (cy - ay) + cSq * (ay - by)) / d;
  const uy = (aSq * (cx - bx) + bSq * (ax - cx) + cSq * (bx - ax)) / d;

  return [ux, uy];
}

/**
 * Find tangent points from an external point to a circle.
 * @param point - External point
 * @param center - Center of the circle
 * @param r - Radius of the circle
 * @returns Array of 0, 1, or 2 tangent points (empty if point is inside circle)
 */
export function tangentPoints(point: Vec2, center: Vec2, r: number): Vec2[] {
  const dist = v2.length(v2.sub(point, center));

  // Point inside circle
  if (dist < r - EPSILON) {
    return [];
  }

  // Point on circle
  if (Math.abs(dist - r) < EPSILON) {
    return [point];
  }

  const [px, py] = point;
  const [cx, cy] = center;

  const angle = Math.atan2(py - cy, px - cx);
  const tangentAngle = Math.acos(r / dist);

  return [
    [cx + r * Math.cos(angle + tangentAngle), cy + r * Math.sin(angle + tangentAngle)],
    [cx + r * Math.cos(angle - tangentAngle), cy + r * Math.sin(angle - tangentAngle)],
  ];
}

/**
 * Compute the smallest circle that encloses a set of points (Welzl's algorithm).
 * @param points - Array of points to enclose
 * @returns Object with center and radius, or null if no points provided
 */
export function smallestEnclosingCircle(
  points: readonly Vec2[]
): { center: Vec2; radius: number } | null {
  if (points.length === 0) {
    return null;
  }

  // Shuffle for expected linear time
  const shuffled = [...points].sort(() => Math.random() - 0.5);

  return welzl(shuffled, []);
}

/**
 * Welzl's recursive algorithm implementation.
 */
function welzl(
  points: Vec2[],
  boundary: Vec2[]
): { center: Vec2; radius: number } {
  if (points.length === 0 || boundary.length === 3) {
    return minCircleFromBoundary(boundary);
  }

  const lastPoint = points[points.length - 1];
  if (!lastPoint) {
    return minCircleFromBoundary(boundary);
  }

  const remaining = points.slice(0, -1);
  const circle = welzl(remaining, boundary);

  if (pointInCircleExact(lastPoint, circle.center, circle.radius)) {
    return circle;
  }

  return welzl(remaining, [...boundary, lastPoint]);
}

/**
 * Construct minimum circle from boundary points.
 */
function minCircleFromBoundary(boundary: Vec2[]): { center: Vec2; radius: number } {
  const b0 = boundary[0];
  const b1 = boundary[1];
  const b2 = boundary[2];

  if (!b0) {
    return { center: [0, 0], radius: 0 };
  }

  if (!b1) {
    return { center: b0, radius: 0 };
  }

  if (!b2) {
    const [x1, y1] = b0;
    const [x2, y2] = b1;
    return {
      center: [(x1 + x2) / 2, (y1 + y2) / 2],
      radius: v2.length(v2.sub(b1, b0)) / 2,
    };
  }

  // Three points - use circumcenter
  const center = circumcenter(b0, b1, b2);
  if (center === null) {
    // Collinear - use diameter of furthest two points
    const d01 = v2.length(v2.sub(b1, b0));
    const d12 = v2.length(v2.sub(b2, b1));
    const d02 = v2.length(v2.sub(b2, b0));

    if (d01 >= d12 && d01 >= d02) {
      return minCircleFromBoundary([b0, b1]);
    }
    if (d12 >= d01 && d12 >= d02) {
      return minCircleFromBoundary([b1, b2]);
    }
    return minCircleFromBoundary([b0, b2]);
  }

  return {
    center,
    radius: v2.length(v2.sub(b0, center)),
  };
}

/**
 * Exact point-in-circle test for Welzl algorithm (no epsilon tolerance).
 */
function pointInCircleExact(point: Vec2, center: Vec2, radius: number): boolean {
  return v2.length(v2.sub(point, center)) <= radius + EPSILON;
}
