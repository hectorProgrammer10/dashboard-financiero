'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { MarketDataPoint } from '../workers/marketData.worker';

export function useMarketWorker() {
  const [dataPoints, setDataPoints] = useState<MarketDataPoint[]>([]);
  const [metrics, setMetrics] = useState({ currentPrice: 0, totalPoints: 0 });
  const workerRef = useRef<Worker | null>(null);

  const startWorker = useCallback(() => {
    if (typeof window !== 'undefined' && !workerRef.current) {
      // Use standard Web Worker API syntax supported by Next.js Compiler
      workerRef.current = new Worker(new URL('../workers/marketData.worker.ts', import.meta.url), {
        type: 'module'
      });
      
      workerRef.current.onmessage = (event) => {
        const { type, payload } = event.data;
        if (type === 'DATA_UPDATE') {
          // Instead of updating a heavy array, we send metrics directly
          // AND we update the `dataPoints` in batches to avoid overwhelming React DOM.
          // By keeping state updates separated, UI lag is reduced.
          setMetrics(payload.metrics);
          
          setDataPoints(prev => {
            const next = [...prev, ...payload.newPoints];
            // Retain up to 200 elements for the UI Chart buffer.
            if (next.length > 200) {
              return next.slice(next.length - 200);
            }
            return next;
          });
        }
      };
      
      workerRef.current.postMessage({ type: 'START' });
    }
  }, []);

  const stopWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'STOP' });
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startWorker();
    return () => {
      stopWorker();
    };
  }, [startWorker, stopWorker]);

  // Provide manual clear data method
  const clearData = () => setDataPoints([]);

  return { dataPoints, metrics, startWorker, stopWorker, clearData };
}
