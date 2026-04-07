export const MEXC_WS_URL = 'wss://wbs.mexc.com/ws';

export interface MexcTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  prevClosePrice: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
}

// Fetch through our own Next.js API route (no CORS issues)
export const fetchTickers = async (): Promise<MexcTicker[]> => {
  const response = await fetch('/api/tickers');
  if (!response.ok) {
    throw new Error('Error al obtener datos de MEXC');
  }
  return response.json();
};

export const fetchKlines = async (symbol: string, interval: string = '1d', limit: number = 365): Promise<number[][]> => {
  const response = await fetch(`/api/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Error al obtener klines de MEXC');
  }
  return response.json();
};
