/**
 * OASIS ASSESSMENT SYSTEM - TYPE DEFINITIONS
 * 
 * Production-grade OASIS-E/E1 assessment types for Home Health
 * Supports all Medicare-required timepoints and workflows
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// OASIS TIMEPOINTS (Reason for Assessment)
// ═══════════════════════════════════════════════════════════════════════════

export type OasisTimepoint =
  | 'start-of-care'
  | 'resumption-of-care'
  | 'recertification'
  | 'other-follow-up'
  | 'transfer-to-inpatient'
  | 'discharge-return-to-community'
  | 'discharge-transferred'
  | 'death-at-home';

export const OASIS_TIMEPOINT_CONFIG: Record<
  OasisTimepoint,
  {
    code: string;
    label: string;
    shortLabel: string;
    description: string;
    requiresPhysician: boolean;
    requiresFullAssessment: boolean;
    color: string;
  }
> = {
  'start-of-care': {
    code: '01',
    label: 'Start of Care',
    shortLabel: 'SOC',
    description: 'Initial comprehensive assessment at admission',
    requiresPhysician: true,
    requiresFullAssessment: true,
    color: 'blue',
  },
  'resumption-of-care': {
    code: '03',
    label: 'Resumption of Care',
    shortLabel: 'ROC',
    description: 'After inpatient stay of 24+ hours',
    requiresPhysician: true,
    requiresFullAssessment: true,
    color: 'purple',
  },
  'recertification': {
    code: '04',
    label: 'Recertification',
    shortLabel: 'Recert',
    description: 'Every 60 days for continuing care',
    requiresPhysician: true,
    requiresFullAssessment: true,
    color: 'green',
  },
  'other-follow-up': {
    code: '05',
    label: 'Other Follow-Up',
    shortLabel: 'Follow-Up',
    description: 'Significant change in condition',
    requiresPhysician: false,
    requiresFullAssessment: true,
    color: 'amber',
  },
  'transfer-to-inpatient': {
    code: '06',
    label: 'Transfer to Inpatient',
    shortLabel: 'Transfer',
    description: 'Patient transferred to hospital/facility',
    requiresPhysician: false,
    requiresFullAssessment: false,
    color: 'orange',
  },
  'discharge-return-to-community': {
    code: '07',
    label: 'Discharge - Return to Community',
    shortLabel: 'Discharge',
    description: 'Successful discharge home',
    requiresPhysician: false,
    requiresFullAssessment: false,
    color: 'green',
  },
  'discharge-transferred': {
    code: '08',
    label: 'Discharge - Transferred',
    shortLabel: 'DC Transfer',
    description: 'Discharge to another agency/facility',
    requiresPhysician: false,
    requiresFullAssessment: false,
    color: 'gray',
  },
  'death-at-home': {
    code: '09',
    label: 'Death at Home',
    shortLabel: 'Death',
    description: 'Patient expired at home',
    requiresPhysician: false,
    requiresFullAssessment: false,
    color: 'gray',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// OASIS SECTIONS
// ═══════════════════════════════════════════════════════════════════════════

export type OasisSectionId =
  | 'patient-tracking'
  | 'clinical-record'
  | 'living-arrangements'
  | 'sensory-status'
  | 'integumentary'
  | 'respiratory'
  | 'cardiac'
  | 'elimination'
  | 'neuro-emotional'
  | 'adls'
  | 'iadls'
  | 'medications'
  | 'equipment'
  | 'emergent-care'
  | 'therapy-need'
  | 'discharge-planning';

export interface OasisSection {
  id: OasisSectionId;
  title: string;
  subtitle: string;
  order: number;
  estimatedTime: string;
  itemCount: number;
  requiredItems: number;
  completedItems: number;
  validationErrors: number;
  validationWarnings: number;
  isComplete: boolean;
  isRequired: boolean;
  mItemRange: string; // e.g., "M1000-M1036"
}

// ═══════════════════════════════════════════════════════════════════════════
// OASIS VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export type OasisValidationSeverity = 'error' | 'warning' | 'info';

export interface OasisValidationIssue {
  id: string;
  mItem: string; // e.g., "M1021"
  mItemTitle: string;
  section: OasisSectionId;
  severity: OasisValidationSeverity;
  message: string;
  skipLogic?: string; // Explanation if skip logic applies
  autoFixable: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// OASIS STATUS
// ═══════════════════════════════════════════════════════════════════════════

export type OasisStatus =
  | 'draft'
  | 'in-progress'
  | 'validation-errors'
  | 'ready-for-signature'
  | 'pending-signature'
  | 'signed'
  | 'pending-qa'
  | 'returned-for-correction'
  | 'qa-approved'
  | 'transmitted'
  | 'locked';

export const OASIS_STATUS_CONFIG: Record<
  OasisStatus,
  { label: string; color: string; description: string }
> = {
  draft: {
    label: 'Draft',
    color: 'gray',
    description: 'Initial draft, not yet started',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'blue',
    description: 'Assessment being completed',
  },
  'validation-errors': {
    label: 'Validation Errors',
    color: 'red',
    description: 'Has validation errors requiring correction',
  },
  'ready-for-signature': {
    label: 'Ready for Signature',
    color: 'green',
    description: 'Complete and validated, ready to sign',
  },
  'pending-signature': {
    label: 'Pending Signature',
    color: 'amber',
    description: 'Awaiting clinician signature',
  },
  signed: {
    label: 'Signed',
    color: 'green',
    description: 'Signed by clinician',
  },
  'pending-qa': {
    label: 'Pending QA',
    color: 'purple',
    description: 'In QA review queue',
  },
  'returned-for-correction': {
    label: 'Returned',
    color: 'red',
    description: 'Returned by QA for corrections',
  },
  'qa-approved': {
    label: 'QA Approved',
    color: 'green',
    description: 'Approved by QA',
  },
  transmitted: {
    label: 'Transmitted',
    color: 'blue',
    description: 'Transmitted to CMS',
  },
  locked: {
    label: 'Locked',
    color: 'gray',
    description: 'Finalized and locked',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN OASIS ASSESSMENT INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface OasisAssessment {
  id: string;
  patientId: string;
  patientName: string;
  episodeId: string;
  
  // OASIS-specific
  timepoint: OasisTimepoint;
  oasisVersion: 'E' | 'E1';
  assessmentDate: string;
  
  // Tracking
  status: OasisStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  
  // Completion
  percentComplete: number;
  sections: OasisSection[];
  
  // Validation
  validationIssues: OasisValidationIssue[];
  isValid: boolean;
  lastValidationRun?: string;
  
  // Workflow
  signature?: {
    signedBy: string;
    signedByCredentials: string;
    signedAt: string;
  };
  qaReview?: {
    reviewedBy: string;
    reviewedAt: string;
    status: 'approved' | 'returned';
    comments?: string;
  };
  
  // Transmission
  transmittedAt?: string;
  transmissionId?: string;
  
  // Data
  data: Record<string, any>; // M-item values
  
  // Auto-save
  lastAutoSave?: string;
  autoSaveEnabled: boolean;
  
  // Metadata
  dueDate?: string;
  isOverdue: boolean;
  flags: OasisFlag[];
}

// ═══════════════════════════════════════════════════════════════════════════
// OASIS FLAGS
// ═══════════════════════════════════════════════════════════════════════════

export type OasisFlagType = 
  | 'high-risk'
  | 'incomplete-data'
  | 'missing-physician-order'
  | 'care-plan-update-needed'
  | 'hospitalization-risk';

export interface OasisFlag {
  type: OasisFlagType;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// OASIS FILTERS
// ═══════════════════════════════════════════════════════════════════════════

export interface OasisFilters {
  timepoint?: OasisTimepoint[];
  status?: OasisStatus[];
  assignedTo?: string[];
  dueDate?: {
    start: string;
    end: string;
  };
  isOverdue?: boolean;
  searchQuery?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// OASIS ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export type OasisAction =
  | 'edit'
  | 'save-draft'
  | 'validate'
  | 'submit-signature'
  | 'sign'
  | 'submit-qa'
  | 'approve-qa'
  | 'return-qa'
  | 'print'
  | 'transmit'
  | 'delete';
