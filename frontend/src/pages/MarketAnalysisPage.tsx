import React from 'react';
import { MarketPreviewChart } from '../components/MarketPreviewChart';
import { BarChart3 } from 'lucide-react';

export const MarketAnalysisPage: React.FC = () => {
  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-3">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Phase 8 Market Analytics</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Market Demand Analytics
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Deterministic frequency calculations across extracted requirements without AI hallucinations.
        </p>
      </div>

      <MarketPreviewChart />
    </div>
  );
};
