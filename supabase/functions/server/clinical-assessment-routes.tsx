/**
 * Clinical Assessment Backend Routes
 * Server routes for assessment CRUD operations
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

// ─── Types ─────────────────────────────────────────────────────────────────

interface AssessmentInstance {
  id: string;
  definitionId: string;
  type: string;
  patientId: string;
  patientName: string;
  admissionId: string;
  episodeId?: string;
  clinicianId: string;
  clinicianName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  data: Record<string, any>;
  sectionProgress: Record<string, string>;
  validationErrors?: Record<string, string>;
  metadata?: Record<string, any>;
}

interface SignatureRequest {
  assessmentId: string;
  signedBy: string;
  signedByRole: string;
  signature: string;
  ipAddress?: string;
}

interface QAReviewRequest {
  assessmentId: string;
  reviewerId: string;
  reviewerName: string;
  status: 'approved' | 'rejected';
  comments?: string;
  issues?: Array<{
    sectionId: string;
    questionId: string;
    issue: string;
    severity: 'critical' | 'warning' | 'info';
  }>;
}

// ─── Helper Functions ──────────────────────────────────────────────────────

function generateAssessmentKey(assessmentId: string): string {
  return `assessment:${assessmentId}`;
}

function generatePatientAssessmentsKey(patientId: string): string {
  return `patient-assessments:${patientId}`;
}

function generateAdmissionAssessmentsKey(admissionId: string): string {
  return `admission-assessments:${admissionId}`;
}

function generateSignatureKey(assessmentId: string): string {
  return `assessment-signature:${assessmentId}`;
}

function generateQAReviewKey(assessmentId: string): string {
  return `assessment-qa:${assessmentId}`;
}

// ─── Create Assessment ─────────────────────────────────────────────────────

app.post('/make-server-845bc545/assessments', async (c) => {
  try {
    const body = await c.req.json();
    const {
      type,
      patientId,
      patientName,
      admissionId,
      episodeId,
      clinicianId,
      clinicianName,
    } = body;

    if (!type || !patientId || !admissionId || !clinicianId) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const assessmentId = `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const assessment: AssessmentInstance = {
      id: assessmentId,
      definitionId: type,
      type,
      patientId,
      patientName,
      admissionId,
      episodeId,
      clinicianId,
      clinicianName,
      status: 'in-progress',
      createdAt: now,
      updatedAt: now,
      data: {},
      sectionProgress: {},
      metadata: {
        autoSaveEnabled: true,
      },
    };

    // Save assessment
    await kv.set(generateAssessmentKey(assessmentId), assessment);

    // Add to patient's assessment list
    const patientKey = generatePatientAssessmentsKey(patientId);
    const patientAssessments = await kv.get(patientKey) || [];
    patientAssessments.push(assessmentId);
    await kv.set(patientKey, patientAssessments);

    // Add to admission's assessment list
    const admissionKey = generateAdmissionAssessmentsKey(admissionId);
    const admissionAssessments = await kv.get(admissionKey) || [];
    admissionAssessments.push(assessmentId);
    await kv.set(admissionKey, admissionAssessments);

    console.log(`[Assessment] Created assessment ${assessmentId} for patient ${patientId}`);

    return c.json({ success: true, assessment });
  } catch (error: any) {
    console.error('[Assessment] Create error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── Get Assessment ────────────────────────────────────────────────────────

app.get('/make-server-845bc545/assessments/:id', async (c) => {
  try {
    const assessmentId = c.req.param('id');
    const assessment = await kv.get(generateAssessmentKey(assessmentId));

    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    return c.json({ success: true, assessment });
  } catch (error: any) {
    console.error('[Assessment] Get error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── Update Assessment (Auto-save) ─────────────────────────────────────────

app.patch('/make-server-845bc545/assessments/:id', async (c) => {
  try {
    const assessmentId = c.req.param('id');
    const body = await c.req.json();
    const { data, sectionProgress } = body;

    const assessment = await kv.get(generateAssessmentKey(assessmentId));

    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    // Update assessment data
    const updatedAssessment: AssessmentInstance = {
      ...assessment,
      data: data || assessment.data,
      sectionProgress: sectionProgress || assessment.sectionProgress,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(generateAssessmentKey(assessmentId), updatedAssessment);

    console.log(`[Assessment] Updated assessment ${assessmentId}`);

    return c.json({ success: true, assessment: updatedAssessment });
  } catch (error: any) {
    console.error('[Assessment] Update error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── Submit Assessment ─────────────────────────────────────────────────────

app.post('/make-server-845bc545/assessments/:id/submit', async (c) => {
  try {
    const assessmentId = c.req.param('id');
    const body = await c.req.json();
    const { data } = body;

    const assessment = await kv.get(generateAssessmentKey(assessmentId));

    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    // Update to submitted status
    const submittedAssessment: AssessmentInstance = {
      ...assessment,
      data: data || assessment.data,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(generateAssessmentKey(assessmentId), submittedAssessment);

    console.log(`[Assessment] Submitted assessment ${assessmentId}`);

    return c.json({ success: true, assessment: submittedAssessment });
  } catch (error: any) {
    console.error('[Assessment] Submit error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── Get Patient Assessments ───────────────────────────────────────────────

app.get('/make-server-845bc545/patients/:patientId/assessments', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const assessmentIds = await kv.get(generatePatientAssessmentsKey(patientId)) || [];
    
    const assessments = [];
    for (const id of assessmentIds) {
      const assessment = await kv.get(generateAssessmentKey(id));
      if (assessment) {
        assessments.push(assessment);
      }
    }

    // Sort by creation date (newest first)
    assessments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, assessments });
  } catch (error: any) {
    console.error('[Assessment] Get patient assessments error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── Get Admission Assessments ─────────────────────────────────────────────

app.get('/make-server-845bc545/admissions/:admissionId/assessments', async (c) => {
  try {
    const admissionId = c.req.param('admissionId');
    const assessmentIds = await kv.get(generateAdmissionAssessmentsKey(admissionId)) || [];
    
    const assessments = [];
    for (const id of assessmentIds) {
      const assessment = await kv.get(generateAssessmentKey(id));
      if (assessment) {
        assessments.push(assessment);
      }
    }

    // Sort by creation date (newest first)
    assessments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, assessments });
  } catch (error: any) {
    console.error('[Assessment] Get admission assessments error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── Sign Assessment ───────────────────────────────────────────────────────

app.post('/make-server-845bc545/assessments/:id/sign', async (c) => {
  try {
    const assessmentId = c.req.param('id');
    const body: SignatureRequest = await c.req.json();

    const assessment = await kv.get(generateAssessmentKey(assessmentId));

    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    if (assessment.status !== 'submitted') {
      return c.json({ error: 'Assessment must be submitted before signing' }, 400);
    }

    const signature = {
      id: `signature-${Date.now()}`,
      assessmentId,
      signedBy: body.signedBy,
      signedByRole: body.signedByRole,
      signedAt: new Date().toISOString(),
      signature: body.signature,
      ipAddress: body.ipAddress,
    };

    // Save signature
    await kv.set(generateSignatureKey(assessmentId), signature);

    // Update assessment status to QA review
    const signedAssessment: AssessmentInstance = {
      ...assessment,
      status: 'qa-review',
      updatedAt: new Date().toISOString(),
    };

    await kv.set(generateAssessmentKey(assessmentId), signedAssessment);

    console.log(`[Assessment] Signed assessment ${assessmentId} by ${body.signedBy}`);

    return c.json({ success: true, signature, assessment: signedAssessment });
  } catch (error: any) {
    console.error('[Assessment] Sign error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── QA Review Assessment ──────────────────────────────────────────────────

app.post('/make-server-845bc545/assessments/:id/qa-review', async (c) => {
  try {
    const assessmentId = c.req.param('id');
    const body: QAReviewRequest = await c.req.json();

    const assessment = await kv.get(generateAssessmentKey(assessmentId));

    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    if (assessment.status !== 'qa-review') {
      return c.json({ error: 'Assessment must be in QA review status' }, 400);
    }

    const qaReview = {
      id: `qa-${Date.now()}`,
      assessmentId,
      reviewerId: body.reviewerId,
      reviewerName: body.reviewerName,
      status: body.status,
      comments: body.comments,
      issues: body.issues || [],
      reviewedAt: new Date().toISOString(),
    };

    // Save QA review
    await kv.set(generateQAReviewKey(assessmentId), qaReview);

    // Update assessment status
    const newStatus = body.status === 'approved' ? 'approved' : 'rejected';
    const reviewedAssessment: AssessmentInstance = {
      ...assessment,
      status: newStatus,
      approvedAt: body.status === 'approved' ? new Date().toISOString() : undefined,
      approvedBy: body.status === 'approved' ? body.reviewerId : undefined,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(generateAssessmentKey(assessmentId), reviewedAssessment);

    console.log(`[Assessment] QA review ${body.status} for assessment ${assessmentId}`);

    return c.json({ success: true, qaReview, assessment: reviewedAssessment });
  } catch (error: any) {
    console.error('[Assessment] QA review error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── Get Assessment Signature ──────────────────────────────────────────────

app.get('/make-server-845bc545/assessments/:id/signature', async (c) => {
  try {
    const assessmentId = c.req.param('id');
    const signature = await kv.get(generateSignatureKey(assessmentId));

    if (!signature) {
      return c.json({ error: 'Signature not found' }, 404);
    }

    return c.json({ success: true, signature });
  } catch (error: any) {
    console.error('[Assessment] Get signature error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── Get Assessment QA Review ──────────────────────────────────────────────

app.get('/make-server-845bc545/assessments/:id/qa-review', async (c) => {
  try {
    const assessmentId = c.req.param('id');
    const qaReview = await kv.get(generateQAReviewKey(assessmentId));

    if (!qaReview) {
      return c.json({ error: 'QA review not found' }, 404);
    }

    return c.json({ success: true, qaReview });
  } catch (error: any) {
    console.error('[Assessment] Get QA review error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── List All Assessments (with filters) ───────────────────────────────────

app.get('/make-server-845bc545/assessments', async (c) => {
  try {
    const status = c.req.query('status');
    const type = c.req.query('type');
    const clinicianId = c.req.query('clinicianId');

    // Get all assessment keys
    const allKeys = await kv.getByPrefix('assessment:');
    const assessments = allKeys
      .filter((item: any) => item.value)
      .map((item: any) => item.value);

    // Apply filters
    let filtered = assessments;
    
    if (status) {
      filtered = filtered.filter((a: AssessmentInstance) => a.status === status);
    }
    
    if (type) {
      filtered = filtered.filter((a: AssessmentInstance) => a.type === type);
    }
    
    if (clinicianId) {
      filtered = filtered.filter((a: AssessmentInstance) => a.clinicianId === clinicianId);
    }

    // Sort by creation date (newest first)
    filtered.sort((a: AssessmentInstance, b: AssessmentInstance) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ success: true, assessments: filtered, count: filtered.length });
  } catch (error: any) {
    console.error('[Assessment] List assessments error:', error);
    return c.json({ error: error.message }, 500);
  }
});

// ─── Delete Assessment ─────────────────────────────────────────────────────

app.delete('/make-server-845bc545/assessments/:id', async (c) => {
  try {
    const assessmentId = c.req.param('id');
    const assessment = await kv.get(generateAssessmentKey(assessmentId));

    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    // Delete assessment
    await kv.del(generateAssessmentKey(assessmentId));

    // Remove from patient's list
    const patientKey = generatePatientAssessmentsKey(assessment.patientId);
    const patientAssessments = await kv.get(patientKey) || [];
    const updatedPatientAssessments = patientAssessments.filter((id: string) => id !== assessmentId);
    await kv.set(patientKey, updatedPatientAssessments);

    // Remove from admission's list
    const admissionKey = generateAdmissionAssessmentsKey(assessment.admissionId);
    const admissionAssessments = await kv.get(admissionKey) || [];
    const updatedAdmissionAssessments = admissionAssessments.filter((id: string) => id !== assessmentId);
    await kv.set(admissionKey, updatedAdmissionAssessments);

    // Delete related data
    await kv.del(generateSignatureKey(assessmentId));
    await kv.del(generateQAReviewKey(assessmentId));

    console.log(`[Assessment] Deleted assessment ${assessmentId}`);

    return c.json({ success: true, message: 'Assessment deleted' });
  } catch (error: any) {
    console.error('[Assessment] Delete error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;