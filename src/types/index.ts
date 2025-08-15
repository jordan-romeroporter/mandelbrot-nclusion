export type Viewport = {
  centerX: number;
  centerY: number;
  zoom: number;
  width: number;
  height: number;
}

export type ColorScheme = {
  name: string;
  getColor: (isBounded: boolean, iterations: number, maxIterations: number) => RGB;
}

export type RGB = {
  r: number;
  g: number;
  b: number;
}

export type MandelbrotPoint = {
  x: number;
  y: number;
  iterations: number;
  isBounded: boolean;
}
