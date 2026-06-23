import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { PriceCell } from '../PriceCell';
import { useMarketStore } from '../../../../shared/store/useMarketStore';

describe('PriceCell component', () => {
  beforeEach(() => {
    // Reset state before each test
    useMarketStore.setState({
      selectedSymbol: null,
      liveData: {
        lastPrice: null,
        priceChangePercent: null
      }
    });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders stable initial price value when symbol is not selected', () => {
    render(<PriceCell symbol="BTCUSDT" initialValue={64000.5} />);
    
    // Expect standard formatted initial value
    expect(screen.getByText('$64,000.50')).toBeInTheDocument();
  });

  it('re-renders with live price when symbol is selected and WS updates', () => {
    const { rerender } = render(<PriceCell symbol="BTCUSDT" initialValue={64000} />);
    
    expect(screen.getByText('$64,000.00')).toBeInTheDocument();

    // Select the symbol in the store
    act(() => {
      useMarketStore.setState({ selectedSymbol: 'BTCUSDT' });
    });

    // Update live WS price in the store
    act(() => {
      useMarketStore.setState({
        liveData: {
          lastPrice: '64500.25',
          priceChangePercent: '0.005'
        }
      });
    });

    // Expect live value to be rendered
    expect(screen.getByText('$64,500.25')).toBeInTheDocument();
  });

  it('flashes green color when price increases', () => {
    render(<PriceCell symbol="BTCUSDT" initialValue={64000} />);
    
    act(() => {
      useMarketStore.setState({ selectedSymbol: 'BTCUSDT' });
    });

    // Trigger price increase
    act(() => {
      useMarketStore.setState({
        liveData: {
          lastPrice: '64100',
          priceChangePercent: '0.001'
        }
      });
    });

    const wrapper = screen.getByText('$64,100.00').parentElement;
    expect(wrapper).toHaveStyle({ backgroundColor: 'rgba(16, 185, 129, 0.2)' }); // Green flash

    // Fast forward timer to clear the flash
    act(() => {
      jest.advanceTimersByTime(350);
    });

    expect(wrapper).toHaveStyle({ backgroundColor: 'transparent' });
  });

  it('flashes red color when price decreases', () => {
    render(<PriceCell symbol="BTCUSDT" initialValue={64000} />);
    
    act(() => {
      useMarketStore.setState({ selectedSymbol: 'BTCUSDT' });
    });

    // Trigger price decrease
    act(() => {
      useMarketStore.setState({
        liveData: {
          lastPrice: '63900',
          priceChangePercent: '-0.001'
        }
      });
    });

    const wrapper = screen.getByText('$63,900.00').parentElement;
    expect(wrapper).toHaveStyle({ backgroundColor: 'rgba(244, 63, 94, 0.2)' }); // Red flash
  });
});
