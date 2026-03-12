/**
 * Payer Integration Backend Routes
 * Handles eligibility, authorizations, claims, ERA, and configuration
 * Now with REAL X12 EDI parsing support
 */
import { Hono } from 'npm:hono';
import type { Context } from 'npm:hono';
import * as kv from './kv_store.tsx';
import { 
  X12Parser, 
  validateX12Format, 
  getTransactionType,
  type X12_270_Request,
  type X12_271_Response,
  type X12_276_Inquiry,
  type X12_277_Response,
  type X12_835_ERA,
  type X12_837_Claim,
} from './x12-parser.tsx';

const app = new Hono();

// Initialize X12 Parser
const x12Parser = new X12Parser();

// ─── Seed Data ─────────────────────────────────────────────────────────────

const SEED_DASHBOARD_STATS = {
  eligibility: {
    verified: 124,
    pending: 8,
    failed: 3,
    lastVerified: '2026-03-11T10:30:00Z',
  },
  authorizations: {
    active: 45,
    pending: 12,
    expiring: 7,
    expired: 3,
  },
  claims: {
    submitted: 89,
    accepted: 76,
    rejected: 5,
    paid: 68,
    totalBilled: 285400,
    totalPaid: 241850,
  },
  era: {
    processed: 23,
    pending: 2,
    totalRemitted: 241850,
    lastProcessed: '2026-03-10T16:45:00Z',
  },
  integration: {
    clearinghouse: 'Change Healthcare',
    status: 'connected' as const,
    lastSync: '2026-03-11T08:00:00Z',
    payersConnected: 8,
  },
};

const SEED_AUTHORIZATIONS = [
  {
    id: 'auth-001',
    authNumber: 'MA-2026-7845',
    patientName: 'Johnson, Mary',
    patientId: 'patient-demo-001',
    mrn: 'MRN001234',
    payer: 'Medicare',
    serviceType: 'Home Health',
    requestedUnits: 60,
    approvedUnits: 60,
    startDate: '2026-01-15',
    endDate: '2026-06-15',
    status: 'approved' as const,
    requestedDate: '2026-01-10T09:00:00Z',
    responseDate: '2026-01-12T14:30:00Z',
    requestedBy: 'Lisa Adams, Auth Coordinator',
    diagnosis: 'I50.9 - Heart failure, unspecified',
    clinicalJustification: 'Patient requires skilled nursing for CHF management, medication education, and cardiac monitoring post-hospitalization.',
    urgency: 'routine' as const,
  },
  {
    id: 'auth-002',
    patientName: 'Williams, Robert',
    patientId: 'patient-demo-002',
    mrn: 'MRN005678',
    payer: 'UnitedHealthcare',
    serviceType: 'Physical Therapy',
    requestedUnits: 24,
    startDate: '2026-02-01',
    endDate: '2026-05-01',
    status: 'pending' as const,
    requestedDate: '2026-03-08T11:00:00Z',
    requestedBy: 'David Martinez, Clinical Coordinator',
    diagnosis: 'M25.561 - Pain in right knee',
    clinicalJustification: 'Post-surgical rehabilitation following total knee replacement. Patient requires PT to regain strength, ROM, and functional mobility.',
    urgency: 'urgent' as const,
  },
  {
    id: 'auth-003',
    authNumber: 'BC-2026-3421',
    patientName: 'Davis, Patricia',
    patientId: 'patient-demo-004',
    mrn: 'MRN009012',
    payer: 'Blue Cross Blue Shield',
    serviceType: 'Skilled Nursing',
    requestedUnits: 45,
    approvedUnits: 30,
    startDate: '2026-02-10',
    endDate: '2026-05-10',
    status: 'partial' as const,
    requestedDate: '2026-02-05T10:00:00Z',
    responseDate: '2026-02-08T15:00:00Z',
    requestedBy: 'Lisa Adams, Auth Coordinator',
    diagnosis: 'E11.65 - Type 2 diabetes with hyperglycemia',
    clinicalJustification: 'Patient requires skilled nursing for diabetes management, insulin administration teaching, and wound care.',
    urgency: 'routine' as const,
    notes: 'Approved for 30 visits initially. Additional visits require re-authorization with progress documentation.',
  },
];

const SEED_CLAIM_STATUS = [
  {
    id: 'claim-001',
    claimNumber: 'CLM-2026-00145',
    patientName: 'Johnson, Mary',
    mrn: 'MRN001234',
    payer: 'Medicare',
    serviceDate: '2026-02-15',
    billedAmount: 4250.00,
    allowedAmount: 3820.50,
    paidAmount: 3056.40,
    adjustmentAmount: 429.50,
    patientResponsibility: 764.10,
    status: 'paid' as const,
    submittedDate: '2026-02-20T10:00:00Z',
    acceptedDate: '2026-02-22T14:30:00Z',
    processedDate: '2026-03-01T09:15:00Z',
    paidDate: '2026-03-05T11:00:00Z',
    clearinghouseId: 'CH-20260220-00145',
    payerClaimId: 'MCR-2026-7734521',
    statusHistory: [
      { status: 'submitted' as const, date: '2026-02-20T10:00:00Z', note: 'Claim submitted to clearinghouse' },
      { status: 'accepted' as const, date: '2026-02-22T14:30:00Z', note: 'Accepted by Medicare' },
      { status: 'in_process' as const, date: '2026-02-25T08:00:00Z', note: 'In adjudication' },
      { status: 'paid' as const, date: '2026-03-05T11:00:00Z', note: 'Payment processed - Check #98765432' },
    ],
  },
  {
    id: 'claim-002',
    claimNumber: 'CLM-2026-00156',
    patientName: 'Williams, Robert',
    mrn: 'MRN005678',
    payer: 'UnitedHealthcare',
    serviceDate: '2026-02-20',
    billedAmount: 3850.00,
    allowedAmount: 3465.00,
    paidAmount: 0,
    adjustmentAmount: 385.00,
    patientResponsibility: 3465.00,
    status: 'denied' as const,
    submittedDate: '2026-02-25T11:00:00Z',
    acceptedDate: '2026-02-27T09:00:00Z',
    processedDate: '2026-03-08T14:00:00Z',
    denialReason: 'Authorization not on file - Services require prior authorization',
    denialCode: 'CO-197',
    clearinghouseId: 'CH-20260225-00156',
    payerClaimId: 'UHC-2026-4521789',
    statusHistory: [
      { status: 'submitted' as const, date: '2026-02-25T11:00:00Z', note: 'Claim submitted to clearinghouse' },
      { status: 'accepted' as const, date: '2026-02-27T09:00:00Z', note: 'Accepted by UnitedHealthcare' },
      { status: 'in_process' as const, date: '2026-03-02T10:00:00Z', note: 'In adjudication' },
      { status: 'denied' as const, date: '2026-03-08T14:00:00Z', note: 'Denied - Authorization not on file' },
    ],
  },
  {
    id: 'claim-003',
    claimNumber: 'CLM-2026-00167',
    patientName: 'Davis, Patricia',
    mrn: 'MRN009012',
    payer: 'Blue Cross Blue Shield',
    serviceDate: '2026-03-01',
    billedAmount: 5120.00,
    status: 'in_process' as const,
    submittedDate: '2026-03-05T09:00:00Z',
    acceptedDate: '2026-03-07T11:30:00Z',
    clearinghouseId: 'CH-20260305-00167',
    payerClaimId: 'BCBS-2026-8832145',
    statusHistory: [
      { status: 'submitted' as const, date: '2026-03-05T09:00:00Z', note: 'Claim submitted to clearinghouse' },
      { status: 'accepted' as const, date: '2026-03-07T11:30:00Z', note: 'Accepted by BCBS' },
      { status: 'in_process' as const, date: '2026-03-09T08:00:00Z', note: 'Currently in adjudication' },
    ],
  },
];

const SEED_ERA_FILES = [
  {
    id: 'era-001',
    fileName: 'ERA_Medicare_20260305.835',
    fileSize: 45620,
    uploadedDate: '2026-03-05T14:30:00Z',
    uploadedBy: 'System - Automated Import',
    status: 'processed' as const,
    payer: 'Medicare',
    checkNumber: '98765432',
    checkDate: '2026-03-05',
    totalAmount: 24585.00,
    claimCount: 8,
    processedDate: '2026-03-05T14:35:00Z',
    transactions: [
      {
        id: 'era-txn-001',
        claimNumber: 'CLM-2026-00145',
        patientName: 'Johnson, Mary',
        serviceDate: '2026-02-15',
        billedAmount: 4250.00,
        allowedAmount: 3820.50,
        paidAmount: 3056.40,
        adjustmentAmount: 429.50,
        patientResponsibility: 764.10,
        adjustments: [
          { code: 'PR-1', group: 'Patient Responsibility', reason: 'Deductible', amount: 240.00 },
          { code: 'PR-2', group: 'Patient Responsibility', reason: 'Coinsurance', amount: 524.10 },
          { code: 'CO-45', group: 'Contractual Obligation', reason: 'Charge exceeds fee schedule', amount: 429.50 },
        ],
      },
    ],
  },
  {
    id: 'era-002',
    fileName: 'ERA_BCBS_20260308.835',
    fileSize: 28450,
    uploadedDate: '2026-03-08T10:15:00Z',
    uploadedBy: 'Sarah Johnson, Billing Manager',
    status: 'pending' as const,
    payer: 'Blue Cross Blue Shield',
    totalAmount: 0,
    claimCount: 0,
  },
];

const SEED_PAYER_CONFIG = {
  clearinghouse: {
    provider: 'change_healthcare' as const,
    apiUrl: 'https://api.changehealthcare.com/v1',
    submitterId: 'HHA-12345',
    username: 'api_user_demo',
    password: '••••••••',
    apiKey: '••••••••••••••••',
    testMode: true,
    status: 'connected' as const,
    lastSync: '2026-03-11T08:00:00Z',
  },
  payers: [
    {
      id: 'payer-001',
      payerName: 'Medicare',
      payerId: 'MCR-NATL',
      eligibilityEnabled: true,
      authorizationEnabled: true,
      claimSubmissionEnabled: true,
      claimStatusEnabled: true,
      eraEnabled: true,
    },
    {
      id: 'payer-002',
      payerName: 'Blue Cross Blue Shield',
      payerId: 'BCBS-12345',
      eligibilityEnabled: true,
      authorizationEnabled: true,
      claimSubmissionEnabled: true,
      claimStatusEnabled: true,
      eraEnabled: true,
    },
    {
      id: 'payer-003',
      payerName: 'UnitedHealthcare',
      payerId: 'UHC-67890',
      eligibilityEnabled: true,
      authorizationEnabled: true,
      claimSubmissionEnabled: true,
      claimStatusEnabled: false,
      eraEnabled: true,
    },
  ],
};

// ─── Routes ────────────────────────────────────────────────────────────────

// Dashboard stats
app.get('/payer/dashboard', async (c: Context) => {
  try {
    return c.json(SEED_DASHBOARD_STATS);
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch dashboard stats', details: err?.message }, 500);
  }
});

// Eligibility verification
app.post('/payer/eligibility/verify', async (c: Context) => {
  try {
    const request = await c.req.json();
    
    // Simulate API call to payer/clearinghouse
    const response = {
      status: 'active' as const,
      coverageActive: true,
      planName: 'Medicare Part A & B',
      groupNumber: 'N/A',
      effectiveDate: '2025-01-01',
      terminationDate: '2026-12-31',
      copay: 0,
      coinsurance: 20,
      deductible: 240,
      deductibleMet: 240,
      oopMax: 8000,
      oopMet: 1450,
      homeHealthCovered: true,
      authorizationRequired: true,
      visitsAuthorized: 60,
      visitLimits: 'Limited to 60 visits per benefit period. Authorization required for services.',
      planDetails: 'Medicare Part A covers home health services when medically necessary. Part B covers outpatient services.',
      responseCode: '001',
      responseMessage: 'Coverage is active and eligible for home health services.',
    };
    
    return c.json(response);
  } catch (err: any) {
    return c.json({ error: 'Failed to verify eligibility', details: err?.message }, 500);
  }
});

// Authorizations
app.get('/payer/authorizations', async (c: Context) => {
  try {
    return c.json(SEED_AUTHORIZATIONS);
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch authorizations', details: err?.message }, 500);
  }
});

app.post('/payer/authorizations', async (c: Context) => {
  try {
    const data = await c.req.json();
    const newAuth = {
      ...data,
      id: `auth-${Date.now()}`,
      status: 'pending',
      requestedDate: new Date().toISOString(),
      requestedBy: 'Current User',
    };
    return c.json(newAuth);
  } catch (err: any) {
    return c.json({ error: 'Failed to create authorization', details: err?.message }, 500);
  }
});

app.patch('/payer/authorizations/:id/status', async (c: Context) => {
  try {
    const id = c.req.param('id');
    const { status } = await c.req.json();
    return c.json({ id, status, updated: true });
  } catch (err: any) {
    return c.json({ error: 'Failed to update authorization', details: err?.message }, 500);
  }
});

// Claim status
app.get('/payer/claims/status', async (c: Context) => {
  try {
    return c.json(SEED_CLAIM_STATUS);
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch claim status', details: err?.message }, 500);
  }
});

app.post('/payer/claims/poll', async (c: Context) => {
  try {
    const { claimNumbers } = await c.req.json();
    // Simulate polling claim status via X12 276/277
    return c.json({ polled: claimNumbers.length, results: [] });
  } catch (err: any) {
    return c.json({ error: 'Failed to poll claim status', details: err?.message }, 500);
  }
});

// ERA processing
app.get('/payer/era', async (c: Context) => {
  try {
    return c.json(SEED_ERA_FILES);
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch ERA files', details: err?.message }, 500);
  }
});

app.post('/payer/era/upload', async (c: Context) => {
  try {
    // In production, parse multipart form data and save file
    const newFile = {
      id: `era-${Date.now()}`,
      fileName: `ERA_Upload_${new Date().toISOString().split('T')[0]}.835`,
      fileSize: 32000,
      uploadedDate: new Date().toISOString(),
      uploadedBy: 'Current User',
      status: 'pending' as const,
      payer: 'Unknown',
      totalAmount: 0,
      claimCount: 0,
    };
    return c.json(newFile);
  } catch (err: any) {
    return c.json({ error: 'Failed to upload ERA file', details: err?.message }, 500);
  }
});

app.post('/payer/era/:id/process', async (c: Context) => {
  try {
    const id = c.req.param('id');
    // Simulate processing X12 835 file
    return c.json({ id, status: 'processing', message: 'ERA processing started' });
  } catch (err: any) {
    return c.json({ error: 'Failed to process ERA file', details: err?.message }, 500);
  }
});

// Configuration
app.get('/payer/config', async (c: Context) => {
  try {
    return c.json(SEED_PAYER_CONFIG);
  } catch (err: any) {
    return c.json({ error: 'Failed to fetch payer configuration', details: err?.message }, 500);
  }
});

app.put('/payer/config', async (c: Context) => {
  try {
    const config = await c.req.json();
    // In production, save to KV store with encryption
    return c.json({ saved: true, config });
  } catch (err: any) {
    return c.json({ error: 'Failed to save payer configuration', details: err?.message }, 500);
  }
});

app.post('/payer/config/test', async (c: Context) => {
  try {
    // Simulate testing connection to clearinghouse
    return c.json({ success: true, message: 'Connection test successful' });
  } catch (err: any) {
    return c.json({ error: 'Connection test failed', details: err?.message }, 500);
  }
});

// ─── X12 EDI Processing Routes ────────────────────────────────────────────

/**
 * POST /payer/x12/parse
 * Parse any X12 EDI file and return structured data
 */
app.post('/payer/x12/parse', async (c: Context) => {
  try {
    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: 'X12 content is required' }, 400);
    }

    // Validate X12 format
    const validation = validateX12Format(content);
    if (!validation.valid) {
      return c.json({ 
        error: 'Invalid X12 format', 
        validationErrors: validation.errors 
      }, 400);
    }

    // Parse X12 interchange
    const interchange = x12Parser.parseRaw(content);
    
    // Extract transaction type
    const transactionType = getTransactionType(content);

    console.log(`[X12 Parser] Successfully parsed ${transactionType || 'unknown'} transaction with ${interchange.groups.length} groups`);

    return c.json({
      success: true,
      transactionType,
      interchange,
      metadata: {
        controlNumber: interchange.isa.controlNumber,
        senderId: interchange.isa.senderId,
        receiverId: interchange.isa.receiverId,
        date: interchange.isa.date,
        time: interchange.isa.time,
        groupCount: interchange.groups.length,
        transactionCount: interchange.groups.reduce((sum, g) => sum + g.transactions.length, 0),
      },
    });
  } catch (err: any) {
    console.error('[X12 Parser] Parse error:', err?.message);
    return c.json({ 
      error: 'Failed to parse X12 content', 
      details: err?.message,
      stack: err?.stack,
    }, 500);
  }
});

/**
 * POST /payer/x12/generate/270
 * Generate X12 270 Eligibility Inquiry
 */
app.post('/payer/x12/generate/270', async (c: Context) => {
  try {
    const request: X12_270_Request = await c.req.json();

    if (!request.provider?.npi || !request.subscriber?.memberId || !request.payer?.payerId) {
      return c.json({ 
        error: 'Missing required fields: provider.npi, subscriber.memberId, payer.payerId' 
      }, 400);
    }

    const x12Content = x12Parser.generate270(request);

    console.log(`[X12 Generator] Generated 270 for patient ${request.subscriber.lastName}, ${request.subscriber.firstName}`);

    return c.json({
      success: true,
      transactionType: '270',
      content: x12Content,
      metadata: {
        controlNumber: request.controlNumber,
        provider: request.provider.name,
        payer: request.payer.name || request.payer.payerId,
        subscriber: `${request.subscriber.lastName}, ${request.subscriber.firstName}`,
      },
    });
  } catch (err: any) {
    console.error('[X12 Generator] 270 generation error:', err?.message);
    return c.json({ 
      error: 'Failed to generate 270 transaction', 
      details: err?.message 
    }, 500);
  }
});

/**
 * POST /payer/x12/generate/276
 * Generate X12 276 Claim Status Inquiry
 */
app.post('/payer/x12/generate/276', async (c: Context) => {
  try {
    const inquiry: X12_276_Inquiry = await c.req.json();

    if (!inquiry.provider?.npi || !inquiry.payer?.payerId || !inquiry.claims?.length) {
      return c.json({ 
        error: 'Missing required fields: provider.npi, payer.payerId, claims[]' 
      }, 400);
    }

    const x12Content = x12Parser.generate276(inquiry);

    console.log(`[X12 Generator] Generated 276 for ${inquiry.claims.length} claims`);

    return c.json({
      success: true,
      transactionType: '276',
      content: x12Content,
      metadata: {
        controlNumber: inquiry.controlNumber,
        provider: inquiry.provider.name,
        payer: inquiry.payer.name || inquiry.payer.payerId,
        claimCount: inquiry.claims.length,
      },
    });
  } catch (err: any) {
    console.error('[X12 Generator] 276 generation error:', err?.message);
    return c.json({ 
      error: 'Failed to generate 276 transaction', 
      details: err?.message 
    }, 500);
  }
});

/**
 * POST /payer/x12/parse/270
 * Parse X12 270 and extract eligibility inquiry data
 */
app.post('/payer/x12/parse/270', async (c: Context) => {
  try {
    const { content } = await c.req.json();

    const validation = validateX12Format(content);
    if (!validation.valid) {
      return c.json({ error: 'Invalid X12 format', errors: validation.errors }, 400);
    }

    const transactionType = getTransactionType(content);
    if (transactionType !== '270') {
      return c.json({ error: `Expected 270 transaction, got ${transactionType}` }, 400);
    }

    const interchange = x12Parser.parseRaw(content);
    const transaction = interchange.groups[0]?.transactions[0];

    if (!transaction) {
      return c.json({ error: 'No transaction found in X12 content' }, 400);
    }

    const eligibilityRequest = transaction.data as Partial<X12_270_Request>;

    console.log(`[X12 Parser] Parsed 270 for subscriber ${eligibilityRequest.subscriber?.memberId}`);

    return c.json({
      success: true,
      data: eligibilityRequest,
      raw: interchange,
    });
  } catch (err: any) {
    console.error('[X12 Parser] 270 parse error:', err?.message);
    return c.json({ error: 'Failed to parse 270 transaction', details: err?.message }, 500);
  }
});

/**
 * POST /payer/x12/parse/271
 * Parse X12 271 and extract eligibility response data
 */
app.post('/payer/x12/parse/271', async (c: Context) => {
  try {
    const { content } = await c.req.json();

    const validation = validateX12Format(content);
    if (!validation.valid) {
      return c.json({ error: 'Invalid X12 format', errors: validation.errors }, 400);
    }

    const transactionType = getTransactionType(content);
    if (transactionType !== '271') {
      return c.json({ error: `Expected 271 transaction, got ${transactionType}` }, 400);
    }

    const interchange = x12Parser.parseRaw(content);
    const transaction = interchange.groups[0]?.transactions[0];

    if (!transaction) {
      return c.json({ error: 'No transaction found in X12 content' }, 400);
    }

    const eligibilityResponse = transaction.data as Partial<X12_271_Response>;

    console.log(`[X12 Parser] Parsed 271 for subscriber ${eligibilityResponse.subscriber?.memberId}`);

    return c.json({
      success: true,
      data: eligibilityResponse,
      raw: interchange,
    });
  } catch (err: any) {
    console.error('[X12 Parser] 271 parse error:', err?.message);
    return c.json({ error: 'Failed to parse 271 transaction', details: err?.message }, 500);
  }
});

/**
 * POST /payer/x12/parse/835
 * Parse X12 835 ERA file and extract remittance data
 */
app.post('/payer/x12/parse/835', async (c: Context) => {
  try {
    const { content } = await c.req.json();

    const validation = validateX12Format(content);
    if (!validation.valid) {
      return c.json({ error: 'Invalid X12 format', errors: validation.errors }, 400);
    }

    const transactionType = getTransactionType(content);
    if (transactionType !== '835') {
      return c.json({ error: `Expected 835 transaction, got ${transactionType}` }, 400);
    }

    const interchange = x12Parser.parseRaw(content);
    const transaction = interchange.groups[0]?.transactions[0];

    if (!transaction) {
      return c.json({ error: 'No transaction found in X12 content' }, 400);
    }

    const eraData = transaction.data as Partial<X12_835_ERA>;

    console.log(`[X12 Parser] Parsed 835 ERA with ${eraData.claims?.length || 0} claims, total payment: $${eraData.payment?.paymentAmount || 0}`);

    // Calculate summary statistics
    const summary = {
      totalPayment: eraData.payment?.paymentAmount || 0,
      claimCount: eraData.claims?.length || 0,
      totalBilled: eraData.claims?.reduce((sum, c) => sum + c.totalClaimCharge, 0) || 0,
      totalPaid: eraData.claims?.reduce((sum, c) => sum + c.claimPayment, 0) || 0,
      totalPatientResponsibility: eraData.claims?.reduce((sum, c) => sum + c.patientResponsibility, 0) || 0,
    };

    return c.json({
      success: true,
      data: eraData,
      summary,
      raw: interchange,
    });
  } catch (err: any) {
    console.error('[X12 Parser] 835 parse error:', err?.message);
    return c.json({ error: 'Failed to parse 835 transaction', details: err?.message }, 500);
  }
});

/**
 * POST /payer/x12/parse/837
 * Parse X12 837 claim submission
 */
app.post('/payer/x12/parse/837', async (c: Context) => {
  try {
    const { content } = await c.req.json();

    const validation = validateX12Format(content);
    if (!validation.valid) {
      return c.json({ error: 'Invalid X12 format', errors: validation.errors }, 400);
    }

    const transactionType = getTransactionType(content);
    if (transactionType !== '837') {
      return c.json({ error: `Expected 837 transaction, got ${transactionType}` }, 400);
    }

    const interchange = x12Parser.parseRaw(content);
    const transaction = interchange.groups[0]?.transactions[0];

    if (!transaction) {
      return c.json({ error: 'No transaction found in X12 content' }, 400);
    }

    const claimData = transaction.data as Partial<X12_837_Claim>;

    console.log(`[X12 Parser] Parsed 837 claim ${claimData.claim?.patientControlNumber} for $${claimData.claim?.claimAmount || 0}`);

    return c.json({
      success: true,
      data: claimData,
      summary: {
        claimNumber: claimData.claim?.patientControlNumber,
        claimAmount: claimData.claim?.claimAmount || 0,
        serviceLineCount: claimData.serviceLines?.length || 0,
        provider: claimData.billing?.name,
        payer: claimData.payer?.name,
      },
      raw: interchange,
    });
  } catch (err: any) {
    console.error('[X12 Parser] 837 parse error:', err?.message);
    return c.json({ error: 'Failed to parse 837 transaction', details: err?.message }, 500);
  }
});

/**
 * POST /payer/x12/parse/276
 * Parse X12 276 claim status inquiry
 */
app.post('/payer/x12/parse/276', async (c: Context) => {
  try {
    const { content } = await c.req.json();

    const validation = validateX12Format(content);
    if (!validation.valid) {
      return c.json({ error: 'Invalid X12 format', errors: validation.errors }, 400);
    }

    const transactionType = getTransactionType(content);
    if (transactionType !== '276') {
      return c.json({ error: `Expected 276 transaction, got ${transactionType}` }, 400);
    }

    const interchange = x12Parser.parseRaw(content);
    const transaction = interchange.groups[0]?.transactions[0];

    if (!transaction) {
      return c.json({ error: 'No transaction found in X12 content' }, 400);
    }

    const inquiryData = transaction.data as Partial<X12_276_Inquiry>;

    console.log(`[X12 Parser] Parsed 276 inquiry for ${inquiryData.claims?.length || 0} claims`);

    return c.json({
      success: true,
      data: inquiryData,
      raw: interchange,
    });
  } catch (err: any) {
    console.error('[X12 Parser] 276 parse error:', err?.message);
    return c.json({ error: 'Failed to parse 276 transaction', details: err?.message }, 500);
  }
});

/**
 * POST /payer/x12/parse/277
 * Parse X12 277 claim status response
 */
app.post('/payer/x12/parse/277', async (c: Context) => {
  try {
    const { content } = await c.req.json();

    const validation = validateX12Format(content);
    if (!validation.valid) {
      return c.json({ error: 'Invalid X12 format', errors: validation.errors }, 400);
    }

    const transactionType = getTransactionType(content);
    if (transactionType !== '277') {
      return c.json({ error: `Expected 277 transaction, got ${transactionType}` }, 400);
    }

    const interchange = x12Parser.parseRaw(content);
    const transaction = interchange.groups[0]?.transactions[0];

    if (!transaction) {
      return c.json({ error: 'No transaction found in X12 content' }, 400);
    }

    const responseData = transaction.data as Partial<X12_277_Response>;

    console.log(`[X12 Parser] Parsed 277 response for ${responseData.claims?.length || 0} claims`);

    return c.json({
      success: true,
      data: responseData,
      raw: interchange,
    });
  } catch (err: any) {
    console.error('[X12 Parser] 277 parse error:', err?.message);
    return c.json({ error: 'Failed to parse 277 transaction', details: err?.message }, 500);
  }
});

/**
 * POST /payer/x12/validate
 * Validate X12 format without full parsing
 */
app.post('/payer/x12/validate', async (c: Context) => {
  try {
    const { content } = await c.req.json();

    if (!content) {
      return c.json({ error: 'X12 content is required' }, 400);
    }

    const validation = validateX12Format(content);
    const transactionType = validation.valid ? getTransactionType(content) : null;

    return c.json({
      valid: validation.valid,
      errors: validation.errors,
      transactionType,
      metadata: validation.valid ? {
        segmentCount: content.split('~').filter((s: string) => s.trim()).length,
        size: content.length,
      } : null,
    });
  } catch (err: any) {
    console.error('[X12 Validator] Validation error:', err?.message);
    return c.json({ 
      error: 'Failed to validate X12 content', 
      details: err?.message 
    }, 500);
  }
});

export default app;