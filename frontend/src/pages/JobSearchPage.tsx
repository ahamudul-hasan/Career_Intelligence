import React, { useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Plus, 
  Trash2, 
  Building2, 
  MapPin, 
  Clock, 
  X, 
  FileText, 
  Sparkles, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useJobs } from '../hooks/useJobs';
import { useCareers } from '../hooks/useCareers';
import type { JobImportPayload } from '../types/job';

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
    error,
    searchQuery,
    selectedCareerRoleId,
    setSearchQuery,
    setSelectedCareerRoleId,
    selectJobForView,
    handleImport,
    handleDelete,
    refetch,
  } = useJobs(initialRoleId);

  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [descriptionTab, setDescriptionTab] = useState<'cleaned' | 'raw'>('cleaned');

  // Form State
  const [formCareerId, setFormCareerId] = useState<number>(initialRoleId || 2);
  const [formTitle, setFormTitle] = useState<string>('Backend Software Engineer');
  const [formCompany, setFormCompany] = useState<string>('TechCorp Global');
  const [formLocation, setFormLocation] = useState<string>('San Francisco, CA (Remote)');
  const [formExperience, setFormExperience] = useState<string>('entry_level');
  const [formDescription, setFormDescription] = useState<string>(SAMPLE_JOB_TEXT);
  const [formError, setFormError] = useState<string | null>(null);

  const onSubmitImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!formTitle.trim()) {
      setFormError('Please enter a job title');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Please provide a job description');
      return;
    }

    const payload: JobImportPayload = {
      career_role_id: formCareerId,
      title: formTitle,
      company: formCompany,
      location: formLocation,
      experience_level: formExperience,
      description: formDescription,
    };

    const success = await handleImport(payload);
    if (success) {
      setShowImportModal(false);
    }
  };

  const handlePasteSample = () => {
    setFormTitle('Backend Software Engineer');
    setFormCompany('Antigravity Systems');
    setFormLocation('Remote / Hybrid');
    setFormExperience('entry_level');
    setFormDescription(SAMPLE_JOB_TEXT);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto pb-24">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-3">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Phase 3: Job Data Model & ManualProvider</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Job Descriptions Management
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl leading-relaxed">
            Manage stored job postings and manually import descriptions to test data ingestion, 
            cleaning, and skill extraction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Import Job Description</span>
          </button>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            title="Refresh jobs from MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Stats Controls */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, company, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>

        {/* Career Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Filter Career:</span>
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

          <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 whitespace-nowrap">
            {total} Stored Jobs
          </span>
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={refetch} className="underline text-xs hover:text-rose-300">
            Retry
          </button>
        </div>
      )}

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
        <div className="p-12 text-center rounded-2xl bg-slate-900/30 border border-slate-800">
          <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Job Descriptions Stored Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Test the manual ingestion pipeline by pasting a job description. The cleaner will sanitize HTML tags and store it in MySQL.
          </p>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Import Your First Job Posting</span>
          </button>
        </div>
      )}

      {/* Jobs List */}
      {!loading && jobs.length > 0 && (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="p-5 sm:p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
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
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {job.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.company || 'Unknown Company'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{job.location || 'Remote'}</span>
                  </div>
                  {job.created_at && (
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {job.cleaned_description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                <button
                  onClick={() => selectJobForView(job)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-all cursor-pointer"
                >
                  View Details
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

      {/* Manual Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setShowImportModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Import Job Description (ManualProvider)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Paste in any raw job description (HTML or plain text). The backend text cleaner will sanitize it and save to MySQL.
            </p>

            <form onSubmit={onSubmitImport} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Career Role *
                  </label>
                  <select
                    value={formCareerId}
                    onChange={(e) => setFormCareerId(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Senior Backend Developer"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. New York / Remote"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={formExperience}
                    onChange={(e) => setFormExperience(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
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
                  rows={8}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Paste the full job posting text or HTML description here..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-lg shadow-cyan-600/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${importing ? 'animate-spin' : ''}`} />
                  <span>{importing ? 'Cleaning & Saving...' : 'Save Job Posting'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
            <button
              onClick={() => selectJobForView(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
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
                {selectedJob.career_role_name && (
                  <span className="text-xs font-semibold text-slate-300">
                    • {selectedJob.career_role_name}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {selectedJob.title}
              </h2>
              <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                <span className="font-semibold text-slate-300">{selectedJob.company}</span>
                <span>•</span>
                <span>{selectedJob.location || 'Remote'}</span>
                <span>•</span>
                <span className="capitalize">{selectedJob.experience_level?.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Description Tab Toggle */}
            <div className="flex items-center gap-2 mb-3 border-b border-slate-800 pb-2">
              <button
                onClick={() => setDescriptionTab('cleaned')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  descriptionTab === 'cleaned'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cleaned Description (HTML Stripped)
              </button>
              <button
                onClick={() => setDescriptionTab('raw')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  descriptionTab === 'raw'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw Input Text
              </button>
            </div>

            {/* Description Body */}
            <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">
              {descriptionTab === 'cleaned'
                ? selectedJob.cleaned_description
                : selectedJob.raw_description || 'No raw description available.'}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500 font-mono">
                Stored in MySQL `jobs` table
              </span>
              <button
                onClick={() => selectJobForView(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
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
