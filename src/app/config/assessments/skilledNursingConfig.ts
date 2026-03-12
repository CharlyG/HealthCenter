/**
 * SKILLED NURSING ASSESSMENT CONFIGURATION
 * 
 * Configuration-driven definition for Skilled Nursing Visit Note/Assessment
 * Used for all skilled nursing visits in home health
 * 
 * @version 1.0.0
 * @compliance HIPAA, Medicare, State Regulations
 */

import type { 
  AssessmentTypeConfiguration, 
  SectionDefinition, 
  QuestionDefinition 
} from '../types/assessmentTypes';

export const SKILLED_NURSING_CONFIGURATION: AssessmentTypeConfiguration = {
  id: 'skilled-nursing-visit-2024',
  name: 'Skilled Nursing Visit Note',
  version: 'SN Assessment v2024.1',
  category: 'clinical-visit',
  
  sections: [
    // ────────────────────────────────────────────────────────────────────────
    // SECTION 1: Visit Information
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'visit-info',
      title: 'Visit Information',
      description: 'Basic visit details and context',
      order: 1,
      questions: [
        {
          id: 'visit-type',
          text: 'Visit Type',
          type: 'single-select',
          required: true,
          order: 1,
          options: [
            { value: 'soc', label: 'Start of Care', order: 1 },
            { value: 'routine', label: 'Routine Visit', order: 2 },
            { value: 'recert', label: 'Recertification', order: 3 },
            { value: 'discharge', label: 'Discharge Visit', order: 4 },
            { value: 'prn', label: 'PRN Visit', order: 5 },
          ],
        },
        {
          id: 'visit-date',
          text: 'Visit Date',
          type: 'date',
          required: true,
          order: 2,
        },
        {
          id: 'visit-time-in',
          text: 'Time In',
          type: 'time',
          required: true,
          order: 3,
        },
        {
          id: 'visit-time-out',
          text: 'Time Out',
          type: 'time',
          required: true,
          order: 4,
        },
        {
          id: 'visit-location',
          text: 'Visit Location',
          type: 'single-select',
          required: true,
          order: 5,
          options: [
            { value: 'home', label: 'Patient Home', order: 1 },
            { value: 'alf', label: 'Assisted Living Facility', order: 2 },
            { value: 'group-home', label: 'Group Home', order: 3 },
            { value: 'other', label: 'Other', order: 4 },
          ],
        },
        {
          id: 'patient-present',
          text: 'Patient Present During Visit',
          type: 'boolean',
          required: true,
          order: 6,
        },
        {
          id: 'caregiver-present',
          text: 'Caregiver/Family Present',
          type: 'boolean',
          required: false,
          order: 7,
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 2: Vital Signs & Clinical Measurements
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'vital-signs',
      title: 'Vital Signs & Clinical Measurements',
      description: 'Current vital signs and clinical measurements',
      order: 2,
      questions: [
        {
          id: 'bp-systolic',
          text: 'Blood Pressure - Systolic',
          type: 'number',
          required: true,
          order: 1,
          validation: {
            min: 60,
            max: 250,
          },
          helpText: 'mmHg',
        },
        {
          id: 'bp-diastolic',
          text: 'Blood Pressure - Diastolic',
          type: 'number',
          required: true,
          order: 2,
          validation: {
            min: 40,
            max: 150,
          },
          helpText: 'mmHg',
        },
        {
          id: 'bp-position',
          text: 'BP Measurement Position',
          type: 'single-select',
          required: true,
          order: 3,
          options: [
            { value: 'sitting', label: 'Sitting', order: 1 },
            { value: 'standing', label: 'Standing', order: 2 },
            { value: 'lying', label: 'Lying Down', order: 3 },
          ],
        },
        {
          id: 'bp-arm',
          text: 'Arm Used',
          type: 'single-select',
          required: true,
          order: 4,
          options: [
            { value: 'left', label: 'Left', order: 1 },
            { value: 'right', label: 'Right', order: 2 },
          ],
        },
        {
          id: 'heart-rate',
          text: 'Heart Rate',
          type: 'number',
          required: true,
          order: 5,
          validation: {
            min: 30,
            max: 200,
          },
          helpText: 'beats per minute',
        },
        {
          id: 'heart-rhythm',
          text: 'Heart Rhythm',
          type: 'single-select',
          required: true,
          order: 6,
          options: [
            { value: 'regular', label: 'Regular', order: 1 },
            { value: 'irregular', label: 'Irregular', order: 2 },
          ],
        },
        {
          id: 'respiratory-rate',
          text: 'Respiratory Rate',
          type: 'number',
          required: true,
          order: 7,
          validation: {
            min: 8,
            max: 60,
          },
          helpText: 'breaths per minute',
        },
        {
          id: 'temperature',
          text: 'Temperature',
          type: 'number',
          required: true,
          order: 8,
          validation: {
            min: 90,
            max: 110,
          },
          helpText: '°F',
        },
        {
          id: 'temp-route',
          text: 'Temperature Route',
          type: 'single-select',
          required: true,
          order: 9,
          options: [
            { value: 'oral', label: 'Oral', order: 1 },
            { value: 'axillary', label: 'Axillary', order: 2 },
            { value: 'tympanic', label: 'Tympanic', order: 3 },
            { value: 'temporal', label: 'Temporal', order: 4 },
          ],
        },
        {
          id: 'oxygen-saturation',
          text: 'Oxygen Saturation (SpO2)',
          type: 'number',
          required: true,
          order: 10,
          validation: {
            min: 70,
            max: 100,
          },
          helpText: '%',
        },
        {
          id: 'on-oxygen',
          text: 'On Supplemental Oxygen',
          type: 'boolean',
          required: true,
          order: 11,
        },
        {
          id: 'oxygen-flow-rate',
          text: 'Oxygen Flow Rate',
          type: 'number',
          required: false,
          order: 12,
          helpText: 'Liters per minute',
          conditional: {
            dependsOn: 'on-oxygen',
            showWhen: { equals: true },
          },
        },
        {
          id: 'oxygen-delivery',
          text: 'Oxygen Delivery Method',
          type: 'single-select',
          required: false,
          order: 13,
          options: [
            { value: 'nasal-cannula', label: 'Nasal Cannula', order: 1 },
            { value: 'face-mask', label: 'Face Mask', order: 2 },
            { value: 'non-rebreather', label: 'Non-Rebreather', order: 3 },
            { value: 'cpap', label: 'CPAP/BiPAP', order: 4 },
          ],
          conditional: {
            dependsOn: 'on-oxygen',
            showWhen: { equals: true },
          },
        },
        {
          id: 'pain-scale',
          text: 'Pain Level (0-10 Scale)',
          type: 'number',
          required: true,
          order: 14,
          validation: {
            min: 0,
            max: 10,
          },
          helpText: '0 = No Pain, 10 = Worst Pain',
        },
        {
          id: 'pain-location',
          text: 'Pain Location',
          type: 'text',
          required: false,
          order: 15,
          conditional: {
            dependsOn: 'pain-scale',
            showWhen: { greaterThan: 0 },
          },
        },
        {
          id: 'weight',
          text: 'Weight',
          type: 'number',
          required: false,
          order: 16,
          helpText: 'pounds',
        },
        {
          id: 'weight-method',
          text: 'Weight Measurement Method',
          type: 'single-select',
          required: false,
          order: 17,
          options: [
            { value: 'scale', label: 'Scale', order: 1 },
            { value: 'patient-reported', label: 'Patient Reported', order: 2 },
            { value: 'estimated', label: 'Estimated', order: 3 },
          ],
          conditional: {
            dependsOn: 'weight',
            showWhen: { notEmpty: true },
          },
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 3: Systems Assessment
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'systems-assessment',
      title: 'Systems Assessment',
      description: 'Head-to-toe assessment by body system',
      order: 3,
      questions: [
        // Cardiovascular
        {
          id: 'cardio-assessment',
          text: 'Cardiovascular Assessment',
          type: 'multi-select',
          required: true,
          order: 1,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'edema', label: 'Edema Present', order: 2 },
            { value: 'chest-pain', label: 'Chest Pain', order: 3 },
            { value: 'palpitations', label: 'Palpitations', order: 4 },
            { value: 'doe', label: 'Dyspnea on Exertion', order: 5 },
            { value: 'orthopnea', label: 'Orthopnea', order: 6 },
          ],
        },
        {
          id: 'edema-location',
          text: 'Edema Location',
          type: 'multi-select',
          required: false,
          order: 2,
          options: [
            { value: 'bilateral-lower', label: 'Bilateral Lower Extremities', order: 1 },
            { value: 'left-lower', label: 'Left Lower Extremity', order: 2 },
            { value: 'right-lower', label: 'Right Lower Extremity', order: 3 },
            { value: 'sacral', label: 'Sacral', order: 4 },
            { value: 'generalized', label: 'Generalized', order: 5 },
          ],
          conditional: {
            dependsOn: 'cardio-assessment',
            showWhen: { includes: 'edema' },
          },
        },
        {
          id: 'edema-severity',
          text: 'Edema Severity',
          type: 'single-select',
          required: false,
          order: 3,
          options: [
            { value: '1+', label: '1+ (Slight)', order: 1 },
            { value: '2+', label: '2+ (Moderate)', order: 2 },
            { value: '3+', label: '3+ (Severe)', order: 3 },
            { value: '4+', label: '4+ (Very Severe)', order: 4 },
          ],
          conditional: {
            dependsOn: 'cardio-assessment',
            showWhen: { includes: 'edema' },
          },
        },
        
        // Respiratory
        {
          id: 'respiratory-assessment',
          text: 'Respiratory Assessment',
          type: 'multi-select',
          required: true,
          order: 4,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'sob', label: 'Shortness of Breath', order: 2 },
            { value: 'cough', label: 'Cough', order: 3 },
            { value: 'wheezing', label: 'Wheezing', order: 4 },
            { value: 'crackles', label: 'Crackles', order: 5 },
            { value: 'diminished', label: 'Diminished Breath Sounds', order: 6 },
          ],
        },
        {
          id: 'cough-productive',
          text: 'Cough Productive',
          type: 'boolean',
          required: false,
          order: 5,
          conditional: {
            dependsOn: 'respiratory-assessment',
            showWhen: { includes: 'cough' },
          },
        },
        {
          id: 'sputum-color',
          text: 'Sputum Color/Character',
          type: 'text',
          required: false,
          order: 6,
          conditional: {
            dependsOn: 'cough-productive',
            showWhen: { equals: true },
          },
        },
        
        // Neurological
        {
          id: 'neuro-assessment',
          text: 'Neurological Assessment',
          type: 'multi-select',
          required: true,
          order: 7,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'alert-oriented', label: 'Alert & Oriented x4', order: 2 },
            { value: 'confusion', label: 'Confusion', order: 3 },
            { value: 'weakness', label: 'Weakness', order: 4 },
            { value: 'numbness', label: 'Numbness/Tingling', order: 5 },
            { value: 'headache', label: 'Headache', order: 6 },
            { value: 'dizziness', label: 'Dizziness', order: 7 },
          ],
        },
        
        // Gastrointestinal
        {
          id: 'gi-assessment',
          text: 'Gastrointestinal Assessment',
          type: 'multi-select',
          required: true,
          order: 8,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'nausea', label: 'Nausea', order: 2 },
            { value: 'vomiting', label: 'Vomiting', order: 3 },
            { value: 'diarrhea', label: 'Diarrhea', order: 4 },
            { value: 'constipation', label: 'Constipation', order: 5 },
            { value: 'abdominal-pain', label: 'Abdominal Pain', order: 6 },
            { value: 'bowel-sounds-normal', label: 'Bowel Sounds Normal', order: 7 },
          ],
        },
        {
          id: 'last-bm',
          text: 'Last Bowel Movement',
          type: 'date',
          required: false,
          order: 9,
        },
        
        // Genitourinary
        {
          id: 'gu-assessment',
          text: 'Genitourinary Assessment',
          type: 'multi-select',
          required: true,
          order: 10,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'frequency', label: 'Urinary Frequency', order: 2 },
            { value: 'urgency', label: 'Urinary Urgency', order: 3 },
            { value: 'incontinence', label: 'Incontinence', order: 4 },
            { value: 'dysuria', label: 'Dysuria', order: 5 },
            { value: 'catheter', label: 'Catheter Present', order: 6 },
          ],
        },
        {
          id: 'catheter-type',
          text: 'Catheter Type',
          type: 'single-select',
          required: false,
          order: 11,
          options: [
            { value: 'foley', label: 'Foley (Indwelling)', order: 1 },
            { value: 'suprapubic', label: 'Suprapubic', order: 2 },
            { value: 'intermittent', label: 'Intermittent', order: 3 },
          ],
          conditional: {
            dependsOn: 'gu-assessment',
            showWhen: { includes: 'catheter' },
          },
        },
        {
          id: 'urine-appearance',
          text: 'Urine Appearance',
          type: 'single-select',
          required: false,
          order: 12,
          options: [
            { value: 'clear-yellow', label: 'Clear Yellow', order: 1 },
            { value: 'dark', label: 'Dark', order: 2 },
            { value: 'cloudy', label: 'Cloudy', order: 3 },
            { value: 'bloody', label: 'Bloody', order: 4 },
          ],
          conditional: {
            dependsOn: 'gu-assessment',
            showWhen: { includes: 'catheter' },
          },
        },
        
        // Integumentary
        {
          id: 'skin-assessment',
          text: 'Skin/Integumentary Assessment',
          type: 'multi-select',
          required: true,
          order: 13,
          options: [
            { value: 'intact', label: 'Skin Intact', order: 1 },
            { value: 'pressure-injury', label: 'Pressure Injury', order: 2 },
            { value: 'wound', label: 'Wound Present', order: 3 },
            { value: 'rash', label: 'Rash', order: 4 },
            { value: 'bruising', label: 'Bruising', order: 5 },
            { value: 'dry', label: 'Dry Skin', order: 6 },
          ],
        },
        {
          id: 'wound-present',
          text: 'Wound/Pressure Injury Requiring Assessment',
          type: 'boolean',
          required: false,
          order: 14,
          conditional: {
            dependsOn: 'skin-assessment',
            showWhen: { includesAny: ['pressure-injury', 'wound'] },
          },
        },
        
        // Musculoskeletal
        {
          id: 'musculoskeletal-assessment',
          text: 'Musculoskeletal Assessment',
          type: 'multi-select',
          required: true,
          order: 15,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'weakness', label: 'Muscle Weakness', order: 2 },
            { value: 'joint-pain', label: 'Joint Pain', order: 3 },
            { value: 'limited-rom', label: 'Limited Range of Motion', order: 4 },
            { value: 'gait-impairment', label: 'Gait Impairment', order: 5 },
            { value: 'fall-risk', label: 'Fall Risk', order: 6 },
          ],
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 4: Medication Review
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'medication-review',
      title: 'Medication Review',
      description: 'Medication compliance and management',
      order: 4,
      questions: [
        {
          id: 'med-list-reviewed',
          text: 'Medication List Reviewed with Patient/Caregiver',
          type: 'boolean',
          required: true,
          order: 1,
        },
        {
          id: 'med-compliance',
          text: 'Medication Compliance',
          type: 'single-select',
          required: true,
          order: 2,
          options: [
            { value: 'compliant', label: 'Compliant - Taking as Prescribed', order: 1 },
            { value: 'partial', label: 'Partial Compliance', order: 2 },
            { value: 'non-compliant', label: 'Non-Compliant', order: 3 },
          ],
        },
        {
          id: 'med-barriers',
          text: 'Barriers to Medication Compliance',
          type: 'multi-select',
          required: false,
          order: 3,
          options: [
            { value: 'cost', label: 'Cost/Financial', order: 1 },
            { value: 'side-effects', label: 'Side Effects', order: 2 },
            { value: 'confusion', label: 'Confusion/Memory', order: 3 },
            { value: 'physical', label: 'Physical Limitations', order: 4 },
            { value: 'transportation', label: 'Transportation to Pharmacy', order: 5 },
          ],
          conditional: {
            dependsOn: 'med-compliance',
            showWhen: { notEquals: 'compliant' },
          },
        },
        {
          id: 'new-meds',
          text: 'New Medications Since Last Visit',
          type: 'boolean',
          required: true,
          order: 4,
        },
        {
          id: 'med-changes',
          text: 'Medication Changes',
          type: 'long-text',
          required: false,
          order: 5,
          helpText: 'Document new medications, discontinued meds, or dose changes',
          conditional: {
            dependsOn: 'new-meds',
            showWhen: { equals: true },
          },
        },
        {
          id: 'side-effects-reported',
          text: 'Patient Reports Medication Side Effects',
          type: 'boolean',
          required: true,
          order: 6,
        },
        {
          id: 'side-effects-detail',
          text: 'Side Effects Details',
          type: 'long-text',
          required: false,
          order: 7,
          conditional: {
            dependsOn: 'side-effects-reported',
            showWhen: { equals: true },
          },
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 5: Safety Assessment
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'safety-assessment',
      title: 'Safety Assessment',
      description: 'Home safety and fall risk evaluation',
      order: 5,
      questions: [
        {
          id: 'home-safe',
          text: 'Home Environment Safe',
          type: 'boolean',
          required: true,
          order: 1,
        },
        {
          id: 'safety-concerns',
          text: 'Safety Concerns Identified',
          type: 'multi-select',
          required: false,
          order: 2,
          options: [
            { value: 'trip-hazards', label: 'Trip Hazards (rugs, cords)', order: 1 },
            { value: 'poor-lighting', label: 'Poor Lighting', order: 2 },
            { value: 'no-grab-bars', label: 'No Grab Bars', order: 3 },
            { value: 'stairs', label: 'Stairs Without Handrails', order: 4 },
            { value: 'clutter', label: 'Clutter', order: 5 },
            { value: 'pets', label: 'Pets Creating Fall Risk', order: 6 },
          ],
          conditional: {
            dependsOn: 'home-safe',
            showWhen: { equals: false },
          },
        },
        {
          id: 'fall-risk-score',
          text: 'Fall Risk Score',
          type: 'single-select',
          required: true,
          order: 3,
          options: [
            { value: 'low', label: 'Low Risk', order: 1 },
            { value: 'moderate', label: 'Moderate Risk', order: 2 },
            { value: 'high', label: 'High Risk', order: 3 },
          ],
        },
        {
          id: 'assistive-devices',
          text: 'Assistive Devices Used',
          type: 'multi-select',
          required: false,
          order: 4,
          options: [
            { value: 'cane', label: 'Cane', order: 1 },
            { value: 'walker', label: 'Walker', order: 2 },
            { value: 'wheelchair', label: 'Wheelchair', order: 3 },
            { value: 'bedside-commode', label: 'Bedside Commode', order: 4 },
            { value: 'grab-bars', label: 'Grab Bars', order: 5 },
          ],
        },
        {
          id: 'emergency-plan',
          text: 'Emergency Plan in Place',
          type: 'boolean',
          required: true,
          order: 5,
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 6: Patient/Caregiver Education
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'education',
      title: 'Patient/Caregiver Education',
      description: 'Education provided during visit',
      order: 6,
      questions: [
        {
          id: 'education-provided',
          text: 'Education Provided',
          type: 'multi-select',
          required: true,
          order: 1,
          options: [
            { value: 'disease-process', label: 'Disease Process/Condition', order: 1 },
            { value: 'medications', label: 'Medication Management', order: 2 },
            { value: 'diet', label: 'Diet/Nutrition', order: 3 },
            { value: 'safety', label: 'Safety/Fall Prevention', order: 4 },
            { value: 'equipment', label: 'Equipment Use', order: 5 },
            { value: 'wound-care', label: 'Wound Care', order: 6 },
            { value: 'emergency', label: 'When to Call 911', order: 7 },
            { value: 'infection-control', label: 'Infection Control', order: 8 },
          ],
        },
        {
          id: 'education-understanding',
          text: 'Patient/Caregiver Demonstrates Understanding',
          type: 'single-select',
          required: true,
          order: 2,
          options: [
            { value: 'full', label: 'Full Understanding', order: 1 },
            { value: 'partial', label: 'Partial Understanding', order: 2 },
            { value: 'minimal', label: 'Minimal Understanding', order: 3 },
          ],
        },
        {
          id: 'education-barriers',
          text: 'Barriers to Learning',
          type: 'multi-select',
          required: false,
          order: 3,
          options: [
            { value: 'language', label: 'Language Barrier', order: 1 },
            { value: 'cognitive', label: 'Cognitive Impairment', order: 2 },
            { value: 'hearing', label: 'Hearing Impairment', order: 3 },
            { value: 'vision', label: 'Vision Impairment', order: 4 },
            { value: 'literacy', label: 'Low Health Literacy', order: 5 },
          ],
        },
        {
          id: 'written-materials',
          text: 'Written Materials Provided',
          type: 'boolean',
          required: true,
          order: 4,
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 7: Interventions & Activities
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'interventions',
      title: 'Skilled Nursing Interventions',
      description: 'Skilled nursing activities performed during visit',
      order: 7,
      questions: [
        {
          id: 'skilled-interventions',
          text: 'Skilled Interventions Performed',
          type: 'multi-select',
          required: true,
          order: 1,
          options: [
            { value: 'assessment', label: 'Comprehensive Assessment', order: 1 },
            { value: 'medication-setup', label: 'Medication Setup/Prefill', order: 2 },
            { value: 'injection', label: 'Injection Administration', order: 3 },
            { value: 'wound-care', label: 'Wound Care', order: 4 },
            { value: 'catheter-care', label: 'Catheter Care', order: 5 },
            { value: 'ostomy-care', label: 'Ostomy Care', order: 6 },
            { value: 'iv-management', label: 'IV Management', order: 7 },
            { value: 'blood-draw', label: 'Blood Draw/Lab Collection', order: 8 },
            { value: 'glucose-monitoring', label: 'Blood Glucose Monitoring', order: 9 },
            { value: 'teaching', label: 'Patient/Caregiver Teaching', order: 10 },
          ],
        },
        {
          id: 'wound-care-performed',
          text: 'Wound Care Performed',
          type: 'boolean',
          required: false,
          order: 2,
          conditional: {
            dependsOn: 'skilled-interventions',
            showWhen: { includes: 'wound-care' },
          },
        },
        {
          id: 'injection-type',
          text: 'Injection Type',
          type: 'multi-select',
          required: false,
          order: 3,
          options: [
            { value: 'insulin', label: 'Insulin', order: 1 },
            { value: 'b12', label: 'Vitamin B12', order: 2 },
            { value: 'anticoagulant', label: 'Anticoagulant (Lovenox, etc.)', order: 3 },
            { value: 'other', label: 'Other Injection', order: 4 },
          ],
          conditional: {
            dependsOn: 'skilled-interventions',
            showWhen: { includes: 'injection' },
          },
        },
        {
          id: 'blood-glucose',
          text: 'Blood Glucose Level',
          type: 'number',
          required: false,
          order: 4,
          helpText: 'mg/dL',
          conditional: {
            dependsOn: 'skilled-interventions',
            showWhen: { includes: 'glucose-monitoring' },
          },
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 8: Plan of Care Review
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'poc-review',
      title: 'Plan of Care Review',
      description: 'Progress toward goals and plan updates',
      order: 8,
      questions: [
        {
          id: 'poc-goals-reviewed',
          text: 'Plan of Care Goals Reviewed',
          type: 'boolean',
          required: true,
          order: 1,
        },
        {
          id: 'goals-progress',
          text: 'Progress Toward Goals',
          type: 'single-select',
          required: true,
          order: 2,
          options: [
            { value: 'on-track', label: 'On Track - Goals Being Met', order: 1 },
            { value: 'partial', label: 'Partial Progress', order: 2 },
            { value: 'not-progressing', label: 'Not Progressing', order: 3 },
            { value: 'declining', label: 'Declining/Regression', order: 4 },
          ],
        },
        {
          id: 'poc-changes-needed',
          text: 'Plan of Care Changes Needed',
          type: 'boolean',
          required: true,
          order: 3,
        },
        {
          id: 'poc-changes-detail',
          text: 'Plan of Care Changes',
          type: 'long-text',
          required: false,
          order: 4,
          helpText: 'Describe changes to goals, interventions, or visit frequency',
          conditional: {
            dependsOn: 'poc-changes-needed',
            showWhen: { equals: true },
          },
        },
        {
          id: 'physician-notification',
          text: 'Physician Notification Required',
          type: 'boolean',
          required: true,
          order: 5,
        },
        {
          id: 'physician-notification-reason',
          text: 'Reason for Physician Notification',
          type: 'long-text',
          required: false,
          order: 6,
          conditional: {
            dependsOn: 'physician-notification',
            showWhen: { equals: true },
          },
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 9: Visit Summary & Next Steps
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'visit-summary',
      title: 'Visit Summary & Next Steps',
      description: 'Visit summary and follow-up plan',
      order: 9,
      questions: [
        {
          id: 'patient-response',
          text: 'Patient Response to Visit',
          type: 'single-select',
          required: true,
          order: 1,
          options: [
            { value: 'positive', label: 'Positive - Engaged & Cooperative', order: 1 },
            { value: 'neutral', label: 'Neutral', order: 2 },
            { value: 'resistant', label: 'Resistant/Uncooperative', order: 3 },
          ],
        },
        {
          id: 'next-visit-scheduled',
          text: 'Next Visit Scheduled',
          type: 'boolean',
          required: true,
          order: 2,
        },
        {
          id: 'next-visit-date',
          text: 'Next Scheduled Visit Date',
          type: 'date',
          required: false,
          order: 3,
          conditional: {
            dependsOn: 'next-visit-scheduled',
            showWhen: { equals: true },
          },
        },
        {
          id: 'coordination-needed',
          text: 'Care Coordination Needed',
          type: 'multi-select',
          required: false,
          order: 4,
          options: [
            { value: 'pt', label: 'Physical Therapy', order: 1 },
            { value: 'ot', label: 'Occupational Therapy', order: 2 },
            { value: 'st', label: 'Speech Therapy', order: 3 },
            { value: 'msw', label: 'Medical Social Worker', order: 4 },
            { value: 'hha', label: 'Home Health Aide', order: 5 },
            { value: 'dme', label: 'DME/Supplies', order: 6 },
          ],
        },
        {
          id: 'visit-narrative',
          text: 'Visit Narrative Summary',
          type: 'long-text',
          required: true,
          order: 5,
          helpText: 'Comprehensive narrative documenting visit, findings, interventions, and plan',
        },
      ],
    },
  ],

  // Regulatory and timing information
  regulatoryBody: 'CMS/State Boards of Nursing',
  effectiveDate: '2024-01-01',
  requiredTimeframe: {
    mustCompleteWithin: 24,
    timeUnit: 'hours',
  },

  // Completion requirements
  completionRequirements: {
    minimumProgress: 100,
    requiredSections: [
      'visit-info',
      'vital-signs',
      'systems-assessment',
      'medication-review',
      'safety-assessment',
      'education',
      'interventions',
      'poc-review',
      'visit-summary',
    ],
    requiredQuestions: [
      'visit-type',
      'visit-date',
      'bp-systolic',
      'bp-diastolic',
      'heart-rate',
      'respiratory-rate',
      'temperature',
      'oxygen-saturation',
      'pain-scale',
      'med-list-reviewed',
      'skilled-interventions',
      'visit-narrative',
    ],
  },
};

export default SKILLED_NURSING_CONFIGURATION;
