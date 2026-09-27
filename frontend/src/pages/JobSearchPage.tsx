import React from 'react';
import { Search } from 'lucide-react';

export const JobSearchPage: React.FC = () => {
  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-3">
          <Search className="w-3.5 h-3.5" />
          <span>Phase 4 Integration</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Job Search & Posting Ingestion
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Collect real postings via Adzuna API, manual paste-in, or document upload.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Career Role</label>
            <input 
              type="text" 
              placeholder="e.g. Backend Developer" 
              readOnly 
              value="Backend Developer"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Target Location</label>
            <input 
              type="text" 
              placeholder="e.g. United States" 
              readOnly 
              value="United States (US)"
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Experience Level</label>
            <select disabled className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200">
              <option>Entry Level</option>
              <option>Mid Level</option>
              <option>Senior</option>
            </select>
          </div>
          <div className="flex items-end">
            <button 
              disabled 
              className="w-full py-2 rounded-lg bg-cyan-600/50 text-cyan-200 text-xs font-medium cursor-not-allowed"
            >
              Fetch Real Postings (Phase 4)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
