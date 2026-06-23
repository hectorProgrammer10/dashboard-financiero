import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { DeepAnalysisPanel } from '../DeepAnalysisPanel';
import { useMarketStore } from '../../../../shared/store/useMarketStore';

// Mock SWR to prevent raw API fetches and return controlled mock data
jest.mock('swr', () => {
  return jest.fn().mockReturnValue({
    data: [
      [1700000000000, 64000, 64100, 63900, 64050, 100],
      [1700000060000, 64050, 64200, 64000, 64150, 120]
    ],
    isLoading: false,
    isValidating: false
  });
});

describe('DeepAnalysisPanel component', () => {
  beforeEach(() => {
    useMarketStore.setState({
      selectedSymbol: null,
      liveData: {
        lastPrice: null,
        priceChangePercent: null
      }
    });
  });

  it('renders nothing when no symbol is selected in the store', () => {
    const { container } = render(<DeepAnalysisPanel />);
    expect(container.firstChild).toBeNull();
  });

  it('renders chart analytics and news when selectedSymbol is set', () => {
    act(() => {
      useMarketStore.setState({ selectedSymbol: 'BTCUSDT' });
    });

    render(<DeepAnalysisPanel />);
    
    // Check asset heading
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument();
    
    // Check timeframe filter buttons
    expect(screen.getByText('1D')).toBeInTheDocument();
    expect(screen.getByText('1W')).toBeInTheDocument();
    expect(screen.getByText('1M')).toBeInTheDocument();
    expect(screen.getByText('1Y')).toBeInTheDocument();
    
    // Check chart component exists
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
  });

  it('toggles timeframe state and fires recalculations when clicking filter buttons', () => {
    act(() => {
      useMarketStore.setState({ selectedSymbol: 'BTCUSDT' });
    });

    render(<DeepAnalysisPanel />);
    
    const timeFrameButton = screen.getByText('1D');
    
    // Initially selected is 1Y (default in code is '1Y')
    expect(timeFrameButton).not.toHaveClass('bg-blue-600/80');

    act(() => {
      fireEvent.click(timeFrameButton);
    });

    // Check active style was added (classes indicate selection state)
    expect(timeFrameButton).toHaveClass('bg-blue-600/80');
  });

  it('closes the panel and clears the store when close button is clicked', () => {
    act(() => {
      useMarketStore.setState({ selectedSymbol: 'BTCUSDT' });
    });

    render(<DeepAnalysisPanel />);
    
    const closeButton = screen.getByText('✕');
    
    act(() => {
      fireEvent.click(closeButton);
    });

    // Selected symbol in the store must be cleared to null
    expect(useMarketStore.getState().selectedSymbol).toBeNull();
  });

  it('terminates web workers on unmount to avoid CPU/memory leaks', () => {
    act(() => {
      useMarketStore.setState({ selectedSymbol: 'BTCUSDT' });
    });

    const terminateSpy = jest.spyOn(global.Worker.prototype, 'terminate');
    const { unmount } = render(<DeepAnalysisPanel />);
    
    unmount();
    
    expect(terminateSpy).toHaveBeenCalled();
    terminateSpy.mockRestore();
  });
});
