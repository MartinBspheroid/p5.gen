/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * PENROSE TILING ALGORITHM (L-SYSTEM APPROACH)
 *
 * Implementation of Roger Penrose's aperiodic tiling using an L-System.
 * This creates beautiful, infinitely complex patterns that never repeat exactly.
 *
 * ALGORITHM OVERVIEW:
 * - Uses L-System (Lindenmayer System) with production rules for W, X, Y, Z
 * - Applies iterative string substitution to generate a complex pattern
 * - Renders using turtle graphics (forward, rotate, push/pop stack)
 * - Each iteration doubles the complexity level
 *
 * L-SYSTEM RULES:
 * - Axiom: "[X]++[X]++[X]++[X]++[X]" (5-fold symmetry)
 * - W → "YF++ZF----XF[-YF----WF]++"
 * - X → "+YF--ZF[---WF--XF]+"
 * - Y → "-WF++XF[+++YF++ZF]-"
 * - Z → "--YF++++WF[+ZF++++XF]--XF"
 *
 * MATHEMATICAL PROPERTIES:
 * - Theta: π/5 radians (36 degrees)
 * - Non-periodic: pattern never repeats, yet maintains local order
 * - Creates distinctive rhombus tiling pattern
 */

/**
 * Configuration options for Penrose tiling generation
 */
export type PenroseConfig = {
  readonly generations?: number;
  readonly startLength?: number;
  readonly renderSteps?: number;
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
