/**
 * PHYSICAL THERAPY ASSESSMENT CONFIGURATION
 * 
 * Configuration-driven definition for Physical Therapy Evaluation/Visit Note
 * Used for PT evaluations, re-evaluations, and treatment visits
 * 
 * @version 1.0.0
 * @compliance APTA Guidelines, Medicare, State Regulations
 */

import type { AssessmentTypeConfiguration } from '../types/assessmentTypes';

export const PHYSICAL_THERAPY_CONFIGURATION: AssessmentTypeConfiguration = {
  id: 'physical-therapy-eval-2024',
  name: 'Physical Therapy Evaluation',
  version: 'PT Assessment v2024.1',
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
            { value: 'initial-eval', label: 'Initial Evaluation', order: 1 },
            { value: 're-eval', label: 'Re-evaluation', order: 2 },
            { value: 'treatment', label: 'Treatment Visit', order: 3 },
            { value: 'discharge', label: 'Discharge Evaluation', order: 4 },
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
          id: 'visit-duration',
          text: 'Visit Duration (minutes)',
          type: 'number',
          required: true,
          order: 3,
          validation: { min: 15, max: 180 },
        },
        {
          id: 'chief-complaint',
          text: 'Chief Complaint/Reason for Referral',
          type: 'long-text',
          required: true,
          order: 4,
        },
        {
          id: 'diagnosis',
          text: 'Primary Diagnosis',
          type: 'text',
          required: true,
          order: 5,
        },
        {
          id: 'onset-date',
          text: 'Date of Onset/Injury',
          type: 'date',
          required: false,
          order: 6,
        },
        {
          id: 'prior-level',
          text: 'Prior Level of Function',
          type: 'single-select',
          required: true,
          order: 7,
          options: [
            { value: 'independent', label: 'Independent - No Assistive Device', order: 1 },
            { value: 'independent-ad', label: 'Independent with Assistive Device', order: 2 },
            { value: 'supervision', label: 'Supervision Required', order: 3 },
            { value: 'mod-assist', label: 'Moderate Assistance', order: 4 },
            { value: 'max-assist', label: 'Maximum Assistance', order: 5 },
            { value: 'dependent', label: 'Dependent', order: 6 },
          ],
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 2: Vital Signs & Pain Assessment
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'vitals-pain',
      title: 'Vital Signs & Pain Assessment',
      description: 'Current vital signs and comprehensive pain evaluation',
      order: 2,
      questions: [
        {
          id: 'bp-systolic',
          text: 'Blood Pressure - Systolic',
          type: 'number',
          required: true,
          order: 1,
          validation: { min: 60, max: 250 },
          helpText: 'mmHg',
        },
        {
          id: 'bp-diastolic',
          text: 'Blood Pressure - Diastolic',
          type: 'number',
          required: true,
          order: 2,
          validation: { min: 40, max: 150 },
          helpText: 'mmHg',
        },
        {
          id: 'heart-rate',
          text: 'Resting Heart Rate',
          type: 'number',
          required: true,
          order: 3,
          validation: { min: 30, max: 200 },
          helpText: 'BPM',
        },
        {
          id: 'pain-rest',
          text: 'Pain at Rest (0-10)',
          type: 'number',
          required: true,
          order: 4,
          validation: { min: 0, max: 10 },
        },
        {
          id: 'pain-activity',
          text: 'Pain with Activity (0-10)',
          type: 'number',
          required: true,
          order: 5,
          validation: { min: 0, max: 10 },
        },
        {
          id: 'pain-location',
          text: 'Pain Location(s)',
          type: 'multi-select',
          required: false,
          order: 6,
          options: [
            { value: 'neck', label: 'Neck', order: 1 },
            { value: 'shoulder-right', label: 'Right Shoulder', order: 2 },
            { value: 'shoulder-left', label: 'Left Shoulder', order: 3 },
            { value: 'back-upper', label: 'Upper Back', order: 4 },
            { value: 'back-lower', label: 'Lower Back', order: 5 },
            { value: 'hip-right', label: 'Right Hip', order: 6 },
            { value: 'hip-left', label: 'Left Hip', order: 7 },
            { value: 'knee-right', label: 'Right Knee', order: 8 },
            { value: 'knee-left', label: 'Left Knee', order: 9 },
            { value: 'ankle-right', label: 'Right Ankle', order: 10 },
            { value: 'ankle-left', label: 'Left Ankle', order: 11 },
          ],
          conditional: {
            dependsOn: 'pain-rest',
            showWhen: { greaterThan: 0 },
          },
        },
        {
          id: 'pain-character',
          text: 'Pain Character',
          type: 'multi-select',
          required: false,
          order: 7,
          options: [
            { value: 'sharp', label: 'Sharp', order: 1 },
            { value: 'dull', label: 'Dull/Aching', order: 2 },
            { value: 'burning', label: 'Burning', order: 3 },
            { value: 'throbbing', label: 'Throbbing', order: 4 },
            { value: 'stabbing', label: 'Stabbing', order: 5 },
            { value: 'radiating', label: 'Radiating', order: 6 },
          ],
          conditional: {
            dependsOn: 'pain-rest',
            showWhen: { greaterThan: 0 },
          },
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 3: Range of Motion Assessment
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'rom-assessment',
      title: 'Range of Motion (ROM) Assessment',
      description: 'Active and passive ROM measurements',
      order: 3,
      questions: [
        {
          id: 'rom-area',
          text: 'Primary Area(s) Assessed',
          type: 'multi-select',
          required: true,
          order: 1,
          options: [
            { value: 'cervical', label: 'Cervical Spine', order: 1 },
            { value: 'shoulder', label: 'Shoulder', order: 2 },
            { value: 'elbow', label: 'Elbow', order: 3 },
            { value: 'wrist', label: 'Wrist/Hand', order: 4 },
            { value: 'lumbar', label: 'Lumbar Spine', order: 5 },
            { value: 'hip', label: 'Hip', order: 6 },
            { value: 'knee', label: 'Knee', order: 7 },
            { value: 'ankle', label: 'Ankle', order: 8 },
          ],
        },
        {
          id: 'rom-limitations',
          text: 'ROM Limitations Identified',
          type: 'boolean',
          required: true,
          order: 2,
        },
        {
          id: 'rom-limitations-detail',
          text: 'ROM Limitations Detail',
          type: 'long-text',
          required: false,
          order: 3,
          helpText: 'Document specific ROM measurements, limitations, and compensatory patterns',
          conditional: {
            dependsOn: 'rom-limitations',
            showWhen: { equals: true },
          },
        },
        {
          id: 'rom-limiting-factors',
          text: 'Limiting Factors',
          type: 'multi-select',
          required: false,
          order: 4,
          options: [
            { value: 'pain', label: 'Pain', order: 1 },
            { value: 'stiffness', label: 'Joint Stiffness', order: 2 },
            { value: 'weakness', label: 'Muscle Weakness', order: 3 },
            { value: 'spasm', label: 'Muscle Spasm', order: 4 },
            { value: 'edema', label: 'Edema/Swelling', order: 5 },
            { value: 'surgical', label: 'Post-Surgical Restrictions', order: 6 },
          ],
          conditional: {
            dependsOn: 'rom-limitations',
            showWhen: { equals: true },
          },
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 4: Strength Assessment
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'strength-assessment',
      title: 'Muscle Strength Assessment',
      description: 'Manual muscle testing (MMT) and functional strength',
      order: 4,
      questions: [
        {
          id: 'strength-testing-performed',
          text: 'Strength Testing Performed',
          type: 'boolean',
          required: true,
          order: 1,
        },
        {
          id: 'strength-areas',
          text: 'Areas Assessed',
          type: 'multi-select',
          required: false,
          order: 2,
          options: [
            { value: 'upper-extremity', label: 'Upper Extremities', order: 1 },
            { value: 'lower-extremity', label: 'Lower Extremities', order: 2 },
            { value: 'core', label: 'Core/Trunk', order: 3 },
            { value: 'neck', label: 'Neck/Cervical', order: 4 },
          ],
          conditional: {
            dependsOn: 'strength-testing-performed',
            showWhen: { equals: true },
          },
        },
        {
          id: 'strength-deficits',
          text: 'Strength Deficits Identified',
          type: 'boolean',
          required: false,
          order: 3,
          conditional: {
            dependsOn: 'strength-testing-performed',
            showWhen: { equals: true },
          },
        },
        {
          id: 'strength-details',
          text: 'Strength Assessment Details',
          type: 'long-text',
          required: false,
          order: 4,
          helpText: 'Document MMT grades (0-5/5), specific muscle groups tested, and functional implications',
          conditional: {
            dependsOn: 'strength-testing-performed',
            showWhen: { equals: true },
          },
        },
        {
          id: 'grip-strength-right',
          text: 'Grip Strength - Right Hand (lbs)',
          type: 'number',
          required: false,
          order: 5,
        },
        {
          id: 'grip-strength-left',
          text: 'Grip Strength - Left Hand (lbs)',
          type: 'number',
          required: false,
          order: 6,
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 5: Balance & Coordination
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'balance-coordination',
      title: 'Balance & Coordination Assessment',
      description: 'Static/dynamic balance, coordination, fall risk',
      order: 5,
      questions: [
        {
          id: 'balance-tested',
          text: 'Balance Testing Performed',
          type: 'boolean',
          required: true,
          order: 1,
        },
        {
          id: 'static-balance',
          text: 'Static Balance (Standing Still)',
          type: 'single-select',
          required: false,
          order: 2,
          options: [
            { value: 'independent', label: 'Independent - No Support', order: 1 },
            { value: 'supervision', label: 'Supervision Only', order: 2 },
            { value: 'contact-guard', label: 'Contact Guard Assist', order: 3 },
            { value: 'min-assist', label: 'Minimal Assistance', order: 4 },
            { value: 'mod-assist', label: 'Moderate Assistance', order: 5 },
            { value: 'unable', label: 'Unable', order: 6 },
          ],
          conditional: {
            dependsOn: 'balance-tested',
            showWhen: { equals: true },
          },
        },
        {
          id: 'dynamic-balance',
          text: 'Dynamic Balance (Moving)',
          type: 'single-select',
          required: false,
          order: 3,
          options: [
            { value: 'independent', label: 'Independent - No Support', order: 1 },
            { value: 'supervision', label: 'Supervision Only', order: 2 },
            { value: 'contact-guard', label: 'Contact Guard Assist', order: 3 },
            { value: 'min-assist', label: 'Minimal Assistance', order: 4 },
            { value: 'mod-assist', label: 'Moderate Assistance', order: 5 },
            { value: 'unable', label: 'Unable', order: 6 },
          ],
          conditional: {
            dependsOn: 'balance-tested',
            showWhen: { equals: true },
          },
        },
        {
          id: 'berg-balance-score',
          text: 'Berg Balance Scale Score (0-56)',
          type: 'number',
          required: false,
          order: 4,
          validation: { min: 0, max: 56 },
          helpText: '0-20: High fall risk, 21-40: Medium risk, 41-56: Low risk',
        },
        {
          id: 'tug-test',
          text: 'Timed Up and Go (TUG) Test (seconds)',
          type: 'number',
          required: false,
          order: 5,
          helpText: '<10s: Normal, 10-20s: Good mobility, 20-29s: Slower, >30s: Impaired mobility',
        },
        {
          id: 'coordination',
          text: 'Coordination Assessment',
          type: 'single-select',
          required: false,
          order: 6,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'mild-impair', label: 'Mild Impairment', order: 2 },
            { value: 'mod-impair', label: 'Moderate Impairment', order: 3 },
            { value: 'severe-impair', label: 'Severe Impairment', order: 4 },
          ],
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 6: Gait Assessment
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'gait-assessment',
      title: 'Gait & Mobility Assessment',
      description: 'Gait pattern, assistive devices, mobility status',
      order: 6,
      questions: [
        {
          id: 'ambulatory-status',
          text: 'Ambulatory Status',
          type: 'single-select',
          required: true,
          order: 1,
          options: [
            { value: 'independent', label: 'Independent Ambulation', order: 1 },
            { value: 'independent-ad', label: 'Independent with Assistive Device', order: 2 },
            { value: 'supervision', label: 'Supervision Required', order: 3 },
            { value: 'contact-guard', label: 'Contact Guard Assist', order: 4 },
            { value: 'min-assist', label: 'Minimal Assistance (1 person)', order: 5 },
            { value: 'mod-assist', label: 'Moderate Assistance (1 person)', order: 6 },
            { value: 'max-assist', label: 'Maximum Assistance (1-2 persons)', order: 7 },
            { value: 'non-ambulatory', label: 'Non-Ambulatory', order: 8 },
          ],
        },
        {
          id: 'assistive-device',
          text: 'Assistive Device Used',
          type: 'single-select',
          required: false,
          order: 2,
          options: [
            { value: 'none', label: 'None', order: 1 },
            { value: 'cane', label: 'Single Point Cane', order: 2 },
            { value: 'quad-cane', label: 'Quad Cane', order: 3 },
            { value: 'walker', label: 'Standard Walker', order: 4 },
            { value: 'rolling-walker', label: 'Rolling Walker (Rollator)', order: 5 },
            { value: 'wheelchair', label: 'Wheelchair', order: 6 },
            { value: 'crutches', label: 'Crutches', order: 7 },
          ],
        },
        {
          id: 'gait-pattern',
          text: 'Gait Pattern/Deviations',
          type: 'multi-select',
          required: false,
          order: 3,
          options: [
            { value: 'normal', label: 'Normal Gait Pattern', order: 1 },
            { value: 'antalgic', label: 'Antalgic (Pain)', order: 2 },
            { value: 'trendelenburg', label: 'Trendelenburg', order: 3 },
            { value: 'steppage', label: 'Steppage/Foot Drop', order: 4 },
            { value: 'ataxic', label: 'Ataxic/Unsteady', order: 5 },
            { value: 'shuffling', label: 'Shuffling', order: 6 },
            { value: 'circumduction', label: 'Circumduction', order: 7 },
          ],
        },
        {
          id: 'gait-speed',
          text: '10-Meter Walk Test (seconds)',
          type: 'number',
          required: false,
          order: 4,
          helpText: 'Time to walk 10 meters at comfortable pace',
        },
        {
          id: 'stair-negotiation',
          text: 'Stair Negotiation',
          type: 'single-select',
          required: false,
          order: 5,
          options: [
            { value: 'independent', label: 'Independent - Reciprocal', order: 1 },
            { value: 'independent-nonrecip', label: 'Independent - Non-reciprocal', order: 2 },
            { value: 'supervision', label: 'Supervision Required', order: 3 },
            { value: 'assist-required', label: 'Assistance Required', order: 4 },
            { value: 'unable', label: 'Unable', order: 5 },
            { value: 'not-tested', label: 'Not Tested', order: 6 },
          ],
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 7: Functional Mobility
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'functional-mobility',
      title: 'Functional Mobility',
      description: 'Transfers, bed mobility, functional activities',
      order: 7,
      questions: [
        {
          id: 'bed-mobility',
          text: 'Bed Mobility',
          type: 'single-select',
          required: true,
          order: 1,
          options: [
            { value: 'independent', label: 'Independent', order: 1 },
            { value: 'supervision', label: 'Supervision', order: 2 },
            { value: 'min-assist', label: 'Minimal Assistance', order: 3 },
            { value: 'mod-assist', label: 'Moderate Assistance', order: 4 },
            { value: 'max-assist', label: 'Maximum Assistance', order: 5 },
            { value: 'dependent', label: 'Dependent', order: 6 },
          ],
        },
        {
          id: 'sit-to-stand',
          text: 'Sit to Stand Transfer',
          type: 'single-select',
          required: true,
          order: 2,
          options: [
            { value: 'independent', label: 'Independent', order: 1 },
            { value: 'supervision', label: 'Supervision', order: 2 },
            { value: 'min-assist', label: 'Minimal Assistance', order: 3 },
            { value: 'mod-assist', label: 'Moderate Assistance', order: 4 },
            { value: 'max-assist', label: 'Maximum Assistance', order: 5 },
            { value: 'dependent', label: 'Dependent', order: 6 },
          ],
        },
        {
          id: 'chair-transfers',
          text: 'Chair/Toilet Transfers',
          type: 'single-select',
          required: true,
          order: 3,
          options: [
            { value: 'independent', label: 'Independent', order: 1 },
            { value: 'supervision', label: 'Supervision', order: 2 },
            { value: 'min-assist', label: 'Minimal Assistance', order: 3 },
            { value: 'mod-assist', label: 'Moderate Assistance', order: 4 },
            { value: 'max-assist', label: 'Maximum Assistance', order: 5 },
            { value: 'dependent', label: 'Dependent', order: 6 },
          ],
        },
        {
          id: 'car-transfers',
          text: 'Car Transfers',
          type: 'single-select',
          required: false,
          order: 4,
          options: [
            { value: 'independent', label: 'Independent', order: 1 },
            { value: 'supervision', label: 'Supervision', order: 2 },
            { value: 'assist-required', label: 'Assistance Required', order: 3 },
            { value: 'unable', label: 'Unable', order: 4 },
            { value: 'not-tested', label: 'Not Tested', order: 5 },
          ],
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 8: Treatment Interventions
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'interventions',
      title: 'Treatment Interventions',
      description: 'Therapeutic interventions provided during visit',
      order: 8,
      questions: [
        {
          id: 'interventions-provided',
          text: 'Interventions Provided',
          type: 'multi-select',
          required: true,
          order: 1,
          options: [
            { value: 'therapeutic-exercise', label: 'Therapeutic Exercise', order: 1 },
            { value: 'gait-training', label: 'Gait Training', order: 2 },
            { value: 'balance-training', label: 'Balance Training', order: 3 },
            { value: 'transfer-training', label: 'Transfer Training', order: 4 },
            { value: 'manual-therapy', label: 'Manual Therapy', order: 5 },
            { value: 'modalities', label: 'Physical Modalities', order: 6 },
            { value: 'neuromuscular-re-ed', label: 'Neuromuscular Re-education', order: 7 },
            { value: 'patient-education', label: 'Patient/Caregiver Education', order: 8 },
          ],
        },
        {
          id: 'modalities-used',
          text: 'Modalities Used',
          type: 'multi-select',
          required: false,
          order: 2,
          options: [
            { value: 'heat', label: 'Heat Therapy', order: 1 },
            { value: 'cold', label: 'Cold Therapy/Ice', order: 2 },
            { value: 'ultrasound', label: 'Ultrasound', order: 3 },
            { value: 'e-stim', label: 'Electrical Stimulation', order: 4 },
            { value: 'tens', label: 'TENS Unit', order: 5 },
          ],
          conditional: {
            dependsOn: 'interventions-provided',
            showWhen: { includes: 'modalities' },
          },
        },
        {
          id: 'patient-tolerance',
          text: 'Patient Tolerance of Treatment',
          type: 'single-select',
          required: true,
          order: 3,
          options: [
            { value: 'excellent', label: 'Excellent - No Adverse Reactions', order: 1 },
            { value: 'good', label: 'Good - Well Tolerated', order: 2 },
            { value: 'fair', label: 'Fair - Some Fatigue/Discomfort', order: 3 },
            { value: 'poor', label: 'Poor - Limited by Pain/Fatigue', order: 4 },
          ],
        },
      ],
    },

    // ────────────────────────────────────────────────────────────────────────
    // SECTION 9: Goals & Plan of Care
    // ────────────────────────────────────────────────────────────────────────
    {
      id: 'goals-plan',
      title: 'Goals & Plan of Care',
      description: 'Treatment goals and ongoing plan',
      order: 9,
      questions: [
        {
          id: 'short-term-goals',
          text: 'Short-Term Goals (2-4 weeks)',
          type: 'long-text',
          required: true,
          order: 1,
          helpText: 'Specific, measurable, achievable goals',
        },
        {
          id: 'long-term-goals',
          text: 'Long-Term Goals (Episode of Care)',
          type: 'long-text',
          required: true,
          order: 2,
          helpText: 'Functional outcomes expected by end of episode',
        },
        {
          id: 'treatment-frequency',
          text: 'Recommended Treatment Frequency',
          type: 'single-select',
          required: true,
          order: 3,
          options: [
            { value: '1x-week', label: '1x per week', order: 1 },
            { value: '2x-week', label: '2x per week', order: 2 },
            { value: '3x-week', label: '3x per week', order: 3 },
            { value: '4x-week', label: '4x per week', order: 4 },
            { value: '5x-week', label: '5x per week', order: 5 },
          ],
        },
        {
          id: 'estimated-duration',
          text: 'Estimated Duration of Care',
          type: 'single-select',
          required: true,
          order: 4,
          options: [
            { value: '2-weeks', label: '2 weeks', order: 1 },
            { value: '4-weeks', label: '4 weeks', order: 2 },
            { value: '6-weeks', label: '6 weeks', order: 3 },
            { value: '8-weeks', label: '8 weeks', order: 4 },
            { value: '12-weeks', label: '12 weeks', order: 5 },
          ],
        },
        {
          id: 'rehab-potential',
          text: 'Rehabilitation Potential',
          type: 'single-select',
          required: true,
          order: 5,
          options: [
            { value: 'excellent', label: 'Excellent', order: 1 },
            { value: 'good', label: 'Good', order: 2 },
            { value: 'fair', label: 'Fair', order: 3 },
            { value: 'poor', label: 'Poor', order: 4 },
          ],
        },
        {
          id: 'hep-provided',
          text: 'Home Exercise Program (HEP) Provided',
          type: 'boolean',
          required: true,
          order: 6,
        },
        {
          id: 'hep-detail',
          text: 'HEP Details',
          type: 'long-text',
          required: false,
          order: 7,
          helpText: 'Describe exercises, frequency, sets/reps',
          conditional: {
            dependsOn: 'hep-provided',
            showWhen: { equals: true },
          },
        },
        {
          id: 'clinical-summary',
          text: 'Clinical Summary/Impression',
          type: 'long-text',
          required: true,
          order: 8,
          helpText: 'Overall clinical impression, progress, and plan',
        },
      ],
    },
  ],

  regulatoryBody: 'APTA/Medicare',
  effectiveDate: '2024-01-01',
  requiredTimeframe: {
    mustCompleteWithin: 24,
    timeUnit: 'hours',
  },

  completionRequirements: {
    minimumProgress: 100,
    requiredSections: [
      'visit-info',
      'vitals-pain',
      'rom-assessment',
      'strength-assessment',
      'balance-coordination',
      'gait-assessment',
      'functional-mobility',
      'interventions',
      'goals-plan',
    ],
    requiredQuestions: [
      'visit-type',
      'visit-date',
      'chief-complaint',
      'diagnosis',
      'ambulatory-status',
      'interventions-provided',
      'short-term-goals',
      'long-term-goals',
      'clinical-summary',
    ],
  },
};

export default PHYSICAL_THERAPY_CONFIGURATION;
