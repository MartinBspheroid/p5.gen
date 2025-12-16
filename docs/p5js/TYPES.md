# p5.js Types Reference

Key types and constants used in p5.gen.

## Core Classes

### p5.Vector

The primary type for coordinates in p5.gen.

```typescript
class p5.Vector {
  x: number;
  y: number;
  z: number;

  // See VECTOR.md for full reference
}
```

**Creation:**
```typescript
const v = createVector(100, 200);
```

### p5.Color

Represents RGBA color values.

```typescript
class p5.Color {
  // Access components
  levels: number[];

  // Methods
  setRed(value: number): void;
  setGreen(value: number): void;
  setBlue(value: number): void;
  setAlpha(value: number): void;

  toString(format?: string): string;
}
```

**Creation:**
```typescript
const c = color(255, 0, 0);        // Red
const c2 = color(255, 0, 0, 128);  // Semi-transparent red
const c3 = color('#ff0000');       // Hex string

// Access components
red(c);    // 255
green(c);  // 0
blue(c);   // 0
alpha(c);  // 255

// Modify
c.setAlpha(128);
```

### p5.Graphics

Off-screen graphics buffer.

```typescript
class p5.Graphics {
  width: number;
  height: number;

  // All drawing methods available
  background(...): void;
  fill(...): void;
  ellipse(...): void;
  // etc.

  reset(): void;
  remove(): void;
}
```

**Creation:**
```typescript
const pg = createGraphics(400, 400);

// Draw to buffer
pg.background(255);
pg.fill(0);
pg.ellipse(200, 200, 100, 100);

// Display buffer
image(pg, 0, 0);
```

### p5.Image

Canvas-backed image.

```typescript
class p5.Image {
  width: number;
  height: number;
  pixels: number[];  // RGBA array

  loadPixels(): void;
  updatePixels(): void;
  get(x?: number, y?: number, w?: number, h?: number): p5.Color | p5.Image;
  set(x: number, y: number, color: p5.Color | number[]): void;
  copy(...): void;
  save(filename: string): void;
}
```

**Usage:**
```typescript
const img = createImage(100, 100);
img.loadPixels();
for (let i = 0; i < img.pixels.length; i += 4) {
  img.pixels[i] = 255;     // R
  img.pixels[i+1] = 0;     // G
  img.pixels[i+2] = 0;     // B
  img.pixels[i+3] = 255;   // A
}
img.updatePixels();
image(img, 0, 0);
```

## Renderer Constants

```typescript
type RENDERER = P2D | WEBGL;
```

| Constant | Description |
|----------|-------------|
| `P2D` | 2D canvas rendering (default) |
| `WEBGL` | WebGL 3D rendering |

```typescript
createCanvas(800, 600);        // P2D (default)
createCanvas(800, 600, WEBGL); // WebGL
```

## Color Mode Constants

```typescript
type COLOR_MODE = RGB | HSB | HSL;
```

| Constant | Description |
|----------|-------------|
| `RGB` | Red, Green, Blue (default) |
| `HSB` | Hue, Saturation, Brightness |
| `HSL` | Hue, Saturation, Lightness |

```typescript
colorMode(RGB, 255);           // RGB, max 255
colorMode(HSB, 360, 100, 100); // HSB with custom ranges
```

## Shape Constants

### Begin/End Shape Modes

```typescript
type BEGIN_KIND =
  | POINTS
  | LINES
  | TRIANGLES
  | TRIANGLE_FAN
  | TRIANGLE_STRIP
  | QUADS
  | QUAD_STRIP;

type END_MODE = CLOSE;
```

```typescript
beginShape(POINTS);
// ... vertices
endShape();

beginShape();
// ... vertices
endShape(CLOSE);  // Connect last to first
```

### Rect/Ellipse Modes

```typescript
type RECT_MODE = CORNER | CORNERS | CENTER | RADIUS;
type ELLIPSE_MODE = CENTER | RADIUS | CORNER | CORNERS;
```

| Constant | Rect Behavior | Ellipse Behavior |
|----------|---------------|------------------|
| `CORNER` | x,y = top-left (default) | x,y = top-left |
| `CORNERS` | x1,y1,x2,y2 corners | x1,y1,x2,y2 corners |
| `CENTER` | x,y = center | x,y = center (default) |
| `RADIUS` | w,h = half-width/height | w,h = radii |

### Arc Modes

```typescript
type ARC_MODE = CHORD | PIE | OPEN;
```

| Constant | Description |
|----------|-------------|
| `OPEN` | Arc only, no fill |
| `CHORD` | Arc with chord (straight line) |
| `PIE` | Arc with lines to center (pie slice) |

### Stroke Caps and Joins

```typescript
type STROKE_CAP = ROUND | SQUARE | PROJECT;
type STROKE_JOIN = MITER | BEVEL | ROUND;
```

## Alignment Constants

### Text Alignment

```typescript
type HORIZ_ALIGN = LEFT | CENTER | RIGHT;
type VERT_ALIGN = TOP | CENTER | BOTTOM | BASELINE;
```

```typescript
textAlign(CENTER, CENTER);
text("Hello", width/2, height/2);
```

## Angle Mode Constants

```typescript
type ANGLE_MODE = RADIANS | DEGREES;
```

```typescript
angleMode(RADIANS);  // Default
rotate(PI / 4);      // 45 degrees

angleMode(DEGREES);
rotate(45);          // 45 degrees
```

## Filter Constants

```typescript
type FILTER_TYPE =
  | THRESHOLD
  | GRAY
  | OPAQUE
  | INVERT
  | POSTERIZE
  | BLUR
  | ERODE
  | DILATE;
```

```typescript
filter(GRAY);
filter(BLUR, 3);
filter(THRESHOLD, 0.5);
```

## Blend Mode Constants

```typescript
type BLEND_MODE =
  | BLEND
  | DARKEST
  | LIGHTEST
  | DIFFERENCE
  | MULTIPLY
  | EXCLUSION
  | SCREEN
  | REPLACE
  | OVERLAY
  | HARD_LIGHT
  | SOFT_LIGHT
  | DODGE
  | BURN
  | ADD
  | NORMAL;
```

```typescript
blendMode(MULTIPLY);
// Draw with multiply blending
```

## Type Definitions in p5.gen

p5.gen defines additional types for its utilities:

### Geometric Types

```typescript
// Bounding box
type BoundingBox = {
  readonly min: p5.Vector;
  readonly max: p5.Vector;
};

// Polar coordinates
type PolarCoord = {
  readonly r: number;
  readonly theta: number;
};

// Simple point (for modules not using p5.Vector)
type Point = { x: number; y: number };

// Tuple point
type Point2D = readonly [number, number];
```

### Configuration Types

```typescript
// Lerp options (discriminated union)
type LerpOptions =
  | { readonly steps: number }
  | { readonly pixelsPerStep: number };

// Rotation (literal union)
type Rotation = 0 | 1 | 2 | 3;

// Tile type
type TileType = 'diagonal' | 'curve' | 'triangle' | 'dots' | 'cross';

// Distance metric
type DistanceMetric = 'euclidean' | 'manhattan' | 'chebyshev';
```

### Function Types

```typescript
// 2D noise function
type NoiseFunction2D = (x: number, y: number) => number;

// FBM function
type FbmFunction = (x: number, y: number) => number;

// Random function
type RandomFunction = () => number;
```

## TypeScript Configuration

p5.gen uses these TypeScript settings for p5.js types:

```json
{
  "compilerOptions": {
    "types": ["bun-types", "p5"],
    "lib": ["ESNext", "DOM"]
  }
}
```

The `@types/p5` package provides global type declarations, making `createVector`, `ellipse`, etc. available globally when using p5.js in global mode.

## Using p5.gen Types

Import types from p5.gen:

```typescript
import type {
  BoundingBox,
  PolarCoord,
  LerpOptions,
  Point,
  Rotation,
  TileType,
  DistanceMetric,
  NoiseFunction2D,
} from 'p5.gen';
```

## Type Guard Examples

```typescript
// Check LerpOptions variant
function getStepCount(options: LerpOptions): number {
  if ('steps' in options) {
    return options.steps;
  } else {
    // options.pixelsPerStep exists
    return Math.ceil(lineLength / options.pixelsPerStep);
  }
}

// Type narrowing with null check
const center = circumcenter(p1, p2, p3);
if (center !== null) {
  // center is p5.Vector here
  ellipse(center.x, center.y, 10, 10);
}
```
