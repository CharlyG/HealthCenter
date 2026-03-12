/**
 * AI Clinical Assistant Server
 * Aggregates patient data from KV store and generates structured clinical insights.
 * Simulates an LLM-powered clinical copilot using deterministic rule-based analysis.
 *
 * In production, this would call an LLM API with the patient context.
 * The deterministic approach here ensures consistent, explainable outputs.
 */
import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

function insightId(): string {
  return `insight-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function msgId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Data Aggregation ───────────────────────────────────────────────────────

async function aggregatePatientData(patientId: string) {
  // Pull all relevant data sources for this patient
  const allPatients = (await kv.getByPrefix('patient:')) || [];
  const patient = allPatients.find((p: any) => p.id === patientId) || null;

  const allClinicalRisks = (await kv.getByPrefix('clinical-risk:')) || [];
  const clinicalRisk = allClinicalRisks.find((r: any) => r.patientId === patientId) || null;

  const allVisitCompliance = (await kv.getByPrefix('visit-compliance:')) || [];
  const visitCompliance = allVisitCompliance.filter((v: any) => v.patientId === patientId);

  const allAdmDocs = (await kv.getByPrefix('adm-doc-status:')) || [];
  const admDocs = allAdmDocs.filter((d: any) => d.patientId === patientId);

  const allAuths = (await kv.getByPrefix('authorization:')) || [];
  const authorizations = allAuths.filter((a: any) => a.patientId === patientId);

  const allClaims = (await kv.getByPrefix('claim-risk:')) || [];
  const claims = allClaims.filter((c: any) => c.patientId === patientId);

  const allMessages = (await kv.getByPrefix(`collab-msg:${patientId}:`)) || [];
  const allTasks = (await kv.getByPrefix(`collab-task:${patientId}:`)) || [];

  const allAdmissions = (await kv.getByPrefix('admission:')) || [];
  const admissions = allAdmissions.filter((a: any) => a.patient_id === patientId || a.patientId === patientId);

  return {
    patient,
    clinicalRisk,
    visitCompliance,
    admDocs,
    authorizations,
    claims,
    messages: allMessages,
    tasks: allTasks,
    admissions,
  };
}

// ─── Insight Generation Engine ──────────────────────────────────────────────

function generateInsights(data: any): any[] {
  const insights: any[] = [];
  const now = new Date().toISOString();
  const cr = data.clinicalRisk;

  // 1. Patient History Summary (always generate)
  if (cr) {
    const diagList = (cr.diagnoses || []).join(', ');
    const hospHistory = cr.priorHospitalizations > 0
      ? `${cr.priorHospitalizations} hospitalization(s) in the past 12 months`
      : 'No recent hospitalizations';

    insights.push({
      id: insightId(),
      category: 'history_summary',
      severity: 'info',
      title: 'Patient History Overview',
      body: `${cr.patientName} is a ${cr.age}-year-old patient with active diagnoses including ${diagList}. ${hospHistory}. Currently on ${cr.medicationCount} medications. OASIS acuity score: ${cr.oasisScore}/100. ADL independence score: ${cr.adlScore}/24. ${cr.livesAlone ? 'Patient lives alone — social support considerations apply.' : 'Patient has household support.'}`,
      evidence: [
        `Age: ${cr.age}`,
        `Diagnoses: ${diagList}`,
        `Medications: ${cr.medicationCount}`,
        `OASIS Score: ${cr.oasisScore}`,
        `ADL Score: ${cr.adlScore}/24`,
        hospHistory,
      ],
      confidence: 0.95,
      generatedAt: now,
    });
  }

  // 2. Clinical Change Detection
  if (cr?.recentERVisit) {
    insights.push({
      id: insightId(),
      category: 'clinical_change',
      severity: 'critical',
      title: 'Recent Emergency Department Visit',
      body: `Patient visited the ED on ${cr.recentERDate}. This event requires clinical reassessment and may indicate disease progression or inadequate symptom management. Review the discharge summary and update the care plan to address the underlying cause.`,
      evidence: [
        `ED visit date: ${cr.recentERDate}`,
        `Prior hospitalizations: ${cr.priorHospitalizations}`,
        `Current acuity (OASIS): ${cr.oasisScore}`,
      ],
      suggestedAction: 'Schedule urgent RN reassessment within 24-48 hours',
      actionRoute: '/scheduling',
      confidence: 0.98,
      generatedAt: now,
    });
  }

  if (cr?.fallRisk === 'high') {
    insights.push({
      id: insightId(),
      category: 'risk_flag',
      severity: 'warning',
      title: 'High Fall Risk Identified',
      body: `Patient has been assessed as high fall risk. With an ADL score of ${cr.adlScore}/24, independence in activities of daily living is significantly limited.${cr.livesAlone ? ' Combined with living alone, this substantially increases the risk of unwitnessed falls.' : ''} Ensure home safety assessment is current and fall prevention interventions are documented.`,
      evidence: [
        'Fall risk rating: HIGH',
        `ADL independence: ${cr.adlScore}/24`,
        `Lives alone: ${cr.livesAlone ? 'Yes' : 'No'}`,
      ],
      suggestedAction: 'Verify home safety assessment and update fall prevention plan',
      confidence: 0.92,
      generatedAt: now,
    });
  }

  if (cr?.cognitiveImpairment) {
    insights.push({
      id: insightId(),
      category: 'clinical_change',
      severity: 'warning',
      title: 'Cognitive Impairment — Communication Considerations',
      body: `Patient has documented cognitive impairment. Ensure instructions are simplified, involve caregivers in education, and document the patient's level of understanding at each visit. Consider cognitive screening tools to track progression.`,
      evidence: ['Cognitive impairment: Documented'],
      suggestedAction: 'Use teach-back method and involve support persons in education',
      confidence: 0.88,
      generatedAt: now,
    });
  }

  // 3. Medication Alerts
  if (cr?.medicationCount >= 10) {
    insights.push({
      id: insightId(),
      category: 'medication_alert',
      severity: 'warning',
      title: `Polypharmacy Alert — ${cr.medicationCount} Active Medications`,
      body: `Patient is currently prescribed ${cr.medicationCount} medications, exceeding the polypharmacy threshold. This increases the risk of drug interactions, adverse effects, and medication non-adherence. A comprehensive medication reconciliation is recommended, especially following the recent clinical changes.`,
      evidence: [
        `Active medications: ${cr.medicationCount}`,
        `Age: ${cr.age} (higher sensitivity to drug interactions)`,
        cr.recentERVisit ? 'Recent ED visit — medications may have changed' : null,
      ].filter(Boolean),
      suggestedAction: 'Perform medication reconciliation and assess for deprescribing opportunities',
      confidence: 0.90,
      generatedAt: now,
    });
  }

  // 4. Visit Compliance Gaps
  for (const vc of data.visitCompliance || []) {
    const missedThisWeek = vc.requiredWeekly - vc.deliveredThisWeek;
    const complianceRate = Math.round(((vc.deliveredThisWeek + vc.deliveredLastWeek) / (vc.requiredWeekly * 2)) * 100);

    if (missedThisWeek > 0 || vc.missedConsecutive >= 2) {
      insights.push({
        id: insightId(),
        category: 'risk_flag',
        severity: complianceRate < 50 ? 'critical' : 'warning',
        title: `${vc.discipline} Visit Frequency Behind Schedule`,
        body: `Only ${vc.deliveredThisWeek} of ${vc.requiredWeekly} required ${vc.discipline} visits were delivered this week (${complianceRate}% two-week compliance rate).${vc.missedConsecutive >= 2 ? ` There are ${vc.missedConsecutive} consecutive missed visits, which may trigger regulatory scrutiny and impact clinical outcomes.` : ''} This gap should be addressed promptly to maintain continuity of care.`,
        evidence: [
          `Required weekly: ${vc.requiredWeekly} ${vc.discipline} visits`,
          `Delivered this week: ${vc.deliveredThisWeek}`,
          `2-week compliance: ${complianceRate}%`,
          `Consecutive missed: ${vc.missedConsecutive}`,
        ],
        suggestedAction: 'Schedule make-up visits immediately and document reason for variance',
        actionRoute: '/scheduling',
        confidence: 0.95,
        generatedAt: now,
      });
    }
  }

  // 5. Documentation Gaps
  for (const doc of data.admDocs || []) {
    const missingCount = doc.missingDocs?.length || 0;
    if (missingCount > 0) {
      const hasCriticalMissing = !doc.f2fComplete || !doc.pocSigned || !doc.insuranceVerified;
      insights.push({
        id: insightId(),
        category: 'documentation_gap',
        severity: missingCount >= 4 ? 'critical' : hasCriticalMissing ? 'warning' : 'info',
        title: `${missingCount} Missing Document(s) for Admission`,
        body: `The following documents are incomplete or missing for admission ${doc.admissionId}: ${doc.missingDocs.join(', ')}. ${hasCriticalMissing ? 'Critical items like Face-to-Face encounter, Plan of Care signature, or insurance verification are missing — these directly impact billing eligibility and regulatory compliance.' : 'These gaps should be addressed to maintain complete documentation.'}`,
        evidence: doc.missingDocs.map((d: string) => `Missing: ${d}`),
        suggestedAction: missingCount >= 4
          ? 'Flag admission for immediate documentation review with clinical supervisor'
          : `Complete missing items: ${doc.missingDocs.join(', ')}`,
        relatedEntityType: 'admission',
        relatedEntityId: doc.admissionId,
        confidence: 0.97,
        generatedAt: now,
      });
    }
  }

  // 6. Authorization Expiry Warnings
  for (const auth of data.authorizations || []) {
    const endDate = new Date(auth.endDate);
    const daysLeft = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const visitsRemaining = auth.authorizedVisits - auth.usedVisits;

    if (daysLeft <= 14 || visitsRemaining <= 2) {
      insights.push({
        id: insightId(),
        category: 'risk_flag',
        severity: daysLeft <= 3 || visitsRemaining <= 0 ? 'critical' : 'warning',
        title: `${auth.discipline} Authorization ${visitsRemaining <= 0 ? 'Exhausted' : 'Expiring Soon'}`,
        body: `${auth.payer} authorization for ${auth.discipline}: ${visitsRemaining <= 0 ? 'All authorized visits have been used.' : `Only ${visitsRemaining} visit(s) remaining.`} ${daysLeft <= 0 ? 'Authorization has expired.' : `Expires in ${daysLeft} day(s) on ${auth.endDate}.`} Re-authorization should be initiated promptly to avoid service interruption.`,
        evidence: [
          `Payer: ${auth.payer}`,
          `Discipline: ${auth.discipline}`,
          `Used: ${auth.usedVisits}/${auth.authorizedVisits} visits`,
          `Expires: ${auth.endDate} (${daysLeft} days)`,
        ],
        suggestedAction: daysLeft <= 7
          ? 'Submit re-authorization request immediately'
          : 'Prepare re-authorization paperwork this week',
        actionRoute: '/admissions',
        confidence: 0.96,
        generatedAt: now,
      });
    }
  }

  // 7. Claim Risk Flags
  for (const cl of data.claims || []) {
    if (cl.rejectionRisk >= 50) {
      insights.push({
        id: insightId(),
        category: 'risk_flag',
        severity: cl.rejectionRisk >= 80 ? 'critical' : 'warning',
        title: `Claim ${cl.claimId} — ${cl.rejectionRisk}% Rejection Risk`,
        body: `A $${cl.totalAmount.toLocaleString()} ${cl.payer} claim has a ${cl.rejectionRisk}% probability of rejection. Risk factors: ${cl.riskFactors.join('; ')}. ${cl.status === 'unbilled' ? 'This claim has not yet been submitted — address issues before billing.' : 'Review and correct issues to improve approval likelihood.'}`,
        evidence: cl.riskFactors,
        suggestedAction: 'Address documentation gaps and risk factors before submission deadline',
        actionRoute: '/billing',
        relatedEntityType: 'claim',
        relatedEntityId: cl.claimId,
        confidence: 0.88,
        generatedAt: now,
      });
    }
  }

  // 8. Care Coordination Suggestions
  const openTasks = (data.tasks || []).filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled');
  const urgentTasks = openTasks.filter((t: any) => t.priority === 'urgent');
  if (urgentTasks.length > 0) {
    insights.push({
      id: insightId(),
      category: 'coordination_note',
      severity: 'warning',
      title: `${urgentTasks.length} Urgent Care Task(s) Pending`,
      body: `There are ${urgentTasks.length} urgent task(s) requiring attention: ${urgentTasks.map((t: any) => t.title).join('; ')}. These should be prioritized in today's workflow to ensure timely patient care.`,
      evidence: urgentTasks.map((t: any) => `${t.title} (assigned to ${t.assigneeName})`),
      suggestedAction: 'Review and address urgent tasks before end of shift',
      confidence: 0.93,
      generatedAt: now,
    });
  }

  // 9. Positive Findings
  if (cr && !cr.recentERVisit && cr.priorHospitalizations === 0 && cr.fallRisk !== 'high') {
    insights.push({
      id: insightId(),
      category: 'care_suggestion',
      severity: 'positive',
      title: 'Stable Clinical Profile',
      body: 'Patient shows a stable clinical trajectory with no recent hospitalizations or ED visits and moderate fall risk. Continue current care plan and reassess at next scheduled evaluation period.',
      evidence: [
        'No recent hospitalizations',
        'No ED visits',
        `Fall risk: ${cr.fallRisk}`,
      ],
      confidence: 0.85,
      generatedAt: now,
    });
  }

  // 10. Care suggestion — holistic care note
  const recentMessages = (data.messages || []).slice(0, 5);
  const painMentioned = recentMessages.some((m: any) => m.content?.toLowerCase().includes('pain'));
  if (painMentioned && cr) {
    insights.push({
      id: insightId(),
      category: 'care_suggestion',
      severity: 'info',
      title: 'Pain Management Discussion Noted',
      body: `Recent team communications reference pain concerns. With ${cr.medicationCount} active medications, ensure pain management approach is multimodal (non-pharmacologic interventions alongside any medication changes). Document pain assessment using a standardized scale at every visit.`,
      evidence: [
        'Pain mentioned in recent collaboration messages',
        `Current medications: ${cr.medicationCount}`,
      ],
      suggestedAction: 'Include standardized pain assessment in next visit documentation',
      confidence: 0.82,
      generatedAt: now,
    });
  }

  // Sort: critical first, then warning, then info/positive
  const severityOrder: Record<string, number> = { critical: 0, warning: 1, info: 2, positive: 3 };
  insights.sort((a: any, b: any) => (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2));

  return insights;
}

// ─── Build Patient Summary ──────────────────────────────────────────────────

function buildPatientSummary(data: any): string {
  const cr = data.clinicalRisk;
  if (!cr) return 'No clinical data available for this patient.';

  const parts: string[] = [];
  parts.push(`${cr.patientName} is a ${cr.age}-year-old patient`);

  if (cr.diagnoses?.length) {
    parts.push(`with diagnoses of ${cr.diagnoses.slice(0, 3).join(', ')}`);
  }

  if (cr.priorHospitalizations > 0) {
    parts.push(`who has had ${cr.priorHospitalizations} hospitalization(s) in the past year`);
  }

  if (cr.recentERVisit) {
    parts.push(`with a recent ED visit on ${cr.recentERDate}`);
  }

  const openTasks = (data.tasks || []).filter((t: any) => t.status !== 'completed' && t.status !== 'cancelled');
  if (openTasks.length > 0) {
    parts.push(`with ${openTasks.length} open care coordination task(s)`);
  }

  const missingDocs = (data.admDocs || []).reduce((sum: number, d: any) => sum + (d.missingDocs?.length || 0), 0);
  if (missingDocs > 0) {
    parts.push(`and ${missingDocs} missing document(s) across admissions`);
  }

  return parts.join(', ') + '.';
}

// ─── Question Answering Engine ──────────────────────────────────────────────

function answerQuestion(question: string, data: any): { answer: string; insights: any[]; sources: string[]; confidence: number } {
  const q = question.toLowerCase();
  const cr = data.clinicalRisk;
  const sources: string[] = [];
  let answer = '';
  let confidence = 0.7;
  const relatedInsights: any[] = [];

  // Pattern matching for common clinical questions
  if (q.includes('medication') || q.includes('drug') || q.includes('prescription') || q.includes('polypharmacy')) {
    if (cr) {
      answer = `${cr.patientName} is currently on ${cr.medicationCount} active medications.${cr.medicationCount >= 10 ? ' This exceeds the polypharmacy threshold of 10, increasing risk of drug interactions and adverse effects. A medication reconciliation is recommended.' : ' Medication count is within normal range.'} ${cr.recentERVisit ? 'Note: Recent ED visit may have resulted in medication changes — verify current medication list is up to date.' : ''}`;
      sources.push('Clinical Risk Assessment', 'Medication Records');
      confidence = 0.92;
    } else {
      answer = 'No medication data is available for this patient in the current assessment records.';
      sources.push('Clinical Records');
    }
  } else if (q.includes('fall') || q.includes('safety') || q.includes('home safety')) {
    if (cr) {
      answer = `Fall risk assessment: ${cr.fallRisk?.toUpperCase() || 'Not assessed'}. ADL independence score: ${cr.adlScore}/24.${cr.fallRisk === 'high' ? ' Patient is at HIGH fall risk. Ensure home safety assessment is current, grab bars are installed in bathroom, and throw rugs are removed.' : ''} ${cr.livesAlone ? 'Patient lives alone, which increases risk of unwitnessed falls and delayed emergency response.' : 'Patient has household support, which provides some fall mitigation.'}`;
      sources.push('Clinical Risk Assessment', 'Home Safety Records');
      confidence = 0.93;
    } else {
      answer = 'No fall risk assessment data available.';
      sources.push('Clinical Records');
    }
  } else if (q.includes('visit') || q.includes('schedule') || q.includes('compliance') || q.includes('missed')) {
    const vcs = data.visitCompliance || [];
    if (vcs.length > 0) {
      const summaries = vcs.map((vc: any) => {
        const rate = Math.round(((vc.deliveredThisWeek + vc.deliveredLastWeek) / (vc.requiredWeekly * 2)) * 100);
        return `${vc.discipline}: ${vc.deliveredThisWeek}/${vc.requiredWeekly} this week (${rate}% 2-week rate, ${vc.missedConsecutive} consecutive misses)`;
      });
      answer = `Visit compliance summary:\n${summaries.join('\n')}\n\n${vcs.some((v: any) => v.missedConsecutive >= 2) ? 'Warning: Consecutive missed visits detected — this may trigger regulatory scrutiny and should be addressed immediately.' : 'No critical compliance gaps detected.'}`;
      sources.push('Visit Compliance Records', 'Scheduling Data');
      confidence = 0.94;
    } else {
      answer = 'No visit compliance data available for this patient.';
      sources.push('Scheduling Records');
    }
  } else if (q.includes('document') || q.includes('documentation') || q.includes('missing') || q.includes('oasis') || q.includes('f2f')) {
    const docs = data.admDocs || [];
    if (docs.length > 0) {
      const totalMissing = docs.reduce((sum: number, d: any) => sum + (d.missingDocs?.length || 0), 0);
      const allMissing = docs.flatMap((d: any) => d.missingDocs || []);
      answer = totalMissing > 0
        ? `There are ${totalMissing} missing document(s) across ${docs.length} admission(s): ${[...new Set(allMissing)].join(', ')}. ${!docs[0]?.f2fComplete ? 'Critical: Face-to-Face encounter documentation is incomplete — this is required for Medicare billing eligibility.' : ''} ${!docs[0]?.insuranceVerified ? 'Insurance verification is pending — billing cannot proceed without this.' : ''}`
        : 'All required documentation appears complete for current admissions.';
      sources.push('Admission Documentation Records');
      confidence = 0.95;
    } else {
      answer = 'No admission documentation records found.';
      sources.push('Admission Records');
    }
  } else if (q.includes('authorization') || q.includes('auth') || q.includes('expir')) {
    const auths = data.authorizations || [];
    if (auths.length > 0) {
      const summaries = auths.map((a: any) => {
        const daysLeft = Math.ceil((new Date(a.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const remaining = a.authorizedVisits - a.usedVisits;
        return `${a.payer} ${a.discipline}: ${remaining} visits remaining, expires ${a.endDate} (${daysLeft} days)`;
      });
      answer = `Authorization status:\n${summaries.join('\n')}\n\n${auths.some((a: any) => {
        const daysLeft = Math.ceil((new Date(a.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 14 || (a.authorizedVisits - a.usedVisits) <= 2;
      }) ? 'Action needed: One or more authorizations are expiring soon or running low on visits.' : 'All authorizations appear adequate for the current period.'}`;
      sources.push('Authorization Records', 'Payer Data');
      confidence = 0.94;
    } else {
      answer = 'No authorization data found for this patient.';
      sources.push('Authorization Records');
    }
  } else if (q.includes('diagnosis') || q.includes('condition') || q.includes('diagnos')) {
    if (cr?.diagnoses?.length) {
      answer = `Active diagnoses for ${cr.patientName}:\n${cr.diagnoses.map((d: string, i: number) => `${i + 1}. ${d}`).join('\n')}\n\nOASIS acuity score: ${cr.oasisScore}/100. ${cr.oasisScore >= 60 ? 'This indicates moderate-to-high clinical acuity requiring close monitoring.' : 'Clinical acuity is within manageable range.'}`;
      sources.push('Clinical Assessment', 'OASIS Data');
      confidence = 0.95;
    } else {
      answer = 'No diagnosis information available in the clinical risk records.';
      sources.push('Clinical Records');
    }
  } else if (q.includes('hospitalization') || q.includes('hospital') || q.includes('er') || q.includes('emergency')) {
    if (cr) {
      answer = `Hospitalization history: ${cr.priorHospitalizations} admission(s) in the past 12 months.${cr.recentERVisit ? ` Most recent ED visit: ${cr.recentERDate}. Post-ED assessments should verify medication reconciliation and updated care plan.` : ' No recent ED visits recorded.'} ${cr.priorHospitalizations >= 2 ? 'Multiple hospitalizations significantly increase the risk of readmission — consider intensive care management.' : ''}`;
      sources.push('Clinical Risk Assessment', 'Hospital Records');
      confidence = 0.93;
    } else {
      answer = 'No hospitalization data available.';
      sources.push('Clinical Records');
    }
  } else if (q.includes('claim') || q.includes('billing') || q.includes('revenue') || q.includes('denial')) {
    const claims = data.claims || [];
    if (claims.length > 0) {
      const highRisk = claims.filter((c: any) => c.rejectionRisk >= 50);
      const totalAtRisk = highRisk.reduce((sum: number, c: any) => sum + c.totalAmount, 0);
      answer = `${claims.length} claim(s) on file. ${highRisk.length} claim(s) at high rejection risk (≥50%), totaling $${totalAtRisk.toLocaleString()} in revenue at risk.\n\n${highRisk.map((c: any) => `• ${c.claimId} ($${c.totalAmount.toLocaleString()}) — ${c.rejectionRisk}% risk: ${c.riskFactors.join('; ')}`).join('\n')}`;
      sources.push('Claims Data', 'Billing Records');
      confidence = 0.90;
    } else {
      answer = 'No claims data found for this patient.';
      sources.push('Billing Records');
    }
  } else if (q.includes('summary') || q.includes('overview') || q.includes('status') || q.includes('how is')) {
    answer = buildPatientSummary(data);
    sources.push('Clinical Records', 'Visit Data', 'Care Coordination');
    confidence = 0.88;
  } else if (q.includes('care plan') || q.includes('plan of care') || q.includes('poc')) {
    const docs = data.admDocs || [];
    const pocSigned = docs.every((d: any) => d.pocSigned);
    answer = `Care plan status: ${pocSigned ? 'All plans of care are signed and current.' : 'One or more plans of care are pending signature.'} ${cr?.recentERVisit ? 'Given the recent ED visit, the care plan should be reviewed and updated to reflect any changes in the patient\'s condition or treatment approach.' : ''} ${cr?.medicationCount >= 10 ? 'Medication reconciliation should be incorporated into the next care plan review due to polypharmacy.' : ''}`;
    sources.push('Care Plan Records', 'Clinical Documentation');
    confidence = 0.85;
  } else {
    // Generic fallback
    answer = `I analyzed the available clinical records for this patient. Here's what I found:\n\n${buildPatientSummary(data)}\n\nFor more specific information, try asking about medications, fall risk, visit compliance, documentation status, authorizations, diagnoses, or billing claims.`;
    sources.push('Clinical Records');
    confidence = 0.65;
  }

  return { answer, insights: relatedInsights, sources, confidence };
}

// ─── GET /clinical-assistant/:patientId/analyze — Full analysis ─────────────

app.get('/make-server-845bc545/clinical-assistant/:patientId/analyze', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    console.log(`[clinical-assistant] Analyzing patient ${patientId}`);

    const data = await aggregatePatientData(patientId);
    const insights = generateInsights(data);
    const patientSummary = buildPatientSummary(data);

    const topConcerns = insights
      .filter((i: any) => i.severity === 'critical' || i.severity === 'warning')
      .slice(0, 3)
      .map((i: any) => i.title);

    return c.json({
      insights,
      patientSummary,
      topConcerns,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[clinical-assistant/analyze] Error:', error);
    return c.json({ error: `Analysis failed: ${error.message}` }, 500);
  }
});

// ─── POST /clinical-assistant/:patientId/ask — Answer a question ────────────

app.post('/make-server-845bc545/clinical-assistant/:patientId/ask', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const body = await c.req.json();
    const question = body.question || '';

    if (!question.trim()) {
      return c.json({ error: 'Question is required' }, 400);
    }

    console.log(`[clinical-assistant] Question for patient ${patientId}: "${question}"`);

    const data = await aggregatePatientData(patientId);
    const result = answerQuestion(question, data);

    return c.json(result);
  } catch (error: any) {
    console.error('[clinical-assistant/ask] Error:', error);
    return c.json({ error: `Question answering failed: ${error.message}` }, 500);
  }
});

export default app;
