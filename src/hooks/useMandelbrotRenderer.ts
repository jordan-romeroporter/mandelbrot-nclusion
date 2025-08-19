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

      // Divide work into chunks for workers
      const rowsPerWorker = Math.ceil(size / workers.length);
      let completedChunks = 0;
      const totalChunks = workers.length;

      const promises = workers.map((worker, i) => {
        return new Promise<void>((resolve, reject) => {
          const chunk = {
            startY: i * rowsPerWorker,
            endY: Math.min((i + 1) * rowsPerWorker, size),
            startX: 0,
            endX: size,
          };

          const handleMessage = (e: MessageEvent) => {
            const { success, pixels, pixelCount, error } = e.data;

            if (!success) {
              console.error("Worker error:", error);
              reject(new Error(error));
              return;
            }

            if (pixels) {
              const pixelArray = new Float32Array(pixels);

              for (let i = 0; i < pixelCount * 4; i += 4) {
                const px = pixelArray[i];
                const py = pixelArray[i + 1];
                const iteration = pixelArray[i + 2];
                const smoothValue = pixelArray[i + 3];

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

            completedChunks++;
            const progress = (completedChunks / totalChunks) * 100;
            onProgress?.(progress);

            worker.removeEventListener("message", handleMessage);
            resolve();
          };

          worker.addEventListener("message", handleMessage);

          worker.postMessage({
            chunk,
            width: size,
            height: size,
            maxIterations,
            viewport,
          });
        });
      });

      try {
        await Promise.all(promises);
        ctx.putImageData(imageData, 0, 0);
      } catch (error) {
        console.error("Worker rendering failed:", error);
        // Fall back to synchronous rendering
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
