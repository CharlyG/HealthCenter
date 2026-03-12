/**
 * Patient Risk Scoring Types
 * Deterministic multi-factor risk model for identifying patients
 * needing closer monitoring. Designed for .NET 8 API migration.
 */

// ─── Risk Factor Categories ────────────────────────────────────────────────

export type RiskFactorCategory =
  | 'hospitalization'
  | 'visit_compliance'
  | 'clinical_assessment'
  | 'diagnosis_severity'
  | 'medication_complexity';

export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';

// ─── Individual Risk Factor ────────────────────────────────────────────────

export interface RiskFactor {
  category: RiskFactorCategory;
  label: string;
  description: string;
  score: number;       // 0–100 weighted contribution
  maxScore: number;    // max possible for this factor
  weight: number;      // category weight (0–1, sums to 1.0)
  dataPoints: RiskDataPoint[];
  trend: 'improving' | 'stable' | 'worsening';
}

export interface RiskDataPoint {
  label: string;
  value: string | number;
  impact: 'positive' | 'neutral' | 'negative';
}

// ─── Composite Risk Score ──────────────────────────────────────────────────

export interface PatientRiskScore {
  patientId: string;
  patientName: string;
  overallScore: number;   // 0–100
  level: RiskLevel;
  factors: RiskFactor[];
  calculatedAt: string;
  previousScore?: number;
  trend: 'improving' | 'stable' | 'worsening';
  recommendations: RiskRecommendation[];
}

export interface RiskRecommendation {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  text: string;
  category: RiskFactorCategory;
  actionable: boolean;
}

// ─── Server Responses ──────────────────────────────────────────────────────

export interface RiskScoreResponse {
  riskScore: PatientRiskScore;
}

export interface RiskScoreBatchResponse {
  scores: PatientRiskScore[];
  highRiskCount: number;
  criticalCount: number;
}

// ─── Risk Score Trend History ──────────────────────────────────────────────

export interface RiskScoreSnapshot {
  timestamp: string;
  score: number;
  level: RiskLevel;
  factorScores: Record<RiskFactorCategory, number>;
}

export interface RiskTrendResponse {
  patientId: string;
  snapshots: RiskScoreSnapshot[];
}

// ─── Risk Threshold Configuration ──────────────────────────────────────────

export interface RiskThresholdRule {
  id: string;
  name: string;
  /** Alert fires when score crosses FROM below TO at-or-above this value */
  scoreThreshold: number;
  /** The risk level this threshold represents */
  level: RiskLevel;
  /** Whether this threshold rule is active */
  enabled: boolean;
  /** Severity of the generated clinical alert */
  alertSeverity: 'critical' | 'high' | 'warning' | 'info';
  /** Roles to notify */
  notifyRoles: string[];
}

export interface RiskThresholdConfig {
  rules: RiskThresholdRule[];
  globalEnabled: boolean;
  /** Re-alert cooldown in hours (won't re-fire for same patient within this window) */
  cooldownHours: number;
  updatedAt: string;
  updatedBy: string;
}

export interface RiskThresholdAlert {
  id: string;
  patientId: string;
  patientName: string;
  ruleId: string;
  ruleName: string;
  previousScore: number;
  newScore: number;
  threshold: number;
  direction: 'crossed_above' | 'crossed_below';
  alertSeverity: 'critical' | 'high' | 'warning' | 'info';
  createdAt: string;
  dismissed: boolean;
}

export interface RiskThresholdConfigResponse {
  config: RiskThresholdConfig;
}

export interface RiskThresholdAlertResponse {
  alerts: RiskThresholdAlert[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

export function getRiskColor(level: RiskLevel): {
  text: string;
  bg: string;
  border: string;
  ring: string;
} {
  switch (level) {
    case 'critical':
      return {
        text: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        ring: '#ef4444',
      };
    case 'high':
      return {
        text: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        ring: '#f97316',
      };
    case 'moderate':
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        ring: '#f59e0b',
      };
    case 'low':
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        ring: '#10b981',
      };
  }
}