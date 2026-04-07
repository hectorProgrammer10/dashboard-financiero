'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useMarketStore } from '../../../shared/store/useMarketStore';

interface PriceCellProps {
  symbol: string;
  initialValue: number;
}

export const PriceCell: React.FC<PriceCellProps> = ({ symbol, initialValue }) => {
  const selectedSymbol = useMarketStore((state) => state.selectedSymbol);
  const liveData = useMarketStore((state) => state.liveData);
  
  // If this symbol is selected and we have live WS data, use it. Otherwise static via REST
  const displayValue = (selectedSymbol === symbol && liveData.lastPrice) 
                        ? parseFloat(liveData.lastPrice) 
                        : initialValue;

  const previousValue = useRef(displayValue);
  const [flash, setFlash] = useState<'up' | 'down' | 'none'>('none');

  useEffect(() => {
    if (displayValue > previousValue.current) {
      setFlash('up');
    } else if (displayValue < previousValue.current) {
      setFlash('down');
    }
    
    previousValue.current = displayValue;

    if (flash !== 'none') {
      const timer = setTimeout(() => setFlash('none'), 300); // 300ms flash duration
      return () => clearTimeout(timer);
    }
  }, [displayValue, flash]);

  const getBackgroundColor = () => {
    if (flash === 'up') return 'rgba(16, 185, 129, 0.2)'; // Emerald
    if (flash === 'down') return 'rgba(244, 63, 94, 0.2)'; // Rose
    return 'transparent';
  };

  const getTextColor = () => {
    if (flash === 'up') return '#34d399';
    if (flash === 'down') return '#fb7185';
    return '#f8fafc'; // Default
  };

  return (
    <motion.div
      initial={false}
      animate={{ backgroundColor: getBackgroundColor() }}
      transition={{ duration: 0.3 }}
      className="px-3 py-1.5 rounded w-full flex justify-end transition-colors"
    >
      <span className="font-mono text-[15px]" style={{ color: getTextColor(), transition: 'color 300ms ease' }}>
        ${displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
      </span>
    </motion.div>
  );
};
