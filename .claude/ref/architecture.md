# p5.gen Architecture Reference

**Last Updated:** 2025-12-05
**Source Files Tracked:** src/*.ts

## Overview

p5.gen is a generative art utilities library for p5.js. All utilities use `p5.Vector` for 2D/3D coordinates (as of the recent migration from custom `Vec2` tuples).

## File Structure

```
src/
├── p5-global.d.ts    # Global p5 type declarations (p5.Vector, createVector)
├── globals.ts        # Global constants (PI, TWO_PI)
├── globals.d.ts      # Type declarations for globals
├── vec2.ts           # arcPoints() function only (v2/Vec2 removed)
├── line.ts           # Line interpolation (distance, lerp, lerpLine)
├── circle.ts         # Circle geometry utilities
├── triangles.ts      # Recursive triangle subdivision
├── simplexCurl.ts    # Simplex noise, FBM, curl noise
├── poisson.ts        # Poisson-disc sampling
├── marchingSquares.ts# Marching squares contour extraction
├── reactionDiffusion.ts # Gray-Scott reaction-diffusion
├── polygons.ts       # Polygon clipping and hatching
└── index.ts          # Main exports
```

## Key Types

### p5.Vector (from p5-global.d.ts)
Global type for all coordinate data. Key methods:
- Static: `p5.Vector.add()`, `.sub()`, `.mult()`, `.lerp()`, `.fromAngle()`
- Instance: `.copy()`, `.mag()`, `.normalize()`, `.rotate()`
- Creation: `createVector(x, y)`

### No longer exists:
- `Vec2` type (was `readonly [number, number]`)
- `v2` namespace (was functional vector operations)

## Module Summaries

### vec2.ts
- `arcPoints(center: p5.Vector, r, startAngle, endAngle, steps): p5.Vector[]`

### line.ts
- `distance(p1: p5.Vector, p2: p5.Vector): number`
- `lerp(p1: p5.Vector, p2: p5.Vector, t): p5.Vector`
- `lerpLine(start, end, options): p5.Vector[]`

### circle.ts
Heavy geometry utilities including:
- `polarToCartesian()`, `cartesianToPolar()`
- `circlePoints()`, `circleBoundingBox()`
- `pointInCircle()`, `circlesIntersect()`
- `circleIntersectionPoints()`, `circleLineIntersection()`
- `circumcenter()`, `tangentPoints()`, `smallestEnclosingCircle()`

### triangles.ts
- `TriangleSpec` class with `position: p5.Vector`
- `subdivideTriangleRoot()` - recursive subdivision
- `triangleVertices()`, `triangleArcBands()`

### simplexCurl.ts
- `SimplexNoise2D` class
- `fbm2D()` - fractal Brownian motion
- `curlNoise2D(): p5.Vector` - divergence-free flow field

### poisson.ts
- `PoissonDiscGrid` - unbounded spatial hashing
- `PoissonDiscSampler` - Bridson's algorithm

### marchingSquares.ts (uses own Point interface)
- `marchingSquares()` - extract iso-contours
- `marchingSquaresToSegments()`, `getPathsFromMarchingSquaresResult()`

### reactionDiffusion.ts (uses own Point interface)
- `GrayScott` class
- `getReactionDiffusionSegments()`, `getReactionDiffusionPath()`

### polygons.ts
- `Poly` class - polygon with clipping/hatching
- `Polygons()` - spatial hash manager

## Configuration

### tsconfig.json
- `types: ["bun-types", "p5"]`
- `lib: ["ESNext", "DOM"]`
- Strict mode enabled

### package.json
- Uses Bun runtime
- `@types/p5` dependency for types
