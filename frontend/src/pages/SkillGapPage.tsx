import React, { useState, useMemo } from 'react';
import {
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Briefcase,
  MapPin,
  Layers,
  RefreshCw,
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Compass,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSkillGaps } from '../hooks/useSkillGaps';
import { useCareers } from '../hooks/useCareers';
import { PROFICIENCY_LABELS } from '../types/profile';
import type { SkillGap } from '../types/analysis';

export const SkillGapPage: React.FC = () => {
  const { careers } = useCareers();
  const {
    careerRoleId,
    setCareerRoleId,
    location,
    setLocation,
    experienceLevel,
    setExperienceLevel,
    analyses,
    selectedAnalysisId,
    setSelectedAnalysisId,
    gaps,
    highGaps,
    mediumGaps,
    lowGaps,
    readinessScore,
    loading,
    error,
    refetch,
    updateProficiency,
  } = useSkillGaps(1);

  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'columns' | 'list'>('columns');

  const selectedCareer = useMemo(() => {
    return careers.find((c) => c.id === careerRoleId);
  }, [careers, careerRoleId]);

  const currentAnalysis = useMemo(() => {
    return analyses.find((a) => a.id === selectedAnalysisId);
  }, [analyses, selectedAnalysisId]);

  const categories = useMemo(() => {
    const cats = new Set(gaps.map((g) => g.category || 'General'));
    return ['All', ...Array.from(cats).sort()];
  }, [gaps]);

  const filteredGaps = useMemo(() => {
    return gaps.filter((g) => {
      const matchTab = activeTab === 'all' || g.gap_priority === activeTab;
      const matchCat = selectedCategory === 'All' || (g.category || 'General') === selectedCategory;
      const matchSearch =
        !searchQuery ||
        g.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.category && g.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchTab && matchCat && matchSearch;
    });
  }, [gaps, activeTab, selectedCategory, searchQuery]);

  return (
    <div className="py-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header & Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <Target className="w-3.5 h-3.5" />
            <span>Deterministic Skill Gap Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Skill Gap & Hireability Matrix
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
            Algorithmic delta between your personal skill portfolio and live employer job requirements.
            Prioritized by pure market percentages without AI hallucination.
          </p>
        </div>

        {/* Action Button: Jump to Roadmap */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/roadmap"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Compass className="w-4 h-4 text-cyan-200" />
            <span>Bridge Gaps via Personalized Roadmap</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Recalculate Gaps"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => refetch()}
            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Target Role & Controls Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl shadow-xl flex flex-wrap items-center gap-4">
        {/* Career Role Selector */}
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            Target Career Role
          </label>
          <select
            value={careerRoleId || ''}
            onChange={(e) => setCareerRoleId(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.name} ({career.category})
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div className="w-40">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            Location
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Locations</option>
            <option value="Remote">Remote</option>
            <option value="London">London</option>
            <option value="Manchester">Manchester</option>
            <option value="United States">United States</option>
          </select>
        </div>

        {/* Experience Level */}
        <div className="w-40">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Experience
          </label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="All">All Levels</option>
            <option value="entry">Entry Level</option>
            <option value="mid">Mid Level</option>
            <option value="senior">Senior Level</option>
            <option value="lead">Lead / Architect</option>
          </select>
        </div>

        {/* Snapshot Selector */}
        <div className="w-48">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            Market Snapshot
          </label>
          <select
            value={selectedAnalysisId}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedAnalysisId(val === 'live' ? 'live' : Number(val));
            }}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="live">Live Aggregate</option>
            {analyses.map((a) => (
              <option key={a.id} value={a.id}>
                Run #{a.id} ({a.jobs_analyzed} jobs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section 56 Data Transparency Header Card */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/20 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Section 56 Market Transparency & Empirical Audit
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
                  Verified Pure Data
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic skill gaps computed directly from validated job requirements and your reported proficiency.
              </p>
            </div>
          </div>
        </div>

        {/* 6 Section 56 Specification Audit Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Target Career
            </span>
            <div className="font-bold text-white text-xs truncate" title={selectedCareer?.name || 'Selected Role'}>
              {selectedCareer?.name || 'Loading...'}
            </div>
            <span className="text-[10px] text-cyan-400">{selectedCareer?.category || 'Tech'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Target Location
            </span>
            <div className="font-bold text-white text-xs">
              {currentAnalysis?.target_location || location}
            </div>
            <span className="text-[10px] text-slate-400">Market region</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Experience Level
            </span>
            <div className="font-bold text-white text-xs capitalize">
              {currentAnalysis?.experience_level || experienceLevel}
            </div>
            <span className="text-[10px] text-slate-400">Seniority filter</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Jobs Analyzed
            </span>
            <div className="font-bold text-cyan-400 font-mono text-xs">
              {currentAnalysis?.jobs_analyzed ? `${currentAnalysis.jobs_analyzed} Postings` : (gaps.length > 0 ? `${gaps.length} Skills Analyzed` : '0 Live Jobs')}
            </div>
            <span className="text-[10px] text-slate-400">Dataset sample</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Data Sources
            </span>
            <div className="font-bold text-white text-xs uppercase">
              {currentAnalysis?.sources || 'Adzuna API'}
            </div>
            <span className="text-[10px] text-slate-400">Verified feeds</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Collection Date
            </span>
            <div className="font-bold text-white text-xs font-mono">
              {currentAnalysis?.analysis_date ? new Date(currentAnalysis.analysis_date).toLocaleDateString() : 'Live Calculated'}
            </div>
            <span className="text-[10px] text-slate-400">Timestamp</span>
          </div>
        </div>
      </div>

      {/* Readiness & KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Role Readiness Score */}
        <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-900/90 to-cyan-950/20 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Role Readiness</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-extrabold font-mono text-cyan-400">
              {readinessScore}%
            </div>
            <span className="text-xs text-slate-400">hireability match</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2 truncate">
            Target: <span className="text-white font-medium">{selectedCareer?.name || 'Selected Role'}</span>
          </p>
        </div>

        {/* High Priority Gaps */}
        <div className="p-6 rounded-2xl border border-rose-500/30 bg-slate-900/40 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between text-rose-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">High Priority Gaps</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-white">
            {highGaps.length}
          </div>
          <div className="text-xs text-rose-400 font-medium mt-1">
            Core demands (&ge;50% postings)
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Critical competencies where your level is beginner or missing.
          </p>
        </div>

        {/* Medium Priority Gaps */}
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-slate-900/40 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Medium Priority</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-white">
            {mediumGaps.length}
          </div>
          <div className="text-xs text-amber-400 font-medium mt-1">
            High demand (25–50%) or Level 2
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Secondary strengths that elevate interview pass-rates.
          </p>
        </div>

        {/* Low Priority Gaps */}
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-slate-900/40 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low / Differentiators</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-4xl font-extrabold font-mono text-white">
            {lowGaps.length}
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-1">
            Found in 10–25% of jobs
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Specialized tools that provide edge cases and versatility.
          </p>
        </div>
      </div>

      {/* Filter Tabs & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        {/* Priority Tabs */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Gaps ({gaps.length})
          </button>
          <button
            onClick={() => setActiveTab('high')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'high'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            High Priority ({highGaps.length})
          </button>
          <button
            onClick={() => setActiveTab('medium')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'medium'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Medium Priority ({mediumGaps.length})
          </button>
          <button
            onClick={() => setActiveTab('low')}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
              activeTab === 'low'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Low Priority ({lowGaps.length})
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-3">
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search gaps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'All' ? 'All Categories' : c}
              </option>
            ))}
          </select>

          {/* Toggle View Mode */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('columns')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                viewMode === 'columns'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Columns
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-lg cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Main Gaps Display */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="text-sm font-medium">Computing deterministic skill gaps...</span>
        </div>
      ) : gaps.length === 0 ? (
        <div className="p-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 mx-auto flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Full Market Alignment Achieved!</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Your profile currently matches or exceeds the technical proficiency requirements identified for this career role.
            </p>
          </div>
          <Link
            to="/roadmap"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
          >
            <span>Proceed to Roadmap Generation</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : viewMode === 'columns' && activeTab === 'all' ? (
        /* Kanban Grouped Columns View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* High Priority Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-500/30">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> High Priority ({highGaps.length})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">&ge;50% demand</span>
            </div>
            {highGaps.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/30 text-center text-xs text-slate-500">
                No high-priority gaps found. Great job!
              </div>
            ) : (
              highGaps.map((gap) => (
                <SkillGapCard
                  key={gap.skill_id}
                  gap={gap}
                  onUpdateProficiency={updateProficiency}
                />
              ))
            )}
          </div>

          {/* Medium Priority Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Medium Priority ({mediumGaps.length})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">25–50% demand</span>
            </div>
            {mediumGaps.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/30 text-center text-xs text-slate-500">
                No medium-priority gaps.
              </div>
            ) : (
              mediumGaps.map((gap) => (
                <SkillGapCard
                  key={gap.skill_id}
                  gap={gap}
                  onUpdateProficiency={updateProficiency}
                />
              ))
            )}
          </div>

          {/* Low Priority Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-emerald-500/30">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Low Priority ({lowGaps.length})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">10–25% demand</span>
            </div>
            {lowGaps.length === 0 ? (
              <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/30 text-center text-xs text-slate-500">
                No low-priority gaps.
              </div>
            ) : (
              lowGaps.map((gap) => (
                <SkillGapCard
                  key={gap.skill_id}
                  gap={gap}
                  onUpdateProficiency={updateProficiency}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* Detailed List View */
        <div className="space-y-3">
          {filteredGaps.map((gap) => (
            <SkillGapCard
              key={gap.skill_id}
              gap={gap}
              onUpdateProficiency={updateProficiency}
              detailed
            />
          ))}
        </div>
      )}

      {/* Configurable Thresholds Audit Box (Section 50 Guarantee) */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <div className="font-semibold text-white">Section 50 Gap Classification Thresholds</div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              High: &ge;50% demand &amp; level &le;1 • Medium: &ge;25% demand or level 2 • Low: &ge;10% demand.
              Configured in <code className="text-cyan-400 font-mono">config/settings.py</code>.
            </p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 text-slate-300 text-[11px] font-mono border border-slate-700">
          <span>0% LLM Guesswork</span>
        </div>
      </div>
    </div>
  );
};

interface SkillGapCardProps {
  gap: SkillGap;
  onUpdateProficiency: (skillId: number, proficiency: number) => Promise<boolean>;
  detailed?: boolean;
}

const SkillGapCard: React.FC<SkillGapCardProps> = ({
  gap,
  onUpdateProficiency,
  detailed = false,
}) => {
  const [updating, setUpdating] = useState(false);

  const priorityStyles = {
    high: {
      border: 'border-rose-500/30 hover:border-rose-500/60',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      bar: '#f43f5e',
      label: 'High Priority',
    },
    medium: {
      border: 'border-amber-500/30 hover:border-amber-500/60',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      bar: '#f59e0b',
      label: 'Medium Priority',
    },
    low: {
      border: 'border-emerald-500/30 hover:border-emerald-500/60',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      bar: '#10b981',
      label: 'Low Priority',
    },
  }[gap.gap_priority];

  const currentProf = PROFICIENCY_LABELS[gap.user_proficiency] || PROFICIENCY_LABELS[0];

  const handleProfChange = async (lvl: number) => {
    setUpdating(true);
    await onUpdateProficiency(gap.skill_id, lvl);
    setUpdating(false);
  };

  return (
    <div
      className={`rounded-2xl border ${priorityStyles.border} bg-slate-900/50 p-5 backdrop-blur-xl transition-all duration-200 shadow-lg ${
        detailed ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-4' : 'space-y-3'
      }`}
    >
      <div className="flex-1">
        {/* Title & Category */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">{gap.skill_name}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
              {gap.category || 'General'}
            </span>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${priorityStyles.badge}`}>
            {priorityStyles.label}
          </span>
        </div>

        {/* Explanation */}
        <p className="text-xs text-slate-400 leading-snug mb-3">{gap.explanation}</p>

        {/* Progress & Demand Indicator */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(gap.market_frequency, 100)}%`,
                backgroundColor: priorityStyles.bar,
              }}
            />
          </div>
          <span className="font-mono font-bold text-cyan-400 text-xs">
            {gap.market_frequency}% Demand
          </span>
        </div>
      </div>

      {/* Interactive Proficiency Level Switcher */}
      <div className={`flex flex-col sm:items-end gap-1.5 pt-2 sm:pt-0 ${detailed ? 'shrink-0' : 'border-t border-slate-800/80'}`}>
        <div className="flex items-center justify-between sm:justify-end gap-2 w-full">
          <span className="text-[11px] text-slate-400">
            Your Level: <span className="text-white font-semibold">{currentProf.label}</span>
          </span>
          {updating && <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />}
        </div>

        {/* Level Buttons 0 to 4 */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[0, 1, 2, 3, 4].map((lvl) => {
            const isSelected = gap.user_proficiency === lvl;
            return (
              <button
                key={lvl}
                onClick={() => handleProfChange(lvl)}
                disabled={updating}
                title={`Set ${gap.skill_name} to ${PROFICIENCY_LABELS[lvl].label}`}
                className={`w-6 h-6 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
