import { useEffect, useRef } from 'react';
import { ColorScheme, Viewport } from '../types';
import { useMandelbrotRenderer } from '../hooks/useMandelbrotRenderer';

type MandelbrotCanvasProps = {
  size: number;
  colorScheme: ColorScheme;
  viewport: Viewport;
  maxIterations?: number;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  useWorkers?: boolean;
};

export function MandelbrotCanvas({
  size,
  colorScheme,
  viewport,
  maxIterations = 100,
  onProgress,
  onComplete,
  useWorkers = true
}: MandelbrotCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    renderToCanvas, 
    isCalculating, 
    cleanup,
    isUsingWorkers,
    workerCount
  } = useMandelbrotRenderer({
    size,
    colorScheme,
    maxIterations,
    viewport,
    onProgress,
    onComplete,
    useWorkers
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
          border: '2px solid #333',
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'block',
          margin: '0 auto',
          opacity: isCalculating ? 0.9 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
      {isUsingWorkers && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '10px',
          fontSize: '12px',
          color: '#666'
        }}>
          Using {workerCount} parallel workers
        </div>
      )}
    </>
  );
}
