/// <reference path="../node_modules/@types/p5/global.d.ts" />

/**
 * TRUCHET TILES ALGORITHM
 *
 * Implementation of classic Truchet tiling patterns with multiple tile types.
 * Truchet tiles are square tiles with patterns that can be oriented in different
 * ways to create flowing, maze-like, or organic visual patterns.
 *
 * TILE TYPES:
 * - DIAGONAL: Classic diagonal line pattern (labyrinth-like)
 * - CURVE: Quarter-circle arcs creating smooth flowing patterns
 * - TRIANGLE: Triangular division (original 1704 Truchet pattern)
 * - DOTS: Circle patterns at corners
 * - CROSS: Cross and square corner patterns
 *
 * FEATURES:
 * - Multiple tile pattern types
 * - Random or structured tile placement
 * - Configurable grid dimensions and tile size
 * - Smooth visual transitions between tiles
 * - Rotation control (0°, 90°, 180°, 270°)
 * - Color customization
 *
 * Historical Context:
 * Father Sébastien Truchet (1704) studied patterns from diagonally bisected tiles.
 * Cyril Stanley Smith (1987) introduced the curved arc variation, creating
 * aesthetically pleasing meandering patterns with continuous derivatives.
 */

export type TileType = 'diagonal' | 'curve' | 'triangle' | 'dots' | 'cross';
export type PatternType = 'random' | 'structured' | 'checker' | 'gradient' | 'noise';
export type Rotation = 0 | 1 | 2 | 3;

export type ColorScheme = {
  background: string;
  foreground: string;
  accent: string;
};

export type TruchetConfig = {
  cols: number;
  rows: number;
  tileSize: number;
  tileType: TileType;
  pattern: PatternType;
  colors: ColorScheme;
  animate: boolean;
  animationSpeed: number;
  seed: number | null;
  strokeWeight: number;
};

/**
 * Default configuration for Truchet tiling
 */
const defaultConfig: TruchetConfig = {
  cols: 20,
  rows: 20,
  tileSize: 40,
  tileType: 'curve',
  pattern: 'random',
  colors: {
    background: '#1a1a2e',
    foreground: '#eee',
    accent: '#16213e',
  },
  animate: false,
  animationSpeed: 0.02,
  seed: null,
  strokeWeight: 2,
};

let grid: number[][] = [];
let time: number = 0;

/**
 * Draw a diagonal line tile
 *
 * Creates labyrinth-like maze patterns with a diagonal line
 * rotating based on the rotation parameter
 *
 * @param position - p5.Vector position of tile (top-left corner)
 * @param size - Size of the tile
 * @param rotation - Rotation value (0-3 representing 0°, 90°, 180°, 270°)
 */
export function drawDiagonalTile(position: p5.Vector, size: number, rotation: Rotation): void {
  push();
  translate(position.x + size / 2, position.y + size / 2);
  rotate((rotation as number) * (Math.PI / 2));

  stroke(defaultConfig.colors.foreground);
  strokeWeight(defaultConfig.strokeWeight);

  // Draw diagonal line from top-left to bottom-right
  line(-size / 2, -size / 2, size / 2, size / 2);

  pop();
}

/**
 * Draw a curved arc tile (Smith variation)
 *
 * Creates smooth flowing patterns with continuous derivatives
 * using two quarter-circle arcs from opposite corners
 *
 * @param position - p5.Vector position of tile (top-left corner)
 * @param size - Size of the tile
 * @param rotation - Rotation value (0-3)
 */
export function drawCurveTile(position: p5.Vector, size: number, rotation: Rotation): void {
  push();
  translate(position.x + size / 2, position.y + size / 2);
  rotate((rotation as number) * (Math.PI / 2));

  stroke(defaultConfig.colors.foreground);
  strokeWeight(defaultConfig.strokeWeight);
  noFill();

  // Two quarter-circle arcs centered at opposite corners
  // Arc from top-left corner
  arc(-size / 2, -size / 2, size, size, 0, Math.PI / 2);

  // Arc from bottom-right corner
  arc(size / 2, size / 2, size, size, Math.PI, Math.PI + Math.PI / 2);

  pop();
}

/**
 * Draw a triangular tile (original Truchet 1704)
 *
 * Diagonal bisection creating two triangles with different colors
 *
 * @param position - p5.Vector position of tile (top-left corner)
 * @param size - Size of the tile
 * @param rotation - Rotation value (0-3)
 */
export function drawTriangleTile(position: p5.Vector, size: number, rotation: Rotation): void {
  push();
  translate(position.x + size / 2, position.y + size / 2);
  rotate((rotation as number) * (Math.PI / 2));

  noStroke();

  // First triangle (foreground color)
  fill(defaultConfig.colors.foreground);
  triangle(
    -size / 2,
    -size / 2, // top-left
    size / 2,
    -size / 2, // top-right
    size / 2,
    size / 2, // bottom-right
  );

  // Second triangle (accent color)
  fill(defaultConfig.colors.accent);
  triangle(
    -size / 2,
    -size / 2, // top-left
    -size / 2,
    size / 2, // bottom-left
    size / 2,
    size / 2, // bottom-right
  );

  pop();
}

/**
 * Draw a dots tile
 *
 * Circles at opposite corners creating flow patterns
 *
 * @param position - p5.Vector position of tile (top-left corner)
 * @param size - Size of the tile
 * @param rotation - Rotation value (0-3)
 */
export function drawDotsTile(position: p5.Vector, size: number, rotation: Rotation): void {
  push();
  translate(position.x + size / 2, position.y + size / 2);
  rotate((rotation as number) * (Math.PI / 2));

  fill(defaultConfig.colors.foreground);
  noStroke();

  const dotSize: number = size * 0.3;

  // Dots at opposite corners
  circle(-size / 2, -size / 2, dotSize);
  circle(size / 2, size / 2, dotSize);

  pop();
}

/**
 * Draw a cross/corner tile
 *
 * L-shapes at corners creating cross patterns
 *
 * @param position - p5.Vector position of tile (top-left corner)
 * @param size - Size of the tile
 * @param rotation - Rotation value (0-3)
 */
export function drawCrossTile(position: p5.Vector, size: number, rotation: Rotation): void {
  push();
  translate(position.x + size / 2, position.y + size / 2);
  rotate((rotation as number) * (Math.PI / 2));

  stroke(defaultConfig.colors.foreground);
  strokeWeight(defaultConfig.strokeWeight);
  noFill();

  // Draw L-shape from corner
  beginShape();
  vertex(-size / 2, 0);
  vertex(-size / 2, -size / 2);
  vertex(0, -size / 2);
  endShape();

  // Mirror L-shape at opposite corner
  beginShape();
  vertex(size / 2, 0);
  vertex(size / 2, size / 2);
  vertex(0, size / 2);
  endShape();

  pop();
}

/**
 * Main tile drawing function - dispatches to appropriate tile type
 *
 * @param position - p5.Vector position of tile (top-left corner)
 * @param size - Size of the tile
 * @param rotation - Rotation value (0-3)
 * @param tileType - Type of tile to draw
 */
export function drawTile(
  position: p5.Vector,
  size: number,
  rotation: Rotation,
  tileType: TileType,
): void {
  switch (tileType) {
    case 'diagonal':
      drawDiagonalTile(position, size, rotation);
      break;
    case 'curve':
      drawCurveTile(position, size, rotation);
      break;
    case 'triangle':
      drawTriangleTile(position, size, rotation);
      break;
    case 'dots':
      drawDotsTile(position, size, rotation);
      break;
    case 'cross':
      drawCrossTile(position, size, rotation);
      break;
  }
}

/**
 * Generate random rotation (0-3 representing 0°, 90°, 180°, 270°)
 *
 * @returns Random rotation value
 */
export function getRandomRotation(): Rotation {
  return Math.floor(Math.random() * 4) as Rotation;
}

/**
 * Generate rotation based on pattern type
 *
 * @param gridPos - p5.Vector with column and row indices (x=col, y=row)
 * @param pattern - Pattern type to apply
 * @returns Rotation value based on pattern
 */
export function getRotation(gridPos: p5.Vector, pattern: PatternType): Rotation {
  const col = Math.floor(gridPos.x);
  const row = Math.floor(gridPos.y);

  switch (pattern) {
    case 'random':
      return getRandomRotation();

    case 'structured':
      return ((col + row) % 4) as Rotation;

    case 'checker':
      return (((col + row) % 2) * 2) as Rotation;

    case 'gradient':
      return Math.floor(((col / Math.max(1, defaultConfig.cols - 1)) * 4) % 4) as Rotation;

    case 'noise': {
      // Use noise if available (p5.js), otherwise fall back to structured pattern
      if (typeof noise === 'function') {
        const noiseVal: number = noise(col * 0.1, row * 0.1);
        return Math.floor(noiseVal * 4) as Rotation;
      }
      return ((col + row) % 4) as Rotation;
    }

    default:
      return getRandomRotation();
  }
}

/**
 * Initialize the grid with rotation values
 *
 * Populates a 2D array with rotation values based on the current
 * pattern type. Can be seeded for reproducible output.
 *
 * @param cols - Number of columns
 * @param rows - Number of rows
 * @param pattern - Pattern type to use
 * @param seed - Optional seed for reproducibility
 * @returns The grid of rotation values
 */
export function initializeGrid(
  cols: number,
  rows: number,
  pattern: PatternType,
  seed?: number,
): number[][] {
  const newGrid: number[][] = [];

  // Set random seed if provided and available
  if (seed !== undefined) {
    if (typeof randomSeed === 'function') {
      randomSeed(seed);
    }
    if (typeof noiseSeed === 'function') {
      noiseSeed(seed);
    }
  }

  for (let row: number = 0; row < rows; row++) {
    newGrid[row] = [];
    for (let col: number = 0; col < cols; col++) {
      newGrid[row]![col] = getRotation(createVector(col, row), pattern);
    }
  }

  grid = newGrid;
  return newGrid;
}

/**
 * Draw the entire grid of tiles
 *
 * Renders all tiles in the grid using the current configuration
 *
 * @param gridData - 2D array of rotation values
 * @param tileSize - Size of each tile
 * @param tileType - Type of tile to draw
 */
export function drawGrid(gridData: number[][], tileSize: number, tileType: TileType): void {
  for (let row: number = 0; row < gridData.length; row++) {
    for (let col: number = 0; col < gridData[row]!.length; col++) {
      const position = createVector(col * tileSize, row * tileSize);
      const rotation = gridData[row]![col]! as Rotation;

      drawTile(position, tileSize, rotation, tileType);
    }
  }
}

/**
 * Update grid for animation
 *
 * Slowly morphs tiles using noise when animation is enabled
 *
 * @param cols - Number of columns
 * @param rows - Number of rows
 * @param speed - Animation speed multiplier
 */
export function updateGrid(cols: number, rows: number, speed: number): void {
  time += speed;

  for (let row: number = 0; row < rows; row++) {
    for (let col: number = 0; col < cols; col++) {
      const noiseVal: number = noise(col * 0.1, row * 0.1, time);
      grid[row]![col] = Math.floor(noiseVal * 4);
    }
  }
}

/**
 * Randomize colors in the configuration
 *
 * @param config - Configuration to update
 */
export function randomizeColors(config: TruchetConfig): void {
  config.colors.background = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
  config.colors.foreground = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
  config.colors.accent = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`;
}
