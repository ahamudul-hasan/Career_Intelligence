import { api } from './api';
import type { Job, JobListResponse, JobImportPayload, JobSearchCriteria, JobSearchResponse, JobSkillItem } from '../types/job';

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

export const searchJobs = async (criteria: JobSearchCriteria): Promise<JobSearchResponse> => {
  const response = await api.post<JobSearchResponse>('/api/jobs/search', criteria);
  return response.data;
};

export const uploadJobFile = async (
  file: File,
  careerRoleId: number,
  experienceLevel: string = 'entry_level'
): Promise<JobSearchResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('career_role_id', careerRoleId.toString());
  formData.append('experience_level', experienceLevel);

  const response = await api.post<JobSearchResponse>('/api/jobs/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteJob = async (id: number): Promise<{ message: string }> => {
  const response = await api.delete<{ message: string }>(`/api/jobs/${id}`);
  return response.data;
};

export const extractJobSkills = async (jobId: number): Promise<{ message: string; job_id: number; skills: JobSkillItem[] }> => {
  const response = await api.post<{ message: string; job_id: number; skills: JobSkillItem[] }>(`/api/jobs/${jobId}/extract`);
  return response.data;
};

export const batchExtractSkills = async (
  careerRoleId: number,
  limit: number = 30,
  reextract: boolean = false
): Promise<{
  message: string;
  career_role_id: number;
  career_role_name: string;
  jobs_processed: number;
  total_skills_extracted: number;
}> => {
  const response = await api.post<{
    message: string;
    career_role_id: number;
    career_role_name: string;
    jobs_processed: number;
    total_skills_extracted: number;
  }>('/api/skills/extract', {
    career_role_id: careerRoleId,
    limit,
    reextract,
  });
  return response.data;
};

export const getJobMatch = async (
  jobId: number,
  userId: number = 1
): Promise<import('../types/job').JobMatchResult> => {
  const response = await api.get<import('../types/job').JobMatchResult>(
    `/api/jobs/${jobId}/match`,
    { params: { user_id: userId } }
  );
  return response.data;
};

