/**
 * Scheduling Server Routes
 * Handles visit CRUD, open shifts, caregiver availability
 * Uses KV store for persistence (no separate Supabase tables needed).
 */
import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ============================================================================
// SEED DATA – idempotent (fixed IDs)
// ============================================================================

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const day2 = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
const day3 = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];
const day4 = new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0];
const day5 = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

// Recurrence pattern for seed data
const SEED_RECURRENCE_ID = 'recurrence-seed-001';
const SEED_RECURRENCE_PATTERN = {
  id: SEED_RECURRENCE_ID,
  frequency: 'weekly' as const,
  interval: 1,
  daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
  occurrences: 6,
};

const SEED_VISITS = [
  // Today's visits
  { id: 'visit-seed-001', patientId: 'patient-demo-001', admissionId: 'adm-001', visitDate: today, startTime: '09:00', endTime: '10:00', caregiverId: 'cg-001', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'scheduled', notes: 'Wound care assessment', evvClockIn: null, evvClockOut: null },
  { id: 'visit-seed-002', patientId: 'patient-demo-002', admissionId: 'adm-002', visitDate: today, startTime: '10:30', endTime: '11:30', caregiverId: 'cg-001', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'in_progress', notes: 'Medication management, insulin training', evvClockIn: `${today}T10:28:00.000Z`, evvClockOut: null },
  { id: 'visit-seed-003', patientId: 'patient-demo-003', admissionId: 'adm-003', visitDate: today, startTime: '13:00', endTime: '14:00', caregiverId: 'cg-002', billingCode: 'PT-EVAL', discipline: 'PT', visitType: 'Physical Therapy', status: 'scheduled', notes: 'Initial PT evaluation', evvClockIn: null, evvClockOut: null },
  { id: 'visit-seed-004', patientId: 'patient-demo-004', admissionId: 'adm-004', visitDate: today, startTime: '14:30', endTime: '15:30', caregiverId: 'cg-005', billingCode: 'OT-VISIT', discipline: 'OT', visitType: 'Occupational Therapy', status: 'scheduled', notes: 'ADL training', evvClockIn: null, evvClockOut: null },
  { id: 'visit-seed-005', patientId: 'patient-demo-006', admissionId: 'adm-004', visitDate: today, startTime: '08:00', endTime: '09:00', caregiverId: 'cg-003', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'completed', notes: 'Vital signs check, wound re-dressing', evvClockIn: `${today}T07:58:00.000Z`, evvClockOut: `${today}T09:02:00.000Z` },
  { id: 'visit-seed-006', patientId: 'patient-demo-001', admissionId: 'adm-001', visitDate: today, startTime: '16:00', endTime: '17:00', caregiverId: 'cg-006', billingCode: 'MSW-VISIT', discipline: 'MSW', visitType: 'Social Work', status: 'scheduled', notes: 'Resource assessment and support planning', evvClockIn: null, evvClockOut: null },
  // Yesterday's visits (completed)
  { id: 'visit-seed-007', patientId: 'patient-demo-002', admissionId: 'adm-002', visitDate: yesterday, startTime: '09:00', endTime: '10:00', caregiverId: 'cg-001', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'completed', notes: 'Routine visit – vitals stable', evvClockIn: `${yesterday}T08:55:00.000Z`, evvClockOut: `${yesterday}T10:05:00.000Z` },
  { id: 'visit-seed-008', patientId: 'patient-demo-004', admissionId: 'adm-004', visitDate: yesterday, startTime: '11:00', endTime: '12:00', caregiverId: 'cg-002', billingCode: 'PT-VISIT', discipline: 'PT', visitType: 'Physical Therapy', status: 'completed', notes: 'Gait training, balance exercises', evvClockIn: `${yesterday}T10:58:00.000Z`, evvClockOut: `${yesterday}T12:03:00.000Z` },
  { id: 'visit-seed-009', patientId: 'patient-demo-003', admissionId: 'adm-003', visitDate: yesterday, startTime: '14:00', endTime: '15:00', caregiverId: 'cg-003', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'missed', notes: 'Patient was not home', evvClockIn: null, evvClockOut: null },
  // Tomorrow's visits
  { id: 'visit-seed-010', patientId: 'patient-demo-001', admissionId: 'adm-001', visitDate: tomorrow, startTime: '09:00', endTime: '10:00', caregiverId: 'cg-004', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'scheduled', notes: 'Follow-up wound care', evvClockIn: null, evvClockOut: null },
  { id: 'visit-seed-011', patientId: 'patient-demo-005', admissionId: 'adm-005', visitDate: tomorrow, startTime: '11:00', endTime: '12:00', caregiverId: null, billingCode: 'RN-SOC', discipline: 'RN', visitType: 'Start of Care', status: 'scheduled', notes: 'SOC admission visit for new patient', evvClockIn: null, evvClockOut: null },
  // Open shifts (no caregiver)
  { id: 'visit-seed-012', patientId: 'patient-demo-002', admissionId: 'adm-002', visitDate: tomorrow, startTime: '08:00', endTime: '09:00', caregiverId: null, billingCode: 'AIDE-VISIT', discipline: 'AIDE', visitType: 'Home Health Aide', status: 'open', notes: 'Bathing and personal care assistance', evvClockIn: null, evvClockOut: null },
  { id: 'visit-seed-013', patientId: 'patient-demo-004', admissionId: 'adm-004', visitDate: tomorrow, startTime: '13:00', endTime: '14:00', caregiverId: null, billingCode: 'ST-VISIT', discipline: 'ST', visitType: 'Speech Therapy', status: 'open', notes: 'Swallowing eval follow-up', evvClockIn: null, evvClockOut: null },
  { id: 'visit-seed-014', patientId: 'patient-demo-006', admissionId: 'adm-004', visitDate: tomorrow, startTime: '10:00', endTime: '11:00', caregiverId: null, billingCode: 'PT-VISIT', discipline: 'PT', visitType: 'Physical Therapy', status: 'open', notes: 'Transfer training', evvClockIn: null, evvClockOut: null },
  // ─── Recurring series: RN Wound Care for patient-demo-001, MWF ─────────
  { id: 'visit-seed-rec-001', patientId: 'patient-demo-001', admissionId: 'adm-001', visitDate: today, startTime: '11:00', endTime: '12:00', caregiverId: 'cg-004', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'scheduled', notes: 'Recurring wound care - MWF series', evvClockIn: null, evvClockOut: null, recurrenceId: SEED_RECURRENCE_ID, recurrenceIndex: 0, recurrenceTotal: 6, recurrencePattern: SEED_RECURRENCE_PATTERN },
  { id: 'visit-seed-rec-002', patientId: 'patient-demo-001', admissionId: 'adm-001', visitDate: tomorrow, startTime: '11:00', endTime: '12:00', caregiverId: 'cg-004', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'scheduled', notes: 'Recurring wound care - MWF series', evvClockIn: null, evvClockOut: null, recurrenceId: SEED_RECURRENCE_ID, recurrenceIndex: 1, recurrenceTotal: 6, recurrencePattern: SEED_RECURRENCE_PATTERN },
  { id: 'visit-seed-rec-003', patientId: 'patient-demo-001', admissionId: 'adm-001', visitDate: day2, startTime: '11:00', endTime: '12:00', caregiverId: 'cg-004', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'scheduled', notes: 'Recurring wound care - MWF series', evvClockIn: null, evvClockOut: null, recurrenceId: SEED_RECURRENCE_ID, recurrenceIndex: 2, recurrenceTotal: 6, recurrencePattern: SEED_RECURRENCE_PATTERN },
  { id: 'visit-seed-rec-004', patientId: 'patient-demo-001', admissionId: 'adm-001', visitDate: day3, startTime: '11:00', endTime: '12:00', caregiverId: 'cg-004', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'scheduled', notes: 'Recurring wound care - MWF series', evvClockIn: null, evvClockOut: null, recurrenceId: SEED_RECURRENCE_ID, recurrenceIndex: 3, recurrenceTotal: 6, recurrencePattern: SEED_RECURRENCE_PATTERN },
  { id: 'visit-seed-rec-005', patientId: 'patient-demo-001', admissionId: 'adm-001', visitDate: day4, startTime: '11:00', endTime: '12:00', caregiverId: 'cg-004', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'scheduled', notes: 'Recurring wound care - MWF series', evvClockIn: null, evvClockOut: null, recurrenceId: SEED_RECURRENCE_ID, recurrenceIndex: 4, recurrenceTotal: 6, recurrencePattern: SEED_RECURRENCE_PATTERN },
  { id: 'visit-seed-rec-006', patientId: 'patient-demo-001', admissionId: 'adm-001', visitDate: day5, startTime: '11:00', endTime: '12:00', caregiverId: 'cg-004', billingCode: 'RN-SN', discipline: 'RN', visitType: 'Skilled Nursing', status: 'scheduled', notes: 'Recurring wound care - MWF series', evvClockIn: null, evvClockOut: null, recurrenceId: SEED_RECURRENCE_ID, recurrenceIndex: 5, recurrenceTotal: 6, recurrencePattern: SEED_RECURRENCE_PATTERN },
];

// ─── Caregiver seed data ────────────────────────────────────────────────────

const SEED_CAREGIVERS = [
  { id: 'cg-001', name: 'Sarah Johnson', discipline: 'RN', disciplines: ['RN'], phone: '555-0101', email: 'sarah.johnson@hcplatform.com', status: 'active', zone: 'Downtown', zipCode: '10001', maxDailyVisits: 6, certifications: ['BLS', 'Wound Care', 'IV Therapy'], yearsExperience: 8, missedVisitRate: 0.02, avgPunctuality: 0.95, rating: 4.8 },
  { id: 'cg-002', name: 'Michael Chen', discipline: 'PT', disciplines: ['PT'], phone: '555-0102', email: 'michael.chen@hcplatform.com', status: 'active', zone: 'Midtown', zipCode: '10002', maxDailyVisits: 5, certifications: ['DPT', 'Orthopedic Specialist'], yearsExperience: 6, missedVisitRate: 0.01, avgPunctuality: 0.98, rating: 4.9 },
  { id: 'cg-003', name: 'Jennifer Martinez', discipline: 'RN', disciplines: ['RN'], phone: '555-0103', email: 'jennifer.martinez@hcplatform.com', status: 'active', zone: 'Uptown', zipCode: '10003', maxDailyVisits: 6, certifications: ['BLS', 'Hospice'], yearsExperience: 10, missedVisitRate: 0.08, avgPunctuality: 0.85, rating: 4.2 },
  { id: 'cg-004', name: 'Jennifer Lee', discipline: 'RN', disciplines: ['RN'], phone: '555-0104', email: 'jennifer.lee@hcplatform.com', status: 'active', zone: 'East Side', zipCode: '10004', maxDailyVisits: 6, certifications: ['BLS', 'Wound Care', 'Hospice'], yearsExperience: 12, missedVisitRate: 0.03, avgPunctuality: 0.92, rating: 4.7 },
  { id: 'cg-005', name: 'David Kim', discipline: 'OT', disciplines: ['OT'], phone: '555-0105', email: 'david.kim@hcplatform.com', status: 'active', zone: 'West Side', zipCode: '10005', maxDailyVisits: 5, certifications: ['OTR/L', 'CHT'], yearsExperience: 4, missedVisitRate: 0.0, avgPunctuality: 0.97, rating: 4.9 },
  { id: 'cg-006', name: 'Lisa Adams', discipline: 'MSW', disciplines: ['MSW'], phone: '555-0106', email: 'lisa.adams@hcplatform.com', status: 'active', zone: 'Downtown', zipCode: '10001', maxDailyVisits: 5, certifications: ['LCSW'], yearsExperience: 7, missedVisitRate: 0.0, avgPunctuality: 0.96, rating: 4.8 },
  { id: 'cg-007', name: 'James Wilson', discipline: 'AIDE', disciplines: ['AIDE'], phone: '555-0107', email: 'james.wilson@hcplatform.com', status: 'active', zone: 'Midtown', zipCode: '10002', maxDailyVisits: 8, certifications: ['CNA', 'HHA'], yearsExperience: 3, missedVisitRate: 0.05, avgPunctuality: 0.88, rating: 4.3 },
  { id: 'cg-008', name: 'Maria Garcia', discipline: 'ST', disciplines: ['ST'], phone: '555-0108', email: 'maria.garcia@hcplatform.com', status: 'active', zone: 'Uptown', zipCode: '10003', maxDailyVisits: 5, certifications: ['CCC-SLP'], yearsExperience: 5, missedVisitRate: 0.01, avgPunctuality: 0.94, rating: 4.6 },
  { id: 'cg-009', name: 'Robert Taylor', discipline: 'PT', disciplines: ['PT'], phone: '555-0109', email: 'robert.taylor@hcplatform.com', status: 'active', zone: 'East Side', zipCode: '10004', maxDailyVisits: 5, certifications: ['DPT', 'Neuro Rehab'], yearsExperience: 9, missedVisitRate: 0.02, avgPunctuality: 0.93, rating: 4.7 },
  { id: 'cg-010', name: 'Amanda Foster', discipline: 'RN', disciplines: ['RN'], phone: '555-0110', email: 'amanda.foster@hcplatform.com', status: 'on_leave', zone: 'West Side', zipCode: '10005', maxDailyVisits: 6, certifications: ['BLS', 'PICC'], yearsExperience: 5, missedVisitRate: 0.04, avgPunctuality: 0.90, rating: 4.5 },
];

export async function seedSchedulingData() {
  // Determine documentation_status based on visit completion state
  const docStatusForVisit = (v: typeof SEED_VISITS[0]) => {
    if (v.status === 'completed' && v.evvClockOut) {
      // Some completed visits have full docs, some are pending/in_progress
      if (v.id === 'visit-seed-005') return 'completed';
      if (v.id === 'visit-seed-007') return 'completed';
      if (v.id === 'visit-seed-008') return 'in_progress';
      return 'pending';
    }
    return 'n/a';
  };

  for (const v of SEED_VISITS) {
    await kv.set(`visit:${v.id}`, {
      id: v.id,
      patient_id: v.patientId,
      admission_id: v.admissionId,
      visit_date: v.visitDate,
      start_time: v.startTime,
      end_time: v.endTime,
      caregiver_id: v.caregiverId,
      billing_code: v.billingCode,
      discipline: v.discipline,
      visit_type: v.visitType,
      status: v.status,
      notes: v.notes,
      evv_clock_in: v.evvClockIn,
      evv_clock_out: v.evvClockOut,
      documentation_status: docStatusForVisit(v),
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
      recurrence_id: v.recurrenceId,
      recurrence_index: v.recurrenceIndex,
      recurrence_total: v.recurrenceTotal,
      recurrence_pattern: v.recurrencePattern,
    });
  }
  console.log('[seed] Scheduling visits seeded ✓');

  // Seed caregivers
  for (const cg of SEED_CAREGIVERS) {
    await kv.set(`caregiver:${cg.id}`, {
      ...cg,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    });
  }
  console.log('[seed] Caregivers seeded ✓');
}

// ============================================================================
// HELPER: enrich visits with patient info
// ============================================================================

async function enrichVisitsWithPatients(visits: any[]) {
  if (visits.length === 0) return [];
  const patients = await kv.getByPrefix('patient:');
  const pMap = new Map((patients || []).map((p: any) => [p.id, p]));
  return visits.map((v: any) => {
    const p = pMap.get(v.patient_id);
    return {
      ...v,
      patient_name: p ? `${p.first_name} ${p.last_name}` : 'Unknown',
      patient_mrn: p?.mrn || '',
      patient_phone: p?.phone || '',
      patient_address: p?.address || '',
    };
  });
}

// ============================================================================
// VISIT ROUTES
// ============================================================================

/**
 * GET /make-server-845bc545/visits
 * Get visits with optional filtering by date range, caregiver, patient, status
 */
app.get('/make-server-845bc545/visits', async (c) => {
  try {
    const { start_date, end_date, caregiver_id, patient_id, status } = c.req.query();

    let visits = (await kv.getByPrefix('visit:')) || [];

    if (start_date) {
      visits = visits.filter((v: any) => v.visit_date >= start_date);
    }
    if (end_date) {
      visits = visits.filter((v: any) => v.visit_date <= end_date);
    }
    if (caregiver_id) {
      visits = visits.filter((v: any) => v.caregiver_id === caregiver_id);
    }
    if (patient_id) {
      visits = visits.filter((v: any) => v.patient_id === patient_id);
    }
    if (status) {
      visits = visits.filter((v: any) => v.status === status);
    }

    // Sort by date ascending, then time ascending
    visits.sort((a: any, b: any) => {
      const cmp = a.visit_date.localeCompare(b.visit_date);
      return cmp !== 0 ? cmp : a.start_time.localeCompare(b.start_time);
    });

    const enriched = await enrichVisitsWithPatients(visits);
    return c.json({ data: enriched });
  } catch (error: any) {
    console.error('Error fetching visits:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /make-server-845bc545/visits/stats
 * Return aggregate scheduling stats for dashboards
 */
app.get('/make-server-845bc545/visits/stats', async (c) => {
  try {
    const allVisits = (await kv.getByPrefix('visit:')) || [];
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = allVisits.filter((v: any) => v.visit_date === today);

    const stats = {
      totalToday: todayVisits.length,
      scheduled: todayVisits.filter((v: any) => v.status === 'scheduled').length,
      inProgress: todayVisits.filter((v: any) => v.status === 'in_progress').length,
      completed: todayVisits.filter((v: any) => v.status === 'completed').length,
      missed: todayVisits.filter((v: any) => v.status === 'missed').length,
      openShifts: allVisits.filter((v: any) => v.status === 'open' && v.visit_date >= today).length,
      totalThisWeek: allVisits.filter((v: any) => {
        const d = new Date(v.visit_date);
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return d >= startOfWeek && d < endOfWeek;
      }).length,
      evvErrors: allVisits.filter((v: any) =>
        v.status === 'completed' && (!v.evv_clock_in || !v.evv_clock_out)
      ).length,
    };

    return c.json({ stats });
  } catch (error: any) {
    console.error('Error fetching visit stats:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * GET /make-server-845bc545/visits/:id
 * Get single visit by ID
 */
app.get('/make-server-845bc545/visits/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const visit = await kv.get(`visit:${id}`);
    if (!visit) return c.json({ error: 'Visit not found' }, 404);

    const enriched = await enrichVisitsWithPatients([visit]);
    return c.json({ data: enriched[0] });
  } catch (error: any) {
    console.error('Error fetching visit:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /make-server-845bc545/visits
 * Create new visit
 */
app.post('/make-server-845bc545/visits', async (c) => {
  try {
    const body = await c.req.json();
    const {
      patient_id, admission_id, visit_date, start_time, end_time,
      caregiver_id, billing_code, discipline, visit_type, notes,
      recurrence_id, recurrence_index, recurrence_total, recurrence_pattern,
    } = body;

    if (!patient_id || !visit_date || !start_time) {
      return c.json({ error: 'Missing required fields: patient_id, visit_date, start_time' }, 400);
    }

    // Check for scheduling conflicts if caregiver assigned
    if (caregiver_id && end_time) {
      const conflicts = await checkSchedulingConflicts(caregiver_id, visit_date, start_time, end_time);
      if (conflicts.length > 0) {
        return c.json({ error: 'Scheduling conflict detected', conflicts }, 409);
      }
    }

    const id = `visit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const visit: any = {
      id,
      patient_id,
      admission_id: admission_id || null,
      visit_date,
      start_time,
      end_time: end_time || '',
      caregiver_id: caregiver_id || null,
      billing_code: billing_code || '',
      discipline: discipline || '',
      visit_type: visit_type || '',
      status: caregiver_id ? 'scheduled' : 'open',
      notes: notes || '',
      evv_clock_in: null,
      evv_clock_out: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Recurrence metadata — stored on every visit in the series
    if (recurrence_id) {
      visit.recurrence_id = recurrence_id;
      visit.recurrence_index = recurrence_index ?? 0;
      visit.recurrence_total = recurrence_total ?? 1;
      visit.recurrence_pattern = recurrence_pattern || null;
    }

    await kv.set(`visit:${id}`, visit);
    return c.json({ data: visit }, 201);
  } catch (error: any) {
    console.error('Error creating visit:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * PUT /make-server-845bc545/visits/:id
 * Update visit
 */
app.put('/make-server-845bc545/visits/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const existing = await kv.get(`visit:${id}`);
    if (!existing) return c.json({ error: 'Visit not found' }, 404);

    // Conflict check when assigning caregiver
    if (body.caregiver_id && body.visit_date && body.start_time && body.end_time) {
      const conflicts = await checkSchedulingConflicts(
        body.caregiver_id, body.visit_date, body.start_time, body.end_time, id
      );
      if (conflicts.length > 0) {
        return c.json({ error: 'Scheduling conflict detected', conflicts }, 409);
      }
    }

    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
    await kv.set(`visit:${id}`, updated);
    return c.json({ data: updated });
  } catch (error: any) {
    console.error('Error updating visit:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * DELETE /make-server-845bc545/visits/:id
 * Soft delete – sets status to cancelled
 */
app.delete('/make-server-845bc545/visits/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const existing = await kv.get(`visit:${id}`);
    if (!existing) return c.json({ error: 'Visit not found' }, 404);
    const updated = { ...existing, status: 'cancelled', updated_at: new Date().toISOString() };
    await kv.set(`visit:${id}`, updated);
    return c.json({ data: updated });
  } catch (error: any) {
    console.error('Error deleting visit:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// RECURRENCE SERIES ROUTES
// ============================================================================

/**
 * GET /make-server-845bc545/visits/recurrence/:recurrenceId
 * Get all visits belonging to a recurrence series, sorted by date
 */
app.get('/make-server-845bc545/visits/recurrence/:recurrenceId', async (c) => {
  try {
    const { recurrenceId } = c.req.param();
    const allVisits = (await kv.getByPrefix('visit:')) || [];
    const seriesVisits = allVisits
      .filter((v: any) => v.recurrence_id === recurrenceId)
      .sort((a: any, b: any) => {
        const cmp = (a.visit_date || '').localeCompare(b.visit_date || '');
        return cmp !== 0 ? cmp : (a.recurrence_index ?? 0) - (b.recurrence_index ?? 0);
      });

    const enriched = await enrichVisitsWithPatients(seriesVisits);
    return c.json({ data: enriched });
  } catch (error: any) {
    console.error('Error fetching recurrence series:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * PUT /make-server-845bc545/visits/recurrence/:recurrenceId
 * Update visits in a recurrence series with scope control.
 * Body: { visit_id, scope: 'single' | 'this_and_following' | 'all', ...updates }
 */
app.put('/make-server-845bc545/visits/recurrence/:recurrenceId', async (c) => {
  try {
    const { recurrenceId } = c.req.param();
    const body = await c.req.json();
    const { visit_id, scope, ...updates } = body;

    if (!visit_id || !scope) {
      return c.json({ error: 'Missing required fields: visit_id, scope' }, 400);
    }

    const allVisits = (await kv.getByPrefix('visit:')) || [];
    const seriesVisits = allVisits
      .filter((v: any) => v.recurrence_id === recurrenceId)
      .sort((a: any, b: any) => {
        const cmp = (a.visit_date || '').localeCompare(b.visit_date || '');
        return cmp !== 0 ? cmp : (a.recurrence_index ?? 0) - (b.recurrence_index ?? 0);
      });

    const triggerVisit = seriesVisits.find((v: any) => v.id === visit_id);
    if (!triggerVisit) {
      return c.json({ error: 'Visit not found in recurrence series' }, 404);
    }

    let visitsToUpdate: any[] = [];

    if (scope === 'single') {
      visitsToUpdate = [triggerVisit];
    } else if (scope === 'this_and_following') {
      const triggerIndex = triggerVisit.recurrence_index ?? 0;
      visitsToUpdate = seriesVisits.filter((v: any) =>
        (v.recurrence_index ?? 0) >= triggerIndex &&
        ['scheduled', 'open', 'confirmed'].includes(v.status)
      );
    } else if (scope === 'all') {
      visitsToUpdate = seriesVisits.filter((v: any) =>
        ['scheduled', 'open', 'confirmed'].includes(v.status)
      );
    }

    // Remove meta fields from updates
    const cleanUpdates: any = {};
    const allowedFields = ['start_time', 'end_time', 'visit_date', 'caregiver_id', 'discipline', 'visit_type', 'notes', 'status', 'billing_code'];
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    }

    const now = new Date().toISOString();
    let updatedCount = 0;
    for (const visit of visitsToUpdate) {
      const updated = { ...visit, ...cleanUpdates, updated_at: now };
      await kv.set(`visit:${visit.id}`, updated);
      updatedCount++;
    }

    console.log(`[recurrence] Updated ${updatedCount} visits in series ${recurrenceId} with scope=${scope}`);
    return c.json({ updated: updatedCount });
  } catch (error: any) {
    console.error('Error updating recurrence series:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * DELETE /make-server-845bc545/visits/recurrence/:recurrenceId
 * Cancel visits in a recurrence series with scope control.
 * Body: { visit_id, scope: 'single' | 'this_and_following' | 'all' }
 */
app.delete('/make-server-845bc545/visits/recurrence/:recurrenceId', async (c) => {
  try {
    const { recurrenceId } = c.req.param();
    const body = await c.req.json();
    const { visit_id, scope } = body;

    if (!visit_id || !scope) {
      return c.json({ error: 'Missing required fields: visit_id, scope' }, 400);
    }

    const allVisits = (await kv.getByPrefix('visit:')) || [];
    const seriesVisits = allVisits
      .filter((v: any) => v.recurrence_id === recurrenceId)
      .sort((a: any, b: any) =>
        (a.visit_date || '').localeCompare(b.visit_date || '')
      );

    const triggerVisit = seriesVisits.find((v: any) => v.id === visit_id);
    if (!triggerVisit) {
      return c.json({ error: 'Visit not found in recurrence series' }, 404);
    }

    let visitsToCancel: any[] = [];

    if (scope === 'single') {
      visitsToCancel = [triggerVisit];
    } else if (scope === 'this_and_following') {
      const triggerIndex = triggerVisit.recurrence_index ?? 0;
      visitsToCancel = seriesVisits.filter((v: any) =>
        (v.recurrence_index ?? 0) >= triggerIndex &&
        !['completed', 'cancelled'].includes(v.status)
      );
    } else if (scope === 'all') {
      visitsToCancel = seriesVisits.filter((v: any) =>
        !['completed', 'cancelled'].includes(v.status)
      );
    }

    const now = new Date().toISOString();
    let cancelledCount = 0;
    for (const visit of visitsToCancel) {
      const updated = { ...visit, status: 'cancelled', updated_at: now };
      await kv.set(`visit:${visit.id}`, updated);
      cancelledCount++;
    }

    console.log(`[recurrence] Cancelled ${cancelledCount} visits in series ${recurrenceId} with scope=${scope}`);
    return c.json({ cancelled: cancelledCount });
  } catch (error: any) {
    console.error('Error cancelling recurrence series:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// EVV ROUTES
// ============================================================================

/**
 * POST /make-server-845bc545/visits/:id/clock-in
 */
app.post('/make-server-845bc545/visits/:id/clock-in', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const existing = await kv.get(`visit:${id}`);
    if (!existing) return c.json({ error: 'Visit not found' }, 404);

    const now = new Date().toISOString();
    const updated = {
      ...existing,
      status: 'in_progress',
      evv_clock_in: now,
      evv_clock_in_lat: body.latitude || null,
      evv_clock_in_lng: body.longitude || null,
      updated_at: now,
    };
    await kv.set(`visit:${id}`, updated);
    return c.json({ data: updated });
  } catch (error: any) {
    console.error('Error clocking in:', error);
    return c.json({ error: error.message }, 500);
  }
});

/**
 * POST /make-server-845bc545/visits/:id/clock-out
 */
app.post('/make-server-845bc545/visits/:id/clock-out', async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const existing = await kv.get(`visit:${id}`);
    if (!existing) return c.json({ error: 'Visit not found' }, 404);

    const now = new Date().toISOString();
    const updated = {
      ...existing,
      status: 'completed',
      evv_clock_out: now,
      evv_clock_out_lat: body.latitude || null,
      evv_clock_out_lng: body.longitude || null,
      updated_at: now,
    };
    await kv.set(`visit:${id}`, updated);
    return c.json({ data: updated });
  } catch (error: any) {
    console.error('Error clocking out:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// OPEN SHIFTS ROUTES
// ============================================================================

app.get('/make-server-845bc545/open-shifts', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let visits = (await kv.getByPrefix('visit:')) || [];
    visits = visits.filter((v: any) => v.status === 'open' && v.visit_date >= today);
    visits.sort((a: any, b: any) => a.visit_date.localeCompare(b.visit_date) || a.start_time.localeCompare(b.start_time));
    const enriched = await enrichVisitsWithPatients(visits);
    return c.json({ data: enriched });
  } catch (error: any) {
    console.error('Error fetching open shifts:', error);
    return c.json({ error: error.message }, 500);
  }
});

app.post('/make-server-845bc545/open-shifts/:id/claim', async (c) => {
  try {
    const { id } = c.req.param();
    const { caregiver_id } = await c.req.json();
    const existing = await kv.get(`visit:${id}`);
    if (!existing) return c.json({ error: 'Visit not found' }, 404);
    if (existing.status !== 'open') return c.json({ error: 'Shift is no longer open' }, 409);

    const conflicts = await checkSchedulingConflicts(
      caregiver_id, existing.visit_date, existing.start_time, existing.end_time, id
    );
    if (conflicts.length > 0) {
      return c.json({ error: 'You have a scheduling conflict', conflicts }, 409);
    }

    const updated = {
      ...existing,
      caregiver_id,
      status: 'scheduled',
      claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await kv.set(`visit:${id}`, updated);
    return c.json({ data: updated, message: 'Shift claimed successfully' });
  } catch (error: any) {
    console.error('Error claiming shift:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function checkSchedulingConflicts(
  caregiver_id: string,
  visit_date: string,
  start_time: string,
  end_time: string,
  exclude_visit_id?: string
): Promise<any[]> {
  let visits = (await kv.getByPrefix('visit:')) || [];
  visits = visits.filter((v: any) =>
    v.caregiver_id === caregiver_id &&
    v.visit_date === visit_date &&
    ['scheduled', 'confirmed', 'in_progress'].includes(v.status) &&
    v.id !== exclude_visit_id
  );

  return visits.filter((v: any) =>
    (start_time >= v.start_time && start_time < v.end_time) ||
    (end_time > v.start_time && end_time <= v.end_time) ||
    (start_time <= v.start_time && end_time >= v.end_time)
  );
}

// ============================================================================
// CAREGIVERS ROUTE
// ============================================================================

app.get('/make-server-845bc545/caregivers', async (c) => {
  try {
    const caregivers = (await kv.getByPrefix('caregiver:')) || [];
    const { status, discipline } = c.req.query();
    let filtered = caregivers;
    if (status) filtered = filtered.filter((cg: any) => cg.status === status);
    if (discipline) filtered = filtered.filter((cg: any) => cg.discipline === discipline || cg.disciplines?.includes(discipline));
    return c.json({ data: filtered });
  } catch (error: any) {
    console.error('Error fetching caregivers:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// SMART SCHEDULING ASSIST
// Server-side intelligence: caregiver assignment, travel optimization,
// visit risk analysis, open shift suggestions
// ============================================================================

// Geographic zone proximity map (lower = closer)
const ZONE_DISTANCE: Record<string, Record<string, number>> = {
  'Downtown':  { 'Downtown': 0, 'Midtown': 1, 'Uptown': 2, 'East Side': 2, 'West Side': 2 },
  'Midtown':   { 'Downtown': 1, 'Midtown': 0, 'Uptown': 1, 'East Side': 1, 'West Side': 1 },
  'Uptown':    { 'Downtown': 2, 'Midtown': 1, 'Uptown': 0, 'East Side': 2, 'West Side': 2 },
  'East Side': { 'Downtown': 2, 'Midtown': 1, 'Uptown': 2, 'East Side': 0, 'West Side': 3 },
  'West Side': { 'Downtown': 2, 'Midtown': 1, 'Uptown': 2, 'East Side': 3, 'West Side': 0 },
};

// Patient zone mapping (simulate based on patient id)
const PATIENT_ZONE_MAP: Record<string, string> = {
  'patient-demo-001': 'Downtown',
  'patient-demo-002': 'Midtown',
  'patient-demo-003': 'Uptown',
  'patient-demo-004': 'East Side',
  'patient-demo-005': 'West Side',
  'patient-demo-006': 'Downtown',
};

function getZoneDistance(z1: string, z2: string): number {
  return ZONE_DISTANCE[z1]?.[z2] ?? 3;
}

app.get('/make-server-845bc545/scheduling/smart-assist', async (c) => {
  try {
    const targetDate = c.req.query('date') || new Date().toISOString().split('T')[0];
    const allVisits = (await kv.getByPrefix('visit:')) || [];
    const allCaregivers = (await kv.getByPrefix('caregiver:')) || [];
    const patients = (await kv.getByPrefix('patient:')) || [];
    const pMap = new Map(patients.map((p: any) => [p.id, p]));
    const activeCaregivers = allCaregivers.filter((cg: any) => cg.status === 'active');

    // Current day visits
    const dateVisits = allVisits.filter((v: any) => v.visit_date === targetDate);
    const upcomingVisits = allVisits.filter((v: any) => v.visit_date >= targetDate);

    // Build caregiver workload map for target date
    const caregiverWorkload = new Map<string, number>();
    const caregiverVisitMap = new Map<string, any[]>();
    for (const v of dateVisits) {
      if (v.caregiver_id && ['scheduled', 'confirmed', 'in_progress', 'completed'].includes(v.status)) {
        caregiverWorkload.set(v.caregiver_id, (caregiverWorkload.get(v.caregiver_id) || 0) + 1);
        if (!caregiverVisitMap.has(v.caregiver_id)) caregiverVisitMap.set(v.caregiver_id, []);
        caregiverVisitMap.get(v.caregiver_id)!.push(v);
      }
    }

    // ─── 1. Best Caregiver Assignments ─────────────────────────────────────

    const unassignedVisits = upcomingVisits.filter((v: any) =>
      !v.caregiver_id && ['open', 'scheduled'].includes(v.status)
    );

    const caregiverAssignments: any[] = [];
    for (const visit of unassignedVisits) {
      const patientZone = PATIENT_ZONE_MAP[visit.patient_id] || 'Midtown';
      const pat = pMap.get(visit.patient_id);
      const candidates: any[] = [];

      for (const cg of activeCaregivers) {
        // 1. Discipline match (required)
        if (cg.discipline !== visit.discipline && !cg.disciplines?.includes(visit.discipline)) continue;

        // 2. Scheduling conflict check
        const cgVisitsOnDate = dateVisits.filter((v: any) =>
          v.caregiver_id === cg.id &&
          v.visit_date === visit.visit_date &&
          ['scheduled', 'confirmed', 'in_progress'].includes(v.status)
        );
        const hasConflict = cgVisitsOnDate.some((v: any) =>
          (visit.start_time >= v.start_time && visit.start_time < v.end_time) ||
          (visit.end_time > v.start_time && visit.end_time <= v.end_time) ||
          (visit.start_time <= v.start_time && visit.end_time >= v.end_time)
        );
        if (hasConflict) continue;

        // 3. Workload capacity
        const currentLoad = caregiverWorkload.get(cg.id) || 0;
        const capacityRemaining = (cg.maxDailyVisits || 6) - currentLoad;
        if (capacityRemaining <= 0) continue;

        // 4. Geographic proximity score (0=same zone, 3=far)
        const proximity = getZoneDistance(cg.zone, patientZone);

        // 5. Composite score (lower is better)
        const proximityScore = proximity * 25;
        const workloadScore = currentLoad * 10;
        const reliabilityScore = (cg.missedVisitRate || 0) * 100;
        const ratingBonus = (5 - (cg.rating || 4)) * 5;
        const totalScore = proximityScore + workloadScore + reliabilityScore + ratingBonus;

        const reasons: string[] = [];
        if (proximity === 0) reasons.push('Same zone as patient');
        else if (proximity === 1) reasons.push('Adjacent zone');
        if (currentLoad === 0) reasons.push('No visits scheduled');
        else if (capacityRemaining >= 3) reasons.push(`Light workload (${currentLoad}/${cg.maxDailyVisits})`);
        if ((cg.missedVisitRate || 0) < 0.03) reasons.push('High reliability');
        if ((cg.rating || 0) >= 4.7) reasons.push('Top-rated');

        candidates.push({
          caregiverId: cg.id,
          caregiverName: cg.name,
          discipline: cg.discipline,
          zone: cg.zone,
          currentDayVisits: currentLoad,
          maxDailyVisits: cg.maxDailyVisits,
          proximityScore: proximity,
          reliabilityScore: Math.round((1 - (cg.missedVisitRate || 0)) * 100),
          rating: cg.rating,
          overallScore: Math.round(100 - totalScore),
          reasons,
        });
      }

      candidates.sort((a: any, b: any) => b.overallScore - a.overallScore);

      if (candidates.length > 0) {
        caregiverAssignments.push({
          visitId: visit.id,
          visitDate: visit.visit_date,
          startTime: visit.start_time,
          endTime: visit.end_time,
          discipline: visit.discipline,
          visitType: visit.visit_type,
          patientName: pat ? `${pat.first_name} ${pat.last_name}` : 'Unknown',
          patientId: visit.patient_id,
          patientZone,
          topCandidates: candidates.slice(0, 3),
        });
      }
    }

    // ─── 2. Travel Optimization ────────────────────────────────────────────

    const travelOptimizations: any[] = [];
    for (const [cgId, visits] of caregiverVisitMap.entries()) {
      if (visits.length < 2) continue;
      const cg = allCaregivers.find((c: any) => c.id === cgId);
      if (!cg) continue;

      const sorted = [...visits].sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
      const zones = sorted.map((v: any) => PATIENT_ZONE_MAP[v.patient_id] || 'Midtown');

      // Compute current total zone distance
      let currentTravelCost = 0;
      // Start from caregiver's home zone
      currentTravelCost += getZoneDistance(cg.zone, zones[0]);
      for (let i = 1; i < zones.length; i++) {
        currentTravelCost += getZoneDistance(zones[i - 1], zones[i]);
      }

      // Try nearest-neighbor reordering
      const reordered: number[] = [];
      const remaining = new Set(sorted.map((_: any, i: number) => i));
      let currentZone = cg.zone;

      while (remaining.size > 0) {
        let bestIdx = -1;
        let bestDist = Infinity;
        for (const idx of remaining) {
          const d = getZoneDistance(currentZone, zones[idx]);
          if (d < bestDist) { bestDist = d; bestIdx = idx; }
        }
        reordered.push(bestIdx);
        currentZone = zones[bestIdx];
        remaining.delete(bestIdx);
      }

      let optimizedTravelCost = getZoneDistance(cg.zone, zones[reordered[0]]);
      for (let i = 1; i < reordered.length; i++) {
        optimizedTravelCost += getZoneDistance(zones[reordered[i - 1]], zones[reordered[i]]);
      }

      const savings = currentTravelCost - optimizedTravelCost;
      if (savings > 0) {
        travelOptimizations.push({
          caregiverId: cgId,
          caregiverName: cg.name,
          currentRoute: sorted.map((v: any, i: number) => ({
            visitId: v.id,
            patientName: pMap.get(v.patient_id) ? `${pMap.get(v.patient_id).first_name} ${pMap.get(v.patient_id).last_name}` : 'Unknown',
            time: v.start_time,
            zone: zones[i],
          })),
          suggestedRoute: reordered.map((idx: number) => ({
            visitId: sorted[idx].id,
            patientName: pMap.get(sorted[idx].patient_id) ? `${pMap.get(sorted[idx].patient_id).first_name} ${pMap.get(sorted[idx].patient_id).last_name}` : 'Unknown',
            time: sorted[idx].start_time,
            zone: zones[idx],
          })),
          currentTravelScore: currentTravelCost,
          optimizedTravelScore: optimizedTravelCost,
          estimatedSavingsMinutes: savings * 12,
        });
      }
    }

    // ─── 3. Visit Risk Alerts ──────────────────────────────────────────────

    const visitRiskAlerts: any[] = [];
    const upcomingScheduled = upcomingVisits.filter((v: any) =>
      ['scheduled', 'confirmed'].includes(v.status) && v.caregiver_id
    );

    for (const visit of upcomingScheduled) {
      const cg = allCaregivers.find((c: any) => c.id === visit.caregiver_id);
      if (!cg) continue;
      const pat = pMap.get(visit.patient_id);

      const riskFactors: string[] = [];
      let riskScore = 0;

      // High missed visit rate
      if ((cg.missedVisitRate || 0) >= 0.05) {
        riskFactors.push(`Caregiver has ${Math.round((cg.missedVisitRate || 0) * 100)}% missed visit rate`);
        riskScore += 30;
      }

      // Low punctuality
      if ((cg.avgPunctuality || 1) < 0.90) {
        riskFactors.push(`Caregiver punctuality: ${Math.round((cg.avgPunctuality || 1) * 100)}%`);
        riskScore += 20;
      }

      // Overloaded caregiver
      const dayLoad = (caregiverWorkload.get(cg.id) || 0);
      if (dayLoad >= (cg.maxDailyVisits || 6)) {
        riskFactors.push(`Caregiver at max capacity (${dayLoad}/${cg.maxDailyVisits} visits)`);
        riskScore += 40;
      } else if (dayLoad >= (cg.maxDailyVisits || 6) - 1) {
        riskFactors.push(`Caregiver near capacity (${dayLoad}/${cg.maxDailyVisits} visits)`);
        riskScore += 15;
      }

      // Previous missed visit with this patient
      const pastMissed = allVisits.filter((v: any) =>
        v.patient_id === visit.patient_id && v.status === 'missed'
      ).length;
      if (pastMissed > 0) {
        riskFactors.push(`Patient has ${pastMissed} previous missed visit(s)`);
        riskScore += 25;
      }

      // Far travel distance
      const patZone = PATIENT_ZONE_MAP[visit.patient_id] || 'Midtown';
      const dist = getZoneDistance(cg.zone, patZone);
      if (dist >= 3) {
        riskFactors.push('Long travel distance between zones');
        riskScore += 15;
      }

      if (riskScore >= 25) {
        visitRiskAlerts.push({
          visitId: visit.id,
          visitDate: visit.visit_date,
          startTime: visit.start_time,
          patientName: pat ? `${pat.first_name} ${pat.last_name}` : 'Unknown',
          patientId: visit.patient_id,
          caregiverName: cg.name,
          caregiverId: cg.id,
          discipline: visit.discipline,
          riskScore: Math.min(100, riskScore),
          riskLevel: riskScore >= 50 ? 'high' : riskScore >= 35 ? 'medium' : 'low',
          riskFactors,
          suggestedAction: riskScore >= 50
            ? 'Consider reassigning to a more reliable caregiver'
            : riskScore >= 35
            ? 'Monitor closely and confirm visit'
            : 'Send reminder notification',
        });
      }
    }
    visitRiskAlerts.sort((a: any, b: any) => b.riskScore - a.riskScore);

    // ─── 4. Open Shift Suggestions ─────────────────────────────────────────

    const openShifts = upcomingVisits.filter((v: any) => v.status === 'open');
    const openShiftSuggestions: any[] = [];

    for (const shift of openShifts) {
      const patZone = PATIENT_ZONE_MAP[shift.patient_id] || 'Midtown';
      const pat = pMap.get(shift.patient_id);
      const candidates: any[] = [];

      for (const cg of activeCaregivers) {
        if (cg.discipline !== shift.discipline && !cg.disciplines?.includes(shift.discipline)) continue;

        // Check availability on that day
        const cgDayVisits = allVisits.filter((v: any) =>
          v.caregiver_id === cg.id &&
          v.visit_date === shift.visit_date &&
          ['scheduled', 'confirmed', 'in_progress'].includes(v.status)
        );
        const hasConflict = cgDayVisits.some((v: any) =>
          (shift.start_time >= v.start_time && shift.start_time < v.end_time) ||
          (shift.end_time > v.start_time && shift.end_time <= v.end_time)
        );
        if (hasConflict) continue;

        const currentLoad = cgDayVisits.length;
        if (currentLoad >= (cg.maxDailyVisits || 6)) continue;

        const proximity = getZoneDistance(cg.zone, patZone);
        candidates.push({
          caregiverId: cg.id,
          caregiverName: cg.name,
          discipline: cg.discipline,
          zone: cg.zone,
          proximity,
          currentDayVisits: currentLoad,
          maxDailyVisits: cg.maxDailyVisits,
          rating: cg.rating,
          notifyPriority: proximity <= 1 ? 'high' : proximity <= 2 ? 'medium' : 'low',
        });
      }

      candidates.sort((a: any, b: any) => a.proximity - b.proximity || (b.rating || 0) - (a.rating || 0));

      openShiftSuggestions.push({
        visitId: shift.id,
        visitDate: shift.visit_date,
        startTime: shift.start_time,
        endTime: shift.end_time,
        discipline: shift.discipline,
        visitType: shift.visit_type,
        patientName: pat ? `${pat.first_name} ${pat.last_name}` : 'Unknown',
        patientZone: patZone,
        suggestedNotifyList: candidates.slice(0, 5),
      });
    }

    // ─── Response ──────────────────────────────────────────────────────────

    return c.json({
      date: targetDate,
      generatedAt: new Date().toISOString(),
      caregiverAssignments,
      travelOptimizations,
      visitRiskAlerts,
      openShiftSuggestions,
      summary: {
        totalSuggestions: caregiverAssignments.length + travelOptimizations.length + visitRiskAlerts.length + openShiftSuggestions.length,
        unassignedVisits: unassignedVisits.length,
        travelOptimizable: travelOptimizations.length,
        atRiskVisits: visitRiskAlerts.length,
        openShifts: openShifts.length,
      },
    });
  } catch (error: any) {
    console.error('[smart-assist] Error computing scheduling intelligence:', error);
    return c.json({ error: `Smart assist failed: ${error.message}` }, 500);
  }
});

// ============================================================================
// NOTIFICATION ENDPOINT
// ============================================================================

app.post('/make-server-845bc545/scheduling/notify', async (c) => {
  try {
    const { visitId, caregiverIds } = await c.req.json();
    if (!visitId || !caregiverIds?.length) {
      return c.json({ error: 'Missing visitId or caregiverIds' }, 400);
    }

    const visit = await kv.get(`visit:${visitId}`);
    if (!visit) return c.json({ error: 'Visit not found' }, 404);

    // Create notification records for each caregiver
    const notifications: any[] = [];
    const now = new Date().toISOString();
    for (const cgId of caregiverIds) {
      const cg = await kv.get(`caregiver:${cgId}`);
      if (!cg) continue;
      const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const notif = {
        id: notifId,
        type: 'open_shift',
        visitId,
        caregiverId: cgId,
        caregiverName: cg.name,
        visitDate: visit.visit_date,
        startTime: visit.start_time,
        endTime: visit.end_time,
        discipline: visit.discipline,
        status: 'sent',
        sentAt: now,
        readAt: null,
        respondedAt: null,
        response: null,
      };
      await kv.set(`schedule-notif:${notifId}`, notif);
      notifications.push(notif);
    }

    console.log(`[scheduling/notify] Sent ${notifications.length} notifications for visit ${visitId}`);
    return c.json({
      success: true,
      notificationsSent: notifications.length,
      notifications,
    });
  } catch (error: any) {
    console.error('[scheduling/notify] Error:', error);
    return c.json({ error: `Failed to send notifications: ${error.message}` }, 500);
  }
});

// ============================================================================
// CAREGIVER PREFERENCE TRACKING
// Tracks coordinator decisions to improve future suggestions.
// ============================================================================

app.post('/make-server-845bc545/scheduling/preference', async (c) => {
  try {
    const { visitId, selectedCaregiverId, suggestedCaregiverId, action, reason } = await c.req.json();
    if (!visitId || !action) {
      return c.json({ error: 'Missing visitId or action' }, 400);
    }

    const prefId = `sched-pref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const pref = {
      id: prefId,
      visitId,
      selectedCaregiverId: selectedCaregiverId || null,
      suggestedCaregiverId: suggestedCaregiverId || null,
      action, // 'accepted', 'overridden', 'dismissed'
      reason: reason || null,
      accepted: action === 'accepted',
      timestamp: new Date().toISOString(),
    };

    await kv.set(`sched-pref:${prefId}`, pref);
    console.log(`[scheduling/preference] Tracked: ${action} for visit ${visitId}`);
    return c.json({ success: true, preference: pref });
  } catch (error: any) {
    console.error('[scheduling/preference] Error:', error);
    return c.json({ error: `Failed to track preference: ${error.message}` }, 500);
  }
});

app.get('/make-server-845bc545/scheduling/preferences/stats', async (c) => {
  try {
    const prefs = (await kv.getByPrefix('sched-pref:')) || [];
    const total = prefs.length;
    const accepted = prefs.filter((p: any) => p.action === 'accepted').length;
    const overridden = prefs.filter((p: any) => p.action === 'overridden').length;
    const dismissed = prefs.filter((p: any) => p.action === 'dismissed').length;
    const acceptanceRate = total > 0 ? Math.round((accepted / total) * 100) : 0;

    return c.json({
      total,
      accepted,
      overridden,
      dismissed,
      acceptanceRate,
    });
  } catch (error: any) {
    console.error('[scheduling/preferences/stats] Error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ============================================================================
// APPLY OPTIMIZED ROUTE
// ============================================================================

app.post('/make-server-845bc545/scheduling/apply-route', async (c) => {
  try {
    const { caregiverId, date, visitOrder } = await c.req.json();
    if (!caregiverId || !date || !visitOrder?.length) {
      return c.json({ error: 'Missing caregiverId, date, or visitOrder' }, 400);
    }

    const now = new Date().toISOString();
    let updatedCount = 0;

    for (const item of visitOrder) {
      const visit = await kv.get(`visit:${item.visitId}`);
      if (!visit) continue;
      if (visit.caregiver_id !== caregiverId) continue;
      if (!['scheduled', 'open', 'confirmed'].includes(visit.status)) continue;

      const updated = {
        ...visit,
        start_time: item.newStartTime,
        end_time: item.newEndTime,
        updated_at: now,
      };
      await kv.set(`visit:${visit.id}`, updated);
      updatedCount++;
    }

    console.log(`[apply-route] Updated ${updatedCount} visits for caregiver ${caregiverId} on ${date}`);
    return c.json({ success: true, updatedCount });
  } catch (error: any) {
    console.error('[apply-route] Error:', error);
    return c.json({ error: `Failed to apply route: ${error.message}` }, 500);
  }
});

// ============================================================================
// CONFLICT DETECTION ENDPOINT
// ============================================================================

app.get('/make-server-845bc545/visits/conflicts', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const allVisits = (await kv.getByPrefix('visit:')) || [];
    const allCaregivers = (await kv.getByPrefix('caregiver:')) || [];
    const patients = (await kv.getByPrefix('patient:')) || [];
    const pMap = new Map(patients.map((p: any) => [p.id, p]));
    const cgMap = new Map(allCaregivers.map((cg: any) => [cg.id, cg]));

    const upcomingVisits = allVisits.filter((v: any) =>
      v.visit_date >= today && !['cancelled'].includes(v.status)
    );
    const conflicts: any[] = [];

    // 1. Overlapping visits
    const caregiverDayMap = new Map<string, any[]>();
    for (const v of upcomingVisits) {
      if (!v.caregiver_id) continue;
      const key = `${v.caregiver_id}|${v.visit_date}`;
      if (!caregiverDayMap.has(key)) caregiverDayMap.set(key, []);
      caregiverDayMap.get(key)!.push(v);
    }
    for (const [, visits] of caregiverDayMap.entries()) {
      if (visits.length < 2) continue;
      visits.sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
      for (let i = 0; i < visits.length - 1; i++) {
        for (let j = i + 1; j < visits.length; j++) {
          const a = visits[i], b = visits[j];
          if (a.end_time > b.start_time) {
            const cg2 = cgMap.get(a.caregiver_id);
            const pA = pMap.get(a.patient_id);
            const pB = pMap.get(b.patient_id);
            conflicts.push({
              id: `overlap-${a.id}-${b.id}`, type: 'overlap', severity: 'high',
              title: 'Overlapping Visits',
              description: `${cg2?.name || 'Unknown'} has overlapping visits: ${pA ? `${pA.first_name} ${pA.last_name}` : '?'} (${a.start_time}–${a.end_time}) and ${pB ? `${pB.first_name} ${pB.last_name}` : '?'} (${b.start_time}–${b.end_time}) on ${a.visit_date}`,
              visitIds: [a.id, b.id], caregiverId: a.caregiver_id, caregiverName: cg2?.name, date: a.visit_date,
              suggestedAction: 'Reschedule one of the visits or assign a different caregiver',
            });
          }
        }
      }
    }

    // 2. Missing caregivers
    const unassigned = upcomingVisits.filter((v: any) => !v.caregiver_id && v.status !== 'cancelled');
    for (const v of unassigned) {
      const pat = pMap.get(v.patient_id);
      conflicts.push({
        id: `missing-cg-${v.id}`, type: 'missing_caregiver', severity: v.visit_date === today ? 'high' : 'medium',
        title: 'Missing Caregiver Assignment',
        description: `${v.discipline} visit for ${pat ? `${pat.first_name} ${pat.last_name}` : '?'} on ${v.visit_date} at ${v.start_time} has no caregiver assigned`,
        visitIds: [v.id], date: v.visit_date, discipline: v.discipline,
        suggestedAction: 'Assign an available caregiver or send open shift notification',
      });
    }

    // 3. Documentation gaps
    const completedNoDocs = allVisits.filter((v: any) =>
      v.status === 'completed' && v.documentation_status !== 'completed' && v.documentation_status !== 'n/a'
    );
    for (const v of completedNoDocs) {
      const pat = pMap.get(v.patient_id);
      const cg2 = cgMap.get(v.caregiver_id);
      conflicts.push({
        id: `doc-gap-${v.id}`, type: 'documentation', severity: v.documentation_status === 'pending' ? 'high' : 'low',
        title: 'Missing Documentation',
        description: `${cg2?.name || '?'}'s visit with ${pat ? `${pat.first_name} ${pat.last_name}` : '?'} on ${v.visit_date} — documentation ${v.documentation_status}`,
        visitIds: [v.id], caregiverId: v.caregiver_id, caregiverName: cg2?.name, date: v.visit_date,
        suggestedAction: 'Follow up with caregiver to complete visit documentation',
      });
    }

    // 4. EVV errors
    const evvErrors = allVisits.filter((v: any) =>
      v.status === 'completed' && (!v.evv_clock_in || !v.evv_clock_out)
    );
    for (const v of evvErrors) {
      const pat = pMap.get(v.patient_id);
      const cg2 = cgMap.get(v.caregiver_id);
      conflicts.push({
        id: `evv-${v.id}`, type: 'evv_error', severity: 'high',
        title: 'EVV Error',
        description: `${cg2?.name || '?'}'s visit with ${pat ? `${pat.first_name} ${pat.last_name}` : '?'} on ${v.visit_date} — missing ${!v.evv_clock_in ? 'clock-in' : 'clock-out'}`,
        visitIds: [v.id], caregiverId: v.caregiver_id, caregiverName: cg2?.name, date: v.visit_date,
        suggestedAction: 'Have caregiver submit manual EVV correction',
      });
    }

    const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    conflicts.sort((a: any, b: any) => {
      const sc = (severityOrder[a.severity] ?? 2) - (severityOrder[b.severity] ?? 2);
      return sc !== 0 ? sc : a.date.localeCompare(b.date);
    });

    return c.json({
      conflicts,
      summary: {
        total: conflicts.length,
        overlapping: conflicts.filter((x: any) => x.type === 'overlap').length,
        missingCaregiver: conflicts.filter((x: any) => x.type === 'missing_caregiver').length,
        documentation: conflicts.filter((x: any) => x.type === 'documentation').length,
        evvErrors: conflicts.filter((x: any) => x.type === 'evv_error').length,
        high: conflicts.filter((x: any) => x.severity === 'high').length,
        medium: conflicts.filter((x: any) => x.severity === 'medium').length,
        low: conflicts.filter((x: any) => x.severity === 'low').length,
      },
    });
  } catch (error: any) {
    console.error('[conflicts] Error:', error);
    return c.json({ error: `Conflict detection failed: ${error.message}` }, 500);
  }
});

export default app;