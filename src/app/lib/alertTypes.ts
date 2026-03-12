/**
 * Alert System Types
 * Shared type definitions for the healthcare alert system.
 * Designed for .NET 8 API migration — all types map cleanly to C# models.
 */

// ─── Severity Levels ────────────────────────────────────────────────────────

export type AlertSeverity = 'critical' | 'high' | 'warning' | 'info';

// ─── Alert Categories ───────────────────────────────────────────────────────

export type AlertCategory =
  | 'authorization'
  | 'visit'
  | 'evv'
  | 'claims'
  | 'admission'
  | 'assessment'
  | 'documentation'
  | 'referral'
  | 'patient'
  | 'compliance'
  | 'system';

// ─── Alert Status ───────────────────────────────────────────────────────────

export type AlertStatus = 'open' | 'acknowledged' | 'resolved' | 'dismissed';

// ─── Quick Action ───────────────────────────────────────────────────────────

export interface AlertQuickAction {
  label: string;
  /** Route to navigate to when quick action is clicked */
  route?: string;
  /** Action type for programmatic handling */
  actionType?: string;
  /** Additional data for the action */
  payload?: Record<string, any>;
}

// ─── Clinical Alert ─────────────────────────────────────────────────────────

export interface ClinicalAlert {
  id: string;
  /** Severity determines visual treatment and sort priority */
  severity: AlertSeverity;
  /** Category groups alerts by module */
  category: AlertCategory;
  /** Short title for the alert */
  title: string;
  /** Detailed explanation of what triggered the alert */
  explanation: string;
  /** Recommended action to resolve the alert */
  suggestedResolution: string;
  /** Optional quick action button config */
  quickAction?: AlertQuickAction;
  /** Current status */
  status: AlertStatus;
  /** Associated patient ID (if patient-specific) */
  patientId?: string;
  /** Patient display name */
  patientName?: string;
  /** Patient MRN */
  patientMrn?: string;
  /** Related entity (visit, admission, claim, etc.) */
  relatedEntityId?: string;
  relatedEntityType?: string;
  /** Office scope */
  officeId?: string;
  /** User who should see this alert (null = all) */
  assignedToUserId?: string;
  /** Module that generated this alert */
  sourceModule?: string;
  /** When the alert was created */
  createdAt: string;
  /** When the alert was last updated */
  updatedAt: string;
  /** When the alert was acknowledged */
  acknowledgedAt?: string;
  /** Who acknowledged it */
  acknowledgedBy?: string;
  /** When the alert was resolved */
  resolvedAt?: string;
  /** Who resolved it */
  resolvedBy?: string;
  /** When the alert expires (auto-dismiss) */
  expiresAt?: string;
  /** Priority within same severity for sorting (lower = higher priority) */
  sortOrder?: number;
}

// ─── Alert Counts ───────────────────────────────────────────────────────────

export interface AlertCounts {
  total: number;
  critical: number;
  high: number;
  warning: number;
  info: number;
  open: number;
  acknowledged: number;
}

// ─── Alert Filters ──────────────────────────────────────────────────────────

export interface AlertFilters {
  severity?: AlertSeverity | 'all';
  category?: AlertCategory | 'all';
  status?: AlertStatus | 'all';
  patientId?: string;
  officeId?: string;
  sourceModule?: string;
}

// ─── Severity sort order (for prioritized display) ──────────────────────────

export const SEVERITY_SORT_ORDER: Record<AlertSeverity, number> = {
  critical: 0,
  high: 1,
  warning: 2,
  info: 3,
};

// ─── Category display names ─────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<AlertCategory, string> = {
  authorization: 'Authorization',
  visit: 'Visit',
  evv: 'EVV',
  claims: 'Claims',
  admission: 'Admission',
  assessment: 'Assessment',
  documentation: 'Documentation',
  referral: 'Referral',
  patient: 'Patient',
  compliance: 'Compliance',
  system: 'System',
};

// ─── Helper: compute counts from alert array ────────────────────────────────

export function computeAlertCounts(alerts: ClinicalAlert[]): AlertCounts {
  const counts: AlertCounts = {
    total: 0,
    critical: 0,
    high: 0,
    warning: 0,
    info: 0,
    open: 0,
    acknowledged: 0,
  };
  for (const alert of alerts) {
    if (alert.status === 'resolved' || alert.status === 'dismissed') continue;
    counts.total++;
    counts[alert.severity]++;
    if (alert.status === 'open') counts.open++;
    if (alert.status === 'acknowledged') counts.acknowledged++;
  }
  return counts;
}

// ─── Helper: sort alerts by priority ────────────────────────────────────────

export function sortAlertsByPriority(alerts: ClinicalAlert[]): ClinicalAlert[] {
  return [...alerts].sort((a, b) => {
    // Status: open > acknowledged > resolved > dismissed
    const statusOrder: Record<AlertStatus, number> = { open: 0, acknowledged: 1, resolved: 2, dismissed: 3 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    // Severity
    const sevDiff = SEVERITY_SORT_ORDER[a.severity] - SEVERITY_SORT_ORDER[b.severity];
    if (sevDiff !== 0) return sevDiff;
    // Sort order
    if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
      const orderDiff = a.sortOrder - b.sortOrder;
      if (orderDiff !== 0) return orderDiff;
    }
    // Newest first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
