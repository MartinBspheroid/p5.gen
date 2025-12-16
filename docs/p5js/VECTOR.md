# p5.Vector Reference

`p5.Vector` is the core type used throughout p5.gen for 2D and 3D coordinates.

## Creating Vectors

### `createVector`

```typescript
function createVector(x?: number, y?: number, z?: number): p5.Vector
```

Create a new vector. Defaults to (0, 0, 0).

```typescript
const v1 = createVector(100, 200);      // 2D vector
const v2 = createVector(10, 20, 30);    // 3D vector
const origin = createVector();           // (0, 0, 0)
```

### Static Factory Methods

```typescript
// Vector from angle (radians)
const v = p5.Vector.fromAngle(Math.PI / 4);  // 45° unit vector

// Random 2D unit vector
const r2d = p5.Vector.random2D();

// Random 3D unit vector
const r3d = p5.Vector.random3D();
```

## Properties

```typescript
const v = createVector(100, 200, 50);

v.x  // 100 - X component
v.y  // 200 - Y component
v.z  // 50  - Z component
```

## Instance Methods

### Copying

```typescript
const v = createVector(100, 200);
const copy = v.copy();  // New vector with same values
```

### Magnitude and Normalization

```typescript
const v = createVector(3, 4);

v.mag();          // 5 - magnitude (length)
v.magSq();        // 25 - squared magnitude (faster)
v.normalize();    // Returns unit vector (modifies in place)
v.setMag(10);     // Set magnitude to 10 (modifies in place)
v.limit(5);       // Limit magnitude to max 5 (modifies in place)
```

### Arithmetic (In-Place)

These methods modify the vector and return `this` for chaining:

```typescript
const v = createVector(100, 200);

v.add(createVector(10, 20));     // v = (110, 220)
v.add(10, 20);                   // Also accepts x, y values

v.sub(createVector(10, 20));     // v = (100, 200)
v.mult(2);                       // v = (200, 400)
v.div(2);                        // v = (100, 200)
```

### Rotation

```typescript
const v = createVector(100, 0);

v.rotate(Math.PI / 2);  // Rotate 90° counterclockwise
// v ≈ (0, 100)

v.heading();            // Angle in radians (Math.PI / 2)
```

### Linear Interpolation

```typescript
const v1 = createVector(0, 0);
const v2 = createVector(100, 100);

v1.lerp(v2, 0.5);  // v1 = (50, 50), modifies v1 in place
```

### Other Operations

```typescript
const v = createVector(100, 200);

v.set(50, 100);           // Set new values
v.array();                // [100, 200, 0] - as array
v.toString();             // "p5.Vector Object : [100, 200, 0]"
v.equals(createVector(100, 200));  // true
```

## Static Methods (Return New Vectors)

These methods return new vectors without modifying inputs:

### Arithmetic

```typescript
const v1 = createVector(100, 200);
const v2 = createVector(50, 50);

// Returns new vector, doesn't modify v1 or v2
p5.Vector.add(v1, v2);    // (150, 250)
p5.Vector.sub(v1, v2);    // (50, 150)
p5.Vector.mult(v1, 2);    // (200, 400)
p5.Vector.div(v1, 2);     // (50, 100)
```

### Interpolation

```typescript
const v1 = createVector(0, 0);
const v2 = createVector(100, 100);

// Returns new vector at t=0.5 between v1 and v2
p5.Vector.lerp(v1, v2, 0.5);  // (50, 50)
```

### Distance

```typescript
const v1 = createVector(0, 0);
const v2 = createVector(3, 4);

p5.Vector.dist(v1, v2);  // 5
```

### Dot Product

```typescript
const v1 = createVector(1, 0);
const v2 = createVector(0, 1);

p5.Vector.dot(v1, v2);  // 0 (perpendicular)
v1.dot(v2);             // Instance method also works
```

### Cross Product

```typescript
const v1 = createVector(1, 0, 0);
const v2 = createVector(0, 1, 0);

p5.Vector.cross(v1, v2);  // (0, 0, 1)
```

### Angle Between Vectors

```typescript
const v1 = createVector(1, 0);
const v2 = createVector(1, 1);

p5.Vector.angleBetween(v1, v2);  // π/4 (45°)
```

## Common Patterns in p5.gen

### Calculating Direction

```typescript
function getDirection(from: p5.Vector, to: p5.Vector): p5.Vector {
  return p5.Vector.sub(to, from).normalize();
}
```

### Moving Toward a Target

```typescript
function moveToward(
  current: p5.Vector,
  target: p5.Vector,
  speed: number
): p5.Vector {
  const dir = p5.Vector.sub(target, current);
  dir.setMag(speed);
  return p5.Vector.add(current, dir);
}
```

### Points on a Circle

```typescript
function pointOnCircle(
  center: p5.Vector,
  radius: number,
  angle: number
): p5.Vector {
  return createVector(
    center.x + radius * Math.cos(angle),
    center.y + radius * Math.sin(angle)
  );
}
```

### Random Point in Circle

```typescript
function randomInCircle(center: p5.Vector, radius: number): p5.Vector {
  const r = radius * Math.sqrt(Math.random());
  const theta = Math.random() * TWO_PI;
  return createVector(
    center.x + r * Math.cos(theta),
    center.y + r * Math.sin(theta)
  );
}
```

### Velocity from Angle

```typescript
const angle = Math.PI / 4;  // 45°
const speed = 5;

const velocity = p5.Vector.fromAngle(angle);
velocity.setMag(speed);
// or: velocity.mult(speed);
```

## Type Definition

From `@types/p5`:

```typescript
class Vector {
  x: number;
  y: number;
  z: number;

  constructor(x?: number, y?: number, z?: number);

  // Instance methods
  copy(): Vector;
  add(v: Vector | number[]): Vector;
  add(x: number, y?: number, z?: number): Vector;
  sub(v: Vector | number[]): Vector;
  mult(n: number): Vector;
  div(n: number): Vector;
  mag(): number;
  magSq(): number;
  dot(v: Vector): number;
  cross(v: Vector): Vector;
  dist(v: Vector): number;
  normalize(): Vector;
  limit(max: number): Vector;
  setMag(n: number): Vector;
  heading(): number;
  rotate(a: number): Vector;
  lerp(v: Vector, amt: number): Vector;
  array(): number[];
  equals(v: Vector): boolean;
  set(x: number, y?: number, z?: number): Vector;
  toString(): string;

  // Static methods
  static add(v1: Vector, v2: Vector): Vector;
  static sub(v1: Vector, v2: Vector): Vector;
  static mult(v: Vector, n: number): Vector;
  static div(v: Vector, n: number): Vector;
  static dist(v1: Vector, v2: Vector): number;
  static dot(v1: Vector, v2: Vector): number;
  static cross(v1: Vector, v2: Vector): Vector;
  static lerp(v1: Vector, v2: Vector, amt: number): Vector;
  static fromAngle(angle: number, length?: number): Vector;
  static fromAngles(theta: number, phi: number, length?: number): Vector;
  static random2D(): Vector;
  static random3D(): Vector;
  static angleBetween(v1: Vector, v2: Vector): number;
}
```

## Performance Tips

1. **Use `magSq()` when comparing distances** - avoids square root
   ```typescript
   if (v.magSq() < radius * radius) { ... }  // Faster than mag() < radius
   ```

2. **Reuse vectors when possible** - avoid creating in hot loops
   ```typescript
   const temp = createVector();
   for (const p of points) {
     temp.set(p.x, p.y);  // Reuse instead of createVector
   }
   ```

3. **Use static methods to avoid mutation**
   ```typescript
   // Creates new vector, preserves originals
   const result = p5.Vector.add(v1, v2);
   ```
