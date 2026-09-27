import React from 'react';
import { Briefcase, ArrowRight, Code, Database, Shield, Cpu, Activity, CheckSquare } from 'lucide-react';

const SAMPLE_CATEGORIES = [
  { name: 'Software Development', roles: ['Backend Developer', 'Frontend Developer', 'Full Stack Developer', 'Mobile Developer'], icon: Code },
  { name: 'AI / ML', roles: ['AI Engineer', 'ML Engineer', 'LLM Engineer', 'Generative AI Engineer'], icon: Cpu },
  { name: 'Data', roles: ['Data Scientist', 'Data Analyst', 'Data Engineer', 'Analytics Engineer'], icon: Database },
  { name: 'Infrastructure', roles: ['DevOps Engineer', 'Cloud Engineer', 'Site Reliability Engineer'], icon: Activity },
  { name: 'Security', roles: ['Cybersecurity Engineer', 'AppSec Engineer', 'SOC Analyst'], icon: Shield },
  { name: 'Quality', roles: ['QA Automation Engineer', 'SDET'], icon: CheckSquare },
];

export const CareerSelectionPage: React.FC = () => {
  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-3">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Phase 2 Blueprint</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Select Your Target Career Path
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Explore canonical tech career paths seeded from the career taxonomy database.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SAMPLE_CATEGORIES.map((cat, idx) => (
          <div key={idx} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <cat.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">{cat.name}</h3>
            </div>
            <ul className="space-y-2 mb-4">
              {cat.roles.map((role, rIdx) => (
                <li key={rIdx} className="text-xs text-slate-300 flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <span>{role}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Role #{rIdx + 1}</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-cyan-400 font-medium">
              <span>Ready in Phase 2</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
