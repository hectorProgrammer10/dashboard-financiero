import { fetchTickers, fetchKlines } from '../mexc';

describe('mexc api utilities', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('fetchTickers', () => {
    it('successfully fetches tickers from internal Next.js API route', async () => {
      const mockTickers = [
        { symbol: 'BTCUSDT', lastPrice: '64000', priceChangePercent: '0.01', quoteVolume: '200000' },
        { symbol: 'ETHUSDT', lastPrice: '3500', priceChangePercent: '-0.02', quoteVolume: '150000' }
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockTickers)
      });

      const result = await fetchTickers();
      expect(global.fetch).toHaveBeenCalledWith('/api/tickers');
      expect(result).toEqual(mockTickers);
    });

    it('throws an error if the API response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false
      });

      await expect(fetchTickers()).rejects.toThrow('Error al obtener datos de MEXC');
    });
  });

  describe('fetchKlines', () => {
    it('successfully fetches klines from internal API route with parameters', async () => {
      const mockKlines = [[1700000000000, 64000, 64100, 63900, 64050, 100]];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockKlines)
      });

      const result = await fetchKlines('BTCUSDT', '15m', 96);
      expect(global.fetch).toHaveBeenCalledWith('/api/klines?symbol=BTCUSDT&interval=15m&limit=96');
      expect(result).toEqual(mockKlines);
    });

    it('throws an error if response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false
      });

      await expect(fetchKlines('BTCUSDT')).rejects.toThrow('Error al obtener klines de MEXC');
    });
  });
});
