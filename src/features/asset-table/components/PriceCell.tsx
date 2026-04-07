'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMarketStore } from '../../../shared/store/useMarketStore';

// Single Intl instance — avoids recreating formatter on every render
const priceFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 6,
});

interface PriceCellProps {
  symbol: string;
  initialValue: number;
}

// Only the PriceCell for the SELECTED symbol reads liveData from the store.
// All other cells use their stable initialValue and never re-render on WS ticks.
const PriceCellInner: React.FC<PriceCellProps> = ({ symbol, initialValue }) => {
  // Granular selectors — Zustand notifies this component only if its slice changed
  const isSelected = useMarketStore((state) => state.selectedSymbol === symbol);
  const livePrice = useMarketStore((state) =>
    state.selectedSymbol === symbol ? state.liveData.lastPrice : null
  );

  // Use live WS price only for the selected symbol; otherwise use the stable REST value
  const displayValue = isSelected && livePrice ? parseFloat(livePrice) : initialValue;

  // React-recommended pattern for "adjusting state when a prop changes":
  // compare prev vs current during render and call setState directly — React
  const [prevDisplayValue, setPrevDisplayValue] = useState(displayValue);
  const [flash, setFlash] = useState<'up' | 'down' | 'none'>('none');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (displayValue !== prevDisplayValue) {
    setPrevDisplayValue(displayValue);
    setFlash(displayValue > prevDisplayValue ? 'up' : 'down');
  }

  // Only use the effect for the async reset (setState called inside a callback, not in the body)
  useEffect(() => {
    if (flash === 'none') return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlash('none'), 350);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [flash]);

  // CSS flash — no Framer Motion loop overhead
  const bgColor =
    flash === 'up'
      ? 'rgba(16, 185, 129, 0.2)'
      : flash === 'down'
      ? 'rgba(244, 63, 94, 0.2)'
      : 'transparent';

  const textColor =
    flash === 'up'
      ? '#34d399'
      : flash === 'down'
      ? '#fb7185'
      : '#f8fafc';

  return (
    <div
      className="px-3 py-1.5 rounded w-full flex justify-end"
      style={{
        backgroundColor: bgColor,
        transition: 'background-color 350ms ease',
      }}
    >
      <span
        className="font-mono text-[15px]"
        style={{ color: textColor, transition: 'color 350ms ease' }}
      >
        ${priceFormatter.format(displayValue)}
      </span>
    </div>
  );
};

// React.memo prevents re-render when parent re-renders but props haven't changed.
// The Zustand selector inside handles live data independently.
export const PriceCell = React.memo(PriceCellInner, (prev, next) => {
  return prev.symbol === next.symbol && prev.initialValue === next.initialValue;
});
