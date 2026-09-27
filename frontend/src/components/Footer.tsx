import React from 'react';
import { Terminal, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-10 mt-auto text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>CS Career Intelligence</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Empirical market intelligence platform for CS careers, transforming live postings into tailored roadmaps.
            </p>
          </div>

          <div>
            <span className="text-slate-200 font-semibold tracking-wide uppercase text-[11px] block mb-3">
              Core Principles
            </span>
            <ul className="space-y-2">
              <li className="text-slate-400">Deterministic Calculations</li>
              <li className="text-slate-400">Evidence-Based Market Percentages</li>
              <li className="text-slate-400">No LLM Hallucinated Statistics</li>
            </ul>
          </div>

          <div>
            <span className="text-slate-200 font-semibold tracking-wide uppercase text-[11px] block mb-3">
              Technology Stack
            </span>
            <ul className="space-y-1.5 font-mono text-[11px]">
              <li>Flask 3 + SQLAlchemy 2</li>
              <li>MySQL + Alembic Migrations</li>
              <li>React 19 + TypeScript + Vite</li>
              <li>Tailwind CSS + Recharts</li>
              <li>LangChain + Google Gemini</li>
            </ul>
          </div>

          <div>
            <span className="text-slate-200 font-semibold tracking-wide uppercase text-[11px] block mb-3">
              Status & Delivery
            </span>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[11px]">
                <Shield className="w-3.5 h-3.5" />
                <span>Phase 1 Completed 100%</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                React → Flask API round-trip fully operational.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} CS Career Intelligence Platform. Built for developers.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 transition-colors">Phase 1: Project Skeleton</span>
            <span>•</span>
            <span className="hover:text-slate-400 transition-colors">Phase 2: Next</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
