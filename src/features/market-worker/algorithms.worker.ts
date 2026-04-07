// Web Worker for calculating heavy technical indicators off the main thread

type WorkerMessage = {
  prices: number[];
  periods: number[];
};

self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const { prices, periods } = e.data;
  
  const results: Record<number, number[]> = {};

  periods.forEach(period => {
    const sma: number[] = new Array(prices.length).fill(NaN);
    let sum = 0;
    
    for (let i = 0; i < prices.length; i++) {
      sum += prices[i];
      if (i >= period) {
        sum -= prices[i - period];
      }
      if (i >= period - 1) {
        sma[i] = sum / period;
      }
    }
    results[period] = sma;
  });

  self.postMessage(results);
};
