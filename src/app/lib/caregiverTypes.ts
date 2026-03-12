/**
 * Caregiver Profile Types
 * 
 * Complete type definitions for caregiver profiles including personal info,
 * disciplines, credentials, training, employment, and availability.
 */

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export type DisciplineType =
  | 'SN'  // Skilled Nursing
  | 'PT'  // Physical Therapy
  | 'OT'  // Occupational Therapy
  | 'ST'  // Speech Therapy
  | 'MSW' // Medical Social Work
  | 'HHA'; // Home Health Aide

export type EmploymentStatus =
  | 'active'
  | 'inactive'
  | 'terminated'
  | 'on-leave'
  | 'probation';

export type CredentialComplianceStatus =
  | 'compliant'
  | 'warning'
  | 'non-compliant';

export type LicenseStatus =
  | 'active'
  | 'expired'
  | 'pending'
  | 'suspended';

export type CertificationStatus =
  | 'current'
  | 'expiring-soon'
  | 'expired'
  | 'pending';

export type AvailabilityStatus =
  | 'available'
  | 'limited'
  | 'unavailable';

// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CaregiverPersonalInfo {
  firstName: string;
  lastName: string;
  middleName?: string;
  preferredName?: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  dateOfBirth: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Discipline {
  type: DisciplineType;
  isPrimary: boolean;
  yearsExperience: number;
  specialties?: string[];
}

export interface License {
  id: string;
  type: string; // e.g., "RN License", "PT License"
  licenseNumber: string;
  state: string;
  issueDate: string;
  expirationDate: string;
  status: LicenseStatus;
  verificationDate?: string;
  documentId?: string;
}

export interface Certification {
  id: string;
  name: string; // e.g., "BLS", "ACLS", "OASIS-E"
  issuer: string;
  certificationNumber?: string;
  issueDate: string;
  expirationDate: string;
  status: CertificationStatus;
  requiresRenewal: boolean;
  documentId?: string;
}

export interface Training {
  id: string;
  name: string;
  category: string; // e.g., "Safety", "Clinical", "Compliance"
  completionDate: string;
  expirationDate?: string;
  hours?: number;
  instructor?: string;
  status: 'completed' | 'in-progress' | 'required';
  documentId?: string;
}

export interface AvailabilityPreference {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  startTime: string; // HH:mm format
  endTime: string;
  maxHours?: number;
}

export interface Availability {
  status: AvailabilityStatus;
  weeklyPreferences: AvailabilityPreference[];
  maxWeeklyHours?: number;
  maxDailyHours?: number;
  preferredTerritory?: string[];
  travelRadius?: number; // miles
  restrictions?: string[];
  notes?: string;
}

export interface Employment {
  employeeId: string;
  hireDate: string;
  terminationDate?: string;
  status: EmploymentStatus;
  office: string;
  officeId: string;
  department?: string;
  supervisor?: string;
  supervisorId?: string;
  payRate?: number;
  payType?: 'hourly' | 'salary' | 'per-visit';
  employmentType: 'full-time' | 'part-time' | 'per-diem' | 'contract';
  benefitsEligible: boolean;
}

export interface CaregiverDocument {
  id: string;
  name: string;
  type: string; // e.g., "License", "Certification", "Policy", "I-9"
  category: string;
  uploadDate: string;
  expirationDate?: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
}

export interface CredentialCompliance {
  overall: CredentialComplianceStatus;
  lastReviewDate: string;
  nextReviewDate: string;
  issues: {
    type: 'license' | 'certification' | 'training';
    severity: 'critical' | 'warning' | 'info';
    message: string;
    itemId: string;
    dueDate?: string;
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CAREGIVER PROFILE
// ═══════════════════════════════════════════════════════════════════════════

export interface CaregiverProfile {
  id: string;
  personalInfo: CaregiverPersonalInfo;
  disciplines: Discipline[];
  primaryDiscipline: DisciplineType;
  licenses: License[];
  certifications: Certification[];
  training: Training[];
  availability: Availability;
  employment: Employment;
  documents: CaregiverDocument[];
  credentialCompliance: CredentialCompliance;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DISCIPLINE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const DISCIPLINE_CONFIG: Record<
  DisciplineType,
  { label: string; shortLabel: string; color: string; requiredLicenses: string[] }
> = {
  SN: {
    label: 'Skilled Nursing',
    shortLabel: 'SN',
    color: 'blue',
    requiredLicenses: ['RN License', 'LPN License'],
  },
  PT: {
    label: 'Physical Therapy',
    shortLabel: 'PT',
    color: 'purple',
    requiredLicenses: ['PT License'],
  },
  OT: {
    label: 'Occupational Therapy',
    shortLabel: 'OT',
    color: 'green',
    requiredLicenses: ['OT License'],
  },
  ST: {
    label: 'Speech Therapy',
    shortLabel: 'ST',
    color: 'orange',
    requiredLicenses: ['SLP License'],
  },
  MSW: {
    label: 'Medical Social Work',
    shortLabel: 'MSW',
    color: 'teal',
    requiredLicenses: ['LSW License', 'LCSW License'],
  },
  HHA: {
    label: 'Home Health Aide',
    shortLabel: 'HHA',
    color: 'pink',
    requiredLicenses: ['HHA Certification'],
  },
};

export const EMPLOYMENT_STATUS_CONFIG: Record<
  EmploymentStatus,
  { label: string; color: string }
> = {
  active: { label: 'Active', color: 'green' },
  inactive: { label: 'Inactive', color: 'gray' },
  terminated: { label: 'Terminated', color: 'red' },
  'on-leave': { label: 'On Leave', color: 'amber' },
  probation: { label: 'Probation', color: 'orange' },
};
