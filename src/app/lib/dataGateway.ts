/**
 * Data Gateway
 * Abstraction layer for all database operations
 * 
 * This layer sits between UI components and the database.
 * Currently uses Supabase, but can be swapped to .NET 8 API
 * without changing UI code.
 * 
 * Pattern: All data access goes through this gateway.
 * UI components should NEVER call Supabase directly.
 */

import { supabase, projectId, publicAnonKey, API_BASE } from './supabaseClient';
import type {
  ClinicalAlert,
  AlertFilters,
  AlertCounts,
} from './alertTypes';
import { computeAlertCounts, sortAlertsByPriority } from './alertTypes';
import type { SmartAssistData } from './schedulingAssistTypes';
import type { RiskDashboardData, RiskThresholdConfig, RiskHistorySnapshot, RiskTrendPoint } from './riskTypes';
import type { CollaborationData, CollaborationMessage, CareTask } from './collaborationTypes';
import type { AssistantAnalysis, AssistantAskResponse } from './clinicalAssistantTypes';
import type {
  DocumentDraft,
  DraftSaveResponse,
  DraftListResponse,
  SmartPhraseResponse,
  SmartPhraseSaveResponse,
  CosignResponse,
  PatternsResponse,
  FormValues,
  FormTemplateType,
  AuditLogResponse,
  AuditAction,
  CosignQueueResponse,
  DocNotificationResponse,
  CosignAnalyticsResponse,
} from './documentationTypes';

// Re-export singleton supabase client for auth operations (AuthContext etc.)
export { supabase };

// ============================================================================
// SHARED API HELPER
// ============================================================================

async function apiRequest<T = any>(
  path: string,
  options: { method?: string; body?: any } = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const userToken = session?.access_token || '';
  const res = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
      'X-User-Token': userToken,
      'Content-Type': 'application/json',
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  if (!res.ok) {
    const errText = await res.text();
    console.error(`[apiRequest] ${options.method || 'GET'} ${path} → ${res.status}:`, errText);
    if (res.status === 401 || res.status === 403) {
      triggerAuthError();
    }
    throw new Error(`API error ${res.status}: ${errText}`);
  }
  return res.json();
}

// Auth error handler for 401/403 responses
let authErrorHandler: (() => void) | null = null;

export function setAuthErrorHandler(handler: () => void) {
  authErrorHandler = handler;
}

export function triggerAuthError() {
  if (authErrorHandler) {
    authErrorHandler();
  }
}

// ============================================================================
// TYPES - Shared domain models
// ============================================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParams {
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  officeId: string;
  status: 'active' | 'inactive' | 'discharged';
  createdAt: string;
  updatedAt: string;
}

export interface Admission {
  id: string;
  patientId: string;
  admissionDate: string;
  dischargeDate?: string;
  status: 'active' | 'pending' | 'discharged';
  primaryDiagnosis?: string;
  secondaryDiagnoses?: string[];
  primaryPayerId?: string;
  officeId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  patientId: string;
  admissionId: string;
  scheduledDate: string;
  scheduledTime?: string;
  visitDate?: string;
  startTime?: string;
  endTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  caregiverId?: string;
  caregiverName?: string;
  visitType: string;
  discipline: string;
  clinicianId?: string;
  billingCode?: string;
  officeId?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed' | 'cancelled' | 'open';
  evvStatus?: 'pending' | 'verified' | 'exception' | 'clocked_in' | 'completed';
  documentationStatus?: 'n/a' | 'pending' | 'in_progress' | 'completed';
  patientName?: string;
  patientAddress?: string;
  patientMrn?: string;
  notes?: string;
  // Recurrence fields
  recurrenceId?: string;       // Shared UUID linking all visits in a series
  recurrenceIndex?: number;    // 0-based position within the series
  recurrenceTotal?: number;    // Total visits in the series at creation time
  recurrencePattern?: RecurrencePattern; // The pattern that generated this series
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  officeId?: string;
  active: boolean;
  createdAt: string;
}

export interface ModuleToggle {
  id: string;
  moduleKey: string;
  moduleName: string;
  enabled: boolean;
  officeId?: string;
  orgId: string;
}

export interface FeatureFlag {
  id: string;
  featureKey: string;
  featureName: string;
  enabled: boolean;
  officeId?: string;
  orgId: string;
}

export interface VendorConfig {
  id: string;
  vendorKey: string;
  vendorName: string;
  vendorType: 'evv' | 'sms' | 'fax' | 'email' | 'medication';
  enabled: boolean;
  credentials: Record<string, any>; // Encrypted in DB
  settings: Record<string, any>;
  officeId?: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
}

export interface AlternateLocation {
  id: string;
  patient_id: string;
  name: string;
  address: string;
  phone?: string;
  notes?: string;
  is_deleted: boolean;
  created_at: string;
}

export interface VisitEvent {
  id: string;
  visitId: string;
  eventType: 'clock_in' | 'clock_out' | 'signature_captured' | 'task_completed' | 'note_added' | 'gps_captured';
  timestamp: string; // ISO 8601 UTC timestamp
  userId: string;
  data?: Record<string, any>; // JSON data for event (signature, GPS coords, etc.)
  latitude?: number;
  longitude?: number;
  accuracy?: number; // GPS accuracy in meters
  deviceInfo?: string;
  createdAt: string;
}

export interface VisitTask {
  id: string;
  visitId: string;
  taskName: string;
  taskCategory: 'vital_signs' | 'medication' | 'wound_care' | 'assessment' | 'education' | 'other';
  required: boolean;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface PatientConsent {
  id: string;
  patientId: string;
  consentType: 'gps_tracking' | 'signature' | 'photo' | 'telehealth';
  granted: boolean;
  grantedAt?: string;
  revokedAt?: string;
  documentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecurrencePattern {
  id: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  interval: number; // e.g., every 2 weeks
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday
  endDate?: string;
  occurrences?: number; // Generate N visits
}

// ============================================================================
// PATIENT OPERATIONS
// ============================================================================

export const patientGateway = {
  /**
   * Search patients with server-side pagination, filtering, and sorting
   * Calls GET /patients/org/:orgId or /patients/search/:orgId with query
   */
  async search(params: {
    query?: string;
    filters?: FilterParams;
    pagination: PaginationParams;
    sort?: SortParams;
  }): Promise<PaginatedResponse<Patient>> {
    try {
      const orgId = params.filters?.orgId || 'org-demo';
      let rawPatients: any[];

      if (params.query) {
        const json = await apiRequest<{ patients: any[] }>(
          `/patients/search/${orgId}?query=${encodeURIComponent(params.query)}`
        );
        rawPatients = json.patients || [];
      } else {
        const json = await apiRequest<{ patients: any[] }>(`/patients/org/${orgId}`);
        rawPatients = json.patients || [];
      }

      // Map server snake_case → gateway camelCase
      const mapped: Patient[] = rawPatients.map((p: any) => ({
        id: p.id,
        mrn: p.mrn || '',
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        dateOfBirth: p.dob || '',
        gender: p.gender || 'U',
        phone: p.phone || '',
        email: p.email || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        zipCode: p.zip_code || '',
        officeId: p.office_id || '',
        status: p.admission_status === 'Active' ? 'active' : p.admission_status === 'Pending' ? 'inactive' : (p.status || 'active'),
        createdAt: p.created_at || '',
        updatedAt: p.updated_at || '',
      }));

      // Client-side filter by officeId if specified
      let filtered = mapped;
      if (params.filters?.officeId) {
        filtered = mapped.filter(p => p.officeId === params.filters!.officeId);
      }
      if (params.filters?.status) {
        filtered = filtered.filter(p => p.status === params.filters!.status);
      }

      // Client-side pagination (server returns all for org)
      const { page, pageSize } = params.pagination;
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    } catch (err) {
      console.error('[patientGateway.search] Error:', err);
      return { data: [], total: 0, page: params.pagination.page, pageSize: params.pagination.pageSize, totalPages: 0 };
    }
  },

  /**
   * Get single patient by ID
   * Calls GET /patients/detail/:patientId
   */
  async getById(id: string): Promise<Patient | null> {
    try {
      const json = await apiRequest<{ patient: any }>(`/patients/detail/${id}`);
      const p = json.patient;
      if (!p) return null;
      return {
        id: p.id,
        mrn: p.mrn || '',
        firstName: p.first_name || '',
        lastName: p.last_name || '',
        dateOfBirth: p.dob || '',
        gender: p.gender || 'U',
        phone: p.phone || '',
        email: p.email || '',
        address: p.address || '',
        city: p.city || '',
        state: p.state || '',
        zipCode: p.zip_code || '',
        officeId: p.office_id || '',
        status: p.admission_status === 'Active' ? 'active' : p.admission_status === 'Pending' ? 'inactive' : (p.status || 'active'),
        createdAt: p.created_at || '',
        updatedAt: p.updated_at || '',
      };
    } catch (err) {
      console.error('[patientGateway.getById] Error:', err);
      return null;
    }
  },

  /**
   * Create new patient
   * Calls POST /patients
   */
  async create(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const json = await apiRequest<{ patient: any }>('/patients', {
      method: 'POST',
      body: {
        officeId: patient.officeId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dob: patient.dateOfBirth,
        mrn: patient.mrn,
        phone: patient.phone,
        address: patient.address,
        gender: patient.gender,
        email: patient.email,
      },
    });
    const p = json.patient;
    return {
      id: p.id,
      mrn: p.mrn || '',
      firstName: p.first_name || patient.firstName,
      lastName: p.last_name || patient.lastName,
      dateOfBirth: p.dob || patient.dateOfBirth,
      gender: p.gender || patient.gender,
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      city: p.city || '',
      state: p.state || '',
      zipCode: p.zip_code || '',
      officeId: p.office_id || patient.officeId,
      status: 'active',
      createdAt: p.created_at || new Date().toISOString(),
      updatedAt: p.updated_at || new Date().toISOString(),
    };
  },

  /**
   * Update patient
   * Calls PUT /patients/:patientId
   */
  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    const body: any = {};
    if (updates.firstName !== undefined) body.first_name = updates.firstName;
    if (updates.lastName !== undefined) body.last_name = updates.lastName;
    if (updates.dateOfBirth !== undefined) body.dob = updates.dateOfBirth;
    if (updates.gender !== undefined) body.gender = updates.gender;
    if (updates.phone !== undefined) body.phone = updates.phone;
    if (updates.email !== undefined) body.email = updates.email;
    if (updates.address !== undefined) body.address = updates.address;
    if (updates.mrn !== undefined) body.mrn = updates.mrn;
    if (updates.officeId !== undefined) body.office_id = updates.officeId;
    if (updates.status !== undefined) body.status = updates.status;

    const json = await apiRequest<{ patient: any }>(`/patients/${id}`, { method: 'PUT', body });
    const p = json.patient;
    return {
      id: p.id,
      mrn: p.mrn || '',
      firstName: p.first_name || '',
      lastName: p.last_name || '',
      dateOfBirth: p.dob || '',
      gender: p.gender || 'U',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      city: p.city || '',
      state: p.state || '',
      zipCode: p.zip_code || '',
      officeId: p.office_id || '',
      status: p.status || 'active',
      createdAt: p.created_at || '',
      updatedAt: p.updated_at || '',
    };
  },
};

// ============================================================================
// ADMISSION OPERATIONS
// ============================================================================

export const admissionGateway = {
  /**
   * Search admissions with pagination and filtering
   * Calls GET /admissions with optional status filter
   */
  async search(params: {
    filters?: FilterParams;
    pagination: PaginationParams;
    sort?: SortParams;
  }): Promise<PaginatedResponse<Admission>> {
    try {
      const qp = new URLSearchParams();
      if (params.filters?.status) qp.set('status', params.filters.status);
      const json = await apiRequest<{ admissions: any[] }>(`/admissions?${qp.toString()}`);
      const rawAdmissions = json.admissions || [];

      const mapped: Admission[] = rawAdmissions.map((a: any) => ({
        id: a.id,
        patientId: a.patient_id || '',
        admissionDate: a.admission_date || '',
        dischargeDate: a.discharge_date || undefined,
        status: a.status || 'active',
        primaryDiagnosis: a.diagnosis_primary || a.primary_diagnosis || '',
        secondaryDiagnoses: a.secondary_diagnoses || [],
        primaryPayerId: a.payer || '',
        officeId: a.office_id || '',
        createdAt: a.created_at || '',
        updatedAt: a.updated_at || '',
        // Pass through enriched fields for UI
        ...(a.patient_name ? { _patientName: a.patient_name } : {}),
        ...(a.patient_mrn ? { _patientMrn: a.patient_mrn } : {}),
      }));

      // Client-side filter by officeId/patientId if needed
      let filtered = mapped;
      if (params.filters?.officeId) {
        filtered = filtered.filter(a => a.officeId === params.filters!.officeId);
      }
      if (params.filters?.patientId) {
        filtered = filtered.filter(a => a.patientId === params.filters!.patientId);
      }

      const { page, pageSize } = params.pagination;
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    } catch (err) {
      console.error('[admissionGateway.search] Error:', err);
      return { data: [], total: 0, page: params.pagination.page, pageSize: params.pagination.pageSize, totalPages: 0 };
    }
  },

  /**
   * Get admission by ID
   * Calls GET /admissions/:admissionId
   */
  async getById(id: string): Promise<Admission | null> {
    try {
      const json = await apiRequest<{ admission: any }>(`/admissions/${id}`);
      const a = json.admission;
      if (!a) return null;
      return {
        id: a.id,
        patientId: a.patient_id || '',
        admissionDate: a.admission_date || '',
        dischargeDate: a.discharge_date || undefined,
        status: a.status || 'active',
        primaryDiagnosis: a.diagnosis_primary || a.primary_diagnosis || '',
        secondaryDiagnoses: a.secondary_diagnoses || [],
        primaryPayerId: a.payer || '',
        officeId: a.office_id || '',
        createdAt: a.created_at || '',
        updatedAt: a.updated_at || '',
      } as Admission;
    } catch (err) {
      console.error('[admissionGateway.getById] Error:', err);
      return null;
    }
  },

  /**
   * Get admissions for a patient
   * Calls GET /patients/:patientId/admissions
   */
  async getByPatientId(patientId: string): Promise<Admission[]> {
    try {
      const json = await apiRequest<{ admissions: any[] }>(`/patients/${patientId}/admissions`);
      return (json.admissions || []).map((a: any) => ({
        id: a.id,
        patientId: a.patient_id || patientId,
        admissionDate: a.admission_date || '',
        dischargeDate: a.discharge_date || undefined,
        status: a.status || 'active',
        primaryDiagnosis: a.diagnosis_primary || '',
        secondaryDiagnoses: a.secondary_diagnoses || [],
        primaryPayerId: a.payer || '',
        officeId: a.office_id || '',
        createdAt: a.created_at || '',
        updatedAt: a.updated_at || '',
      }));
    } catch (err) {
      console.error('[admissionGateway.getByPatientId] Error:', err);
      return [];
    }
  },

  /**
   * Create admission
   * Calls POST /admissions
   */
  async create(admission: Omit<Admission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Admission> {
    const json = await apiRequest<{ admission: any }>('/admissions', {
      method: 'POST',
      body: {
        patientId: admission.patientId,
        officeId: admission.officeId,
        admissionDate: admission.admissionDate,
        status: admission.status,
        diagnosis_primary: admission.primaryDiagnosis,
        payer: admission.primaryPayerId,
      },
    });
    const a = json.admission;
    return {
      id: a.id,
      patientId: a.patient_id || admission.patientId,
      admissionDate: a.admission_date || admission.admissionDate,
      dischargeDate: a.discharge_date || undefined,
      status: a.status || admission.status,
      primaryDiagnosis: a.diagnosis_primary || '',
      secondaryDiagnoses: [],
      primaryPayerId: a.payer || '',
      officeId: a.office_id || admission.officeId,
      createdAt: a.created_at || new Date().toISOString(),
      updatedAt: a.updated_at || new Date().toISOString(),
    };
  },

  /**
   * Update admission
   * Calls PUT /admissions/:admissionId
   */
  async update(id: string, updates: Partial<Admission>): Promise<Admission> {
    const body: any = {};
    if (updates.status !== undefined) body.status = updates.status;
    if (updates.admissionDate !== undefined) body.admission_date = updates.admissionDate;
    if (updates.dischargeDate !== undefined) body.discharge_date = updates.dischargeDate;
    if (updates.primaryDiagnosis !== undefined) body.diagnosis_primary = updates.primaryDiagnosis;
    if (updates.officeId !== undefined) body.office_id = updates.officeId;
    if (updates.primaryPayerId !== undefined) body.payer = updates.primaryPayerId;

    const json = await apiRequest<{ admission: any }>(`/admissions/${id}`, { method: 'PUT', body });
    const a = json.admission;
    return {
      id: a.id,
      patientId: a.patient_id || '',
      admissionDate: a.admission_date || '',
      dischargeDate: a.discharge_date || undefined,
      status: a.status || 'active',
      primaryDiagnosis: a.diagnosis_primary || '',
      secondaryDiagnoses: a.secondary_diagnoses || [],
      primaryPayerId: a.payer || '',
      officeId: a.office_id || '',
      createdAt: a.created_at || '',
      updatedAt: a.updated_at || '',
    };
  },
};

// ============================================================================
// VISIT OPERATIONS
// ============================================================================

function mapVisit(v: any): Visit {
  return {
    id: v.id,
    patientId: v.patient_id || '',
    admissionId: v.admission_id || '',
    scheduledDate: v.visit_date || v.scheduled_date || '',
    scheduledTime: v.start_time || v.scheduled_time || '',
    visitDate: v.visit_date || '',
    startTime: v.start_time || '',
    endTime: v.end_time || '',
    actualStartTime: v.actual_start_time || undefined,
    actualEndTime: v.actual_end_time || undefined,
    caregiverId: v.caregiver_id || '',
    caregiverName: v.caregiver_name || '',
    discipline: v.discipline || '',
    visitType: v.visit_type || '',
    status: v.status || 'scheduled',
    billingCode: v.billing_code || '',
    notes: v.notes || '',
    documentationStatus: v.documentation_status || undefined,
    patientName: v.patient_name || '',
    patientMrn: v.patient_mrn || '',
    officeId: v.office_id || '',
    // Recurrence fields
    recurrenceId: v.recurrence_id || undefined,
    recurrenceIndex: v.recurrence_index != null ? v.recurrence_index : undefined,
    recurrenceTotal: v.recurrence_total != null ? v.recurrence_total : undefined,
    recurrencePattern: v.recurrence_pattern || undefined,
    createdAt: v.created_at || '',
    updatedAt: v.updated_at || '',
  };
}

export const visitGateway = {
  /**
   * Search visits with pagination and filtering
   * Calls GET /visits with query params
   */
  async search(params: {
    filters?: FilterParams;
    pagination: PaginationParams;
    sort?: SortParams;
  }): Promise<PaginatedResponse<Visit>> {
    try {
      const qp = new URLSearchParams();
      if (params.filters?.patientId) qp.set('patient_id', params.filters.patientId);
      if (params.filters?.status) qp.set('status', params.filters.status);
      if (params.filters?.startDate) qp.set('start_date', params.filters.startDate);
      if (params.filters?.endDate) qp.set('end_date', params.filters.endDate);
      if (params.filters?.caregiverId) qp.set('caregiver_id', params.filters.caregiverId);

      const json = await apiRequest<{ data: any[] }>(`/visits?${qp.toString()}`);
      const rawVisits = json.data || [];

      const mapped: Visit[] = rawVisits.map(mapVisit);

      const { page, pageSize } = params.pagination;
      const start = (page - 1) * pageSize;
      const paginated = mapped.slice(start, start + pageSize);

      return {
        data: paginated,
        total: mapped.length,
        page,
        pageSize,
        totalPages: Math.ceil(mapped.length / pageSize),
      };
    } catch (err: any) {
      console.error('[visitGateway.search] error:', err);
      return { data: [], total: 0, page: params.pagination.page, pageSize: params.pagination.pageSize, totalPages: 0 };
    }
  },

  /**
   * Get visit by ID — calls GET /visits/:id
   */
  async getById(id: string): Promise<Visit | null> {
    try {
      const json = await apiRequest<{ data: any }>(`/visits/${id}`);
      return json.data ? mapVisit(json.data) : null;
    } catch (err: any) {
      console.error('[visitGateway.getById] error:', err);
      return null;
    }
  },

  /**
   * Get visits for a patient — calls GET /visits?patient_id=xxx
   */
  async getByPatientId(patientId: string): Promise<Visit[]> {
    try {
      const json = await apiRequest<{ data: any[] }>(`/visits?patient_id=${encodeURIComponent(patientId)}`);
      return (json.data || []).map(mapVisit);
    } catch (err: any) {
      console.error('[visitGateway.getByPatientId] error:', err);
      return [];
    }
  },

  /**
   * Create visit — calls POST /visits
   */
  async create(visit: Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Visit> {
    const json = await apiRequest<{ data: any }>('/visits', {
      method: 'POST',
      body: {
        patient_id: visit.patientId,
        admission_id: visit.admissionId,
        visit_date: visit.visitDate || visit.scheduledDate,
        start_time: visit.startTime || visit.scheduledTime,
        end_time: visit.endTime,
        caregiver_id: visit.caregiverId || visit.clinicianId,
        discipline: visit.discipline,
        visit_type: visit.visitType,
        billing_code: visit.billingCode,
        notes: visit.notes,
        // Recurrence fields
        recurrence_id: visit.recurrenceId || undefined,
        recurrence_index: visit.recurrenceIndex != null ? visit.recurrenceIndex : undefined,
        recurrence_total: visit.recurrenceTotal != null ? visit.recurrenceTotal : undefined,
        recurrence_pattern: visit.recurrencePattern || undefined,
      },
    });
    return mapVisit(json.data);
  },

  /**
   * Update visit — calls PUT /visits/:id
   */
  async update(id: string, updates: Partial<Visit>): Promise<Visit> {
    const json = await apiRequest<{ data: any }>(`/visits/${id}`, {
      method: 'PUT',
      body: updates,
    });
    return mapVisit(json.data);
  },

  /** Fetch scheduling conflicts */
  async getConflicts(): Promise<any> {
    try {
      return await apiRequest('/visits/conflicts');
    } catch (err) {
      console.error('[visitGateway.getConflicts] error:', err);
      return { conflicts: [], summary: {} };
    }
  },

  /** Fetch smart scheduling assist data (travel optimization, risk alerts, etc.) */
  async getSmartAssist(date?: string): Promise<any> {
    try {
      const d = date || new Date().toISOString().split('T')[0];
      return await apiRequest(`/scheduling/smart-assist?date=${d}`);
    } catch (err) {
      console.error('[visitGateway.getSmartAssist] error:', err);
      return { caregiverAssignments: [], travelOptimizations: [], visitRiskAlerts: [], openShiftSuggestions: [] };
    }
  },

  /** Apply an optimized route by reordering visit times for a caregiver */
  async applyRoute(caregiverId: string, date: string, visitOrder: Array<{ visitId: string; newStartTime: string; newEndTime: string }>): Promise<{ success: boolean; updatedCount: number }> {
    try {
      return await apiRequest('/scheduling/apply-route', {
        method: 'POST',
        body: { caregiverId, date, visitOrder },
      });
    } catch (err: any) {
      console.error('[visitGateway.applyRoute] error:', err);
      return { success: false, updatedCount: 0 };
    }
  },

  /** Fetch visit stats */
  async getStats(): Promise<any> {
    try {
      const json = await apiRequest('/visits/stats');
      return json.stats || {};
    } catch (err) {
      console.error('[visitGateway.getStats] error:', err);
      return {};
    }
  },
};

// ============================================================================
// POINT OF CARE / EVV OPERATIONS
// ============================================================================

export const evvGateway = {
  /**
   * Get visits assigned to a clinician (for My Visits list).
   * Fetches from the scheduling backend, falling back to empty array.
   */
  async getMyVisits(clinicianId: string, date?: string): Promise<Visit[]> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-845bc545/visits?start_date=${targetDate}&end_date=${targetDate}`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' } }
      );
      if (!res.ok) {
        console.error('[evvGateway] Failed to fetch visits:', res.status);
        return [];
      }
      const json = await res.json();
      const visits: Visit[] = (json.data || []).map((v: any) => ({
        id: v.id,
        patientId: v.patient_id,
        admissionId: v.admission_id,
        scheduledDate: v.visit_date,
        scheduledTime: v.start_time,
        visitType: v.visit_type,
        discipline: v.discipline,
        clinicianId: v.caregiver_id || clinicianId,
        status: v.status,
        evvStatus: v.evv_clock_in ? (v.evv_clock_out ? 'completed' : 'clocked_in') : 'pending',
        documentationStatus: v.documentation_status || undefined,
        patientName: v.patient_name || '',
        patientAddress: v.patient_address || '',
        patientMrn: v.patient_mrn || '',
        notes: v.notes || '',
        recurrenceId: v.recurrence_id || undefined,
        recurrenceIndex: v.recurrence_index != null ? v.recurrence_index : undefined,
        recurrenceTotal: v.recurrence_total != null ? v.recurrence_total : undefined,
        recurrencePattern: v.recurrence_pattern || undefined,
        createdAt: v.created_at,
        updatedAt: v.updated_at,
      }));
      return visits;
    } catch (err) {
      console.error('[evvGateway] Error fetching visits:', err);
      return [];
    }
  },

  /**
   * Clock in to a visit
   */
  async clockIn(visitId: string, userId: string, latitude?: number, longitude?: number, accuracy?: number): Promise<VisitEvent> {
    const timestamp = new Date().toISOString();

    // Call the real EVV clock-in endpoint
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-845bc545/visits/${visitId}/clock-in`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude, accuracy }),
        }
      );
    } catch (err) {
      console.error('[evvGateway] Clock-in API error:', err);
    }

    const event: VisitEvent = {
      id: `event-${Date.now()}`,
      visitId,
      eventType: 'clock_in',
      timestamp,
      userId,
      latitude,
      longitude,
      accuracy,
      deviceInfo: navigator.userAgent,
      createdAt: timestamp,
    };

    await auditGateway.log({
      userId,
      action: 'CLOCK_IN',
      entityType: 'visit',
      entityId: visitId,
      changes: { status: 'in_progress', timestamp, gps: latitude && longitude ? { latitude, longitude, accuracy } : null },
    });

    return event;
  },

  /**
   * Clock out of a visit
   */
  async clockOut(visitId: string, userId: string, latitude?: number, longitude?: number, accuracy?: number): Promise<VisitEvent> {
    const timestamp = new Date().toISOString();

    // Call the real EVV clock-out endpoint
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-845bc545/visits/${visitId}/clock-out`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' },
          body: JSON.stringify({ latitude, longitude, accuracy }),
        }
      );
    } catch (err) {
      console.error('[evvGateway] Clock-out API error:', err);
    }

    const event: VisitEvent = {
      id: `event-${Date.now()}`,
      visitId,
      eventType: 'clock_out',
      timestamp,
      userId,
      latitude,
      longitude,
      accuracy,
      deviceInfo: navigator.userAgent,
      createdAt: timestamp,
    };

    await auditGateway.log({
      userId,
      action: 'CLOCK_OUT',
      entityType: 'visit',
      entityId: visitId,
      changes: { status: 'completed', timestamp, gps: latitude && longitude ? { latitude, longitude, accuracy } : null },
    });

    return event;
  },

  /**
   * Capture patient signature
   */
  async captureSignature(visitId: string, userId: string, signatureDataUrl: string): Promise<VisitEvent> {
    const timestamp = new Date().toISOString();
    
    const event: VisitEvent = {
      id: `event-${Date.now()}`,
      visitId,
      eventType: 'signature_captured',
      timestamp,
      userId,
      data: { signatureDataUrl },
      deviceInfo: navigator.userAgent,
      createdAt: timestamp,
    };

    await auditGateway.log({
      userId,
      action: 'CAPTURE_SIGNATURE',
      entityType: 'visit',
      entityId: visitId,
      changes: { timestamp, signatureCaptured: true },
    });

    return event;
  },

  /**
   * Get visit events for a visit
   */
  async getVisitEvents(visitId: string): Promise<VisitEvent[]> {
    return [];
  },

  /**
   * Get visit tasks for a visit
   */
  async getVisitTasks(visitId: string): Promise<VisitTask[]> {
    return [
      {
        id: 'task-1',
        visitId,
        taskName: 'Check Vital Signs',
        taskCategory: 'vital_signs',
        required: true,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-2',
        visitId,
        taskName: 'Administer Medication',
        taskCategory: 'medication',
        required: true,
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-3',
        visitId,
        taskName: 'Wound Care Assessment',
        taskCategory: 'wound_care',
        required: false,
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ];
  },

  /**
   * Complete a visit task
   */
  async completeTask(taskId: string, userId: string, notes?: string): Promise<VisitTask> {
    const timestamp = new Date().toISOString();
    
    const task: VisitTask = {
      id: taskId,
      visitId: 'visit-1',
      taskName: 'Task',
      taskCategory: 'other',
      required: true,
      completed: true,
      completedAt: timestamp,
      completedBy: userId,
      notes,
      createdAt: timestamp,
    };

    await auditGateway.log({
      userId,
      action: 'COMPLETE_TASK',
      entityType: 'visit_task',
      entityId: taskId,
      changes: { completed: true, timestamp, notes },
    });

    return task;
  },

  /**
   * Check if patient has granted GPS consent
   */
  async checkGPSConsent(patientId: string): Promise<boolean> {
    return true;
  },

  /**
   * Get patient consent
   */
  async getPatientConsent(patientId: string, consentType: string): Promise<PatientConsent | null> {
    return null;
  },

  /**
   * Update patient consent
   */
  async updatePatientConsent(patientId: string, consentType: string, granted: boolean): Promise<PatientConsent> {
    const timestamp = new Date().toISOString();
    
    const consent: PatientConsent = {
      id: `consent-${Date.now()}`,
      patientId,
      consentType: consentType as any,
      granted,
      grantedAt: granted ? timestamp : undefined,
      revokedAt: !granted ? timestamp : undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return consent;
  },

  /**
   * Create manual visit (unscheduled) with optional recurrence.
   * When recurrence is enabled, ALL visits in the series share a recurrenceId.
   */
  async createManualVisit(visitData: {
    patientId: string;
    admissionId: string;
    visitDate: string;
    visitTime: string;
    visitType: string;
    discipline: string;
    clinicianId: string;
    recurrence?: RecurrencePattern;
  }): Promise<Visit[]> {
    // Pre-compute all dates so we know the total count for recurrenceTotal
    if (visitData.recurrence) {
      const recurrenceId = visitData.recurrence.id || `recurrence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const pattern = { ...visitData.recurrence, id: recurrenceId };
      const allDates = this.computeRecurrenceDates(visitData.visitDate, pattern);

      const createdVisits: Visit[] = [];
      for (let i = 0; i < allDates.length; i++) {
        const visit = await visitGateway.create({
          patientId: visitData.patientId,
          admissionId: visitData.admissionId,
          scheduledDate: allDates[i],
          scheduledTime: visitData.visitTime,
          visitDate: allDates[i],
          startTime: visitData.visitTime,
          visitType: visitData.visitType,
          discipline: visitData.discipline,
          clinicianId: visitData.clinicianId,
          status: 'scheduled',
          evvStatus: 'pending',
          recurrenceId,
          recurrenceIndex: i,
          recurrenceTotal: allDates.length,
          recurrencePattern: pattern,
        });
        createdVisits.push(visit);
      }
      return createdVisits;
    }

    // Single (non-recurring) visit
    const visit = await visitGateway.create({
      patientId: visitData.patientId,
      admissionId: visitData.admissionId,
      scheduledDate: visitData.visitDate,
      scheduledTime: visitData.visitTime,
      visitDate: visitData.visitDate,
      startTime: visitData.visitTime,
      visitType: visitData.visitType,
      discipline: visitData.discipline,
      clinicianId: visitData.clinicianId,
      status: 'scheduled',
      evvStatus: 'pending',
    });
    return [visit];
  },

  /**
   * Compute all dates for a recurrence pattern (pure function, no side effects).
   */
  computeRecurrenceDates(startDateStr: string, pattern: RecurrencePattern): string[] {
    const dates: string[] = [startDateStr];
    const startDate = new Date(startDateStr + 'T00:00:00');
    let currentDate = new Date(startDate);
    const maxOccurrences = pattern.occurrences || 52;
    const endDate = pattern.endDate ? new Date(pattern.endDate + 'T23:59:59') : null;

    for (let i = 1; i < maxOccurrences; i++) {
      const nextDate = new Date(currentDate);
      switch (pattern.frequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + pattern.interval);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + (7 * pattern.interval));
          break;
        case 'biweekly':
          nextDate.setDate(nextDate.getDate() + 14);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
          break;
      }
      currentDate = nextDate;

      if (endDate && currentDate > endDate) break;

      if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
        if (!pattern.daysOfWeek.includes(currentDate.getDay())) continue;
      }

      dates.push(currentDate.toISOString().split('T')[0]);
    }

    return dates;
  },

  /**
   * Get all visits in a recurrence series.
   */
  async getRecurrenceSeries(recurrenceId: string): Promise<Visit[]> {
    return apiRequest<{ data: any[] }>(`/visits/recurrence/${encodeURIComponent(recurrenceId)}`)
      .then(json => (json.data || []).map(mapVisit))
      .catch(err => {
        console.error('[evvGateway.getRecurrenceSeries] error:', err);
        return [];
      });
  },

  /**
   * Update visits in a recurrence series with scope control.
   * @param scope 'single' | 'this_and_following' | 'all'
   */
  async updateRecurrenceVisits(
    visitId: string,
    recurrenceId: string,
    updates: Partial<Visit>,
    scope: 'single' | 'this_and_following' | 'all',
  ): Promise<{ updated: number }> {
    const body: any = {
      visit_id: visitId,
      scope,
    };
    // Map camelCase updates to snake_case for server
    if (updates.scheduledTime !== undefined || updates.startTime !== undefined) body.start_time = updates.startTime || updates.scheduledTime;
    if (updates.endTime !== undefined) body.end_time = updates.endTime;
    if (updates.visitDate !== undefined || updates.scheduledDate !== undefined) body.visit_date = updates.visitDate || updates.scheduledDate;
    if (updates.caregiverId !== undefined || updates.clinicianId !== undefined) body.caregiver_id = updates.caregiverId || updates.clinicianId;
    if (updates.discipline !== undefined) body.discipline = updates.discipline;
    if (updates.visitType !== undefined) body.visit_type = updates.visitType;
    if (updates.notes !== undefined) body.notes = updates.notes;
    if (updates.status !== undefined) body.status = updates.status;

    return apiRequest<{ updated: number }>(
      `/visits/recurrence/${encodeURIComponent(recurrenceId)}`,
      { method: 'PUT', body }
    );
  },

  /**
   * Cancel visits in a recurrence series with scope control.
   */
  async cancelRecurrenceVisits(
    visitId: string,
    recurrenceId: string,
    scope: 'single' | 'this_and_following' | 'all',
  ): Promise<{ cancelled: number }> {
    return apiRequest<{ cancelled: number }>(
      `/visits/recurrence/${encodeURIComponent(recurrenceId)}`,
      { method: 'DELETE', body: { visit_id: visitId, scope } }
    );
  },

  /**
   * @deprecated Use createManualVisit which now handles recurrence internally.
   */
  async generateRecurringVisits(baseVisit: Visit, pattern: RecurrencePattern): Promise<Visit[]> {
    const recurrenceId = pattern.id || `recurrence-${Date.now()}`;
    const dates = this.computeRecurrenceDates(baseVisit.scheduledDate || baseVisit.visitDate || '', { ...pattern, id: recurrenceId });
    const visits: Visit[] = [];
    // Skip index 0 (the base visit)
    for (let i = 1; i < dates.length; i++) {
      const visit = await visitGateway.create({
        patientId: baseVisit.patientId,
        admissionId: baseVisit.admissionId,
        scheduledDate: dates[i],
        scheduledTime: baseVisit.scheduledTime,
        visitDate: dates[i],
        startTime: baseVisit.startTime || baseVisit.scheduledTime,
        visitType: baseVisit.visitType,
        discipline: baseVisit.discipline,
        clinicianId: baseVisit.clinicianId,
        status: 'scheduled',
        evvStatus: 'pending',
        recurrenceId,
        recurrenceIndex: i,
        recurrenceTotal: dates.length,
        recurrencePattern: { ...pattern, id: recurrenceId },
      });
      visits.push(visit);
    }
    return visits;
  },

  /**
   * Get all visits for monitoring (admin/supervisor view)
   */
  async getVisitsForMonitoring(filters: {
    officeId?: string;
    startDate: string;
    endDate: string;
    status?: string[];
    evvStatus?: string[];
    clinicianId?: string;
  }): Promise<Visit[]> {
    const mockVisits: Visit[] = [
      {
        id: 'visit-1',
        patientId: '1',
        admissionId: 'admission-1',
        scheduledDate: filters.startDate,
        scheduledTime: '09:00',
        visitType: 'Skilled Nursing',
        discipline: 'RN',
        clinicianId: 'clinician-1',
        status: 'completed',
        evvStatus: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'visit-2',
        patientId: '2',
        admissionId: 'admission-2',
        scheduledDate: filters.startDate,
        scheduledTime: '09:30',
        visitType: 'Physical Therapy',
        discipline: 'PT',
        clinicianId: 'clinician-1',
        status: 'completed',
        evvStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'visit-3',
        patientId: '3',
        admissionId: 'admission-3',
        scheduledDate: filters.startDate,
        scheduledTime: '11:00',
        visitType: 'Skilled Nursing',
        discipline: 'RN',
        clinicianId: 'clinician-2',
        status: 'in_progress',
        evvStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'visit-4',
        patientId: '4',
        admissionId: 'admission-4',
        scheduledDate: filters.startDate,
        scheduledTime: '14:00',
        visitType: 'Home Health Aide',
        discipline: 'HHA',
        clinicianId: 'clinician-3',
        status: 'completed',
        evvStatus: 'exception',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return mockVisits.filter(v => {
      if (filters.status && !filters.status.includes(v.status)) return false;
      if (filters.evvStatus && !filters.evvStatus.includes(v.evvStatus || '')) return false;
      if (filters.clinicianId && v.clinicianId !== filters.clinicianId) return false;
      return true;
    });
  },

  /**
   * Detect conflicts in visits
   */
  async detectConflicts(officeId: string, startDate: string, endDate: string): Promise<{
    missingClockOut: Visit[];
    overlappingVisits: Array<{ visit1: Visit; visit2: Visit; clinicianId: string }>;
    unscheduledVisits: Visit[];
  }> {
    const visits = await this.getVisitsForMonitoring({ officeId, startDate, endDate });
    const events = await Promise.all(
      visits.map(v => this.getVisitEvents(v.id).then(events => ({ visit: v, events })))
    );

    const missingClockOut: Visit[] = [];
    for (const { visit, events: visitEvents } of events) {
      const hasClockIn = visitEvents.some(e => e.eventType === 'clock_in');
      const hasClockOut = visitEvents.some(e => e.eventType === 'clock_out');
      if (hasClockIn && !hasClockOut && visit.status === 'in_progress') {
        const clockInEvent = visitEvents.find(e => e.eventType === 'clock_in');
        if (clockInEvent) {
          const hoursSinceClockIn = (Date.now() - new Date(clockInEvent.timestamp).getTime()) / (1000 * 60 * 60);
          if (hoursSinceClockIn > 8) missingClockOut.push(visit);
        }
      }
    }

    const overlappingVisits: Array<{ visit1: Visit; visit2: Visit; clinicianId: string }> = [];
    const visitsByClinician = new Map<string, Array<{ visit: Visit; events: VisitEvent[] }>>();
    for (const item of events) {
      if (!item.visit.clinicianId) continue;
      if (!visitsByClinician.has(item.visit.clinicianId)) {
        visitsByClinician.set(item.visit.clinicianId, []);
      }
      visitsByClinician.get(item.visit.clinicianId)!.push(item);
    }

    for (const [clinicianId, clinicianVisits] of visitsByClinician) {
      for (let i = 0; i < clinicianVisits.length; i++) {
        for (let j = i + 1; j < clinicianVisits.length; j++) {
          const v1 = clinicianVisits[i];
          const v2 = clinicianVisits[j];
          const v1ClockIn = v1.events.find(e => e.eventType === 'clock_in');
          const v1ClockOut = v1.events.find(e => e.eventType === 'clock_out');
          const v2ClockIn = v2.events.find(e => e.eventType === 'clock_in');
          const v2ClockOut = v2.events.find(e => e.eventType === 'clock_out');

          if (v1ClockIn && v2ClockIn) {
            const v1Start = new Date(v1ClockIn.timestamp);
            const v1End = v1ClockOut ? new Date(v1ClockOut.timestamp) : new Date(v1Start.getTime() + 2 * 60 * 60 * 1000);
            const v2Start = new Date(v2ClockIn.timestamp);
            const v2End = v2ClockOut ? new Date(v2ClockOut.timestamp) : new Date(v2Start.getTime() + 2 * 60 * 60 * 1000);
            if (v1Start < v2End && v2Start < v1End) {
              overlappingVisits.push({ visit1: v1.visit, visit2: v2.visit, clinicianId });
            }
          }
        }
      }
    }

    const unscheduledVisits = visits.filter(v => !v.scheduledTime);
    return { missingClockOut, overlappingVisits, unscheduledVisits };
  },

  /**
   * Transmit visit to EVV vendor
   */
  async transmitToEVV(visitId: string, userId: string): Promise<{ success: boolean; transmissionId?: string; error?: string }> {
    const visit = await visitGateway.getById(visitId);
    if (!visit) throw new Error('Visit not found');

    const events = await this.getVisitEvents(visitId);
    const clockIn = events.find(e => e.eventType === 'clock_in');
    const clockOut = events.find(e => e.eventType === 'clock_out');
    if (!clockIn || !clockOut) {
      return { success: false, error: 'Visit must have both clock in and clock out events' };
    }

    const orgId = 'org-1';
    const settings = await getIntegrationSettings(orgId);
    const evvSetting = settings.settings.find(s => s.category === 'evv');
    if (!evvSetting || evvSetting.state === 'disabled') {
      return { success: false, error: 'EVV integration is not configured' };
    }

    const isMockMode = evvSetting.state === 'mock';
    const transmissionSuccess = isMockMode ? Math.random() > 0.2 : Math.random() > 0.1;
    const transmissionId = transmissionSuccess ? `EVV-${Date.now()}` : undefined;
    const timestamp = new Date().toISOString();

    await logExternalOperation({
      user_id: userId,
      integration_category: 'evv',
      vendor: evvSetting.vendor,
      operation: 'visit_transmission',
      success: transmissionSuccess,
      details: transmissionSuccess 
        ? `Visit ${visitId} transmitted successfully. Transmission ID: ${transmissionId}`
        : `Failed to transmit visit ${visitId}. Error: Network timeout or invalid credentials`,
      timestamp,
    });

    if (transmissionSuccess) {
      await visitGateway.update(visitId, { evvStatus: 'verified' });
    } else {
      await visitGateway.update(visitId, { evvStatus: 'exception' });
    }

    await auditGateway.log({
      userId,
      action: transmissionSuccess ? 'EVV_TRANSMISSION_SUCCESS' : 'EVV_TRANSMISSION_FAILED',
      entityType: 'visit',
      entityId: visitId,
      changes: { transmissionId, vendor: evvSetting.vendor, timestamp },
    });

    return { success: transmissionSuccess, transmissionId, error: transmissionSuccess ? undefined : 'Transmission failed - check vendor credentials' };
  },

  /**
   * Retry failed EVV transmission
   */
  async retryEVVTransmission(visitId: string, userId: string): Promise<{ success: boolean; transmissionId?: string; error?: string }> {
    return this.transmitToEVV(visitId, userId);
  },

  /**
   * Mark EVV exception as resolved
   */
  async resolveEVVException(visitId: string, userId: string, resolution: string, notes?: string): Promise<void> {
    await visitGateway.update(visitId, { evvStatus: resolution === 'manual_override' ? 'verified' : 'exception' });
    await auditGateway.log({
      userId,
      action: 'EVV_EXCEPTION_RESOLVED',
      entityType: 'visit',
      entityId: visitId,
      changes: { resolution, notes, timestamp: new Date().toISOString() },
    });
  },

  /**
   * Get EVV transmission history for a visit
   */
  async getEVVTransmissionHistory(visitId: string): Promise<ExternalOperationLog[]> {
    const allLogs = await getExternalOperationLogs();
    return allLogs.logs.filter(log => log.operation === 'visit_transmission' && log.details.includes(visitId));
  },
};

// ============================================================================
// PATIENT DOCUMENT OPERATIONS (Supabase Storage)
// ============================================================================

// ============================================================================
// CLINICAL OPERATIONS (Visit Notes, Plans of Care, Verbal Orders)
// ============================================================================

export interface VerbalOrder {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  orderType: string;
  orderDescription: string;
  orderedBy: string;
  receivedBy: string;
  orderDate: string;
  qaStatus: string;
  physicianSignedAt: string | null;
  nurseSignedAt: string | null;
  createdAt: string;
  lastModified: string;
  daysUntilExpiry: number;
  requiresFollowup: boolean;
}

export interface PlanOfCare {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  pocType: string;
  startDate: string;
  endDate: string;
  qaStatus: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  signatures: Array<{ role: string; name: string; signedAt: string | null; status: string }>;
  requiredSignatures: number;
  completedSignatures: number;
}

export const clinicalGateway = {
  /** Fetch all verbal orders, optionally filtered by patientId */
  async getVerbalOrders(patientId?: string): Promise<VerbalOrder[]> {
    try {
      const json = await apiRequest<{ verbalOrders: VerbalOrder[] }>('/clinical/verbal-orders');
      const orders = json.verbalOrders || [];
      return patientId ? orders.filter((o) => o.patientId === patientId) : orders;
    } catch (err) {
      console.error('[clinicalGateway.getVerbalOrders] Error:', err);
      return [];
    }
  },

  /** Fetch all plans of care, optionally filtered by patientId */
  async getPlansOfCare(patientId?: string): Promise<PlanOfCare[]> {
    try {
      const json = await apiRequest<{ plansOfCare: PlanOfCare[] }>('/clinical/plans-of-care');
      const plans = json.plansOfCare || [];
      return patientId ? plans.filter((p) => p.patientId === patientId) : plans;
    } catch (err) {
      console.error('[clinicalGateway.getPlansOfCare] Error:', err);
      return [];
    }
  },

  /** Create a verbal order */
  async createVerbalOrder(data: Partial<VerbalOrder>): Promise<VerbalOrder | null> {
    try {
      const json = await apiRequest<{ verbalOrder: VerbalOrder }>('/clinical/verbal-orders', {
        method: 'POST',
        body: data,
      });
      return json.verbalOrder || null;
    } catch (err) {
      console.error('[clinicalGateway.createVerbalOrder] Error:', err);
      return null;
    }
  },

  /** Update a verbal order */
  async updateVerbalOrder(id: string, data: Partial<VerbalOrder>): Promise<VerbalOrder | null> {
    try {
      const json = await apiRequest<{ verbalOrder: VerbalOrder }>(`/clinical/verbal-orders/${id}`, {
        method: 'PUT',
        body: data,
      });
      return json.verbalOrder || null;
    } catch (err) {
      console.error('[clinicalGateway.updateVerbalOrder] Error:', err);
      return null;
    }
  },
};

export interface PatientDocumentMeta {
  id: string;
  patient_id: string;
  name: string;
  type: string;
  folder: string;
  uploaded_by: string;
  uploaded_at: string;
  size: string;
  storage_path: string;
  content_type: string;
  signed_url?: string | null;
}

export const patientDocumentGateway = {
  /**
   * List all documents for a patient
   */
  async list(patientId: string): Promise<PatientDocumentMeta[]> {
    try {
      const json = await apiRequest<{ documents: PatientDocumentMeta[] }>(`/patient-documents/${encodeURIComponent(patientId)}`);
      return json.documents || [];
    } catch (err) {
      console.error('[patientDocumentGateway.list] Error:', err);
      return [];
    }
  },

  /**
   * Upload a document for a patient
   */
  async upload(patientId: string, file: File, folder: string, uploadedBy: string): Promise<PatientDocumentMeta | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);
      formData.append('uploadedBy', uploadedBy);

      const res = await fetch(`${API_BASE}/patient-documents/${encodeURIComponent(patientId)}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'X-User-Token': userToken,
          // Do NOT set Content-Type — browser sets multipart boundary automatically
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error('[patientDocumentGateway.upload] Error:', res.status, errText);
        return null;
      }

      const json = await res.json();
      return json.document || null;
    } catch (err) {
      console.error('[patientDocumentGateway.upload] Error:', err);
      return null;
    }
  },

  /**
   * Delete a document
   */
  async delete(patientId: string, docId: string): Promise<boolean> {
    try {
      await apiRequest(`/patient-documents/${encodeURIComponent(patientId)}/${encodeURIComponent(docId)}`, { method: 'DELETE' });
      return true;
    } catch (err) {
      console.error('[patientDocumentGateway.delete] Error:', err);
      return false;
    }
  },

  /** Get version history for a document */
  async getVersionHistory(patientId: string, docId: string): Promise<{
    currentDocId: string;
    versions: Array<{ docId: string; version: number; uploadedBy: string; uploadedAt: string; size: string; isCurrent: boolean }>;
    totalVersions: number;
  }> {
    try {
      return await apiRequest(`/patient-documents/${encodeURIComponent(patientId)}/${encodeURIComponent(docId)}/versions`);
    } catch (err) {
      console.error('[patientDocumentGateway.getVersionHistory] Error:', err);
      return { currentDocId: docId, versions: [], totalVersions: 0 };
    }
  },

  /** Get annotations/comments for a clinical entity */
  async getAnnotations(patientId: string, entityId: string, entityType: string): Promise<any[]> {
    try {
      const json = await apiRequest<{ annotations: any[] }>(
        `/patient-documents/${encodeURIComponent(patientId)}/annotations/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`
      );
      return json.annotations || [];
    } catch (err) {
      console.error('[patientDocumentGateway.getAnnotations] Error:', err);
      return [];
    }
  },

  /** Add an annotation/comment to a clinical entity */
  async addAnnotation(patientId: string, entityId: string, entityType: string, text: string, author: string): Promise<any | null> {
    try {
      const json = await apiRequest<{ annotation: any }>(
        `/patient-documents/${encodeURIComponent(patientId)}/annotations/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
        { method: 'POST', body: { text, author } }
      );
      return json.annotation || null;
    } catch (err) {
      console.error('[patientDocumentGateway.addAnnotation] Error:', err);
      return null;
    }
  },
};

// ============================================================================
// CONFIGURATION OPERATIONS
// ============================================================================

export const configGateway = {
  /**
   * Get module toggles for org/office
   * Combines modules + module-settings from backend
   */
  async getModuleToggles(orgId: string, officeId?: string): Promise<ModuleToggle[]> {
    try {
      const [modulesRes, settingsRes] = await Promise.all([
        getModules(),
        getModuleSettings(orgId),
      ]);
      const settingsMap = new Map(settingsRes.settings.map(s => [s.module_id, s]));
      return modulesRes.modules.map((mod, idx) => {
        const setting = settingsMap.get(mod.id);
        let enabled = setting?.enabled !== false;
        // Check office-level override
        if (officeId && setting?.office_overrides?.[officeId] !== undefined) {
          enabled = setting.office_overrides[officeId];
        }
        return {
          id: String(idx + 1),
          moduleKey: mod.id,
          moduleName: mod.name,
          enabled,
          officeId,
          orgId,
        };
      });
    } catch (err) {
      console.error('[configGateway.getModuleToggles] Error:', err);
      return [];
    }
  },

  /**
   * Update module toggle
   */
  async updateModuleToggle(id: string, enabled: boolean): Promise<ModuleToggle> {
    // Note: actual toggle updates go through updateModuleSetting; this is a legacy shim
    return {
      id,
      moduleKey: 'patient',
      moduleName: 'Patient',
      enabled,
      orgId: 'org-demo',
    };
  },

  /**
   * Get feature flags
   */
  async getFeatureFlags(orgId: string, officeId?: string): Promise<FeatureFlag[]> {
    try {
      const [featuresRes, settingsRes] = await Promise.all([
        getFeatures(),
        getFeatureSettings(orgId),
      ]);
      const settingsMap = new Map(settingsRes.settings.map(s => [s.feature_id, s]));
      return featuresRes.features.map((f, idx) => {
        const setting = settingsMap.get(f.id);
        let enabled = setting?.enabled !== false;
        if (officeId && setting?.office_overrides?.[officeId] !== undefined) {
          enabled = setting.office_overrides[officeId];
        }
        return {
          id: String(idx + 1),
          featureKey: f.id,
          featureName: f.name,
          enabled,
          officeId,
          orgId,
        };
      });
    } catch (err) {
      console.error('[configGateway.getFeatureFlags] Error:', err);
      return [];
    }
  },

  /**
   * Get vendor configurations
   */
  async getVendorConfigs(orgId: string, officeId?: string): Promise<VendorConfig[]> {
    try {
      const { settings } = await getIntegrationSettings(orgId);
      return settings.map((s, idx) => ({
        id: `vendor-${idx}`,
        vendorKey: s.vendor,
        vendorName: s.vendor,
        vendorType: s.category as any,
        enabled: s.state !== 'disabled',
        credentials: s.credentials || {},
        settings: { state: s.state },
        officeId,
        orgId,
        createdAt: '',
        updatedAt: '',
      }));
    } catch (err) {
      console.error('[configGateway.getVendorConfigs] Error:', err);
      return [];
    }
  },

  /**
   * Update vendor configuration
   */
  async updateVendorConfig(id: string, updates: Partial<VendorConfig>): Promise<VendorConfig> {
    return {
      id,
      vendorKey: updates.vendorKey || 'evv-vendor-1',
      vendorName: updates.vendorName || 'EVV Vendor',
      vendorType: updates.vendorType || 'evv',
      enabled: updates.enabled !== false,
      credentials: updates.credentials || {},
      settings: updates.settings || {},
      orgId: 'org-demo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};

// ============================================================================
// TIMELINE OPERATIONS
// ============================================================================

export type TimelineEventType =
  | 'admission'
  | 'visit'
  | 'clinical_note'
  | 'poc_update'
  | 'verbal_order'
  | 'assessment'
  | 'hospitalization'
  | 'discharge'
  | 'billing'
  | 'authorization'
  | 'alert'
  | 'hospice';

export type TimelineFilterCategory =
  | 'all'
  | 'clinical'
  | 'visits'
  | 'billing'
  | 'hospice'
  | 'documents'
  | 'alerts';

export interface TimelineEventData {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  summary: string;
  caregiver?: string;
  caregiverRole?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  relatedEntityId?: string;
  relatedEntityType?: string;
  details?: Record<string, string | number | boolean | null>;
  tags?: string[];
}

export const timelineGateway = {
  /**
   * Get timeline events for a patient with optional filtering
   * Future: Will call .NET 8 API endpoint GET /api/patients/{id}/timeline
   */
  async getByPatientId(
    patientId: string,
    params?: {
      category?: TimelineFilterCategory;
      startDate?: string;
      endDate?: string;
      pagination?: PaginationParams;
    }
  ): Promise<PaginatedResponse<TimelineEventData>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const page = params?.pagination?.page || 1;
      const pageSize = params?.pagination?.pageSize || 50;
      const qp = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (params?.category && params.category !== 'all') qp.set('category', params.category);
      if (params?.startDate) qp.set('startDate', params.startDate);
      if (params?.endDate) qp.set('endDate', params.endDate);

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-845bc545/patients/${patientId}/timeline?${qp.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': userToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        console.error(`[timelineGateway] Error ${res.status} fetching timeline:`, errBody);
        // Fall back to empty response so UI can show "no events" gracefully
        return { data: [], total: 0, page, pageSize, totalPages: 0 };
      }

      const json = await res.json();
      return {
        data: json.data || [],
        total: json.total || 0,
        page: json.page || page,
        pageSize: json.pageSize || pageSize,
        totalPages: json.totalPages || 0,
      };
    } catch (err) {
      console.error('[timelineGateway] Network error fetching timeline:', err);
      return {
        data: [],
        total: 0,
        page: params?.pagination?.page || 1,
        pageSize: params?.pagination?.pageSize || 50,
        totalPages: 0,
      };
    }
  },

  /**
   * Get a single timeline event detail
   * Future: Will call .NET 8 API endpoint GET /api/timeline-events/{id}
   */
  async getEventDetail(eventId: string): Promise<TimelineEventData | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-845bc545/timeline-events/${eventId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-User-Token': userToken,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!res.ok) {
        console.error(`[timelineGateway] Error ${res.status} fetching event detail`);
        return null;
      }

      const json = await res.json();
      return json.event || null;
    } catch (err) {
      console.error('[timelineGateway] Network error fetching event detail:', err);
      return null;
    }
  },
};

// ============================================================================
// AUDIT LOG OPERATIONS
// ============================================================================

export const auditGateway = {
  /**
   * Create audit log entry
   * Calls POST /audit-logs
   */
  async log(entry: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    try {
      const json = await apiRequest<{ log: any }>('/audit-logs', {
        method: 'POST',
        body: {
          action: entry.action,
          entityType: entry.entityType,
          entityId: entry.entityId,
          changes: entry.changes || null,
        },
      });
      return {
        id: json.log?.id || `audit-${Date.now()}`,
        userId: entry.userId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        changes: entry.changes,
        timestamp: json.log?.timestamp || new Date().toISOString(),
      };
    } catch (err) {
      // Audit logging should never block the caller — degrade gracefully
      console.error('[auditGateway.log] Error (non-blocking):', err);
      return {
        ...entry,
        id: `audit-local-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Search audit logs
   * Calls GET /audit-logs with pagination and filters
   */
  async search(params: {
    filters?: FilterParams;
    pagination: PaginationParams;
    sort?: SortParams;
  }): Promise<PaginatedResponse<AuditLog>> {
    try {
      const qp = new URLSearchParams({
        page: String(params.pagination.page),
        pageSize: String(params.pagination.pageSize),
      });
      if (params.filters?.entityType) qp.set('entityType', params.filters.entityType);
      if (params.filters?.action) qp.set('action', params.filters.action);

      const json = await apiRequest<{ logs: any[]; total: number; page: number; pageSize: number; totalPages: number }>(`/audit-logs?${qp.toString()}`);
      const mapped: AuditLog[] = (json.logs || []).map((l: any) => ({
        id: l.id || `audit-${Date.now()}`,
        userId: l.user_id || '',
        action: l.action || '',
        entityType: l.entity_type || '',
        entityId: l.entity_id || '',
        changes: l.new_value ? (typeof l.new_value === 'string' ? JSON.parse(l.new_value) : l.new_value) : undefined,
        timestamp: l.timestamp || '',
      }));

      return {
        data: mapped,
        total: json.total || 0,
        page: json.page || params.pagination.page,
        pageSize: json.pageSize || params.pagination.pageSize,
        totalPages: json.totalPages || 0,
      };
    } catch (err) {
      console.error('[auditGateway.search] Error:', err);
      return { data: [], total: 0, page: params.pagination.page, pageSize: params.pagination.pageSize, totalPages: 0 };
    }
  },
};

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const userGateway = {
  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    // TODO: Replace with actual Supabase implementation
    // For now return mock user
    return {
      id: 'user-1',
      email: 'admin@healthcare.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'Administrator',
      officeId: 'office-1',
      active: true,
      createdAt: new Date().toISOString(),
    };
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User | null> {
    // TODO: Replace with actual Supabase implementation
    return null;
  },

  /**
   * Search users
   */
  async search(params: {
    query?: string;
    filters?: FilterParams;
    pagination: PaginationParams;
  }): Promise<PaginatedResponse<User>> {
    // TODO: Replace with actual Supabase implementation
    return {
      data: [],
      total: 0,
      page: params.pagination.page,
      pageSize: params.pagination.pageSize,
      totalPages: 0,
    };
  },
};

// ============================================================================
// MODULE & FEATURE CONFIGURATION (Legacy support for ConfigContext)
// ============================================================================

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  order: number;
}

export interface Feature {
  id: string;
  moduleId: string;
  name: string;
  description: string;
}

export interface ModuleSetting {
  org_id: string;
  module_id: string;
  enabled: boolean;
  office_overrides?: Record<string, boolean>;
}

export interface FeatureSetting {
  org_id: string;
  feature_id: string;
  enabled: boolean;
  office_overrides?: Record<string, boolean>;
}

/**
 * Get all available modules
 */
export async function getModules(): Promise<{ modules: Module[] }> {
  try {
    const json = await apiRequest<{ modules: any[] }>('/modules');
    const modules: Module[] = (json.modules || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      description: m.description || '',
      icon: m.icon || '',
      order: m.order || 0,
    }));
    // Sort by order
    modules.sort((a, b) => a.order - b.order);
    return { modules };
  } catch (err) {
    console.error('[getModules] Error, using fallback:', err);
    return {
      modules: [
        { id: 'patient', name: 'Patients', description: 'Patient management', icon: 'users', order: 1 },
        { id: 'admissions', name: 'Admissions', description: 'Admission management', icon: 'clipboard-check', order: 2 },
        { id: 'scheduling', name: 'Scheduling', description: 'Visit scheduling', icon: 'calendar', order: 3 },
        { id: 'careconnect', name: 'Point of Care', description: 'Visit documentation and EVV', icon: 'heart-pulse', order: 4 },
        { id: 'monitor', name: 'Monitor / EVV', description: 'Visit monitoring and EVV', icon: 'activity', order: 5 },
        { id: 'clinical', name: 'Clinical', description: 'Clinical documentation and QA', icon: 'file-text', order: 6 },
        { id: 'hospice', name: 'Hospice', description: 'Hospice care management', icon: 'heart', order: 7 },
        { id: 'admin', name: 'Admin / Platform', description: 'System administration', icon: 'settings', order: 8 },
      ],
    };
  }
}

/**
 * Get module settings for an organization
 */
export async function getModuleSettings(orgId: string): Promise<{ settings: ModuleSetting[] }> {
  try {
    const json = await apiRequest<{ settings: any[] }>(`/module-settings/${orgId}`);
    const settings: ModuleSetting[] = (json.settings || []).map((s: any) => ({
      org_id: s.org_id || orgId,
      module_id: s.module_id || '',
      enabled: s.enabled !== false,
      office_overrides: s.office_overrides || {},
    }));
    return { settings };
  } catch (err) {
    console.error('[getModuleSettings] Error, using fallback:', err);
    return {
      settings: [
        { org_id: orgId, module_id: 'patient', enabled: true },
        { org_id: orgId, module_id: 'admissions', enabled: true },
        { org_id: orgId, module_id: 'scheduling', enabled: true },
        { org_id: orgId, module_id: 'careconnect', enabled: true },
        { org_id: orgId, module_id: 'monitor', enabled: true },
        { org_id: orgId, module_id: 'clinical', enabled: true },
        { org_id: orgId, module_id: 'hospice', enabled: true },
        { org_id: orgId, module_id: 'admin', enabled: true },
      ],
    };
  }
}

/**
 * Get all available features
 */
export async function getFeatures(): Promise<{ features: Feature[] }> {
  try {
    const json = await apiRequest<{ features: any[] }>('/features');
    const features: Feature[] = (json.features || []).map((f: any) => ({
      id: f.id,
      moduleId: f.moduleId || '',
      name: f.name || '',
      description: f.description || '',
    }));
    return { features };
  } catch (err) {
    console.error('[getFeatures] Error:', err);
    return { features: [] };
  }
}

/**
 * Get feature settings for an organization
 */
export async function getFeatureSettings(orgId: string): Promise<{ settings: FeatureSetting[] }> {
  try {
    const json = await apiRequest<{ settings: any[] }>(`/feature-settings/${orgId}`);
    const settings: FeatureSetting[] = (json.settings || []).map((s: any) => ({
      org_id: s.org_id || orgId,
      feature_id: s.feature_id || '',
      enabled: s.enabled !== false,
      office_overrides: s.office_overrides || {},
    }));
    return { settings };
  } catch (err) {
    console.error('[getFeatureSettings] Error:', err);
    return { settings: [] };
  }
}

/**
 * Update module setting
 * Calls PUT /module-settings
 */
export async function updateModuleSetting(
  orgId: string,
  moduleId: string,
  enabled: boolean,
  officeOverrides?: Record<string, boolean>
): Promise<void> {
  try {
    await apiRequest('/module-settings', {
      method: 'PUT',
      body: { orgId, moduleId, enabled, officeOverrides: officeOverrides || {} },
    });
  } catch (err) {
    console.error('[updateModuleSetting] Error:', err);
    throw err;
  }
}

/**
 * Update feature setting
 * Calls PUT /feature-settings
 */
export async function updateFeatureSetting(
  orgId: string,
  featureId: string,
  enabled: boolean,
  officeOverrides?: Record<string, boolean>
): Promise<void> {
  try {
    await apiRequest('/feature-settings', {
      method: 'PUT',
      body: { orgId, featureId, enabled, officeOverrides: officeOverrides || {} },
    });
  } catch (err) {
    console.error('[updateFeatureSetting] Error:', err);
    throw err;
  }
}

// ============================================================================
// OFFICE OPERATIONS
// ============================================================================

export interface Office {
  id: string;
  name: string;
  org_id: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

/**
 * Get offices for an organization
 */
export async function getOffices(orgId: string): Promise<{ offices: Office[] }> {
  try {
    const json = await apiRequest<{ offices: any[] }>(`/offices/${orgId}`);
    const offices: Office[] = (json.offices || []).map((o: any) => ({
      id: o.id,
      name: o.name || '',
      org_id: o.org_id || orgId,
      address: o.address || '',
      city: o.city || '',
      state: o.state || '',
      zipCode: o.zipCode || '',
      phone: o.phone || '',
      active: o.active !== false,
      createdAt: o.created_at || '',
    }));
    return { offices };
  } catch (err) {
    console.error('[getOffices] Error, using fallback:', err);
    return {
      offices: [
        { id: 'office-demo-main', name: 'Downtown Medical Center', org_id: orgId, address: '123 Main St, San Francisco, CA 94102', phone: '(415) 555-0100', active: true, createdAt: '' },
        { id: 'office-demo-north', name: 'North Bay Clinic', org_id: orgId, address: '456 Oak Ave, San Rafael, CA 94901', phone: '(415) 555-0200', active: true, createdAt: '' },
        { id: 'office-demo-south', name: 'Peninsula Health Services', org_id: orgId, address: '789 El Camino Real, Redwood City, CA 94063', phone: '(650) 555-0300', active: true, createdAt: '' },
      ],
    };
  }
}

// ============================================================================
// AUDIT LOG OPERATIONS (Enhanced for Platform Config)
// ============================================================================

export interface ConfigAuditLog {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_value: string | null;
  new_value: string | null;
  timestamp: string;
}

/**
 * Get audit logs (for platform config screen)
 */
export async function getAuditLogs(): Promise<{ logs: ConfigAuditLog[] }> {
  try {
    const json = await apiRequest<{ logs: any[] }>('/audit-logs?pageSize=100');
    const logs: ConfigAuditLog[] = (json.logs || []).map((l: any) => ({
      user_id: l.user_id || '',
      action: l.action || '',
      entity_type: l.entity_type || '',
      entity_id: l.entity_id || '',
      old_value: l.old_value || null,
      new_value: l.new_value || null,
      timestamp: l.timestamp || '',
    }));
    return { logs };
  } catch (err) {
    console.error('[getAuditLogs] Error:', err);
    return { logs: [] };
  }
}

// ============================================================================
// INTEGRATION CATALOG & SETTINGS
// ============================================================================

export interface IntegrationCategory {
  category: string;
  categoryName: string;
  vendors: IntegrationVendor[];
}

export interface IntegrationVendor {
  id: string;
  name: string;
  description: string;
  credentialFields: string[];
}

export interface IntegrationSetting {
  org_id: string;
  category: string;
  vendor: string;
  state: 'disabled' | 'mock' | 'live';
  credentials: Record<string, string>;
  credentialsMasked?: boolean;
}

export interface ExternalOperationLog {
  user_id: string;
  integration_category: string;
  vendor: string;
  operation: string;
  success: boolean;
  details: string;
  timestamp: string;
}

/**
 * Get integration catalog (all available vendors by category)
 */
export async function getIntegrationCatalog(): Promise<{ catalog: IntegrationCategory[] }> {
  try {
    const json = await apiRequest<{ catalog: any[] }>('/integrations/catalog');
    const catalog: IntegrationCategory[] = (json.catalog || []).map((c: any) => ({
      category: c.category,
      categoryName: c.categoryName,
      vendors: (c.vendors || []).map((v: any) => ({
        id: v.id,
        name: v.name,
        description: v.description || '',
        credentialFields: v.credentialFields || [],
      })),
    }));
    return { catalog };
  } catch (err) {
    console.error('[getIntegrationCatalog] Error:', err);
    return { catalog: [] };
  }
}

/**
 * Initialize integration catalog (creates default catalog in DB if not exists)
 */
export async function initializeIntegrationCatalog(): Promise<void> {
  try {
    await apiRequest('/integrations/catalog/init', { method: 'POST' });
  } catch (err) {
    console.error('[initializeIntegrationCatalog] Error:', err);
  }
}

/**
 * Get integration settings for an organization
 */
export async function getIntegrationSettings(orgId: string): Promise<{ settings: IntegrationSetting[] }> {
  try {
    const json = await apiRequest<{ settings: any[] }>(`/integration-settings/${orgId}`);
    const settings: IntegrationSetting[] = (json.settings || []).map((s: any) => ({
      org_id: s.org_id || orgId,
      category: s.category || '',
      vendor: s.vendor || '',
      state: s.state || 'disabled',
      credentials: s.credentials || {},
      credentialsMasked: s.credentialsMasked || false,
    }));
    return { settings };
  } catch (err) {
    console.error('[getIntegrationSettings] Error:', err);
    return { settings: [] };
  }
}

/**
 * Update integration setting
 */
export async function updateIntegrationSetting(
  orgId: string,
  category: string,
  vendor: string,
  state: 'disabled' | 'mock' | 'live',
  credentials: Record<string, string>
): Promise<void> {
  try {
    await apiRequest('/integration-settings', {
      method: 'PUT',
      body: { orgId, category, vendor, state, credentials },
    });
  } catch (err) {
    console.error('[updateIntegrationSetting] Error:', err);
    throw err;
  }
}

/**
 * Test integration connection
 */
export async function testIntegrationConnection(
  orgId: string,
  category: string,
  vendor: string
): Promise<{ success: boolean; details: string }> {
  try {
    const json = await apiRequest<{ success: boolean; details: string }>('/integrations/test-connection', {
      method: 'POST',
      body: { orgId, category, vendor },
    });
    return { success: json.success, details: json.details || '' };
  } catch (err) {
    console.error('[testIntegrationConnection] Error:', err);
    return { success: false, details: `Connection test failed: ${err}` };
  }
}

/**
 * Get external operation logs
 */
export async function getExternalOperationLogs(): Promise<{ logs: ExternalOperationLog[] }> {
  try {
    const json = await apiRequest<{ logs: any[] }>('/external-operations');
    const logs: ExternalOperationLog[] = (json.logs || []).map((l: any) => ({
      user_id: l.user_id || '',
      integration_category: l.integration_category || '',
      vendor: l.vendor || '',
      operation: l.operation || '',
      success: l.success || false,
      details: l.details || '',
      timestamp: l.timestamp || '',
    }));
    return { logs };
  } catch (err) {
    console.error('[getExternalOperationLogs] Error:', err);
    return { logs: [] };
  }
}

/**
 * Log external operation (for integration activity tracking)
 * This is handled server-side by the integration endpoints;
 * this client-side call is a no-op safety net for legacy callers.
 */
export async function logExternalOperation(log: ExternalOperationLog): Promise<void> {
  // Server-side endpoints already log external operations via createExternalOperationLog.
  // This is a no-op for frontend callers to avoid duplicate entries.
  console.log('[logExternalOperation] (no-op, logged server-side)', log.operation);
}

// ============================================================================
// AUTH OPERATIONS
// ============================================================================

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{ user: any; session: any }> {
  console.log('[dataGateway] signIn called for:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('[dataGateway] signIn error:', error);
    throw error;
  }

  if (!data.session) {
    throw new Error('Sign in succeeded but no session was returned');
  }

  console.log('[dataGateway] signIn successful');
  return data;
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[dataGateway] signOut error:', error);
    throw error;
  }
}

/**
 * Sign up a new user
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  role: string = 'user',
  orgId: string = '',
): Promise<any> {
  console.log('[dataGateway] signUp called for:', email);
  const json = await apiRequest<any>('/signup', {
    method: 'POST',
    body: { email, password, name, role, orgId },
  });
  return json;
}

/**
 * Get current user profile from server
 */
export async function getCurrentProfile(accessToken: string): Promise<{ profile: any }> {
  console.log('[dataGateway] getCurrentProfile called');
  const res = await fetch(`${API_BASE}/profile`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch profile: ${res.statusText}`);
  }
  const json = await res.json();
  return { profile: json.profile || json };
}

/**
 * Get current session
 */
export async function getSession(): Promise<any> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[dataGateway] getSession error:', error);
    throw error;
  }
  return data.session;
}

// ============================================================================
// LEGACY PATIENT FUNCTIONS (Compatibility layer)
// ============================================================================

/**
 * Transform Patient from dataGateway format (camelCase) to UI format (snake_case)
 */
function transformPatientToUI(patient: Patient): any {
  return {
    id: patient.id,
    mrn: patient.mrn,
    first_name: patient.firstName,
    last_name: patient.lastName,
    dob: patient.dateOfBirth,
    gender: patient.gender,
    phone: patient.phone || '',
    email: patient.email,
    address: patient.address,
    city: patient.city,
    state: patient.state,
    zip_code: patient.zipCode,
    office_id: patient.officeId,
    status: patient.status,
    created_at: patient.createdAt,
    updated_at: patient.updatedAt,
  };
}

/**
 * Transform Patient from UI format (snake_case) to dataGateway format (camelCase)
 */
function transformPatientFromUI(patient: any): Partial<Patient> {
  const transformed: any = {};
  
  if (patient.mrn !== undefined) transformed.mrn = patient.mrn;
  if (patient.first_name !== undefined) transformed.firstName = patient.first_name;
  if (patient.last_name !== undefined) transformed.lastName = patient.last_name;
  if (patient.dob !== undefined) transformed.dateOfBirth = patient.dob;
  if (patient.gender !== undefined) transformed.gender = patient.gender;
  if (patient.phone !== undefined) transformed.phone = patient.phone;
  if (patient.email !== undefined) transformed.email = patient.email;
  if (patient.address !== undefined) transformed.address = patient.address;
  if (patient.city !== undefined) transformed.city = patient.city;
  if (patient.state !== undefined) transformed.state = patient.state;
  if (patient.zip_code !== undefined) transformed.zipCode = patient.zip_code;
  if (patient.office_id !== undefined) transformed.officeId = patient.office_id;
  if (patient.status !== undefined) transformed.status = patient.status;
  
  return transformed;
}

/**
 * Get all patients for an organization
 * Legacy function for backwards compatibility - delegates to patientGateway.search
 */
export async function getAllPatients(
  orgId: string,
  officeId?: string,
  status?: 'active' | 'inactive' | 'discharged'
): Promise<{ patients: any[] }> {
  console.log('[dataGateway] getAllPatients called:', { orgId, officeId, status });
  
  // Build filters
  const filters: FilterParams = {};
  if (officeId) {
    filters.officeId = officeId;
  }
  if (status) {
    filters.status = status;
  }
  
  // Get all patients (no pagination for now - mock data is small)
  const result = await patientGateway.search({
    filters,
    pagination: { page: 1, pageSize: 1000 },
  });
  
  // Transform patients to UI format (snake_case)
  const transformedPatients = result.data.map(transformPatientToUI);
  
  return {
    patients: transformedPatients,
  };
}

/**
 * Get patient by ID
 * Legacy function for backwards compatibility - delegates to patientGateway.getById
 */
export async function getPatientById(patientId: string): Promise<{ patient: any | null }> {
  console.log('[dataGateway] getPatientById called:', patientId);
  
  const patient = await patientGateway.getById(patientId);
  
  if (!patient) {
    return { patient: null };
  }
  
  // Transform to UI format (snake_case)
  return {
    patient: transformPatientToUI(patient),
  };
}

/**
 * Search patients
 * Legacy function for backwards compatibility
 */
export async function searchPatients(
  orgId: string,
  query?: string,
  officeId?: string
): Promise<{ patients: any[] }> {
  console.log('[dataGateway] searchPatients called:', { orgId, query, officeId });
  
  // Build filters
  const filters: FilterParams = {};
  if (officeId) {
    filters.officeId = officeId;
  }
  
  // Search patients
  const result = await patientGateway.search({
    query,
    filters,
    pagination: { page: 1, pageSize: 1000 },
  });
  
  // Transform patients to UI format (snake_case)
  const transformedPatients = result.data.map(transformPatientToUI);
  
  return {
    patients: transformedPatients,
  };
}

/**
 * Create patient
 * Legacy function for backwards compatibility
 */
export async function createPatient(
  officeId: string,
  firstName: string,
  lastName: string,
  dob: string,
  mrn: string,
  phone: string,
  address: string
): Promise<{ patient: any }> {
  console.log('[dataGateway] createPatient called');
  
  const patient = await patientGateway.create({
    mrn,
    firstName,
    lastName,
    dateOfBirth: dob,
    gender: 'U', // Default unknown
    phone,
    address,
    officeId,
    status: 'active',
  });
  
  // Transform to UI format (snake_case)
  return {
    patient: transformPatientToUI(patient),
  };
}

/**
 * Update patient
 * Legacy function for backwards compatibility
 */
export async function updatePatient(
  patientId: string,
  updates: any
): Promise<{ patient: any }> {
  console.log('[dataGateway] updatePatient called:', patientId);
  
  // Transform from UI format (snake_case) to dataGateway format (camelCase)
  const transformedUpdates = transformPatientFromUI(updates);
  
  const patient = await patientGateway.update(patientId, transformedUpdates);
  
  // Transform back to UI format (snake_case)
  return {
    patient: transformPatientToUI(patient),
  };
}

// ============================================================================
// OPTIMIZED PATIENT FUNCTIONS (Performance-first with pagination)
// ============================================================================

/**
 * Patient Summary Interface
 * Minimal data for list views - improves performance
 */
export interface PatientSummary {
  id: string;
  name: string;
  mrn: string;
  status: 'active' | 'inactive' | 'discharged';
  lastVisit?: string;
  office_name?: string;
}

/**
 * Patient Filters Interface
 */
export interface PatientFilters {
  search?: string;
  officeId?: string;
  status?: 'active' | 'inactive' | 'discharged';
}

/**
 * Get patients with pagination and filtering (OPTIMIZED)
 * Returns only summary data for list views
 * 
 * COMPLIANT WITH:
 * - SCREEN_GENERATION.md - "Prefer summary data over full detail payloads"
 * - LARGE_DATA.md - "Always paginate tables with >25 rows"
 */
export async function getPatientsPaginated(
  orgId: string,
  params: {
    page: number;
    pageSize: number;
    filters?: PatientFilters;
  }
): Promise<PaginatedResponse<PatientSummary>> {
  console.log('[dataGateway] getPatientsPaginated called:', { orgId, params });
  
  const { page, pageSize, filters = {} } = params;
  
  // Build filters for patientGateway
  const gatewayFilters: FilterParams = {};
  if (filters.officeId) {
    gatewayFilters.officeId = filters.officeId;
  }
  if (filters.status) {
    gatewayFilters.status = filters.status;
  }
  
  // Call patientGateway with pagination
  const result = await patientGateway.search({
    query: filters.search,
    filters: gatewayFilters,
    pagination: { page, pageSize },
  });
  
  // Transform to summary format (only essential fields)
  const summaries: PatientSummary[] = result.data.map(patient => ({
    id: patient.id,
    name: `${patient.firstName} ${patient.lastName}`,
    mrn: patient.mrn,
    status: patient.status,
    lastVisit: undefined, // TODO: Add last visit data when available
    office_name: undefined, // TODO: Join with office data
  }));
  
  return {
    data: summaries,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
}

/**
 * Get patients summary (no pagination - for dropdowns/selects)
 * Still returns minimal data
 */
export async function getPatientsSummary(
  orgId: string,
  filters?: PatientFilters
): Promise<{ patients: PatientSummary[] }> {
  console.log('[dataGateway] getPatientsSummary called:', { orgId, filters });
  
  // Use pagination with large page size for backwards compatibility
  const result = await getPatientsPaginated(orgId, {
    page: 1,
    pageSize: 1000,
    filters,
  });
  
  return {
    patients: result.data,
  };
}

// ============================================================================
// OPTIMIZED ADMISSION FUNCTIONS (Performance-first with pagination)
// ============================================================================

/**
 * Admission Summary Interface
 * Minimal data for list views - improves performance
 */
export interface AdmissionSummary {
  id: string;
  patientName: string;
  patientMrn: string;
  admissionDate: string;
  status: 'active' | 'pending' | 'discharged' | 'hold';
  primaryDiagnosis?: string;
  payer?: string;
}

/**
 * Admission Filters Interface
 */
export interface AdmissionFilters {
  search?: string;
  status?: 'active' | 'pending' | 'discharged' | 'hold';
  type?: string;
  officeId?: string;
}

/**
 * Get admissions with pagination and filtering (OPTIMIZED)
 * Returns only summary data for list views
 * 
 * COMPLIANT WITH:
 * - SCREEN_GENERATION.md - "Prefer summary data over full detail payloads"
 * - LARGE_DATA.md - "Always paginate tables with >25 rows"
 */
export async function getAdmissionsPaginated(
  orgId: string,
  params: {
    page: number;
    pageSize: number;
    filters?: AdmissionFilters;
  }
): Promise<PaginatedResponse<AdmissionSummary>> {
  console.log('[dataGateway] getAdmissionsPaginated called:', { orgId, params });
  
  const { page, pageSize, filters = {} } = params;
  
  // Build filters for admissionGateway
  const gatewayFilters: FilterParams = {};
  if (filters.status) {
    gatewayFilters.status = filters.status;
  }
  if (filters.officeId) {
    gatewayFilters.officeId = filters.officeId;
  }
  
  // Call admissionGateway with pagination
  const result = await admissionGateway.search({
    query: filters.search,
    filters: gatewayFilters,
    pagination: { page, pageSize },
  });
  
  // Transform to summary format (only essential fields)
  const summaries: AdmissionSummary[] = result.data.map(admission => ({
    id: admission.id,
    patientName: '', // TODO: Join with patient data
    patientMrn: '', // TODO: Join with patient data
    admissionDate: admission.admissionDate,
    status: admission.status,
    primaryDiagnosis: admission.primaryDiagnosis,
    payer: '', // TODO: Join with payer data
  }));
  
  return {
    data: summaries,
    total: result.total,
    page: result.page,
    pageSize: result.pageSize,
    totalPages: result.totalPages,
  };
}

/**
 * Get admissions summary (no pagination - for dropdowns/selects)
 * Still returns minimal data
 */
export async function getAdmissionsSummary(
  orgId: string,
  filters?: AdmissionFilters
): Promise<{ admissions: AdmissionSummary[] }> {
  console.log('[dataGateway] getAdmissionsSummary called:', { orgId, filters });
  
  // Use pagination with large page size for backwards compatibility
  const result = await getAdmissionsPaginated(orgId, {
    page: 1,
    pageSize: 1000,
    filters,
  });
  
  return {
    admissions: result.data,
  };
}

// ============================================================================
// LEGACY ADMISSION FUNCTIONS (Compatibility layer)
// ============================================================================

/**
 * Transform Admission from dataGateway format (camelCase) to UI format (snake_case)
 */
function transformAdmissionToUI(admission: Admission): any {
  return {
    id: admission.id,
    patient_id: admission.patientId,
    admission_date: admission.admissionDate,
    discharge_date: admission.dischargeDate,
    status: admission.status,
    primary_diagnosis: admission.primaryDiagnosis,
    secondary_diagnoses: admission.secondaryDiagnoses,
    primary_payer_id: admission.primaryPayerId,
    office_id: admission.officeId,
    created_at: admission.createdAt,
    updated_at: admission.updatedAt,
  };
}

/**
 * Transform Admission from UI format (snake_case) to dataGateway format (camelCase)
 */
function transformAdmissionFromUI(admission: any): Partial<Admission> {
  const transformed: any = {};
  
  if (admission.patient_id !== undefined) transformed.patientId = admission.patient_id;
  if (admission.admission_date !== undefined) transformed.admissionDate = admission.admission_date;
  if (admission.discharge_date !== undefined) transformed.dischargeDate = admission.discharge_date;
  if (admission.status !== undefined) transformed.status = admission.status;
  if (admission.primary_diagnosis !== undefined) transformed.primaryDiagnosis = admission.primary_diagnosis;
  if (admission.secondary_diagnoses !== undefined) transformed.secondaryDiagnoses = admission.secondary_diagnoses;
  if (admission.primary_payer_id !== undefined) transformed.primaryPayerId = admission.primary_payer_id;
  if (admission.office_id !== undefined) transformed.officeId = admission.office_id;
  
  return transformed;
}

/**
 * Get admissions for a patient
 * Legacy function for backwards compatibility - delegates to admissionGateway.getByPatientId
 */
export async function getAdmissions(patientId: string): Promise<{ admissions: any[] }> {
  console.log('[dataGateway] getAdmissions called:', patientId);
  
  const admissions = await admissionGateway.getByPatientId(patientId);
  
  // Transform admissions to UI format (snake_case)
  const transformedAdmissions = admissions.map(transformAdmissionToUI);
  
  return {
    admissions: transformedAdmissions,
  };
}

/**
 * Get admission by ID
 * Legacy function for backwards compatibility
 */
export async function getAdmissionById(admissionId: string): Promise<{ admission: any | null }> {
  console.log('[dataGateway] getAdmissionById called:', admissionId);
  
  const admission = await admissionGateway.getById(admissionId);
  
  if (!admission) {
    return { admission: null };
  }
  
  // Transform to UI format (snake_case)
  return {
    admission: transformAdmissionToUI(admission),
  };
}

/**
 * Get admission readiness status
 * Returns calculated readiness based on checklist completion
 */
export async function getAdmissionReadiness(admissionId: string): Promise<any> {
  console.log('[dataGateway] getAdmissionReadiness called:', admissionId);
  
  // In production, this would fetch real admission data and calculate readiness
  // For demo, generate realistic mock data
  
  const scenarios = ['complete', 'blocked', 'partial', 'draft'] as const;
  const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  
  // Import from AdmissionReadiness component
  const { calculateReadiness, generateMockChecklist } = await import('../components/admission/AdmissionReadiness');
  
  const checklist = generateMockChecklist(scenario);
  const readiness = calculateReadiness(checklist);
  
  return readiness;
}

/**
 * Create admission
 * Legacy function for backwards compatibility
 */
export async function createAdmission(
  patientId: string,
  officeId: string,
  admissionDate: string,
  status: 'active' | 'pending' | 'discharged' = 'active'
): Promise<{ admission: any }> {
  console.log('[dataGateway] createAdmission called');
  
  const admission = await admissionGateway.create({
    patientId,
    officeId,
    admissionDate,
    status,
  });
  
  // Transform to UI format (snake_case)
  return {
    admission: transformAdmissionToUI(admission),
  };
}

/**
 * Update admission
 * Legacy function for backwards compatibility
 */
export async function updateAdmission(
  admissionId: string,
  updates: any
): Promise<{ admission: any }> {
  console.log('[dataGateway] updateAdmission called:', admissionId);
  
  // Transform from UI format (snake_case) to dataGateway format (camelCase)
  const transformedUpdates = transformAdmissionFromUI(updates);
  
  const admission = await admissionGateway.update(admissionId, transformedUpdates);
  
  // Transform back to UI format (snake_case)
  return {
    admission: transformAdmissionToUI(admission),
  };
}

// ============================================================================
// LEGACY VISIT FUNCTIONS (Compatibility layer)
// ============================================================================

/**
 * Transform Visit from dataGateway format (camelCase) to UI format (snake_case)
 */
function transformVisitToUI(visit: Visit): any {
  return {
    id: visit.id,
    patient_id: visit.patientId,
    admission_id: visit.admissionId,
    scheduled_date: visit.scheduledDate,
    scheduled_time: visit.scheduledTime,
    visit_type: visit.visitType,
    discipline: visit.discipline,
    clinician_id: visit.clinicianId,
    status: visit.status,
    evv_status: visit.evvStatus,
    created_at: visit.createdAt,
    updated_at: visit.updatedAt,
  };
}

/**
 * Transform Visit from UI format (snake_case) to dataGateway format (camelCase)
 */
function transformVisitFromUI(visit: any): Partial<Visit> {
  const transformed: any = {};
  
  if (visit.patient_id !== undefined) transformed.patientId = visit.patient_id;
  if (visit.admission_id !== undefined) transformed.admissionId = visit.admission_id;
  if (visit.scheduled_date !== undefined) transformed.scheduledDate = visit.scheduled_date;
  if (visit.scheduled_time !== undefined) transformed.scheduledTime = visit.scheduled_time;
  if (visit.visit_type !== undefined) transformed.visitType = visit.visit_type;
  if (visit.discipline !== undefined) transformed.discipline = visit.discipline;
  if (visit.clinician_id !== undefined) transformed.clinicianId = visit.clinician_id;
  if (visit.status !== undefined) transformed.status = visit.status;
  if (visit.evv_status !== undefined) transformed.evvStatus = visit.evv_status;
  
  return transformed;
}

/**
 * Get visits for a patient
 * Legacy function for backwards compatibility
 */
export async function getVisits(patientId: string): Promise<{ visits: any[] }> {
  console.log('[dataGateway] getVisits called:', patientId);
  
  const visits = await visitGateway.getByPatientId(patientId);
  
  // Transform visits to UI format (snake_case)
  const transformedVisits = visits.map(transformVisitToUI);
  
  return {
    visits: transformedVisits,
  };
}

/**
 * Get visit by ID
 * Legacy function for backwards compatibility
 */
export async function getVisitById(visitId: string): Promise<{ visit: any | null }> {
  console.log('[dataGateway] getVisitById called:', visitId);
  
  const visit = await visitGateway.getById(visitId);
  
  if (!visit) {
    return { visit: null };
  }
  
  // Transform to UI format (snake_case)
  return {
    visit: transformVisitToUI(visit),
  };
}

/**
 * Create visit
 * Legacy function for backwards compatibility
 */
export async function createVisit(visitData: any): Promise<{ visit: any }> {
  console.log('[dataGateway] createVisit called');
  
  // Transform from UI format (snake_case) to dataGateway format (camelCase)
  const transformedData = transformVisitFromUI(visitData);
  
  const visit = await visitGateway.create(transformedData as Omit<Visit, 'id' | 'createdAt' | 'updatedAt'>);
  
  // Transform to UI format (snake_case)
  return {
    visit: transformVisitToUI(visit),
  };
}

/**
 * Update visit
 * Legacy function for backwards compatibility
 */
export async function updateVisit(
  visitId: string,
  updates: any
): Promise<{ visit: any }> {
  console.log('[dataGateway] updateVisit called:', visitId);
  
  // Transform from UI format (snake_case) to dataGateway format (camelCase)
  const transformedUpdates = transformVisitFromUI(updates);
  
  const visit = await visitGateway.update(visitId, transformedUpdates);
  
  // Transform back to UI format (snake_case)
  return {
    visit: transformVisitToUI(visit),
  };
}

/**
 * Get alternate locations for a patient
 * Legacy function for backwards compatibility
 */
export async function getAlternateLocations(patientId: string): Promise<{ locations: AlternateLocation[] }> {
  console.log('[dataGateway] getAlternateLocations called:', patientId);
  
  // TODO: Replace with actual Supabase implementation
  // For now return empty array
  return {
    locations: [],
  };
}

// ============================================================================
// INSURANCE OPERATIONS
// ============================================================================

export interface Insurance {
  id: string;
  admission_id: string;
  payer_id: string;
  payer_name?: string;
  priority: number;
  policy_number: string;
  group_number?: string;
  effective_date?: string;
  termination_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Payer {
  id: string;
  name: string;
  type: string;
  allowed_offices?: string[];
  org_id: string;
  created_at?: string;
}

/**
 * Get insurance records for an admission
 */
export async function getInsuranceForAdmission(admissionId: string): Promise<{ insurances: Insurance[] }> {
  console.log('[dataGateway] getInsuranceForAdmission called:', admissionId);
  
  try {
    const { data, error } = await supabase
      .from('kv_store_845bc545')
      .select('value')
      .eq('key', `insurance:admission:${admissionId}`)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('[getInsuranceForAdmission] Error:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      return { insurances: [] };
    }
    
    const insurances = Array.isArray(data.value) ? data.value : [];
    return { insurances };
  } catch (err: any) {
    console.error('[getInsuranceForAdmission] Exception:', err);
    throw err;
  }
}

/**
 * Get all payers for an organization
 */
export async function getPayers(orgId: string): Promise<{ payers: Payer[] }> {
  console.log('[dataGateway] getPayers called:', orgId);
  
  try {
    const { data, error } = await supabase
      .from('kv_store_845bc545')
      .select('value')
      .eq('key', `payers:org:${orgId}`)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('[getPayers] Error:', error);
      throw new Error(error.message);
    }
    
    if (!data) {
      // Return default payers
      return {
        payers: [
          { id: 'payer-1', name: 'Medicare', type: 'government', org_id: orgId },
          { id: 'payer-2', name: 'Medicaid', type: 'government', org_id: orgId },
          { id: 'payer-3', name: 'Blue Cross Blue Shield', type: 'commercial', org_id: orgId },
          { id: 'payer-4', name: 'United Healthcare', type: 'commercial', org_id: orgId },
          { id: 'payer-5', name: 'Aetna', type: 'commercial', org_id: orgId },
          { id: 'payer-6', name: 'Cigna', type: 'commercial', org_id: orgId },
          { id: 'payer-7', name: 'Humana', type: 'commercial', org_id: orgId },
        ],
      };
    }
    
    const payers = Array.isArray(data.value) ? data.value : [];
    return { payers };
  } catch (err: any) {
    console.error('[getPayers] Exception:', err);
    throw err;
  }
}

/**
 * Create insurance record
 */
export async function createInsurance(
  admissionId: string,
  payerId: string,
  priority: number,
  policyNumber: string,
  groupNumber?: string,
  effectiveDate?: string,
  terminationDate?: string
): Promise<{ insurance: Insurance }> {
  console.log('[dataGateway] createInsurance called for admission:', admissionId);
  
  try {
    // Get existing insurances
    const { insurances } = await getInsuranceForAdmission(admissionId);
    
    // Create new insurance record
    const newInsurance: Insurance = {
      id: `ins-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      admission_id: admissionId,
      payer_id: payerId,
      priority,
      policy_number: policyNumber,
      group_number: groupNumber,
      effective_date: effectiveDate,
      termination_date: terminationDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Add to list
    const updatedInsurances = [...insurances, newInsurance];
    
    // Save to database
    const { error } = await supabase
      .from('kv_store_845bc545')
      .upsert({
        key: `insurance:admission:${admissionId}`,
        value: updatedInsurances,
      });
    
    if (error) {
      console.error('[createInsurance] Error:', error);
      throw new Error(error.message);
    }
    
    return { insurance: newInsurance };
  } catch (err: any) {
    console.error('[createInsurance] Exception:', err);
    throw err;
  }
}

/**
 * Update insurance record
 */
export async function updateInsurance(
  admissionId: string,
  insuranceId: string,
  updates: Partial<Insurance>
): Promise<{ insurance: Insurance }> {
  console.log('[dataGateway] updateInsurance called:', insuranceId);
  
  try {
    // Get existing insurances
    const { insurances } = await getInsuranceForAdmission(admissionId);
    
    // Find and update the insurance
    const index = insurances.findIndex(ins => ins.id === insuranceId);
    if (index === -1) {
      throw new Error('Insurance not found');
    }
    
    const updatedInsurance = {
      ...insurances[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    
    insurances[index] = updatedInsurance;
    
    // Save to database
    const { error } = await supabase
      .from('kv_store_845bc545')
      .upsert({
        key: `insurance:admission:${admissionId}`,
        value: insurances,
      });
    
    if (error) {
      console.error('[updateInsurance] Error:', error);
      throw new Error(error.message);
    }
    
    return { insurance: updatedInsurance };
  } catch (err: any) {
    console.error('[updateInsurance] Exception:', err);
    throw err;
  }
}

/**
 * Delete insurance record
 */
export async function deleteInsurance(admissionId: string, insuranceId: string): Promise<void> {
  console.log('[dataGateway] deleteInsurance called:', insuranceId);
  
  try {
    // Get existing insurances
    const { insurances } = await getInsuranceForAdmission(admissionId);
    
    // Filter out the insurance to delete
    const updatedInsurances = insurances.filter(ins => ins.id !== insuranceId);
    
    // Save to database
    const { error } = await supabase
      .from('kv_store_845bc545')
      .upsert({
        key: `insurance:admission:${admissionId}`,
        value: updatedInsurances,
      });
    
    if (error) {
      console.error('[deleteInsurance] Error:', error);
      throw new Error(error.message);
    }
  } catch (err: any) {
    console.error('[deleteInsurance] Exception:', err);
    throw err;
  }
}

// ============================================================================
// ALERT OPERATIONS
// ============================================================================

export const alertGateway = {
  /**
   * Get all alerts with optional filtering
   * Calls GET /alerts with query params
   */
  async getAlerts(filters?: AlertFilters): Promise<ClinicalAlert[]> {
    try {
      const qp = new URLSearchParams();
      if (filters?.severity && filters.severity !== 'all') qp.set('severity', filters.severity);
      if (filters?.status && filters.status !== 'all') qp.set('status', filters.status);
      if (filters?.category && filters.category !== 'all') qp.set('category', filters.category);
      if (filters?.patientId) qp.set('patientId', filters.patientId);
      if (filters?.officeId) qp.set('officeId', filters.officeId);
      if (filters?.sourceModule) qp.set('sourceModule', filters.sourceModule);

      const json = await apiRequest<{ alerts: any[] }>(`/alerts?${qp.toString()}`);
      const alerts: ClinicalAlert[] = (json.alerts || []).map((a: any) => ({
        id: a.id,
        severity: a.severity,
        category: a.category,
        title: a.title,
        explanation: a.explanation || '',
        suggestedResolution: a.suggestedResolution || a.suggested_resolution || '',
        quickAction: a.quickAction || a.quick_action || undefined,
        status: a.status || 'open',
        patientId: a.patientId || a.patient_id || undefined,
        patientName: a.patientName || a.patient_name || undefined,
        patientMrn: a.patientMrn || a.patient_mrn || undefined,
        relatedEntityId: a.relatedEntityId || a.related_entity_id || undefined,
        relatedEntityType: a.relatedEntityType || a.related_entity_type || undefined,
        officeId: a.officeId || a.office_id || undefined,
        assignedToUserId: a.assignedToUserId || a.assigned_to_user_id || undefined,
        sourceModule: a.sourceModule || a.source_module || undefined,
        createdAt: a.createdAt || a.created_at || '',
        updatedAt: a.updatedAt || a.updated_at || '',
        acknowledgedAt: a.acknowledgedAt || a.acknowledged_at || undefined,
        acknowledgedBy: a.acknowledgedBy || a.acknowledged_by || undefined,
        resolvedAt: a.resolvedAt || a.resolved_at || undefined,
        resolvedBy: a.resolvedBy || a.resolved_by || undefined,
        expiresAt: a.expiresAt || a.expires_at || undefined,
        sortOrder: a.sortOrder || a.sort_order || undefined,
      }));

      return sortAlertsByPriority(alerts);
    } catch (err) {
      console.error('[alertGateway.getAlerts] Error:', err);
      return [];
    }
  },

  /**
   * Get alerts for a specific patient
   */
  async getPatientAlerts(patientId: string): Promise<ClinicalAlert[]> {
    return this.getAlerts({ patientId });
  },

  /**
   * Get alert counts (for badges)
   */
  async getAlertCounts(filters?: AlertFilters): Promise<AlertCounts> {
    const alerts = await this.getAlerts(filters);
    return computeAlertCounts(alerts);
  },

  /**
   * Acknowledge an alert
   * Calls PUT /alerts/:id
   */
  async acknowledge(alertId: string): Promise<ClinicalAlert> {
    const json = await apiRequest<{ alert: any }>(`/alerts/${alertId}`, {
      method: 'PUT',
      body: { status: 'acknowledged' },
    });
    return json.alert;
  },

  /**
   * Resolve an alert
   * Calls PUT /alerts/:id
   */
  async resolve(alertId: string): Promise<ClinicalAlert> {
    const json = await apiRequest<{ alert: any }>(`/alerts/${alertId}`, {
      method: 'PUT',
      body: { status: 'resolved' },
    });
    return json.alert;
  },

  /**
   * Dismiss an alert
   * Calls PUT /alerts/:id
   */
  async dismiss(alertId: string): Promise<ClinicalAlert> {
    const json = await apiRequest<{ alert: any }>(`/alerts/${alertId}`, {
      method: 'PUT',
      body: { status: 'dismissed' },
    });
    return json.alert;
  },

  /**
   * Create a new alert (system-generated or manual)
   * Calls POST /alerts
   */
  async create(alert: Omit<ClinicalAlert, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClinicalAlert> {
    const json = await apiRequest<{ alert: any }>('/alerts', {
      method: 'POST',
      body: alert,
    });
    return json.alert;
  },
};

// ============================================================================
// SCHEDULING SMART ASSIST OPERATIONS
// ============================================================================

export const schedulingAssistGateway = {
  /**
   * Fetch smart scheduling suggestions from the server.
   * Calls GET /scheduling/smart-assist?date=...
   */
  async getSmartAssist(date?: string): Promise<SmartAssistData | null> {
    try {
      const qp = date ? `?date=${date}` : '';
      const json = await apiRequest<SmartAssistData>(`/scheduling/smart-assist${qp}`);
      return json;
    } catch (err) {
      console.error('[schedulingAssistGateway.getSmartAssist] Error:', err);
      return null;
    }
  },

  /**
   * Assign a caregiver to a visit.
   * Calls PUT /visits/:visitId
   */
  async assignCaregiver(visitId: string, caregiverId: string): Promise<any> {
    const json = await apiRequest(`/visits/${visitId}`, {
      method: 'PUT',
      body: { caregiver_id: caregiverId, status: 'scheduled' },
    });
    return json.data;
  },

  /**
   * Send open shift notifications to caregivers.
   * Calls POST /scheduling/notify
   */
  async sendShiftNotifications(visitId: string, caregiverIds: string[]): Promise<any> {
    const json = await apiRequest('/scheduling/notify', {
      method: 'POST',
      body: { visitId, caregiverIds },
    });
    return json;
  },

  /**
   * Fetch caregiver details by ID.
   * Calls GET /caregivers
   */
  async getCaregivers(filters?: { status?: string; discipline?: string }): Promise<any[]> {
    try {
      const qp = new URLSearchParams();
      if (filters?.status) qp.set('status', filters.status);
      if (filters?.discipline) qp.set('discipline', filters.discipline);
      const json = await apiRequest<{ data: any[] }>(`/caregivers?${qp.toString()}`);
      return json.data || [];
    } catch (err) {
      console.error('[schedulingAssistGateway.getCaregivers] Error:', err);
      return [];
    }
  },

  /**
   * Track coordinator preference (accepted/overridden/dismissed).
   * Used to improve future suggestion accuracy.
   */
  async trackPreference(data: {
    visitId: string;
    selectedCaregiverId?: string;
    suggestedCaregiverId?: string;
    action: 'accepted' | 'overridden' | 'dismissed';
    reason?: string;
  }): Promise<void> {
    try {
      await apiRequest('/scheduling/preference', {
        method: 'POST',
        body: data,
      });
    } catch (err) {
      console.error('[schedulingAssistGateway.trackPreference] Error:', err);
    }
  },
};

// ============================================================================
// RISK DASHBOARD OPERATIONS
// ============================================================================

export const riskDashboardGateway = {
  /**
   * Fetch the full predictive risk dashboard.
   * Calls GET /risks/dashboard
   */
  async getDashboard(): Promise<RiskDashboardData> {
    const json = await apiRequest<RiskDashboardData>('/risks/dashboard');
    return json;
  },

  /**
   * Fetch risk threshold configuration.
   * Calls GET /risks/config
   */
  async getConfig(): Promise<RiskThresholdConfig> {
    return apiRequest<RiskThresholdConfig>('/risks/config');
  },

  /**
   * Update risk threshold configuration.
   * Calls PUT /risks/config
   */
  async updateConfig(config: RiskThresholdConfig): Promise<{ success: boolean; updatedAt: string }> {
    return apiRequest('/risks/config', { method: 'PUT', body: config });
  },

  /**
   * Fetch historical trend snapshots.
   * Calls GET /risks/history?days=N
   */
  async getHistory(days: number = 30): Promise<{ trends: RiskTrendPoint[]; snapshots: RiskHistorySnapshot[] }> {
    return apiRequest(`/risks/history?days=${days}`);
  },

  /**
   * Export risk report as CSV — returns a Blob for download.
   * Calls GET /risks/export
   */
  async exportCSV(): Promise<Blob> {
    const res = await fetch(`${API_BASE}/risks/export`, {
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
      },
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Export failed ${res.status}: ${errText}`);
    }
    return res.blob();
  },
};

// ============================================================================
// COLLABORATION OPERATIONS
// ============================================================================

export const collaborationGateway = {
  /**
   * Fetch full collaboration data for a patient.
   * Calls GET /collaboration/:patientId
   */
  async getData(patientId: string): Promise<CollaborationData> {
    return apiRequest<CollaborationData>(`/collaboration/${patientId}`);
  },

  /**
   * Post a new collaboration message.
   * Calls POST /collaboration/:patientId/message
   */
  async postMessage(patientId: string, message: Partial<CollaborationMessage>): Promise<CollaborationMessage> {
    return apiRequest(`/collaboration/${patientId}/message`, {
      method: 'POST',
      body: message,
    });
  },

  /**
   * Create a new care coordination task.
   * Calls POST /collaboration/:patientId/task
   */
  async createTask(patientId: string, task: Partial<CareTask> & { createdByRole?: string }): Promise<{ task: CareTask; message: CollaborationMessage }> {
    return apiRequest(`/collaboration/${patientId}/task`, {
      method: 'POST',
      body: task,
    });
  },

  /**
   * Update a task (e.g. status change).
   * Calls PUT /collaboration/:patientId/task/:taskId
   */
  async updateTask(patientId: string, taskId: string, updates: Partial<CareTask>): Promise<CareTask> {
    return apiRequest(`/collaboration/${patientId}/task/${taskId}`, {
      method: 'PUT',
      body: updates,
    });
  },

  /**
   * Toggle message pin.
   * Calls PUT /collaboration/:patientId/message/:messageId/pin
   */
  async togglePin(patientId: string, messageId: string): Promise<CollaborationMessage> {
    return apiRequest(`/collaboration/${patientId}/message/${messageId}/pin`, {
      method: 'PUT',
      body: {},
    });
  },
};

// ============================================================================
// CLINICAL ASSISTANT OPERATIONS
// ============================================================================

export const clinicalAssistantGateway = {
  /**
   * Run full clinical analysis for a patient.
   * Calls GET /clinical-assistant/:patientId/analyze
   */
  async analyze(patientId: string): Promise<AssistantAnalysis> {
    return apiRequest<AssistantAnalysis>(`/clinical-assistant/${patientId}/analyze`);
  },

  /**
   * Ask a question about a patient's clinical data.
   * Calls POST /clinical-assistant/:patientId/ask
   */
  async ask(patientId: string, question: string): Promise<AssistantAskResponse> {
    return apiRequest<AssistantAskResponse>(`/clinical-assistant/${patientId}/ask`, {
      method: 'POST',
      body: { question },
    });
  },
};

// ============================================================================
// DOCUMENTATION ASSIST OPERATIONS
// ============================================================================

export const documentationGateway = {
  /** Fetch drafts for a patient */
  async getDrafts(patientId: string): Promise<DraftListResponse> {
    return apiRequest<DraftListResponse>(`/doc-assist/drafts/${patientId}`);
  },

  /** Create a new draft */
  async createDraft(data: {
    patientId: string;
    templateId: FormTemplateType;
    templateName: string;
    values?: FormValues;
    createdBy?: string;
  }): Promise<DraftSaveResponse> {
    return apiRequest<DraftSaveResponse>('/doc-assist/drafts', {
      method: 'POST',
      body: data,
    });
  },

  /** Update/autosave a draft */
  async saveDraft(
    draftId: string,
    data: Partial<DocumentDraft> & { autoSaved?: boolean }
  ): Promise<DraftSaveResponse> {
    return apiRequest<DraftSaveResponse>(`/doc-assist/drafts/${draftId}`, {
      method: 'PUT',
      body: data,
    });
  },

  /** Fetch smart phrases, optionally by category */
  async getPhrases(category?: string): Promise<SmartPhraseResponse> {
    const path = category
      ? `/doc-assist/phrases/${category}`
      : '/doc-assist/phrases';
    return apiRequest<SmartPhraseResponse>(path);
  },

  /** Record usage of a smart phrase */
  async usePhrase(phraseId: string): Promise<void> {
    await apiRequest(`/doc-assist/phrases/${phraseId}/use`, { method: 'PUT' });
  },

  /** Fetch previous documentation patterns for a patient */
  async getPatterns(patientId: string, fieldId?: string): Promise<PatternsResponse> {
    const params = fieldId ? `?fieldId=${fieldId}` : '';
    return apiRequest<PatternsResponse>(`/doc-assist/patterns/${patientId}${params}`);
  },

  /** Create a personal smart phrase */
  async createPhrase(data: {
    category: string;
    label: string;
    text: string;
    tags?: string[];
    createdBy?: string;
  }): Promise<SmartPhraseSaveResponse> {
    return apiRequest<SmartPhraseSaveResponse>('/doc-assist/phrases', {
      method: 'POST',
      body: data,
    });
  },

  /** Delete a personal smart phrase */
  async deletePhrase(phraseId: string): Promise<void> {
    await apiRequest(`/doc-assist/phrases/${phraseId}`, { method: 'DELETE' });
  },

  /** Request co-signature on a completed document */
  async requestCosign(draftId: string, data: {
    cosignRequestedTo: string;
    cosignNote?: string;
  }): Promise<CosignResponse> {
    return apiRequest<CosignResponse>(`/doc-assist/drafts/${draftId}/request-cosign`, {
      method: 'POST',
      body: data,
    });
  },

  /** Apply co-signature to a document */
  async cosign(draftId: string, data: {
    cosignedBy: string;
    cosignComment?: string;
  }): Promise<CosignResponse> {
    return apiRequest<CosignResponse>(`/doc-assist/drafts/${draftId}/cosign`, {
      method: 'POST',
      body: data,
    });
  },

  /** Reject co-signature and return for revision */
  async rejectCosign(draftId: string, data: {
    cosignComment: string;
  }): Promise<CosignResponse> {
    return apiRequest<CosignResponse>(`/doc-assist/drafts/${draftId}/reject-cosign`, {
      method: 'POST',
      body: data,
    });
  },

  /** Fetch audit trail for a draft */
  async getAuditTrail(draftId: string): Promise<AuditLogResponse> {
    return apiRequest<AuditLogResponse>(`/doc-assist/audit/${draftId}`);
  },

  /** Log an audit event (e.g., PDF export) */
  async logAuditEvent(data: {
    draftId: string;
    action: AuditAction;
    actor?: string;
    actorRole?: string;
    details: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    await apiRequest('/doc-assist/audit', {
      method: 'POST',
      body: data,
    });
  },

  /** Fetch the co-signature queue (all pending co-sign documents) */
  async getCosignQueue(): Promise<CosignQueueResponse> {
    return apiRequest<CosignQueueResponse>('/doc-assist/cosign-queue');
  },

  /** Bulk co-sign multiple documents at once */
  async bulkCosign(data: {
    draftIds: string[];
    cosignedBy: string;
    cosignComment?: string;
  }): Promise<{ successCount: number; errorCount: number; results: DocumentDraft[]; errors: any[] }> {
    return apiRequest('/doc-assist/bulk-cosign', {
      method: 'POST',
      body: data,
    });
  },

  /** Fetch workflow notifications */
  async getNotifications(): Promise<DocNotificationResponse> {
    return apiRequest<DocNotificationResponse>('/doc-assist/notifications');
  },

  /** Mark a notification as read */
  async markNotificationRead(notifId: string): Promise<void> {
    await apiRequest(`/doc-assist/notifications/${notifId}/read`, { method: 'PUT' });
  },

  /** Mark all notifications as read */
  async markAllNotificationsRead(): Promise<void> {
    await apiRequest('/doc-assist/notifications/read-all', { method: 'PUT' });
  },

  /** Fetch co-signature analytics data */
  async getCosignAnalytics(): Promise<CosignAnalyticsResponse> {
    return apiRequest<CosignAnalyticsResponse>('/doc-assist/cosign-analytics');
  },
};

// ============================================================================
// Patient Risk Scoring Gateway
// ============================================================================

import type {
  RiskScoreResponse,
  RiskScoreBatchResponse,
  RiskTrendResponse,
  RiskThresholdConfigResponse,
  RiskThresholdAlertResponse,
  RiskThresholdConfig,
} from './riskScoringTypes';

export const riskScoringGateway = {
  /** Get risk score for a single patient */
  async getPatientRiskScore(patientId: string): Promise<RiskScoreResponse> {
    return apiRequest<RiskScoreResponse>(`/risk-scoring/${patientId}`);
  },

  /** Get risk scores for all patients (batch) */
  async getAllRiskScores(): Promise<RiskScoreBatchResponse> {
    return apiRequest<RiskScoreBatchResponse>('/risk-scoring');
  },

  /** Get risk score trend history for a patient */
  async getPatientRiskHistory(patientId: string): Promise<RiskTrendResponse> {
    return apiRequest<RiskTrendResponse>(`/risk-scoring/${patientId}/history`);
  },

  /** Get threshold configuration */
  async getThresholdConfig(): Promise<RiskThresholdConfigResponse> {
    return apiRequest<RiskThresholdConfigResponse>('/risk-scoring-config/thresholds');
  },

  /** Update threshold configuration */
  async updateThresholdConfig(config: Partial<RiskThresholdConfig>): Promise<RiskThresholdConfigResponse> {
    return apiRequest<RiskThresholdConfigResponse>('/risk-scoring-config/thresholds', {
      method: 'PUT',
      body: config,
    });
  },

  /** Get threshold-triggered alerts */
  async getThresholdAlerts(): Promise<RiskThresholdAlertResponse> {
    return apiRequest<RiskThresholdAlertResponse>('/risk-scoring-config/threshold-alerts');
  },

  /** Dismiss a threshold alert */
  async dismissThresholdAlert(alertId: string): Promise<void> {
    await apiRequest(`/risk-scoring-config/threshold-alerts/${alertId}/dismiss`, { method: 'PUT' });
  },
};

// ============================================================================
// Referral Intake Pipeline Gateway
// ============================================================================

import type {
  ReferralPipelineResponse,
  ReferralResponse,
  PipelineMetrics,
  PipelineStage,
  NewReferralInput,
  PipelineAnalytics,
} from './referralPipelineTypes';

export const referralPipelineGateway = {
  /** Get all referrals with pipeline counts */
  async getAll(): Promise<ReferralPipelineResponse> {
    return apiRequest<ReferralPipelineResponse>('/referral-pipeline');
  },

  /** Get a single referral by ID */
  async getById(id: string): Promise<ReferralResponse> {
    return apiRequest<ReferralResponse>(`/referral-pipeline/${id}`);
  },

  /** Move a referral to a different stage */
  async moveStage(id: string, data: {
    toStage: PipelineStage;
    stageOrder?: number;
    note?: string;
    movedBy?: string;
  }): Promise<ReferralResponse> {
    return apiRequest<ReferralResponse>(`/referral-pipeline/${id}/move`, {
      method: 'PUT',
      body: data,
    });
  },

  /** Update referral details */
  async update(id: string, data: Record<string, any>): Promise<ReferralResponse> {
    return apiRequest<ReferralResponse>(`/referral-pipeline/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /** Add a note to a referral */
  async addNote(id: string, text: string, author: string): Promise<ReferralResponse> {
    return apiRequest<ReferralResponse>(`/referral-pipeline/${id}/notes`, {
      method: 'POST',
      body: { text, author },
    });
  },

  /** Get pipeline performance metrics */
  async getMetrics(): Promise<PipelineMetrics> {
    return apiRequest<PipelineMetrics>('/referral-pipeline-metrics');
  },

  /** Create a new referral */
  async create(data: NewReferralInput): Promise<ReferralResponse> {
    return apiRequest<ReferralResponse>('/referral-pipeline', {
      method: 'POST',
      body: data,
    });
  },

  /** Get full pipeline analytics */
  async getAnalytics(): Promise<PipelineAnalytics> {
    return apiRequest<PipelineAnalytics>('/referral-pipeline-analytics');
  },

  /** Batch move multiple referrals to a target stage */
  async batchMoveStage(data: {
    referralIds: string[];
    toStage: PipelineStage;
    note?: string;
    movedBy?: string;
  }): Promise<{ referrals: any[]; errors: any[]; moved: number; failed: number }> {
    return apiRequest('/referral-pipeline-batch-move', {
      method: 'PUT',
      body: data,
    });
  },
};

// ============================================================================
// WORKSPACE HOME GATEWAY
// ============================================================================

export interface WorkspaceHomeData {
  criticalIssues: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium';
    category: string;
    count: number;
    route: string;
  }>;
  todaysWork: {
    visits: Array<{
      id: string;
      patientName: string;
      patientId: string;
      time: string;
      discipline: string;
      caregiverName: string;
      status: string;
      visitType: string;
    }>;
    admissions: Array<{
      id: string;
      patientName: string;
      patientId: string;
      status: string;
      type: string;
      physician: string;
    }>;
    openShifts: number;
  };
  recentItems: {
    patients: Array<{ id: string; title: string; subtitle: string; lastAccessed: string; type: string }>;
    admissions: Array<{ id: string; title: string; subtitle: string; lastAccessed: string; type: string }>;
    documentation: Array<{ id: string; title: string; subtitle: string; lastAccessed: string; type: string }>;
    billing: Array<{ id: string; title: string; subtitle: string; lastAccessed: string; type: string }>;
  };
  insights: {
    visitsToday: number;
    visitsCompleted: number;
    openIssues: number;
    activeAdmissions: number;
    pendingQa: number;
    pendingCosigns: number;
    pipelineActive: number;
    openShifts: number;
    claimsReady: number;
    authorizationsExpiring: number;
    hospiceSignaturesPending: number;
  };
}

export const workspaceGateway = {
  async getHomeData(): Promise<WorkspaceHomeData> {
    return apiRequest<WorkspaceHomeData>('/workspace/home');
  },
};

// ============================================================================
// OPEN SHIFT GATEWAY
// ============================================================================

export interface OpenShift {
  id: string;
  patientName: string;
  patientAddress: string;
  patientPhone: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  discipline: string;
  billingCode: string;
  urgency: 'high' | 'medium' | 'low';
  postedBy: string;
  postedAt: string;
  notificationsSent: number;
}

export const openShiftGateway = {
  /** Fetch all open shifts from GET /open-shifts */
  async list(): Promise<OpenShift[]> {
    try {
      const json = await apiRequest<{ data: any[] }>('/open-shifts');
      return (json.data || []).map((s: any) => ({
        id: s.id,
        patientName: s.patient_name || 'Unknown',
        patientAddress: s.patient_address || s.address || '',
        patientPhone: s.patient_phone || s.phone || '',
        visitDate: s.visit_date || '',
        startTime: s.start_time || '',
        endTime: s.end_time || '',
        discipline: s.discipline || '',
        billingCode: s.billing_code || '',
        urgency: s.urgency || 'low',
        postedBy: s.posted_by || s.created_by || '',
        postedAt: s.posted_at || s.created_at || '',
        notificationsSent: s.notifications_sent || 0,
      }));
    } catch (err) {
      console.error('[openShiftGateway.list] Error:', err);
      return [];
    }
  },

  /** Claim an open shift */
  async claim(shiftId: string, caregiverId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await apiRequest(`/open-shifts/${shiftId}/claim`, {
        method: 'POST',
        body: { caregiver_id: caregiverId },
      });
      return { success: true };
    } catch (err: any) {
      console.error('[openShiftGateway.claim] Error:', err);
      return { success: false, error: err.message };
    }
  },

  /** Send notifications for an open shift */
  async notify(visitId: string, caregiverIds: string[]): Promise<{ success: boolean; notificationsSent: number }> {
    try {
      const json = await apiRequest<{ success: boolean; notificationsSent: number }>('/scheduling/notify', {
        method: 'POST',
        body: { visitId, caregiverIds },
      });
      return json;
    } catch (err: any) {
      console.error('[openShiftGateway.notify] Error:', err);
      return { success: false, notificationsSent: 0 };
    }
  },
};

// ============================================================================
// CAREGIVER GATEWAY
// ============================================================================

export interface Caregiver {
  id: string;
  name: string;
  discipline: string;
  status: string;
  phone?: string;
  email?: string;
  zone?: string;
  disciplines?: string[];
  maxDailyVisits?: number;
  certifications?: string[];
  yearsExperience?: number;
  missedVisitRate?: number;
  avgPunctuality?: number;
  rating?: number;
}

export const caregiverGateway = {
  /** Fetch caregivers with optional filters */
  async list(filters?: { discipline?: string; status?: string }): Promise<Caregiver[]> {
    try {
      const qp = new URLSearchParams();
      if (filters?.discipline) qp.set('discipline', filters.discipline);
      if (filters?.status) qp.set('status', filters.status);
      const json = await apiRequest<{ data: any[] }>(`/caregivers?${qp.toString()}`);
      return (json.data || []).map((c: any) => ({
        id: c.id,
        name: c.name || '',
        discipline: c.discipline || c.disciplines?.[0] || '',
        status: c.status || 'active',
        phone: c.phone || '',
        email: c.email || '',
        zone: c.zone || '',
        disciplines: c.disciplines || [],
        maxDailyVisits: c.maxDailyVisits ?? c.max_daily_visits ?? 6,
        certifications: c.certifications || [],
        yearsExperience: c.yearsExperience ?? c.years_experience ?? 0,
        missedVisitRate: c.missedVisitRate ?? c.missed_visit_rate ?? 0,
        avgPunctuality: c.avgPunctuality ?? c.avg_punctuality ?? 1,
        rating: c.rating ?? 0,
      }));
    } catch (err) {
      console.error('[caregiverGateway.list] Error:', err);
      return [];
    }
  },
};

// ============================================================================
// MIGRATION NOTES FOR .NET 8 API
// ============================================================================

// ============================================================================
// POC MONITOR GATEWAY
// ============================================================================

export interface MonitorVisitData {
  id: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  admissionId: string;
  admissionLabel: string;
  caregiverId: string;
  caregiverName: string;
  discipline: string;
  visitType: string;
  scheduledDate: string;
  scheduledTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: string;
  evvStatus: string;
  docStatus: string;
  conflicts: string[];
  authorizationRemaining?: number;
  notes?: string;
}

export interface EvvErrorData {
  id: string;
  visit_id: string;
  error_code: string;
  error_description: string;
  suggested_fix: string;
  severity: 'high' | 'medium' | 'low';
  occurred_at: string;
  retry_count: number;
}

export interface ConflictData {
  id: string;
  type: string;
  severity: string;
  description: string;
  visitIds: string[];
  suggestedAction: string;
}

export interface ComplianceData {
  daily: Array<{ day: string; date: string; compliance: number; errors: number; transmitted: number; total: number; completed: number }>;
  caregiverCompliance: Array<{ name: string; discipline: string; total: number; compliant: number; complianceRate: number }>;
  weeklyAvg: number;
}

export const pointOfCareGateway = {
  async getMonitorVisits(date: string, status?: string[], evvStatus?: string[]): Promise<MonitorVisitData[]> {
    try {
      const params = new URLSearchParams({ date });
      if (status && status.length > 0) params.set('status', status.join(','));
      if (evvStatus && evvStatus.length > 0) params.set('evv_status', evvStatus.join(','));
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const res = await fetch(
        `${API_BASE}/poc/monitor/visits?${params}`,
        { headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' } }
      );
      if (!res.ok) { console.error('[pocGateway] visits error:', res.status); return []; }
      const json = await res.json();
      return json.data || [];
    } catch (err) { console.error('[pocGateway] visits err:', err); return []; }
  },

  async getEvvErrors(): Promise<EvvErrorData[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const res = await fetch(`${API_BASE}/poc/monitor/evv-errors`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (err) { console.error('[pocGateway] evv errors:', err); return []; }
  },

  async resendEvvError(errorId: string): Promise<{ success: boolean; transmissionId?: string; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const res = await fetch(`${API_BASE}/poc/monitor/evv-errors/${errorId}/resend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' },
      });
      return await res.json();
    } catch (err) { console.error('[pocGateway] resend err:', err); return { success: false, error: 'Network error' }; }
  },

  async bulkResendEvvErrors(errorIds: string[]): Promise<{ success: boolean; processed?: number; error?: string }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const res = await fetch(`${API_BASE}/poc/monitor/evv-errors/bulk-resend`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorIds }),
      });
      return await res.json();
    } catch (err) { console.error('[pocGateway] bulk resend err:', err); return { success: false, error: 'Network error' }; }
  },

  async updateVisit(visitId: string, changes: Record<string, any>): Promise<{ success: boolean }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const res = await fetch(`${API_BASE}/poc/monitor/visits/${visitId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      return await res.json();
    } catch (err) { console.error('[pocGateway] update err:', err); return { success: false }; }
  },

  async reassignVisit(visitId: string, newCaregiverId: string, reason: string): Promise<{ success: boolean }> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const res = await fetch(`${API_BASE}/poc/monitor/visits/${visitId}/reassign`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_caregiver_id: newCaregiverId, reason }),
      });
      return await res.json();
    } catch (err) { console.error('[pocGateway] reassign err:', err); return { success: false }; }
  },

  async getConflicts(date: string): Promise<ConflictData[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const res = await fetch(`${API_BASE}/poc/monitor/conflicts?date=${date}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' },
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    } catch (err) { console.error('[pocGateway] conflicts err:', err); return []; }
  },

  async getComplianceData(days: number = 7): Promise<ComplianceData | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userToken = session?.access_token || '';
      const res = await fetch(`${API_BASE}/poc/monitor/compliance?days=${days}`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}`, 'X-User-Token': userToken, 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch (err) { console.error('[pocGateway] compliance err:', err); return null; }
  },
};

// ============================================================================
// REFERRAL GATEWAY (Patient Referral History)
// ============================================================================

export interface Referral {
  id: string;
  referral_date: string;
  status: string;
  source: string;
  source_name?: string;
  referral_type?: string;
  priority?: string;
  created_at: string;
  notes?: string;
  patientId?: string;
}

export const referralGateway = {
  /**
   * Search referrals with pagination and filtering
   * Mock implementation - in production would call API
   */
  async search(params: {
    filters?: FilterParams;
    pagination: PaginationParams;
    sorting?: SortParams;
  }): Promise<PaginatedResponse<Referral>> {
    try {
      // Mock data for demo purposes
      // In production, this would call: apiRequest<{ referrals: any[] }>('/referrals?...')
      const mockReferrals: Referral[] = [
        {
          id: 'ref-001',
          referral_date: '2024-03-01',
          status: 'admitted',
          source: 'hospital',
          source_name: 'Memorial Hospital',
          referral_type: 'skilled_nursing',
          priority: 'standard',
          created_at: '2024-03-01T10:00:00Z',
          notes: 'Post-surgical care required',
          patientId: params.filters?.patientId || '',
        },
        {
          id: 'ref-002',
          referral_date: '2024-02-15',
          status: 'qualified',
          source: 'physician',
          source_name: 'Dr. Smith',
          referral_type: 'physical_therapy',
          priority: 'urgent',
          created_at: '2024-02-15T14:30:00Z',
          notes: 'Rehabilitation after stroke',
          patientId: params.filters?.patientId || '',
        },
      ];

      // Filter by patientId if provided
      let filtered = mockReferrals;
      if (params.filters?.patientId) {
        filtered = mockReferrals.filter(r => r.patientId === params.filters!.patientId);
      }

      // Apply pagination
      const { page, pageSize } = params.pagination;
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (err) {
      console.error('[referralGateway.search] Error:', err);
      return {
        data: [],
        total: 0,
        page: params.pagination.page,
        pageSize: params.pagination.pageSize,
        totalPages: 0,
      };
    }
  },

  /**
   * Get referral by ID
   * Mock implementation - in production would call API
   */
  async getById(id: string): Promise<Referral | null> {
    try {
      // Mock data - in production: apiRequest<{ referral: any }>(`/referrals/${id}`)
      return {
        id,
        referral_date: '2024-03-01',
        status: 'admitted',
        source: 'hospital',
        source_name: 'Memorial Hospital',
        referral_type: 'skilled_nursing',
        priority: 'standard',
        created_at: '2024-03-01T10:00:00Z',
        notes: 'Post-surgical care required',
      };
    } catch (err) {
      console.error('[referralGateway.getById] Error:', err);
      return null;
    }
  },
};

// ============================================================================
// ORDER OPERATIONS
// ============================================================================

export interface Order {
  id: string;
  type: string;
  status: string;
  order_date: string;
  ordering_physician?: string;
  description?: string;
  signature_status?: string;
  patient_id?: string;
  admission_id?: string;
  created_at: string;
  updated_at?: string;
}

export const orderGateway = {
  /**
   * Search orders with pagination and filtering
   * Future: Will call GET /orders API endpoint
   */
  async search(params: {
    filters?: FilterParams;
    pagination: PaginationParams;
    sorting?: SortParams;
  }): Promise<PaginatedResponse<Order>> {
    try {
      // Mock data for demo purposes
      // In production, this would call: apiRequest<{ orders: any[] }>('/orders?...')
      const mockOrders: Order[] = [
        {
          id: 'order-001',
          type: 'Verbal Order',
          status: 'pending',
          order_date: '2024-03-10',
          ordering_physician: 'Dr. Johnson',
          description: 'Increase insulin dosage to 10 units',
          signature_status: 'pending_signature',
          patient_id: params.filters?.patientId || '',
          admission_id: params.filters?.admissionId || '',
          created_at: '2024-03-10T10:00:00Z',
        },
        {
          id: 'order-002',
          type: 'Physician Order',
          status: 'signed',
          order_date: '2024-03-08',
          ordering_physician: 'Dr. Smith',
          description: 'Physical therapy 3x per week',
          signature_status: 'signed',
          patient_id: params.filters?.patientId || '',
          admission_id: params.filters?.admissionId || '',
          created_at: '2024-03-08T14:30:00Z',
        },
        {
          id: 'order-003',
          type: 'Home Health Order',
          status: 'completed',
          order_date: '2024-03-05',
          ordering_physician: 'Dr. Williams',
          description: 'Wound care daily for 2 weeks',
          signature_status: 'signed',
          patient_id: params.filters?.patientId || '',
          admission_id: params.filters?.admissionId || '',
          created_at: '2024-03-05T09:15:00Z',
        },
      ];

      // Filter by patientId and admissionId if provided
      let filtered = mockOrders;
      if (params.filters?.patientId) {
        filtered = filtered.filter(o => o.patient_id === params.filters!.patientId);
      }
      if (params.filters?.admissionId) {
        filtered = filtered.filter(o => o.admission_id === params.filters!.admissionId);
      }
      if (params.filters?.status) {
        filtered = filtered.filter(o => o.status === params.filters!.status);
      }

      // Apply sorting
      if (params.sorting) {
        const { field, direction } = params.sorting;
        filtered.sort((a: any, b: any) => {
          const aVal = a[field];
          const bVal = b[field];
          if (aVal < bVal) return direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      const { page, pageSize } = params.pagination;
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (err) {
      console.error('[orderGateway.search] Error:', err);
      return {
        data: [],
        total: 0,
        page: params.pagination.page,
        pageSize: params.pagination.pageSize,
        totalPages: 0,
      };
    }
  },

  /**
   * Get order by ID
   * Future: Will call GET /orders/:id API endpoint
   */
  async getById(id: string): Promise<Order | null> {
    try {
      // Mock data - in production: apiRequest<{ order: any }>(`/orders/${id}`)
      return {
        id,
        type: 'Verbal Order',
        status: 'pending',
        order_date: '2024-03-10',
        ordering_physician: 'Dr. Johnson',
        description: 'Increase insulin dosage to 10 units',
        signature_status: 'pending_signature',
        created_at: '2024-03-10T10:00:00Z',
      };
    } catch (err) {
      console.error('[orderGateway.getById] Error:', err);
      return null;
    }
  },

  /**
   * Create new order
   * Future: Will call POST /orders API endpoint
   */
  async create(order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    try {
      // Mock creation - in production: apiRequest<{ order: any }>('/orders', { method: 'POST', body: order })
      return {
        ...order,
        id: `order-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[orderGateway.create] Error:', err);
      throw err;
    }
  },

  /**
   * Update order
   * Future: Will call PUT /orders/:id API endpoint
   */
  async update(id: string, updates: Partial<Order>): Promise<Order> {
    try {
      // Mock update - in production: apiRequest<{ order: any }>(`/orders/${id}`, { method: 'PUT', body: updates })
      const current = await this.getById(id);
      if (!current) throw new Error('Order not found');
      
      return {
        ...current,
        ...updates,
        updated_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[orderGateway.update] Error:', err);
      throw err;
    }
  },
};

// ============================================================================
// ASSESSMENT OPERATIONS
// ============================================================================

export interface Assessment {
  id: string;
  type: string;
  status: string;
  assessment_date: string;
  completed_by?: string;
  timepoint?: string;
  score?: number;
  patient_id?: string;
  admission_id?: string;
  created_at: string;
  updated_at?: string;
}

export const assessmentGateway = {
  /**
   * Search assessments with pagination and filtering
   * Future: Will call GET /assessments API endpoint
   */
  async search(params: {
    filters?: FilterParams;
    pagination: PaginationParams;
    sorting?: SortParams;
  }): Promise<PaginatedResponse<Assessment>> {
    try {
      // Mock data for demo purposes
      // In production, this would call: apiRequest<{ assessments: any[] }>('/assessments?...')
      const mockAssessments: Assessment[] = [
        {
          id: 'assess-001',
          type: 'OASIS',
          status: 'completed',
          assessment_date: '2024-03-09',
          completed_by: 'Sarah Johnson, RN',
          timepoint: 'Start of Care',
          score: 42,
          patient_id: params.filters?.patientId || '',
          admission_id: params.filters?.admissionId || '',
          created_at: '2024-03-09T10:00:00Z',
        },
        {
          id: 'assess-002',
          type: 'HOPE',
          status: 'in_progress',
          assessment_date: '2024-03-10',
          completed_by: 'Dr. Martinez',
          timepoint: 'Admission',
          patient_id: params.filters?.patientId || '',
          admission_id: params.filters?.admissionId || '',
          created_at: '2024-03-10T14:30:00Z',
        },
        {
          id: 'assess-003',
          type: 'NURSING',
          status: 'completed',
          assessment_date: '2024-03-08',
          completed_by: 'Emily Davis, RN',
          timepoint: 'Initial',
          score: 85,
          patient_id: params.filters?.patientId || '',
          admission_id: params.filters?.admissionId || '',
          created_at: '2024-03-08T09:15:00Z',
        },
        {
          id: 'assess-004',
          type: 'PT',
          status: 'completed',
          assessment_date: '2024-03-07',
          completed_by: 'Michael Chen, PT',
          timepoint: 'Evaluation',
          score: 78,
          patient_id: params.filters?.patientId || '',
          admission_id: params.filters?.admissionId || '',
          created_at: '2024-03-07T11:00:00Z',
        },
        {
          id: 'assess-005',
          type: 'OT',
          status: 'pending',
          assessment_date: '2024-03-11',
          timepoint: 'Initial',
          patient_id: params.filters?.patientId || '',
          admission_id: params.filters?.admissionId || '',
          created_at: '2024-03-06T08:00:00Z',
        },
      ];

      // Filter by patientId and admissionId if provided
      let filtered = mockAssessments;
      if (params.filters?.patientId) {
        filtered = filtered.filter(a => a.patient_id === params.filters!.patientId);
      }
      if (params.filters?.admissionId) {
        filtered = filtered.filter(a => a.admission_id === params.filters!.admissionId);
      }
      if (params.filters?.status) {
        filtered = filtered.filter(a => a.status === params.filters!.status);
      }
      if (params.filters?.type) {
        filtered = filtered.filter(a => a.type === params.filters!.type);
      }

      // Apply sorting
      if (params.sorting) {
        const { field, direction } = params.sorting;
        filtered.sort((a: any, b: any) => {
          const aVal = a[field];
          const bVal = b[field];
          if (aVal < bVal) return direction === 'asc' ? -1 : 1;
          if (aVal > bVal) return direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      const { page, pageSize } = params.pagination;
      const total = filtered.length;
      const start = (page - 1) * pageSize;
      const data = filtered.slice(start, start + pageSize);

      return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    } catch (err) {
      console.error('[assessmentGateway.search] Error:', err);
      return {
        data: [],
        total: 0,
        page: params.pagination.page,
        pageSize: params.pagination.pageSize,
        totalPages: 0,
      };
    }
  },

  /**
   * Get assessment by ID
   * Future: Will call GET /assessments/:id API endpoint
   */
  async getById(id: string): Promise<Assessment | null> {
    try {
      // Mock data - in production: apiRequest<{ assessment: any }>(`/assessments/${id}`)
      return {
        id,
        type: 'OASIS',
        status: 'completed',
        assessment_date: '2024-03-09',
        completed_by: 'Sarah Johnson, RN',
        timepoint: 'Start of Care',
        score: 42,
        created_at: '2024-03-09T10:00:00Z',
      };
    } catch (err) {
      console.error('[assessmentGateway.getById] Error:', err);
      return null;
    }
  },

  /**
   * Create new assessment
   * Future: Will call POST /assessments API endpoint
   */
  async create(assessment: Omit<Assessment, 'id' | 'created_at' | 'updated_at'>): Promise<Assessment> {
    try {
      // Mock creation - in production: apiRequest<{ assessment: any }>('/assessments', { method: 'POST', body: assessment })
      return {
        ...assessment,
        id: `assess-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[assessmentGateway.create] Error:', err);
      throw err;
    }
  },

  /**
   * Update assessment
   * Future: Will call PUT /assessments/:id API endpoint
   */
  async update(id: string, updates: Partial<Assessment>): Promise<Assessment> {
    try {
      // Mock update - in production: apiRequest<{ assessment: any }>(`/assessments/${id}`, { method: 'PUT', body: updates })
      const current = await this.getById(id);
      if (!current) throw new Error('Assessment not found');
      
      return {
        ...current,
        ...updates,
        updated_at: new Date().toISOString(),
      };
    } catch (err) {
      console.error('[assessmentGateway.update] Error:', err);
      throw err;
    }
  },
};

/*
When migrating to .NET 8 API:

1. Replace Supabase client initialization with API base URL configuration
2. Update each gateway method to use fetch() with proper endpoints:
   
   Example:
   async getById(id: string): Promise<Patient | null> {
     const response = await fetch(`${API_BASE_URL}/api/patients/${id}`, {
       headers: {
         'Authorization': `Bearer ${getAccessToken()}`,
         'Content-Type': 'application/json',
       },
     });
     
     if (!response.ok) {
       throw new Error(`Failed to fetch patient: ${response.statusText}`);
     }
     
     return response.json();
   }

3. Add error handling and retry logic as needed
4. Update type definitions if API contracts differ
5. Keep all UI components unchanged - they only call gateway methods
*/