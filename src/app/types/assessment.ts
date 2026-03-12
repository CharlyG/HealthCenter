/**
 * ASSESSMENT SYSTEM - CORE TYPE DEFINITIONS
 * 
 * Central type system for all assessment types across Home Health and Hospice
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT STATUS
// ═══════════════════════════════════════════════════════════════════════════

export type AssessmentStatus =
  | 'draft'
  | 'in-progress'
  | 'pending-signature'
  | 'signed'
  | 'pending-qa'
  | 'returned-for-correction'
  | 'approved'
  | 'locked';

export const ASSESSMENT_STATUS_CONFIG: Record<
  AssessmentStatus,
  { label: string; color: string; description: string }
> = {
  'draft': {
    label: 'Draft',
    color: 'gray',
    description: 'Not yet started or saved as draft',
  },
  'in-progress': {
    label: 'In Progress',
    color: 'blue',
    description: 'Currently being completed',
  },
  'pending-signature': {
    label: 'Pending Signature',
    color: 'amber',
    description: 'Awaiting clinician signature',
  },
  'signed': {
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
  'approved': {
    label: 'Approved',
    color: 'green',
    description: 'Approved by QA',
  },
  'locked': {
    label: 'Locked',
    color: 'gray',
    description: 'Finalized and locked',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AssessmentType =
  | 'oasis-e'
  | 'oasis-e1'
  | 'skilled-nursing'
  | 'physical-therapy'
  | 'occupational-therapy'
  | 'speech-therapy'
  | 'medical-social-work'
  | 'hospice-hope'
  | 'hospice-admission'
  | 'hospice-update'
  | 'hospice-discharge';

export interface AssessmentTypeConfig {
  id: AssessmentType;
  name: string;
  shortName: string;
  category: 'home-health' | 'hospice';
  discipline: 'nursing' | 'therapy' | 'social-work' | 'hospice';
  requiresSignature: boolean;
  requiresQA: boolean;
  allowsVersioning: boolean;
  estimatedTime: string;
  description: string;
}

export const ASSESSMENT_TYPES: Record<AssessmentType, AssessmentTypeConfig> = {
  'oasis-e': {
    id: 'oasis-e',
    name: 'OASIS-E Assessment',
    shortName: 'OASIS-E',
    category: 'home-health',
    discipline: 'nursing',
    requiresSignature: true,
    requiresQA: true,
    allowsVersioning: true,
    estimatedTime: '45-60 min',
    description: 'Medicare-required comprehensive assessment for home health',
  },
  'oasis-e1': {
    id: 'oasis-e1',
    name: 'OASIS-E1 Assessment',
    shortName: 'OASIS-E1',
    category: 'home-health',
    discipline: 'nursing',
    requiresSignature: true,
    requiresQA: true,
    allowsVersioning: true,
    estimatedTime: '45-60 min',
    description: 'Updated OASIS-E1 version (effective 2023)',
  },
  'skilled-nursing': {
    id: 'skilled-nursing',
    name: 'Skilled Nursing Assessment',
    shortName: 'SN Assessment',
    category: 'home-health',
    discipline: 'nursing',
    requiresSignature: true,
    requiresQA: true,
    allowsVersioning: true,
    estimatedTime: '20-30 min',
    description: 'Comprehensive skilled nursing visit assessment',
  },
  'physical-therapy': {
    id: 'physical-therapy',
    name: 'Physical Therapy Evaluation',
    shortName: 'PT Eval',
    category: 'home-health',
    discipline: 'therapy',
    requiresSignature: true,
    requiresQA: true,
    allowsVersioning: true,
    estimatedTime: '30-45 min',
    description: 'PT evaluation with ROM, strength, gait, balance assessment',
  },
  'occupational-therapy': {
    id: 'occupational-therapy',
    name: 'Occupational Therapy Evaluation',
    shortName: 'OT Eval',
    category: 'home-health',
    discipline: 'therapy',
    requiresSignature: true,
    requiresQA: true,
    allowsVersioning: true,
    estimatedTime: '30-40 min',
    description: 'OT evaluation with ADL/IADL assessment',
  },
  'speech-therapy': {
    id: 'speech-therapy',
    name: 'Speech-Language Pathology Evaluation',
    shortName: 'SLP Eval',
    category: 'home-health',
    discipline: 'therapy',
    requiresSignature: true,
    requiresQA: true,
    allowsVersioning: true,
    estimatedTime: '25-35 min',
    description: 'SLP evaluation with swallowing and communication assessment',
  },
  'medical-social-work': {
    id: 'medical-social-work',
    name: 'Medical Social Work Assessment',
    shortName: 'MSW Assessment',
    category: 'home-health',
    discipline: 'social-work',
    requiresSignature: true,
    requiresQA: false,
    allowsVersioning: true,
    estimatedTime: '30-45 min',
    description: 'Psychosocial assessment and resource evaluation',
  },
  'hospice-hope': {
    id: 'hospice-hope',
    name: 'Hospice HOPE Assessment',
    shortName: 'HOPE',
    category: 'hospice',
    discipline: 'hospice',
    requiresSignature: true,
    requiresQA: true,
    allowsVersioning: true,
    estimatedTime: '30-40 min',
    description: 'Medicare-required hospice outcomes assessment',
  },
  'hospice-admission': {
    id: 'hospice-admission',
    name: 'Hospice Admission Assessment',
    shortName: 'Hospice Admit',
    category: 'hospice',
    discipline: 'hospice',
    requiresSignature: true,
    requiresQA: true,
    allowsVersioning: true,
    estimatedTime: '45-60 min',
    description: 'Comprehensive hospice admission assessment',
  },
  'hospice-update': {
    id: 'hospice-update',
    name: 'Hospice Update Assessment',
    shortName: 'Hospice Update',
    category: 'hospice',
    discipline: 'hospice',
    requiresSignature: true,
    requiresQA: false,
    allowsVersioning: true,
    estimatedTime: '15-20 min',
    description: 'Routine hospice status update',
  },
  'hospice-discharge': {
    id: 'hospice-discharge',
    name: 'Hospice Discharge Assessment',
    shortName: 'Hospice DC',
    category: 'hospice',
    discipline: 'hospice',
    requiresSignature: true,
    requiresQA: true,
    allowsVersioning: true,
    estimatedTime: '20-30 min',
    description: 'Hospice discharge or death documentation',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT SECTION
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentSection {
  id: string;
  title: string;
  subtitle?: string;
  order: number;
  required: boolean;
  estimatedTime?: string;
  completionStatus: 'not-started' | 'in-progress' | 'complete' | 'incomplete';
  validationErrors: number;
  fieldCount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT VALIDATION
// ═══════════════════════════════════════════════════════════════════════════

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  field: string;
  section: string;
  message: string;
  autoFixable?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// SIGNATURE
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentSignature {
  id: string;
  signedBy: string;
  signedByRole: string;
  signedAt: string;
  signatureType: 'electronic' | 'digital';
  ipAddress?: string;
  location?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// QA REVIEW
// ═══════════════════════════════════════════════════════════════════════════

export interface QAReview {
  id: string;
  reviewedBy: string;
  reviewedAt: string;
  status: 'approved' | 'returned';
  comments?: string;
  issues?: QAIssue[];
}

export interface QAIssue {
  id: string;
  section: string;
  field: string;
  description: string;
  severity: 'critical' | 'moderate' | 'minor';
  resolved: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// VERSION HISTORY
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentVersion {
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  status: AssessmentStatus;
  changesSummary: string;
  data: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN ASSESSMENT INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

export interface Assessment {
  id: string;
  type: AssessmentType;
  patientId: string;
  patientName: string;
  episodeId?: string;
  admissionId?: string;
  
  // Metadata
  status: AssessmentStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  
  // Completion tracking
  percentComplete: number;
  sections: AssessmentSection[];
  
  // Validation
  validationIssues: ValidationIssue[];
  isValid: boolean;
  
  // Workflow
  signature?: AssessmentSignature;
  qaReview?: QAReview;
  
  // Versioning
  currentVersion: number;
  versions: AssessmentVersion[];
  
  // Data
  data: Record<string, any>;
  
  // Auto-save
  lastAutoSave?: string;
  autoSaveEnabled: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT LIST FILTERS
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentFilters {
  type?: AssessmentType[];
  status?: AssessmentStatus[];
  category?: ('home-health' | 'hospice')[];
  discipline?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  assignedTo?: string[];
  searchQuery?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT ACTIONS
// ═══════════════════════════════════════════════════════════════════════════

export type AssessmentAction =
  | 'edit'
  | 'save-draft'
  | 'submit-signature'
  | 'sign'
  | 'submit-qa'
  | 'approve-qa'
  | 'return-qa'
  | 'view-history'
  | 'compare-versions'
  | 'print'
  | 'delete'
  | 'lock'
  | 'unlock';
