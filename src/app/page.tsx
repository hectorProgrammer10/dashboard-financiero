'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MarketGrid } from '../features/asset-table/components/MarketGrid';
import { DeepAnalysisPanel } from '../features/price-chart/components/DeepAnalysisPanel';
import { useMarketStore } from '../shared/store/useMarketStore';
import { useMexcWebSocket } from '../shared/hooks/useMexcWebSocket';
import { SplashScreen } from '../shared/components/SplashScreen';

export default function Home() {
  const selectedSymbol = useMarketStore(state => state.selectedSymbol);
  const [showSplash, setShowSplash] = useState(true);
  
  // Fire up the WS listener context (it intrinsically depends on selectedSymbol internally)
  useMexcWebSocket();

  return (
    <>
    {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
    <div className="min-h-screen bg-[#030712] text-slate-200 selection:bg-blue-500/30 overflow-hidden flex flex-col font-sans">
      {/* Background Decor - Blue Glassmorphism Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-cyan-500/15 blur-[150px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[5%] right-[15%] w-[25%] h-[25%] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed top-[20%] right-[20%] w-[30%] h-[30%] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-5 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl relative z-10 shrink-0">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center border border-blue-400/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-md overflow-hidden">
              <Image id='logo' src="/logoapex.svg" alt="Logo" width={48} height={48} className="object-contain p-1.5 relative z-0 opacity-80" />
              
              {!showSplash && (
                <motion.svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute inset-0 w-full h-full p-2 z-10 pointer-events-none"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 2.2, duration: 0.8 }}
                >
                  {/* Subtle path trace */}
                  <motion.path
                    d="M2 12h3.5l2.5-7 5 14 3.5-7H22"
                    stroke="rgba(14, 165, 233, 0.6)"
                    strokeWidth="1.2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                  />
                  
                  {/* Glowing comet / dot */}
                  <motion.path
                    d="M2 12h3.5l2.5-7 5 14 3.5-7H22"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    initial={{ pathLength: 0, pathOffset: 0 }}
                    animate={{ 
                      pathLength: [0, 0.1, 0.1, 0], 
                      pathOffset: [0, 0, 0.9, 1] 
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
                    className="drop-shadow-[0_0_12px_rgba(56,189,248,1)]"
                  />
                </motion.svg>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">ApexMarket</h1>
              <p className="text-xs text-slate-400 font-medium">High-Concurrency Financial Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono text-slate-500">
            {/* Powered By Badge */}
            <div className="flex items-center gap-1.5 sm:gap-2 border-r border-slate-700/60 pr-2 sm:pr-4 mr-1">
              <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-slate-500 font-sans font-semibold">Powered by MEXC</span>
              <Image src="/MEXC.png" alt="MEXC" width={56} height={14} className="h-3 sm:h-3.5 object-contain opacity-70 hover:opacity-100 transition-opacity" />
            </div>

            {/* WS Indicator */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${selectedSymbol ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
              {selectedSymbol ? <span className="hidden sm:inline">WS: {selectedSymbol}</span> : <span className="hidden sm:inline">WS: INACTIVE</span>}
              <span className="sm:hidden">{selectedSymbol ? selectedSymbol : 'WS'}</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace (Split View) */}
      <main className="flex-1 flex overflow-hidden relative z-10 p-4 sm:p-6 lg:p-8 max-w-[1920px] mx-auto w-full gap-8">
        
        <div className={`flex-1 overflow-y-auto transition-all duration-500 rounded-xl scrollbar-hide`}>
          <MarketGrid />
        </div>

        {selectedSymbol && (
          <DeepAnalysisPanel />
        )}
        
      </main>
    </div>
    </>
  );
}
