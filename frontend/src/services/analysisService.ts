import { api } from './api';
import type { Analysis, SkillGap } from '../types/analysis';
import type { SkillFrequency } from '../types/skill';

export interface TopSkillsParams {
  career_role_id: number;
  location?: string;
  experience_level?: string;
  limit?: number;
}

export interface CreateAnalysisPayload {
  career_role_id: number;
  target_location?: string;
  experience_level?: string;
  sources?: string;
}

export interface CreateAnalysisResponse {
  message: string;
  analysis_id: number;
  career_role: string;
  jobs_analyzed: number;
  target_location: string;
  experience_level: string;
  sources: string;
  top_skills: SkillFrequency[];
}

export const getTopSkills = async (params: TopSkillsParams): Promise<SkillFrequency[]> => {
  const queryParams: Record<string, string | number> = {
    career_role_id: params.career_role_id,
  };
  if (params.location && params.location !== 'All') {
    queryParams.location = params.location;
  }
  if (params.experience_level && params.experience_level !== 'All') {
    queryParams.experience_level = params.experience_level;
  }
  if (params.limit) {
    queryParams.limit = params.limit;
  }

  const response = await api.get<SkillFrequency[]>('/api/skills/top', { params: queryParams });
  return response.data;
};

export const createAnalysis = async (
  payload: CreateAnalysisPayload
): Promise<CreateAnalysisResponse> => {
  const response = await api.post<CreateAnalysisResponse>('/api/analysis', payload);
  return response.data;
};

export const getAnalyses = async (
  careerRoleId?: number,
  limit: number = 20
): Promise<Analysis[]> => {
  const params: Record<string, string | number> = { limit };
  if (careerRoleId) {
    params.career_role_id = careerRoleId;
  }
  const response = await api.get<Analysis[]>('/api/analysis', { params });
  return response.data;
};

export const getAnalysisById = async (analysisId: number): Promise<Analysis> => {
  const response = await api.get<Analysis>(`/api/analysis/${analysisId}`);
  return response.data;
};

export const getAnalysisSkills = async (analysisId: number): Promise<SkillFrequency[]> => {
  const response = await api.get<SkillFrequency[]>(`/api/analysis/${analysisId}/skills`);
  return response.data;
};

export const getAnalysisGaps = async (
  analysisId: number,
  userId: number = 1
): Promise<SkillGap[]> => {
  const response = await api.get<SkillGap[]>(`/api/analysis/${analysisId}/gaps`, {
    params: { user_id: userId },
  });
  return response.data;
};

export const getCareerGapsDirect = async (
  careerRoleId: number,
  userId: number = 1,
  location?: string,
  experienceLevel?: string
): Promise<SkillGap[]> => {
  const params: Record<string, string | number> = {
    career_role_id: careerRoleId,
    user_id: userId,
  };
  if (location && location !== 'All') {
    params.location = location;
  }
  if (experienceLevel && experienceLevel !== 'All') {
    params.experience_level = experienceLevel;
  }
  const response = await api.get<SkillGap[]>('/api/analysis/gaps', { params });
  return response.data;
};

