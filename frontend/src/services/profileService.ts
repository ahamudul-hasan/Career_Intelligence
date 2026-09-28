import { api } from './api';
import type { UserProfile, UserSkillItem } from '../types/profile';
import type { Skill } from '../types/skill';

export const getProfile = async (userId: number = 1): Promise<UserProfile> => {
  const response = await api.get<UserProfile>('/api/profile', {
    params: { user_id: userId },
  });
  return response.data;
};

export const updateProfile = async (
  data: { name?: string; email?: string },
  userId: number = 1
): Promise<{ message: string; profile: UserProfile }> => {
  const response = await api.put<{ message: string; profile: UserProfile }>(
    '/api/profile',
    data,
    { params: { user_id: userId } }
  );
  return response.data;
};

export const getUserSkills = async (userId: number = 1): Promise<UserSkillItem[]> => {
  const response = await api.get<UserSkillItem[]>('/api/profile/skills', {
    params: { user_id: userId },
  });
  return response.data;
};

export const addUserSkill = async (
  payload: { skill_id?: number; skill_name?: string; proficiency: number },
  userId: number = 1
): Promise<{ message: string; skill: UserSkillItem }> => {
  const response = await api.post<{ message: string; skill: UserSkillItem }>(
    '/api/profile/skills',
    payload,
    { params: { user_id: userId } }
  );
  return response.data;
};

export const updateUserSkillProficiency = async (
  skillId: number,
  proficiency: number,
  userId: number = 1
): Promise<{ message: string; skill: UserSkillItem }> => {
  const response = await api.put<{ message: string; skill: UserSkillItem }>(
    `/api/profile/skills/${skillId}`,
    { proficiency },
    { params: { user_id: userId } }
  );
  return response.data;
};

export const deleteUserSkill = async (
  skillId: number,
  userId: number = 1
): Promise<{ message: string; skill_id: number }> => {
  const response = await api.delete<{ message: string; skill_id: number }>(
    `/api/profile/skills/${skillId}`,
    { params: { user_id: userId } }
  );
  return response.data;
};

export const getAvailableSkills = async (): Promise<Skill[]> => {
  const response = await api.get<Skill[]>('/api/skills');
  return response.data;
};
