'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import useSWR from 'swr';
import { fetchKlines } from '../../../shared/api/mexc';
import { useMarketStore } from '../../../shared/store/useMarketStore';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { AssetNewsCard } from '../../news/components/AssetNewsCard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type Timeframe = '1D' | '1W' | '1M' | '1Y';

const TIMEFRAME_CONFIG: Record<Timeframe, { interval: string; limit: number }> = {
  '1D': { interval: '15m', limit: 96 },   // 15-min candles × 96 = 24h
  '1W': { interval: '1h',  limit: 168 },  // 1h candles × 168 = 7 days
  '1M': { interval: '4h',  limit: 180 },  // 4h candles × 180 ≈ 30 days
  '1Y': { interval: '1d',  limit: 365 },  // daily candles × 365
};

export const DeepAnalysisPanel: React.FC = () => {
  const selectedSymbol = useMarketStore(state => state.selectedSymbol);
  const setSelectedSymbol = useMarketStore(state => state.setSelectedSymbol);
  const liveData = useMarketStore(state => state.liveData);
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');

  const { interval, limit } = TIMEFRAME_CONFIG[timeframe];

  // SWR key includes symbol + timeframe so it refetches on change
  const { data: klines, isLoading, isValidating } = useSWR(
    selectedSymbol ? `klines-${selectedSymbol}-${timeframe}` : null, 
    () => fetchKlines(selectedSymbol!, interval, limit),
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const [smaData, setSmaData] = useState<{ sma50: number[], sma200: number[] } | null>(null);
  const workerRef = useRef<Worker | null>(null);

  // Parse klines and handle Worker logic
  const { dates, prices } = useMemo(() => {
    if (!klines) return { dates: [], prices: [] };

    const dates = klines.map((k: number[]) => {
      const d = new Date(k[0]);
      // Adapt date label format based on timeframe granularity
      if (timeframe === '1D') return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
      if (timeframe === '1W') return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}h`;
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    const prices = klines.map((k: number[]) => parseFloat(k[4] as unknown as string));
    return { dates, prices };
  }, [klines, timeframe]);

  // Update the very last price with live WebSocket data if available
  const currentPrices = useMemo(() => {
    const mutablePrices = [...prices];
    if (liveData.lastPrice && mutablePrices.length > 0) {
      mutablePrices[mutablePrices.length - 1] = parseFloat(liveData.lastPrice);
    }
    return mutablePrices;
  }, [prices, liveData.lastPrice]);

  useEffect(() => {
    if (prices.length > 0) {
      if (!workerRef.current) {
        workerRef.current = new Worker(new URL('../../market-worker/algorithms.worker.ts', import.meta.url));
      }
      
      workerRef.current.onmessage = (e) => {
        setSmaData({
          sma50: e.data[50],
          sma200: e.data[200]
        });
      };

      workerRef.current.postMessage({ prices: currentPrices, periods: [50, 200] });
    }
  }, [prices, currentPrices]);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Reset SMA when timeframe changes so stale lines don't linger
  const handleTimeframeChange = useCallback((tf: Timeframe) => {
    setSmaData(null);
    setTimeframe(tf);
  }, []);

  if (!selectedSymbol) return null;

  const showSpinner = isLoading || isValidating;

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Price',
        data: currentPrices,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        fill: true,
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.2,
      },
      ...(smaData ? [
        {
          label: 'SMA 50',
          data: smaData.sma50,
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointRadius: 0,
          borderDash: [5, 5],
          fill: false,
        },
        {
          label: 'SMA 200',
          data: smaData.sma200,
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointRadius: 0,
          borderDash: [2, 2],
          fill: false,
        }
      ] : [])
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    scales: {
      y: { grid: { color: 'rgba(51, 65, 85, 0.2)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#64748b', maxTicksLimit: 12 } }
    },
    plugins: {
      legend: { labels: { color: '#cbd5e1' } }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  return (
    <div className="w-full xl:w-96 shrink-0 bg-slate-900/40 backdrop-blur-2xl border-l border-white/5 p-6 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] h-full absolute right-0 top-0 z-20 xl:static animate-in slide-in-from-right-8 duration-300 overflow-y-auto scrollbar-hide">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{selectedSymbol}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-mono text-slate-200">
              ${liveData.lastPrice || currentPrices[currentPrices.length - 1]?.toFixed(4) || '---'}
            </span>
            {liveData.priceChangePercent && (
              <span className={`text-sm font-mono ${parseFloat(liveData.priceChangePercent) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {parseFloat(liveData.priceChangePercent) >= 0 ? '+' : ''}{(parseFloat(liveData.priceChangePercent) * 100).toFixed(2)}%
              </span>
            )}
          </div>
        </div>
        <button 
          onClick={() => setSelectedSymbol(null)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Chart area with spinner overlay */}
      <div className="flex-1 w-full max-h-[400px] xl:max-h-none min-h-[300px] relative">
        {showSpinner && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-950/60 backdrop-blur-sm rounded-lg">
            <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs text-blue-300/70 font-mono">Loading {timeframe} data...</span>
          </div>
        )}
        <Line data={chartData} options={chartOptions} />
      </div>

      {/* Timeframe selector */}
      <div className="mt-6 flex justify-between gap-2 border-t border-white/5 pt-4">
        {(['1D', '1W', '1M', '1Y'] as Timeframe[]).map(tf => (
          <button 
            key={tf} 
            onClick={() => handleTimeframeChange(tf)}
            className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
              tf === timeframe 
                ? 'bg-blue-600/80 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] border border-blue-400/30' 
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-blue-500/20 border border-transparent hover:border-blue-500/30'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Asset Specific News Section */}
      <div className="shrink-0 mt-4">
        <AssetNewsCard symbol={selectedSymbol} />
      </div>
    </div>
  );
};
