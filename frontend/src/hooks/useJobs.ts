import { useState, useEffect, useCallback } from 'react';
import { getJobs, getJobById, importJob, deleteJob, searchJobs, uploadJobFile } from '../services/jobService';
import type { Job, JobImportPayload, JobSearchCriteria, JobSearchResponse } from '../types/job';

export interface UseJobsReturn {
  jobs: Job[];
  total: number;
  selectedJob: Job | null;
  loading: boolean;
  importing: boolean;
  searching: boolean;
  error: string | null;
  searchResult: JobSearchResponse | null;
  searchQuery: string;
  selectedCareerRoleId: number | null;
  setSearchQuery: (query: string) => void;
  setSelectedCareerRoleId: (id: number | null) => void;
  selectJobForView: (job: Job | null) => void;
  fetchJobDetail: (id: number) => Promise<void>;
  handleImport: (payload: JobImportPayload) => Promise<boolean>;
  handleSearch: (criteria: JobSearchCriteria) => Promise<JobSearchResponse | null>;
  handleUpload: (file: File, careerRoleId: number, experienceLevel?: string) => Promise<JobSearchResponse | null>;
  handleDelete: (id: number) => Promise<boolean>;
  refetch: () => Promise<void>;
  clearSearchResult: () => void;
}

export const useJobs = (initialCareerRoleId: number | null = null): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<JobSearchResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCareerRoleId, setSelectedCareerRoleId] = useState<number | null>(initialCareerRoleId);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJobs(
        selectedCareerRoleId || undefined,
        searchQuery || undefined
      );
      setJobs(data.jobs);
      setTotal(data.total);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCareerRoleId, searchQuery]);

  useEffect(() => {
    let isMounted = true;

    getJobs(
      selectedCareerRoleId || undefined,
      searchQuery || undefined
    )
      .then((data) => {
        if (!isMounted) return;
        setJobs(data.jobs);
        setTotal(data.total);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch jobs';
        setError(message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCareerRoleId, searchQuery]);

  const fetchJobDetail = useCallback(async (id: number) => {
    try {
      const job = await getJobById(id);
      setSelectedJob(job);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch job details';
      setError(message);
    }
  }, []);

  const handleImport = useCallback(async (payload: JobImportPayload): Promise<boolean> => {
    setImporting(true);
    setError(null);
    try {
      const res = await importJob(payload);
      setJobs((prev) => [res.job, ...prev]);
      setTotal((prev) => prev + 1);
      setSelectedJob(res.job);
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to import job description';
      setError(message);
      return false;
    } finally {
      setImporting(false);
    }
  }, []);

  const handleSearch = useCallback(async (criteria: JobSearchCriteria): Promise<JobSearchResponse | null> => {
    setSearching(true);
    setError(null);
    try {
      const res = await searchJobs(criteria);
      setSearchResult(res);
      // Prepend newly ingested jobs to the list
      if (res.jobs && res.jobs.length > 0) {
        setJobs((prev) => {
          const newIds = new Set(res.jobs.map((j) => j.id));
          const filtered = prev.filter((j) => !newIds.has(j.id));
          return [...res.jobs, ...filtered];
        });
        setTotal((prev) => prev + res.jobs_ingested);
      }
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch jobs from provider';
      setError(message);
      return null;
    } finally {
      setSearching(false);
    }
  }, []);

  const handleUpload = useCallback(async (
    file: File,
    careerRoleId: number,
    experienceLevel: string = 'entry_level'
  ): Promise<JobSearchResponse | null> => {
    setSearching(true);
    setError(null);
    try {
      const res = await uploadJobFile(file, careerRoleId, experienceLevel);
      setSearchResult(res);
      if (res.jobs && res.jobs.length > 0) {
        setJobs((prev) => {
          const newIds = new Set(res.jobs.map((j) => j.id));
          const filtered = prev.filter((j) => !newIds.has(j.id));
          return [...res.jobs, ...filtered];
        });
        setTotal((prev) => prev + res.jobs_ingested);
      }
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to upload and ingest file';
      setError(message);
      return null;
    } finally {
      setSearching(false);
    }
  }, []);

  const handleDelete = useCallback(async (id: number): Promise<boolean> => {
    try {
      await deleteJob(id);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      setTotal((prev) => Math.max(0, prev - 1));
      if (selectedJob?.id === id) {
        setSelectedJob(null);
      }
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete job';
      setError(message);
      return false;
    }
  }, [selectedJob]);

  const clearSearchResult = useCallback(() => {
    setSearchResult(null);
  }, []);

  return {
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
    selectJobForView: setSelectedJob,
    fetchJobDetail,
    handleImport,
    handleSearch,
    handleUpload,
    handleDelete,
    refetch: fetchJobs,
    clearSearchResult,
  };
};
