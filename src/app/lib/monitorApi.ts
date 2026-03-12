import { supabase, publicAnonKey, supabaseUrl } from './supabaseClient';

const API_BASE = `${supabaseUrl}/functions/v1/make-server-845bc545/monitor`;

async function getHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${publicAnonKey}`,
    'X-User-Token': session?.access_token || '',
    'Content-Type': 'application/json',
  };
}

export interface MonitorAlert {
  id: string;
  type: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'acknowledged' | 'resolved';
  title: string;
  description: string;
  patientName: string | null;
  patientMrn: string | null;
  clinician: string | null;
  visitDate: string | null;
  createdAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
}

export interface ComplianceRecord {
  id: string;
  category: string;
  metric: string;
  current: number;
  target: number;
  trend: 'improving' | 'stable' | 'declining';
  period: string;
  details: string;
}

export interface QualitySnapshot {
  id: string;
  week: string;
  docTimeliness: number;
  evvRate: number;
  oasisTimeliness: number;
  ordersSigned: number;
  visitUtil: number;
}

export interface MonitorSummary {
  totalAlerts: number;
  openAlerts: number;
  highSeverityOpen: number;
  acknowledgedAlerts: number;
  resolvedAlerts: number;
  avgCompliance: number;
  complianceMetrics: number;
  belowTarget: number;
}

export async function fetchMonitorSummary(): Promise<MonitorSummary> {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/summary`, { headers });
  if (!response.ok) throw new Error('Failed to fetch monitor summary');
  const data = await response.json();
  return data.summary;
}

export async function fetchAlerts(filters?: {
  severity?: string;
  status?: string;
  type?: string;
}): Promise<MonitorAlert[]> {
  const headers = await getHeaders();
  const params = new URLSearchParams();
  if (filters?.severity) params.set('severity', filters.severity);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.type) params.set('type', filters.type);
  const url = `${API_BASE}/alerts${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error('Failed to fetch alerts');
  const data = await response.json();
  return data.alerts || [];
}

export async function updateAlert(
  id: string,
  updates: Partial<MonitorAlert>
): Promise<MonitorAlert> {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/alerts/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update alert');
  const data = await response.json();
  return data.alert;
}

export async function fetchCompliance(): Promise<ComplianceRecord[]> {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/compliance`, { headers });
  if (!response.ok) throw new Error('Failed to fetch compliance records');
  const data = await response.json();
  return data.compliance || [];
}

export async function fetchQualityTrends(): Promise<QualitySnapshot[]> {
  const headers = await getHeaders();
  const response = await fetch(`${API_BASE}/quality-trends`, { headers });
  if (!response.ok) throw new Error('Failed to fetch quality trends');
  const data = await response.json();
  return data.trends || [];
}
