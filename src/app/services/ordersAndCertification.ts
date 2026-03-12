/**
 * Orders and Certification Architecture Service
 * 
 * Comprehensive system for managing physician orders, verbal orders, plan of care,
 * recertification, and discharge certification documents within patient admissions.
 * Treats documents as operational workflow items with full lifecycle tracking.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type DocumentCategory =
  | 'physician-order'
  | 'verbal-order'
  | 'plan-of-care'
  | 'recertification'
  | 'discharge-certification';

export type DocumentStatus =
  | 'draft'
  | 'pending-review'
  | 'pending-signature'
  | 'signed'
  | 'active'
  | 'expired'
  | 'superseded'
  | 'cancelled';

export type SignatureStatus =
  | 'not-required'
  | 'pending-physician'
  | 'pending-nurse'
  | 'pending-both'
  | 'partially-signed'
  | 'fully-signed';

export type OrderType =
  | 'start-of-care'
  | 'routine'
  | 'prn'
  | 'medication'
  | 'treatment'
  | 'therapy'
  | 'hospice-admission'
  | 'hospice-revocation'
  | 'discharge';

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT MODEL
// ═══════════════════════════════════════════════════════════════════════════

export interface OrderCertificationDocument {
  id: string;
  category: DocumentCategory;
  type: OrderType;
  
  // Admission Association
  admissionId: string;
  patientId: string;
  episodeId?: string;
  
  // Dates
  orderDate: string; // When order was written
  effectiveDate: string; // When order becomes effective
  expirationDate?: string; // When order expires (if applicable)
  createdAt: string;
  updatedAt: string;
  
  // People
  orderingPhysician: Physician;
  createdBy: ClinicalUser;
  lastModifiedBy: ClinicalUser;
  
  // Workflow State
  status: DocumentStatus;
  signatureStatus: SignatureStatus;
  
  // Content
  content: DocumentContent;
  
  // Signatures
  signatures: Signature[];
  
  // Workflow Tracking
  workflow: WorkflowTracking;
  
  // Metadata
  metadata: DocumentMetadata;
}

export interface Physician {
  id: string;
  name: string;
  npi: string;
  specialty?: string;
  phone?: string;
  fax?: string;
}

export interface ClinicalUser {
  id: string;
  name: string;
  role: string;
  credentials?: string;
}

export interface DocumentContent {
  // Plan of Care / 485 specific
  certificationPeriod?: {
    start: string;
    end: string;
  };
  diagnoses?: Diagnosis[];
  disciplines?: DisciplineOrder[];
  frequencyDuration?: FrequencyDuration[];
  
  // Physician Order specific
  orderText?: string;
  orderInstructions?: string;
  medications?: MedicationOrder[];
  treatments?: TreatmentOrder[];
  
  // Verbal Order specific
  verbalOrderDetails?: {
    takenBy: ClinicalUser;
    takenDate: string;
    readBack: boolean;
    readBackBy?: string;
  };
  
  // Discharge Certification specific
  dischargeDetails?: {
    dischargeDate: string;
    dischargeReason: string;
    dischargeDisposition: string;
    goalsMet: boolean;
  };
  
  // Recertification specific
  recertificationDetails?: {
    previousPeriodStart: string;
    previousPeriodEnd: string;
    newPeriodStart: string;
    newPeriodEnd: string;
    continuedNeedJustification: string;
  };
  
  // Attachments
  attachments?: Attachment[];
  
  // Free-form notes
  notes?: string;
}

export interface Diagnosis {
  code: string; // ICD-10 code
  description: string;
  type: 'primary' | 'secondary' | 'other';
  rank?: number;
}

export interface DisciplineOrder {
  discipline: 'SN' | 'PT' | 'OT' | 'ST' | 'MSW' | 'HHA';
  frequency: string; // e.g., "3x/week"
  duration: string; // e.g., "60 days"
  goal?: string;
}

export interface FrequencyDuration {
  discipline: string;
  visits: number;
  period: string; // e.g., "per week", "per 60 days"
}

export interface MedicationOrder {
  medicationName: string;
  dosage: string;
  route: string;
  frequency: string;
  indication: string;
  startDate?: string;
  endDate?: string;
}

export interface TreatmentOrder {
  treatmentType: string;
  instructions: string;
  frequency: string;
  duration?: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// SIGNATURE MODEL
// ═══════════════════════════════════════════════════════════════════════════

export interface Signature {
  id: string;
  signerType: 'physician' | 'nurse' | 'therapist' | 'social-worker';
  signerName: string;
  signerId: string;
  signerCredentials?: string;
  signedAt?: string;
  status: 'pending' | 'signed' | 'declined';
  signatureMethod?: 'electronic' | 'wet' | 'verbal';
  ipAddress?: string;
  declineReason?: string;
  
  // For tracking reminder workflow
  remindersSent?: number;
  lastReminderSent?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// WORKFLOW TRACKING
// ═══════════════════════════════════════════════════════════════════════════

export interface WorkflowTracking {
  currentStep: WorkflowStep;
  completedSteps: WorkflowStep[];
  pendingSteps: WorkflowStep[];
  
  timeline: WorkflowEvent[];
  
  // Compliance tracking
  compliance: {
    isCompliant: boolean;
    issues: ComplianceIssue[];
  };
  
  // Review tracking
  reviews: Review[];
  
  // Expiration tracking
  daysUntilExpiration?: number;
  expirationWarning?: 'critical' | 'warning' | 'info';
}

export type WorkflowStep =
  | 'created'
  | 'content-entry'
  | 'clinical-review'
  | 'sent-for-signature'
  | 'physician-signed'
  | 'nurse-cosigned'
  | 'activated'
  | 'filed'
  | 'expired'
  | 'superseded';

export interface WorkflowEvent {
  id: string;
  step: WorkflowStep;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  notes?: string;
}

export interface ComplianceIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  message: string;
  resolutionRequired: boolean;
}

export interface Review {
  id: string;
  reviewedBy: ClinicalUser;
  reviewedAt: string;
  status: 'approved' | 'rejected' | 'needs-revision';
  comments?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT METADATA
// ═══════════════════════════════════════════════════════════════════════════

export interface DocumentMetadata {
  version: number;
  previousVersionId?: string;
  
  // Regulatory
  regulatoryRequirements?: string[];
  cmsCompliant: boolean;
  
  // Source
  source: 'manual' | 'fax' | 'ehr-import' | 'verbal';
  
  // Tags for organization
  tags?: string[];
  
  // Related documents
  relatedDocuments?: {
    documentId: string;
    relationship: 'supersedes' | 'superseded-by' | 'referenced-by' | 'references';
  }[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const DOCUMENT_CATEGORY_CONFIG: Record<
  DocumentCategory,
  {
    label: string;
    description: string;
    icon: string;
    color: string;
    requiresPhysicianSignature: boolean;
    requiresNurseSignature: boolean;
    typicalExpiration?: string; // e.g., "60 days", "never"
    regulatoryRequirements: string[];
  }
> = {
  'physician-order': {
    label: 'Physician Order',
    description: 'Orders written by attending physician',
    icon: 'file-text',
    color: '#3B82F6',
    requiresPhysicianSignature: true,
    requiresNurseSignature: false,
    typicalExpiration: '60 days',
    regulatoryRequirements: ['Valid physician signature', 'Date and time', 'Specific instructions'],
  },
  'verbal-order': {
    label: 'Verbal Order',
    description: 'Orders received verbally and documented',
    icon: 'phone',
    color: '#F59E0B',
    requiresPhysicianSignature: true,
    requiresNurseSignature: true,
    typicalExpiration: '60 days',
    regulatoryRequirements: [
      'Read-back verification',
      'Physician signature within timeframe',
      'Nurse signature',
    ],
  },
  'plan-of-care': {
    label: 'Plan of Care (485)',
    description: 'CMS 485 Plan of Care form',
    icon: 'clipboard-list',
    color: '#10B981',
    requiresPhysicianSignature: true,
    requiresNurseSignature: false,
    typicalExpiration: '60 days',
    regulatoryRequirements: [
      'Physician certification of homebound status',
      'Specific disciplines and frequencies',
      'Signed before or within 30 days of start',
    ],
  },
  'recertification': {
    label: 'Recertification',
    description: 'Recertification for continued care',
    icon: 'refresh-cw',
    color: '#8B5CF6',
    requiresPhysicianSignature: true,
    requiresNurseSignature: false,
    typicalExpiration: '60 days',
    regulatoryRequirements: [
      'Justification for continued need',
      'Updated goals and interventions',
      'Physician re-certification',
    ],
  },
  'discharge-certification': {
    label: 'Discharge Certification',
    description: 'Discharge summary and certification',
    icon: 'check-circle',
    color: '#EF4444',
    requiresPhysicianSignature: true,
    requiresNurseSignature: false,
    typicalExpiration: 'never',
    regulatoryRequirements: [
      'Discharge date and reason',
      'Goals met assessment',
      'Physician acknowledgment',
    ],
  },
};

export const STATUS_CONFIG: Record<
  DocumentStatus,
  {
    label: string;
    color: string;
    bgColor: string;
    description: string;
  }
> = {
  draft: {
    label: 'Draft',
    color: '#6B7280',
    bgColor: '#F9FAFB',
    description: 'Document is being created',
  },
  'pending-review': {
    label: 'Pending Review',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    description: 'Awaiting clinical review',
  },
  'pending-signature': {
    label: 'Pending Signature',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    description: 'Sent for physician signature',
  },
  signed: {
    label: 'Signed',
    color: '#10B981',
    bgColor: '#D1FAE5',
    description: 'All signatures obtained',
  },
  active: {
    label: 'Active',
    color: '#10B981',
    bgColor: '#D1FAE5',
    description: 'Currently in effect',
  },
  expired: {
    label: 'Expired',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    description: 'Certification period ended',
  },
  superseded: {
    label: 'Superseded',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    description: 'Replaced by newer version',
  },
  cancelled: {
    label: 'Cancelled',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    description: 'Cancelled before completion',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockOrderDocument(
  category: DocumentCategory,
  admissionId: string
): OrderCertificationDocument {
  const now = new Date();
  const orderDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
  const effectiveDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  
  const categoryConfig = DOCUMENT_CATEGORY_CONFIG[category];
  
  let status: DocumentStatus = 'active';
  let signatureStatus: SignatureStatus = 'fully-signed';
  
  if (category === 'verbal-order' && Math.random() > 0.5) {
    status = 'pending-signature';
    signatureStatus = 'partially-signed';
  }
  
  const doc: OrderCertificationDocument = {
    id: `DOC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    category,
    type: category === 'plan-of-care' ? 'start-of-care' : 'routine',
    admissionId,
    patientId: 'PAT-12345',
    episodeId: 'EP-12345',
    orderDate: orderDate.toISOString(),
    effectiveDate: effectiveDate.toISOString(),
    expirationDate:
      categoryConfig.typicalExpiration !== 'never'
        ? new Date(effectiveDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
    createdAt: orderDate.toISOString(),
    updatedAt: now.toISOString(),
    orderingPhysician: {
      id: 'PHY-001',
      name: 'Dr. Sarah Mitchell',
      npi: '1234567890',
      specialty: 'Internal Medicine',
      phone: '555-0123',
    },
    createdBy: {
      id: 'USER-001',
      name: 'Emily Chen, RN',
      role: 'Registered Nurse',
      credentials: 'RN, BSN',
    },
    lastModifiedBy: {
      id: 'USER-001',
      name: 'Emily Chen, RN',
      role: 'Registered Nurse',
      credentials: 'RN, BSN',
    },
    status,
    signatureStatus,
    content: generateMockContent(category),
    signatures: generateMockSignatures(category, signatureStatus),
    workflow: generateMockWorkflow(status),
    metadata: {
      version: 1,
      regulatoryRequirements: categoryConfig.regulatoryRequirements,
      cmsCompliant: true,
      source: category === 'verbal-order' ? 'verbal' : 'manual',
      tags: [category, 'active-admission'],
    },
  };
  
  return doc;
}

function generateMockContent(category: DocumentCategory): DocumentContent {
  const content: DocumentContent = {};
  
  if (category === 'plan-of-care' || category === 'recertification') {
    content.certificationPeriod = {
      start: new Date().toISOString().split('T')[0],
      end: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    content.diagnoses = [
      { code: 'I50.9', description: 'Heart failure, unspecified', type: 'primary', rank: 1 },
      { code: 'E11.9', description: 'Type 2 diabetes mellitus', type: 'secondary', rank: 2 },
    ];
    content.disciplines = [
      { discipline: 'SN', frequency: '3x/week', duration: '60 days', goal: 'Medication management' },
      { discipline: 'PT', frequency: '2x/week', duration: '60 days', goal: 'Improve mobility' },
    ];
    content.frequencyDuration = [
      { discipline: 'SN', visits: 36, period: 'per 60 days' },
      { discipline: 'PT', visits: 24, period: 'per 60 days' },
    ];
  }
  
  if (category === 'physician-order') {
    content.orderText = 'Continue current medication regimen';
    content.orderInstructions = 'Monitor vital signs, assess wound healing, provide patient education';
    content.medications = [
      {
        medicationName: 'Metoprolol',
        dosage: '50mg',
        route: 'PO',
        frequency: 'BID',
        indication: 'Hypertension',
      },
    ];
  }
  
  if (category === 'verbal-order') {
    content.orderText = 'Increase Lasix to 40mg PO daily';
    content.verbalOrderDetails = {
      takenBy: { id: 'USER-002', name: 'Jane Smith, RN', role: 'RN' },
      takenDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      readBack: true,
      readBackBy: 'Jane Smith, RN',
    };
  }
  
  if (category === 'discharge-certification') {
    content.dischargeDetails = {
      dischargeDate: new Date().toISOString().split('T')[0],
      dischargeReason: 'Goals met',
      dischargeDisposition: 'Self-care',
      goalsMet: true,
    };
  }
  
  if (category === 'recertification') {
    content.recertificationDetails = {
      previousPeriodStart: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      previousPeriodEnd: new Date().toISOString().split('T')[0],
      newPeriodStart: new Date().toISOString().split('T')[0],
      newPeriodEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      continuedNeedJustification:
        'Patient continues to require skilled nursing for medication management and wound care',
    };
  }
  
  content.notes = 'All orders reviewed and approved by care team';
  
  return content;
}

function generateMockSignatures(
  category: DocumentCategory,
  signatureStatus: SignatureStatus
): Signature[] {
  const signatures: Signature[] = [];
  const config = DOCUMENT_CATEGORY_CONFIG[category];
  
  if (config.requiresPhysicianSignature) {
    signatures.push({
      id: 'SIG-001',
      signerType: 'physician',
      signerName: 'Dr. Sarah Mitchell',
      signerId: 'PHY-001',
      signerCredentials: 'MD',
      signedAt: signatureStatus === 'fully-signed' ? new Date().toISOString() : undefined,
      status: signatureStatus === 'fully-signed' ? 'signed' : 'pending',
      signatureMethod: 'electronic',
    });
  }
  
  if (config.requiresNurseSignature) {
    signatures.push({
      id: 'SIG-002',
      signerType: 'nurse',
      signerName: 'Emily Chen',
      signerId: 'USER-001',
      signerCredentials: 'RN, BSN',
      signedAt: new Date().toISOString(),
      status: 'signed',
      signatureMethod: 'electronic',
    });
  }
  
  return signatures;
}

function generateMockWorkflow(status: DocumentStatus): WorkflowTracking {
  const timeline: WorkflowEvent[] = [
    {
      id: 'EVT-001',
      step: 'created',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'USER-001',
      userName: 'Emily Chen, RN',
      action: 'Document created',
    },
    {
      id: 'EVT-002',
      step: 'content-entry',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'USER-001',
      userName: 'Emily Chen, RN',
      action: 'Content completed',
    },
    {
      id: 'EVT-003',
      step: 'clinical-review',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'USER-003',
      userName: 'Michael Torres, RN Supervisor',
      action: 'Clinical review approved',
    },
  ];
  
  if (status === 'active' || status === 'signed') {
    timeline.push({
      id: 'EVT-004',
      step: 'sent-for-signature',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'USER-001',
      userName: 'Emily Chen, RN',
      action: 'Sent to physician for signature',
    });
    timeline.push({
      id: 'EVT-005',
      step: 'physician-signed',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'PHY-001',
      userName: 'Dr. Sarah Mitchell',
      action: 'Physician signature obtained',
    });
    timeline.push({
      id: 'EVT-006',
      step: 'activated',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      userId: 'USER-001',
      userName: 'Emily Chen, RN',
      action: 'Order activated',
    });
  }
  
  return {
    currentStep: status === 'active' ? 'activated' : 'sent-for-signature',
    completedSteps: timeline.map(e => e.step),
    pendingSteps: status === 'pending-signature' ? ['physician-signed', 'activated'] : [],
    timeline,
    compliance: {
      isCompliant: true,
      issues: [],
    },
    reviews: [
      {
        id: 'REV-001',
        reviewedBy: {
          id: 'USER-003',
          name: 'Michael Torres',
          role: 'RN Supervisor',
          credentials: 'RN, MSN',
        },
        reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'approved',
      },
    ],
    daysUntilExpiration: 57,
    expirationWarning: undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateExpirationWarning(expirationDate: string): {
  daysUntil: number;
  warningLevel?: 'critical' | 'warning' | 'info';
} {
  const now = new Date();
  const expiration = new Date(expirationDate);
  const daysUntil = Math.floor((expiration.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  
  let warningLevel: 'critical' | 'warning' | 'info' | undefined;
  if (daysUntil <= 7) warningLevel = 'critical';
  else if (daysUntil <= 14) warningLevel = 'warning';
  else if (daysUntil <= 30) warningLevel = 'info';
  
  return { daysUntil, warningLevel };
}

export function getDocumentsByAdmission(admissionId: string): OrderCertificationDocument[] {
  // In real implementation, this would query the database
  return [
    generateMockOrderDocument('plan-of-care', admissionId),
    generateMockOrderDocument('physician-order', admissionId),
    generateMockOrderDocument('verbal-order', admissionId),
  ];
}

export function getDocumentsByCategory(
  documents: OrderCertificationDocument[],
  category: DocumentCategory
): OrderCertificationDocument[] {
  return documents.filter(doc => doc.category === category);
}

export function getPendingSignatures(
  documents: OrderCertificationDocument[]
): OrderCertificationDocument[] {
  return documents.filter(
    doc => doc.signatureStatus !== 'fully-signed' && doc.signatureStatus !== 'not-required'
  );
}

export function getExpiringDocuments(
  documents: OrderCertificationDocument[],
  daysThreshold: number = 14
): OrderCertificationDocument[] {
  return documents.filter(doc => {
    if (!doc.expirationDate) return false;
    const { daysUntil } = calculateExpirationWarning(doc.expirationDate);
    return daysUntil <= daysThreshold;
  });
}
