import { useEffect, useRef } from "react";
import type { ColorScheme } from "../types";
import { useMandelbrotRenderer } from "../hooks/useMandelbrotRenderer";

type MandelbrotCanvasProps = {
  size: number;
  colorScheme: ColorScheme;
  maxIterations?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
};

export function MandelbrotCanvas({
  size,
  colorScheme,
  maxIterations = 100,
  onProgress,
  onComplete,
}: MandelbrotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { renderToCanvas, isCalculating, cleanup } = useMandelbrotRenderer({
    size,
    colorScheme,
    maxIterations,
    onProgress,
    onComplete,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      renderToCanvas(canvas);
    }

    return cleanup;
  }, [renderToCanvas, cleanup]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        border: "2px solid #333",
        borderRadius: "4px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        display: "block",
        margin: "0 auto",
        opacity: isCalculating ? 0.9 : 1,
        transition: "opacity 0.3s ease",
      }}
    />
  );
}
