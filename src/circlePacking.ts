/// <reference path="../node_modules/@types/p5/global.d.ts" />
/**
 * Circle Packing algorithms for creating visually interesting layouts.
 *
 * Circle packing arranges circles to minimize empty space while avoiding overlaps.
 * This implementation includes multiple strategies:
 *
 * 1. Random placement with collision detection
 * 2. Grid-based seeding with growth
 * 3. Physics-based packing with forces
 * 4. Poisson-disc sampling based placement
 *
 * Uses:
 * - Generative art and data visualization
 * - Procedural content generation
 * - Organic pattern creation
 * - Space-filling layouts
 *
 * All core functions are pure and return new values without mutation.
 * The PackedCircle class maintains mutable state for animation purposes.
 */

// ============================================================================
// Type Definitions
// ============================================================================

/** Boundary constraint type */
export type BoundaryType = 'rectangle' | 'circle' | 'none';

/** Size distribution strategy */
export type SizeDistribution = 'uniform' | 'gaussian' | 'power' | 'custom';

/** Packing strategy */
export type PackingStrategy = 'random' | 'grid' | 'physics' | 'poisson';

/** Rectangular bounds */
export type RectBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

/** Circular bounds */
export type CircleBounds = {
  readonly center: p5.Vector;
  readonly radius: number;
};

/** Circle packer configuration */
export type CirclePackerConfig = {
  // Boundary settings
  readonly boundaryType?: BoundaryType;
  readonly rectBounds?: RectBounds;
  readonly circleBounds?: CircleBounds;

  // Circle settings
  readonly minRadius?: number;
  readonly maxRadius?: number;
  readonly growthRate?: number;

  // Size distribution
  readonly sizeDistribution?: SizeDistribution;
  readonly distributionMean?: number;
  readonly distributionSD?: number;
  readonly powerLawExponent?: number;
  readonly customSizeFunction?: () => number;

  // Packing strategy
  readonly strategy?: PackingStrategy;
  readonly maxAttempts?: number;
  readonly gridSpacing?: number;

  // Physics settings
  readonly separation?: number;
  readonly separationForce?: number;
  readonly boundaryForce?: number;

  // Animation settings
  readonly circlesPerFrame?: number;

  // Random seed for reproducibility
  readonly seed?: number;
};

/** Packing statistics */
export type PackingStats = {
  readonly circleCount: number;
  readonly totalArea: number;
  readonly boundaryArea: number;
  readonly efficiency: number;
  readonly complete: boolean;
  readonly attempts: number;
};

/** Circle data for external use */
export type CircleData = {
  readonly x: number;
  readonly y: number;
  readonly radius: number;
};

// ============================================================================
// Seeded Random Number Generator
// ============================================================================

/**
 * Mulberry32 seeded random number generator.
 * Produces deterministic pseudo-random numbers from a seed.
 */
class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  /**
   * Get next random number in range [0, 1).
   */
  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Get random number in range [min, max).
   */
  nextBetween(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Get random Gaussian using Box-Muller transform.
   */
  nextGaussian(mean: number, sd: number): number {
    const u1 = this.next();
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * sd;
  }
}

// ============================================================================
// Packed Circle Class
// ============================================================================

/**
 * A circle in a packing with position, radius, and optional growth state.
 */
export class PackedCircle {
  pos: p5.Vector;
  radius: number;
  growing: boolean;
  velocity: p5.Vector;
  maxRadius: number;

  /**
   * Create a new packed circle.
   * @param x - X position
   * @param y - Y position
   * @param radius - Initial radius
   */
  constructor(x: number, y: number, radius: number) {
    this.pos = createVector(x, y);
    this.radius = radius;
    this.growing = true;
    this.velocity = createVector(0, 0);
    this.maxRadius = radius;
  }

  /**
   * Attempt to grow the circle.
   * @param growthRate - Amount to grow per step
   */
  grow(growthRate = 0.5): void {
    if (this.growing && this.radius < this.maxRadius) {
      this.radius += growthRate;
    }
  }

  /**
   * Stop growing (called when collision detected).
   */
  stopGrowing(): void {
    this.growing = false;
  }

  /**
   * Check if this circle overlaps with another.
   * @param other - Circle to check against
   * @returns True if circles overlap
   */
  overlaps(other: PackedCircle): boolean {
    const d = p5.Vector.dist(this.pos, other.pos);
    return d < this.radius + other.radius;
  }

  /**
   * Check if this circle overlaps with any in an array.
   * @param circles - Array of circles to check
   * @returns True if any overlap detected
   */
  overlapsAny(circles: readonly PackedCircle[]): boolean {
    for (const other of circles) {
      if (other !== this && this.overlaps(other)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if circle is within rectangular bounds.
   * @param bounds - Rectangle bounds
   * @returns True if completely contained
   */
  isInRectBounds(bounds: RectBounds): boolean {
    return (
      this.pos.x - this.radius >= bounds.x &&
      this.pos.x + this.radius <= bounds.x + bounds.width &&
      this.pos.y - this.radius >= bounds.y &&
      this.pos.y + this.radius <= bounds.y + bounds.height
    );
  }

  /**
   * Check if circle is within circular bounds.
   * @param bounds - Circle bounds
   * @returns True if contained
   */
  isInCircleBounds(bounds: CircleBounds): boolean {
    const d = p5.Vector.dist(this.pos, bounds.center);
    return d + this.radius <= bounds.radius;
  }

  /**
   * Apply force for physics simulation.
   * @param force - Force vector
   */
  applyForce(force: p5.Vector): void {
    this.velocity.add(force);
  }

  /**
   * Update position based on velocity.
   * @param damping - Velocity damping factor
   */
  updatePhysics(damping = 0.95): void {
    this.pos.add(this.velocity);
    this.velocity.mult(damping);
  }

  /**
   * Get circle data as a plain object.
   * @returns Circle data
   */
  toData(): CircleData {
    return {
      x: this.pos.x,
      y: this.pos.y,
      radius: this.radius,
    };
  }
}

// ============================================================================
// Circle Packer Class
// ============================================================================

/**
 * Circle packer that generates packed circle layouts.
 */
export class CirclePacker {
  private readonly config: Required<
    Omit<CirclePackerConfig, 'customSizeFunction' | 'rectBounds' | 'circleBounds'>
  > & {
    customSizeFunction?: () => number;
    rectBounds: RectBounds;
    circleBounds?: CircleBounds;
  };
  private _circles: PackedCircle[];
  private _complete: boolean;
  private totalAttempts: number;
  private activeList: PackedCircle[] | null;
  private rng: SeededRandom;

  /**
   * Create a new circle packer.
   * @param config - Configuration options
   */
  constructor(config: CirclePackerConfig = {}) {
    // Default bounds to canvas or reasonable defaults
    const defaultRect: RectBounds = config.rectBounds ?? { x: 0, y: 0, width: 800, height: 600 };

    this.config = {
      boundaryType: config.boundaryType ?? 'rectangle',
      rectBounds: defaultRect,
      circleBounds: config.circleBounds,
      minRadius: config.minRadius ?? 2,
      maxRadius: config.maxRadius ?? 100,
      growthRate: config.growthRate ?? 0.5,
      sizeDistribution: config.sizeDistribution ?? 'uniform',
      distributionMean: config.distributionMean ?? 30,
      distributionSD: config.distributionSD ?? 10,
      powerLawExponent: config.powerLawExponent ?? 2,
      customSizeFunction: config.customSizeFunction,
      strategy: config.strategy ?? 'random',
      maxAttempts: config.maxAttempts ?? 1000,
      gridSpacing: config.gridSpacing ?? 20,
      separation: config.separation ?? 5,
      separationForce: config.separationForce ?? 0.1,
      boundaryForce: config.boundaryForce ?? 0.2,
      circlesPerFrame: config.circlesPerFrame ?? 1,
      seed: config.seed ?? Date.now(),
    };

    this._circles = [];
    this._complete = false;
    this.totalAttempts = 0;
    this.activeList = null;
    this.rng = new SeededRandom(this.config.seed);
  }

  /**
   * Get the current circles.
   */
  get circles(): readonly PackedCircle[] {
    return this._circles;
  }

  /**
   * Check if packing is complete.
   */
  get isComplete(): boolean {
    return this._complete;
  }

  /**
   * Generate a random radius based on size distribution.
   */
  private generateRadius(): number {
    const { sizeDistribution, minRadius, maxRadius } = this.config;

    if (this.config.customSizeFunction) {
      const r = this.config.customSizeFunction();
      return Math.max(minRadius, Math.min(maxRadius, r));
    }

    switch (sizeDistribution) {
      case 'uniform':
        return this.rng.nextBetween(minRadius, maxRadius);

      case 'gaussian': {
        const r = this.rng.nextGaussian(this.config.distributionMean, this.config.distributionSD);
        return Math.max(minRadius, Math.min(maxRadius, r));
      }

      case 'power': {
        const u = this.rng.next();
        const exp = this.config.powerLawExponent;
        const normalized = Math.pow(u, 1 / exp);
        return minRadius + normalized * (maxRadius - minRadius);
      }

      default:
        return this.rng.nextBetween(minRadius, maxRadius);
    }
  }

  /**
   * Generate random position within boundaries.
   */
  private generateRandomPosition(): p5.Vector {
    if (this.config.boundaryType === 'circle' && this.config.circleBounds) {
      const angle = this.rng.nextBetween(0, TWO_PI);
      const r = this.rng.next() * this.config.circleBounds.radius;
      const x = this.config.circleBounds.center.x + r * Math.cos(angle);
      const y = this.config.circleBounds.center.y + r * Math.sin(angle);
      return createVector(x, y);
    } else {
      const { x, y, width, height } = this.config.rectBounds;
      return createVector(this.rng.nextBetween(x, x + width), this.rng.nextBetween(y, y + height));
    }
  }

  /**
   * Check if position is valid within bounds.
   */
  private isValidPosition(pos: p5.Vector, radius: number): boolean {
    if (this.config.boundaryType === 'rectangle') {
      const { x, y, width, height } = this.config.rectBounds;
      return (
        pos.x - radius >= x &&
        pos.x + radius <= x + width &&
        pos.y - radius >= y &&
        pos.y + radius <= y + height
      );
    } else if (this.config.boundaryType === 'circle' && this.config.circleBounds) {
      const d = p5.Vector.dist(pos, this.config.circleBounds.center);
      return d + radius <= this.config.circleBounds.radius;
    }
    return true;
  }

  /**
   * Random placement strategy.
   */
  private packRandom(): boolean {
    const newCircle = this.tryPlaceCircle();
    if (newCircle) {
      this._circles.push(newCircle);
      return true;
    }
    return false;
  }

  /**
   * Try to place a single circle.
   */
  private tryPlaceCircle(): PackedCircle | null {
    for (let i = 0; i < this.config.maxAttempts; i++) {
      this.totalAttempts++;

      const radius = this.generateRadius();
      const pos = this.generateRandomPosition();

      if (!this.isValidPosition(pos, radius)) {
        continue;
      }

      const newCircle = new PackedCircle(pos.x, pos.y, radius);

      if (!newCircle.overlapsAny(this._circles)) {
        return newCircle;
      }
    }

    this._complete = true;
    return null;
  }

  /**
   * Grid-based placement with growth.
   */
  private packGrid(): void {
    if (this._circles.length === 0) {
      this.initializeGrid();
    }

    let anyGrowing = false;
    for (const circle of this._circles) {
      if (circle.growing) {
        circle.grow(this.config.growthRate);

        let inBounds = true;
        if (this.config.boundaryType === 'rectangle') {
          inBounds = circle.isInRectBounds(this.config.rectBounds);
        } else if (this.config.boundaryType === 'circle' && this.config.circleBounds) {
          inBounds = circle.isInCircleBounds(this.config.circleBounds);
        }

        if (!inBounds || circle.overlapsAny(this._circles)) {
          circle.radius -= this.config.growthRate;
          circle.stopGrowing();
        } else {
          anyGrowing = true;
        }
      }
    }

    if (!anyGrowing) {
      this._complete = true;
    }
  }

  /**
   * Initialize grid of circles.
   */
  private initializeGrid(): void {
    const spacing = this.config.gridSpacing;
    const startRadius = 1;

    if (this.config.boundaryType === 'circle' && this.config.circleBounds) {
      const { center, radius: maxR } = this.config.circleBounds;

      for (let x = center.x - maxR; x <= center.x + maxR; x += spacing) {
        for (let y = center.y - maxR; y <= center.y + maxR; y += spacing) {
          const newCircle = new PackedCircle(x, y, startRadius);
          newCircle.maxRadius = this.generateRadius();

          if (newCircle.isInCircleBounds(this.config.circleBounds)) {
            this._circles.push(newCircle);
          }
        }
      }
    } else {
      const { x: bx, y: by, width, height } = this.config.rectBounds;

      for (let x = bx; x < bx + width; x += spacing) {
        for (let y = by; y < by + height; y += spacing) {
          const newCircle = new PackedCircle(x, y, startRadius);
          newCircle.maxRadius = this.generateRadius();
          this._circles.push(newCircle);
        }
      }
    }
  }

  /**
   * Physics-based packing with forces.
   */
  private packPhysics(): void {
    if (this._circles.length === 0 || this.rng.next() < 0.1) {
      const newCircle = this.tryPlaceCircle();
      if (newCircle) {
        newCircle.maxRadius = newCircle.radius;
        this._circles.push(newCircle);
      }
    }

    for (let i = 0; i < this._circles.length; i++) {
      const circle = this._circles[i];
      if (!circle) continue;

      // Separation force
      for (let j = 0; j < this._circles.length; j++) {
        if (i === j) continue;

        const other = this._circles[j];
        if (!other) continue;

        const force = p5.Vector.sub(circle.pos, other.pos);
        const d = force.mag();
        const minDist = circle.radius + other.radius + this.config.separation;

        if (d < minDist && d > 0) {
          force.normalize();
          const strength = (minDist - d) * this.config.separationForce;
          force.mult(strength);
          circle.applyForce(force);
        }
      }

      // Boundary force
      if (this.config.boundaryType === 'rectangle') {
        const { x, y, width, height } = this.config.rectBounds;
        const margin = circle.radius;

        if (circle.pos.x < x + margin) {
          circle.applyForce(createVector(this.config.boundaryForce, 0));
        }
        if (circle.pos.x > x + width - margin) {
          circle.applyForce(createVector(-this.config.boundaryForce, 0));
        }
        if (circle.pos.y < y + margin) {
          circle.applyForce(createVector(0, this.config.boundaryForce));
        }
        if (circle.pos.y > y + height - margin) {
          circle.applyForce(createVector(0, -this.config.boundaryForce));
        }
      } else if (this.config.boundaryType === 'circle' && this.config.circleBounds) {
        const toCenter = p5.Vector.sub(this.config.circleBounds.center, circle.pos);
        const d = toCenter.mag();
        const maxDist = this.config.circleBounds.radius - circle.radius;

        if (d > maxDist) {
          toCenter.normalize();
          toCenter.mult(this.config.boundaryForce);
          circle.applyForce(toCenter);
        }
      }

      circle.updatePhysics();
    }
  }

  /**
   * Poisson disk sampling based packing.
   */
  private packPoisson(): void {
    if (this._circles.length === 0) {
      const pos = this.generateRandomPosition();
      const radius = this.generateRadius();
      const firstCircle = new PackedCircle(pos.x, pos.y, radius);
      this._circles.push(firstCircle);
      this.activeList = [firstCircle];
      return;
    }

    if (this.activeList && this.activeList.length > 0) {
      const index = Math.floor(this.rng.next() * this.activeList.length);
      const activeCircle = this.activeList[index];
      if (!activeCircle) {
        this._complete = true;
        return;
      }

      let placed = false;
      for (let i = 0; i < 30; i++) {
        const angle = this.rng.nextBetween(0, TWO_PI);
        const radius = this.generateRadius();
        const distance = activeCircle.radius + radius + this.config.separation;

        const x = activeCircle.pos.x + distance * Math.cos(angle);
        const y = activeCircle.pos.y + distance * Math.sin(angle);
        const pos = createVector(x, y);

        if (this.isValidPosition(pos, radius)) {
          const newCircle = new PackedCircle(x, y, radius);

          if (!newCircle.overlapsAny(this._circles)) {
            this._circles.push(newCircle);
            this.activeList.push(newCircle);
            placed = true;
            break;
          }
        }
      }

      if (!placed) {
        this.activeList.splice(index, 1);
      }
    } else {
      this._complete = true;
    }
  }

  /**
   * Update the packing (add circles incrementally).
   */
  update(): void {
    if (this._complete) return;

    const count = this.config.circlesPerFrame;

    for (let i = 0; i < count; i++) {
      switch (this.config.strategy) {
        case 'random':
          if (!this.packRandom()) return;
          break;

        case 'grid':
          this.packGrid();
          return;

        case 'physics':
          this.packPhysics();
          break;

        case 'poisson':
          this.packPoisson();
          break;
      }
    }
  }

  /**
   * Reset the packer to initial state.
   */
  reset(): void {
    this._circles = [];
    this._complete = false;
    this.totalAttempts = 0;
    this.activeList = null;
    this.rng = new SeededRandom(this.config.seed);
  }

  /**
   * Get statistics about the packing.
   */
  getStats(): PackingStats {
    const totalArea = this._circles.reduce((sum, c) => sum + PI * c.radius * c.radius, 0);

    let boundaryArea: number;
    if (this.config.boundaryType === 'circle' && this.config.circleBounds) {
      boundaryArea = PI * this.config.circleBounds.radius * this.config.circleBounds.radius;
    } else {
      boundaryArea = this.config.rectBounds.width * this.config.rectBounds.height;
    }

    return {
      circleCount: this._circles.length,
      totalArea,
      boundaryArea,
      efficiency: (totalArea / boundaryArea) * 100,
      complete: this._complete,
      attempts: this.totalAttempts,
    };
  }

  /**
   * Get all circles as plain data objects.
   */
  getCircleData(): CircleData[] {
    return this._circles.map((c) => c.toData());
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if two circles overlap.
 * @param x1 - First circle center X
 * @param y1 - First circle center Y
 * @param r1 - First circle radius
 * @param x2 - Second circle center X
 * @param y2 - Second circle center Y
 * @param r2 - Second circle radius
 * @returns True if overlapping
 */
export function circlesOverlap(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number,
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.sqrt(dx * dx + dy * dy);
  return d < r1 + r2;
}

/**
 * Pack circles quickly (non-animated).
 * @param config - Configuration options
 * @param maxCircles - Maximum number of circles to pack
 * @returns Array of circle data
 */
export function quickPack(config: CirclePackerConfig = {}, maxCircles = 10000): CircleData[] {
  const packer = new CirclePacker({
    ...config,
    circlesPerFrame: 100,
  });

  while (!packer.isComplete && packer.circles.length < maxCircles) {
    packer.update();
  }

  return packer.getCircleData();
}
