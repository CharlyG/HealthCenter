/**
 * SPEECH THERAPY ASSESSMENT CONFIGURATION
 * 
 * Configuration for Speech-Language Pathology Evaluation
 * Covers swallow evaluation, communication, cognitive-linguistic assessment
 * 
 * @version 1.0.0
 * @compliance ASHA Guidelines, Medicare, State Regulations
 */

import type { AssessmentTypeConfiguration } from '../types/assessmentTypes';

export const SPEECH_THERAPY_CONFIGURATION: AssessmentTypeConfiguration = {
  id: 'speech-therapy-eval-2024',
  name: 'Speech-Language Pathology Evaluation',
  version: 'SLP Assessment v2024.1',
  category: 'clinical-visit',
  
  sections: [
    {
      id: 'visit-info',
      title: 'Visit Information',
      order: 1,
      questions: [
        { id: 'visit-type', text: 'Visit Type', type: 'single-select', required: true, order: 1,
          options: [
            { value: 'initial-eval', label: 'Initial Evaluation', order: 1 },
            { value: 're-eval', label: 'Re-evaluation', order: 2 },
            { value: 'treatment', label: 'Treatment Visit', order: 3 },
            { value: 'discharge', label: 'Discharge Evaluation', order: 4 },
          ],
        },
        { id: 'visit-date', text: 'Visit Date', type: 'date', required: true, order: 2 },
        { id: 'visit-duration', text: 'Visit Duration (minutes)', type: 'number', required: true, order: 3, validation: { min: 15, max: 180 } },
        { id: 'referral-reason', text: 'Reason for Referral', type: 'long-text', required: true, order: 4 },
        { id: 'primary-diagnosis', text: 'Primary Diagnosis', type: 'text', required: true, order: 5 },
      ],
    },

    {
      id: 'swallowing-assessment',
      title: 'Swallowing Assessment',
      description: 'Dysphagia evaluation and diet recommendations',
      order: 2,
      questions: [
        { id: 'dysphagia-screening', text: 'Dysphagia Screening Performed', type: 'boolean', required: true, order: 1 },
        { id: 'dysphagia-present', text: 'Dysphagia Present', type: 'boolean', required: false, order: 2,
          conditional: { dependsOn: 'dysphagia-screening', showWhen: { equals: true } },
        },
        { id: 'dysphagia-phase', text: 'Phase of Swallow Affected', type: 'multi-select', required: false, order: 3,
          options: [
            { value: 'oral-prep', label: 'Oral Preparatory', order: 1 },
            { value: 'oral', label: 'Oral Phase', order: 2 },
            { value: 'pharyngeal', label: 'Pharyngeal Phase', order: 3 },
            { value: 'esophageal', label: 'Esophageal Phase', order: 4 },
          ],
          conditional: { dependsOn: 'dysphagia-present', showWhen: { equals: true } },
        },
        { id: 'aspiration-risk', text: 'Aspiration Risk', type: 'single-select', required: false, order: 4,
          options: [
            { value: 'low', label: 'Low Risk', order: 1 },
            { value: 'moderate', label: 'Moderate Risk', order: 2 },
            { value: 'high', label: 'High Risk', order: 3 },
          ],
          conditional: { dependsOn: 'dysphagia-present', showWhen: { equals: true } },
        },
        { id: 'current-diet', text: 'Current Diet Consistency', type: 'single-select', required: true, order: 5,
          options: [
            { value: 'regular', label: 'Regular Diet', order: 1 },
            { value: 'soft', label: 'Soft Diet', order: 2 },
            { value: 'mechanical-soft', label: 'Mechanical Soft', order: 3 },
            { value: 'puree', label: 'Pureed Diet', order: 4 },
            { value: 'npo', label: 'NPO (Nothing by Mouth)', order: 5 },
          ],
        },
        { id: 'liquid-consistency', text: 'Current Liquid Consistency', type: 'single-select', required: true, order: 6,
          options: [
            { value: 'thin', label: 'Thin Liquids', order: 1 },
            { value: 'nectar-thick', label: 'Nectar-Thick', order: 2 },
            { value: 'honey-thick', label: 'Honey-Thick', order: 3 },
            { value: 'pudding-thick', label: 'Pudding-Thick', order: 4 },
          ],
        },
        { id: 'feeding-method', text: 'Feeding Method', type: 'single-select', required: true, order: 7,
          options: [
            { value: 'po', label: 'Oral Feeding (PO)', order: 1 },
            { value: 'ng-tube', label: 'NG Tube', order: 2 },
            { value: 'g-tube', label: 'G-Tube', order: 3 },
            { value: 'j-tube', label: 'J-Tube', order: 4 },
            { value: 'combination', label: 'Combination PO + Tube', order: 5 },
          ],
        },
        { id: 'diet-recommendation', text: 'Diet Recommendation', type: 'long-text', required: false, order: 8,
          helpText: 'Recommended diet modifications and rationale',
        },
      ],
    },

    {
      id: 'speech-voice',
      title: 'Speech & Voice Assessment',
      description: 'Articulation, phonation, resonance evaluation',
      order: 3,
      questions: [
        { id: 'speech-intelligibility', text: 'Speech Intelligibility', type: 'single-select', required: true, order: 1,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'mild', label: 'Mildly Reduced', order: 2 },
            { value: 'moderate', label: 'Moderately Reduced', order: 3 },
            { value: 'severe', label: 'Severely Reduced', order: 4 },
            { value: 'unintelligible', label: 'Unintelligible', order: 5 },
          ],
        },
        { id: 'articulation', text: 'Articulation', type: 'single-select', required: true, order: 2,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'mild-errors', label: 'Mild Errors', order: 2 },
            { value: 'mod-errors', label: 'Moderate Errors', order: 3 },
            { value: 'severe-errors', label: 'Severe Errors', order: 4 },
          ],
        },
        { id: 'voice-quality', text: 'Voice Quality', type: 'multi-select', required: false, order: 3,
          options: [
            { value: 'normal', label: 'Normal', order: 1 },
            { value: 'hoarse', label: 'Hoarse', order: 2 },
            { value: 'breathy', label: 'Breathy', order: 3 },
            { value: 'strained', label: 'Strained', order: 4 },
            { value: 'weak', label: 'Weak/Soft', order: 5 },
          ],
        },
        { id: 'fluency', text: 'Fluency', type: 'single-select', required: true, order: 4,
          options: [
            { value: 'fluent', label: 'Fluent', order: 1 },
            { value: 'mild-dysfluency', label: 'Mild Dysfluency', order: 2 },
            { value: 'mod-dysfluency', label: 'Moderate Dysfluency', order: 3 },
            { value: 'severe-dysfluency', label: 'Severe Dysfluency', order: 4 },
          ],
        },
      ],
    },

    {
      id: 'language-cognition',
      title: 'Language & Cognitive-Linguistic Assessment',
      description: 'Expressive/receptive language, cognition',
      order: 4,
      questions: [
        { id: 'receptive-language', text: 'Receptive Language (Understanding)', type: 'single-select', required: true, order: 1,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'mild-impair', label: 'Mild Impairment', order: 2 },
            { value: 'mod-impair', label: 'Moderate Impairment', order: 3 },
            { value: 'severe-impair', label: 'Severe Impairment', order: 4 },
          ],
        },
        { id: 'expressive-language', text: 'Expressive Language (Speaking)', type: 'single-select', required: true, order: 2,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'mild-impair', label: 'Mild Impairment', order: 2 },
            { value: 'mod-impair', label: 'Moderate Impairment', order: 3 },
            { value: 'severe-impair', label: 'Severe Impairment', order: 4 },
          ],
        },
        { id: 'aphasia-type', text: 'Aphasia Type', type: 'single-select', required: false, order: 3,
          options: [
            { value: 'none', label: 'No Aphasia', order: 1 },
            { value: 'broca', label: 'Broca\'s (Expressive)', order: 2 },
            { value: 'wernicke', label: 'Wernicke\'s (Receptive)', order: 3 },
            { value: 'global', label: 'Global Aphasia', order: 4 },
            { value: 'anomic', label: 'Anomic Aphasia', order: 5 },
          ],
        },
        { id: 'memory', text: 'Memory/Recall', type: 'single-select', required: true, order: 4,
          options: [
            { value: 'intact', label: 'Intact', order: 1 },
            { value: 'mild-impair', label: 'Mild Impairment', order: 2 },
            { value: 'mod-impair', label: 'Moderate Impairment', order: 3 },
            { value: 'severe-impair', label: 'Severe Impairment', order: 4 },
          ],
        },
        { id: 'attention', text: 'Attention/Concentration', type: 'single-select', required: true, order: 5,
          options: [
            { value: 'intact', label: 'Intact', order: 1 },
            { value: 'mild-impair', label: 'Mild Impairment', order: 2 },
            { value: 'mod-impair', label: 'Moderate Impairment', order: 3 },
            { value: 'severe-impair', label: 'Severe Impairment', order: 4 },
          ],
        },
        { id: 'problem-solving', text: 'Problem Solving/Reasoning', type: 'single-select', required: false, order: 6,
          options: [
            { value: 'intact', label: 'Intact', order: 1 },
            { value: 'mild-impair', label: 'Mild Impairment', order: 2 },
            { value: 'mod-impair', label: 'Moderate Impairment', order: 3 },
            { value: 'severe-impair', label: 'Severe Impairment', order: 4 },
          ],
        },
      ],
    },

    {
      id: 'communication-strategies',
      title: 'Communication Strategies',
      description: 'Current communication methods and needs',
      order: 5,
      questions: [
        { id: 'primary-communication', text: 'Primary Communication Method', type: 'multi-select', required: true, order: 1,
          options: [
            { value: 'verbal', label: 'Verbal Speech', order: 1 },
            { value: 'gestures', label: 'Gestures/Pointing', order: 2 },
            { value: 'writing', label: 'Writing', order: 3 },
            { value: 'communication-board', label: 'Communication Board', order: 4 },
            { value: 'aac-device', label: 'AAC Device', order: 5 },
          ],
        },
        { id: 'hearing-status', text: 'Hearing Status', type: 'single-select', required: true, order: 2,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'mild-loss', label: 'Mild Hearing Loss', order: 2 },
            { value: 'mod-loss', label: 'Moderate Hearing Loss', order: 3 },
            { value: 'severe-loss', label: 'Severe Hearing Loss', order: 4 },
            { value: 'hearing-aid', label: 'Uses Hearing Aid', order: 5 },
          ],
        },
        { id: 'vision-status', text: 'Vision Status', type: 'single-select', required: true, order: 3,
          options: [
            { value: 'wnl', label: 'Within Normal Limits', order: 1 },
            { value: 'mild-impair', label: 'Mild Impairment', order: 2 },
            { value: 'mod-impair', label: 'Moderate Impairment', order: 3 },
            { value: 'severe-impair', label: 'Severe Impairment', order: 4 },
            { value: 'corrective-lenses', label: 'Uses Corrective Lenses', order: 5 },
          ],
        },
        { id: 'aac-needed', text: 'AAC Device/Communication Aid Needed', type: 'boolean', required: false, order: 4 },
      ],
    },

    {
      id: 'interventions',
      title: 'Treatment Interventions',
      order: 6,
      questions: [
        { id: 'interventions-provided', text: 'Interventions Provided', type: 'multi-select', required: true, order: 1,
          options: [
            { value: 'swallow-therapy', label: 'Swallowing Therapy', order: 1 },
            { value: 'articulation-therapy', label: 'Articulation Therapy', order: 2 },
            { value: 'voice-therapy', label: 'Voice Therapy', order: 3 },
            { value: 'language-therapy', label: 'Language Therapy', order: 4 },
            { value: 'cognitive-therapy', label: 'Cognitive-Linguistic Therapy', order: 5 },
            { value: 'aac-training', label: 'AAC Training', order: 6 },
            { value: 'patient-education', label: 'Patient/Caregiver Education', order: 7 },
          ],
        },
        { id: 'patient-tolerance', text: 'Patient Tolerance of Treatment', type: 'single-select', required: true, order: 2,
          options: [
            { value: 'excellent', label: 'Excellent', order: 1 },
            { value: 'good', label: 'Good', order: 2 },
            { value: 'fair', label: 'Fair', order: 3 },
            { value: 'poor', label: 'Poor', order: 4 },
          ],
        },
      ],
    },

    {
      id: 'goals-plan',
      title: 'Goals & Plan of Care',
      order: 7,
      questions: [
        { id: 'short-term-goals', text: 'Short-Term Goals (2-4 weeks)', type: 'long-text', required: true, order: 1 },
        { id: 'long-term-goals', text: 'Long-Term Goals (Episode of Care)', type: 'long-text', required: true, order: 2 },
        { id: 'treatment-frequency', text: 'Recommended Treatment Frequency', type: 'single-select', required: true, order: 3,
          options: [
            { value: '1x-week', label: '1x per week', order: 1 },
            { value: '2x-week', label: '2x per week', order: 2 },
            { value: '3x-week', label: '3x per week', order: 3 },
            { value: '4x-week', label: '4x per week', order: 4 },
            { value: '5x-week', label: '5x per week', order: 5 },
          ],
        },
        { id: 'estimated-duration', text: 'Estimated Duration of Care', type: 'single-select', required: true, order: 4,
          options: [
            { value: '2-weeks', label: '2 weeks', order: 1 },
            { value: '4-weeks', label: '4 weeks', order: 2 },
            { value: '6-weeks', label: '6 weeks', order: 3 },
            { value: '8-weeks', label: '8 weeks', order: 4 },
            { value: '12-weeks', label: '12 weeks', order: 5 },
          ],
        },
        { id: 'rehab-potential', text: 'Rehabilitation Potential', type: 'single-select', required: true, order: 5,
          options: [
            { value: 'excellent', label: 'Excellent', order: 1 },
            { value: 'good', label: 'Good', order: 2 },
            { value: 'fair', label: 'Fair', order: 3 },
            { value: 'poor', label: 'Poor', order: 4 },
          ],
        },
        { id: 'clinical-summary', text: 'Clinical Summary/Impression', type: 'long-text', required: true, order: 6 },
      ],
    },
  ],

  regulatoryBody: 'ASHA/Medicare',
  effectiveDate: '2024-01-01',
  requiredTimeframe: { mustCompleteWithin: 24, timeUnit: 'hours' },
  completionRequirements: {
    minimumProgress: 100,
    requiredSections: ['visit-info', 'swallowing-assessment', 'speech-voice', 'language-cognition', 'communication-strategies', 'interventions', 'goals-plan'],
    requiredQuestions: ['visit-type', 'visit-date', 'referral-reason', 'speech-intelligibility', 'interventions-provided', 'short-term-goals', 'long-term-goals', 'clinical-summary'],
  },
};

export default SPEECH_THERAPY_CONFIGURATION;
