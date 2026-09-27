import { useState, useEffect, useCallback } from 'react';
import { getJobs, getJobById, importJob, deleteJob } from '../services/jobService';
import type { Job, JobImportPayload } from '../types/job';

export interface UseJobsReturn {
  jobs: Job[];
  total: number;
  selectedJob: Job | null;
  loading: boolean;
  importing: boolean;
  error: string | null;
  searchQuery: string;
  selectedCareerRoleId: number | null;
  setSearchQuery: (query: string) => void;
  setSelectedCareerRoleId: (id: number | null) => void;
  selectJobForView: (job: Job | null) => void;
  fetchJobDetail: (id: number) => Promise<void>;
  handleImport: (payload: JobImportPayload) => Promise<boolean>;
  handleDelete: (id: number) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useJobs = (initialCareerRoleId: number | null = null): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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

  return {
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
    selectJobForView: setSelectedJob,
    fetchJobDetail,
    handleImport,
    handleDelete,
    refetch: fetchJobs,
  };
};
