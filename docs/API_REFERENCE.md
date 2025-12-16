# API Reference

Complete documentation for all exported functions, classes, and types in p5.gen.

## Table of Contents

- [Vector Utilities](#vector-utilities)
- [Line Utilities](#line-utilities)
- [Circle Utilities](#circle-utilities)
- [Noise and Fields](#noise-and-fields)
- [Sampling](#sampling)
- [Triangulation](#triangulation)
- [Curves and Contours](#curves-and-contours)
- [Tilings and Fractals](#tilings-and-fractals)
- [Packing](#packing)
- [Simulation](#simulation)

---

## Vector Utilities

### `arcPoints`

Generate discrete points along a circular arc.

```typescript
function arcPoints(
  center: p5.Vector,
  r: number,
  startAngle: number,
  endAngle: number,
  steps?: number
): p5.Vector[]
```

**Parameters:**
- `center` - Center point of the arc
- `r` - Radius of the arc
- `startAngle` - Starting angle in radians
- `endAngle` - Ending angle in radians
- `steps` - Number of segments (default: 40)

**Returns:** Array of points along the arc (includes both endpoints)

**Example:**
```typescript
// Quarter circle from 0 to π/2
const points = arcPoints(createVector(100, 100), 50, 0, Math.PI / 2, 20);
```

---

## Line Utilities

### Types

```typescript
type LerpOptions = { steps: number } | { pixelsPerStep: number };
```

### `distance`

Calculate Euclidean distance between two points.

```typescript
function distance(p1: p5.Vector, p2: p5.Vector): number
```

**Example:**
```typescript
const d = distance(createVector(0, 0), createVector(3, 4)); // 5
```

### `lerp`

Linearly interpolate between two points.

```typescript
function lerp(p1: p5.Vector, p2: p5.Vector, t: number): p5.Vector
```

**Parameters:**
- `p1` - Start point
- `p2` - End point
- `t` - Interpolation factor (0 = p1, 1 = p2)

**Example:**
```typescript
const midpoint = lerp(createVector(0, 0), createVector(100, 100), 0.5);
// midpoint = (50, 50)
```

### `lerpLine`

Generate an array of points along a line.

```typescript
function lerpLine(
  start: p5.Vector,
  end: p5.Vector,
  options: LerpOptions
): p5.Vector[]
```

**Parameters:**
- `start` - Starting point
- `end` - Ending point
- `options` - Either `{ steps: number }` or `{ pixelsPerStep: number }`

**Returns:** Array including start, interpolated points, and end

**Example:**
```typescript
// Using step count (returns 6 points)
const pts1 = lerpLine(createVector(0, 0), createVector(100, 0), { steps: 4 });

// Using pixels per step
const pts2 = lerpLine(createVector(0, 0), createVector(100, 0), { pixelsPerStep: 25 });
```

---

## Circle Utilities

### Types

```typescript
type BoundingBox = {
  readonly min: p5.Vector;
  readonly max: p5.Vector;
};

type PolarCoord = {
  readonly r: number;
  readonly theta: number;
};
```

### Basic Calculations

#### `circumference`

```typescript
function circumference(r: number): number
```

Calculate circle circumference (2πr).

#### `area`

```typescript
function area(r: number): number
```

Calculate circle area (πr²).

#### `radiusFromCircumference`

```typescript
function radiusFromCircumference(c: number): number
```

Derive radius from circumference (C / 2π).

#### `radiusFromArea`

```typescript
function radiusFromArea(a: number): number
```

Derive radius from area (√(A/π)).

#### `chordLength`

```typescript
function chordLength(r: number, angle: number): number
```

Calculate chord length from central angle.

**Parameters:**
- `r` - Radius of the circle
- `angle` - Central angle in radians

#### `arcLength`

```typescript
function arcLength(r: number, angle: number): number
```

Calculate arc length from central angle.

#### `sectorArea`

```typescript
function sectorArea(r: number, angle: number): number
```

Calculate sector area from central angle.

### Coordinate Conversions

#### `polarToCartesian`

```typescript
function polarToCartesian(
  r: number,
  theta: number,
  origin?: p5.Vector
): p5.Vector
```

Convert polar coordinates to Cartesian.

**Parameters:**
- `r` - Radial distance from origin
- `theta` - Angle in radians (0 = right, π/2 = up)
- `origin` - Optional origin point (default: (0, 0))

**Example:**
```typescript
const point = polarToCartesian(100, Math.PI / 4);
// point ≈ (70.7, 70.7)
```

#### `cartesianToPolar`

```typescript
function cartesianToPolar(
  point: p5.Vector,
  origin?: p5.Vector
): PolarCoord
```

Convert Cartesian coordinates to polar.

**Returns:** `{ r, theta }` where theta is in radians

### Point Generation

#### `circlePoints`

```typescript
function circlePoints(
  center: p5.Vector,
  r: number,
  steps?: number
): p5.Vector[]
```

Generate evenly spaced points along a circle's circumference.

**Parameters:**
- `center` - Center point of the circle
- `r` - Radius of the circle
- `steps` - Number of points (default: 40)

**Example:**
```typescript
const vertices = circlePoints(createVector(200, 200), 100, 6);
// Returns 6 points forming a hexagon
```

#### `circleBoundingBox`

```typescript
function circleBoundingBox(
  center: p5.Vector,
  r: number
): BoundingBox
```

Compute the axis-aligned bounding box enclosing a circle.

### Tests and Checks

#### `pointInCircle`

```typescript
function pointInCircle(
  point: p5.Vector,
  center: p5.Vector,
  r: number
): boolean
```

Check whether a point lies inside or on the boundary of a circle.

#### `circlesIntersect`

```typescript
function circlesIntersect(
  c1: p5.Vector, r1: number,
  c2: p5.Vector, r2: number
): boolean
```

Check if two circles overlap or touch (collision detection).

#### `areConcentric`

```typescript
function areConcentric(c1: p5.Vector, c2: p5.Vector): boolean
```

Check if two circles share the same center (within epsilon).

### Intersections

#### `circleIntersectionPoints`

```typescript
function circleIntersectionPoints(
  c1: p5.Vector, r1: number,
  c2: p5.Vector, r2: number
): p5.Vector[]
```

Find intersection points between two circles.

**Returns:** Array of 0, 1, or 2 intersection points (empty if no intersection or identical circles)

#### `circleLineIntersection`

```typescript
function circleLineIntersection(
  lineStart: p5.Vector,
  lineEnd: p5.Vector,
  center: p5.Vector,
  r: number
): p5.Vector[]
```

Find intersection points between a line segment and a circle.

**Returns:** Array of 0, 1, or 2 intersection points

### Advanced Geometry

#### `circumcenter`

```typescript
function circumcenter(
  p1: p5.Vector,
  p2: p5.Vector,
  p3: p5.Vector
): p5.Vector | null
```

Compute the center of the unique circle passing through three non-collinear points.

**Returns:** Circumcenter point, or `null` if points are collinear

#### `tangentPoints`

```typescript
function tangentPoints(
  point: p5.Vector,
  center: p5.Vector,
  r: number
): p5.Vector[]
```

Find tangent points from an external point to a circle.

**Returns:** Array of 0, 1, or 2 tangent points (empty if point is inside circle)

#### `smallestEnclosingCircle`

```typescript
function smallestEnclosingCircle(
  points: readonly p5.Vector[]
): { center: p5.Vector; radius: number } | null
```

Compute the smallest circle that encloses a set of points using Welzl's algorithm.

**Returns:** Object with center and radius, or `null` if no points provided

**Example:**
```typescript
const points = [createVector(0, 0), createVector(10, 0), createVector(5, 10)];
const circle = smallestEnclosingCircle(points);
// circle.center ≈ (5, 3.33), circle.radius ≈ 6.67
```

---

## Noise and Fields

### `SimplexNoise2D`

Seeded 2D Simplex noise generator producing values in approximately [-1, 1].

```typescript
class SimplexNoise2D {
  constructor(seed?: number);
  noise2D(x: number, y: number): number;
}
```

**Example:**
```typescript
const noise = new SimplexNoise2D(12345);
const value = noise.noise2D(10.5, 20.3); // ~[-1, 1]
```

### `fbm2D`

Fractal Brownian Motion using layered octaves of simplex noise.

```typescript
function fbm2D(
  noise: SimplexNoise2D,
  x: number,
  y: number,
  frequency?: number,
  octaves?: number
): number
```

**Parameters:**
- `noise` - SimplexNoise2D instance
- `x`, `y` - Coordinates
- `frequency` - Base frequency multiplier (default: 0.3)
- `octaves` - Number of noise layers (default: 3)

**Example:**
```typescript
const noise = new SimplexNoise2D(42);
const value = fbm2D(noise, 100, 200, 0.5, 4);
```

### `curlNoise2D`

Generate curl noise from a scalar FBM field for fluid-like motion.

```typescript
type FbmFunction = (x: number, y: number) => number;

function curlNoise2D(
  x: number,
  y: number,
  fbmFn: FbmFunction,
  radius?: number,
  eps?: number
): p5.Vector
```

**Parameters:**
- `x`, `y` - Coordinates
- `fbmFn` - FBM function to sample
- `radius` - Flow field strength (default: 1.8)
- `eps` - Epsilon for numerical differentiation (default: 0.01)

**Returns:** Velocity vector (divergence-free)

**Example:**
```typescript
const noise = new SimplexNoise2D(123);
const fbmFn = (x: number, y: number) => fbm2D(noise, x, y);
const velocity = curlNoise2D(10, 20, fbmFn);
```

### Domain Warping

#### `warp2D`

```typescript
function warp2D(
  noiseFn: NoiseFunction2D,
  x: number,
  y: number,
  config?: WarpConfig
): number
```

Apply domain warping to distort coordinate space.

#### `warpFbm2D`

```typescript
function warpFbm2D(
  noise: SimplexNoise2D,
  x: number,
  y: number,
  config?: WarpConfig
): number
```

Domain warping with FBM noise.

### Worley Noise

#### `WorleyNoiseGenerator`

```typescript
class WorleyNoiseGenerator {
  constructor(config?: WorleyConfiguration);
  at(x: number, y: number): number;
}
```

Cellular/Voronoi-based noise generator.

#### `worley`

```typescript
function worley(x: number, y: number, config?: WorleyConfiguration): number
```

Single-sample Worley noise.

#### `worleyFractal`

```typescript
function worleyFractal(
  x: number,
  y: number,
  octaves?: number,
  config?: WorleyConfiguration
): number
```

Multi-octave fractal Worley noise.

---

## Sampling

### `PoissonDiscGrid`

Unbounded Poisson-disc sampling using spatial hashing.

```typescript
class PoissonDiscGrid {
  readonly points: p5.Vector[];

  constructor(radius: number);
  insert(p: p5.Vector): boolean;
  clear(): void;
}
```

**Example:**
```typescript
const grid = new PoissonDiscGrid(10); // min distance = 10
grid.insert(createVector(100, 100)); // true
grid.insert(createVector(105, 105)); // false (too close)
grid.insert(createVector(120, 100)); // true
```

### `PoissonDiscSampler`

Bounded Poisson-disc sampler using Bridson's algorithm.

```typescript
class PoissonDiscSampler {
  readonly grid: (p5.Vector | undefined)[][];
  readonly points: p5.Vector[];

  constructor(
    width: number,
    height: number,
    radius: number,
    seed?: number,
    maxAttempts?: number
  );
  generate(startX?: number, startY?: number): p5.Vector[];
  clear(): void;
}
```

**Parameters:**
- `width`, `height` - Sampling area dimensions
- `radius` - Minimum distance between points
- `seed` - Seed for reproducible results (default: Date.now())
- `maxAttempts` - Max attempts per point (default: 30)

**Example:**
```typescript
const sampler = new PoissonDiscSampler(400, 400, 10, 12345);
sampler.generate();
console.log(sampler.points.length); // ~1200 points
```

---

## Triangulation

### Delaunay Triangulation

#### `Triangle`

```typescript
class Triangle {
  readonly vertices: TriangleVertices;
  readonly circumcircle: Circumcircle;

  constructor(p1: p5.Vector, p2: p5.Vector, p3: p5.Vector);
  containsPoint(point: p5.Vector): boolean;
  sharesVertex(other: Triangle): boolean;
}
```

#### `DelaunayTriangulation`

```typescript
class DelaunayTriangulation {
  readonly triangles: Triangle[];
  readonly points: p5.Vector[];

  constructor(points: p5.Vector[], bounds?: BoundingBox);
  getEdges(): Edge[];
}
```

#### `triangulate`

```typescript
function triangulate(points: p5.Vector[]): DelaunayTriangulation
```

Factory function for Delaunay triangulation.

#### Helper Functions

```typescript
function edgesEqual(e1: Edge, e2: Edge): boolean
function edgeKey(e: Edge): string
function pointInTriangle(p: p5.Vector, t: TriangleVertices): boolean
```

### Voronoi Diagrams

#### `VoronoiDiagram`

```typescript
class VoronoiDiagram {
  readonly seeds: p5.Vector[];
  readonly regions: Map<number, p5.Vector[]>;

  constructor(config: VoronoiConfig);
  addSeed(seed: p5.Vector): void;
  generate(): void;
  findRegion(point: p5.Vector): number;
}
```

#### `createVoronoi`

```typescript
function createVoronoi(config: VoronoiConfig): VoronoiDiagram
```

Factory function for Voronoi diagrams.

#### Distance Metrics

```typescript
function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number
function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number
function chebyshevDistance(x1: number, y1: number, x2: number, y2: number): number
function minkowskiDistance(x1: number, y1: number, x2: number, y2: number, p: number): number
```

### Triangle Subdivision

#### `TriangleSpec`

```typescript
class TriangleSpec {
  readonly position: p5.Vector;
  readonly vertices: readonly p5.Vector[];
  // ...
}
```

#### `subdivideTriangleRoot`

```typescript
function subdivideTriangleRoot(params: SubdivisionParams): TriangleSpec[]
```

Recursively subdivide triangles for fractal patterns.

---

## Curves and Contours

### Catmull-Rom Splines

#### `CatmullRomSpline`

```typescript
class CatmullRomSpline {
  readonly points: readonly p5.Vector[];

  constructor(points: readonly p5.Vector[], config?: CatmullRomConfig);
  getPoint(t: number): p5.Vector;
  getPoints(resolution?: number): p5.Vector[];
}
```

**Config Options:**
```typescript
type CatmullRomConfig = {
  readonly alpha?: number;  // 0=uniform, 0.5=centripetal, 1.0=chordal
  readonly closed?: boolean;
  readonly tension?: number;
};
```

#### `createCatmullRomSpline`

```typescript
function createCatmullRomSpline(
  points: readonly p5.Vector[],
  config?: CatmullRomConfig
): CatmullRomSpline
```

#### `createSmoothPath`

```typescript
function createSmoothPath(
  points: readonly p5.Vector[],
  resolution?: number
): p5.Vector[]
```

Convenience function for quick smooth path generation.

### Marching Squares

#### `marchingSquares`

```typescript
function marchingSquares(
  field: number[][],
  threshold: number
): MarchingSquareCell[][]
```

Extract iso-contours from a scalar field.

#### `marchingSquaresToSegments`

```typescript
function marchingSquaresToSegments(
  cells: MarchingSquareCell[][],
  cellSize: number
): LineSegment[]
```

Convert marching squares result to line segments.

#### `getPathsFromMarchingSquaresResult`

```typescript
function getPathsFromMarchingSquaresResult(
  segments: LineSegment[]
): Point[][]
```

Extract continuous paths from segments.

#### `pointInPolygon`

```typescript
function pointInPolygon(point: Point, polygon: Polygon): boolean
```

Test if a point is inside a polygon.

---

## Tilings and Fractals

### Peano Curve

#### `generatePeanoCurve`

```typescript
function generatePeanoCurve(
  x: number,
  y: number,
  size: number,
  depth: number
): p5.Vector[]
```

Generate a Peano space-filling curve using the Breinholt-Schierz algorithm.

**Parameters:**
- `x`, `y` - Starting position
- `size` - Size of the curve
- `depth` - Recursion depth (higher = more detail)

**Example:**
```typescript
const curve = generatePeanoCurve(0, 0, 400, 3);
// Draw with beginShape(); curve.forEach(p => vertex(p.x, p.y)); endShape();
```

#### `calculatePointCount`

```typescript
function calculatePointCount(depth: number): number
```

Calculate number of points for a given depth.

#### `getBoundingBox`

```typescript
function getBoundingBox(points: readonly p5.Vector[]): PeanoBoundingBox
```

Calculate bounding box of generated points.

### Penrose Tiling

#### `PenroseLSystem`

L-System based Penrose tiling (P3 rhombus variant).

```typescript
class PenroseLSystem {
  constructor(config?: PenroseConfig);
  iterate(): void;
  simulate(n: number): void;
  getVertices(): Point2D[];
  getRhombi(): Point2D[][];
}
```

#### `PenroseKiteDart`

Robinson triangle deflation approach (P2 kite-dart variant).

```typescript
class PenroseKiteDart {
  constructor(config?: KiteDartConfig);
  deflate(): void;
  getTriangles(): RobinsonTriangle[];
  getKites(): Point2D[][];
  getDarts(): Point2D[][];
}
```

#### Factory Functions

```typescript
function createPenroseTiling(generations?: number): PenroseLSystem
function createCustomPenroseTiling(config: PenroseConfig): PenroseLSystem
function createKiteDartTiling(config?: KiteDartConfig): PenroseKiteDart
```

#### Constants

```typescript
const PHI = (1 + Math.sqrt(5)) / 2;  // Golden ratio ≈ 1.618
```

### Truchet Tiling

#### Tile Drawing Functions

```typescript
function drawDiagonalTile(x: number, y: number, size: number, rotation: Rotation): void
function drawCurveTile(x: number, y: number, size: number, rotation: Rotation): void
function drawTriangleTile(x: number, y: number, size: number, rotation: Rotation): void
function drawDotsTile(x: number, y: number, size: number, rotation: Rotation): void
function drawCrossTile(x: number, y: number, size: number, rotation: Rotation): void
function drawTile(x: number, y: number, size: number, rotation: Rotation, type: TileType): void
```

#### Grid Functions

```typescript
function initializeGrid(config: TruchetConfig): Rotation[][]
function drawGrid(grid: Rotation[][], config: TruchetConfig): void
function updateGrid(grid: Rotation[][], config: TruchetConfig, time: number): Rotation[][]
```

#### Utilities

```typescript
function getRandomRotation(): Rotation
function getRotation(pattern: PatternType, x: number, y: number): Rotation
function randomizeColors(config: TruchetConfig): ColorScheme
```

#### Types

```typescript
type Rotation = 0 | 1 | 2 | 3;
type TileType = 'diagonal' | 'curve' | 'triangle' | 'dots' | 'cross';
type PatternType = 'random' | 'checker' | 'gradient' | 'noise';
```

---

## Packing

### Circle Packing

#### `PackedCircle`

```typescript
class PackedCircle {
  center: p5.Vector;
  radius: number;
  velocity: p5.Vector;

  constructor(x: number, y: number, radius: number);
  overlaps(other: PackedCircle, padding?: number): boolean;
}
```

#### `CirclePacker`

```typescript
class CirclePacker {
  readonly circles: PackedCircle[];
  readonly stats: PackingStats;

  constructor(config: CirclePackerConfig);
  pack(count: number): void;
  animate(steps?: number): void;
  clear(): void;
}
```

**Config Options:**
```typescript
type CirclePackerConfig = {
  readonly bounds: RectBounds | CircleBounds;
  readonly boundaryType?: BoundaryType;
  readonly minRadius?: number;
  readonly maxRadius?: number;
  readonly sizeDistribution?: SizeDistribution;
  readonly strategy?: PackingStrategy;
};

type BoundaryType = 'rectangle' | 'circle' | 'none';
type SizeDistribution = 'uniform' | 'gaussian' | 'power' | 'custom';
type PackingStrategy = 'random' | 'grid' | 'physics' | 'poisson';
```

#### `circlesOverlap`

```typescript
function circlesOverlap(c1: PackedCircle, c2: PackedCircle, padding?: number): boolean
```

#### `quickPack`

```typescript
function quickPack(
  bounds: RectBounds,
  count: number,
  minRadius: number,
  maxRadius: number
): PackedCircle[]
```

Convenience function for quick circle packing.

---

## Simulation

### Reaction-Diffusion

#### `GrayScott`

Gray-Scott reaction-diffusion simulation.

```typescript
class GrayScott {
  readonly width: number;
  readonly height: number;
  readonly gridA: number[][];
  readonly gridB: number[][];

  constructor(width: number, height: number, feed?: number, kill?: number);
  step(): void;
  addChemical(x: number, y: number, radius: number): void;
  reset(): void;
}
```

**Parameters:**
- `feed` - Feed rate (default: 0.055)
- `kill` - Kill rate (default: 0.062)

#### Integration Functions

```typescript
function getMarchingSquaresResultFromReactionDiffusion(
  grayScott: GrayScott,
  threshold?: number
): MarchingSquareCell[][]

function getReactionDiffusionSegments(
  grayScott: GrayScott,
  cellSize: number,
  threshold?: number
): LineSegment[]

function getReactionDiffusionPath(
  grayScott: GrayScott,
  cellSize: number,
  threshold?: number
): Point[][]
```

#### `SeededRandom`

```typescript
class SeededRandom {
  constructor(seed?: number);
  next(): number;
  nextInt(min: number, max: number): number;
}
```

### Polygon Operations

#### `Poly`

```typescript
class Poly {
  readonly vertices: p5.Vector[];

  constructor(vertices: p5.Vector[]);
  contains(point: p5.Vector): boolean;
  clip(other: Poly): Poly | null;
  hatch(angle: number, spacing: number): LineSegment[];
}
```

#### `Polygons`

```typescript
function Polygons(): PolygonManager

interface PolygonManager {
  add(poly: Poly): void;
  raycast(origin: p5.Vector, direction: p5.Vector): p5.Vector | null;
  getAllPolygons(): Poly[];
}
```

Spatial hash manager for polygon collections.
