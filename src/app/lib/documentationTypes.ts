/**
 * Clinical Documentation Architecture Types
 * 
 * Comprehensive types for clinical documentation supporting:
 * - Visit Documentation (created during visits)
 * - Assessment Documentation (OASIS-E, HOPE, comprehensive assessments)
 * - Episode Documentation (plans of care, physician orders, certifications)
 * 
 * All documentation must be associated with a patient admission.
 * Designed for .NET 8 API migration — all types map to C# models.
 */

// ─── Documentation Categories ───────────────────────────────────────────────

export type DocumentCategory = 'visit' | 'assessment' | 'episode';

export type VisitDocumentType = 
  | 'skilled_nursing_visit'
  | 'physical_therapy_visit'
  | 'physical_therapy_evaluation'
  | 'physical_therapy_progress_note'
  | 'physical_therapy_discharge'
  | 'speech_therapy_visit'
  | 'speech_therapy_evaluation'
  | 'speech_therapy_progress_note'
  | 'speech_therapy_discharge'
  | 'occupational_therapy_visit'
  | 'medical_social_work_visit'
  | 'aide_supervisory_visit'
  | 'home_health_aide_visit';

export type AssessmentDocumentType = 
  | 'oasis_e_assessment'
  | 'oasis_e_soc'
  | 'oasis_e_roc'
  | 'oasis_e_followup'
  | 'oasis_e_transfer'
  | 'oasis_e_discharge'
  | 'comprehensive_assessment'
  | 'reassessment'
  | 'interim_assessment';

export type EpisodeDocumentType =
  | 'plan_of_care'
  | 'physician_orders'
  | 'recertification'
  | 'discharge_summary'
  | 'physician_face_to_face'
  | 'verbal_orders'
  | 'authorization_request'
  | 'progress_summary';

export type DocumentType = VisitDocumentType | AssessmentDocumentType | EpisodeDocumentType;

export type DocumentStatus = 
  | 'in_progress'    // Draft being worked on
  | 'pending_review' // Ready for review/validation
  | 'ready_to_sign'  // Validation passed, ready for signature
  | 'signed'         // Signed by clinician
  | 'pending_cosign' // Awaiting co-signature
  | 'cosigned'       // Co-signed and complete
  | 'rejected'       // Rejected during review
  | 'locked';        // Locked and finalized

export type SignatureStatus =
  | 'unsigned'
  | 'signed'
  | 'pending_cosign'
  | 'cosigned'
  | 'electronic_signature'
  | 'wet_signature';

// ─── Core Clinical Document ─────────────────────────────────────────────────

export interface ClinicalDocument {
  // Core identifiers
  id: string;
  documentType: DocumentType;
  documentCategory: DocumentCategory;
  
  // Patient and admission context
  patientId: string;
  patientName: string;
  admissionId: string;
  admissionStartDate: string;
  admissionType: 'home_health' | 'hospice';
  
  // Document metadata
  status: DocumentStatus;
  signatureStatus: SignatureStatus;
  
  // Clinician information
  createdBy: string;
  createdByName: string;
  createdByRole: string;
  createdByCredentials?: string;
  
  // Date tracking
  documentDate: string;     // Clinical date (e.g., visit date, assessment date)
  createdAt: string;
  updatedAt: string;
  
  // Progress and completion
  completionPercentage: number;
  sectionProgress: Record<string, SectionProgressData>;
  
  // Validation
  validationErrors: ValidationError[];
  validationWarnings: ValidationWarning[];
  isValid: boolean;
  
  // Document content
  values: FormValues;
  
  // Signature information
  signedBy?: string;
  signedByName?: string;
  signedAt?: string;
  signatureMethod?: 'electronic' | 'wet' | 'pin';
  
  // Co-signature
  cosignRequired: boolean;
  cosignRequestedAt?: string;
  cosignRequestedTo?: string;
  cosignRequestedToName?: string;
  cosignNote?: string;
  cosignedBy?: string;
  cosignedByName?: string;
  cosignedAt?: string;
  cosignComment?: string;
  
  // Locking
  lockedBy?: string;
  lockedAt?: string;
  
  // Visit specific (if applicable)
  visitId?: string;
  visitStartTime?: string;
  visitEndTime?: string;
  visitDurationMinutes?: number;
  
  // Episode specific (if applicable)
  episodeId?: string;
  certificationPeriodStart?: string;
  certificationPeriodEnd?: string;
}

// ─── Field Types ────────────────────────────────────────────────────────────

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'number' | 'date' | 'time';

export interface FormFieldDef {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  helpText?: string;
  smartPhraseCategory?: string; // links to smart phrase categories
  maxLength?: number;
  min?: number;
  max?: number;
  // Validation rules
  validationRules?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    custom?: (value: any) => string | null; // Returns error message or null
  };
}

// ─── Section Definition ─────────────────────────────────────────────────────

export interface FormSectionDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  fields: FormFieldDef[];
  order: number;
  // Section-level validation
  requiredIf?: (values: FormValues) => boolean;
}

// ─── Form Template ──────────────────────────────────────────────────────────

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: DocumentCategory;
  documentType: DocumentType;
  sections: FormSectionDef[];
  // Template metadata
  regulatoryRequirements?: string[];
  estimatedTimeMinutes?: number;
  requiresCosignature?: boolean;
  cosignatureRoles?: string[];
}

// ─── Draft & Form Values (Legacy - keeping for backwards compatibility) ────

export type FormValues = Record<string, string | boolean | number>;

export type DraftStatus = 'in_progress' | 'completed' | 'signed' | 'pending_cosign' | 'cosigned';

export interface DocumentDraft {
  id: string;
  patientId: string;
  templateId: FormTemplateType;
  templateName: string;
  values: FormValues;
  status: DraftStatus;
  completionPct: number;
  sectionProgress: Record<string, SectionProgressData>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lockedBy?: string;
  // Co-signature fields
  cosignRequestedAt?: string;
  cosignRequestedTo?: string;
  cosignNote?: string;
  cosignedBy?: string;
  cosignedAt?: string;
  cosignComment?: string;
}

export interface SectionProgressData {
  total: number;
  filled: number;
  requiredTotal: number;
  requiredFilled: number;
  complete: boolean;
}

// ─── Validation ─────────────────────────────────────────────────────────────

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationError {
  id: string;
  severity: 'error';
  sectionId: string;
  sectionTitle: string;
  fieldId: string;
  fieldLabel: string;
  message: string;
  rule: string;
}

export interface ValidationWarning {
  id: string;
  severity: 'warning';
  sectionId?: string;
  sectionTitle?: string;
  fieldId?: string;
  fieldLabel?: string;
  message: string;
  rule: string;
  canOverride: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completionPercentage: number;
  missingRequiredFields: Array<{
    sectionId: string;
    sectionTitle: string;
    fieldId: string;
    fieldLabel: string;
  }>;
}

// ─── Form Template (Legacy type) ────────────────────────────────────────────

export type FormTemplateType = 'skilled_nursing_visit' | 'oasis_soc' | 'recertification' | 'discharge' | 'aide_supervisory';

export interface FormTemplate {
  id: FormTemplateType;
  name: string;
  description: string;
  sections: FormSectionDef[];
}

// ─── Smart Phrases ──────────────────────────────────────────────────────────

export interface SmartPhrase {
  id: string;
  category: string;
  label: string;
  text: string;
  tags: string[];
  usageCount: number;
  isPersonal?: boolean;
  createdBy?: string;
}

// ─── Previous Documentation Patterns ────────────────────────────────────────

export interface DocumentationPattern {
  id: string;
  patientId: string;
  templateId: string;
  sectionId: string;
  fieldId: string;
  value: string;
  documentDate: string;
  clinicianName: string;
}

// ─── Server Responses ───────────────────────────────────────────────────────

export interface DraftSaveResponse {
  draft: DocumentDraft;
  autoSaved: boolean;
}

export interface SmartPhraseResponse {
  phrases: SmartPhrase[];
}

export interface SmartPhraseSaveResponse {
  phrase: SmartPhrase;
}

export interface CosignResponse {
  draft: DocumentDraft;
}

export interface PatternsResponse {
  patterns: DocumentationPattern[];
}

export interface DraftListResponse {
  drafts: DocumentDraft[];
}

// ─── Audit Trail ────────────────────────────────────────────────────────────

export type AuditAction =
  | 'draft_created'
  | 'draft_saved'
  | 'draft_submitted'
  | 'cosign_requested'
  | 'cosign_approved'
  | 'cosign_rejected'
  | 'draft_reopened'
  | 'pdf_exported';

export interface AuditLogEntry {
  id: string;
  draftId: string;
  action: AuditAction;
  actor: string;
  actorRole: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface AuditLogResponse {
  entries: AuditLogEntry[];
}

// ─── Cosign Queue ───────────────────────────────────────────────────────────

export interface CosignQueueItem {
  draft: DocumentDraft;
  auditTrail: AuditLogEntry[];
  patientName?: string;
  urgency?: 'routine' | 'urgent' | 'stat';
}

export interface CosignQueueResponse {
  items: CosignQueueItem[];
  total: number;
}

// ─── Workflow Notifications ─────────────────────────────────────────────────

export type DocNotificationType =
  | 'cosign_requested'
  | 'cosign_approved'
  | 'cosign_rejected'
  | 'cosign_overdue';

export interface DocNotification {
  id: string;
  type: DocNotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  draftId: string;
  patientId: string;
  actorName: string;
  recipientRole: string;
}

export interface DocNotificationResponse {
  notifications: DocNotification[];
  unreadCount: number;
}

// ─── Co-Signature Analytics ─────────────────────────────────────────────────

export interface CosignAnalyticsData {
  summary: {
    totalDocuments: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    avgTurnaroundHours: number;
    approvalRate: number;
  };
  supervisorStats: Array<{
    name: string;
    approved: number;
    rejected: number;
    avgTurnaroundHours: number;
    total: number;
  }>;
  clinicianStats: Array<{
    name: string;
    submitted: number;
    approved: number;
    rejected: number;
    pending: number;
  }>;
  dailyTrend: Array<{
    date: string;
    requested: number;
    approved: number;
    rejected: number;
  }>;
  turnaroundDistribution: Array<{
    range: string;
    count: number;
  }>;
}

export interface CosignAnalyticsResponse {
  analytics: CosignAnalyticsData;
}

// ─── Progress Calculation Helpers ───────────────────────────────────────────

export function computeSectionProgress(
  section: FormSectionDef,
  values: FormValues
): SectionProgressData {
  let filled = 0;
  let requiredFilled = 0;

  for (const field of section.fields) {
    const val = values[field.id];
    const isFilled = val !== undefined && val !== '' && val !== false;
    if (isFilled) filled++;
    if (field.required && isFilled) requiredFilled++;
  }

  const requiredTotal = section.fields.filter((f) => f.required).length;
  return {
    total: section.fields.length,
    filled,
    requiredTotal,
    requiredFilled,
    complete: requiredFilled >= requiredTotal,
  };
}

export function computeOverallProgress(
  sections: FormSectionDef[],
  values: FormValues
): { pct: number; sectionProgress: Record<string, SectionProgressData> } {
  const sectionProgress: Record<string, SectionProgressData> = {};
  let totalRequired = 0;
  let totalRequiredFilled = 0;

  for (const section of sections) {
    const sp = computeSectionProgress(section, values);
    sectionProgress[section.id] = sp;
    totalRequired += sp.requiredTotal;
    totalRequiredFilled += sp.requiredFilled;
  }

  const pct = totalRequired > 0 ? Math.round((totalRequiredFilled / totalRequired) * 100) : 100;
  return { pct, sectionProgress };
}