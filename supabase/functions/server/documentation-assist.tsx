/**
 * Smart Documentation Assistance Server
 * Manages clinical form drafts, smart phrases, and documentation patterns.
 * Supports auto-saving, section progress, and pattern reuse.
 */
import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// ─── Helper: Write Audit Log Entry ──────────────────────────────────────────

async function writeAuditLog(entry: {
  draftId: string;
  action: string;
  actor: string;
  actorRole: string;
  details: string;
  metadata?: Record<string, any>;
}) {
  const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const log = {
    id,
    ...entry,
    timestamp: new Date().toISOString(),
  };
  await kv.set(`doc-audit:${id}`, log);
  return log;
}

// ─── Helper: Write Workflow Notification ─────────────────────────────────────

async function writeNotification(entry: {
  type: string;
  title: string;
  message: string;
  draftId: string;
  patientId: string;
  actorName: string;
  recipientRole: string;
}) {
  const id = `doc-notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const notif = {
    id,
    ...entry,
    timestamp: new Date().toISOString(),
    read: false,
  };
  await kv.set(`doc-notif:${id}`, notif);
  return notif;
}

// ─── Seed Data ──────────────────────────────────────────────────────────────

const SMART_PHRASES: Record<string, any[]> = {
  visit_purpose: [
    { id: 'sp-vp-1', category: 'visit_purpose', label: 'Skilled Nursing Assessment', text: 'Skilled nursing visit performed for comprehensive assessment of patient condition, medication management, disease process education, and care plan evaluation.', tags: ['assessment', 'nursing'], usageCount: 342 },
    { id: 'sp-vp-2', category: 'visit_purpose', label: 'Wound Care Visit', text: 'Skilled nursing visit performed for wound assessment, wound care treatment per physician orders, and patient/caregiver education on wound management.', tags: ['wound', 'treatment'], usageCount: 287 },
    { id: 'sp-vp-3', category: 'visit_purpose', label: 'Medication Teaching', text: 'Skilled nursing visit performed for medication reconciliation, teaching on new/changed medications including purpose, dosage, side effects, and importance of compliance.', tags: ['medication', 'education'], usageCount: 256 },
    { id: 'sp-vp-4', category: 'visit_purpose', label: 'Post-Hospital Follow-up', text: 'Skilled nursing visit performed for post-hospital discharge follow-up assessment, medication reconciliation, and evaluation of patient stability in the home setting.', tags: ['post-discharge', 'follow-up'], usageCount: 198 },
  ],
  general_assessment: [
    { id: 'sp-ga-1', category: 'general_assessment', label: 'Alert & Oriented', text: 'Patient is alert and oriented to person, place, time, and situation. Appears comfortable, cooperative, and in no acute distress.', tags: ['mental', 'neuro'], usageCount: 521 },
    { id: 'sp-ga-2', category: 'general_assessment', label: 'Mild Cognitive Impairment', text: 'Patient exhibits mild cognitive impairment with occasional difficulty recalling recent events. Oriented to person and place, intermittently oriented to time. Requires supervision for complex tasks.', tags: ['cognitive', 'neuro'], usageCount: 189 },
    { id: 'sp-ga-3', category: 'general_assessment', label: 'Stable Condition', text: 'Overall condition appears stable since last visit. No new complaints reported. Vital signs within acceptable parameters for patient baseline.', tags: ['stable', 'baseline'], usageCount: 445 },
    { id: 'sp-ga-4', category: 'general_assessment', label: 'Condition Declined', text: 'Patient condition has declined since last visit. New symptoms reported include [specify]. Physical assessment reveals [specify]. Physician notified of changes.', tags: ['decline', 'change'], usageCount: 156 },
  ],
  pain_assessment: [
    { id: 'sp-pa-1', category: 'pain_assessment', label: 'No Pain', text: 'Patient denies pain or discomfort at this time. Pain scale 0/10. No non-verbal indicators of pain observed.', tags: ['no pain', 'comfortable'], usageCount: 298 },
    { id: 'sp-pa-2', category: 'pain_assessment', label: 'Chronic Pain Managed', text: 'Patient reports chronic pain level of [#]/10, described as [type]. Pain is managed with current medication regimen. Pain does not interfere significantly with daily activities.', tags: ['chronic', 'managed'], usageCount: 234 },
    { id: 'sp-pa-3', category: 'pain_assessment', label: 'Acute Pain Present', text: 'Patient reports acute pain level of [#]/10, located at [location], described as [sharp/dull/burning/aching]. Onset: [when]. Aggravating factors: [specify]. Alleviating factors: [specify]. Current pain management interventions: [specify].', tags: ['acute', 'new'], usageCount: 178 },
    { id: 'sp-pa-4', category: 'pain_assessment', label: 'Wound Pain', text: 'Patient reports pain at wound site, rated [#]/10. Pain is [continuous/intermittent], worsens with [dressing changes/movement]. Pre-medication administered per orders prior to wound care.', tags: ['wound', 'procedural'], usageCount: 145 },
  ],
  wound_assessment: [
    { id: 'sp-wa-1', category: 'wound_assessment', label: 'Wound Improving', text: 'Wound shows signs of improvement with decreased size, healthy granulation tissue present, and decreased drainage. Wound bed is red/pink with no signs of infection. Periwound skin is intact.', tags: ['improving', 'healing'], usageCount: 267 },
    { id: 'sp-wa-2', category: 'wound_assessment', label: 'Wound Unchanged', text: 'Wound appearance unchanged from previous assessment. Wound bed [describe]. Drainage: [amount, type]. No signs of infection observed. Current treatment plan continued per physician orders.', tags: ['stable', 'unchanged'], usageCount: 198 },
    { id: 'sp-wa-3', category: 'wound_assessment', label: 'Signs of Infection', text: 'Wound shows signs of possible infection including [increased redness/warmth/swelling/drainage/odor]. Wound culture obtained per physician orders. MD notified of findings on [date/time]. New orders received: [specify].', tags: ['infection', 'concern'], usageCount: 89 },
  ],
  functional_status: [
    { id: 'sp-fs-1', category: 'functional_status', label: 'Independent ADLs', text: 'Patient is independent with activities of daily living including bathing, dressing, grooming, toileting, and feeding. Ambulates independently without assistive devices.', tags: ['independent', 'ADL'], usageCount: 234 },
    { id: 'sp-fs-2', category: 'functional_status', label: 'Requires Assistance', text: 'Patient requires assistance with [bathing/dressing/toileting/transfers]. Uses [walker/cane/wheelchair] for mobility. Caregiver provides [specify level] of assistance with daily activities.', tags: ['dependent', 'assistance'], usageCount: 312 },
    { id: 'sp-fs-3', category: 'functional_status', label: 'Fall Risk Precautions', text: 'Fall risk precautions in place. Patient uses [assistive device] for ambulation. Home safety assessed — grab bars present in bathroom, clear pathways maintained, adequate lighting. Patient educated on fall prevention strategies.', tags: ['fall risk', 'safety'], usageCount: 187 },
  ],
  medication_review: [
    { id: 'sp-mr-1', category: 'medication_review', label: 'Medications Reconciled', text: 'Medication reconciliation performed. All medications reviewed with patient. Patient demonstrates understanding of medication names, purposes, dosages, and schedules. No discrepancies noted between medication list and actual medications in home.', tags: ['reconciled', 'compliant'], usageCount: 356 },
    { id: 'sp-mr-2', category: 'medication_review', label: 'Non-Compliance Noted', text: 'Medication non-compliance identified: [specify medications]. Patient reports [reason for non-compliance]. Education provided on importance of medication adherence. Physician notified for possible medication adjustment.', tags: ['non-compliant', 'education'], usageCount: 145 },
    { id: 'sp-mr-3', category: 'medication_review', label: 'New Medication Started', text: 'New medication started: [name, dose, frequency, route]. Patient educated on purpose, expected effects, potential side effects, and when to notify physician. Patient verbalized understanding using teach-back method.', tags: ['new', 'education'], usageCount: 198 },
  ],
  education: [
    { id: 'sp-ed-1', category: 'education', label: 'Disease Process Education', text: 'Education provided on disease process, signs and symptoms to monitor, and when to seek medical attention. Patient/caregiver demonstrated understanding through teach-back method.', tags: ['disease', 'teaching'], usageCount: 289 },
    { id: 'sp-ed-2', category: 'education', label: 'Diet Education', text: 'Dietary education provided regarding [specific diet: low sodium/diabetic/heart-healthy]. Patient instructed on food choices, meal planning, and reading nutrition labels. Written materials provided for reference.', tags: ['diet', 'nutrition'], usageCount: 178 },
    { id: 'sp-ed-3', category: 'education', label: 'Safety Education', text: 'Home safety education provided including fall prevention, medication storage, emergency preparedness, and infection control measures. Patient/caregiver verbalized understanding and demonstrated safe practices.', tags: ['safety', 'home'], usageCount: 156 },
  ],
  plan_coordination: [
    { id: 'sp-pc-1', category: 'plan_coordination', label: 'Continue Current Plan', text: 'Continue current plan of care. No changes indicated at this time. Next visit scheduled per authorization frequency. Patient/caregiver in agreement with plan.', tags: ['continue', 'stable'], usageCount: 398 },
    { id: 'sp-pc-2', category: 'plan_coordination', label: 'MD Notification', text: 'Physician [name] notified via [phone/fax/portal] on [date] at [time] regarding [findings]. New orders received: [specify]. Orders read back and confirmed.', tags: ['physician', 'notification'], usageCount: 267 },
    { id: 'sp-pc-3', category: 'plan_coordination', label: 'Care Plan Update', text: 'Care plan updated to address [new problem/changed condition]. New interventions include [specify]. Goals adjusted to reflect current patient status. All disciplines notified of changes.', tags: ['update', 'change'], usageCount: 145 },
  ],
};

// Seed smart phrases on startup
async function seedSmartPhrases() {
  try {
    for (const [category, phrases] of Object.entries(SMART_PHRASES)) {
      for (const phrase of phrases) {
        try {
          await kv.set(`smart-phrase:${phrase.id}`, phrase);
        } catch (err) {
          console.warn(`[doc-assist] Failed to seed phrase ${phrase.id}:`, err);
        }
      }
    }
    console.log('[doc-assist] Smart phrases seeded successfully');
  } catch (error) {
    console.warn('[doc-assist] Failed to seed smart phrases, will use in-memory fallback:', error);
  }
}

// Seed demo documentation patterns
async function seedDemoPatterns() {
  try {
    const demoPatterns = [
      { id: 'pat-1', patientId: 'patient-001', templateId: 'skilled_nursing_visit', sectionId: 'visit_details', fieldId: 'visit_purpose', value: 'Skilled nursing visit performed for comprehensive assessment of patient condition, medication management, disease process education, and care plan evaluation.', documentDate: '2024-03-01', clinicianName: 'Sarah Johnson, RN' },
      { id: 'pat-2', patientId: 'patient-001', templateId: 'skilled_nursing_visit', sectionId: 'clinical_observations', fieldId: 'general_assessment', value: 'Patient is alert and oriented to person, place, time, and situation. Appears comfortable, cooperative, and in no acute distress. Skin warm, dry, and intact.', documentDate: '2024-03-01', clinicianName: 'Sarah Johnson, RN' },
      { id: 'pat-3', patientId: 'patient-001', templateId: 'skilled_nursing_visit', sectionId: 'pain', fieldId: 'pain_narrative', value: 'Patient reports chronic low back pain at 4/10, managed with current medication regimen. Pain does not interfere significantly with daily activities. No new pain complaints.', documentDate: '2024-03-01', clinicianName: 'Sarah Johnson, RN' },
      { id: 'pat-4', patientId: 'patient-001', templateId: 'skilled_nursing_visit', sectionId: 'functional', fieldId: 'functional_narrative', value: 'Patient requires minimal assistance with bathing and dressing. Uses rolling walker for ambulation within the home. Transfers with standby assistance. Independent with feeding and grooming.', documentDate: '2024-02-22', clinicianName: 'Sarah Johnson, RN' },
      { id: 'pat-5', patientId: 'patient-001', templateId: 'skilled_nursing_visit', sectionId: 'medications', fieldId: 'medication_narrative', value: 'Medication reconciliation performed. All 8 medications accounted for in the home. Patient demonstrates understanding of purpose and dosing. Pill organizer in use and correctly filled.', documentDate: '2024-02-22', clinicianName: 'Sarah Johnson, RN' },
      { id: 'pat-6', patientId: 'patient-001', templateId: 'skilled_nursing_visit', sectionId: 'education', fieldId: 'education_narrative', value: 'Education reinforced on CHF management including daily weight monitoring, sodium restriction, fluid management, and recognition of worsening symptoms. Patient demonstrated understanding via teach-back.', documentDate: '2024-02-15', clinicianName: 'Michael Chen, RN' },
      { id: 'pat-7', patientId: 'patient-002', templateId: 'skilled_nursing_visit', sectionId: 'wound', fieldId: 'wound_narrative', value: 'Wound assessment performed. Left lower extremity venous stasis ulcer measured 3.2cm x 2.1cm x 0.3cm. Wound bed 80% granulation, 20% slough. Moderate serous drainage. Wound care performed per physician orders. Compression wrap applied.', documentDate: '2024-03-05', clinicianName: 'Sarah Johnson, RN' },
    ];

    for (const pattern of demoPatterns) {
      try {
        await kv.set(`doc-pattern:${pattern.id}`, pattern);
      } catch (err) {
        console.warn(`[doc-assist] Failed to seed pattern ${pattern.id}:`, err);
      }
    }

    // Seed a demo in-progress draft
    const demoDraft = {
      id: 'draft-demo-001',
      patientId: 'patient-001',
      templateId: 'skilled_nursing_visit',
      templateName: 'Skilled Nursing Visit Note',
      values: {
        visit_date: '2024-03-08',
        visit_time_in: '09:30',
        visit_purpose: 'Skilled nursing visit performed for comprehensive assessment, medication management, and wound care.',
        systolic_bp: '132',
        diastolic_bp: '78',
        heart_rate: '76',
        respiratory_rate: '18',
        temperature: '98.4',
        spo2: '96',
        weight: '185',
        general_assessment: 'Patient is alert and oriented x4. Appears comfortable and in no acute distress.',
      },
      status: 'in_progress',
      completionPct: 28,
      sectionProgress: {},
      createdAt: '2024-03-08T09:35:00.000Z',
      updatedAt: '2024-03-08T10:12:00.000Z',
      createdBy: 'Sarah Johnson, RN',
    };
    try {
      await kv.set(`doc-draft:${demoDraft.id}`, demoDraft);
    } catch (err) {
      console.warn('[doc-assist] Failed to seed demo draft:', err);
    }

    console.log('[doc-assist] Demo patterns and drafts seeded successfully');
  } catch (error) {
    console.warn('[doc-assist] Failed to seed demo patterns, will use in-memory fallback:', error);
  }
}

// Run seeds
seedSmartPhrases().catch(console.error);
seedDemoPatterns().catch(console.error);

// ─── GET /doc-assist/drafts/:patientId ──────────────────────────────────────

app.get('/make-server-845bc545/doc-assist/drafts/:patientId', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const allDrafts = (await kv.getByPrefix('doc-draft:')) || [];
    const drafts = allDrafts.filter((d: any) => d.patientId === patientId);
    return c.json({ drafts });
  } catch (error: any) {
    console.error('[doc-assist/drafts GET] Error:', error);
    return c.json({ error: `Failed to fetch drafts: ${error.message}` }, 500);
  }
});

// ─── POST /doc-assist/drafts — Create new draft ────────────────────────────

app.post('/make-server-845bc545/doc-assist/drafts', async (c) => {
  try {
    const body = await c.req.json();
    const id = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const draft = {
      id,
      patientId: body.patientId,
      templateId: body.templateId,
      templateName: body.templateName || 'Untitled',
      values: body.values || {},
      status: 'in_progress',
      completionPct: body.completionPct || 0,
      sectionProgress: body.sectionProgress || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: body.createdBy || 'Current User',
    };
    await kv.set(`doc-draft:${id}`, draft);
    return c.json({ draft, autoSaved: false });
  } catch (error: any) {
    console.error('[doc-assist/drafts POST] Error:', error);
    return c.json({ error: `Failed to create draft: ${error.message}` }, 500);
  }
});

// ─── PUT /doc-assist/drafts/:id — Update/autosave draft ────────────────────

app.put('/make-server-845bc545/doc-assist/drafts/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(`doc-draft:${id}`);

    const draft = {
      ...(existing || {}),
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`doc-draft:${id}`, draft);
    return c.json({ draft, autoSaved: body.autoSaved || false });
  } catch (error: any) {
    console.error('[doc-assist/drafts PUT] Error:', error);
    return c.json({ error: `Failed to update draft: ${error.message}` }, 500);
  }
});

// ─── GET /doc-assist/phrases/:category ──────────────────────────────────────

app.get('/make-server-845bc545/doc-assist/phrases/:category', async (c) => {
  try {
    const category = c.req.param('category');
    const allPhrases = (await kv.getByPrefix('smart-phrase:')) || [];
    const phrases = allPhrases
      .filter((p: any) => p.category === category)
      .sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0));
    return c.json({ phrases });
  } catch (error: any) {
    console.error('[doc-assist/phrases] Error:', error);
    return c.json({ error: `Failed to fetch phrases: ${error.message}` }, 500);
  }
});

// ─── GET /doc-assist/phrases — All phrases ──────────────────────────────────

app.get('/make-server-845bc545/doc-assist/phrases', async (c) => {
  try {
    const allPhrases = (await kv.getByPrefix('smart-phrase:')) || [];
    allPhrases.sort((a: any, b: any) => (b.usageCount || 0) - (a.usageCount || 0));
    return c.json({ phrases: allPhrases });
  } catch (error: any) {
    console.error('[doc-assist/phrases] Error:', error);
    return c.json({ error: `Failed to fetch phrases: ${error.message}` }, 500);
  }
});

// ─── GET /doc-assist/patterns/:patientId ────────────────────────────────────

app.get('/make-server-845bc545/doc-assist/patterns/:patientId', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const fieldId = c.req.query('fieldId');
    const allPatterns = (await kv.getByPrefix('doc-pattern:')) || [];
    let patterns = allPatterns.filter((p: any) => p.patientId === patientId);
    if (fieldId) {
      patterns = patterns.filter((p: any) => p.fieldId === fieldId);
    }
    patterns.sort((a: any, b: any) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime());
    return c.json({ patterns });
  } catch (error: any) {
    console.error('[doc-assist/patterns] Error:', error);
    return c.json({ error: `Failed to fetch patterns: ${error.message}` }, 500);
  }
});

// ─── PUT /doc-assist/phrases/:id/use — Increment usage count ────────────────

app.put('/make-server-845bc545/doc-assist/phrases/:id/use', async (c) => {
  try {
    const id = c.req.param('id');
    const phrase = await kv.get(`smart-phrase:${id}`);
    if (!phrase) return c.json({ error: 'Phrase not found' }, 404);
    phrase.usageCount = (phrase.usageCount || 0) + 1;
    await kv.set(`smart-phrase:${id}`, phrase);
    return c.json({ phrase });
  } catch (error: any) {
    console.error('[doc-assist/phrases/use] Error:', error);
    return c.json({ error: `Failed to update phrase: ${error.message}` }, 500);
  }
});

// ─── POST /doc-assist/phrases — Create personal smart phrase ────────────────

app.post('/make-server-845bc545/doc-assist/phrases', async (c) => {
  try {
    const body = await c.req.json();
    const id = `sp-personal-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const phrase = {
      id,
      category: body.category || 'personal',
      label: body.label,
      text: body.text,
      tags: body.tags || [],
      usageCount: 0,
      isPersonal: true,
      createdBy: body.createdBy || 'Current User',
    };
    await kv.set(`smart-phrase:${id}`, phrase);
    return c.json({ phrase });
  } catch (error: any) {
    console.error('[doc-assist/phrases POST] Error:', error);
    return c.json({ error: `Failed to create phrase: ${error.message}` }, 500);
  }
});

// ─── DELETE /doc-assist/phrases/:id — Delete personal smart phrase ──────────

app.delete('/make-server-845bc545/doc-assist/phrases/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const phrase = await kv.get(`smart-phrase:${id}`);
    if (!phrase) return c.json({ error: 'Phrase not found' }, 404);
    if (!phrase.isPersonal) return c.json({ error: 'Cannot delete system phrases' }, 403);
    await kv.del(`smart-phrase:${id}`);
    return c.json({ success: true });
  } catch (error: any) {
    console.error('[doc-assist/phrases DELETE] Error:', error);
    return c.json({ error: `Failed to delete phrase: ${error.message}` }, 500);
  }
});

// ─── POST /doc-assist/drafts/:id/request-cosign — Request co-signature ──────

app.post('/make-server-845bc545/doc-assist/drafts/:id/request-cosign', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(`doc-draft:${id}`);
    if (!existing) return c.json({ error: 'Draft not found' }, 404);
    if (existing.status !== 'completed') {
      return c.json({ error: 'Only completed documents can be sent for co-signature' }, 400);
    }

    const updated = {
      ...existing,
      status: 'pending_cosign',
      cosignRequestedAt: new Date().toISOString(),
      cosignRequestedTo: body.cosignRequestedTo || 'Supervising Physician',
      cosignNote: body.cosignNote || '',
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`doc-draft:${id}`, updated);

    // Audit log
    await writeAuditLog({
      draftId: id,
      action: 'cosign_requested',
      actor: existing.createdBy || 'Unknown',
      actorRole: 'Clinician',
      details: `Co-signature requested from ${body.cosignRequestedTo || 'Supervising Physician'}`,
      metadata: { cosignRequestedTo: body.cosignRequestedTo, cosignNote: body.cosignNote },
    });

    // Notification
    await writeNotification({
      type: 'cosign_request',
      title: 'Co-signature Requested',
      message: `A document requires co-signature from ${body.cosignRequestedTo || 'Supervising Physician'}`,
      draftId: id,
      patientId: existing.patientId,
      actorName: existing.createdBy || 'Unknown',
      recipientRole: 'Supervisor',
    });

    return c.json({ draft: updated });
  } catch (error: any) {
    console.error('[doc-assist/request-cosign] Error:', error);
    return c.json({ error: `Failed to request co-signature: ${error.message}` }, 500);
  }
});

// ─── POST /doc-assist/drafts/:id/cosign — Apply co-signature ────────────────

app.post('/make-server-845bc545/doc-assist/drafts/:id/cosign', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(`doc-draft:${id}`);
    if (!existing) return c.json({ error: 'Draft not found' }, 404);
    if (existing.status !== 'pending_cosign') {
      return c.json({ error: 'Only pending co-signature documents can be co-signed' }, 400);
    }

    const updated = {
      ...existing,
      status: 'cosigned',
      cosignedBy: body.cosignedBy || 'Dr. Smith, MD',
      cosignedAt: new Date().toISOString(),
      cosignComment: body.cosignComment || '',
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`doc-draft:${id}`, updated);

    // Audit log
    await writeAuditLog({
      draftId: id,
      action: 'cosign_approved',
      actor: body.cosignedBy || 'Dr. Smith, MD',
      actorRole: 'Supervisor',
      details: `Documentation co-signed and approved${body.cosignComment ? ': ' + body.cosignComment : ''}`,
      metadata: { cosignedBy: body.cosignedBy, cosignComment: body.cosignComment },
    });

    // Notification to clinician
    await writeNotification({
      type: 'cosign_approved',
      title: 'Documentation Co-Signed',
      message: `Your documentation has been co-signed by ${body.cosignedBy || 'supervisor'}`,
      draftId: id,
      patientId: existing.patientId,
      actorName: body.cosignedBy || 'Dr. Smith, MD',
      recipientRole: 'Clinician',
    });

    return c.json({ draft: updated });
  } catch (error: any) {
    console.error('[doc-assist/cosign] Error:', error);
    return c.json({ error: `Failed to co-sign: ${error.message}` }, 500);
  }
});

// ─── POST /doc-assist/drafts/:id/reject-cosign — Reject co-signature ────────

app.post('/make-server-845bc545/doc-assist/drafts/:id/reject-cosign', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const existing = await kv.get(`doc-draft:${id}`);
    if (!existing) return c.json({ error: 'Draft not found' }, 404);
    if (existing.status !== 'pending_cosign') {
      return c.json({ error: 'Only pending co-signature documents can be rejected' }, 400);
    }

    const updated = {
      ...existing,
      status: 'in_progress',
      cosignComment: body.cosignComment || 'Returned for revision',
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`doc-draft:${id}`, updated);

    // Audit log
    await writeAuditLog({
      draftId: id,
      action: 'cosign_rejected',
      actor: existing.cosignRequestedTo || 'Supervisor',
      actorRole: 'Supervisor',
      details: `Documentation returned for revision: ${body.cosignComment || 'No reason provided'}`,
      metadata: { cosignComment: body.cosignComment },
    });

    // Notification to clinician
    await writeNotification({
      type: 'cosign_rejected',
      title: 'Documentation Returned',
      message: `Your documentation was returned for revision: ${body.cosignComment || 'Please review'}`,
      draftId: id,
      patientId: existing.patientId,
      actorName: existing.cosignRequestedTo || 'Supervisor',
      recipientRole: 'Clinician',
    });

    return c.json({ draft: updated });
  } catch (error: any) {
    console.error('[doc-assist/reject-cosign] Error:', error);
    return c.json({ error: `Failed to reject co-signature: ${error.message}` }, 500);
  }
});

// ─── GET /doc-assist/audit/:draftId — Get audit trail for a draft ───────────

app.get('/make-server-845bc545/doc-assist/audit/:draftId', async (c) => {
  try {
    const draftId = c.req.param('draftId');
    const allEntries = (await kv.getByPrefix('doc-audit:')) || [];
    const entries = allEntries
      .filter((e: any) => e.draftId === draftId)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return c.json({ entries });
  } catch (error: any) {
    console.error('[doc-assist/audit] Error:', error);
    return c.json({ error: `Failed to fetch audit trail: ${error.message}` }, 500);
  }
});

// ─── POST /doc-assist/audit — Log an audit entry (e.g., PDF export) ─────────

app.post('/make-server-845bc545/doc-assist/audit', async (c) => {
  try {
    const body = await c.req.json();
    const entry = await writeAuditLog({
      draftId: body.draftId,
      action: body.action,
      actor: body.actor || 'Current User',
      actorRole: body.actorRole || 'Clinician',
      details: body.details || '',
      metadata: body.metadata,
    });
    return c.json({ entry });
  } catch (error: any) {
    console.error('[doc-assist/audit POST] Error:', error);
    return c.json({ error: `Failed to log audit entry: ${error.message}` }, 500);
  }
});

// ─── GET /doc-assist/cosign-queue — Get all pending co-sign documents ───────

app.get('/make-server-845bc545/doc-assist/cosign-queue', async (c) => {
  try {
    const allDrafts = (await kv.getByPrefix('doc-draft:')) || [];
    const pendingDrafts = allDrafts.filter((d: any) => d.status === 'pending_cosign');

    // Sort by request date (oldest first — FIFO queue)
    pendingDrafts.sort((a: any, b: any) =>
      new Date(a.cosignRequestedAt || a.updatedAt).getTime() -
      new Date(b.cosignRequestedAt || b.updatedAt).getTime()
    );

    // Enrich each item with its audit trail
    const items = await Promise.all(
      pendingDrafts.map(async (draft: any) => {
        const allEntries = (await kv.getByPrefix('doc-audit:')) || [];
        const auditTrail = allEntries
          .filter((e: any) => e.draftId === draft.id)
          .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        // Determine urgency based on wait time
        const requestedAt = new Date(draft.cosignRequestedAt || draft.updatedAt);
        const hoursWaiting = (Date.now() - requestedAt.getTime()) / (1000 * 60 * 60);
        const urgency = hoursWaiting > 48 ? 'stat' : hoursWaiting > 24 ? 'urgent' : 'routine';

        return {
          draft,
          auditTrail,
          urgency,
        };
      })
    );

    return c.json({ items, total: items.length });
  } catch (error: any) {
    console.error('[doc-assist/cosign-queue] Error:', error);
    return c.json({ error: `Failed to fetch co-sign queue: ${error.message}` }, 500);
  }
});

// ─── POST /doc-assist/bulk-cosign — Bulk co-sign multiple documents ───────���─

app.post('/make-server-845bc545/doc-assist/bulk-cosign', async (c) => {
  try {
    const body = await c.req.json();
    const draftIds: string[] = body.draftIds || [];
    const cosignedBy = body.cosignedBy || 'Dr. Smith, MD';
    const cosignComment = body.cosignComment || 'Bulk co-signature approved';

    const results: any[] = [];
    const errors: any[] = [];

    for (const draftId of draftIds) {
      try {
        const existing = await kv.get(`doc-draft:${draftId}`);
        if (!existing) {
          errors.push({ draftId, error: 'Draft not found' });
          continue;
        }
        if (existing.status !== 'pending_cosign') {
          errors.push({ draftId, error: 'Not in pending co-signature status' });
          continue;
        }

        const updated = {
          ...existing,
          status: 'cosigned',
          cosignedBy,
          cosignedAt: new Date().toISOString(),
          cosignComment,
          updatedAt: new Date().toISOString(),
        };
        await kv.set(`doc-draft:${draftId}`, updated);

        // Audit log
        await writeAuditLog({
          draftId,
          action: 'cosign_approved',
          actor: cosignedBy,
          actorRole: 'Supervisor',
          details: `Bulk co-signature approved: ${cosignComment}`,
          metadata: { bulkOperation: true, cosignedBy, cosignComment },
        });

        results.push(updated);
      } catch (err: any) {
        errors.push({ draftId, error: err.message });
      }
    }

    return c.json({
      results,
      errors,
      successCount: results.length,
      errorCount: errors.length,
    });
  } catch (error: any) {
    console.error('[doc-assist/bulk-cosign] Error:', error);
    return c.json({ error: `Bulk co-sign failed: ${error.message}` }, 500);
  }
});

// ─── GET /doc-assist/notifications — Get workflow notifications ─────────────

app.get('/make-server-845bc545/doc-assist/notifications', async (c) => {
  try {
    const allNotifs = (await kv.getByPrefix('doc-notif:')) || [];
    allNotifs.sort((a: any, b: any) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const unreadCount = allNotifs.filter((n: any) => !n.read).length;
    return c.json({ notifications: allNotifs.slice(0, 50), unreadCount });
  } catch (error: any) {
    console.error('[doc-assist/notifications] Error:', error);
    return c.json({ error: `Failed to fetch notifications: ${error.message}` }, 500);
  }
});

// ─── PUT /doc-assist/notifications/:id/read — Mark notification as read ─────

app.put('/make-server-845bc545/doc-assist/notifications/:id/read', async (c) => {
  try {
    const id = c.req.param('id');
    const notif = await kv.get(`doc-notif:${id}`);
    if (!notif) return c.json({ error: 'Notification not found' }, 404);
    notif.read = true;
    await kv.set(`doc-notif:${id}`, notif);
    return c.json({ notification: notif });
  } catch (error: any) {
    console.error('[doc-assist/notifications/read] Error:', error);
    return c.json({ error: `Failed to mark notification: ${error.message}` }, 500);
  }
});

// ─── PUT /doc-assist/notifications/read-all — Mark all as read ──────────────

app.put('/make-server-845bc545/doc-assist/notifications/read-all', async (c) => {
  try {
    const allNotifs = (await kv.getByPrefix('doc-notif:')) || [];
    for (const notif of allNotifs) {
      if (!notif.read) {
        notif.read = true;
        await kv.set(`doc-notif:${notif.id}`, notif);
      }
    }
    return c.json({ success: true });
  } catch (error: any) {
    console.error('[doc-assist/notifications/read-all] Error:', error);
    return c.json({ error: `Failed to mark all read: ${error.message}` }, 500);
  }
});

// ─── GET /doc-assist/cosign-analytics — Co-signature analytics data ─────────

app.get('/make-server-845bc545/doc-assist/cosign-analytics', async (c) => {
  try {
    const allDrafts = (await kv.getByPrefix('doc-draft:')) || [];
    const allAudit = (await kv.getByPrefix('doc-audit:')) || [];

    // Filter to drafts that have been through co-sign workflow
    const cosignDrafts = allDrafts.filter((d: any) =>
      d.status === 'pending_cosign' || d.status === 'cosigned' || d.cosignRequestedAt
    );

    const pendingCount = allDrafts.filter((d: any) => d.status === 'pending_cosign').length;
    const cosignedDrafts = allDrafts.filter((d: any) => d.status === 'cosigned');
    const approvedCount = cosignedDrafts.length;

    // Count rejections from audit log
    const rejections = allAudit.filter((e: any) => e.action === 'cosign_rejected');
    const rejectedCount = rejections.length;

    // Calculate average turnaround (request → approval)
    let totalTurnaround = 0;
    let turnaroundCount = 0;
    const turnaroundHours: number[] = [];
    for (const draft of cosignedDrafts) {
      if (draft.cosignRequestedAt && draft.cosignedAt) {
        const hours = (new Date(draft.cosignedAt).getTime() - new Date(draft.cosignRequestedAt).getTime()) / (1000 * 60 * 60);
        totalTurnaround += hours;
        turnaroundCount++;
        turnaroundHours.push(hours);
      }
    }
    const avgTurnaroundHours = turnaroundCount > 0 ? Math.round(totalTurnaround / turnaroundCount * 10) / 10 : 0;

    const totalDocuments = cosignDrafts.length + rejectedCount;
    const approvalRate = totalDocuments > 0 ? Math.round((approvedCount / totalDocuments) * 100) : 0;

    // Supervisor stats
    const supervisorMap = new Map<string, { approved: number; rejected: number; turnaroundTotal: number; turnaroundCount: number }>();
    for (const draft of cosignedDrafts) {
      const name = draft.cosignedBy || 'Unknown';
      const entry = supervisorMap.get(name) || { approved: 0, rejected: 0, turnaroundTotal: 0, turnaroundCount: 0 };
      entry.approved++;
      if (draft.cosignRequestedAt && draft.cosignedAt) {
        const hours = (new Date(draft.cosignedAt).getTime() - new Date(draft.cosignRequestedAt).getTime()) / (1000 * 60 * 60);
        entry.turnaroundTotal += hours;
        entry.turnaroundCount++;
      }
      supervisorMap.set(name, entry);
    }
    for (const rej of rejections) {
      const name = rej.actor || 'Unknown';
      const entry = supervisorMap.get(name) || { approved: 0, rejected: 0, turnaroundTotal: 0, turnaroundCount: 0 };
      entry.rejected++;
      supervisorMap.set(name, entry);
    }
    const supervisorStats = Array.from(supervisorMap.entries()).map(([name, s]) => ({
      name,
      approved: s.approved,
      rejected: s.rejected,
      avgTurnaroundHours: s.turnaroundCount > 0 ? Math.round(s.turnaroundTotal / s.turnaroundCount * 10) / 10 : 0,
      total: s.approved + s.rejected,
    })).sort((a, b) => b.total - a.total);

    // Clinician stats
    const clinicianMap = new Map<string, { submitted: number; approved: number; rejected: number; pending: number }>();
    for (const draft of allDrafts) {
      if (draft.cosignRequestedAt || draft.status === 'cosigned') {
        const name = draft.createdBy || 'Unknown';
        const entry = clinicianMap.get(name) || { submitted: 0, approved: 0, rejected: 0, pending: 0 };
        entry.submitted++;
        if (draft.status === 'cosigned') entry.approved++;
        if (draft.status === 'pending_cosign') entry.pending++;
        clinicianMap.set(name, entry);
      }
    }
    // Add rejection counts
    for (const rej of rejections) {
      const draft = allDrafts.find((d: any) => d.id === rej.draftId);
      if (draft) {
        const name = draft.createdBy || 'Unknown';
        const entry = clinicianMap.get(name) || { submitted: 0, approved: 0, rejected: 0, pending: 0 };
        entry.rejected++;
        clinicianMap.set(name, entry);
      }
    }
    const clinicianStats = Array.from(clinicianMap.entries()).map(([name, s]) => ({
      name,
      ...s,
    })).sort((a, b) => b.submitted - a.submitted);

    // Daily trend (last 14 days)
    const dailyTrend: Array<{ date: string; requested: number; approved: number; rejected: number }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRequests = allAudit.filter((e: any) =>
        e.action === 'cosign_requested' && e.timestamp.startsWith(dateStr)
      ).length;
      const dayApprovals = allAudit.filter((e: any) =>
        e.action === 'cosign_approved' && e.timestamp.startsWith(dateStr)
      ).length;
      const dayRejections = allAudit.filter((e: any) =>
        e.action === 'cosign_rejected' && e.timestamp.startsWith(dateStr)
      ).length;
      dailyTrend.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        requested: dayRequests,
        approved: dayApprovals,
        rejected: dayRejections,
      });
    }

    // Turnaround distribution
    const ranges = ['< 4h', '4-8h', '8-24h', '24-48h', '> 48h'];
    const turnaroundDistribution = ranges.map((range) => {
      let count = 0;
      for (const h of turnaroundHours) {
        if (range === '< 4h' && h < 4) count++;
        else if (range === '4-8h' && h >= 4 && h < 8) count++;
        else if (range === '8-24h' && h >= 8 && h < 24) count++;
        else if (range === '24-48h' && h >= 24 && h < 48) count++;
        else if (range === '> 48h' && h >= 48) count++;
      }
      return { range, count };
    });

    return c.json({
      analytics: {
        summary: {
          totalDocuments,
          pendingCount,
          approvedCount,
          rejectedCount,
          avgTurnaroundHours,
          approvalRate,
        },
        supervisorStats,
        clinicianStats,
        dailyTrend,
        turnaroundDistribution,
      },
    });
  } catch (error: any) {
    console.error('[doc-assist/cosign-analytics] Error:', error);
    return c.json({ error: `Failed to compute analytics: ${error.message}` }, 500);
  }
});

export default app;