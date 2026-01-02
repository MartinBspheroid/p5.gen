# p5.gen - Generative Art Utilities

A TypeScript library providing advanced algorithms for creative coding, procedural generation, and computational geometry. Framework-agnostic, works with p5.js, Canvas, or any rendering system.

## Quick Reference

```bash
bun install          # Install dependencies
bun run build        # Compile TypeScript to dist/
bun test             # Run unit tests
bun run visual-test  # Run visual tests with Puppeteer
bun run check        # Format, lint, and type check
```

## Documentation

Comprehensive documentation is available in the `docs/` folder:

| Document | Description |
|----------|-------------|
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Project structure and design |
| [docs/CODING_STANDARDS.md](docs/CODING_STANDARDS.md) | TypeScript conventions |
| [docs/API_REFERENCE.md](docs/API_REFERENCE.md) | Complete API documentation |
| [docs/ALGORITHMS.md](docs/ALGORITHMS.md) | Algorithm explanations |
| [docs/TESTING.md](docs/TESTING.md) | Testing guide |
| [docs/p5js/](docs/p5js/) | p5.js reference for this library |

## Project Overview

### Module Categories

**Geometry:** `circle.ts`, `line.ts`, `vec2.ts`
- Circle calculations, intersections, tangents
- Line interpolation, distance
- Arc point generation

**Noise:** `simplexCurl.ts`, `worleyNoise.ts`, `warp.ts`
- Seeded Simplex noise
- Fractal Brownian Motion (FBM)
- Curl noise for flow fields
- Domain warping

**Sampling:** `poisson.ts`
- Poisson-disc sampling (blue noise)

**Triangulation:** `delaunay.ts`, `voronoi.ts`, `triangles.ts`
- Delaunay triangulation
- Voronoi diagrams
- Recursive subdivision

**Curves:** `catmullRom.ts`, `marchingSquares.ts`
- Catmull-Rom splines
- Contour extraction

**Tilings:** `peano.ts`, `penrose.ts`, `truchet.ts`
- Peano space-filling curve
- Penrose aperiodic tiling
- Truchet rotatable tiles

**Packing:** `circlePacking.ts`
- Circle packing algorithms

**Simulation:** `reactionDiffusion.ts`, `polygons.ts`
- Gray-Scott reaction-diffusion
- Polygon clipping/hatching

## Key Conventions

### TypeScript

- **Strict mode** enabled (`strict: true`, `noUncheckedIndexedAccess: true`)
- **No `any` types** - use proper types or `unknown` with guards
- **Named exports only** - no default exports
- **Immutability** - use `readonly`, `as const`, immutable array methods
- **Max 250 lines per file** - refactor if exceeded

### Code Style

- **camelCase** for functions/variables
- **PascalCase** for classes/types
- **UPPERCASE** for constants
- **JSDoc** on all exports with @param, @returns, @example

### Testing

- Unit tests: `src/*.test.ts` using `bun:test`
- Visual tests: `visual-tests/sketches/*.sketch.ts`

## Common Tasks

### Add New Algorithm

1. Create `src/newAlgorithm.ts`
2. Export from `src/index.ts`
3. Add unit tests in `src/newAlgorithm.test.ts`
4. Add visual test in `visual-tests/sketches/`
5. Document in `docs/API_REFERENCE.md`

### Run Specific Tests

```bash
bun test src/circle.test.ts           # Single file
bun run visual-test --sketch peano    # Single sketch
```

### Debug Errors

Use the Ping-Pong Check Technique:
1. Run `bun run check`
2. Fix the first error
3. Run `bun run check` again
4. Repeat until clean

## Bun Runtime

Default to using Bun instead of Node.js:

- `bun <file>` instead of `node <file>`
- `bun test` instead of `jest` or `vitest`
- `bun install` instead of `npm install`
- `bun run <script>` instead of `npm run <script>`

### Package Scripts

```json
{
  "build": "rm -rf dist && tsc",
  "visual-test": "bun visual-tests/runner.ts",
  "lint": "oxlint src",
  "lint:fix": "oxlint src --fix",
  "format": "oxfmt src",
  "format:check": "oxfmt src --check",
  "check": "bun run format:check && bun run lint && tsc --noEmit"
}
```

## Dependencies

**Runtime:**
- `@types/p5` - p5.js type definitions

**Development:**
- `p5` - p5.js library (for visual tests)
- `puppeteer` - Browser automation
- `oxfmt` - Code formatter
- `oxlint` - Linter
- `typescript` - Type checker

## Architecture Notes

- All algorithms are **framework-agnostic** - pure computation, no rendering
- `p5.Vector` is the standard coordinate type
- Pure functions preferred; classes for stateful algorithms
- Epsilon values (`1e-9`) for floating-point comparisons
- Spatial hashing for O(1) neighbor lookups in packing/sampling
