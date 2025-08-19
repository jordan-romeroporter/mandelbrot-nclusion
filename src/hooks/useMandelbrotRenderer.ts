import { useCallback, useRef, useState } from "react";
import type { ColorScheme, Viewport } from "../types";
import { calculateMandelbrotPoint, pixelToComplex } from "../utils/mandelbrot";
import { useWebWorkers } from "./useWebWorkers";

type RenderOptions = {
  size: number;
  colorScheme: ColorScheme;
  maxIterations: number;
  viewport: Viewport;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  useWorkers?: boolean;
};

export function useMandelbrotRenderer({
  size,
  colorScheme,
  maxIterations,
  viewport,
  onProgress,
  onComplete,
  useWorkers = true,
}: RenderOptions) {
  const [isCalculating, setIsCalculating] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const {
    workers,
    isInitialized,
    error: workerError,
  } = useWebWorkers({
    enabled: useWorkers,
  });

  const renderSynchronous = useCallback(
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
              const { x, y } = pixelToComplex(px, py, size, size, viewport);
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

          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setIsCalculating(false);
      onComplete?.();
    },
    [size, colorScheme, maxIterations, viewport, onProgress, onComplete]
  );

  const renderWithWorkers = useCallback(
    async (canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d");
      if (!ctx || workers.length === 0) return;

      canvas.width = size;
      canvas.height = size;

      setIsCalculating(true);

      const imageData = ctx.createImageData(size, size);
      const data = imageData.data;

      const rowsPerWorker = Math.ceil(size / workers.length);
      const totalPixels = size * size;

      // Track each worker's progress separately
      const workerPixelCounts = new Map<number, number>();

      const promises = workers.map((worker, i) => {
        return new Promise<void>((resolve, reject) => {
          const startY = i * rowsPerWorker;
          const endY = Math.min((i + 1) * rowsPerWorker, size);
          const workerMaxPixels = (endY - startY) * size;

          const chunk = {
            startY,
            endY,
            startX: 0,
            endX: size,
          };

          const handleMessage = (e: MessageEvent) => {
            if (e.data.type === "progress") {
              // Store this worker's current progress
              const { pixelsCompleted } = e.data;
              workerPixelCounts.set(i, pixelsCompleted);

              // Calculate TOTAL progress by summing all workers
              let totalCompleted = 0;
              workerPixelCounts.forEach((count) => {
                totalCompleted += count;
              });

              const actualProgress = Math.min(
                (totalCompleted / totalPixels) * 100,
                99.9
              );
              onProgress?.(actualProgress);
            } else if (e.data.type === "complete") {
              const { success, pixels, pixelCount, error } = e.data;

              if (!success) {
                console.error("Worker error:", error);
                reject(new Error(error));
                return;
              }

              if (pixels) {
                const pixelArray = new Float32Array(pixels);

                for (let j = 0; j < pixelCount * 4; j += 4) {
                  const px = pixelArray[j];
                  const py = pixelArray[j + 1];
                  const iteration = pixelArray[j + 2];
                  const smoothValue = pixelArray[j + 3];

                  const idx = (py * size + px) * 4;
                  const color = colorScheme.getColor(
                    iteration === maxIterations,
                    iteration,
                    maxIterations,
                    smoothValue
                  );

                  data[idx] = color.r;
                  data[idx + 1] = color.g;
                  data[idx + 2] = color.b;
                  data[idx + 3] = 255;
                }
              }

              // Mark this worker as 100% complete
              workerPixelCounts.set(i, workerMaxPixels);

              // Final progress check
              let totalCompleted = 0;
              workerPixelCounts.forEach((count) => {
                totalCompleted += count;
              });

              // Only update progress if not already at 100%
              if (totalCompleted < totalPixels) {
                const finalProgress = (totalCompleted / totalPixels) * 100;
                onProgress?.(finalProgress);
              }

              worker.removeEventListener("message", handleMessage);
              resolve();
            }
          };

          worker.addEventListener("message", handleMessage);

          worker.postMessage({
            chunk,
            width: size,
            height: size,
            maxIterations,
            viewport,
            workerId: i,
          });
        });
      });

      try {
        await Promise.all(promises);
        ctx.putImageData(imageData, 0, 0);
        onProgress?.(100); // Ensure we hit 100%
      } catch (error) {
        console.error("Worker rendering failed:", error);
        await renderSynchronous(canvas);
      }

      setIsCalculating(false);
      onComplete?.();
    },
    [
      workers,
      size,
      onComplete,
      maxIterations,
      viewport,
      onProgress,
      colorScheme,
      renderSynchronous,
    ]
  );

  const renderToCanvas = useCallback(
    async (canvas: HTMLCanvasElement) => {
      if (workers.length > 0 && isInitialized && !workerError) {
        await renderWithWorkers(canvas);
      } else {
        await renderSynchronous(canvas);
      }
    },
    [workers, isInitialized, workerError, renderWithWorkers, renderSynchronous]
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
    isUsingWorkers: workers.length > 0,
    workerCount: workers.length,
  };
}
