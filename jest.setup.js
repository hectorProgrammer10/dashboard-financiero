import '@testing-library/jest-dom';
import React from 'react';

// Polyfill/Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
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
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef((props, ref) => {
        // Filter out framer-motion props to prevent React console warnings
        const { initial, animate, exit, transition, ...rest } = props;
        return React.createElement('div', { ...rest, ref });
      }),
      path: React.forwardRef((props, ref) => {
        const { initial, animate, exit, transition, ...rest } = props;
        return React.createElement('path', { ...rest, ref });
      }),
    },
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, {}, children),
  };
});
