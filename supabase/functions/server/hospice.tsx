/**
 * Hospice Server Routes
 * Handles HOPE assessments, MD queue, IDG meetings, bereavement, volunteers
 */
import { Hono } from 'npm:hono';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// ─── Auth helper ──────────────────────────────────────────────────────────────
// DEV MODE: Always return demo user (bypassing auth checks)
async function verifyUser(request: Request): Promise<{ userId: string; user: any }> {
  // Always return a valid user object for development
  return { userId: 'demo-user', user: { id: 'demo-user', email: 'demo@example.com' } };
}

async function createAuditLog(userId: string, action: string, entityType: string, entityId: string, oldValue: any, newValue: any) {
  const entry = {
    user_id: userId, action, entity_type: entityType, entity_id: entityId,
    old_value: oldValue ? JSON.stringify(oldValue) : null,
    new_value: newValue ? JSON.stringify(newValue) : null,
    timestamp: new Date().toISOString(),
  };
  await kv.set(`audit:${Date.now()}:${userId}`, entry);
}

// ─── Pagination helper ────────────────────────────────────────────────────────
interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

function parsePaginationParams(query: Record<string, string>): PaginationParams {
  return {
    page: Math.max(1, parseInt(query.page || '1', 10) || 1),
    pageSize: Math.min(100, Math.max(1, parseInt(query.pageSize || '25', 10) || 25)),
    sortBy: query.sortBy || undefined,
    sortOrder: (query.sortOrder === 'asc' || query.sortOrder === 'desc') ? query.sortOrder : 'desc',
  };
}

function applyPagination<T>(items: T[], params: PaginationParams, defaultSortKey?: string): { data: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  let sorted = [...items];

  // Apply sorting
  const sortKey = params.sortBy || defaultSortKey;
  if (sortKey) {
    sorted.sort((a: any, b: any) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal));
      return params.sortOrder === 'asc' ? cmp : -cmp;
    });
  }

  const total = sorted.length;
  const totalPages = Math.ceil(total / params.pageSize);
  const start = (params.page - 1) * params.pageSize;
  const data = sorted.slice(start, start + params.pageSize);

  return { data, total, page: params.page, pageSize: params.pageSize, totalPages };
}

// ============= SEED DATA =============

export const SEED_HOSPICE_PATIENTS = [
  {
    id: 'hp-001', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', admitDate: '2026-01-15',
    primaryDiagnosis: 'End-stage COPD', certPeriod: 'Cert 1 (01/15 – 03/14)', status: 'active',
    assessments: [
      { phase: 'admission', status: 'completed', completedDate: '2026-01-17', assessor: 'RN Smith, J.', score: 72 },
      { phase: 'huv1', status: 'completed', completedDate: '2026-02-12', assessor: 'RN Davis, K.', score: 68 },
      { phase: 'huv2', status: 'due', dueDate: '2026-03-08' },
      { phase: 'discharge', status: 'upcoming' },
    ],
  },
  {
    id: 'hp-002', patientName: 'Rodriguez, Manuel', mrn: 'MRN-H002', admitDate: '2026-01-28',
    primaryDiagnosis: 'Metastatic pancreatic cancer', certPeriod: 'Cert 1 (01/28 – 03/27)', status: 'active',
    assessments: [
      { phase: 'admission', status: 'completed', completedDate: '2026-01-30', assessor: 'RN Chen, L.', score: 45 },
      { phase: 'huv1', status: 'overdue', dueDate: '2026-02-25' },
      { phase: 'huv2', status: 'upcoming' },
      { phase: 'discharge', status: 'upcoming' },
    ],
  },
  {
    id: 'hp-003', patientName: 'Baker, Helen', mrn: 'MRN-H003', admitDate: '2026-02-05',
    primaryDiagnosis: 'End-stage renal disease', certPeriod: 'Cert 1 (02/05 – 04/04)', status: 'active',
    assessments: [
      { phase: 'admission', status: 'completed', completedDate: '2026-02-07', assessor: 'RN Johnson, M.', score: 58 },
      { phase: 'huv1', status: 'in_progress', dueDate: '2026-03-05' },
      { phase: 'huv2', status: 'upcoming' },
      { phase: 'discharge', status: 'upcoming' },
    ],
  },
  {
    id: 'hp-004', patientName: 'Mitchell, Frank', mrn: 'MRN-H004', admitDate: '2026-02-10',
    primaryDiagnosis: 'Advanced CHF (NYHA IV)', certPeriod: 'Cert 1 (02/10 – 04/09)', status: 'active',
    assessments: [
      { phase: 'admission', status: 'in_progress', dueDate: '2026-02-15' },
      { phase: 'huv1', status: 'upcoming' },
      { phase: 'huv2', status: 'upcoming' },
      { phase: 'discharge', status: 'upcoming' },
    ],
  },
  {
    id: 'hp-005', patientName: 'Collins, Dorothy', mrn: 'MRN-H005', admitDate: '2025-11-01',
    primaryDiagnosis: "Alzheimer's disease (late stage)", certPeriod: 'Cert 2 (01/29 – 03/29)', status: 'active',
    assessments: [
      { phase: 'admission', status: 'completed', completedDate: '2025-11-03', assessor: 'RN Smith, J.', score: 62 },
      { phase: 'huv1', status: 'completed', completedDate: '2025-12-01', assessor: 'RN Davis, K.', score: 55 },
      { phase: 'huv2', status: 'completed', completedDate: '2026-01-05', assessor: 'RN Chen, L.', score: 48 },
      { phase: 'discharge', status: 'not_applicable' },
    ],
  },
  {
    id: 'hp-006', patientName: 'Nguyen, Thi', mrn: 'MRN-H006', admitDate: '2026-02-20',
    primaryDiagnosis: 'End-stage liver disease', certPeriod: 'Cert 1 (02/20 – 04/19)', status: 'active',
    assessments: [
      { phase: 'admission', status: 'due', dueDate: '2026-02-25' },
      { phase: 'huv1', status: 'upcoming' },
      { phase: 'huv2', status: 'upcoming' },
      { phase: 'discharge', status: 'upcoming' },
    ],
  },
  {
    id: 'hp-007', patientName: 'Foster, James', mrn: 'MRN-H007', admitDate: '2026-02-14',
    primaryDiagnosis: 'Metastatic lung cancer', certPeriod: 'Cert 1 (02/14 – 04/13)', status: 'active',
    assessments: [
      { phase: 'admission', status: 'completed', completedDate: '2026-02-16', assessor: 'RN Johnson, M.', score: 38 },
      { phase: 'huv1', status: 'due', dueDate: '2026-03-12' },
      { phase: 'huv2', status: 'upcoming' },
      { phase: 'discharge', status: 'upcoming' },
    ],
  },
];

export const SEED_MD_QUEUE = [
  { id: 'md-001', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', docType: 'f2f', docTitle: 'Face-to-Face Encounter – Recert', submittedBy: 'NP Williams, A.', submittedDate: '2026-03-01', urgency: 'urgent', daysWaiting: 5, certPeriod: 'Cert 2' },
  { id: 'md-002', patientName: 'Rodriguez, Manuel', mrn: 'MRN-H002', docType: 'cti', docTitle: 'CTI Narrative – Initial', submittedBy: 'RN Chen, L.', submittedDate: '2026-02-28', urgency: 'urgent', daysWaiting: 6, notes: 'Terminal prognosis documentation required' },
  { id: 'md-003', patientName: 'Baker, Helen', mrn: 'MRN-H003', docType: 'poc', docTitle: 'Plan of Care Update', submittedBy: 'RN Johnson, M.', submittedDate: '2026-03-02', urgency: 'routine', daysWaiting: 4, certPeriod: 'Cert 1' },
  { id: 'md-004', patientName: 'Collins, Dorothy', mrn: 'MRN-H005', docType: 'recert', docTitle: 'Recertification – Cert Period 3', submittedBy: 'RN Smith, J.', submittedDate: '2026-02-25', urgency: 'overdue', daysWaiting: 9 },
  { id: 'md-005', patientName: 'Mitchell, Frank', mrn: 'MRN-H004', docType: 'verbal_order', docTitle: 'Verbal Order – Morphine Increase', submittedBy: 'RN Davis, K.', submittedDate: '2026-03-04', urgency: 'urgent', daysWaiting: 2, notes: 'Pain management adjustment' },
  { id: 'md-006', patientName: 'Nguyen, Thi', mrn: 'MRN-H006', docType: 'poc', docTitle: 'Plan of Care – Initial', submittedBy: 'RN Johnson, M.', submittedDate: '2026-03-03', urgency: 'routine', daysWaiting: 3, certPeriod: 'Cert 1' },
  { id: 'md-007', patientName: 'Foster, James', mrn: 'MRN-H007', docType: 'f2f', docTitle: 'Face-to-Face Encounter – Initial', submittedBy: 'MD Patel, R.', submittedDate: '2026-02-26', urgency: 'overdue', daysWaiting: 8 },
  { id: 'md-008', patientName: 'Adams, Virginia', mrn: 'MRN-H008', docType: 'death_summary', docTitle: 'Death Summary – Final Review', submittedBy: 'RN Smith, J.', submittedDate: '2026-03-05', urgency: 'routine', daysWaiting: 1 },
  { id: 'md-009', patientName: 'Clark, Walter', mrn: 'MRN-H009', docType: 'cti', docTitle: 'CTI Narrative – Recert', submittedBy: 'RN Chen, L.', submittedDate: '2026-02-27', urgency: 'overdue', daysWaiting: 7 },
  { id: 'md-010', patientName: 'Turner, Grace', mrn: 'MRN-H010', docType: 'verbal_order', docTitle: 'Verbal Order – Ativan PRN', submittedBy: 'RN Davis, K.', submittedDate: '2026-03-04', urgency: 'routine', daysWaiting: 2 },
  { id: 'md-011', patientName: 'Simmons, Arthur', mrn: 'MRN-H011', docType: 'recert', docTitle: 'Recertification – Cert Period 2', submittedBy: 'NP Williams, A.', submittedDate: '2026-03-01', urgency: 'routine', daysWaiting: 5 },
  { id: 'md-012', patientName: 'Patterson, Rose', mrn: 'MRN-H012', docType: 'f2f', docTitle: 'Face-to-Face Encounter – Recert', submittedBy: 'MD Patel, R.', submittedDate: '2026-03-03', urgency: 'routine', daysWaiting: 3 },
];

const standardTeam = [
  { name: 'Dr. Patel, Ravi', role: 'Medical Director' },
  { name: 'Smith, Janet (RN)', role: 'Hospice Nurse' },
  { name: 'Davis, Karen (RN)', role: 'Case Manager' },
  { name: 'Chen, Lisa (MSW)', role: 'Social Worker' },
  { name: 'Rev. Johnson, Michael', role: 'Chaplain' },
  { name: 'Miller, Sarah (CNA)', role: 'Aide Representative' },
  { name: 'Brown, David', role: 'Volunteer Coordinator' },
];

export const SEED_IDG_MEETINGS = [
  {
    id: 'idg-001', date: '2026-03-10', time: '10:00 AM', status: 'scheduled',
    facilitator: 'Davis, Karen (RN)',
    attendees: standardTeam.map((t) => ({ ...t, present: undefined })),
    patientReviews: [
      { patientId: 'hp-001', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', reviewType: 'Recertification Review', status: 'pending', actionItems: ['Update POC', 'Schedule F2F'] },
      { patientId: 'hp-002', patientName: 'Rodriguez, Manuel', mrn: 'MRN-H002', reviewType: 'Symptom Management', status: 'pending', notes: 'Increasing pain — review medication' },
      { patientId: 'hp-003', patientName: 'Baker, Helen', mrn: 'MRN-H003', reviewType: 'Routine 15-Day', status: 'pending' },
      { patientId: 'hp-006', patientName: 'Nguyen, Thi', mrn: 'MRN-H006', reviewType: 'New Admission Review', status: 'pending' },
    ],
    actionItemCount: 8, completedActions: 0,
  },
  {
    id: 'idg-002', date: '2026-02-25', time: '10:00 AM', status: 'completed',
    facilitator: 'Davis, Karen (RN)',
    attendees: standardTeam.map((t) => ({ ...t, present: true })),
    patientReviews: [
      { patientId: 'hp-001', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', reviewType: 'Routine 15-Day', status: 'reviewed', notes: 'Stable, continue current plan', actionItems: ['Continue POC'] },
      { patientId: 'hp-005', patientName: 'Collins, Dorothy', mrn: 'MRN-H005', reviewType: 'Recertification Review', status: 'reviewed', actionItems: ['Submit recert', 'Update CTI'] },
      { patientId: 'hp-004', patientName: 'Mitchell, Frank', mrn: 'MRN-H004', reviewType: 'New Admission Review', status: 'reviewed' },
      { patientId: 'hp-007', patientName: 'Foster, James', mrn: 'MRN-H007', reviewType: 'Symptom Management', status: 'deferred', notes: 'Deferred — patient hospitalized' },
    ],
    actionItemCount: 6, completedActions: 4,
  },
  {
    id: 'idg-003', date: '2026-02-11', time: '10:00 AM', status: 'completed',
    facilitator: 'Smith, Janet (RN)',
    attendees: standardTeam.map((t, i) => ({ ...t, present: i !== 4 })),
    patientReviews: [
      { patientId: 'hp-005', patientName: 'Collins, Dorothy', mrn: 'MRN-H005', reviewType: 'Routine 15-Day', status: 'reviewed' },
      { patientId: 'hp-001', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', reviewType: 'Routine 15-Day', status: 'reviewed' },
      { patientId: 'hp-002', patientName: 'Rodriguez, Manuel', mrn: 'MRN-H002', reviewType: 'New Admission Review', status: 'reviewed' },
    ],
    actionItemCount: 5, completedActions: 5,
  },
];

export const SEED_BEREAVEMENT = [
  {
    id: 'bv-001', deceasedName: 'Adams, Virginia', mrn: 'MRN-H008', dateOfDeath: '2026-02-20',
    primaryContact: 'Adams, Robert', relationship: 'Spouse', contactPhone: '(555) 234-5678',
    riskLevel: 'high', monthsInProgram: 1, totalTasks: 10, completedTasks: 2,
    counselor: 'Chen, Lisa (MSW)',
    tasks: [
      { id: 'bt-001', type: 'sympathy_card', label: 'Initial sympathy card', scheduledDate: '2026-02-22', status: 'completed', completedDate: '2026-02-22', completedBy: 'Chen, Lisa' },
      { id: 'bt-002', type: 'phone_call', label: '1-week follow-up call', scheduledDate: '2026-02-27', status: 'completed', completedDate: '2026-02-27', completedBy: 'Chen, Lisa', notes: 'Spouse struggling, referred to grief group' },
      { id: 'bt-003', type: 'phone_call', label: '1-month follow-up call', scheduledDate: '2026-03-20', status: 'due' },
      { id: 'bt-004', type: 'resource_mailing', label: 'Grief resource packet', scheduledDate: '2026-03-22', status: 'upcoming' },
      { id: 'bt-005', type: 'group_referral', label: 'Grief support group referral', scheduledDate: '2026-04-01', status: 'upcoming' },
    ],
  },
  {
    id: 'bv-002', deceasedName: 'Walker, Henry', mrn: 'MRN-H013', dateOfDeath: '2026-01-10',
    primaryContact: 'Walker, Martha', relationship: 'Spouse', contactPhone: '(555) 345-6789',
    riskLevel: 'moderate', monthsInProgram: 2, totalTasks: 10, completedTasks: 4,
    counselor: 'Chen, Lisa (MSW)',
    tasks: [
      { id: 'bt-006', type: 'sympathy_card', label: 'Initial sympathy card', scheduledDate: '2026-01-12', status: 'completed', completedDate: '2026-01-12', completedBy: 'Chen, Lisa' },
      { id: 'bt-007', type: 'phone_call', label: '1-week follow-up call', scheduledDate: '2026-01-17', status: 'completed', completedDate: '2026-01-17', completedBy: 'Chen, Lisa' },
      { id: 'bt-008', type: 'phone_call', label: '1-month follow-up call', scheduledDate: '2026-02-10', status: 'completed', completedDate: '2026-02-10', completedBy: 'Chen, Lisa' },
      { id: 'bt-009', type: 'resource_mailing', label: 'Grief resource packet', scheduledDate: '2026-02-15', status: 'completed', completedDate: '2026-02-15', completedBy: 'Brown, David' },
      { id: 'bt-010', type: 'phone_call', label: '2-month follow-up call', scheduledDate: '2026-03-10', status: 'overdue' },
      { id: 'bt-011', type: 'home_visit', label: '3-month home visit', scheduledDate: '2026-04-10', status: 'upcoming' },
    ],
  },
  {
    id: 'bv-003', deceasedName: 'Perry, Mildred', mrn: 'MRN-H014', dateOfDeath: '2025-10-05',
    primaryContact: 'Perry, William Jr.', relationship: 'Son', contactPhone: '(555) 456-7890',
    riskLevel: 'low', monthsInProgram: 5, totalTasks: 10, completedTasks: 6,
    counselor: 'Brown, David',
    tasks: [
      { id: 'bt-012', type: 'sympathy_card', label: 'Initial sympathy card', scheduledDate: '2025-10-07', status: 'completed', completedDate: '2025-10-07' },
      { id: 'bt-013', type: 'phone_call', label: '1-week call', scheduledDate: '2025-10-12', status: 'completed', completedDate: '2025-10-12' },
      { id: 'bt-014', type: 'phone_call', label: '1-month call', scheduledDate: '2025-11-05', status: 'completed', completedDate: '2025-11-05' },
      { id: 'bt-015', type: 'resource_mailing', label: 'Holiday support mailing', scheduledDate: '2025-12-01', status: 'completed', completedDate: '2025-12-01' },
      { id: 'bt-016', type: 'phone_call', label: '3-month call', scheduledDate: '2026-01-05', status: 'completed', completedDate: '2026-01-06' },
      { id: 'bt-017', type: 'phone_call', label: '5-month call', scheduledDate: '2026-03-05', status: 'completed', completedDate: '2026-03-05' },
      { id: 'bt-018', type: 'phone_call', label: '6-month call', scheduledDate: '2026-04-05', status: 'upcoming' },
    ],
  },
  {
    id: 'bv-004', deceasedName: 'Hughes, Edna', mrn: 'MRN-H015', dateOfDeath: '2026-02-05',
    primaryContact: 'Hughes, Thomas', relationship: 'Spouse', contactPhone: '(555) 567-8901',
    riskLevel: 'high', monthsInProgram: 1, totalTasks: 10, completedTasks: 1,
    counselor: 'Chen, Lisa (MSW)',
    tasks: [
      { id: 'bt-019', type: 'sympathy_card', label: 'Initial sympathy card', scheduledDate: '2026-02-07', status: 'completed', completedDate: '2026-02-07', completedBy: 'Chen, Lisa' },
      { id: 'bt-020', type: 'phone_call', label: '1-week follow-up call', scheduledDate: '2026-02-12', status: 'overdue' },
      { id: 'bt-021', type: 'phone_call', label: '1-month follow-up call', scheduledDate: '2026-03-05', status: 'overdue' },
      { id: 'bt-022', type: 'resource_mailing', label: 'Grief resource packet', scheduledDate: '2026-03-10', status: 'due' },
    ],
  },
  {
    id: 'bv-005', deceasedName: 'Grant, Clarence', mrn: 'MRN-H016', dateOfDeath: '2025-08-15',
    primaryContact: 'Grant, Evelyn', relationship: 'Spouse', contactPhone: '(555) 678-9012',
    riskLevel: 'low', monthsInProgram: 7, totalTasks: 10, completedTasks: 8,
    counselor: 'Brown, David',
    tasks: [
      { id: 'bt-023', type: 'phone_call', label: '6-month call', scheduledDate: '2026-02-15', status: 'completed', completedDate: '2026-02-15' },
      { id: 'bt-024', type: 'anniversary_card', label: 'Anniversary card', scheduledDate: '2026-08-15', status: 'upcoming' },
    ],
  },
];

export const SEED_VOLUNTEERS = [
  {
    id: 'vol-001', name: 'Henderson, Carol', phone: '(555) 111-2222', email: 'carol.h@email.com',
    status: 'active', startDate: '2024-03-15', totalHoursYTD: 142, monthlyTarget: 20, hoursThisMonth: 12,
    skills: ['Companionship', 'Vigil', 'Pet Therapy'], assignedPatients: 4,
    recentVisits: [
      { id: 'vv-001', date: '2026-03-04', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', duration: 120, visitType: 'Companionship', status: 'completed', notes: 'Read together, patient in good spirits' },
      { id: 'vv-002', date: '2026-03-06', patientName: 'Baker, Helen', mrn: 'MRN-H003', duration: 90, visitType: 'Companionship', status: 'scheduled' },
      { id: 'vv-003', date: '2026-03-01', patientName: 'Collins, Dorothy', mrn: 'MRN-H005', duration: 60, visitType: 'Companionship', status: 'completed' },
    ],
  },
  {
    id: 'vol-002', name: 'Morris, James', phone: '(555) 222-3333', email: 'james.m@email.com',
    status: 'active', startDate: '2025-01-10', totalHoursYTD: 68, monthlyTarget: 16, hoursThisMonth: 8,
    skills: ['Music Therapy', 'Companionship', 'Errands'], assignedPatients: 3,
    recentVisits: [
      { id: 'vv-004', date: '2026-03-03', patientName: 'Rodriguez, Manuel', mrn: 'MRN-H002', duration: 90, visitType: 'Music Therapy', status: 'completed', notes: 'Played guitar, patient very responsive' },
      { id: 'vv-005', date: '2026-03-05', patientName: 'Mitchell, Frank', mrn: 'MRN-H004', duration: 60, visitType: 'Companionship', status: 'completed' },
      { id: 'vv-006', date: '2026-03-08', patientName: 'Nguyen, Thi', mrn: 'MRN-H006', duration: 60, visitType: 'Companionship', status: 'scheduled' },
    ],
  },
  {
    id: 'vol-003', name: 'Sullivan, Patricia', phone: '(555) 333-4444', email: 'patricia.s@email.com',
    status: 'active', startDate: '2023-08-20', totalHoursYTD: 210, monthlyTarget: 24, hoursThisMonth: 18,
    skills: ['Vigil', 'Bereavement Support', 'Companionship', 'Administrative'], assignedPatients: 5,
    recentVisits: [
      { id: 'vv-007', date: '2026-03-05', patientName: 'Foster, James', mrn: 'MRN-H007', duration: 180, visitType: 'Vigil', status: 'completed', notes: 'Overnight vigil, family present' },
      { id: 'vv-008', date: '2026-03-02', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', duration: 120, visitType: 'Companionship', status: 'completed' },
      { id: 'vv-009', date: '2026-03-07', patientName: 'Collins, Dorothy', mrn: 'MRN-H005', duration: 90, visitType: 'Companionship', status: 'scheduled' },
    ],
  },
  {
    id: 'vol-004', name: 'Bennett, William', phone: '(555) 444-5555', email: 'william.b@email.com',
    status: 'on_leave', startDate: '2024-06-01', totalHoursYTD: 45, monthlyTarget: 12, hoursThisMonth: 0,
    skills: ['Companionship', 'Transportation'], assignedPatients: 0,
    recentVisits: [
      { id: 'vv-010', date: '2026-02-15', patientName: 'Baker, Helen', mrn: 'MRN-H003', duration: 60, visitType: 'Companionship', status: 'completed' },
    ],
  },
  {
    id: 'vol-005', name: 'Cooper, Diane', phone: '(555) 555-6666', email: 'diane.c@email.com',
    status: 'active', startDate: '2025-06-15', totalHoursYTD: 38, monthlyTarget: 12, hoursThisMonth: 6,
    skills: ['Companionship', 'Hair Care', 'Crafts'], assignedPatients: 2,
    recentVisits: [
      { id: 'vv-011', date: '2026-03-04', patientName: 'Nguyen, Thi', mrn: 'MRN-H006', duration: 90, visitType: 'Hair Care / Crafts', status: 'completed', notes: 'Helped with hair styling, patient enjoyed it' },
      { id: 'vv-012', date: '2026-03-09', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', duration: 60, visitType: 'Companionship', status: 'scheduled' },
    ],
  },
];

// Additional features for hospice module
export const SEED_HOSPICE_FEATURES = [
  { id: 'hospice-idg', moduleId: 'hospice', name: 'IDG Center', description: 'Interdisciplinary group meeting management' },
  { id: 'hospice-bereavement', moduleId: 'hospice', name: 'Bereavement Tracker', description: 'Bereavement follow-up tracking' },
  { id: 'hospice-volunteers', moduleId: 'hospice', name: 'Volunteer Management', description: 'Volunteer visits and hours tracking' },
];

// ─── Seed runner ──────────────────────────────────────────────────────────────
export async function seedHospiceData() {
  console.log('[hospice-seed] Seeding hospice data...');

  for (const p of SEED_HOSPICE_PATIENTS) {
    await kv.set(`hospice-patient:${p.id}`, p);
  }

  for (const d of SEED_MD_QUEUE) {
    await kv.set(`hospice-md-doc:${d.id}`, d);
  }

  for (const m of SEED_IDG_MEETINGS) {
    await kv.set(`hospice-idg:${m.id}`, m);
  }

  for (const b of SEED_BEREAVEMENT) {
    await kv.set(`hospice-bereavement:${b.id}`, b);
  }

  for (const v of SEED_VOLUNTEERS) {
    await kv.set(`hospice-volunteer:${v.id}`, v);
  }

  // OASIS records linked to hospice patients
  const SEED_OASIS_RECORDS = [
    { id: 'oasis-001', patientId: 'hp-001', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', assessmentType: 'OASIS-E', reason: 'SOC', status: 'completed', completedDate: '2026-01-17', clinician: 'RN Smith, J.', m1033_hosp_risk: 2, m1800_grooming: 1, m1810_dressing_upper: 2, m1820_dressing_lower: 2, m1830_bathing: 3, m1840_toilet_transfer: 2, m1850_transferring: 2, m1860_ambulation: 3, hopePhase: 'admission', hopeScore: 72 },
    { id: 'oasis-002', patientId: 'hp-001', patientName: 'Thompson, Eleanor', mrn: 'MRN-H001', assessmentType: 'OASIS-E', reason: 'Recert', status: 'completed', completedDate: '2026-02-12', clinician: 'RN Davis, K.', m1033_hosp_risk: 2, m1800_grooming: 2, m1810_dressing_upper: 2, m1820_dressing_lower: 3, m1830_bathing: 3, m1840_toilet_transfer: 2, m1850_transferring: 3, m1860_ambulation: 3, hopePhase: 'huv1', hopeScore: 68 },
    { id: 'oasis-003', patientId: 'hp-002', patientName: 'Rodriguez, Manuel', mrn: 'MRN-H002', assessmentType: 'OASIS-E', reason: 'SOC', status: 'completed', completedDate: '2026-01-30', clinician: 'RN Chen, L.', m1033_hosp_risk: 3, m1800_grooming: 2, m1810_dressing_upper: 3, m1820_dressing_lower: 3, m1830_bathing: 3, m1840_toilet_transfer: 3, m1850_transferring: 3, m1860_ambulation: 4, hopePhase: 'admission', hopeScore: 45 },
    { id: 'oasis-004', patientId: 'hp-003', patientName: 'Baker, Helen', mrn: 'MRN-H003', assessmentType: 'OASIS-E', reason: 'SOC', status: 'completed', completedDate: '2026-02-07', clinician: 'RN Johnson, M.', m1033_hosp_risk: 2, m1800_grooming: 1, m1810_dressing_upper: 2, m1820_dressing_lower: 2, m1830_bathing: 2, m1840_toilet_transfer: 2, m1850_transferring: 2, m1860_ambulation: 3, hopePhase: 'admission', hopeScore: 58 },
    { id: 'oasis-005', patientId: 'hp-005', patientName: 'Collins, Dorothy', mrn: 'MRN-H005', assessmentType: 'OASIS-E', reason: 'SOC', status: 'completed', completedDate: '2025-11-03', clinician: 'RN Smith, J.', m1033_hosp_risk: 1, m1800_grooming: 2, m1810_dressing_upper: 3, m1820_dressing_lower: 3, m1830_bathing: 3, m1840_toilet_transfer: 2, m1850_transferring: 2, m1860_ambulation: 3, hopePhase: 'admission', hopeScore: 62 },
    { id: 'oasis-006', patientId: 'hp-005', patientName: 'Collins, Dorothy', mrn: 'MRN-H005', assessmentType: 'OASIS-E', reason: 'Recert', status: 'completed', completedDate: '2025-12-01', clinician: 'RN Davis, K.', m1033_hosp_risk: 1, m1800_grooming: 3, m1810_dressing_upper: 3, m1820_dressing_lower: 3, m1830_bathing: 3, m1840_toilet_transfer: 3, m1850_transferring: 3, m1860_ambulation: 4, hopePhase: 'huv1', hopeScore: 55 },
    { id: 'oasis-007', patientId: 'hp-005', patientName: 'Collins, Dorothy', mrn: 'MRN-H005', assessmentType: 'OASIS-E', reason: 'Recert', status: 'completed', completedDate: '2026-01-05', clinician: 'RN Chen, L.', m1033_hosp_risk: 1, m1800_grooming: 3, m1810_dressing_upper: 3, m1820_dressing_lower: 4, m1830_bathing: 4, m1840_toilet_transfer: 3, m1850_transferring: 3, m1860_ambulation: 4, hopePhase: 'huv2', hopeScore: 48 },
    { id: 'oasis-008', patientId: 'hp-007', patientName: 'Foster, James', mrn: 'MRN-H007', assessmentType: 'OASIS-E', reason: 'SOC', status: 'completed', completedDate: '2026-02-16', clinician: 'RN Johnson, M.', m1033_hosp_risk: 3, m1800_grooming: 2, m1810_dressing_upper: 3, m1820_dressing_lower: 3, m1830_bathing: 4, m1840_toilet_transfer: 3, m1850_transferring: 3, m1860_ambulation: 4, hopePhase: 'admission', hopeScore: 38 },
  ];

  for (const oasis of SEED_OASIS_RECORDS) {
    await kv.set(`hospice-oasis:${oasis.id}`, oasis);
  }

  // Features + settings
  const SEED_ORG_ID = 'org-demo';
  for (const feature of SEED_HOSPICE_FEATURES) {
    await kv.set(`feature:${feature.id}`, { ...feature, created_at: '2024-01-01T00:00:00.000Z' });
    await kv.set(`feature-setting:${SEED_ORG_ID}:${feature.id}`, {
      org_id: SEED_ORG_ID, feature_id: feature.id, enabled: true, office_overrides: {}, updated_at: '2024-01-01T00:00:00.000Z',
    });
  }

  console.log('[hospice-seed] Hospice data seeded ✓');
}

// ============= ROUTES =============

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/health', async (c) => {
  console.log('[hospice/health] Health check called');
  return c.json({ status: 'ok', message: 'Hospice module is running', timestamp: new Date().toISOString() });
});

// ─── Dashboard metrics ────────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/metrics', async (c) => {
  const verified = await verifyUser(c.req.raw); // DEV MODE: Always returns demo user
  if (!verified) return c.json({ error: 'Unauthorized' }, 401); // Will never execute in dev mode
  try {
    const patients = await kv.getByPrefix('hospice-patient:') || [];
    const mdDocs = await kv.getByPrefix('hospice-md-doc:') || [];
    const meetings = await kv.getByPrefix('hospice-idg:') || [];
    const bereavementCases = await kv.getByPrefix('hospice-bereavement:') || [];

    const activePatients = patients.filter((p: any) => p.status === 'active').length;
    let hopeDue = 0;
    patients.forEach((p: any) =>
      p.assessments?.forEach((a: any) => {
        if (a.status === 'due' || a.status === 'overdue') hopeDue++;
      })
    );
    const mdSignatures = mdDocs.length;
    const urgentMd = mdDocs.filter((d: any) => d.urgency === 'urgent').length;
    const upcomingMeetings = meetings.filter((m: any) => m.status === 'scheduled' || m.status === 'in_progress').length;
    const nextMeeting = meetings
      .filter((m: any) => m.status === 'scheduled')
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    const activeBereaved = bereavementCases.length;
    let overdueTasks = 0;
    bereavementCases.forEach((bc: any) =>
      bc.tasks?.forEach((t: any) => { if (t.status === 'overdue') overdueTasks++; })
    );

    return c.json({
      activePatients,
      hopeDue,
      mdSignatures,
      urgentMd,
      upcomingMeetings,
      nextMeetingDate: nextMeeting?.date || null,
      activeBereaved,
      overdueTasks,
    });
  } catch (err: any) {
    console.log('[hospice] Error fetching metrics:', err?.message);
    return c.json({ error: 'Failed to fetch hospice metrics', details: err?.message }, 500);
  }
});

// ─── HOPE patients ────────────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/patients', async (c) => {
  const verified = await verifyUser(c.req.raw); // DEV MODE: Always returns demo user
  if (!verified) return c.json({ error: 'Unauthorized' }, 401); // Will never execute in dev mode
  try {
    const { search, filter } = c.req.query();
    let patients = await kv.getByPrefix('hospice-patient:') || [];

    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter((p: any) =>
        p.patientName.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q)
      );
    }

    if (filter === 'action_needed') {
      patients = patients.filter((p: any) =>
        p.assessments?.some((a: any) => a.status === 'due' || a.status === 'overdue')
      );
    } else if (filter === 'on_track') {
      patients = patients.filter((p: any) =>
        !p.assessments?.some((a: any) => a.status === 'due' || a.status === 'overdue')
      );
    }

    return c.json({ patients });
  } catch (err: any) {
    console.log('[hospice] Error fetching patients:', err?.message);
    return c.json({ error: 'Failed to fetch hospice patients', details: err?.message }, 500);
  }
});

// Paginated patients (for larger datasets)
app.get('/make-server-845bc545/hospice/patients-paginated', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const query = c.req.query();
    const { search, filter } = query;
    const pagination = parsePaginationParams(query);
    let patients = await kv.getByPrefix('hospice-patient:') || [];

    if (search) {
      const q = search.toLowerCase();
      patients = patients.filter((p: any) =>
        p.patientName.toLowerCase().includes(q) || p.mrn.toLowerCase().includes(q)
      );
    }

    if (filter === 'action_needed') {
      patients = patients.filter((p: any) =>
        p.assessments?.some((a: any) => a.status === 'due' || a.status === 'overdue')
      );
    } else if (filter === 'on_track') {
      patients = patients.filter((p: any) =>
        !p.assessments?.some((a: any) => a.status === 'due' || a.status === 'overdue')
      );
    }

    const result = applyPagination(patients, pagination, 'patientName');
    return c.json({ patients: result.data, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  } catch (err: any) {
    console.log('[hospice] Error fetching paginated patients:', err?.message);
    return c.json({ error: 'Failed to fetch hospice patients', details: err?.message }, 500);
  }
});

app.get('/make-server-845bc545/hospice/patients/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const patient = await kv.get(`hospice-patient:${id}`);
  if (!patient) return c.json({ error: 'Hospice patient not found' }, 404);
  return c.json({ patient });
});

app.put('/make-server-845bc545/hospice/patients/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const data = await c.req.json();
  const existing = await kv.get(`hospice-patient:${id}`);
  if (!existing) return c.json({ error: 'Hospice patient not found' }, 404);
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await kv.set(`hospice-patient:${id}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'hospice_patient', id, existing, updated);
  return c.json({ patient: updated });
});

// ─── MD Queue ─────────────────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/md-queue', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { search, docType, urgency } = c.req.query();
    let docs = await kv.getByPrefix('hospice-md-doc:') || [];

    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter((d: any) =>
        d.patientName.toLowerCase().includes(q) ||
        d.mrn.toLowerCase().includes(q) ||
        d.docTitle.toLowerCase().includes(q)
      );
    }
    if (docType && docType !== 'all') docs = docs.filter((d: any) => d.docType === docType);
    if (urgency && urgency !== 'all') docs = docs.filter((d: any) => d.urgency === urgency);

    // Sort: urgent first, then by days waiting
    const urgencyOrder: Record<string, number> = { urgent: 0, overdue: 1, routine: 2 };
    docs.sort((a: any, b: any) =>
      (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3) || (b.daysWaiting ?? 0) - (a.daysWaiting ?? 0)
    );

    return c.json({ documents: docs });
  } catch (err: any) {
    console.log('[hospice] Error fetching MD queue:', err?.message);
    return c.json({ error: 'Failed to fetch MD queue', details: err?.message }, 500);
  }
});

app.put('/make-server-845bc545/hospice/md-queue/:id/sign', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const existing = await kv.get(`hospice-md-doc:${id}`);
  if (!existing) return c.json({ error: 'Document not found' }, 404);
  const updated = { ...existing, status: 'signed', signedAt: new Date().toISOString(), signedBy: verified.userId };
  await kv.set(`hospice-md-doc:${id}`, updated);
  await createAuditLog(verified.userId, 'SIGN', 'hospice_md_document', id, existing, updated);
  return c.json({ document: updated });
});

app.post('/make-server-845bc545/hospice/md-queue/batch-sign', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const { ids } = await c.req.json();
  const signed: string[] = [];
  for (const id of (ids || [])) {
    const existing = await kv.get(`hospice-md-doc:${id}`);
    if (existing) {
      const updated = { ...existing, status: 'signed', signedAt: new Date().toISOString(), signedBy: verified.userId };
      await kv.set(`hospice-md-doc:${id}`, updated);
      await createAuditLog(verified.userId, 'BATCH_SIGN', 'hospice_md_document', id, existing, updated);
      signed.push(id);
    }
  }
  return c.json({ signed, count: signed.length });
});

// ─── IDG Meetings ─────────────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/idg', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { view } = c.req.query();
    let meetings = await kv.getByPrefix('hospice-idg:') || [];

    if (view === 'upcoming') {
      meetings = meetings.filter((m: any) => m.status === 'scheduled' || m.status === 'in_progress');
    }

    meetings.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return c.json({ meetings });
  } catch (err: any) {
    console.log('[hospice] Error fetching IDG meetings:', err?.message);
    return c.json({ error: 'Failed to fetch IDG meetings', details: err?.message }, 500);
  }
});

app.get('/make-server-845bc545/hospice/idg/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const meeting = await kv.get(`hospice-idg:${id}`);
  if (!meeting) return c.json({ error: 'IDG meeting not found' }, 404);
  return c.json({ meeting });
});

app.post('/make-server-845bc545/hospice/idg', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const data = await c.req.json();
  const id = `idg-${Date.now()}`;
  const meeting = { ...data, id, createdAt: new Date().toISOString() };
  await kv.set(`hospice-idg:${id}`, meeting);
  await createAuditLog(verified.userId, 'CREATE', 'hospice_idg_meeting', id, null, meeting);
  return c.json({ meeting });
});

app.put('/make-server-845bc545/hospice/idg/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const data = await c.req.json();
  const existing = await kv.get(`hospice-idg:${id}`);
  if (!existing) return c.json({ error: 'IDG meeting not found' }, 404);
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await kv.set(`hospice-idg:${id}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'hospice_idg_meeting', id, existing, updated);
  return c.json({ meeting: updated });
});

// ─── IDG Patient Preparation Data ─────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/idg/:id/preparation', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const meeting = await kv.get(`hospice-idg:${id}`) as any;
    if (!meeting) return c.json({ error: 'Meeting not found' }, 404);
    const patients = await kv.getByPrefix('hospice-patient:') || [];
    const patientMap: Record<string, any> = {}; patients.forEach((p: any) => { patientMap[p.id] = p; });
    const locMap: Record<string, string> = { 'End-stage COPD': 'Routine Home Care', 'Metastatic pancreatic cancer': 'Continuous Home Care', 'End-stage renal disease': 'Routine Home Care', 'Advanced CHF (NYHA IV)': 'Routine Home Care', "Alzheimer's disease (late stage)": 'Routine Home Care', 'End-stage liver disease': 'General Inpatient Care', 'Metastatic lung cancer': 'Continuous Home Care' };
    const enrichedReviews = (meeting.patientReviews || []).map((review: any) => {
      const patient = patientMap[review.patientId];
      const diagnosis = patient?.primaryDiagnosis || 'Unknown';
      const loc = locMap[diagnosis] || 'Routine Home Care';
      const assessments = patient?.assessments || [];
      const latestComplete = assessments.filter((a: any) => a.status === 'completed').pop();
      const nextDue = assessments.find((a: any) => a.status === 'due' || a.status === 'overdue' || a.status === 'in_progress');
      const hopeStatus = { lastCompleted: latestComplete ? { phase: latestComplete.phase, date: latestComplete.completedDate, score: latestComplete.score, assessor: latestComplete.assessor } : null, nextDue: nextDue ? { phase: nextDue.phase, dueDate: nextDue.dueDate, status: nextDue.status } : null, overdue: assessments.some((a: any) => a.status === 'overdue') };
      const clinicalUpdates: any[] = [];
      if (diagnosis.includes('cancer')) clinicalUpdates.push({ date: '2026-03-05', note: 'Pain levels increasing — morphine dose adjusted', author: 'RN Smith, J.' });
      if (diagnosis.includes('COPD')) clinicalUpdates.push({ date: '2026-03-04', note: 'O2 saturation stable at 92% on 3L', author: 'RN Davis, K.' });
      if (diagnosis.includes('CHF')) clinicalUpdates.push({ date: '2026-03-06', note: 'Weight gain 2 lbs — monitor for fluid retention', author: 'RN Johnson, M.' });
      if (diagnosis.includes('renal')) clinicalUpdates.push({ date: '2026-03-03', note: 'Creatinine trending up, nephrologist notified', author: 'RN Chen, L.' });
      if (diagnosis.includes('Alzheimer')) clinicalUpdates.push({ date: '2026-03-02', note: 'Increased agitation — discussed with family', author: 'RN Davis, K.' });
      if (diagnosis.includes('liver')) clinicalUpdates.push({ date: '2026-03-07', note: 'New admission — initial assessment in progress', author: 'RN Johnson, M.' });
      clinicalUpdates.push({ date: '2026-03-01', note: 'Comfort care measures reviewed with family', author: 'MSW Chen, L.' });
      const careTeam = [
        { name: 'Dr. Patel, Ravi', role: 'Attending Physician', discipline: 'MD' },
        { name: patient?.assessments?.[0]?.assessor || 'RN Smith, J.', role: 'Primary Nurse', discipline: 'RN' },
        { name: 'Chen, Lisa', role: 'Social Worker', discipline: 'MSW' },
        { name: 'Rev. Johnson, Michael', role: 'Chaplain', discipline: 'Chaplain' },
        { name: 'Miller, Sarah', role: 'Home Health Aide', discipline: 'CNA' },
      ];
      return { ...review, patientDetails: { primaryDiagnosis: diagnosis, levelOfCare: loc, admitDate: patient?.admitDate || 'Unknown', certPeriod: patient?.certPeriod || 'Unknown', status: patient?.status || 'active' }, clinicalUpdates, hopeStatus, careTeam };
    });
    return c.json({ meetingId: id, date: meeting.date, time: meeting.time, status: meeting.status, facilitator: meeting.facilitator, attendees: meeting.attendees, patientReviews: enrichedReviews });
  } catch (err: any) { console.log('[hospice] IDG preparation error:', err?.message); return c.json({ error: 'Failed to fetch preparation data', details: err?.message }, 500); }
});

// ─── IDG Save Workspace Notes ─────────────────────────────────────────────────
app.put('/make-server-845bc545/hospice/idg/:id/workspace', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id'); const data = await c.req.json();
    const existing = await kv.get(`hospice-idg:${id}`) as any;
    if (!existing) return c.json({ error: 'Meeting not found' }, 404);
    const { patientId, workspaceNotes } = data;
    const reviews = [...(existing.patientReviews || [])];
    const idx = reviews.findIndex((r: any) => r.patientId === patientId);
    if (idx >= 0) reviews[idx] = { ...reviews[idx], workspaceNotes, status: 'reviewed', lastUpdated: new Date().toISOString() };
    const updated = { ...existing, patientReviews: reviews, updatedAt: new Date().toISOString() };
    await kv.set(`hospice-idg:${id}`, updated);
    await createAuditLog(verified.userId, 'UPDATE_WORKSPACE', 'hospice_idg_meeting', id, existing, updated);
    return c.json({ meeting: updated });
  } catch (err: any) { return c.json({ error: 'Failed to save workspace', details: err?.message }, 500); }
});

// ─── IDG Generate Summary ─────────────────────────────────────────────────────
app.post('/make-server-845bc545/hospice/idg/:id/summary', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const existing = await kv.get(`hospice-idg:${id}`) as any;
    if (!existing) return c.json({ error: 'Meeting not found' }, 404);
    const reviews = existing.patientReviews || [];
    const reviewed = reviews.filter((r: any) => r.status === 'reviewed');
    const deferred = reviews.filter((r: any) => r.status === 'deferred');
    const allActions: any[] = []; const patientSummaries: any[] = [];
    reviewed.forEach((r: any) => {
      const ws = r.workspaceNotes || {};
      const actions = (ws.actionItems || []).filter((a: any) => a.text?.trim());
      actions.forEach((a: any) => allActions.push({ ...a, patientName: r.patientName, patientId: r.patientId }));
      patientSummaries.push({ patientId: r.patientId, patientName: r.patientName, mrn: r.mrn, reviewType: r.reviewType, clinicalStatus: ws.clinicalStatus || '', medicationChanges: ws.medicationChanges || '', carePlanUpdates: ws.carePlanUpdates || '', familyConcerns: ws.familyConcerns || '', actionCount: actions.length, actions });
    });
    const generatedSummary = {
      meetingId: id, date: existing.date, time: existing.time, facilitator: existing.facilitator,
      attendees: (existing.attendees || []).filter((a: any) => a.present),
      absentees: (existing.attendees || []).filter((a: any) => a.present === false),
      statistics: { totalPatients: reviews.length, reviewed: reviewed.length, deferred: deferred.length, pending: reviews.filter((r: any) => r.status === 'pending').length, totalActionItems: allActions.length },
      patientSummaries, deferredPatients: deferred.map((r: any) => ({ patientId: r.patientId, patientName: r.patientName, reason: r.notes || 'No reason given' })),
      allActionItems: allActions, generatedAt: new Date().toISOString(),
    };
    const updated = { ...existing, generatedSummary, status: 'completed', completedAt: new Date().toISOString(), summary: `Meeting completed. ${reviewed.length} of ${reviews.length} patients reviewed. ${allActions.length} action items generated.`, updatedAt: new Date().toISOString() };
    await kv.set(`hospice-idg:${id}`, updated);
    await createAuditLog(verified.userId, 'GENERATE_SUMMARY', 'hospice_idg_meeting', id, existing, updated);
    return c.json({ summary: generatedSummary, meeting: updated });
  } catch (err: any) { return c.json({ error: 'Failed to generate summary', details: err?.message }, 500); }
});

// ─── Bereavement ──────────────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/bereavement', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { search, riskLevel } = c.req.query();
    let cases = await kv.getByPrefix('hospice-bereavement:') || [];

    if (search) {
      const q = search.toLowerCase();
      cases = cases.filter((bc: any) =>
        bc.deceasedName.toLowerCase().includes(q) ||
        bc.primaryContact.toLowerCase().includes(q) ||
        bc.mrn.toLowerCase().includes(q)
      );
    }
    if (riskLevel && riskLevel !== 'all') cases = cases.filter((bc: any) => bc.riskLevel === riskLevel);

    return c.json({ cases });
  } catch (err: any) {
    console.log('[hospice] Error fetching bereavement cases:', err?.message);
    return c.json({ error: 'Failed to fetch bereavement cases', details: err?.message }, 500);
  }
});

app.get('/make-server-845bc545/hospice/bereavement/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const bc = await kv.get(`hospice-bereavement:${id}`);
  if (!bc) return c.json({ error: 'Bereavement case not found' }, 404);
  return c.json({ case: bc });
});

app.put('/make-server-845bc545/hospice/bereavement/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const data = await c.req.json();
  const existing = await kv.get(`hospice-bereavement:${id}`);
  if (!existing) return c.json({ error: 'Bereavement case not found' }, 404);
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await kv.set(`hospice-bereavement:${id}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'hospice_bereavement', id, existing, updated);
  return c.json({ case: updated });
});

app.put('/make-server-845bc545/hospice/bereavement/:caseId/tasks/:taskId/complete', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const caseId = c.req.param('caseId');
  const taskId = c.req.param('taskId');
  const bc = await kv.get(`hospice-bereavement:${caseId}`);
  if (!bc) return c.json({ error: 'Bereavement case not found' }, 404);
  const tasks = (bc as any).tasks.map((t: any) =>
    t.id === taskId ? { ...t, status: 'completed', completedDate: new Date().toISOString().split('T')[0] } : t
  );
  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
  const updated = { ...bc, tasks, completedTasks, updatedAt: new Date().toISOString() };
  await kv.set(`hospice-bereavement:${caseId}`, updated);
  await createAuditLog(verified.userId, 'COMPLETE_TASK', 'hospice_bereavement_task', taskId, null, { caseId, taskId });
  return c.json({ case: updated });
});

// ─── Volunteers ───────────────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/volunteers', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const { search, status } = c.req.query();
    let volunteers = await kv.getByPrefix('hospice-volunteer:') || [];

    if (search) {
      const q = search.toLowerCase();
      volunteers = volunteers.filter((v: any) =>
        v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'all') volunteers = volunteers.filter((v: any) => v.status === status);

    return c.json({ volunteers });
  } catch (err: any) {
    console.log('[hospice] Error fetching volunteers:', err?.message);
    return c.json({ error: 'Failed to fetch volunteers', details: err?.message }, 500);
  }
});

app.get('/make-server-845bc545/hospice/volunteers/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const volunteer = await kv.get(`hospice-volunteer:${id}`);
  if (!volunteer) return c.json({ error: 'Volunteer not found' }, 404);
  return c.json({ volunteer });
});

app.post('/make-server-845bc545/hospice/volunteers', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const data = await c.req.json();
  const id = `vol-${Date.now()}`;
  const volunteer = { ...data, id, createdAt: new Date().toISOString() };
  await kv.set(`hospice-volunteer:${id}`, volunteer);
  await createAuditLog(verified.userId, 'CREATE', 'hospice_volunteer', id, null, volunteer);
  return c.json({ volunteer });
});

app.put('/make-server-845bc545/hospice/volunteers/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  const id = c.req.param('id');
  const data = await c.req.json();
  const existing = await kv.get(`hospice-volunteer:${id}`);
  if (!existing) return c.json({ error: 'Volunteer not found' }, 404);
  const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
  await kv.set(`hospice-volunteer:${id}`, updated);
  await createAuditLog(verified.userId, 'UPDATE', 'hospice_volunteer', id, existing, updated);
  return c.json({ volunteer: updated });
});

// ─── Paginated MD Queue ───────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/md-queue-paginated', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const query = c.req.query();
    const { search, docType, urgency } = query;
    const pagination = parsePaginationParams(query);
    let docs = await kv.getByPrefix('hospice-md-doc:') || [];
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter((d: any) => d.patientName.toLowerCase().includes(q) || d.mrn.toLowerCase().includes(q) || d.docTitle.toLowerCase().includes(q));
    }
    if (docType && docType !== 'all') docs = docs.filter((d: any) => d.docType === docType);
    if (urgency && urgency !== 'all') docs = docs.filter((d: any) => d.urgency === urgency);
    const urgencyOrder: Record<string, number> = { urgent: 0, overdue: 1, routine: 2 };
    docs.sort((a: any, b: any) => (urgencyOrder[a.urgency] ?? 3) - (urgencyOrder[b.urgency] ?? 3) || (b.daysWaiting ?? 0) - (a.daysWaiting ?? 0));
    const result = applyPagination(docs, pagination);
    return c.json({ documents: result.data, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch paginated MD queue', details: err?.message }, 500);
  }
});

// ─── Paginated Bereavement ────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/bereavement-paginated', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const query = c.req.query();
    const { search, riskLevel } = query;
    const pagination = parsePaginationParams(query);
    let cases = await kv.getByPrefix('hospice-bereavement:') || [];
    if (search) {
      const q = search.toLowerCase();
      cases = cases.filter((bc: any) => bc.deceasedName.toLowerCase().includes(q) || bc.primaryContact.toLowerCase().includes(q) || bc.mrn.toLowerCase().includes(q));
    }
    if (riskLevel && riskLevel !== 'all') cases = cases.filter((bc: any) => bc.riskLevel === riskLevel);
    const result = applyPagination(cases, pagination, 'deceasedName');
    return c.json({ cases: result.data, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch paginated bereavement cases', details: err?.message }, 500);
  }
});

// ─── Paginated Volunteers ─────────────────────────────────────────────────────
app.get('/make-server-845bc545/hospice/volunteers-paginated', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const query = c.req.query();
    const { search, status } = query;
    const pagination = parsePaginationParams(query);
    let volunteers = await kv.getByPrefix('hospice-volunteer:') || [];
    if (search) {
      const q = search.toLowerCase();
      volunteers = volunteers.filter((v: any) => v.name.toLowerCase().includes(q) || v.email.toLowerCase().includes(q));
    }
    if (status && status !== 'all') volunteers = volunteers.filter((v: any) => v.status === status);
    const result = applyPagination(volunteers, pagination, 'name');
    return c.json({ volunteers: result.data, pagination: { total: result.total, page: result.page, pageSize: result.pageSize, totalPages: result.totalPages } });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch paginated volunteers', details: err?.message }, 500);
  }
});

// ─── Start HOPE Assessment ────────────────────────────────────────────────────
app.post('/make-server-845bc545/hospice/patients/:id/assessments/start', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const { phase } = await c.req.json();
    const patient = await kv.get(`hospice-patient:${id}`);
    if (!patient) return c.json({ error: 'Hospice patient not found' }, 404);
    const assessments = ((patient as any).assessments || []).map((a: any) => {
      if (a.phase === phase && (a.status === 'due' || a.status === 'overdue')) {
        return { ...a, status: 'in_progress', startedAt: new Date().toISOString(), startedBy: verified.user?.user_metadata?.name || verified.userId };
      }
      return a;
    });
    const updated = { ...patient, assessments, updatedAt: new Date().toISOString() };
    await kv.set(`hospice-patient:${id}`, updated);
    // Create a corresponding OASIS record
    const phaseToReason: Record<string, string> = { admission: 'SOC', huv1: 'Recert', huv2: 'Recert', discharge: 'Discharge' };
    const oasisId = `oasis-${Date.now()}`;
    const oasisRecord = {
      id: oasisId, patientId: id, patientName: (patient as any).patientName, mrn: (patient as any).mrn,
      assessmentType: 'OASIS-E', reason: phaseToReason[phase] || 'SOC', status: 'in_progress',
      startedDate: new Date().toISOString().split('T')[0],
      clinician: verified.user?.user_metadata?.name || 'Unknown',
      hopePhase: phase,
    };
    await kv.set(`hospice-oasis:${oasisId}`, oasisRecord);
    await createAuditLog(verified.userId, 'START_ASSESSMENT', 'hospice_hope_assessment', `${id}:${phase}`, null, { phase, oasisId });
    return c.json({ patient: updated, oasisRecord });
  } catch (err: any) {
    console.log('[hospice] Error starting assessment:', err?.message);
    return c.json({ error: 'Failed to start assessment', details: err?.message }, 500);
  }
});

// ─── OASIS Records (linked to HOPE) ──────────────────────────────────────────
app.get('/make-server-845bc545/hospice/oasis/:patientId', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const patientId = c.req.param('patientId');
    const allOasis = await kv.getByPrefix('hospice-oasis:') || [];
    const patientOasis = allOasis.filter((o: any) => o.patientId === patientId);
    patientOasis.sort((a: any, b: any) => new Date(b.completedDate || b.startedDate || '').getTime() - new Date(a.completedDate || a.startedDate || '').getTime());
    return c.json({ oasisRecords: patientOasis });
  } catch (err: any) {
    console.log('[hospice] Error fetching OASIS records:', err?.message);
    return c.json({ error: 'Failed to fetch OASIS records', details: err?.message }, 500);
  }
});

app.get('/make-server-845bc545/hospice/oasis', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const allOasis = await kv.getByPrefix('hospice-oasis:') || [];
    allOasis.sort((a: any, b: any) => new Date(b.completedDate || b.startedDate || '').getTime() - new Date(a.completedDate || a.startedDate || '').getTime());
    return c.json({ oasisRecords: allOasis });
  } catch (err: any) {
    console.log('[hospice] Error fetching all OASIS records:', err?.message);
    return c.json({ error: 'Failed to fetch OASIS records', details: err?.message }, 500);
  }
});

// ─── Create Bereavement Case ──────────────────────────────────────────────────
app.post('/make-server-845bc545/hospice/bereavement', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const data = await c.req.json();
    const id = `bv-${Date.now()}`;
    const dod = new Date(data.dateOfDeath);
    const defaultTasks = [
      { id: `bt-${Date.now()}-1`, type: 'sympathy_card', label: 'Initial sympathy card', scheduledDate: new Date(dod.getTime() + 2 * 86400000).toISOString().split('T')[0], status: 'due' },
      { id: `bt-${Date.now()}-2`, type: 'phone_call', label: '1-week follow-up call', scheduledDate: new Date(dod.getTime() + 7 * 86400000).toISOString().split('T')[0], status: 'upcoming' },
      { id: `bt-${Date.now()}-3`, type: 'phone_call', label: '1-month follow-up call', scheduledDate: new Date(dod.getTime() + 30 * 86400000).toISOString().split('T')[0], status: 'upcoming' },
      { id: `bt-${Date.now()}-4`, type: 'resource_mailing', label: 'Grief resource packet', scheduledDate: new Date(dod.getTime() + 35 * 86400000).toISOString().split('T')[0], status: 'upcoming' },
      { id: `bt-${Date.now()}-5`, type: 'phone_call', label: '2-month follow-up call', scheduledDate: new Date(dod.getTime() + 60 * 86400000).toISOString().split('T')[0], status: 'upcoming' },
      { id: `bt-${Date.now()}-6`, type: 'home_visit', label: '3-month home visit', scheduledDate: new Date(dod.getTime() + 90 * 86400000).toISOString().split('T')[0], status: 'upcoming' },
      { id: `bt-${Date.now()}-7`, type: 'phone_call', label: '6-month follow-up call', scheduledDate: new Date(dod.getTime() + 180 * 86400000).toISOString().split('T')[0], status: 'upcoming' },
      { id: `bt-${Date.now()}-8`, type: 'group_referral', label: 'Support group referral', scheduledDate: new Date(dod.getTime() + 90 * 86400000).toISOString().split('T')[0], status: 'upcoming' },
      { id: `bt-${Date.now()}-9`, type: 'anniversary_card', label: '1-year anniversary card', scheduledDate: new Date(dod.getTime() + 365 * 86400000).toISOString().split('T')[0], status: 'upcoming' },
      { id: `bt-${Date.now()}-10`, type: 'phone_call', label: '13-month final call', scheduledDate: new Date(dod.getTime() + 395 * 86400000).toISOString().split('T')[0], status: 'upcoming' },
    ];
    const bereavementCase = {
      id, ...data,
      monthsInProgram: 0, totalTasks: defaultTasks.length, completedTasks: 0,
      tasks: data.tasks || defaultTasks,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`hospice-bereavement:${id}`, bereavementCase);
    await createAuditLog(verified.userId, 'CREATE', 'hospice_bereavement', id, null, bereavementCase);
    return c.json({ case: bereavementCase });
  } catch (err: any) {
    console.log('[hospice] Error creating bereavement case:', err?.message);
    return c.json({ error: 'Failed to create bereavement case', details: err?.message }, 500);
  }
});

// ─── Log Volunteer Visit ──────────────────────────────────────────────────────
app.post('/make-server-845bc545/hospice/volunteers/:id/visits', async (c) => {
  const verified = await verifyUser(c.req.raw);
  if (!verified) return c.json({ error: 'Unauthorized' }, 401);
  try {
    const id = c.req.param('id');
    const visitData = await c.req.json();
    const volunteer = await kv.get(`hospice-volunteer:${id}`) as any;
    if (!volunteer) return c.json({ error: 'Volunteer not found' }, 404);
    const visitId = `vv-${Date.now()}`;
    const newVisit = { id: visitId, ...visitData, status: visitData.status || 'completed' };
    const recentVisits = [newVisit, ...(volunteer.recentVisits || [])];
    const durationHours = (visitData.duration || 0) / 60;
    const updated = {
      ...volunteer, recentVisits,
      hoursThisMonth: volunteer.hoursThisMonth + durationHours,
      totalHoursYTD: volunteer.totalHoursYTD + durationHours,
      updatedAt: new Date().toISOString(),
    };
    await kv.set(`hospice-volunteer:${id}`, updated);
    await createAuditLog(verified.userId, 'LOG_VISIT', 'hospice_volunteer_visit', visitId, null, { volunteerId: id, visit: newVisit });
    return c.json({ volunteer: updated, visit: newVisit });
  } catch (err: any) {
    console.log('[hospice] Error logging volunteer visit:', err?.message);
    return c.json({ error: 'Failed to log volunteer visit', details: err?.message }, 500);
  }
});

export default app;