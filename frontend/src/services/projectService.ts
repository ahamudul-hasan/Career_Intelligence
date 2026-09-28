import { api } from './api';
import type { Project } from '../types/roadmap';

export interface ProjectQueryParams {
  career_role_id?: number;
  roadmap_id?: number;
  difficulty?: string;
  limit?: number;
}

export interface RecommendProjectsPayload {
  career_role_id: number;
  user_id?: number;
  difficulty?: string;
}

export interface RecommendProjectsResponse {
  projects: Array<{
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    skills_demonstrated: string[];
    target_gap_skill?: string;
    why_it_matters?: string;
    estimated_duration?: string;
  }>;
  count: number;
}

export const getProjects = async (params?: ProjectQueryParams): Promise<Project[]> => {
  const response = await api.get<Project[]>('/api/projects', { params });
  return response.data;
};

export const getProjectById = async (projectId: number): Promise<Project> => {
  const response = await api.get<Project>(`/api/projects/${projectId}`);
  return response.data;
};

export const recommendProjects = async (
  payload: RecommendProjectsPayload
): Promise<RecommendProjectsResponse> => {
  const response = await api.post<RecommendProjectsResponse>('/api/projects/recommend', {
    user_id: 1,
    ...payload,
  });
  return response.data;
};
