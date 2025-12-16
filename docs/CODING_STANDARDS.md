# Coding Standards

This document defines the coding conventions and best practices for the p5.gen library.

## TypeScript Configuration

### Strict Mode Settings

The project uses strict TypeScript settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Zero Tolerance for `any`

- **Never use `any`** - Use proper types or `unknown` with type guards
- If you must cast, leave a clear TODO with a follow-up issue
- Use generics for flexible typing

```typescript
// BAD
function process(data: any) { ... }

// GOOD
function process<T extends Record<string, unknown>>(data: T) { ... }
```

## Export Conventions

### Named Exports Only

**Default exports are banned.** Always use named exports:

```typescript
// BAD
export default function calculate() { ... }

// GOOD
export function calculate() { ... }
export { calculate };
```

### Barrel Exports

The main `index.ts` serves as a barrel file exporting all public APIs:

```typescript
export { functionA, functionB, type TypeA } from './module';
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Functions | camelCase | `circlePoints`, `polarToCartesian` |
| Classes | PascalCase | `SimplexNoise2D`, `CirclePacker` |
| Constants | UPPERCASE | `EPSILON`, `DEFAULT_ARC_STEPS`, `PHI` |
| Types/Interfaces | PascalCase | `BoundingBox`, `PolarCoord` |
| Type aliases for literals | PascalCase | `Rotation`, `TileType` |
| Private members | camelCase (no underscore) | `points`, `noise` |

## Immutability Patterns

### Use `readonly` for Arrays and Objects

```typescript
// Function parameters
function process(points: readonly p5.Vector[]): readonly p5.Vector[] {
  return points.map(p => p.copy());
}

// Class properties
class Spline {
  readonly points: readonly p5.Vector[];
}
```

### Use `as const` for Literal Types

```typescript
const TILE_TYPES = ['diagonal', 'curve', 'triangle'] as const;
type TileType = typeof TILE_TYPES[number];

const DEFAULT_CONFIG = {
  steps: 10,
  closed: false,
} as const;
```

### Prefer Immutable Array Methods

Use ES2023 immutable array methods:

```typescript
// BAD - mutates array
array.sort();
array.reverse();
array.splice(1, 1);

// GOOD - returns new array
array.toSorted();
array.toReversed();
array.toSpliced(1, 1);
```

## Documentation Standards

### JSDoc Requirements

All exported functions and classes must have JSDoc comments:

```typescript
/**
 * Calculates the circumference of a circle.
 *
 * @param radius - The radius of the circle (must be positive)
 * @returns The circumference (2 * PI * radius)
 *
 * @example
 * ```typescript
 * const c = circumference(5);
 * // c = 31.4159...
 * ```
 */
export function circumference(radius: number): number {
  return TWO_PI * radius;
}
```

### Required JSDoc Elements

- **Description** - What the function does
- **@param** - Each parameter with type and description
- **@returns** - Return value description
- **@example** - Usage example with expected output

## File Organization

### Maximum File Size

**Max 250 lines per file.** If a file exceeds this limit, refactor into smaller modules.

### File Structure Template

```typescript
/**
 * Module description
 */

// 1. Imports
import { dependency } from './dependency';

// 2. Constants
const EPSILON = 1e-9;
const DEFAULT_STEPS = 40;

// 3. Type definitions
export type Config = {
  readonly option1?: number;
  readonly option2?: boolean;
};

// 4. Helper functions (private)
function helperFunction() { ... }

// 5. Main exports
export function mainFunction() { ... }

// 6. Classes
export class MainClass { ... }
```

### Section Comments

Use section dividers for logical groupings:

```typescript
// ============================================================
// Circle Calculations
// ============================================================

export function circumference(r: number): number { ... }
export function area(r: number): number { ... }

// ============================================================
// Coordinate Conversion
// ============================================================

export function polarToCartesian(...) { ... }
```

## Error Handling

### Epsilon Values for Floating-Point

Use epsilon values for floating-point comparisons:

```typescript
const EPSILON = 1e-9;

function areEqual(a: number, b: number): boolean {
  return Math.abs(a - b) < EPSILON;
}

function isZero(value: number): boolean {
  return Math.abs(value) < EPSILON;
}
```

### Null Handling

Functions that may not produce a result should return `null`:

```typescript
/**
 * Finds the circumcenter of three points.
 * @returns The circumcenter, or null if points are collinear
 */
export function circumcenter(
  p1: p5.Vector,
  p2: p5.Vector,
  p3: p5.Vector
): p5.Vector | null {
  // ...
}
```

### No Silent Failures

Never use empty catch blocks:

```typescript
// BAD
try {
  riskyOperation();
} catch {}

// GOOD
try {
  riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  throw error;
}
```

## Function Design

### Pure Functions

Prefer pure functions with no side effects:

```typescript
// BAD - modifies input
function normalize(vec: p5.Vector): void {
  vec.normalize();
}

// GOOD - returns new value
function normalize(vec: p5.Vector): p5.Vector {
  return vec.copy().normalize();
}
```

### Maximum 5 Parameters

If a function needs more than 5 parameters, use a configuration object:

```typescript
// BAD
function createSpline(
  points: p5.Vector[],
  tension: number,
  closed: boolean,
  resolution: number,
  alpha: number,
  debug: boolean
) { ... }

// GOOD
type SplineConfig = {
  readonly points: readonly p5.Vector[];
  readonly tension?: number;
  readonly closed?: boolean;
  readonly resolution?: number;
  readonly alpha?: number;
};

function createSpline(config: SplineConfig) { ... }
```

### Discriminated Unions for Options

Use discriminated unions when options are mutually exclusive:

```typescript
type LerpOptions =
  | { readonly steps: number }
  | { readonly pixelsPerStep: number };

function lerpLine(
  start: p5.Vector,
  end: p5.Vector,
  options: LerpOptions
): p5.Vector[] { ... }
```

## Testing Standards

### Test File Naming

- Unit tests: `*.test.ts` colocated with source
- Visual tests: `*.sketch.ts` in `visual-tests/sketches/`

### Test Structure

```typescript
import { describe, test, expect } from 'bun:test';
import { functionUnderTest } from './module';

describe('functionUnderTest', () => {
  test('describes expected behavior', () => {
    const result = functionUnderTest(input);
    expect(result).toBe(expected);
  });

  test('handles edge case', () => {
    // ...
  });
});
```

## Async Patterns

### Prefer `await` Over `.then()`

```typescript
// BAD
fetchData().then(data => processData(data));

// GOOD
const data = await fetchData();
processData(data);
```

## Comments

### When to Comment

- **Complex algorithms** - Explain the approach, cite sources
- **Non-obvious behavior** - Explain why, not what
- **Performance optimizations** - Document trade-offs

### Citation Comments

Reference academic sources for algorithms:

```typescript
/**
 * Welzl's algorithm for smallest enclosing circle.
 * Time complexity: O(n) expected.
 *
 * @see https://en.wikipedia.org/wiki/Smallest-circle_problem
 */
```

## Code Quality Tools

### Linting (oxlint)

```bash
bun run lint        # Check for issues
bun run lint:fix    # Auto-fix issues
```

Key rules enforced:
- `eqeqeq`: Use strict equality (`===`)
- `no-var`: Use `const` or `let`
- `prefer-const`: Use `const` when possible

### Formatting (oxfmt)

```bash
bun run format        # Format code
bun run format:check  # Check formatting
```

### Combined Check

```bash
bun run check  # Runs format:check, lint, and tsc --noEmit
```

## Git Workflow

### Commit Messages

Use conventional commit format:

```
feat: add Penrose tiling L-System implementation
fix: correct circle intersection calculation
refactor: improve Poisson-disc sampling efficiency
docs: update API reference for circle utilities
test: add visual tests for Truchet tiling
```

### No TODOs in Merged Code

TODOs must reference a real issue/ticket, otherwise fix before merge.
