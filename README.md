# p5.gen

**p5.gen** is a generative art utilities library for p5.js. It provides advanced algorithms for creative coding, procedural generation, and computational geometry.

## Quick Links

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Project structure, design philosophy, module organization |
| [Coding Standards](docs/CODING_STANDARDS.md) | TypeScript conventions, style guide, best practices |
| [API Reference](docs/API_REFERENCE.md) | Complete function and class documentation |
| [Algorithms](docs/ALGORITHMS.md) | Detailed algorithm explanations and theory |
| [Testing](docs/TESTING.md) | Unit testing and visual testing guide |

## p5.js Reference

These documents cover the p5.js functions most relevant to this library:

| Document | Description |
|----------|-------------|
| [p5.js Overview](docs/p5js/README.md) | How p5.js is used in p5.gen |
| [p5.Vector](docs/p5js/VECTOR.md) | Vector class (essential for this library) |
| [Drawing](docs/p5js/DRAWING.md) | Shape, color, and transform functions |
| [Math](docs/p5js/MATH.md) | Math utilities, random, noise |
| [Types](docs/p5js/TYPES.md) | Key types and constants |

## Getting Started

```bash
# Install dependencies
bun install

# Build the library
bun run build

# Run tests
bun test

# Run visual tests
bun run visual-test

# Check code quality
bun run check
```

## Module Categories

### Geometry
- **Circle utilities** - circumference, area, intersections, tangents
- **Line utilities** - distance, interpolation
- **Vector utilities** - arc point generation

### Noise and Fields
- **Simplex noise** - 2D noise with seeded generation
- **Curl noise** - divergence-free flow fields
- **Worley noise** - cellular/Voronoi noise
- **Domain warping** - organic pattern distortion

### Sampling and Distribution
- **Poisson-disc sampling** - blue-noise point distribution

### Triangulation and Tessellation
- **Delaunay triangulation** - mesh generation
- **Voronoi diagrams** - spatial partitioning
- **Triangle subdivision** - recursive fractal patterns

### Curves and Paths
- **Catmull-Rom splines** - smooth curve interpolation
- **Marching squares** - contour extraction

### Tilings and Fractals
- **Penrose tiling** - aperiodic patterns (L-System and Kite-Dart)
- **Truchet tiling** - rotatable tile patterns
- **Peano curve** - space-filling fractal

### Packing and Layout
- **Circle packing** - space-filling circular layouts

### Simulation
- **Reaction-diffusion** - Gray-Scott pattern formation
