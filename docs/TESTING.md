# Testing Guide

This document covers the testing infrastructure in p5.gen, including unit tests and visual tests.

## Overview

p5.gen uses two types of testing:

1. **Unit Tests** - Bun's test framework for logic verification
2. **Visual Tests** - Puppeteer-based rendering verification

## Unit Testing

### Running Tests

```bash
# Run all tests
bun test

# Run specific test file
bun test src/circle.test.ts

# Run tests matching pattern
bun test --test-name-pattern "circumference"

# Watch mode
bun test --watch
```

### Test Framework

Tests use Bun's built-in test framework (`bun:test`):

```typescript
import { describe, test, expect, beforeEach } from 'bun:test';
import { circumference, area } from './circle';

describe('circle calculations', () => {
  test('circumference returns 2πr', () => {
    expect(circumference(1)).toBeCloseTo(2 * Math.PI);
    expect(circumference(5)).toBeCloseTo(10 * Math.PI);
  });

  test('area returns πr²', () => {
    expect(area(1)).toBeCloseTo(Math.PI);
    expect(area(2)).toBeCloseTo(4 * Math.PI);
  });
});
```

### Test File Naming

Test files are colocated with source files:

```
src/
├── circle.ts
├── circle.test.ts           # Main tests
├── circle-calculations.test.ts
├── circle-advanced.test.ts
├── circle-checks.test.ts
├── circle-intersections.test.ts
├── line.ts
└── line.test.ts
```

### Test Structure

Organize tests by functionality:

```typescript
describe('ModuleName', () => {
  describe('functionName', () => {
    test('handles normal input', () => {
      // ...
    });

    test('handles edge case', () => {
      // ...
    });

    test('returns null for invalid input', () => {
      // ...
    });
  });
});
```

### Assertions

Common assertions:

```typescript
// Exact equality
expect(value).toBe(expected);

// Floating-point comparison
expect(value).toBeCloseTo(expected, numDigits);

// Boolean checks
expect(condition).toBeTruthy();
expect(condition).toBeFalsy();

// Array checks
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Object checks
expect(obj).toEqual({ x: 1, y: 2 });
expect(obj).toHaveProperty('x');

// Null/undefined
expect(value).toBeNull();
expect(value).toBeDefined();

// Error handling
expect(() => riskyFunction()).toThrow();
```

### Floating-Point Testing

Use `toBeCloseTo` for floating-point comparisons:

```typescript
// Default: 2 decimal places
expect(circumference(1)).toBeCloseTo(6.283185);

// Specify precision
expect(value).toBeCloseTo(expected, 6); // 6 decimal places
```

### Testing with p5.Vector

Mock or use actual p5.Vector:

```typescript
import { createVector } from '../globals';

test('distance calculation', () => {
  const p1 = createVector(0, 0);
  const p2 = createVector(3, 4);
  expect(distance(p1, p2)).toBe(5);
});
```

---

## Visual Testing

Visual tests render algorithms using p5.js and capture PNG screenshots for verification.

### Running Visual Tests

```bash
# Run all visual tests
bun run visual-test

# Run specific sketch
bun visual-tests/runner.ts --sketch peano

# Verbose output (shows file paths)
bun visual-tests/runner.ts --verbose

# Custom canvas size
bun visual-tests/runner.ts --width 1200 --height 800
```

### Visual Test Structure

```
visual-tests/
├── runner.ts                 # CLI entry point
├── lib/
│   ├── test-runner.ts        # Puppeteer orchestration
│   ├── sketch-loader.ts      # Dynamic sketch loading
│   ├── html-template.ts      # HTML generation
│   └── types.ts              # Type definitions
├── sketches/
│   ├── peano-curve.sketch.ts
│   ├── penrose-tiling.sketch.ts
│   ├── circle-points.sketch.ts
│   └── ...
└── output/
    └── *.png                 # Generated screenshots
```

### Writing a Visual Test

Create a `.sketch.ts` file in `visual-tests/sketches/`:

```typescript
import type { SketchDefinition } from '../lib/types';
import { generatePeanoCurve } from '../../src/peano';

export const sketch: SketchDefinition = {
  name: 'Peano Curve',
  width: 800,
  height: 800,

  setup: (p5) => {
    p5.background(255);
    p5.stroke(0);
    p5.noFill();
  },

  draw: (p5) => {
    const points = generatePeanoCurve(50, 50, 700, 3);

    p5.beginShape();
    for (const point of points) {
      p5.vertex(point.x, point.y);
    }
    p5.endShape();

    // Return false to stop draw loop (single frame)
    return false;
  },
};
```

### Sketch Definition Interface

```typescript
interface SketchDefinition {
  name: string;           // Display name
  width: number;          // Canvas width
  height: number;         // Canvas height
  setup?: (p5: p5) => void;
  draw: (p5: p5) => void | boolean;  // Return false to stop
}
```

### Setup Function

Use `setup` for one-time initialization:

```typescript
setup: (p5) => {
  p5.background(240);
  p5.stroke(0);
  p5.strokeWeight(1);
  p5.noFill();
}
```

### Draw Function

The `draw` function renders the visualization:

```typescript
draw: (p5) => {
  // Draw algorithm output
  const points = generatePoints();
  for (const p of points) {
    p5.ellipse(p.x, p.y, 5, 5);
  }

  // Return false to capture single frame
  // Return true or nothing for continuous animation
  return false;
}
```

### Output Location

Screenshots are saved to `visual-tests/output/`:

```
visual-tests/output/
├── peano-curve.png
├── penrose-tiling.png
├── circle-points.png
└── ...
```

### Available p5.js Functions

Common functions available in sketches:

```typescript
// Drawing
p5.ellipse(x, y, w, h);
p5.rect(x, y, w, h);
p5.line(x1, y1, x2, y2);
p5.point(x, y);
p5.triangle(x1, y1, x2, y2, x3, y3);

// Paths
p5.beginShape();
p5.vertex(x, y);
p5.curveVertex(x, y);
p5.endShape(p5.CLOSE);

// Colors
p5.background(r, g, b);
p5.fill(r, g, b, a);
p5.stroke(r, g, b, a);
p5.noFill();
p5.noStroke();
p5.strokeWeight(w);

// Transforms
p5.push();
p5.translate(x, y);
p5.rotate(angle);
p5.scale(s);
p5.pop();

// Vectors
p5.createVector(x, y);
```

---

## Test Coverage

### What to Test

**Unit tests should cover:**
- Normal inputs and expected outputs
- Edge cases (empty arrays, zero values, boundary conditions)
- Error conditions (invalid inputs)
- Mathematical accuracy (floating-point comparisons)

**Visual tests should cover:**
- Each algorithm's visual output
- Different parameter combinations
- Edge cases that might cause visual artifacts

### Example: Comprehensive Circle Tests

```typescript
// circle.test.ts
describe('circumference', () => {
  test('returns 2πr for positive radius', () => {
    expect(circumference(1)).toBeCloseTo(TWO_PI);
    expect(circumference(5)).toBeCloseTo(TWO_PI * 5);
  });

  test('returns 0 for zero radius', () => {
    expect(circumference(0)).toBe(0);
  });
});

// circle-intersections.test.ts
describe('circleIntersectionPoints', () => {
  test('returns empty array for non-intersecting circles', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(100, 0);
    expect(circleIntersectionPoints(c1, 10, c2, 10)).toHaveLength(0);
  });

  test('returns single point for tangent circles', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(20, 0);
    const points = circleIntersectionPoints(c1, 10, c2, 10);
    expect(points).toHaveLength(1);
    expect(points[0].x).toBeCloseTo(10);
  });

  test('returns two points for overlapping circles', () => {
    const c1 = createVector(0, 0);
    const c2 = createVector(10, 0);
    expect(circleIntersectionPoints(c1, 10, c2, 10)).toHaveLength(2);
  });
});
```

---

## Adding New Tests

### Adding Unit Tests

1. Create test file next to source: `src/newModule.test.ts`
2. Import the module and test utilities
3. Write tests following existing patterns
4. Run with `bun test`

### Adding Visual Tests

1. Create sketch file: `visual-tests/sketches/new-feature.sketch.ts`
2. Export `sketch` object with required properties
3. Run with `bun run visual-test --sketch new-feature`
4. Check output in `visual-tests/output/`

---

## CI Integration

Tests can be integrated into CI pipelines:

```yaml
# Example GitHub Actions workflow
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
      - run: bun run visual-test
```

---

## Debugging Tests

### Unit Test Debugging

```bash
# Run with verbose output
bun test --verbose

# Run single test file with console output
bun test src/circle.test.ts
```

### Visual Test Debugging

```bash
# Verbose output shows file paths
bun visual-tests/runner.ts --verbose

# Check generated HTML
# Look in visual-tests/output/ for temporary HTML files

# Run with custom timeout
bun visual-tests/runner.ts --timeout 30000
```

### Common Issues

**Floating-point comparison failures:**
```typescript
// Bad: exact equality
expect(circumference(1)).toBe(6.283185307179586);

// Good: approximate equality
expect(circumference(1)).toBeCloseTo(2 * Math.PI);
```

**p5.Vector not defined:**
Make sure globals are imported:
```typescript
import '../globals';  // Initialize p5 globals
```

**Visual test timeout:**
Increase timeout or ensure `draw` returns `false` for single-frame captures.
