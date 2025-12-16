# p5.js Math Reference

Math utilities and functions relevant to p5.gen.

## Constants

```typescript
PI          // 3.14159...
TWO_PI      // 6.28318... (2π)
HALF_PI     // 1.57079... (π/2)
QUARTER_PI  // 0.78539... (π/4)
TAU         // 6.28318... (same as TWO_PI)
```

**Example:**
```typescript
// Full circle arc
arc(x, y, w, h, 0, TWO_PI);

// Quarter circle
arc(x, y, w, h, 0, HALF_PI);
```

## Calculation Functions

### `map`

Remap a value from one range to another.

```typescript
function map(
  value: number,
  start1: number, stop1: number,
  start2: number, stop2: number
): number
```

```typescript
// Map mouse position (0-800) to brightness (0-255)
const brightness = map(mouseX, 0, 800, 0, 255);

// Map noise (-1 to 1) to screen position
const x = map(noiseValue, -1, 1, 0, width);
```

### `constrain`

Constrain a value to a range.

```typescript
function constrain(value: number, min: number, max: number): number
```

```typescript
// Keep value between 0 and 255
const clamped = constrain(value, 0, 255);

// Keep particle in bounds
particle.x = constrain(particle.x, 0, width);
```

### `lerp`

Linear interpolation between two values.

```typescript
function lerp(start: number, stop: number, amt: number): number
```

```typescript
// Midpoint between 0 and 100
lerp(0, 100, 0.5);  // 50

// Smooth animation toward target
currentValue = lerp(currentValue, targetValue, 0.1);
```

### `dist`

Distance between two points.

```typescript
function dist(x1: number, y1: number, x2: number, y2: number): number
function dist(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number): number
```

```typescript
const d = dist(0, 0, 3, 4);  // 5
```

### `norm`

Normalize a value from a range to 0-1.

```typescript
function norm(value: number, start: number, stop: number): number
```

```typescript
// Convert 50 from range 0-100 to 0-1
norm(50, 0, 100);  // 0.5
```

### `mag`

Magnitude of a vector (2D or 3D).

```typescript
function mag(x: number, y: number): number
function mag(x: number, y: number, z: number): number
```

```typescript
mag(3, 4);  // 5
```

## Trigonometry

### Basic Functions

```typescript
sin(angle);    // Sine
cos(angle);    // Cosine
tan(angle);    // Tangent
asin(value);   // Arc sine
acos(value);   // Arc cosine
atan(value);   // Arc tangent
atan2(y, x);   // Arc tangent of y/x (considers quadrant)
```

**Example - Points on circle:**
```typescript
for (let i = 0; i < numPoints; i++) {
  const angle = map(i, 0, numPoints, 0, TWO_PI);
  const x = centerX + radius * cos(angle);
  const y = centerY + radius * sin(angle);
  point(x, y);
}
```

### Angle Conversion

```typescript
radians(degrees);  // Convert degrees to radians
degrees(radians);  // Convert radians to degrees
```

### Angle Mode

```typescript
angleMode(RADIANS);  // Default
angleMode(DEGREES);
```

## Random

### `random`

Generate random numbers.

```typescript
function random(): number;                          // 0 to 1
function random(max: number): number;               // 0 to max
function random(min: number, max: number): number;  // min to max
function random(array: any[]): any;                 // Random element
```

```typescript
random();           // 0 to 1
random(100);        // 0 to 100
random(50, 100);    // 50 to 100
random(['a', 'b']); // 'a' or 'b'
```

### `randomSeed`

Set seed for reproducible random values.

```typescript
function randomSeed(seed: number): void
```

```typescript
randomSeed(12345);
const a = random();  // Always same value
const b = random();  // Always same value
```

### `randomGaussian`

Random number from Gaussian distribution.

```typescript
function randomGaussian(mean?: number, sd?: number): number
```

```typescript
// Mean 0, standard deviation 1
randomGaussian();

// Mean 100, standard deviation 20
randomGaussian(100, 20);
```

## Perlin Noise

### `noise`

Smooth, continuous random values (Perlin noise).

```typescript
function noise(x: number): number;
function noise(x: number, y: number): number;
function noise(x: number, y: number, z: number): number;
```

Returns values between 0 and 1.

```typescript
// 1D noise
const n1 = noise(frameCount * 0.01);

// 2D noise
const n2 = noise(x * 0.01, y * 0.01);

// 3D noise (time-varying 2D)
const n3 = noise(x * 0.01, y * 0.01, frameCount * 0.01);
```

### `noiseSeed`

Set seed for reproducible noise.

```typescript
function noiseSeed(seed: number): void
```

### `noiseDetail`

Adjust noise character.

```typescript
function noiseDetail(lod: number, falloff?: number): void
```

- `lod` - Level of detail (octaves)
- `falloff` - Amplitude reduction per octave (0-1)

```typescript
noiseDetail(4, 0.5);  // 4 octaves, 50% falloff
```

## Comparison with p5.gen Noise

| Feature | p5.js `noise()` | p5.gen `SimplexNoise2D` |
|---------|-----------------|-------------------------|
| Algorithm | Perlin | Simplex |
| Range | 0 to 1 | -1 to 1 |
| Seeding | `noiseSeed()` | Constructor param |
| FBM | `noiseDetail()` | `fbm2D()` function |
| Curl | Not available | `curlNoise2D()` |

**p5.gen advantage:** Simplex noise is faster and has fewer directional artifacts. The library also provides curl noise for flow fields.

```typescript
// p5.js noise
noiseSeed(12345);
const value = noise(x * 0.01, y * 0.01);

// p5.gen noise
const simplex = new SimplexNoise2D(12345);
const value = simplex.noise2D(x * 0.01, y * 0.01);
// Or with FBM:
const fbmValue = fbm2D(simplex, x, y, 0.5, 4);
```

## Floor, Ceil, Round

```typescript
floor(n);   // Round down
ceil(n);    // Round up
round(n);   // Round to nearest
round(n, decimals);  // Round to decimal places
```

## Min, Max, Abs

```typescript
min(a, b);
min(array);
max(a, b);
max(array);
abs(n);
```

## Power and Logarithm

```typescript
pow(base, exponent);
sqrt(n);
sq(n);      // n squared
exp(n);     // e^n
log(n);     // Natural log
```

## Example Patterns

### Smooth Animation

```typescript
let t = 0;

function draw() {
  const x = map(sin(t), -1, 1, 100, 700);
  const y = map(cos(t * 0.7), -1, 1, 100, 500);
  circle(x, y, 20);
  t += 0.02;
}
```

### Noise-Based Movement

```typescript
function draw() {
  const noiseX = noise(frameCount * 0.01);
  const noiseY = noise(frameCount * 0.01 + 1000);

  const x = map(noiseX, 0, 1, 0, width);
  const y = map(noiseY, 0, 1, 0, height);

  circle(x, y, 20);
}
```

### Combining with p5.gen

```typescript
const noise = new SimplexNoise2D(42);

function draw() {
  for (let x = 0; x < width; x += 10) {
    for (let y = 0; y < height; y += 10) {
      // Use p5.gen simplex noise
      const n = noise.noise2D(x * 0.01, y * 0.01);

      // Map to brightness
      const brightness = map(n, -1, 1, 0, 255);
      fill(brightness);
      rect(x, y, 10, 10);
    }
  }
}
```
