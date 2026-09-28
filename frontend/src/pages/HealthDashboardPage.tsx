import React from 'react';
import { HealthCard } from '../components/HealthCard';
import { SystemOverview } from '../components/SystemOverview';
import { MarketPreviewChart } from '../components/MarketPreviewChart';
import { Sparkles, Layers } from 'lucide-react';
import type { HealthResponse } from '../types/health';

interface HealthDashboardPageProps {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  latency: number | null;
  lastChecked: string | null;
  onRefresh: () => void;
}

export const HealthDashboardPage: React.FC<HealthDashboardPageProps> = ({
  health,
  loading,
  error,
  latency,
  lastChecked,
  onRefresh,
}) => {
  return (
    <div className="py-8">
      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Platform Diagnostics & System Status</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          CS Career & Market <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
            Intelligence Platform
          </span>
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Evidence-based CS career roadmap engine powered by real job postings,
          deterministic skill gap analytics, and Gemini AI.
        </p>
      </div>

      {/* Main Health Card */}
      <HealthCard
        health={health}
        loading={loading}
        error={error}
        latency={latency}
        lastChecked={lastChecked}
        onRefresh={onRefresh}
      />

      {/* Recharts Analytics Preview */}
      <MarketPreviewChart />

      {/* Architectural Subsystems */}
      <SystemOverview />

      {/* Platform Core Capabilities */}
      <div className="mt-14 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Platform Core Capabilities</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-emerald-400">Market Data & Ingestion</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">OPERATIONAL</span>
            </div>
            <p className="text-slate-400">
              Live job queries via Adzuna and file ingestion, automated HTML text sanitization, and structured skill extraction.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/40 shadow-sm shadow-cyan-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-cyan-300">Deterministic Analytics</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">OPERATIONAL</span>
            </div>
            <p className="text-slate-400">
              Zero-hallucination SQL/Python skill demand percentages, canonical synonym normalization, and priority gap mapping.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/40 shadow-sm shadow-purple-500/10">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-purple-300">Personalized Roadmaps</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">OPERATIONAL</span>
            </div>
            <p className="text-slate-400">
              Personalized milestone learning stages tailored to individual skill gaps, paired with resume portfolio capstone projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
