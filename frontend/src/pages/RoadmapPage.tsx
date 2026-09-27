import React from 'react';
import { Compass, Sparkles } from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>Phase 11 Generative Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Personalized Career Roadmap
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Evidence-grounded learning sequence generated via Gemini LLM tailored to your skill gaps.
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center py-12">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">No Active Roadmap Selected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
          Complete the career selection and profile setup steps to generate your tailored phase-by-phase roadmap.
        </p>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium">
          Ready for Phase 11 Generation
        </span>
      </div>
    </div>
  );
};
