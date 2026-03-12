/**
 * Visit Frequency Management Service
 * 
 * Manages visit frequencies per discipline and tracks compliance with ordered frequencies.
 * 
 * FREQUENCY FORMAT:
 * - "SN 2W4" = Skilled Nursing, 2 visits per week for 4 weeks (8 total visits)
 * - "PT 3W6" = Physical Therapy, 3 visits per week for 6 weeks (18 total visits)
 * - "OT 1W2" = Occupational Therapy, 1 visit per week for 2 weeks (2 total visits)
 * 
 * FEATURES:
 * - Parse frequency codes
 * - Calculate expected visits
 * - Track scheduled and completed visits
 * - Detect mismatches and compliance issues
 * - Generate alerts for under/over-utilization
 */

import type { DisciplineType } from './carePlan';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface VisitFrequency {
  id: string;
  admissionId: string;
  discipline: DisciplineType;
  frequencyCode: string; // e.g., "2W4" (2 times per week for 4 weeks)
  visitsPerWeek: number;
  durationWeeks: number;
  totalExpectedVisits: number;
  startDate: string; // ISO date
  endDate: string; // Calculated from start + duration
  orderedBy: string; // Physician name
  orderedDate: string;
  status: FrequencyStatus;
  renewalDate?: string; // When it needs renewal
  notes?: string;
}

export interface VisitFrequencyTracking {
  frequency: VisitFrequency;
  scheduledVisits: number;
  completedVisits: number;
  missedVisits: number;
  remainingExpectedVisits: number;
  weeksElapsed: number;
  weeksRemaining: number;
  expectedToDate: number; // Expected visits by current date
  complianceStatus: ComplianceStatus;
  compliancePercentage: number;
  variance: number; // Difference between expected and actual
  alerts: FrequencyAlert[];
}

export type FrequencyStatus = 'active' | 'completed' | 'expired' | 'discontinued';

export type ComplianceStatus =
  | 'on-track' // Within expected range
  | 'ahead' // More visits than expected
  | 'behind' // Fewer visits than expected
  | 'critical'; // Significantly behind

export interface FrequencyAlert {
  type: AlertType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  details?: string;
}

export type AlertType =
  | 'under-scheduled' // Not enough scheduled visits
  | 'over-scheduled' // Too many scheduled visits
  | 'behind-schedule' // Behind on completions
  | 'expiring-soon' // Frequency expiring within 1 week
  | 'expired' // Frequency has expired
  | 'needs-renewal' // Approaching end, needs MD order renewal
  | 'missed-visits' // Has missed visits
  | 'over-utilization'; // Exceeded ordered frequency

// ═══════════════════════════════════════════════════════════════════════════
// FREQUENCY PARSER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Parse frequency code (e.g., "2W4" → 2 visits per week for 4 weeks)
 */
export function parseFrequencyCode(code: string): {
  visitsPerWeek: number;
  durationWeeks: number;
  totalVisits: number;
} | null {
  const match = code.match(/^(\d+)W(\d+)$/i);
  if (!match) return null;

  const visitsPerWeek = parseInt(match[1], 10);
  const durationWeeks = parseInt(match[2], 10);
  const totalVisits = visitsPerWeek * durationWeeks;

  return { visitsPerWeek, durationWeeks, totalVisits };
}

/**
 * Format frequency code for display
 */
export function formatFrequencyCode(visitsPerWeek: number, durationWeeks: number): string {
  return `${visitsPerWeek}W${durationWeeks}`;
}

/**
 * Get human-readable frequency description
 */
export function getFrequencyDescription(visitsPerWeek: number, durationWeeks: number): string {
  const visitWord = visitsPerWeek === 1 ? 'visit' : 'visits';
  const weekWord = durationWeeks === 1 ? 'week' : 'weeks';
  return `${visitsPerWeek} ${visitWord} per week for ${durationWeeks} ${weekWord}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate expected visits to date based on elapsed time
 */
export function calculateExpectedToDate(
  frequency: VisitFrequency,
  currentDate: Date = new Date()
): number {
  const start = new Date(frequency.startDate);
  const end = new Date(frequency.endDate);
  const current = currentDate;

  // If before start, expect 0
  if (current < start) return 0;

  // If after end, expect total
  if (current >= end) return frequency.totalExpectedVisits;

  // Calculate weeks elapsed
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const elapsed = current.getTime() - start.getTime();
  const weeksElapsed = elapsed / msPerWeek;

  // Expected = visits per week * weeks elapsed (rounded up)
  return Math.ceil(weeksElapsed * frequency.visitsPerWeek);
}

/**
 * Calculate weeks elapsed and remaining
 */
export function calculateWeeks(
  frequency: VisitFrequency,
  currentDate: Date = new Date()
): { elapsed: number; remaining: number } {
  const start = new Date(frequency.startDate);
  const end = new Date(frequency.endDate);
  const current = currentDate;

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const totalDuration = end.getTime() - start.getTime();
  const totalWeeks = totalDuration / msPerWeek;

  if (current < start) {
    return { elapsed: 0, remaining: totalWeeks };
  }

  if (current >= end) {
    return { elapsed: totalWeeks, remaining: 0 };
  }

  const elapsed = (current.getTime() - start.getTime()) / msPerWeek;
  const remaining = totalWeeks - elapsed;

  return { elapsed, remaining };
}

/**
 * Determine compliance status
 */
export function determineComplianceStatus(
  expectedToDate: number,
  completedVisits: number,
  totalExpected: number
): ComplianceStatus {
  const variance = completedVisits - expectedToDate;
  const percentDifference = expectedToDate > 0 ? (variance / expectedToDate) * 100 : 0;

  // Critical: More than 30% behind
  if (percentDifference < -30) return 'critical';

  // Behind: 10-30% behind
  if (percentDifference < -10) return 'behind';

  // Ahead: More than 10% ahead
  if (percentDifference > 10) return 'ahead';

  // On-track: Within ±10%
  return 'on-track';
}

/**
 * Calculate compliance percentage
 */
export function calculateCompliancePercentage(
  expectedToDate: number,
  completedVisits: number
): number {
  if (expectedToDate === 0) return 100;
  return Math.min(100, Math.round((completedVisits / expectedToDate) * 100));
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT DETECTION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Detect frequency alerts
 */
export function detectFrequencyAlerts(
  tracking: Omit<VisitFrequencyTracking, 'alerts'>
): FrequencyAlert[] {
  const alerts: FrequencyAlert[] = [];
  const { frequency, scheduledVisits, completedVisits, expectedToDate, remainingExpectedVisits, weeksRemaining } = tracking;

  // Expired
  if (frequency.status === 'expired') {
    alerts.push({
      type: 'expired',
      severity: 'critical',
      message: 'Frequency order has expired',
      details: `Ended ${new Date(frequency.endDate).toLocaleDateString()}. Needs new physician order.`,
    });
  }

  // Expiring soon (within 1 week)
  if (frequency.status === 'active' && weeksRemaining <= 1 && weeksRemaining > 0) {
    alerts.push({
      type: 'expiring-soon',
      severity: 'warning',
      message: 'Frequency expiring soon',
      details: `Order expires ${new Date(frequency.endDate).toLocaleDateString()}. Consider renewal if care continuing.`,
    });
  }

  // Needs renewal (within 2 weeks)
  if (frequency.status === 'active' && weeksRemaining <= 2 && weeksRemaining > 0) {
    alerts.push({
      type: 'needs-renewal',
      severity: 'warning',
      message: 'May need frequency renewal',
      details: `Only ${Math.ceil(weeksRemaining)} week(s) remaining on current order.`,
    });
  }

  // Under-scheduled (not enough visits scheduled to meet expected)
  const totalScheduledAndCompleted = scheduledVisits + completedVisits;
  if (totalScheduledAndCompleted < frequency.totalExpectedVisits) {
    const deficit = frequency.totalExpectedVisits - totalScheduledAndCompleted;
    alerts.push({
      type: 'under-scheduled',
      severity: deficit > 3 ? 'critical' : 'warning',
      message: 'Under-scheduled',
      details: `Need to schedule ${deficit} more visit(s) to meet ordered frequency.`,
    });
  }

  // Over-scheduled
  if (totalScheduledAndCompleted > frequency.totalExpectedVisits) {
    const excess = totalScheduledAndCompleted - frequency.totalExpectedVisits;
    alerts.push({
      type: 'over-scheduled',
      severity: 'info',
      message: 'Over-scheduled',
      details: `${excess} more visit(s) scheduled than ordered. Verify MD order allows.`,
    });
  }

  // Behind schedule (completed < expected to date)
  if (tracking.complianceStatus === 'critical' || tracking.complianceStatus === 'behind') {
    const deficit = expectedToDate - completedVisits;
    alerts.push({
      type: 'behind-schedule',
      severity: tracking.complianceStatus === 'critical' ? 'critical' : 'warning',
      message: 'Behind schedule',
      details: `${deficit} visit(s) behind expected pace. Need to catch up.`,
    });
  }

  // Over-utilization (completed > total expected)
  if (completedVisits > frequency.totalExpectedVisits) {
    const excess = completedVisits - frequency.totalExpectedVisits;
    alerts.push({
      type: 'over-utilization',
      severity: 'warning',
      message: 'Over-utilization',
      details: `${excess} more visit(s) completed than ordered. May need new MD order.`,
    });
  }

  // Missed visits
  if (tracking.missedVisits > 0) {
    alerts.push({
      type: 'missed-visits',
      severity: tracking.missedVisits > 2 ? 'critical' : 'warning',
      message: `${tracking.missedVisits} missed visit(s)`,
      details: 'Follow up on reasons and reschedule as appropriate.',
    });
  }

  return alerts;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRACKING SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class VisitFrequencyService {
  /**
   * Create visit frequency tracking data
   */
  static createTracking(
    frequency: VisitFrequency,
    scheduledVisits: number,
    completedVisits: number,
    missedVisits: number = 0,
    currentDate: Date = new Date()
  ): VisitFrequencyTracking {
    const expectedToDate = calculateExpectedToDate(frequency, currentDate);
    const weeks = calculateWeeks(frequency, currentDate);
    const remainingExpectedVisits = Math.max(0, frequency.totalExpectedVisits - completedVisits);
    const complianceStatus = determineComplianceStatus(expectedToDate, completedVisits, frequency.totalExpectedVisits);
    const compliancePercentage = calculateCompliancePercentage(expectedToDate, completedVisits);
    const variance = completedVisits - expectedToDate;

    const tracking: Omit<VisitFrequencyTracking, 'alerts'> = {
      frequency,
      scheduledVisits,
      completedVisits,
      missedVisits,
      remainingExpectedVisits,
      weeksElapsed: weeks.elapsed,
      weeksRemaining: weeks.remaining,
      expectedToDate,
      complianceStatus,
      compliancePercentage,
      variance,
    };

    const alerts = detectFrequencyAlerts(tracking);

    return { ...tracking, alerts };
  }

  /**
   * Update frequency status based on dates
   */
  static updateFrequencyStatus(frequency: VisitFrequency, currentDate: Date = new Date()): FrequencyStatus {
    const end = new Date(frequency.endDate);
    
    if (currentDate > end) {
      return 'expired';
    }

    return frequency.status;
  }

  /**
   * Check if frequency needs attention
   */
  static needsAttention(tracking: VisitFrequencyTracking): boolean {
    return tracking.alerts.some(a => a.severity === 'critical' || a.severity === 'warning');
  }

  /**
   * Get critical alerts only
   */
  static getCriticalAlerts(tracking: VisitFrequencyTracking): FrequencyAlert[] {
    return tracking.alerts.filter(a => a.severity === 'critical');
  }

  /**
   * Calculate overall admission compliance
   */
  static calculateOverallCompliance(trackings: VisitFrequencyTracking[]): {
    overallPercentage: number;
    onTrack: number;
    behind: number;
    critical: number;
    totalAlerts: number;
  } {
    if (trackings.length === 0) {
      return { overallPercentage: 100, onTrack: 0, behind: 0, critical: 0, totalAlerts: 0 };
    }

    const totalExpected = trackings.reduce((sum, t) => sum + t.expectedToDate, 0);
    const totalCompleted = trackings.reduce((sum, t) => sum + t.completedVisits, 0);
    const overallPercentage = calculateCompliancePercentage(totalExpected, totalCompleted);

    const onTrack = trackings.filter(t => t.complianceStatus === 'on-track' || t.complianceStatus === 'ahead').length;
    const behind = trackings.filter(t => t.complianceStatus === 'behind').length;
    const critical = trackings.filter(t => t.complianceStatus === 'critical').length;
    const totalAlerts = trackings.reduce((sum, t) => sum + t.alerts.length, 0);

    return { overallPercentage, onTrack, behind, critical, totalAlerts };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export const MOCK_VISIT_FREQUENCIES: VisitFrequency[] = [
  {
    id: 'freq-001',
    admissionId: 'ADM-12345',
    discipline: 'skilled-nursing',
    frequencyCode: '2W4',
    visitsPerWeek: 2,
    durationWeeks: 4,
    totalExpectedVisits: 8,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
    orderedBy: 'Dr. Michael Chen',
    orderedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'freq-002',
    admissionId: 'ADM-12345',
    discipline: 'physical-therapy',
    frequencyCode: '3W6',
    visitsPerWeek: 3,
    durationWeeks: 6,
    totalExpectedVisits: 18,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), // 4 weeks from now
    orderedBy: 'Dr. Michael Chen',
    orderedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
  {
    id: 'freq-003',
    admissionId: 'ADM-12345',
    discipline: 'occupational-therapy',
    frequencyCode: '2W3',
    visitsPerWeek: 2,
    durationWeeks: 3,
    totalExpectedVisits: 6,
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
    orderedBy: 'Dr. Michael Chen',
    orderedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    notes: 'Focus on ADL training',
  },
  {
    id: 'freq-004',
    admissionId: 'ADM-12345',
    discipline: 'speech-therapy',
    frequencyCode: '1W2',
    visitsPerWeek: 1,
    durationWeeks: 2,
    totalExpectedVisits: 2,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    orderedBy: 'Dr. Michael Chen',
    orderedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
  },
];

// Mock visit counts (would come from actual visit data)
export const MOCK_VISIT_COUNTS: Record<string, { scheduled: number; completed: number; missed: number }> = {
  'freq-001': { scheduled: 2, completed: 3, missed: 1 }, // Behind (expected 4 by now)
  'freq-002': { scheduled: 4, completed: 5, missed: 0 }, // Behind (expected 6 by now)
  'freq-003': { scheduled: 1, completed: 4, missed: 0 }, // On track
  'freq-004': { scheduled: 1, completed: 1, missed: 0 }, // On track
};

/**
 * Get mock tracking data for demo
 */
export function getMockFrequencyTracking(): VisitFrequencyTracking[] {
  return MOCK_VISIT_FREQUENCIES.map(freq => {
    const counts = MOCK_VISIT_COUNTS[freq.id] || { scheduled: 0, completed: 0, missed: 0 };
    return VisitFrequencyService.createTracking(
      freq,
      counts.scheduled,
      counts.completed,
      counts.missed
    );
  });
}
