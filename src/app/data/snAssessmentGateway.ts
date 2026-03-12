/**
 * SN Assessment Data Gateway
 * Abstraction layer for Skilled Nursing assessment data operations
 */

export interface SNAssessment {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  visitType: 'admission' | 'routine' | 'prn' | 'recert' | 'discharge';
  status: 'draft' | 'in_progress' | 'pending_review' | 'completed' | 'signed';
  nurseId: string;
  nurseName: string;
  
  // Reason and complaint
  reasonForVisit: string;
  chiefComplaint: string;
  
  // Vital signs
  vitalSigns: {
    temperature?: number;
    temperatureRoute?: 'oral' | 'tympanic' | 'axillary' | 'temporal';
    pulse?: number;
    pulseRegularity?: 'regular' | 'irregular';
    respirations?: number;
    bloodPressure?: { systolic: number; diastolic: number };
    bpPosition?: 'sitting' | 'standing' | 'lying';
    oxygenSaturation?: number;
    oxygenSupplementation?: string;
    weight?: number;
    height?: number;
    bmi?: number;
    painScore?: number;
  };
  
  // Pain assessment
  painAssessment: {
    location?: string;
    quality?: string[];
    severity?: number;
    onset?: string;
    duration?: string;
    alleviatingFactors?: string;
    aggravatingFactors?: string;
    currentManagement?: string;
    effectiveness?: 'effective' | 'partially_effective' | 'ineffective';
    narrative?: string;
  };
  
  // System assessments
  cardiopulmonary: SystemAssessment;
  neurological: SystemAssessment;
  gastrointestinal: SystemAssessment;
  genitourinary: SystemAssessment;
  integumentary: IntegumentaryAssessment;
  
  // Medication reconciliation
  medicationReconciliation: {
    medicationsReviewed: boolean;
    changesIdentified: boolean;
    changes?: MedicationChange[];
    adherenceIssues?: string[];
    educationProvided?: string[];
    narrative?: string;
  };
  
  // Safety and fall risk
  safetyFallRisk: {
    fallRiskScore?: number;
    fallRiskLevel?: 'low' | 'moderate' | 'high';
    riskFactors?: string[];
    environmentalHazards?: string[];
    interventionsImplemented?: string[];
    narrative?: string;
  };
  
  // Education and support
  patientEducation: {
    topicsDiscussed?: string[];
    materialsProvided?: string[];
    comprehensionLevel?: 'good' | 'fair' | 'poor';
    barriers?: string[];
    narrative?: string;
  };
  
  caregiverSupport: {
    caregiverPresent: boolean;
    caregiverName?: string;
    relationship?: string;
    supportLevel?: 'excellent' | 'adequate' | 'minimal' | 'none';
    concerns?: string[];
    educationProvided?: string[];
    narrative?: string;
  };
  
  // Care plan and interventions
  carePlanUpdates: {
    goalsReviewed: boolean;
    goalsModified?: string[];
    newGoals?: string[];
    interventionsModified?: string[];
    narrative?: string;
  };
  
  interventionsPerformed: {
    interventions?: PerformedIntervention[];
    narrative?: string;
  };
  
  patientResponse: {
    overallResponse?: 'improved' | 'stable' | 'declined' | 'mixed';
    specificResponses?: string[];
    adverseReactions?: string[];
    narrative?: string;
  };
  
  followUpNeeds: {
    physicianNotificationNeeded: boolean;
    physicianNotificationReason?: string;
    ordersNeeded?: string[];
    nextVisitRecommendations?: string[];
    narrative?: string;
  };
  
  // Risk flags
  riskFlags: {
    fallRisk: boolean;
    woundRisk: boolean;
    hospitalizationRisk: boolean;
    medicationIssues: boolean;
    infectionConcerns: boolean;
  };
  
  // Linkages
  linkedGoals?: string[];
  linkedInterventions?: string[];
  linkedOrders?: string[];
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  signedAt?: string;
  signedBy?: string;
}

export interface SystemAssessment {
  normalFindings: boolean;
  abnormalFindings?: string[];
  structuredFindings?: Record<string, any>;
  narrative?: string;
  concerns?: string[];
}

export interface IntegumentaryAssessment extends SystemAssessment {
  woundsPresent: boolean;
  wounds?: WoundAssessment[];
}

export interface WoundAssessment {
  id: string;
  location: string;
  type: string;
  length?: number;
  width?: number;
  depth?: number;
  stage?: string;
  drainage?: string;
  odor?: string;
  periWoundSkin?: string;
  treatment?: string;
  response?: string;
}

export interface MedicationChange {
  type: 'added' | 'discontinued' | 'dose_changed' | 'frequency_changed';
  medication: string;
  details: string;
}

export interface PerformedIntervention {
  id: string;
  intervention: string;
  time?: string;
  response?: string;
}

export interface SNAssessmentListItem {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  visitDate: string;
  visitType: string;
  status: string;
  nurseName: string;
  riskFlags: SNAssessment['riskFlags'];
  createdAt: string;
}

export interface QuickPhrase {
  id: string;
  category: string;
  text: string;
  discipline: 'sn' | 'pt' | 'ot' | 'st' | 'all';
}

export interface PatientHistoryItem {
  date: string;
  type: string;
  finding: string;
  clinician: string;
}

// API functions
export async function fetchSNAssessmentQueue(
  filters: {
    status?: string[];
    visitType?: string[];
    dateFrom?: string;
    dateTo?: string;
    nurseId?: string;
    riskFlags?: string[];
  },
  pagination: { offset: number; limit: number },
  sort: { field: string; direction: 'asc' | 'desc' }
): Promise<{ items: SNAssessmentListItem[]; total: number }> {
  const params = new URLSearchParams({
    offset: pagination.offset.toString(),
    limit: pagination.limit.toString(),
    sortField: sort.field,
    sortDirection: sort.direction,
    ...(filters.status && { status: filters.status.join(',') }),
    ...(filters.visitType && { visitType: filters.visitType.join(',') }),
    ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
    ...(filters.dateTo && { dateTo: filters.dateTo }),
    ...(filters.nurseId && { nurseId: filters.nurseId }),
    ...(filters.riskFlags && { riskFlags: filters.riskFlags.join(',') }),
  });

  const response = await fetch(
    `/api/sn-assessments?${params}`,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch SN assessment queue');
  }

  return response.json();
}

export async function fetchSNAssessment(id: string): Promise<SNAssessment> {
  const response = await fetch(`/api/sn-assessments/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch SN assessment');
  }

  return response.json();
}

export async function saveSNAssessment(
  assessment: Partial<SNAssessment>
): Promise<SNAssessment> {
  const response = await fetch(
    `/api/sn-assessments${assessment.id ? `/${assessment.id}` : ''}`,
    {
      method: assessment.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessment),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to save SN assessment');
  }

  return response.json();
}

export async function submitSNAssessment(id: string): Promise<SNAssessment> {
  const response = await fetch(`/api/sn-assessments/${id}/submit`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to submit SN assessment');
  }

  return response.json();
}

export async function signSNAssessment(
  id: string,
  signature: { pin: string }
): Promise<SNAssessment> {
  const response = await fetch(`/api/sn-assessments/${id}/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signature),
  });

  if (!response.ok) {
    throw new Error('Failed to sign SN assessment');
  }

  return response.json();
}

export async function fetchQuickPhrases(
  category?: string
): Promise<QuickPhrase[]> {
  const params = category ? `?category=${category}` : '';
  const response = await fetch(`/api/quick-phrases${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch quick phrases');
  }

  return response.json();
}

export async function fetchPatientHistory(
  patientId: string,
  category?: string
): Promise<PatientHistoryItem[]> {
  const params = category ? `?category=${category}` : '';
  const response = await fetch(
    `/api/patients/${patientId}/history${params}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch patient history');
  }

  return response.json();
}

export async function calculateRiskScores(
  assessmentData: Partial<SNAssessment>
): Promise<{
  fallRisk: { score: number; level: string };
  woundRisk: { score: number; level: string };
  hospitalizationRisk: { score: number; level: string };
}> {
  const response = await fetch('/api/risk-calculations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assessmentData),
  });

  if (!response.ok) {
    throw new Error('Failed to calculate risk scores');
  }

  return response.json();
}
