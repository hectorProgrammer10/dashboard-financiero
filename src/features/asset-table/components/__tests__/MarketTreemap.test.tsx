import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MarketTreemap } from '../MarketTreemap';
import { MexcTicker } from '../../../../shared/api/mexc';
import { useMarketStore } from '../../../../shared/store/useMarketStore';

describe('MarketTreemap component', () => {
  const mockTickers: MexcTicker[] = [
    { symbol: 'BTCUSDT', lastPrice: '64000', priceChange: '1000', priceChangePercent: '0.015', quoteVolume: '500000', volume: '10', prevClosePrice: '63000', openTime: 0, closeTime: 0 },
    { symbol: 'BCHUSDT', lastPrice: '400', priceChange: '-10', priceChangePercent: '-0.01', quoteVolume: '80000', volume: '10', prevClosePrice: '410', openTime: 0, closeTime: 0 },
    { symbol: 'ETHUSDT', lastPrice: '3500', priceChange: '70', priceChangePercent: '0.02', quoteVolume: '400000', volume: '10', prevClosePrice: '3430', openTime: 0, closeTime: 0 },
    { symbol: 'BNBUSDT', lastPrice: '580', priceChange: '3', priceChangePercent: '0.005', quoteVolume: '300000', volume: '10', prevClosePrice: '577', openTime: 0, closeTime: 0 },
    { symbol: 'GOLDUSDT', lastPrice: '2300', priceChange: '5', priceChangePercent: '0.002', quoteVolume: '20000', volume: '10', prevClosePrice: '2295', openTime: 0, closeTime: 0 }
  ];

  beforeEach(() => {
    useMarketStore.setState({
      selectedSymbol: null,
      liveData: {
        lastPrice: null,
        priceChangePercent: null
      }
    });
  });

  it('renders "No tokens found" fallback when tickers list is empty', () => {
    render(<MarketTreemap filteredTickers={[]} searchQuery="invalid" isChartActive={false} />);
    
    expect(screen.getByText('No tokens found for "invalid"')).toBeInTheDocument();
  });

  it('segments and renders categorized assets in their respective sections', () => {
    render(<MarketTreemap filteredTickers={mockTickers} searchQuery="" isChartActive={false} />);

    // Verify section headings are present
    expect(screen.getByText('Bitcoin & Derivatives')).toBeInTheDocument();
    expect(screen.getByText('Infrastructure & Platform')).toBeInTheDocument();
    expect(screen.getByText('Others')).toBeInTheDocument();

    // Verify assets are placed inside their categories (checking element existence)
    expect(screen.getAllByText('BTC')).toHaveLength(1);
    expect(screen.getAllByText('ETH')).toHaveLength(1);
    expect(screen.getAllByText('GOLD')).toHaveLength(1);
  });

  it('selects active symbol inside store when card is clicked', () => {
    render(<MarketTreemap filteredTickers={mockTickers} searchQuery="" isChartActive={false} />);

    const btcCard = screen.getAllByText('BTC')[0];
    
    act(() => {
      fireEvent.click(btcCard);
    });

    // Zustand store selectedSymbol must be updated
    expect(useMarketStore.getState().selectedSymbol).toBe('BTCUSDT');
  });

  it('limits rendering to the top 40 assets', () => {
    // Generate 50 tickers
    const longTickers: MexcTicker[] = Array.from({ length: 50 }, (_, i) => ({
      symbol: `TOKEN${i}USDT`,
      lastPrice: '1.0',
      priceChange: '0.01',
      priceChangePercent: '0.01',
      quoteVolume: (100000 - i * 1000).toString(),
      volume: '10',
      prevClosePrice: '1.0',
      openTime: 0,
      closeTime: 0
    }));

    render(<MarketTreemap filteredTickers={longTickers} searchQuery="" isChartActive={false} />);

    // Top 40 should be rendered, 41st should not be in the document
    expect(screen.getAllByText('TOKEN39')).toHaveLength(1); // Index 39 (40th item)
    expect(screen.queryByText('TOKEN40')).toBeNull(); // Index 40 (41st item, excluded)
  });
});
