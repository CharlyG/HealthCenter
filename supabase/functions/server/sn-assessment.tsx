/**
 * SN Assessment API Routes
 * Backend routes for Skilled Nursing Assessment management
 */

import { Hono } from 'npm:hono';
import * as kv from './kv_store.tsx';

const app = new Hono();

const KV_PREFIX_ASSESSMENTS = 'sn_assessments';
const KV_PREFIX_QUICK_PHRASES = 'sn_quick_phrases';
const KV_PREFIX_PATIENT_HISTORY = 'patient_clinical_history';

// List SN Assessments with filtering, pagination, and sorting
app.get('/sn-assessments', async (c) => {
  try {
    const offset = parseInt(c.req.query('offset') || '0');
    const limit = parseInt(c.req.query('limit') || '50');
    const sortField = c.req.query('sortField') || 'visitDate';
    const sortDirection = c.req.query('sortDirection') || 'desc';
    
    const statusFilter = c.req.query('status')?.split(',') || [];
    const visitTypeFilter = c.req.query('visitType')?.split(',') || [];
    const dateFrom = c.req.query('dateFrom');
    const dateTo = c.req.query('dateTo');
    const nurseId = c.req.query('nurseId');
    const riskFlagsFilter = c.req.query('riskFlags')?.split(',') || [];

    // Fetch all assessments
    const allAssessments = await kv.getByPrefix(KV_PREFIX_ASSESSMENTS);
    
    // Filter assessments
    let filtered = allAssessments.filter((item: any) => {
      const assessment = item.value;

      // Status filter
      if (statusFilter.length > 0 && !statusFilter.includes(assessment.status)) {
        return false;
      }

      // Visit type filter
      if (visitTypeFilter.length > 0 && !visitTypeFilter.includes(assessment.visitType)) {
        return false;
      }

      // Date range filter
      if (dateFrom && assessment.visitDate < dateFrom) {
        return false;
      }
      if (dateTo && assessment.visitDate > dateTo) {
        return false;
      }

      // Nurse filter
      if (nurseId && assessment.nurseId !== nurseId) {
        return false;
      }

      // Risk flags filter
      if (riskFlagsFilter.length > 0) {
        const hasRisk = riskFlagsFilter.some(risk => {
          if (risk === 'fall' && assessment.riskFlags?.fallRisk) return true;
          if (risk === 'wound' && assessment.riskFlags?.woundRisk) return true;
          if (risk === 'hospitalization' && assessment.riskFlags?.hospitalizationRisk) return true;
          if (risk === 'medication' && assessment.riskFlags?.medicationIssues) return true;
          if (risk === 'infection' && assessment.riskFlags?.infectionConcerns) return true;
          return false;
        });
        if (!hasRisk) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a: any, b: any) => {
      const aVal = a.value[sortField];
      const bVal = b.value[sortField];
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit).map((item: any) => item.value);

    return c.json({ items, total });
  } catch (error) {
    console.error('Error fetching SN assessment queue:', error);
    return c.json({ error: 'Failed to fetch assessments' }, 500);
  }
});

// Get single SN Assessment
app.get('/sn-assessments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const key = `${KV_PREFIX_ASSESSMENTS}:${id}`;
    
    const assessment = await kv.get(key);
    
    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    return c.json(assessment);
  } catch (error) {
    console.error('Error fetching SN assessment:', error);
    return c.json({ error: 'Failed to fetch assessment' }, 500);
  }
});

// Create new SN Assessment
app.post('/sn-assessments', async (c) => {
  try {
    const body = await c.req.json();
    
    const id = `sn-${Date.now()}`;
    const now = new Date().toISOString();
    
    const assessment = {
      ...body,
      id,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    };

    // Calculate risk flags
    assessment.riskFlags = calculateRiskFlags(assessment);

    const key = `${KV_PREFIX_ASSESSMENTS}:${id}`;
    await kv.set(key, assessment);

    return c.json(assessment, 201);
  } catch (error) {
    console.error('Error creating SN assessment:', error);
    return c.json({ error: 'Failed to create assessment' }, 500);
  }
});

// Update SN Assessment
app.put('/sn-assessments/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const key = `${KV_PREFIX_ASSESSMENTS}:${id}`;
    
    const existing = await kv.get(key);
    
    if (!existing) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    const updated = {
      ...existing,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate risk flags
    updated.riskFlags = calculateRiskFlags(updated);

    await kv.set(key, updated);

    return c.json(updated);
  } catch (error) {
    console.error('Error updating SN assessment:', error);
    return c.json({ error: 'Failed to update assessment' }, 500);
  }
});

// Submit SN Assessment for review
app.post('/sn-assessments/:id/submit', async (c) => {
  try {
    const id = c.req.param('id');
    const key = `${KV_PREFIX_ASSESSMENTS}:${id}`;
    
    const assessment = await kv.get(key);
    
    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    // Validate required fields
    const validation = validateAssessment(assessment);
    if (!validation.valid) {
      return c.json({ error: 'Validation failed', issues: validation.issues }, 400);
    }

    assessment.status = 'pending_review';
    assessment.updatedAt = new Date().toISOString();

    await kv.set(key, assessment);

    return c.json(assessment);
  } catch (error) {
    console.error('Error submitting SN assessment:', error);
    return c.json({ error: 'Failed to submit assessment' }, 500);
  }
});

// Sign SN Assessment
app.post('/sn-assessments/:id/sign', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { pin } = body;
    
    // In production, validate PIN against user credentials
    if (!pin) {
      return c.json({ error: 'PIN required for signature' }, 400);
    }

    const key = `${KV_PREFIX_ASSESSMENTS}:${id}`;
    const assessment = await kv.get(key);
    
    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404);
    }

    if (assessment.status !== 'pending_review') {
      return c.json({ error: 'Assessment must be in pending_review status to sign' }, 400);
    }

    const now = new Date().toISOString();
    assessment.status = 'signed';
    assessment.signedAt = now;
    assessment.signedBy = assessment.nurseId; // In production, use authenticated user
    assessment.completedAt = now;
    assessment.updatedAt = now;

    await kv.set(key, assessment);

    return c.json(assessment);
  } catch (error) {
    console.error('Error signing SN assessment:', error);
    return c.json({ error: 'Failed to sign assessment' }, 500);
  }
});

// Get quick phrases
app.get('/quick-phrases', async (c) => {
  try {
    const category = c.req.query('category');
    
    // In production, fetch from database
    // For now, return hardcoded phrases based on category
    const phrases = getQuickPhrases(category);
    
    return c.json(phrases);
  } catch (error) {
    console.error('Error fetching quick phrases:', error);
    return c.json({ error: 'Failed to fetch quick phrases' }, 500);
  }
});

// Get patient clinical history
app.get('/patients/:patientId/history', async (c) => {
  try {
    const patientId = c.req.param('patientId');
    const category = c.req.query('category');
    
    const historyKey = `${KV_PREFIX_PATIENT_HISTORY}:${patientId}`;
    let history = await kv.get(historyKey) || [];
    
    // Filter by category if specified
    if (category) {
      history = history.filter((item: any) => item.category === category);
    }
    
    // Sort by date descending
    history.sort((a: any, b: any) => b.date.localeCompare(a.date));
    
    return c.json(history);
  } catch (error) {
    console.error('Error fetching patient history:', error);
    return c.json({ error: 'Failed to fetch patient history' }, 500);
  }
});

// Calculate risk scores based on assessment data
app.post('/risk-calculations', async (c) => {
  try {
    const assessmentData = await c.req.json();
    
    const risks = {
      fallRisk: calculateFallRiskScore(assessmentData),
      woundRisk: calculateWoundRiskScore(assessmentData),
      hospitalizationRisk: calculateHospitalizationRiskScore(assessmentData),
    };
    
    return c.json(risks);
  } catch (error) {
    console.error('Error calculating risk scores:', error);
    return c.json({ error: 'Failed to calculate risk scores' }, 500);
  }
});

// Helper Functions

function calculateRiskFlags(assessment: any) {
  return {
    fallRisk: assessment.safetyFallRisk?.fallRiskLevel === 'high' || 
              assessment.safetyFallRisk?.fallRiskLevel === 'moderate',
    woundRisk: assessment.integumentary?.woundsPresent || false,
    hospitalizationRisk: checkHospitalizationRisk(assessment),
    medicationIssues: assessment.medicationReconciliation?.changesIdentified || 
                      (assessment.medicationReconciliation?.adherenceIssues?.length || 0) > 0,
    infectionConcerns: checkInfectionConcerns(assessment),
  };
}

function checkHospitalizationRisk(assessment: any): boolean {
  if (assessment.vitalSigns?.temperature && assessment.vitalSigns.temperature > 100.4) {
    return true;
  }
  
  if (assessment.vitalSigns?.bloodPressure) {
    const { systolic, diastolic } = assessment.vitalSigns.bloodPressure;
    if (systolic > 160 || diastolic > 100) {
      return true;
    }
  }
  
  if (assessment.vitalSigns?.oxygenSaturation && assessment.vitalSigns.oxygenSaturation < 92) {
    return true;
  }
  
  if (assessment.patientResponse?.overallResponse === 'declined') {
    return true;
  }
  
  return false;
}

function checkInfectionConcerns(assessment: any): boolean {
  if (assessment.vitalSigns?.temperature && assessment.vitalSigns.temperature > 100.4) {
    return true;
  }
  
  if (assessment.integumentary?.wounds?.some((w: any) => 
    w.drainage?.toLowerCase().includes('purulent') || 
    w.odor?.toLowerCase().includes('foul')
  )) {
    return true;
  }
  
  return false;
}

function validateAssessment(assessment: any) {
  const issues: string[] = [];
  
  if (!assessment.reasonForVisit) {
    issues.push('Reason for visit is required');
  }
  
  if (!assessment.visitType) {
    issues.push('Visit type is required');
  }
  
  if (!assessment.vitalSigns?.temperature) {
    issues.push('Temperature is required');
  }
  
  if (!assessment.vitalSigns?.pulse) {
    issues.push('Pulse is required');
  }
  
  if (!assessment.vitalSigns?.bloodPressure) {
    issues.push('Blood pressure is required');
  }
  
  if (!assessment.medicationReconciliation?.medicationsReviewed) {
    issues.push('Medication reconciliation must be completed');
  }
  
  if (!assessment.safetyFallRisk?.fallRiskScore) {
    issues.push('Fall risk assessment is required');
  }
  
  return {
    valid: issues.length === 0,
    issues,
  };
}

function calculateFallRiskScore(data: any) {
  let score = 0;
  
  if (data.safetyFallRisk?.fallRiskScore) {
    score = data.safetyFallRisk.fallRiskScore;
  }
  
  const level = score >= 10 ? 'high' : score >= 5 ? 'moderate' : 'low';
  
  return { score, level };
}

function calculateWoundRiskScore(data: any) {
  let score = 0;
  
  if (data.integumentary?.wounds) {
    const woundCount = data.integumentary.wounds.length;
    score = woundCount * 5;
    
    data.integumentary.wounds.forEach((wound: any) => {
      if (wound.stage?.includes('3') || wound.stage?.includes('4')) {
        score += 10;
      }
      if (wound.drainage?.toLowerCase().includes('purulent')) {
        score += 5;
      }
    });
  }
  
  const level = score >= 15 ? 'high' : score >= 8 ? 'moderate' : 'low';
  
  return { score, level };
}

function calculateHospitalizationRiskScore(data: any) {
  let score = 0;
  
  if (data.vitalSigns?.temperature && data.vitalSigns.temperature > 100.4) {
    score += 5;
  }
  
  if (data.vitalSigns?.bloodPressure) {
    const { systolic, diastolic } = data.vitalSigns.bloodPressure;
    if (systolic > 160 || diastolic > 100) {
      score += 5;
    }
  }
  
  if (data.vitalSigns?.oxygenSaturation && data.vitalSigns.oxygenSaturation < 92) {
    score += 8;
  }
  
  if (data.cardiopulmonary?.concerns?.length) {
    score += 5;
  }
  
  if (data.patientResponse?.overallResponse === 'declined') {
    score += 10;
  }
  
  const level = score >= 15 ? 'high' : score >= 8 ? 'moderate' : 'low';
  
  return { score, level };
}

function getQuickPhrases(category?: string) {
  // Simplified version - in production, fetch from database
  const allPhrases = [
    { id: '1', category: 'vital_signs', text: 'Vital signs stable and within normal limits', discipline: 'sn' },
    { id: '2', category: 'cardiopulmonary', text: 'Lungs clear to auscultation bilaterally', discipline: 'sn' },
    { id: '3', category: 'neurological', text: 'Alert and oriented x 4', discipline: 'sn' },
  ];
  
  if (category) {
    return allPhrases.filter(p => p.category === category);
  }
  
  return allPhrases;
}

export default app;
