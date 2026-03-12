/**
 * Payer Integration API Client
 * Abstraction layer for payer-related API calls
 */
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-845bc545`;

async function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${publicAnonKey}`,
  };
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export async function fetchPayerDashboardStats() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payer/dashboard`, { headers });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch dashboard stats');
  }
  return response.json();
}

// ─── Eligibility Verification ─────────────────────────────────────────────

export async function verifyEligibilityReal(request: {
  patientId?: string;
  patientName: string;
  dateOfBirth: string;
  payer: string;
  memberId: string;
  serviceDate?: string;
}) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payer/eligibility/verify`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to verify eligibility');
  }
  return response.json();
}

// ─── Authorizations ────────────────────────────────────────────────────────

export async function fetchAuthorizations(params?: {
  status?: string;
  search?: string;
}) {
  const headers = await getHeaders();
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  if (params?.search) sp.set('search', params.search);
  
  const response = await fetch(`${API_BASE}/payer/authorizations?${sp}`, { headers });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch authorizations');
  }
  return response.json();
}

export async function createAuthorization(data: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payer/authorizations`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to create authorization');
  }
  return response.json();
}

export async function updateAuthorizationStatus(id: string, status: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payer/authorizations/${id}/status`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to update authorization');
  }
  return response.json();
}

// ─── Claim Status ──────────────────────────────────────────────────────────

export async function fetchClaimStatus(params?: {
  claimNumber?: string;
  search?: string;
}) {
  const headers = await getHeaders();
  const sp = new URLSearchParams();
  if (params?.claimNumber) sp.set('claimNumber', params.claimNumber);
  if (params?.search) sp.set('search', params.search);
  
  const response = await fetch(`${API_BASE}/payer/claims/status?${sp}`, { headers });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch claim status');
  }
  return response.json();
}

export async function pollClaimStatus(claimNumbers: string[]) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payer/claims/poll`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ claimNumbers }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to poll claim status');
  }
  return response.json();
}

// ─── ERA Processing ────────────────────────────────────────────────────────

export async function fetchERAFiles(params?: { status?: string }) {
  const headers = await getHeaders();
  const sp = new URLSearchParams();
  if (params?.status) sp.set('status', params.status);
  
  const response = await fetch(`${API_BASE}/payer/era?${sp}`, { headers });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch ERA files');
  }
  return response.json();
}

export async function uploadERAFile(file: File) {
  const headers = await getHeaders();
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/payer/era/upload`, {
    method: 'POST',
    headers: {
      'Authorization': headers.Authorization,
    },
    body: formData,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to upload ERA file');
  }
  return response.json();
}

export async function processERAFile(fileId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payer/era/${fileId}/process`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to process ERA file');
  }
  return response.json();
}

// ─── Payer Configuration ───────────────────────────────────────────────────

export async function fetchPayerConfig() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payer/config`, { headers });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to fetch payer configuration');
  }
  return response.json();
}

export async function savePayerConfig(config: any) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payer/config`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(config),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to save payer configuration');
  }
  return response.json();
}

export async function testPayerConnection() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payer/config/test`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Failed to test connection');
  }
  return response.json();
}