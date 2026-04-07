'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNewsApi } from '../hooks/useNewsApi';
import { AlertCircle, RefreshCcw, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export const NewsCarousel: React.FC = () => {
  const { articles, error, isLoading, retry } = useNewsApi();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Take top 3 articles
  const topArticles = articles?.slice(0, 3) || [];

  useEffect(() => {
    if (topArticles.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topArticles.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [topArticles.length, isPaused]);

  if (error) {
    return (
      <div className="w-full bg-rose-950/20 border border-rose-900/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 backdrop-blur-sm min-h-[200px]">
        <div className="w-12 h-12 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
          <AlertCircle className="w-6 h-6 text-rose-400" />
        </div>
        <div className="text-center">
          <h3 className="text-rose-200 font-semibold mb-1">Error Loading News</h3>
          <p className="text-rose-400/80 text-sm">{error.message || 'We could not load the latest updates.'}</p>
        </div>
        <button
          onClick={retry}
          className="mt-2 flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-lg text-sm transition-colors border border-rose-500/20"
        >
          <RefreshCcw className="w-4 h-4" />
          Retry Connection
        </button>
      </div>
    );
  }

  if (isLoading || topArticles.length === 0) {
    return (
      <div className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl min-h-[200px] flex items-center justify-center relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-[shimmer_2s_infinite] -translate-x-[100%]" 
             style={{ 
               backgroundImage: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.1), transparent)' 
             }} 
        />
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <p className="text-blue-300/70 text-sm font-mono animate-pulse">Scanning news feeds...</p>
        </div>
      </div>
    );
  }

  const currentArticle = topArticles[currentIndex];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % topArticles.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + topArticles.length) % topArticles.length);

  return (
    <div 
      className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative group shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header Tag */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(59,130,246,0.8)]"></span>
        <span className="text-xs font-bold text-white tracking-widest uppercase font-mono">Market Intel</span>
      </div>

      <div className="relative h-[240px] sm:h-[280px] w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image with Fallback */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${currentArticle.urlToImage || 'https://images.unsplash.com/photo-1621501103258-3e0f9891fb2e?q=80&w=2070&auto=format&fit=crop'})` 
              }}
            >
              {/* Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />
            </div>

            {/* Content Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 z-10 w-full md:w-3/4">
              <span className="text-blue-400 text-xs font-mono mb-2 drop-shadow-md">
                {new Date(currentArticle.publishedAt).toLocaleDateString(undefined, { 
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                })} 
                {currentArticle.source.name ? ` • ${currentArticle.source.name}` : ''}
              </span>
              
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
                {currentArticle.title}
              </h2>
              
              <p className="text-slate-200 text-sm line-clamp-2 md:line-clamp-3 mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {currentArticle.description}
              </p>

              <a 
                href={currentArticle.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-600/80 hover:bg-blue-500 backdrop-blur-xl px-4 py-2 rounded-lg w-fit transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] border border-blue-400/30"
              >
                Read Full Context
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons (Appear on Hover) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 px-4 flex justify-between z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={handlePrev}
          className="pointer-events-auto p-2 bg-slate-900/60 hover:bg-blue-600/60 backdrop-blur-xl border border-white/10 rounded-full text-white transition-all transform hover:scale-110 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={handleNext}
          className="pointer-events-auto p-2 bg-slate-900/60 hover:bg-blue-600/60 backdrop-blur-xl border border-white/10 rounded-full text-white transition-all transform hover:scale-110 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-4 right-6 z-20 flex gap-2">
        {topArticles.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 shadow-[0_2px_4px_rgba(0,0,0,0.5)] ${
              idx === currentIndex 
                ? 'w-6 bg-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.8)]' 
                : 'bg-white/40 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
