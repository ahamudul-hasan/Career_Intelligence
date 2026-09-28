import { useState, useEffect, useCallback } from 'react';
import {
  generateRoadmap,
  getRoadmapById,
  listUserRoadmaps,
} from '../services/roadmapService';
import type { Roadmap } from '../types/roadmap';

const SELECTED_CAREER_KEY = 'career_intelligence_selected_role_id';

export interface UseRoadmapReturn {
  careerRoleId: number | null;
  setCareerRoleId: (id: number) => void;
  availableTime: string;
  setAvailableTime: (time: string) => void;
  activeRoadmap: Roadmap | null;
  history: Roadmap[];
  loading: boolean;
  generating: boolean;
  error: string | null;
  generate: (roleIdOverride?: number) => Promise<boolean>;
  selectRoadmap: (roadmapId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useRoadmap = (userId: number = 1): UseRoadmapReturn => {
  const [careerRoleId, setCareerRoleIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem(SELECTED_CAREER_KEY);
    return saved ? parseInt(saved, 10) : 1;
  });

  const [availableTime, setAvailableTime] = useState<string>('10-15 hours/week');
  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [history, setHistory] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setCareerRoleId = useCallback((id: number) => {
    setCareerRoleIdState(id);
    localStorage.setItem(SELECTED_CAREER_KEY, id.toString());
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const roadmaps = await listUserRoadmaps(userId);
      setHistory(roadmaps);

      if (roadmaps.length > 0) {
        // Find roadmap matching active role, or pick latest
        const matching = careerRoleId
          ? roadmaps.find((r) => r.career_role_id === careerRoleId)
          : null;
        setActiveRoadmap(matching || roadmaps[0]);
      } else {
        setActiveRoadmap(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load roadmaps';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId, careerRoleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const generate = useCallback(
    async (roleIdOverride?: number): Promise<boolean> => {
      const targetRole = roleIdOverride || careerRoleId;
      if (!targetRole) return false;

      setGenerating(true);
      setError(null);
      try {
        const res = await generateRoadmap({
          career_role_id: targetRole,
          user_id: userId,
          available_time: availableTime,
        });

        setActiveRoadmap(res.roadmap);
        setHistory((prev) => [res.roadmap, ...prev.filter((r) => r.id !== res.roadmap.id)]);
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to generate roadmap';
        setError(msg);
        return false;
      } finally {
        setGenerating(false);
      }
    },
    [careerRoleId, userId, availableTime]
  );

  const selectRoadmap = useCallback(async (roadmapId: number) => {
    setLoading(true);
    try {
      const full = await getRoadmapById(roadmapId);
      setActiveRoadmap(full);
      if (full.career_role_id) {
        setCareerRoleIdState(full.career_role_id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load selected roadmap';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    careerRoleId,
    setCareerRoleId,
    availableTime,
    setAvailableTime,
    activeRoadmap,
    history,
    loading,
    generating,
    error,
    generate,
    selectRoadmap,
    refetch: loadData,
  };
};
