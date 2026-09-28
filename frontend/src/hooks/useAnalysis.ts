import { useState, useEffect, useCallback } from 'react';
import {
  getTopSkills,
  createAnalysis,
  getAnalyses,
  getAnalysisSkills,
} from '../services/analysisService';
import type { Analysis } from '../types/analysis';
import type { SkillFrequency } from '../types/skill';

const SELECTED_CAREER_KEY = 'career_intelligence_selected_role_id';

export interface UseAnalysisReturn {
  careerRoleId: number | null;
  setCareerRoleId: (id: number) => void;
  location: string;
  setLocation: (loc: string) => void;
  experienceLevel: string;
  setExperienceLevel: (exp: string) => void;
  limit: number;
  setLimit: (limit: number) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  topSkills: SkillFrequency[];
  categories: string[];
  currentAnalysis: Analysis | null;
  history: Analysis[];
  totalJobsAnalyzed: number;
  loading: boolean;
  analyzing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  runSnapshot: () => Promise<void>;
  selectSnapshot: (analysis: Analysis) => Promise<void>;
}

export const useAnalysis = (): UseAnalysisReturn => {
  const [careerRoleId, setCareerRoleIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem(SELECTED_CAREER_KEY);
    return saved ? parseInt(saved, 10) : 1; // Default to role 1 if not set
  });

  const [location, setLocation] = useState<string>('All');
  const [experienceLevel, setExperienceLevel] = useState<string>('All');
  const [limit, setLimit] = useState<number>(20);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const [topSkills, setTopSkills] = useState<SkillFrequency[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(null);
  const [history, setHistory] = useState<Analysis[]>([]);
  const [totalJobsAnalyzed, setTotalJobsAnalyzed] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(true);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const setCareerRoleId = useCallback((id: number) => {
    setCareerRoleIdState(id);
    localStorage.setItem(SELECTED_CAREER_KEY, id.toString());
  }, []);

  const loadData = useCallback(async () => {
    if (!careerRoleId) return;
    setLoading(true);
    setError(null);
    try {
      const [skills, analyses] = await Promise.all([
        getTopSkills({
          career_role_id: careerRoleId,
          location: location !== 'All' ? location : undefined,
          experience_level: experienceLevel !== 'All' ? experienceLevel : undefined,
          limit,
        }),
        getAnalyses(careerRoleId, 10).catch(() => []),
      ]);

      setTopSkills(skills);
      setHistory(analyses);

      // Extract distinct categories
      const distinctCats = Array.from(
        new Set(skills.map((s) => s.category || 'General'))
      ).sort();
      setCategories(['All', ...distinctCats]);

      // If analyses exist, set latest as currentAnalysis
      if (analyses.length > 0) {
        setCurrentAnalysis(analyses[0]);
        setTotalJobsAnalyzed(analyses[0].jobs_analyzed);
      } else {
        // Fallback: estimate from skill max counts or zero
        const maxJobs = skills.reduce((max, s) => Math.max(max, s.skill_count), 0);
        setTotalJobsAnalyzed(maxJobs);
        setCurrentAnalysis(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load market analysis';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [careerRoleId, location, experienceLevel, limit]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runSnapshot = useCallback(async () => {
    if (!careerRoleId) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await createAnalysis({
        career_role_id: careerRoleId,
        target_location: location,
        experience_level: experienceLevel,
        sources: 'adzuna',
      });

      const newAnalysis: Analysis = {
        id: res.analysis_id,
        career_role_id: careerRoleId,
        target_location: res.target_location,
        experience_level: res.experience_level,
        jobs_analyzed: res.jobs_analyzed,
        sources: res.sources,
        analysis_date: new Date().toISOString(),
      };

      setCurrentAnalysis(newAnalysis);
      setTotalJobsAnalyzed(res.jobs_analyzed);
      setTopSkills(res.top_skills);
      setHistory((prev) => [newAnalysis, ...prev.filter((a) => a.id !== newAnalysis.id)]);

      const distinctCats = Array.from(
        new Set(res.top_skills.map((s) => s.category || 'General'))
      ).sort();
      setCategories(['All', ...distinctCats]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to run analysis snapshot';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  }, [careerRoleId, location, experienceLevel]);

  const selectSnapshot = useCallback(async (analysis: Analysis) => {
    setCurrentAnalysis(analysis);
    setTotalJobsAnalyzed(analysis.jobs_analyzed);
    setLoading(true);
    try {
      const skills = await getAnalysisSkills(analysis.id);
      setTopSkills(skills);
      const distinctCats = Array.from(
        new Set(skills.map((s) => s.category || 'General'))
      ).sort();
      setCategories(['All', ...distinctCats]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load snapshot skills';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    careerRoleId,
    setCareerRoleId,
    location,
    setLocation,
    experienceLevel,
    setExperienceLevel,
    limit,
    setLimit,
    selectedCategory,
    setSelectedCategory,
    topSkills,
    categories,
    currentAnalysis,
    history,
    totalJobsAnalyzed,
    loading,
    analyzing,
    error,
    refetch: loadData,
    runSnapshot,
    selectSnapshot,
  };
};
