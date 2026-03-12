import { supabase, publicAnonKey, supabaseUrl } from './supabaseClient';

const API_BASE = `${supabaseUrl}/functions/v1/make-server-845bc545/clinical`;

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-User-Token': session?.access_token || '',
    'Content-Type': 'application/json',
  };
}

export async function fetchVisitNotes() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/visit-notes`, { headers });
  if (!response.ok) throw new Error('Failed to fetch visit notes');
  const data = await response.json();
  return data.visitNotes || [];
}

export async function fetchPlansOfCare() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/plans-of-care`, { headers });
  if (!response.ok) throw new Error('Failed to fetch plans of care');
  const data = await response.json();
  return data.plansOfCare || [];
}

export async function fetchVerbalOrders() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/verbal-orders`, { headers });
  if (!response.ok) throw new Error('Failed to fetch verbal orders');
  const data = await response.json();
  return data.verbalOrders || [];
}

export async function fetchQADocuments() {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/qa-documents`, { headers });
  if (!response.ok) throw new Error('Failed to fetch QA documents');
  const data = await response.json();
  return data.qaDocuments || [];
}
