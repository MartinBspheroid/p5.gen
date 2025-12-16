/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * PENROSE TILING ALGORITHMS
 *
 * Implementation of Roger Penrose's aperiodic tilings.
 * These create beautiful, infinitely complex patterns that never repeat exactly.
 *
 * SUPPORTED VARIANTS:
 *
 * P3 (Rhombus) - L-System Approach:
 * - Uses L-System (Lindenmayer System) with production rules for W, X, Y, Z
 * - Applies iterative string substitution to generate a complex pattern
 * - Renders using turtle graphics (forward, rotate, push/pop stack)
 * - Creates distinctive rhombus tiling pattern (fat and skinny rhombi)
 *
 * P2 (Kite and Dart) - Deflation/Subdivision Approach:
 * - Uses Robinson triangles (half-kites and half-darts)
 * - Applies geometric subdivision rules to recursively split triangles
 * - Kites have angles: 72°, 72°, 72°, 144°
 * - Darts have angles: 36°, 72°, 36°, 216°
 * - Ratio of kites to darts approaches φ (golden ratio)
 *
 * MATHEMATICAL PROPERTIES:
 * - Golden ratio φ = (1 + √5) / 2 ≈ 1.618
 * - Theta: π/5 radians (36 degrees)
 * - Non-periodic: pattern never repeats, yet maintains local order
 */

/**
 * Golden ratio constant - fundamental to Penrose tiling proportions
 */
export const PHI = (1 + Math.sqrt(5)) / 2;

/**
 * Supported Penrose tiling variants
 */
export type PenroseVariant = 'rhombus' | 'kite-dart';

/**
 * 2D point representation for geometric calculations
 */
export type Point2D = {
  readonly x: number;
  readonly y: number;
};

/**
 * Triangle type for Robinson triangle decomposition
 * - 0: "Thin" triangle (36-72-72 degrees) - half of a dart
 * - 1: "Fat" triangle (36-36-108 degrees) - half of a kite
 */
export type RobinsonTriangleType = 0 | 1;

/**
 * Robinson triangle - the fundamental unit for P2 tiling deflation
 */
export type RobinsonTriangle = {
  readonly type: RobinsonTriangleType;
  readonly a: Point2D;
  readonly b: Point2D;
  readonly c: Point2D;
};

/**
 * Configuration options for Penrose tiling generation
 */
export type PenroseConfig = {
  readonly variant?: PenroseVariant;
  readonly generations?: number;
  readonly startLength?: number;
  readonly renderSteps?: number;
};

/**
 * Configuration options specific to Kite-Dart variant
 */
export type KiteDartConfig = {
  readonly generations?: number;
  readonly scale?: number;
};

/**
 * Penrose L-System generator using turtle graphics
 */
export class PenroseLSystem {
  private axiom: string = '';
  private ruleW: string = '';
  private ruleX: string = '';
  private ruleY: string = '';
  private ruleZ: string = '';
  private production: string = '';
  private generations: number = 0;
  private drawLength: number = 0;
  private startLength: number = 0;
  private theta: number = 0;
  private steps: number = 0;
  private repeats: number = 1;

  constructor(config: PenroseConfig = {}) {
    this.axiom = '[X]++[X]++[X]++[X]++[X]';
    this.ruleW = 'YF++ZF----XF[-YF----WF]++';
    this.ruleX = '+YF--ZF[---WF--XF]+';
    this.ruleY = '-WF++XF[+++YF++ZF]-';
    this.ruleZ = '--YF++++WF[+ZF++++XF]--XF';

    this.startLength = config.startLength ?? 460;
    this.theta = Math.PI / 5; // 36 degrees
    this.steps = 0;
    this.repeats = 1;

    this.reset();

    if (config.generations !== undefined) {
      this.simulate(config.generations);
    }
  }

  /**
   * Reset the L-system to initial state
   */
  reset(): void {
    this.production = this.axiom;
    this.drawLength = this.startLength;
    this.generations = 0;
  }

  /**
   * Get current generation count
   */
  getAge(): number {
    return this.generations;
  }

  /**
   * Get the production string
   */
  getProduction(): string {
    return this.production;
  }

  /**
   * Iterate the L-system by applying substitution rules
   */
  iterate(): void {
    let newProduction = '';

    for (let i = 0; i < this.production.length; i++) {
      const step = this.production.charAt(i);

      if (step === 'W') {
        newProduction += this.ruleW;
      } else if (step === 'X') {
        newProduction += this.ruleX;
      } else if (step === 'Y') {
        newProduction += this.ruleY;
      } else if (step === 'Z') {
        newProduction += this.ruleZ;
      } else if (step !== 'F') {
        // Keep all non-F characters
        newProduction += step;
      }
    }

    this.drawLength *= 0.5;
    this.generations++;
    this.production = newProduction;
  }

  /**
   * Run simulation for specified number of generations
   */
  simulate(gen: number): void {
    while (this.getAge() < gen) {
      this.iterate();
    }
  }

  /**
   * Execute rendering commands using turtle graphics
   * This method processes the L-system production string and returns render operations
   */
  getRenderCommands(): Array<{ type: string; [key: string]: unknown }> {
    const commands: Array<{ type: string; [key: string]: unknown }> = [];
    const stack: Array<{ x: number; y: number; angle: number }> = [];

    let x = 0;
    let y = 0;
    let angle = 0;

    for (let i = 0; i < this.production.length; i++) {
      const step = this.production.charAt(i);

      if (step === 'F') {
        const nextX = x + this.drawLength * Math.cos(angle);
        const nextY = y - this.drawLength * Math.sin(angle);
        commands.push({ type: 'line', x1: x, y1: y, x2: nextX, y2: nextY });
        x = nextX;
        y = nextY;
      } else if (step === '+') {
        angle += this.theta;
      } else if (step === '-') {
        angle -= this.theta;
      } else if (step === '[') {
        stack.push({ x, y, angle });
      } else if (step === ']') {
        const state = stack.pop();
        if (state) {
          x = state.x;
          y = state.y;
          angle = state.angle;
        }
      }
    }

    return commands;
  }

  /**
   * Render the current state using p5.js (when available)
   */
  render(): void {
    try {
      // Access p5 functions from global scope (if available)
      const g = typeof globalThis !== 'undefined' ? (globalThis as any) : {};

      // Only proceed if p5 functions are available
      if (typeof g.push !== 'function' || typeof g.line !== 'function') {
        return;
      }

      g.push();
      if (typeof g.width === 'number' && typeof g.height === 'number') {
        g.translate(g.width / 2, g.height / 2);
      }

      const commands = this.getRenderCommands();

      g.stroke(255, 100);
      g.strokeWeight(0.5);
      if (typeof g.noFill === 'function') {
        g.noFill();
      }

      for (const cmd of commands) {
        if (cmd.type === 'line') {
          g.line(cmd.x1, cmd.y1, cmd.x2, cmd.y2);
        }
      }

      g.pop();
    } catch {
      // Silently fail if p5 is not available
    }
  }
}

/**
 * Penrose Kite-Dart generator using Robinson triangle deflation
 *
 * P2 (Kite and Dart) variant using geometric subdivision.
 * Creates tilings with kite and dart quadrilaterals where:
 * - Kite angles: 72°, 72°, 72°, 144°
 * - Dart angles: 36°, 72°, 36°, 216°
 *
 * Triangle labeling convention:
 * - Type 0 (red/thin): Golden gnomon - half of a dart
 *   - Angles: 36° at vertex A (apex), 36° at B, 108° at C
 * - Type 1 (blue/fat): Golden triangle - half of a kite
 *   - Angles: 36° at vertex A (apex), 72° at B, 72° at C
 *
 * In both cases, A is the "apex" where the two equal-length edges meet.
 * B and C are the base vertices.
 */
export class PenroseKiteDart {
  private triangles: RobinsonTriangle[] = [];
  private generationCount: number = 0;
  private readonly scale: number;

  constructor(config: KiteDartConfig = {}) {
    this.scale = config.scale ?? 200;
    this.initializeSun();

    if (config.generations !== undefined && config.generations > 0) {
      this.simulate(config.generations);
    }
  }

  /**
   * Initialize with "sun" configuration - 10 triangles forming a decagon
   * This creates 5 kites radiating from the center (a "sun" pattern).
   *
   * Golden Triangle (Fat/Type 1) properties:
   * - Vertex angles: 36° at apex (A), 72° at base vertices (B, C)
   * - Two equal sides AB and AC, shorter base BC
   *
   * In the sun configuration:
   * - The 36° apex of each fat triangle is at the CENTER
   * - The 72° base vertices are on a surrounding circle
   * - 10 triangles fill the full 360° around center (36° × 10 = 360°)
   * - Each pair of adjacent triangles forms a complete kite
   */
  initializeSun(): void {
    this.triangles = [];
    this.generationCount = 0;

    const center: Point2D = { x: 0, y: 0 };

    // Create 10 fat triangles (type 1) arranged in a sun pattern
    // The apex (vertex A with 36° angle) is at the center
    // The base vertices (B and C with 72° angles) are on the circle
    for (let i = 0; i < 10; i++) {
      // Angles for the two base vertices on the circle
      // Each triangle spans 36° (one tenth of the full circle)
      const angle1 = (i * 2 * Math.PI) / 10;
      const angle2 = ((i + 1) * 2 * Math.PI) / 10;

      // Base vertices on the outer circle
      const p1: Point2D = {
        x: this.scale * Math.cos(angle1),
        y: this.scale * Math.sin(angle1),
      };
      const p2: Point2D = {
        x: this.scale * Math.cos(angle2),
        y: this.scale * Math.sin(angle2),
      };

      // Fat triangle: apex at center (36° angle), base on circle (72° angles)
      // Alternate the vertex ordering to ensure proper matching at edges
      if (i % 2 === 0) {
        this.triangles.push({ type: 1, a: center, b: p1, c: p2 });
      } else {
        this.triangles.push({ type: 1, a: center, b: p2, c: p1 });
      }
    }
  }

  /**
   * Get current generation count
   */
  getAge(): number {
    return this.generationCount;
  }

  /**
   * Subdivide a single triangle according to deflation rules
   *
   * For P2 Penrose tiling using Robinson triangles:
   *
   * Type 0 (thin/half-dart): Acute isosceles with 36° apex
   *   - Splits into 2 triangles: 1 fat + 1 thin
   *   - P = B + (A-B) / φ (point on edge BA, closer to A)
   *
   * Type 1 (fat/half-kite): Obtuse isosceles with 108° at apex
   *   - Actually uses the golden triangle (36° apex for kite halves)
   *   - Splits into 3 triangles: 1 thin + 2 fat
   *   - Q = A + (B-A) / φ (point on edge AB, closer to B)
   *   - R = B + (C-B) / φ (point on edge BC, closer to C)
   *
   * These rules preserve the golden ratio proportions and ensure
   * proper tiling as generations increase.
   */
  private subdivideTriangle(tri: RobinsonTriangle): RobinsonTriangle[] {
    const { type, a, b, c } = tri;

    if (type === 0) {
      // Thin triangle (half-dart)
      // Point P on edge BA at golden ratio from B toward A
      const p: Point2D = {
        x: b.x + (a.x - b.x) / PHI,
        y: b.y + (a.y - b.y) / PHI,
      };

      return [
        { type: 1, a: c, b: a, c: p }, // Fat triangle
        { type: 0, a: p, b: c, c: b }, // Thin triangle
      ];
    } else {
      // Fat triangle (half-kite)
      // Point Q on edge AB at golden ratio from A toward B
      const q: Point2D = {
        x: a.x + (b.x - a.x) / PHI,
        y: a.y + (b.y - a.y) / PHI,
      };

      // Point R on edge BC at golden ratio from B toward C
      const r: Point2D = {
        x: b.x + (c.x - b.x) / PHI,
        y: b.y + (c.y - b.y) / PHI,
      };

      return [
        { type: 0, a: q, b: r, c: a }, // Thin triangle
        { type: 1, a: r, b: q, c: b }, // Fat triangle
        { type: 1, a: c, b: a, c: r }, // Fat triangle
      ];
    }
  }

  /**
   * Apply one iteration of deflation to all triangles
   */
  deflate(): void {
    const newTriangles: RobinsonTriangle[] = [];

    for (const tri of this.triangles) {
      newTriangles.push(...this.subdivideTriangle(tri));
    }

    this.triangles = newTriangles;
    this.generationCount++;
  }

  /**
   * Run simulation for specified number of generations
   */
  simulate(gen: number): void {
    while (this.getAge() < gen) {
      this.deflate();
    }
  }

  /**
   * Reset to initial sun configuration
   */
  reset(): void {
    this.initializeSun();
  }

  /**
   * Get all triangles
   */
  getTriangles(): readonly RobinsonTriangle[] {
    return this.triangles;
  }

  /**
   * Get triangle count
   */
  getTriangleCount(): number {
    return this.triangles.length;
  }

  /**
   * Get count of thin triangles (half-darts)
   */
  getThinCount(): number {
    return this.triangles.filter((t) => t.type === 0).length;
  }

  /**
   * Get count of fat triangles (half-kites)
   */
  getFatCount(): number {
    return this.triangles.filter((t) => t.type === 1).length;
  }

  /**
   * Get the ratio of fat to thin triangles (approaches φ)
   */
  getFatToThinRatio(): number {
    const thin = this.getThinCount();
    if (thin === 0) return Infinity;
    return this.getFatCount() / thin;
  }

  /**
   * Get render commands for drawing the triangles
   * Returns polygon commands for each triangle
   */
  getRenderCommands(): Array<{
    type: 'triangle';
    triangleType: RobinsonTriangleType;
    vertices: [Point2D, Point2D, Point2D];
  }> {
    return this.triangles.map((tri) => ({
      type: 'triangle' as const,
      triangleType: tri.type,
      vertices: [tri.a, tri.b, tri.c] as [Point2D, Point2D, Point2D],
    }));
  }

  /**
   * Render the current state using p5.js (when available)
   */
  render(): void {
    try {
      const g =
        typeof globalThis !== 'undefined' ? (globalThis as unknown as Record<string, unknown>) : {};

      if (typeof g.push !== 'function' || typeof g.triangle !== 'function') {
        return;
      }

      const push = g.push as () => void;
      const pop = g.pop as () => void;
      const translate = g.translate as (x: number, y: number) => void;
      const stroke = g.stroke as (...args: number[]) => void;
      const strokeWeight = g.strokeWeight as (w: number) => void;
      const fill = g.fill as (...args: number[]) => void;
      const noFill = g.noFill as () => void;
      const triangleFn = g.triangle as (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        x3: number,
        y3: number,
      ) => void;

      push();

      if (typeof g.width === 'number' && typeof g.height === 'number') {
        translate(g.width / 2, g.height / 2);
      }

      stroke(255, 100);
      strokeWeight(0.5);

      for (const tri of this.triangles) {
        // Color based on triangle type
        if (tri.type === 0) {
          fill(100, 150, 200, 80); // Blue-ish for thin (dart)
        } else {
          fill(200, 150, 100, 80); // Orange-ish for fat (kite)
        }

        triangleFn(tri.a.x, tri.a.y, tri.b.x, tri.b.y, tri.c.x, tri.c.y);
      }

      // Draw edges without fill
      noFill();
      stroke(255, 150);
      for (const tri of this.triangles) {
        triangleFn(tri.a.x, tri.a.y, tri.b.x, tri.b.y, tri.c.x, tri.c.y);
      }

      pop();
    } catch {
      // Silently fail if p5 is not available
    }
  }
}

/**
 * Create a Penrose tiling generator with specified configuration
 * @param generations - Number of L-system iterations
 * @param startLength - Initial line segment length
 * @returns Configured PenroseLSystem instance
 *
 * @example
 * const tiling = createPenroseTiling(5, 460);
 * tiling.render();
 */
export function createPenroseTiling(
  generations: number = 5,
  startLength: number = 460,
): PenroseLSystem {
  return new PenroseLSystem({ generations, startLength });
}

/**
 * Create a Penrose tiling from full configuration
 * @param config - Configuration object
 * @returns Configured PenroseLSystem instance
 */
export function createCustomPenroseTiling(config: PenroseConfig): PenroseLSystem {
  return new PenroseLSystem(config);
}

/**
 * Create a P2 (Kite-Dart) Penrose tiling generator
 * @param generations - Number of deflation iterations
 * @param scale - Scale factor for initial sun configuration
 * @returns Configured PenroseKiteDart instance
 *
 * @example
 * const tiling = createKiteDartTiling(5, 200);
 * tiling.render();
 */
export function createKiteDartTiling(
  generations: number = 5,
  scale: number = 200,
): PenroseKiteDart {
  return new PenroseKiteDart({ generations, scale });
}
