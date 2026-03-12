/**
 * Caregiver Management Types
 * 
 * Complete type definitions for discipline management, availability,
 * documents, training, workload monitoring, and activity tracking.
 */

import type { DisciplineType } from './caregiverTypes';

// ═══════════════════════════════════════════════════════════════════════════
// DISCIPLINE & ROLE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export interface CaregiverDiscipline {
  discipline: DisciplineType;
  isPrimary: boolean;
  certifiedDate: string;
  specializations: string[];
  yearsExperience: number;
}

export interface DisciplineValidation {
  isValid: boolean;
  hasRequiredCredentials: boolean;
  hasRequiredTraining: boolean;
  missingRequirements: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// AVAILABILITY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export interface DayAvailability {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  isAvailable: boolean;
  startTime: string; // HH:mm format
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  maxVisits?: number;
}

export interface GeographicPreference {
  zipCode?: string;
  city?: string;
  territory?: string;
  travelRadiusMiles: number;
}

export interface CaregiverAvailability {
  caregiverId: string;
  weeklySchedule: DayAvailability[];
  maxVisitsPerDay: number;
  maxVisitsPerWeek: number;
  preferredGeographicAreas: GeographicPreference[];
  restrictions: string[];
  notes?: string;
  effectiveDate: string;
  lastUpdated: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT LIBRARY
// ═══════════════════════════════════════════════════════════════════════════

export type DocumentCategory =
  | 'credential'
  | 'training'
  | 'employment'
  | 'background-check'
  | 'other';

export type DocumentStatus = 'active' | 'expired' | 'expiring-soon' | 'archived';

export interface CaregiverDocument {
  id: string;
  caregiverId: string;
  documentName: string;
  documentType: string;
  category: DocumentCategory;
  uploadDate: string;
  uploadedBy: string;
  expirationDate?: string;
  status: DocumentStatus;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  previewUrl?: string;
  tags: string[];
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// TRAINING & CERTIFICATION TRACKING
// ═══════════════════════════════════════════════════════════════════════════

export type TrainingCategory =
  | 'infection-control'
  | 'hipaa'
  | 'clinical-protocol'
  | 'safety'
  | 'compliance'
  | 'continuing-education';

export type TrainingStatus =
  | 'completed'
  | 'overdue'
  | 'expiring-soon'
  | 'in-progress'
  | 'required';

export interface TrainingRecord {
  id: string;
  caregiverId: string;
  trainingName: string;
  category: TrainingCategory;
  completionDate?: string;
  expirationDate?: string;
  status: TrainingStatus;
  provider: string;
  hours?: number;
  certificateUrl?: string;
  required: boolean;
  notes?: string;
}

export interface TrainingAlert {
  trainingId: string;
  caregiverId: string;
  caregiverName: string;
  trainingName: string;
  alertType: 'overdue' | 'expiring-soon';
  daysOverdue?: number;
  daysUntilExpiration?: number;
  expirationDate?: string;
  severity: 'critical' | 'high' | 'medium';
}

// ═══════════════════════════════════════════════════════════════════════════
// SCHEDULING VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export interface SchedulingValidationResult {
  canBeAssigned: boolean;
  disciplineMatch: boolean;
  credentialValid: boolean;
  trainingCurrent: boolean;
  availabilityMatch: boolean;
  workloadCapacity: boolean;
  warnings: SchedulingWarning[];
  blockers: SchedulingBlocker[];
}

export interface SchedulingWarning {
  type: 'expiring-credential' | 'expiring-training' | 'high-workload' | 'geographic-distance';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SchedulingBlocker {
  type: 'invalid-discipline' | 'expired-credential' | 'missing-training' | 'unavailable' | 'max-capacity';
  message: string;
  requirement?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKLOAD MONITORING
// ═══════════════════════════════════════════════════════════════════════════

export interface WorkloadMetrics {
  caregiverId: string;
  caregiverName: string;
  currentWeek: {
    scheduledVisits: number;
    completedVisits: number;
    cancelledVisits: number;
    averageVisitsPerDay: number;
    totalHours: number;
    totalMileage: number;
  };
  monthToDate: {
    scheduledVisits: number;
    completedVisits: number;
    averageVisitsPerWeek: number;
    totalHours: number;
  };
  utilizationRate: number; // 0-100
  workloadStatus: 'underutilized' | 'optimal' | 'high' | 'overloaded';
  burnoutRisk: 'low' | 'medium' | 'high';
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface WorkloadAlert {
  caregiverId: string;
  caregiverName: string;
  alertType: 'overloaded' | 'underutilized' | 'burnout-risk' | 'excessive-travel';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  metrics: {
    current: number;
    threshold: number;
    unit: string;
  };
  recommendations: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTIVITY TIMELINE
// ═══════════════════════════════════════════════════════════════════════════

export type ActivityType =
  | 'visit-completed'
  | 'visit-scheduled'
  | 'visit-cancelled'
  | 'documentation-submitted'
  | 'training-completed'
  | 'credential-updated'
  | 'credential-expired'
  | 'schedule-changed'
  | 'profile-updated'
  | 'alert-generated';

export interface CaregiverActivity {
  id: string;
  caregiverId: string;
  activityType: ActivityType;
  timestamp: string;
  title: string;
  description: string;
  relatedEntityId?: string; // visitId, documentId, etc.
  relatedEntityType?: string;
  metadata?: Record<string, any>;
  performedBy?: string;
  icon?: string;
  color?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE CAREGIVER MANAGEMENT DATA
// ═══════════════════════════════════════════════════════════════════════════

export interface CaregiverManagementData {
  caregiverId: string;
  caregiverName: string;
  disciplines: CaregiverDiscipline[];
  availability: CaregiverAvailability;
  documents: CaregiverDocument[];
  training: TrainingRecord[];
  workload: WorkloadMetrics;
  activities: CaregiverActivity[];
  validationStatus: SchedulingValidationResult;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const TRAINING_CATEGORY_CONFIG: Record<
  TrainingCategory,
  { label: string; color: string; icon: string; requiredFrequencyMonths: number }
> = {
  'infection-control': {
    label: 'Infection Control',
    color: 'red',
    icon: '🦠',
    requiredFrequencyMonths: 12,
  },
  hipaa: {
    label: 'HIPAA Compliance',
    color: 'purple',
    icon: '🔒',
    requiredFrequencyMonths: 12,
  },
  'clinical-protocol': {
    label: 'Clinical Protocol',
    color: 'blue',
    icon: '⚕️',
    requiredFrequencyMonths: 12,
  },
  safety: {
    label: 'Safety Training',
    color: 'amber',
    icon: '⚠️',
    requiredFrequencyMonths: 12,
  },
  compliance: {
    label: 'Compliance',
    color: 'green',
    icon: '✓',
    requiredFrequencyMonths: 12,
  },
  'continuing-education': {
    label: 'Continuing Education',
    color: 'teal',
    icon: '📚',
    requiredFrequencyMonths: 24,
  },
};

export const WORKLOAD_THRESHOLDS = {
  optimalVisitsPerDay: { min: 4, max: 7 },
  maxVisitsPerDay: 9,
  maxHoursPerWeek: 40,
  maxMilesPerDay: 100,
  utilizationRate: {
    underutilized: 60,
    optimal: 80,
    high: 90,
    overloaded: 100,
  },
};

export const ACTIVITY_TYPE_CONFIG: Record<
  ActivityType,
  { label: string; icon: string; color: string }
> = {
  'visit-completed': { label: 'Visit Completed', icon: '✓', color: 'green' },
  'visit-scheduled': { label: 'Visit Scheduled', icon: '📅', color: 'blue' },
  'visit-cancelled': { label: 'Visit Cancelled', icon: '✕', color: 'red' },
  'documentation-submitted': { label: 'Documentation Submitted', icon: '📄', color: 'purple' },
  'training-completed': { label: 'Training Completed', icon: '🎓', color: 'teal' },
  'credential-updated': { label: 'Credential Updated', icon: '🏥', color: 'blue' },
  'credential-expired': { label: 'Credential Expired', icon: '⚠️', color: 'red' },
  'schedule-changed': { label: 'Schedule Changed', icon: '🔄', color: 'amber' },
  'profile-updated': { label: 'Profile Updated', icon: '👤', color: 'gray' },
  'alert-generated': { label: 'Alert Generated', icon: '🔔', color: 'orange' },
};
