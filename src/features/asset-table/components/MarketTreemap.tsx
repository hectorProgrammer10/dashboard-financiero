'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MexcTicker } from '../../../shared/api/mexc';
import { useMarketStore } from '../../../shared/store/useMarketStore';
import { Search } from 'lucide-react';

interface MarketTreemapProps {
  filteredTickers: MexcTicker[];
  searchQuery: string;
  isChartActive: boolean;
}

interface LayoutRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

// Squarified Treemap Layout Algorithm
export function squarify(
  x: number,
  y: number,
  w: number,
  h: number,
  items: { id: string; weight: number }[]
): LayoutRect[] {
  if (items.length === 0) return [];
  if (w <= 0 || h <= 0) return [];

  // Sort items descending
  const sortedItems = [...items].sort((a, b) => b.weight - a.weight);
  const totalWeight = sortedItems.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0) return [];

  const rects: LayoutRect[] = [];
  
  let rx = x;
  let ry = y;
  let rw = w;
  let rh = h;

  const scale = (rw * rh) / totalWeight;
  const scaledItems = sortedItems.map(item => ({
    id: item.id,
    area: item.weight * scale
  }));

  let row: typeof scaledItems = [];

  const worstRatio = (row: typeof scaledItems, length: number) => {
    if (row.length === 0) return Infinity;
    const areas = row.map(r => r.area);
    const minArea = Math.min(...areas);
    const maxArea = Math.max(...areas);
    const sumArea = areas.reduce((sum, a) => sum + a, 0);
    
    return Math.max(
      (length * length * maxArea) / (sumArea * sumArea),
      (sumArea * sumArea) / (length * length * minArea)
    );
  };

  const layoutRow = (row: typeof scaledItems, length: number, vertical: boolean) => {
    const sumArea = row.reduce((sum, r) => sum + r.area, 0);
    const rowBreadth = sumArea / length;
    
    let offset = 0;
    for (const item of row) {
      if (vertical) {
        // Laying out along the horizontal edge (rw)
        const cardWidth = item.area / rowBreadth;
        rects.push({
          id: item.id,
          x: rx + offset,
          y: ry,
          width: cardWidth,
          height: rowBreadth
        });
        offset += cardWidth;
      } else {
        // Laying out along the vertical edge (rh)
        const cardHeight = item.area / rowBreadth;
        rects.push({
          id: item.id,
          x: rx,
          y: ry + offset,
          width: rowBreadth,
          height: cardHeight
        });
        offset += cardHeight;
      }
    }

    if (vertical) {
      ry += rowBreadth;
      rh = Math.max(0, rh - rowBreadth);
    } else {
      rx += rowBreadth;
      rw = Math.max(0, rw - rowBreadth);
    }
  };

  for (const item of scaledItems) {
    const vertical = rw < rh;
    const length = vertical ? rw : rh;
    
    const newRow = [...row, item];
    if (worstRatio(newRow, length) <= worstRatio(row, length)) {
      row = newRow;
    } else {
      layoutRow(row, length, vertical);
      row = [item];
    }
  }
  
  if (row.length > 0) {
    const vertical = rw < rh;
    const length = vertical ? rw : rh;
    layoutRow(row, length, vertical);
  }

  return rects;
}

// Helper to pre-compute and cache supply (consistent with MarketGrid)
const supplyCache = new Map<string, number>();
const getSupply = (symbol: string): number => {
  if (supplyCache.has(symbol)) return supplyCache.get(symbol)!;
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i);
  const supply = (seed * 1_000_000) + 14_500_000;
  supplyCache.set(symbol, supply);
  return supply;
};

// Sub-component for individual cards to encapsulate live WS updates
interface TreemapCardProps {
  ticker: MexcTicker;
  width: number;
  height: number;
  dominancePercent?: number;
}

const TreemapCardInner: React.FC<TreemapCardProps> = ({ ticker, width, height, dominancePercent }) => {
  const setSelectedSymbol = useMarketStore(state => state.setSelectedSymbol);

  // Granular selectors to prevent re-renders when other symbols receive live updates
  const isSelected = useMarketStore(state => state.selectedSymbol === ticker.symbol);
  const livePrice = useMarketStore(state => 
    state.selectedSymbol === ticker.symbol ? state.liveData.lastPrice : null
  );
  const liveChange = useMarketStore(state => 
    state.selectedSymbol === ticker.symbol ? state.liveData.priceChangePercent : null
  );
  
  const price = livePrice ? parseFloat(livePrice) : parseFloat(ticker.lastPrice);
  const change = liveChange !== null ? parseFloat(liveChange) : parseFloat(ticker.priceChangePercent);
  const changePercentStr = (change * 100).toFixed(2);
  const isPositive = change >= 0;

  // Formatting configurations
  const formattedPrice = price >= 1 ? price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : price.toFixed(6);

  // Background and border styles depending on price change sign
  const bgClass = isPositive 
    ? 'bg-[#14532d]/80 border-emerald-500/20 hover:bg-[#1b6136]/90 hover:border-emerald-400/40 text-emerald-100 font-sans'
    : 'bg-[#7f1d1d]/80 border-rose-500/20 hover:bg-[#991b1b]/90 hover:border-rose-400/40 text-rose-100 font-sans';

  const selectRing = isSelected 
    ? 'ring-2 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-10 scale-[0.99]' 
    : 'hover:scale-[1.01]';

  // Dynamic padding and text visibility based on pixel dimensions
  const showDetail = width >= 140 && height >= 110;
  const showMedium = !showDetail && width >= 80 && height >= 60;
  const showSmall = !showDetail && !showMedium && width >= 45 && height >= 35;
  const showMicro = !showDetail && !showMedium && !showSmall;

  let paddingClass = 'p-1.5';
  if (showDetail) {
    paddingClass = 'p-4 lg:p-5';
  } else if (showMedium) {
    paddingClass = 'p-2.5';
  }

  return (
    <div
      onClick={() => setSelectedSymbol(ticker.symbol)}
      className={`h-full w-full rounded-xl flex flex-col justify-center border transition-all duration-300 cursor-pointer select-none ${bgClass} ${selectRing} ${paddingClass}`}
    >
      {showDetail && (
        <div className="flex flex-col h-full justify-between py-1">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 font-semibold font-mono">
              {ticker.symbol}
            </span>
            <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-0.5 leading-none">
              {ticker.symbol.replace('USDT', '')}
            </h3>
          </div>
          <div className="flex flex-col gap-0.5 mt-2">
            <span className="text-lg lg:text-xl font-bold font-mono text-white leading-tight">
              ${formattedPrice}
            </span>
            <span className={`text-xs lg:text-sm font-bold font-mono flex items-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{changePercentStr}%
            </span>
          </div>
          {dominancePercent !== undefined && (
            <span className="text-[10px] text-white/40 font-mono mt-auto pt-2 border-t border-white/5">
              Dom: {dominancePercent.toFixed(2)}%
            </span>
          )}
        </div>
      )}

      {showMedium && (
        <div className="flex flex-col justify-between h-full py-0.5">
          <div>
            <span className="text-[8px] uppercase text-white/40 font-mono block leading-none">
              {ticker.symbol}
            </span>
            <h3 className="text-base font-bold text-white tracking-tight leading-tight mt-0.5">
              {ticker.symbol.replace('USDT', '')}
            </h3>
          </div>
          <div className="mt-1">
            <span className="text-xs font-bold font-mono text-white block leading-none">
              ${formattedPrice}
            </span>
            <span className={`text-[9px] font-semibold font-mono flex items-center mt-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositive ? '▲' : '▼'} {changePercentStr}%
            </span>
          </div>
        </div>
      )}

      {showSmall && (
        <div className="flex flex-col h-full justify-between py-0.5">
          <h4 className="text-[10px] font-bold text-white truncate leading-none" title={ticker.symbol.replace('USDT', '')}>
            {ticker.symbol.replace('USDT', '')}
          </h4>
          <span className="text-[9px] font-mono text-white/70 truncate leading-none">
            ${formattedPrice}
          </span>
          <span className={`text-[8px] font-mono leading-none ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '▲' : '▼'} {changePercentStr}%
          </span>
        </div>
      )}

      {showMicro && (
        <div className="flex flex-col h-full justify-center items-center py-0.5 text-center">
          <h4 className="text-[10px] font-bold text-white leading-none truncate w-full" title={ticker.symbol.replace('USDT', '')}>
            {ticker.symbol.replace('USDT', '')}
          </h4>
        </div>
      )}
    </div>
  );
};

const TreemapCard = React.memo(TreemapCardInner, (prev, next) => {
  return (
    prev.ticker.symbol === next.ticker.symbol &&
    prev.ticker.lastPrice === next.ticker.lastPrice &&
    prev.ticker.priceChangePercent === next.ticker.priceChangePercent &&
    prev.width === next.width &&
    prev.height === next.height &&
    prev.dominancePercent === next.dominancePercent
  );
});

interface TreemapSectionProps {
  items: (MexcTicker & { dominance: number })[];
  title: string;
  heightClass: string;
}

const TreemapSectionInner: React.FC<TreemapSectionProps> = ({ items, title, heightClass }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(element);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const rects = useMemo(() => {
    const { width, height } = dimensions;
    if (width === 0 || height === 0 || items.length === 0) return [];
    
    return squarify(
      0,
      0,
      width,
      height,
      items.map(item => ({ id: item.symbol, weight: item.dominance }))
    );
  }, [items, dimensions]);

  const rectsMap = useMemo(() => {
    const map = new Map<string, typeof rects[0]>();
    for (const r of rects) {
      map.set(r.id, r);
    }
    return map;
  }, [rects]);

  return (
    <section className="w-full flex flex-col gap-3">
      <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold font-sans">
        {title}
      </h3>
      <div 
        ref={containerRef} 
        className={`relative w-full rounded-2xl overflow-hidden border border-white/5 bg-blue-900/10 ${heightClass}`}
      >
        {dimensions.width > 0 && dimensions.height > 0 && items.map(item => {
          const rect = rectsMap.get(item.symbol);
          if (!rect) return null;
          return (
            <div
              key={item.symbol}
              style={{
                position: 'absolute',
                left: `${rect.x}px`,
                top: `${rect.y}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
                padding: '2px', // Gap size
              }}
            >
              <TreemapCard
                ticker={item}
                width={rect.width - 4}
                height={rect.height - 4}
                dominancePercent={item.dominance}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};

const TreemapSection = React.memo(TreemapSectionInner);

// Categorize helper functions
const isBitcoinGroup = (symbol: string) => {
  const name = symbol.replace('USDT', '');
  return ['BTC', 'BCH', 'WBTC'].includes(name);
};

const isInfraGroup = (symbol: string) => {
  const name = symbol.replace('USDT', '');
  return [
    'ETH', 'BNB', 'XRP', 'SOL', 'TRX', 'ADA', 'LTC', 'AVAX', 
    'NEAR', 'ICP', 'ETC', 'SUI', 'ONT', 'DOT', 'ATOM'
  ].includes(name);
};

export const MarketTreemap: React.FC<MarketTreemapProps> = ({ filteredTickers, searchQuery, isChartActive }) => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isStacked = isChartActive || isMobile;

  // Slice down to top 40 assets
  const top40Tickers = useMemo(() => {
    return filteredTickers.slice(0, 40);
  }, [filteredTickers]);

  // Compute market cap and dominance relative to top 40
  const top40WithDominance = useMemo(() => {
    const caps = top40Tickers.map(t => {
      const price = parseFloat(t.lastPrice);
      const supply = getSupply(t.symbol);
      return { ticker: t, marketCap: price * supply };
    });

    const totalMarketCap = caps.reduce((sum, item) => sum + item.marketCap, 0);

    return caps.map(item => {
      const dominance = totalMarketCap > 0 ? (item.marketCap / totalMarketCap) * 100 : 0;
      return {
        ...item.ticker,
        dominance
      };
    });
  }, [top40Tickers]);

  // Group assets in top 40
  const btcGroup = useMemo(() => 
    top40WithDominance.filter(t => isBitcoinGroup(t.symbol))
  , [top40WithDominance]);

  const infraGroup = useMemo(() => 
    top40WithDominance.filter(t => isInfraGroup(t.symbol))
  , [top40WithDominance]);

  const othersGroup = useMemo(() => 
    top40WithDominance.filter(t => !isBitcoinGroup(t.symbol) && !isInfraGroup(t.symbol))
  , [top40WithDominance]);

  if (filteredTickers.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center gap-3 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl py-20 text-slate-500">
        <Search className="w-10 h-10 text-slate-700" />
        <span className="text-sm font-medium">No tokens found for &quot;{searchQuery}&quot;</span>
      </div>
    );
  }

  // Conditional layout classes based on whether the layout is stacked
  const containerClass = isStacked
    ? "w-full flex flex-col gap-6 h-auto"
    : "w-full flex flex-col lg:flex-row gap-6 h-full min-h-[600px] lg:min-h-[500px] lg:overflow-hidden";

  const bitcoinPanelWrapperClass = isStacked
    ? "w-full shrink-0"
    : "lg:w-[42%] lg:max-w-[45%] flex flex-col";

  const rightColumnClass = isStacked
    ? "w-full flex flex-col gap-6 shrink-0"
    : "flex-1 flex flex-col gap-6";

  return (
    <div className={containerClass}>
      
      {/* 1. Bitcoin & Derivatives Panel */}
      {btcGroup.length > 0 && (
        <div className={bitcoinPanelWrapperClass}>
          <TreemapSection
            items={btcGroup}
            title="Bitcoin & Derivatives"
            heightClass={isStacked ? "h-[300px]" : "h-[400px] lg:h-[504px]"}
          />
        </div>
      )}

      {/* 2. Infrastructure & Platform AND Others (Right Columns) */}
      <div className={rightColumnClass}>
        
        {/* Infrastructure & Platform Panel */}
        {infraGroup.length > 0 && (
          <TreemapSection
            items={infraGroup}
            title="Infrastructure & Platform"
            heightClass={isStacked ? "h-[450px]" : "h-[280px]"}
          />
        )}

        {/* Others Panel */}
        {othersGroup.length > 0 && (
          <TreemapSection
            items={othersGroup}
            title="Others"
            heightClass={isStacked ? "h-[500px]" : "h-[200px]"}
          />
        )}

      </div>
    </div>
  );
};
