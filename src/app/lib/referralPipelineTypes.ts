/**
 * Referral Intake Pipeline Types
 * Kanban-style workflow model for managing referral intake stages.
 * Designed for .NET 8 API migration.
 */

// ─── Pipeline Stages ───────────────────────────────────────────────────────

export const PIPELINE_STAGES = [
  'new_referral',
  'insurance_verification',
  'clinical_review',
  'admission_scheduled',
  'admitted',
  'rejected',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export interface PipelineStageConfig {
  id: PipelineStage;
  label: string;
  shortLabel: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconBg: string;
  description: string;
}

export const STAGE_CONFIGS: PipelineStageConfig[] = [
  {
    id: 'new_referral',
    label: 'New Referral',
    shortLabel: 'New',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-100',
    description: 'Newly received referrals awaiting initial triage',
  },
  {
    id: 'insurance_verification',
    label: 'Insurance Verification',
    shortLabel: 'Insurance',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-100',
    description: 'Verifying insurance coverage and obtaining authorization',
  },
  {
    id: 'clinical_review',
    label: 'Clinical Review',
    shortLabel: 'Clinical',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    iconBg: 'bg-purple-100',
    description: 'Clinical assessment of patient needs and eligibility',
  },
  {
    id: 'admission_scheduled',
    label: 'Admission Scheduled',
    shortLabel: 'Scheduled',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    iconBg: 'bg-teal-100',
    description: 'Start of care date confirmed and admission scheduled',
  },
  {
    id: 'admitted',
    label: 'Admitted',
    shortLabel: 'Admitted',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    description: 'Patient has been admitted and is receiving services',
  },
  {
    id: 'rejected',
    label: 'Rejected',
    shortLabel: 'Rejected',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-100',
    description: 'Referral denied or not eligible for admission',
  },
];

export function getStageConfig(stage: PipelineStage): PipelineStageConfig {
  return STAGE_CONFIGS.find((s) => s.id === stage) || STAGE_CONFIGS[0];
}

// ─── Urgency Levels ────────────────────────────────────────────────────────

export type ReferralUrgency = 'routine' | 'urgent' | 'stat';

export function getUrgencyConfig(urgency: ReferralUrgency) {
  switch (urgency) {
    case 'stat':
      return { label: 'STAT', bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500' };
    case 'urgent':
      return { label: 'Urgent', bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300', dot: 'bg-orange-500' };
    case 'routine':
    default:
      return { label: 'Routine', bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', dot: 'bg-gray-400' };
  }
}

// ─── Referral Source ───────────────────────────────────────────────────────

export type ReferralSource =
  | 'hospital_discharge'
  | 'physician_office'
  | 'skilled_nursing'
  | 'self_referral'
  | 'insurance_plan'
  | 'other';

// ─── Service Type ──────────────────────────────────────────────────────────

export type ServiceType =
  | 'skilled_nursing'
  | 'physical_therapy'
  | 'occupational_therapy'
  | 'speech_therapy'
  | 'medical_social_work'
  | 'home_health_aide'
  | 'hospice';

// ─── Referral Model ────────────────────────────────────────────────────────

export interface Referral {
  id: string;
  /** Current pipeline stage */
  stage: PipelineStage;
  /** Position within the stage column (for ordering) */
  stageOrder: number;

  // Patient info
  patientFirstName: string;
  patientLastName: string;
  patientDob: string;
  patientPhone: string;
  patientAddress: string;

  // Referral details
  referralDate: string;
  urgency: ReferralUrgency;
  source: ReferralSource;
  sourceDetails: string;
  referringPhysician: string;
  referringPhysicianNpi: string;

  // Clinical
  primaryDiagnosis: string;
  primaryDiagnosisIcd: string;
  secondaryDiagnoses: string[];
  requestedServices: ServiceType[];
  clinicalNotes: string;

  // Insurance
  insurancePlan: string;
  insuranceId: string;
  authorizationNumber: string;
  authorizationStatus: 'pending' | 'approved' | 'denied' | 'not_required';

  // Scheduling
  preferredStartDate: string;
  scheduledStartDate: string;
  assignedOffice: string;
  assignedClinician: string;

  // Tracking
  daysInStage: number;
  daysTotal: number;
  assignedTo: string;
  lastActivity: string;
  lastActivityBy: string;
  notes: ReferralNote[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
  admittedAt: string;
}

export interface ReferralNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  stage: PipelineStage;
}

// ─── Stage Transition ──────────────────────────────────────────────────────

export interface StageTransition {
  referralId: string;
  fromStage: PipelineStage;
  toStage: PipelineStage;
  transitionedBy: string;
  transitionedAt: string;
  note: string;
}

// ─── Server Responses ──────────────────────────────────────────────────────

export interface ReferralPipelineResponse {
  referrals: Referral[];
  counts: Record<PipelineStage, number>;
  totalDays: number;
  avgDaysToAdmission: number;
}

export interface ReferralResponse {
  referral: Referral;
}

// ─── Pipeline Metrics ──────────────────────────────────────────────────────

export interface PipelineMetrics {
  totalActive: number;
  statCount: number;
  urgentCount: number;
  avgDaysToAdmit: number;
  conversionRate: number;
  stageBottleneck: PipelineStage;
}

// ─── New Referral Input ────────────────────────────────────────────────────

export interface NewReferralInput {
  patientFirstName: string;
  patientLastName: string;
  patientDob: string;
  patientPhone: string;
  patientAddress: string;
  urgency: ReferralUrgency;
  source: ReferralSource;
  sourceDetails: string;
  referringPhysician: string;
  referringPhysicianNpi: string;
  primaryDiagnosis: string;
  primaryDiagnosisIcd: string;
  secondaryDiagnoses: string[];
  requestedServices: ServiceType[];
  clinicalNotes: string;
  insurancePlan: string;
  insuranceId: string;
  preferredStartDate: string;
  assignedOffice: string;
}

// ─── Pipeline Analytics ────────────────────────────────────────────────────

export interface FunnelStage {
  stage: PipelineStage;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StageConversion {
  fromStage: PipelineStage;
  fromLabel: string;
  toStage: PipelineStage;
  toLabel: string;
  count: number;
  avgDays: number;
  rate: number;
}

export interface SourceBreakdown {
  source: ReferralSource;
  label: string;
  count: number;
  percentage: number;
  avgDaysToAdmit: number;
}

export interface TimeToAdmitTrend {
  week: string;
  avgDays: number;
  count: number;
}

export interface UrgencyDistribution {
  urgency: ReferralUrgency;
  label: string;
  count: number;
  percentage: number;
  avgDaysToAdmit: number;
}

export interface PipelineAnalytics {
  funnel: FunnelStage[];
  conversions: StageConversion[];
  sourceBreakdown: SourceBreakdown[];
  timeToAdmitTrend: TimeToAdmitTrend[];
  urgencyDistribution: UrgencyDistribution[];
  totalProcessed: number;
  totalAdmitted: number;
  totalDenied: number;
  avgOverallDays: number;
}

// ─── Source Labels ─────────────────────────────────────────────────────────

export const SOURCE_LABELS: Record<ReferralSource, string> = {
  hospital_discharge: 'Hospital Discharge',
  physician_office: 'Physician Office',
  skilled_nursing: 'Skilled Nursing Facility',
  self_referral: 'Self Referral',
  insurance_plan: 'Insurance Plan',
  other: 'Other',
};

export const SERVICE_LABELS: Record<ServiceType, string> = {
  skilled_nursing: 'Skilled Nursing',
  physical_therapy: 'Physical Therapy',
  occupational_therapy: 'Occupational Therapy',
  speech_therapy: 'Speech Therapy',
  medical_social_work: 'Medical Social Work',
  home_health_aide: 'Home Health Aide',
  hospice: 'Hospice',
};