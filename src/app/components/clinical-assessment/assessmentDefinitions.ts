/**
 * Clinical Assessment Definitions
 * Pre-configured assessment templates for all disciplines
 */

import type { AssessmentDefinition } from './types';
import { oasisEAssessment } from './oasisEDefinition';

// ─── Physical Therapy Evaluation ───────────────────────────────────────────

export const physicalTherapyEvaluation: AssessmentDefinition = {
  id: 'pt-eval-001',
  type: 'physical-therapy-evaluation',
  title: 'Physical Therapy Evaluation',
  discipline: 'Physical Therapy',
  description: 'Comprehensive physical therapy evaluation for home health patients',
  sections: [
    {
      id: 'patient-history',
      title: 'Patient History',
      description: 'Background information and reason for referral',
      order: 1,
      questions: [
        {
          id: 'referral-reason',
          type: 'textarea',
          label: 'Reason for Referral',
          placeholder: 'Describe the primary reason for PT evaluation...',
          required: true,
        },
        {
          id: 'prior-functional-level',
          type: 'radio',
          label: 'Prior Functional Level',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'modified-independent', label: 'Modified Independent' },
            { value: 'minimal-assist', label: 'Minimal Assistance' },
            { value: 'moderate-assist', label: 'Moderate Assistance' },
            { value: 'maximal-assist', label: 'Maximal Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
        {
          id: 'living-situation',
          type: 'radio',
          label: 'Living Situation',
          required: true,
          options: [
            { value: 'alone', label: 'Lives Alone' },
            { value: 'with-family', label: 'Lives with Family' },
            { value: 'with-caregiver', label: 'Lives with Caregiver' },
            { value: 'assisted-living', label: 'Assisted Living' },
          ],
        },
        {
          id: 'home-environment',
          type: 'multi-select',
          label: 'Home Environment Barriers',
          options: [
            { value: 'stairs', label: 'Stairs' },
            { value: 'narrow-doorways', label: 'Narrow Doorways' },
            { value: 'rugs', label: 'Throw Rugs' },
            { value: 'poor-lighting', label: 'Poor Lighting' },
            { value: 'no-grab-bars', label: 'No Grab Bars' },
            { value: 'clutter', label: 'Clutter' },
          ],
        },
      ],
    },
    {
      id: 'pain-assessment',
      title: 'Pain Assessment',
      description: 'Evaluate pain levels and characteristics',
      order: 2,
      questions: [
        {
          id: 'pain-scale',
          type: 'pain-scale',
          label: 'Current Pain Level (0-10)',
          required: true,
          min: 0,
          max: 10,
          helpText: '0 = No pain, 10 = Worst pain imaginable',
        },
        {
          id: 'pain-location',
          type: 'text',
          label: 'Pain Location(s)',
          placeholder: 'E.g., Right knee, lower back...',
          required: true,
        },
        {
          id: 'pain-quality',
          type: 'multi-select',
          label: 'Pain Quality',
          options: [
            { value: 'sharp', label: 'Sharp' },
            { value: 'dull', label: 'Dull' },
            { value: 'aching', label: 'Aching' },
            { value: 'burning', label: 'Burning' },
            { value: 'throbbing', label: 'Throbbing' },
            { value: 'shooting', label: 'Shooting' },
          ],
        },
        {
          id: 'pain-triggers',
          type: 'multi-select',
          label: 'Pain Triggers',
          options: [
            { value: 'movement', label: 'Movement' },
            { value: 'weight-bearing', label: 'Weight Bearing' },
            { value: 'stairs', label: 'Stairs' },
            { value: 'prolonged-sitting', label: 'Prolonged Sitting' },
            { value: 'prolonged-standing', label: 'Prolonged Standing' },
            { value: 'rest', label: 'At Rest' },
          ],
        },
      ],
    },
    {
      id: 'mobility-assessment',
      title: 'Mobility Assessment',
      description: 'Evaluate gait, transfers, and balance',
      order: 3,
      questions: [
        {
          id: 'gait-pattern',
          type: 'dropdown',
          label: 'Gait Pattern',
          required: true,
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'antalgic', label: 'Antalgic' },
            { value: 'ataxic', label: 'Ataxic' },
            { value: 'hemiplegic', label: 'Hemiplegic' },
            { value: 'parkinsonian', label: 'Parkinsonian' },
            { value: 'trendelenburg', label: 'Trendelenburg' },
            { value: 'wide-based', label: 'Wide-Based' },
          ],
        },
        {
          id: 'assistive-device',
          type: 'dropdown',
          label: 'Assistive Device',
          required: true,
          options: [
            { value: 'none', label: 'None' },
            { value: 'cane', label: 'Cane' },
            { value: 'walker', label: 'Walker' },
            { value: 'rollator', label: 'Rollator' },
            { value: 'crutches', label: 'Crutches' },
            { value: 'wheelchair', label: 'Wheelchair' },
          ],
        },
        {
          id: 'transfer-ability',
          type: 'radio',
          label: 'Transfer Ability (Bed/Chair)',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'supervision', label: 'Supervision' },
            { value: 'minimal-assist', label: 'Minimal Assistance' },
            { value: 'moderate-assist', label: 'Moderate Assistance' },
            { value: 'maximal-assist', label: 'Maximal Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
        {
          id: 'balance-sitting',
          type: 'radio',
          label: 'Sitting Balance',
          required: true,
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'fair', label: 'Fair' },
            { value: 'poor', label: 'Poor' },
            { value: 'unable', label: 'Unable to Maintain' },
          ],
        },
        {
          id: 'balance-standing',
          type: 'radio',
          label: 'Standing Balance',
          required: true,
          options: [
            { value: 'normal', label: 'Normal' },
            { value: 'fair', label: 'Fair' },
            { value: 'poor', label: 'Poor' },
            { value: 'unable', label: 'Unable to Stand' },
          ],
        },
      ],
    },
    {
      id: 'strength-assessment',
      title: 'Strength Assessment',
      description: 'Manual muscle testing',
      order: 4,
      questions: [
        {
          id: 'le-strength-right',
          type: 'functional-score',
          label: 'Right Lower Extremity Strength (0-5)',
          required: true,
          min: 0,
          max: 5,
          helpText: '0=No contraction, 5=Normal strength',
        },
        {
          id: 'le-strength-left',
          type: 'functional-score',
          label: 'Left Lower Extremity Strength (0-5)',
          required: true,
          min: 0,
          max: 5,
        },
        {
          id: 'ue-strength-right',
          type: 'functional-score',
          label: 'Right Upper Extremity Strength (0-5)',
          required: true,
          min: 0,
          max: 5,
        },
        {
          id: 'ue-strength-left',
          type: 'functional-score',
          label: 'Left Upper Extremity Strength (0-5)',
          required: true,
          min: 0,
          max: 5,
        },
        {
          id: 'strength-notes',
          type: 'textarea',
          label: 'Strength Assessment Notes',
          placeholder: 'Document any specific weaknesses or asymmetries...',
        },
      ],
    },
    {
      id: 'functional-limitations',
      title: 'Functional Limitations',
      description: 'ADL and mobility restrictions',
      order: 5,
      questions: [
        {
          id: 'adl-limitations',
          type: 'multi-select',
          label: 'ADL Limitations',
          required: true,
          options: [
            { value: 'bathing', label: 'Bathing' },
            { value: 'dressing', label: 'Dressing' },
            { value: 'toileting', label: 'Toileting' },
            { value: 'grooming', label: 'Grooming' },
            { value: 'feeding', label: 'Feeding' },
          ],
        },
        {
          id: 'mobility-limitations',
          type: 'multi-select',
          label: 'Mobility Limitations',
          required: true,
          options: [
            { value: 'bed-mobility', label: 'Bed Mobility' },
            { value: 'transfers', label: 'Transfers' },
            { value: 'ambulation', label: 'Ambulation' },
            { value: 'stairs', label: 'Stairs' },
            { value: 'wheelchair', label: 'Wheelchair Mobility' },
          ],
        },
        {
          id: 'fall-risk',
          type: 'radio',
          label: 'Fall Risk Level',
          required: true,
          options: [
            { value: 'low', label: 'Low Risk' },
            { value: 'moderate', label: 'Moderate Risk' },
            { value: 'high', label: 'High Risk' },
          ],
        },
      ],
    },
    {
      id: 'plan-of-care',
      title: 'Plan of Care',
      description: 'Treatment goals and recommendations',
      order: 6,
      questions: [
        {
          id: 'therapy-goals',
          type: 'textarea',
          label: 'Therapy Goals',
          placeholder: 'List 2-3 measurable therapy goals...',
          required: true,
        },
        {
          id: 'recommended-frequency',
          type: 'dropdown',
          label: 'Recommended Frequency',
          required: true,
          options: [
            { value: '1x-week', label: '1x per week' },
            { value: '2x-week', label: '2x per week' },
            { value: '3x-week', label: '3x per week' },
            { value: '4x-week', label: '4x per week' },
            { value: '5x-week', label: '5x per week' },
          ],
        },
        {
          id: 'expected-duration',
          type: 'dropdown',
          label: 'Expected Duration',
          required: true,
          options: [
            { value: '2-weeks', label: '2 weeks' },
            { value: '4-weeks', label: '4 weeks' },
            { value: '6-weeks', label: '6 weeks' },
            { value: '8-weeks', label: '8 weeks' },
            { value: '12-weeks', label: '12 weeks' },
          ],
        },
        {
          id: 'equipment-needs',
          type: 'multi-select',
          label: 'Equipment Needs',
          options: [
            { value: 'walker', label: 'Walker' },
            { value: 'cane', label: 'Cane' },
            { value: 'wheelchair', label: 'Wheelchair' },
            { value: 'grab-bars', label: 'Grab Bars' },
            { value: 'raised-toilet', label: 'Raised Toilet Seat' },
            { value: 'shower-chair', label: 'Shower Chair' },
          ],
        },
      ],
    },
  ],
};

// ─── Speech Therapy Evaluation ─────────────────────────────────────────────

export const speechTherapyEvaluation: AssessmentDefinition = {
  id: 'st-eval-001',
  type: 'speech-therapy-evaluation',
  title: 'Speech Therapy Evaluation',
  discipline: 'Speech Therapy',
  description: 'Comprehensive speech and swallowing evaluation',
  sections: [
    {
      id: 'communication',
      title: 'Communication Assessment',
      description: 'Expressive and receptive language evaluation',
      order: 1,
      questions: [
        {
          id: 'expressive-language',
          type: 'radio',
          label: 'Expressive Language',
          required: true,
          options: [
            { value: 'normal', label: 'Within Normal Limits' },
            { value: 'mild-impairment', label: 'Mild Impairment' },
            { value: 'moderate-impairment', label: 'Moderate Impairment' },
            { value: 'severe-impairment', label: 'Severe Impairment' },
          ],
        },
        {
          id: 'receptive-language',
          type: 'radio',
          label: 'Receptive Language',
          required: true,
          options: [
            { value: 'normal', label: 'Within Normal Limits' },
            { value: 'mild-impairment', label: 'Mild Impairment' },
            { value: 'moderate-impairment', label: 'Moderate Impairment' },
            { value: 'severe-impairment', label: 'Severe Impairment' },
          ],
        },
        {
          id: 'speech-clarity',
          type: 'radio',
          label: 'Speech Clarity',
          required: true,
          options: [
            { value: 'clear', label: 'Clear' },
            { value: 'mildly-unclear', label: 'Mildly Unclear' },
            { value: 'moderately-unclear', label: 'Moderately Unclear' },
            { value: 'severely-unclear', label: 'Severely Unclear' },
          ],
        },
        {
          id: 'communication-notes',
          type: 'textarea',
          label: 'Communication Assessment Notes',
          placeholder: 'Document specific communication deficits...',
        },
      ],
    },
    {
      id: 'cognition',
      title: 'Cognitive Assessment',
      description: 'Memory, attention, and processing',
      order: 2,
      questions: [
        {
          id: 'memory',
          type: 'radio',
          label: 'Memory',
          required: true,
          options: [
            { value: 'intact', label: 'Intact' },
            { value: 'mild-deficit', label: 'Mild Deficit' },
            { value: 'moderate-deficit', label: 'Moderate Deficit' },
            { value: 'severe-deficit', label: 'Severe Deficit' },
          ],
        },
        {
          id: 'attention',
          type: 'radio',
          label: 'Attention/Concentration',
          required: true,
          options: [
            { value: 'intact', label: 'Intact' },
            { value: 'mild-deficit', label: 'Mild Deficit' },
            { value: 'moderate-deficit', label: 'Moderate Deficit' },
            { value: 'severe-deficit', label: 'Severe Deficit' },
          ],
        },
        {
          id: 'problem-solving',
          type: 'radio',
          label: 'Problem Solving',
          required: true,
          options: [
            { value: 'intact', label: 'Intact' },
            { value: 'mild-deficit', label: 'Mild Deficit' },
            { value: 'moderate-deficit', label: 'Moderate Deficit' },
            { value: 'severe-deficit', label: 'Severe Deficit' },
          ],
        },
      ],
    },
    {
      id: 'swallowing',
      title: 'Swallowing Assessment',
      description: 'Dysphagia screening and aspiration risk',
      order: 3,
      questions: [
        {
          id: 'swallowing-difficulty',
          type: 'radio',
          label: 'Swallowing Difficulty Present',
          required: true,
          options: [
            { value: 'no', label: 'No' },
            { value: 'yes', label: 'Yes' },
          ],
        },
        {
          id: 'aspiration-risk',
          type: 'radio',
          label: 'Aspiration Risk Level',
          required: true,
          options: [
            { value: 'low', label: 'Low Risk' },
            { value: 'moderate', label: 'Moderate Risk' },
            { value: 'high', label: 'High Risk' },
          ],
        },
        {
          id: 'diet-texture',
          type: 'dropdown',
          label: 'Current Diet Texture',
          required: true,
          options: [
            { value: 'regular', label: 'Regular' },
            { value: 'mechanical-soft', label: 'Mechanical Soft' },
            { value: 'minced-moist', label: 'Minced & Moist' },
            { value: 'pureed', label: 'Pureed' },
          ],
        },
        {
          id: 'liquid-consistency',
          type: 'dropdown',
          label: 'Liquid Consistency',
          required: true,
          options: [
            { value: 'thin', label: 'Thin' },
            { value: 'nectar-thick', label: 'Nectar Thick' },
            { value: 'honey-thick', label: 'Honey Thick' },
            { value: 'pudding-thick', label: 'Pudding Thick' },
          ],
        },
      ],
    },
    {
      id: 'plan-of-care',
      title: 'Plan of Care',
      description: 'Treatment goals and recommendations',
      order: 4,
      questions: [
        {
          id: 'therapy-goals',
          type: 'textarea',
          label: 'Therapy Goals',
          placeholder: 'List 2-3 measurable therapy goals...',
          required: true,
        },
        {
          id: 'recommended-frequency',
          type: 'dropdown',
          label: 'Recommended Frequency',
          required: true,
          options: [
            { value: '1x-week', label: '1x per week' },
            { value: '2x-week', label: '2x per week' },
            { value: '3x-week', label: '3x per week' },
          ],
        },
        {
          id: 'safety-recommendations',
          type: 'multi-select',
          label: 'Safety Recommendations',
          options: [
            { value: 'supervised-feeding', label: 'Supervised Feeding' },
            { value: 'aspiration-precautions', label: 'Aspiration Precautions' },
            { value: 'thickened-liquids', label: 'Thickened Liquids' },
            { value: 'modified-diet', label: 'Modified Diet Texture' },
          ],
        },
      ],
    },
  ],
};

// ─── Occupational Therapy Evaluation ───────────────────────────────────────

export const occupationalTherapyEvaluation: AssessmentDefinition = {
  id: 'ot-eval-001',
  type: 'occupational-therapy-evaluation',
  title: 'Occupational Therapy Evaluation',
  discipline: 'Occupational Therapy',
  description: 'Comprehensive occupational therapy evaluation',
  sections: [
    {
      id: 'adl-assessment',
      title: 'ADL Assessment',
      description: 'Activities of Daily Living evaluation',
      order: 1,
      questions: [
        {
          id: 'bathing',
          type: 'radio',
          label: 'Bathing',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'supervision', label: 'Supervision' },
            { value: 'minimal-assist', label: 'Minimal Assistance' },
            { value: 'moderate-assist', label: 'Moderate Assistance' },
            { value: 'maximal-assist', label: 'Maximal Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
        {
          id: 'dressing-upper',
          type: 'radio',
          label: 'Dressing - Upper Body',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'supervision', label: 'Supervision' },
            { value: 'minimal-assist', label: 'Minimal Assistance' },
            { value: 'moderate-assist', label: 'Moderate Assistance' },
            { value: 'maximal-assist', label: 'Maximal Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
        {
          id: 'dressing-lower',
          type: 'radio',
          label: 'Dressing - Lower Body',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'supervision', label: 'Supervision' },
            { value: 'minimal-assist', label: 'Minimal Assistance' },
            { value: 'moderate-assist', label: 'Moderate Assistance' },
            { value: 'maximal-assist', label: 'Maximal Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
        {
          id: 'toileting',
          type: 'radio',
          label: 'Toileting',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'supervision', label: 'Supervision' },
            { value: 'minimal-assist', label: 'Minimal Assistance' },
            { value: 'moderate-assist', label: 'Moderate Assistance' },
            { value: 'maximal-assist', label: 'Maximal Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
        {
          id: 'grooming',
          type: 'radio',
          label: 'Grooming',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'supervision', label: 'Supervision' },
            { value: 'minimal-assist', label: 'Minimal Assistance' },
            { value: 'moderate-assist', label: 'Moderate Assistance' },
            { value: 'maximal-assist', label: 'Maximal Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
      ],
    },
    {
      id: 'iadl-assessment',
      title: 'IADL Assessment',
      description: 'Instrumental Activities of Daily Living',
      order: 2,
      questions: [
        {
          id: 'meal-prep',
          type: 'radio',
          label: 'Meal Preparation',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'modified-independent', label: 'Modified Independent' },
            { value: 'requires-assistance', label: 'Requires Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
        {
          id: 'housekeeping',
          type: 'radio',
          label: 'Light Housekeeping',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'modified-independent', label: 'Modified Independent' },
            { value: 'requires-assistance', label: 'Requires Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
        {
          id: 'medication-management',
          type: 'radio',
          label: 'Medication Management',
          required: true,
          options: [
            { value: 'independent', label: 'Independent' },
            { value: 'modified-independent', label: 'Modified Independent' },
            { value: 'requires-assistance', label: 'Requires Assistance' },
            { value: 'dependent', label: 'Dependent' },
          ],
        },
      ],
    },
    {
      id: 'plan-of-care',
      title: 'Plan of Care',
      description: 'Treatment goals and recommendations',
      order: 3,
      questions: [
        {
          id: 'therapy-goals',
          type: 'textarea',
          label: 'Therapy Goals',
          placeholder: 'List 2-3 measurable therapy goals...',
          required: true,
        },
        {
          id: 'recommended-frequency',
          type: 'dropdown',
          label: 'Recommended Frequency',
          required: true,
          options: [
            { value: '1x-week', label: '1x per week' },
            { value: '2x-week', label: '2x per week' },
            { value: '3x-week', label: '3x per week' },
          ],
        },
      ],
    },
  ],
};

// ─── Skilled Nursing Assessment ────────────────────────────────────────────

export const skilledNursingAssessment: AssessmentDefinition = {
  id: 'sn-assess-001',
  type: 'skilled-nursing-assessment',
  title: 'Skilled Nursing Assessment',
  discipline: 'Skilled Nursing',
  description: 'Comprehensive skilled nursing assessment',
  sections: [
    {
      id: 'vital-signs',
      title: 'Vital Signs',
      order: 1,
      questions: [
        {
          id: 'blood-pressure',
          type: 'text',
          label: 'Blood Pressure',
          placeholder: '120/80',
          required: true,
        },
        {
          id: 'heart-rate',
          type: 'numeric',
          label: 'Heart Rate (bpm)',
          required: true,
          min: 40,
          max: 200,
        },
        {
          id: 'respiratory-rate',
          type: 'numeric',
          label: 'Respiratory Rate',
          required: true,
          min: 10,
          max: 40,
        },
        {
          id: 'temperature',
          type: 'numeric',
          label: 'Temperature (°F)',
          required: true,
          min: 95,
          max: 105,
          step: 0.1,
        },
        {
          id: 'o2-saturation',
          type: 'numeric',
          label: 'O2 Saturation (%)',
          required: true,
          min: 70,
          max: 100,
        },
      ],
    },
    {
      id: 'cardiovascular',
      title: 'Cardiovascular Assessment',
      order: 2,
      questions: [
        {
          id: 'heart-sounds',
          type: 'radio',
          label: 'Heart Sounds',
          required: true,
          options: [
            { value: 'regular', label: 'Regular' },
            { value: 'irregular', label: 'Irregular' },
            { value: 'murmur', label: 'Murmur Present' },
          ],
        },
        {
          id: 'edema',
          type: 'radio',
          label: 'Edema Present',
          required: true,
          options: [
            { value: 'none', label: 'None' },
            { value: 'mild', label: 'Mild (1+)' },
            { value: 'moderate', label: 'Moderate (2+)' },
            { value: 'severe', label: 'Severe (3+)' },
          ],
        },
      ],
    },
    {
      id: 'respiratory',
      title: 'Respiratory Assessment',
      order: 3,
      questions: [
        {
          id: 'breath-sounds',
          type: 'radio',
          label: 'Breath Sounds',
          required: true,
          options: [
            { value: 'clear', label: 'Clear Bilateral' },
            { value: 'diminished', label: 'Diminished' },
            { value: 'crackles', label: 'Crackles' },
            { value: 'wheezes', label: 'Wheezes' },
          ],
        },
        {
          id: 'oxygen-use',
          type: 'radio',
          label: 'Oxygen Use',
          required: true,
          options: [
            { value: 'none', label: 'Room Air' },
            { value: 'continuous', label: 'Continuous Oxygen' },
            { value: 'prn', label: 'PRN Oxygen' },
          ],
        },
      ],
    },
    {
      id: 'plan-of-care',
      title: 'Plan of Care',
      order: 4,
      questions: [
        {
          id: 'nursing-interventions',
          type: 'textarea',
          label: 'Nursing Interventions',
          required: true,
        },
        {
          id: 'visit-frequency',
          type: 'dropdown',
          label: 'Visit Frequency',
          required: true,
          options: [
            { value: '1x-week', label: '1x per week' },
            { value: '2x-week', label: '2x per week' },
            { value: '3x-week', label: '3x per week' },
            { value: 'daily', label: 'Daily' },
          ],
        },
      ],
    },
  ],
};

// ─── Assessment Registry ───────────────────────────────────────────────────

export const assessmentRegistry: Record<string, AssessmentDefinition> = {
  'physical-therapy-evaluation': physicalTherapyEvaluation,
  'speech-therapy-evaluation': speechTherapyEvaluation,
  'occupational-therapy-evaluation': occupationalTherapyEvaluation,
  'skilled-nursing-assessment': skilledNursingAssessment,
  'oasis-e-assessment': oasisEAssessment,
};

export function getAssessmentDefinition(type: string): AssessmentDefinition | undefined {
  return assessmentRegistry[type];
}