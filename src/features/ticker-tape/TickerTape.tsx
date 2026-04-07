'use client';

import React from 'react';
import { useCoinMarkets } from '../../shared/api/useCoinMarkets';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const TickerTape: React.FC = () => {
  const { coins, isLoading } = useCoinMarkets();

  if (isLoading || !coins) {
    return <div className="h-10 bg-[#0B0E14] border-b border-[#151924] w-full" />;
  }

  // Duplicate for seamless infinite scrolling
  const tickerItems = [...coins.slice(0, 15), ...coins.slice(0, 15)];

  return (
    <div className="h-10 bg-[#151924]/80 backdrop-blur-md border-b border-[#2A2E39] w-full overflow-hidden flex items-center shrink-0">
      <div className="flex animate-marquee whitespace-nowrap">
        {tickerItems.map((coin, index) => (
          <div key={`${coin.id}-${index}`} className="flex items-center gap-3 mx-6 font-mono text-sm">
            <span className="text-slate-400 font-semibold">{coin.symbol.toUpperCase()}</span>
            <span className="text-slate-100">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
            
            <span className={`flex items-center gap-1 ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {coin.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
