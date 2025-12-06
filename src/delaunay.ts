/// <reference path="../node_modules/@types/p5/global.d.ts" />
/**
 * Delaunay Triangulation using the Bowyer-Watson incremental algorithm.
 *
 * Delaunay triangulation creates a mesh of triangles from a set of points such that
 * no point is inside the circumcircle of any triangle. This maximizes the minimum angle
 * of all triangles, avoiding thin, sliver-like triangles.
 *
 * Uses:
 * - Mesh generation for graphics and physics simulations
 * - Voronoi diagram computation (dual graph)
 * - Terrain modeling and heightmaps
 * - Spatial analysis and nearest neighbor queries
 *
 * All functions are pure and return new values without mutation.
 */

import { circumcenter } from "./circle";

/** Small value for floating-point comparisons */
const EPSILON = 1e-9;

// ============================================================================
// Type Definitions
// ============================================================================

/** An edge between two points (order-independent for comparison) */
export type Edge = readonly [p5.Vector, p5.Vector];

/** Triangle vertices */
export type TriangleVertices = {
  readonly p1: p5.Vector;
  readonly p2: p5.Vector;
  readonly p3: p5.Vector;
};

/** Circumcircle data */
export type Circumcircle = {
  readonly center: p5.Vector;
  readonly radiusSq: number;
};

// ============================================================================
// Triangle Class
// ============================================================================

/**
 * A triangle in a Delaunay triangulation with precomputed circumcircle.
 */
export class Triangle {
  readonly p1: p5.Vector;
  readonly p2: p5.Vector;
  readonly p3: p5.Vector;
  readonly circumcircle: Circumcircle;

  /**
   * Create a new triangle from three vertices.
   * @param p1 - First vertex
   * @param p2 - Second vertex
   * @param p3 - Third vertex
   */
  constructor(p1: p5.Vector, p2: p5.Vector, p3: p5.Vector) {
    this.p1 = p1;
    this.p2 = p2;
    this.p3 = p3;
    this.circumcircle = this.calculateCircumcircle();
  }

  /**
   * Calculate the circumcircle (circle passing through all three vertices).
   * Uses the circumcenter formula and caches the result.
   * @returns Circumcircle with center and squared radius
   */
  private calculateCircumcircle(): Circumcircle {
    const center = circumcenter(this.p1, this.p2, this.p3);

    // Degenerate triangle (collinear points)
    if (center === null) {
      const { x: ax, y: ay } = this.p1;
      const { x: bx, y: by } = this.p2;
      const { x: cx, y: cy } = this.p3;
      return {
        center: createVector((ax + bx + cx) / 3, (ay + by + cy) / 3),
        radiusSq: Infinity,
      };
    }

    // Calculate squared radius (avoid sqrt for performance)
    const dx = this.p1.x - center.x;
    const dy = this.p1.y - center.y;

    return {
      center,
      radiusSq: dx * dx + dy * dy,
    };
  }

  /**
   * Check if a point is inside the circumcircle.
   * @param point - Point to test
   * @returns True if point is inside the circumcircle
   */
  inCircumcircle(point: p5.Vector): boolean {
    const dx = point.x - this.circumcircle.center.x;
    const dy = point.y - this.circumcircle.center.y;
    const distSq = dx * dx + dy * dy;

    return distSq < this.circumcircle.radiusSq;
  }

  /**
   * Check if this triangle has a specific vertex (by reference).
   * @param point - Vertex to check
   * @returns True if the point is a vertex of this triangle
   */
  hasVertex(point: p5.Vector): boolean {
    return this.p1 === point || this.p2 === point || this.p3 === point;
  }

  /**
   * Get the three edges of this triangle.
   * @returns Array of three edges
   */
  getEdges(): readonly Edge[] {
    return [
      [this.p1, this.p2],
      [this.p2, this.p3],
      [this.p3, this.p1],
    ] as const;
  }

  /**
   * Get the vertices as an object.
   * @returns Triangle vertices
   */
  getVertices(): TriangleVertices {
    return {
      p1: this.p1,
      p2: this.p2,
      p3: this.p3,
    };
  }
}

// ============================================================================
// Edge Utilities
// ============================================================================

/**
 * Check if two edges are equal (order-independent).
 * @param edge1 - First edge
 * @param edge2 - Second edge
 * @returns True if edges connect the same two points
 */
export function edgesEqual(edge1: Edge, edge2: Edge): boolean {
  return (
    (edge1[0] === edge2[0] && edge1[1] === edge2[1]) ||
    (edge1[0] === edge2[1] && edge1[1] === edge2[0])
  );
}

/**
 * Create a unique string key for an edge (order-independent).
 * Useful for deduplication in sets or maps.
 * @param p1 - First endpoint
 * @param p2 - Second endpoint
 * @returns Unique string key
 */
export function edgeKey(p1: p5.Vector, p2: p5.Vector): string {
  const x1 = Math.round(p1.x * 1000);
  const y1 = Math.round(p1.y * 1000);
  const x2 = Math.round(p2.x * 1000);
  const y2 = Math.round(p2.y * 1000);

  if (x1 < x2 || (x1 === x2 && y1 < y2)) {
    return `${x1},${y1}-${x2},${y2}`;
  }
  return `${x2},${y2}-${x1},${y1}`;
}

// ============================================================================
// Point-in-Triangle Test
// ============================================================================

/**
 * Check if a point is inside a triangle using barycentric coordinates.
 * @param point - Point to test
 * @param triangle - Triangle to test against
 * @returns True if point is inside the triangle
 */
export function pointInTriangle(point: p5.Vector, triangle: Triangle): boolean {
  const { p1, p2, p3 } = triangle;

  const v0x = p3.x - p1.x;
  const v0y = p3.y - p1.y;
  const v1x = p2.x - p1.x;
  const v1y = p2.y - p1.y;
  const v2x = point.x - p1.x;
  const v2y = point.y - p1.y;

  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;

  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  return u >= -EPSILON && v >= -EPSILON && u + v < 1 + EPSILON;
}

// ============================================================================
// Delaunay Triangulation Class
// ============================================================================

/**
 * Delaunay triangulation of a set of 2D points.
 * Uses the Bowyer-Watson incremental algorithm.
 */
export class DelaunayTriangulation {
  readonly points: readonly p5.Vector[];
  readonly triangles: readonly Triangle[];

  /**
   * Create a Delaunay triangulation from a set of points.
   * @param points - Array of points to triangulate
   */
  constructor(points: readonly p5.Vector[]) {
    this.points = points;
    this.triangles = this.build();
  }

  /**
   * Build the triangulation using Bowyer-Watson algorithm.
   * @returns Array of triangles
   */
  private build(): Triangle[] {
    if (this.points.length < 3) {
      return [];
    }

    // Create super-triangle that contains all points
    const { superTriangle, superVertices } = this.createSuperTriangle();
    let triangles: Triangle[] = [superTriangle];

    // Insert points one by one
    for (const point of this.points) {
      triangles = this.insertPoint(triangles, point);
    }

    // Remove triangles that share vertices with super-triangle
    return triangles.filter(
      (triangle) =>
        !triangle.hasVertex(superVertices[0]) &&
        !triangle.hasVertex(superVertices[1]) &&
        !triangle.hasVertex(superVertices[2])
    );
  }

  /**
   * Create a large triangle that contains all points.
   * @returns Super-triangle and its vertices
   */
  private createSuperTriangle(): {
    superTriangle: Triangle;
    superVertices: readonly [p5.Vector, p5.Vector, p5.Vector];
  } {
    // Find bounding box
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of this.points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }

    // Create a triangle much larger than the bounding box
    const dx = maxX - minX;
    const dy = maxY - minY;
    const deltaMax = Math.max(dx, dy);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;

    const p1 = createVector(midX - 20 * deltaMax, midY - deltaMax);
    const p2 = createVector(midX, midY + 20 * deltaMax);
    const p3 = createVector(midX + 20 * deltaMax, midY - deltaMax);

    return {
      superTriangle: new Triangle(p1, p2, p3),
      superVertices: [p1, p2, p3] as const,
    };
  }

  /**
   * Insert a point into the triangulation (Bowyer-Watson step).
   * @param triangles - Current triangulation
   * @param point - Point to insert
   * @returns Updated triangulation
   */
  private insertPoint(triangles: Triangle[], point: p5.Vector): Triangle[] {
    // Find all triangles whose circumcircle contains the point
    const badTriangles: Triangle[] = [];
    for (const triangle of triangles) {
      if (triangle.inCircumcircle(point)) {
        badTriangles.push(triangle);
      }
    }

    // Find the boundary of the polygonal hole
    const polygon: Edge[] = [];

    for (const triangle of badTriangles) {
      const edges = triangle.getEdges();

      for (const edge of edges) {
        // Check if this edge is shared with another bad triangle
        let isShared = false;

        for (const other of badTriangles) {
          if (other === triangle) continue;

          const otherEdges = other.getEdges();
          for (const otherEdge of otherEdges) {
            if (edgesEqual(edge, otherEdge)) {
              isShared = true;
              break;
            }
          }
          if (isShared) break;
        }

        // If edge is not shared, it's part of the polygon boundary
        if (!isShared) {
          polygon.push(edge);
        }
      }
    }

    // Remove bad triangles
    const remaining = triangles.filter((t) => !badTriangles.includes(t));

    // Re-triangulate the polygonal hole with the new point
    for (const edge of polygon) {
      remaining.push(new Triangle(edge[0], edge[1], point));
    }

    return remaining;
  }

  /**
   * Get all unique edges from the triangulation.
   * @returns Array of unique edges
   */
  getEdges(): readonly Edge[] {
    const edges: Edge[] = [];
    const edgeSet = new Set<string>();

    for (const triangle of this.triangles) {
      const triangleEdges = triangle.getEdges();

      for (const edge of triangleEdges) {
        const key = edgeKey(edge[0], edge[1]);

        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push(edge);
        }
      }
    }

    return edges;
  }

  /**
   * Find the triangle containing a given point.
   * @param point - Point to locate
   * @returns Triangle containing the point, or null if not found
   */
  findTriangleContaining(point: p5.Vector): Triangle | null {
    for (const triangle of this.triangles) {
      if (pointInTriangle(point, triangle)) {
        return triangle;
      }
    }
    return null;
  }

  /**
   * Get neighbors of a triangle (triangles sharing an edge).
   * @param triangle - Triangle to find neighbors for
   * @returns Array of neighboring triangles
   */
  getNeighbors(triangle: Triangle): Triangle[] {
    const neighbors: Triangle[] = [];
    const edges = triangle.getEdges();

    for (const other of this.triangles) {
      if (other === triangle) continue;

      const otherEdges = other.getEdges();

      for (const edge of edges) {
        for (const otherEdge of otherEdges) {
          if (edgesEqual(edge, otherEdge)) {
            neighbors.push(other);
            break;
          }
        }
      }
    }

    return neighbors;
  }

  /**
   * Get all circumcenters (useful for Voronoi diagram).
   * @returns Array of circumcenter points
   */
  getCircumcenters(): p5.Vector[] {
    return this.triangles.map((t) => t.circumcircle.center);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a Delaunay triangulation from an array of points.
 * Convenience function for creating triangulations.
 * @param points - Array of points to triangulate
 * @returns Delaunay triangulation
 */
export function triangulate(points: readonly p5.Vector[]): DelaunayTriangulation {
  return new DelaunayTriangulation(points);
}
