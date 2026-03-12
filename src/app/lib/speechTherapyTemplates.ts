/**
 * Speech Therapy Documentation Templates
 * 
 * Comprehensive templates for all ST documentation types:
 * - ST Evaluation (initial assessment)
 * - ST Visit Note (routine visit)
 * - ST Progress Note (periodic progress review)
 * - ST Discharge Summary (end of care)
 */

import type { DocumentTemplate, FormSectionDef } from './documentationTypes';

// ═══════════════════════════════════════════════════════════════════════════
// ST EVALUATION TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const ST_EVALUATION_SECTIONS: FormSectionDef[] = [
  {
    id: 'speech_assessment',
    title: 'Speech Assessment',
    description: 'Articulation, voice, fluency evaluation',
    icon: 'mic',
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
        placeholder: 'e.g., CVA with aphasia, dysarthria post-stroke'
      },
      { 
        id: 'date_of_onset', 
        label: 'Date of Onset', 
        type: 'date', 
        required: true 
      },
      { 
        id: 'chief_complaint', 
        label: 'Chief Complaint', 
        type: 'textarea', 
        required: true,
        placeholder: 'Patient\'s primary speech/communication concerns...',
        maxLength: 1000
      },
      { 
        id: 'articulation_status', 
        label: 'Articulation', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'articulation_errors', 
        label: 'Articulation Errors/Patterns', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Difficulty with /r/, /s/, final consonants'
      },
      { 
        id: 'voice_quality', 
        label: 'Voice Quality', 
        type: 'select', 
        required: true,
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'hoarse', label: 'Hoarse' },
          { value: 'breathy', label: 'Breathy' },
          { value: 'harsh', label: 'Harsh' },
          { value: 'strained', label: 'Strained' },
          { value: 'weak', label: 'Weak' },
        ]
      },
      { 
        id: 'volume', 
        label: 'Voice Volume', 
        type: 'select', 
        required: true,
        options: [
          { value: 'adequate', label: 'Adequate' },
          { value: 'reduced', label: 'Reduced' },
          { value: 'increased', label: 'Increased' },
          { value: 'variable', label: 'Variable' },
        ]
      },
      { 
        id: 'fluency', 
        label: 'Fluency', 
        type: 'select', 
        required: true,
        options: [
          { value: 'fluent', label: 'Fluent' },
          { value: 'dysfluent', label: 'Dysfluent' },
          { value: 'stuttering', label: 'Stuttering' },
          { value: 'cluttering', label: 'Cluttering' },
        ]
      },
      { 
        id: 'intelligibility', 
        label: 'Speech Intelligibility', 
        type: 'select', 
        required: true,
        options: [
          { value: '100', label: '100% - Always intelligible' },
          { value: '75', label: '75% - Usually intelligible' },
          { value: '50', label: '50% - Sometimes intelligible' },
          { value: '25', label: '25% - Rarely intelligible' },
          { value: '0', label: '0% - Unintelligible' },
        ]
      },
      { 
        id: 'speech_narrative', 
        label: 'Speech Assessment Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_speech',
        placeholder: 'Comprehensive assessment of speech production including articulation, voice, fluency, and intelligibility...',
        maxLength: 2000
      },
    ],
  },
  {
    id: 'swallowing_assessment',
    title: 'Swallowing Assessment',
    description: 'Dysphagia evaluation and diet recommendations',
    icon: 'utensils',
    order: 2,
    fields: [
      { 
        id: 'dysphagia_present', 
        label: 'Dysphagia Present', 
        type: 'select', 
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
          { value: 'suspected', label: 'Suspected' },
        ]
      },
      { 
        id: 'dysphagia_onset', 
        label: 'Dysphagia Onset', 
        type: 'select', 
        required: false,
        options: [
          { value: 'acute', label: 'Acute (Recent)' },
          { value: 'chronic', label: 'Chronic (Long-standing)' },
          { value: 'progressive', label: 'Progressive' },
        ]
      },
      { 
        id: 'oral_phase', 
        label: 'Oral Phase', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'pharyngeal_phase', 
        label: 'Pharyngeal Phase', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'aspiration_risk', 
        label: 'Aspiration Risk', 
        type: 'select', 
        required: true,
        options: [
          { value: 'none', label: 'None/Minimal' },
          { value: 'mild', label: 'Mild Risk' },
          { value: 'moderate', label: 'Moderate Risk' },
          { value: 'severe', label: 'Severe Risk' },
        ]
      },
      { 
        id: 'clinical_signs', 
        label: 'Clinical Signs of Aspiration', 
        type: 'textarea', 
        required: false,
        placeholder: 'e.g., Coughing, throat clearing, wet voice quality after swallowing...',
        maxLength: 1000
      },
      { 
        id: 'instrumental_eval', 
        label: 'Instrumental Evaluation Completed', 
        type: 'select', 
        required: true,
        options: [
          { value: 'none', label: 'None' },
          { value: 'fees', label: 'FEES (Fiberoptic)' },
          { value: 'vfss', label: 'VFSS (Modified Barium Swallow)' },
          { value: 'recommended', label: 'Recommended' },
        ]
      },
      { 
        id: 'instrumental_findings', 
        label: 'Instrumental Findings', 
        type: 'textarea', 
        required: false,
        placeholder: 'Summary of FEES or VFSS findings if applicable...',
        maxLength: 1500
      },
      { 
        id: 'current_diet', 
        label: 'Current Diet Level', 
        type: 'select', 
        required: true,
        options: [
          { value: 'npo', label: 'NPO (Nothing by Mouth)' },
          { value: 'tube_feeding', label: 'Tube Feeding Only' },
          { value: 'puree', label: 'Level 4 - Puree' },
          { value: 'minced_moist', label: 'Level 5 - Minced & Moist' },
          { value: 'soft_bite', label: 'Level 6 - Soft & Bite-Sized' },
          { value: 'regular', label: 'Level 7 - Regular' },
        ]
      },
      { 
        id: 'liquid_consistency', 
        label: 'Liquid Consistency', 
        type: 'select', 
        required: true,
        options: [
          { value: 'thin', label: 'Thin Liquids' },
          { value: 'nectar', label: 'Nectar Thick' },
          { value: 'honey', label: 'Honey Thick' },
          { value: 'pudding', label: 'Pudding Thick' },
          { value: 'no_liquids', label: 'No Oral Liquids' },
        ]
      },
      { 
        id: 'fois_level', 
        label: 'FOIS (Functional Oral Intake Scale) Level', 
        type: 'select', 
        required: true,
        options: [
          { value: '1', label: 'Level 1 - NPO' },
          { value: '2', label: 'Level 2 - Tube dependent, minimal PO' },
          { value: '3', label: 'Level 3 - Tube dependent, consistent PO' },
          { value: '4', label: 'Level 4 - Total PO, single consistency' },
          { value: '5', label: 'Level 5 - Total PO, multiple consistencies' },
          { value: '6', label: 'Level 6 - Total PO, modified diet' },
          { value: '7', label: 'Level 7 - Total PO, no restrictions' },
        ],
        helpText: 'Standardized scale measuring oral intake level'
      },
      { 
        id: 'swallow_narrative', 
        label: 'Swallowing Assessment Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_swallow',
        placeholder: 'Comprehensive dysphagia assessment including oral and pharyngeal phases, aspiration risk, diet recommendations...',
        maxLength: 2500
      },
    ],
  },
  {
    id: 'cognitive_evaluation',
    title: 'Cognitive Evaluation',
    description: 'Cognitive-linguistic assessment',
    icon: 'brain',
    order: 3,
    fields: [
      { 
        id: 'alertness', 
        label: 'Alertness', 
        type: 'select', 
        required: true,
        options: [
          { value: 'alert', label: 'Alert & Oriented' },
          { value: 'lethargic', label: 'Lethargic' },
          { value: 'somnolent', label: 'Somnolent' },
          { value: 'fluctuating', label: 'Fluctuating' },
        ]
      },
      { 
        id: 'orientation', 
        label: 'Orientation', 
        type: 'select', 
        required: true,
        options: [
          { value: 'x4', label: 'Oriented x4 (Person, Place, Time, Situation)' },
          { value: 'x3', label: 'Oriented x3' },
          { value: 'x2', label: 'Oriented x2' },
          { value: 'x1', label: 'Oriented x1' },
          { value: 'x0', label: 'Disoriented' },
        ]
      },
      { 
        id: 'attention', 
        label: 'Attention', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'memory_stm', 
        label: 'Short-Term Memory', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'memory_ltm', 
        label: 'Long-Term Memory', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'problem_solving', 
        label: 'Problem Solving', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'executive_function', 
        label: 'Executive Function', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'safety_awareness', 
        label: 'Safety Awareness', 
        type: 'select', 
        required: true,
        options: [
          { value: 'intact', label: 'Intact' },
          { value: 'impaired', label: 'Impaired' },
          { value: 'absent', label: 'Absent' },
        ]
      },
      { 
        id: 'cognitive_narrative', 
        label: 'Cognitive Assessment Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_cognitive',
        placeholder: 'Comprehensive cognitive-linguistic assessment including attention, memory, problem-solving, executive function...',
        maxLength: 2000
      },
    ],
  },
  {
    id: 'communication_abilities',
    title: 'Communication Abilities',
    description: 'Language comprehension and expression',
    icon: 'message-square',
    order: 4,
    fields: [
      { 
        id: 'aphasia_type', 
        label: 'Aphasia Type', 
        type: 'select', 
        required: true,
        options: [
          { value: 'none', label: 'None' },
          { value: 'brocas', label: 'Broca\'s (Expressive)' },
          { value: 'wernickes', label: 'Wernicke\'s (Receptive)' },
          { value: 'global', label: 'Global' },
          { value: 'anomic', label: 'Anomic' },
          { value: 'conduction', label: 'Conduction' },
          { value: 'transcortical', label: 'Transcortical' },
        ]
      },
      { 
        id: 'comprehension_auditory', 
        label: 'Auditory Comprehension', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'comprehension_reading', 
        label: 'Reading Comprehension', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
          { value: 'not_tested', label: 'Not Tested' },
        ]
      },
      { 
        id: 'expression_verbal', 
        label: 'Verbal Expression', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'expression_written', 
        label: 'Written Expression', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
          { value: 'not_tested', label: 'Not Tested' },
        ]
      },
      { 
        id: 'naming', 
        label: 'Naming Ability', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'repetition', 
        label: 'Repetition Ability', 
        type: 'select', 
        required: true,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'pragmatics', 
        label: 'Pragmatic Skills', 
        type: 'select', 
        required: true,
        options: [
          { value: 'appropriate', label: 'Appropriate' },
          { value: 'mildly_impaired', label: 'Mildly Impaired' },
          { value: 'moderately_impaired', label: 'Moderately Impaired' },
          { value: 'severely_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'alternative_communication', 
        label: 'Alternative/Augmentative Communication', 
        type: 'select', 
        required: true,
        options: [
          { value: 'not_needed', label: 'Not Needed' },
          { value: 'gestures', label: 'Gestures/Pointing' },
          { value: 'picture_board', label: 'Picture Board' },
          { value: 'speech_device', label: 'Speech Generating Device' },
          { value: 'writing', label: 'Writing/Typing' },
          { value: 'recommended', label: 'Recommended for Trial' },
        ]
      },
      { 
        id: 'functional_communication', 
        label: 'Functional Communication Rating', 
        type: 'select', 
        required: true,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'mostly_effective', label: 'Mostly Effective' },
          { value: 'partially_effective', label: 'Partially Effective' },
          { value: 'minimally_effective', label: 'Minimally Effective' },
          { value: 'nonfunctional', label: 'Non-functional' },
        ]
      },
      { 
        id: 'communication_narrative', 
        label: 'Communication Assessment Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_communication',
        placeholder: 'Comprehensive assessment of language abilities including comprehension, expression, naming, and functional communication...',
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
        id: 'prognosis_factors', 
        label: 'Prognostic Factors', 
        type: 'textarea', 
        required: false,
        placeholder: 'Factors affecting prognosis (motivation, support, medical stability)...',
        maxLength: 1000
      },
      { 
        id: 'goals_narrative', 
        label: 'Goals Rationale', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_goals',
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
        id: 'speech_exercises', 
        label: 'Speech/Articulation Exercises', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'language_therapy', 
        label: 'Language Therapy (Aphasia)', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'cognitive_therapy', 
        label: 'Cognitive-Linguistic Therapy', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'dysphagia_therapy', 
        label: 'Dysphagia Therapy', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'compensatory_strategies', 
        label: 'Compensatory Strategies Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'aac_training', 
        label: 'AAC Device Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'caregiver_education', 
        label: 'Caregiver Education', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'home_program', 
        label: 'Home Exercise Program', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'treatment_plan_narrative', 
        label: 'Treatment Plan Details', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_treatment_plan',
        placeholder: 'Describe specific interventions, progression plan, and rationale for skilled ST services...',
        maxLength: 2500
      },
      { 
        id: 'skilled_need', 
        label: 'Justification for Skilled Care', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_skilled_need',
        placeholder: 'Explain why skilled ST services are necessary and cannot be performed by patient/caregiver independently...',
        maxLength: 1500
      },
      { 
        id: 'safety_concerns', 
        label: 'Safety Concerns', 
        type: 'textarea', 
        required: false,
        placeholder: 'Aspiration risk, choking risk, communication barriers affecting safety...',
        maxLength: 1000
      },
    ],
  },
];

export const ST_EVALUATION_TEMPLATE: DocumentTemplate = {
  id: 'st_eval',
  name: 'Speech Therapy Evaluation',
  description: 'Initial ST evaluation for new admissions',
  category: 'visit',
  documentType: 'speech_therapy_evaluation',
  sections: ST_EVALUATION_SECTIONS,
  regulatoryRequirements: ['Medicare Home Health', 'OASIS correlation'],
  estimatedTimeMinutes: 90,
  requiresCosignature: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// ST VISIT NOTE TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const ST_VISIT_NOTE_SECTIONS: FormSectionDef[] = [
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
        id: 'speech_exercises', 
        label: 'Speech/Articulation Exercises', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'language_therapy', 
        label: 'Language Therapy (Aphasia)', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'cognitive_therapy', 
        label: 'Cognitive-Linguistic Therapy', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'dysphagia_therapy', 
        label: 'Dysphagia Therapy', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'compensatory_strategies', 
        label: 'Compensatory Strategies Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'aac_training', 
        label: 'AAC Device Training', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'caregiver_education', 
        label: 'Caregiver Education', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'home_program_review', 
        label: 'Home Program Review', 
        type: 'checkbox', 
        required: false
      },
      { 
        id: 'interventions_narrative', 
        label: 'Interventions Details', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_interventions',
        placeholder: 'Describe specific techniques, exercises, strategies used this visit...',
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
        id: 'attention_during_session', 
        label: 'Attention During Session', 
        type: 'select', 
        required: true,
        options: [
          { value: 'sustained', label: 'Sustained Throughout' },
          { value: 'adequate', label: 'Adequate' },
          { value: 'impaired', label: 'Impaired' },
          { value: 'severely_impaired', label: 'Severely Impaired' },
        ]
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
        id: 'cueing_required', 
        label: 'Cueing Required', 
        type: 'select', 
        required: true,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'minimal', label: 'Minimal Cueing' },
          { value: 'moderate', label: 'Moderate Cueing' },
          { value: 'maximal', label: 'Maximal Cueing' },
        ]
      },
      { 
        id: 'response_narrative', 
        label: 'Patient Response Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_response',
        placeholder: 'Document patient\'s response to treatment, performance level, strategies used...',
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
        smartPhraseCategory: 'st_progress',
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
        id: 'diet_change', 
        label: 'Diet/Liquid Consistency Change', 
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
        smartPhraseCategory: 'st_plan',
        placeholder: 'Describe plan for upcoming visits, any changes to treatment, and rationale...',
        maxLength: 1500
      },
      { 
        id: 'coordination_needed', 
        label: 'Coordination Needs', 
        type: 'textarea', 
        required: false,
        placeholder: 'Communication needed with MD, dietitian, other disciplines...',
        maxLength: 1000
      },
    ],
  },
];

export const ST_VISIT_NOTE_TEMPLATE: DocumentTemplate = {
  id: 'st_visit',
  name: 'Speech Therapy Visit Note',
  description: 'Routine ST visit documentation',
  category: 'visit',
  documentType: 'speech_therapy_visit',
  sections: ST_VISIT_NOTE_SECTIONS,
  regulatoryRequirements: ['Medicare Home Health'],
  estimatedTimeMinutes: 30,
  requiresCosignature: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// ST PROGRESS NOTE TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const ST_PROGRESS_NOTE_SECTIONS: FormSectionDef[] = [
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
        smartPhraseCategory: 'st_progress_summary',
        placeholder: 'Summarize patient\'s progress in speech, language, cognition, and/or swallowing...',
        maxLength: 2500
      },
    ],
  },
  {
    id: 'current_status',
    title: 'Current Status',
    description: 'Objective measurements and functional abilities',
    icon: 'activity',
    order: 2,
    fields: [
      { 
        id: 'speech_current', 
        label: 'Current Speech Status', 
        type: 'select', 
        required: false,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'language_current', 
        label: 'Current Language Status', 
        type: 'select', 
        required: false,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'cognitive_current', 
        label: 'Current Cognitive Status', 
        type: 'select', 
        required: false,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'swallow_current', 
        label: 'Current Swallow Status', 
        type: 'select', 
        required: false,
        options: [
          { value: 'wn', label: 'Within Normal Limits' },
          { value: 'mild_impaired', label: 'Mildly Impaired' },
          { value: 'mod_impaired', label: 'Moderately Impaired' },
          { value: 'severe_impaired', label: 'Severely Impaired' },
        ]
      },
      { 
        id: 'fois_current', 
        label: 'Current FOIS Level', 
        type: 'select', 
        required: false,
        options: [
          { value: '1', label: 'Level 1 - NPO' },
          { value: '2', label: 'Level 2 - Tube dependent, minimal PO' },
          { value: '3', label: 'Level 3 - Tube dependent, consistent PO' },
          { value: '4', label: 'Level 4 - Total PO, single consistency' },
          { value: '5', label: 'Level 5 - Total PO, multiple consistencies' },
          { value: '6', label: 'Level 6 - Total PO, modified diet' },
          { value: '7', label: 'Level 7 - Total PO, no restrictions' },
        ]
      },
      { 
        id: 'functional_communication_current', 
        label: 'Current Functional Communication', 
        type: 'select', 
        required: false,
        options: [
          { value: 'independent', label: 'Independent' },
          { value: 'mostly_effective', label: 'Mostly Effective' },
          { value: 'partially_effective', label: 'Partially Effective' },
          { value: 'minimally_effective', label: 'Minimally Effective' },
          { value: 'nonfunctional', label: 'Non-functional' },
        ]
      },
      { 
        id: 'current_status_narrative', 
        label: 'Current Status Details', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_current_status',
        placeholder: 'Document current functional levels with specific examples...',
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
        smartPhraseCategory: 'st_goals_progress',
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
        id: 'diet_change', 
        label: 'Diet/Liquid Consistency Change', 
        type: 'select', 
        required: false,
        options: [
          { value: 'no_change', label: 'No Change' },
          { value: 'advance', label: 'Advance Diet/Liquids' },
          { value: 'downgrade', label: 'More Restrictive' },
        ]
      },
      { 
        id: 'treatment_focus', 
        label: 'Treatment Focus Changes', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_treatment_changes',
        placeholder: 'Describe any changes to treatment interventions, techniques, or focus areas...',
        maxLength: 2000
      },
      { 
        id: 'skilled_need_continued', 
        label: 'Continued Need for Skilled ST', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_skilled_need',
        placeholder: 'Justify continued need for skilled speech therapy services...',
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

export const ST_PROGRESS_NOTE_TEMPLATE: DocumentTemplate = {
  id: 'st_progress',
  name: 'Speech Therapy Progress Note',
  description: 'Periodic ST progress assessment',
  category: 'visit',
  documentType: 'speech_therapy_progress_note',
  sections: ST_PROGRESS_NOTE_SECTIONS,
  regulatoryRequirements: ['Medicare Home Health', 'Required every 30 days'],
  estimatedTimeMinutes: 45,
  requiresCosignature: false,
};

// ═══════════════════════════════════════════════════════════════════════════
// ST DISCHARGE SUMMARY TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const ST_DISCHARGE_SUMMARY_SECTIONS: FormSectionDef[] = [
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
        label: 'ST Admission Date', 
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
    description: 'Functional status when ST started',
    icon: 'arrow-right-circle',
    order: 2,
    fields: [
      { 
        id: 'admission_speech', 
        label: 'Speech at Admission', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Moderately impaired intelligibility'
      },
      { 
        id: 'admission_language', 
        label: 'Language at Admission', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Moderate expressive aphasia'
      },
      { 
        id: 'admission_cognitive', 
        label: 'Cognition at Admission', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Moderately impaired attention and memory'
      },
      { 
        id: 'admission_swallow', 
        label: 'Swallow at Admission', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., FOIS Level 3, nectar thick liquids'
      },
      { 
        id: 'admission_communication', 
        label: 'Functional Communication at Admission', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Partially effective with maximal cueing'
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
        id: 'discharge_speech', 
        label: 'Speech at Discharge', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Mildly impaired, 90% intelligible'
      },
      { 
        id: 'discharge_language', 
        label: 'Language at Discharge', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Mild expressive aphasia with compensatory strategies'
      },
      { 
        id: 'discharge_cognitive', 
        label: 'Cognition at Discharge', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Mildly impaired with compensatory strategies'
      },
      { 
        id: 'discharge_swallow', 
        label: 'Swallow at Discharge', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., FOIS Level 7, regular diet/thin liquids'
      },
      { 
        id: 'discharge_communication', 
        label: 'Functional Communication at Discharge', 
        type: 'text', 
        required: false,
        placeholder: 'e.g., Mostly effective with minimal cueing'
      },
      { 
        id: 'discharge_status_narrative', 
        label: 'Discharge Status Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_discharge_status',
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
        smartPhraseCategory: 'st_outcomes',
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
        id: 'compensatory_strategies_taught', 
        label: 'Compensatory Strategies', 
        type: 'textarea', 
        required: false,
        placeholder: 'List compensatory strategies taught to patient/caregiver...',
        maxLength: 1500
      },
      { 
        id: 'aac_recommendations', 
        label: 'AAC Device Recommendations', 
        type: 'textarea', 
        required: false,
        placeholder: 'Communication device or system recommendations...',
        maxLength: 1000
      },
      { 
        id: 'diet_recommendations', 
        label: 'Diet/Swallow Recommendations', 
        type: 'textarea', 
        required: false,
        placeholder: 'Ongoing diet consistency, positioning, swallow strategies...',
        maxLength: 1500
      },
      { 
        id: 'followup_care', 
        label: 'Follow-up Care Recommendations', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_followup',
        placeholder: 'Recommendations for continued care, outpatient therapy, physician follow-up...',
        maxLength: 1500
      },
      { 
        id: 'safety_concerns', 
        label: 'Ongoing Safety Concerns', 
        type: 'textarea', 
        required: false,
        placeholder: 'Aspiration risk, communication barriers, cognitive safety concerns...',
        maxLength: 1000
      },
      { 
        id: 'discharge_summary', 
        label: 'Discharge Summary', 
        type: 'textarea', 
        required: true,
        smartPhraseCategory: 'st_discharge_summary',
        placeholder: 'Overall summary of ST episode, patient progress, and discharge status...',
        maxLength: 2500
      },
    ],
  },
];

export const ST_DISCHARGE_SUMMARY_TEMPLATE: DocumentTemplate = {
  id: 'st_discharge',
  name: 'Speech Therapy Discharge Summary',
  description: 'Final ST discharge documentation',
  category: 'visit',
  documentType: 'speech_therapy_discharge',
  sections: ST_DISCHARGE_SUMMARY_SECTIONS,
  regulatoryRequirements: ['Medicare Home Health', 'Required at discharge'],
  estimatedTimeMinutes: 60,
  requiresCosignature: false,
};

// Export all ST templates
export const ST_TEMPLATES = {
  evaluation: ST_EVALUATION_TEMPLATE,
  visitNote: ST_VISIT_NOTE_TEMPLATE,
  progressNote: ST_PROGRESS_NOTE_TEMPLATE,
  dischargeSummary: ST_DISCHARGE_SUMMARY_TEMPLATE,
};
