import React from 'react';
import { Target } from 'lucide-react';

export const SkillGapPage: React.FC = () => {
  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-3">
          <Target className="w-3.5 h-3.5" />
          <span>Phase 10 Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Skill Gap Analysis
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Algorithmic comparison between your verified skills and current market requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-rose-500/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">High Priority Gaps</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-mono">&gt;50% Demand</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Critical core skills with high employer demand where proficiency is beginner or missing.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-amber-500/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Medium Priority Gaps</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono">25-50% Demand</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Important secondary technologies and frameworks that elevate interview performance.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/40 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Low / Nice to Have</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">10-25% Demand</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Emerging tools and specialized libraries for extra differentiation.
          </p>
        </div>
      </div>
    </div>
  );
};
