import { api } from './api';
import type { Job, JobListResponse, JobImportPayload } from '../types/job';

export const getJobs = async (
  careerRoleId?: number,
  search?: string,
  limit: number = 50,
  offset: number = 0
): Promise<JobListResponse> => {
  const params: Record<string, string | number> = { limit, offset };
  if (careerRoleId) params.career_role_id = careerRoleId;
  if (search) params.search = search;
  const response = await api.get<JobListResponse>('/api/jobs', { params });
  return response.data;
};

export const getJobById = async (id: number): Promise<Job> => {
  const response = await api.get<Job>(`/api/jobs/${id}`);
  return response.data;
};

export const importJob = async (payload: JobImportPayload): Promise<{ message: string; job: Job }> => {
  const response = await api.post<{ message: string; job: Job }>('/api/jobs/import', payload);
  return response.data;
};

export const deleteJob = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/api/jobs/${id}`);
  return response.data;
};
