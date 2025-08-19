import { useCallback, useRef, useState } from "react";
import type { ColorScheme } from "../types";
import { calculateMandelbrotPoint, pixelToComplex } from "../utils/mandelbrot";

type RenderOptions = {
  size: number;
  colorScheme: ColorScheme;
  maxIterations: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
};

export const useMandelbrotRenderer = ({
  size,
  colorScheme,
  maxIterations,
  onProgress,
  onComplete,
}: RenderOptions) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);

  const renderToCanvas = useCallback(
    async (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = size;
      canvas.height = size;

      setIsCalculating(true);

      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;

      const CHUNK_SIZE = 50;
      let processed = 0;

      for (let chunkY = 0; chunkY < size; chunkY += CHUNK_SIZE) {
        for (let chunkX = 0; chunkX < size; chunkX += CHUNK_SIZE) {
          const endX = Math.min(chunkX + CHUNK_SIZE, size);
          const endY = Math.min(chunkY + CHUNK_SIZE, size);

          for (let py = chunkY; py < endY; py++) {
            for (let px = chunkX; px < endX; px++) {
              const { x, y } = pixelToComplex(px, py, size, size);
              const point = calculateMandelbrotPoint(x, y, maxIterations);
              const color = colorScheme.getColor(
                point.isBounded,
                point.iterations,
                maxIterations
              );

              const idx = (py * size + px) * 4;
              data[idx] = color.r;
              data[idx + 1] = color.g;
              data[idx + 2] = color.b;
              data[idx + 3] = 255;
            }
          }

          processed += (endX - chunkX) * (endY - chunkY);
          const progress = (processed / (size * size)) * 100;

          onProgress?.(progress);

          // Yield to browser for responsiveness
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      ctx.putImageData(imageData, 0, 0);

      setIsCalculating(false);
      onComplete?.();
    },
    [size, colorScheme, maxIterations, onProgress, onComplete]
  );

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  return {
    renderToCanvas,
    isCalculating,
    cleanup,
  };
};
