/**
 * OASIS-E Assessment Templates
 * 
 * CMS-mandated Outcome and Assessment Information Set for home health
 * Comprehensive regulatory assessment for Medicare-certified agencies
 * 
 * Assessment Types:
 * - Start of Care (SOC)
 * - Resumption of Care (ROC)
 * - Follow-Up (every 60 days)
 * - Transfer to Inpatient
 * - Discharge
 */

import type { DocumentTemplate, FormSectionDef } from './documentationTypes';

// ═══════════════════════════════════════════════════════════════════════════
// OASIS-E COMPREHENSIVE ASSESSMENT TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════

const OASIS_PATIENT_INFO_SECTIONS: FormSectionDef[] = [
  {
    id: 'patient_information',
    title: 'Patient Information',
    description: 'Demographics and patient tracking information',
    icon: 'user',
    order: 1,
    fields: [
      {
        id: 'm0010_medicare_number',
        label: 'M0010: Medicare Number',
        type: 'text',
        required: true,
        placeholder: '1AB2CD3EF45',
        maxLength: 12
      },
      {
        id: 'm0020_medicaid_number',
        label: 'M0020: Medicaid Number',
        type: 'text',
        required: false,
        maxLength: 20
      },
      {
        id: 'm0030_soc_date',
        label: 'M0030: Start of Care Date',
        type: 'date',
        required: true,
        helpText: 'Date patient first received skilled services'
      },
      {
        id: 'm0032_roc_date',
        label: 'M0032: Resumption of Care Date',
        type: 'date',
        required: false,
        helpText: 'Only if ROC assessment'
      },
      {
        id: 'm0040_patient_name',
        label: 'M0040: Patient Name',
        type: 'text',
        required: true,
        maxLength: 100
      },
      {
        id: 'm0050_patient_id',
        label: 'M0050: Patient ID Number',
        type: 'text',
        required: true,
        maxLength: 20
      },
      {
        id: 'm0060_dob',
        label: 'M0060: Date of Birth',
        type: 'date',
        required: true
      },
      {
        id: 'm0063_gender',
        label: 'M0063: Gender',
        type: 'select',
        required: true,
        options: [
          { value: '1', label: '1 - Male' },
          { value: '2', label: '2 - Female' },
        ]
      },
      {
        id: 'm0064_ssn',
        label: 'M0064: Social Security Number',
        type: 'text',
        required: false,
        placeholder: '###-##-####',
        maxLength: 11
      },
      {
        id: 'm0066_race',
        label: 'M0066: Race/Ethnicity (check all that apply)',
        type: 'textarea',
        required: true,
        helpText: 'White, Black/African American, American Indian/Alaska Native, Asian, Native Hawaiian/Pacific Islander, Hispanic/Latino',
        maxLength: 500
      },
    ],
  },
];

const OASIS_CLINICAL_RECORD_SECTIONS: FormSectionDef[] = [
  {
    id: 'clinical_record',
    title: 'Clinical Record Items',
    description: 'Certification and hospitalization tracking',
    icon: 'clipboard',
    order: 2,
    fields: [
      {
        id: 'm0080_discipline_rn',
        label: 'M0080: RN completing assessment',
        type: 'checkbox',
        required: false
      },
      {
        id: 'm0080_discipline_pt',
        label: 'M0080: PT completing assessment',
        type: 'checkbox',
        required: false
      },
      {
        id: 'm0090_assessment_date',
        label: 'M0090: Date Assessment Completed',
        type: 'date',
        required: true
      },
      {
        id: 'm0100_reason_for_assessment',
        label: 'M0100: Reason for Assessment',
        type: 'select',
        required: true,
        options: [
          { value: '01', label: '01 - Start of Care' },
          { value: '03', label: '03 - Resumption of Care' },
          { value: '04', label: '04 - Recertification (follow-up)' },
          { value: '05', label: '05 - Other follow-up' },
          { value: '06', label: '06 - Transferred to inpatient facility' },
          { value: '07', label: '07 - Transferred to inpatient facility (not discharged)' },
          { value: '08', label: '08 - Death at home' },
          { value: '09', label: '09 - Discharge from agency' },
        ]
      },
      {
        id: 'm0102_care_type',
        label: 'M0102: Type/Source of Referral',
        type: 'select',
        required: true,
        options: [
          { value: '1', label: '1 - Inpatient facility (hospital or NF)' },
          { value: '2', label: '2 - Physician' },
          { value: '3', label: '3 - Self/family' },
          { value: '4', label: '4 - Outpatient facility' },
          { value: '5', label: '5 - Other HH agency' },
          { value: '6', label: '6 - Other' },
        ]
      },
      {
        id: 'm0104_discharge_date',
        label: 'M0104: Date of Last Home Visit (if discharge)',
        type: 'date',
        required: false
      },
      {
        id: 'm0110_episode_timing',
        label: 'M0110: Episode Timing',
        type: 'select',
        required: true,
        options: [
          { value: '1', label: '1 - Early: first or second episode' },
          { value: '2', label: '2 - Later: third+ episode' },
          { value: 'uk', label: 'UK - Unknown' },
        ]
      },
    ],
  },
];

const OASIS_LIVING_ARRANGEMENT_SECTIONS: FormSectionDef[] = [
  {
    id: 'living_arrangements',
    title: 'Living Arrangements',
    description: 'Patient living situation and support system',
    icon: 'home',
    order: 3,
    fields: [
      {
        id: 'm1100_living_arrangement',
        label: 'M1100: Patient Living Situation',
        type: 'select',
        required: true,
        options: [
          { value: '01', label: '01 - Lives alone' },
          { value: '02', label: '02 - With spouse/partner' },
          { value: '03', label: '03 - With other family' },
          { value: '04', label: '04 - With friends/roommates' },
          { value: '05', label: '05 - With paid help (caregiver)' },
          { value: '06', label: '06 - With unpaid help' },
          { value: '07', label: '07 - Congregate situation' },
          { value: '08', label: '08 - Other' },
        ]
      },
      {
        id: 'm1200_vision',
        label: 'M1200: Vision (with corrective lenses)',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Normal vision: sees adequately' },
          { value: '1', label: '1 - Impaired: requires glasses/contact/magnifier' },
          { value: '2', label: '2 - Moderately impaired: limited vision; not able to see newspaper headlines' },
          { value: '3', label: '3 - Severely impaired: cannot see shapes, requires assistance' },
          { value: '4', label: '4 - Blind: no functional vision' },
        ]
      },
      {
        id: 'm1210_hearing',
        label: 'M1210: Ability to Hear (with hearing aid)',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - No difficulty hearing' },
          { value: '1', label: '1 - Difficulty in some environments (TV, phone)' },
          { value: '2', label: '2 - Difficulty in most environments; some one-on-one OK' },
          { value: '3', label: '3 - Unable to hear in most situations' },
          { value: '4', label: '4 - Totally deaf' },
        ]
      },
      {
        id: 'm1220_pain_frequency',
        label: 'M1220: Frequency of Pain',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - No pain' },
          { value: '1', label: '1 - Less often than daily' },
          { value: '2', label: '2 - Daily, but not constantly' },
          { value: '3', label: '3 - Constantly' },
        ]
      },
      {
        id: 'm1230_unhealed_pressure_ulcers',
        label: 'M1230: Number of Unhealed Pressure Ulcers',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - None' },
          { value: '1', label: '1 - One pressure ulcer' },
          { value: '2', label: '2 - Two pressure ulcers' },
          { value: '3', label: '3 - Three pressure ulcers' },
          { value: '4', label: '4 - Four or more pressure ulcers' },
        ]
      },
    ],
  },
];

const OASIS_FUNCTIONAL_STATUS_SECTIONS: FormSectionDef[] = [
  {
    id: 'functional_status',
    title: 'Functional Status',
    description: 'Activities of Daily Living (ADLs) assessment',
    icon: 'activity',
    order: 4,
    fields: [
      {
        id: 'm1800_grooming',
        label: 'M1800: Grooming',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to groom self independently' },
          { value: '1', label: '1 - Grooming utensils must be placed in hand' },
          { value: '2', label: '2 - Someone must assist/supervise' },
          { value: '3', label: '3 - Patient depends entirely upon another' },
        ]
      },
      {
        id: 'm1810_upper_dressing',
        label: 'M1810: Ability to Dress Upper Body',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to get clothes and dress upper body independently' },
          { value: '1', label: '1 - Able to dress upper body without assistance IF clothing is laid out' },
          { value: '2', label: '2 - Someone must help put on upper body clothing' },
          { value: '3', label: '3 - Patient depends entirely upon another' },
        ]
      },
      {
        id: 'm1820_lower_dressing',
        label: 'M1820: Ability to Dress Lower Body',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to obtain and put on lower body clothing independently' },
          { value: '1', label: '1 - Able to dress lower body without assistance IF clothing is laid out' },
          { value: '2', label: '2 - Someone must help put on undergarments and/or slacks/skirt' },
          { value: '3', label: '3 - Patient depends entirely upon another' },
        ]
      },
      {
        id: 'm1830_bathing',
        label: 'M1830: Bathing',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to bathe self in shower or tub independently' },
          { value: '1', label: '1 - With use of devices, able to bathe self in shower or tub independently' },
          { value: '2', label: '2 - Able to bathe in shower or tub with assistance of another person' },
          { value: '3', label: '3 - Participates in bathing in shower or tub, but requires presence of another' },
          { value: '4', label: '4 - Unable to use shower or tub; receives bed bath' },
          { value: '5', label: '5 - Unable to participate effectively in bathing' },
        ]
      },
      {
        id: 'm1840_toilet_transferring',
        label: 'M1840: Toilet Transferring',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to get to and from toilet independently' },
          { value: '1', label: '1 - When reminded, assisted, or supervised, able to get to and from toilet' },
          { value: '2', label: '2 - Unable to get to and from toilet but is able to use bedside commode' },
          { value: '3', label: '3 - Unable to get to and from toilet or bedside commode but able to use bedpan/urinal' },
          { value: '4', label: '4 - Is totally dependent in toileting' },
        ]
      },
      {
        id: 'm1845_toilet_hygiene',
        label: 'M1845: Toilet Hygiene',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to manage toilet hygiene and clothing independently' },
          { value: '1', label: '1 - Able to manage toilet hygiene and clothing without assistance IF supplies are laid out' },
          { value: '2', label: '2 - Someone must help manage toilet hygiene and clothing' },
          { value: '3', label: '3 - Patient depends entirely upon another for toilet hygiene and clothing' },
        ]
      },
      {
        id: 'm1850_transferring',
        label: 'M1850: Transferring',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to independently transfer' },
          { value: '1', label: '1 - Transfers with minimal assistance or with use of device' },
          { value: '2', label: '2 - Unable to transfer self but able to bear weight and pivot' },
          { value: '3', label: '3 - Unable to transfer self and unable to bear weight' },
          { value: '4', label: '4 - Bedfast, unable to transfer' },
        ]
      },
      {
        id: 'm1860_ambulation',
        label: 'M1860: Ambulation/Locomotion',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to independently walk on even/uneven surfaces' },
          { value: '1', label: '1 - Requires use of device (cane, walker) to walk alone' },
          { value: '2', label: '2 - Able to walk with supervision or assistance of another' },
          { value: '3', label: '3 - Chairfast, unable to ambulate but able to wheel self independently' },
          { value: '4', label: '4 - Chairfast, unable to ambulate and unable to wheel self' },
          { value: '5', label: '5 - Bedfast, unable to ambulate or be up in chair' },
        ]
      },
      {
        id: 'm1870_feeding',
        label: 'M1870: Feeding or Eating',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to independently feed self' },
          { value: '1', label: '1 - Able to feed self independently but requires meal setup' },
          { value: '2', label: '2 - Unable to feed self and must be assisted' },
          { value: '3', label: '3 - Able to take in nutrients orally and receives supplemental nutrients via tube' },
          { value: '4', label: '4 - Unable to take in nutrients orally; tube feeding only' },
          { value: '5', label: '5 - Unable to take in nutrients orally or by tube feeding' },
        ]
      },
    ],
  },
];

const OASIS_COGNITIVE_STATUS_SECTIONS: FormSectionDef[] = [
  {
    id: 'cognitive_status',
    title: 'Cognitive, Behavioral, and Emotional Status',
    description: 'Mental status and cognitive functioning',
    icon: 'brain',
    order: 5,
    fields: [
      {
        id: 'm1700_cognitive_functioning',
        label: 'M1700: Cognitive Functioning',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Alert/oriented, able to focus and shift attention, comprehends and recalls task directions' },
          { value: '1', label: '1 - Requires prompting only under stressful or unfamiliar conditions' },
          { value: '2', label: '2 - Requires assistance and some direction in specific situations or consistently requires low stimulus' },
          { value: '3', label: '3 - Requires considerable assistance in routine situations; moderate memory/judgment impairment' },
          { value: '4', label: '4 - Totally dependent due to disturbances such as amnesia, dementia, coma' },
        ]
      },
      {
        id: 'm1710_confusion_frequency',
        label: 'M1710: When Confused',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Never' },
          { value: '1', label: '1 - In new or complex situations only' },
          { value: '2', label: '2 - On awakening or at night only' },
          { value: '3', label: '3 - During the day and evening, but not constantly' },
          { value: '4', label: '4 - Constantly' },
          { value: 'na', label: 'NA - Patient nonresponsive' },
        ]
      },
      {
        id: 'm1720_anxiety_frequency',
        label: 'M1720: When Anxious',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - None of the time' },
          { value: '1', label: '1 - Less often than daily' },
          { value: '2', label: '2 - Daily, but not constantly' },
          { value: '3', label: '3 - All of the time' },
          { value: 'na', label: 'NA - Patient nonresponsive' },
        ]
      },
      {
        id: 'm1730_depression_screening',
        label: 'M1730: Depression Screening (PHQ-2)',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Not assessed' },
          { value: '1', label: '1 - Screening conducted, patient did not score 4+ on PHQ-2' },
          { value: '2', label: '2 - Screening conducted, patient scored 4+ on PHQ-2' },
        ],
        helpText: 'PHQ-2: Little interest/pleasure + Feeling down/hopeless (0-6 scale)'
      },
      {
        id: 'm1740_cognitive_impairment',
        label: 'M1740: Cognitive, Behavioral, Psychiatric Symptoms',
        type: 'textarea',
        required: true,
        placeholder: 'Check all that apply: Memory deficit, impaired decision-making, verbal disruption, physical aggression, disruptive behavior, delusional, depressed, anxious, other',
        maxLength: 500
      },
      {
        id: 'm1745_behaviors_demonstrated',
        label: 'M1745: Frequency of Behavior Problems',
        type: 'select',
        required: false,
        options: [
          { value: '0', label: '0 - Never' },
          { value: '1', label: '1 - Less than once a month' },
          { value: '2', label: '2 - Once a month' },
          { value: '3', label: '3 - Several times per month' },
          { value: '4', label: '4 - Several times a week' },
          { value: '5', label: '5 - At least daily' },
        ]
      },
    ],
  },
];

const OASIS_MEDICATIONS_SECTIONS: FormSectionDef[] = [
  {
    id: 'medications',
    title: 'Elimination, Neuro/Emotional/Behavioral Status, ADLs/IADLs',
    description: 'Medication management and related assessments',
    icon: 'pill',
    order: 6,
    fields: [
      {
        id: 'm2000_drug_regimen_review',
        label: 'M2000: Drug Regimen Review',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - No' },
          { value: '1', label: '1 - Yes, medication issues identified' },
          { value: '2', label: '2 - Yes, no issues identified' },
          { value: 'na', label: 'NA - Patient not taking medications' },
        ]
      },
      {
        id: 'm2002_medication_followup',
        label: 'M2002: Medication Follow-up',
        type: 'select',
        required: false,
        options: [
          { value: '0', label: '0 - No' },
          { value: '1', label: '1 - Yes' },
        ],
        helpText: 'Only if issues identified in M2000'
      },
      {
        id: 'm2010_high_risk_drugs',
        label: 'M2010: Patient taking High-Risk Drugs',
        type: 'textarea',
        required: true,
        placeholder: 'Check all that apply: Anticoagulants, Antiplatelet, Insulin/hypoglycemic, Opioids, None',
        maxLength: 500
      },
      {
        id: 'm2020_management_oral_meds',
        label: 'M2020: Management of Oral Medications',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to independently take correct medication and proper dosage at correct times' },
          { value: '1', label: '1 - Able to take medication at correct times IF prepared in advance' },
          { value: '2', label: '2 - Unable to take medication unless administered by another' },
          { value: 'na', label: 'NA - No oral medications prescribed' },
        ]
      },
      {
        id: 'm2030_management_injectable_meds',
        label: 'M2030: Management of Injectable Medications',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - Able to independently take correct medication and proper dosage at correct times' },
          { value: '1', label: '1 - Able to take injectable medication at correct times IF prepared in advance' },
          { value: '2', label: '2 - Unable to take injectable medication unless administered by another' },
          { value: 'na', label: 'NA - No injectable medications prescribed' },
        ]
      },
      {
        id: 'm2040_prior_medication_management',
        label: 'M2040: Prior Medication Management',
        type: 'select',
        required: false,
        options: [
          { value: '0', label: '0 - Independent' },
          { value: '1', label: '1 - Needed some help' },
          { value: '2', label: '2 - Needed complete help' },
          { value: 'uk', label: 'UK - Unknown' },
        ],
        helpText: 'For SOC/ROC only: status 14 days prior'
      },
    ],
  },
];

const OASIS_DIAGNOSES_SECTIONS: FormSectionDef[] = [
  {
    id: 'diagnoses',
    title: 'Diagnoses and Payment',
    description: 'Primary and secondary diagnoses',
    icon: 'clipboard-list',
    order: 7,
    fields: [
      {
        id: 'm1000_inpatient_facility',
        label: 'M1000: From Which Inpatient Facility Discharged (if applicable)',
        type: 'select',
        required: false,
        options: [
          { value: '1', label: '1 - Hospital' },
          { value: '2', label: '2 - Rehabilitation facility' },
          { value: '3', label: '3 - Skilled nursing facility' },
          { value: '4', label: '4 - Other nursing home' },
          { value: '5', label: '5 - Hospice' },
          { value: 'na', label: 'NA - Not discharged from inpatient facility within past 14 days' },
        ]
      },
      {
        id: 'm1005_inpatient_discharge_date',
        label: 'M1005: Inpatient Discharge Date',
        type: 'date',
        required: false,
        helpText: 'Only if discharged from inpatient facility in past 14 days'
      },
      {
        id: 'm1011_14day_hospitalization',
        label: 'M1011: Inpatient Stay in Last 14 Days',
        type: 'select',
        required: false,
        options: [
          { value: '0', label: '0 - No' },
          { value: '1', label: '1 - Yes' },
        ]
      },
      {
        id: 'm1016_primary_diagnosis_icd',
        label: 'M1016: Primary Diagnosis ICD-10 Code',
        type: 'text',
        required: true,
        maxLength: 10,
        placeholder: 'e.g., I50.9'
      },
      {
        id: 'm1016_primary_diagnosis_description',
        label: 'Primary Diagnosis Description',
        type: 'text',
        required: true,
        maxLength: 200
      },
      {
        id: 'm1018_other_diagnosis_1_icd',
        label: 'M1018: Other Diagnosis #1 ICD-10 Code',
        type: 'text',
        required: false,
        maxLength: 10
      },
      {
        id: 'm1018_other_diagnosis_1_description',
        label: 'Other Diagnosis #1 Description',
        type: 'text',
        required: false,
        maxLength: 200
      },
      {
        id: 'm1018_other_diagnosis_2_icd',
        label: 'M1018: Other Diagnosis #2 ICD-10 Code',
        type: 'text',
        required: false,
        maxLength: 10
      },
      {
        id: 'm1018_other_diagnosis_2_description',
        label: 'Other Diagnosis #2 Description',
        type: 'text',
        required: false,
        maxLength: 200
      },
      {
        id: 'm1021_primary_payment_source',
        label: 'M1021: Primary Payment Source',
        type: 'select',
        required: true,
        options: [
          { value: '0', label: '0 - None; no charge for current services' },
          { value: '1', label: '1 - Medicare (traditional fee-for-service)' },
          { value: '2', label: '2 - Medicare HMO/Managed care/Advantage' },
          { value: '3', label: '3 - Medicaid (traditional fee-for-service)' },
          { value: '4', label: '4 - Medicaid HMO/Managed care' },
          { value: '5', label: '5 - Workers\' compensation' },
          { value: '6', label: '6 - Title programs (e.g., Title III, V, or XX)' },
          { value: '7', label: '7 - Other government (e.g., TriCare, VA)' },
          { value: '8', label: '8 - Private insurance' },
          { value: '9', label: '9 - Private HMO/Managed care' },
          { value: '10', label: '10 - Self-pay' },
          { value: '11', label: '11 - Other (specify)' },
          { value: 'uk', label: 'UK - Unknown' },
        ]
      },
    ],
  },
];

const OASIS_CARE_PLAN_SECTIONS: FormSectionDef[] = [
  {
    id: 'care_plan',
    title: 'Care Plan & Therapy Need',
    description: 'Therapy needs and discharge planning',
    icon: 'clipboard-check',
    order: 8,
    fields: [
      {
        id: 'm2200_therapy_need',
        label: 'M2200: Therapy Need',
        type: 'textarea',
        required: true,
        placeholder: 'Check all that apply: ST, OT, PT - explain skilled need for each discipline',
        maxLength: 1000
      },
      {
        id: 'm2250_plan_of_care_synopsis',
        label: 'M2250: Plan of Care Synopsis',
        type: 'textarea',
        required: true,
        placeholder: 'Briefly describe plan of care interventions and goals',
        maxLength: 2000
      },
      {
        id: 'm2300_emergent_care',
        label: 'M2300: Emergent Care (since SOC/last assessment)',
        type: 'select',
        required: false,
        options: [
          { value: '0', label: '0 - No' },
          { value: '1', label: '1 - Yes, used hospital emergency department without hospitalization' },
          { value: '2', label: '2 - Yes, hospitalized' },
          { value: 'uk', label: 'UK - Unknown' },
        ]
      },
      {
        id: 'm2310_ecr_risk',
        label: 'M2310: Emergent Care Reason (if applicable)',
        type: 'textarea',
        required: false,
        placeholder: 'Improper medication, injury, respiratory, cardiac, mental/behavioral, other',
        maxLength: 500
      },
      {
        id: 'm2400_intervention_synopsis',
        label: 'M2400: Intervention Synopsis',
        type: 'textarea',
        required: true,
        placeholder: 'Summarize skilled interventions provided or planned',
        maxLength: 2000
      },
      {
        id: 'm2410_implementation_date',
        label: 'M2410: Plan of Care Implementation Date',
        type: 'date',
        required: false
      },
      {
        id: 'm2420_discharge_disposition',
        label: 'M2420: Discharge Disposition (if discharge assessment)',
        type: 'select',
        required: false,
        options: [
          { value: '1', label: '1 - Remained in community (not in institutional setting)' },
          { value: '2', label: '2 - Inpatient facility (hospital, SNF, NF, hospice)' },
          { value: '3', label: '3 - Deceased' },
          { value: 'uk', label: 'UK - Unknown' },
        ]
      },
    ],
  },
];

// Combine all sections
const OASIS_ALL_SECTIONS: FormSectionDef[] = [
  ...OASIS_PATIENT_INFO_SECTIONS,
  ...OASIS_CLINICAL_RECORD_SECTIONS,
  ...OASIS_LIVING_ARRANGEMENT_SECTIONS,
  ...OASIS_FUNCTIONAL_STATUS_SECTIONS,
  ...OASIS_COGNITIVE_STATUS_SECTIONS,
  ...OASIS_MEDICATIONS_SECTIONS,
  ...OASIS_DIAGNOSES_SECTIONS,
  ...OASIS_CARE_PLAN_SECTIONS,
];

// ═══════════════════════════════════════════════════════════════════════════
// TEMPLATES BY ASSESSMENT TYPE
// ═══════════════════════════════════════════════════════════════════════════

export const OASIS_E_SOC_TEMPLATE: DocumentTemplate = {
  id: 'oasis_e_soc',
  name: 'OASIS-E Start of Care Assessment',
  description: 'Initial OASIS-E assessment at admission to home health services',
  category: 'assessment',
  documentType: 'oasis_e_soc',
  sections: OASIS_ALL_SECTIONS,
  regulatoryRequirements: ['CMS Home Health', 'Medicare Conditions of Participation'],
  estimatedTimeMinutes: 60,
  requiresCosignature: false,
};

export const OASIS_E_ROC_TEMPLATE: DocumentTemplate = {
  id: 'oasis_e_roc',
  name: 'OASIS-E Resumption of Care Assessment',
  description: 'OASIS-E assessment when resuming services after inpatient stay',
  category: 'assessment',
  documentType: 'oasis_e_roc',
  sections: OASIS_ALL_SECTIONS,
  regulatoryRequirements: ['CMS Home Health', 'Medicare Conditions of Participation'],
  estimatedTimeMinutes: 60,
  requiresCosignature: false,
};

export const OASIS_E_FOLLOWUP_TEMPLATE: DocumentTemplate = {
  id: 'oasis_e_followup',
  name: 'OASIS-E Follow-Up Assessment',
  description: 'OASIS-E recertification assessment (every 60 days)',
  category: 'assessment',
  documentType: 'oasis_e_followup',
  sections: OASIS_ALL_SECTIONS,
  regulatoryRequirements: ['CMS Home Health', 'Medicare Conditions of Participation'],
  estimatedTimeMinutes: 45,
  requiresCosignature: false,
};

export const OASIS_E_DISCHARGE_TEMPLATE: DocumentTemplate = {
  id: 'oasis_e_discharge',
  name: 'OASIS-E Discharge Assessment',
  description: 'Final OASIS-E assessment at discharge from home health',
  category: 'assessment',
  documentType: 'oasis_e_discharge',
  sections: OASIS_ALL_SECTIONS,
  regulatoryRequirements: ['CMS Home Health', 'Medicare Conditions of Participation'],
  estimatedTimeMinutes: 45,
  requiresCosignature: false,
};

export const OASIS_E_TEMPLATES = {
  soc: OASIS_E_SOC_TEMPLATE,
  roc: OASIS_E_ROC_TEMPLATE,
  followup: OASIS_E_FOLLOWUP_TEMPLATE,
  discharge: OASIS_E_DISCHARGE_TEMPLATE,
};
