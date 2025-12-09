/**
 * p5.gen utilities for generative art and creative coding.
 *
 * This collection provides advanced tools for:
 * - 2D vector mathematics and geometry
 * - Circle and polar coordinate utilities
 * - Line interpolation utilities
 * - Noise generation (Simplex, FBM, Curl)
 * - Domain warping (organic pattern distortion)
 * - Poisson-disc sampling (blue-noise distribution)
 * - Contour extraction (Marching Squares)
 * - Pattern formation (Reaction-Diffusion)
 * - Recursive subdivision (Triangles)
 * - Polygon clipping and hatching
 * - Delaunay triangulation (mesh generation)
 * - Catmull-Rom spline interpolation (smooth curves)
 * - Circle packing (space-filling layouts)
 * - Voronoi diagrams (spatial partitioning)
 *
 * All utilities are framework-agnostic and work with p5.js, Canvas, or any rendering system.
 */

// Initialize global math constants (PI, TWO_PI)
import './globals';

// Vector utilities
export { arcPoints } from './vec2';

// Line utilities
export { distance, lerp, lerpLine, type LerpOptions } from './line';

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
} from './circle';

// Noise and flow fields
export { SimplexNoise2D, fbm2D, curlNoise2D, type FbmFunction } from './simplexCurl';

// Poisson-disc sampling
export { PoissonDiscGrid, PoissonDiscSampler } from './poisson';

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
} from './marchingSquares';

// Reaction-diffusion simulation
export {
  SeededRandom,
  GrayScott,
  getMarchingSquaresResultFromReactionDiffusion,
  getReactionDiffusionSegments,
  getReactionDiffusionPath,
  type CellCallback,
} from './reactionDiffusion';

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
} from './triangles';

// Polygon clipping and hatching
export {
  Poly,
  Polygons,
  type AABB,
  type DrawSegmentFunction,
  type PolygonManager,
} from './polygons';

// Delaunay triangulation
export {
  Triangle,
  DelaunayTriangulation,
  triangulate,
  edgesEqual,
  edgeKey,
  pointInTriangle,
  type Edge,
  type TriangleVertices,
  type Circumcircle,
} from './delaunay';

// Catmull-Rom spline interpolation
export {
  CatmullRomSpline,
  createCatmullRomSpline,
  createSmoothPath,
  type CatmullRomConfig,
  type PointInput,
} from './catmullRom';

// Circle packing
export {
  PackedCircle,
  CirclePacker,
  circlesOverlap,
  quickPack,
  type BoundaryType,
  type SizeDistribution,
  type PackingStrategy,
  type RectBounds,
  type CircleBounds,
  type CirclePackerConfig,
  type PackingStats,
  type CircleData,
} from './circlePacking';

// Voronoi diagram
export {
  VoronoiDiagram,
  createVoronoi,
  findRegion,
  euclideanDistance,
  manhattanDistance,
  chebyshevDistance,
  minkowskiDistance,
  getDistanceFunction,
  type DistanceMetric,
  type VoronoiBounds,
  type VoronoiConfig,
  type NearestSeedResult,
  type RegionQuery,
  type EdgePoint,
} from './voronoi';

// Worley noise (cellular noise)
export {
  WorleyNoiseGenerator,
  createWorleyNoise,
  worley,
  worleyFractal,
  worleyToGray,
  worleyField,
  findNearestFeaturePoints,
  getCellFeaturePoints,
  calculateWorleyDistance,
  hashCellCoordinates,
  DEFAULT_WORLEY_CONFIG,
  type WorleyConfiguration,
  type WorleyDistanceMetric,
  type WorleyValueFunction,
} from './worleyNoise';

// Domain warping
export {
  warp2D,
  warpFbm2D,
  warp2DWithIntermediates,
  type NoiseFunction2D,
  type WarpConfig,
} from './warp';

// Peano curve (space-filling fractal)
export {
  generatePeanoCurve,
  calculatePointCount,
  getBoundingBox,
  type BoundingBox as PeanoBoundingBox,
} from './peano';

// Penrose tiling (aperiodic kite and dart tiling)
export {
  PenroseTiling,
  createPenroseTiling,
  createCustomPenroseTiling,
  TileType,
  type Tile,
  type PenroseConfig,
  type PenroseColorScheme,
  type RGBAColor,
} from './penrose';

// Truchet tiling (rotatable tile patterns)
export {
  drawDiagonalTile,
  drawCurveTile,
  drawTriangleTile,
  drawDotsTile,
  drawCrossTile,
  drawTile,
  initializeGrid,
  drawGrid,
  getRandomRotation,
  getRotation,
  updateGrid,
  randomizeColors,
  type TileType as TruchetTileType,
  type PatternType,
  type Rotation,
  type ColorScheme,
  type TruchetConfig,
} from './truchet';
