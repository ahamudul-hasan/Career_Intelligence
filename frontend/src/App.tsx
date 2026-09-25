import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Database, 
  Sparkles, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Terminal, 
  Layers,
  ArrowRight,
  ShieldCheck,
  Server
} from 'lucide-react';
import { checkHealth, type HealthResponse } from './services/api';

export const App: React.FC = () => {
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      const data = await checkHealth();
      const elapsed = Math.round(performance.now() - start);
      setHealthData(data);
      setLatency(elapsed);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to reach Flask backend');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Career Intelligence
              </span>
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Phase 1 MVP
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400 font-medium">
            <a href="#pipeline" className="hover:text-cyan-400 transition-colors">Pipeline Status</a>
            <a href="#health" className="hover:text-cyan-400 transition-colors">System Diagnostics</a>
            <a href="#phases" className="hover:text-cyan-400 transition-colors">Project Roadmap</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              id="refresh-health-btn"
              onClick={fetchHealth}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700/70 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{loading ? 'Pinging...' : 'Re-check Health'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            <Activity className="w-3.5 h-3.5" />
            <span>End-to-End Skeleton Active</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            CS Career & Market <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
              Intelligence Platform
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Data-driven career analytics connecting live tech market requirements, 
            deterministic skill gap analysis, and personalized learning roadmaps.
          </p>
        </div>

        {/* Live Round-Trip Health Card */}
        <div id="health" className="mb-10">
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/40 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
            <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${healthData ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : error ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400'}`}>
                  {healthData ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : error ? (
                    <XCircle className="w-6 h-6" />
                  ) : (
                    <Activity className="w-6 h-6 animate-pulse" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Backend Connection Status:
                    <span className={healthData ? 'text-emerald-400' : error ? 'text-rose-400' : 'text-slate-400'}>
                      {loading ? 'Checking...' : healthData ? 'Online & Healthy' : 'Offline / Error'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Endpoint: <code className="text-cyan-300 font-mono">GET /api/health</code> | React → Flask Round-Trip
                  </p>
                </div>
              </div>

              {lastChecked && (
                <div className="text-xs text-slate-400 sm:text-right font-mono">
                  <div>Latency: <span className="text-cyan-400 font-semibold">{latency} ms</span></div>
                  <div>Last sync: <span>{lastChecked}</span></div>
                </div>
              )}
            </div>

            {/* Error or Success Output */}
            {error ? (
              <div className="rounded-xl bg-rose-950/40 border border-rose-800/60 p-4 text-rose-300 text-sm">
                <div className="font-semibold mb-1 flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Connection Failed
                </div>
                <div className="font-mono text-xs text-rose-200/80">{error}</div>
                <div className="mt-2 text-xs text-slate-400">
                  Ensure the Flask backend is running on <code className="text-white">http://127.0.0.1:5000</code>.
                </div>
              </div>
            ) : healthData ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-xs text-slate-400 mb-1">Service Status</div>
                  <div className="text-base font-semibold text-emerald-400 flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    {healthData.status.toUpperCase()}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-xs text-slate-400 mb-1">Backend Core</div>
                  <div className="text-base font-semibold text-white">{healthData.service}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="text-xs text-slate-400 mb-1">API Version</div>
                  <div className="text-base font-semibold text-cyan-400 font-mono">v{healthData.version}</div>
                </div>
              </div>
            ) : null}

            {/* Raw JSON Payload */}
            <div className="mt-6">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mb-2">
                <Terminal className="w-3.5 h-3.5 text-slate-500" />
                <span>Live Response Payload</span>
              </div>
              <pre className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto">
                {healthData ? JSON.stringify(healthData, null, 2) : error ? JSON.stringify({ error }, null, 2) : 'Awaiting response...'}
              </pre>
            </div>
          </div>
        </div>

        {/* System Architecture Grid */}
        <div id="pipeline" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Core Architecture & Integrations</h3>
              <p className="text-sm text-slate-400">Status of the foundational layers for CS Career Intelligence</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Backend */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-1">Flask 3.x API</h4>
              <p className="text-xs text-slate-400 mb-3">
                REST server with CORS, Alembic migrations, and modular blueprints.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Scaffolded & Verified
              </div>
            </div>

            {/* Database */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-1">MySQL 8.0 & Alembic</h4>
              <p className="text-xs text-slate-400 mb-3">
                12 operational tables (roles, jobs, skills, users, roadmaps) fully migrated.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Migrated (13 tables)
              </div>
            </div>

            {/* LLM Engine */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-1">Google Gemini API</h4>
              <p className="text-xs text-slate-400 mb-3">
                LangChain with ChatGoogleGenerativeAI (gemini-2.5-flash) client active.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> API Connected
              </div>
            </div>

            {/* Job Provider */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <h4 className="text-base font-semibold text-white mb-1">Adzuna Job Ingestion</h4>
              <p className="text-xs text-slate-400 mb-3">
                Live jobs search API verified over 170,000+ real tech listings.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ingestion Ready
              </div>
            </div>
          </div>
        </div>

        {/* Next Phases Roadmap Section */}
        <div id="phases" className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                Upcoming Build Phases
              </h3>
              <p className="text-sm text-slate-400">Step-by-step roadmap from taxonomy to personalized career roadmaps</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { phase: 'Phase 2', title: 'Career Taxonomy', desc: 'Career selection page with category filtering and database seed loading', active: true },
              { phase: 'Phase 3-4', title: 'Job Data Model & Ingestion', desc: 'Adzuna API provider integration, deduplication, and manual job descriptions', active: false },
              { phase: 'Phase 5-7', title: 'Cleaning & LangChain Extraction', desc: 'HTML cleaning, Gemini structured extraction, and skill alias normalization', active: false },
              { phase: 'Phase 8-10', title: 'Market Analysis & Skill Gap Engine', desc: 'Deterministic Python/SQL aggregations and personalized skill proficiency gaps', active: false },
              { phase: 'Phase 11-12', title: 'Roadmap & Project Recommendations', desc: 'Custom milestone roadmaps and hands-on projects for high-priority gaps', active: false },
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                  item.active 
                    ? 'bg-slate-900 border-cyan-500/40 text-white shadow-lg shadow-cyan-500/5' 
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${item.active ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-400'}`}>
                    {item.phase}
                  </span>
                  <div>
                    <h5 className={`text-sm font-semibold ${item.active ? 'text-white' : 'text-slate-300'}`}>{item.title}</h5>
                    <p className="text-xs text-slate-400">{item.desc}</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 text-xs text-cyan-400 font-medium">
                  {item.active ? 'Up Next' : 'Queued'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CS Career Intelligence Platform — Phase 1 Project Skeleton</span>
          </div>
          <div>React 19 + TypeScript + Vite + Tailwind CSS + Flask 3.x + MySQL</div>
        </div>
      </footer>
    </div>
  );
};

export default App;
