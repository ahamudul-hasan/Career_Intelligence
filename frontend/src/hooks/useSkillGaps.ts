import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  getAnalyses,
  getAnalysisGaps,
  getCareerGapsDirect,
} from '../services/analysisService';
import { updateUserSkillProficiency } from '../services/profileService';
import type { Analysis, SkillGap } from '../types/analysis';

const SELECTED_CAREER_KEY = 'career_intelligence_selected_role_id';

export interface UseSkillGapsReturn {
  careerRoleId: number | null;
  setCareerRoleId: (id: number) => void;
  location: string;
  setLocation: (loc: string) => void;
  experienceLevel: string;
  setExperienceLevel: (exp: string) => void;
  analyses: Analysis[];
  selectedAnalysisId: number | 'live';
  setSelectedAnalysisId: (id: number | 'live') => void;
  gaps: SkillGap[];
  highGaps: SkillGap[];
  mediumGaps: SkillGap[];
  lowGaps: SkillGap[];
  readinessScore: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProficiency: (skillId: number, proficiency: number) => Promise<boolean>;
}

export const useSkillGaps = (userId: number = 1): UseSkillGapsReturn => {
  const [careerRoleId, setCareerRoleIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem(SELECTED_CAREER_KEY);
    return saved ? parseInt(saved, 10) : 1;
  });

  const [location, setLocation] = useState<string>('All');
  const [experienceLevel, setExperienceLevel] = useState<string>('All');
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | 'live'>('live');

  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const setCareerRoleId = useCallback((id: number) => {
    setCareerRoleIdState(id);
    localStorage.setItem(SELECTED_CAREER_KEY, id.toString());
  }, []);

  const loadGapsData = useCallback(async () => {
    if (!careerRoleId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch historical analyses for this role
      const history = await getAnalyses(careerRoleId, 10).catch(() => []);
      setAnalyses(history);

      // 2. Fetch gaps either from chosen analysis snapshot or live calculation
      let calculatedGaps: SkillGap[] = [];
      if (selectedAnalysisId !== 'live' && typeof selectedAnalysisId === 'number') {
        calculatedGaps = await getAnalysisGaps(selectedAnalysisId, userId);
      } else {
        calculatedGaps = await getCareerGapsDirect(
          careerRoleId,
          userId,
          location !== 'All' ? location : undefined,
          experienceLevel !== 'All' ? experienceLevel : undefined
        );
      }

      setGaps(calculatedGaps);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to calculate skill gaps';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [careerRoleId, selectedAnalysisId, userId, location, experienceLevel]);

  useEffect(() => {
    loadGapsData();
  }, [loadGapsData]);

  // Grouped Gaps
  const highGaps = useMemo(() => gaps.filter((g) => g.gap_priority === 'high'), [gaps]);
  const mediumGaps = useMemo(() => gaps.filter((g) => g.gap_priority === 'medium'), [gaps]);
  const lowGaps = useMemo(() => gaps.filter((g) => g.gap_priority === 'low'), [gaps]);

  // Readiness Score:
  // Calculated mathematically: based on low vs high penalty on total evaluated demand
  const readinessScore = useMemo(() => {
    if (gaps.length === 0) return 92; // If 0 gaps, high readiness
    const highPenalty = highGaps.length * 15;
    const medPenalty = mediumGaps.length * 8;
    const lowPenalty = lowGaps.length * 3;
    const totalPenalty = highPenalty + medPenalty + lowPenalty;
    return Math.max(15, Math.min(100, Math.round(100 - totalPenalty)));
  }, [gaps.length, highGaps.length, mediumGaps.length, lowGaps.length]);

  // Quick inline proficiency update
  const updateProficiency = useCallback(
    async (skillId: number, proficiency: number): Promise<boolean> => {
      try {
        await updateUserSkillProficiency(skillId, proficiency, userId);
        // Reload gaps to see refreshed priority classifications
        await loadGapsData();
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to update proficiency';
        setError(msg);
        return false;
      }
    },
    [userId, loadGapsData]
  );

  return {
    careerRoleId,
    setCareerRoleId,
    location,
    setLocation,
    experienceLevel,
    setExperienceLevel,
    analyses,
    selectedAnalysisId,
    setSelectedAnalysisId,
    gaps,
    highGaps,
    mediumGaps,
    lowGaps,
    readinessScore,
    loading,
    error,
    refetch: loadGapsData,
    updateProficiency,
  };
};
