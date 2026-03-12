/**
 * Care Plan Library Service
 * 
 * Pre-defined templates for common problems, goals, and interventions.
 * Improves documentation speed and consistency.
 * 
 * FEATURES:
 * - Searchable library
 * - Category-based organization
 * - Discipline-specific templates
 * - ICD-10 code mappings
 * - Customizable after insertion
 * - Frequency variations
 */

import type {
  Problem,
  Goal,
  Intervention,
  DisciplineType,
  ProblemSeverity,
} from './carePlan';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ProblemTemplate {
  id: string;
  name: string;
  description: string;
  icd10Code: string;
  icd10Description: string;
  severity: ProblemSeverity;
  category: ProblemCategory;
  commonGoals: string[]; // IDs of related goal templates
  tags: string[];
}

export interface GoalTemplate {
  id: string;
  name: string;
  description: string;
  measurableCriteria: string;
  targetValue: string;
  disciplines: DisciplineType[];
  primaryDiscipline: DisciplineType;
  category: GoalCategory;
  defaultDurationDays: number;
  commonInterventions: string[]; // IDs of related intervention templates
  tags: string[];
}

export interface InterventionTemplate {
  id: string;
  name: string;
  description: string;
  instructions: string;
  frequency: string;
  duration: string;
  disciplines: DisciplineType[];
  primaryDiscipline: DisciplineType;
  category: InterventionCategory;
  requiresTeaching: boolean;
  precautions?: string[];
  tags: string[];
}

export type ProblemCategory =
  | 'cardiac'
  | 'respiratory'
  | 'neurological'
  | 'musculoskeletal'
  | 'endocrine'
  | 'gastrointestinal'
  | 'genitourinary'
  | 'integumentary'
  | 'psychosocial'
  | 'pain'
  | 'nutrition'
  | 'safety';

export type GoalCategory =
  | 'functional-mobility'
  | 'adl-independence'
  | 'pain-management'
  | 'wound-healing'
  | 'medication-management'
  | 'safety-education'
  | 'disease-management'
  | 'nutrition-hydration'
  | 'psychosocial'
  | 'communication';

export type InterventionCategory =
  | 'assessment'
  | 'medication-management'
  | 'wound-care'
  | 'therapeutic-exercise'
  | 'patient-education'
  | 'adl-training'
  | 'safety-intervention'
  | 'monitoring'
  | 'psychosocial-support';

// ═══════════════════════════════════════════════════════════════════════════
// PROBLEM TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

export const PROBLEM_TEMPLATES: ProblemTemplate[] = [
  // Cardiac
  {
    id: 'prob-chf',
    name: 'Congestive Heart Failure',
    description: 'Chronic heart failure requiring ongoing management and monitoring',
    icd10Code: 'I50.9',
    icd10Description: 'Heart failure, unspecified',
    severity: 'high',
    category: 'cardiac',
    commonGoals: ['goal-cardiac-stability', 'goal-fluid-management', 'goal-medication-adherence'],
    tags: ['heart failure', 'CHF', 'cardiac', 'edema', 'dyspnea'],
  },
  {
    id: 'prob-hypertension',
    name: 'Hypertension',
    description: 'Elevated blood pressure requiring monitoring and medication management',
    icd10Code: 'I10',
    icd10Description: 'Essential (primary) hypertension',
    severity: 'medium',
    category: 'cardiac',
    commonGoals: ['goal-bp-control', 'goal-medication-adherence'],
    tags: ['hypertension', 'high blood pressure', 'HTN', 'cardiac'],
  },

  // Respiratory
  {
    id: 'prob-copd',
    name: 'Chronic Obstructive Pulmonary Disease',
    description: 'Chronic respiratory condition requiring ongoing management',
    icd10Code: 'J44.9',
    icd10Description: 'Chronic obstructive pulmonary disease, unspecified',
    severity: 'high',
    category: 'respiratory',
    commonGoals: ['goal-respiratory-function', 'goal-medication-adherence'],
    tags: ['COPD', 'respiratory', 'breathing', 'dyspnea'],
  },

  // Musculoskeletal
  {
    id: 'prob-impaired-mobility',
    name: 'Impaired Physical Mobility',
    description: 'Decreased ability to move independently due to deconditioning or weakness',
    icd10Code: 'M62.81',
    icd10Description: 'Muscle weakness (generalized)',
    severity: 'medium',
    category: 'musculoskeletal',
    commonGoals: ['goal-functional-ambulation', 'goal-transfer-independence', 'goal-fall-prevention'],
    tags: ['mobility', 'weakness', 'deconditioning', 'ambulation'],
  },
  {
    id: 'prob-fall-risk',
    name: 'Risk for Falls',
    description: 'Increased vulnerability to falls due to multiple risk factors',
    icd10Code: 'R29.6',
    icd10Description: 'Repeated falls',
    severity: 'high',
    category: 'safety',
    commonGoals: ['goal-fall-prevention', 'goal-safety-awareness'],
    tags: ['falls', 'safety', 'balance', 'risk'],
  },

  // Integumentary
  {
    id: 'prob-pressure-ulcer',
    name: 'Pressure Ulcer/Injury',
    description: 'Skin breakdown requiring wound care and prevention strategies',
    icd10Code: 'L89.90',
    icd10Description: 'Pressure ulcer of unspecified site, unspecified stage',
    severity: 'high',
    category: 'integumentary',
    commonGoals: ['goal-wound-healing', 'goal-pressure-prevention'],
    tags: ['pressure ulcer', 'wound', 'skin', 'decubitus'],
  },

  // Endocrine
  {
    id: 'prob-diabetes',
    name: 'Diabetes Mellitus',
    description: 'Diabetes requiring blood sugar monitoring and management',
    icd10Code: 'E11.9',
    icd10Description: 'Type 2 diabetes mellitus without complications',
    severity: 'medium',
    category: 'endocrine',
    commonGoals: ['goal-glucose-control', 'goal-diabetes-education', 'goal-medication-adherence'],
    tags: ['diabetes', 'blood sugar', 'glucose', 'DM'],
  },

  // Pain
  {
    id: 'prob-chronic-pain',
    name: 'Chronic Pain',
    description: 'Persistent pain affecting daily activities and quality of life',
    icd10Code: 'G89.29',
    icd10Description: 'Other chronic pain',
    severity: 'medium',
    category: 'pain',
    commonGoals: ['goal-pain-management', 'goal-functional-improvement'],
    tags: ['pain', 'chronic', 'discomfort'],
  },

  // Psychosocial
  {
    id: 'prob-knowledge-deficit',
    name: 'Knowledge Deficit - Medication Management',
    description: 'Patient requires education on medication regimen and disease management',
    icd10Code: 'Z71.89',
    icd10Description: 'Other specified counseling',
    severity: 'medium',
    category: 'psychosocial',
    commonGoals: ['goal-medication-knowledge', 'goal-disease-knowledge'],
    tags: ['education', 'teaching', 'medication', 'knowledge'],
  },

  // Nutrition
  {
    id: 'prob-malnutrition-risk',
    name: 'Risk for Malnutrition',
    description: 'At risk for inadequate nutrition due to decreased intake or increased needs',
    icd10Code: 'R63.6',
    icd10Description: 'Underweight',
    severity: 'medium',
    category: 'nutrition',
    commonGoals: ['goal-nutrition-improvement', 'goal-weight-maintenance'],
    tags: ['nutrition', 'malnutrition', 'weight', 'diet'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// GOAL TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_TEMPLATES: GoalTemplate[] = [
  // Cardiac Goals
  {
    id: 'goal-cardiac-stability',
    name: 'Improve Cardiac Function',
    description: 'Patient will demonstrate improved cardiac function as evidenced by decreased symptoms',
    measurableCriteria: 'Reduction in dyspnea from baseline to ≤2/10 on exertion; Reduction in lower extremity edema to trace or none',
    targetValue: 'Dyspnea ≤2/10, Edema trace or none',
    disciplines: ['skilled-nursing', 'physical-therapy'],
    primaryDiscipline: 'skilled-nursing',
    category: 'disease-management',
    defaultDurationDays: 30,
    commonInterventions: ['int-cardiac-assessment', 'int-medication-management', 'int-patient-education-cardiac'],
    tags: ['cardiac', 'heart failure', 'dyspnea', 'edema'],
  },
  {
    id: 'goal-bp-control',
    name: 'Blood Pressure Control',
    description: 'Patient will maintain blood pressure within target range',
    measurableCriteria: 'Blood pressure readings consistently 120-140/70-90 mmHg',
    targetValue: 'BP 120-140/70-90 mmHg',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'disease-management',
    defaultDurationDays: 30,
    commonInterventions: ['int-vital-signs-monitoring', 'int-medication-management'],
    tags: ['hypertension', 'blood pressure', 'vital signs'],
  },
  {
    id: 'goal-fluid-management',
    name: 'Fluid Balance Management',
    description: 'Patient will demonstrate appropriate fluid balance',
    measurableCriteria: 'Weight stable within 2 lbs of baseline; No increase in edema; Clear lung sounds',
    targetValue: 'Stable weight, trace edema, clear lungs',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'disease-management',
    defaultDurationDays: 30,
    commonInterventions: ['int-daily-weights', 'int-fluid-restriction-education'],
    tags: ['fluid', 'edema', 'weight', 'CHF'],
  },

  // Respiratory Goals
  {
    id: 'goal-respiratory-function',
    name: 'Improved Respiratory Function',
    description: 'Patient will demonstrate improved respiratory status',
    measurableCriteria: 'Oxygen saturation >92% on room air or prescribed oxygen; Respiratory rate 12-20/min; Clear lung sounds',
    targetValue: 'SpO2 >92%, RR 12-20, clear lungs',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'disease-management',
    defaultDurationDays: 30,
    commonInterventions: ['int-respiratory-assessment', 'int-oxygen-management', 'int-breathing-exercises'],
    tags: ['respiratory', 'breathing', 'oxygen', 'COPD'],
  },

  // Mobility Goals
  {
    id: 'goal-functional-ambulation',
    name: 'Improve Functional Mobility',
    description: 'Patient will ambulate specified distance independently with assistive device',
    measurableCriteria: 'Ambulate 50 feet with walker without assistance',
    targetValue: '50 feet independent ambulation with walker',
    disciplines: ['physical-therapy'],
    primaryDiscipline: 'physical-therapy',
    category: 'functional-mobility',
    defaultDurationDays: 45,
    commonInterventions: ['int-gait-training', 'int-therapeutic-exercise', 'int-balance-training'],
    tags: ['mobility', 'ambulation', 'walking', 'PT'],
  },
  {
    id: 'goal-transfer-independence',
    name: 'Safe Transfer Independence',
    description: 'Patient will perform transfers safely and independently',
    measurableCriteria: 'Transfers bed to chair, chair to toilet, and chair to standing independently with proper body mechanics',
    targetValue: 'Independent transfers with safety',
    disciplines: ['physical-therapy', 'occupational-therapy'],
    primaryDiscipline: 'physical-therapy',
    category: 'functional-mobility',
    defaultDurationDays: 30,
    commonInterventions: ['int-transfer-training', 'int-strengthening-exercises'],
    tags: ['transfers', 'mobility', 'independence', 'safety'],
  },
  {
    id: 'goal-fall-prevention',
    name: 'Reduce Fall Risk',
    description: 'Patient will demonstrate knowledge and use of fall prevention strategies',
    measurableCriteria: 'Patient verbalizes fall risk factors; Uses assistive device correctly; Environment modified for safety; No falls during episode',
    targetValue: 'Zero falls, proper device use',
    disciplines: ['physical-therapy', 'occupational-therapy', 'skilled-nursing'],
    primaryDiscipline: 'physical-therapy',
    category: 'safety-education',
    defaultDurationDays: 30,
    commonInterventions: ['int-fall-risk-education', 'int-home-safety-assessment', 'int-balance-training'],
    tags: ['falls', 'safety', 'prevention', 'education'],
  },

  // Wound Healing Goals
  {
    id: 'goal-wound-healing',
    name: 'Wound Healing Progress',
    description: 'Patient will demonstrate progressive wound healing',
    measurableCriteria: 'Wound size decreased by 50%; Healthy granulation tissue present; No signs of infection',
    targetValue: '50% size reduction, healthy tissue',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'wound-healing',
    defaultDurationDays: 60,
    commonInterventions: ['int-wound-care', 'int-wound-assessment', 'int-pressure-prevention'],
    tags: ['wound', 'healing', 'pressure ulcer', 'skin'],
  },
  {
    id: 'goal-pressure-prevention',
    name: 'Pressure Injury Prevention',
    description: 'Patient will remain free from new pressure injuries',
    measurableCriteria: 'No new pressure injuries develop; Existing pressure areas resolve; Proper positioning maintained',
    targetValue: 'Zero new pressure injuries',
    disciplines: ['skilled-nursing', 'occupational-therapy'],
    primaryDiscipline: 'skilled-nursing',
    category: 'wound-healing',
    defaultDurationDays: 60,
    commonInterventions: ['int-skin-assessment', 'int-pressure-relief', 'int-positioning-education'],
    tags: ['pressure', 'prevention', 'skin', 'positioning'],
  },

  // Medication Goals
  {
    id: 'goal-medication-adherence',
    name: 'Medication Adherence',
    description: 'Patient will manage medication regimen independently and correctly',
    measurableCriteria: 'Patient takes all medications as prescribed; Can verbalize medication purpose and dosing schedule; Reports no missed doses',
    targetValue: '100% medication adherence',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'medication-management',
    defaultDurationDays: 30,
    commonInterventions: ['int-medication-teaching', 'int-medication-setup', 'int-medication-reconciliation'],
    tags: ['medication', 'adherence', 'compliance', 'teaching'],
  },
  {
    id: 'goal-medication-knowledge',
    name: 'Medication Knowledge',
    description: 'Patient will verbalize understanding of medication regimen',
    measurableCriteria: 'Patient can name all medications, state purpose, correct dose, and timing; Can describe side effects to report',
    targetValue: '100% accuracy on medication teach-back',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'medication-management',
    defaultDurationDays: 14,
    commonInterventions: ['int-medication-teaching', 'int-medication-review'],
    tags: ['medication', 'education', 'knowledge', 'teach-back'],
  },

  // Disease Management Goals
  {
    id: 'goal-glucose-control',
    name: 'Blood Glucose Control',
    description: 'Patient will maintain blood glucose within target range',
    measurableCriteria: 'Fasting blood glucose 80-130 mg/dL; Post-prandial <180 mg/dL; HbA1c <7%',
    targetValue: 'FBG 80-130, PPG <180',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'disease-management',
    defaultDurationDays: 60,
    commonInterventions: ['int-glucose-monitoring', 'int-diabetes-education', 'int-medication-management'],
    tags: ['diabetes', 'glucose', 'blood sugar', 'HbA1c'],
  },
  {
    id: 'goal-diabetes-education',
    name: 'Diabetes Self-Management',
    description: 'Patient will demonstrate ability to self-manage diabetes',
    measurableCriteria: 'Patient correctly performs blood glucose testing; Administers insulin correctly; Recognizes hypo/hyperglycemia symptoms',
    targetValue: 'Independent diabetes management',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'disease-management',
    defaultDurationDays: 30,
    commonInterventions: ['int-diabetes-education', 'int-glucose-monitoring-teaching', 'int-insulin-teaching'],
    tags: ['diabetes', 'education', 'self-management', 'teaching'],
  },
  {
    id: 'goal-disease-knowledge',
    name: 'Disease Process Understanding',
    description: 'Patient will verbalize understanding of disease process and management',
    measurableCriteria: 'Patient can explain disease process; Identifies symptoms requiring MD notification; Demonstrates self-care strategies',
    targetValue: 'Comprehensive disease understanding',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'disease-management',
    defaultDurationDays: 21,
    commonInterventions: ['int-disease-education', 'int-symptom-management-teaching'],
    tags: ['education', 'disease', 'knowledge', 'self-care'],
  },

  // Pain Management Goals
  {
    id: 'goal-pain-management',
    name: 'Effective Pain Control',
    description: 'Patient will report pain at acceptable level for functional activities',
    measurableCriteria: 'Pain rating ≤3/10 at rest and ≤5/10 with activity; Able to perform ADLs; Sleep not interrupted by pain',
    targetValue: 'Pain ≤3/10 at rest, ≤5/10 with activity',
    disciplines: ['skilled-nursing', 'physical-therapy'],
    primaryDiscipline: 'skilled-nursing',
    category: 'pain-management',
    defaultDurationDays: 30,
    commonInterventions: ['int-pain-assessment', 'int-pain-medication-management', 'int-pain-education'],
    tags: ['pain', 'management', 'comfort', 'ADL'],
  },

  // ADL Goals
  {
    id: 'goal-adl-independence',
    name: 'ADL Independence',
    description: 'Patient will perform activities of daily living with modified independence',
    measurableCriteria: 'Patient performs bathing, dressing, grooming with adaptive equipment; Requires supervision only',
    targetValue: 'Modified independence in ADLs',
    disciplines: ['occupational-therapy'],
    primaryDiscipline: 'occupational-therapy',
    category: 'adl-independence',
    defaultDurationDays: 45,
    commonInterventions: ['int-adl-training', 'int-adaptive-equipment-training', 'int-energy-conservation'],
    tags: ['ADL', 'independence', 'bathing', 'dressing', 'OT'],
  },

  // Safety Goals
  {
    id: 'goal-safety-awareness',
    name: 'Safety Awareness',
    description: 'Patient will demonstrate understanding of safety precautions',
    measurableCriteria: 'Patient verbalizes safety risks; Uses call light appropriately; Follows safe mobility practices',
    targetValue: 'Consistent safe behaviors',
    disciplines: ['skilled-nursing', 'physical-therapy', 'occupational-therapy'],
    primaryDiscipline: 'skilled-nursing',
    category: 'safety-education',
    defaultDurationDays: 21,
    commonInterventions: ['int-safety-education', 'int-home-safety-assessment'],
    tags: ['safety', 'awareness', 'education', 'prevention'],
  },

  // Nutrition Goals
  {
    id: 'goal-nutrition-improvement',
    name: 'Improved Nutritional Status',
    description: 'Patient will demonstrate improved nutritional intake and status',
    measurableCriteria: 'Weight stable or increased by 2-5 lbs; Albumin within normal limits; Consuming 75% of meals',
    targetValue: 'Weight gain 2-5 lbs, 75% intake',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'nutrition-hydration',
    defaultDurationDays: 45,
    commonInterventions: ['int-nutrition-assessment', 'int-nutrition-education', 'int-meal-monitoring'],
    tags: ['nutrition', 'weight', 'diet', 'intake'],
  },
  {
    id: 'goal-weight-maintenance',
    name: 'Weight Maintenance',
    description: 'Patient will maintain current weight within acceptable range',
    measurableCriteria: 'Weight remains within 3 lbs of baseline; No signs of malnutrition; Adequate fluid intake',
    targetValue: 'Weight stable ±3 lbs',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'nutrition-hydration',
    defaultDurationDays: 60,
    commonInterventions: ['int-daily-weights', 'int-nutrition-monitoring'],
    tags: ['weight', 'maintenance', 'nutrition', 'monitoring'],
  },

  // Functional Improvement
  {
    id: 'goal-functional-improvement',
    name: 'Overall Functional Improvement',
    description: 'Patient will demonstrate improved functional ability for daily activities',
    measurableCriteria: 'Increased tolerance for activity; Performs ADLs with less fatigue; Reports improved quality of life',
    targetValue: 'Measurable functional improvement',
    disciplines: ['physical-therapy', 'occupational-therapy'],
    primaryDiscipline: 'physical-therapy',
    category: 'functional-mobility',
    defaultDurationDays: 45,
    commonInterventions: ['int-therapeutic-exercise', 'int-endurance-training', 'int-adl-training'],
    tags: ['functional', 'improvement', 'activity', 'quality of life'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// INTERVENTION TEMPLATES (continuing in next section due to length...)
// ═══════════════════════════════════════════════════════════════════════════

export const INTERVENTION_TEMPLATES: InterventionTemplate[] = [
  // Assessment Interventions
  {
    id: 'int-cardiac-assessment',
    name: 'Comprehensive Cardiac Assessment',
    description: 'Complete cardiovascular assessment including vital signs and symptom monitoring',
    instructions: 'Monitor blood pressure, heart rate, respiratory rate, oxygen saturation, lung sounds, peripheral edema, weight, and cardiac symptoms. Report significant changes to physician.',
    frequency: '3 times per week',
    duration: '45 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'assessment',
    requiresTeaching: true,
    precautions: ['Monitor for signs of decompensation', 'Report weight gain >2 lbs in 24 hours', 'Report increasing dyspnea or edema'],
    tags: ['cardiac', 'assessment', 'vital signs', 'CHF'],
  },
  {
    id: 'int-respiratory-assessment',
    name: 'Respiratory Assessment',
    description: 'Comprehensive respiratory assessment and monitoring',
    instructions: 'Assess respiratory rate, rhythm, effort, oxygen saturation, lung sounds, cough, sputum production. Monitor for respiratory distress.',
    frequency: '3 times per week',
    duration: '30 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'assessment',
    requiresTeaching: false,
    precautions: ['Monitor for increasing dyspnea', 'Report SpO2 <90%', 'Assess for respiratory distress'],
    tags: ['respiratory', 'assessment', 'breathing', 'oxygen'],
  },
  {
    id: 'int-wound-assessment',
    name: 'Wound Assessment and Documentation',
    description: 'Detailed wound assessment with measurements and photography',
    instructions: 'Measure wound dimensions, assess tissue type, drainage, odor, surrounding skin. Document changes. Photograph per protocol.',
    frequency: 'Weekly',
    duration: '20 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'assessment',
    requiresTeaching: false,
    precautions: ['Assess for signs of infection', 'Monitor for wound deterioration'],
    tags: ['wound', 'assessment', 'documentation', 'measurement'],
  },
  {
    id: 'int-skin-assessment',
    name: 'Comprehensive Skin Assessment',
    description: 'Head-to-toe skin inspection for pressure areas and skin breakdown',
    instructions: 'Inspect all bony prominences and pressure points. Assess skin integrity, color, temperature, turgor. Identify areas at risk.',
    frequency: 'Weekly',
    duration: '15 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'assessment',
    requiresTeaching: false,
    precautions: ['Assess high-risk areas: heels, sacrum, ischium, elbows'],
    tags: ['skin', 'assessment', 'pressure', 'prevention'],
  },
  {
    id: 'int-nutrition-assessment',
    name: 'Nutritional Assessment',
    description: 'Assessment of nutritional status and dietary intake',
    instructions: 'Assess weight, appetite, dietary intake, swallowing ability, dentition. Review food diary if available. Identify barriers to adequate nutrition.',
    frequency: 'Weekly',
    duration: '20 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'assessment',
    requiresTeaching: false,
    precautions: ['Monitor for unintended weight loss', 'Assess for dysphagia'],
    tags: ['nutrition', 'assessment', 'weight', 'diet'],
  },
  {
    id: 'int-pain-assessment',
    name: 'Pain Assessment and Management',
    description: 'Comprehensive pain assessment using standardized tools',
    instructions: 'Assess pain location, intensity (0-10 scale), quality, duration, aggravating/alleviating factors. Evaluate effectiveness of pain management interventions.',
    frequency: 'Each visit',
    duration: '10 minutes',
    disciplines: ['skilled-nursing', 'physical-therapy'],
    primaryDiscipline: 'skilled-nursing',
    category: 'assessment',
    requiresTeaching: false,
    precautions: ['Reassess pain after interventions', 'Report uncontrolled pain'],
    tags: ['pain', 'assessment', 'management', 'monitoring'],
  },

  // Medication Management Interventions
  {
    id: 'int-medication-management',
    name: 'Medication Management and Monitoring',
    description: 'Comprehensive medication management including compliance and effectiveness monitoring',
    instructions: 'Review medication list, check compliance, assess for side effects, monitor therapeutic effects, provide education as needed.',
    frequency: '3 times per week',
    duration: '20 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'medication-management',
    requiresTeaching: true,
    precautions: ['Monitor for drug interactions', 'Assess for adverse effects'],
    tags: ['medication', 'management', 'compliance', 'monitoring'],
  },
  {
    id: 'int-medication-teaching',
    name: 'Medication Education',
    description: 'Patient/caregiver education on medication regimen',
    instructions: 'Teach medication names, purposes, dosing schedules, administration techniques, side effects, when to call MD. Use teach-back method.',
    frequency: 'Each visit until independent',
    duration: '30 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    precautions: ['Assess health literacy', 'Provide written materials', 'Verify understanding'],
    tags: ['medication', 'education', 'teaching', 'teach-back'],
  },
  {
    id: 'int-medication-setup',
    name: 'Medication Setup and Organization',
    description: 'Set up medications in organizer and teach self-administration',
    instructions: 'Fill pill organizer for the week. Teach patient/caregiver to self-fill. Review each medication and timing. Label as needed.',
    frequency: 'Weekly until independent',
    duration: '30 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'medication-management',
    requiresTeaching: true,
    precautions: ['Ensure correct medications and doses', 'Verify patient understanding'],
    tags: ['medication', 'setup', 'organization', 'pill box'],
  },
  {
    id: 'int-medication-reconciliation',
    name: 'Medication Reconciliation',
    description: 'Reconcile medication list with all current medications',
    instructions: 'Review all medications including prescriptions, OTC, supplements. Compare with discharge list. Identify discrepancies. Contact MD as needed.',
    frequency: 'At admission and PRN',
    duration: '30 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'medication-management',
    requiresTeaching: false,
    precautions: ['Identify duplicate therapies', 'Check for interactions'],
    tags: ['medication', 'reconciliation', 'safety', 'review'],
  },
  {
    id: 'int-medication-review',
    name: 'Medication Review',
    description: 'Periodic review of medication regimen with patient/caregiver',
    instructions: 'Review each medication with patient. Verify understanding of purpose and dosing. Assess for problems or concerns. Reinforce teaching.',
    frequency: 'Weekly',
    duration: '20 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'medication-management',
    requiresTeaching: true,
    tags: ['medication', 'review', 'education', 'reinforcement'],
  },
  {
    id: 'int-insulin-teaching',
    name: 'Insulin Administration Teaching',
    description: 'Comprehensive insulin administration education',
    instructions: 'Teach insulin types, storage, drawing up dose, injection technique, site rotation, disposal. Supervise return demonstration.',
    frequency: 'Each visit until independent',
    duration: '30 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    precautions: ['Verify correct insulin type and dose', 'Teach hypo/hyperglycemia symptoms'],
    tags: ['insulin', 'diabetes', 'injection', 'teaching'],
  },

  // Wound Care Interventions
  {
    id: 'int-wound-care',
    name: 'Wound Care Treatment',
    description: 'Skilled wound care including cleansing, debridement, and dressing application',
    instructions: 'Cleanse wound with normal saline. Debride as needed and ordered. Apply prescribed dressing. Secure with appropriate material.',
    frequency: '3 times per week',
    duration: '45 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'wound-care',
    requiresTeaching: true,
    precautions: ['Use sterile technique', 'Monitor for infection', 'Document wound progress'],
    tags: ['wound', 'care', 'dressing', 'treatment'],
  },
  {
    id: 'int-pressure-relief',
    name: 'Pressure Relief and Positioning',
    description: 'Positioning strategies and pressure redistribution',
    instructions: 'Turn and reposition every 2 hours. Use pressure-relieving devices. Teach proper positioning techniques to patient/caregiver.',
    frequency: 'Daily (ongoing)',
    duration: 'Ongoing',
    disciplines: ['skilled-nursing', 'occupational-therapy'],
    primaryDiscipline: 'skilled-nursing',
    category: 'wound-care',
    requiresTeaching: true,
    precautions: ['Avoid positioning on existing pressure areas', 'Use appropriate support surfaces'],
    tags: ['pressure', 'positioning', 'prevention', 'turning'],
  },
  {
    id: 'int-pressure-prevention',
    name: 'Pressure Injury Prevention Education',
    description: 'Education on preventing pressure injuries',
    instructions: 'Teach importance of frequent repositioning, skin inspection, nutrition, hydration. Demonstrate pressure relief techniques.',
    frequency: 'Weekly',
    duration: '20 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['pressure', 'prevention', 'education', 'skin'],
  },
  {
    id: 'int-positioning-education',
    name: 'Positioning Education',
    description: 'Teach patient/caregiver proper positioning techniques',
    instructions: 'Demonstrate and teach proper positioning in bed and chair. Provide positioning schedule. Teach use of pillows and wedges.',
    frequency: 'Weekly until independent',
    duration: '30 minutes',
    disciplines: ['physical-therapy', 'occupational-therapy', 'skilled-nursing'],
    primaryDiscipline: 'physical-therapy',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['positioning', 'education', 'caregiver', 'teaching'],
  },

  // Therapeutic Exercise Interventions
  {
    id: 'int-gait-training',
    name: 'Gait Training',
    description: 'Progressive gait training with appropriate assistive device',
    instructions: 'Provide gait training with walker/cane. Focus on proper gait pattern, weight-bearing, safety. Progress distance and independence as tolerated.',
    frequency: '3 times per week',
    duration: '30 minutes',
    disciplines: ['physical-therapy'],
    primaryDiscipline: 'physical-therapy',
    category: 'therapeutic-exercise',
    requiresTeaching: true,
    precautions: ['Monitor vitals during activity', 'Ensure safety - fall risk', 'Progress as tolerated'],
    tags: ['gait', 'ambulation', 'walking', 'PT', 'mobility'],
  },
  {
    id: 'int-therapeutic-exercise',
    name: 'Therapeutic Exercise Program',
    description: 'Individualized therapeutic exercise program for strengthening and conditioning',
    instructions: 'Perform prescribed exercises: Range of motion, strengthening, stretching. Progress repetitions and resistance as tolerated. Teach home exercise program.',
    frequency: 'Daily',
    duration: '20 minutes',
    disciplines: ['physical-therapy', 'occupational-therapy'],
    primaryDiscipline: 'physical-therapy',
    category: 'therapeutic-exercise',
    requiresTeaching: true,
    precautions: ['Monitor for pain or fatigue', 'Ensure proper form', 'Progress gradually'],
    tags: ['exercise', 'strengthening', 'therapy', 'conditioning'],
  },
  {
    id: 'int-balance-training',
    name: 'Balance and Coordination Training',
    description: 'Balance exercises to reduce fall risk and improve stability',
    instructions: 'Perform balance activities: Standing balance, weight shifting, dynamic balance exercises. Progress difficulty as tolerated.',
    frequency: '3 times per week',
    duration: '20 minutes',
    disciplines: ['physical-therapy'],
    primaryDiscipline: 'physical-therapy',
    category: 'therapeutic-exercise',
    requiresTeaching: true,
    precautions: ['Ensure safety - fall risk', 'Provide appropriate support', 'Progress slowly'],
    tags: ['balance', 'coordination', 'fall prevention', 'PT'],
  },
  {
    id: 'int-strengthening-exercises',
    name: 'Lower Extremity Strengthening',
    description: 'Specific exercises to strengthen lower extremities',
    instructions: 'Perform exercises: Ankle pumps, quad sets, straight leg raises, hip abduction, heel slides. 10 repetitions each, 2-3 sets.',
    frequency: 'Daily',
    duration: '15 minutes',
    disciplines: ['physical-therapy'],
    primaryDiscipline: 'physical-therapy',
    category: 'therapeutic-exercise',
    requiresTeaching: true,
    precautions: ['Monitor for pain', 'Ensure proper technique'],
    tags: ['strengthening', 'exercise', 'lower extremity', 'legs'],
  },
  {
    id: 'int-transfer-training',
    name: 'Transfer Training',
    description: 'Training in safe transfer techniques',
    instructions: 'Teach and practice transfers: Bed to chair, chair to toilet, chair to standing. Focus on proper body mechanics and safety.',
    frequency: '3 times per week',
    duration: '30 minutes',
    disciplines: ['physical-therapy', 'occupational-therapy'],
    primaryDiscipline: 'physical-therapy',
    category: 'adl-training',
    requiresTeaching: true,
    precautions: ['Ensure safety - fall risk', 'Assess environment'],
    tags: ['transfers', 'training', 'safety', 'mobility'],
  },
  {
    id: 'int-endurance-training',
    name: 'Endurance and Activity Tolerance Training',
    description: 'Progressive activity training to improve endurance',
    instructions: 'Gradually increase activity duration and intensity. Monitor vital signs and symptoms. Teach pacing and energy conservation.',
    frequency: '3 times per week',
    duration: '30 minutes',
    disciplines: ['physical-therapy', 'occupational-therapy'],
    primaryDiscipline: 'physical-therapy',
    category: 'therapeutic-exercise',
    requiresTeaching: true,
    precautions: ['Monitor vitals', 'Watch for fatigue', 'Progress gradually'],
    tags: ['endurance', 'activity tolerance', 'conditioning', 'stamina'],
  },

  // Patient Education Interventions
  {
    id: 'int-patient-education-cardiac',
    name: 'Cardiac Disease Education',
    description: 'Comprehensive education on heart failure management',
    instructions: 'Teach disease process, signs/symptoms of decompensation, daily weights, fluid restriction, low-sodium diet, medication importance, when to call MD.',
    frequency: 'Weekly',
    duration: '30 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    precautions: ['Assess health literacy', 'Use teach-back method', 'Provide written materials'],
    tags: ['education', 'cardiac', 'CHF', 'disease management'],
  },
  {
    id: 'int-diabetes-education',
    name: 'Diabetes Self-Management Education',
    description: 'Comprehensive diabetes education',
    instructions: 'Teach disease process, blood glucose monitoring, medication administration, diet, exercise, foot care, signs of hypo/hyperglycemia.',
    frequency: 'Weekly',
    duration: '45 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    precautions: ['Assess readiness to learn', 'Provide educational materials'],
    tags: ['diabetes', 'education', 'self-management', 'teaching'],
  },
  {
    id: 'int-disease-education',
    name: 'Disease Process Education',
    description: 'Education on specific disease process and management',
    instructions: 'Teach patient/caregiver about disease process, expected symptoms, management strategies, when to seek medical attention.',
    frequency: 'Weekly',
    duration: '30 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['education', 'disease', 'teaching', 'management'],
  },
  {
    id: 'int-fall-risk-education',
    name: 'Fall Prevention Education',
    description: 'Comprehensive fall prevention education',
    instructions: 'Teach fall risk factors, proper use of assistive devices, home safety modifications, safe mobility practices, when to ask for help.',
    frequency: 'Weekly',
    duration: '30 minutes',
    disciplines: ['physical-therapy', 'occupational-therapy', 'skilled-nursing'],
    primaryDiscipline: 'physical-therapy',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['fall prevention', 'education', 'safety', 'teaching'],
  },
  {
    id: 'int-safety-education',
    name: 'Home Safety Education',
    description: 'Education on home safety and fall prevention',
    instructions: 'Teach home safety: Remove hazards, adequate lighting, bathroom safety, safe mobility. Provide safety checklist.',
    frequency: 'At admission',
    duration: '30 minutes',
    disciplines: ['occupational-therapy', 'skilled-nursing'],
    primaryDiscipline: 'occupational-therapy',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['safety', 'education', 'home', 'fall prevention'],
  },
  {
    id: 'int-nutrition-education',
    name: 'Nutrition Education',
    description: 'Diet and nutrition counseling',
    instructions: 'Teach prescribed diet (low sodium, diabetic, etc.). Provide meal planning tips. Discuss food choices and portions. Address barriers.',
    frequency: 'Weekly',
    duration: '30 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['nutrition', 'education', 'diet', 'teaching'],
  },
  {
    id: 'int-symptom-management-teaching',
    name: 'Symptom Management Education',
    description: 'Teach patient to recognize and manage symptoms',
    instructions: 'Educate on symptom recognition, self-management strategies, when symptoms require medical attention, documentation of symptoms.',
    frequency: 'Weekly',
    duration: '20 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['symptom', 'management', 'education', 'self-care'],
  },
  {
    id: 'int-pain-education',
    name: 'Pain Management Education',
    description: 'Education on pain management strategies',
    instructions: 'Teach pain assessment, medication use, non-pharmacological pain management, when to report pain to provider.',
    frequency: 'Weekly',
    duration: '20 minutes',
    disciplines: ['skilled-nursing', 'physical-therapy'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['pain', 'education', 'management', 'teaching'],
  },
  {
    id: 'int-glucose-monitoring-teaching',
    name: 'Blood Glucose Monitoring Teaching',
    description: 'Teach blood glucose self-monitoring',
    instructions: 'Teach glucometer use, proper technique, recording results, target ranges, quality control. Supervise return demonstration.',
    frequency: 'Each visit until independent',
    duration: '30 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['glucose', 'monitoring', 'diabetes', 'teaching'],
  },

  // ADL Training Interventions
  {
    id: 'int-adl-training',
    name: 'Activities of Daily Living Training',
    description: 'Training in performance of daily self-care activities',
    instructions: 'Train patient in bathing, dressing, grooming, toileting. Teach use of adaptive equipment. Progress toward independence.',
    frequency: '3 times per week',
    duration: '45 minutes',
    disciplines: ['occupational-therapy'],
    primaryDiscipline: 'occupational-therapy',
    category: 'adl-training',
    requiresTeaching: true,
    precautions: ['Ensure safety during activities', 'Monitor for fatigue'],
    tags: ['ADL', 'training', 'independence', 'OT'],
  },
  {
    id: 'int-adaptive-equipment-training',
    name: 'Adaptive Equipment Training',
    description: 'Training in use of adaptive equipment for ADLs',
    instructions: 'Teach use of adaptive equipment: Reacher, sock aid, long-handled sponge, dressing stick, etc. Ensure proper use and safety.',
    frequency: '2 times per week',
    duration: '30 minutes',
    disciplines: ['occupational-therapy'],
    primaryDiscipline: 'occupational-therapy',
    category: 'adl-training',
    requiresTeaching: true,
    tags: ['adaptive equipment', 'ADL', 'OT', 'independence'],
  },
  {
    id: 'int-energy-conservation',
    name: 'Energy Conservation Techniques',
    description: 'Teach energy conservation and work simplification',
    instructions: 'Teach pacing, rest breaks, activity modification, prioritization. Demonstrate energy-saving techniques for ADLs.',
    frequency: 'Weekly',
    duration: '30 minutes',
    disciplines: ['occupational-therapy'],
    primaryDiscipline: 'occupational-therapy',
    category: 'adl-training',
    requiresTeaching: true,
    tags: ['energy conservation', 'pacing', 'fatigue', 'OT'],
  },

  // Monitoring Interventions
  {
    id: 'int-vital-signs-monitoring',
    name: 'Vital Signs Monitoring',
    description: 'Routine vital signs monitoring and documentation',
    instructions: 'Monitor and document blood pressure, heart rate, temperature, respiratory rate, oxygen saturation. Report abnormal findings.',
    frequency: '3 times per week',
    duration: '15 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'monitoring',
    requiresTeaching: true,
    precautions: ['Report abnormal vital signs', 'Follow parameters for MD notification'],
    tags: ['vital signs', 'monitoring', 'assessment'],
  },
  {
    id: 'int-daily-weights',
    name: 'Daily Weight Monitoring',
    description: 'Daily weight monitoring for fluid management',
    instructions: 'Teach patient to weigh daily at same time, same scale, after voiding, before breakfast. Record and report significant changes.',
    frequency: 'Daily (patient performed)',
    duration: '5 minutes teaching',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'monitoring',
    requiresTeaching: true,
    precautions: ['Report weight gain >2 lbs in 24 hours or >5 lbs in week'],
    tags: ['weight', 'monitoring', 'CHF', 'fluid'],
  },
  {
    id: 'int-glucose-monitoring',
    name: 'Blood Glucose Monitoring',
    description: 'Blood glucose monitoring per physician orders',
    instructions: 'Monitor blood glucose per ordered schedule. Document results. Report out-of-range values. Adjust insulin per sliding scale if ordered.',
    frequency: 'Per MD orders',
    duration: '15 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'monitoring',
    requiresTeaching: true,
    precautions: ['Report values <70 or >250', 'Assess for hypo/hyperglycemia symptoms'],
    tags: ['glucose', 'monitoring', 'diabetes', 'blood sugar'],
  },
  {
    id: 'int-oxygen-management',
    name: 'Oxygen Therapy Management',
    description: 'Oxygen therapy administration and monitoring',
    instructions: 'Administer oxygen per orders. Monitor oxygen saturation. Assess respiratory status. Teach safe oxygen use.',
    frequency: 'Each visit',
    duration: '20 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'monitoring',
    requiresTeaching: true,
    precautions: ['Ensure oxygen safety', 'Monitor for oxygen toxicity', 'Check equipment function'],
    tags: ['oxygen', 'respiratory', 'therapy', 'monitoring'],
  },
  {
    id: 'int-nutrition-monitoring',
    name: 'Nutritional Intake Monitoring',
    description: 'Monitor and document nutritional intake',
    instructions: 'Assess and document dietary intake. Monitor weight trends. Identify barriers to adequate nutrition. Provide education as needed.',
    frequency: 'Weekly',
    duration: '15 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'monitoring',
    requiresTeaching: false,
    tags: ['nutrition', 'monitoring', 'intake', 'diet'],
  },
  {
    id: 'int-meal-monitoring',
    name: 'Meal Intake Monitoring',
    description: 'Monitor percentage of meals consumed',
    instructions: 'Document percentage of meals consumed. Assess appetite and barriers. Encourage adequate intake. Report concerns.',
    frequency: 'Daily',
    duration: '10 minutes',
    disciplines: ['skilled-nursing', 'home-health-aide'],
    primaryDiscipline: 'skilled-nursing',
    category: 'monitoring',
    requiresTeaching: false,
    tags: ['meal', 'intake', 'nutrition', 'monitoring'],
  },
  {
    id: 'int-pain-medication-management',
    name: 'Pain Medication Management',
    description: 'Management and monitoring of pain medications',
    instructions: 'Administer pain medications as ordered. Assess pain before and after. Monitor for effectiveness and side effects. Teach patient about pain meds.',
    frequency: 'Per pain medication schedule',
    duration: '20 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'medication-management',
    requiresTeaching: true,
    precautions: ['Monitor for over-sedation', 'Assess bowel function with opioids'],
    tags: ['pain', 'medication', 'management', 'monitoring'],
  },

  // Other Interventions
  {
    id: 'int-breathing-exercises',
    name: 'Breathing Exercises and Techniques',
    description: 'Teach breathing techniques to improve respiratory function',
    instructions: 'Teach pursed-lip breathing, diaphragmatic breathing, coughing techniques. Practice with patient. Encourage daily performance.',
    frequency: '3 times per week',
    duration: '20 minutes',
    disciplines: ['skilled-nursing', 'physical-therapy'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['breathing', 'respiratory', 'exercises', 'COPD'],
  },
  {
    id: 'int-fluid-restriction-education',
    name: 'Fluid Restriction Education',
    description: 'Education on fluid restriction for heart failure',
    instructions: 'Teach prescribed fluid restriction (typically 2L/day). Provide measuring tips. Teach to spread fluids throughout day. Reinforce importance.',
    frequency: 'Weekly',
    duration: '20 minutes',
    disciplines: ['skilled-nursing'],
    primaryDiscipline: 'skilled-nursing',
    category: 'patient-education',
    requiresTeaching: true,
    tags: ['fluid restriction', 'CHF', 'education', 'diet'],
  },
  {
    id: 'int-home-safety-assessment',
    name: 'Home Safety Assessment',
    description: 'Comprehensive home safety evaluation',
    instructions: 'Assess home for fall hazards, lighting, bathroom safety, stairs, rugs, clutter. Provide recommendations for modifications.',
    frequency: 'At admission',
    duration: '45 minutes',
    disciplines: ['occupational-therapy', 'physical-therapy'],
    primaryDiscipline: 'occupational-therapy',
    category: 'safety-intervention',
    requiresTeaching: true,
    tags: ['home safety', 'assessment', 'fall prevention', 'environment'],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// LIBRARY SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class CarePlanLibraryService {
  /**
   * Search problems by keyword
   */
  searchProblems(query: string): ProblemTemplate[] {
    const lowerQuery = query.toLowerCase();
    return PROBLEM_TEMPLATES.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.icd10Code.toLowerCase().includes(lowerQuery) ||
        p.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Search goals by keyword
   */
  searchGoals(query: string): GoalTemplate[] {
    const lowerQuery = query.toLowerCase();
    return GOAL_TEMPLATES.filter(
      (g) =>
        g.name.toLowerCase().includes(lowerQuery) ||
        g.description.toLowerCase().includes(lowerQuery) ||
        g.measurableCriteria.toLowerCase().includes(lowerQuery) ||
        g.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Search interventions by keyword
   */
  searchInterventions(query: string): InterventionTemplate[] {
    const lowerQuery = query.toLowerCase();
    return INTERVENTION_TEMPLATES.filter(
      (i) =>
        i.name.toLowerCase().includes(lowerQuery) ||
        i.description.toLowerCase().includes(lowerQuery) ||
        i.instructions.toLowerCase().includes(lowerQuery) ||
        i.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Filter problems by category
   */
  filterProblemsByCategory(category: ProblemCategory): ProblemTemplate[] {
    return PROBLEM_TEMPLATES.filter((p) => p.category === category);
  }

  /**
   * Filter goals by category
   */
  filterGoalsByCategory(category: GoalCategory): GoalTemplate[] {
    return GOAL_TEMPLATES.filter((g) => g.category === category);
  }

  /**
   * Filter goals by discipline
   */
  filterGoalsByDiscipline(discipline: DisciplineType): GoalTemplate[] {
    return GOAL_TEMPLATES.filter((g) => g.disciplines.includes(discipline));
  }

  /**
   * Filter interventions by category
   */
  filterInterventionsByCategory(category: InterventionCategory): InterventionTemplate[] {
    return INTERVENTION_TEMPLATES.filter((i) => i.category === category);
  }

  /**
   * Filter interventions by discipline
   */
  filterInterventionsByDiscipline(discipline: DisciplineType): InterventionTemplate[] {
    return INTERVENTION_TEMPLATES.filter((i) => i.disciplines.includes(discipline));
  }

  /**
   * Get recommended goals for a problem
   */
  getRecommendedGoals(problemId: string): GoalTemplate[] {
    const problem = PROBLEM_TEMPLATES.find((p) => p.id === problemId);
    if (!problem) return [];
    return GOAL_TEMPLATES.filter((g) => problem.commonGoals.includes(g.id));
  }

  /**
   * Get recommended interventions for a goal
   */
  getRecommendedInterventions(goalId: string): InterventionTemplate[] {
    const goal = GOAL_TEMPLATES.find((g) => g.id === goalId);
    if (!goal) return [];
    return INTERVENTION_TEMPLATES.filter((i) => goal.commonInterventions.includes(i.id));
  }
}

// Singleton instance
export const carePlanLibraryService = new CarePlanLibraryService();