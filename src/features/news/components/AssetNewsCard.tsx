'use client';

import React from 'react';
import { useNewsApi } from '../hooks/useNewsApi';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface AssetNewsCardProps {
  symbol: string;
}

export const AssetNewsCard: React.FC<AssetNewsCardProps> = ({ symbol }) => {
  // Strip 'USDT' to get just the coin name, e.g., BTC, ETH, SOL
  const assetName = symbol.replace('USDT', '');
  const query = `${assetName} cryptocurrency`;

  const { articles, error, isLoading } = useNewsApi(query);

  const topArticles = articles?.slice(0, 2) || []; // Get the top 2 relevant articles

  if (isLoading) {
    return (
      <div className="mt-6 border-t border-white/5 pt-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          Latest {assetName} News
        </h3>
        <div className="flex flex-col gap-4">
          <div className="w-full bg-slate-800/30 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-700/30 rounded w-full mb-1" />
            <div className="h-3 bg-slate-700/30 rounded w-5/6 mb-4" />
            <div className="h-8 bg-slate-700/50 rounded-md w-full" />
          </div>
          <div className="w-full bg-slate-800/30 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-700/30 rounded w-full mb-1" />
            <div className="h-3 bg-slate-700/30 rounded w-5/6 mb-4" />
            <div className="h-8 bg-slate-700/50 rounded-md w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || topArticles.length === 0) {
    return (
      <div className="mt-6 border-t border-white/5 pt-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          Latest {assetName} News
        </h3>
        <div className="w-full bg-slate-900/40 backdrop-blur-md rounded-xl p-4 flex items-start gap-3 border border-white/5 text-slate-400">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-xs">No recent news available for {assetName} at this moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 border-t border-white/5 pt-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
        Top {assetName} Stories
      </h3>
      
      <div className="flex flex-col gap-4">
        {topArticles.map((article, idx) => (
          <div key={idx} className="group bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-blue-500/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden transition-all duration-300">
            {article.urlToImage && (
              <div className="h-24 w-full relative overflow-hidden bg-slate-900">
                <img 
                  src={article.urlToImage} 
                  alt={article.title}
                  className="object-cover w-full h-full opacity-70 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
              </div>
            )}
            
            <div className="p-5">
              <p className="text-[10px] uppercase font-mono tracking-widest text-blue-400 mb-1.5 drop-shadow-sm">
                {article.source.name || 'NewsAPI'} • {new Date(article.publishedAt).toLocaleDateString()}
              </p>
              <h4 className="text-sm font-bold text-slate-100 leading-snug line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
                {article.title}
              </h4>
              <p className="text-xs text-slate-300/80 line-clamp-2 mb-4">
                {article.description}
              </p>
              
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 font-medium text-xs rounded-xl transition-all border border-blue-500/20 hover:border-blue-500/40 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              >
                Read Article
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
