/**
 * Global p5 type declarations for library usage.
 * This enables using p5.Vector and other p5 types without importing p5 as a runtime dependency.
 */

// Import p5 types
import type p5Constructor from "p5";

// Declare p5 as a global namespace matching the imported type
declare global {
  /**
   * The p5 namespace containing Vector and other types.
   * Available globally when p5.js is loaded in global mode.
   */
  namespace p5 {
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
      sub(x: number, y?: number, z?: number): Vector;
      mult(n: number): Vector;
      mult(v: Vector): Vector;
      div(n: number): Vector;
      div(v: Vector): Vector;
      mag(): number;
      magSq(): number;
      dot(v: Vector): number;
      dot(x: number, y?: number, z?: number): number;
      cross(v: Vector): Vector;
      dist(v: Vector): number;
      normalize(): Vector;
      limit(max: number): Vector;
      setMag(len: number): Vector;
      heading(): number;
      setHeading(angle: number): Vector;
      rotate(angle: number): Vector;
      angleBetween(v: Vector): number;
      lerp(v: Vector, amt: number): Vector;
      lerp(x: number, y: number, z: number, amt: number): Vector;
      reflect(surfaceNormal: Vector): Vector;
      array(): number[];
      equals(v: Vector | number[]): boolean;
      equals(x: number, y?: number, z?: number): boolean;
      set(v: Vector | number[]): Vector;
      set(x: number, y?: number, z?: number): Vector;

      // Static methods
      static add(v1: Vector, v2: Vector, target?: Vector): Vector;
      static sub(v1: Vector, v2: Vector, target?: Vector): Vector;
      static mult(v: Vector, n: number, target?: Vector): Vector;
      static div(v: Vector, n: number, target?: Vector): Vector;
      static dist(v1: Vector, v2: Vector): number;
      static dot(v1: Vector, v2: Vector): number;
      static cross(v1: Vector, v2: Vector): Vector;
      static lerp(v1: Vector, v2: Vector, amt: number, target?: Vector): Vector;
      static mag(v: Vector): number;
      static normalize(v: Vector, target?: Vector): Vector;
      static fromAngle(angle: number, length?: number): Vector;
      static fromAngles(theta: number, phi: number, length?: number): Vector;
      static random2D(): Vector;
      static random3D(): Vector;
      static copy(v: Vector): Vector;
    }
  }

  /**
   * Creates a new p5.Vector
   */
  function createVector(x?: number, y?: number, z?: number): p5.Vector;
}

export {};
