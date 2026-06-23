import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { SplashScreen } from '../SplashScreen';

describe('SplashScreen component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders correctly initially', () => {
    render(<SplashScreen onComplete={jest.fn()} />);
    
    // Check if component elements are rendered
    expect(screen.getByText('ApexMarket')).toBeInTheDocument();
  });

  it('triggers onComplete callback after timeouts expire', () => {
    const onCompleteMock = jest.fn();
    render(<SplashScreen onComplete={onCompleteMock} />);
    
    expect(onCompleteMock).not.toHaveBeenCalled();

    // Fast-forward timers: first timer is 1966ms, second is 250ms -> total 2216ms
    act(() => {
      jest.advanceTimersByTime(1966);
    });
    
    expect(onCompleteMock).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(onCompleteMock).toHaveBeenCalledTimes(1);
  });

  it('cleans up timeout timers on unmount', () => {
    const onCompleteMock = jest.fn();
    const spy = jest.spyOn(global, 'clearTimeout');
    
    const { unmount } = render(<SplashScreen onComplete={onCompleteMock} />);
    
    unmount();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
