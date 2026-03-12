/**
 * Billing Server Routes
 * Revenue cycle management: queues, pre-billing QA, claims, remittance
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
async function verifyUser(request: Request): Promise<{ userId: string; user: any }> {
  // ✅ Development mode: always return demo user (no auth required)
  return {
    userId: 'demo-user-billing',
    user: { id: 'demo-user-billing', email: 'demo@billing.local', role: 'billing' }
  };
  
  /* Production auth (disabled in demo mode):
  const accessToken = request.headers.get('X-User-Token');
  if (!accessToken) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
  if (error || !user) return null;
  return { userId: user.id, user };
  */
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

// ─── Pagination ───────────────────────────────────────────────────────────────
function parsePagination(query: Record<string, string>) {
  return {
    page: Math.max(1, parseInt(query.page || '1', 10) || 1),
    pageSize: Math.min(100, Math.max(1, parseInt(query.pageSize || '25', 10) || 25)),
    sortBy: query.sortBy || undefined,
    sortOrder: (query.sortOrder === 'asc' || query.sortOrder === 'desc') ? query.sortOrder : 'desc' as const,
  };
}

function paginate<T>(items: T[], params: ReturnType<typeof parsePagination>, defaultSort?: string) {
  let sorted = [...items];
  const sortKey = params.sortBy || defaultSort;
  if (sortKey) {
    sorted.sort((a: any, b: any) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return params.sortOrder === 'asc' ? cmp : -cmp;
    });
  }
  const total = sorted.length;
  const totalPages = Math.ceil(total / params.pageSize);
  const start = (params.page - 1) * params.pageSize;
  return { data: sorted.slice(start, start + params.pageSize), pagination: { total, page: params.page, pageSize: params.pageSize, totalPages } };
}

// ============= SEED DATA =============

export const SEED_BILLING_QUEUES = {
  ready: [
    { id: 'bq-r1', patientName: 'Johnson, Mary', mrn: 'MRN001234', payer: 'Medicare', amount: 4250.00, serviceDate: '2026-02-28', episodeId: 'EP-2026-001', queueType: 'ready' },
    { id: 'bq-r2', patientName: 'Williams, Robert', mrn: 'MRN005678', payer: 'Medicare', amount: 3875.00, serviceDate: '2026-03-01', episodeId: 'EP-2026-002', queueType: 'ready' },
    { id: 'bq-r3', patientName: 'Davis, Patricia', mrn: 'MRN009012', payer: 'Aetna', amount: 2100.00, serviceDate: '2026-02-25', episodeId: 'EP-2026-003', queueType: 'ready' },
    { id: 'bq-r4', patientName: 'Brown, James', mrn: 'MRN003456', payer: 'UnitedHealth', amount: 5600.00, serviceDate: '2026-03-02', episodeId: 'EP-2026-004', queueType: 'ready' },
    { id: 'bq-r5', patientName: 'Garcia, Maria', mrn: 'MRN007890', payer: 'Medicaid', amount: 1890.00, serviceDate: '2026-02-27', episodeId: 'EP-2026-005', queueType: 'ready' },
    { id: 'bq-r6', patientName: 'Martinez, Carlos', mrn: 'MRN002345', payer: 'BlueCross', amount: 3200.00, serviceDate: '2026-03-03', episodeId: 'EP-2026-006', queueType: 'ready' },
    { id: 'bq-r7', patientName: 'Wilson, Linda', mrn: 'MRN006789', payer: 'Medicare', amount: 4500.00, serviceDate: '2026-03-01', episodeId: 'EP-2026-007', queueType: 'ready' },
  ],
  rejected: [
    { id: 'bq-rj1', patientName: 'Anderson, Thomas', mrn: 'MRN004567', payer: 'Medicare', amount: 3200.00, claimNumber: 'CLM-2026-0142', serviceDate: '2026-02-15', reason: 'Missing prior authorization', queueType: 'rejected' },
    { id: 'bq-rj2', patientName: 'Taylor, Susan', mrn: 'MRN008901', payer: 'Aetna', amount: 1875.50, claimNumber: 'CLM-2026-0138', serviceDate: '2026-02-12', reason: 'Invalid diagnosis code', queueType: 'rejected' },
    { id: 'bq-rj3', patientName: 'Thomas, Richard', mrn: 'MRN001357', payer: 'UnitedHealth', amount: 4100.00, claimNumber: 'CLM-2026-0135', serviceDate: '2026-02-10', reason: 'Patient not eligible on date of service', queueType: 'rejected' },
    { id: 'bq-rj4', patientName: 'Moore, Jennifer', mrn: 'MRN002468', payer: 'BlueCross', amount: 2650.00, claimNumber: 'CLM-2026-0131', serviceDate: '2026-02-08', reason: 'Duplicate claim', queueType: 'rejected' },
  ],
  remittance_pending: [
    { id: 'bq-rp1', patientName: 'Jackson, William', mrn: 'MRN003579', payer: 'Medicare', amount: 5200.00, claimNumber: 'CLM-2026-0120', serviceDate: '2026-01-28', daysOutstanding: 37, queueType: 'remittance_pending' },
    { id: 'bq-rp2', patientName: 'White, Elizabeth', mrn: 'MRN004680', payer: 'Medicaid', amount: 2300.00, claimNumber: 'CLM-2026-0118', serviceDate: '2026-01-25', daysOutstanding: 40, queueType: 'remittance_pending' },
    { id: 'bq-rp3', patientName: 'Harris, David', mrn: 'MRN005791', payer: 'Aetna', amount: 3750.00, claimNumber: 'CLM-2026-0115', serviceDate: '2026-01-22', daysOutstanding: 43, queueType: 'remittance_pending' },
  ],
  unpaid: [
    { id: 'bq-u1', patientName: 'Clark, Barbara', mrn: 'MRN006802', payer: 'Medicare', amount: 4800.00, claimNumber: 'CLM-2025-0890', serviceDate: '2025-12-15', daysOutstanding: 81, queueType: 'unpaid' },
    { id: 'bq-u2', patientName: 'Lewis, George', mrn: 'MRN007913', payer: 'UnitedHealth', amount: 6200.00, claimNumber: 'CLM-2025-0878', serviceDate: '2025-12-10', daysOutstanding: 86, queueType: 'unpaid' },
    { id: 'bq-u3', patientName: 'Robinson, Nancy', mrn: 'MRN008024', payer: 'BlueCross', amount: 3100.00, claimNumber: 'CLM-2026-0025', serviceDate: '2026-01-05', daysOutstanding: 60, queueType: 'unpaid' },
    { id: 'bq-u4', patientName: 'Walker, Kenneth', mrn: 'MRN009135', payer: 'Aetna', amount: 2750.00, claimNumber: 'CLM-2026-0040', serviceDate: '2026-01-10', daysOutstanding: 55, queueType: 'unpaid' },
    { id: 'bq-u5', patientName: 'Young, Margaret', mrn: 'MRN010246', payer: 'Medicare', amount: 5100.00, claimNumber: 'CLM-2025-0865', serviceDate: '2025-12-05', daysOutstanding: 91, queueType: 'unpaid' },
  ],
  blockers: [
    { id: 'bq-b1', patientName: 'Allen, Dorothy', mrn: 'MRN011357', payer: 'Medicare', amount: 3800.00, serviceDate: '2026-02-20', blockerType: 'Missing OASIS', queueType: 'blockers' },
    { id: 'bq-b2', patientName: 'King, Paul', mrn: 'MRN012468', payer: 'Medicaid', amount: 2200.00, serviceDate: '2026-02-22', blockerType: 'Plan of Care unsigned', queueType: 'blockers' },
    { id: 'bq-b3', patientName: 'Wright, Ruth', mrn: 'MRN013579', payer: 'Aetna', amount: 4100.00, serviceDate: '2026-02-18', blockerType: 'No first visit completed', queueType: 'blockers' },
    { id: 'bq-b4', patientName: 'Scott, Steven', mrn: 'MRN014680', payer: 'UnitedHealth', amount: 2900.00, serviceDate: '2026-02-24', blockerType: 'Missing authorization', queueType: 'blockers' },
    { id: 'bq-b5', patientName: 'Hill, Sharon', mrn: 'MRN015791', payer: 'Medicare', amount: 3500.00, serviceDate: '2026-02-19', blockerType: 'Missing OASIS', queueType: 'blockers' },
    { id: 'bq-b6', patientName: 'Green, Mark', mrn: 'MRN016802', payer: 'BlueCross', amount: 1800.00, serviceDate: '2026-02-23', blockerType: 'Plan of Care unsigned', queueType: 'blockers' },
  ],
};

export const SEED_PRE_BILLING_QA = [
  {
    id: 'pbqa-1', patientName: 'Johnson, Mary', mrn: 'MRN001234', payer: 'Medicare', episodeStart: '2026-01-15', episodeEnd: '2026-03-15', amount: 4250.00,
    checks: [
      { key: 'oasis', label: 'OASIS Present', passed: true, detail: 'OASIS SOC completed 1/15/2026' },
      { key: 'poc', label: 'Plan of Care Signed', passed: true, detail: 'Signed by Dr. Smith on 1/17/2026' },
      { key: 'first_visit', label: 'First Visit Completed', passed: true, detail: 'SN visit completed 1/15/2026' },
      { key: 'auth', label: 'Authorization Present', passed: true, detail: 'Auth #MA-2026-4521 valid through 3/15/2026' },
    ],
  },
  {
    id: 'pbqa-2', patientName: 'Williams, Robert', mrn: 'MRN005678', payer: 'Medicare', episodeStart: '2026-02-01', episodeEnd: '2026-04-01', amount: 3875.00,
    checks: [
      { key: 'oasis', label: 'OASIS Present', passed: true, detail: 'OASIS SOC completed 2/1/2026' },
      { key: 'poc', label: 'Plan of Care Signed', passed: false, detail: 'Awaiting Dr. Martinez signature' },
      { key: 'first_visit', label: 'First Visit Completed', passed: true, detail: 'PT visit completed 2/1/2026' },
      { key: 'auth', label: 'Authorization Present', passed: true, detail: 'Auth #MA-2026-5102 valid through 4/1/2026' },
    ],
  },
  {
    id: 'pbqa-3', patientName: 'Davis, Patricia', mrn: 'MRN009012', payer: 'Aetna', episodeStart: '2026-02-10', episodeEnd: '2026-04-10', amount: 2100.00,
    checks: [
      { key: 'oasis', label: 'OASIS Present', passed: false, detail: 'OASIS SOC not started' },
      { key: 'poc', label: 'Plan of Care Signed', passed: false, detail: 'POC not created' },
      { key: 'first_visit', label: 'First Visit Completed', passed: true, detail: 'SN visit completed 2/10/2026' },
      { key: 'auth', label: 'Authorization Present', passed: true, detail: 'Auth #AE-2026-0823 valid through 4/10/2026' },
    ],
  },
  {
    id: 'pbqa-4', patientName: 'Brown, James', mrn: 'MRN003456', payer: 'UnitedHealth', episodeStart: '2026-02-15', episodeEnd: '2026-04-15', amount: 5600.00,
    checks: [
      { key: 'oasis', label: 'OASIS Present', passed: true, detail: 'OASIS SOC completed 2/15/2026' },
      { key: 'poc', label: 'Plan of Care Signed', passed: true, detail: 'Signed by Dr. Johnson on 2/17/2026' },
      { key: 'first_visit', label: 'First Visit Completed', passed: false, detail: 'First SN visit scheduled for 3/8/2026' },
      { key: 'auth', label: 'Authorization Present', passed: false, detail: 'Authorization request pending' },
    ],
  },
  {
    id: 'pbqa-5', patientName: 'Garcia, Maria', mrn: 'MRN007890', payer: 'Medicaid', episodeStart: '2026-02-20', episodeEnd: '2026-04-20', amount: 1890.00,
    checks: [
      { key: 'oasis', label: 'OASIS Present', passed: true, detail: 'OASIS SOC completed 2/20/2026' },
      { key: 'poc', label: 'Plan of Care Signed', passed: true, detail: 'Signed by Dr. Lee on 2/22/2026' },
      { key: 'first_visit', label: 'First Visit Completed', passed: true, detail: 'SN visit completed 2/20/2026' },
      { key: 'auth', label: 'Authorization Present', passed: true, detail: 'Auth #MC-2026-1247 valid through 4/20/2026' },
    ],
  },
  {
    id: 'pbqa-6', patientName: 'Martinez, Carlos', mrn: 'MRN002345', payer: 'BlueCross', episodeStart: '2026-02-25', episodeEnd: '2026-04-25', amount: 3200.00,
    checks: [
      { key: 'oasis', label: 'OASIS Present', passed: false, detail: 'OASIS SOC in progress' },
      { key: 'poc', label: 'Plan of Care Signed', passed: false, detail: 'Awaiting Dr. Chen signature' },
      { key: 'first_visit', label: 'First Visit Completed', passed: false, detail: 'No visits completed yet' },
      { key: 'auth', label: 'Authorization Present', passed: false, detail: 'Authorization not requested' },
    ],
  },
];

export const SEED_CLAIMS = [
  { id: 'clm-1', claimNumber: 'CLM-2026-0201', patientName: 'Johnson, Mary', mrn: 'MRN001234', payer: 'Medicare', claimType: 'initial', status: 'paid', billedAmount: 4250.00, paidAmount: 4250.00, serviceFrom: '2026-01-15', serviceTo: '2026-01-29', submittedDate: '2026-02-01', paidDate: '2026-02-28', episodeId: 'EP-001' },
  { id: 'clm-2', claimNumber: 'CLM-2026-0202', patientName: 'Williams, Robert', mrn: 'MRN005678', payer: 'Medicare', claimType: 'initial', status: 'submitted', billedAmount: 3875.00, serviceFrom: '2026-02-01', serviceTo: '2026-02-15', submittedDate: '2026-02-18', episodeId: 'EP-002' },
  { id: 'clm-3', claimNumber: 'CLM-2026-0203', patientName: 'Davis, Patricia', mrn: 'MRN009012', payer: 'Aetna', claimType: 'rap', status: 'rejected', billedAmount: 2100.00, serviceFrom: '2026-02-10', serviceTo: '2026-02-24', submittedDate: '2026-02-26', rejectionReason: 'Missing prior authorization', episodeId: 'EP-003' },
  { id: 'clm-4', claimNumber: 'CLM-2026-0204', patientName: 'Brown, James', mrn: 'MRN003456', payer: 'UnitedHealth', claimType: 'initial', status: 'accepted', billedAmount: 5600.00, serviceFrom: '2026-02-15', serviceTo: '2026-03-01', submittedDate: '2026-03-03', episodeId: 'EP-004' },
  { id: 'clm-5', claimNumber: 'CLM-2026-0205', patientName: 'Garcia, Maria', mrn: 'MRN007890', payer: 'Medicaid', claimType: 'final', status: 'partial', billedAmount: 1890.00, paidAmount: 1450.00, serviceFrom: '2026-01-20', serviceTo: '2026-02-03', submittedDate: '2026-02-05', paidDate: '2026-03-01', episodeId: 'EP-005' },
  { id: 'clm-6', claimNumber: 'CLM-2026-0206', patientName: 'Martinez, Carlos', mrn: 'MRN002345', payer: 'BlueCross', claimType: 'recert', status: 'draft', billedAmount: 3200.00, serviceFrom: '2026-03-01', serviceTo: '2026-03-15', episodeId: 'EP-006' },
  { id: 'clm-7', claimNumber: 'CLM-2026-0207', patientName: 'Wilson, Linda', mrn: 'MRN006789', payer: 'Medicare', claimType: 'initial', status: 'paid', billedAmount: 4500.00, paidAmount: 4500.00, serviceFrom: '2026-01-10', serviceTo: '2026-01-24', submittedDate: '2026-01-26', paidDate: '2026-02-20', episodeId: 'EP-007' },
  { id: 'clm-8', claimNumber: 'CLM-2026-0208', patientName: 'Anderson, Thomas', mrn: 'MRN004567', payer: 'Medicare', claimType: 'rap', status: 'submitted', billedAmount: 3200.00, serviceFrom: '2026-02-20', serviceTo: '2026-03-06', submittedDate: '2026-03-06', episodeId: 'EP-008' },
  { id: 'clm-9', claimNumber: 'CLM-2026-0209', patientName: 'Taylor, Susan', mrn: 'MRN008901', payer: 'Aetna', claimType: 'initial', status: 'voided', billedAmount: 1875.50, serviceFrom: '2026-01-05', serviceTo: '2026-01-19', submittedDate: '2026-01-21', episodeId: 'EP-009' },
  { id: 'clm-10', claimNumber: 'CLM-2026-0210', patientName: 'Thomas, Richard', mrn: 'MRN001357', payer: 'UnitedHealth', claimType: 'final', status: 'paid', billedAmount: 4100.00, paidAmount: 3800.00, serviceFrom: '2026-01-15', serviceTo: '2026-01-29', submittedDate: '2026-02-01', paidDate: '2026-02-25', episodeId: 'EP-010' },
];

export const SEED_REMITTANCE_FILES = [
  { id: 'rf-1', fileName: 'ERA_Medicare_20260305.835', payer: 'Medicare', uploadDate: '2026-03-05', totalAmount: 42500.00, transactionCount: 12, matchedCount: 10, status: 'complete' },
  { id: 'rf-2', fileName: 'ERA_Aetna_20260304.835', payer: 'Aetna', uploadDate: '2026-03-04', totalAmount: 18750.00, transactionCount: 8, matchedCount: 8, status: 'complete' },
  { id: 'rf-3', fileName: 'ERA_BlueCross_20260303.835', payer: 'BlueCross', uploadDate: '2026-03-03', totalAmount: 29300.00, transactionCount: 15, matchedCount: 12, status: 'errors' },
  { id: 'rf-4', fileName: 'ERA_UnitedHealth_20260302.835', payer: 'UnitedHealth', uploadDate: '2026-03-02', totalAmount: 35100.00, transactionCount: 10, matchedCount: 10, status: 'complete' },
];

export const SEED_REMITTANCE_TXNS = [
  { id: 'rtx-1', fileId: 'rf-1', claimNumber: 'CLM-2026-0201', patientName: 'Johnson, Mary', payer: 'Medicare', billedAmount: 4250.00, paidAmount: 4250.00, adjustmentAmount: 0, checkNumber: 'CK-88201', paymentDate: '2026-03-05', matchStatus: 'matched', matchedClaimId: 'clm-1' },
  { id: 'rtx-2', fileId: 'rf-1', claimNumber: 'CLM-2026-0207', patientName: 'Wilson, Linda', payer: 'Medicare', billedAmount: 4500.00, paidAmount: 4500.00, adjustmentAmount: 0, checkNumber: 'CK-88201', paymentDate: '2026-03-05', matchStatus: 'matched', matchedClaimId: 'clm-7' },
  { id: 'rtx-3', fileId: 'rf-1', claimNumber: 'CLM-2026-0210', patientName: 'Thomas, Richard', payer: 'Medicare', billedAmount: 4100.00, paidAmount: 3800.00, adjustmentAmount: 300.00, adjustmentReason: 'CO-45 Contractual Obligation', checkNumber: 'CK-88201', paymentDate: '2026-03-05', matchStatus: 'partial', matchedClaimId: 'clm-10' },
  { id: 'rtx-4', fileId: 'rf-1', claimNumber: 'CLM-2026-0215', patientName: 'Moore, Jennifer', payer: 'Medicare', billedAmount: 3200.00, paidAmount: 3200.00, adjustmentAmount: 0, checkNumber: 'CK-88201', paymentDate: '2026-03-05', matchStatus: 'matched' },
  { id: 'rtx-5', fileId: 'rf-1', claimNumber: 'CLM-2026-0218', patientName: 'Jackson, William', payer: 'Medicare', billedAmount: 5200.00, paidAmount: 0, adjustmentAmount: 5200.00, adjustmentReason: 'CO-4 Procedure not consistent with diagnosis', checkNumber: 'CK-88201', paymentDate: '2026-03-05', matchStatus: 'adjustment' },
  { id: 'rtx-6', fileId: 'rf-3', claimNumber: 'CLM-2026-0225', patientName: 'Harris, David', payer: 'BlueCross', billedAmount: 3750.00, paidAmount: 3750.00, adjustmentAmount: 0, checkNumber: 'CK-77501', paymentDate: '2026-03-03', matchStatus: 'unmatched' },
  { id: 'rtx-7', fileId: 'rf-3', claimNumber: 'CLM-2026-0228', patientName: 'Clark, Barbara', payer: 'BlueCross', billedAmount: 2800.00, paidAmount: 2100.00, adjustmentAmount: 700.00, adjustmentReason: 'PR-1 Patient Responsibility', checkNumber: 'CK-77501', paymentDate: '2026-03-03', matchStatus: 'unmatched' },
  { id: 'rtx-8', fileId: 'rf-3', claimNumber: 'CLM-2026-0231', patientName: 'Lewis, George', payer: 'BlueCross', billedAmount: 4200.00, paidAmount: 4200.00, adjustmentAmount: 0, checkNumber: 'CK-77502', paymentDate: '2026-03-03', matchStatus: 'matched' },
];

// ─── Seed runner ──────────────────────────────────────────────────────────────
export async function seedBillingData() {
  console.log('[billing-seed] Seeding billing data...');
  for (const [_queueType, items] of Object.entries(SEED_BILLING_QUEUES)) {
    for (const item of items) {
      await kv.set(`billing-queue:${item.id}`, item);
    }
  }
  for (const qa of SEED_PRE_BILLING_QA) {
    await kv.set(`billing-qa:${qa.id}`, qa);
  }
  for (const claim of SEED_CLAIMS) {
    await kv.set(`billing-claim:${claim.id}`, claim);
  }
  for (const file of SEED_REMITTANCE_FILES) {
    await kv.set(`billing-remit-file:${file.id}`, file);
  }
  for (const txn of SEED_REMITTANCE_TXNS) {
    await kv.set(`billing-remit-txn:${txn.id}`, txn);
  }
  console.log('[billing-seed] Billing data seeded');
}

// ============= ROUTES =============

// ─── Billing Metrics (dashboard) ──────────────────────────────────────────────
app.get('/make-server-845bc545/billing/metrics', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const queues = await kv.getByPrefix('billing-queue:') || [];
    const claims = await kv.getByPrefix('billing-claim:') || [];
    const ready = queues.filter((q: any) => q.queueType === 'ready');
    const rejected = queues.filter((q: any) => q.queueType === 'rejected');
    const unpaid = queues.filter((q: any) => q.queueType === 'unpaid');
    const blockers = queues.filter((q: any) => q.queueType === 'blockers');
    const remPending = queues.filter((q: any) => q.queueType === 'remittance_pending');
    const totalBilled = claims.reduce((s: number, c: any) => s + (c.billedAmount || 0), 0);
    const totalPaid = claims.reduce((s: number, c: any) => s + (c.paidAmount || 0), 0);
    return c.json({
      readyCount: ready.length, readyAmount: ready.reduce((s: number, i: any) => s + i.amount, 0),
      rejectedCount: rejected.length, rejectedAmount: rejected.reduce((s: number, i: any) => s + i.amount, 0),
      unpaidCount: unpaid.length, unpaidAmount: unpaid.reduce((s: number, i: any) => s + i.amount, 0),
      blockerCount: blockers.length, blockerAmount: blockers.reduce((s: number, i: any) => s + i.amount, 0),
      remPendingCount: remPending.length, remPendingAmount: remPending.reduce((s: number, i: any) => s + i.amount, 0),
      totalClaims: claims.length, totalBilled, totalPaid,
    });
  } catch (err: any) {
    console.log('[billing] Metrics error:', err?.message);
    return c.json({ error: 'Failed to fetch billing metrics', details: err?.message }, 500);
  }
});

// ─── Billing Queues ───────────────────────────────────────────────────────────
app.get('/make-server-845bc545/billing/queues', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const query = c.req.query();
    const { search, queueType } = query;
    const pg = parsePagination(query);
    let items = await kv.getByPrefix('billing-queue:') || [];
    if (queueType && queueType !== 'all') items = items.filter((i: any) => i.queueType === queueType);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((i: any) => i.patientName?.toLowerCase().includes(q) || i.mrn?.toLowerCase().includes(q) || i.payer?.toLowerCase().includes(q) || i.claimNumber?.toLowerCase().includes(q));
    }
    const result = paginate(items, pg, 'amount');
    return c.json({ items: result.data, pagination: result.pagination });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch billing queues', details: err?.message }, 500);
  }
});

// Generate claim from queue item (move ready -> claim)
app.post('/make-server-845bc545/billing/queues/:id/generate', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const id = c.req.param('id');
    const item = await kv.get(`billing-queue:${id}`);
    if (!item) return c.json({ error: 'Queue item not found' }, 404);
    // Create claim
    const claimId = `clm-${Date.now()}`;
    const claim = {
      id: claimId, claimNumber: `CLM-2026-${String(Date.now()).slice(-4)}`,
      patientName: (item as any).patientName, mrn: (item as any).mrn, payer: (item as any).payer,
      claimType: 'initial', status: 'draft', billedAmount: (item as any).amount,
      serviceFrom: (item as any).serviceDate, serviceTo: (item as any).serviceDate,
      episodeId: (item as any).episodeId, createdAt: new Date().toISOString(),
    };
    await kv.set(`billing-claim:${claimId}`, claim);
    await kv.del(`billing-queue:${id}`);
    await createAuditLog(verified.userId, 'GENERATE_CLAIM', 'billing_claim', claimId, null, claim);
    return c.json({ claim });
  } catch (err: any) {
    return c.json({ error: 'Failed to generate claim', details: err?.message }, 500);
  }
});

// Bulk generate
app.post('/make-server-845bc545/billing/queues/generate-all', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const items = await kv.getByPrefix('billing-queue:') || [];
    const readyItems = items.filter((i: any) => i.queueType === 'ready');
    const generated: string[] = [];
    for (const item of readyItems) {
      const claimId = `clm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const claim = {
        id: claimId, claimNumber: `CLM-2026-${String(Date.now()).slice(-4)}`,
        patientName: (item as any).patientName, mrn: (item as any).mrn, payer: (item as any).payer,
        claimType: 'initial', status: 'draft', billedAmount: (item as any).amount,
        serviceFrom: (item as any).serviceDate, serviceTo: (item as any).serviceDate,
        episodeId: (item as any).episodeId, createdAt: new Date().toISOString(),
      };
      await kv.set(`billing-claim:${claimId}`, claim);
      await kv.del(`billing-queue:${(item as any).id}`);
      generated.push(claimId);
    }
    return c.json({ generated, count: generated.length });
  } catch (err: any) {
    return c.json({ error: 'Failed to generate claims', details: err?.message }, 500);
  }
});

// ─── Pre-Billing QA ───────────────────────────────────────────────────────────
app.get('/make-server-845bc545/billing/qa', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const { search, status } = c.req.query();
    let records = await kv.getByPrefix('billing-qa:') || [];
    if (search) {
      const q = search.toLowerCase();
      records = records.filter((r: any) => r.patientName?.toLowerCase().includes(q) || r.mrn?.toLowerCase().includes(q) || r.payer?.toLowerCase().includes(q));
    }
    if (status === 'passed') records = records.filter((r: any) => r.checks?.every((c: any) => c.passed));
    else if (status === 'failed') records = records.filter((r: any) => !r.checks?.every((c: any) => c.passed));
    return c.json({ records });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch QA records', details: err?.message }, 500);
  }
});

app.post('/make-server-845bc545/billing/qa/:id/move-to-claims', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const id = c.req.param('id');
    const qa = await kv.get(`billing-qa:${id}`);
    if (!qa) return c.json({ error: 'QA record not found' }, 404);
    if (!(qa as any).checks?.every((c: any) => c.passed)) return c.json({ error: 'Not all checks passed' }, 400);
    const claimId = `clm-${Date.now()}`;
    const claim = {
      id: claimId, claimNumber: `CLM-2026-${String(Date.now()).slice(-4)}`,
      patientName: (qa as any).patientName, mrn: (qa as any).mrn, payer: (qa as any).payer,
      claimType: 'initial', status: 'draft', billedAmount: (qa as any).amount,
      serviceFrom: (qa as any).episodeStart, serviceTo: (qa as any).episodeEnd,
      createdAt: new Date().toISOString(),
    };
    await kv.set(`billing-claim:${claimId}`, claim);
    await kv.del(`billing-qa:${id}`);
    await createAuditLog(verified.userId, 'MOVE_TO_CLAIMS', 'billing_qa', id, null, claim);
    return c.json({ claim });
  } catch (err: any) {
    return c.json({ error: 'Failed to move to claims', details: err?.message }, 500);
  }
});

// ─── Claims ───────────────────────────────────────────────────────────────────
app.get('/make-server-845bc545/billing/claims', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const query = c.req.query();
    const { search, status, payer } = query;
    const pg = parsePagination(query);
    let claims = await kv.getByPrefix('billing-claim:') || [];
    if (search) {
      const q = search.toLowerCase();
      claims = claims.filter((cl: any) => cl.patientName?.toLowerCase().includes(q) || cl.mrn?.toLowerCase().includes(q) || cl.claimNumber?.toLowerCase().includes(q) || cl.payer?.toLowerCase().includes(q));
    }
    if (status && status !== 'all') claims = claims.filter((cl: any) => cl.status === status);
    if (payer && payer !== 'all') claims = claims.filter((cl: any) => cl.payer === payer);
    const result = paginate(claims, pg, 'claimNumber');
    return c.json({ claims: result.data, pagination: result.pagination });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch claims', details: err?.message }, 500);
  }
});

app.put('/make-server-845bc545/billing/claims/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const id = c.req.param('id');
    const data = await c.req.json();
    const existing = await kv.get(`billing-claim:${id}`);
    if (!existing) return c.json({ error: 'Claim not found' }, 404);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await kv.set(`billing-claim:${id}`, updated);
    await createAuditLog(verified.userId, 'UPDATE', 'billing_claim', id, existing, updated);
    return c.json({ claim: updated });
  } catch (err: any) {
    return c.json({ error: 'Failed to update claim', details: err?.message }, 500);
  }
});

// Submit claim
app.put('/make-server-845bc545/billing/claims/:id/submit', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const id = c.req.param('id');
    const existing = await kv.get(`billing-claim:${id}`);
    if (!existing) return c.json({ error: 'Claim not found' }, 404);
    const updated = { ...existing, status: 'submitted', submittedDate: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString() };
    await kv.set(`billing-claim:${id}`, updated);
    await createAuditLog(verified.userId, 'SUBMIT', 'billing_claim', id, existing, updated);
    return c.json({ claim: updated });
  } catch (err: any) {
    return c.json({ error: 'Failed to submit claim', details: err?.message }, 500);
  }
});

// Void claim
app.put('/make-server-845bc545/billing/claims/:id/void', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const id = c.req.param('id');
    const existing = await kv.get(`billing-claim:${id}`);
    if (!existing) return c.json({ error: 'Claim not found' }, 404);
    const updated = { ...existing, status: 'voided', voidedAt: new Date().toISOString() };
    await kv.set(`billing-claim:${id}`, updated);
    await createAuditLog(verified.userId, 'VOID', 'billing_claim', id, existing, updated);
    return c.json({ claim: updated });
  } catch (err: any) {
    return c.json({ error: 'Failed to void claim', details: err?.message }, 500);
  }
});

// Batch submit
app.post('/make-server-845bc545/billing/claims/batch-submit', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const { ids } = await c.req.json();
    const submitted: string[] = [];
    for (const id of (ids || [])) {
      const existing = await kv.get(`billing-claim:${id}`);
      if (existing && (existing as any).status === 'draft') {
        const updated = { ...existing, status: 'submitted', submittedDate: new Date().toISOString().split('T')[0] };
        await kv.set(`billing-claim:${id}`, updated);
        submitted.push(id);
      }
    }
    return c.json({ submitted, count: submitted.length });
  } catch (err: any) {
    return c.json({ error: 'Failed to batch submit', details: err?.message }, 500);
  }
});

// ─── Remittance ───────────────────────────────────────────────────────────────
app.get('/make-server-845bc545/billing/remittance/files', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const files = await kv.getByPrefix('billing-remit-file:') || [];
    return c.json({ files });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch remittance files', details: err?.message }, 500);
  }
});

app.get('/make-server-845bc545/billing/remittance/transactions', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const { fileId, search } = c.req.query();
    let txns = await kv.getByPrefix('billing-remit-txn:') || [];
    if (fileId) txns = txns.filter((t: any) => t.fileId === fileId);
    if (search) {
      const q = search.toLowerCase();
      txns = txns.filter((t: any) => t.claimNumber?.toLowerCase().includes(q) || t.patientName?.toLowerCase().includes(q) || t.payer?.toLowerCase().includes(q));
    }
    return c.json({ transactions: txns });
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch transactions', details: err?.message }, 500);
  }
});

// Match a transaction to a claim
app.put('/make-server-845bc545/billing/remittance/transactions/:id/match', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const id = c.req.param('id');
    const { claimId } = await c.req.json();
    const txn = await kv.get(`billing-remit-txn:${id}`);
    if (!txn) return c.json({ error: 'Transaction not found' }, 404);
    const updated = { ...txn, matchStatus: 'matched', matchedClaimId: claimId, updatedAt: new Date().toISOString() };
    await kv.set(`billing-remit-txn:${id}`, updated);
    await createAuditLog(verified.userId, 'MATCH', 'billing_remittance_txn', id, txn, updated);
    return c.json({ transaction: updated });
  } catch (err: any) {
    return c.json({ error: 'Failed to match transaction', details: err?.message }, 500);
  }
});

// ─── A/R Aging Report ─────────────────────────────────────────────────────────
app.get('/make-server-845bc545/billing/ar-aging', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const claims = await kv.getByPrefix('billing-claim:') || [];
    const queues = await kv.getByPrefix('billing-queue:') || [];
    const now = new Date();
    const outstandingClaims = claims.filter((cl: any) => ['submitted', 'accepted', 'partial'].includes(cl.status));
    const unpaidQueue = queues.filter((q: any) => ['unpaid', 'remittance_pending'].includes(q.queueType));
    const agingItems: any[] = [];
    for (const cl of outstandingClaims) {
      const submitted = new Date((cl as any).submittedDate || (cl as any).serviceFrom);
      const daysOut = Math.floor((now.getTime() - submitted.getTime()) / 86400000);
      agingItems.push({ id: (cl as any).id, patientName: (cl as any).patientName, mrn: (cl as any).mrn, payer: (cl as any).payer, claimNumber: (cl as any).claimNumber, billedAmount: (cl as any).billedAmount || 0, paidAmount: (cl as any).paidAmount || 0, balance: ((cl as any).billedAmount || 0) - ((cl as any).paidAmount || 0), submittedDate: (cl as any).submittedDate || (cl as any).serviceFrom, daysOutstanding: daysOut, status: (cl as any).status, bucket: daysOut <= 30 ? '0-30' : daysOut <= 60 ? '31-60' : daysOut <= 90 ? '61-90' : '91-120+' });
    }
    for (const q of unpaidQueue) {
      const days = (q as any).daysOutstanding || 45;
      agingItems.push({ id: (q as any).id, patientName: (q as any).patientName, mrn: (q as any).mrn, payer: (q as any).payer, claimNumber: (q as any).claimNumber || 'Pending', billedAmount: (q as any).amount || 0, paidAmount: 0, balance: (q as any).amount || 0, submittedDate: (q as any).serviceDate, daysOutstanding: days, status: (q as any).queueType, bucket: days <= 30 ? '0-30' : days <= 60 ? '31-60' : days <= 90 ? '61-90' : '91-120+' });
    }
    const buckets: Record<string, { count: number; amount: number }> = { '0-30': { count: 0, amount: 0 }, '31-60': { count: 0, amount: 0 }, '61-90': { count: 0, amount: 0 }, '91-120+': { count: 0, amount: 0 } };
    agingItems.forEach(item => { buckets[item.bucket].count++; buckets[item.bucket].amount += item.balance; });
    const payerMap: Record<string, Record<string, number>> = {};
    agingItems.forEach(item => { if (!payerMap[item.payer]) payerMap[item.payer] = { '0-30': 0, '31-60': 0, '61-90': 0, '91-120+': 0, total: 0 }; payerMap[item.payer][item.bucket] += item.balance; payerMap[item.payer].total += item.balance; });
    const payerBreakdown = Object.entries(payerMap).map(([payer, data]) => ({ payer, ...data })).sort((a, b) => b.total - a.total);
    const totalOutstanding = agingItems.reduce((s, i) => s + i.balance, 0);
    const avgDays = agingItems.length > 0 ? Math.round(agingItems.reduce((s, i) => s + i.daysOutstanding, 0) / agingItems.length) : 0;
    return c.json({ items: agingItems.sort((a, b) => b.daysOutstanding - a.daysOutstanding), buckets, payerBreakdown, summary: { totalOutstanding, avgDays, totalItems: agingItems.length } });
  } catch (err: any) {
    console.log('[billing] A/R aging error:', err?.message);
    return c.json({ error: 'Failed to fetch A/R aging', details: err?.message }, 500);
  }
});

// ─── Denial Management ────────────────────────────────────────────────────────
const SEED_DENIALS = [
  { id: 'den-1', claimId: 'clm-3', claimNumber: 'CLM-2026-0203', patientName: 'Davis, Patricia', mrn: 'MRN009012', payer: 'Aetna', billedAmount: 2100.00, denialDate: '2026-02-28', denialCode: 'CO-4', denialReason: 'Missing prior authorization', category: 'authorization', status: 'open', assignedTo: 'Sarah M.', daysOpen: 8, appealDeadline: '2026-03-30', notes: '', priority: 'high' },
  { id: 'den-2', claimId: 'clm-rj1', claimNumber: 'CLM-2026-0142', patientName: 'Anderson, Thomas', mrn: 'MRN004567', payer: 'Medicare', billedAmount: 3200.00, denialDate: '2026-02-20', denialCode: 'CO-16', denialReason: 'Missing prior authorization', category: 'authorization', status: 'appeal_submitted', assignedTo: 'John K.', daysOpen: 16, appealDeadline: '2026-04-20', appealDate: '2026-03-01', appealNotes: 'Auth retroactively obtained, appeal submitted with docs', priority: 'high' },
  { id: 'den-3', claimId: 'clm-rj2', claimNumber: 'CLM-2026-0138', patientName: 'Taylor, Susan', mrn: 'MRN008901', payer: 'Aetna', billedAmount: 1875.50, denialDate: '2026-02-18', denialCode: 'CO-11', denialReason: 'Invalid diagnosis code', category: 'coding', status: 'corrected', assignedTo: 'Lisa R.', daysOpen: 18, appealDeadline: '2026-04-18', correctionDate: '2026-03-05', correctionNotes: 'Updated ICD-10 from I10 to I11.0, resubmitted', priority: 'medium' },
  { id: 'den-4', claimId: 'clm-rj3', claimNumber: 'CLM-2026-0135', patientName: 'Thomas, Richard', mrn: 'MRN001357', payer: 'UnitedHealth', billedAmount: 4100.00, denialDate: '2026-02-15', denialCode: 'CO-27', denialReason: 'Patient not eligible on DOS', category: 'eligibility', status: 'open', assignedTo: 'Sarah M.', daysOpen: 21, appealDeadline: '2026-04-15', notes: 'Verifying eligibility with payer', priority: 'critical' },
  { id: 'den-5', claimId: 'clm-rj4', claimNumber: 'CLM-2026-0131', patientName: 'Moore, Jennifer', mrn: 'MRN002468', payer: 'BlueCross', billedAmount: 2650.00, denialDate: '2026-02-12', denialCode: 'CO-18', denialReason: 'Duplicate claim', category: 'duplicate', status: 'resolved', assignedTo: 'John K.', daysOpen: 0, resolution: 'voided', resolutionDate: '2026-02-25', resolutionNotes: 'Confirmed duplicate, original claim paid', priority: 'low' },
  { id: 'den-6', claimId: 'clm-x1', claimNumber: 'CLM-2026-0180', patientName: 'White, Elizabeth', mrn: 'MRN004680', payer: 'Medicaid', billedAmount: 2300.00, denialDate: '2026-03-01', denialCode: 'N-522', denialReason: 'Documentation does not support level of service', category: 'documentation', status: 'open', assignedTo: 'Lisa R.', daysOpen: 7, appealDeadline: '2026-04-30', notes: 'Requesting clinical notes from field staff', priority: 'high' },
  { id: 'den-7', claimId: 'clm-x2', claimNumber: 'CLM-2026-0175', patientName: 'Harris, David', mrn: 'MRN005791', payer: 'Aetna', billedAmount: 3750.00, denialDate: '2026-02-25', denialCode: 'CO-29', denialReason: 'Time limit for filing has expired', category: 'timely_filing', status: 'appeal_submitted', assignedTo: 'Sarah M.', daysOpen: 11, appealDeadline: '2026-03-25', appealDate: '2026-03-04', appealNotes: 'Submitted proof of timely filing', priority: 'critical' },
  { id: 'den-8', claimId: 'clm-x3', claimNumber: 'CLM-2026-0168', patientName: 'Garcia, Maria', mrn: 'MRN007890', payer: 'Medicaid', billedAmount: 1890.00, denialDate: '2026-02-22', denialCode: 'CO-50', denialReason: 'Non-covered service', category: 'coverage', status: 'open', assignedTo: 'John K.', daysOpen: 14, appealDeadline: '2026-04-22', notes: 'Reviewing coverage policy', priority: 'medium' },
];

app.get('/make-server-845bc545/billing/denials', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    let denials = await kv.getByPrefix('billing-denial:') || [];
    if (denials.length === 0) { for (const d of SEED_DENIALS) { await kv.set(`billing-denial:${d.id}`, d); } denials = SEED_DENIALS; }
    const { search, status, category } = c.req.query();
    if (search) { const q = search.toLowerCase(); denials = denials.filter((d: any) => d.patientName?.toLowerCase().includes(q) || d.claimNumber?.toLowerCase().includes(q) || d.payer?.toLowerCase().includes(q) || d.denialReason?.toLowerCase().includes(q)); }
    if (status && status !== 'all') denials = denials.filter((d: any) => d.status === status);
    if (category && category !== 'all') denials = denials.filter((d: any) => d.category === category);
    const analytics = { total: denials.length, open: denials.filter((d: any) => d.status === 'open').length, appealSubmitted: denials.filter((d: any) => d.status === 'appeal_submitted').length, corrected: denials.filter((d: any) => d.status === 'corrected').length, resolved: denials.filter((d: any) => d.status === 'resolved').length, totalAmount: denials.reduce((s: number, d: any) => s + (d.billedAmount || 0), 0), openAmount: denials.filter((d: any) => d.status !== 'resolved').reduce((s: number, d: any) => s + (d.billedAmount || 0), 0), byCategory: {} as Record<string, { count: number; amount: number }>, byPayer: {} as Record<string, { count: number; amount: number }> };
    denials.forEach((d: any) => { if (!analytics.byCategory[d.category]) analytics.byCategory[d.category] = { count: 0, amount: 0 }; analytics.byCategory[d.category].count++; analytics.byCategory[d.category].amount += d.billedAmount || 0; if (!analytics.byPayer[d.payer]) analytics.byPayer[d.payer] = { count: 0, amount: 0 }; analytics.byPayer[d.payer].count++; analytics.byPayer[d.payer].amount += d.billedAmount || 0; });
    return c.json({ denials, analytics });
  } catch (err: any) { return c.json({ error: 'Failed to fetch denials', details: err?.message }, 500); }
});

app.put('/make-server-845bc545/billing/denials/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const id = c.req.param('id'); const data = await c.req.json();
    const existing = await kv.get(`billing-denial:${id}`);
    if (!existing) return c.json({ error: 'Denial not found' }, 404);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    if (data.status === 'resolved') updated.daysOpen = 0;
    await kv.set(`billing-denial:${id}`, updated);
    await createAuditLog(verified.userId, 'UPDATE_DENIAL', 'billing_denial', id, existing, updated);
    return c.json({ denial: updated });
  } catch (err: any) { return c.json({ error: 'Failed to update denial', details: err?.message }, 500); }
});

// ─── Eligibility Verification ─────────────────────────────────────────────────
const SEED_ELIGIBILITY = [
  { id: 'elig-1', patientName: 'Johnson, Mary', mrn: 'MRN001234', dob: '1945-06-12', payer: 'Medicare', memberId: 'MBI-1EG4-TE5-MK72', planName: 'Medicare Part A', groupNumber: 'N/A', effectiveDate: '2025-01-01', terminationDate: '2026-12-31', copay: 0, coinsurance: 20, deductible: 240, deductibleMet: 240, status: 'active', lastVerified: '2026-03-07T10:30:00Z', admissionId: 'ADM-001', admissionDate: '2026-01-15', homeHealthCovered: true, visitsAuthorized: 60, visitsUsed: 24, authNumber: 'MA-2026-4521', authExpires: '2026-06-15' },
  { id: 'elig-2', patientName: 'Williams, Robert', mrn: 'MRN005678', dob: '1952-03-22', payer: 'Medicare', memberId: 'MBI-2FH5-UF6-NL83', planName: 'Medicare Part A', groupNumber: 'N/A', effectiveDate: '2025-01-01', terminationDate: '2026-12-31', copay: 0, coinsurance: 20, deductible: 240, deductibleMet: 180, status: 'active', lastVerified: '2026-03-06T14:15:00Z', admissionId: 'ADM-002', admissionDate: '2026-02-01', homeHealthCovered: true, visitsAuthorized: 60, visitsUsed: 12, authNumber: 'MA-2026-5102', authExpires: '2026-08-01' },
  { id: 'elig-3', patientName: 'Davis, Patricia', mrn: 'MRN009012', dob: '1968-11-30', payer: 'Aetna', memberId: 'AET-991234567', planName: 'Aetna PPO Gold', groupNumber: 'GRP-45210', effectiveDate: '2026-01-01', terminationDate: '2026-12-31', copay: 30, coinsurance: 15, deductible: 1500, deductibleMet: 750, status: 'active', lastVerified: '2026-03-05T09:00:00Z', admissionId: 'ADM-003', admissionDate: '2026-02-10', homeHealthCovered: true, visitsAuthorized: 36, visitsUsed: 8, authNumber: 'AE-2026-0823', authExpires: '2026-05-10' },
  { id: 'elig-4', patientName: 'Brown, James', mrn: 'MRN003456', dob: '1970-08-15', payer: 'UnitedHealth', memberId: 'UHC-887654321', planName: 'UHC Choice Plus', groupNumber: 'GRP-78900', effectiveDate: '2025-07-01', terminationDate: '2026-06-30', copay: 40, coinsurance: 20, deductible: 2000, deductibleMet: 1200, status: 'active', lastVerified: '2026-03-04T11:45:00Z', admissionId: 'ADM-004', admissionDate: '2026-02-15', homeHealthCovered: true, visitsAuthorized: 0, visitsUsed: 0, authNumber: '', authExpires: '', authPending: true },
  { id: 'elig-5', patientName: 'Garcia, Maria', mrn: 'MRN007890', dob: '1978-04-25', payer: 'Medicaid', memberId: 'MCD-1122334455', planName: 'Medicaid Managed Care', groupNumber: 'N/A', effectiveDate: '2025-10-01', terminationDate: '2026-09-30', copay: 0, coinsurance: 0, deductible: 0, deductibleMet: 0, status: 'active', lastVerified: '2026-03-03T16:20:00Z', admissionId: 'ADM-005', admissionDate: '2026-02-20', homeHealthCovered: true, visitsAuthorized: 48, visitsUsed: 6, authNumber: 'MC-2026-1247', authExpires: '2026-08-20' },
  { id: 'elig-6', patientName: 'Martinez, Carlos', mrn: 'MRN002345', dob: '1955-12-03', payer: 'BlueCross', memberId: 'BCBS-554433221', planName: 'Blue Choice PPO', groupNumber: 'GRP-33210', effectiveDate: '2025-01-01', terminationDate: '2026-12-31', copay: 25, coinsurance: 10, deductible: 1000, deductibleMet: 1000, status: 'expiring', lastVerified: '2026-03-02T08:30:00Z', admissionId: 'ADM-006', admissionDate: '2026-02-25', homeHealthCovered: true, visitsAuthorized: 24, visitsUsed: 2, authNumber: 'BC-2026-7890', authExpires: '2026-03-25' },
  { id: 'elig-7', patientName: 'Scott, Steven', mrn: 'MRN014680', dob: '1960-09-18', payer: 'UnitedHealth', memberId: 'UHC-112233445', planName: 'UHC Choice Plus', groupNumber: 'GRP-78900', effectiveDate: '2025-07-01', terminationDate: '2026-01-31', copay: 40, coinsurance: 20, deductible: 2000, deductibleMet: 500, status: 'inactive', lastVerified: '2026-03-01T13:00:00Z', admissionId: 'ADM-007', admissionDate: '2026-02-24', homeHealthCovered: false, visitsAuthorized: 0, visitsUsed: 0, authNumber: '', authExpires: '' },
  { id: 'elig-8', patientName: 'Wright, Ruth', mrn: 'MRN013579', dob: '1948-02-14', payer: 'Aetna', memberId: 'AET-667788990', planName: 'Aetna Medicare Advantage', groupNumber: 'N/A', effectiveDate: '2026-01-01', terminationDate: '2026-12-31', copay: 0, coinsurance: 15, deductible: 0, deductibleMet: 0, status: 'active', lastVerified: '2026-02-28T10:00:00Z', admissionId: 'ADM-008', admissionDate: '2026-02-18', homeHealthCovered: true, visitsAuthorized: 60, visitsUsed: 14, authNumber: 'AE-2026-1450', authExpires: '2026-06-18' },
];

app.get('/make-server-845bc545/billing/eligibility', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    let records = await kv.getByPrefix('billing-elig:') || [];
    if (records.length === 0) { for (const e of SEED_ELIGIBILITY) { await kv.set(`billing-elig:${e.id}`, e); } records = SEED_ELIGIBILITY; }
    const { search, status } = c.req.query();
    if (search) { const q = search.toLowerCase(); records = records.filter((r: any) => r.patientName?.toLowerCase().includes(q) || r.mrn?.toLowerCase().includes(q) || r.payer?.toLowerCase().includes(q) || r.memberId?.toLowerCase().includes(q)); }
    if (status && status !== 'all') records = records.filter((r: any) => r.status === status);
    const summary = { total: records.length, active: records.filter((r: any) => r.status === 'active').length, expiring: records.filter((r: any) => r.status === 'expiring').length, inactive: records.filter((r: any) => r.status === 'inactive').length, authPending: records.filter((r: any) => r.authPending).length, needsReverification: records.filter((r: any) => { const last = new Date(r.lastVerified || 0); return Math.floor((Date.now() - last.getTime()) / 86400000) > 7; }).length };
    return c.json({ records, summary });
  } catch (err: any) { return c.json({ error: 'Failed to fetch eligibility', details: err?.message }, 500); }
});

app.post('/make-server-845bc545/billing/eligibility/:id/verify', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const id = c.req.param('id');
    const existing = await kv.get(`billing-elig:${id}`);
    if (!existing) return c.json({ error: 'Record not found' }, 404);
    const updated = { ...existing, lastVerified: new Date().toISOString(), status: (existing as any).terminationDate && new Date((existing as any).terminationDate) < new Date() ? 'inactive' : (existing as any).authExpires && new Date((existing as any).authExpires) < new Date(Date.now() + 30 * 86400000) ? 'expiring' : 'active' };
    await kv.set(`billing-elig:${id}`, updated);
    await createAuditLog(verified.userId, 'VERIFY_ELIGIBILITY', 'billing_eligibility', id, existing, updated);
    return c.json({ record: updated, message: 'Eligibility verified' });
  } catch (err: any) { return c.json({ error: 'Failed to verify', details: err?.message }, 500); }
});

app.post('/make-server-845bc545/billing/eligibility/verify-all', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const records = await kv.getByPrefix('billing-elig:') || [];
    let count = 0;
    for (const rec of records) { const r = rec as any; const upd = { ...r, lastVerified: new Date().toISOString(), status: r.terminationDate && new Date(r.terminationDate) < new Date() ? 'inactive' : r.authExpires && new Date(r.authExpires) < new Date(Date.now() + 30 * 86400000) ? 'expiring' : 'active' }; await kv.set(`billing-elig:${r.id}`, upd); count++; }
    return c.json({ updated: count, message: `${count} records verified` });
  } catch (err: any) { return c.json({ error: 'Failed to verify all', details: err?.message }, 500); }
});

// ─── Denial Prevention Engine ─────────────────────────────────────────────────
app.get('/make-server-845bc545/billing/denial-prevention', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const qaRecords = await kv.getByPrefix('billing-qa:') || [];
    let denials = await kv.getByPrefix('billing-denial:') || [];
    if (denials.length === 0) { for (const d of SEED_DENIALS) { await kv.set(`billing-denial:${d.id}`, d); } denials = SEED_DENIALS; }
    const patterns: Record<string, { count: number; amount: number; payers: Record<string, number>; reasons: string[] }> = {};
    denials.forEach((d: any) => {
      if (!patterns[d.category]) patterns[d.category] = { count: 0, amount: 0, payers: {}, reasons: [] };
      patterns[d.category].count++; patterns[d.category].amount += d.billedAmount || 0;
      patterns[d.category].payers[d.payer] = (patterns[d.category].payers[d.payer] || 0) + 1;
      if (!patterns[d.category].reasons.includes(d.denialReason)) patterns[d.category].reasons.push(d.denialReason);
    });
    const checkToDenialCategory: Record<string, string> = { oasis: 'documentation', poc: 'authorization', first_visit: 'documentation', auth: 'authorization' };
    const alerts: any[] = [];
    qaRecords.forEach((qa: any) => {
      const failedChecks = (qa.checks || []).filter((ch: any) => !ch.passed);
      if (failedChecks.length === 0) return;
      let riskScore = 0; const riskFactors: any[] = []; const preventiveActions: string[] = [];
      failedChecks.forEach((ch: any) => {
        const denialCat = checkToDenialCategory[ch.key] || 'documentation';
        const pattern = patterns[denialCat];
        const checkScore = (pattern ? Math.min(40, pattern.count * 10) : 5) + (pattern?.payers[qa.payer] ? 15 : 0);
        riskScore += checkScore;
        riskFactors.push({ checkKey: ch.key, checkLabel: ch.label, checkDetail: ch.detail, denialCategory: denialCat, historicalDenials: pattern?.count || 0, payerSpecificDenials: pattern?.payers[qa.payer] || 0, riskContribution: checkScore, historicalReasons: pattern?.reasons?.slice(0, 3) || [] });
        if (ch.key === 'oasis') preventiveActions.push('Complete and finalize OASIS assessment before claim submission');
        if (ch.key === 'poc') preventiveActions.push('Obtain physician signature on Plan of Care (485)');
        if (ch.key === 'first_visit') preventiveActions.push('Ensure at least one qualifying discipline visit is documented');
        if (ch.key === 'auth') preventiveActions.push('Obtain payer authorization or submit retroactive auth request');
      });
      riskScore = Math.min(100, riskScore);
      alerts.push({ id: `prev-${qa.id}`, patientName: qa.patientName, mrn: qa.mrn, payer: qa.payer, episodeId: qa.id, amount: qa.amount, episodeStart: qa.episodeStart, episodeEnd: qa.episodeEnd, riskScore, riskLevel: riskScore >= 70 ? 'critical' : riskScore >= 40 ? 'high' : riskScore >= 20 ? 'medium' : 'low', failedChecks: failedChecks.length, totalChecks: qa.checks.length, riskFactors, preventiveActions, estimatedDenialProbability: Math.min(95, riskScore + Math.random() * 10), potentialRevenueLoss: qa.amount });
    });
    alerts.sort((a, b) => b.riskScore - a.riskScore);
    const summary = { totalAtRisk: alerts.length, critical: alerts.filter(a => a.riskLevel === 'critical').length, high: alerts.filter(a => a.riskLevel === 'high').length, medium: alerts.filter(a => a.riskLevel === 'medium').length, low: alerts.filter(a => a.riskLevel === 'low').length, totalRevenueAtRisk: alerts.reduce((s, a) => s + a.potentialRevenueLoss, 0), topRiskCategories: Object.entries(patterns).map(([cat, data]) => ({ category: cat, count: data.count, amount: data.amount })).sort((a, b) => b.count - a.count) };
    return c.json({ alerts, patterns, summary });
  } catch (err: any) { console.log('[billing] Denial prevention error:', err?.message); return c.json({ error: 'Failed to run denial prevention', details: err?.message }, 500); }
});

// ─── Payment Variance & Contract Management ──────────────────────────────────
const SEED_CONTRACTS = [
  { id: 'ct-1', payer: 'Medicare', name: 'Medicare PPS Home Health', type: 'prospective', effectiveDate: '2026-01-01', terminationDate: '2026-12-31', reimbursementRate: 1.0, feeSchedule: [{ code: 'LUPA', description: 'Low Utilization Payment Adj.', rate: 185.00 }, { code: 'PEP', description: 'Partial Episode Payment', rate: 0.60 }, { code: 'FULL', description: 'Full Episode (30-day)', rate: 2150.00 }, { code: 'OUTLIER', description: 'Outlier Adjustment', rate: 0.80 }], status: 'active', autoRenew: true, notes: 'CMS standard rates, PDGM model', contactName: 'CMS Regional Office', contactEmail: 'cms-region4@cms.gov', lastReviewDate: '2025-12-15', underpaymentThreshold: 50 },
  { id: 'ct-2', payer: 'Aetna', name: 'Aetna PPO Home Health Agreement', type: 'fee_for_service', effectiveDate: '2025-07-01', terminationDate: '2026-06-30', reimbursementRate: 0.82, feeSchedule: [{ code: 'SN', description: 'Skilled Nursing Visit', rate: 165.00 }, { code: 'PT', description: 'Physical Therapy Visit', rate: 155.00 }, { code: 'OT', description: 'Occupational Therapy Visit', rate: 150.00 }, { code: 'ST', description: 'Speech Therapy Visit', rate: 160.00 }, { code: 'MSW', description: 'Medical Social Worker', rate: 140.00 }, { code: 'HHA', description: 'Home Health Aide', rate: 85.00 }], status: 'active', autoRenew: false, notes: 'Annual negotiation due April 2026', contactName: 'Jane Miller', contactEmail: 'jane.miller@aetna.com', lastReviewDate: '2025-06-20', underpaymentThreshold: 25 },
  { id: 'ct-3', payer: 'UnitedHealth', name: 'UHC Choice Plus HH Agreement', type: 'fee_for_service', effectiveDate: '2025-10-01', terminationDate: '2026-09-30', reimbursementRate: 0.85, feeSchedule: [{ code: 'SN', description: 'Skilled Nursing Visit', rate: 175.00 }, { code: 'PT', description: 'Physical Therapy Visit', rate: 160.00 }, { code: 'OT', description: 'Occupational Therapy Visit', rate: 155.00 }, { code: 'ST', description: 'Speech Therapy Visit', rate: 165.00 }, { code: 'HHA', description: 'Home Health Aide', rate: 90.00 }], status: 'active', autoRenew: true, notes: 'Rate increase 3% effective 10/1/2025', contactName: 'Robert Chen', contactEmail: 'rchen@uhc.com', lastReviewDate: '2025-09-10', underpaymentThreshold: 30 },
  { id: 'ct-4', payer: 'BlueCross', name: 'BCBS Blue Choice PPO', type: 'fee_for_service', effectiveDate: '2025-01-01', terminationDate: '2026-12-31', reimbursementRate: 0.88, feeSchedule: [{ code: 'SN', description: 'Skilled Nursing Visit', rate: 170.00 }, { code: 'PT', description: 'Physical Therapy Visit', rate: 158.00 }, { code: 'OT', description: 'Occupational Therapy Visit', rate: 152.00 }, { code: 'ST', description: 'Speech Therapy Visit', rate: 162.00 }, { code: 'HHA', description: 'Home Health Aide', rate: 88.00 }], status: 'active', autoRenew: true, notes: '2-year agreement', contactName: 'Lisa Park', contactEmail: 'lpark@bcbs.com', lastReviewDate: '2024-12-01', underpaymentThreshold: 35 },
  { id: 'ct-5', payer: 'Medicaid', name: 'State Medicaid Home Health', type: 'fee_for_service', effectiveDate: '2025-07-01', terminationDate: '2026-06-30', reimbursementRate: 0.75, feeSchedule: [{ code: 'SN', description: 'Skilled Nursing Visit', rate: 130.00 }, { code: 'PT', description: 'Physical Therapy Visit', rate: 125.00 }, { code: 'OT', description: 'Occupational Therapy Visit', rate: 120.00 }, { code: 'HHA', description: 'Home Health Aide', rate: 65.00 }], status: 'expiring', autoRenew: false, notes: 'State rates — renewal due May 2026', contactName: 'State Medicaid Office', contactEmail: 'medicaid@state.gov', lastReviewDate: '2025-06-01', underpaymentThreshold: 20 },
];

app.get('/make-server-845bc545/billing/payment-variance', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const claims = await kv.getByPrefix('billing-claim:') || [];
    let contracts = await kv.getByPrefix('billing-contract:') || [];
    if (contracts.length === 0) { for (const ct of SEED_CONTRACTS) { await kv.set(`billing-contract:${ct.id}`, ct); } contracts = SEED_CONTRACTS; }
    const contractMap: Record<string, any> = {}; contracts.forEach((ct: any) => { contractMap[ct.payer] = ct; });
    const paidClaims = claims.filter((cl: any) => cl.paidAmount !== undefined && ['paid', 'partial'].includes(cl.status));
    const variances: any[] = [];
    paidClaims.forEach((cl: any) => {
      const contract = contractMap[cl.payer]; if (!contract) return;
      const rate = contract.reimbursementRate || 0.85; const expected = cl.billedAmount * rate; const actual = cl.paidAmount || 0;
      const variance = actual - expected; const variancePct = expected > 0 ? ((variance / expected) * 100) : 0;
      variances.push({ id: cl.id, claimNumber: cl.claimNumber, patientName: cl.patientName, mrn: cl.mrn, payer: cl.payer, claimType: cl.claimType, serviceFrom: cl.serviceFrom, serviceTo: cl.serviceTo, billedAmount: cl.billedAmount, expectedAmount: Math.round(expected * 100) / 100, actualPaid: actual, variance: Math.round(variance * 100) / 100, variancePct: Math.round(variancePct * 10) / 10, isUnderpaid: variance < -50, contractRate: rate, contractName: contract.name });
    });
    const payerSummary: Record<string, any> = {};
    variances.forEach(v => { if (!payerSummary[v.payer]) payerSummary[v.payer] = { payer: v.payer, claimCount: 0, totalBilled: 0, totalExpected: 0, totalPaid: 0, totalVariance: 0, underpaidCount: 0, contractRate: v.contractRate }; payerSummary[v.payer].claimCount++; payerSummary[v.payer].totalBilled += v.billedAmount; payerSummary[v.payer].totalExpected += v.expectedAmount; payerSummary[v.payer].totalPaid += v.actualPaid; payerSummary[v.payer].totalVariance += v.variance; if (v.isUnderpaid) payerSummary[v.payer].underpaidCount++; });
    const summary = { totalClaims: variances.length, totalBilled: variances.reduce((s, v) => s + v.billedAmount, 0), totalExpected: variances.reduce((s, v) => s + v.expectedAmount, 0), totalPaid: variances.reduce((s, v) => s + v.actualPaid, 0), totalVariance: variances.reduce((s, v) => s + v.variance, 0), underpaidCount: variances.filter(v => v.isUnderpaid).length, underpaidAmount: Math.abs(variances.filter(v => v.isUnderpaid).reduce((s, v) => s + v.variance, 0)), overpaidCount: variances.filter(v => v.variance > 50).length };
    return c.json({ variances: variances.sort((a, b) => a.variance - b.variance), payerSummary: Object.values(payerSummary).sort((a: any, b: any) => a.totalVariance - b.totalVariance), summary });
  } catch (err: any) { console.log('[billing] Payment variance error:', err?.message); return c.json({ error: 'Failed to fetch payment variance', details: err?.message }, 500); }
});

app.get('/make-server-845bc545/billing/contracts', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    let contracts = await kv.getByPrefix('billing-contract:') || [];
    if (contracts.length === 0) { for (const ct of SEED_CONTRACTS) { await kv.set(`billing-contract:${ct.id}`, ct); } contracts = SEED_CONTRACTS; }
    const claims = await kv.getByPrefix('billing-claim:') || [];
    const paidClaims = claims.filter((cl: any) => cl.paidAmount !== undefined && ['paid', 'partial'].includes(cl.status));
    const contractMap: Record<string, any> = {}; contracts.forEach((ct: any) => { contractMap[ct.payer] = ct; });
    const underpayments: any[] = [];
    paidClaims.forEach((cl: any) => {
      const ct = contractMap[cl.payer]; if (!ct) return;
      const expected = cl.billedAmount * (ct.reimbursementRate || 0.85); const actual = cl.paidAmount || 0;
      const diff = actual - expected;
      if (diff < -(ct.underpaymentThreshold || 25)) underpayments.push({ claimId: cl.id, claimNumber: cl.claimNumber, patientName: cl.patientName, payer: cl.payer, billedAmount: cl.billedAmount, expectedAmount: Math.round(expected * 100) / 100, paidAmount: actual, underpayment: Math.round(Math.abs(diff) * 100) / 100, contractName: ct.name, contractRate: ct.reimbursementRate });
    });
    const summary = { totalContracts: contracts.length, active: contracts.filter((c: any) => c.status === 'active').length, expiring: contracts.filter((c: any) => c.status === 'expiring').length, underpaymentCount: underpayments.length, underpaymentTotal: underpayments.reduce((s, u) => s + u.underpayment, 0) };
    return c.json({ contracts, underpayments, summary });
  } catch (err: any) { return c.json({ error: 'Failed to fetch contracts', details: err?.message }, 500); }
});

app.put('/make-server-845bc545/billing/contracts/:id', async (c) => {
  const verified = await verifyUser(c.req.raw);
  try {
    const id = c.req.param('id'); const data = await c.req.json();
    const existing = await kv.get(`billing-contract:${id}`);
    if (!existing) return c.json({ error: 'Contract not found' }, 404);
    const updated = { ...existing, ...data, updatedAt: new Date().toISOString() };
    await kv.set(`billing-contract:${id}`, updated);
    await createAuditLog(verified.userId, 'UPDATE_CONTRACT', 'billing_contract', id, existing, updated);
    return c.json({ contract: updated });
  } catch (err: any) { return c.json({ error: 'Failed to update contract', details: err?.message }, 500); }
});

export default app;
