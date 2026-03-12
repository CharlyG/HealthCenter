/**
 * Predictive Risk Dashboard Types
 * Shared type definitions for the operational risk intelligence system.
 * Designed for .NET 8 API migration — all types map cleanly to C# models.
 */

// ─── Risk Severity ──────────────────────────────────────────────────────────

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';

// ─── Risk Category ──────────────────────────────────────────────────────────

export type RiskCategory =
  | 'hospitalization'
  | 'missed_visits'
  | 'caregiver_reliability'
  | 'missing_documentation'
  | 'claim_rejection'
  | 'expiring_authorization';

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  hospitalization: 'Hospitalization Risk',
  missed_visits: 'Missing Required Visits',
  caregiver_reliability: 'Caregiver Reliability',
  missing_documentation: 'Missing Documentation',
  claim_rejection: 'Claim Rejection Risk',
  expiring_authorization: 'Expiring Authorizations',
};

// ─── Base Risk Item ─────────────────────────────────────────────────────────

export interface RiskItem {
  id: string;
  category: RiskCategory;
  severity: RiskSeverity;
  riskScore: number; // 0–100
  title: string;
  description: string;
  entityType: 'patient' | 'caregiver' | 'admission' | 'claim' | 'authorization';
  entityId: string;
  entityName: string;
  factors: string[];
  suggestedAction: string;
  dueDate?: string;
  daysUntilDue?: number;
  metadata: Record<string, any>;
  createdAt: string;
}

// ─── Category Summary ───────────────────────────────────────────────────────

export interface RiskCategorySummary {
  category: RiskCategory;
  label: string;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  trendPct: number;
}

// ─── Operational Insight ────────────────────────────────────────────────────

export interface OperationalInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'recommendation' | 'alert';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: RiskCategory;
  metric?: string;
  metricValue?: number;
  metricUnit?: string;
  actionLabel?: string;
  actionRoute?: string;
}

// ─── Risk Trend Data Point ──────────────────────────────────────────────────

export interface RiskTrendPoint {
  date: string;
  hospitalization: number;
  missed_visits: number;
  caregiver_reliability: number;
  missing_documentation: number;
  claim_rejection: number;
  expiring_authorization: number;
}

// ─── Full Dashboard Response ────────────────────────────────────────────────

export interface RiskDashboardData {
  summary: {
    totalRisks: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    overallRiskScore: number; // agency-wide 0–100
    previousScore: number;
  };
  categories: RiskCategorySummary[];
  risks: RiskItem[];
  insights: OperationalInsight[];
  trends: RiskTrendPoint[];
  generatedAt: string;
}

// ─── Risk Threshold Configuration ───────────────────────────────────────────

export interface CategoryThresholdWeights {
  /** Weights for individual risk factors within a category (0–100 each) */
  [factorKey: string]: number;
}

export interface CategoryThresholdConfig {
  /** Severity cutoff scores: >= critical → critical, >= high → high, etc. */
  criticalThreshold: number;
  highThreshold: number;
  mediumThreshold: number;
  /** Minimum score for a risk item to appear at all */
  minScoreToShow: number;
  /** Factor weights specific to this category */
  weights: CategoryThresholdWeights;
}

export interface RiskThresholdConfig {
  hospitalization: CategoryThresholdConfig;
  missed_visits: CategoryThresholdConfig;
  caregiver_reliability: CategoryThresholdConfig;
  missing_documentation: CategoryThresholdConfig;
  claim_rejection: CategoryThresholdConfig;
  expiring_authorization: CategoryThresholdConfig;
  updatedAt?: string;
  updatedBy?: string;
}

// ─── Default Threshold Config ───────────────────────────────────────────────

export const DEFAULT_RISK_THRESHOLDS: RiskThresholdConfig = {
  hospitalization: {
    criticalThreshold: 75,
    highThreshold: 55,
    mediumThreshold: 35,
    minScoreToShow: 30,
    weights: {
      priorHospitalizations2Plus: 25,
      priorHospitalizations1: 10,
      recentERVisit: 20,
      highFallRisk: 15,
      livesAlone: 10,
      cognitiveImpairment: 10,
      polypharmacy: 10,
      lowADL: 10,
      highOASIS: 10,
      advancedAge: 5,
    },
  },
  missed_visits: {
    criticalThreshold: 70,
    highThreshold: 50,
    mediumThreshold: 30,
    minScoreToShow: 20,
    weights: {
      missedVisitPerVisit: 20,
      consecutiveMissedPerVisit: 15,
      lowCompliance50: 20,
      lowCompliance75: 10,
    },
  },
  caregiver_reliability: {
    criticalThreshold: 70,
    highThreshold: 50,
    mediumThreshold: 30,
    minScoreToShow: 25,
    weights: {
      missedRate10Plus: 35,
      missedRate5Plus: 20,
      lateRate15Plus: 20,
      lateRate10Plus: 10,
      docDelay4hPlus: 20,
      docDelay2hPlus: 10,
      unsignedNotes3Plus: 15,
    },
  },
  missing_documentation: {
    criticalThreshold: 70,
    highThreshold: 50,
    mediumThreshold: 30,
    minScoreToShow: 15,
    weights: {
      perMissingDoc: 15,
      missingF2F: 10,
      missingInsurance: 10,
    },
  },
  claim_rejection: {
    criticalThreshold: 80,
    highThreshold: 55,
    mediumThreshold: 35,
    minScoreToShow: 25,
    weights: {},
  },
  expiring_authorization: {
    criticalThreshold: 70,
    highThreshold: 50,
    mediumThreshold: 30,
    minScoreToShow: 20,
    weights: {
      expires3Days: 50,
      expires7Days: 35,
      expires14Days: 20,
      expires30Days: 10,
      visitsExhausted: 30,
      visits2Remaining: 20,
    },
  },
};

// ─── Risk History Snapshot ──────────────────────────────────────────────────

export interface RiskHistorySnapshot {
  date: string;
  overallScore: number;
  totalRisks: number;
  criticalCount: number;
  highCount: number;
  categoryScores: Record<RiskCategory, number>;
}