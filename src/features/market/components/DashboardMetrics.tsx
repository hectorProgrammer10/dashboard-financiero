'use client';

import React from 'react';
import { TrendingUp, Activity, BarChart3, Clock } from 'lucide-react';

interface MetricsProps {
  currentPrice: number;
  totalPoints: number;
}

export const DashboardMetrics: React.FC<MetricsProps> = ({ currentPrice, totalPoints }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur text-slate-200">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-medium tracking-wide">Last Price (Mock)</span>
        </div>
        <div className="text-3xl font-bold tracking-tight">
          ${currentPrice.toFixed(2)}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur text-slate-200">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium tracking-wide">Data Points Rendered</span>
        </div>
        <div className="text-3xl font-bold tracking-tight">
          {totalPoints.toLocaleString()}
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur text-slate-200">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium tracking-wide">Calculations</span>
        </div>
        <div className="text-3xl font-bold tracking-tight">
          Math.SMA
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur text-slate-200">
        <div className="flex items-center gap-2 text-slate-400 mb-2">
          <Clock className="w-4 h-4 text-rose-400" />
          <span className="text-sm font-medium tracking-wide">Thread Load</span>
        </div>
        <div className="text-3xl font-bold tracking-tight">
          Offloaded
        </div>
      </div>
    </div>
  );
};
