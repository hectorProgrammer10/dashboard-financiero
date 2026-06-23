import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ApiErrorScreen } from '../ApiErrorScreen';

describe('ApiErrorScreen component', () => {
  it('renders correctly with default error information', () => {
    render(<ApiErrorScreen onRetry={jest.fn()} />);

    expect(screen.getByText('System Data Unavailable')).toBeInTheDocument();
    expect(screen.getByText(/We encountered a communication barrier/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry Connection/i })).toBeInTheDocument();
  });

  it('triggers onRetry callback when clicking Retry Connection button', () => {
    const onRetryMock = jest.fn();
    render(<ApiErrorScreen onRetry={onRetryMock} />);

    const retryButton = screen.getByRole('button', { name: /Retry Connection/i });
    fireEvent.click(retryButton);

    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
