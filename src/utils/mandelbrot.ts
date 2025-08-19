import { MandelbrotPoint, Viewport } from '../types';

export function pixelToComplex(
  px: number,
  py: number,
  width: number,
  height: number,
  viewport?: Viewport
): { x: number; y: number } {
  if (viewport) {
    const range = 2 * viewport.zoom;
    const x = viewport.centerX + (px / width - 0.5) * range * 2;
    const y = viewport.centerY + (py / height - 0.5) * range * 2;
    return { x, y };
  } else {
    // Default view
    const x = (px / width) * 4 - 2;
    const y = (py / height) * 4 - 2;
    return { x, y };
  }
}

export function calculateMandelbrotPoint(
  x0: number,
  y0: number,
  maxIterations: number
): MandelbrotPoint {
  let x = 0;
  let y = 0;
  let iteration = 0;
  let xSquared = 0;
  let ySquared = 0;
  let escapeValue = 0;
  
  while (iteration < maxIterations) {
    xSquared = x * x;
    ySquared = y * y;
    escapeValue = xSquared + ySquared;
    
    if (escapeValue > 4) {
      break;
    }
    
    const xTemp = xSquared - ySquared + x0;
    y = 2 * x * y + y0;
    x = xTemp;
    iteration++;
  }
  
  // Calculate smooth value for better coloring
  let smoothValue = iteration;
  if (iteration < maxIterations && escapeValue > 0) {
    const log2 = Math.log(2);
    smoothValue = iteration + 1 - Math.log(Math.log(Math.sqrt(escapeValue)) / log2) / log2;
  }
  
  return {
    x: x0,
    y: y0,
    iterations: iteration,
    isBounded: iteration === maxIterations,
    smoothValue
  };
}
