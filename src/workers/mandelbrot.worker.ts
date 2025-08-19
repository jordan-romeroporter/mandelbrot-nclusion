/// <reference lib="webworker" />

const VALUES_PER_PIXEL = 4;

type ChunkData = {
  startX: number;
  endX: number;
  startY: number;
  endY: number;
};

type WorkerInput = {
  chunk: ChunkData;
  width: number;
  height: number;
  maxIterations: number;
  viewport: {
    centerX: number;
    centerY: number;
    zoom: number;
  };
  workerId?: number; // ADD: optional worker ID for tracking
};

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  try {
    const { chunk, width, height, maxIterations, viewport, workerId } = e.data;

    if (!chunk || !width || !height || !maxIterations) {
      throw new Error("Missing required parameters");
    }

    const { startX, endX, startY, endY } = chunk;

    // YOUR EXISTING viewport-aware scaling - unchanged
    const range = 2 * viewport.zoom;
    const scaleX = (range * 2) / width;
    const scaleY = (range * 2) / height;
    const offsetX = viewport.centerX - range;
    const offsetY = viewport.centerY - range;

    const chunkWidth = endX - startX;
    const chunkHeight = endY - startY;
    const pixelCount = chunkWidth * chunkHeight;
    const pixels = new Float32Array(pixelCount * VALUES_PER_PIXEL);

    const ESCAPE_RADIUS_SQUARED = 4;
    const LOG_2 = Math.log(2);

    let arrayIndex = 0;

    // ADD: Progress tracking
    let rowsCompleted = 0;
    const totalRows = endY - startY;

    for (let py = startY; py < endY; py++) {
      const y0 = py * scaleY + offsetY;

      for (let px = startX; px < endX; px++) {
        const x0 = px * scaleX + offsetX;

        // YOUR EXISTING calculation logic - unchanged
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

          if (escapeValue > ESCAPE_RADIUS_SQUARED) {
            break;
          }

          const xTemp = xSquared - ySquared + x0;
          y = 2 * x * y + y0;
          x = xTemp;

          iteration++;
        }

        // YOUR EXISTING smooth coloring - unchanged
        let smoothValue = iteration;
        if (iteration < maxIterations && escapeValue > 0) {
          smoothValue =
            iteration +
            1 -
            Math.log(Math.log(Math.sqrt(escapeValue)) / LOG_2) / LOG_2;
        }

        pixels[arrayIndex++] = px;
        pixels[arrayIndex++] = py;
        pixels[arrayIndex++] = iteration;
        pixels[arrayIndex++] = smoothValue;
      }

      // ADD: Report progress every 10 rows to avoid too many messages
      rowsCompleted++;
      if (rowsCompleted % 10 === 0 || rowsCompleted === totalRows) {
        const pixelsCompleted = rowsCompleted * chunkWidth;
        self.postMessage({
          type: "progress",
          workerId,
          pixelsCompleted,
          totalPixels: pixelCount,
        });
      }
    }

    // YOUR EXISTING final message - just add type field
    self.postMessage(
      {
        type: "complete", // ADD: type field
        chunk,
        pixels: pixels.buffer,
        pixelCount,
        success: true,
      },
      [pixels.buffer] as Transferable[]
    );
  } catch (error) {
    console.error("Worker calculation error:", error);

    self.postMessage({
      type: "complete", // ADD: type field
      success: false,
      error: (error as Error).message || "Unknown error occurred",
      chunk: e.data?.chunk || null,
      pixels: null,
    });
  }
};
