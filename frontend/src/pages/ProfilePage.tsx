import React from 'react';
import { User, Plus } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-3">
          <User className="w-3.5 h-3.5" />
          <span>Phase 9 Profile Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Your Skill Profile
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Catalog your skills and proficiencies (0 = None to 4 = Expert) to drive gap analysis.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div>
            <h3 className="text-base font-bold text-white">Default Developer Profile</h3>
            <p className="text-xs text-slate-400">user_id: 1 (MVP Default)</p>
          </div>
          <button disabled className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 text-xs cursor-not-allowed">
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill (Phase 9)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {['Python', 'Git', 'SQL', 'Linux'].map((skill, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="font-medium text-slate-200">{skill}</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[10px] font-mono">
                Level 2
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
