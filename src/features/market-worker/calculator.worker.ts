/* eslint-disable no-restricted-globals */

export type HistoricDataPoint = {
  time: number;
  value: number;
  sma20?: number | null;
  sma50?: number | null;
};

export type CalculateMessage = {
  type: 'CALCULATE_SMA';
  payload: {
    data: HistoricDataPoint[];
  };
};

function calculateSMA(data: HistoricDataPoint[], period: number, currentIndex: number): number | null {
  if (currentIndex < period - 1) return null;
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[currentIndex - i].value;
  }
  return sum / period;
}

self.onmessage = (event: MessageEvent<CalculateMessage>) => {
  const { type, payload } = event.data;

  if (type === 'CALCULATE_SMA') {
    const { data } = payload;

    const processedPoints = data.map((point, idx) => {
      return {
        ...point,
        sma20: calculateSMA(data, 20, idx),
        sma50: calculateSMA(data, 50, idx),
      };
    });

    self.postMessage({
      type: 'CALCULATION_COMPLETE',
      payload: {
        points: processedPoints,
      }
    });
  }
};

export {};
