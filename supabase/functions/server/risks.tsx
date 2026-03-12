/**
 * Predictive Risk Dashboard Server
 * Computes operational risk intelligence from KV store data.
 * Analyzes patients, caregivers, admissions, claims, and authorizations.
 *
 * Features:
 * - Configurable risk thresholds (GET/PUT /risks/config)
 * - Real trend history tracking (GET /risks/history, daily snapshots)
 * - CSV export (GET /risks/export)
 * - Full dashboard computation (GET /risks/dashboard)
 */
import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ─── Helpers ────────────────────────────────────────────────────────────────

function daysFromNow(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function riskId(): string {
  return `risk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Default Threshold Config (mirrored from riskTypes.ts for server) ───────

const DEFAULT_THRESHOLDS: any = {
  hospitalization: {
    criticalThreshold: 75, highThreshold: 55, mediumThreshold: 35, minScoreToShow: 30,
    weights: {
      priorHospitalizations2Plus: 25, priorHospitalizations1: 10,
      recentERVisit: 20, highFallRisk: 15, livesAlone: 10,
      cognitiveImpairment: 10, polypharmacy: 10, lowADL: 10,
      highOASIS: 10, advancedAge: 5,
    },
  },
  missed_visits: {
    criticalThreshold: 70, highThreshold: 50, mediumThreshold: 30, minScoreToShow: 20,
    weights: {
      missedVisitPerVisit: 20, consecutiveMissedPerVisit: 15,
      lowCompliance50: 20, lowCompliance75: 10,
    },
  },
  caregiver_reliability: {
    criticalThreshold: 70, highThreshold: 50, mediumThreshold: 30, minScoreToShow: 25,
    weights: {
      missedRate10Plus: 35, missedRate5Plus: 20,
      lateRate15Plus: 20, lateRate10Plus: 10,
      docDelay4hPlus: 20, docDelay2hPlus: 10,
      unsignedNotes3Plus: 15,
    },
  },
  missing_documentation: {
    criticalThreshold: 70, highThreshold: 50, mediumThreshold: 30, minScoreToShow: 15,
    weights: { perMissingDoc: 15, missingF2F: 10, missingInsurance: 10 },
  },
  claim_rejection: {
    criticalThreshold: 80, highThreshold: 55, mediumThreshold: 35, minScoreToShow: 25,
    weights: {},
  },
  expiring_authorization: {
    criticalThreshold: 70, highThreshold: 50, mediumThreshold: 30, minScoreToShow: 20,
    weights: {
      expires3Days: 50, expires7Days: 35, expires14Days: 20, expires30Days: 10,
      visitsExhausted: 30, visits2Remaining: 20,
    },
  },
};

function severityFromScore(score: number, cfg: any): string {
  if (score >= cfg.criticalThreshold) return 'critical';
  if (score >= cfg.highThreshold) return 'high';
  if (score >= cfg.mediumThreshold) return 'medium';
  return 'low';
}

async function loadThresholds(): Promise<any> {
  const saved = await kv.get('risk-config:thresholds');
  if (saved) {
    // Merge with defaults so any new keys are present
    const merged: any = {};
    for (const cat of Object.keys(DEFAULT_THRESHOLDS)) {
      merged[cat] = {
        ...DEFAULT_THRESHOLDS[cat],
        ...(saved[cat] || {}),
        weights: { ...DEFAULT_THRESHOLDS[cat].weights, ...(saved[cat]?.weights || {}) },
      };
    }
    merged.updatedAt = saved.updatedAt;
    merged.updatedBy = saved.updatedBy;
    return merged;
  }
  return { ...DEFAULT_THRESHOLDS };
}

// ─── Seed Risk-Relevant Data ────────────────────────────────────────────────

export async function seedRiskData() {
  console.log('[risks] Seeding risk-relevant data...');

  // Authorizations with various expiry dates
  const authorizations = [
    { id: 'auth-001', patientId: 'patient-demo-001', patientName: 'John Smith', payer: 'Medicare', discipline: 'RN', authorizedVisits: 20, usedVisits: 18, startDate: '2026-01-15', endDate: '2026-03-15', status: 'active' },
    { id: 'auth-002', patientId: 'patient-demo-002', patientName: 'Mary Johnson', payer: 'Blue Cross', discipline: 'PT', authorizedVisits: 12, usedVisits: 5, startDate: '2026-02-01', endDate: '2026-04-01', status: 'active' },
    { id: 'auth-003', patientId: 'patient-demo-003', patientName: 'Robert Williams', payer: 'Medicare', discipline: 'RN', authorizedVisits: 30, usedVisits: 28, startDate: '2026-01-10', endDate: '2026-03-10', status: 'active' },
    { id: 'auth-004', patientId: 'patient-demo-004', patientName: 'Patricia Brown', payer: 'Medicaid', discipline: 'OT', authorizedVisits: 16, usedVisits: 10, startDate: '2026-02-05', endDate: '2026-04-05', status: 'active' },
    { id: 'auth-005', patientId: 'patient-demo-001', patientName: 'John Smith', payer: 'Medicare', discipline: 'PT', authorizedVisits: 8, usedVisits: 8, startDate: '2026-01-15', endDate: '2026-03-12', status: 'active' },
    { id: 'auth-006', patientId: 'patient-demo-006', patientName: 'Linda Garcia', payer: 'Aetna', discipline: 'RN', authorizedVisits: 24, usedVisits: 22, startDate: '2025-12-01', endDate: '2026-03-09', status: 'active' },
  ];

  // Clinical risk indicators per patient
  const clinicalRisks = [
    { id: 'clinrisk-001', patientId: 'patient-demo-001', patientName: 'John Smith', mrn: 'MRN001234', age: 81, diagnoses: ['M54.5 Low back pain', 'I10 Hypertension', 'E11.9 Type 2 DM'], priorHospitalizations: 2, fallRisk: 'high', adlScore: 14, oasisScore: 68, recentERVisit: true, recentERDate: '2026-02-28', medicationCount: 12, livesAlone: true, cognitiveImpairment: false },
    { id: 'clinrisk-002', patientId: 'patient-demo-002', patientName: 'Mary Johnson', mrn: 'MRN001235', age: 73, diagnoses: ['E11.9 Type 2 DM', 'I25.10 CAD'], priorHospitalizations: 0, fallRisk: 'medium', adlScore: 18, oasisScore: 45, recentERVisit: false, recentERDate: null, medicationCount: 7, livesAlone: false, cognitiveImpairment: false },
    { id: 'clinrisk-003', patientId: 'patient-demo-003', patientName: 'Robert Williams', mrn: 'MRN001236', age: 87, diagnoses: ['C34.90 Lung cancer', 'J44.1 COPD', 'I50.9 Heart failure'], priorHospitalizations: 3, fallRisk: 'high', adlScore: 10, oasisScore: 82, recentERVisit: true, recentERDate: '2026-03-01', medicationCount: 15, livesAlone: true, cognitiveImpairment: true },
    { id: 'clinrisk-004', patientId: 'patient-demo-004', patientName: 'Patricia Brown', mrn: 'MRN001237', age: 75, diagnoses: ['I50.9 Heart failure', 'N18.3 CKD Stage 3'], priorHospitalizations: 1, fallRisk: 'high', adlScore: 12, oasisScore: 71, recentERVisit: false, recentERDate: null, medicationCount: 10, livesAlone: false, cognitiveImpairment: false },
    { id: 'clinrisk-005', patientId: 'patient-demo-005', patientName: 'James Davis', mrn: 'MRN001238', age: 77, diagnoses: ['S72.001A Femur fracture', 'I10 Hypertension'], priorHospitalizations: 1, fallRisk: 'high', adlScore: 8, oasisScore: 75, recentERVisit: false, recentERDate: null, medicationCount: 9, livesAlone: true, cognitiveImpairment: false },
    { id: 'clinrisk-006', patientId: 'patient-demo-006', patientName: 'Linda Garcia', mrn: 'MRN001239', age: 70, diagnoses: ['Z96.641 Knee replacement', 'E78.5 Hyperlipidemia'], priorHospitalizations: 0, fallRisk: 'low', adlScore: 20, oasisScore: 30, recentERVisit: false, recentERDate: null, medicationCount: 4, livesAlone: false, cognitiveImpairment: false },
  ];

  // Visit compliance — required vs delivered
  const visitCompliance = [
    { id: 'vc-001', patientId: 'patient-demo-001', patientName: 'John Smith', mrn: 'MRN001234', discipline: 'RN', requiredWeekly: 3, deliveredThisWeek: 1, deliveredLastWeek: 2, missedConsecutive: 2, certPeriodEnd: '2026-03-15' },
    { id: 'vc-002', patientId: 'patient-demo-001', patientName: 'John Smith', mrn: 'MRN001234', discipline: 'PT', requiredWeekly: 2, deliveredThisWeek: 0, deliveredLastWeek: 1, missedConsecutive: 3, certPeriodEnd: '2026-03-15' },
    { id: 'vc-003', patientId: 'patient-demo-003', patientName: 'Robert Williams', mrn: 'MRN001236', discipline: 'RN', requiredWeekly: 5, deliveredThisWeek: 3, deliveredLastWeek: 4, missedConsecutive: 0, certPeriodEnd: '2026-07-09' },
    { id: 'vc-004', patientId: 'patient-demo-004', patientName: 'Patricia Brown', mrn: 'MRN001237', discipline: 'OT', requiredWeekly: 3, deliveredThisWeek: 1, deliveredLastWeek: 2, missedConsecutive: 1, certPeriodEnd: '2026-04-05' },
    { id: 'vc-005', patientId: 'patient-demo-005', patientName: 'James Davis', mrn: 'MRN001238', discipline: 'PT', requiredWeekly: 3, deliveredThisWeek: 2, deliveredLastWeek: 3, missedConsecutive: 0, certPeriodEnd: '2026-05-01' },
  ];

  // Caregiver performance
  const caregiverPerf = [
    { id: 'cgperf-001', caregiverId: 'cg-nurse-1', name: 'Maria Rodriguez, RN', discipline: 'RN', totalVisits30d: 85, missedVisits30d: 8, lateVisits30d: 12, missedRate: 9.4, lateRate: 14.1, avgDocCompletionHrs: 2.1, openNotes: 3 },
    { id: 'cgperf-002', caregiverId: 'cg-pt-1', name: 'James Carter, PT', discipline: 'PT', totalVisits30d: 60, missedVisits30d: 1, lateVisits30d: 3, missedRate: 1.7, lateRate: 5.0, avgDocCompletionHrs: 1.5, openNotes: 0 },
    { id: 'cgperf-003', caregiverId: 'cg-ot-1', name: 'Lisa Park, OT', discipline: 'OT', totalVisits30d: 55, missedVisits30d: 6, lateVisits30d: 9, missedRate: 10.9, lateRate: 16.4, avgDocCompletionHrs: 4.2, openNotes: 5 },
    { id: 'cgperf-004', caregiverId: 'cg-aide-1', name: 'Angela Thomas, HHA', discipline: 'AIDE', totalVisits30d: 120, missedVisits30d: 15, lateVisits30d: 25, missedRate: 12.5, lateRate: 20.8, avgDocCompletionHrs: 0.5, openNotes: 0 },
    { id: 'cgperf-005', caregiverId: 'cg-nurse-2', name: 'Karen White, RN', discipline: 'RN', totalVisits30d: 78, missedVisits30d: 2, lateVisits30d: 5, missedRate: 2.6, lateRate: 6.4, avgDocCompletionHrs: 1.8, openNotes: 1 },
    { id: 'cgperf-006', caregiverId: 'cg-st-1', name: 'David Kim, ST', discipline: 'ST', totalVisits30d: 40, missedVisits30d: 5, lateVisits30d: 7, missedRate: 12.5, lateRate: 17.5, avgDocCompletionHrs: 3.5, openNotes: 4 },
  ];

  // Admission documentation completeness
  const admDocStatus = [
    { id: 'admdoc-001', admissionId: 'adm-001', patientId: 'patient-demo-001', patientName: 'John Smith', oasisComplete: true, f2fComplete: true, pocSigned: true, insuranceVerified: true, consentSigned: true, abnSigned: false, dmeOrdered: false, mdOrdersSigned: true, missingDocs: ['ABN', 'DME Order'] },
    { id: 'admdoc-002', admissionId: 'adm-002', patientId: 'patient-demo-002', patientName: 'Mary Johnson', oasisComplete: true, f2fComplete: false, pocSigned: true, insuranceVerified: true, consentSigned: true, abnSigned: true, dmeOrdered: true, mdOrdersSigned: false, missingDocs: ['Face-to-Face', 'MD Orders'] },
    { id: 'admdoc-003', admissionId: 'adm-003', patientId: 'patient-demo-003', patientName: 'Robert Williams', oasisComplete: true, f2fComplete: true, pocSigned: false, insuranceVerified: true, consentSigned: true, abnSigned: true, dmeOrdered: true, mdOrdersSigned: true, missingDocs: ['Plan of Care Signature'] },
    { id: 'admdoc-004', admissionId: 'adm-004', patientId: 'patient-demo-004', patientName: 'Patricia Brown', oasisComplete: false, f2fComplete: false, pocSigned: false, insuranceVerified: false, consentSigned: true, abnSigned: false, dmeOrdered: false, missingDocs: ['OASIS', 'Face-to-Face', 'POC Signature', 'Insurance Verification', 'ABN', 'DME Order'] },
    { id: 'admdoc-005', admissionId: 'adm-005', patientId: 'patient-demo-005', patientName: 'James Davis', oasisComplete: false, f2fComplete: false, pocSigned: false, insuranceVerified: true, consentSigned: false, abnSigned: false, dmeOrdered: false, mdOrdersSigned: false, missingDocs: ['OASIS', 'Face-to-Face', 'POC', 'Consent', 'ABN', 'DME Order', 'MD Orders'] },
  ];

  // Claims at risk
  const claimRisks = [
    { id: 'claimrisk-001', claimId: 'clm-2026-0145', patientId: 'patient-demo-001', patientName: 'John Smith', payer: 'Medicare', totalAmount: 2850.00, serviceDate: '2026-02-15', submittedDate: '2026-02-28', status: 'pending', rejectionRisk: 72, riskFactors: ['Missing F2F documentation', 'Prior claim denied for same diagnosis', 'Timely filing approaching'] },
    { id: 'claimrisk-002', claimId: 'clm-2026-0178', patientId: 'patient-demo-002', patientName: 'Mary Johnson', payer: 'Blue Cross', totalAmount: 1200.00, serviceDate: '2026-02-20', submittedDate: '2026-03-01', status: 'pending', rejectionRisk: 45, riskFactors: ['Authorization nearly exhausted', 'Missing pre-authorization for PT'] },
    { id: 'claimrisk-003', claimId: 'clm-2026-0192', patientId: 'patient-demo-004', patientName: 'Patricia Brown', payer: 'Medicaid', totalAmount: 3400.00, serviceDate: '2026-02-25', submittedDate: null, status: 'unbilled', rejectionRisk: 88, riskFactors: ['Missing OASIS assessment', 'Insurance not verified', 'No POC signature', 'Multiple missing documents'] },
    { id: 'claimrisk-004', claimId: 'clm-2026-0201', patientId: 'patient-demo-003', patientName: 'Robert Williams', payer: 'Medicare', totalAmount: 4200.00, serviceDate: '2026-03-01', submittedDate: '2026-03-05', status: 'pending', rejectionRisk: 35, riskFactors: ['Hospice overlap with curative services'] },
    { id: 'claimrisk-005', claimId: 'clm-2026-0089', patientId: 'patient-demo-001', patientName: 'John Smith', payer: 'Medicare', totalAmount: 1850.00, serviceDate: '2026-01-30', submittedDate: '2026-02-10', status: 'denied', rejectionRisk: 100, riskFactors: ['Denied: Duplicate claim', 'Prior period overlap'] },
  ];

  // Write all to KV
  for (const a of authorizations) await kv.set(`authorization:${a.id}`, a);
  for (const c of clinicalRisks) await kv.set(`clinical-risk:${c.id}`, c);
  for (const v of visitCompliance) await kv.set(`visit-compliance:${v.id}`, v);
  for (const p of caregiverPerf) await kv.set(`caregiver-perf:${p.id}`, p);
  for (const d of admDocStatus) await kv.set(`adm-doc-status:${d.id}`, d);
  for (const r of claimRisks) await kv.set(`claim-risk:${r.id}`, r);

  // Seed 7 days of historical snapshots for initial trend display
  const baseScores: Record<string, number> = {
    hospitalization: 58, missed_visits: 42, caregiver_reliability: 38,
    missing_documentation: 50, claim_rejection: 48, expiring_authorization: 35,
  };
  for (let i = 6; i >= 1; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().split('T')[0];
    const snapshot = {
      date: dateKey,
      overallScore: Math.round(55 + (6 - i) * 1.2 + (Math.random() * 6 - 3)),
      totalRisks: Math.round(18 + (Math.random() * 4 - 2)),
      criticalCount: Math.round(3 + (Math.random() * 2 - 1)),
      highCount: Math.round(5 + (Math.random() * 2 - 1)),
      categoryScores: {} as Record<string, number>,
    };
    for (const cat of Object.keys(baseScores)) {
      (snapshot.categoryScores as any)[cat] = Math.round(
        baseScores[cat] + (6 - i) * 1.5 + (Math.random() * 10 - 5)
      );
    }
    await kv.set(`risk-snapshot:${dateKey}`, snapshot);
  }

  console.log('[risks] Seeded risk data and historical snapshots successfully');
}

// ─── Compute Risks (shared logic) ───────────────────────────────────────────

async function computeRisks(cfg: any) {
  const now = new Date().toISOString();
  const risks: any[] = [];

  // 1. Hospitalization Risk
  const hCfg = cfg.hospitalization;
  const clinicalRisks = (await kv.getByPrefix('clinical-risk:')) || [];
  for (const cr of clinicalRisks) {
    let score = 0;
    const factors: string[] = [];
    const w = hCfg.weights;

    if (cr.priorHospitalizations >= 2) { score += w.priorHospitalizations2Plus; factors.push(`${cr.priorHospitalizations} prior hospitalizations in 12 months`); }
    else if (cr.priorHospitalizations === 1) { score += w.priorHospitalizations1; factors.push('1 prior hospitalization'); }

    if (cr.recentERVisit) { score += w.recentERVisit; factors.push(`Recent ER visit on ${cr.recentERDate}`); }
    if (cr.fallRisk === 'high') { score += w.highFallRisk; factors.push('High fall risk'); }
    if (cr.livesAlone) { score += w.livesAlone; factors.push('Lives alone'); }
    if (cr.cognitiveImpairment) { score += w.cognitiveImpairment; factors.push('Cognitive impairment'); }
    if (cr.medicationCount >= 10) { score += w.polypharmacy; factors.push(`Polypharmacy: ${cr.medicationCount} medications`); }
    if (cr.adlScore <= 12) { score += w.lowADL; factors.push(`Low ADL score: ${cr.adlScore}/24`); }
    if (cr.oasisScore >= 60) { score += w.highOASIS; factors.push(`OASIS acuity score: ${cr.oasisScore}`); }
    if (cr.age >= 85) { score += w.advancedAge; factors.push(`Age ${cr.age}`); }

    score = Math.min(100, score);
    if (score >= hCfg.minScoreToShow) {
      risks.push({
        id: riskId(), category: 'hospitalization',
        severity: severityFromScore(score, hCfg), riskScore: score,
        title: `${cr.patientName} — Hospitalization Risk`,
        description: `${cr.age}-year-old patient with ${cr.diagnoses.length} active diagnoses and OASIS score of ${cr.oasisScore}`,
        entityType: 'patient', entityId: cr.patientId, entityName: cr.patientName,
        factors,
        suggestedAction: score >= 60 ? 'Schedule immediate RN assessment and care conference' : 'Monitor closely; review at next visit',
        metadata: { mrn: cr.mrn, age: cr.age, oasisScore: cr.oasisScore, diagnoses: cr.diagnoses },
        createdAt: now,
      });
    }
  }

  // 2. Missing Required Visits
  const mvCfg = cfg.missed_visits;
  const visitComps = (await kv.getByPrefix('visit-compliance:')) || [];
  for (const vc of visitComps) {
    const missedThisWeek = vc.requiredWeekly - vc.deliveredThisWeek;
    const complianceRate = Math.round(((vc.deliveredThisWeek + vc.deliveredLastWeek) / (vc.requiredWeekly * 2)) * 100);
    let score = 0;
    const factors: string[] = [];
    const w = mvCfg.weights;

    if (missedThisWeek > 0) { score += missedThisWeek * w.missedVisitPerVisit; factors.push(`${missedThisWeek} ${vc.discipline} visits missed this week`); }
    if (vc.missedConsecutive >= 2) { score += vc.missedConsecutive * w.consecutiveMissedPerVisit; factors.push(`${vc.missedConsecutive} consecutive missed visits`); }
    if (complianceRate < 50) { score += w.lowCompliance50; factors.push(`2-week compliance rate: ${complianceRate}%`); }
    else if (complianceRate < 75) { score += w.lowCompliance75; factors.push(`2-week compliance rate: ${complianceRate}%`); }

    score = Math.min(100, score);
    if (score >= mvCfg.minScoreToShow) {
      risks.push({
        id: riskId(), category: 'missed_visits',
        severity: severityFromScore(score, mvCfg), riskScore: score,
        title: `${vc.patientName} — ${vc.discipline} Visits Behind Schedule`,
        description: `${vc.deliveredThisWeek}/${vc.requiredWeekly} visits delivered this week (${complianceRate}% 2-week rate)`,
        entityType: 'patient', entityId: vc.patientId, entityName: vc.patientName,
        factors,
        suggestedAction: score >= 50 ? 'Immediately schedule make-up visits and notify coordinator' : 'Schedule remaining visits for this week',
        metadata: { mrn: vc.mrn, discipline: vc.discipline, requiredWeekly: vc.requiredWeekly, deliveredThisWeek: vc.deliveredThisWeek, complianceRate },
        createdAt: now,
      });
    }
  }

  // 3. Caregiver Reliability
  const crCfg = cfg.caregiver_reliability;
  const cgPerfs = (await kv.getByPrefix('caregiver-perf:')) || [];
  for (const cg of cgPerfs) {
    let score = 0;
    const factors: string[] = [];
    const w = crCfg.weights;

    if (cg.missedRate >= 10) { score += w.missedRate10Plus; factors.push(`Missed visit rate: ${cg.missedRate}% (${cg.missedVisits30d} of ${cg.totalVisits30d})`); }
    else if (cg.missedRate >= 5) { score += w.missedRate5Plus; factors.push(`Missed visit rate: ${cg.missedRate}%`); }

    if (cg.lateRate >= 15) { score += w.lateRate15Plus; factors.push(`Late arrival rate: ${cg.lateRate}%`); }
    else if (cg.lateRate >= 10) { score += w.lateRate10Plus; factors.push(`Late arrival rate: ${cg.lateRate}%`); }

    if (cg.avgDocCompletionHrs >= 4) { score += w.docDelay4hPlus; factors.push(`Avg documentation delay: ${cg.avgDocCompletionHrs}h`); }
    else if (cg.avgDocCompletionHrs >= 2) { score += w.docDelay2hPlus; factors.push(`Avg documentation delay: ${cg.avgDocCompletionHrs}h`); }

    if (cg.openNotes >= 3) { score += w.unsignedNotes3Plus; factors.push(`${cg.openNotes} unsigned visit notes`); }

    score = Math.min(100, score);
    if (score >= crCfg.minScoreToShow) {
      risks.push({
        id: riskId(), category: 'caregiver_reliability',
        severity: severityFromScore(score, crCfg), riskScore: score,
        title: `${cg.name} — Reliability Concern`,
        description: `${cg.missedVisits30d} missed visits and ${cg.lateVisits30d} late arrivals in last 30 days`,
        entityType: 'caregiver', entityId: cg.caregiverId, entityName: cg.name,
        factors,
        suggestedAction: score >= 60 ? 'Schedule performance review meeting immediately' : 'Send reminder and monitor next 2 weeks',
        metadata: { discipline: cg.discipline, totalVisits30d: cg.totalVisits30d, missedRate: cg.missedRate, lateRate: cg.lateRate, openNotes: cg.openNotes },
        createdAt: now,
      });
    }
  }

  // 4. Missing Documentation
  const mdCfg = cfg.missing_documentation;
  const admDocs = (await kv.getByPrefix('adm-doc-status:')) || [];
  for (const doc of admDocs) {
    const missingCount = doc.missingDocs?.length || 0;
    if (missingCount === 0) continue;
    const w = mdCfg.weights;
    let score = Math.min(100, missingCount * w.perMissingDoc);
    const factors: string[] = doc.missingDocs.map((d: string) => `Missing: ${d}`);

    if (!doc.f2fComplete) score += w.missingF2F;
    if (!doc.insuranceVerified) score += w.missingInsurance;
    score = Math.min(100, score);

    if (score >= mdCfg.minScoreToShow) {
      risks.push({
        id: riskId(), category: 'missing_documentation',
        severity: severityFromScore(score, mdCfg), riskScore: score,
        title: `${doc.patientName} — ${missingCount} Missing Document(s)`,
        description: `Admission ${doc.admissionId} has ${missingCount} missing critical documents`,
        entityType: 'admission', entityId: doc.admissionId, entityName: doc.patientName,
        factors,
        suggestedAction: missingCount >= 4 ? 'Flag admission for immediate documentation review' : `Complete missing items: ${doc.missingDocs.join(', ')}`,
        metadata: { admissionId: doc.admissionId, patientId: doc.patientId, missingDocs: doc.missingDocs },
        createdAt: now,
      });
    }
  }

  // 5. Claim Rejection Risk
  const clCfg = cfg.claim_rejection;
  const claimRisksData = (await kv.getByPrefix('claim-risk:')) || [];
  for (const cl of claimRisksData) {
    if (cl.rejectionRisk < clCfg.minScoreToShow) continue;
    risks.push({
      id: riskId(), category: 'claim_rejection',
      severity: severityFromScore(cl.rejectionRisk, clCfg), riskScore: cl.rejectionRisk,
      title: `${cl.patientName} — Claim ${cl.claimId} at Risk`,
      description: `$${cl.totalAmount.toLocaleString()} ${cl.payer} claim with ${cl.rejectionRisk}% rejection probability`,
      entityType: 'claim', entityId: cl.claimId, entityName: cl.patientName,
      factors: cl.riskFactors,
      suggestedAction: cl.rejectionRisk >= 70 ? 'Address risk factors before submission deadline' : 'Review claim and fix documentation gaps',
      metadata: { claimId: cl.claimId, payer: cl.payer, amount: cl.totalAmount, serviceDate: cl.serviceDate, status: cl.status },
      dueDate: cl.status === 'unbilled' ? '2026-03-15' : undefined,
      createdAt: new Date().toISOString(),
    });
  }

  // 6. Expiring Authorizations
  const eaCfg = cfg.expiring_authorization;
  const auths = (await kv.getByPrefix('authorization:')) || [];
  for (const auth of auths) {
    const daysLeft = daysFromNow(auth.endDate);
    const visitsRemaining = auth.authorizedVisits - auth.usedVisits;
    let score = 0;
    const factors: string[] = [];
    const w = eaCfg.weights;

    if (daysLeft <= 3) { score += w.expires3Days; factors.push(`Expires in ${daysLeft} day(s)`); }
    else if (daysLeft <= 7) { score += w.expires7Days; factors.push(`Expires in ${daysLeft} days`); }
    else if (daysLeft <= 14) { score += w.expires14Days; factors.push(`Expires in ${daysLeft} days`); }
    else if (daysLeft <= 30) { score += w.expires30Days; factors.push(`Expires in ${daysLeft} days`); }

    if (visitsRemaining <= 0) { score += w.visitsExhausted; factors.push('All authorized visits exhausted'); }
    else if (visitsRemaining <= 2) { score += w.visits2Remaining; factors.push(`Only ${visitsRemaining} visit(s) remaining`); }

    score = Math.min(100, score);
    if (score >= eaCfg.minScoreToShow) {
      risks.push({
        id: riskId(), category: 'expiring_authorization',
        severity: severityFromScore(score, eaCfg), riskScore: score,
        title: `${auth.patientName} — ${auth.discipline} Auth Expiring`,
        description: `${auth.payer} authorization: ${visitsRemaining} visits left, expires ${auth.endDate}`,
        entityType: 'authorization', entityId: auth.id, entityName: auth.patientName,
        factors,
        suggestedAction: daysLeft <= 7 ? 'Submit re-authorization request immediately' : 'Prepare re-authorization paperwork',
        dueDate: auth.endDate, daysUntilDue: daysLeft,
        metadata: { payer: auth.payer, discipline: auth.discipline, authorizedVisits: auth.authorizedVisits, usedVisits: auth.usedVisits, endDate: auth.endDate, patientId: auth.patientId },
        createdAt: now,
      });
    }
  }

  risks.sort((a: any, b: any) => b.riskScore - a.riskScore);
  return { risks, cgPerfs, claimRisksData: claimRisksData, auths };
}

// ─── GET /risks/config — Return current threshold configuration ─────────────

app.get('/make-server-845bc545/risks/config', async (c) => {
  try {
    const cfg = await loadThresholds();
    return c.json(cfg);
  } catch (error: any) {
    console.error('[risks/config GET] Error:', error);
    return c.json({ error: `Failed to load risk config: ${error.message}` }, 500);
  }
});

// ─── PUT /risks/config — Update threshold configuration ─────────────────────

app.put('/make-server-845bc545/risks/config', async (c) => {
  try {
    const body = await c.req.json();
    // Validate that body has the right structure
    const categories = ['hospitalization', 'missed_visits', 'caregiver_reliability', 'missing_documentation', 'claim_rejection', 'expiring_authorization'];
    for (const cat of categories) {
      if (!body[cat]) {
        return c.json({ error: `Missing category: ${cat}` }, 400);
      }
      const cc = body[cat];
      if (typeof cc.criticalThreshold !== 'number' || typeof cc.highThreshold !== 'number' ||
          typeof cc.mediumThreshold !== 'number' || typeof cc.minScoreToShow !== 'number') {
        return c.json({ error: `Invalid threshold values for ${cat}` }, 400);
      }
    }
    body.updatedAt = new Date().toISOString();
    await kv.set('risk-config:thresholds', body);
    console.log('[risks/config PUT] Thresholds updated');
    return c.json({ success: true, updatedAt: body.updatedAt });
  } catch (error: any) {
    console.error('[risks/config PUT] Error:', error);
    return c.json({ error: `Failed to update risk config: ${error.message}` }, 500);
  }
});

// ─── GET /risks/history — Return historical trend snapshots ─────────────────

app.get('/make-server-845bc545/risks/history', async (c) => {
  try {
    const daysParam = c.req.query('days') || '30';
    const days = Math.min(90, Math.max(7, parseInt(daysParam, 10) || 30));

    const snapshots = (await kv.getByPrefix('risk-snapshot:')) || [];
    // Sort by date ascending
    snapshots.sort((a: any, b: any) => a.date.localeCompare(b.date));

    // Filter to last N days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    const filtered = snapshots.filter((s: any) => s.date >= cutoffStr);

    // Convert to RiskTrendPoint format
    const trends = filtered.map((s: any) => ({
      date: s.date,
      hospitalization: s.categoryScores?.hospitalization ?? 0,
      missed_visits: s.categoryScores?.missed_visits ?? 0,
      caregiver_reliability: s.categoryScores?.caregiver_reliability ?? 0,
      missing_documentation: s.categoryScores?.missing_documentation ?? 0,
      claim_rejection: s.categoryScores?.claim_rejection ?? 0,
      expiring_authorization: s.categoryScores?.expiring_authorization ?? 0,
    }));

    return c.json({ trends, snapshots: filtered, totalDays: days });
  } catch (error: any) {
    console.error('[risks/history] Error:', error);
    return c.json({ error: `Failed to load risk history: ${error.message}` }, 500);
  }
});

// ─── GET /risks/export — CSV export of all risk items ───────────────────────

app.get('/make-server-845bc545/risks/export', async (c) => {
  try {
    const cfg = await loadThresholds();
    const { risks } = await computeRisks(cfg);

    // Build CSV
    const headers = [
      'Risk ID', 'Category', 'Severity', 'Risk Score', 'Title', 'Description',
      'Entity Type', 'Entity ID', 'Entity Name', 'Risk Factors', 'Suggested Action',
      'Due Date', 'Days Until Due', 'Created At',
    ];

    function csvEscape(val: any): string {
      if (val === undefined || val === null) return '';
      const s = String(val);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    }

    const rows = risks.map((r: any) => [
      r.id, r.category, r.severity, r.riskScore, r.title, r.description,
      r.entityType, r.entityId, r.entityName,
      (r.factors || []).join('; '), r.suggestedAction,
      r.dueDate || '', r.daysUntilDue ?? '', r.createdAt,
    ].map(csvEscape).join(','));

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="risk-report-${todayISO()}.csv"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Disposition',
      },
    });
  } catch (error: any) {
    console.error('[risks/export] Error:', error);
    return c.json({ error: `Failed to export risk data: ${error.message}` }, 500);
  }
});

// ─── GET /risks/dashboard — Full dashboard (now with real trends) ───────────

app.get('/make-server-845bc545/risks/dashboard', async (c) => {
  try {
    const now = new Date().toISOString();
    const cfg = await loadThresholds();
    const { risks, cgPerfs, claimRisksData, auths } = await computeRisks(cfg);

    // Build category summaries
    const categories = [
      'hospitalization', 'missed_visits', 'caregiver_reliability',
      'missing_documentation', 'claim_rejection', 'expiring_authorization'
    ];
    const labels: Record<string, string> = {
      hospitalization: 'Hospitalization Risk',
      missed_visits: 'Missing Required Visits',
      caregiver_reliability: 'Caregiver Reliability',
      missing_documentation: 'Missing Documentation',
      claim_rejection: 'Claim Rejection Risk',
      expiring_authorization: 'Expiring Authorizations',
    };

    // Compute average category scores for today's snapshot
    const categoryScores: Record<string, number> = {};
    for (const cat of categories) {
      const catRisks = risks.filter((r: any) => r.category === cat);
      categoryScores[cat] = catRisks.length > 0
        ? Math.round(catRisks.reduce((s: number, r: any) => s + r.riskScore, 0) / catRisks.length)
        : 0;
    }

    // Load yesterday's snapshot for trend comparison
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    const yesterdaySnapshot = await kv.get(`risk-snapshot:${yesterdayKey}`);

    const categorySummaries = categories.map((cat) => {
      const catRisks = risks.filter((r: any) => r.category === cat);
      const todayScore = categoryScores[cat];
      const yesterdayScore = yesterdaySnapshot?.categoryScores?.[cat] ?? todayScore;
      const diff = todayScore - yesterdayScore;

      return {
        category: cat,
        label: labels[cat],
        total: catRisks.length,
        critical: catRisks.filter((r: any) => r.severity === 'critical').length,
        high: catRisks.filter((r: any) => r.severity === 'high').length,
        medium: catRisks.filter((r: any) => r.severity === 'medium').length,
        low: catRisks.filter((r: any) => r.severity === 'low').length,
        trend: diff > 2 ? 'increasing' : diff < -2 ? 'decreasing' : 'stable',
        trendPct: diff,
      };
    });

    // Generate operational insights
    const critCount = risks.filter((r: any) => r.severity === 'critical').length;
    const highCount = risks.filter((r: any) => r.severity === 'high').length;
    const totalRevAtRisk = claimRisksData.filter((cl: any) => cl.rejectionRisk >= 50).reduce((sum: number, cl: any) => sum + cl.totalAmount, 0);
    const avgMissedRate = cgPerfs.length > 0 ? cgPerfs.reduce((sum: number, cg: any) => sum + cg.missedRate, 0) / cgPerfs.length : 0;
    const insights: any[] = [];

    insights.push({
      id: 'insight-1', type: 'alert',
      title: 'Critical Risks Need Attention',
      description: `${critCount} critical and ${highCount} high-severity risks identified across the agency. Prioritize immediate review.`,
      impact: critCount > 2 ? 'high' : 'medium',
      category: 'hospitalization',
    });
    insights.push({
      id: 'insight-2', type: 'trend',
      title: 'Revenue at Risk',
      description: `$${totalRevAtRisk.toLocaleString()} in pending claims have a high probability of rejection. Address documentation gaps to protect revenue.`,
      impact: 'high', category: 'claim_rejection',
      metric: 'Revenue at Risk', metricValue: totalRevAtRisk, metricUnit: 'USD',
      actionLabel: 'Review Claims', actionRoute: '/billing',
    });
    insights.push({
      id: 'insight-3', type: 'recommendation',
      title: 'Caregiver Performance Coaching',
      description: `Average missed visit rate is ${avgMissedRate.toFixed(1)}% across ${cgPerfs.length} caregivers. ${cgPerfs.filter((c: any) => c.missedRate >= 10).length} staff member(s) exceed the 10% threshold.`,
      impact: 'medium', category: 'caregiver_reliability',
      actionLabel: 'View Staff', actionRoute: '/monitor',
    });
    insights.push({
      id: 'insight-4', type: 'anomaly',
      title: 'Authorization Expiry Cluster',
      description: `${auths.filter((a: any) => daysFromNow(a.endDate) <= 14).length} authorizations expire within 14 days. Bulk re-authorization may be needed.`,
      impact: auths.filter((a: any) => daysFromNow(a.endDate) <= 7).length >= 2 ? 'high' : 'medium',
      category: 'expiring_authorization',
      actionLabel: 'Review Authorizations', actionRoute: '/admissions',
    });
    insights.push({
      id: 'insight-5', type: 'trend',
      title: 'Visit Compliance Declining',
      description: `Multiple patients are below required visit frequency. This may impact clinical outcomes and regulatory compliance.`,
      impact: 'high', category: 'missed_visits',
      actionLabel: 'View Scheduling', actionRoute: '/scheduling',
    });

    // Real trend data from stored snapshots
    const allSnapshots = (await kv.getByPrefix('risk-snapshot:')) || [];
    allSnapshots.sort((a: any, b: any) => a.date.localeCompare(b.date));
    const last7 = allSnapshots.slice(-7);

    // Include today's computed scores
    const todayDate = todayISO();
    const todayAlreadyInSnapshots = last7.some((s: any) => s.date === todayDate);

    const trendData = last7.map((s: any) => ({
      date: s.date,
      hospitalization: s.categoryScores?.hospitalization ?? 0,
      missed_visits: s.categoryScores?.missed_visits ?? 0,
      caregiver_reliability: s.categoryScores?.caregiver_reliability ?? 0,
      missing_documentation: s.categoryScores?.missing_documentation ?? 0,
      claim_rejection: s.categoryScores?.claim_rejection ?? 0,
      expiring_authorization: s.categoryScores?.expiring_authorization ?? 0,
    }));

    if (!todayAlreadyInSnapshots) {
      trendData.push({
        date: todayDate,
        ...categoryScores,
      } as any);
      // Keep only last 7
      if (trendData.length > 7) trendData.shift();
    }

    const overallScore = risks.length > 0
      ? Math.round(risks.reduce((sum: number, r: any) => sum + r.riskScore, 0) / risks.length)
      : 0;
    const previousScore = yesterdaySnapshot?.overallScore ?? Math.max(0, overallScore - 4);

    // Save today's snapshot for future trend tracking
    const todaySnapshot = {
      date: todayDate,
      overallScore,
      totalRisks: risks.length,
      criticalCount: critCount,
      highCount,
      categoryScores,
    };
    await kv.set(`risk-snapshot:${todayDate}`, todaySnapshot);

    return c.json({
      summary: {
        totalRisks: risks.length,
        criticalCount: critCount,
        highCount,
        mediumCount: risks.filter((r: any) => r.severity === 'medium').length,
        lowCount: risks.filter((r: any) => r.severity === 'low').length,
        overallRiskScore: overallScore,
        previousScore,
      },
      categories: categorySummaries,
      risks,
      insights,
      trends: trendData,
      generatedAt: now,
    });
  } catch (error: any) {
    console.error('[risks/dashboard] Error:', error);
    return c.json({ error: `Risk dashboard failed: ${error.message}` }, 500);
  }
});

export default app;
