import type { ColorScheme } from "../types";

export const colorSchemes: ColorScheme[] = [
  {
    name: "Classic",
    getColor: (isBounded, iterations, maxIterations) => {
      if (isBounded) {
        // LIGHT for bounded (in set) - requirement
        return { r: 240, g: 240, b: 240 };
      }
      // DARK for unbounded (escaped) - requirement
      const t = iterations / maxIterations;
      const value = Math.floor(50 * t);
      return { r: value, g: value, b: value };
    },
  },
  {
    name: "Ocean",
    getColor: (isBounded, iterations, maxIterations) => {
      if (isBounded) {
        return { r: 200, g: 220, b: 255 }; // Light blue
      }
      const t = iterations / maxIterations;
      return { r: 0, g: Math.floor(50 * t), b: Math.floor(100 * t) };
    },
  },
  {
    name: "Fire",
    getColor: (isBounded, iterations, maxIterations) => {
      if (isBounded) {
        return { r: 255, g: 250, b: 200 }; // Light yellow
      }
      const t = Math.sqrt(iterations / maxIterations); // Sqrt for better gradient
      return {
        r: Math.floor(150 * t),
        g: Math.floor(50 * t),
        b: 0,
      };
    },
  },
];
