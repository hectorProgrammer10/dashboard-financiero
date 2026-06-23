import '@testing-library/jest-dom';
import React from 'react';

// Polyfill/Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {
    if (this.callback) {
      // Trigger callback with default dimensions to let components calculate initial layouts
      this.callback([
        {
          contentRect: {
            width: 800,
            height: 600,
          },
        },
      ]);
    }
  }
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock react-chartjs-2 globally
jest.mock('react-chartjs-2', () => ({
  Line: () => React.createElement('div', { 'data-testid': 'mock-line-chart' }),
}));

// Mock chart.js globally
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
  Filler: jest.fn(),
}));

// Mock Web Worker (used in DeepAnalysisPanel.tsx)
global.Worker = class MockWorker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
  }
  postMessage(message) {
    const prices = message.prices || [];
    const dummySma = {
      50: new Array(prices.length).fill(64000),
      200: new Array(prices.length).fill(63000),
    };
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage({ data: dummySma });
      }
    }, 0);
  }
  terminate() {}
};

// Mock framer-motion globally
jest.mock('framer-motion', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ReactFM = require('react');

  const MockDiv = ReactFM.forwardRef(function MockMotionDiv(props, ref) {
    const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
    return ReactFM.createElement('div', { ...rest, ref });
  });
  MockDiv.displayName = 'MockMotionDiv';

  const MockPath = ReactFM.forwardRef(function MockMotionPath(props, ref) {
    const { initial: _i, animate: _a, exit: _e, transition: _t, ...rest } = props;
    return ReactFM.createElement('path', { ...rest, ref });
  });
  MockPath.displayName = 'MockMotionPath';

  return {
    motion: {
      div: MockDiv,
      path: MockPath,
    },
    AnimatePresence: ({ children }) => ReactFM.createElement(ReactFM.Fragment, {}, children),
  };
});
