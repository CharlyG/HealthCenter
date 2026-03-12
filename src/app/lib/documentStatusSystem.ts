/**
 * Clinical Document Status System
 * 
 * Comprehensive status tracking and workflow management for clinical documents
 * 
 * Status Flow:
 * Draft → In Progress → Completed → Approved → Signed
 *                            ↓
 *                  Returned for Correction → Corrected → Approved
 */

// ═══════════════════════════════════════════════════════════════════════════
// STATUS TYPES AND ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export type DocumentStatus = 
  | 'draft'
  | 'in_progress'
  | 'completed'
  | 'returned_for_correction'
  | 'corrected'
  | 'approved'
  | 'signed';

export type DocumentStatusCategory = 
  | 'active'      // draft, in_progress
  | 'review'      // completed, corrected
  | 'issue'       // returned_for_correction
  | 'final';      // approved, signed

export interface DocumentStatusConfig {
  status: DocumentStatus;
  label: string;
  description: string;
  category: DocumentStatusCategory;
  color: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
  icon: string;
  allowedTransitions: DocumentStatus[];
  requiresComment?: boolean;
  requiresApprover?: boolean;
  isLocked?: boolean;
}

export interface StatusChangeEvent {
  id: string;
  documentId: string;
  documentType: string;
  previousStatus: DocumentStatus;
  newStatus: DocumentStatus;
  changedBy: string;
  changedByName: string;
  changedByRole: string;
  changedAt: string;
  comment?: string;
  reason?: string;
  approverName?: string;
  metadata?: Record<string, any>;
}

export interface DocumentStatusMetrics {
  totalDocuments: number;
  byStatus: Record<DocumentStatus, number>;
  averageTimeInStatus: Record<DocumentStatus, number>; // minutes
  returnedCount: number;
  avgCorrectionTime: number; // minutes
  completionRate: number; // percentage
  signatureRate: number; // percentage
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const DOCUMENT_STATUS_CONFIGS: Record<DocumentStatus, DocumentStatusConfig> = {
  draft: {
    status: 'draft',
    label: 'Draft',
    description: 'Document has been created but work has not started',
    category: 'active',
    color: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      border: 'border-gray-300',
      dot: 'bg-gray-500'
    },
    icon: 'file-text',
    allowedTransitions: ['in_progress'],
    isLocked: false,
  },
  in_progress: {
    status: 'in_progress',
    label: 'In Progress',
    description: 'Document is actively being worked on',
    category: 'active',
    color: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
      dot: 'bg-blue-500'
    },
    icon: 'clock',
    allowedTransitions: ['completed', 'draft'],
    isLocked: false,
  },
  completed: {
    status: 'completed',
    label: 'Completed',
    description: 'Document is complete and ready for review',
    category: 'review',
    color: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-300',
      dot: 'bg-purple-500'
    },
    icon: 'check-circle',
    allowedTransitions: ['approved', 'returned_for_correction', 'in_progress'],
    isLocked: false,
  },
  returned_for_correction: {
    status: 'returned_for_correction',
    label: 'Returned for Correction',
    description: 'Document has been returned with feedback for corrections',
    category: 'issue',
    color: {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-300',
      dot: 'bg-amber-500'
    },
    icon: 'alert-circle',
    allowedTransitions: ['corrected'],
    requiresComment: true,
    requiresApprover: true,
    isLocked: false,
  },
  corrected: {
    status: 'corrected',
    label: 'Corrected',
    description: 'Corrections have been made and document is ready for re-review',
    category: 'review',
    color: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      border: 'border-indigo-300',
      dot: 'bg-indigo-500'
    },
    icon: 'check-square',
    allowedTransitions: ['approved', 'returned_for_correction'],
    isLocked: false,
  },
  approved: {
    status: 'approved',
    label: 'Approved',
    description: 'Document has been reviewed and approved, ready for signature',
    category: 'final',
    color: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      dot: 'bg-green-500'
    },
    icon: 'thumbs-up',
    allowedTransitions: ['signed', 'returned_for_correction'],
    requiresApprover: true,
    isLocked: false,
  },
  signed: {
    status: 'signed',
    label: 'Signed',
    description: 'Document has been electronically signed and is locked',
    category: 'final',
    color: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      dot: 'bg-emerald-500'
    },
    icon: 'shield-check',
    allowedTransitions: [], // Terminal state
    isLocked: true,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// STATUS VALIDATION AND TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════

export interface StatusTransitionRequest {
  documentId: string;
  currentStatus: DocumentStatus;
  newStatus: DocumentStatus;
  userId: string;
  userName: string;
  userRole: string;
  comment?: string;
  reason?: string;
}

export interface StatusTransitionResult {
  success: boolean;
  error?: string;
  event?: StatusChangeEvent;
  requiresApproval?: boolean;
  requiresComment?: boolean;
}

export function canTransitionStatus(
  currentStatus: DocumentStatus,
  newStatus: DocumentStatus
): boolean {
  const config = DOCUMENT_STATUS_CONFIGS[currentStatus];
  return config.allowedTransitions.includes(newStatus);
}

export function validateStatusTransition(
  request: StatusTransitionRequest
): StatusTransitionResult {
  const { currentStatus, newStatus, comment } = request;
  
  // Check if transition is allowed
  if (!canTransitionStatus(currentStatus, newStatus)) {
    return {
      success: false,
      error: `Cannot transition from ${currentStatus} to ${newStatus}. Invalid status flow.`
    };
  }
  
  // Check if comment is required
  const newStatusConfig = DOCUMENT_STATUS_CONFIGS[newStatus];
  if (newStatusConfig.requiresComment && !comment) {
    return {
      success: false,
      requiresComment: true,
      error: `Comment is required when transitioning to ${newStatusConfig.label}`
    };
  }
  
  // Check if approver is required
  if (newStatusConfig.requiresApprover) {
    // In production, check if user has approver role
    return {
      success: true,
      requiresApproval: true,
    };
  }
  
  return { success: true };
}

export function createStatusChangeEvent(
  request: StatusTransitionRequest
): StatusChangeEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    documentId: request.documentId,
    documentType: 'clinical_document', // Would be passed in real implementation
    previousStatus: request.currentStatus,
    newStatus: request.newStatus,
    changedBy: request.userId,
    changedByName: request.userName,
    changedByRole: request.userRole,
    changedAt: new Date().toISOString(),
    comment: request.comment,
    reason: request.reason,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS METRICS AND ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════

export function calculateStatusMetrics(
  documents: Array<{ status: DocumentStatus; createdAt: string; completedAt?: string }>
): DocumentStatusMetrics {
  const total = documents.length;
  const byStatus: Record<DocumentStatus, number> = {
    draft: 0,
    in_progress: 0,
    completed: 0,
    returned_for_correction: 0,
    corrected: 0,
    approved: 0,
    signed: 0,
  };
  
  let returnedCount = 0;
  let signedCount = 0;
  let completedCount = 0;
  
  documents.forEach(doc => {
    byStatus[doc.status]++;
    if (doc.status === 'returned_for_correction') returnedCount++;
    if (doc.status === 'signed') signedCount++;
    if (['completed', 'approved', 'signed'].includes(doc.status)) completedCount++;
  });
  
  return {
    totalDocuments: total,
    byStatus,
    averageTimeInStatus: {} as Record<DocumentStatus, number>, // Would calculate from events
    returnedCount,
    avgCorrectionTime: 0, // Would calculate from events
    completionRate: total > 0 ? (completedCount / total) * 100 : 0,
    signatureRate: total > 0 ? (signedCount / total) * 100 : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function getStatusConfig(status: DocumentStatus): DocumentStatusConfig {
  return DOCUMENT_STATUS_CONFIGS[status];
}

export function getStatusCategory(status: DocumentStatus): DocumentStatusCategory {
  return DOCUMENT_STATUS_CONFIGS[status].category;
}

export function isStatusLocked(status: DocumentStatus): boolean {
  return DOCUMENT_STATUS_CONFIGS[status].isLocked || false;
}

export function getNextPossibleStatuses(currentStatus: DocumentStatus): DocumentStatus[] {
  return DOCUMENT_STATUS_CONFIGS[currentStatus].allowedTransitions;
}

export function formatStatusLabel(status: DocumentStatus): string {
  return DOCUMENT_STATUS_CONFIGS[status].label;
}

export function getStatusesByCategory(category: DocumentStatusCategory): DocumentStatus[] {
  return Object.values(DOCUMENT_STATUS_CONFIGS)
    .filter(config => config.category === category)
    .map(config => config.status);
}
