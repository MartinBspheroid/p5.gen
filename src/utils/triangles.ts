/**
 * Recursive triangle subdivision with arc-band pattern generation.
 * Creates fractal triangle patterns with concentric arc decorations.
 */

import { v2, arcPoints, type Vec2 } from "./vec2";

/** Default probability of subdivision at each level */
const DEFAULT_SPLIT_PROBABILITY = 0.7;

/** Default starting resolution (max generation) */
const DEFAULT_START_RESOLUTION = 4;

/** Default minimum resolution (stop subdivision) */
const DEFAULT_MIN_RESOLUTION = 1;

/** Default arc discretization steps */
const DEFAULT_ARC_STEPS = 40;

/** Random sort comparison offset */
const RANDOM_SORT_OFFSET = 0.5;

/** Triangle subdivision factor (split into smaller triangles) */
const SUBDIVISION_FACTOR = 2;

/** Number of vertices in a triangle */
const TRIANGLE_VERTICES = 3;

/** Angle between triangle edges (60 degrees) */
const TRIANGLE_EDGE_ANGLE = Math.PI / 3;

/** Angle for triangle center calculation */
const TRIANGLE_CENTER_ANGLE = Math.PI / 6;

/** Triangle rotation angle (120 degrees) */
const TRIANGLE_ROTATION_ANGLE = (2 * Math.PI) / 3;

/** Inverse triangle rotation angle */
const INVERSE_TRIANGLE_ROTATION_ANGLE = Math.PI / 1.5;

/** Triangle height multiplier for center offset */
const TRIANGLE_HEIGHT_SQRT = Math.sqrt(0.75);

/** Opposite direction (180 degrees) */
const OPPOSITE_DIRECTION = Math.PI;

/** Lane width divisor for arc bands */
const LANE_WIDTH_DIVISOR = 2;

/** Primary circles multiplier for generation 0 */
const PRIMARY_CIRCLES_GEN_ZERO = 1;

/** Primary circles percentage of total lanes */
const PRIMARY_CIRCLES_PERCENTAGE = 0.75;

/** Lane radius offset for arc positioning */
const LANE_RADIUS_OFFSET = 0.5;

/** Exponent for split probability calculation */
const SPLIT_PROBABILITY_EXPONENT_OFFSET = 1;

/** Primary circles lane index (first and third vertices) */
const PRIMARY_CIRCLES_MULTIPLIER = 2;

/**
 * Random number generator function type.
 * Returns a value in [0, 1).
 */
export type RandomFunction = () => number;

/**
 * Parameters for triangle subdivision.
 */
export interface SubdivisionParams {
  /** Probability of splitting at each level (default: 0.7) */
  readonly splitProbability?: number;
  /** Starting resolution/generation (default: 4) */
  readonly startRes?: number;
  /** Minimum resolution before stopping (default: 1) */
  readonly minRes?: number;
  /** Random number generator (default: Math.random) */
  readonly rng?: RandomFunction;
}

/**
 * Parameters for arc band generation.
 */
export interface ArcBandOptions {
  /** Steps for arc discretization (default: 40) */
  readonly arcSteps?: number;
  /** Whether to randomize vertex order (default: true) */
  readonly randomSort?: boolean;
  /** Random number generator (default: Math.random) */
  readonly rng?: RandomFunction;
}

/**
 * Arc band with points and hatching flag.
 */
export interface ArcBand {
  /** Array of points [x, y] defining the arc */
  readonly points: Vec2[];
  /** Whether this band should be hatched */
  readonly hatch: boolean;
}

/**
 * Triangle specification with position, orientation, and generation.
 */
export class TriangleSpec {
  constructor(
    public readonly position: Vec2,
    public readonly heading: number,
    public readonly height: number,
    public readonly generation: number
  ) {}
}

/**
 * Recursively subdivide a triangle into smaller triangles.
 * Creates a fractal pattern with configurable subdivision probability.
 *
 * @param position - Starting position [x, y]
 * @param heading - Direction angle in radians
 * @param height - Triangle height
 * @param params - Subdivision parameters
 * @returns Array of triangle specifications
 *
 * @example
 * ```ts
 * const triangles = subdivideTriangleRoot(
 *   [100, 100],
 *   0,
 *   50,
 *   { splitProbability: 0.7, startRes: 4 }
 * );
 * ```
 */
export function subdivideTriangleRoot(
  position: Vec2,
  heading: number,
  height: number,
  params: SubdivisionParams = {}
): TriangleSpec[] {
  const tris: TriangleSpec[] = [];
  const {
    splitProbability = DEFAULT_SPLIT_PROBABILITY,
    startRes = DEFAULT_START_RESOLUTION,
    minRes = DEFAULT_MIN_RESOLUTION,
    rng = Math.random,
  } = params;

  subdivideTriangle(tris, position, heading, height, startRes, {
    splitProbability,
    startRes,
    minRes,
    rng,
  });

  return tris;
}

/**
 * Internal recursive subdivision function.
 * Splits triangle into 4 smaller triangles based on probability.
 */
function subdivideTriangle(
  out: TriangleSpec[],
  position: Vec2,
  heading: number,
  height: number,
  generation: number,
  params: Required<SubdivisionParams>
): void {
  const { splitProbability, startRes, minRes, rng } = params;

  const shouldSplit =
    generation > minRes &&
    rng() <=
      Math.pow(
        splitProbability,
        SPLIT_PROBABILITY_EXPONENT_OFFSET + (startRes - generation)
      );

  if (!shouldSplit) {
    out.push(new TriangleSpec(position, heading, height, generation));
    return;
  }

  /**
   * Move forward from position in given direction.
   */
  const forward = (pos: Vec2, angle: number, d: number): Vec2 => {
    const [dx, dy] = v2.fromAngle(angle, d);
    return v2.add(pos, [dx, dy]);
  };

  const halfHeight = height / SUBDIVISION_FACTOR;
  const nextGen = generation - 1;

  // Subdivide into 4 triangles
  subdivideTriangle(out, position, heading, halfHeight, nextGen, params);

  const pos2 = forward(position, heading, halfHeight);
  subdivideTriangle(out, pos2, heading, halfHeight, nextGen, params);

  const pos3 = forward(position, heading + TRIANGLE_EDGE_ANGLE, halfHeight);
  subdivideTriangle(out, pos3, heading, halfHeight, nextGen, params);

  const pos4 = forward(
    position,
    heading + TRIANGLE_CENTER_ANGLE,
    height * TRIANGLE_HEIGHT_SQRT
  );
  const heading4 = heading + OPPOSITE_DIRECTION;
  subdivideTriangle(out, pos4, heading4, halfHeight, nextGen, params);
}

/**
 * Calculate the three vertices of an equilateral triangle from specification.
 *
 * @param spec - Triangle specification
 * @returns Array of three vertices [v0, v1, v2]
 *
 * @example
 * ```ts
 * const spec = new TriangleSpec([100, 100], 0, 50, 2);
 * const [v0, v1, v2] = triangleVertices(spec);
 * ```
 */
export function triangleVertices(spec: TriangleSpec): [Vec2, Vec2, Vec2] {
  const { position, heading, height } = spec;
  const v0 = position;
  const v1 = v2.add(v0, v2.fromAngle(heading, height));
  const v2p = v2.add(v1, v2.fromAngle(heading - TRIANGLE_ROTATION_ANGLE, height));
  return [v0, v1, v2p];
}

/**
 * Generate arc band patterns along triangle edges.
 * Creates concentric arcs centered at each vertex, mimicking TurtleToy patterns.
 *
 * @param spec - Triangle specification
 * @param options - Arc band generation options
 * @returns Array of arc bands with points and hatch flags
 *
 * @example
 * ```ts
 * const spec = new TriangleSpec([100, 100], 0, 50, 2);
 * const bands = triangleArcBands(spec, { arcSteps: 20 });
 * bands.forEach(band => {
 *   // Draw arc or hatch based on band.hatch
 *   band.points.forEach(([x, y]) => { ... });
 * });
 * ```
 */
export function triangleArcBands(
  spec: TriangleSpec,
  options: ArcBandOptions = {}
): ArcBand[] {
  const { position, heading, height, generation } = spec;
  const {
    arcSteps = DEFAULT_ARC_STEPS,
    randomSort = true,
    rng = Math.random,
  } = options;

  const lanes = Math.pow(SUBDIVISION_FACTOR, generation + 1);
  const primaryCircles =
    generation === 0
      ? PRIMARY_CIRCLES_GEN_ZERO
      : Math.ceil(lanes * PRIMARY_CIRCLES_PERCENTAGE);

  // Calculate triangle vertices with their base headings
  const verts: Array<{ center: Vec2; baseHeading: number }> = [];
  let pos = position;
  let angle = heading;

  for (let i = 0; i < TRIANGLE_VERTICES; i++) {
    verts.push({
      center: pos,
      baseHeading: heading + i * TRIANGLE_ROTATION_ANGLE,
    });
    const step = v2.fromAngle(angle, height);
    pos = v2.add(pos, step);
    angle -= INVERSE_TRIANGLE_ROTATION_ANGLE;
  }

  // Optionally randomize vertex order
  const positions = verts.slice();
  if (randomSort) {
    positions.sort(() => rng() - RANDOM_SORT_OFFSET);
  }

  const laneWidth = height / lanes / LANE_WIDTH_DIVISOR;
  const circlesPerVertex = [
    primaryCircles * PRIMARY_CIRCLES_MULTIPLIER,
    lanes,
    primaryCircles * PRIMARY_CIRCLES_MULTIPLIER,
  ];

  const bands: ArcBand[] = [];

  // Generate arc bands for each vertex
  for (let k = 0; k < TRIANGLE_VERTICES; k++) {
    const { center, baseHeading } = positions[k]!;
    const maxCircles = circlesPerVertex[k]!;

    for (let i = 0; i <= maxCircles; i++) {
      const r = (i + LANE_RADIUS_OFFSET) * laneWidth;
      const startAngle = baseHeading;
      const endAngle = baseHeading + TRIANGLE_EDGE_ANGLE;

      const arcPts = arcPoints(center, r, startAngle, endAngle, arcSteps);
      const pts: Vec2[] = [center, ...arcPts];

      bands.push({
        points: pts,
        hatch: i % 2 === 1,
      });
    }
  }

  return bands;
}
