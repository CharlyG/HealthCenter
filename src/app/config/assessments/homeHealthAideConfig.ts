/**
 * HOME HEALTH AIDE ASSESSMENT CONFIGURATION
 * 
 * Configuration for HHA Visit Documentation
 * Covers personal care, hygiene, nutrition, mobility assistance
 * 
 * @version 1.0.0
 */

import type { AssessmentTypeConfiguration } from '../types/assessmentTypes';

export const HOME_HEALTH_AIDE_CONFIGURATION: AssessmentTypeConfiguration = {
  id: 'home-health-aide-visit-2024',
  name: 'Home Health Aide Visit Note',
  version: 'HHA Assessment v2024.1',
  category: 'clinical-visit',
  
  sections: [
    {
      id: 'visit-info',
      title: 'Visit Information',
      order: 1,
      questions: [
        { id: 'visit-date', text: 'Visit Date', type: 'date', required: true, order: 1 },
        { id: 'time-in', text: 'Time In', type: 'time', required: true, order: 2 },
        { id: 'time-out', text: 'Time Out', type: 'time', required: true, order: 3 },
        { id: 'patient-present', text: 'Patient Present', type: 'boolean', required: true, order: 4 },
        { id: 'caregiver-present', text: 'Caregiver/Family Present', type: 'boolean', required: false, order: 5 },
      ],
    },

    {
      id: 'vital-signs',
      title: 'Vital Signs',
      description: 'Basic vital signs assessment',
      order: 2,
      questions: [
        { id: 'vitals-taken', text: 'Vital Signs Taken', type: 'boolean', required: true, order: 1 },
        { id: 'bp-systolic', text: 'Blood Pressure - Systolic', type: 'number', required: false, order: 2,
          validation: { min: 60, max: 250 }, helpText: 'mmHg',
          conditional: { dependsOn: 'vitals-taken', showWhen: { equals: true } },
        },
        { id: 'bp-diastolic', text: 'Blood Pressure - Diastolic', type: 'number', required: false, order: 3,
          validation: { min: 40, max: 150 }, helpText: 'mmHg',
          conditional: { dependsOn: 'vitals-taken', showWhen: { equals: true } },
        },
        { id: 'heart-rate', text: 'Heart Rate', type: 'number', required: false, order: 4,
          validation: { min: 30, max: 200 }, helpText: 'BPM',
          conditional: { dependsOn: 'vitals-taken', showWhen: { equals: true } },
        },
        { id: 'temperature', text: 'Temperature', type: 'number', required: false, order: 5,
          validation: { min: 90, max: 110 }, helpText: '°F',
          conditional: { dependsOn: 'vitals-taken', showWhen: { equals: true } },
        },
      ],
    },

    {
      id: 'personal-care',
      title: 'Personal Care Activities',
      description: 'Bathing, hygiene, grooming assistance',
      order: 3,
      questions: [
        { id: 'bathing-provided', text: 'Bathing Assistance Provided', type: 'boolean', required: true, order: 1 },
        { id: 'bathing-type', text: 'Type of Bath', type: 'single-select', required: false, order: 2,
          options: [
            { value: 'shower', label: 'Shower', order: 1 },
            { value: 'tub-bath', label: 'Tub Bath', order: 2 },
            { value: 'bed-bath', label: 'Bed Bath', order: 3 },
            { value: 'partial-bath', label: 'Partial Bath', order: 4 },
          ],
          conditional: { dependsOn: 'bathing-provided', showWhen: { equals: true } },
        },
        { id: 'hair-care', text: 'Hair Care Provided', type: 'boolean', required: false, order: 3 },
        { id: 'oral-care', text: 'Oral Care/Teeth Brushing', type: 'boolean', required: true, order: 4 },
        { id: 'shaving', text: 'Shaving Assistance', type: 'boolean', required: false, order: 5 },
        { id: 'nail-care', text: 'Nail Care', type: 'boolean', required: false, order: 6 },
        { id: 'skin-condition', text: 'Skin Condition Observed', type: 'multi-select', required: true, order: 7,
          options: [
            { value: 'intact', label: 'Intact - No Issues', order: 1 },
            { value: 'dry', label: 'Dry Skin', order: 2 },
            { value: 'rash', label: 'Rash', order: 3 },
            { value: 'bruising', label: 'Bruising', order: 4 },
            { value: 'wound', label: 'Wound/Lesion', order: 5 },
            { value: 'redness', label: 'Redness/Pressure Area', order: 6 },
          ],
        },
      ],
    },

    {
      id: 'dressing-assistance',
      title: 'Dressing Assistance',
      order: 4,
      questions: [
        { id: 'dressing-provided', text: 'Dressing Assistance Provided', type: 'boolean', required: true, order: 1 },
        { id: 'dressing-level', text: 'Level of Assistance', type: 'single-select', required: false, order: 2,
          options: [
            { value: 'setup', label: 'Setup Only', order: 1 },
            { value: 'min-assist', label: 'Minimal Assistance', order: 2 },
            { value: 'mod-assist', label: 'Moderate Assistance', order: 3 },
            { value: 'total-assist', label: 'Total Assistance', order: 4 },
          ],
          conditional: { dependsOn: 'dressing-provided', showWhen: { equals: true } },
        },
      ],
    },

    {
      id: 'toileting-assistance',
      title: 'Toileting Assistance',
      order: 5,
      questions: [
        { id: 'toileting-provided', text: 'Toileting Assistance Provided', type: 'boolean', required: true, order: 1 },
        { id: 'toileting-type', text: 'Type of Assistance', type: 'multi-select', required: false, order: 2,
          options: [
            { value: 'toilet-transfer', label: 'Toilet Transfer', order: 1 },
            { value: 'bedpan', label: 'Bedpan Assistance', order: 2 },
            { value: 'commode', label: 'Bedside Commode', order: 3 },
            { value: 'incontinence-care', label: 'Incontinence Care', order: 4 },
            { value: 'catheter-care', label: 'Catheter Care', order: 5 },
          ],
          conditional: { dependsOn: 'toileting-provided', showWhen: { equals: true } },
        },
        { id: 'bowel-movement', text: 'Bowel Movement During Visit', type: 'boolean', required: false, order: 3 },
        { id: 'urination', text: 'Urination During Visit', type: 'boolean', required: false, order: 4 },
      ],
    },

    {
      id: 'nutrition-hydration',
      title: 'Nutrition & Hydration',
      order: 6,
      questions: [
        { id: 'meal-prep', text: 'Meal Preparation Provided', type: 'boolean', required: true, order: 1 },
        { id: 'meals-prepared', text: 'Meals Prepared', type: 'multi-select', required: false, order: 2,
          options: [
            { value: 'breakfast', label: 'Breakfast', order: 1 },
            { value: 'lunch', label: 'Lunch', order: 2 },
            { value: 'dinner', label: 'Dinner', order: 3 },
            { value: 'snack', label: 'Snack', order: 4 },
          ],
          conditional: { dependsOn: 'meal-prep', showWhen: { equals: true } },
        },
        { id: 'feeding-assistance', text: 'Feeding Assistance Provided', type: 'boolean', required: true, order: 3 },
        { id: 'feeding-level', text: 'Level of Feeding Assistance', type: 'single-select', required: false, order: 4,
          options: [
            { value: 'setup', label: 'Setup Only', order: 1 },
            { value: 'supervision', label: 'Supervision', order: 2 },
            { value: 'partial-assist', label: 'Partial Assistance', order: 3 },
            { value: 'total-assist', label: 'Total Assistance', order: 4 },
          ],
          conditional: { dependsOn: 'feeding-assistance', showWhen: { equals: true } },
        },
        { id: 'meal-intake', text: 'Meal Intake', type: 'single-select', required: false, order: 5,
          options: [
            { value: '100', label: '100% - All', order: 1 },
            { value: '75', label: '75% - Most', order: 2 },
            { value: '50', label: '50% - Half', order: 3 },
            { value: '25', label: '25% - Little', order: 4 },
            { value: '0', label: '0% - None', order: 5 },
          ],
        },
        { id: 'fluid-intake', text: 'Fluid Intake Encouraged', type: 'boolean', required: true, order: 6 },
        { id: 'diet-restrictions', text: 'Diet Restrictions Observed', type: 'boolean', required: false, order: 7 },
      ],
    },

    {
      id: 'mobility-assistance',
      title: 'Mobility Assistance',
      order: 7,
      questions: [
        { id: 'transfer-assistance', text: 'Transfer Assistance Provided', type: 'boolean', required: true, order: 1 },
        { id: 'transfer-types', text: 'Types of Transfers Assisted', type: 'multi-select', required: false, order: 2,
          options: [
            { value: 'bed-to-chair', label: 'Bed to Chair', order: 1 },
            { value: 'chair-to-toilet', label: 'Chair to Toilet', order: 2 },
            { value: 'chair-to-wheelchair', label: 'Chair to Wheelchair', order: 3 },
            { value: 'in-out-bed', label: 'In/Out of Bed', order: 4 },
          ],
          conditional: { dependsOn: 'transfer-assistance', showWhen: { equals: true } },
        },
        { id: 'ambulation-assistance', text: 'Ambulation Assistance Provided', type: 'boolean', required: true, order: 3 },
        { id: 'assistive-device-used', text: 'Assistive Device Used', type: 'single-select', required: false, order: 4,
          options: [
            { value: 'none', label: 'None', order: 1 },
            { value: 'cane', label: 'Cane', order: 2 },
            { value: 'walker', label: 'Walker', order: 3 },
            { value: 'wheelchair', label: 'Wheelchair', order: 4 },
          ],
        },
        { id: 'repositioning', text: 'Repositioning in Bed Provided', type: 'boolean', required: false, order: 5 },
        { id: 'range-of-motion', text: 'Passive Range of Motion Exercises', type: 'boolean', required: false, order: 6 },
      ],
    },

    {
      id: 'home-support',
      title: 'Home Support Activities',
      order: 8,
      questions: [
        { id: 'light-housekeeping', text: 'Light Housekeeping Performed', type: 'boolean', required: true, order: 1 },
        { id: 'housekeeping-tasks', text: 'Housekeeping Tasks', type: 'multi-select', required: false, order: 2,
          options: [
            { value: 'dishes', label: 'Dishes/Kitchen Cleanup', order: 1 },
            { value: 'laundry', label: 'Laundry', order: 2 },
            { value: 'bed-making', label: 'Bed Making', order: 3 },
            { value: 'tidying', label: 'Tidying/Organizing', order: 4 },
            { value: 'trash', label: 'Taking Out Trash', order: 5 },
          ],
          conditional: { dependsOn: 'light-housekeeping', showWhen: { equals: true } },
        },
        { id: 'linen-change', text: 'Bed Linen Changed', type: 'boolean', required: false, order: 3 },
      ],
    },

    {
      id: 'patient-observation',
      title: 'Patient Observation & Safety',
      order: 9,
      questions: [
        { id: 'patient-mood', text: 'Patient Mood/Affect', type: 'single-select', required: true, order: 1,
          options: [
            { value: 'pleasant', label: 'Pleasant/Cooperative', order: 1 },
            { value: 'neutral', label: 'Neutral', order: 2 },
            { value: 'anxious', label: 'Anxious/Worried', order: 3 },
            { value: 'sad', label: 'Sad/Depressed', order: 4 },
            { value: 'agitated', label: 'Agitated/Confused', order: 5 },
          ],
        },
        { id: 'pain-reported', text: 'Patient Reports Pain', type: 'boolean', required: true, order: 2 },
        { id: 'pain-level', text: 'Pain Level (0-10)', type: 'number', required: false, order: 3,
          validation: { min: 0, max: 10 },
          conditional: { dependsOn: 'pain-reported', showWhen: { equals: true } },
        },
        { id: 'safety-concerns', text: 'Safety Concerns Observed', type: 'boolean', required: true, order: 4 },
        { id: 'safety-detail', text: 'Safety Concern Details', type: 'long-text', required: false, order: 5,
          conditional: { dependsOn: 'safety-concerns', showWhen: { equals: true } },
        },
        { id: 'falls-incidents', text: 'Falls or Incidents Occurred', type: 'boolean', required: true, order: 6 },
        { id: 'incident-detail', text: 'Incident Details', type: 'long-text', required: false, order: 7,
          conditional: { dependsOn: 'falls-incidents', showWhen: { equals: true } },
        },
      ],
    },

    {
      id: 'visit-summary',
      title: 'Visit Summary',
      order: 10,
      questions: [
        { id: 'visit-completed', text: 'All Planned Activities Completed', type: 'boolean', required: true, order: 1 },
        { id: 'incomplete-reason', text: 'Reason for Incomplete Activities', type: 'text', required: false, order: 2,
          conditional: { dependsOn: 'visit-completed', showWhen: { equals: false } },
        },
        { id: 'patient-response', text: 'Patient Response to Care', type: 'single-select', required: true, order: 3,
          options: [
            { value: 'positive', label: 'Positive - Cooperative', order: 1 },
            { value: 'neutral', label: 'Neutral', order: 2 },
            { value: 'resistant', label: 'Resistant/Uncooperative', order: 3 },
          ],
        },
        { id: 'nurse-notification', text: 'Nurse Notification Required', type: 'boolean', required: true, order: 4 },
        { id: 'notification-reason', text: 'Reason for Nurse Notification', type: 'long-text', required: false, order: 5,
          conditional: { dependsOn: 'nurse-notification', showWhen: { equals: true } },
        },
        { id: 'visit-notes', text: 'Additional Visit Notes', type: 'long-text', required: false, order: 6,
          helpText: 'Any additional observations or notes',
        },
      ],
    },
  ],

  regulatoryBody: 'Medicare/State Regulations',
  effectiveDate: '2024-01-01',
  requiredTimeframe: { mustCompleteWithin: 24, timeUnit: 'hours' },
  completionRequirements: {
    minimumProgress: 100,
    requiredSections: ['visit-info', 'vital-signs', 'personal-care', 'nutrition-hydration', 'mobility-assistance', 'patient-observation', 'visit-summary'],
    requiredQuestions: ['visit-date', 'time-in', 'time-out', 'bathing-provided', 'patient-mood', 'visit-completed'],
  },
};

export default HOME_HEALTH_AIDE_CONFIGURATION;
