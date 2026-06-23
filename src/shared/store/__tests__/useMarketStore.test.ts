import { useMarketStore } from '../useMarketStore';

describe('zustand market store', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useMarketStore.setState({
      selectedSymbol: null,
      liveData: {
        lastPrice: null,
        priceChangePercent: null
      }
    });
  });

  it('has correct initial state', () => {
    const state = useMarketStore.getState();
    expect(state.selectedSymbol).toBeNull();
    expect(state.liveData.lastPrice).toBeNull();
    expect(state.liveData.priceChangePercent).toBeNull();
  });

  it('updates selectedSymbol and clears liveData when calling setSelectedSymbol', () => {
    // Set dummy live data first
    useMarketStore.getState().setLiveData('65000', '0.02');
    expect(useMarketStore.getState().liveData.lastPrice).toBe('65000');

    // Call setSelectedSymbol
    useMarketStore.getState().setSelectedSymbol('BTCUSDT');
    
    const state = useMarketStore.getState();
    expect(state.selectedSymbol).toBe('BTCUSDT');
    // Live data must be reset to null when selectedSymbol changes
    expect(state.liveData.lastPrice).toBeNull();
    expect(state.liveData.priceChangePercent).toBeNull();
  });

  it('updates liveData when calling setLiveData', () => {
    useMarketStore.getState().setLiveData('3500', '-0.01');
    
    const state = useMarketStore.getState();
    expect(state.liveData.lastPrice).toBe('3500');
    expect(state.liveData.priceChangePercent).toBe('-0.01');
  });

  it('allows clearing selectedSymbol by setting it to null', () => {
    useMarketStore.getState().setSelectedSymbol('ETHUSDT');
    expect(useMarketStore.getState().selectedSymbol).toBe('ETHUSDT');

    useMarketStore.getState().setSelectedSymbol(null);
    expect(useMarketStore.getState().selectedSymbol).toBeNull();
  });
});
