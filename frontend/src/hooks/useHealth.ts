import { useState, useEffect, useCallback } from 'react';
import { getHealth } from '../services/healthService';
import type { HealthResponse } from '../types/health';

export interface UseHealthReturn {
  health: HealthResponse | null;
  loading: boolean;
  error: string | null;
  latency: number | null;
  lastChecked: string | null;
  refetch: () => Promise<void>;
}

export const useHealth = (autoFetch: boolean = true): UseHealthReturn => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const fetchHealthData = useCallback(async () => {
    setLoading(true);
    const startTime = performance.now();
    try {
      const data = await getHealth();
      const elapsed = Math.round(performance.now() - startTime);
      setHealth(data);
      setLatency(elapsed);
      setError(null);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to reach Flask backend';
      setError(message);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!autoFetch) return;

    let isMounted = true;
    const startTime = performance.now();

    getHealth()
      .then((data) => {
        if (!isMounted) return;
        const elapsed = Math.round(performance.now() - startTime);
        setHealth(data);
        setLatency(elapsed);
        setError(null);
        setLastChecked(new Date().toLocaleTimeString());
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Failed to reach Flask backend';
        setError(message);
        setHealth(null);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [autoFetch]);

  return {
    health,
    loading,
    error,
    latency,
    lastChecked,
    refetch: fetchHealthData,
  };
};
