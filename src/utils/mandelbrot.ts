import type { MandelbrotPoint } from "../types";

/**
 * Calculate iterations for a single point in the Mandelbrot set
 * z(n+1) = z(n)^2 + c
 */
export const calculateMandelbrotPoint = (
  cx: number,
  cy: number,
  maxIterations: number = 100
): MandelbrotPoint => {
  let x = 0;
  let y = 0;
  let iteration = 0;

  // Optimize by caching squares
  let x2 = 0;
  let y2 = 0;

  while (x2 + y2 <= 4 && iteration < maxIterations) {
    y = 2 * x * y + cy;
    x = x2 - y2 + cx;
    x2 = x * x;
    y2 = y * y;
    iteration++;
  }

  return {
    x: cx,
    y: cy,
    iterations: iteration,
    isBounded: iteration === maxIterations,
  };
};

/**
 * Map pixel coordinates to complex plane
 */
export const pixelToComplex = (
  px: number,
  py: number,
  width: number,
  height: number,
  xMin = -2,
  xMax = 2,
  yMin = -2,
  yMax = 2
): { x: number; y: number } => {
  const x = (px / width) * (xMax - xMin) + xMin;
  const y = (py / height) * (yMax - yMin) + yMin;
  return { x, y };
};
