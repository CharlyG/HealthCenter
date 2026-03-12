/**
 * Mock Data Generator for Visit Timeline
 * 
 * Generates realistic clinical timeline events for testing and demos.
 */

import { TimelineEvent, TimelineEventType } from '../components/timeline/VisitTimeline';

// ==================== SAMPLE DATA ====================

const STAFF_MEMBERS = [
  { name: 'Sarah Johnson', role: 'RN', credentials: 'RN, BSN' },
  { name: 'Michael Chen', role: 'PT', credentials: 'PT, DPT' },
  { name: 'Emily Rodriguez', role: 'OT', credentials: 'OTR/L' },
  { name: 'David Thompson', role: 'MD', credentials: 'MD' },
  { name: 'Lisa Anderson', role: 'RN', credentials: 'RN' },
  { name: 'James Wilson', role: 'ST', credentials: 'SLP, MS' },
  { name: 'Maria Garcia', role: 'MSW', credentials: 'MSW, LCSW' },
];

const VISIT_DESCRIPTIONS = [
  'Skilled nursing visit for medication management and wound care',
  'Physical therapy session focusing on gait training and balance',
  'Occupational therapy for ADL training and home safety assessment',
  'Speech therapy for dysphagia management',
  'Nursing assessment and vital signs monitoring',
  'Home health aide visit for personal care',
];

const CLINICAL_NOTE_TEMPLATES = [
  {
    title: 'Progress Note: Improved Mobility',
    description: 'Patient demonstrates improved ambulation with walker. Distance increased to 50 feet. Continues to require minimal assistance.',
    details: {
      ambulation_distance: '50 feet',
      assistance_level: 'Minimal',
      equipment: 'Walker',
      patient_tolerance: 'Good',
      education_provided: 'Fall prevention strategies',
    },
  },
  {
    title: 'Assessment Note: Wound Healing',
    description: 'Stage 2 pressure ulcer on sacrum showing signs of healing. Wound bed is pink with granulation tissue.',
    details: {
      wound_location: 'Sacrum',
      wound_stage: 'Stage 2',
      wound_size: '2cm x 1.5cm',
      wound_appearance: 'Pink with granulation',
      treatment: 'Hydrocolloid dressing applied',
      next_visit: 'In 3 days',
    },
  },
  {
    title: 'Care Plan Update',
    description: 'Updated care plan to reflect progress in PT goals. Patient now ambulating with less assistance.',
    details: {
      changes_made: 'Updated mobility goals',
      new_goals: 'Independent ambulation with walker',
      target_date: '2 weeks',
    },
  },
];

const ORDER_TEMPLATES = [
  {
    title: 'Order: Lab Work',
    description: 'CBC, BMP, and PT/INR ordered for Coumadin monitoring',
    details: {
      order_type: 'Laboratory',
      tests_ordered: 'CBC, BMP, PT/INR',
      reason: 'Coumadin monitoring',
      priority: 'Routine',
      scheduled_date: 'Tomorrow',
    },
  },
  {
    title: 'Order: DME Request',
    description: 'Hospital bed and bedside commode ordered',
    details: {
      order_type: 'Durable Medical Equipment',
      items: 'Hospital bed, Bedside commode',
      justification: 'Safety and mobility needs',
      status: 'Pending approval',
    },
  },
  {
    title: 'Order: Imaging',
    description: 'Chest X-ray ordered to evaluate respiratory symptoms',
    details: {
      order_type: 'Radiology',
      imaging_type: 'Chest X-ray',
      reason: 'Evaluate respiratory symptoms',
      priority: 'Urgent',
    },
  },
];

const ASSESSMENT_TEMPLATES = [
  {
    title: 'Pain Assessment',
    description: 'Pain level 5/10 in lower back, described as constant dull ache',
    details: {
      pain_level: '5/10',
      pain_location: 'Lower back',
      pain_quality: 'Constant dull ache',
      pain_duration: 'Past 3 days',
      interventions: 'Ice pack applied, positioning adjusted',
      response: 'Pain reduced to 3/10 after interventions',
    },
  },
  {
    title: 'Fall Risk Assessment',
    description: 'Moderate fall risk identified. Patient history of falls, uses walker',
    details: {
      risk_level: 'Moderate',
      risk_factors: 'History of falls, Impaired balance, Medication side effects',
      morse_score: '55',
      interventions: 'Fall prevention education, Walker assessment',
      reassessment_date: 'In 1 week',
    },
  },
  {
    title: 'Nutritional Assessment',
    description: 'Weight stable. Patient eating 75% of meals. Adequate hydration.',
    details: {
      weight: '145 lbs',
      weight_change: 'Stable',
      appetite: 'Good (75% intake)',
      hydration: 'Adequate (6-8 glasses/day)',
      diet_type: 'Regular',
      concerns: 'None at this time',
    },
  },
];

const MEDICATION_TEMPLATES = [
  {
    title: 'Medication Added: Lisinopril',
    description: 'Lisinopril 10mg daily started for hypertension management',
    details: {
      medication: 'Lisinopril',
      dose: '10mg',
      frequency: 'Daily',
      route: 'Oral',
      reason: 'Hypertension',
      prescriber: 'Dr. Thompson',
      start_date: 'Today',
    },
  },
  {
    title: 'Medication Discontinued: Metformin',
    description: 'Metformin discontinued due to GI side effects',
    details: {
      medication: 'Metformin',
      reason_discontinued: 'GI side effects',
      alternative: 'Discussed with MD',
      discontinued_by: 'Dr. Thompson',
    },
  },
  {
    title: 'Dose Adjustment: Warfarin',
    description: 'Warfarin dose increased from 5mg to 7.5mg based on INR results',
    details: {
      medication: 'Warfarin',
      previous_dose: '5mg daily',
      new_dose: '7.5mg daily',
      reason: 'INR subtherapeutic (1.8)',
      target_inr: '2.0-3.0',
      next_inr_check: 'In 3 days',
    },
  },
];

const VITAL_SIGNS_TEMPLATES = [
  {
    title: 'Vital Signs Assessment',
    description: 'Blood pressure 128/82, Heart rate 76, Temp 98.4°F, O2 sat 96%',
    details: {
      blood_pressure: '128/82 mmHg',
      heart_rate: '76 bpm',
      respiratory_rate: '16 breaths/min',
      temperature: '98.4°F',
      oxygen_saturation: '96% on room air',
      pain_level: '2/10',
    },
  },
  {
    title: 'Vital Signs - Elevated BP',
    description: 'Blood pressure 158/94, elevated from baseline. Patient educated.',
    details: {
      blood_pressure: '158/94 mmHg',
      heart_rate: '82 bpm',
      temperature: '98.6°F',
      oxygen_saturation: '97% on room air',
      alert: 'Elevated blood pressure',
      action_taken: 'MD notified, Patient educated on diet and medication compliance',
    },
  },
];

// ==================== GENERATOR FUNCTIONS ====================

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomDate(daysAgo: number): Date {
  const now = new Date();
  const randomHours = Math.random() * daysAgo * 24;
  return new Date(now.getTime() - randomHours * 60 * 60 * 1000);
}

function generateVisitEvent(daysAgo: number): TimelineEvent {
  return {
    id: `visit_${Date.now()}_${Math.random()}`,
    type: 'visit',
    title: 'Home Health Visit',
    description: getRandomItem(VISIT_DESCRIPTIONS),
    timestamp: getRandomDate(daysAgo),
    staff_member: getRandomItem(STAFF_MEMBERS),
    status: 'completed',
    visit_id: `VST-${Math.floor(Math.random() * 9000) + 1000}`,
    details: {
      duration: `${Math.floor(Math.random() * 30) + 30} minutes`,
      visit_type: getRandomItem(['Skilled Nursing', 'Physical Therapy', 'Occupational Therapy']),
    },
  };
}

function generateClinicalNoteEvent(daysAgo: number): TimelineEvent {
  const template = getRandomItem(CLINICAL_NOTE_TEMPLATES);
  return {
    id: `note_${Date.now()}_${Math.random()}`,
    type: 'clinical_note',
    title: template.title,
    description: template.description,
    timestamp: getRandomDate(daysAgo),
    staff_member: getRandomItem(STAFF_MEMBERS),
    status: 'completed',
    visit_id: `VST-${Math.floor(Math.random() * 9000) + 1000}`,
    details: template.details,
  };
}

function generateOrderEvent(daysAgo: number): TimelineEvent {
  const template = getRandomItem(ORDER_TEMPLATES);
  return {
    id: `order_${Date.now()}_${Math.random()}`,
    type: 'order',
    title: template.title,
    description: template.description,
    timestamp: getRandomDate(daysAgo),
    staff_member: getRandomItem(STAFF_MEMBERS.filter(s => s.role === 'MD' || s.role === 'RN')),
    status: getRandomItem(['completed', 'in_progress', 'pending']),
    details: template.details,
  };
}

function generateAssessmentEvent(daysAgo: number): TimelineEvent {
  const template = getRandomItem(ASSESSMENT_TEMPLATES);
  return {
    id: `assessment_${Date.now()}_${Math.random()}`,
    type: 'assessment',
    title: template.title,
    description: template.description,
    timestamp: getRandomDate(daysAgo),
    staff_member: getRandomItem(STAFF_MEMBERS),
    status: 'completed',
    visit_id: `VST-${Math.floor(Math.random() * 9000) + 1000}`,
    details: template.details,
  };
}

function generateMedicationEvent(daysAgo: number): TimelineEvent {
  const template = getRandomItem(MEDICATION_TEMPLATES);
  return {
    id: `med_${Date.now()}_${Math.random()}`,
    type: 'medication_change',
    title: template.title,
    description: template.description,
    timestamp: getRandomDate(daysAgo),
    staff_member: getRandomItem(STAFF_MEMBERS.filter(s => s.role === 'MD' || s.role === 'RN')),
    status: 'completed',
    details: template.details,
  };
}

function generateVitalSignsEvent(daysAgo: number): TimelineEvent {
  const template = getRandomItem(VITAL_SIGNS_TEMPLATES);
  return {
    id: `vitals_${Date.now()}_${Math.random()}`,
    type: 'vital_signs',
    title: template.title,
    description: template.description,
    timestamp: getRandomDate(daysAgo),
    staff_member: getRandomItem(STAFF_MEMBERS.filter(s => s.role === 'RN')),
    status: 'completed',
    visit_id: `VST-${Math.floor(Math.random() * 9000) + 1000}`,
    details: template.details,
  };
}

// ==================== MAIN GENERATOR ====================

export function generateTimelineEvents(count: number = 20, dayRange: number = 30): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const eventTypes: TimelineEventType[] = [
    'visit',
    'clinical_note',
    'order',
    'assessment',
    'medication_change',
    'vital_signs',
  ];

  for (let i = 0; i < count; i++) {
    const daysAgo = (dayRange / count) * i;
    const eventType = getRandomItem(eventTypes);

    let event: TimelineEvent;
    switch (eventType) {
      case 'visit':
        event = generateVisitEvent(daysAgo);
        break;
      case 'clinical_note':
        event = generateClinicalNoteEvent(daysAgo);
        break;
      case 'order':
        event = generateOrderEvent(daysAgo);
        break;
      case 'assessment':
        event = generateAssessmentEvent(daysAgo);
        break;
      case 'medication_change':
        event = generateMedicationEvent(daysAgo);
        break;
      case 'vital_signs':
        event = generateVitalSignsEvent(daysAgo);
        break;
      default:
        continue;
    }

    events.push(event);
  }

  // Sort by timestamp descending
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

// Generate a specific set for demos
export function generateDemoTimelineEvents(): TimelineEvent[] {
  return generateTimelineEvents(25, 14); // 25 events over past 14 days
}
