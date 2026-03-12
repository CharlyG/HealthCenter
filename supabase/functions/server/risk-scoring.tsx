/**
 * Patient Risk Scoring Engine
 * Deterministic, rule-based risk calculation based on five clinical factors.
 * Each factor produces a 0–100 sub-score weighted by clinical importance.
 *
 * Factor Weights:
 *   Hospitalization History:  0.25
 *   Visit Compliance:         0.20
 *   Clinical Assessment:      0.25
 *   Diagnosis Severity:       0.20
 *   Medication Complexity:    0.10
 *                            -----
 *                             1.00
 */
import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ─── Factor Weight Configuration ────────────────────────────────────────────

const FACTOR_WEIGHTS: Record<string, number> = {
  hospitalization: 0.25,
  visit_compliance: 0.20,
  clinical_assessment: 0.25,
  diagnosis_severity: 0.20,
  medication_complexity: 0.10,
};

// ─── Deterministic Seed Data Per Patient ────────────────────────────────────
// Realistic clinical data profiles for the 6 demo patients.

interface PatientClinicalProfile {
  hospitalizations: {
    count30d: number;
    count90d: number;
    count12m: number;
    erVisits30d: number;
    lastAdmitDate: string | null;
    lastAdmitReason: string;
  };
  visitCompliance: {
    scheduledVisits: number;
    completedVisits: number;
    missedVisits: number;
    cancelledVisits: number;
    avgDaysBetween: number;
    lastVisitDate: string;
  };
  clinicalAssessment: {
    fallRisk: 'low' | 'moderate' | 'high';
    woundPresent: boolean;
    woundStage: number;
    painLevel: number; // 0-10
    adlScore: number; // 0-100 (higher = more independent)
    cognitiveStatus: 'intact' | 'mild_impairment' | 'moderate_impairment' | 'severe_impairment';
    recentLabAbnormalities: number;
  };
  diagnosisSeverity: {
    primaryDx: string;
    primaryIcd: string;
    comorbidityCount: number;
    isTerminal: boolean;
    complexityTier: 1 | 2 | 3 | 4; // 1=simple, 4=very complex
    activeProblems: string[];
  };
  medicationComplexity: {
    totalMedications: number;
    highRiskMeds: number; // anticoagulants, insulin, opioids, etc.
    recentChanges30d: number;
    polypharmacy: boolean; // 5+ meds
    selfAdministered: boolean;
    complianceIssues: boolean;
  };
}

const PATIENT_PROFILES: Record<string, PatientClinicalProfile> = {
  'patient-demo-001': {
    hospitalizations: { count30d: 0, count90d: 1, count12m: 2, erVisits30d: 0, lastAdmitDate: '2026-01-15', lastAdmitReason: 'COPD exacerbation' },
    visitCompliance: { scheduledVisits: 24, completedVisits: 22, missedVisits: 1, cancelledVisits: 1, avgDaysBetween: 3.5, lastVisitDate: '2026-03-05' },
    clinicalAssessment: { fallRisk: 'moderate', woundPresent: false, woundStage: 0, painLevel: 4, adlScore: 65, cognitiveStatus: 'intact', recentLabAbnormalities: 1 },
    diagnosisSeverity: { primaryDx: 'Low back pain', primaryIcd: 'M54.5', comorbidityCount: 3, isTerminal: false, complexityTier: 2, activeProblems: ['Low back pain', 'Hypertension', 'COPD', 'Osteoarthritis'] },
    medicationComplexity: { totalMedications: 7, highRiskMeds: 1, recentChanges30d: 1, polypharmacy: true, selfAdministered: true, complianceIssues: false },
  },
  'patient-demo-002': {
    hospitalizations: { count30d: 1, count90d: 2, count12m: 3, erVisits30d: 1, lastAdmitDate: '2026-02-28', lastAdmitReason: 'Diabetic ketoacidosis' },
    visitCompliance: { scheduledVisits: 20, completedVisits: 15, missedVisits: 4, cancelledVisits: 1, avgDaysBetween: 5.2, lastVisitDate: '2026-03-03' },
    clinicalAssessment: { fallRisk: 'high', woundPresent: true, woundStage: 2, painLevel: 6, adlScore: 45, cognitiveStatus: 'mild_impairment', recentLabAbnormalities: 3 },
    diagnosisSeverity: { primaryDx: 'Type 2 diabetes mellitus', primaryIcd: 'E11.9', comorbidityCount: 5, isTerminal: false, complexityTier: 3, activeProblems: ['Type 2 DM', 'Diabetic neuropathy', 'CKD Stage 3', 'HTN', 'Peripheral vascular disease', 'Depression'] },
    medicationComplexity: { totalMedications: 12, highRiskMeds: 3, recentChanges30d: 3, polypharmacy: true, selfAdministered: false, complianceIssues: true },
  },
  'patient-demo-003': {
    hospitalizations: { count30d: 0, count90d: 0, count12m: 1, erVisits30d: 0, lastAdmitDate: '2025-08-10', lastAdmitReason: 'Planned chemotherapy' },
    visitCompliance: { scheduledVisits: 30, completedVisits: 29, missedVisits: 0, cancelledVisits: 1, avgDaysBetween: 2.1, lastVisitDate: '2026-03-06' },
    clinicalAssessment: { fallRisk: 'high', woundPresent: false, woundStage: 0, painLevel: 7, adlScore: 30, cognitiveStatus: 'mild_impairment', recentLabAbnormalities: 4 },
    diagnosisSeverity: { primaryDx: 'Malignant neoplasm of lung', primaryIcd: 'C34.90', comorbidityCount: 4, isTerminal: true, complexityTier: 4, activeProblems: ['Lung cancer', 'Chronic pain', 'Cachexia', 'Depression', 'Dyspnea'] },
    medicationComplexity: { totalMedications: 14, highRiskMeds: 4, recentChanges30d: 2, polypharmacy: true, selfAdministered: false, complianceIssues: false },
  },
  'patient-demo-004': {
    hospitalizations: { count30d: 1, count90d: 1, count12m: 4, erVisits30d: 0, lastAdmitDate: '2026-02-15', lastAdmitReason: 'CHF exacerbation' },
    visitCompliance: { scheduledVisits: 18, completedVisits: 14, missedVisits: 3, cancelledVisits: 1, avgDaysBetween: 4.8, lastVisitDate: '2026-03-04' },
    clinicalAssessment: { fallRisk: 'high', woundPresent: true, woundStage: 3, painLevel: 5, adlScore: 40, cognitiveStatus: 'moderate_impairment', recentLabAbnormalities: 3 },
    diagnosisSeverity: { primaryDx: 'Heart failure, unspecified', primaryIcd: 'I50.9', comorbidityCount: 6, isTerminal: false, complexityTier: 4, activeProblems: ['CHF', 'Atrial fibrillation', 'CKD Stage 4', 'Anemia', 'COPD', 'Type 2 DM', 'Hypertension'] },
    medicationComplexity: { totalMedications: 15, highRiskMeds: 4, recentChanges30d: 4, polypharmacy: true, selfAdministered: false, complianceIssues: true },
  },
  'patient-demo-005': {
    hospitalizations: { count30d: 0, count90d: 0, count12m: 1, erVisits30d: 0, lastAdmitDate: '2026-02-28', lastAdmitReason: 'Hip fracture repair' },
    visitCompliance: { scheduledVisits: 4, completedVisits: 4, missedVisits: 0, cancelledVisits: 0, avgDaysBetween: 2.0, lastVisitDate: '2026-03-06' },
    clinicalAssessment: { fallRisk: 'high', woundPresent: true, woundStage: 1, painLevel: 5, adlScore: 50, cognitiveStatus: 'intact', recentLabAbnormalities: 1 },
    diagnosisSeverity: { primaryDx: 'Fracture of right femur', primaryIcd: 'S72.001A', comorbidityCount: 2, isTerminal: false, complexityTier: 2, activeProblems: ['Hip fracture', 'Osteoporosis', 'Hypertension'] },
    medicationComplexity: { totalMedications: 6, highRiskMeds: 2, recentChanges30d: 2, polypharmacy: true, selfAdministered: true, complianceIssues: false },
  },
  'patient-demo-006': {
    hospitalizations: { count30d: 0, count90d: 0, count12m: 0, erVisits30d: 0, lastAdmitDate: null, lastAdmitReason: '' },
    visitCompliance: { scheduledVisits: 16, completedVisits: 16, missedVisits: 0, cancelledVisits: 0, avgDaysBetween: 3.0, lastVisitDate: '2026-03-01' },
    clinicalAssessment: { fallRisk: 'low', woundPresent: false, woundStage: 0, painLevel: 2, adlScore: 85, cognitiveStatus: 'intact', recentLabAbnormalities: 0 },
    diagnosisSeverity: { primaryDx: 'Presence of right artificial knee joint', primaryIcd: 'Z96.641', comorbidityCount: 1, isTerminal: false, complexityTier: 1, activeProblems: ['Post TKR', 'Hypertension'] },
    medicationComplexity: { totalMedications: 3, highRiskMeds: 0, recentChanges30d: 0, polypharmacy: false, selfAdministered: true, complianceIssues: false },
  },
};

// ─── Scoring Functions ──────────────────────────────────────────────────────

function scoreHospitalization(p: PatientClinicalProfile['hospitalizations']) {
  let score = 0;
  // 30-day hospitalizations are most concerning
  score += Math.min(p.count30d * 30, 50);
  // 90-day hospitalizations
  score += Math.min(p.count90d * 12, 25);
  // 12-month hospitalizations
  score += Math.min(p.count12m * 5, 15);
  // ER visits
  score += Math.min(p.erVisits30d * 10, 10);

  const dataPoints = [
    { label: 'Hospitalizations (30d)', value: p.count30d, impact: p.count30d > 0 ? 'negative' : 'positive' },
    { label: 'Hospitalizations (90d)', value: p.count90d, impact: p.count90d > 1 ? 'negative' : p.count90d > 0 ? 'neutral' : 'positive' },
    { label: 'Hospitalizations (12m)', value: p.count12m, impact: p.count12m > 2 ? 'negative' : 'neutral' },
    { label: 'ER Visits (30d)', value: p.erVisits30d, impact: p.erVisits30d > 0 ? 'negative' : 'positive' },
    { label: 'Last Admit Reason', value: p.lastAdmitReason || 'None', impact: 'neutral' },
  ];

  const trend = p.count30d > 0 ? 'worsening' : p.count90d > p.count12m / 4 ? 'stable' : 'improving';

  return { score: Math.min(score, 100), dataPoints, trend };
}

function scoreVisitCompliance(p: PatientClinicalProfile['visitCompliance']) {
  const completionRate = p.scheduledVisits > 0 ? p.completedVisits / p.scheduledVisits : 1;
  const missedRate = p.scheduledVisits > 0 ? p.missedVisits / p.scheduledVisits : 0;

  // Higher miss rate = higher risk
  let score = 0;
  score += Math.round(missedRate * 60); // 60% weight on missed visits
  score += Math.min(p.cancelledVisits * 5, 15);

  // Days since last visit
  const daysSince = Math.round((Date.now() - new Date(p.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince > 14) score += 20;
  else if (daysSince > 7) score += 10;
  else if (daysSince > 4) score += 5;

  const dataPoints = [
    { label: 'Completion Rate', value: `${Math.round(completionRate * 100)}%`, impact: completionRate >= 0.9 ? 'positive' : completionRate >= 0.75 ? 'neutral' : 'negative' },
    { label: 'Missed Visits', value: p.missedVisits, impact: p.missedVisits > 2 ? 'negative' : p.missedVisits > 0 ? 'neutral' : 'positive' },
    { label: 'Cancelled Visits', value: p.cancelledVisits, impact: p.cancelledVisits > 1 ? 'negative' : 'neutral' },
    { label: 'Avg Days Between', value: `${p.avgDaysBetween}d`, impact: p.avgDaysBetween > 5 ? 'negative' : 'neutral' },
    { label: 'Days Since Last Visit', value: `${daysSince}d`, impact: daysSince > 7 ? 'negative' : 'positive' },
  ];

  const trend = missedRate > 0.15 ? 'worsening' : missedRate > 0.05 ? 'stable' : 'improving';

  return { score: Math.min(score, 100), dataPoints, trend };
}

function scoreClinicalAssessment(p: PatientClinicalProfile['clinicalAssessment']) {
  let score = 0;

  // Fall risk
  if (p.fallRisk === 'high') score += 20;
  else if (p.fallRisk === 'moderate') score += 10;

  // Wounds
  if (p.woundPresent) {
    score += 10 + p.woundStage * 8; // Stage 3 wound = 34pts
  }

  // Pain level
  score += Math.round((p.painLevel / 10) * 15);

  // ADL independence (lower = more risk)
  score += Math.round(((100 - p.adlScore) / 100) * 20);

  // Cognitive status
  const cogScores: Record<string, number> = { intact: 0, mild_impairment: 8, moderate_impairment: 16, severe_impairment: 25 };
  score += cogScores[p.cognitiveStatus] || 0;

  // Lab abnormalities
  score += Math.min(p.recentLabAbnormalities * 5, 15);

  const dataPoints = [
    { label: 'Fall Risk', value: p.fallRisk, impact: p.fallRisk === 'high' ? 'negative' : p.fallRisk === 'moderate' ? 'neutral' : 'positive' },
    { label: 'Wound Present', value: p.woundPresent ? `Stage ${p.woundStage}` : 'No', impact: p.woundPresent ? 'negative' : 'positive' },
    { label: 'Pain Level', value: `${p.painLevel}/10`, impact: p.painLevel > 5 ? 'negative' : p.painLevel > 3 ? 'neutral' : 'positive' },
    { label: 'ADL Score', value: `${p.adlScore}/100`, impact: p.adlScore < 50 ? 'negative' : p.adlScore < 70 ? 'neutral' : 'positive' },
    { label: 'Cognitive Status', value: p.cognitiveStatus.replace(/_/g, ' '), impact: p.cognitiveStatus === 'intact' ? 'positive' : 'negative' },
    { label: 'Lab Abnormalities', value: p.recentLabAbnormalities, impact: p.recentLabAbnormalities > 2 ? 'negative' : 'neutral' },
  ];

  const trend = p.painLevel > 6 || p.recentLabAbnormalities > 2 ? 'worsening' :
    p.fallRisk === 'high' ? 'stable' : 'improving';

  return { score: Math.min(score, 100), dataPoints, trend };
}

function scoreDiagnosisSeverity(p: PatientClinicalProfile['diagnosisSeverity']) {
  let score = 0;

  // Complexity tier is the biggest driver
  score += p.complexityTier * 15; // tier 4 = 60pts

  // Comorbidity count
  score += Math.min(p.comorbidityCount * 5, 25);

  // Terminal diagnosis
  if (p.isTerminal) score += 20;

  const dataPoints = [
    { label: 'Primary Diagnosis', value: `${p.primaryDx} (${p.primaryIcd})`, impact: p.complexityTier >= 3 ? 'negative' : 'neutral' },
    { label: 'Complexity Tier', value: `Tier ${p.complexityTier}/4`, impact: p.complexityTier >= 3 ? 'negative' : p.complexityTier >= 2 ? 'neutral' : 'positive' },
    { label: 'Comorbidities', value: p.comorbidityCount, impact: p.comorbidityCount > 4 ? 'negative' : p.comorbidityCount > 2 ? 'neutral' : 'positive' },
    { label: 'Terminal Prognosis', value: p.isTerminal ? 'Yes' : 'No', impact: p.isTerminal ? 'negative' : 'positive' },
    { label: 'Active Problems', value: p.activeProblems.length, impact: p.activeProblems.length > 4 ? 'negative' : 'neutral' },
  ];

  const trend = p.isTerminal ? 'worsening' : p.complexityTier >= 3 ? 'stable' : 'improving';

  return { score: Math.min(score, 100), dataPoints, trend };
}

function scoreMedicationComplexity(p: PatientClinicalProfile['medicationComplexity']) {
  let score = 0;

  // Polypharmacy
  if (p.polypharmacy) score += 15;
  score += Math.min(p.totalMedications * 2, 20);

  // High-risk medications
  score += Math.min(p.highRiskMeds * 10, 30);

  // Recent changes
  score += Math.min(p.recentChanges30d * 7, 20);

  // Self-administration
  if (!p.selfAdministered) score += 5;

  // Compliance issues
  if (p.complianceIssues) score += 15;

  const dataPoints = [
    { label: 'Total Medications', value: p.totalMedications, impact: p.totalMedications > 10 ? 'negative' : p.totalMedications > 5 ? 'neutral' : 'positive' },
    { label: 'High-Risk Meds', value: p.highRiskMeds, impact: p.highRiskMeds > 2 ? 'negative' : p.highRiskMeds > 0 ? 'neutral' : 'positive' },
    { label: 'Recent Changes (30d)', value: p.recentChanges30d, impact: p.recentChanges30d > 2 ? 'negative' : 'neutral' },
    { label: 'Polypharmacy', value: p.polypharmacy ? 'Yes' : 'No', impact: p.polypharmacy ? 'negative' : 'positive' },
    { label: 'Self-Administered', value: p.selfAdministered ? 'Yes' : 'No', impact: p.selfAdministered ? 'positive' : 'neutral' },
    { label: 'Compliance Issues', value: p.complianceIssues ? 'Yes' : 'No', impact: p.complianceIssues ? 'negative' : 'positive' },
  ];

  const trend = p.complianceIssues || p.recentChanges30d > 2 ? 'worsening' :
    p.highRiskMeds > 2 ? 'stable' : 'improving';

  return { score: Math.min(score, 100), dataPoints, trend };
}

// ─── Recommendation Generator ───────────────────────────────────────────────

function generateRecommendations(profile: PatientClinicalProfile, factors: any[]): any[] {
  const recs: any[] = [];
  let recId = 1;

  const h = profile.hospitalizations;
  if (h.count30d > 0) {
    recs.push({ id: `rec-${recId++}`, priority: 'urgent', text: 'Schedule post-hospital follow-up within 48 hours to prevent readmission', category: 'hospitalization', actionable: true });
  }
  if (h.count12m >= 3) {
    recs.push({ id: `rec-${recId++}`, priority: 'high', text: 'Refer to transitional care management program for recurrent hospitalizations', category: 'hospitalization', actionable: true });
  }

  const v = profile.visitCompliance;
  const missedRate = v.scheduledVisits > 0 ? v.missedVisits / v.scheduledVisits : 0;
  if (missedRate > 0.15) {
    recs.push({ id: `rec-${recId++}`, priority: 'high', text: 'Address visit compliance barriers — consider telehealth alternatives or schedule adjustments', category: 'visit_compliance', actionable: true });
  }
  if (v.missedVisits > 2) {
    recs.push({ id: `rec-${recId++}`, priority: 'medium', text: 'Contact patient/caregiver to discuss missed visit patterns and re-engage in care plan', category: 'visit_compliance', actionable: true });
  }

  const c = profile.clinicalAssessment;
  if (c.fallRisk === 'high') {
    recs.push({ id: `rec-${recId++}`, priority: 'high', text: 'Implement fall prevention protocol — home safety evaluation recommended', category: 'clinical_assessment', actionable: true });
  }
  if (c.woundPresent && c.woundStage >= 3) {
    recs.push({ id: `rec-${recId++}`, priority: 'urgent', text: 'Consult wound care specialist for Stage 3+ wound — update wound care protocol', category: 'clinical_assessment', actionable: true });
  }
  if (c.painLevel >= 7) {
    recs.push({ id: `rec-${recId++}`, priority: 'high', text: 'Reassess pain management plan — current pain level indicates inadequate control', category: 'clinical_assessment', actionable: true });
  }
  if (c.cognitiveStatus !== 'intact') {
    recs.push({ id: `rec-${recId++}`, priority: 'medium', text: 'Evaluate need for cognitive support services and caregiver training', category: 'clinical_assessment', actionable: true });
  }

  const d = profile.diagnosisSeverity;
  if (d.complexityTier >= 4) {
    recs.push({ id: `rec-${recId++}`, priority: 'high', text: 'Consider interdisciplinary care conference for complex multi-system disease management', category: 'diagnosis_severity', actionable: true });
  }
  if (d.comorbidityCount >= 5) {
    recs.push({ id: `rec-${recId++}`, priority: 'medium', text: 'Review care plan to ensure all comorbidities are actively managed', category: 'diagnosis_severity', actionable: true });
  }

  const m = profile.medicationComplexity;
  if (m.complianceIssues) {
    recs.push({ id: `rec-${recId++}`, priority: 'high', text: 'Conduct medication reconciliation and simplify regimen where possible', category: 'medication_complexity', actionable: true });
  }
  if (m.highRiskMeds >= 3) {
    recs.push({ id: `rec-${recId++}`, priority: 'high', text: 'Monitor high-risk medications closely — ensure lab monitoring is current', category: 'medication_complexity', actionable: true });
  }
  if (m.recentChanges30d >= 3) {
    recs.push({ id: `rec-${recId++}`, priority: 'medium', text: 'Schedule medication education visit — multiple recent changes require patient/caregiver training', category: 'medication_complexity', actionable: true });
  }

  return recs.sort((a, b) => {
    const ord: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return (ord[a.priority] ?? 4) - (ord[b.priority] ?? 4);
  });
}

// ─── Composite Score Calculator ─────────────────────────────────────────────

function calculateRiskScore(patientId: string, patientName: string, profile: PatientClinicalProfile) {
  const hosp = scoreHospitalization(profile.hospitalizations);
  const visit = scoreVisitCompliance(profile.visitCompliance);
  const clinical = scoreClinicalAssessment(profile.clinicalAssessment);
  const diag = scoreDiagnosisSeverity(profile.diagnosisSeverity);
  const med = scoreMedicationComplexity(profile.medicationComplexity);

  const factors = [
    {
      category: 'hospitalization',
      label: 'Hospitalization History',
      description: 'Recent hospital admissions and ER visits indicating instability',
      score: hosp.score,
      maxScore: 100,
      weight: FACTOR_WEIGHTS.hospitalization,
      dataPoints: hosp.dataPoints,
      trend: hosp.trend,
    },
    {
      category: 'visit_compliance',
      label: 'Visit Compliance',
      description: 'Adherence to scheduled home health visits',
      score: visit.score,
      maxScore: 100,
      weight: FACTOR_WEIGHTS.visit_compliance,
      dataPoints: visit.dataPoints,
      trend: visit.trend,
    },
    {
      category: 'clinical_assessment',
      label: 'Clinical Assessment',
      description: 'Functional status, fall risk, wounds, pain, and cognition',
      score: clinical.score,
      maxScore: 100,
      weight: FACTOR_WEIGHTS.clinical_assessment,
      dataPoints: clinical.dataPoints,
      trend: clinical.trend,
    },
    {
      category: 'diagnosis_severity',
      label: 'Diagnosis Severity',
      description: 'Primary diagnosis complexity and comorbidity burden',
      score: diag.score,
      maxScore: 100,
      weight: FACTOR_WEIGHTS.diagnosis_severity,
      dataPoints: diag.dataPoints,
      trend: diag.trend,
    },
    {
      category: 'medication_complexity',
      label: 'Medication Complexity',
      description: 'Polypharmacy, high-risk medications, and compliance',
      score: med.score,
      maxScore: 100,
      weight: FACTOR_WEIGHTS.medication_complexity,
      dataPoints: med.dataPoints,
      trend: med.trend,
    },
  ];

  // Weighted composite score
  const overallScore = Math.round(
    factors.reduce((sum, f) => sum + f.score * f.weight, 0)
  );

  const level = overallScore >= 75 ? 'critical' : overallScore >= 50 ? 'high' : overallScore >= 25 ? 'moderate' : 'low';

  // Overall trend: worst factor trend wins
  const trendPriority: Record<string, number> = { worsening: 2, stable: 1, improving: 0 };
  const worstTrend = factors.reduce((worst, f) =>
    (trendPriority[f.trend] || 0) > (trendPriority[worst] || 0) ? f.trend : worst
  , 'improving' as string);

  const recommendations = generateRecommendations(profile, factors);

  return {
    patientId,
    patientName,
    overallScore,
    level,
    factors,
    calculatedAt: new Date().toISOString(),
    trend: worstTrend,
    recommendations,
  };
}

// ─── Patient Name Lookup ────────────────────────────────────────────────────

const PATIENT_NAMES: Record<string, string> = {
  'patient-demo-001': 'John Smith',
  'patient-demo-002': 'Mary Johnson',
  'patient-demo-003': 'Robert Williams',
  'patient-demo-004': 'Patricia Brown',
  'patient-demo-005': 'James Davis',
  'patient-demo-006': 'Linda Garcia',
};

// ─── Historical Snapshot Seed Data ──────────────────────────────────────────
// Realistic 12-week score history per patient showing clinical trajectories.
// Uses deterministic offsets to produce consistent, medically plausible trends.

const WEEKLY_SCORE_OFFSETS: Record<string, number[]> = {
  // Smith: stable moderate → slight improvement (COPD managed)
  'patient-demo-001': [-2, -1, 0, 1, -1, 2, 1, 0, -2, -1, 0, -1],
  // Johnson: worsening trend (DM complications emerging)
  'patient-demo-002': [-12, -10, -8, -5, -3, -2, 0, 1, 2, 3, 2, 0],
  // Williams: high & steady then worsening (terminal illness progression)
  'patient-demo-003': [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 2, 0],
  // Brown: crossed from high to critical (CHF decompensation)
  'patient-demo-004': [-15, -12, -10, -8, -5, -3, -1, 0, 2, 3, 1, 0],
  // Davis: improving rapidly (post-surgical recovery)
  'patient-demo-005': [18, 15, 12, 10, 8, 6, 4, 3, 2, 1, 0, 0],
  // Garcia: consistently low (stable post-TKR)
  'patient-demo-006': [2, 1, 1, 0, 0, -1, 0, 1, 0, -1, 0, 0],
};

function getLevelForScore(score: number): string {
  if (score >= 75) return 'critical';
  if (score >= 50) return 'high';
  if (score >= 25) return 'moderate';
  return 'low';
}

async function seedHistoricalSnapshots() {
  // Check if already seeded
  const existing = await kv.get('risk-history-seeded');
  if (existing) return;

  const now = new Date();

  for (const [patientId, profile] of Object.entries(PATIENT_PROFILES)) {
    const patientName = PATIENT_NAMES[patientId] || 'Unknown';
    const currentScore = calculateRiskScore(patientId, patientName, profile);
    const baseScore = currentScore.overallScore;
    const offsets = WEEKLY_SCORE_OFFSETS[patientId] || [0,0,0,0,0,0,0,0,0,0,0,0];
    const snapshots: any[] = [];

    for (let week = 11; week >= 0; week--) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - (week * 7));
      const offsetIdx = 11 - week;
      const score = Math.max(0, Math.min(100, baseScore + (offsets[offsetIdx] || 0)));

      // Generate approximate factor scores based on overall score ratio
      const ratio = score / Math.max(baseScore, 1);
      const factorScores: Record<string, number> = {};
      for (const factor of currentScore.factors) {
        factorScores[factor.category] = Math.max(0, Math.min(100,
          Math.round(factor.score * ratio + (Math.sin(week * 1.5 + Object.keys(factorScores).length) * 3))
        ));
      }

      const snapshot = {
        timestamp: timestamp.toISOString(),
        score,
        level: getLevelForScore(score),
        factorScores,
      };
      snapshots.push(snapshot);
    }

    await kv.set(`risk-history:${patientId}`, snapshots);
  }

  await kv.set('risk-history-seeded', { seededAt: now.toISOString() });
  console.log('[risk-scoring] Historical snapshots seeded ✓');
}

// Seed on first request
let historySeeded = false;

// ─── Default Threshold Configuration ────────────────────────────────────────

const DEFAULT_THRESHOLD_CONFIG = {
  rules: [
    {
      id: 'threshold-critical',
      name: 'Critical Risk Alert',
      scoreThreshold: 75,
      level: 'critical',
      enabled: true,
      alertSeverity: 'critical',
      notifyRoles: ['clinician', 'supervisor', 'physician'],
    },
    {
      id: 'threshold-high',
      name: 'High Risk Alert',
      scoreThreshold: 50,
      level: 'high',
      enabled: true,
      alertSeverity: 'high',
      notifyRoles: ['clinician', 'supervisor'],
    },
    {
      id: 'threshold-moderate',
      name: 'Moderate Risk Watch',
      scoreThreshold: 25,
      level: 'moderate',
      enabled: false,
      alertSeverity: 'warning',
      notifyRoles: ['clinician'],
    },
    {
      id: 'threshold-custom',
      name: 'Custom Monitoring Threshold',
      scoreThreshold: 60,
      level: 'high',
      enabled: false,
      alertSeverity: 'warning',
      notifyRoles: ['clinician', 'supervisor'],
    },
  ],
  globalEnabled: true,
  cooldownHours: 24,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

async function getThresholdConfig() {
  const config = await kv.get('risk-threshold-config');
  if (config) return config;
  // Initialize default config
  await kv.set('risk-threshold-config', DEFAULT_THRESHOLD_CONFIG);
  return DEFAULT_THRESHOLD_CONFIG;
}

// ─── Threshold Alert Checker ────────────────────────────────────────────────

async function checkThresholds(patientId: string, patientName: string, newScore: number) {
  try {
    const config = await getThresholdConfig();
    if (!config.globalEnabled) return;

    // Get previous score
    const history: any[] = (await kv.get(`risk-history:${patientId}`)) || [];
    const previousSnapshot = history.length > 0 ? history[history.length - 1] : null;
    const previousScore = previousSnapshot ? previousSnapshot.score : 0;

    const enabledRules = config.rules.filter((r: any) => r.enabled);
    const now = new Date();
    const cooldownMs = (config.cooldownHours || 24) * 60 * 60 * 1000;

    for (const rule of enabledRules) {
      const crossedAbove = previousScore < rule.scoreThreshold && newScore >= rule.scoreThreshold;
      const crossedBelow = previousScore >= rule.scoreThreshold && newScore < rule.scoreThreshold;

      if (!crossedAbove && !crossedBelow) continue;

      // Check cooldown — don't re-alert within cooldown window
      const cooldownKey = `risk-alert-cooldown:${patientId}:${rule.id}`;
      const lastAlert = await kv.get(cooldownKey);
      if (lastAlert && (now.getTime() - new Date(lastAlert.firedAt).getTime()) < cooldownMs) {
        continue;
      }

      // Generate threshold alert
      const alertId = `risk-threshold-alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const thresholdAlert = {
        id: alertId,
        patientId,
        patientName,
        ruleId: rule.id,
        ruleName: rule.name,
        previousScore,
        newScore,
        threshold: rule.scoreThreshold,
        direction: crossedAbove ? 'crossed_above' : 'crossed_below',
        alertSeverity: rule.alertSeverity,
        createdAt: now.toISOString(),
        dismissed: false,
      };
      await kv.set(`risk-threshold-alert:${alertId}`, thresholdAlert);

      // Also create a clinical alert in the existing alert system
      const clinicalAlertId = `clinical-risk-${alertId}`;
      const severity = crossedAbove ? rule.alertSeverity : 'info';
      const clinicalAlert = {
        id: clinicalAlertId,
        severity,
        category: 'patient',
        title: crossedAbove
          ? `${rule.name}: ${patientName} (Score: ${newScore})`
          : `Risk Decreased: ${patientName} dropped below ${rule.name} threshold`,
        explanation: crossedAbove
          ? `Patient risk score increased from ${previousScore} to ${newScore}, crossing the ${rule.name} threshold of ${rule.scoreThreshold}. Immediate clinical review recommended.`
          : `Patient risk score decreased from ${previousScore} to ${newScore}, dropping below the ${rule.name} threshold of ${rule.scoreThreshold}.`,
        suggestedResolution: crossedAbove
          ? 'Review patient risk factors and implement recommended interventions. Consider care conference.'
          : 'Continue current care plan. Monitor for sustained improvement.',
        quickAction: { label: 'View Risk Details', route: `/patient/${patientId}/chart`, actionType: 'navigate' },
        status: 'open',
        patientId,
        patientName,
        sourceModule: 'risk-scoring',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      await kv.set(`clinical-alert:${clinicalAlertId}`, clinicalAlert);

      // Set cooldown
      await kv.set(cooldownKey, { firedAt: now.toISOString(), ruleId: rule.id });

      console.log(`[risk-scoring] Threshold alert fired: ${rule.name} for ${patientName} (${previousScore} → ${newScore})`);
    }
  } catch (error: any) {
    console.error('[risk-scoring] Threshold check error:', error);
  }
}

// ─── Snapshot Recorder ──────────────────────────────────────────────────────

async function recordSnapshot(patientId: string, riskScore: any) {
  const snapshot = {
    timestamp: riskScore.calculatedAt,
    score: riskScore.overallScore,
    level: riskScore.level,
    factorScores: riskScore.factors.reduce((acc: any, f: any) => {
      acc[f.category] = f.score;
      return acc;
    }, {}),
  };

  const history: any[] = (await kv.get(`risk-history:${patientId}`)) || [];
  history.push(snapshot);

  // Keep last 52 weeks max
  if (history.length > 52) {
    history.splice(0, history.length - 52);
  }

  await kv.set(`risk-history:${patientId}`, history);
}

// ─── Routes ─────────────────────────────────────────────────────────────────

// GET /risk-scoring/:patientId — Get risk score for a single patient
app.get('/make-server-845bc545/risk-scoring/:patientId', async (c) => {
  try {
    // Ensure history is seeded
    if (!historySeeded) {
      await seedHistoricalSnapshots();
      historySeeded = true;
    }

    const patientId = c.req.param('patientId');
    const profile = PATIENT_PROFILES[patientId];

    if (!profile) {
      return c.json({
        riskScore: {
          patientId,
          patientName: 'Unknown Patient',
          overallScore: 15,
          level: 'low',
          factors: [],
          calculatedAt: new Date().toISOString(),
          trend: 'stable',
          recommendations: [],
        },
      });
    }

    const patientName = PATIENT_NAMES[patientId] || 'Unknown';
    const riskScore = calculateRiskScore(patientId, patientName, profile);

    // Get previous score for trend display
    const history: any[] = (await kv.get(`risk-history:${patientId}`)) || [];
    if (history.length > 0) {
      riskScore.previousScore = history[history.length - 1].score;
    }

    // Cache and record
    await kv.set(`risk-score:${patientId}`, riskScore);

    // Check thresholds (only fire alerts when score has changed)
    await checkThresholds(patientId, patientName, riskScore.overallScore);

    return c.json({ riskScore });
  } catch (error: any) {
    console.error('[risk-scoring] Error:', error);
    return c.json({ error: `Failed to calculate risk score: ${error.message}` }, 500);
  }
});

// GET /risk-scoring — Get risk scores for ALL patients (batch)
app.get('/make-server-845bc545/risk-scoring', async (c) => {
  try {
    if (!historySeeded) {
      await seedHistoricalSnapshots();
      historySeeded = true;
    }

    const scores = [];

    for (const [patientId, profile] of Object.entries(PATIENT_PROFILES)) {
      const patientName = PATIENT_NAMES[patientId] || 'Unknown';
      const riskScore = calculateRiskScore(patientId, patientName, profile);

      const history: any[] = (await kv.get(`risk-history:${patientId}`)) || [];
      if (history.length > 0) {
        riskScore.previousScore = history[history.length - 1].score;
      }

      await kv.set(`risk-score:${patientId}`, riskScore);
      scores.push(riskScore);
    }

    scores.sort((a, b) => b.overallScore - a.overallScore);

    const highRiskCount = scores.filter(s => s.level === 'high' || s.level === 'critical').length;
    const criticalCount = scores.filter(s => s.level === 'critical').length;

    return c.json({ scores, highRiskCount, criticalCount });
  } catch (error: any) {
    console.error('[risk-scoring/batch] Error:', error);
    return c.json({ error: `Failed to calculate batch risk scores: ${error.message}` }, 500);
  }
});

// GET /risk-scoring/:patientId/history — Get trend history snapshots
app.get('/make-server-845bc545/risk-scoring/:patientId/history', async (c) => {
  try {
    if (!historySeeded) {
      await seedHistoricalSnapshots();
      historySeeded = true;
    }

    const patientId = c.req.param('patientId');
    const snapshots: any[] = (await kv.get(`risk-history:${patientId}`)) || [];

    return c.json({ patientId, snapshots });
  } catch (error: any) {
    console.error('[risk-scoring/history] Error:', error);
    return c.json({ error: `Failed to fetch risk history: ${error.message}` }, 500);
  }
});

// GET /risk-scoring-config/thresholds — Get threshold configuration
app.get('/make-server-845bc545/risk-scoring-config/thresholds', async (c) => {
  try {
    const config = await getThresholdConfig();
    return c.json({ config });
  } catch (error: any) {
    console.error('[risk-scoring/thresholds] Error:', error);
    return c.json({ error: `Failed to fetch thresholds: ${error.message}` }, 500);
  }
});

// PUT /risk-scoring-config/thresholds — Update threshold configuration
app.put('/make-server-845bc545/risk-scoring-config/thresholds', async (c) => {
  try {
    const body = await c.req.json();
    const existing = await getThresholdConfig();

    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    // Validate rules
    if (updated.rules) {
      for (const rule of updated.rules) {
        if (rule.scoreThreshold < 0 || rule.scoreThreshold > 100) {
          return c.json({ error: `Invalid threshold ${rule.scoreThreshold} for rule ${rule.name}. Must be 0-100.` }, 400);
        }
      }
    }

    await kv.set('risk-threshold-config', updated);
    console.log('[risk-scoring] Threshold config updated');
    return c.json({ config: updated });
  } catch (error: any) {
    console.error('[risk-scoring/thresholds] PUT Error:', error);
    return c.json({ error: `Failed to update thresholds: ${error.message}` }, 500);
  }
});

// GET /risk-scoring-config/threshold-alerts — Get threshold-triggered alerts
app.get('/make-server-845bc545/risk-scoring-config/threshold-alerts', async (c) => {
  try {
    const allAlerts = (await kv.getByPrefix('risk-threshold-alert:')) || [];
    allAlerts.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return c.json({ alerts: allAlerts.slice(0, 100) });
  } catch (error: any) {
    console.error('[risk-scoring/threshold-alerts] Error:', error);
    return c.json({ error: `Failed to fetch threshold alerts: ${error.message}` }, 500);
  }
});

// PUT /risk-scoring-config/threshold-alerts/:id/dismiss — Dismiss a threshold alert
app.put('/make-server-845bc545/risk-scoring-config/threshold-alerts/:id/dismiss', async (c) => {
  try {
    const id = c.req.param('id');
    const alert = await kv.get(`risk-threshold-alert:${id}`);
    if (!alert) return c.json({ error: 'Alert not found' }, 404);
    alert.dismissed = true;
    await kv.set(`risk-threshold-alert:${id}`, alert);
    return c.json({ alert });
  } catch (error: any) {
    console.error('[risk-scoring/threshold-alerts/dismiss] Error:', error);
    return c.json({ error: `Failed to dismiss alert: ${error.message}` }, 500);
  }
});

export default app;