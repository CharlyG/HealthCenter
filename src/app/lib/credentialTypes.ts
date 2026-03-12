/**
 * Credential Management Types
 * 
 * Complete type definitions for credential management including licenses,
 * certifications, background checks, and expiration tracking.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export type CredentialType =
  | 'professional-license'
  | 'cpr-certification'
  | 'background-check'
  | 'tb-test'
  | 'continuing-education'
  | 'drivers-license'
  | 'other';

export type CredentialStatus =
  | 'active'
  | 'expiring-soon'
  | 'expired'
  | 'pending'
  | 'suspended';

export type AlertTiming = '90-days' | '60-days' | '30-days' | '7-days' | 'expired';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info';

// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Credential {
  id: string;
  caregiverId: string;
  credentialType: CredentialType;
  credentialNumber?: string;
  issuingAuthority: string;
  issueDate: string;
  expirationDate: string;
  status: CredentialStatus;
  documentUrl?: string;
  documentName?: string;
  uploadDate?: string;
  verificationDate?: string;
  notes?: string;
  required: boolean;
  renewalReminderSent?: boolean;
  lastAlertDate?: string;
}

export interface CredentialAlert {
  id: string;
  credentialId: string;
  caregiverId: string;
  caregiverName: string;
  credentialType: CredentialType;
  alertTiming: AlertTiming;
  severity: AlertSeverity;
  expirationDate: string;
  daysUntilExpiration: number;
  message: string;
  createdAt: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface CredentialRequirement {
  credentialType: CredentialType;
  discipline?: string; // If discipline-specific
  required: boolean;
  expirationMonths?: number; // How often it expires
  description: string;
}

export interface CaregiverCredentialSummary {
  caregiverId: string;
  caregiverName: string;
  discipline: string;
  office: string;
  totalCredentials: number;
  activeCredentials: number;
  expiringSoonCredentials: number;
  expiredCredentials: number;
  missingRequiredCredentials: string[];
  complianceRate: number; // 0-100
  complianceStatus: 'compliant' | 'at-risk' | 'non-compliant';
  canBeScheduled: boolean;
  alerts: CredentialAlert[];
}

export interface ComplianceDashboardMetrics {
  totalCaregivers: number;
  compliantCaregivers: number;
  atRiskCaregivers: number;
  nonCompliantCaregivers: number;
  totalCredentials: number;
  activeCredentials: number;
  expiringSoonCredentials: number;
  expiredCredentials: number;
  overallComplianceRate: number;
  averageCredentialsPerCaregiver: number;
}

export interface ComplianceDashboardData {
  metrics: ComplianceDashboardMetrics;
  caregiverSummaries: CaregiverCredentialSummary[];
  expiringCredentials: Credential[];
  expiredCredentials: Credential[];
  missingRequiredCertifications: {
    caregiverId: string;
    caregiverName: string;
    discipline: string;
    missingCredentials: string[];
  }[];
  recentAlerts: CredentialAlert[];
  lastUpdated: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const CREDENTIAL_TYPE_CONFIG: Record<
  CredentialType,
  { label: string; color: string; icon: string; expirationMonths: number }
> = {
  'professional-license': {
    label: 'Professional License',
    color: 'blue',
    icon: '🏥',
    expirationMonths: 24,
  },
  'cpr-certification': {
    label: 'CPR Certification',
    color: 'red',
    icon: '❤️',
    expirationMonths: 24,
  },
  'background-check': {
    label: 'Background Check',
    color: 'purple',
    icon: '🔍',
    expirationMonths: 12,
  },
  'tb-test': {
    label: 'TB Test',
    color: 'green',
    icon: '💉',
    expirationMonths: 12,
  },
  'continuing-education': {
    label: 'Continuing Education',
    color: 'amber',
    icon: '📚',
    expirationMonths: 12,
  },
  'drivers-license': {
    label: "Driver's License",
    color: 'teal',
    icon: '🚗',
    expirationMonths: 48,
  },
  other: {
    label: 'Other',
    color: 'gray',
    icon: '📄',
    expirationMonths: 12,
  },
};

export const ALERT_TIMING_CONFIG: Record<
  AlertTiming,
  { daysThreshold: number; severity: AlertSeverity; label: string }
> = {
  'expired': { daysThreshold: 0, severity: 'critical', label: 'Expired' },
  '7-days': { daysThreshold: 7, severity: 'critical', label: '7 Days' },
  '30-days': { daysThreshold: 30, severity: 'high', label: '30 Days' },
  '60-days': { daysThreshold: 60, severity: 'medium', label: '60 Days' },
  '90-days': { daysThreshold: 90, severity: 'info', label: '90 Days' },
};

export const REQUIRED_CREDENTIALS: CredentialRequirement[] = [
  {
    credentialType: 'professional-license',
    required: true,
    expirationMonths: 24,
    description: 'Valid professional license for discipline',
  },
  {
    credentialType: 'cpr-certification',
    required: true,
    expirationMonths: 24,
    description: 'Current CPR/BLS certification',
  },
  {
    credentialType: 'background-check',
    required: true,
    expirationMonths: 12,
    description: 'Background check within last 12 months',
  },
  {
    credentialType: 'tb-test',
    required: true,
    expirationMonths: 12,
    description: 'TB test within last 12 months',
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateCredentialStatus(expirationDate: string): CredentialStatus {
  const now = new Date();
  const expiration = new Date(expirationDate);
  const daysUntilExpiration = Math.ceil(
    (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration < 0) {
    return 'expired';
  } else if (daysUntilExpiration <= 30) {
    return 'expiring-soon';
  } else {
    return 'active';
  }
}

export function getDaysUntilExpiration(expirationDate: string): number {
  const now = new Date();
  const expiration = new Date(expirationDate);
  return Math.ceil((expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function shouldGenerateAlert(
  credential: Credential,
  timing: AlertTiming
): boolean {
  const daysUntilExpiration = getDaysUntilExpiration(credential.expirationDate);
  const threshold = ALERT_TIMING_CONFIG[timing].daysThreshold;

  if (timing === 'expired') {
    return daysUntilExpiration < 0;
  }

  // Generate alert if within threshold (e.g., within 30 days)
  return daysUntilExpiration <= threshold && daysUntilExpiration >= 0;
}

export function canCaregiverBeScheduled(summary: CaregiverCredentialSummary): boolean {
  // Caregiver cannot be scheduled if:
  // 1. They have expired credentials
  // 2. They are missing required credentials
  // 3. Their compliance status is non-compliant

  return (
    summary.expiredCredentials === 0 &&
    summary.missingRequiredCredentials.length === 0 &&
    summary.complianceStatus !== 'non-compliant'
  );
}

export function calculateComplianceRate(
  totalRequired: number,
  compliant: number
): number {
  if (totalRequired === 0) return 100;
  return Math.round((compliant / totalRequired) * 100);
}

export function getComplianceStatus(
  summary: CaregiverCredentialSummary
): 'compliant' | 'at-risk' | 'non-compliant' {
  if (summary.expiredCredentials > 0 || summary.missingRequiredCredentials.length > 0) {
    return 'non-compliant';
  } else if (summary.expiringSoonCredentials > 0) {
    return 'at-risk';
  } else {
    return 'compliant';
  }
}
