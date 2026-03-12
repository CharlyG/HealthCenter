/**
 * SHARED TYPES FOR ASSESSMENT ENGINE
 * 
 * Type definitions shared across all assessment configurations
 * Used by: OASIS-E, HOPE, Skilled Nursing, PT, OT, ST, etc.
 */

// ═══════════════════════════════════════════════════════════════════════════
// QUESTION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type QuestionType =
  | 'text'
  | 'long-text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'time'
  | 'datetime'
  | 'single-select'
  | 'multi-select'
  | 'radio-group'
  | 'checkbox-group';

// ═══════════════════════════════════════════════════════════════════════════
// OPTION DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

export interface OptionDefinition {
  value: string;
  label: string;
  order: number;
  helperText?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION RULES
// ═══════════════════════════════════════════════════════════════════════════

export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;              // Regex pattern
  minLength?: number;
  maxLength?: number;
  customValidation?: string;     // Name of custom validation function
}

// ═══════════════════════════════════════════════════════════════════════════
// CONDITIONAL LOGIC
// ═══════════════════════════════════════════════════════════════════════════

export interface ConditionalLogic {
  dependsOn: string;             // Question ID this depends on
  showWhen?: {
    equals?: any;
    notEquals?: any;
    greaterThan?: number;
    lessThan?: number;
    includes?: string;
    includesAny?: string[];
    notEmpty?: boolean;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SKIP LOGIC
// ═══════════════════════════════════════════════════════════════════════════

export interface SkipLogicRule {
  condition: {
    questionId: string;
    operator: 'equals' | 'not-equals' | 'greater-than' | 'less-than' | 'includes';
    value: any;
  };
  action: {
    type: 'skip-to' | 'show' | 'hide';
    target: string;              // Question or section ID
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// QUESTION DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

export interface QuestionDefinition {
  id: string;                    // Unique identifier (e.g., "M0100", "SN-VS-001")
  text: string;                  // Question text
  type: QuestionType;
  required: boolean;
  order: number;
  
  // Additional context
  helpText?: string;
  placeholder?: string;
  
  // Options for select-type questions
  options?: OptionDefinition[];
  
  // Validation
  validation?: ValidationRule;
  
  // Conditional visibility
  conditional?: ConditionalLogic;
  
  // Skip logic
  skipLogic?: SkipLogicRule[];
  
  // Metadata
  regulatoryReference?: string;  // e.g., "CMS OASIS-E Guidance Chapter 3"
  estimatedTime?: number;        // Estimated minutes to answer
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION DEFINITION
// ═══════════════════════════════════════════════════════════════════════════

export interface SectionDefinition {
  id: string;
  title: string;
  description?: string;
  order: number;
  questions: QuestionDefinition[];
  
  // Section-level conditional logic
  conditional?: ConditionalLogic;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT TYPE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentTypeConfiguration {
  id: string;
  name: string;                  // "OASIS-E", "HOPE", "Skilled Nursing Visit Note"
  version: string;               // "OASIS-E 2024 v1.0"
  category: AssessmentCategory;
  
  // Structure
  sections: SectionDefinition[];
  
  // Timing requirements
  requiredTimeframe?: {
    mustCompleteWithin: number;
    timeUnit: 'hours' | 'days' | 'weeks';
  };
  
  // Completion requirements
  completionRequirements?: {
    minimumProgress: number;     // Percentage (0-100)
    requiredSections?: string[];
    requiredQuestions?: string[];
  };
  
  // Regulatory information
  regulatoryBody?: string;       // "CMS", "State Board", etc.
  effectiveDate?: string;        // ISO date string
  expirationDate?: string;       // ISO date string
  
  // Metadata
  estimatedDuration?: number;    // Total estimated minutes
  tags?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════

export type AssessmentCategory =
  | 'oasis'              // OASIS-E (Medicare)
  | 'hope'               // HOPE (Hospice)
  | 'mds'                // MDS (Skilled Nursing Facility)
  | 'clinical-visit'     // Clinical visit notes (SN, PT, OT, ST)
  | 'specialized'        // Specialized assessments (wound, psych, etc.)
  | 'other';

// ═══════════════════════════════════════════════════════════════════════════
// ANSWER/RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentAnswer {
  questionId: string;
  value: any;                    // Can be string, number, boolean, array, etc.
  timestamp?: string;
  answeredBy?: string;           // User ID
  skipReason?: string;           // If skipped via skip logic
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT INSTANCE (Runtime Data)
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentInstance {
  id: string;
  configId: string;              // Reference to AssessmentTypeConfiguration.id
  
  // Patient & episode context
  patientId: string;
  episodeId?: string;
  visitId?: string;
  
  // Assessment metadata
  status: AssessmentStatus;
  reason?: AssessmentReason;
  
  // Answers
  answers: AssessmentAnswer[];
  
  // Completion tracking
  progress: number;              // Percentage (0-100)
  startedAt?: string;
  completedAt?: string;
  submittedAt?: string;
  
  // User tracking
  createdBy: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  
  // Signatures
  signatures?: AssessmentSignature[];
  
  // QA/Review
  qaStatus?: QAStatus;
  qaReviewedBy?: string;
  qaReviewedAt?: string;
  qaComments?: string;
  
  // Audit trail
  history?: AssessmentHistoryEntry[];
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT STATUS
// ═══════════════════════════════════════════════════════════════════════════

export type AssessmentStatus =
  | 'not-started'
  | 'in-progress'
  | 'ready-for-signature'
  | 'pending-signature'
  | 'signed'
  | 'pending-qa'
  | 'qa-in-review'
  | 'qa-approved'
  | 'returned-for-correction'
  | 'locked'
  | 'submitted';

// ═══════════════════════════════════════════════════════════════════════════
// ASSESSMENT REASON (for OASIS/regulatory assessments)
// ═══════════════════════════════════════════════════════════════════════════

export type AssessmentReason =
  | 'SOC'          // Start of Care
  | 'ROC'          // Resumption of Care
  | 'Recert'       // Recertification
  | 'Transfer'     // Transfer
  | 'Discharge'    // Discharge
  | 'Death'        // Death at Home
  | 'Other';

// ═══════════════════════════════════════════════════════════════════════════
// SIGNATURE
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentSignature {
  role: 'clinician' | 'supervisor' | 'physician';
  userId: string;
  userName: string;
  userCredentials: string;
  signedAt: string;
  ipAddress?: string;
  attestation: string;          // Legal attestation text
}

// ═══════════════════════════════════════════════════════════════════════════
// QA STATUS
// ═══════════════════════════════════════════════════════════════════════════

export type QAStatus =
  | 'pending'
  | 'in-review'
  | 'approved'
  | 'returned'
  | 'escalated';

// ═══════════════════════════════════════════════════════════════════════════
// HISTORY/AUDIT TRAIL
// ═══════════════════════════════════════════════════════════════════════════

export interface AssessmentHistoryEntry {
  action: 'created' | 'updated' | 'signed' | 'submitted' | 'qa-reviewed' | 'returned';
  timestamp: string;
  userId: string;
  changes?: Record<string, any>;
}
