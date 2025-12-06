/// <reference path="../node_modules/@types/p5/global.d.ts" />
/**
 * Catmull-Rom Spline interpolation for smooth curves through control points.
 *
 * Catmull-Rom splines create smooth curves that pass through all control points,
 * named after Edwin Catmull and Raphael Rom (1974).
 *
 * Mathematical Approach:
 * - Uses cubic Hermite spline interpolation
 * - Tangent at each point is calculated from neighboring points
 * - Provides C1 continuity (continuous first derivatives)
 * - No overshooting or self-intersection within segments
 *
 * Key Parameters:
 * - alpha: Tension parameter (0=uniform, 0.5=centripetal, 1.0=chordal)
 *   - Centripetal (0.5) is recommended: prevents loops and cusps
 * - tension: Alternative parameterization for curve tightness (cardinal spline)
 *
 * Uses:
 * - Animation paths with smooth motion
 * - Drawing smooth curves through user-specified points
 * - Camera path interpolation
 * - Character/object movement along paths
 *
 * All functions are pure and return new values without mutation.
 */

// ============================================================================
// Type Definitions
// ============================================================================

/** Configuration for Catmull-Rom spline */
export type CatmullRomConfig = {
  /** Alpha parameter: 0=uniform, 0.5=centripetal (recommended), 1.0=chordal */
  readonly alpha?: number;
  /** Tension parameter for cardinal spline (0=default Catmull-Rom) */
  readonly tension?: number;
  /** Whether the curve should loop back to the start */
  readonly closed?: boolean;
  /** Number of interpolated points per segment */
  readonly segments?: number;
  /** Whether to use 3D coordinates */
  readonly is3D?: boolean;
};

/** Point input that can be a p5.Vector or simple object */
export type PointInput = {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
};

/** Vector component names */
type VectorComponent = "x" | "y" | "z";

// ============================================================================
// Constants
// ============================================================================

/** Default configuration values */
const DEFAULT_CONFIG: Required<CatmullRomConfig> = {
  alpha: 0.5,
  tension: 0,
  closed: false,
  segments: 20,
  is3D: false,
};

/** Small value for numerical stability */
const EPSILON = 1e-4;

// ============================================================================
// Catmull-Rom Spline Class
// ============================================================================

/**
 * A Catmull-Rom spline that passes through all control points.
 */
export class CatmullRomSpline {
  private _points: p5.Vector[];
  readonly alpha: number;
  readonly tension: number;
  readonly closed: boolean;
  readonly segments: number;
  readonly is3D: boolean;

  /**
   * Create a new Catmull-Rom spline.
   * @param config - Configuration options
   */
  constructor(config: CatmullRomConfig = {}) {
    this._points = [];
    this.alpha = config.alpha ?? DEFAULT_CONFIG.alpha;
    this.tension = config.tension ?? DEFAULT_CONFIG.tension;
    this.closed = config.closed ?? DEFAULT_CONFIG.closed;
    this.segments = config.segments ?? DEFAULT_CONFIG.segments;
    this.is3D = config.is3D ?? DEFAULT_CONFIG.is3D;
  }

  /**
   * Get the control points.
   * @returns Array of control points
   */
  get points(): readonly p5.Vector[] {
    return this._points;
  }

  /**
   * Add a control point to the spline.
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate (optional, for 3D)
   */
  addPoint(x: number, y: number, z?: number): void {
    if (this.is3D) {
      this._points.push(createVector(x, y, z ?? 0));
    } else {
      this._points.push(createVector(x, y));
    }
  }

  /**
   * Set all control points at once.
   * @param points - Array of points (p5.Vector or {x, y, z?} objects)
   */
  setPoints(points: readonly (p5.Vector | PointInput)[]): void {
    this._points = points.map((p) => {
      if ("z" in p && p.z !== undefined) {
        return createVector(p.x, p.y, this.is3D ? p.z : 0);
      }
      return createVector(p.x, p.y);
    });
  }

  /**
   * Clear all control points.
   */
  clearPoints(): void {
    this._points = [];
  }

  /**
   * Get point at parameter t (0 to 1) along entire spline.
   * t=0 is the first control point, t=1 is the last.
   * @param t - Parameter value (0 to 1)
   * @returns Point on the spline
   */
  getPoint(t: number): p5.Vector {
    if (this._points.length < 2) {
      return this._points[0] ? this._points[0].copy() : createVector(0, 0);
    }

    // Clamp t to valid range
    const clampedT = Math.max(0, Math.min(1, t));

    // Calculate which segment we're in
    const numSegments = this.closed ? this._points.length : this._points.length - 1;
    const segmentT = clampedT * numSegments;
    const segment = Math.min(Math.floor(segmentT), numSegments - 1);
    const localT = segmentT - segment;

    // Get the four control points for this segment
    const p0 = this.getControlPoint(segment - 1);
    const p1 = this.getControlPoint(segment);
    const p2 = this.getControlPoint(segment + 1);
    const p3 = this.getControlPoint(segment + 2);

    return this.interpolate(p0, p1, p2, p3, localT);
  }

  /**
   * Get point at specific segment and local t parameter.
   * @param segment - Segment index (0 to numSegments-1)
   * @param t - Position within segment (0 to 1)
   * @returns Point on the segment
   */
  getPointAtSegment(segment: number, t: number): p5.Vector {
    if (this._points.length < 2) {
      return this._points[0] ? this._points[0].copy() : createVector(0, 0);
    }

    const p0 = this.getControlPoint(segment - 1);
    const p1 = this.getControlPoint(segment);
    const p2 = this.getControlPoint(segment + 1);
    const p3 = this.getControlPoint(segment + 2);

    return this.interpolate(p0, p1, p2, p3, t);
  }

  /**
   * Get tangent (velocity) vector at parameter t.
   * @param t - Parameter value (0 to 1)
   * @returns Tangent vector at that point
   */
  getTangent(t: number): p5.Vector {
    if (this._points.length < 2) {
      return createVector(0, 0);
    }

    const clampedT = Math.max(0, Math.min(1, t));

    const numSegments = this.closed ? this._points.length : this._points.length - 1;
    const segmentT = clampedT * numSegments;
    const segment = Math.min(Math.floor(segmentT), numSegments - 1);
    const localT = segmentT - segment;

    const p0 = this.getControlPoint(segment - 1);
    const p1 = this.getControlPoint(segment);
    const p2 = this.getControlPoint(segment + 1);
    const p3 = this.getControlPoint(segment + 2);

    return this.tangent(p0, p1, p2, p3, localT);
  }

  /**
   * Get normalized tangent (direction) at parameter t.
   * @param t - Parameter value (0 to 1)
   * @returns Normalized direction vector
   */
  getDirection(t: number): p5.Vector {
    const tangent = this.getTangent(t);
    tangent.normalize();
    return tangent;
  }

  /**
   * Get approximate curve length using numerical integration.
   * @param samples - Number of samples for approximation (higher = more accurate)
   * @returns Approximate arc length
   */
  getLength(samples = 100): number {
    if (this._points.length < 2) return 0;

    let length = 0;
    let prevPoint = this.getPoint(0);

    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      const currentPoint = this.getPoint(t);
      length += prevPoint.dist(currentPoint);
      prevPoint = currentPoint;
    }

    return length;
  }

  /**
   * Get array of interpolated points along the spline.
   * @param pointsPerSegment - Number of points per segment (default: this.segments)
   * @returns Array of points along the curve
   */
  getPoints(pointsPerSegment?: number): p5.Vector[] {
    if (this._points.length < 2) return [];

    const pps = pointsPerSegment ?? this.segments;
    const numSegments = this.closed ? this._points.length : this._points.length - 1;
    const result: p5.Vector[] = [];

    for (let seg = 0; seg < numSegments; seg++) {
      const p0 = this.getControlPoint(seg - 1);
      const p1 = this.getControlPoint(seg);
      const p2 = this.getControlPoint(seg + 1);
      const p3 = this.getControlPoint(seg + 2);

      // Generate points for this segment
      const steps = seg === numSegments - 1 ? pps + 1 : pps;
      for (let i = 0; i < steps; i++) {
        const t = i / pps;
        result.push(this.interpolate(p0, p1, p2, p3, t));
      }
    }

    return result;
  }

  /**
   * Get evenly spaced points along curve (arc-length parameterization).
   * Useful for animation at constant speed.
   * @param numPoints - Number of evenly spaced points
   * @returns Array of evenly spaced points
   */
  getEvenlySpacedPoints(numPoints: number): p5.Vector[] {
    if (this._points.length < 2) return [];

    const totalLength = this.getLength(200);
    const segmentLength = totalLength / (numPoints - 1);
    const result: p5.Vector[] = [];

    result.push(this.getPoint(0));

    let currentLength = 0;
    let currentT = 0;
    const samples = 1000;
    const dt = 1.0 / samples;

    for (let i = 1; i < numPoints - 1; i++) {
      const targetLength = i * segmentLength;

      while (currentLength < targetLength && currentT < 1.0) {
        const p1 = this.getPoint(currentT);
        const p2 = this.getPoint(currentT + dt);
        currentLength += p5.Vector.dist(p1, p2);
        currentT += dt;
      }

      result.push(this.getPoint(currentT));
    }

    result.push(this.getPoint(1));

    return result;
  }

  /**
   * Convert t parameter to arc-length parameterized t.
   * Useful for constant-speed animation.
   * @param t - Linear parameter (0 to 1)
   * @param samples - Number of samples for approximation
   * @returns Arc-length parameterized t value
   */
  tToArcLengthT(t: number, samples = 100): number {
    if (t <= 0) return 0;
    if (t >= 1) return 1;

    const targetLength = this.getLength(samples) * t;
    let currentLength = 0;
    let prevPoint = this.getPoint(0);

    for (let i = 1; i <= samples; i++) {
      const currentT = i / samples;
      const currentPoint = this.getPoint(currentT);
      const segmentLength = p5.Vector.dist(prevPoint, currentPoint);

      if (currentLength + segmentLength >= targetLength) {
        const remaining = targetLength - currentLength;
        const ratio = remaining / segmentLength;
        return (i - 1 + ratio) / samples;
      }

      currentLength += segmentLength;
      prevPoint = currentPoint;
    }

    return 1;
  }

  /**
   * Get control point with wraparound for closed curves.
   * @param index - Point index (can be negative or beyond array length)
   * @returns Control point at that index
   */
  private getControlPoint(index: number): p5.Vector {
    const n = this._points.length;
    if (n === 0) return createVector(0, 0);

    if (this.closed) {
      // Wrap around for closed curves
      const wrappedIndex = ((index % n) + n) % n;
      const point = this._points[wrappedIndex];
      return point ?? createVector(0, 0);
    } else {
      // Clamp for open curves
      if (index < 0) {
        const point = this._points[0];
        return point ?? createVector(0, 0);
      }
      if (index >= n) {
        const point = this._points[n - 1];
        return point ?? createVector(0, 0);
      }
      const point = this._points[index];
      return point ?? createVector(0, 0);
    }
  }

  /**
   * Catmull-Rom interpolation between four control points.
   * @param p0 - First control point (before segment)
   * @param p1 - Second control point (segment start)
   * @param p2 - Third control point (segment end)
   * @param p3 - Fourth control point (after segment)
   * @param t - Parameter (0 to 1)
   * @returns Interpolated point
   */
  private interpolate(
    p0: p5.Vector,
    p1: p5.Vector,
    p2: p5.Vector,
    p3: p5.Vector,
    t: number
  ): p5.Vector {
    if (this.alpha === 0 && this.tension === 0) {
      return this.uniformInterpolate(p0, p1, p2, p3, t);
    } else if (this.tension !== 0) {
      return this.cardinalInterpolate(p0, p1, p2, p3, t, this.tension);
    } else {
      return this.nonUniformInterpolate(p0, p1, p2, p3, t, this.alpha);
    }
  }

  /**
   * Standard uniform Catmull-Rom interpolation.
   * Formula: q(t) = 0.5 * [(2*P1) + (-P0+P2)*t + (2*P0-5*P1+4*P2-P3)*t² + (-P0+3*P1-3*P2+P3)*t³]
   */
  private uniformInterpolate(
    p0: p5.Vector,
    p1: p5.Vector,
    p2: p5.Vector,
    p3: p5.Vector,
    t: number
  ): p5.Vector {
    const t2 = t * t;
    const t3 = t2 * t;

    const result = createVector(0, 0, 0);
    const components: readonly VectorComponent[] = ["x", "y", "z"] as const;

    for (const c of components) {
      const p0c = p0[c];
      const p1c = p1[c];
      const p2c = p2[c];
      const p3c = p3[c];

      if (p0c === undefined || p1c === undefined || p2c === undefined || p3c === undefined) {
        continue;
      }

      result[c] =
        0.5 *
        (2 * p1c +
          (-p0c + p2c) * t +
          (2 * p0c - 5 * p1c + 4 * p2c - p3c) * t2 +
          (-p0c + 3 * p1c - 3 * p2c + p3c) * t3);
    }

    return result;
  }

  /**
   * Cardinal spline interpolation with tension parameter.
   * @param tension - 0 = Catmull-Rom, 1 = straight lines
   */
  private cardinalInterpolate(
    p0: p5.Vector,
    p1: p5.Vector,
    p2: p5.Vector,
    p3: p5.Vector,
    t: number,
    tension: number
  ): p5.Vector {
    const t2 = t * t;
    const t3 = t2 * t;
    const s = (1 - tension) / 2;

    const result = createVector(0, 0, 0);
    const components: readonly VectorComponent[] = ["x", "y", "z"] as const;

    for (const c of components) {
      const p0c = p0[c];
      const p1c = p1[c];
      const p2c = p2[c];
      const p3c = p3[c];

      if (p0c === undefined || p1c === undefined || p2c === undefined || p3c === undefined) {
        continue;
      }

      // Hermite basis functions with tension
      const m1 = s * (p2c - p0c);
      const m2 = s * (p3c - p1c);

      result[c] =
        (2 * t3 - 3 * t2 + 1) * p1c +
        (t3 - 2 * t2 + t) * m1 +
        (-2 * t3 + 3 * t2) * p2c +
        (t3 - t2) * m2;
    }

    return result;
  }

  /**
   * Centripetal/Chordal Catmull-Rom interpolation.
   * @param alpha - 0 = uniform, 0.5 = centripetal (recommended), 1.0 = chordal
   */
  private nonUniformInterpolate(
    p0: p5.Vector,
    p1: p5.Vector,
    p2: p5.Vector,
    p3: p5.Vector,
    t: number,
    alpha: number
  ): p5.Vector {
    // Calculate knot intervals based on distance
    let dt0 = Math.pow(p5.Vector.dist(p0, p1), alpha);
    let dt1 = Math.pow(p5.Vector.dist(p1, p2), alpha);
    let dt2 = Math.pow(p5.Vector.dist(p2, p3), alpha);

    // Safety check for coincident points
    if (dt1 < EPSILON) dt1 = 1.0;
    if (dt0 < EPSILON) dt0 = dt1;
    if (dt2 < EPSILON) dt2 = dt1;

    // Calculate intermediate tangent points
    const t1 = p5.Vector.lerp(p0, p1, dt1 / (dt0 + dt1));
    const t2 = p5.Vector.lerp(p1, p2, dt0 / (dt0 + dt1));
    const t3 = p5.Vector.lerp(p1, p2, dt2 / (dt1 + dt2));
    const t4 = p5.Vector.lerp(p2, p3, dt1 / (dt1 + dt2));

    // Calculate control points for cubic Bezier
    const c1 = p5.Vector.lerp(t1, t2, dt1 / (dt0 + dt1 + dt2));
    const c2 = p5.Vector.lerp(t3, t4, dt1 / (dt0 + dt1 + dt2));

    // Cubic Bezier interpolation
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const tSquared = t * t;
    const tCubed = tSquared * t;

    const result = createVector(0, 0, 0);
    const components: readonly VectorComponent[] = ["x", "y", "z"] as const;

    for (const c of components) {
      const p1c = p1[c];
      const c1c = c1[c];
      const c2c = c2[c];
      const p2c = p2[c];

      if (p1c === undefined || c1c === undefined || c2c === undefined || p2c === undefined) {
        continue;
      }

      result[c] = mt3 * p1c + 3 * mt2 * t * c1c + 3 * mt * tSquared * c2c + tCubed * p2c;
    }

    return result;
  }

  /**
   * Calculate tangent vector at parameter t.
   * This is the derivative of the interpolation function.
   */
  private tangent(
    p0: p5.Vector,
    p1: p5.Vector,
    p2: p5.Vector,
    p3: p5.Vector,
    t: number
  ): p5.Vector {
    if (this.alpha === 0 && this.tension === 0) {
      // Derivative of uniform Catmull-Rom
      const t2 = t * t;
      const result = createVector(0, 0, 0);

      const components: readonly VectorComponent[] = ["x", "y", "z"] as const;
      for (const c of components) {
        const p0c = p0[c];
        const p1c = p1[c];
        const p2c = p2[c];
        const p3c = p3[c];

        if (p0c === undefined || p1c === undefined || p2c === undefined || p3c === undefined) {
          continue;
        }

        result[c] =
          0.5 *
          ((-p0c + p2c) +
            2 * (2 * p0c - 5 * p1c + 4 * p2c - p3c) * t +
            3 * (-p0c + 3 * p1c - 3 * p2c + p3c) * t2);
      }

      return result;
    } else {
      // Numerical derivative for non-uniform cases
      const epsilon = 0.001;
      const t1 = Math.max(0, Math.min(1, t - epsilon));
      const t2 = Math.max(0, Math.min(1, t + epsilon));
      const pT1 = this.interpolate(p0, p1, p2, p3, t1);
      const pT2 = this.interpolate(p0, p1, p2, p3, t2);
      return p5.Vector.sub(pT2, pT1).div(t2 - t1);
    }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a Catmull-Rom spline from an array of points.
 * Convenience function for creating splines.
 * @param points - Array of control points
 * @param config - Configuration options
 * @returns Configured CatmullRomSpline
 */
export function createCatmullRomSpline(
  points: readonly (p5.Vector | PointInput)[],
  config: CatmullRomConfig = {}
): CatmullRomSpline {
  const spline = new CatmullRomSpline(config);
  spline.setPoints(points);
  return spline;
}

/**
 * Create a smooth path through points with centripetal parameterization.
 * @param positions - Array of points to interpolate
 * @param smoothness - Alpha parameter (default: 0.5 = centripetal)
 * @returns Configured CatmullRomSpline
 */
export function createSmoothPath(
  positions: readonly (p5.Vector | PointInput)[],
  smoothness = 0.5
): CatmullRomSpline {
  return createCatmullRomSpline(positions, {
    alpha: smoothness,
    closed: false,
    segments: 20,
  });
}
