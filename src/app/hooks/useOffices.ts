/**
 * Data Access Layer - Offices
 * Reusable hooks for office data operations.
 */
import { useState, useEffect, useCallback } from 'react';
import * as dataGateway from '../lib/dataGateway';
import { useAuth } from './useAuth';

export interface Office {
  id: string;
  name: string;
  address?: string;
  phone?: string;
}

export interface UseOfficesResult {
  offices: Office[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

/**
 * Hook for loading offices for current org
 */
export function useOffices(): UseOfficesResult {
  const { profile, isReady } = useAuth();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOffices = useCallback(async () => {
    if (!isReady || !profile?.org_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await dataGateway.getOffices(profile.org_id);
      setOffices(res.offices || []);
    } catch (err: any) {
      console.error('[useOffices] Error loading offices:', err);
      if (!err.message?.includes('Authentication failed') && 
          !err.message?.includes('No active session')) {
        setError(err.message || 'Failed to load offices');
      }
    } finally {
      setLoading(false);
    }
  }, [isReady, profile?.org_id]);

  useEffect(() => {
    loadOffices();
  }, [loadOffices]);

  return {
    offices,
    loading,
    error,
    reload: loadOffices,
  };
}
