import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ApiErrorScreen: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0E14] text-slate-300 min-h-[400px] border border-slate-800/50 rounded-xl">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
        <AlertCircle className="w-16 h-16 text-rose-500 relative z-10" />
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">System Data Unavailable</h2>
      <p className="text-slate-400 text-center max-w-md mb-8">
        We encountered a communication barrier while retrieving real-time market data from the MEXC Exchange network. Please verify your connection or try again.
      </p>
      
      <button 
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-[#151924] hover:bg-slate-800 border border-slate-700/50 text-white rounded-lg font-medium transition-all active:scale-95 group shadow-lg"
      >
        <RefreshCw className="w-4 h-4 text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
        Retry Connection
      </button>
    </div>
  );
};
