/**
 * Billing API Client
 * Abstraction layer for billing module data operations.
 * Falls back to mock data when server is unavailable.
 */
import { supabase, publicAnonKey, supabaseUrl } from './supabaseClient';

const API_BASE = `${supabaseUrl}/functions/v1/make-server-845bc545/billing`;
const USE_MOCK_DATA = false; // Server is now available with demo auth

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-User-Token': session?.access_token || '',
    'Content-Type': 'application/json',
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Mock Data Helpers ────────────────────────────────────────────────────────
function getMockBillingMetrics() {
  return {
    totalRevenue: 1245380,
    pendingClaims: 47,
    claimAcceptanceRate: 94.3,
    averageDaysToPayment: 18,
    denialRate: 5.7,
    collectionsRate: 92.1,
  };
}

function getMockBillingQueues() {
  return {
    items: [],
    pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 }
  };
}

function getMockClaims() {
  return {
    claims: [],
    pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 }
  };
}

// ─── Metrics ──────────────────────────────────────────────────────────────────
export async function fetchBillingMetrics() {
  if (USE_MOCK_DATA) {
    console.log('[billingApi] Using mock data for metrics');
    return getMockBillingMetrics();
  }

  try {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE}/metrics`, { headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.warn('[billingApi] Metrics error, falling back to mock:', err);
      return getMockBillingMetrics();
    }
    return response.json();
  } catch (error) {
    console.warn('[billingApi] Metrics fetch failed, using mock data:', error);
    return getMockBillingMetrics();
  }
}

// ─── Queues ───────────────────────────────────────────────────────────────────
export async function fetchBillingQueues(params?: { search?: string; queueType?: string; page?: number; pageSize?: number }) {
  if (USE_MOCK_DATA) {
    console.log('[billingApi] Using mock data for queues');
    return getMockBillingQueues();
  }

  try {
    const headers = await getHeaders();
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.queueType) sp.set('queueType', params.queueType);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
    const qs = sp.toString();
    const response = await fetch(`${API_BASE}/queues${qs ? `?${qs}` : ''}`, { headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch billing queues: ${err?.error || response.statusText}`);
    }
    const data = await response.json();
    return { items: data.items || [], pagination: data.pagination as PaginationMeta };
  } catch (error) {
    console.warn('[billingApi] Queues fetch failed, using mock data:', error);
    return getMockBillingQueues();
  }
}

export async function generateClaim(queueItemId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/queues/${queueItemId}/generate`, { method: 'POST', headers });
  if (!response.ok) throw new Error('Failed to generate claim');
  return response.json();
}

export async function generateAllClaims() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/queues/generate-all`, { method: 'POST', headers });
  if (!response.ok) throw new Error('Failed to generate all claims');
  return response.json();
}

// ─── Pre-Billing QA ──────────────────────────────────────────────────────────
export async function fetchPreBillingQA(params?: { search?: string; status?: string }) {
  if (USE_MOCK_DATA) {
    console.log('[billingApi] Using mock data for Pre-Billing QA');
    return [];
  }

  try {
    const headers = await getHeaders();
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.status) sp.set('status', params.status);
    const qs = sp.toString();
    const response = await fetch(`${API_BASE}/qa${qs ? `?${qs}` : ''}`, { headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch QA records: ${err?.error || response.statusText}`);
    }
    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.warn('[billingApi] Pre-Billing QA fetch failed, using mock data:', error);
    return [];
  }
}

export async function moveQAToClaims(qaId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/qa/${qaId}/move-to-claims`, { method: 'POST', headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to move to claims: ${err?.error || response.statusText}`);
  }
  return response.json();
}

// ─── Claims ───────────────────────────────────────────────────────────────────
export async function fetchClaims(params?: { search?: string; status?: string; payer?: string; page?: number; pageSize?: number }) {
  if (USE_MOCK_DATA) {
    console.log('[billingApi] Using mock data for claims');
    return getMockClaims();
  }

  try {
    const headers = await getHeaders();
    const sp = new URLSearchParams();
    if (params?.search) sp.set('search', params.search);
    if (params?.status) sp.set('status', params.status);
    if (params?.payer) sp.set('payer', params.payer);
    if (params?.page) sp.set('page', String(params.page));
    if (params?.pageSize) sp.set('pageSize', String(params.pageSize));
    const qs = sp.toString();
    const response = await fetch(`${API_BASE}/claims${qs ? `?${qs}` : ''}`, { headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Failed to fetch claims: ${err?.error || response.statusText}`);
    }
    const data = await response.json();
    return { claims: data.claims || [], pagination: data.pagination as PaginationMeta };
  } catch (error) {
    console.warn('[billingApi] Claims fetch failed, using mock data:', error);
    return getMockClaims();
  }
}

export async function submitClaim(claimId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/claims/${claimId}/submit`, { method: 'PUT', headers });
  if (!response.ok) throw new Error('Failed to submit claim');
  return response.json();
}

export async function voidClaim(claimId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/claims/${claimId}/void`, { method: 'PUT', headers });
  if (!response.ok) throw new Error('Failed to void claim');
  return response.json();
}

export async function batchSubmitClaims(ids: string[]) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/claims/batch-submit`, { method: 'POST', headers, body: JSON.stringify({ ids }) });
  if (!response.ok) throw new Error('Failed to batch submit claims');
  return response.json();
}

// ─── Remittance ───────────────────────────────────────────────────────────────
export async function fetchRemittanceFiles() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/remittance/files`, { headers });
  if (!response.ok) throw new Error('Failed to fetch remittance files');
  const data = await response.json();
  return data.files || [];
}

export async function fetchRemittanceTransactions(params?: { fileId?: string; search?: string }) {
  const headers = await getHeaders();
  const sp = new URLSearchParams();
  if (params?.fileId) sp.set('fileId', params.fileId);
  if (params?.search) sp.set('search', params.search);
  const qs = sp.toString();
  const response = await fetch(`${API_BASE}/remittance/transactions${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) throw new Error('Failed to fetch transactions');
  const data = await response.json();
  return data.transactions || [];
}

export async function matchTransaction(txnId: string, claimId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/remittance/transactions/${txnId}/match`, {
    method: 'PUT', headers, body: JSON.stringify({ claimId }),
  });
  if (!response.ok) throw new Error('Failed to match transaction');
  return response.json();
}

// ─── A/R Aging ────────────────────────────────────────────────────────────────
export async function fetchARAgingReport() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/ar-aging`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch A/R aging: ${err?.error || response.statusText}`);
  }
  return response.json();
}

// ─── Denial Management ───────────────────────────────────────────────────────
export async function fetchDenials(params?: { search?: string; status?: string; category?: string }) {
  const headers = await getHeaders();
  const sp = new URLSearchParams();
  if (params?.search) sp.set('search', params.search);
  if (params?.status) sp.set('status', params.status);
  if (params?.category) sp.set('category', params.category);
  const qs = sp.toString();
  const response = await fetch(`${API_BASE}/denials${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch denials: ${err?.error || response.statusText}`);
  }
  return response.json();
}

export async function updateDenial(denialId: string, data: Record<string, any>) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/denials/${denialId}`, {
    method: 'PUT', headers, body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update denial');
  return response.json();
}

// ─── Eligibility Verification ─────────────────────────────────────────────────
export async function fetchEligibility(params?: { search?: string; status?: string }) {
  const headers = await getHeaders();
  const sp = new URLSearchParams();
  if (params?.search) sp.set('search', params.search);
  if (params?.status) sp.set('status', params.status);
  const qs = sp.toString();
  const response = await fetch(`${API_BASE}/eligibility${qs ? `?${qs}` : ''}`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch eligibility: ${err?.error || response.statusText}`);
  }
  return response.json();
}

export async function verifyEligibility(recordId: string) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/eligibility/${recordId}/verify`, {
    method: 'POST', headers,
  });
  if (!response.ok) throw new Error('Failed to verify eligibility');
  return response.json();
}

export async function verifyAllEligibility() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/eligibility/verify-all`, {
    method: 'POST', headers,
  });
  if (!response.ok) throw new Error('Failed to verify all eligibility');
  return response.json();
}

// ─── Denial Prevention Engine ─────────────────────────────────────────────────
export async function fetchDenialPrevention() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/denial-prevention`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch denial prevention: ${err?.error || response.statusText}`);
  }
  return response.json();
}

// ─── Payment Variance Report ──────────────────────────────────────────────────
export async function fetchPaymentVariance() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/payment-variance`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch payment variance: ${err?.error || response.statusText}`);
  }
  return response.json();
}

// ─── Payer Contract Management ────────────────────────────────────────────────
export async function fetchContracts() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/contracts`, { headers });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Failed to fetch contracts: ${err?.error || response.statusText}`);
  }
  return response.json();
}

export async function updateContract(contractId: string, data: Record<string, any>) {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/contracts/${contractId}`, {
    method: 'PUT', headers, body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update contract');
  return response.json();
}