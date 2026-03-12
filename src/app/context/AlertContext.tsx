/**
 * Alert Context
 * Global state management for the clinical alert system.
 * Provides alert data, counts, and mutation methods to all components.
 * 
 * Polls for updates every 60 seconds (configurable).
 * Designed for future WebSocket/SSE migration.
 */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { alertGateway } from '../lib/dataGateway';
import type {
  ClinicalAlert,
  AlertCounts,
  AlertFilters,
} from '../lib/alertTypes';
import { computeAlertCounts, sortAlertsByPriority } from '../lib/alertTypes';

// ─── Context Type ───────────────────────────────────────────────────────────

interface AlertContextValue {
  /** All alerts (sorted by priority) */
  alerts: ClinicalAlert[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Computed counts for badges */
  counts: AlertCounts;
  /** Active (non-resolved/dismissed) alerts */
  activeAlerts: ClinicalAlert[];
  /** Get alerts for a specific patient */
  getPatientAlerts: (patientId: string) => ClinicalAlert[];
  /** Get patient alert counts */
  getPatientAlertCounts: (patientId: string) => AlertCounts;
  /** Acknowledge an alert */
  acknowledge: (alertId: string) => Promise<void>;
  /** Resolve an alert */
  resolve: (alertId: string) => Promise<void>;
  /** Dismiss an alert */
  dismiss: (alertId: string) => Promise<void>;
  /** Force refresh alerts */
  refresh: () => Promise<void>;
}

// ─── Create Context ─────────────────────────────────────────────────────────

const AlertContext = createContext<AlertContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 60_000; // 60 seconds

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<ClinicalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Fetch alerts ─────────────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      const data = await alertGateway.getAlerts();
      setAlerts(data);
      setError(null);
    } catch (err: any) {
      console.error('[AlertContext] Error fetching alerts:', err);
      setError(err.message || 'Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Initial load + polling ───────────────────────────────────────────
  useEffect(() => {
    fetchAlerts();
    intervalRef.current = setInterval(fetchAlerts, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchAlerts]);

  // ─── Computed values ──────────────────────────────────────────────────
  const counts = useMemo(() => computeAlertCounts(alerts), [alerts]);

  const activeAlerts = useMemo(
    () => alerts.filter(a => a.status === 'open' || a.status === 'acknowledged'),
    [alerts]
  );

  // ─── Patient-specific getters ─────────────────────────────────────────
  const getPatientAlerts = useCallback(
    (patientId: string) => sortAlertsByPriority(alerts.filter(a => a.patientId === patientId)),
    [alerts]
  );

  const getPatientAlertCounts = useCallback(
    (patientId: string) => computeAlertCounts(alerts.filter(a => a.patientId === patientId)),
    [alerts]
  );

  // ─── Mutations (optimistic updates) ───────────────────────────────────
  const acknowledge = useCallback(async (alertId: string) => {
    // Optimistic update
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, status: 'acknowledged' as const, acknowledgedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : a
      )
    );
    try {
      await alertGateway.acknowledge(alertId);
    } catch (err) {
      console.error('[AlertContext] Error acknowledging alert:', err);
      // Revert on failure
      fetchAlerts();
    }
  }, [fetchAlerts]);

  const resolve = useCallback(async (alertId: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : a
      )
    );
    try {
      await alertGateway.resolve(alertId);
    } catch (err) {
      console.error('[AlertContext] Error resolving alert:', err);
      fetchAlerts();
    }
  }, [fetchAlerts]);

  const dismiss = useCallback(async (alertId: string) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, status: 'dismissed' as const, updatedAt: new Date().toISOString() }
          : a
      )
    );
    try {
      await alertGateway.dismiss(alertId);
    } catch (err) {
      console.error('[AlertContext] Error dismissing alert:', err);
      fetchAlerts();
    }
  }, [fetchAlerts]);

  // ─── Context value ────────────────────────────────────────────────────
  const value = useMemo<AlertContextValue>(
    () => ({
      alerts,
      loading,
      error,
      counts,
      activeAlerts,
      getPatientAlerts,
      getPatientAlertCounts,
      acknowledge,
      resolve,
      dismiss,
      refresh: fetchAlerts,
    }),
    [alerts, loading, error, counts, activeAlerts, getPatientAlerts, getPatientAlertCounts, acknowledge, resolve, dismiss, fetchAlerts]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAlerts(): AlertContextValue {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return ctx;
}
