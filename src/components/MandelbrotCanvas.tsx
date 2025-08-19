import { useEffect, useRef, useState } from "react";
import type { ColorScheme, Viewport } from "../types";
import { useMandelbrotRenderer } from "../hooks/useMandelbrotRenderer";

type MandelbrotCanvasProps = {
  size: number;
  colorScheme: ColorScheme;
  viewport: Viewport;
  maxIterations?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  useWorkers?: boolean;
};

function MandelbrotCanvasBody({
  size,
  colorScheme,
  viewport,
  maxIterations = 100,
  onProgress,
  onComplete,
  useWorkers = true,
}: MandelbrotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    renderToCanvas,
    isCalculating,
    cleanup,
    isUsingWorkers,
    workerCount,
  } = useMandelbrotRenderer({
    size,
    colorScheme,
    maxIterations,
    viewport,
    onProgress,
    onComplete,
    useWorkers,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      renderToCanvas(canvas);
    }

    return cleanup;
  }, [renderToCanvas, cleanup]);

  return (
    <>
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
      {isUsingWorkers && (
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          Using {workerCount} parallel workers
        </div>
      )}
    </>
  );
}

type ResponsiveCanvasContainerProps = {
  children: React.ReactNode;
  targetSize: number;
  minSize?: number;
};

function ResponsiveCanvasContainer({
  children,
  targetSize,
  minSize = 300,
}: ResponsiveCanvasContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displaySize, setDisplaySize] = useState(targetSize);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const isMobile = window.innerWidth < 768;
      const padding = isMobile ? 40 : 20;

      const maxAvailableSize = containerWidth - padding;

      // Determine display size
      if (maxAvailableSize < targetSize) {
        // Container is smaller than target, scale down but not below minSize
        setDisplaySize(Math.max(maxAvailableSize, minSize));
      } else {
        // Container is large enough, use target size
        setDisplaySize(targetSize);
      }
    };

    handleResize();

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [targetSize, minSize]);

  const scale = displaySize / targetSize;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        padding: "10px",
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center",
          width: `${targetSize}px`,
          height: `${targetSize}px`,
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function MandelbrotCanvas({
  size,
  colorScheme,
  viewport,
  maxIterations = 100,
  onProgress,
  onComplete,
  useWorkers = true,
}: MandelbrotCanvasProps) {
  return (
    <ResponsiveCanvasContainer targetSize={size}>
      <MandelbrotCanvasBody
        size={size}
        colorScheme={colorScheme}
        viewport={viewport}
        maxIterations={maxIterations}
        onProgress={onProgress}
        onComplete={onComplete}
        useWorkers={useWorkers}
      />
    </ResponsiveCanvasContainer>
  );
}
