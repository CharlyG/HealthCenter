/**
 * Hospice API Client
 * Abstraction layer for all hospice module data operations.
 * Follows the clinicalApi.ts pattern for consistency.
 */
import { supabase, publicAnonKey, supabaseUrl } from './supabaseClient';

const API_BASE = `${supabaseUrl}/functions/v1/make-server-845bc545/hospice`;

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-User-Token': session?.access_token || '',
    'Content-Type': 'application/json',
  };
}

// ─── Pagination Types ─────────────────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ─── Metrics ──────────────────────────────────────────────────────────────────
export async function fetchHospiceMetrics() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/metrics`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[hospiceApi] Error fetching metrics:', err);
    throw new Error(`Failed to fetch hospice metrics: ${err?.error || response.statusText}`);
  }
  return response.json();
}

// ─── HOPE Patients ────────────────────────────────────────────────────────────
export async function fetchHospicePatients(params?: { search?: string; filter?: string }) {
  const headers = await getHeaders();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.filter) searchParams.set('filter', params.filter);
  const qs = searchParams.toString();
  const response = await fetch(`${API_BASE}/patients${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[hospiceApi] Error fetching patients:', err);
    throw new Error(`Failed to fetch hospice patients: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return data.patients || [];
}

// ─── Paginated HOPE Patients ──────────────────────────────────────────────────
export async function fetchHospicePatientsPaginated(params?: { search?: string; filter?: string } & PaginationParams) {
  const headers = await getHeaders();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.filter) searchParams.set('filter', params.filter);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  const qs = searchParams.toString();
  const response = await fetch(`${API_BASE}/patients-paginated${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[hospiceApi] Error fetching paginated patients:', err);
    throw new Error(`Failed to fetch paginated hospice patients: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return { patients: data.patients || [], pagination: data.pagination as PaginationMeta };
}

export async function updateHospicePatient(id: string, updates: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/patients/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update hospice patient');
  const data = await response.json();
  return data.patient;
}

// ─── Start HOPE Assessment ────────────────────────────────────────────────────
export async function startHOPEAssessment(patientId: string, phase: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/patients/${patientId}/assessments/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ phase }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[hospiceApi] Error starting HOPE assessment:', err);
    throw new Error(`Failed to start HOPE assessment: ${err?.error || response.statusText}`);
  }
  return response.json();
}

// ─── OASIS Records ────────────────────────────────────────────────────────────
export async function fetchOASISRecords(patientId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/oasis/${patientId}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[hospiceApi] Error fetching OASIS records:', err);
    throw new Error(`Failed to fetch OASIS records: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return data.oasisRecords || [];
}

// ─── MD Queue ─────────────────────────────────────────────────────────────────
export async function fetchMDQueue(params?: { search?: string; docType?: string; urgency?: string }) {
  const headers = await getHeaders();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.docType) searchParams.set('docType', params.docType);
  if (params?.urgency) searchParams.set('urgency', params.urgency);
  const qs = searchParams.toString();
  const response = await fetch(`${API_BASE}/md-queue${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[hospiceApi] Error fetching MD queue:', err);
    throw new Error(`Failed to fetch MD queue: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return data.documents || [];
}

// ─── Paginated MD Queue ───────────────────────────────────────────────────────
export async function fetchMDQueuePaginated(params?: { search?: string; docType?: string; urgency?: string } & PaginationParams) {
  const headers = await getHeaders();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.docType) searchParams.set('docType', params.docType);
  if (params?.urgency) searchParams.set('urgency', params.urgency);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  const qs = searchParams.toString();
  const response = await fetch(`${API_BASE}/md-queue-paginated${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch paginated MD queue: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return { documents: data.documents || [], pagination: data.pagination as PaginationMeta };
}

export async function signMDDocument(id: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/md-queue/${id}/sign`, { method: 'PUT', headers });
  if (!response.ok) throw new Error('Failed to sign document');
  const data = await response.json();
  return data.document;
}

export async function batchSignMDDocuments(ids: string[]) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/md-queue/batch-sign`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error('Failed to batch sign documents');
  return response.json();
}

// ─── IDG Meetings ─────────────────────────────────────────────────────────────
export async function fetchIDGMeetings(view?: 'upcoming' | 'all') {
  const headers = await getHeaders();
  const qs = view ? `?view=${view}` : '';
  const response = await fetch(`${API_BASE}/idg${qs}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[hospiceApi] Error fetching IDG meetings:', err);
    throw new Error(`Failed to fetch IDG meetings: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return data.meetings || [];
}

export async function createIDGMeeting(meetingData: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/idg`, {
    method: 'POST',
    headers,
    body: JSON.stringify(meetingData),
  });
  if (!response.ok) throw new Error('Failed to create IDG meeting');
  const data = await response.json();
  return data.meeting;
}

export async function updateIDGMeeting(id: string, updates: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/idg/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update IDG meeting');
  const data = await response.json();
  return data.meeting;
}

export async function fetchIDGPreparation(meetingId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/idg/${meetingId}/preparation`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch IDG preparation: ${err?.error || response.statusText}`);
  }
  return response.json();
}

export async function saveIDGWorkspaceNotes(meetingId: string, patientId: string, workspaceNotes: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/idg/${meetingId}/workspace`, {
    method: 'PUT', headers, body: JSON.stringify({ patientId, workspaceNotes }),
  });
  if (!response.ok) throw new Error('Failed to save workspace notes');
  return response.json();
}

export async function generateIDGSummary(meetingId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/idg/${meetingId}/summary`, {
    method: 'POST', headers,
  });
  if (!response.ok) throw new Error('Failed to generate summary');
  return response.json();
}

// ─── Bereavement ──────────────────────────────────────────────────────────────
export async function fetchBereavementCases(params?: { search?: string; riskLevel?: string }) {
  const headers = await getHeaders();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.riskLevel) searchParams.set('riskLevel', params.riskLevel);
  const qs = searchParams.toString();
  const response = await fetch(`${API_BASE}/bereavement${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[hospiceApi] Error fetching bereavement cases:', err);
    throw new Error(`Failed to fetch bereavement cases: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return data.cases || [];
}

// ─── Paginated Bereavement ────────────────────────────────────────────────────
export async function fetchBereavementCasesPaginated(params?: { search?: string; riskLevel?: string } & PaginationParams) {
  const headers = await getHeaders();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.riskLevel) searchParams.set('riskLevel', params.riskLevel);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  const qs = searchParams.toString();
  const response = await fetch(`${API_BASE}/bereavement-paginated${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch paginated bereavement cases: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return { cases: data.cases || [], pagination: data.pagination as PaginationMeta };
}

export async function completeBereavementTask(caseId: string, taskId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/bereavement/${caseId}/tasks/${taskId}/complete`, {
    method: 'PUT',
    headers,
  });
  if (!response.ok) throw new Error('Failed to complete bereavement task');
  const data = await response.json();
  return data.case;
}

// ─── Volunteers ───────────────────────────────────────────────────────────────
export async function fetchVolunteers(params?: { search?: string; status?: string }) {
  const headers = await getHeaders();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.status) searchParams.set('status', params.status);
  const qs = searchParams.toString();
  const response = await fetch(`${API_BASE}/volunteers${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    console.error('[hospiceApi] Error fetching volunteers:', err);
    throw new Error(`Failed to fetch volunteers: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return data.volunteers || [];
}

// ─── Paginated Volunteers ─────────────────────────────────────────────────────
export async function fetchVolunteersPaginated(params?: { search?: string; status?: string } & PaginationParams) {
  const headers = await getHeaders();
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
  const qs = searchParams.toString();
  const response = await fetch(`${API_BASE}/volunteers-paginated${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch paginated volunteers: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return { volunteers: data.volunteers || [], pagination: data.pagination as PaginationMeta };
}

export async function createVolunteer(volunteerData: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/volunteers`, {
    method: 'POST',
    headers,
    body: JSON.stringify(volunteerData),
  });
  if (!response.ok) throw new Error('Failed to create volunteer');
  const data = await response.json();
  return data.volunteer;
}

export async function updateVolunteer(id: string, updates: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/volunteers/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update volunteer');
  const data = await response.json();
  return data.volunteer;
}

// ─── Create Bereavement Case ──────────────────────────────────────────────────
export async function createBereavementCase(caseData: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/bereavement`, {
    method: 'POST',
    headers,
    body: JSON.stringify(caseData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to create bereavement case: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return data.case;
}

// ─── Log Volunteer Visit ──────────────────────────────────────────────────────
export async function logVolunteerVisit(volunteerId: string, visitData: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/volunteers/${volunteerId}/visits`, {
    method: 'POST',
    headers,
    body: JSON.stringify(visitData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to log volunteer visit: ${err?.error || response.statusText}`);
  }
  const data = await response.json();
  return data;
}