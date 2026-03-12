/**
 * Physical Therapy Documentation Templates
 * 
 * Comprehensive templates for all PT documentation types:
 * - PT Evaluation (initial assessment)
 * - PT Visit Note (routine visit)
 * - PT Progress Note (periodic progress review)
 * - PT Discharge Summary (end of care)
 */

import type { DocumentTemplate, FormSectionDef } from './documentationTypes';

// ═══════════════════════════════════════════════════════════════════════════
// PT EVALUATION TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const PT_EVALUATION_SECTIONS: FormSectionDef[] = [
  {
    id: 'patient_condition',
    title: 'Patient Condition',
    description: 'Current medical status and diagnosis',
    icon: 'clipboard-list',
    order: 1,
    fields: [
      { 
        id: 'eval_date', 
        label: 'Evaluation Date', 
        type: 'date', 
        required: true 
      },
      { 
        id: 'referral_diagnosis', 
        label: 'Referral Diagnosis', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., Total knee replacement, CVA with left hemiparesis'
      },
      { 
        id: 'date_of_onset', 
        label: 'Date of Onset/Surgery', 
        type: 'date', 
        required: true 
      },
      { 
        id: 'chief_complaint', 
        label: 'Chief Complaint', 
        type: 'textarea', 
        required: true,
        placeholder: 'Patient\'s primary concerns and reasons for PT...',
        maxLength: 1000
      },
      { 
        id: 'medical_history', 
        label: 'Pertinent Medical History', 
        type: 'textarea', 
        required: true,
        placeholder: 'Relevant medical history, precautions, contraindications...',
        maxLength: 2000
      },
      { 
        id: 'medications', 
        label: 'Current Medications', 
        type: 'textarea', 
        required: true,
        placeholder: 'List medications relevant to PT treatment...',
        maxLength: 1500
      },
      { 
        id: 'prior_level', 
        label: 'Prior Level of Function', 
        type: 'textarea', 
        required: true,
        placeholder: 'Functional status before onset of current condition...',
        maxLength: 1000
      },
    ],
  },
  {
    id: 'functional_limitations',
    title: 'Functional Limitations',
    description: 'Assessment of ADLs and functional deficits',
    icon: 'activity',
    order: 2,
    fields: [
      { 
        id: 'ambulation_status', 
        label: 'Ambulation Status', 
        type: 'select', 
        required: true,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'supervised', label: 'Supervised' },
          { value: 'contact_guard', label: 'Contact Guard Assist' },
          { value: 'min_assist', label: 'Minimal Assist (25%)' },
          { value: 'mod_assist', label: 'Moderate Assist (50%)' },
          { value: 'max_assist', label: 'Maximal Assist (75%)' },
          { value: 'dependent', label: 'Dependent' },
          { value: 'non_ambulatory', label: 'Non-Ambulatory' },
        ]
      },
      { 
        id: 'assistive_device', 
        label: 'Assistive Device', 
        type: 'select', 
        required: true,
        options: [
          { value: 'none', label: 'None' },
          { value: 'cane', label: 'Cane' },
          { value: 'walker', label: 'Walker' },
          { value: 'rolling_walker', label: 'Rolling Walker' },
          { value: 'crutches', label: 'Crutches' },
          { value: 'wheelchair', label: 'Wheelchair' },
          { value: 'other', label: 'Other' },
        ]
      },
      { 
        id: 'transfer_status', 
        label: 'Transfer Status', 
        type: 'select', 
        required: true,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'supervised', label: 'Supervised' },
          { value: 'min_assist', label: 'Minimal Assist' },
          { value: 'mod_assist', label: 'Moderate Assist' },
          { value: 'max_assist', label: 'Maximal Assist' },
          { value: 'dependent', label: 'Dependent' },
        ]
      },
      { 
        id: 'stairs', 
        label: 'Stair Negotiation', 
        type: 'select', 
        required: true,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'with_rail', label: 'Independent with Rail' },
          { value: 'supervised', label: 'Supervised' },
          { value: 'assist', label: 'Requires Assist' },
          { value: 'unable', label: 'Unable' },
          { value: 'not_tested', label: 'Not Tested' },
        ]
      },
      { 
        id: 'adl_dressing', 
        label: 'Dressing (Lower Body)', 
        type: 'select', 
        required: true,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'mod_independent', label: 'Modified Independent' },
          { value: 'supervised', label: 'Supervised' },
          { value: 'min_assist', label: 'Minimal Assist' },
          { value: 'mod_assist', label: 'Moderate Assist' },
          { value: 'max_assist', label: 'Maximal Assist' },
          { value: 'dependent', label: 'Dependent' },
        ]
      },
      { 
        id: 'adl_bathing', 
        label: 'Bathing/Showering', 
        type: 'select', 
        required: true,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'mod_independent', label: 'Modified Independent' },
          { value: 'supervised', label: 'Supervised' },
          { value: 'min_assist', label: 'Minimal Assist' },
          { value: 'mod_assist', label: 'Moderate Assist' },
          { value: 'max_assist', label: 'Maximal Assist' },
          { value: 'dependent', label: 'Dependent' },
        ]
      },
      { 
        id: 'functional_limitations_narrative', 
        label: 'Functional Limitations Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_functional_limitations',
        placeholder: 'Summarize key functional deficits and how they impact daily activities...',
        maxLength: 2000
      },
    ],
  },
  {
    id: 'pain_assessment',
    title: 'Pain Assessment',
    description: 'Pain location, intensity, and characteristics',
    icon: 'alert-circle',
    order: 3,
    fields: [
      { 
        id: 'pain_present', 
        label: 'Pain Present', 
        type: 'select', 
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      },
      { 
        id: 'pain_location', 
        label: 'Pain Location', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Right knee, Lower back, Left shoulder'
      },
      { 
        id: 'pain_at_rest', 
        label: 'Pain at Rest (0-10)', 
        type: 'number', 
        required: false,
        min: 0,
        max: 10
      },
      { 
        id: 'pain_with_activity', 
        label: 'Pain with Activity (0-10)', 
        type: 'number', 
        required: false,
        min: 0,
        max: 10
      },
      { 
        id: 'pain_quality', 
        label: 'Pain Quality', 
        type: 'select', 
        required: false,
        options: [
          { value: 'sharp', label: 'Sharp' },
          { value: 'dull', label: 'Dull' },
          { value: 'aching', label: 'Aching' },
          { value: 'burning', label: 'Burning' },
          { value: 'stabbing', label: 'Stabbing' },
          { value: 'throbbing', label: 'Throbbing' },
          { value: 'shooting', label: 'Shooting' },
        ]
      },
      { 
        id: 'pain_frequency', 
        label: 'Pain Frequency', 
        type: 'select', 
        required: false,
        options: [
          { value: 'constant', label: 'Constant' },
          { value: 'intermittent', label: 'Intermittent' },
          { value: 'occasional', label: 'Occasional' },
        ]
      },
      { 
        id: 'pain_aggravating', 
        label: 'Aggravating Factors', 
        type: 'text', 
        required: false,
        placeholder: 'Activities or positions that worsen pain'
      },
      { 
        id: 'pain_relieving', 
        label: 'Relieving Factors', 
        type: 'text', 
        required: false,
        placeholder: 'Activities or positions that reduce pain'
      },
      { 
        id: 'pain_narrative', 
        label: 'Pain Assessment Narrative', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_pain',
        placeholder: 'Comprehensive pain assessment including impact on function...',
        maxLength: 1500
      },
    ],
  },
  {
    id: 'mobility_evaluation',
    title: 'Mobility Evaluation',
    description: 'ROM, strength, balance, and gait assessment',
    icon: 'move',
    order: 4,
    fields: [
      // Range of Motion
      { 
        id: 'rom_assessment', 
        label: 'Range of Motion Assessment', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_rom',
        placeholder: 'Document ROM measurements (active and passive) for affected joints. Use goniometric measurements when possible...',
        maxLength: 2000,
        helpText: 'Include specific measurements for key joints (e.g., Knee flexion: 0-95°, Shoulder abduction: 0-140°)'
      },
      // Muscle Strength
      { 
        id: 'strength_assessment', 
        label: 'Muscle Strength Assessment', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_strength',
        placeholder: 'Document manual muscle testing grades (0-5) for key muscle groups...',
        maxLength: 2000,
        helpText: 'Use MMT grading: 0=No contraction, 1=Trace, 2=Poor, 3=Fair, 4=Good, 5=Normal'
      },
      // Balance
      { 
        id: 'balance_static', 
        label: 'Static Balance', 
        type: 'select', 
        required: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'balance_dynamic', 
        label: 'Dynamic Balance', 
        type: 'select', 
        required: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'berg_score', 
        label: 'Berg Balance Scale Score', 
        type: 'number', 
        required: false,
        min: 0,
        max: 56,
        helpText: '0-20: High fall risk, 21-40: Medium fall risk, 41-56: Low fall risk'
      },
      // Gait
      { 
        id: 'gait_pattern', 
        label: 'Gait Pattern', 
        type: 'select', 
        required: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'antalgic', label: 'Antalgic' },
          { value: 'hemiplegic', label: 'Hemiplegic' },
          { value: 'trendelenburg', label: 'Trendelenburg' },
          { value: 'shuffling', label: 'Shuffling' },
          { value: 'ataxic', label: 'Ataxic' },
          { value: 'other', label: 'Other' },
        ]
      },
      { 
        id: 'gait_distance', 
        label: 'Gait Distance (feet)', 
        type: 'number', 
        required: true,
        min: 0,
        max: 1000,
        helpText: 'Maximum distance patient can ambulate'
      },
      { 
        id: 'gait_speed', 
        label: 'Gait Speed', 
        type: 'select', 
        required: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'decreased', label: 'Decreased' },
          { value: 'severely_decreased', label: 'Severely Decreased' },
        ]
      },
      { 
        id: 'tug_test', 
        label: 'Timed Up and Go (seconds)', 
        type: 'number', 
        required: false,
        min: 0,
        max: 300,
        helpText: '<10s: Normal, 10-20s: Mild impairment, >20s: High fall risk'
      },
      { 
        id: 'mobility_narrative', 
        label: 'Mobility Assessment Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_mobility',
        placeholder: 'Comprehensive summary of ROM, strength, balance, and gait findings...',
        maxLength: 2500
      },
    ],
  },
  {
    id: 'therapy_goals',
    title: 'Therapy Goals',
    description: 'Short-term and long-term functional goals',
    icon: 'target',
    order: 5,
    fields: [
      { 
        id: 'goal_1_st', 
        label: 'Short-Term Goal #1', 
        type: 'textarea', 
        required: true,
        placeholder: 'Patient will... (specific, measurable, achievable, timebound)',
        maxLength: 500,
        helpText: 'Typically 2-4 weeks'
      },
      { 
        id: 'goal_2_st', 
        label: 'Short-Term Goal #2', 
        type: 'textarea', 
        required: false,
        placeholder: 'Patient will...',
        maxLength: 500
      },
      { 
        id: 'goal_3_st', 
        label: 'Short-Term Goal #3', 
        type: 'textarea', 
        required: false,
        placeholder: 'Patient will...',
        maxLength: 500
      },
      { 
        id: 'goal_1_lt', 
        label: 'Long-Term Goal #1', 
        type: 'textarea', 
        required: true,
        placeholder: 'Patient will... (discharge goal)',
        maxLength: 500,
        helpText: 'End of certification period'
      },
      { 
        id: 'goal_2_lt', 
        label: 'Long-Term Goal #2', 
        type: 'textarea', 
        required: false,
        placeholder: 'Patient will...',
        maxLength: 500
      },
      { 
        id: 'rehabilitation_potential', 
        label: 'Rehabilitation Potential', 
        type: 'select', 
        required: true,
        options: [
          { value: 'excellent', label: 'Excellent' },
          { value: 'good', label: 'Good' },
          { value: 'fair', label: 'Fair' },
          { value: 'poor', label: 'Poor' },
          { value: 'guarded', label: 'Guarded' },
        ]
      },
      { 
        id: 'goals_narrative', 
        label: 'Goals Rationale', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_goals',
        placeholder: 'Explain how goals relate to patient\'s functional needs and discharge planning...',
        maxLength: 1500
      },
    ],
  },
  {
    id: 'treatment_plan',
    title: 'Treatment Plan',
    description: 'Interventions, frequency, and duration',
    icon: 'clipboard-check',
    order: 6,
    fields: [
      { 
        id: 'frequency', 
        label: 'Treatment Frequency', 
        type: 'select', 
        required: true,
        options: [
          { value: '1x_week', label: '1x per week' },
          { value: '2x_week', label: '2x per week' },
          { value: '3x_week', label: '3x per week' },
          { value: '4x_week', label: '4x per week' },
          { value: '5x_week', label: '5x per week' },
        ]
      },
      { 
        id: 'duration', 
        label: 'Treatment Duration', 
        type: 'select', 
        required: true,
        options: [
          { value: '2_weeks', label: '2 weeks' },
          { value: '4_weeks', label: '4 weeks' },
          { value: '6_weeks', label: '6 weeks' },
          { value: '8_weeks', label: '8 weeks' },
          { value: '60_days', label: '60 days (episode)' },
        ]
      },
      { 
        id: 'therapeutic_exercise', 
        label: 'Therapeutic Exercise', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'gait_training', 
        label: 'Gait Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'balance_training', 
        label: 'Balance Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'transfer_training', 
        label: 'Transfer Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'stair_training', 
        label: 'Stair Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'neuromuscular_reeducation', 
        label: 'Neuromuscular Re-education', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'manual_therapy', 
        label: 'Manual Therapy', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'therapeutic_modalities', 
        label: 'Therapeutic Modalities', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'home_exercise_program', 
        label: 'Home Exercise Program', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'patient_education', 
        label: 'Patient/Caregiver Education', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'treatment_plan_narrative', 
        label: 'Treatment Plan Details', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_treatment_plan',
        placeholder: 'Describe specific interventions, progression plan, and rationale for skilled PT services...',
        maxLength: 2500
      },
      { 
        id: 'skilled_need', 
        label: 'Justification for Skilled Care', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_skilled_need',
        placeholder: 'Explain why skilled PT services are necessary and cannot be performed by patient/caregiver independently...',
        maxLength: 1500
      },
    ],
  },
];

export const PT_EVALUATION_TEMPLATE: DocumentTemplate = {
  id: 'pt_eval',
  name: 'Physical Therapy Evaluation',
  description: 'Initial PT evaluation for new admissions',
  category: 'visit',
  documentType: 'physical_therapy_evaluation',
  sections: PT_EVALUATION_SECTIONS,
  regulatoryRequirements: ['Medicare Home Health', 'OASIS correlation'],
  estimatedTimeMinutes: 90,
  requiresCosignature: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// PT VISIT NOTE TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const PT_VISIT_NOTE_SECTIONS: FormSectionDef[] = [
  {
    id: 'visit_details',
    title: 'Visit Details',
    description: 'Date, time, and visit information',
    icon: 'calendar',
    order: 1,
    fields: [
      { id: 'visit_date', label: 'Visit Date', type: 'date', required: true },
      { id: 'visit_time_in', label: 'Time In', type: 'time', required: true },
      { id: 'visit_time_out', label: 'Time Out', type: 'time', required: true },
      { 
        id: 'visit_number', 
        label: 'Visit Number', 
        type: 'number', 
        required: true,
        min: 1,
        helpText: 'Visit number in current certification period'
      },
    ],
  },
  {
    id: 'interventions_performed',
    title: 'Interventions Performed',
    description: 'Therapeutic activities provided this visit',
    icon: 'activity',
    order: 2,
    fields: [
      { 
        id: 'therapeutic_exercise', 
        label: 'Therapeutic Exercise', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'gait_training', 
        label: 'Gait Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'balance_training', 
        label: 'Balance Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'transfer_training', 
        label: 'Transfer Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'stair_training', 
        label: 'Stair Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'neuromuscular_reeducation', 
        label: 'Neuromuscular Re-education', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'manual_therapy', 
        label: 'Manual Therapy', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'therapeutic_modalities', 
        label: 'Therapeutic Modalities', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'home_exercise_review', 
        label: 'Home Exercise Program Review', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'patient_education', 
        label: 'Patient/Caregiver Education', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'interventions_narrative', 
        label: 'Interventions Details', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_interventions',
        placeholder: 'Describe specific exercises, parameters, progressions, and skilled techniques used...',
        maxLength: 2500
      },
    ],
  },
  {
    id: 'patient_response',
    title: 'Patient Response',
    description: 'Patient performance and tolerance',
    icon: 'user-check',
    order: 3,
    fields: [
      { 
        id: 'tolerance', 
        label: 'Activity Tolerance', 
        type: 'select', 
        required: true,
        options: [
          { value: 'good', label: 'Good' },
          { value: 'fair', label: 'Fair' },
          { value: 'poor', label: 'Poor' },
        ]
      },
      { 
        id: 'vital_signs_response', 
        label: 'Vital Signs Response', 
        type: 'select', 
        required: true,
        options: [
          { value: 'stable', label: 'Stable/WNL' },
          { value: 'increased', label: 'Appropriately Increased' },
          { value: 'abnormal', label: 'Abnormal Response' },
        ]
      },
      { 
        id: 'pain_level', 
        label: 'Pain Level During Treatment (0-10)', 
        type: 'number', 
        required: false,
        min: 0,
        max: 10
      },
      { 
        id: 'patient_participation', 
        label: 'Patient Participation', 
        type: 'select', 
        required: true,
        options: [
          { value: 'excellent', label: 'Excellent' },
          { value: 'good', label: 'Good' },
          { value: 'fair', label: 'Fair' },
          { value: 'poor', label: 'Poor' },
        ]
      },
      { 
        id: 'response_narrative', 
        label: 'Patient Response Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_response',
        placeholder: 'Document patient\'s response to treatment, any adverse reactions, modifications made...',
        maxLength: 1500
      },
    ],
  },
  {
    id: 'progress_toward_goals',
    title: 'Progress Toward Goals',
    description: 'Assessment of goal achievement',
    icon: 'trending-up',
    order: 4,
    fields: [
      { 
        id: 'functional_progress', 
        label: 'Functional Progress', 
        type: 'select', 
        required: true,
        options: [
          { value: 'significant', label: 'Significant Progress' },
          { value: 'moderate', label: 'Moderate Progress' },
          { value: 'minimal', label: 'Minimal Progress' },
          { value: 'no_progress', label: 'No Progress' },
          { value: 'regression', label: 'Regression' },
        ]
      },
      { 
        id: 'goal_1_status', 
        label: 'Goal #1 Status', 
        type: 'select', 
        required: true,
        options: [
          { value: 'achieved', label: 'Achieved' },
          { value: 'progressing', label: 'Progressing as Expected' },
          { value: 'slow_progress', label: 'Progressing Slower than Expected' },
          { value: 'not_progressing', label: 'Not Progressing' },
          { value: 'modified', label: 'Goal Modified' },
        ]
      },
      { 
        id: 'goal_2_status', 
        label: 'Goal #2 Status', 
        type: 'select', 
        required: false,
        options: [
          { value: 'achieved', label: 'Achieved' },
          { value: 'progressing', label: 'Progressing as Expected' },
          { value: 'slow_progress', label: 'Progressing Slower than Expected' },
          { value: 'not_progressing', label: 'Not Progressing' },
          { value: 'modified', label: 'Goal Modified' },
        ]
      },
      { 
        id: 'progress_narrative', 
        label: 'Progress Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_progress',
        placeholder: 'Document specific measurable progress toward functional goals...',
        maxLength: 2000
      },
    ],
  },
  {
    id: 'plan_updates',
    title: 'Plan Updates',
    description: 'Changes to treatment plan and next steps',
    icon: 'clipboard-list',
    order: 5,
    fields: [
      { 
        id: 'plan_continue', 
        label: 'Continue Current Plan', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'plan_progress', 
        label: 'Progress Treatment Intensity', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'plan_modify', 
        label: 'Modify Treatment Approach', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'plan_discharge', 
        label: 'Consider Discharge Planning', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'plan_narrative', 
        label: 'Plan for Next Visit', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_plan',
        placeholder: 'Describe plan for upcoming visits, any changes to treatment, and rationale...',
        maxLength: 1500
      },
      { 
        id: 'coordination_needed', 
        label: 'Coordination Needs', 
        type: 'textarea', 
        required: false,
        placeholder: 'Communication needed with MD, case manager, other disciplines...',
        maxLength: 1000
      },
    ],
  },
];

export const PT_VISIT_NOTE_TEMPLATE: DocumentTemplate = {
  id: 'pt_visit',
  name: 'Physical Therapy Visit Note',
  description: 'Routine PT visit documentation',
  category: 'visit',
  documentType: 'physical_therapy_visit',
  sections: PT_VISIT_NOTE_SECTIONS,
  regulatoryRequirements: ['Medicare Home Health'],
  estimatedTimeMinutes: 30,
  requiresCosignature: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// PT PROGRESS NOTE TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const PT_PROGRESS_NOTE_SECTIONS: FormSectionDef[] = [
  {
    id: 'progress_summary',
    title: 'Progress Summary',
    description: 'Overall progress since evaluation/last progress note',
    icon: 'trending-up',
    order: 1,
    fields: [
      { 
        id: 'note_date', 
        label: 'Progress Note Date', 
        type: 'date', 
        required: true 
      },
      { 
        id: 'period_start', 
        label: 'Period Start Date', 
        type: 'date', 
        required: true,
        helpText: 'Date of evaluation or last progress note'
      },
      { 
        id: 'visits_completed', 
        label: 'Visits Completed in Period', 
        type: 'number', 
        required: true,
        min: 0
      },
      { 
        id: 'overall_progress', 
        label: 'Overall Progress', 
        type: 'select', 
        required: true,
        options: [
          { value: 'excellent', label: 'Excellent Progress' },
          { value: 'good', label: 'Good Progress' },
          { value: 'fair', label: 'Fair Progress' },
          { value: 'minimal', label: 'Minimal Progress' },
          { value: 'plateau', label: 'Plateau' },
          { value: 'regression', label: 'Regression' },
        ]
      },
      { 
        id: 'progress_summary_narrative', 
        label: 'Progress Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_progress_summary',
        placeholder: 'Summarize patient\'s progress toward goals, functional improvements, and any setbacks...',
        maxLength: 2500
      },
    ],
  },
  {
    id: 'functional_status',
    title: 'Current Functional Status',
    description: 'Objective measurements and functional abilities',
    icon: 'activity',
    order: 2,
    fields: [
      { 
        id: 'ambulation_current', 
        label: 'Current Ambulation Status', 
        type: 'select', 
        required: true,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'supervised', label: 'Supervised' },
          { value: 'contact_guard', label: 'Contact Guard Assist' },
          { value: 'min_assist', label: 'Minimal Assist' },
          { value: 'mod_assist', label: 'Moderate Assist' },
          { value: 'max_assist', label: 'Maximal Assist' },
          { value: 'dependent', label: 'Dependent' },
        ]
      },
      { 
        id: 'gait_distance_current', 
        label: 'Current Gait Distance (feet)', 
        type: 'number', 
        required: true,
        min: 0
      },
      { 
        id: 'balance_current', 
        label: 'Current Balance Status', 
        type: 'select', 
        required: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'transfers_current', 
        label: 'Current Transfer Status', 
        type: 'select', 
        required: true,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'supervised', label: 'Supervised' },
          { value: 'min_assist', label: 'Minimal Assist' },
          { value: 'mod_assist', label: 'Moderate Assist' },
          { value: 'max_assist', label: 'Maximal Assist' },
          { value: 'dependent', label: 'Dependent' },
        ]
      },
      { 
        id: 'pain_current', 
        label: 'Current Pain Level (0-10)', 
        type: 'number', 
        required: false,
        min: 0,
        max: 10
      },
      { 
        id: 'functional_status_narrative', 
        label: 'Functional Status Details', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_functional_status',
        placeholder: 'Document objective measurements, functional improvements, and current limitations...',
        maxLength: 2000
      },
    ],
  },
  {
    id: 'goals_status',
    title: 'Goals Status',
    description: 'Progress toward short-term and long-term goals',
    icon: 'target',
    order: 3,
    fields: [
      { 
        id: 'st_goal_1_status', 
        label: 'Short-Term Goal #1 Status', 
        type: 'select', 
        required: true,
        options: [
          { value: 'achieved', label: 'Achieved' },
          { value: 'progressing', label: 'Progressing Well' },
          { value: 'slow_progress', label: 'Slow Progress' },
          { value: 'not_met', label: 'Not Met' },
          { value: 'revised', label: 'Revised' },
        ]
      },
      { 
        id: 'st_goal_2_status', 
        label: 'Short-Term Goal #2 Status', 
        type: 'select', 
        required: false,
        options: [
          { value: 'achieved', label: 'Achieved' },
          { value: 'progressing', label: 'Progressing Well' },
          { value: 'slow_progress', label: 'Slow Progress' },
          { value: 'not_met', label: 'Not Met' },
          { value: 'revised', label: 'Revised' },
        ]
      },
      { 
        id: 'lt_goal_1_status', 
        label: 'Long-Term Goal #1 Status', 
        type: 'select', 
        required: true,
        options: [
          { value: 'achieved', label: 'Achieved' },
          { value: 'progressing', label: 'Progressing Well' },
          { value: 'slow_progress', label: 'Slow Progress' },
          { value: 'not_met', label: 'Not Met' },
          { value: 'revised', label: 'Revised' },
        ]
      },
      { 
        id: 'goals_status_narrative', 
        label: 'Goals Progress Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_goals_progress',
        placeholder: 'Discuss progress toward each goal with specific measurable data...',
        maxLength: 2000
      },
      { 
        id: 'new_goals', 
        label: 'New/Revised Goals', 
        type: 'textarea', 
        required: false,
        placeholder: 'Document any new or revised goals...',
        maxLength: 1500
      },
    ],
  },
  {
    id: 'treatment_changes',
    title: 'Treatment Plan Changes',
    description: 'Modifications to treatment approach',
    icon: 'clipboard-check',
    order: 4,
    fields: [
      { 
        id: 'frequency_change', 
        label: 'Frequency Change Recommended', 
        type: 'select', 
        required: true,
        options: [
          { value: 'no_change', label: 'No Change' },
          { value: 'increase', label: 'Increase Frequency' },
          { value: 'decrease', label: 'Decrease Frequency' },
          { value: 'discontinue', label: 'Recommend Discharge' },
        ]
      },
      { 
        id: 'treatment_focus', 
        label: 'Treatment Focus Changes', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_treatment_changes',
        placeholder: 'Describe any changes to treatment interventions, intensity, or focus areas...',
        maxLength: 2000
      },
      { 
        id: 'skilled_need_continued', 
        label: 'Continued Need for Skilled PT', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_skilled_need',
        placeholder: 'Justify continued need for skilled physical therapy services...',
        maxLength: 1500
      },
      { 
        id: 'discharge_planning', 
        label: 'Discharge Planning', 
        type: 'textarea', 
        required: false,
        placeholder: 'Discuss discharge criteria and timeline if applicable...',
        maxLength: 1000
      },
    ],
  },
];

export const PT_PROGRESS_NOTE_TEMPLATE: DocumentTemplate = {
  id: 'pt_progress',
  name: 'Physical Therapy Progress Note',
  description: 'Periodic PT progress assessment',
  category: 'visit',
  documentType: 'physical_therapy_progress_note',
  sections: PT_PROGRESS_NOTE_SECTIONS,
  regulatoryRequirements: ['Medicare Home Health', 'Required every 30 days'],
  estimatedTimeMinutes: 45,
  requiresCosignature: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// PT DISCHARGE SUMMARY TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const PT_DISCHARGE_SUMMARY_SECTIONS: FormSectionDef[] = [
  {
    id: 'discharge_info',
    title: 'Discharge Information',
    description: 'Discharge date and reason',
    icon: 'check-circle',
    order: 1,
    fields: [
      { 
        id: 'discharge_date', 
        label: 'Discharge Date', 
        type: 'date', 
        required: true 
      },
      { 
        id: 'admission_date', 
        label: 'PT Admission Date', 
        type: 'date', 
        required: true 
      },
      { 
        id: 'total_visits', 
        label: 'Total Visits Completed', 
        type: 'number', 
        required: true,
        min: 0
      },
      { 
        id: 'discharge_reason', 
        label: 'Reason for Discharge', 
        type: 'select', 
        required: true,
        options: [
          { value: 'goals_met', label: 'Goals Met' },
          { value: 'plateau', label: 'Plateau/No Further Progress' },
          { value: 'patient_declined', label: 'Patient Declined Services' },
          { value: 'non_compliant', label: 'Patient Non-Compliant' },
          { value: 'hospitalized', label: 'Hospitalized' },
          { value: 'deceased', label: 'Patient Deceased' },
          { value: 'moved', label: 'Moved/Transferred' },
          { value: 'physician_order', label: 'Physician Order' },
          { value: 'other', label: 'Other' },
        ]
      },
    ],
  },
  {
    id: 'admission_status',
    title: 'Status at Admission',
    description: 'Functional status when PT started',
    icon: 'arrow-right-circle',
    order: 2,
    fields: [
      { 
        id: 'admission_ambulation', 
        label: 'Ambulation at Admission', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., Min assist with walker for 50 feet'
      },
      { 
        id: 'admission_transfers', 
        label: 'Transfers at Admission', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., Mod assist for bed/chair transfers'
      },
      { 
        id: 'admission_balance', 
        label: 'Balance at Admission', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., Moderately impaired, high fall risk'
      },
      { 
        id: 'admission_pain', 
        label: 'Pain at Admission', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., 6-7/10 right knee pain with ambulation'
      },
    ],
  },
  {
    id: 'discharge_status',
    title: 'Status at Discharge',
    description: 'Functional status at end of care',
    icon: 'check-square',
    order: 3,
    fields: [
      { 
        id: 'discharge_ambulation', 
        label: 'Ambulation at Discharge', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., Independent with cane for 300 feet'
      },
      { 
        id: 'discharge_transfers', 
        label: 'Transfers at Discharge', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., Independent for all transfers'
      },
      { 
        id: 'discharge_balance', 
        label: 'Balance at Discharge', 
        type: 'text', 
        required: true,
        placeholder: 'e.g., Mildly impaired, low fall risk'
      },
      { 
        id: 'discharge_pain', 
        label: 'Pain at Discharge', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., 2-3/10 right knee pain with prolonged activity'
      },
      { 
        id: 'discharge_status_narrative', 
        label: 'Discharge Status Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_discharge_status',
        placeholder: 'Comprehensive summary of functional status at discharge...',
        maxLength: 2000
      },
    ],
  },
  {
    id: 'goals_outcomes',
    title: 'Goals and Outcomes',
    description: 'Achievement of therapy goals',
    icon: 'target',
    order: 4,
    fields: [
      { 
        id: 'goals_met', 
        label: 'Goals Achievement', 
        type: 'select', 
        required: true,
        options: [
          { value: 'all_met', label: 'All Goals Met' },
          { value: 'most_met', label: 'Most Goals Met' },
          { value: 'some_met', label: 'Some Goals Met' },
          { value: 'minimal_met', label: 'Minimal Goals Met' },
          { value: 'none_met', label: 'No Goals Met' },
        ]
      },
      { 
        id: 'goals_outcomes_narrative', 
        label: 'Goals and Outcomes Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_outcomes',
        placeholder: 'Discuss each goal and level of achievement with specific measurable data...',
        maxLength: 2500
      },
    ],
  },
  {
    id: 'recommendations',
    title: 'Recommendations',
    description: 'Post-discharge plan and recommendations',
    icon: 'clipboard-list',
    order: 5,
    fields: [
      { 
        id: 'home_program', 
        label: 'Home Exercise Program Provided', 
        type: 'select', 
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ]
      },
      { 
        id: 'equipment_recommendations', 
        label: 'Durable Medical Equipment', 
        type: 'textarea', 
        required: false,
        placeholder: 'List any DME recommended for continued safety and function...',
        maxLength: 1000
      },
      { 
        id: 'home_modifications', 
        label: 'Home Modifications', 
        type: 'textarea', 
        required: false,
        placeholder: 'Environmental modifications recommended...',
        maxLength: 1000
      },
      { 
        id: 'followup_care', 
        label: 'Follow-up Care Recommendations', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_followup',
        placeholder: 'Recommendations for continued care, outpatient therapy, physician follow-up...',
        maxLength: 1500
      },
      { 
        id: 'safety_concerns', 
        label: 'Ongoing Safety Concerns', 
        type: 'textarea', 
        required: false,
        placeholder: 'Any residual safety concerns for patient/caregiver awareness...',
        maxLength: 1000
      },
      { 
        id: 'discharge_summary', 
        label: 'Discharge Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'pt_discharge_summary',
        placeholder: 'Overall summary of PT episode, patient progress, and discharge status...',
        maxLength: 2500
      },
    ],
  },
];

export const PT_DISCHARGE_SUMMARY_TEMPLATE: DocumentTemplate = {
  id: 'pt_discharge',
  name: 'Physical Therapy Discharge Summary',
  description: 'Final PT discharge documentation',
  category: 'visit',
  documentType: 'physical_therapy_discharge',
  sections: PT_DISCHARGE_SUMMARY_SECTIONS,
  regulatoryRequirements: ['Medicare Home Health', 'Required at discharge'],
  estimatedTimeMinutes: 60,
  requiresCosignature: false,
};

// Export all PT templates
export const PT_TEMPLATES = {
  evaluation: PT_EVALUATION_TEMPLATE,
  visitNote: PT_VISIT_NOTE_TEMPLATE,
  progressNote: PT_PROGRESS_NOTE_TEMPLATE,
  dischargeSummary: PT_DISCHARGE_SUMMARY_TEMPLATE,
};
