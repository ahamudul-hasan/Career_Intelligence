import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Database,
  Calendar,
  MapPin,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Layers,
  Zap,
  AlertCircle,
  History,
  Info,
} from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import { useCareers } from '../hooks/useCareers';
import { SearchableSelect } from '../components/SearchableSelect';
import type { SkillFrequency } from '../types/skill';

const CATEGORY_COLORS: Record<string, string> = {
  Languages: '#06b6d4',      // cyan
  Language: '#06b6d4',
  Frameworks: '#8b5cf6',    // purple
  Framework: '#8b5cf6',
  Databases: '#3b82f6',     // blue
  Database: '#3b82f6',
  'Cloud & DevOps': '#ec4899', // pink
  Cloud: '#ec4899',
  DevOps: '#ec4899',
  Tools: '#10b981',         // emerald
  Tool: '#10b981',
  Architecture: '#f59e0b',  // amber
  Security: '#f43f5e',      // rose
  General: '#6366f1',       // indigo
};

const getCategoryColor = (category?: string): string => {
  if (!category) return '#6366f1';
  return CATEGORY_COLORS[category] || '#6366f1';
};

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: SkillFrequency;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-xl bg-slate-950/95 p-4 shadow-2xl border border-slate-700/80 backdrop-blur-xl text-xs max-w-xs">
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
          <span className="font-bold text-white text-sm">{data.skill_name}</span>
          <span
            className="px-2 py-0.5 rounded text-[10px] font-semibold"
            style={{
              backgroundColor: `${getCategoryColor(data.category)}20`,
              color: getCategoryColor(data.category),
            }}
          >
            {data.category || 'General'}
          </span>
        </div>
        <div className="space-y-1.5 text-slate-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Market Demand:</span>
            <span className="font-mono font-bold text-cyan-400 text-sm">{data.percentage}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Total Mentions:</span>
            <span className="font-mono text-white">{data.skill_count} jobs</span>
          </div>
          <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800/60">
            <span className="text-emerald-400">Required: {data.required_count}</span>
            <span className="text-sky-400">Preferred: {data.preferred_count}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const MarketAnalysisPage: React.FC = () => {
  const { careers } = useCareers();
  const {
    careerRoleId,
    setCareerRoleId,
    location,
    setLocation,
    experienceLevel,
    setExperienceLevel,
    limit,
    setLimit,
    selectedCategory,
    setSelectedCategory,
    topSkills,
    categories,
    currentAnalysis,
    history,
    totalJobsAnalyzed,
    loading,
    analyzing,
    error,
    refetch,
    runSnapshot,
    selectSnapshot,
  } = useAnalysis();

  const [searchTableQuery, setSearchTableQuery] = useState('');
  const [chartMode, setChartMode] = useState<'overall' | 'breakdown'>('overall');

  // Filter skills by selected category & search query
  const filteredSkills = useMemo(() => {
    return topSkills.filter((skill) => {
      const matchCat =
        selectedCategory === 'All' ||
        (skill.category && skill.category.toLowerCase() === selectedCategory.toLowerCase());
      const matchSearch =
        !searchTableQuery ||
        skill.skill_name.toLowerCase().includes(searchTableQuery.toLowerCase()) ||
        skill.normalized_name.toLowerCase().includes(searchTableQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [topSkills, selectedCategory, searchTableQuery]);

  const selectedCareer = useMemo(() => {
    return careers.find((c) => c.id === careerRoleId);
  }, [careers, careerRoleId]);

  // Derived statistics
  const topSkill = topSkills.length > 0 ? topSkills[0] : null;
  const avgPercentage =
    topSkills.length > 0
      ? (topSkills.reduce((acc, s) => acc + s.percentage, 0) / topSkills.length).toFixed(1)
      : '0';

  return (
    <div className="py-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header & Controls Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Deterministic Market Intelligence Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Market Demand Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 max-w-2xl">
            Mathematically verified skill frequencies and hiring percentages aggregated from real-time
            postings without LLM hallucination.
          </p>
        </div>

        {/* Action Button: Run Analysis Snapshot */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => runSnapshot()}
            disabled={analyzing || loading || !careerRoleId}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {analyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Aggregating SQL Data...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-200" />
                <span>Run Analysis Snapshot</span>
              </>
            )}
          </button>

          <button
            onClick={() => refetch()}
            disabled={loading || analyzing}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Refresh current data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert if any */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
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

      {/* Filter & Role Selection Bar */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl shadow-xl flex flex-wrap items-center gap-4">
        {/* Career Role Selector */}
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            Target Career Role
          </label>
          <SearchableSelect
            options={careers.map((career) => ({
              value: career.id,
              label: career.name,
              category: career.category,
            }))}
            value={careerRoleId || ''}
            onChange={(val) => setCareerRoleId(Number(val))}
            placeholder="-- Select or search career role --"
            searchPlaceholder="Search career role..."
          />
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
            <option value="United Kingdom">United Kingdom</option>
            <option value="London">London</option>
            <option value="Manchester">Manchester</option>
            <option value="United States">United States</option>
          </select>
        </div>

        {/* Experience Level Filter */}
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

        {/* Limit Selector */}
        <div className="w-32">
          <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Top Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value={10}>Top 10</option>
            <option value={20}>Top 20</option>
            <option value={30}>Top 30</option>
            <option value={50}>Top 50</option>
          </select>
        </div>
      </div>

      {/* Section 56 Metadata Audit Header Card */}
      <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/20 p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  Section 56 Analysis Metadata & Deterministic Audit
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-medium">
                  Verified Pure SQL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Target career requirements calculated directly from cleaned job postings and canonical skill aliases.
              </p>
            </div>
          </div>

          {/* History / Previous Snapshots Dropdown if available */}
          {history.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Snapshot Run:</span>
              <select
                value={currentAnalysis?.id || ''}
                onChange={(e) => {
                  const found = history.find((h) => h.id === Number(e.target.value));
                  if (found) selectSnapshot(found);
                }}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {history.map((h, i) => (
                  <option key={h.id} value={h.id}>
                    #{h.id} — {h.analysis_date ? new Date(h.analysis_date).toLocaleDateString() : `Run ${i + 1}`} ({h.jobs_analyzed} jobs)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 6 Key Metadata Items (Section 56 Specifications) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Target Career
            </span>
            <div className="font-bold text-white text-sm truncate" title={selectedCareer?.name || 'Selected Role'}>
              {selectedCareer?.name || 'Loading...'}
            </div>
            <span className="text-[10px] text-cyan-400">{selectedCareer?.category || 'Role'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Target Location
            </span>
            <div className="font-bold text-white text-sm">
              {currentAnalysis?.target_location || location}
            </div>
            <span className="text-[10px] text-slate-400">Geographic scope</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Experience Level
            </span>
            <div className="font-bold text-white text-sm capitalize">
              {currentAnalysis?.experience_level || experienceLevel}
            </div>
            <span className="text-[10px] text-slate-400">Seniority filter</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Jobs Analyzed
            </span>
            <div className="font-bold text-cyan-400 text-lg font-mono">
              {totalJobsAnalyzed}
            </div>
            <span className="text-[10px] text-slate-400">Sample volume</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Ingestion Source
            </span>
            <div className="font-bold text-white text-sm uppercase truncate">
              {currentAnalysis?.sources || 'adzuna, live api'}
            </div>
            <span className="text-[10px] text-slate-400">Aggregated feeds</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
              Snapshot Date
            </span>
            <div className="font-bold text-white text-sm font-mono truncate flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                {currentAnalysis?.analysis_date
                  ? new Date(currentAnalysis.analysis_date).toLocaleDateString()
                  : 'Current Live'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Deterministic query</span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Top In-Demand Skill</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {topSkill ? topSkill.skill_name : 'N/A'}
          </div>
          <div className="text-xs text-cyan-400 font-mono mt-1 font-semibold">
            {topSkill ? `${topSkill.percentage}% demand (${topSkill.skill_count} jobs)` : 'No data'}
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Distinct Skills Found</span>
            <Database className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{topSkills.length}</div>
          <div className="text-xs text-slate-400 mt-1">Extracted & normalized aliases</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Average Skill Demand</span>
            <BarChart3 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{avgPercentage}%</div>
          <div className="text-xs text-slate-400 mt-1">Across top {topSkills.length} skills</div>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Deterministic Formula</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-mono font-semibold text-emerald-400 mt-1">
            skill_jobs / total * 100
          </div>
          <div className="text-xs text-slate-400 mt-1">100% Python/SQL — No AI fantasy</div>
        </div>
      </div>

      {/* Main Interactive Recharts Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Skill Frequency & Demand Distribution
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Top technical competencies ranked by occurrence frequency across active postings.
            </p>
          </div>

          {/* Chart Controls (Overall vs Required/Preferred breakdown) */}
          <div className="flex items-center gap-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setChartMode('overall')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                chartMode === 'overall'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overall Demand %
            </button>
            <button
              onClick={() => setChartMode('breakdown')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                chartMode === 'breakdown'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Required vs Preferred
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-slate-800/80">
          <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Chart Container */}
        {loading ? (
          <div className="h-80 w-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-sm font-medium">Calculating skill frequencies...</span>
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="h-80 w-full flex flex-col items-center justify-center gap-3 text-slate-400">
            <AlertCircle className="w-8 h-8 text-amber-400" />
            <p className="text-sm font-medium text-slate-300">
              No skills found for this career or filter combination.
            </p>
            <p className="text-xs text-slate-500">
              Try clicking "Run Analysis Snapshot" or selecting another career role.
            </p>
          </div>
        ) : (
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartMode === 'overall' ? (
                <BarChart
                  data={filteredSkills.slice(0, 15)}
                  margin={{ top: 20, right: 20, left: -10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="skill_name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                    {filteredSkills.slice(0, 15).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart
                  data={filteredSkills.slice(0, 15)}
                  margin={{ top: 20, right: 20, left: -10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="skill_name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={{ stroke: '#334155' }}
                    tickLine={{ stroke: '#334155' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px' }}
                    formatter={(value) => (
                      <span className="text-xs text-slate-300 font-medium capitalize">{value}</span>
                    )}
                  />
                  <Bar
                    dataKey="required_count"
                    name="Strictly Required"
                    stackId="a"
                    fill="#06b6d4"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="preferred_count"
                    name="Preferred / Nice-to-Have"
                    stackId="a"
                    fill="#a855f7"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-800/80 mt-4">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Showing top {Math.min(filteredSkills.length, 15)} skills for chart readability. Complete list below.</span>
          </div>
          <span className="font-mono text-slate-400">Total Analyzed: {totalJobsAnalyzed} Jobs</span>
        </div>
      </div>

      {/* Ranked Skills Detailed Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Ranked Skills Frequency Table
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Exact counts, calculated percentages, and required vs preferred distribution.
            </p>
          </div>

          {/* In-table Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search skill name..."
              value={searchTableQuery}
              onChange={(e) => setSearchTableQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {filteredSkills.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">
            No matching skills found in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 w-16">Rank</th>
                  <th className="py-3.5 px-4">Skill Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Market Demand</th>
                  <th className="py-3.5 px-4 text-right">Job Count</th>
                  <th className="py-3.5 px-4 text-right">Required / Preferred</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredSkills.map((skill, index) => {
                  const catColor = getCategoryColor(skill.category);
                  return (
                    <tr
                      key={skill.skill_id}
                      className="hover:bg-slate-800/30 transition-colors duration-100"
                    >
                      <td className="py-3 px-4 font-mono text-slate-400">
                        #{index + 1}
                      </td>
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        <span>{skill.skill_name}</span>
                        {skill.normalized_name !== skill.skill_name.toLowerCase() && (
                          <span className="text-[10px] text-slate-500 font-mono font-normal">
                            ({skill.normalized_name})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${catColor}20`,
                            color: catColor,
                          }}
                        >
                          {skill.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-4 min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(skill.percentage, 100)}%`,
                                backgroundColor: catColor,
                              }}
                            />
                          </div>
                          <span className="font-mono font-bold text-cyan-400 w-12 text-right">
                            {skill.percentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {skill.skill_count} / {totalJobsAnalyzed}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-cyan-400 font-semibold">{skill.required_count} req</span>
                          <span className="text-slate-500">/</span>
                          <span className="text-purple-400 font-semibold">{skill.preferred_count} pref</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer / Transparency Notice */}
      <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/30 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>
            Strict adherence to Section 7 & 49: Market calculations are purely deterministic mathematical
            queries verified via test fixtures.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">API: /api/skills/top & /api/analysis</span>
      </div>
    </div>
  );
};
