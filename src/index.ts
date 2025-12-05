/**
 * p5.gen utilities for generative art and creative coding.
 *
 * This collection provides advanced tools for:
 * - 2D vector mathematics and geometry
 * - Circle and polar coordinate utilities
 * - Line interpolation utilities
 * - Noise generation (Simplex, FBM, Curl)
 * - Poisson-disc sampling (blue-noise distribution)
 * - Contour extraction (Marching Squares)
 * - Pattern formation (Reaction-Diffusion)
 * - Recursive subdivision (Triangles)
 * - Polygon clipping and hatching
 *
 * All utilities are framework-agnostic and work with p5.js, Canvas, or any rendering system.
 */

// Initialize global math constants (PI, TWO_PI)
import "./globals";

// Vector utilities
export { arcPoints } from "./vec2";

// Line utilities
export { distance, lerp, lerpLine, type LerpOptions } from "./line";

// Circle utilities
export {
  circumference,
  area,
  radiusFromCircumference,
  radiusFromArea,
  chordLength,
  arcLength,
  sectorArea,
  polarToCartesian,
  cartesianToPolar,
  circlePoints,
  circleBoundingBox,
  pointInCircle,
  circlesIntersect,
  areConcentric,
  circleIntersectionPoints,
  circleLineIntersection,
  circumcenter,
  tangentPoints,
  smallestEnclosingCircle,
  type BoundingBox,
  type PolarCoord,
} from "./circle";

// Noise and flow fields
export {
  SimplexNoise2D,
  fbm2D,
  curlNoise2D,
  type FbmFunction,
} from "./simplexCurl";

// Poisson-disc sampling
export { PoissonDiscGrid, PoissonDiscSampler } from "./poisson";

// Marching squares contour extraction
export {
  LineSegment,
  MarchingSquareCell,
  marchingSquares,
  marchingSquaresToSegments,
  getPathsFromMarchingSquaresResult,
  pointInPolygon,
  type Point,
  type Polygon,
} from "./marchingSquares";

// Reaction-diffusion simulation
export {
  SeededRandom,
  GrayScott,
  getMarchingSquaresResultFromReactionDiffusion,
  getReactionDiffusionSegments,
  getReactionDiffusionPath,
  type CellCallback,
} from "./reactionDiffusion";

// Recursive triangle subdivision
export {
  TriangleSpec,
  subdivideTriangleRoot,
  triangleVertices,
  triangleArcBands,
  type RandomFunction,
  type SubdivisionParams,
  type ArcBandOptions,
  type ArcBand,
} from "./triangles";

// Polygon clipping and hatching
export {
  Poly,
  Polygons,
  type AABB,
  type DrawSegmentFunction,
  type PolygonManager,
} from "./polygons";
