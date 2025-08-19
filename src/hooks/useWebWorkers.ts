import { useEffect, useState, useCallback } from 'react';

type WorkerPoolOptions = {
  enabled?: boolean;
  workerPath?: string;
  poolSize?: number;
};

export function useWebWorkers({
  enabled = true,
  workerPath = '../workers/mandelbrot.worker.ts',
  poolSize
}: WorkerPoolOptions = {}) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setIsInitialized(true);
      return;
    }

    let workerPool: Worker[] = [];

    try {
      const numWorkers = poolSize || navigator.hardwareConcurrency || 4;
      
      workerPool = Array.from({ length: numWorkers }, () => {
        const worker = new Worker(
          new URL(workerPath, import.meta.url),
          { type: 'module' }
        );
        
        worker.onerror = (e) => {
          console.error('Worker initialization error:', e);
          setError(`Failed to initialize worker: ${e.message}`);
        };
        
        return worker;
      });
      
      setWorkers(workerPool);
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      console.error('Failed to create workers:', err);
      setError(`Failed to create workers: ${(err as Error).message}`);
      setIsInitialized(true);
    }

    return () => {
      workerPool.forEach(worker => {
        try {
          worker.terminate();
        } catch (err) {
          console.error('Error terminating worker:', err);
        }
      });
    };
  }, [enabled, workerPath, poolSize]);

  const reset = useCallback(() => {
    setWorkers([]);
    setError(null);
    setIsInitialized(false);
  }, []);

  return {
    workers,
    isInitialized,
    error,
    workerCount: workers.length,
    reset
  };
}
