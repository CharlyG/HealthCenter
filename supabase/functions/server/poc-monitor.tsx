/**
 * POC Monitor Server Routes
 * Provides endpoints for visit monitoring, EVV error tracking,
 * conflict detection, and resolution actions.
 */
import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

const PREFIX = '/make-server-845bc545';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getAllVisits(): Promise<any[]> {
  const raw = await kv.getByPrefix('visit:');
  return (raw || []).filter((v: any) => v && v.id);
}

async function getAllPatients(): Promise<Map<string, any>> {
  const raw = await kv.getByPrefix('patient:');
  const map = new Map<string, any>();
  for (const p of (raw || [])) {
    if (p && p.id) map.set(p.id, p);
  }
  return map;
}

async function getAllCaregivers(): Promise<Map<string, any>> {
  const raw = await kv.getByPrefix('caregiver:');
  const map = new Map<string, any>();
  for (const c of (raw || [])) {
    if (c && c.id) map.set(c.id, c);
  }
  return map;
}

function computeEvvStatus(visit: any): string {
  if (visit.evv_status === 'exception' || visit.evv_error_code) return 'evv_error';
  if (visit.evv_status === 'transmitted' || visit.evv_transmitted) return 'transmitted';
  if (visit.evv_status === 'verified') return 'transmitted';
  if (visit.evv_clock_out || visit.evvClockOut) return 'transmitted';
  if (visit.evv_clock_in || visit.evvClockIn) return 'clocked_in';
  return 'pending';
}

function computeDocStatus(visit: any): string {
  return visit.documentation_status || visit.doc_status || 'n/a';
}

function computeVisitStatus(visit: any): string {
  // Check for missing clock out (clocked in > 4 hours ago without clock out)
  const clockIn = visit.evv_clock_in || visit.evvClockIn;
  const clockOut = visit.evv_clock_out || visit.evvClockOut;
  if (clockIn && !clockOut && visit.status === 'in_progress') {
    const hoursAgo = (Date.now() - new Date(clockIn).getTime()) / (1000 * 60 * 60);
    if (hoursAgo > 4) return 'missing_clock_out';
  }
  return visit.status || 'scheduled';
}

// ─── GET /poc/monitor/visits — Monitoring visit list ────────────────────────

app.get(`${PREFIX}/poc/monitor/visits`, async (c) => {
  try {
    const date = c.req.query('date') || new Date().toISOString().split('T')[0];
    const statusFilter = c.req.query('status'); // comma-separated
    const evvFilter = c.req.query('evv_status'); // comma-separated

    const allVisits = await getAllVisits();
    const patients = await getAllPatients();
    const caregivers = await getAllCaregivers();

    // Filter by date
    let filtered = allVisits.filter((v: any) => {
      const vDate = v.visit_date || v.visitDate || v.scheduled_date;
      return vDate === date;
    });

    // Enrich with patient/caregiver names
    const enriched = filtered.map((v: any) => {
      const patientId = v.patient_id || v.patientId;
      const caregiverId = v.caregiver_id || v.caregiverId;
      const patient = patients.get(patientId);
      const caregiver = caregivers.get(caregiverId);

      const evvStatus = computeEvvStatus(v);
      const docStatus = computeDocStatus(v);
      const visitStatus = computeVisitStatus(v);

      // Detect conflicts
      const conflicts: string[] = [];
      if (visitStatus === 'missing_clock_out') conflicts.push('missing_clock_out');
      if (v.authorization_remaining === 0) conflicts.push('authorization_conflict');
      if (!v.caregiver_id && !v.caregiverId && v.status !== 'open') conflicts.push('unscheduled_visit');

      return {
        id: v.id,
        patientId,
        patientName: patient ? `${patient.last_name || patient.lastName}, ${patient.first_name || patient.firstName}` : `Patient ${patientId}`,
        patientMrn: patient ? (patient.mrn || patient.medical_record_number || '') : '',
        admissionId: v.admission_id || v.admissionId || '',
        admissionLabel: v.admission_id || v.admissionId || '',
        caregiverId: caregiverId || '',
        caregiverName: caregiver ? `${caregiver.first_name || caregiver.firstName || ''} ${caregiver.last_name || caregiver.lastName || ''}, ${caregiver.credential || v.discipline || ''}`.trim() : (caregiverId ? `Caregiver ${caregiverId}` : 'Unassigned'),
        discipline: v.discipline || '',
        visitType: v.visit_type || v.visitType || '',
        scheduledDate: v.visit_date || v.visitDate || v.scheduled_date || date,
        scheduledTime: v.start_time || v.startTime || v.scheduled_time || '',
        actualStartTime: v.evv_clock_in ? new Date(v.evv_clock_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) :
                         v.evvClockIn ? new Date(v.evvClockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
        actualEndTime: v.evv_clock_out ? new Date(v.evv_clock_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) :
                       v.evvClockOut ? new Date(v.evvClockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : undefined,
        status: visitStatus,
        evvStatus,
        docStatus,
        conflicts,
        authorizationRemaining: v.authorization_remaining,
        notes: v.notes || '',
      };
    });

    // Apply status filter
    let result = enriched;
    if (statusFilter) {
      const statuses = statusFilter.split(',');
      result = result.filter((v: any) => statuses.includes(v.status));
    }
    if (evvFilter) {
      const evvStatuses = evvFilter.split(',');
      result = result.filter((v: any) => evvStatuses.includes(v.evvStatus));
    }

    // Detect overlapping visits
    const byClinician = new Map<string, any[]>();
    for (const v of result) {
      if (!v.caregiverId) continue;
      if (!byClinician.has(v.caregiverId)) byClinician.set(v.caregiverId, []);
      byClinician.get(v.caregiverId)!.push(v);
    }
    for (const [_cid, visits] of byClinician) {
      if (visits.length < 2) continue;
      visits.sort((a: any, b: any) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
      for (let i = 0; i < visits.length - 1; i++) {
        const current = visits[i];
        const next = visits[i + 1];
        // Simple overlap check: if next starts before current ends (assuming 1hr visits)
        const [ch, cm] = (current.scheduledTime || '00:00').split(':').map(Number);
        const [nh, nm] = (next.scheduledTime || '00:00').split(':').map(Number);
        const currentEnd = ch * 60 + cm + 60; // assume 1hr
        const nextStart = nh * 60 + nm;
        if (nextStart < currentEnd) {
          if (!current.conflicts.includes('overlapping_visits')) current.conflicts.push('overlapping_visits');
          if (!next.conflicts.includes('overlapping_visits')) next.conflicts.push('overlapping_visits');
        }
      }
    }

    return c.json({
      data: result,
      meta: {
        total: result.length,
        date,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.log('[poc-monitor] Error fetching visits:', error?.message);
    return c.json({ error: 'Failed to fetch monitoring visits', details: error?.message }, 500);
  }
});

// ─── GET /poc/monitor/evv-errors — EVV error list ───────────────────────────

app.get(`${PREFIX}/poc/monitor/evv-errors`, async (c) => {
  try {
    const errors = await kv.getByPrefix('evv-error:');
    return c.json({
      data: (errors || []).sort((a: any, b: any) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return (severityOrder[a.severity as keyof typeof severityOrder] || 2) -
               (severityOrder[b.severity as keyof typeof severityOrder] || 2);
      }),
    });
  } catch (error: any) {
    console.log('[poc-monitor] Error fetching EVV errors:', error?.message);
    return c.json({ error: 'Failed to fetch EVV errors', details: error?.message }, 500);
  }
});

// ─── POST /poc/monitor/evv-errors/:id/resend — Resend EVV ───────────────────

app.post(`${PREFIX}/poc/monitor/evv-errors/:id/resend`, async (c) => {
  try {
    const errorId = c.req.param('id');
    const error = await kv.get(`evv-error:${errorId}`);
    if (!error) return c.json({ error: 'EVV error not found' }, 404);

    // Update the visit's EVV status
    const visitId = error.visit_id;
    const visit = await kv.get(`visit:${visitId}`);
    if (visit) {
      visit.evv_status = 'transmitted';
      visit.evv_transmitted = true;
      visit.evv_transmitted_at = new Date().toISOString();
      visit.updated_at = new Date().toISOString();
      await kv.set(`visit:${visitId}`, visit);
    }

    // Remove the error record
    await kv.del(`evv-error:${errorId}`);

    // Log the resolution
    await kv.set(`evv-resolution:${errorId}`, {
      errorId,
      visitId,
      action: 'resend',
      resolvedAt: new Date().toISOString(),
      status: 'transmitted',
    });

    return c.json({
      success: true,
      transmissionId: `TX-${Date.now()}`,
      message: `EVV retransmitted for visit ${visitId}`,
    });
  } catch (error: any) {
    console.log('[poc-monitor] Error resending EVV:', error?.message);
    return c.json({ error: 'Failed to resend EVV', details: error?.message }, 500);
  }
});

// ─── POST /poc/monitor/evv-errors/bulk-resend — Bulk resend EVV ─────────────

app.post(`${PREFIX}/poc/monitor/evv-errors/bulk-resend`, async (c) => {
  try {
    const body = await c.req.json();
    const errorIds: string[] = body.errorIds || [];
    if (errorIds.length === 0) return c.json({ error: 'No error IDs provided' }, 400);

    let successCount = 0;
    for (const errorId of errorIds) {
      const error = await kv.get(`evv-error:${errorId}`);
      if (!error) continue;

      const visitId = error.visit_id;
      const visit = await kv.get(`visit:${visitId}`);
      if (visit) {
        visit.evv_status = 'transmitted';
        visit.evv_transmitted = true;
        visit.evv_transmitted_at = new Date().toISOString();
        visit.updated_at = new Date().toISOString();
        await kv.set(`visit:${visitId}`, visit);
      }

      await kv.del(`evv-error:${errorId}`);
      await kv.set(`evv-resolution:${errorId}`, {
        errorId,
        visitId,
        action: 'bulk_resend',
        resolvedAt: new Date().toISOString(),
        status: 'transmitted',
      });
      successCount++;
    }

    return c.json({
      success: true,
      processed: successCount,
      total: errorIds.length,
      message: `${successCount} EVV errors retransmitted`,
    });
  } catch (error: any) {
    console.log('[poc-monitor] Error bulk resending:', error?.message);
    return c.json({ error: 'Failed to bulk resend', details: error?.message }, 500);
  }
});

// ─── PUT /poc/monitor/visits/:id — Update visit details ─────────────────────

app.put(`${PREFIX}/poc/monitor/visits/:id`, async (c) => {
  try {
    const visitId = c.req.param('id');
    const body = await c.req.json();
    const visit = await kv.get(`visit:${visitId}`);
    if (!visit) return c.json({ error: 'Visit not found' }, 404);

    // Update allowed fields
    const allowed = ['start_time', 'end_time', 'evv_clock_in', 'evv_clock_out',
                     'caregiver_id', 'notes', 'status', 'documentation_status'];
    for (const key of allowed) {
      if (body[key] !== undefined) visit[key] = body[key];
    }
    visit.updated_at = new Date().toISOString();

    await kv.set(`visit:${visitId}`, visit);

    // Audit log
    await kv.set(`audit:poc-edit:${visitId}:${Date.now()}`, {
      visitId,
      changes: body,
      editedAt: new Date().toISOString(),
      editedBy: body.edited_by || 'system',
    });

    return c.json({ success: true, data: visit });
  } catch (error: any) {
    console.log('[poc-monitor] Error updating visit:', error?.message);
    return c.json({ error: 'Failed to update visit', details: error?.message }, 500);
  }
});

// ─── POST /poc/monitor/visits/:id/reassign — Reassign caregiver ─────────────

app.post(`${PREFIX}/poc/monitor/visits/:id/reassign`, async (c) => {
  try {
    const visitId = c.req.param('id');
    const body = await c.req.json();
    const { new_caregiver_id, reason } = body;

    if (!new_caregiver_id) return c.json({ error: 'new_caregiver_id is required' }, 400);

    const visit = await kv.get(`visit:${visitId}`);
    if (!visit) return c.json({ error: 'Visit not found' }, 404);

    const oldCaregiverId = visit.caregiver_id || visit.caregiverId;
    visit.caregiver_id = new_caregiver_id;
    visit.caregiverId = new_caregiver_id;
    visit.updated_at = new Date().toISOString();
    await kv.set(`visit:${visitId}`, visit);

    // Audit log
    await kv.set(`audit:poc-reassign:${visitId}:${Date.now()}`, {
      visitId,
      oldCaregiverId,
      newCaregiverId: new_caregiver_id,
      reason,
      reassignedAt: new Date().toISOString(),
    });

    return c.json({ success: true, data: visit });
  } catch (error: any) {
    console.log('[poc-monitor] Error reassigning visit:', error?.message);
    return c.json({ error: 'Failed to reassign visit', details: error?.message }, 500);
  }
});

// ─── GET /poc/monitor/conflicts — Conflict detection ────────────────────────

app.get(`${PREFIX}/poc/monitor/conflicts`, async (c) => {
  try {
    const date = c.req.query('date') || new Date().toISOString().split('T')[0];
    const allVisits = await getAllVisits();

    const todayVisits = allVisits.filter((v: any) => {
      const vDate = v.visit_date || v.visitDate || v.scheduled_date;
      return vDate === date;
    });

    const conflicts: any[] = [];

    // Missing clock out
    for (const v of todayVisits) {
      const clockIn = v.evv_clock_in || v.evvClockIn;
      const clockOut = v.evv_clock_out || v.evvClockOut;
      if (clockIn && !clockOut && v.status === 'in_progress') {
        const hoursAgo = (Date.now() - new Date(clockIn).getTime()) / (1000 * 60 * 60);
        if (hoursAgo > 4) {
          conflicts.push({
            id: `conf-mco-${v.id}`,
            type: 'missing_clock_out',
            severity: 'critical',
            description: `Caregiver clocked in at ${new Date(clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} but has not clocked out after ${Math.round(hoursAgo)}+ hours.`,
            visitIds: [v.id],
            suggestedAction: 'Contact caregiver to confirm visit status and clock out.',
          });
        }
      }
    }

    // Overlapping visits
    const byClinician = new Map<string, any[]>();
    for (const v of todayVisits) {
      const cid = v.caregiver_id || v.caregiverId;
      if (!cid) continue;
      if (!byClinician.has(cid)) byClinician.set(cid, []);
      byClinician.get(cid)!.push(v);
    }
    for (const [cid, visits] of byClinician) {
      if (visits.length < 2) continue;
      visits.sort((a: any, b: any) => (a.start_time || a.startTime || '').localeCompare(b.start_time || b.startTime || ''));
      for (let i = 0; i < visits.length - 1; i++) {
        const curr = visits[i];
        const next = visits[i + 1];
        const currStart = curr.start_time || curr.startTime || '00:00';
        const currEnd = curr.end_time || curr.endTime || currStart;
        const nextStart = next.start_time || next.startTime || '00:00';
        if (nextStart < currEnd) {
          conflicts.push({
            id: `conf-olap-${curr.id}-${next.id}`,
            type: 'overlapping_visits',
            severity: 'warning',
            description: `Caregiver ${cid} has overlapping visits at ${currStart} and ${nextStart}.`,
            visitIds: [curr.id, next.id],
            suggestedAction: 'Reschedule one visit or reassign to another caregiver.',
          });
        }
      }
    }

    // Authorization conflicts
    for (const v of todayVisits) {
      if (v.authorization_remaining === 0) {
        conflicts.push({
          id: `conf-auth-${v.id}`,
          type: 'authorization_conflict',
          severity: 'critical',
          description: `Visit has 0 authorized visits remaining. Requires new authorization.`,
          visitIds: [v.id],
          suggestedAction: 'Request authorization extension before visit occurs.',
        });
      }
    }

    return c.json({ data: conflicts });
  } catch (error: any) {
    console.log('[poc-monitor] Error detecting conflicts:', error?.message);
    return c.json({ error: 'Failed to detect conflicts', details: error?.message }, 500);
  }
});

// ─── GET /poc/monitor/compliance — Compliance analytics data ────────────────

app.get(`${PREFIX}/poc/monitor/compliance`, async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '7');
    const allVisits = await getAllVisits();

    // Build daily metrics for the past N days
    const daily: any[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayVisits = allVisits.filter((v: any) => {
        const vDate = v.visit_date || v.visitDate || v.scheduled_date;
        return vDate === dateStr;
      });

      const completed = dayVisits.filter((v: any) => v.status === 'completed').length;
      const transmitted = dayVisits.filter((v: any) => {
        const es = computeEvvStatus(v);
        return es === 'transmitted';
      }).length;
      const errors = dayVisits.filter((v: any) => {
        const es = computeEvvStatus(v);
        return es === 'evv_error';
      }).length;
      const compliance = completed > 0 ? Math.round((transmitted / completed) * 100) : 100;

      daily.push({ day: dayName, date: dateStr, compliance, errors, transmitted, total: dayVisits.length, completed });
    }

    // Caregiver compliance
    const caregiverMap = new Map<string, { total: number; compliant: number; name: string; discipline: string }>();
    for (const v of allVisits) {
      const cid = v.caregiver_id || v.caregiverId;
      if (!cid) continue;
      if (!caregiverMap.has(cid)) {
        caregiverMap.set(cid, { total: 0, compliant: 0, name: cid, discipline: v.discipline || '' });
      }
      const entry = caregiverMap.get(cid)!;
      if (v.status === 'completed') {
        entry.total++;
        const es = computeEvvStatus(v);
        if (es === 'transmitted') entry.compliant++;
      }
    }

    const caregiverCompliance = Array.from(caregiverMap.values())
      .map(c => ({
        ...c,
        complianceRate: c.total > 0 ? Math.round((c.compliant / c.total) * 100) : 100,
      }))
      .sort((a, b) => b.complianceRate - a.complianceRate);

    return c.json({
      data: {
        daily,
        caregiverCompliance,
        weeklyAvg: daily.length > 0
          ? Math.round(daily.reduce((sum, d) => sum + d.compliance, 0) / daily.length)
          : 100,
      },
    });
  } catch (error: any) {
    console.log('[poc-monitor] Error fetching compliance:', error?.message);
    return c.json({ error: 'Failed to fetch compliance data', details: error?.message }, 500);
  }
});

// ─── Seed EVV error data ────────────────────────────────────────────────────

export async function seedPocMonitorData() {
  const today = new Date().toISOString().split('T')[0];

  const errors = [
    {
      id: 'evv-err-seed-001',
      visit_id: 'visit-seed-005',
      error_code: 'EVV-101',
      error_description: 'GPS coordinates outside patient service address radius (1.2 mi from registered address)',
      suggested_fix: 'Verify visit occurred at an alternate approved location, or update patient address.',
      severity: 'high',
      occurred_at: `${today}T09:10:00.000Z`,
      retry_count: 1,
    },
    {
      id: 'evv-err-seed-002',
      visit_id: 'visit-seed-007',
      error_code: 'EVV-203',
      error_description: 'Clock-out time exceeds authorized visit duration by 45 minutes',
      suggested_fix: 'Adjust clock-out time to match authorized duration, or request auth extension.',
      severity: 'medium',
      occurred_at: `${today}T10:15:00.000Z`,
      retry_count: 0,
    },
  ];

  for (const err of errors) {
    await kv.set(`evv-error:${err.id}`, err);
  }
}

export default app;
