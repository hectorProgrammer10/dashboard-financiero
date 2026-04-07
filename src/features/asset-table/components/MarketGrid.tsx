'use client';

import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { fetchTickers } from '../../../shared/api/mexc';
import { ApiErrorScreen } from '../../../shared/components/ApiErrorScreen';
import { PriceCell } from './PriceCell';
import { useMarketStore } from '../../../shared/store/useMarketStore';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsCarousel } from '../../news/components/NewsCarousel';

const ITEMS_PER_PAGE = 20;

// Deterministic mock generation for missing MEXC fields (Market Cap & Supply)
const generateMockSupply = (symbol: string) => {
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i);
  return (seed * 1000000) + 14500000;
};

export const MarketGrid: React.FC = () => {
  const { data: tickers, error, isLoading, mutate } = useSWR('mexc-tickers', fetchTickers, { 
    refreshInterval: 0,
    revalidateOnFocus: false 
  });
  
  const selectedSymbol = useMarketStore(state => state.selectedSymbol);
  const setSelectedSymbol = useMarketStore(state => state.setSelectedSymbol);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Full filtered list (all USDT pairs with decent volume, sorted by volume)
  const allTickers = useMemo(() => {
    if (!tickers) return [];
    return tickers
      .filter(t => t.symbol.endsWith('USDT') && parseFloat(t.quoteVolume) > 100000)
      .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume));
  }, [tickers]);

  // Apply search filter
  const filteredTickers = useMemo(() => {
    if (!searchQuery.trim()) return allTickers;
    const q = searchQuery.toUpperCase().trim();
    return allTickers.filter(t => {
      const name = t.symbol.replace('USDT', '');
      return name.includes(q) || t.symbol.includes(q);
    });
  }, [allTickers, searchQuery]);

  // Reset to page 1 when search changes
  const safeCurrentPage = useMemo(() => {
    const maxPage = Math.max(1, Math.ceil(filteredTickers.length / ITEMS_PER_PAGE));
    return currentPage > maxPage ? 1 : currentPage;
  }, [filteredTickers.length, currentPage]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredTickers.length / ITEMS_PER_PAGE));
  const paginatedTickers = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return filteredTickers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredTickers, safeCurrentPage]);

  // Global rank offset for the current page
  const rankOffset = (safeCurrentPage - 1) * ITEMS_PER_PAGE;

  if (error) return <ApiErrorScreen onRetry={() => mutate()} />;
  
  if (isLoading) {
    return (
      <div className="w-full flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Relevant News Section */}
      <section className="w-full flex flex-col gap-3">
        <NewsCarousel />
      </section>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search token (e.g. BTC, ETH, SOL)..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          className="w-full bg-slate-900/50 backdrop-blur-md text-white border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500 font-mono shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]"
        />
        {searchQuery && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
            {filteredTickers.length} results
          </span>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-900/60 backdrop-blur-md text-slate-400 border-b border-white/5 sticky top-0 z-10">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">#</th>
              <th scope="col" className="px-6 py-4 font-semibold">Asset</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Price</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">24h Change</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Market Cap (Est)</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Volume (USDT)</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTickers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-slate-700" />
                    <span className="text-sm">No tokens found for &quot;{searchQuery}&quot;</span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTickers.map((ticker, index) => {
                const price = parseFloat(ticker.lastPrice);
                const change = parseFloat(ticker.priceChangePercent);
                const isSelected = selectedSymbol === ticker.symbol;
                const supply = generateMockSupply(ticker.symbol);
                const marketCap = price * supply;
                
                return (
                  <tr 
                    key={ticker.symbol} 
                    onClick={() => setSelectedSymbol(ticker.symbol)}
                    className={`border-b border-white/5 hover:bg-blue-500/10 transition-colors cursor-pointer group ${isSelected ? 'bg-blue-600/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.15)] border-l-2 border-l-blue-500' : ''}`}
                  >
                    <td className="px-6 py-4 font-medium text-slate-500">
                      {rankOffset + index + 1}
                    </td>
                    <td className="px-6 py-4 text-white font-bold tracking-wide flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-slate-800/80 backdrop-blur-sm flex items-center justify-center text-[10px] text-slate-300 font-mono ring-1 ring-white/10 shrink-0 shadow-inner">
                        {ticker.symbol.charAt(0)}
                      </div>
                      {ticker.symbol.replace('USDT', '')} <span className="text-slate-600 font-normal text-xs ml-1">{ticker.symbol}</span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <PriceCell symbol={ticker.symbol} initialValue={price} />
                    </td>
                    <td className={`px-6 py-4 text-right font-mono ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {change >= 0 ? '▲' : '▼'} {Math.abs(change * 100).toFixed(2)}%
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300 font-mono">
                      ${marketCap.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 font-mono">
                      ${parseFloat(ticker.quoteVolume).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredTickers.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-slate-500 font-mono">
            Showing {rankOffset + 1}–{Math.min(rankOffset + ITEMS_PER_PAGE, filteredTickers.length)} of {filteredTickers.length}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safeCurrentPage === 1}
              className="p-2 rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/5 text-slate-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 2)
              .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1]) > 1) acc.push('ellipsis');
                acc.push(p);
                return acc;
              }, [])
              .map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-2 text-slate-600 text-xs">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      item === safeCurrentPage
                        ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-blue-400/50'
                        : 'bg-slate-900/50 backdrop-blur-md border border-white/5 text-slate-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage === totalPages}
              className="p-2 rounded-lg bg-slate-900/50 backdrop-blur-md border border-white/5 text-slate-400 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
