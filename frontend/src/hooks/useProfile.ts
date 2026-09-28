import { useState, useEffect, useCallback } from 'react';
import {
  getProfile,
  updateProfile,
  addUserSkill,
  updateUserSkillProficiency,
  deleteUserSkill,
  getAvailableSkills,
} from '../services/profileService';
import type { UserProfile, UserSkillItem } from '../types/profile';
import type { Skill } from '../types/skill';

export interface UseProfileReturn {
  profile: UserProfile | null;
  skills: UserSkillItem[];
  availableSkills: Skill[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addSkill: (skillIdentifier: { skill_id?: number; skill_name?: string }, proficiency: number) => Promise<boolean>;
  changeProficiency: (skillId: number, proficiency: number) => Promise<boolean>;
  removeSkill: (skillId: number) => Promise<boolean>;
  saveProfileInfo: (name: string, email: string) => Promise<boolean>;
}

export const useProfile = (userId: number = 1): UseProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [skills, setSkills] = useState<UserSkillItem[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileData, canonSkills] = await Promise.all([
        getProfile(userId),
        getAvailableSkills().catch(() => []),
      ]);
      setProfile(profileData);
      setSkills(profileData.skills || []);
      setAvailableSkills(canonSkills);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load user profile';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const addSkill = useCallback(
    async (
      skillIdentifier: { skill_id?: number; skill_name?: string },
      proficiency: number
    ): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await addUserSkill(
          { ...skillIdentifier, proficiency },
          userId
        );
        setSkills((prev) => {
          const filtered = prev.filter((s) => s.skill_id !== res.skill.skill_id);
          return [res.skill, ...filtered].sort((a, b) => b.proficiency - a.proficiency);
        });
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to add skill';
        setError(msg);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const changeProficiency = useCallback(
    async (skillId: number, proficiency: number): Promise<boolean> => {
      // Optimistic update
      setSkills((prev) =>
        prev.map((s) => (s.skill_id === skillId ? { ...s, proficiency } : s))
      );
      try {
        await updateUserSkillProficiency(skillId, proficiency, userId);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update proficiency';
        setError(msg);
        // Revert on failure
        fetchProfileData();
        return false;
      }
    },
    [userId, fetchProfileData]
  );

  const removeSkill = useCallback(
    async (skillId: number): Promise<boolean> => {
      // Optimistic delete
      const previous = [...skills];
      setSkills((prev) => prev.filter((s) => s.skill_id !== skillId));
      try {
        await deleteUserSkill(skillId, userId);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to remove skill';
        setError(msg);
        setSkills(previous);
        return false;
      }
    },
    [skills, userId]
  );

  const saveProfileInfo = useCallback(
    async (name: string, email: string): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const res = await updateProfile({ name, email }, userId);
        setProfile(res.profile);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update profile info';
        setError(msg);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  return {
    profile,
    skills,
    availableSkills,
    loading,
    saving,
    error,
    refetch: fetchProfileData,
    addSkill,
    changeProficiency,
    removeSkill,
    saveProfileInfo,
  };
};
