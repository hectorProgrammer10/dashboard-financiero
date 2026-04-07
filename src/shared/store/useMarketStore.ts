import { create } from 'zustand';

interface MarketState {
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string | null) => void;
  // Live WS Data for the specifically selected pair
  liveData: {
    lastPrice: string | null;
    priceChangePercent: string | null;
  };
  setLiveData: (price: string, percent: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  selectedSymbol: null,
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol, liveData: { lastPrice: null, priceChangePercent: null } }),
  liveData: {
    lastPrice: null,
    priceChangePercent: null,
  },
  setLiveData: (lastPrice, priceChangePercent) => set({ liveData: { lastPrice, priceChangePercent } }),
}));
