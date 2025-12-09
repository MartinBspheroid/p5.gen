/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * PENROSE TILING ALGORITHM
 *
 * Implementation of Roger Penrose's aperiodic tiling using the kite and dart method.
 * This creates beautiful, infinitely complex patterns that never repeat exactly.
 *
 * ALGORITHM OVERVIEW:
 * - Uses two prototiles: "kite" and "dart" (special quadrilaterals)
 * - Both tiles are composed of Robinson triangles (golden gnomonic triangles)
 * - Employs deflation/subdivision technique: each tile splits into smaller tiles
 * - The subdivision follows strict matching rules that prevent periodicity
 * - Each iteration subdivides tiles by the golden ratio φ (phi)
 *
 * MATHEMATICAL PROPERTIES:
 * - Golden ratio: φ = (1 + √5) / 2 ≈ 1.618033988749
 * - Kite has angles: 72°, 72°, 72°, 144°
 * - Dart has angles: 36°, 72°, 36°, 216°
 * - Both tiles have sides in golden ratio proportions
 * - Non-periodic: pattern never repeats, yet maintains local order
 */

export type RGBAColor = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
};

export type PenroseColorScheme = {
  readonly kite: RGBAColor;
  readonly dart: RGBAColor;
  readonly edge: RGBAColor;
  readonly vertex: RGBAColor;
};

export type PenroseConfig = {
  readonly iterations?: number;
  readonly scale?: number;
  readonly showEdges?: boolean;
  readonly showVertices?: boolean;
  readonly colorTiles?: boolean;
  readonly colors?: PenroseColorScheme;
};

export const enum TileType {
  KITE = 0,
  DART = 1,
}

export type Tile = {
  readonly type: TileType;
  readonly position: p5.Vector;
  readonly angle: number;
  readonly size: number;
};

/**
 * PenroseTiling class - Main controller for generating and rendering Penrose tilings
 *
 * @example
 * const tiling = new PenroseTiling({ iterations: 4, scale: 100 });
 * tiling.generate();
 * tiling.render(200, 200);
 */
export class PenroseTiling {
  private readonly iterations: number;
  private readonly scale: number;
  private readonly showEdges: boolean;
  private readonly showVertices: boolean;
  private readonly colorTiles: boolean;
  private readonly colors: PenroseColorScheme;
  private readonly PHI: number;
  private readonly THETA: number;
  private readonly TILE_KITE: TileType;
  private readonly TILE_DART: TileType;
  private tiles: readonly Tile[];

  /**
   * Create a Penrose tiling generator
   * @param config - Configuration options
   */
  constructor(config: PenroseConfig = {}) {
    // Configuration with defaults
    this.iterations = config.iterations !== undefined ? config.iterations : 5;
    this.scale = config.scale !== undefined ? config.scale : 100;
    this.showEdges = config.showEdges !== undefined ? config.showEdges : true;
    this.showVertices = config.showVertices !== undefined ? config.showVertices : false;
    this.colorTiles = config.colorTiles !== undefined ? config.colorTiles : true;

    // Color scheme
    this.colors = config.colors || {
      kite: { r: 255, g: 200, b: 100, a: 200 },
      dart: { r: 100, g: 180, b: 255, a: 200 },
      edge: { r: 40, g: 40, b: 60, a: 255 },
      vertex: { r: 255, g: 0, b: 0, a: 255 },
    };

    // Mathematical constants
    this.PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio ≈ 1.618033988749
    this.THETA = Math.PI / 5; // 36 degrees in radians

    // Tile types
    this.TILE_KITE = TileType.KITE;
    this.TILE_DART = TileType.DART;

    // Array to store all tiles
    this.tiles = [];
  }

  /**
   * Generate the Penrose tiling with specified iterations
   * Starts with a set of initial tiles arranged in a sun pattern (10-fold symmetry)
   */
  generate(): void {
    const initialTiles: Tile[] = [];

    // Create initial sun pattern with 10 kites arranged radially
    // This provides 10-fold rotational symmetry as a starting point
    const numInitialTiles = 10;
    for (let i = 0; i < numInitialTiles; i++) {
      const angle = ((Math.PI * 2) / numInitialTiles) * i;
      initialTiles.push({
        type: this.TILE_KITE,
        position: createVector(0, 0),
        angle: angle,
        size: this.scale,
      });
    }

    this.tiles = initialTiles;

    // Perform deflation iterations
    // Each iteration subdivides all tiles into smaller tiles
    for (let i = 0; i < this.iterations; i++) {
      this.deflate();
    }
  }

  /**
   * Deflation step: subdivide all tiles according to Penrose rules
   *
   * DEFLATION RULES:
   *
   * KITE subdivides into:
   *   - 2 smaller kites (at specific positions)
   *   - 1 smaller dart
   *
   * DART subdivides into:
   *   - 1 smaller kite
   *   - 1 smaller dart
   *
   * Each subdivision scales by 1/φ, maintaining golden ratio proportions
   */
  private deflate(): void {
    const newTiles: Tile[] = [];

    for (const tile of this.tiles) {
      const subdivided = this.subdivideTile(tile);
      newTiles.push(...subdivided);
    }

    this.tiles = newTiles;
  }

  /**
   * Subdivide a single tile according to its type
   * @param tile - The tile to subdivide
   * @returns Array of new smaller tiles
   */
  private subdivideTile(tile: Tile): readonly Tile[] {
    const newTiles: Tile[] = [];
    const newSize = tile.size / this.PHI;

    if (tile.type === this.TILE_KITE) {
      // Kite subdivision creates 2 kites and 1 dart
      // This follows the Robinson triangle decomposition

      // Calculate vertex positions for the kite
      const vertices = this.getKiteVertices(tile);

      // New kite 1: at the pointed end
      newTiles.push({
        type: this.TILE_KITE,
        position: vertices[0]!.copy(),
        angle: tile.angle,
        size: newSize,
      });

      // New dart: in the middle section
      const dartPos = vertices[0]!.copy().lerp(vertices[2]!, 1 / this.PHI);
      newTiles.push({
        type: this.TILE_DART,
        position: dartPos,
        angle: tile.angle + Math.PI,
        size: newSize,
      });

      // New kite 2: at the base
      const kite2Angle = tile.angle + this.THETA;
      const kite2Offset = createVector(
        (tile.size / this.PHI) * Math.cos(kite2Angle),
        (tile.size / this.PHI) * Math.sin(kite2Angle),
      );
      newTiles.push({
        type: this.TILE_KITE,
        position: tile.position.copy().add(kite2Offset),
        angle: tile.angle - this.THETA,
        size: newSize,
      });

      const kite3Angle = tile.angle - this.THETA;
      const kite3Offset = createVector(
        (tile.size / this.PHI) * Math.cos(kite3Angle),
        (tile.size / this.PHI) * Math.sin(kite3Angle),
      );
      newTiles.push({
        type: this.TILE_KITE,
        position: tile.position.copy().add(kite3Offset),
        angle: tile.angle + this.THETA,
        size: newSize,
      });
    } else {
      // Dart subdivision creates 1 kite and 1 dart
      // This maintains the golden ratio proportions

      // New kite: at the sharp angle
      newTiles.push({
        type: this.TILE_KITE,
        position: tile.position.copy(),
        angle: tile.angle + 5 * this.THETA,
        size: newSize,
      });

      // New dart: offset from the base
      const dartOffset = createVector(
        (tile.size / this.PHI) * Math.cos(tile.angle),
        (tile.size / this.PHI) * Math.sin(tile.angle),
      );
      newTiles.push({
        type: this.TILE_DART,
        position: tile.position.copy().add(dartOffset),
        angle: tile.angle + 4 * this.THETA,
        size: newSize,
      });
    }

    return newTiles;
  }

  /**
   * Calculate the four vertices of a kite tile
   * @param tile - The kite tile
   * @returns Array of 4 vertices
   */
  private getKiteVertices(tile: Tile): readonly [p5.Vector, p5.Vector, p5.Vector, p5.Vector] {
    const { position, angle, size } = tile;

    // Kite has angles: 72°, 72°, 72°, 144°
    // The pointed end is at the origin (position)

    // Vertex 0: pointed end (origin)
    const v0 = position.copy();

    // Vertex 1: right side
    const v1Angle = angle - this.THETA;
    const vertex1 = position
      .copy()
      .add(createVector(size * Math.cos(v1Angle), size * Math.sin(v1Angle)));

    // Vertex 2: opposite end (wide angle)
    const v2Angle = angle;
    const vertex2 = position
      .copy()
      .add(
        createVector((size / this.PHI) * Math.cos(v2Angle), (size / this.PHI) * Math.sin(v2Angle)),
      );

    // Vertex 3: left side
    const v3Angle = angle + this.THETA;
    const vertex3 = position
      .copy()
      .add(createVector(size * Math.cos(v3Angle), size * Math.sin(v3Angle)));

    return [v0, vertex1, vertex2, vertex3];
  }

  /**
   * Calculate the four vertices of a dart tile
   * @param tile - The dart tile
   * @returns Array of 4 vertices
   */
  private getDartVertices(tile: Tile): readonly [p5.Vector, p5.Vector, p5.Vector, p5.Vector] {
    const { position, angle, size } = tile;

    // Dart has angles: 36°, 72°, 36°, 216° (reflex)
    // The sharp angle (36°) is at the origin (position)

    // Vertex 0: sharp end (origin)
    const v0 = position.copy();

    // Vertex 1: right side (short edge)
    const v1Angle = angle - 2 * this.THETA;
    const vertex1 = position
      .copy()
      .add(
        createVector((size / this.PHI) * Math.cos(v1Angle), (size / this.PHI) * Math.sin(v1Angle)),
      );

    // Vertex 2: reflex angle vertex (far end)
    const v2Angle = angle;
    const vertex2 = position
      .copy()
      .add(createVector(size * Math.cos(v2Angle), size * Math.sin(v2Angle)));

    // Vertex 3: left side (short edge)
    const v3Angle = angle + 2 * this.THETA;
    const vertex3 = position
      .copy()
      .add(
        createVector((size / this.PHI) * Math.cos(v3Angle), (size / this.PHI) * Math.sin(v3Angle)),
      );

    return [v0, vertex1, vertex2, vertex3];
  }

  /**
   * Render all tiles to the canvas
   * @param offsetX - X offset for centering (default: width/2)
   * @param offsetY - Y offset for centering (default: height/2)
   */
  render(offsetX: number = width / 2, offsetY: number = height / 2): void {
    push();
    translate(offsetX, offsetY);

    for (const tile of this.tiles) {
      this.renderTile(tile);
    }

    pop();
  }

  /**
   * Render a single tile
   * @param tile - The tile to render
   */
  private renderTile(tile: Tile): void {
    const vertices =
      tile.type === this.TILE_KITE ? this.getKiteVertices(tile) : this.getDartVertices(tile);

    // Set fill color based on tile type
    if (this.colorTiles) {
      const color = tile.type === this.TILE_KITE ? this.colors.kite : this.colors.dart;
      fill(color.r, color.g, color.b, color.a);
    } else {
      noFill();
    }

    // Set stroke for edges
    if (this.showEdges) {
      stroke(this.colors.edge.r, this.colors.edge.g, this.colors.edge.b, this.colors.edge.a);
      strokeWeight(0.5);
    } else {
      noStroke();
    }

    // Draw the tile as a quadrilateral
    beginShape();
    for (const v of vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);

    // Draw vertices if enabled
    if (this.showVertices) {
      fill(this.colors.vertex.r, this.colors.vertex.g, this.colors.vertex.b, this.colors.vertex.a);
      noStroke();
      for (const v of vertices) {
        circle(v.x, v.y, 3);
      }
    }
  }

  /**
   * Get all tiles in the tiling
   * @returns Array of all tiles
   */
  getTiles(): readonly Tile[] {
    return this.tiles;
  }

  /**
   * Get vertices for a specific tile
   * @param tile - The tile to get vertices for
   * @returns Array of 4 vertices
   */
  getTileVertices(tile: Tile): readonly [p5.Vector, p5.Vector, p5.Vector, p5.Vector] {
    return tile.type === this.TILE_KITE ? this.getKiteVertices(tile) : this.getDartVertices(tile);
  }

  /**
   * Get the total number of tiles
   * @returns Total tile count
   */
  getTileCount(): number {
    return this.tiles.length;
  }

  /**
   * Get count of each tile type
   * @returns Object with kite and dart counts
   */
  getTileTypeCounts(): { readonly kites: number; readonly darts: number } {
    let kites = 0;
    let darts = 0;

    for (const tile of this.tiles) {
      if (tile.type === this.TILE_KITE) {
        kites++;
      } else {
        darts++;
      }
    }

    return { kites, darts };
  }

  /**
   * Verify the ratio of kites to darts approaches the golden ratio
   * This is a mathematical property of Penrose tilings
   * @returns Ratio of kites to darts
   */
  getKiteToDartRatio(): number {
    const counts = this.getTileTypeCounts();
    return counts.darts > 0 ? counts.kites / counts.darts : 0;
  }
}

/**
 * Create a centered Penrose tiling with default settings
 *
 * @param iterations - Number of deflation iterations (default: 5)
 * @param scale - Size multiplier (default: 100)
 * @returns Configured tiling instance
 *
 * @example
 * const tiling = createPenroseTiling(4, 80);
 * tiling.render();
 */
export function createPenroseTiling(iterations: number = 5, scale: number = 100): PenroseTiling {
  const tiling = new PenroseTiling({ iterations, scale });
  tiling.generate();
  return tiling;
}

/**
 * Create a custom colored Penrose tiling
 *
 * @param config - Full configuration object
 * @returns Configured tiling instance
 *
 * @example
 * const tiling = createCustomPenroseTiling({
 *   iterations: 5,
 *   scale: 100,
 *   colorTiles: true,
 *   colors: {
 *     kite: { r: 255, g: 200, b: 100, a: 200 },
 *     dart: { r: 100, g: 180, b: 255, a: 200 },
 *     edge: { r: 40, g: 40, b: 60, a: 255 },
 *     vertex: { r: 255, g: 0, b: 0, a: 255 }
 *   }
 * });
 * tiling.render();
 */
export function createCustomPenroseTiling(config: PenroseConfig): PenroseTiling {
  const tiling = new PenroseTiling(config);
  tiling.generate();
  return tiling;
}
