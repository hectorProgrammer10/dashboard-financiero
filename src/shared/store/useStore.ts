import { create } from 'zustand';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  sparkline_in_7d?: { price: number[] };
  image: string;
}

interface AppState {
  selectedAsset: Asset | null;
  setSelectedAsset: (asset: Asset) => void;
  timeframe: '1D' | '1W' | '1M' | '1Y';
  setTimeframe: (tf: '1D' | '1W' | '1M' | '1Y') => void;
  enableSMA: boolean;
  setEnableSMA: (enabled: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  selectedAsset: null,
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  timeframe: '1D', // Default
  setTimeframe: (tf) => set({ timeframe: tf }),
  enableSMA: false,
  setEnableSMA: (enabled) => set({ enableSMA: enabled }),
}));
