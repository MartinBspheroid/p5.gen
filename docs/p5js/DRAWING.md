# p5.js Drawing Reference

Drawing functions commonly used when visualizing p5.gen outputs.

## Canvas Setup

### `createCanvas`

```typescript
function createCanvas(w: number, h: number, renderer?: RENDERER): p5.Renderer
```

Create the drawing canvas.

```typescript
createCanvas(800, 600);         // 2D canvas
createCanvas(800, 600, WEBGL);  // WebGL 3D canvas
```

## Shapes

### Basic Shapes

```typescript
// Circle/Ellipse
ellipse(x, y, w, h?);  // Center at (x, y)
circle(x, y, d);       // Center at (x, y), diameter d

// Rectangle
rect(x, y, w, h);      // Top-left at (x, y)
square(x, y, s);       // Top-left at (x, y), side s

// Line
line(x1, y1, x2, y2);

// Point
point(x, y);

// Triangle
triangle(x1, y1, x2, y2, x3, y3);

// Quadrilateral
quad(x1, y1, x2, y2, x3, y3, x4, y4);

// Arc
arc(x, y, w, h, start, stop, mode?);
// mode: CHORD, PIE, OPEN
```

**Examples:**
```typescript
// Draw a circle at (100, 100) with diameter 50
circle(100, 100, 50);

// Draw a line from (0, 0) to (100, 100)
line(0, 0, 100, 100);

// Draw arc from 0 to PI/2
arc(100, 100, 80, 80, 0, HALF_PI);
```

### Vertex Shapes

Create custom shapes with vertices:

```typescript
// Start a shape
beginShape(mode?);
// mode: POINTS, LINES, TRIANGLES, TRIANGLE_FAN, TRIANGLE_STRIP, QUADS, QUAD_STRIP

// Add vertices
vertex(x, y);
vertex(x, y, z);  // 3D

// End shape
endShape(mode?);
// mode: CLOSE to connect last vertex to first
```

**Example - Draw polygon from points:**
```typescript
const points = circlePoints(createVector(200, 200), 100, 6);

beginShape();
for (const p of points) {
  vertex(p.x, p.y);
}
endShape(CLOSE);  // Hexagon
```

**Example - Draw path:**
```typescript
const curve = generatePeanoCurve(50, 50, 700, 3);

noFill();
beginShape();
for (const p of curve) {
  vertex(p.x, p.y);
}
endShape();  // Open path
```

### Curve Vertices

For smooth curves through points:

```typescript
// Catmull-Rom spline through points
beginShape();
curveVertex(x0, y0);  // Control point (not drawn)
curveVertex(x1, y1);  // Start point
curveVertex(x2, y2);  // ...
curveVertex(xn, yn);  // End point
curveVertex(xn1, yn1);// Control point (not drawn)
endShape();
```

### Bezier Curves

```typescript
// Cubic bezier
bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2);

// Bezier vertex in shape
beginShape();
vertex(x1, y1);
bezierVertex(cx1, cy1, cx2, cy2, x2, y2);
endShape();
```

## Color and Style

### Fill and Stroke

```typescript
// Fill color
fill(gray);               // Grayscale 0-255
fill(r, g, b);            // RGB
fill(r, g, b, a);         // RGBA (a = alpha/opacity)
fill('#ff0000');          // Hex string
fill(color(255, 0, 0));   // p5.Color object
noFill();                 // No fill

// Stroke color
stroke(gray);
stroke(r, g, b);
stroke(r, g, b, a);
noStroke();               // No stroke

// Stroke weight
strokeWeight(weight);     // Line thickness in pixels
```

**Example:**
```typescript
fill(255, 0, 0);         // Red fill
stroke(0);               // Black stroke
strokeWeight(2);         // 2px lines
circle(100, 100, 50);
```

### Background

```typescript
background(gray);
background(r, g, b);
background(r, g, b, a);
background('#ffffff');

clear();  // Transparent (WebGL only)
```

### Color Modes

```typescript
// Switch to HSB (Hue, Saturation, Brightness)
colorMode(HSB, 360, 100, 100);
fill(180, 100, 100);  // Cyan

// RGB mode (default)
colorMode(RGB, 255);
fill(0, 255, 255);    // Cyan
```

### Stroke Styles

```typescript
// End cap style
strokeCap(ROUND);   // Rounded ends
strokeCap(SQUARE);  // Square ends
strokeCap(PROJECT); // Extended square ends

// Corner style
strokeJoin(MITER);  // Sharp corners
strokeJoin(BEVEL);  // Beveled corners
strokeJoin(ROUND);  // Rounded corners
```

## Transformations

### State Management

```typescript
push();  // Save current drawing state
// ... transformations and drawing ...
pop();   // Restore saved state
```

**Always use push/pop** when applying transforms to isolate changes.

### Translation

```typescript
translate(x, y);      // 2D
translate(x, y, z);   // 3D
```

### Rotation

```typescript
rotate(angle);          // 2D, radians
rotateX(angle);         // 3D
rotateY(angle);         // 3D
rotateZ(angle);         // 3D
```

### Scale

```typescript
scale(s);               // Uniform scale
scale(x, y);            // Non-uniform 2D
scale(x, y, z);         // 3D
```

### Example - Draw at Position with Rotation

```typescript
push();
translate(100, 100);    // Move origin to (100, 100)
rotate(PI / 4);         // Rotate 45°
rect(0, 0, 50, 50);     // Draw at new origin
pop();                  // Restore original state
```

### Transform Matrix

```typescript
// Apply custom transform matrix
applyMatrix(a, b, c, d, e, f);

// Reset all transforms
resetMatrix();
```

## Drawing Modes

### Shape Modes

```typescript
// Rectangle drawing mode
rectMode(CORNER);   // x, y is top-left (default)
rectMode(CORNERS);  // x1, y1, x2, y2 corners
rectMode(CENTER);   // x, y is center
rectMode(RADIUS);   // x, y is center, w, h are half-width/height

// Ellipse drawing mode
ellipseMode(CENTER);  // x, y is center (default)
ellipseMode(CORNER);  // x, y is top-left
```

## Text

### Drawing Text

```typescript
text(str, x, y);
text(str, x, y, w, h);  // With bounding box

textSize(32);
textFont('Arial');
textAlign(CENTER, CENTER);
```

## Common Patterns

### Drawing Points

```typescript
const sampler = new PoissonDiscSampler(800, 600, 10);
sampler.generate();

strokeWeight(3);
for (const p of sampler.points) {
  point(p.x, p.y);
}
```

### Drawing Circles from Packing

```typescript
const packer = new CirclePacker(config);
packer.pack(100);

noFill();
stroke(0);
for (const c of packer.circles) {
  circle(c.center.x, c.center.y, c.radius * 2);
}
```

### Drawing Triangulation

```typescript
const triangulation = triangulate(points);

noFill();
stroke(0);
for (const tri of triangulation.triangles) {
  const [p1, p2, p3] = tri.vertices;
  triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
}
```

### Drawing Voronoi Regions

```typescript
const voronoi = createVoronoi(config);
voronoi.generate();

colorMode(HSB, 360, 100, 100);
for (const [index, region] of voronoi.regions) {
  fill(index * 30 % 360, 80, 90);
  beginShape();
  for (const p of region) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);
}
```

### Drawing Flow Field

```typescript
const noise = new SimplexNoise2D(seed);
const fbmFn = (x: number, y: number) => fbm2D(noise, x, y);

stroke(0, 50);  // Semi-transparent
for (let x = 0; x < width; x += 20) {
  for (let y = 0; y < height; y += 20) {
    const vel = curlNoise2D(x, y, fbmFn);
    line(x, y, x + vel.x * 15, y + vel.y * 15);
  }
}
```
