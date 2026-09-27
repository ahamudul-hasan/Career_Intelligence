import { api } from './api';
import type { HealthResponse } from '../types/health';

export const getHealth = async (): Promise<HealthResponse> => {
  const response = await api.get<HealthResponse>('/api/health');
  return response.data;
};
