/**
 * Clinical Documentation Form Templates
 * 
 * Comprehensive templates for all documentation types:
 * - Visit Documentation (skilled nursing, therapy, social work, aide)
 * - Assessment Documentation (OASIS-E, HOPE, comprehensive assessments)
 * - Episode Documentation (plans of care, physician orders, certifications)
 * 
 * In production, these would be fetched from the server / admin config.
 */

import type { 
  DocumentTemplate, 
  FormSectionDef, 
  FormTemplateType,
  DocumentType,
  VisitDocumentType,
  AssessmentDocumentType,
  EpisodeDocumentType
} from './documentationTypes';

// For backwards compatibility
import type { FormTemplate } from './documentationTypes';

// ═══════════════════════════════════════════════════════════════════════════
// VISIT DOCUMENTATION TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════

// ─── Skilled Nursing Visit Note Template ────────────────────────────────────

const SKILLED_NURSING_SECTIONS: FormSectionDef[] = [
  {
    id: 'visit_details',
    title: 'Visit Details',
    description: 'Date, time, and purpose of the visit',
    icon: 'calendar',
    order: 1,
    fields: [
      { id: 'visit_date', label: 'Visit Date', type: 'date', required: true },
      { id: 'visit_time_in', label: 'Time In', type: 'time', required: true },
      { id: 'visit_time_out', label: 'Time Out', type: 'time', required: true },
      { id: 'visit_type', label: 'Visit Type', type: 'select', required: true, options: [
        { value: 'routine', label: 'Routine Visit' },
        { value: 'prn', label: 'PRN Visit' },
        { value: 'supervisory', label: 'Supervisory Visit' },
        { value: 'recert', label: 'Recertification' },
        { value: 'discharge', label: 'Discharge Visit' },
      ]},
      { id: 'visit_purpose', label: 'Visit Purpose / Narrative', type: 'textarea', required: true, smartPhraseCategory: 'visit_purpose', placeholder: 'Describe the purpose and skilled interventions for this visit...', maxLength: 2000 },
    ],
  },
  {
    id: 'clinical_observations',
    title: 'Clinical Observations',
    description: 'Vital signs and general assessment findings',
    icon: 'activity',
    order: 2,
    fields: [
      { id: 'systolic_bp', label: 'Systolic BP (mmHg)', type: 'number', required: true, min: 60, max: 300 },
      { id: 'diastolic_bp', label: 'Diastolic BP (mmHg)', type: 'number', required: true, min: 30, max: 200 },
      { id: 'heart_rate', label: 'Heart Rate (bpm)', type: 'number', required: true, min: 30, max: 250 },
      { id: 'respiratory_rate', label: 'Respiratory Rate', type: 'number', required: true, min: 4, max: 60 },
      { id: 'temperature', label: 'Temperature (°F)', type: 'number', required: true, min: 90, max: 110 },
      { id: 'spo2', label: 'SpO₂ (%)', type: 'number', required: true, min: 50, max: 100 },
      { id: 'weight', label: 'Weight (lbs)', type: 'number', required: false, min: 50, max: 700 },
      { id: 'blood_glucose', label: 'Blood Glucose (mg/dL)', type: 'number', required: false, min: 20, max: 600 },
      { id: 'general_assessment', label: 'General Assessment Narrative', type: 'textarea', required: true, smartPhraseCategory: 'general_assessment', placeholder: 'Describe general appearance, mental status, and overall assessment...', maxLength: 3000 },
    ],
  },
  {
    id: 'pain',
    title: 'Pain Assessment',
    description: 'Pain location, severity, and management',
    icon: 'thermometer',
    order: 3,
    fields: [
      { id: 'pain_present', label: 'Pain Present', type: 'select', required: true, options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ]},
      { id: 'pain_scale', label: 'Pain Scale (0–10)', type: 'number', required: false, min: 0, max: 10 },
      { id: 'pain_location', label: 'Pain Location', type: 'text', required: false, placeholder: 'e.g., Lower back, left knee' },
      { id: 'pain_type', label: 'Pain Type', type: 'select', required: false, options: [
        { value: 'sharp', label: 'Sharp' },
        { value: 'dull', label: 'Dull' },
        { value: 'burning', label: 'Burning' },
        { value: 'aching', label: 'Aching' },
        { value: 'throbbing', label: 'Throbbing' },
        { value: 'stabbing', label: 'Stabbing' },
      ]},
      { id: 'pain_narrative', label: 'Pain Assessment Narrative', type: 'textarea', required: true, smartPhraseCategory: 'pain_assessment', placeholder: 'Document pain assessment findings, management, and patient response...', maxLength: 2000 },
    ],
  },
  {
    id: 'wound',
    title: 'Wound Assessment',
    description: 'Wound status, measurements, and treatment',
    icon: 'scissors',
    order: 4,
    fields: [
      { id: 'wound_present', label: 'Wound(s) Present', type: 'select', required: true, options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No — Skin intact' },
      ]},
      { id: 'wound_location', label: 'Wound Location', type: 'text', required: false, placeholder: 'e.g., Left lower extremity, sacrum' },
      { id: 'wound_length', label: 'Length (cm)', type: 'number', required: false, min: 0, max: 100 },
      { id: 'wound_width', label: 'Width (cm)', type: 'number', required: false, min: 0, max: 100 },
      { id: 'wound_depth', label: 'Depth (cm)', type: 'number', required: false, min: 0, max: 50 },
      { id: 'wound_stage', label: 'Wound Stage', type: 'select', required: false, options: [
        { value: 'stage1', label: 'Stage I' },
        { value: 'stage2', label: 'Stage II' },
        { value: 'stage3', label: 'Stage III' },
        { value: 'stage4', label: 'Stage IV' },
        { value: 'unstageable', label: 'Unstageable' },
        { value: 'dti', label: 'Deep Tissue Injury' },
      ]},
      { id: 'wound_narrative', label: 'Wound Care Narrative', type: 'textarea', required: false, smartPhraseCategory: 'wound_assessment', placeholder: 'Document wound bed appearance, drainage, treatment performed...', maxLength: 3000 },
    ],
  },
  {
    id: 'functional',
    title: 'Functional Status',
    description: 'ADLs, mobility, and safety assessment',
    icon: 'accessibility',
    order: 5,
    fields: [
      { id: 'ambulation', label: 'Ambulation Status', type: 'select', required: true, options: [
        { value: 'independent', label: 'Independent' },
        { value: 'with_device', label: 'Independent with Device' },
        { value: 'supervision', label: 'Requires Supervision' },
        { value: 'assistance', label: 'Requires Assistance' },
        { value: 'non_ambulatory', label: 'Non-Ambulatory' },
      ]},
      { id: 'fall_risk', label: 'Fall Risk Level', type: 'select', required: true, options: [
        { value: 'low', label: 'Low Risk' },
        { value: 'moderate', label: 'Moderate Risk' },
        { value: 'high', label: 'High Risk' },
      ]},
      { id: 'adl_bathing', label: 'Bathing', type: 'select', required: true, options: [
        { value: '0', label: 'Independent' },
        { value: '1', label: 'With Supervision' },
        { value: '2', label: 'With Assistance' },
        { value: '3', label: 'Dependent' },
      ]},
      { id: 'adl_dressing', label: 'Dressing', type: 'select', required: true, options: [
        { value: '0', label: 'Independent' },
        { value: '1', label: 'With Supervision' },
        { value: '2', label: 'With Assistance' },
        { value: '3', label: 'Dependent' },
      ]},
      { id: 'functional_narrative', label: 'Functional Status Narrative', type: 'textarea', required: true, smartPhraseCategory: 'functional_status', placeholder: 'Document functional abilities, limitations, and safety measures...', maxLength: 2000 },
    ],
  },
  {
    id: 'medications',
    title: 'Medication Review',
    description: 'Medication reconciliation and management',
    icon: 'pill',
    order: 6,
    fields: [
      { id: 'med_reconciliation', label: 'Medication Reconciliation Performed', type: 'select', required: true, options: [
        { value: 'yes_no_changes', label: 'Yes — No Discrepancies' },
        { value: 'yes_changes', label: 'Yes — Discrepancies Found' },
        { value: 'partial', label: 'Partially Completed' },
        { value: 'unable', label: 'Unable to Complete' },
      ]},
      { id: 'med_compliance', label: 'Patient Compliance', type: 'select', required: true, options: [
        { value: 'compliant', label: 'Compliant' },
        { value: 'mostly', label: 'Mostly Compliant' },
        { value: 'non_compliant', label: 'Non-Compliant' },
      ]},
      { id: 'medication_narrative', label: 'Medication Review Narrative', type: 'textarea', required: true, smartPhraseCategory: 'medication_review', placeholder: 'Document medication reconciliation findings, compliance, and education provided...', maxLength: 2000 },
    ],
  },
  {
    id: 'education',
    title: 'Patient Education',
    description: 'Teaching topics and patient response',
    icon: 'graduation-cap',
    order: 7,
    fields: [
      { id: 'education_disease', label: 'Disease Process Education', type: 'checkbox', required: false },
      { id: 'education_medication', label: 'Medication Education', type: 'checkbox', required: false },
      { id: 'education_diet', label: 'Dietary Education', type: 'checkbox', required: false },
      { id: 'education_safety', label: 'Safety / Fall Prevention', type: 'checkbox', required: false },
      { id: 'education_wound', label: 'Wound Care Education', type: 'checkbox', required: false },
      { id: 'education_exercise', label: 'Exercise / Activity', type: 'checkbox', required: false },
      { id: 'patient_response', label: 'Patient Response', type: 'select', required: true, options: [
        { value: 'verbalized', label: 'Verbalized Understanding' },
        { value: 'demonstrated', label: 'Demonstrated Skill' },
        { value: 'needs_reinforcement', label: 'Needs Reinforcement' },
        { value: 'unable', label: 'Unable to Learn' },
        { value: 'caregiver', label: 'Caregiver Educated Instead' },
      ]},
      { id: 'education_narrative', label: 'Education Narrative', type: 'textarea', required: true, smartPhraseCategory: 'education', placeholder: 'Document education topics, methods used, and patient/caregiver response...', maxLength: 2000 },
    ],
  },
  {
    id: 'coordination',
    title: 'Care Coordination & Plan',
    description: 'Coordination with team, next steps, plan updates',
    icon: 'users',
    order: 8,
    fields: [
      { id: 'md_notified', label: 'Physician Notified', type: 'select', required: true, options: [
        { value: 'not_needed', label: 'Not Needed' },
        { value: 'notified', label: 'Yes — Notified' },
        { value: 'awaiting', label: 'Awaiting Response' },
        { value: 'new_orders', label: 'New Orders Received' },
      ]},
      { id: 'plan_changes', label: 'Care Plan Changes Needed', type: 'select', required: true, options: [
        { value: 'none', label: 'No Changes' },
        { value: 'minor', label: 'Minor Adjustments' },
        { value: 'significant', label: 'Significant Updates Needed' },
      ]},
      { id: 'next_visit', label: 'Next Visit Date', type: 'date', required: true },
      { id: 'coordination_narrative', label: 'Care Coordination Narrative', type: 'textarea', required: true, smartPhraseCategory: 'plan_coordination', placeholder: 'Document coordination efforts, plan updates, and follow-up actions...', maxLength: 2000 },
    ],
  },
];

// Legacy export for backwards compatibility
export const SKILLED_NURSING_TEMPLATE: FormTemplate = {
  id: 'skilled_nursing_visit',
  name: 'Skilled Nursing Visit Note',
  description: 'Comprehensive skilled nursing visit documentation with assessment, interventions, and care coordination',
  sections: SKILLED_NURSING_SECTIONS,
};

// New DocumentTemplate export
export const SKILLED_NURSING_DOCUMENT_TEMPLATE: DocumentTemplate = {
  id: 'skilled_nursing_visit_v2',
  name: 'Skilled Nursing Visit Note',
  description: 'Comprehensive skilled nursing visit documentation with assessment, interventions, and care coordination',
  category: 'visit',
  documentType: 'skilled_nursing_visit',
  sections: SKILLED_NURSING_SECTIONS,
  requiresCosignature: false,
  estimatedTimeMinutes: 45,
};

export const FORM_TEMPLATES: FormTemplate[] = [
  SKILLED_NURSING_TEMPLATE,
];

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  SKILLED_NURSING_DOCUMENT_TEMPLATE,
];

export function getTemplate(id: FormTemplateType): FormTemplate | undefined {
  return FORM_TEMPLATES.find((t) => t.id === id);
}

export function getDocumentTemplate(documentType: string): DocumentTemplate | undefined {
  return DOCUMENT_TEMPLATES.find((t) => t.documentType === documentType);
}