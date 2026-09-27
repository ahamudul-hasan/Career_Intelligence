import { api } from './api';
import type { CareerRole } from '../types/career';

export const getCareers = async (category?: string, search?: string): Promise<CareerRole[]> => {
  const params: Record<string, string> = {};
  if (category && category !== 'All') params.category = category;
  if (search) params.search = search;
  const response = await api.get<CareerRole[]>('/api/careers', { params });
  return response.data;
};

export const getCareerById = async (id: number): Promise<CareerRole> => {
  const response = await api.get<CareerRole>(`/api/careers/${id}`);
  return response.data;
};

export const getCategories = async (): Promise<string[]> => {
  const response = await api.get<string[]>('/api/careers/categories');
  return response.data;
};
