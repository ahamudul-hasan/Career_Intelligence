import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Clock, 
  Server, 
  Code2, 
  Cpu
} from 'lucide-react';
import type { HealthResponse } from '../types/health';

interface HealthCardProps {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  latency: number | null;
  lastChecked: string | null;
  onRefresh: () => void;
}

export const HealthCard: React.FC<HealthCardProps> = ({
  health,
  loading,
  error,
  latency,
  lastChecked,
  onRefresh,
}) => {
  const isHealthy = health?.status === 'ok';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-xl relative overflow-hidden group">
      {/* Decorative gradient glow */}
      <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
        isHealthy ? 'bg-cyan-500/10' : error ? 'bg-rose-500/10' : 'bg-indigo-500/10'
      }`} />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${
              loading 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                : isHealthy 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Backend API Health
                </h2>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  GET /api/health
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time round-trip connectivity between React frontend and Flask API
              </p>
            </div>
          </div>

          <button
            id="refresh-health-btn"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Pinging Endpoint...' : 'Ping Health Endpoint'}</span>
          </button>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Endpoint Status
            </span>
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="flex items-center gap-2 text-amber-400 font-mono text-sm font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Probing...</span>
                </div>
              ) : isHealthy ? (
                <div className="flex items-center gap-2 text-emerald-400 font-mono text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>200 OK</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-semibold">
                  <XCircle className="w-4 h-4" />
                  <span>Offline / Error</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Response Latency
            </span>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-mono text-sm font-semibold">
                {latency !== null ? `${latency} ms` : '—'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Target Service
            </span>
            <div className="flex items-center gap-2 truncate">
              <Server className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="text-white font-mono text-sm font-semibold truncate">
                {health?.service || 'Career Intelligence API'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              API Version
            </span>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-sky-400" />
              <span className="text-white font-mono text-sm font-semibold">
                {health?.version || 'v1.0.0'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Payload Viewer */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-900 text-slate-400">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>HTTP Response Body (application/json)</span>
            </div>
            {lastChecked && (
              <span className="text-[10px] text-slate-500">
                Last checked: {lastChecked}
              </span>
            )}
          </div>

          {error ? (
            <div className="text-rose-400 py-2">
              <p className="font-semibold">Error communicating with backend:</p>
              <p className="text-slate-400 mt-1">{error}</p>
              <p className="text-slate-500 text-[11px] mt-2">
                Tip: Ensure Flask is running at http://127.0.0.1:5000 (`python -m backend.app`).
              </p>
            </div>
          ) : (
            <pre className="text-cyan-300 overflow-x-auto py-1">
              {JSON.stringify(health || { status: 'pending', checking: true }, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
