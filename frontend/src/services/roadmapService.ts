import { api } from './api';
import type { Roadmap } from '../types/roadmap';

export interface GenerateRoadmapPayload {
  career_role_id: number;
  user_id?: number;
  analysis_id?: number;
  available_time?: string;
}

export interface GenerateRoadmapResponse {
  message: string;
  roadmap: Roadmap;
}

export const generateRoadmap = async (
  payload: GenerateRoadmapPayload
): Promise<GenerateRoadmapResponse> => {
  const response = await api.post<GenerateRoadmapResponse>('/api/roadmap/generate', {
    user_id: 1,
    available_time: '10-15 hours/week',
    ...payload,
  });
  return response.data;
};

export const getRoadmapById = async (roadmapId: number): Promise<Roadmap> => {
  const response = await api.get<Roadmap>(`/api/roadmap/${roadmapId}`);
  return response.data;
};

export const listUserRoadmaps = async (
  userId: number = 1,
  limit: number = 10
): Promise<Roadmap[]> => {
  const response = await api.get<Roadmap[]>('/api/roadmap', {
    params: { user_id: userId, limit },
  });
  return response.data;
};
