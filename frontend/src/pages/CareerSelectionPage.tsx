import React from 'react';
import { 
  Briefcase, 
  Search, 
  Code2, 
  Sparkles, 
  Database, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Check, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCareers } from '../hooks/useCareers';

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'software development':
      return Code2;
    case 'ai / ml':
      return Sparkles;
    case 'data':
      return Database;
    case 'infrastructure':
      return Server;
    case 'security':
      return ShieldCheck;
    case 'quality':
      return CheckCircle2;
    default:
      return Briefcase;
  }
};

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'software development':
      return 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30';
    case 'ai / ml':
      return 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30';
    case 'data':
      return 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30';
    case 'infrastructure':
      return 'from-sky-500/20 to-indigo-500/20 text-sky-400 border-sky-500/30';
    case 'security':
      return 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30';
    case 'quality':
      return 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30';
    default:
      return 'from-slate-500/20 to-slate-600/20 text-slate-400 border-slate-700';
  }
};

export const CareerSelectionPage: React.FC = () => {
  const {
    careers,
    categories,
    selectedRole,
    selectedRoleId,
    selectedCategory,
    searchQuery,
    loading,
    error,
    setSelectedCategory,
    setSearchQuery,
    selectCareer,
    refetch,
  } = useCareers();

  return (
    <div className="py-8 max-w-7xl mx-auto pb-28">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Database-Driven Career Taxonomy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Choose Your Target Career
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Select a career path to analyze live job postings and identify required skills. 
            All roles are dynamically fetched from the <span className="text-cyan-400 font-mono">career_roles</span> MySQL table.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-cyan-400 font-bold">{careers.length}</span> Roles Loaded
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            title="Refresh from MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="space-y-4 mb-8">
        {/* Search input */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search roles by title, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/20'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 animate-pulse h-48 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800" />
                <div className="w-3/4 h-4 rounded bg-slate-800" />
                <div className="w-full h-3 rounded bg-slate-850" />
                <div className="w-5/6 h-3 rounded bg-slate-850" />
              </div>
              <div className="w-1/3 h-3 rounded bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center text-xs">
          <p className="font-semibold text-rose-300">Failed to load careers from MySQL database</p>
          <p className="text-slate-400 mt-1">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-500 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty Search State */}
      {!loading && !error && careers.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <Layers className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-200">No matching career roles found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or choosing another category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-3.5 py-1.5 rounded-lg bg-slate-800 text-cyan-400 text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Career Roles Grid */}
      {!loading && !error && careers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {careers.map((role) => {
            const isSelected = selectedRoleId === role.id;
            const Icon = getCategoryIcon(role.category);
            const colorClass = getCategoryColor(role.category);

            return (
              <div
                key={role.id}
                onClick={() => selectCareer(role)}
                className={`p-6 rounded-2xl transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900/90 border-2 border-cyan-500 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>Selected</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded bg-slate-950/60 border border-slate-800">
                        ID #{role.id}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-medium text-cyan-400 tracking-wide uppercase block mb-1">
                    {role.category}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {role.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {role.description || 'No detailed description available.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className={`font-medium ${isSelected ? 'text-cyan-300' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {isSelected ? 'Active Target Role' : 'Click to Select'}
                  </span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-cyan-400 translate-x-1' : 'text-slate-600 group-hover:translate-x-1'}`} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Selected Career Confirmation Bar */}
      {selectedRole && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-40">
          <div className="rounded-2xl border border-cyan-500/50 bg-slate-950/90 backdrop-blur-xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                    Selected Role (ID: {selectedRole.id})
                  </span>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {selectedRole.category}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">
                  {selectedRole.name}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/20 active:scale-95 transition-all w-full sm:w-auto text-center"
              >
                <span>Continue to Job Ingestion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
