/**
 * MonitorTypes — Shared types for the PointOfCare Monitor & EVV Resolution Center.
 */

export type VisitStatus = 'scheduled' | 'in_progress' | 'completed' | 'missing_clock_out' | 'missed' | 'cancelled';
export type EvvStatus = 'pending' | 'clocked_in' | 'transmitted' | 'evv_error' | 'verified' | 'exception';
export type DocStatus = 'n/a' | 'pending' | 'in_progress' | 'completed';
export type ConflictType = 'missing_clock_out' | 'overlapping_visits' | 'unscheduled_visit' | 'authorization_conflict';

export interface MonitorVisit {
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
  status: VisitStatus;
  evvStatus: EvvStatus;
  docStatus: DocStatus;
  conflicts: ConflictType[];
  authorizationRemaining?: number;
  notes?: string;
}

export interface EvvError {
  id: string;
  visit: MonitorVisit;
  errorCode: string;
  errorDescription: string;
  suggestedFix: string;
  severity: 'high' | 'medium' | 'low';
  occurredAt: string;
  retryCount: number;
}

export interface ConflictItem {
  id: string;
  type: ConflictType;
  severity: 'critical' | 'warning' | 'info';
  description: string;
  visits: MonitorVisit[];
  suggestedAction: string;
}

export interface MonitorMetrics {
  totalVisits: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  missingClockOut: number;
  evvTransmitted: number;
  evvErrors: number;
  conflictCount: number;
  complianceRate: number;
}

// ─── Status Config Maps ────────────────────────────────────────────────────

export const VISIT_STATUS_CONFIG: Record<VisitStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  scheduled: { label: 'Scheduled', color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  missing_clock_out: { label: 'Missing Clock Out', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500 animate-pulse' },
  missed: { label: 'Missed', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', dot: 'bg-orange-500' },
  cancelled: { label: 'Cancelled', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
};

export const EVV_STATUS_CONFIG: Record<EvvStatus, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending: { label: 'Pending', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400' },
  clocked_in: { label: 'Clocked In', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
  transmitted: { label: 'Transmitted', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  evv_error: { label: 'EVV Error', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
  verified: { label: 'Verified', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  exception: { label: 'Exception', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
};

export const DOC_STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string }> = {
  'n/a': { label: 'N/A', color: 'text-gray-400', bg: 'bg-gray-50' },
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
  in_progress: { label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50' },
};

export const CONFLICT_CONFIG: Record<ConflictType, { label: string; icon: string; color: string; bg: string; border: string }> = {
  missing_clock_out: { label: 'Missing Clock Out', icon: 'clock', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
  overlapping_visits: { label: 'Overlapping Visits', icon: 'layers', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
  unscheduled_visit: { label: 'Unscheduled Visit', icon: 'alert', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
  authorization_conflict: { label: 'Auth Conflict', icon: 'shield', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-300' },
};
