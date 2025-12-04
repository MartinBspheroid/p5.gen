/**
 * Global math constants initialization.
 * Import this module to ensure PI and TWO_PI are available globally.
 */

(globalThis as unknown as Record<string, number>).PI = Math.PI;
(globalThis as unknown as Record<string, number>).TWO_PI = 2 * Math.PI;
