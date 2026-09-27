import { useState, useEffect, useCallback } from 'react';
import { getCareers, getCategories } from '../services/careerService';
import type { CareerRole } from '../types/career';

const SELECTED_CAREER_KEY = 'career_intelligence_selected_role_id';

export interface UseCareersReturn {
  careers: CareerRole[];
  categories: string[];
  selectedRole: CareerRole | null;
  selectedRoleId: number | null;
  selectedCategory: string;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  setSelectedCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  selectCareer: (role: CareerRole) => void;
  refetch: () => Promise<void>;
}

export const useCareers = (): UseCareersReturn => {
  const [careers, setCareers] = useState<CareerRole[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(() => {
    const saved = localStorage.getItem(SELECTED_CAREER_KEY);
    return saved ? parseInt(saved, 10) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCareers = useCallback(async () => {
    setLoading(true);
    try {
      const [careerList, categoryList] = await Promise.all([
        getCareers(selectedCategory !== 'All' ? selectedCategory : undefined, searchQuery || undefined),
        getCategories().catch(() => []),
      ]);
      setCareers(careerList);
      if (categoryList.length > 0) {
        setCategories(['All', ...categoryList]);
      }
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch careers';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      getCareers(selectedCategory !== 'All' ? selectedCategory : undefined, searchQuery || undefined),
      getCategories().catch(() => []),
    ])
      .then(([careerList, categoryList]) => {
        if (!isMounted) return;
        setCareers(careerList);
        if (categoryList.length > 0) {
          setCategories(['All', ...categoryList]);
        }
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to fetch careers';
        setError(message);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery]);

  const selectCareer = useCallback((role: CareerRole) => {
    setSelectedRoleId(role.id);
    localStorage.setItem(SELECTED_CAREER_KEY, role.id.toString());
  }, []);

  const selectedRole = careers.find((c) => c.id === selectedRoleId) || null;

  return {
    careers,
    categories,
    selectedRole,
    selectedRoleId,
    selectedCategory,
    searchQuery,
    loading,
    error,
    setSelectedCategory,
    setSearchQuery,
    selectCareer,
    refetch: fetchCareers,
  };
};
