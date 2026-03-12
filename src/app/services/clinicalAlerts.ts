/**
 * Clinical Alerts Service
 * 
 * Centralizes clinical alert detection and management across all clinical modules.
 * Surfaces critical issues that require immediate attention from clinicians and coordinators.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ClinicalAlert {
  id: string;
  admissionId: string;
  patientId: string;
  patientName: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  detectedDate: string; // ISO date
  context: AlertContext;
  suggestedAction: string;
  quickActions: QuickAction[];
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedDate?: string;
  resolvedBy?: string;
  resolvedDate?: string;
  resolutionNotes?: string;
  metadata?: Record<string, any>; // Additional data specific to alert type
}

export type AlertCategory =
  | 'medication' // Medication-related alerts
  | 'fall-risk' // Fall risk assessment
  | 'wound' // Wound deterioration
  | 'visit' // Missed or late visits
  | 'documentation' // Incomplete documentation
  | 'orders' // Unsigned orders
  | 'assessment' // Assessment due or overdue
  | 'clinical-change' // Clinical status changes
  | 'safety' // Patient safety issues
  | 'compliance'; // Regulatory compliance

export type AlertSeverity =
  | 'critical' // Requires immediate action
  | 'high' // Urgent attention needed
  | 'medium' // Should be addressed soon
  | 'low'; // For awareness

export type AlertStatus =
  | 'active' // Currently active
  | 'acknowledged' // Clinician aware
  | 'resolved' // Issue resolved
  | 'dismissed'; // Not applicable

export interface AlertContext {
  visitId?: string;
  visitDate?: string;
  disciplineType?: string;
  documentId?: string;
  documentType?: string;
  orderId?: string;
  medicationId?: string;
  woundId?: string;
  assessmentId?: string;
  assessmentType?: string;
  relatedDate?: string;
  additionalInfo?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string; // Action type identifier
  route?: string; // Navigation route if action is to navigate
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const ALERT_CATEGORY_CONFIG: Record<
  AlertCategory,
  { label: string; icon: string; color: string; description: string }
> = {
  medication: {
    label: 'Medication',
    icon: 'pill',
    color: '#7C3AED',
    description: 'Medication-related alerts and interactions',
  },
  'fall-risk': {
    label: 'Fall Risk',
    icon: 'alert-triangle',
    color: '#F59E0B',
    description: 'Fall risk assessment and prevention',
  },
  wound: {
    label: 'Wound',
    icon: 'activity',
    color: '#EF4444',
    description: 'Wound deterioration and care alerts',
  },
  visit: {
    label: 'Visit',
    icon: 'calendar',
    color: '#3B82F6',
    description: 'Missed or late visit patterns',
  },
  documentation: {
    label: 'Documentation',
    icon: 'file-text',
    color: '#10B981',
    description: 'Incomplete or missing documentation',
  },
  orders: {
    label: 'Orders',
    icon: 'clipboard',
    color: '#EC4899',
    description: 'Unsigned or pending orders',
  },
  assessment: {
    label: 'Assessment',
    icon: 'check-circle',
    color: '#06B6D4',
    description: 'Assessment due or overdue',
  },
  'clinical-change': {
    label: 'Clinical Change',
    icon: 'trending-up',
    color: '#F97316',
    description: 'Significant clinical status changes',
  },
  safety: {
    label: 'Safety',
    icon: 'shield',
    color: '#DC2626',
    description: 'Patient safety concerns',
  },
  compliance: {
    label: 'Compliance',
    icon: 'alert-circle',
    color: '#8B5CF6',
    description: 'Regulatory compliance issues',
  },
};

export const ALERT_SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; color: string; bgColor: string; icon: string; priority: number }
> = {
  critical: {
    label: 'Critical',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    icon: 'alert-circle',
    priority: 1,
  },
  high: {
    label: 'High',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    icon: 'alert-triangle',
    priority: 2,
  },
  medium: {
    label: 'Medium',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    icon: 'info',
    priority: 3,
  },
  low: {
    label: 'Low',
    color: '#6B7280',
    bgColor: '#F3F4F6',
    icon: 'info',
    priority: 4,
  },
};

export const ALERT_STATUS_CONFIG: Record<
  AlertStatus,
  { label: string; color: string; icon: string }
> = {
  active: {
    label: 'Active',
    color: '#EF4444',
    icon: 'alert-circle',
  },
  acknowledged: {
    label: 'Acknowledged',
    color: '#F59E0B',
    icon: 'eye',
  },
  resolved: {
    label: 'Resolved',
    color: '#10B981',
    icon: 'check-circle',
  },
  dismissed: {
    label: 'Dismissed',
    color: '#6B7280',
    icon: 'x-circle',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ALERT DETECTION RULES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Alert detection rules that scan various clinical data sources
 * and generate alerts based on predefined criteria
 */

// Medication Alert Rules
export const MEDICATION_ALERT_RULES = {
  drugInteraction: {
    severity: 'critical' as AlertSeverity,
    title: 'Critical Drug Interaction',
    actionLabel: 'Review Medications',
  },
  allergyConflict: {
    severity: 'critical' as AlertSeverity,
    title: 'Allergy Conflict Detected',
    actionLabel: 'Review Allergy',
  },
  duplicateTherapy: {
    severity: 'high' as AlertSeverity,
    title: 'Duplicate Therapy',
    actionLabel: 'Review Medications',
  },
  dosageExceeded: {
    severity: 'high' as AlertSeverity,
    title: 'Dosage Exceeds Limit',
    actionLabel: 'Verify Dosage',
  },
};

// Fall Risk Rules
export const FALL_RISK_RULES = {
  highRisk: {
    severity: 'high' as AlertSeverity,
    title: 'High Fall Risk',
    threshold: 45, // Morse Fall Scale score
  },
  moderateRisk: {
    severity: 'medium' as AlertSeverity,
    title: 'Moderate Fall Risk',
    threshold: 25,
  },
};

// Wound Alert Rules
export const WOUND_ALERT_RULES = {
  deteriorating: {
    severity: 'critical' as AlertSeverity,
    title: 'Wound Deteriorating',
    percentChangeThreshold: 20, // 20% increase in size
  },
  infected: {
    severity: 'critical' as AlertSeverity,
    title: 'Wound Shows Signs of Infection',
  },
  notAssessedRecently: {
    severity: 'high' as AlertSeverity,
    title: 'Wound Not Assessed Recently',
    daysThreshold: 7,
  },
};

// Visit Alert Rules
export const VISIT_ALERT_RULES = {
  missedVisits: {
    severity: 'high' as AlertSeverity,
    title: 'Multiple Missed Visits',
    countThreshold: 2,
  },
  behindSchedule: {
    severity: 'medium' as AlertSeverity,
    title: 'Visit Frequency Behind Schedule',
  },
  notVisitedRecently: {
    severity: 'medium' as AlertSeverity,
    title: 'Patient Not Visited Recently',
    daysThreshold: 10,
  },
};

// Documentation Alert Rules
export const DOCUMENTATION_ALERT_RULES = {
  incompleteVisitNote: {
    severity: 'high' as AlertSeverity,
    title: 'Incomplete Visit Documentation',
    hoursThreshold: 24,
  },
  pendingCosign: {
    severity: 'medium' as AlertSeverity,
    title: 'Visit Note Pending Cosign',
    daysThreshold: 3,
  },
  missingAssessment: {
    severity: 'high' as AlertSeverity,
    title: 'Required Assessment Missing',
  },
};

// Orders Alert Rules
export const ORDERS_ALERT_RULES = {
  unsignedOrder: {
    severity: 'critical' as AlertSeverity,
    title: 'Unsigned Physician Order',
    daysThreshold: 2,
  },
  expiringOrder: {
    severity: 'medium' as AlertSeverity,
    title: 'Order Expiring Soon',
    daysThreshold: 7,
  },
};

// Assessment Alert Rules
export const ASSESSMENT_ALERT_RULES = {
  overdueOasis: {
    severity: 'critical' as AlertSeverity,
    title: 'OASIS Assessment Overdue',
  },
  dueSoon: {
    severity: 'medium' as AlertSeverity,
    title: 'Assessment Due Soon',
    daysThreshold: 3,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// ALERT GENERATION FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate medication alerts
 */
export function generateMedicationAlerts(admissionId: string, medications: any[]): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  
  // Check for drug interactions
  const interactionAlert: ClinicalAlert = {
    id: 'alert-med-001',
    admissionId,
    patientId: 'PAT-12345',
    patientName: 'Margaret Johnson',
    category: 'medication',
    severity: 'critical',
    title: 'Critical Drug Interaction',
    description: 'Warfarin and Aspirin combination increases bleeding risk. Consider alternative therapy or increased monitoring.',
    detectedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    context: {
      medicationId: 'med-001,med-002',
      additionalInfo: 'Drug-Drug Interaction: Warfarin + Aspirin',
    },
    suggestedAction: 'Contact physician to review medications and consider alternative antiplatelet therapy',
    quickActions: [
      {
        id: 'qa-1',
        label: 'Review Medications',
        icon: 'pill',
        action: 'navigate',
        route: '/patient-medication-profile-view',
      },
      {
        id: 'qa-2',
        label: 'Contact Physician',
        icon: 'phone',
        action: 'contact-physician',
      },
      {
        id: 'qa-3',
        label: 'Acknowledge',
        icon: 'check',
        action: 'acknowledge',
      },
    ],
    status: 'active',
  };
  alerts.push(interactionAlert);

  return alerts;
}

/**
 * Generate fall risk alerts
 */
export function generateFallRiskAlerts(admissionId: string, fallRiskScore: number): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  
  if (fallRiskScore >= 45) {
    alerts.push({
      id: 'alert-fall-001',
      admissionId,
      patientId: 'PAT-12345',
      patientName: 'Margaret Johnson',
      category: 'fall-risk',
      severity: 'high',
      title: 'High Fall Risk Patient',
      description: `Patient has Morse Fall Scale score of ${fallRiskScore} (High Risk). History of falls, uses walker, and currently on medications affecting balance.`,
      detectedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      context: {
        additionalInfo: `Morse Fall Scale: ${fallRiskScore}/125`,
      },
      suggestedAction: 'Implement fall prevention protocol: ensure walker is accessible, review home safety, consider PT evaluation',
      quickActions: [
        {
          id: 'qa-1',
          label: 'View Assessment',
          icon: 'file-text',
          action: 'navigate',
          route: '/clinical-assessment-viewer',
        },
        {
          id: 'qa-2',
          label: 'Order PT Evaluation',
          icon: 'clipboard',
          action: 'order-pt',
        },
        {
          id: 'qa-3',
          label: 'Document Intervention',
          icon: 'edit',
          action: 'document',
        },
      ],
      status: 'active',
    });
  }

  return alerts;
}

/**
 * Generate wound alerts
 */
export function generateWoundAlerts(admissionId: string, wounds: any[]): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  
  // Example: Deteriorating wound
  alerts.push({
    id: 'alert-wound-001',
    admissionId,
    patientId: 'PAT-12345',
    patientName: 'Margaret Johnson',
    category: 'wound',
    severity: 'critical',
    title: 'Wound Deteriorating - Sacrum',
    description: 'Sacral pressure injury has increased in size by 25% over the past week. Increased slough and drainage noted.',
    detectedDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    context: {
      woundId: 'wound-001',
      additionalInfo: 'Size increased from 8.5 cm² to 10.6 cm² (+25%)',
    },
    suggestedAction: 'Consult wound care specialist. Consider treatment modification. Increase assessment frequency.',
    quickActions: [
      {
        id: 'qa-1',
        label: 'View Wound Details',
        icon: 'activity',
        action: 'navigate',
        route: '/wound-care-tracking',
      },
      {
        id: 'qa-2',
        label: 'Consult Wound Care',
        icon: 'user',
        action: 'consult-specialist',
      },
      {
        id: 'qa-3',
        label: 'Update Treatment',
        icon: 'edit',
        action: 'update-treatment',
      },
    ],
    status: 'active',
  });

  return alerts;
}

/**
 * Generate visit alerts
 */
export function generateVisitAlerts(admissionId: string, visitData: any): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  
  alerts.push({
    id: 'alert-visit-001',
    admissionId,
    patientId: 'PAT-12345',
    patientName: 'Margaret Johnson',
    category: 'visit',
    severity: 'high',
    title: 'Multiple Missed Visits - SN',
    description: 'Skilled Nursing has 2 missed visits in the past week. Patient is behind expected visit frequency (2W4).',
    detectedDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    context: {
      disciplineType: 'Skilled Nursing',
      additionalInfo: 'Expected: 4 visits to date, Completed: 2, Missed: 2',
    },
    suggestedAction: 'Contact patient to reschedule. Investigate barriers to care. Update care plan if needed.',
    quickActions: [
      {
        id: 'qa-1',
        label: 'View Schedule',
        icon: 'calendar',
        action: 'navigate',
        route: '/scheduling',
      },
      {
        id: 'qa-2',
        label: 'Contact Patient',
        icon: 'phone',
        action: 'contact-patient',
      },
      {
        id: 'qa-3',
        label: 'Reschedule Visits',
        icon: 'calendar-plus',
        action: 'reschedule',
      },
    ],
    status: 'active',
  });

  return alerts;
}

/**
 * Generate documentation alerts
 */
export function generateDocumentationAlerts(admissionId: string, documents: any[]): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  
  alerts.push({
    id: 'alert-doc-001',
    admissionId,
    patientId: 'PAT-12345',
    patientName: 'Margaret Johnson',
    category: 'documentation',
    severity: 'high',
    title: 'Incomplete Visit Documentation - PT',
    description: 'Physical Therapy visit from 2 days ago is incomplete. Missing vital signs and pain assessment.',
    detectedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    context: {
      visitId: 'visit-123',
      visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      disciplineType: 'Physical Therapy',
      documentType: 'Visit Note',
    },
    suggestedAction: 'Complete missing sections of visit documentation within 24 hours to maintain compliance',
    quickActions: [
      {
        id: 'qa-1',
        label: 'Complete Documentation',
        icon: 'edit',
        action: 'navigate',
        route: '/smart-documentation-editor-demo',
      },
      {
        id: 'qa-2',
        label: 'Assign to Clinician',
        icon: 'user-plus',
        action: 'assign',
      },
    ],
    status: 'active',
  });

  alerts.push({
    id: 'alert-doc-002',
    admissionId,
    patientId: 'PAT-12345',
    patientName: 'Margaret Johnson',
    category: 'documentation',
    severity: 'medium',
    title: 'Visit Note Pending Cosign',
    description: 'SN visit note from 3 days ago requires supervisory cosignature. Waiting for RN Supervisor review.',
    detectedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    context: {
      visitId: 'visit-120',
      visitDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      disciplineType: 'Skilled Nursing',
      documentType: 'Visit Note',
    },
    suggestedAction: 'Follow up with RN Supervisor to complete cosignature review',
    quickActions: [
      {
        id: 'qa-1',
        label: 'View Document',
        icon: 'file-text',
        action: 'navigate',
        route: '/cosign-queue',
      },
      {
        id: 'qa-2',
        label: 'Remind Supervisor',
        icon: 'bell',
        action: 'send-reminder',
      },
    ],
    status: 'active',
  });

  return alerts;
}

/**
 * Generate orders alerts
 */
export function generateOrdersAlerts(admissionId: string, orders: any[]): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  
  alerts.push({
    id: 'alert-order-001',
    admissionId,
    patientId: 'PAT-12345',
    patientName: 'Margaret Johnson',
    category: 'orders',
    severity: 'critical',
    title: 'Unsigned Physician Order',
    description: 'Verbal order for Lisinopril 10mg daily requires physician signature. Order is 2 days old.',
    detectedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    context: {
      orderId: 'order-001',
      additionalInfo: 'Lisinopril 10mg PO daily',
      relatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    suggestedAction: 'Contact Dr. Chen immediately to obtain signature. Order must be signed within 48 hours.',
    quickActions: [
      {
        id: 'qa-1',
        label: 'View Order',
        icon: 'clipboard',
        action: 'navigate',
        route: '/verbal-orders',
      },
      {
        id: 'qa-2',
        label: 'Contact Physician',
        icon: 'phone',
        action: 'contact-physician',
      },
      {
        id: 'qa-3',
        label: 'Send for Signature',
        icon: 'send',
        action: 'send-signature-request',
      },
    ],
    status: 'active',
  });

  return alerts;
}

/**
 * Generate assessment alerts
 */
export function generateAssessmentAlerts(admissionId: string, assessments: any[]): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  
  alerts.push({
    id: 'alert-assess-001',
    admissionId,
    patientId: 'PAT-12345',
    patientName: 'Margaret Johnson',
    category: 'assessment',
    severity: 'critical',
    title: 'OASIS Recertification Assessment Overdue',
    description: 'OASIS-E recertification assessment is overdue by 3 days. Required for continued payment authorization.',
    detectedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    context: {
      assessmentType: 'OASIS-E Recertification',
      relatedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    suggestedAction: 'Complete OASIS recertification assessment immediately to maintain billing compliance',
    quickActions: [
      {
        id: 'qa-1',
        label: 'Start Assessment',
        icon: 'clipboard-check',
        action: 'navigate',
        route: '/oasis-assessment-editor-improved',
      },
      {
        id: 'qa-2',
        label: 'Assign to Clinician',
        icon: 'user-plus',
        action: 'assign',
      },
    ],
    status: 'active',
  });

  alerts.push({
    id: 'alert-assess-002',
    admissionId,
    patientId: 'PAT-12345',
    patientName: 'Margaret Johnson',
    category: 'assessment',
    severity: 'medium',
    title: 'Pain Reassessment Due',
    description: 'Patient reported increased pain (8/10) at last visit. Follow-up pain assessment due within 48 hours.',
    detectedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    context: {
      assessmentType: 'Pain Reassessment',
      additionalInfo: 'Previous pain score: 8/10',
    },
    suggestedAction: 'Schedule visit to reassess pain level and effectiveness of pain management interventions',
    quickActions: [
      {
        id: 'qa-1',
        label: 'Document Assessment',
        icon: 'edit',
        action: 'document',
      },
      {
        id: 'qa-2',
        label: 'Schedule Visit',
        icon: 'calendar',
        action: 'schedule-visit',
      },
    ],
    status: 'active',
  });

  return alerts;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT AGGREGATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all clinical alerts for an admission
 */
export function getAllClinicalAlerts(admissionId: string): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = [];
  
  // Generate alerts from different sources
  alerts.push(...generateMedicationAlerts(admissionId, []));
  alerts.push(...generateFallRiskAlerts(admissionId, 55));
  alerts.push(...generateWoundAlerts(admissionId, []));
  alerts.push(...generateVisitAlerts(admissionId, {}));
  alerts.push(...generateDocumentationAlerts(admissionId, []));
  alerts.push(...generateOrdersAlerts(admissionId, []));
  alerts.push(...generateAssessmentAlerts(admissionId, []));
  
  // Sort by severity (critical first) then by detected date (newest first)
  return alerts.sort((a, b) => {
    const severityDiff = ALERT_SEVERITY_CONFIG[a.severity].priority - ALERT_SEVERITY_CONFIG[b.severity].priority;
    if (severityDiff !== 0) return severityDiff;
    return new Date(b.detectedDate).getTime() - new Date(a.detectedDate).getTime();
  });
}

/**
 * Get alert statistics
 */
export function getAlertStatistics(alerts: ClinicalAlert[]): {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  byCategory: Record<AlertCategory, number>;
  active: number;
  acknowledged: number;
} {
  const stats = {
    total: alerts.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    byCategory: {} as Record<AlertCategory, number>,
    active: 0,
    acknowledged: 0,
  };

  alerts.forEach(alert => {
    // Count by severity
    stats[alert.severity]++;
    
    // Count by category
    stats.byCategory[alert.category] = (stats.byCategory[alert.category] || 0) + 1;
    
    // Count by status
    if (alert.status === 'active') stats.active++;
    if (alert.status === 'acknowledged') stats.acknowledged++;
  });

  return stats;
}

/**
 * Filter alerts
 */
export function filterAlerts(
  alerts: ClinicalAlert[],
  filters: {
    severity?: AlertSeverity[];
    category?: AlertCategory[];
    status?: AlertStatus[];
    searchQuery?: string;
  }
): ClinicalAlert[] {
  return alerts.filter(alert => {
    // Severity filter
    if (filters.severity && filters.severity.length > 0) {
      if (!filters.severity.includes(alert.severity)) return false;
    }
    
    // Category filter
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(alert.category)) return false;
    }
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(alert.status)) return false;
    }
    
    // Search query
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
      const query = filters.searchQuery.toLowerCase();
      const searchableText = [
        alert.title,
        alert.description,
        alert.suggestedAction,
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(query)) return false;
    }
    
    return true;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export function getMockClinicalAlerts(admissionId: string = 'ADM-12345'): ClinicalAlert[] {
  return getAllClinicalAlerts(admissionId);
}
