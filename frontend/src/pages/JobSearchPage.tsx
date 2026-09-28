import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Building2, 
  MapPin, 
  Clock, 
  X, 
  FileText, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  ExternalLink,
  UploadCloud,
  Globe,
  Database,
  CheckCircle2,
  SlidersHorizontal,
  Tag,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { useCareers } from '../hooks/useCareers';
import { getJobMatch } from '../services/jobService';
import type { Job, JobImportPayload, JobSearchCriteria, JobMatchResult } from '../types/job';

const SAMPLE_JOB_TEXT = `<h3>Backend Software Engineer (Python / Distributed Systems)</h3>
<p>We are looking for a Backend Engineer to build scalable APIs and microservices.</p>
<h4>Responsibilities:</h4>
<ul>
  <li>Architect and maintain high-throughput REST APIs using <strong>Python</strong>, <strong>FastAPI</strong>, or <strong>Flask</strong>.</li>
  <li>Optimize relational databases including <strong>PostgreSQL</strong> / <strong>MySQL</strong> and cache layers using <strong>Redis</strong>.</li>
  <li>Package and orchestrate services using <strong>Docker</strong> and <strong>Kubernetes</strong>.</li>
  <li>Deploy cloud infrastructure on <strong>AWS</strong> (EC2, S3, RDS, Lambda).</li>
  <li>Collaborate with frontend teams building modern <strong>React</strong> and <strong>TypeScript</strong> clients.</li>
</ul>
<h4>Requirements:</h4>
<p>B.S. in Computer Science or equivalent experience. Solid understanding of data structures, algorithms, and CI/CD pipelines.</p>`;

export const JobSearchPage: React.FC = () => {
  const { careers } = useCareers();
  const savedRoleId = localStorage.getItem('career_intelligence_selected_role_id');
  const initialRoleId = savedRoleId ? parseInt(savedRoleId, 10) : null;

  const {
    jobs,
    total,
    selectedJob,
    loading,
    importing,
    searching,
    error,
    searchResult,
    searchQuery,
    selectedCareerRoleId,
    setSearchQuery,
    setSelectedCareerRoleId,
    selectJobForView,
    handleImport,
    handleSearch,
    handleUpload,
    handleExtractSkills,
    handleBatchExtractSkills,
    handleDelete,
    refetch,
    clearSearchResult,
  } = useJobs(initialRoleId);

  // Active Ingestion Mode Tab: 'adzuna' | 'file' | 'manual'
  const [ingestionTab, setIngestionTab] = useState<'adzuna' | 'file' | 'manual'>('adzuna');

  // Adzuna Search Criteria
  const [searchCareerId, setSearchCareerId] = useState<number>(initialRoleId || 2);
  const [searchLocation, setSearchLocation] = useState<string>('USA');
  const [searchExperience, setSearchExperience] = useState<string>('entry_level');
  const [searchLimit, setSearchLimit] = useState<number>(30);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileCareerId, setFileCareerId] = useState<number>(initialRoleId || 2);
  const [fileExperience, setFileExperience] = useState<string>('entry_level');

  // Manual Form State
  const [manualCareerId, setManualCareerId] = useState<number>(initialRoleId || 2);
  const [manualTitle, setManualTitle] = useState<string>('Backend Software Engineer');
  const [manualCompany, setManualCompany] = useState<string>('TechCorp Global');
  const [manualLocation, setManualLocation] = useState<string>('San Francisco, CA (Remote)');
  const [manualExperience, setManualExperience] = useState<string>('entry_level');
  const [manualDescription, setManualDescription] = useState<string>(SAMPLE_JOB_TEXT);
  const [manualFormError, setManualFormError] = useState<string | null>(null);

  // Extraction State
  const [extractingJobId, setExtractingJobId] = useState<number | null>(null);
  const [batchExtracting, setBatchExtracting] = useState<boolean>(false);
  const [extractionBanner, setExtractionBanner] = useState<string | null>(null);

  // Job Match State (Phase 13 / Section 44)
  const [modalTab, setModalTab] = useState<'match' | 'cleaned' | 'raw'>('match');
  const [jobMatch, setJobMatch] = useState<JobMatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState<boolean>(false);
  const [matchFilter, setMatchFilter] = useState<'all' | 'matched' | 'partially_matched' | 'missing'>('all');

  const onOpenJobModal = async (job: Job) => {
    selectJobForView(job);
    setModalTab('match');
    setMatchFilter('all');
    setMatchLoading(true);
    try {
      const match = await getJobMatch(job.id, 1);
      setJobMatch(match);
    } catch (err) {
      console.error('Failed to fetch job match', err);
      setJobMatch(null);
    } finally {
      setMatchLoading(false);
    }
  };

  // Trigger Live Adzuna Ingestion
  const onTriggerAdzunaSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const criteria: JobSearchCriteria = {
      career_role_id: searchCareerId,
      location: searchLocation,
      experience_level: searchExperience,
      limit: searchLimit,
      source: 'adzuna',
    };
    await handleSearch(criteria);
  };

  // Trigger File Upload Ingestion
  const onTriggerFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    await handleUpload(selectedFile, fileCareerId, fileExperience);
    setSelectedFile(null);
  };

  // Trigger Manual Submission
  const onTriggerManualImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualFormError(null);
    if (!manualTitle.trim()) {
      setManualFormError('Please enter a job title');
      return;
    }
    if (!manualDescription.trim()) {
      setManualFormError('Please provide a job description');
      return;
    }

    const payload: JobImportPayload = {
      career_role_id: manualCareerId,
      title: manualTitle,
      company: manualCompany,
      location: manualLocation,
      experience_level: manualExperience,
      description: manualDescription,
    };

    const success = await handleImport(payload);
    if (success) {
      setManualTitle('');
      setManualDescription('');
    }
  };

  const handlePasteSample = () => {
    setManualTitle('Backend Software Engineer');
    setManualCompany('Antigravity Systems');
    setManualLocation('Remote / Hybrid');
    setManualExperience('entry_level');
    setManualDescription(SAMPLE_JOB_TEXT);
  };

  const handleQuickBackendSearch = () => {
    setSearchCareerId(2);
    setSearchLocation('USA');
    setSearchExperience('entry_level');
    setSearchLimit(30);
    handleSearch({
      career_role_id: 2,
      location: 'USA',
      experience_level: 'entry_level',
      limit: 30,
      source: 'adzuna'
    });
  };

  const onExtractSingleJob = async (jobId: number) => {
    setExtractingJobId(jobId);
    try {
      await handleExtractSkills(jobId);
    } finally {
      setExtractingJobId(null);
    }
  };

  const onBatchExtract = async () => {
    const targetId = selectedCareerRoleId || 2;
    setBatchExtracting(true);
    setExtractionBanner(null);
    try {
      const res = await handleBatchExtractSkills(targetId, 30, false);
      if (res) {
        setExtractionBanner(
          `AI Skill Extraction Complete: Processed ${res.jobs_processed} jobs, extracting ${res.total_skills_extracted} structured skills into MySQL.`
        );
      }
    } finally {
      setBatchExtracting(false);
    }
  };

  return (
    <div className="py-8 max-w-7xl mx-auto pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-3">
            <Globe className="w-3.5 h-3.5" />
            <span>Live Job Ingestion, Text Cleaning & AI Skill Extraction</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Job Market Ingestion & Search
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Query real-time job openings from external providers (Adzuna), sanitize HTML text, and run LangChain Gemini structured extraction to populate skill requirements in MySQL.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refetch}
            disabled={loading || searching || batchExtracting}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all disabled:opacity-50 text-xs font-semibold cursor-pointer"
            title="Refresh jobs from MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync DB</span>
          </button>
        </div>
      </div>

      {/* Ingestion Panel Card */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md p-6 sm:p-8 mb-8 shadow-xl shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Job Ingestion Pipeline
              </h2>
              <p className="text-xs text-slate-400">
                Select your data provider to fetch or import postings
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800">
            <button
              onClick={() => setIngestionTab('adzuna')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                ingestionTab === 'adzuna'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Adzuna Live API</span>
            </button>
            <button
              onClick={() => setIngestionTab('file')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                ingestionTab === 'file'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>File Ingestion</span>
            </button>
            <button
              onClick={() => setIngestionTab('manual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                ingestionTab === 'manual'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Adzuna Live Search */}
        {ingestionTab === 'adzuna' && (
          <form onSubmit={onTriggerAdzunaSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Career Role Target
                </label>
                <select
                  value={searchCareerId}
                  onChange={(e) => setSearchCareerId(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Location / Country
                </label>
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="e.g. USA, UK, Canada, San Francisco"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={searchExperience}
                  onChange={(e) => setSearchExperience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="entry_level">Entry Level</option>
                  <option value="mid_level">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Job Limit
                </label>
                <select
                  value={searchLimit}
                  onChange={(e) => setSearchLimit(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  <option value={10}>10 Postings</option>
                  <option value={20}>20 Postings</option>
                  <option value={30}>30 Postings (Recommended)</option>
                  <option value={50}>50 Postings</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3">
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected to Adzuna Live API • Cleaned with Regex & HTML parser</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleQuickBackendSearch}
                  disabled={searching}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 transition-all cursor-pointer whitespace-nowrap"
                >
                  Quick: Backend Dev (USA, 30 jobs)
                </button>

                <button
                  type="submit"
                  disabled={searching}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${searching ? 'animate-spin' : ''}`} />
                  <span>{searching ? 'Fetching & Deduplicating...' : 'Fetch Real Jobs from Adzuna'}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: File Ingestion */}
        {ingestionTab === 'file' && (
          <form onSubmit={onTriggerFileUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Career Role
                </label>
                <select
                  value={fileCareerId}
                  onChange={(e) => setFileCareerId(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Experience Level
                </label>
                <select
                  value={fileExperience}
                  onChange={(e) => setFileExperience(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="entry_level">Entry Level</option>
                  <option value="mid_level">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-2xl p-6 text-center transition-all bg-slate-950/40">
              <UploadCloud className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-semibold mb-1">
                Upload raw job descriptions file (.txt or documents)
              </p>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto mb-4">
                Support single job or multi-job files separated by <code className="text-cyan-400">---</code> or <code className="text-cyan-400">===</code>
              </p>
              <input
                type="file"
                accept=".txt,.md,.doc"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 cursor-pointer"
              />
              {selectedFile && (
                <p className="text-xs text-emerald-400 mt-2 font-mono">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!selectedFile || searching}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <UploadCloud className={`w-3.5 h-3.5 ${searching ? 'animate-spin' : ''}`} />
                <span>{searching ? 'Ingesting File...' : 'Upload & Ingest File'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Manual Entry */}
        {ingestionTab === 'manual' && (
          <form onSubmit={onTriggerManualImport} className="space-y-4">
            {manualFormError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {manualFormError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Career Role *
                </label>
                <select
                  value={manualCareerId}
                  onChange={(e) => setManualCareerId(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Developer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={manualCompany}
                  onChange={(e) => setManualCompany(e.target.value)}
                  placeholder="e.g. Google"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={manualLocation}
                  onChange={(e) => setManualLocation(e.target.value)}
                  placeholder="e.g. New York / Remote"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Experience Level
                </label>
                <select
                  value={manualExperience}
                  onChange={(e) => setManualExperience(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="entry_level">Entry Level</option>
                  <option value="mid_level">Mid Level</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Job Description (Raw text or HTML) *
                </label>
                <button
                  type="button"
                  onClick={handlePasteSample}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium underline cursor-pointer"
                >
                  Paste Sample HTML Description
                </button>
              </div>
              <textarea
                rows={6}
                required
                value={manualDescription}
                onChange={(e) => setManualDescription(e.target.value)}
                placeholder="Paste the full job posting text or HTML description here..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={importing}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <Sparkles className={`w-3.5 h-3.5 ${importing ? 'animate-spin' : ''}`} />
                <span>{importing ? 'Cleaning & Saving...' : 'Save Manual Job'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Ingestion Result Notification */}
      {searchResult && (
        <div className="mb-8 p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Ingestion Successful</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                  {searchResult.source}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {searchResult.message}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-400">
                <span>Found: <strong className="text-white">{searchResult.jobs_found}</strong></span>
                <span>•</span>
                <span>Ingested: <strong className="text-cyan-400">{searchResult.jobs_ingested}</strong></span>
                <span>•</span>
                <span>Duplicates Filtered: <strong className="text-amber-400">{searchResult.jobs_duplicate}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={clearSearchResult}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Batch Extraction Banner */}
      {extractionBanner && (
        <div className="mb-8 p-5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 shrink-0 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Skill Extraction Complete</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                {extractionBanner}
              </p>
            </div>
          </div>

          <button
            onClick={() => setExtractionBanner(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={refetch} className="underline text-xs hover:text-rose-300 cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Stored Jobs Management Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Stored Job Postings</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
              {total} Total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real postings stored in MySQL database with AI extracted requirements
          </p>
        </div>

        {/* Filter and Stats Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* AI Batch Extraction Button */}
          <button
            onClick={onBatchExtract}
            disabled={batchExtracting || loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap"
            title="Run LangChain skill extraction on jobs for this career role"
          >
            <Sparkles className={`w-3.5 h-3.5 ${batchExtracting ? 'animate-spin' : ''}`} />
            <span>{batchExtracting ? 'Extracting Skills...' : 'Extract All Skills (AI)'}</span>
          </button>

          {/* Career Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCareerRoleId || ''}
              onChange={(e) => setSelectedCareerRoleId(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Career Roles</option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category})
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative w-48 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search postings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 animate-pulse flex flex-col justify-between h-32">
              <div className="w-1/3 h-5 rounded bg-slate-800" />
              <div className="w-2/3 h-4 rounded bg-slate-850" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-slate-900/30 border border-slate-800/80">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Job Descriptions Stored Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Query the Adzuna API above to fetch 20-30 real postings for your chosen career track.
          </p>
          <button
            onClick={handleQuickBackendSearch}
            disabled={searching}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Fetch 30 Backend Developer Jobs from USA</span>
          </button>
        </div>
      )}

      {/* Jobs List */}
      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 group"
            >
              <div className="space-y-2.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                    job.source === 'adzuna' 
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                      : job.source === 'file'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {job.source || 'manual'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    #{job.id}
                  </span>
                  {job.career_role_name && (
                    <span className="text-xs font-medium text-slate-300">
                      • {job.career_role_name}
                    </span>
                  )}
                  {job.experience_level && (
                    <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800">
                      {job.experience_level.replace('_', ' ')}
                    </span>
                  )}
                  {job.country && (
                    <span className="text-[10px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800">
                      {job.country}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {job.title}
                  </h3>
                  {job.job_url && (
                    <a
                      href={job.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-cyan-400 transition-colors"
                      title="View original posting URL"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.company || 'Unknown Company'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  {job.posted_date && (
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>Posted: {new Date(job.posted_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {job.cleaned_description}
                </p>

                {/* Extracted Skills Badges (Phase 6) */}
                <div className="pt-1">
                  {job.skills && job.skills.length > 0 ? (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="flex items-center gap-1 text-[11px] text-purple-400 font-medium mr-1">
                        <Tag className="w-3 h-3" />
                        <span>Extracted:</span>
                      </div>
                      {job.skills.slice(0, 7).map((skill) => (
                        <span
                          key={skill.id}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                            skill.importance === 'required'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          }`}
                          title={`${skill.category || 'Skill'} • ${skill.importance} • Confidence ${(skill.confidence * 100).toFixed(0)}%`}
                        >
                          <span>{skill.name}</span>
                          <span className={`text-[8px] uppercase tracking-wider px-1 rounded ${
                            skill.importance === 'required' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-300'
                          }`}>
                            {skill.importance === 'required' ? 'Req' : 'Pref'}
                          </span>
                        </span>
                      ))}
                      {job.skills.length > 7 && (
                        <span className="text-[10px] font-mono text-slate-500 px-1.5 py-0.5 rounded bg-slate-800/80">
                          +{job.skills.length - 7} more
                        </span>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => onExtractSingleJob(job.id)}
                      disabled={extractingJobId === job.id}
                      className="inline-flex items-center gap-1.5 text-[11px] text-purple-400 hover:text-purple-300 font-medium cursor-pointer transition-colors bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg"
                    >
                      <Sparkles className={`w-3 h-3 ${extractingJobId === job.id ? 'animate-spin' : ''}`} />
                      <span>{extractingJobId === job.id ? 'Extracting with Gemini...' : 'Extract Skills with AI'}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <button
                  onClick={() => onOpenJobModal(job)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 hover:border-cyan-500/50 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Match & Details</span>
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  title="Delete job posting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
            <button
              onClick={() => selectJobForView(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase">
                  {selectedJob.source}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ID: #{selectedJob.id}
                </span>
                {selectedJob.external_id && (
                  <span className="text-xs text-slate-500 font-mono">
                    Ext: {selectedJob.external_id}
                  </span>
                )}
                {selectedJob.career_role_name && (
                  <span className="text-xs font-semibold text-slate-300">
                    • {selectedJob.career_role_name}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {selectedJob.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 flex-wrap">
                <span className="font-semibold text-slate-300">{selectedJob.company}</span>
                <span>•</span>
                <span>{selectedJob.location || 'Remote'}</span>
                <span>•</span>
                <span className="capitalize">{selectedJob.experience_level?.replace('_', ' ')}</span>
                {selectedJob.job_url && (
                  <>
                    <span>•</span>
                    <a
                      href={selectedJob.job_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Original Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Extracted Skills Section in Modal */}
            <div className="mb-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Extracted Skills ({selectedJob.skills?.length || 0})
                  </h4>
                </div>
                {(!selectedJob.skills || selectedJob.skills.length === 0) && (
                  <button
                    onClick={() => onExtractSingleJob(selectedJob.id)}
                    disabled={extractingJobId === selectedJob.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer"
                  >
                    <Sparkles className={`w-3 h-3 ${extractingJobId === selectedJob.id ? 'animate-spin' : ''}`} />
                    <span>{extractingJobId === selectedJob.id ? 'Extracting...' : 'Extract Skills Now'}</span>
                  </button>
                )}
              </div>

              {selectedJob.skills && selectedJob.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {selectedJob.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2"
                    >
                      <span className="text-xs font-semibold text-slate-200">
                        {skill.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {skill.category || 'Skill'}
                      </span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                        skill.importance === 'required'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {skill.importance}
                      </span>
                      <span className="text-[9px] font-mono text-cyan-400">
                        {(skill.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Skills haven't been extracted for this posting yet. Click 'Extract Skills Now' to run LangChain AI analysis.
                </p>
              )}
            </div>

            {/* Modal Tabs Toggle: Section 44 Match | Cleaned | Raw */}
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2 flex-wrap">
              <button
                onClick={() => setModalTab('match')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  modalTab === 'match'
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Requirements Match (Section 44)</span>
              </button>
              <button
                onClick={() => setModalTab('cleaned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  modalTab === 'cleaned'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cleaned Description
              </button>
              <button
                onClick={() => setModalTab('raw')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  modalTab === 'raw'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw Input Text
              </button>
            </div>

            {/* Modal Content Body */}
            {modalTab === 'match' && (
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {matchLoading && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-cyan-400" />
                    <span>Evaluating skill alignment against your profile...</span>
                  </div>
                )}

                {!matchLoading && jobMatch && (
                  <div className="space-y-4">
                    {/* Alignment Metrics Dashboard */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                          Required Coverage
                        </span>
                        <div className="text-lg font-bold font-mono text-cyan-400">
                          {jobMatch.summary.required_coverage_pct}%
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {jobMatch.summary.required_matched} / {jobMatch.summary.required_total} core skills
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                          Preferred Bonus
                        </span>
                        <div className="text-lg font-bold font-mono text-purple-400">
                          {jobMatch.summary.preferred_matched} / {jobMatch.summary.preferred_total}
                        </div>
                        <span className="text-[10px] text-slate-500">Nice-to-have met</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                          Matched Skills
                        </span>
                        <div className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          <span>{jobMatch.summary.matched_count}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Working proficiency</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                          Missing / Gap
                        </span>
                        <div className="text-lg font-bold font-mono text-rose-400 flex items-center gap-1">
                          <X className="w-4 h-4" />
                          <span>{jobMatch.summary.missing_count}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">
                          +{jobMatch.summary.partially_matched_count} partial
                        </span>
                      </div>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-xs font-semibold text-slate-400 mr-1">Filter:</span>
                      <button
                        onClick={() => setMatchFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          matchFilter === 'all'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        All ({jobMatch.matches.length})
                      </button>
                      <button
                        onClick={() => setMatchFilter('matched')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          matchFilter === 'matched'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-emerald-300'
                        }`}
                      >
                        <span>✓ Matched ({jobMatch.summary.matched_count})</span>
                      </button>
                      <button
                        onClick={() => setMatchFilter('partially_matched')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          matchFilter === 'partially_matched'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-amber-300'
                        }`}
                      >
                        <span>~ Partial ({jobMatch.summary.partially_matched_count})</span>
                      </button>
                      <button
                        onClick={() => setMatchFilter('missing')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                          matchFilter === 'missing'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-slate-950 text-slate-400 hover:text-rose-300'
                        }`}
                      >
                        <span>✗ Missing ({jobMatch.summary.missing_count})</span>
                      </button>
                    </div>

                    {/* Requirements Breakdown List */}
                    <div className="space-y-2.5">
                      {jobMatch.matches
                        .filter((m) => matchFilter === 'all' || m.status === matchFilter)
                        .map((m) => {
                          const statusStyle = {
                            matched: 'border-emerald-500/30 bg-emerald-950/15',
                            partially_matched: 'border-amber-500/30 bg-amber-950/15',
                            missing: 'border-rose-500/30 bg-rose-950/15',
                          }[m.status];

                          const badgeStyle = {
                            matched: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                            partially_matched: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                            missing: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
                          }[m.status];

                          return (
                            <div
                              key={m.skill_id}
                              className={`p-3.5 rounded-xl border ${statusStyle} transition-all space-y-1.5`}
                            >
                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${badgeStyle}`}>
                                    {m.status_symbol} {m.status.replace('_', ' ').toUpperCase()}
                                  </span>
                                  <span className="font-bold text-white text-sm">
                                    {m.skill_name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                                    {m.category}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs font-mono">
                                  <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                                    m.importance === 'required'
                                      ? 'bg-slate-800 text-cyan-300'
                                      : 'bg-slate-800 text-purple-300'
                                  }`}>
                                    {m.importance}
                                  </span>
                                  <span className="text-slate-400 text-[11px]">
                                    Your Level: <strong className="text-slate-200">{m.user_proficiency_label} ({m.user_proficiency}/4)</strong>
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-slate-300 leading-relaxed pl-1">
                                {m.status_reason}
                              </p>
                            </div>
                          );
                        })}
                    </div>

                    {/* Section 44 Transparency Notice */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">
                        {jobMatch.disclaimer}
                      </p>
                    </div>
                  </div>
                )}

                {!matchLoading && !jobMatch && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    <p>No extracted skills available for this posting to match against.</p>
                  </div>
                )}
              </div>
            )}

            {modalTab === 'cleaned' && (
              <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                {selectedJob.cleaned_description}
              </div>
            )}

            {modalTab === 'raw' && (
              <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
                {selectedJob.raw_description || 'No raw description available.'}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                Stored in MySQL `jobs` and `job_skills` tables
              </span>
              <button
                onClick={() => selectJobForView(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
