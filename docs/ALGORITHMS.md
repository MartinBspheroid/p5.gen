# Algorithms

Detailed explanations of the algorithms implemented in p5.gen.

## Table of Contents

- [Noise Generation](#noise-generation)
- [Sampling Algorithms](#sampling-algorithms)
- [Triangulation](#triangulation)
- [Space-Filling Curves](#space-filling-curves)
- [Tilings](#tilings)
- [Circle Packing](#circle-packing)
- [Simulation](#simulation)

---

## Noise Generation

### Simplex Noise

**Implementation:** `SimplexNoise2D` class in `simplexCurl.ts`

Simplex noise is a gradient noise function developed by Ken Perlin as an improvement over classic Perlin noise. It has several advantages:

- Fewer directional artifacts
- Lower computational complexity in higher dimensions
- Continuous derivatives

**How it works:**

1. **Skew the input space** to determine which simplex (triangle in 2D) contains the point
2. **Calculate corner contributions** from each vertex of the simplex
3. **Sum contributions** using a radial falloff function

The noise value is determined by:
- Gradient vectors at each corner (12 predefined unit vectors)
- Distance from the point to each corner
- A smooth falloff function (t⁴ where t = 0.5 - distance²)

**Seeding:**
The implementation uses a permutation table shuffled with a seeded hash function, allowing reproducible results.

```typescript
const noise = new SimplexNoise2D(12345);
const value = noise.noise2D(x * 0.01, y * 0.01); // Scale for desired frequency
```

### Fractal Brownian Motion (FBM)

**Implementation:** `fbm2D` function

FBM layers multiple octaves of noise at different frequencies and amplitudes to create more natural-looking patterns.

**Formula:**
```
fbm(x, y) = Σ noise(x * 2^i, y * 2^i) / 2^i
            i=0 to octaves-1
```

Each successive octave:
- Doubles the frequency (more detail)
- Halves the amplitude (less influence)

**Parameters:**
- `frequency` - Base frequency (higher = more detail)
- `octaves` - Number of layers (more = richer texture)

### Curl Noise

**Implementation:** `curlNoise2D` function

Curl noise generates divergence-free vector fields, ideal for:
- Particle flow simulations
- Smoke/fluid effects
- Organic motion paths

**How it works:**

The curl of a 2D scalar field is computed using numerical differentiation:
```
curl_x = ∂f/∂y ≈ (f(x, y+ε) - f(x, y-ε)) / 2ε
curl_y = -∂f/∂x ≈ -(f(x+ε, y) - f(x-ε, y)) / 2ε
```

The resulting vectors are perpendicular to the gradient, creating flow that follows contour lines.

### Domain Warping

**Implementation:** `warp2D`, `warpFbm2D` in `warp.ts`

Domain warping distorts the input coordinates before sampling noise, creating organic flowing patterns.

**Single warp:**
```
warp(x, y) = fbm(x + fbm(x, y), y + fbm(x, y))
```

**Double warp (more organic):**
```
warp(x, y) = fbm(x + fbm(x + fbm(x, y)), y + fbm(y + fbm(x, y)))
```

### Worley Noise

**Implementation:** `WorleyNoiseGenerator` in `worleyNoise.ts`

Also called cellular noise or Voronoi noise. Creates cell-like patterns based on distance to feature points.

**Algorithm:**
1. Divide space into a grid of cells
2. Place random feature points in each cell
3. For any query point, find distance to nearest feature point(s)
4. Return distance value (or combination of distances)

**Distance metrics:**
- Euclidean: √(dx² + dy²)
- Manhattan: |dx| + |dy|
- Chebyshev: max(|dx|, |dy|)

---

## Sampling Algorithms

### Poisson-Disc Sampling

**Implementation:** `PoissonDiscGrid`, `PoissonDiscSampler` in `poisson.ts`

Generates blue-noise point distributions where all points maintain a minimum distance from each other. Used for:
- Even point distributions
- Stippling effects
- Object placement

#### Bridson's Algorithm (Bounded)

Fast O(n) algorithm for bounded regions:

1. **Initialize** with a random seed point
2. **Maintain an active list** of points to expand from
3. **For each active point:**
   - Generate k random samples in the annulus [r, 2r]
   - If sample is valid (far enough from all neighbors), add it
   - If no valid samples found after k attempts, remove from active list
4. **Repeat** until active list is empty

**Optimization:** Uses a grid with cell size r/√2 so each cell contains at most one point.

```typescript
const sampler = new PoissonDiscSampler(800, 600, 10, seed);
sampler.generate();
// sampler.points contains evenly distributed points
```

#### Unbounded Spatial Hashing

For infinite/unbounded sampling, uses a hash map keyed by cell coordinates:

```typescript
const grid = new PoissonDiscGrid(minDistance);
grid.insert(point); // returns true if valid, false if too close
```

---

## Triangulation

### Delaunay Triangulation

**Implementation:** `DelaunayTriangulation` in `delaunay.ts`

Creates a triangulation of a point set that maximizes the minimum angle of all triangles (avoiding sliver triangles).

**Bowyer-Watson Algorithm:**

1. Create a super-triangle that contains all points
2. For each point:
   - Find all triangles whose circumcircle contains the point
   - Remove these triangles, creating a star-shaped hole
   - Connect the point to all edges of the hole
3. Remove triangles connected to super-triangle vertices

**Key property:** A triangle is in the Delaunay triangulation if and only if its circumcircle contains no other points.

**Circumcircle precomputation:** Each triangle stores its circumcircle for fast point-in-circle tests.

### Voronoi Diagrams

**Implementation:** `VoronoiDiagram` in `voronoi.ts`

The dual of Delaunay triangulation. Partitions space into regions where each region contains all points closest to a particular seed.

**Implementation approach:** Pixel-based scanning (simple but flexible):

1. For each pixel, find the nearest seed
2. Assign pixel to that seed's region

**Supports multiple distance metrics** for creative effects.

---

## Space-Filling Curves

### Peano Curve

**Implementation:** `generatePeanoCurve` in `peano.ts`

The Peano curve is a continuous curve that passes through every point in a square. Unlike the Hilbert curve (which divides into 2×2), the Peano curve divides into 3×3 subregions.

**Breinholt-Schierz Algorithm:**

Recursive construction using 9 subcells per level:
1. At each recursion level, divide the current region into 3×3 grid
2. Visit subcells in a specific order (depends on orientation)
3. Recursively subdivide each subcell
4. Connect endpoints between adjacent subcells

**Point count:** 3^(2*depth) + 1 points at depth d

```typescript
const curve = generatePeanoCurve(0, 0, 400, 3); // depth 3
// Draw as continuous path
```

---

## Tilings

### Penrose Tiling

**Implementation:** `PenroseLSystem`, `PenroseKiteDart` in `penrose.ts`

Penrose tilings are aperiodic tilings that cover the plane without periodic repetition. They exhibit:
- 5-fold rotational symmetry
- Quasicrystalline structure
- Self-similarity

#### P3 Variant (L-System Approach)

Uses an L-system with turtle graphics:

**Production rules:**
```
W → YBF++ZRF----XBF[-YBF----WRF]++
X → +YBF--ZRF[---WRF--XBF]+
Y → -WRF++XBF[+++YBF++ZRF]-
Z → --YBF++++WRF[+ZRF++++XBF]--XBF
```

Where:
- F = move forward
- + = turn right by 36°
- - = turn left by 36°
- [ = push state
- ] = pop state

```typescript
const tiling = createPenroseTiling(5); // 5 generations
const vertices = tiling.getVertices();
const rhombi = tiling.getRhombi();
```

#### P2 Variant (Robinson Triangle Deflation)

Uses recursive subdivision of triangles:

1. Start with an initial configuration of Robinson triangles
2. **Deflate** each triangle into smaller triangles using the golden ratio
3. Repeat for desired detail level

**Golden ratio:** φ = (1 + √5) / 2 ≈ 1.618

The subdivision rules create two types of triangles that combine to form kites and darts.

### Truchet Tiling

**Implementation:** Functions in `truchet.ts`

Truchet tiles are square tiles with patterns that create interesting visual effects when rotated.

**Tile types:**
1. **Diagonal** - Two triangles of different colors
2. **Curve** - Quarter circles in opposite corners
3. **Triangle** - Single diagonal with triangle
4. **Dots** - Circular elements
5. **Cross** - X-shaped pattern

**Rotation:** Each tile has 4 possible rotations (0°, 90°, 180°, 270°)

**Pattern modes:**
- Random - Each tile rotated randomly
- Checker - Alternating rotations
- Gradient - Rotation based on position
- Noise - Rotation determined by noise function

---

## Circle Packing

**Implementation:** `CirclePacker` in `circlePacking.ts`

Fills a region with non-overlapping circles. Multiple strategies available:

### Random Strategy

1. Generate random position and radius
2. Check for overlaps with existing circles
3. If no overlap, add circle
4. Retry up to max attempts

### Grid Strategy

1. Create a grid of potential positions
2. Try placing circles at grid intersections
3. Randomize order for varied results

### Physics Strategy

1. Place circles with initial overlap allowed
2. Apply separation forces between overlapping circles
3. Apply boundary forces to keep circles in bounds
4. Iterate until settled

### Poisson-Disc Strategy

1. Generate Poisson-disc distributed centers
2. Calculate maximum radius for each center
3. Create circles with constrained radii

**Size distributions:**
- Uniform: All circles same size
- Gaussian: Normal distribution around mean
- Power law: Many small, few large (natural distribution)

---

## Simulation

### Gray-Scott Reaction-Diffusion

**Implementation:** `GrayScott` in `reactionDiffusion.ts`

Simulates two chemicals (A and B) that react and diffuse, creating organic patterns similar to animal markings.

**Equations:**
```
∂A/∂t = Dₐ∇²A - AB² + f(1-A)
∂B/∂t = Dᵦ∇²B + AB² - (k+f)B
```

Where:
- Dₐ, Dᵦ = diffusion rates
- f = feed rate (A is added)
- k = kill rate (B is removed)
- ∇² = Laplacian (diffusion)

**Implementation:**
1. Maintain two grids for chemicals A and B
2. Each step:
   - Calculate Laplacian using 9-point stencil
   - Apply reaction equations
   - Update grids
3. Different f/k values produce different patterns:
   - Spots (mitosis)
   - Stripes
   - Spirals
   - Coral-like structures

**Integration with Marching Squares:**
The B chemical concentration can be converted to contours using marching squares for vector output.

```typescript
const sim = new GrayScott(200, 200, 0.055, 0.062);
sim.addChemical(100, 100, 10); // Add seed
for (let i = 0; i < 1000; i++) sim.step();
const paths = getReactionDiffusionPath(sim, 2, 0.5);
```

### Marching Squares

**Implementation:** `marchingSquares` in `marchingSquares.ts`

Extracts iso-contours from a 2D scalar field.

**Algorithm:**
1. Divide field into grid cells
2. For each cell, determine which corners are above/below threshold
3. Use lookup table to determine line segment configuration (16 cases)
4. Interpolate segment endpoints based on values
5. Connect segments into continuous paths

**Output formats:**
- Raw segments: Individual line segments
- Paths: Connected polylines for efficient drawing
