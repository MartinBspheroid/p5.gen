# Architecture

This document describes the structure and design philosophy of the p5.gen library.

## Project Structure

```
p5.gen/
├── src/                          # Source code
│   ├── index.ts                  # Main export barrel
│   ├── globals.ts                # Global constants (PI, TWO_PI)
│   ├── globals.d.ts              # Type declarations for globals
│   ├── p5-global.d.ts            # p5.Vector type declarations
│   │
│   ├── # Core Geometry
│   ├── vec2.ts                   # Arc point generation
│   ├── line.ts                   # Line interpolation utilities
│   ├── circle.ts                 # Circle geometry (20+ functions)
│   │
│   ├── # Noise and Fields
│   ├── simplexCurl.ts            # Simplex noise, FBM, curl noise
│   ├── worleyNoise.ts            # Cellular/Worley noise
│   ├── warp.ts                   # Domain warping
│   │
│   ├── # Sampling
│   ├── poisson.ts                # Poisson-disc sampling
│   │
│   ├── # Triangulation
│   ├── delaunay.ts               # Delaunay triangulation
│   ├── voronoi.ts                # Voronoi diagrams
│   ├── triangles.ts              # Recursive subdivision
│   │
│   ├── # Curves and Contours
│   ├── catmullRom.ts             # Catmull-Rom splines
│   ├── marchingSquares.ts        # Contour extraction
│   │
│   ├── # Tilings and Fractals
│   ├── peano.ts                  # Peano space-filling curve
│   ├── penrose.ts                # Penrose aperiodic tiling
│   ├── truchet.ts                # Truchet rotatable tiles
│   │
│   ├── # Packing and Layout
│   ├── circlePacking.ts          # Circle packing algorithms
│   │
│   ├── # Simulation
│   ├── reactionDiffusion.ts      # Gray-Scott simulation
│   ├── polygons.ts               # Polygon clipping/hatching
│   │
│   └── # Tests
│       ├── circle.test.ts
│       ├── circle-*.test.ts
│       └── line.test.ts
│
├── visual-tests/                 # Visual regression testing
│   ├── runner.ts                 # CLI test runner
│   ├── lib/                      # Test infrastructure
│   │   ├── test-runner.ts        # Puppeteer orchestration
│   │   ├── sketch-loader.ts      # Dynamic sketch loading
│   │   ├── html-template.ts      # HTML generation
│   │   └── types.ts              # Test type definitions
│   ├── sketches/                 # Visual test sketches
│   │   ├── *.sketch.ts           # Individual test sketches
│   │   └── ...
│   └── output/                   # Generated PNG output
│
├── dist/                         # Compiled output
│   ├── index.js                  # Main entry point
│   ├── index.d.ts                # Type declarations
│   └── *.js, *.d.ts              # Compiled modules
│
├── docs/                         # Documentation
│   ├── README.md                 # Documentation index
│   ├── ARCHITECTURE.md           # This file
│   ├── CODING_STANDARDS.md       # Coding conventions
│   ├── API_REFERENCE.md          # Function documentation
│   ├── ALGORITHMS.md             # Algorithm explanations
│   ├── TESTING.md                # Testing guide
│   └── p5js/                     # p5.js reference
│
├── .claude/ref/                  # Claude reference docs
│   └── architecture.md           # Quick architecture reference
│
├── package.json                  # Package configuration
├── tsconfig.json                 # TypeScript configuration
├── .oxlintrc.json                # Linting rules
├── .oxfmtrc.jsonc                # Formatting rules
├── CLAUDE.md                     # AI assistant instructions
└── README.md                     # Project README
```

## Design Philosophy

### 1. Framework Agnostic

All utilities work independently of p5.js:

```typescript
// Works with any rendering system
const points = circlePoints(createVector(0, 0), 100, 32);

// Use with p5.js
points.forEach(p => ellipse(p.x, p.y, 5, 5));

// Or with Canvas
points.forEach(p => ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2));
```

The library uses `p5.Vector` as the standard coordinate type, but the algorithms are pure computation - no drawing is performed.

### 2. Pure Functions First

Functions are side-effect-free and deterministic:

```typescript
// Input is not modified
function normalize(vec: p5.Vector): p5.Vector {
  return vec.copy().normalize();  // Returns new vector
}

// Same input always produces same output
function circlePoints(center: p5.Vector, r: number, n: number): p5.Vector[] {
  // Deterministic calculation
}
```

### 3. Immutability by Default

- Use `readonly` for array parameters and return types
- Use `as const` for configuration objects
- Prefer ES2023 immutable array methods (`toSorted`, `toSpliced`)

### 4. Configuration Objects

Complex functions accept configuration objects with sensible defaults:

```typescript
type VoronoiConfig = {
  readonly width: number;
  readonly height: number;
  readonly seeds?: readonly p5.Vector[];
  readonly metric?: DistanceMetric;
};

const DEFAULT_CONFIG: Required<VoronoiConfig> = {
  width: 800,
  height: 600,
  seeds: [],
  metric: 'euclidean',
};
```

### 5. Class-Based State Management

Stateful algorithms use classes to encapsulate complexity:

```typescript
// Stateless utility class
const noise = new SimplexNoise2D(seed);
const value = noise.noise2D(x, y);

// Stateful generator class
const packer = new CirclePacker(config);
packer.pack(100);  // Add 100 circles
const circles = packer.circles;
```

## Module Dependency Graph

```
index.ts (exports all)
    │
    ├── globals.ts (PI, TWO_PI)
    │
    ├── Core Geometry (no dependencies)
    │   ├── vec2.ts
    │   ├── line.ts
    │   └── circle.ts
    │
    ├── Noise (depends on globals)
    │   ├── simplexCurl.ts
    │   ├── worleyNoise.ts
    │   └── warp.ts → simplexCurl.ts
    │
    ├── Sampling
    │   └── poisson.ts
    │
    ├── Triangulation
    │   ├── delaunay.ts
    │   ├── voronoi.ts
    │   └── triangles.ts
    │
    ├── Curves
    │   ├── catmullRom.ts
    │   └── marchingSquares.ts
    │
    ├── Tilings (independent)
    │   ├── peano.ts
    │   ├── penrose.ts
    │   └── truchet.ts
    │
    ├── Packing
    │   └── circlePacking.ts
    │
    └── Simulation
        ├── reactionDiffusion.ts → marchingSquares.ts
        └── polygons.ts
```

## Type System

### Core Types

```typescript
// From p5.js
p5.Vector           // 2D/3D coordinate

// Geometric types
type BoundingBox = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type PolarCoord = {
  readonly r: number;
  readonly theta: number;
};

// Point types (for modules not using p5.Vector)
type Point = { x: number; y: number };
type Point2D = readonly [number, number];
```

### Configuration Pattern

```typescript
// Partial config with optional fields
type Config = {
  readonly required: number;
  readonly optional?: string;
};

// Full config with defaults
const DEFAULT_CONFIG: Required<Config> = {
  required: 0,
  optional: 'default',
};

// Merge user config with defaults
function create(userConfig: Config): Instance {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  // ...
}
```

### Discriminated Unions

```typescript
type Rotation = 0 | 1 | 2 | 3;
type TileType = 'diagonal' | 'curve' | 'triangle' | 'dots' | 'cross';
type DistanceMetric = 'euclidean' | 'manhattan' | 'chebyshev';

type LerpOptions =
  | { readonly steps: number }
  | { readonly pixelsPerStep: number };
```

## Build System

### TypeScript Compilation

```bash
bun run build  # rm -rf dist && tsc
```

Output:
- `dist/*.js` - ES modules
- `dist/*.d.ts` - Type declarations
- `dist/*.d.ts.map` - Declaration source maps

### Package Exports

```json
{
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module"
}
```

## Testing Architecture

### Unit Tests

Colocated with source files using Bun's test framework:

```
src/
├── circle.ts
├── circle.test.ts           # Main tests
├── circle-calculations.test.ts
├── circle-advanced.test.ts
├── circle-checks.test.ts
└── circle-intersections.test.ts
```

### Visual Tests

Puppeteer-based rendering verification:

```
visual-tests/
├── runner.ts                # CLI entry point
├── lib/
│   ├── test-runner.ts       # Orchestrates Puppeteer
│   ├── sketch-loader.ts     # Loads sketch modules
│   ├── html-template.ts     # Generates test HTML
│   └── types.ts             # Type definitions
├── sketches/
│   ├── *.sketch.ts          # Individual sketches
└── output/
    └── *.png                # Generated images
```

Each sketch exports a standard interface:

```typescript
export const sketch: SketchDefinition = {
  name: 'Algorithm Name',
  width: 800,
  height: 600,
  setup: (p5) => { ... },
  draw: (p5) => { ... },
};
```

## Performance Considerations

### Spatial Hashing

Used in `circlePacking.ts` and `poisson.ts` for O(1) neighbor lookups instead of O(n) scans.

### Precomputation

`DelaunayTriangulation` precomputes circumcircles for efficient point-in-circumcircle tests.

### Epsilon Values

Floating-point comparisons use configurable epsilon values (typically `1e-9`) for numerical stability.

## Extension Points

### Adding New Algorithms

1. Create `src/newAlgorithm.ts`
2. Export from `src/index.ts`
3. Add visual test in `visual-tests/sketches/`
4. Add unit tests in `src/newAlgorithm.test.ts`
5. Document in `docs/API_REFERENCE.md`

### Custom Distance Metrics

Voronoi and Worley noise support custom distance functions:

```typescript
type DistanceFunction = (
  x1: number, y1: number,
  x2: number, y2: number
) => number;
```

### Custom Noise Functions

Domain warping accepts any 2D noise function:

```typescript
type NoiseFunction2D = (x: number, y: number) => number;
```
