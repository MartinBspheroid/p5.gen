# p5.js Reference for p5.gen

This section documents the p5.js functions and types most relevant to the p5.gen library.

## How p5.js is Used

p5.gen is **framework-agnostic** - all algorithms work without p5.js. However:

- `p5.Vector` is used as the standard coordinate type
- Visual tests use p5.js for rendering
- The library integrates seamlessly with p5.js sketches

## Global Mode vs Instance Mode

p5.js supports two modes:

### Global Mode (Used in p5.gen)

Functions are available globally:

```typescript
// Global mode - functions are on window/globalThis
const v = createVector(100, 200);
ellipse(50, 50, 100, 100);
```

### Instance Mode

Functions are methods on a p5 instance:

```typescript
const sketch = (p: p5) => {
  p.setup = () => {
    p.createCanvas(800, 600);
  };
  p.draw = () => {
    p.ellipse(50, 50, 100, 100);
  };
};

new p5(sketch);
```

## Documentation Files

| Document | Content |
|----------|---------|
| [VECTOR.md](./VECTOR.md) | p5.Vector class - essential for p5.gen |
| [DRAWING.md](./DRAWING.md) | Shape, color, and transform functions |
| [MATH.md](./MATH.md) | Math utilities, random, and noise |
| [TYPES.md](./TYPES.md) | Key types and constants |

## Quick Reference

### Creating Vectors

```typescript
// Global mode
const v1 = createVector(100, 200);
const v2 = createVector(50, 50);

// Vector math
const sum = p5.Vector.add(v1, v2);
const diff = p5.Vector.sub(v1, v2);
const scaled = p5.Vector.mult(v1, 2);
```

### Using p5.gen with p5.js

```typescript
import { circlePoints, PoissonDiscSampler } from 'p5.gen';

function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(255);

  // Use p5.gen utilities
  const points = circlePoints(createVector(400, 300), 100, 32);

  // Draw with p5.js
  for (const p of points) {
    ellipse(p.x, p.y, 5, 5);
  }
}
```

### Common Patterns

**Drawing a path from points:**
```typescript
const points = generatePeanoCurve(50, 50, 700, 3);

beginShape();
for (const p of points) {
  vertex(p.x, p.y);
}
endShape();
```

**Drawing circles from packing:**
```typescript
const packer = new CirclePacker(config);
packer.pack(100);

for (const c of packer.circles) {
  ellipse(c.center.x, c.center.y, c.radius * 2);
}
```

**Flow field visualization:**
```typescript
const noise = new SimplexNoise2D(seed);
const fbmFn = (x: number, y: number) => fbm2D(noise, x, y);

for (let x = 0; x < width; x += 20) {
  for (let y = 0; y < height; y += 20) {
    const vel = curlNoise2D(x, y, fbmFn);
    line(x, y, x + vel.x * 10, y + vel.y * 10);
  }
}
```

## Type Definitions

p5.gen uses type definitions from `@types/p5`. Key types:

- `p5.Vector` - 2D/3D coordinate
- `p5.Color` - RGBA color value
- `p5.Graphics` - Off-screen canvas

See [TYPES.md](./TYPES.md) for complete reference.
