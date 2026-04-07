/* eslint-disable no-restricted-globals */

export type MarketDataPoint = {
  time: number;
  value: number;
  sma20?: number;
  sma50?: number;
  volume: number;
};

export type WorkerMessage = {
  type: 'START' | 'STOP';
};

// Memory for the worker to calculate moving averages
let dataBuffer: MarketDataPoint[] = [];
let isRunning = false;
let intervalId: NodeJS.Timeout | null = null;
let currentPrice = 65000; // Starting point (e.g., BTC value)

const BATCH_SIZE = 50; // Points per tick to simulate high concurrency
const TICK_RATE_MS = 60; // frequent ticks to test 60FPS render limits (~800 points/sec)

function generateBatch(startTimestamp: number, stepMs: number): MarketDataPoint[] {
  const batch: MarketDataPoint[] = [];
  
  for (let i = 0; i < BATCH_SIZE; i++) {
    // Random walk with mean reversion tendencies
    const volatility = currentPrice * 0.0005; // 0.05% volatility
    const change = (Math.random() - 0.48) * volatility; 
    currentPrice += change;
    if (currentPrice < 100) currentPrice = 100;
    
    batch.push({
      time: startTimestamp + (i * stepMs),
      value: currentPrice,
      volume: Math.random() * 5 + 0.1
    });
  }
  return batch;
}

function calculateSMA(data: MarketDataPoint[], period: number, currentIndex: number): number | undefined {
  if (currentIndex < period - 1) return undefined;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[currentIndex - i].value;
  }
  return sum / period;
}

self.onmessage = (event: MessageEvent<WorkerMessage>) => {
  const { type } = event.data;

  if (type === 'START') {
    if (isRunning) return;
    isRunning = true;
    
    let lastTime = Date.now();
    const stepMs = TICK_RATE_MS / BATCH_SIZE;

    intervalId = setInterval(() => {
      const now = Date.now();
      // 1. Generate new raw data
      const newPoints = generateBatch(lastTime, stepMs);
      lastTime = now;
      
      // 2. Append to buffer
      dataBuffer.push(...newPoints);
      
      // 3. Keep buffer size manageable (e.g. max 5000 points for memory safety)
      if (dataBuffer.length > 5000) {
        dataBuffer = dataBuffer.slice(dataBuffer.length - 5000);
      }
      
      // 4. Heavy Computation: Calculate MAs for the new points
      const processedPoints = newPoints.map((point, idx) => {
        const bufferIdx = dataBuffer.length - BATCH_SIZE + idx;
        return {
          ...point,
          sma20: calculateSMA(dataBuffer, 20, bufferIdx),
          sma50: calculateSMA(dataBuffer, 50, bufferIdx),
        };
      });

      // 5. Send format-ready data to UI thread
      self.postMessage({
        type: 'DATA_UPDATE',
        payload: {
          newPoints: processedPoints,
          metrics: {
            currentPrice: currentPrice,
            totalPoints: dataBuffer.length,
          }
        }
      });
      
    }, TICK_RATE_MS);
  }

  if (type === 'STOP') {
    isRunning = false;
    if (intervalId) clearInterval(intervalId);
    dataBuffer = []; // Clear memory
  }
};

export {};
