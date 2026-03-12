/**
 * Admission Context
 * Provides the active admission to all child components in the Patient Chart.
 *
 * Admission-based modules (Visits, Clinical Documentation, Plans of Care,
 * Verbal Orders, Authorizations, Billing, Scheduling, Care Team) automatically
 * filter data based on the selected admission.
 *
 * Patient-level modules (Demographics, Alternate Locations, Patient Document
 * Library, Referral History, Patient Alerts) remain unaffected.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { admissionGateway, type Admission } from '../lib/dataGateway';

// ─── Extended admission data with UI-friendly fields ──────────────────────────
export interface AdmissionContextData {
  id: string;
  patientId: string;
  admissionDate: string;
  dischargeDate?: string;
  status: string;
  type: string;
  primaryDiagnosis?: string;
  primaryPayer?: string;
  disciplines: string[];
  caseManager?: string;
  authorizationStatus?: 'authorized' | 'pending' | 'expired' | 'none';
  label: string;
}

interface AdmissionContextType {
  /** All admissions for the current patient */
  admissions: AdmissionContextData[];
  /** Currently selected admission */
  activeAdmission: AdmissionContextData | null;
  /** ID of the currently selected admission */
  activeAdmissionId: string | null;
  /** Switch to a different admission */
  setActiveAdmissionId: (id: string) => void;
  /** Whether admissions are still loading */
  loading: boolean;
  /** Whether the patient has any admissions */
  hasAdmissions: boolean;
  /** Whether the patient has an active admission (status === 'active') */
  hasActiveAdmission: boolean;
  /** Refresh admissions from server */
  refresh: () => Promise<void>;
  /** Helper: is this an admission-level module? */
  isAdmissionModule: (moduleId: string) => boolean;
}

const AdmissionContext = createContext<AdmissionContextType | undefined>(undefined);

// Modules that filter by admission
const ADMISSION_MODULES = new Set([
  'visits',
  'clinical-documentation',
  'plans-of-care',
  'verbal-orders',
  'assessments',
  'authorizations',
  'billing',
  'scheduling',
  'care-team',
  'hospice',
  'activity',
]);

// Modules that remain patient-level
// 'overview', 'demographics', 'alternate-locations', 'documents', 'referral-history', 'alerts'

function mapAdmission(a: Admission): AdmissionContextData {
  const typeGuess = a.primaryPayerId?.toLowerCase().includes('hospice')
    ? 'Hospice'
    : 'Home Health';

  return {
    id: a.id,
    patientId: a.patientId,
    admissionDate: a.admissionDate,
    dischargeDate: a.dischargeDate,
    status: a.status,
    type: typeGuess,
    primaryDiagnosis: a.primaryDiagnosis,
    primaryPayer: a.primaryPayerId || undefined,
    disciplines: [],
    caseManager: undefined,
    authorizationStatus: 'none',
    label: `${typeGuess} — ${a.status.charAt(0).toUpperCase() + a.status.slice(1)}`,
  };
}

interface AdmissionProviderProps {
  patientId: string;
  children: React.ReactNode;
}

export function AdmissionProvider({ patientId, children }: AdmissionProviderProps) {
  const [admissions, setAdmissions] = useState<AdmissionContextData[]>([]);
  const [activeAdmissionId, setActiveAdmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAdmissions = useCallback(async () => {
    if (!patientId) return;
    try {
      setLoading(true);
      const raw = await admissionGateway.getByPatientId(patientId);
      const mapped = raw.map(mapAdmission);
      setAdmissions(mapped);

      // Auto-select the active admission, or fallback to most recent
      const active = mapped.find(
        (a) => a.status === 'active' || a.status === 'admitted',
      );
      if (active) {
        setActiveAdmissionId(active.id);
      } else if (mapped.length > 0) {
        setActiveAdmissionId(mapped[0].id);
      } else {
        setActiveAdmissionId(null);
      }
    } catch (err) {
      console.error('[AdmissionContext] Failed to load admissions:', err);
      setAdmissions([]);
      setActiveAdmissionId(null);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadAdmissions();
  }, [loadAdmissions]);

  const activeAdmission = useMemo(
    () => admissions.find((a) => a.id === activeAdmissionId) ?? null,
    [admissions, activeAdmissionId],
  );

  const value = useMemo<AdmissionContextType>(() => ({
    admissions,
    activeAdmission,
    activeAdmissionId,
    setActiveAdmissionId,
    loading,
    hasAdmissions: admissions.length > 0,
    hasActiveAdmission: admissions.some((a) => a.status === 'active' || a.status === 'admitted'),
    refresh: loadAdmissions,
    isAdmissionModule: (moduleId: string) => ADMISSION_MODULES.has(moduleId),
  }), [admissions, activeAdmission, activeAdmissionId, loading, loadAdmissions]);

  return (
    <AdmissionContext.Provider value={value}>
      {children}
    </AdmissionContext.Provider>
  );
}

export function useAdmission() {
  const ctx = useContext(AdmissionContext);
  if (!ctx) {
    // Safe fallback for components rendered outside the provider
    return {
      admissions: [],
      activeAdmission: null,
      activeAdmissionId: null,
      setActiveAdmissionId: () => {},
      loading: false,
      hasAdmissions: false,
      hasActiveAdmission: false,
      refresh: async () => {},
      isAdmissionModule: () => false,
    } as AdmissionContextType;
  }
  return ctx;
}
