/**
 * Clinical Summary Cards Service
 * 
 * Provides data and configuration for clinical summary cards displayed
 * on the patient admission dashboard. Each card type shows key metrics,
 * status indicators, warnings, and quick actions.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ClinicalSummaryCard {
  id: string;
  type: CardType;
  title: string;
  icon: string;
  color: string;
  metrics: CardMetric[];
  status: CardStatus;
  warnings: CardWarning[];
  quickActions: QuickAction[];
  lastUpdated?: string;
}

export type CardType =
  | 'medication'
  | 'care-plan'
  | 'frequency'
  | 'wound'
  | 'assessment'
  | 'documentation';

export interface CardMetric {
  id: string;
  label: string;
  value: number | string;
  subtext?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  color?: string;
  icon?: string;
}

export interface CardStatus {
  label: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  icon?: string;
}

export interface CardWarning {
  id: string;
  severity: 'critical' | 'high' | 'medium';
  message: string;
  count?: number;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  route?: string;
  action?: string;
  variant?: 'default' | 'outline' | 'secondary';
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const CARD_TYPE_CONFIG: Record<
  CardType,
  { label: string; icon: string; color: string; description: string }
> = {
  medication: {
    label: 'Medications',
    icon: 'pill',
    color: '#7C3AED',
    description: 'Medication profile and recent changes',
  },
  'care-plan': {
    label: 'Care Plan',
    icon: 'target',
    color: '#10B981',
    description: 'Active goals and interventions',
  },
  frequency: {
    label: 'Visit Frequency',
    icon: 'calendar',
    color: '#3B82F6',
    description: 'Visit compliance and scheduling',
  },
  wound: {
    label: 'Wounds',
    icon: 'activity',
    color: '#EF4444',
    description: 'Active wounds and healing progress',
  },
  assessment: {
    label: 'Assessments',
    icon: 'clipboard-check',
    color: '#F59E0B',
    description: 'Required assessments and due dates',
  },
  documentation: {
    label: 'Documentation',
    icon: 'file-text',
    color: '#8B5CF6',
    description: 'Documentation completion status',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// DATA GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate Medication Summary Card
 */
export function generateMedicationSummaryCard(admissionId: string): ClinicalSummaryCard {
  return {
    id: 'med-summary',
    type: 'medication',
    title: 'Medication Summary',
    icon: 'pill',
    color: '#7C3AED',
    metrics: [
      {
        id: 'active-meds',
        label: 'Active Medications',
        value: 12,
        icon: 'pill',
      },
      {
        id: 'recent-changes',
        label: 'Recent Changes',
        value: 3,
        subtext: 'Last 7 days',
        color: '#F59E0B',
        icon: 'alert-circle',
      },
      {
        id: 'prn-meds',
        label: 'PRN Medications',
        value: 4,
        icon: 'zap',
      },
      {
        id: 'allergies',
        label: 'Known Allergies',
        value: 2,
        color: '#EF4444',
        icon: 'alert-triangle',
      },
    ],
    status: {
      label: 'Needs Attention',
      type: 'warning',
      message: '1 critical drug interaction detected',
      icon: 'alert-triangle',
    },
    warnings: [
      {
        id: 'warn-1',
        severity: 'critical',
        message: 'Drug interaction: Warfarin + Aspirin',
        count: 1,
      },
      {
        id: 'warn-2',
        severity: 'medium',
        message: 'Medications added this week',
        count: 2,
      },
    ],
    quickActions: [
      {
        id: 'view-profile',
        label: 'View Profile',
        icon: 'eye',
        route: '/patient-medication-profile-view',
        variant: 'default',
      },
      {
        id: 'reconcile',
        label: 'Reconcile',
        icon: 'check-square',
        route: '/medication-reconciliation-workflow',
        variant: 'outline',
      },
    ],
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Generate Care Plan Summary Card
 */
export function generateCarePlanSummaryCard(admissionId: string): ClinicalSummaryCard {
  return {
    id: 'careplan-summary',
    type: 'care-plan',
    title: 'Care Plan Summary',
    icon: 'target',
    color: '#10B981',
    metrics: [
      {
        id: 'active-goals',
        label: 'Active Goals',
        value: 8,
        icon: 'target',
      },
      {
        id: 'avg-progress',
        label: 'Avg Progress',
        value: '67%',
        trend: 'up',
        trendValue: '+5%',
        icon: 'trending-up',
      },
      {
        id: 'interventions',
        label: 'Interventions',
        value: 24,
        icon: 'zap',
      },
      {
        id: 'disciplines',
        label: 'Disciplines',
        value: 5,
        subtext: 'SN, PT, OT, ST, MSW',
        icon: 'users',
      },
    ],
    status: {
      label: 'On Track',
      type: 'success',
      message: 'Most goals showing positive progress',
      icon: 'check-circle',
    },
    warnings: [
      {
        id: 'warn-1',
        severity: 'medium',
        message: 'Goals need review',
        count: 2,
      },
    ],
    quickActions: [
      {
        id: 'view-plan',
        label: 'View Plan',
        icon: 'eye',
        route: '/care-plan-management',
        variant: 'default',
      },
      {
        id: 'update-progress',
        label: 'Update Progress',
        icon: 'edit',
        route: '/care-plan-editor',
        variant: 'outline',
      },
    ],
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Generate Frequency Summary Card
 */
export function generateFrequencySummaryCard(admissionId: string): ClinicalSummaryCard {
  return {
    id: 'frequency-summary',
    type: 'frequency',
    title: 'Visit Frequency Summary',
    icon: 'calendar',
    color: '#3B82F6',
    metrics: [
      {
        id: 'ordered',
        label: 'Ordered Visits',
        value: 36,
        subtext: 'This period',
        icon: 'clipboard',
      },
      {
        id: 'completed',
        label: 'Completed',
        value: 23,
        subtext: '64% complete',
        color: '#10B981',
        icon: 'check-circle',
      },
      {
        id: 'scheduled',
        label: 'Scheduled',
        value: 8,
        subtext: 'Next 7 days',
        icon: 'calendar',
      },
      {
        id: 'missed',
        label: 'Missed',
        value: 5,
        color: '#EF4444',
        icon: 'x-circle',
      },
    ],
    status: {
      label: 'Behind Schedule',
      type: 'warning',
      message: 'Need to schedule 5 additional visits',
      icon: 'alert-triangle',
    },
    warnings: [
      {
        id: 'warn-1',
        severity: 'high',
        message: 'SN visits behind schedule',
        count: 3,
      },
      {
        id: 'warn-2',
        severity: 'medium',
        message: 'PT visit missed',
        count: 2,
      },
    ],
    quickActions: [
      {
        id: 'view-schedule',
        label: 'View Schedule',
        icon: 'calendar',
        route: '/scheduling',
        variant: 'default',
      },
      {
        id: 'view-compliance',
        label: 'Compliance',
        icon: 'bar-chart',
        route: '/frequency-compliance-tracker',
        variant: 'outline',
      },
    ],
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  };
}

/**
 * Generate Wound Summary Card
 */
export function generateWoundSummaryCard(admissionId: string): ClinicalSummaryCard {
  return {
    id: 'wound-summary',
    type: 'wound',
    title: 'Wound Summary',
    icon: 'activity',
    color: '#EF4444',
    metrics: [
      {
        id: 'active-wounds',
        label: 'Active Wounds',
        value: 2,
        icon: 'activity',
      },
      {
        id: 'healing',
        label: 'Healing',
        value: 1,
        trend: 'down',
        trendValue: '-15%',
        color: '#10B981',
        icon: 'trending-down',
      },
      {
        id: 'worsening',
        label: 'Worsening',
        value: 1,
        trend: 'up',
        trendValue: '+25%',
        color: '#EF4444',
        icon: 'trending-up',
      },
      {
        id: 'last-assessment',
        label: 'Last Assessment',
        value: '2d ago',
        icon: 'clock',
      },
    ],
    status: {
      label: 'Requires Attention',
      type: 'error',
      message: '1 wound showing deterioration',
      icon: 'alert-circle',
    },
    warnings: [
      {
        id: 'warn-1',
        severity: 'critical',
        message: 'Sacral wound deteriorating',
        count: 1,
      },
    ],
    quickActions: [
      {
        id: 'view-wounds',
        label: 'View Wounds',
        icon: 'eye',
        route: '/wound-care-tracking',
        variant: 'default',
      },
      {
        id: 'document',
        label: 'Document',
        icon: 'edit',
        action: 'document-wound',
        variant: 'outline',
      },
    ],
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Generate Assessment Summary Card
 */
export function generateAssessmentSummaryCard(admissionId: string): ClinicalSummaryCard {
  return {
    id: 'assessment-summary',
    type: 'assessment',
    title: 'Assessment Summary',
    icon: 'clipboard-check',
    color: '#F59E0B',
    metrics: [
      {
        id: 'total',
        label: 'Total Assessments',
        value: 12,
        icon: 'clipboard',
      },
      {
        id: 'overdue',
        label: 'Overdue',
        value: 1,
        color: '#EF4444',
        icon: 'alert-circle',
      },
      {
        id: 'due-soon',
        label: 'Due Soon',
        value: 2,
        subtext: 'Next 7 days',
        color: '#F59E0B',
        icon: 'clock',
      },
      {
        id: 'completed',
        label: 'Completed',
        value: 9,
        color: '#10B981',
        icon: 'check-circle',
      },
    ],
    status: {
      label: 'Action Required',
      type: 'error',
      message: 'OASIS recertification overdue',
      icon: 'alert-triangle',
    },
    warnings: [
      {
        id: 'warn-1',
        severity: 'critical',
        message: 'OASIS recertification overdue',
        count: 1,
      },
      {
        id: 'warn-2',
        severity: 'medium',
        message: 'Pain reassessment due',
        count: 1,
      },
    ],
    quickActions: [
      {
        id: 'view-all',
        label: 'View All',
        icon: 'eye',
        route: '/assessment-workspace',
        variant: 'default',
      },
      {
        id: 'start-oasis',
        label: 'Start OASIS',
        icon: 'play',
        route: '/oasis-assessment-editor-improved',
        variant: 'outline',
      },
    ],
    lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  };
}

/**
 * Generate Documentation Summary Card
 */
export function generateDocumentationSummaryCard(admissionId: string): ClinicalSummaryCard {
  return {
    id: 'documentation-summary',
    type: 'documentation',
    title: 'Documentation Summary',
    icon: 'file-text',
    color: '#8B5CF6',
    metrics: [
      {
        id: 'total',
        label: 'Total Documents',
        value: 48,
        icon: 'file-text',
      },
      {
        id: 'incomplete',
        label: 'Incomplete',
        value: 3,
        color: '#F59E0B',
        icon: 'alert-circle',
      },
      {
        id: 'pending-cosign',
        label: 'Pending Cosign',
        value: 5,
        subtext: '2 overdue',
        color: '#3B82F6',
        icon: 'user-check',
      },
      {
        id: 'completed',
        label: 'Completed',
        value: 40,
        subtext: '83% complete',
        color: '#10B981',
        icon: 'check-circle',
      },
    ],
    status: {
      label: 'Attention Needed',
      type: 'warning',
      message: '3 documents incomplete beyond 24 hours',
      icon: 'alert-triangle',
    },
    warnings: [
      {
        id: 'warn-1',
        severity: 'high',
        message: 'Visit notes incomplete',
        count: 3,
      },
      {
        id: 'warn-2',
        severity: 'medium',
        message: 'Cosignature overdue',
        count: 2,
      },
    ],
    quickActions: [
      {
        id: 'view-workspace',
        label: 'View Workspace',
        icon: 'eye',
        route: '/clinical-documentation-workspace',
        variant: 'default',
      },
      {
        id: 'cosign-queue',
        label: 'Cosign Queue',
        icon: 'user-check',
        route: '/cosign-queue',
        variant: 'outline',
      },
    ],
    lastUpdated: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all clinical summary cards for an admission
 */
export function getAllClinicalSummaryCards(admissionId: string): ClinicalSummaryCard[] {
  return [
    generateMedicationSummaryCard(admissionId),
    generateCarePlanSummaryCard(admissionId),
    generateFrequencySummaryCard(admissionId),
    generateWoundSummaryCard(admissionId),
    generateAssessmentSummaryCard(admissionId),
    generateDocumentationSummaryCard(admissionId),
  ];
}

/**
 * Get cards requiring immediate attention
 */
export function getCriticalCards(cards: ClinicalSummaryCard[]): ClinicalSummaryCard[] {
  return cards.filter(
    card =>
      card.status.type === 'error' ||
      card.warnings.some(w => w.severity === 'critical')
  );
}

/**
 * Get overall admission health score (0-100)
 */
export function getAdmissionHealthScore(cards: ClinicalSummaryCard[]): {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  message: string;
} {
  let totalScore = 100;

  cards.forEach(card => {
    // Deduct points based on status
    if (card.status.type === 'error') totalScore -= 20;
    else if (card.status.type === 'warning') totalScore -= 10;

    // Deduct points for warnings
    card.warnings.forEach(warning => {
      if (warning.severity === 'critical') totalScore -= 10;
      else if (warning.severity === 'high') totalScore -= 5;
      else if (warning.severity === 'medium') totalScore -= 2;
    });
  });

  const score = Math.max(0, Math.min(100, totalScore));

  let level: 'excellent' | 'good' | 'fair' | 'poor';
  let message: string;

  if (score >= 90) {
    level = 'excellent';
    message = 'Admission is in excellent condition with minimal issues';
  } else if (score >= 75) {
    level = 'good';
    message = 'Admission is in good condition with minor issues';
  } else if (score >= 60) {
    level = 'fair';
    message = 'Admission requires attention to address issues';
  } else {
    level = 'poor';
    message = 'Admission has critical issues requiring immediate action';
  }

  return { score, level, message };
}

/**
 * Get summary statistics across all cards
 */
export function getCardStatistics(cards: ClinicalSummaryCard[]): {
  totalWarnings: number;
  criticalWarnings: number;
  cardsNeedingAttention: number;
  lastUpdated: string;
} {
  const totalWarnings = cards.reduce((sum, card) => sum + card.warnings.length, 0);
  const criticalWarnings = cards.reduce(
    (sum, card) => sum + card.warnings.filter(w => w.severity === 'critical').length,
    0
  );
  const cardsNeedingAttention = cards.filter(
    card => card.status.type === 'error' || card.status.type === 'warning'
  ).length;

  // Find most recent update
  const lastUpdated = cards
    .filter(c => c.lastUpdated)
    .sort((a, b) => new Date(b.lastUpdated!).getTime() - new Date(a.lastUpdated!).getTime())[0]
    ?.lastUpdated || new Date().toISOString();

  return {
    totalWarnings,
    criticalWarnings,
    cardsNeedingAttention,
    lastUpdated,
  };
}
