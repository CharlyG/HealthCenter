/**
 * Clinical Assessment Engine - Type Definitions
 * Comprehensive types for all assessment components
 */

// ─── Assessment Question Types ─────────────────────────────────────────────

export type QuestionType =
  | 'text'
  | 'numeric'
  | 'dropdown'
  | 'checkbox'
  | 'radio'
  | 'multi-select'
  | 'pain-scale'
  | 'functional-score'
  | 'date'
  | 'textarea'
  | 'range';

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  label: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  validation?: {
    pattern?: string;
    message?: string;
  };
  conditional?: {
    dependsOn: string;
    showWhen: (value: any) => boolean;
  };
}

// ─── Assessment Section ────────────────────────────────────────────────────

export interface AssessmentSection {
  id: string;
  title: string;
  description?: string;
  questions: AssessmentQuestion[];
  order: number;
}

// ─── Assessment Types ──────────────────────────────────────────────────────

export type AssessmentType =
  | 'physical-therapy-evaluation'
  | 'occupational-therapy-evaluation'
  | 'speech-therapy-evaluation'
  | 'skilled-nursing-assessment'
  | 'oasis-e-assessment'
  | 'hope-assessment'
  | 'recertification-assessment'
  | 'discharge-summary';

export type AssessmentStatus = 'not-started' | 'in-progress' | 'draft' | 'submitted' | 'qa-review' | 'approved' | 'rejected';

export type SectionStatus = 'not-started' | 'in-progress' | 'completed';

// ─── Assessment Data ───────────────────────────────────────────────────────

export interface AssessmentDefinition {
  id: string;
  type: AssessmentType;
  title: string;
  discipline: string;
  description?: string;
  sections: AssessmentSection[];
}

export interface AssessmentInstance {
  id: string;
  definitionId: string;
  type: AssessmentType;
  patientId: string;
  patientName: string;
  admissionId: string;
  episodeId?: string;
  clinicianId: string;
  clinicianName: string;
  status: AssessmentStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  data: Record<string, any>;
  sectionProgress: Record<string, SectionStatus>;
  validationErrors?: Record<string, string>;
  metadata?: {
    autoSaveEnabled: boolean;
    lastAutoSave?: string;
    visitDate?: string;
    location?: string;
  };
}

// ─── Assessment Template Responses ─────────────────────────────────────────

export interface AssessmentResponse {
  questionId: string;
  value: any;
  answeredAt: string;
  answeredBy: string;
}

// ─── Pain Scale Specific ───────────────────────────────────────────────────

export interface PainScaleValue {
  score: number; // 0-10
  location?: string;
  quality?: string;
  triggers?: string[];
}

// ─── Functional Score Specific ─────────────────────────────────────────────

export interface FunctionalScoreValue {
  score: number;
  category: string;
  notes?: string;
}

// ─── Signature ─────────────────────────────────────────────────────────────

export interface AssessmentSignature {
  id: string;
  assessmentId: string;
  signedBy: string;
  signedByRole: string;
  signedAt: string;
  signature: string;
  ipAddress?: string;
}

// ─── QA Review ─────────────────────────────────────────────────────────────

export interface QAReview {
  id: string;
  assessmentId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  issues?: {
    sectionId: string;
    questionId: string;
    issue: string;
    severity: 'critical' | 'warning' | 'info';
  }[];
  reviewedAt: string;
}

// ─── Assessment Header Data ────────────────────────────────────────────────

export interface AssessmentHeaderData {
  patient: {
    id: string;
    name: string;
    mrn: string;
    dob: string;
    age: number;
  };
  admission: {
    id: string;
    admissionDate: string;
    diagnosis: string;
    physician: string;
  };
  assessment: {
    type: AssessmentType;
    title: string;
    status: AssessmentStatus;
    createdAt: string;
  };
  clinician: {
    id: string;
    name: string;
    credentials: string;
    discipline: string;
  };
}

// ─── Assessment Progress ───────────────────────────────────────────────────

export interface AssessmentProgress {
  totalSections: number;
  completedSections: number;
  inProgressSections: number;
  notStartedSections: number;
  percentComplete: number;
  totalQuestions: number;
  answeredQuestions: number;
  requiredQuestions: number;
  answeredRequiredQuestions: number;
  readyForSubmission: boolean;
}

// ─── Autosave State ────────────────────────────────────────────────────────

export interface AutosaveState {
  enabled: boolean;
  lastSaved?: string;
  saving: boolean;
  error?: string;
}
