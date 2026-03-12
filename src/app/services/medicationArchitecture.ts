/**
 * Medication Management Architecture
 * 
 * Comprehensive medication system supporting home health and hospice:
 * 
 * THREE-LEVEL CONTEXT MODEL:
 * 
 * 1. PATIENT-LEVEL (Master Profile)
 *    - Lifetime medication history
 *    - Allergy registry
 *    - Pharmacy information
 *    - Cross-admission tracking
 * 
 * 2. ADMISSION-LEVEL (Episode of Care)
 *    - Medication reconciliation at SOC
 *    - Medication review and changes
 *    - Medication-related alerts
 *    - Assessment-linked medication questions
 *    - Medication goals and outcomes
 * 
 * 3. VISIT-LEVEL (Clinical Encounters)
 *    - Point-of-care medication review
 *    - Medication teaching documentation
 *    - Compliance observations
 *    - Patient/caregiver-reported changes
 * 
 * SAFETY FEATURES:
 * - Drug interaction checking
 * - Allergy alerts
 * - Duplicate therapy detection
 * - High-risk medication flags
 * - Dosage validation
 * 
 * INTEGRATION POINTS:
 * - OASIS assessments (M2020, M2030, M2040)
 * - Clinical documentation
 * - Visit notes
 * - Care plan goals
 * - Patient education
 */

// ═══════════════════════════════════════════════════════════════════════════
// CORE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Patient-Level Types
 */
export interface PatientMedicationProfile {
  patientId: string;
  allergies: Allergy[];
  intolerances: Intolerance[];
  historicalMedications: HistoricalMedication[];
  pharmacies: Pharmacy[];
  preferences: MedicationPreferences;
  lastUpdated: string;
  updatedBy: string;
}

export interface Allergy {
  id: string;
  allergen: string;
  allergenType: 'medication' | 'food' | 'environmental' | 'other';
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life-threatening';
  onsetDate?: string;
  status: 'active' | 'inactive' | 'resolved';
  verificationStatus: 'confirmed' | 'unconfirmed' | 'patient-reported';
  documentedBy: string;
  documentedDate: string;
  notes?: string;
}

export interface Intolerance {
  id: string;
  substance: string;
  reaction: string;
  severity: 'mild' | 'moderate' | 'severe';
  status: 'active' | 'inactive';
  notes?: string;
}

export interface HistoricalMedication {
  id: string;
  medicationName: string;
  genericName?: string;
  ndcCode?: string;
  dose: string;
  route: string;
  frequency: string;
  indication?: string;
  prescriber?: string;
  startDate?: string;
  endDate?: string;
  discontinuedReason?: string;
  admissionId?: string; // Links to specific admission
  status: 'current' | 'discontinued' | 'completed';
}

export interface Pharmacy {
  id: string;
  name: string;
  type: 'retail' | 'mail-order' | 'specialty' | 'other';
  phone: string;
  fax?: string;
  address: Address;
  isPrimary: boolean;
  isActive: boolean;
}

export interface MedicationPreferences {
  preferredPharmacyId?: string;
  pillOrganizer: boolean;
  needsAssistance: boolean;
  administrationNotes?: string;
}

/**
 * Admission-Level Types
 */
export interface AdmissionMedicationReview {
  admissionId: string;
  patientId: string;
  reconciliationStatus: 'pending' | 'in-progress' | 'completed' | 'verified';
  reconciliationDate?: string;
  reconciledBy?: string;
  currentMedications: AdmissionMedication[];
  medicationChanges: MedicationChange[];
  alerts: MedicationAlert[];
  assessmentResponses: AssessmentMedicationResponse[];
  goals: MedicationGoal[];
  lastReviewDate?: string;
  lastReviewedBy?: string;
}

export interface AdmissionMedication {
  id: string;
  admissionId: string;
  medicationName: string;
  genericName?: string;
  ndcCode?: string;
  rxNumber?: string;
  dose: string;
  route: MedicationRoute;
  frequency: string;
  indication: string;
  prescriber: string;
  prescriberNPI?: string;
  pharmacyId?: string;
  startDate: string;
  endDate?: string;
  status: MedicationStatus;
  source: MedicationSource;
  isHighRisk: boolean;
  requiresMonitoring: boolean;
  instructions?: string;
  prn: boolean;
  prnReason?: string;
  addedDate: string;
  addedBy: string;
  modifiedDate?: string;
  modifiedBy?: string;
  discontinuedDate?: string;
  discontinuedBy?: string;
  discontinuedReason?: string;
}

export type MedicationRoute = 
  | 'oral' 
  | 'sublingual' 
  | 'topical' 
  | 'transdermal' 
  | 'inhalation'
  | 'injection-subcutaneous'
  | 'injection-intramuscular'
  | 'injection-intravenous'
  | 'rectal'
  | 'ophthalmic'
  | 'otic'
  | 'nasal'
  | 'other';

export type MedicationStatus = 
  | 'active' 
  | 'held' 
  | 'discontinued' 
  | 'completed'
  | 'pending-verification';

export type MedicationSource = 
  | 'referral' 
  | 'patient-reported' 
  | 'caregiver-reported'
  | 'pharmacy'
  | 'physician-order'
  | 'hospital-discharge'
  | 'home-health-nurse';

export interface MedicationChange {
  id: string;
  admissionId: string;
  medicationId?: string; // null for new medications
  changeType: 'added' | 'modified' | 'discontinued' | 'held' | 'resumed';
  changeDate: string;
  changedBy: string;
  changedByRole: string;
  reason: string;
  previousValue?: Partial<AdmissionMedication>;
  newValue?: Partial<AdmissionMedication>;
  orderId?: string; // Links to physician order
  visitId?: string; // Links to visit
  notifiedPhysician: boolean;
  notifiedPharmacy: boolean;
  notes?: string;
}

export interface MedicationAlert {
  id: string;
  admissionId: string;
  alertType: 
    | 'drug-interaction' 
    | 'allergy' 
    | 'duplicate-therapy'
    | 'high-risk'
    | 'dosage-concern'
    | 'monitoring-required'
    | 'compliance-issue';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  message: string;
  affectedMedicationIds: string[];
  status: 'active' | 'acknowledged' | 'resolved';
  createdDate: string;
  acknowledgedDate?: string;
  acknowledgedBy?: string;
  resolvedDate?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface AssessmentMedicationResponse {
  id: string;
  admissionId: string;
  assessmentId: string;
  assessmentType: 'OASIS-E' | 'HOPE' | 'custom';
  questionId: string;
  questionCode?: string; // M2020, M2030, etc.
  questionText: string;
  response: any;
  responseDate: string;
  respondedBy: string;
  linkedMedicationIds: string[];
}

export interface MedicationGoal {
  id: string;
  admissionId: string;
  goalType: 
    | 'compliance-improvement'
    | 'side-effect-management'
    | 'education'
    | 'self-administration'
    | 'pain-management'
    | 'other';
  description: string;
  targetDate?: string;
  status: 'active' | 'achieved' | 'not-achieved' | 'discontinued';
  relatedMedicationIds: string[];
  interventions: string[];
  outcomes?: string;
  createdDate: string;
  createdBy: string;
  updatedDate?: string;
  updatedBy?: string;
}

/**
 * Visit-Level Types
 */
export interface VisitMedicationNote {
  id: string;
  visitId: string;
  admissionId: string;
  patientId: string;
  visitDate: string;
  clinicianId: string;
  clinicianName: string;
  medicationReview: VisitMedicationReview;
  teachingProvided?: MedicationTeaching[];
  complianceObservations?: ComplianceObservation[];
  patientReportedChanges?: PatientReportedChange[];
  interventions?: MedicationIntervention[];
  followUpNeeded: boolean;
  followUpReason?: string;
  createdDate: string;
  modifiedDate?: string;
}

export interface VisitMedicationReview {
  reviewPerformed: boolean;
  methodOfReview: 'visual-inspection' | 'verbal-confirmation' | 'medication-list' | 'combined';
  medicationsReviewed: string[]; // medication IDs
  discrepanciesFound: boolean;
  discrepancyDetails?: DiscrepancyDetail[];
  notes?: string;
}

export interface DiscrepancyDetail {
  medicationId: string;
  medicationName: string;
  discrepancyType: 
    | 'not-taking'
    | 'different-dose'
    | 'different-frequency'
    | 'new-medication'
    | 'discontinued-not-documented'
    | 'other';
  details: string;
  actionTaken: string;
}

export interface MedicationTeaching {
  id: string;
  medicationId: string;
  medicationName: string;
  topicsTaught: TeachingTopic[];
  teachingMethod: 'verbal' | 'demonstration' | 'written-materials' | 'video' | 'combined';
  learnerResponse: 'verbalizes-understanding' | 'demonstrates-correctly' | 'needs-reinforcement' | 'unable-to-learn';
  notes?: string;
}

export type TeachingTopic = 
  | 'purpose'
  | 'dosage'
  | 'administration-technique'
  | 'timing'
  | 'side-effects'
  | 'precautions'
  | 'storage'
  | 'what-to-report';

export interface ComplianceObservation {
  medicationId: string;
  medicationName: string;
  complianceLevel: 'fully-compliant' | 'partially-compliant' | 'non-compliant' | 'unable-to-assess';
  evidenceOfCompliance?: string;
  barriersIdentified?: string[];
  interventionsPlanned?: string[];
}

export interface PatientReportedChange {
  reportedBy: 'patient' | 'caregiver';
  changeType: 'new-medication' | 'stopped-medication' | 'dose-change' | 'frequency-change' | 'side-effect';
  medicationName: string;
  details: string;
  verified: boolean;
  actionTaken: string;
}

export interface MedicationIntervention {
  interventionType:
    | 'education'
    | 'coordination-with-pharmacy'
    | 'coordination-with-physician'
    | 'medication-organizer-setup'
    | 'caregiver-training'
    | 'side-effect-management'
    | 'adherence-support'
    | 'other';
  description: string;
  outcome?: string;
}

/**
 * Common Types
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION GATEWAY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Centralized data access layer for medication management
 */
export class MedicationGateway {
  /**
   * PATIENT-LEVEL OPERATIONS
   */
  
  async getPatientMedicationProfile(patientId: string): Promise<PatientMedicationProfile> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async updatePatientAllergies(
    patientId: string, 
    allergies: Allergy[]
  ): Promise<PatientMedicationProfile> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async addPatientPharmacy(
    patientId: string, 
    pharmacy: Pharmacy
  ): Promise<PatientMedicationProfile> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  /**
   * ADMISSION-LEVEL OPERATIONS
   */
  
  async getAdmissionMedicationReview(admissionId: string): Promise<AdmissionMedicationReview> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async addAdmissionMedication(
    admissionId: string,
    medication: Omit<AdmissionMedication, 'id' | 'addedDate' | 'addedBy'>
  ): Promise<AdmissionMedication> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async updateAdmissionMedication(
    admissionId: string,
    medicationId: string,
    updates: Partial<AdmissionMedication>
  ): Promise<AdmissionMedication> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async discontinueAdmissionMedication(
    admissionId: string,
    medicationId: string,
    reason: string,
    notifyPhysician: boolean
  ): Promise<void> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async performMedicationReconciliation(
    admissionId: string,
    medications: AdmissionMedication[]
  ): Promise<AdmissionMedicationReview> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async acknowledgeMedicationAlert(
    admissionId: string,
    alertId: string,
    notes?: string
  ): Promise<MedicationAlert> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  /**
   * VISIT-LEVEL OPERATIONS
   */
  
  async createVisitMedicationNote(
    visitId: string,
    note: Omit<VisitMedicationNote, 'id' | 'createdDate'>
  ): Promise<VisitMedicationNote> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async updateVisitMedicationNote(
    visitId: string,
    noteId: string,
    updates: Partial<VisitMedicationNote>
  ): Promise<VisitMedicationNote> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async getVisitMedicationNotes(visitId: string): Promise<VisitMedicationNote[]> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  /**
   * CROSS-LEVEL OPERATIONS
   */
  
  async getMedicationTimeline(
    patientId: string,
    startDate?: string,
    endDate?: string
  ): Promise<MedicationTimelineEvent[]> {
    // TODO: Replace with real API call
    throw new Error('Not implemented');
  }

  async checkDrugInteractions(medicationIds: string[]): Promise<MedicationAlert[]> {
    // TODO: Replace with real API call - integrate with drug interaction database
    throw new Error('Not implemented');
  }

  async searchMedications(query: string): Promise<MedicationSearchResult[]> {
    // TODO: Replace with real API call - integrate with drug database
    throw new Error('Not implemented');
  }
}

export interface MedicationTimelineEvent {
  date: string;
  eventType: 'added' | 'modified' | 'discontinued' | 'allergy-documented' | 'teaching-provided';
  level: 'patient' | 'admission' | 'visit';
  description: string;
  medicationName?: string;
  performedBy: string;
  admissionId?: string;
  visitId?: string;
  details?: any;
}

export interface MedicationSearchResult {
  medicationName: string;
  genericName: string;
  ndcCode: string;
  strength?: string;
  dosageForm: string;
  manufacturer?: string;
  isHighRisk: boolean;
  drugClass?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION VALIDATION & SAFETY
// ═══════════════════════════════════════════════════════════════════════════

export class MedicationSafetyService {
  /**
   * Check for drug-drug interactions
   */
  async checkDrugInteractions(
    medications: AdmissionMedication[]
  ): Promise<MedicationAlert[]> {
    // TODO: Integrate with drug interaction database (e.g., Lexicomp, Micromedex)
    const alerts: MedicationAlert[] = [];
    
    // Example logic (replace with real drug interaction checking)
    // Check for common dangerous combinations
    
    return alerts;
  }

  /**
   * Check medications against patient allergies
   */
  checkAllergies(
    medications: AdmissionMedication[],
    allergies: Allergy[]
  ): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    
    const activeAllergies = allergies.filter(a => a.status === 'active');
    
    medications.forEach(med => {
      activeAllergies.forEach(allergy => {
        if (
          med.medicationName.toLowerCase().includes(allergy.allergen.toLowerCase()) ||
          med.genericName?.toLowerCase().includes(allergy.allergen.toLowerCase())
        ) {
          alerts.push({
            id: `alert-allergy-${med.id}-${allergy.id}`,
            admissionId: med.admissionId,
            alertType: 'allergy',
            severity: allergy.severity === 'life-threatening' ? 'critical' : 
                     allergy.severity === 'severe' ? 'high' : 'medium',
            title: 'Allergy Alert',
            message: `Patient has documented ${allergy.severity} allergy to ${allergy.allergen}. Reaction: ${allergy.reaction}`,
            affectedMedicationIds: [med.id],
            status: 'active',
            createdDate: new Date().toISOString(),
          });
        }
      });
    });
    
    return alerts;
  }

  /**
   * Detect duplicate therapy
   */
  checkDuplicateTherapy(medications: AdmissionMedication[]): MedicationAlert[] {
    const alerts: MedicationAlert[] = [];
    
    // Group medications by drug class (simplified - replace with real drug class checking)
    const medicationsByClass = new Map<string, AdmissionMedication[]>();
    
    medications.forEach(med => {
      // TODO: Use real drug classification system
      const drugClass = this.getDrugClass(med.medicationName);
      if (!medicationsByClass.has(drugClass)) {
        medicationsByClass.set(drugClass, []);
      }
      medicationsByClass.get(drugClass)!.push(med);
    });
    
    // Check for duplicates
    medicationsByClass.forEach((meds, drugClass) => {
      if (meds.length > 1 && drugClass !== 'unknown') {
        alerts.push({
          id: `alert-duplicate-${drugClass}-${Date.now()}`,
          admissionId: meds[0].admissionId,
          alertType: 'duplicate-therapy',
          severity: 'medium',
          title: 'Potential Duplicate Therapy',
          message: `Patient is on ${meds.length} medications in the same drug class (${drugClass})`,
          affectedMedicationIds: meds.map(m => m.id),
          status: 'active',
          createdDate: new Date().toISOString(),
        });
      }
    });
    
    return alerts;
  }

  /**
   * Identify high-risk medications
   */
  identifyHighRiskMedications(medications: AdmissionMedication[]): string[] {
    const highRiskClasses = [
      'anticoagulant',
      'insulin',
      'hypoglycemic',
      'opioid',
      'immunosuppressant',
      'chemotherapy',
    ];
    
    return medications
      .filter(med => {
        const drugClass = this.getDrugClass(med.medicationName).toLowerCase();
        return highRiskClasses.some(riskClass => drugClass.includes(riskClass));
      })
      .map(med => med.id);
  }

  /**
   * Helper to get drug class (simplified - replace with real classification)
   */
  private getDrugClass(medicationName: string): string {
    const name = medicationName.toLowerCase();
    
    if (name.includes('warfarin') || name.includes('coumadin')) return 'anticoagulant';
    if (name.includes('insulin')) return 'insulin';
    if (name.includes('metformin') || name.includes('glipizide')) return 'hypoglycemic';
    if (name.includes('oxycodone') || name.includes('morphine')) return 'opioid';
    if (name.includes('lisinopril') || name.includes('enalapril')) return 'ace-inhibitor';
    if (name.includes('metoprolol') || name.includes('atenolol')) return 'beta-blocker';
    if (name.includes('atorvastatin') || name.includes('simvastatin')) return 'statin';
    
    return 'unknown';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MEDICATION RECONCILIATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class MedicationReconciliationService {
  /**
   * Compare patient historical medications with admission medications
   */
  reconcileMedications(
    historicalMedications: HistoricalMedication[],
    admissionMedications: AdmissionMedication[]
  ): ReconciliationResult {
    const currentHistorical = historicalMedications.filter(m => m.status === 'current');
    
    const matches: MedicationMatch[] = [];
    const unaccounted: HistoricalMedication[] = [];
    const newMedications: AdmissionMedication[] = [];
    
    // Find matches and unaccounted
    currentHistorical.forEach(hist => {
      const match = admissionMedications.find(adm => 
        this.isSameMedication(hist.medicationName, adm.medicationName)
      );
      
      if (match) {
        const dosageMatches = this.compareDosage(hist.dose, match.dose);
        const frequencyMatches = this.compareFrequency(hist.frequency, match.frequency);
        
        matches.push({
          historical: hist,
          admission: match,
          dosageMatches,
          frequencyMatches,
          fullyReconciled: dosageMatches && frequencyMatches,
        });
      } else {
        unaccounted.push(hist);
      }
    });
    
    // Find new medications
    admissionMedications.forEach(adm => {
      const hasMatch = matches.some(m => m.admission.id === adm.id);
      if (!hasMatch) {
        newMedications.push(adm);
      }
    });
    
    const isComplete = unaccounted.length === 0 && 
                      matches.every(m => m.fullyReconciled);
    
    return {
      isComplete,
      matches,
      unaccounted,
      newMedications,
      summary: {
        totalHistorical: currentHistorical.length,
        matched: matches.length,
        unaccounted: unaccounted.length,
        new: newMedications.length,
      },
    };
  }

  private isSameMedication(name1: string, name2: string): boolean {
    // Simplified comparison - replace with proper drug name matching
    return name1.toLowerCase().includes(name2.toLowerCase()) ||
           name2.toLowerCase().includes(name1.toLowerCase());
  }

  private compareDosage(dose1: string, dose2: string): boolean {
    // Simplified comparison - replace with proper dosage parsing
    return dose1.toLowerCase() === dose2.toLowerCase();
  }

  private compareFrequency(freq1: string, freq2: string): boolean {
    // Simplified comparison - replace with proper frequency parsing
    return freq1.toLowerCase() === freq2.toLowerCase();
  }
}

export interface ReconciliationResult {
  isComplete: boolean;
  matches: MedicationMatch[];
  unaccounted: HistoricalMedication[];
  newMedications: AdmissionMedication[];
  summary: {
    totalHistorical: number;
    matched: number;
    unaccounted: number;
    new: number;
  };
}

export interface MedicationMatch {
  historical: HistoricalMedication;
  admission: AdmissionMedication;
  dosageMatches: boolean;
  frequencyMatches: boolean;
  fullyReconciled: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON INSTANCES
// ═══════════════════════════════════════════════════════════════════════════

export const medicationGateway = new MedicationGateway();
export const medicationSafety = new MedicationSafetyService();
export const medicationReconciliation = new MedicationReconciliationService();
