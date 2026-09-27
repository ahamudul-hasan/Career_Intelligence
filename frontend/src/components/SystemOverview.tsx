import React from 'react';
import { 
  Server, 
  Database, 
  Bot, 
  Briefcase, 
  CheckCircle2, 
  GitBranch, 
  Layers
} from 'lucide-react';

export const SystemOverview: React.FC = () => {
  const subsystems = [
    {
      title: 'Flask Backend',
      category: 'REST API & Core Logic',
      desc: 'Python Flask 3 application with SQLAlchemy ORM, Pydantic schemas, and CORS handling.',
      status: 'Active & Verified',
      icon: Server,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'React 19 Frontend',
      category: 'UI & Visualization',
      desc: 'Vite + React 19 + TypeScript + Tailwind CSS v4 with React Router and Recharts.',
      status: 'Active & Verified',
      icon: Layers,
      color: 'from-cyan-500/20 to-sky-500/20 text-sky-400 border-sky-500/30',
    },
    {
      title: 'MySQL & Migrations',
      category: 'Data Persistence',
      desc: 'Authoritative Alembic migrations alongside hand-maintained database/schema.sql and seeds.',
      status: 'Schema Configured',
      icon: Database,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      title: 'Gemini LLM Pipeline',
      category: 'AI Orchestration',
      desc: 'LangChain ChatGoogleGenerativeAI with structured output for skill extraction & roadmaps.',
      status: 'Configured',
      icon: Bot,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    },
    {
      title: 'Adzuna Provider',
      category: 'Job Ingestion',
      desc: 'Pluggable JobDataProvider abstraction connecting to verified live job APIs.',
      status: 'Integrated',
      icon: Briefcase,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    },
    {
      title: 'Deterministic Engine',
      category: 'Market Analytics',
      desc: 'Pure Python/SQL aggregations ensuring 100% genuine market statistics without LLM invention.',
      status: 'Scaffolded',
      icon: GitBranch,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    },
  ];

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Architectural Subsystems
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Section 34 & 35 modules scaffolded and verified for the end-to-end pipeline
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subsystems.map((sub, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-all hover:bg-slate-900/70 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${sub.color}`}>
                <sub.icon className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700">
                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                {sub.status}
              </span>
            </div>

            <h4 className="font-semibold text-slate-100 text-sm group-hover:text-cyan-300 transition-colors">
              {sub.title}
            </h4>
            <span className="text-[11px] font-medium text-cyan-400/90 block mb-2">
              {sub.category}
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              {sub.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
