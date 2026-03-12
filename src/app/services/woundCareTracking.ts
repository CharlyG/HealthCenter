/**
 * Wound Care Tracking Service
 * 
 * Tracks wounds longitudinally across visits with measurements, photos, and assessments.
 * Supports progression analysis and trend detection.
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface Wound {
  id: string;
  admissionId: string;
  location: WoundLocation;
  customLocation?: string; // If location is "other"
  type: WoundType;
  stage?: PressureInjuryStage; // Only for pressure injuries
  startDate: string; // ISO date when wound first identified
  healedDate?: string; // ISO date when wound healed
  currentStatus: WoundStatus;
  isActive: boolean;
  assessments: WoundAssessment[]; // Ordered by date, most recent first
  photos: WoundPhoto[];
  treatments: WoundTreatment[];
  createdBy: string;
  createdDate: string;
  lastUpdatedDate: string;
}

export interface WoundAssessment {
  id: string;
  woundId: string;
  visitId?: string;
  assessmentDate: string; // ISO date
  assessedBy: string; // Clinician name
  
  // Measurements (in cm)
  length?: number;
  width?: number;
  depth?: number;
  area?: number; // Calculated or measured
  undermining?: number;
  tunneling?: number;
  
  // Tissue characteristics
  woundBed: WoundBedType[];
  woundBedPercentages?: Record<WoundBedType, number>; // Percentage of each type
  
  // Drainage
  drainageAmount?: DrainageAmount;
  drainageType?: DrainageType;
  drainageColor?: string;
  odor?: OdorLevel;
  
  // Edges and periwound
  edgeType?: EdgeType;
  periwoundCondition?: PeriwoundCondition[];
  
  // Pain
  painLevel?: number; // 0-10 scale
  painDescription?: string;
  
  // Status assessment
  status: WoundStatus;
  statusRationale?: string;
  
  // Clinical notes
  notes?: string;
  
  // Trends (auto-calculated)
  trend?: 'improving' | 'stable' | 'worsening';
  percentChange?: number; // Percent change in area since last assessment
}

export interface WoundPhoto {
  id: string;
  woundId: string;
  assessmentId: string;
  photoUrl: string;
  capturedDate: string;
  capturedBy: string;
  notes?: string;
  isRulerIncluded: boolean; // Photo includes ruler for scale
}

export interface WoundTreatment {
  id: string;
  woundId: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  
  // Primary dressing
  primaryDressing?: string;
  primaryDressingFrequency?: string; // e.g., "Daily", "Every 3 days"
  
  // Secondary dressing
  secondaryDressing?: string;
  
  // Topical medications
  topicalMedications?: string[];
  
  // Negative pressure wound therapy
  npwt?: {
    pressureSetting: number; // mmHg
    mode: 'continuous' | 'intermittent';
    dressingType: string;
  };
  
  // Offloading/positioning
  offloading?: string[];
  
  // Other interventions
  debridement?: {
    type: 'sharp' | 'enzymatic' | 'autolytic' | 'mechanical';
    date: string;
    performedBy: string;
  }[];
  
  notes?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export type WoundLocation =
  | 'right-heel'
  | 'left-heel'
  | 'right-ankle'
  | 'left-ankle'
  | 'right-foot'
  | 'left-foot'
  | 'right-toe'
  | 'left-toe'
  | 'right-leg'
  | 'left-leg'
  | 'sacrum'
  | 'coccyx'
  | 'right-hip'
  | 'left-hip'
  | 'right-buttock'
  | 'left-buttock'
  | 'lower-back'
  | 'right-shoulder'
  | 'left-shoulder'
  | 'right-elbow'
  | 'left-elbow'
  | 'right-hand'
  | 'left-hand'
  | 'abdomen'
  | 'chest'
  | 'other';

export type WoundType =
  | 'pressure-injury'
  | 'diabetic-ulcer'
  | 'venous-ulcer'
  | 'arterial-ulcer'
  | 'surgical-wound'
  | 'traumatic-wound'
  | 'burn'
  | 'skin-tear'
  | 'moisture-associated-dermatitis'
  | 'other';

export type PressureInjuryStage =
  | 'stage-1'
  | 'stage-2'
  | 'stage-3'
  | 'stage-4'
  | 'unstageable'
  | 'deep-tissue-injury';

export type WoundStatus =
  | 'healing' // Positive progress
  | 'stable' // No significant change
  | 'worsening' // Negative progression
  | 'healed' // Wound closed
  | 'infected' // Signs of infection
  | 'new'; // Just identified

export type WoundBedType =
  | 'granulation' // Red, healthy
  | 'slough' // Yellow, fibrinous
  | 'eschar' // Black, necrotic
  | 'epithelial' // Pink, new skin
  | 'bone-tendon' // Exposed structures
  | 'muscle';

export type DrainageAmount =
  | 'none'
  | 'scant'
  | 'small'
  | 'moderate'
  | 'large'
  | 'copious';

export type DrainageType =
  | 'serous' // Clear, watery
  | 'serosanguineous' // Clear with blood
  | 'sanguineous' // Blood
  | 'purulent' // Pus
  | 'seropurulent'; // Serous + purulent

export type OdorLevel =
  | 'none'
  | 'slight'
  | 'moderate'
  | 'strong'
  | 'foul';

export type EdgeType =
  | 'attached' // Well-defined, attached to base
  | 'not-attached' // Edges not attached
  | 'rolled' // Edges rolled under
  | 'callused' // Thickened edges
  | 'macerated'; // Soft, white edges

export type PeriwoundCondition =
  | 'intact' // Normal, healthy skin
  | 'erythema' // Redness
  | 'induration' // Hardness
  | 'maceration' // White, soft
  | 'edema' // Swelling
  | 'dry' // Dry, flaky
  | 'excoriation'; // Abraded

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

export const WOUND_LOCATION_CONFIG: Record<WoundLocation, { label: string; category: string }> = {
  'right-heel': { label: 'Right Heel', category: 'Lower Extremity' },
  'left-heel': { label: 'Left Heel', category: 'Lower Extremity' },
  'right-ankle': { label: 'Right Ankle', category: 'Lower Extremity' },
  'left-ankle': { label: 'Left Ankle', category: 'Lower Extremity' },
  'right-foot': { label: 'Right Foot', category: 'Lower Extremity' },
  'left-foot': { label: 'Left Foot', category: 'Lower Extremity' },
  'right-toe': { label: 'Right Toe', category: 'Lower Extremity' },
  'left-toe': { label: 'Left Toe', category: 'Lower Extremity' },
  'right-leg': { label: 'Right Leg', category: 'Lower Extremity' },
  'left-leg': { label: 'Left Leg', category: 'Lower Extremity' },
  'sacrum': { label: 'Sacrum', category: 'Trunk' },
  'coccyx': { label: 'Coccyx', category: 'Trunk' },
  'right-hip': { label: 'Right Hip', category: 'Trunk' },
  'left-hip': { label: 'Left Hip', category: 'Trunk' },
  'right-buttock': { label: 'Right Buttock', category: 'Trunk' },
  'left-buttock': { label: 'Left Buttock', category: 'Trunk' },
  'lower-back': { label: 'Lower Back', category: 'Trunk' },
  'right-shoulder': { label: 'Right Shoulder', category: 'Upper Extremity' },
  'left-shoulder': { label: 'Left Shoulder', category: 'Upper Extremity' },
  'right-elbow': { label: 'Right Elbow', category: 'Upper Extremity' },
  'left-elbow': { label: 'Left Elbow', category: 'Upper Extremity' },
  'right-hand': { label: 'Right Hand', category: 'Upper Extremity' },
  'left-hand': { label: 'Left Hand', category: 'Upper Extremity' },
  'abdomen': { label: 'Abdomen', category: 'Trunk' },
  'chest': { label: 'Chest', category: 'Trunk' },
  'other': { label: 'Other', category: 'Other' },
};

export const WOUND_TYPE_CONFIG: Record<WoundType, { label: string; color: string }> = {
  'pressure-injury': { label: 'Pressure Injury', color: '#DC2626' },
  'diabetic-ulcer': { label: 'Diabetic Ulcer', color: '#EA580C' },
  'venous-ulcer': { label: 'Venous Ulcer', color: '#7C3AED' },
  'arterial-ulcer': { label: 'Arterial Ulcer', color: '#DB2777' },
  'surgical-wound': { label: 'Surgical Wound', color: '#0891B2' },
  'traumatic-wound': { label: 'Traumatic Wound', color: '#65A30D' },
  'burn': { label: 'Burn', color: '#DC2626' },
  'skin-tear': { label: 'Skin Tear', color: '#CA8A04' },
  'moisture-associated-dermatitis': { label: 'Moisture-Associated Dermatitis', color: '#0284C7' },
  'other': { label: 'Other', color: '#6B7280' },
};

export const PRESSURE_INJURY_STAGE_CONFIG: Record<PressureInjuryStage, { label: string; description: string }> = {
  'stage-1': { 
    label: 'Stage 1', 
    description: 'Non-blanchable erythema of intact skin' 
  },
  'stage-2': { 
    label: 'Stage 2', 
    description: 'Partial-thickness skin loss with exposed dermis' 
  },
  'stage-3': { 
    label: 'Stage 3', 
    description: 'Full-thickness skin loss' 
  },
  'stage-4': { 
    label: 'Stage 4', 
    description: 'Full-thickness skin and tissue loss' 
  },
  'unstageable': { 
    label: 'Unstageable', 
    description: 'Obscured full-thickness skin and tissue loss' 
  },
  'deep-tissue-injury': { 
    label: 'Deep Tissue Injury', 
    description: 'Persistent non-blanchable deep red, maroon or purple discoloration' 
  },
};

export const WOUND_STATUS_CONFIG: Record<WoundStatus, { 
  label: string; 
  color: string; 
  icon: string;
  description: string;
}> = {
  'new': { 
    label: 'New', 
    color: '#3B82F6', 
    icon: 'plus-circle',
    description: 'Recently identified wound'
  },
  'healing': { 
    label: 'Healing', 
    color: '#10B981', 
    icon: 'trending-up',
    description: 'Showing positive progress'
  },
  'stable': { 
    label: 'Stable', 
    color: '#6B7280', 
    icon: 'minus',
    description: 'No significant change'
  },
  'worsening': { 
    label: 'Worsening', 
    color: '#F59E0B', 
    icon: 'trending-down',
    description: 'Showing negative progression'
  },
  'infected': { 
    label: 'Infected', 
    color: '#EF4444', 
    icon: 'alert-circle',
    description: 'Signs of infection present'
  },
  'healed': { 
    label: 'Healed', 
    color: '#059669', 
    icon: 'check-circle',
    description: 'Wound fully closed'
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate wound area from length and width
 */
export function calculateWoundArea(length?: number, width?: number): number | undefined {
  if (length === undefined || width === undefined) return undefined;
  return Math.round(length * width * 100) / 100; // Round to 2 decimals
}

/**
 * Calculate percent change between two measurements
 */
export function calculatePercentChange(previous?: number, current?: number): number | undefined {
  if (previous === undefined || current === undefined) return undefined;
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Determine trend from percent change
 */
export function determineTrend(percentChange?: number): 'improving' | 'stable' | 'worsening' {
  if (percentChange === undefined) return 'stable';
  if (percentChange < -10) return 'improving'; // Area decreased by >10%
  if (percentChange > 10) return 'worsening'; // Area increased by >10%
  return 'stable';
}

/**
 * Get most recent assessment
 */
export function getMostRecentAssessment(wound: Wound): WoundAssessment | undefined {
  return wound.assessments[0]; // Assumes sorted by date desc
}

/**
 * Get wound age in days
 */
export function getWoundAge(wound: Wound): number {
  const start = new Date(wound.startDate);
  const end = wound.healedDate ? new Date(wound.healedDate) : new Date();
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get days since last assessment
 */
export function getDaysSinceLastAssessment(wound: Wound): number | null {
  const recent = getMostRecentAssessment(wound);
  if (!recent) return null;
  
  const assessmentDate = new Date(recent.assessmentDate);
  const now = new Date();
  const diff = now.getTime() - assessmentDate.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get wound display name
 */
export function getWoundDisplayName(wound: Wound): string {
  const location = wound.customLocation || WOUND_LOCATION_CONFIG[wound.location].label;
  const type = WOUND_TYPE_CONFIG[wound.type].label;
  return `${location} ${type}`;
}

/**
 * Sort assessments by date (most recent first)
 */
export function sortAssessmentsByDate(assessments: WoundAssessment[]): WoundAssessment[] {
  return [...assessments].sort((a, b) => 
    new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime()
  );
}

/**
 * Get assessment measurement summary
 */
export function getAssessmentSummary(assessment: WoundAssessment): string {
  const parts: string[] = [];
  
  if (assessment.length && assessment.width) {
    parts.push(`${assessment.length} × ${assessment.width} cm`);
  }
  if (assessment.depth) {
    parts.push(`Depth: ${assessment.depth} cm`);
  }
  if (assessment.area) {
    parts.push(`Area: ${assessment.area} cm²`);
  }
  
  return parts.join(' • ') || 'No measurements';
}

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export const MOCK_WOUNDS: Wound[] = [
  {
    id: 'wound-001',
    admissionId: 'ADM-12345',
    location: 'sacrum',
    type: 'pressure-injury',
    stage: 'stage-2',
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    currentStatus: 'healing',
    isActive: true,
    createdBy: 'Sarah Johnson, RN',
    createdDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assessments: [
      {
        id: 'assess-001-6',
        woundId: 'wound-001',
        visitId: 'visit-106',
        assessmentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Sarah Johnson, RN',
        length: 2.8,
        width: 2.2,
        depth: 0.3,
        area: 6.16,
        woundBed: ['granulation', 'epithelial'],
        woundBedPercentages: { 'granulation': 70, 'epithelial': 30, 'slough': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'scant',
        drainageType: 'serous',
        odor: 'none',
        edgeType: 'attached',
        periwoundCondition: ['intact'],
        painLevel: 1,
        status: 'healing',
        statusRationale: 'Decreased size, increased epithelialization',
        notes: 'Continued improvement. Edges well-approximated. Good granulation tissue.',
        trend: 'improving',
        percentChange: -18,
      },
      {
        id: 'assess-001-5',
        woundId: 'wound-001',
        visitId: 'visit-103',
        assessmentDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Sarah Johnson, RN',
        length: 3.0,
        width: 2.5,
        depth: 0.4,
        area: 7.5,
        woundBed: ['granulation', 'slough'],
        woundBedPercentages: { 'granulation': 75, 'slough': 25, 'epithelial': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'small',
        drainageType: 'serous',
        odor: 'none',
        edgeType: 'attached',
        periwoundCondition: ['intact'],
        painLevel: 2,
        status: 'healing',
        statusRationale: 'Decreased size and depth',
        notes: 'Showing steady improvement. Less slough present.',
        trend: 'improving',
        percentChange: -21,
      },
      {
        id: 'assess-001-4',
        woundId: 'wound-001',
        visitId: 'visit-100',
        assessmentDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Michael Chen, RN',
        length: 3.4,
        width: 2.8,
        depth: 0.6,
        area: 9.52,
        woundBed: ['granulation', 'slough'],
        woundBedPercentages: { 'granulation': 60, 'slough': 40, 'epithelial': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'small',
        drainageType: 'serosanguineous',
        odor: 'slight',
        edgeType: 'attached',
        periwoundCondition: ['intact', 'erythema'],
        painLevel: 3,
        status: 'healing',
        statusRationale: 'Decreased size from previous',
        notes: 'Improving granulation. Continue current treatment.',
        trend: 'improving',
        percentChange: -15,
      },
      {
        id: 'assess-001-3',
        woundId: 'wound-001',
        visitId: 'visit-097',
        assessmentDate: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Sarah Johnson, RN',
        length: 3.8,
        width: 2.9,
        depth: 0.8,
        area: 11.02,
        woundBed: ['granulation', 'slough'],
        woundBedPercentages: { 'granulation': 50, 'slough': 50, 'epithelial': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'moderate',
        drainageType: 'serosanguineous',
        odor: 'slight',
        edgeType: 'not-attached',
        periwoundCondition: ['erythema', 'maceration'],
        painLevel: 4,
        status: 'stable',
        statusRationale: 'Similar size to last assessment',
        notes: 'No significant change. Adjusted treatment plan.',
        trend: 'stable',
        percentChange: -2,
      },
      {
        id: 'assess-001-2',
        woundId: 'wound-001',
        visitId: 'visit-094',
        assessmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Michael Chen, RN',
        length: 4.0,
        width: 2.8,
        depth: 1.0,
        area: 11.2,
        woundBed: ['slough', 'granulation'],
        woundBedPercentages: { 'slough': 60, 'granulation': 40, 'epithelial': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'moderate',
        drainageType: 'serosanguineous',
        odor: 'moderate',
        edgeType: 'not-attached',
        periwoundCondition: ['erythema', 'maceration'],
        painLevel: 5,
        status: 'worsening',
        statusRationale: 'Increased depth and slough',
        notes: 'Wound showing signs of deterioration. Revised treatment plan.',
        trend: 'worsening',
        percentChange: 12,
      },
      {
        id: 'assess-001-1',
        woundId: 'wound-001',
        visitId: 'visit-091',
        assessmentDate: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Sarah Johnson, RN',
        length: 3.5,
        width: 2.8,
        depth: 0.5,
        area: 10.0,
        woundBed: ['slough', 'granulation'],
        woundBedPercentages: { 'slough': 70, 'granulation': 30, 'epithelial': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'small',
        drainageType: 'serous',
        odor: 'slight',
        edgeType: 'not-attached',
        periwoundCondition: ['erythema'],
        painLevel: 4,
        status: 'new',
        statusRationale: 'Initial assessment',
        notes: 'Stage 2 pressure injury identified on sacrum. Initiated treatment protocol.',
        trend: 'stable',
      },
    ],
    photos: [
      {
        id: 'photo-001-6',
        woundId: 'wound-001',
        assessmentId: 'assess-001-6',
        photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
        capturedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        capturedBy: 'Sarah Johnson, RN',
        isRulerIncluded: true,
      },
      {
        id: 'photo-001-4',
        woundId: 'wound-001',
        assessmentId: 'assess-001-4',
        photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
        capturedDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
        capturedBy: 'Michael Chen, RN',
        isRulerIncluded: true,
      },
      {
        id: 'photo-001-1',
        woundId: 'wound-001',
        assessmentId: 'assess-001-1',
        photoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400',
        capturedDate: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
        capturedBy: 'Sarah Johnson, RN',
        isRulerIncluded: true,
      },
    ],
    treatments: [
      {
        id: 'treatment-001',
        woundId: 'wound-001',
        startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        primaryDressing: 'Hydrocolloid dressing',
        primaryDressingFrequency: 'Every 3 days',
        secondaryDressing: 'Foam dressing',
        topicalMedications: [],
        offloading: ['Pressure-relieving mattress', 'Turn every 2 hours', 'Foam wedge positioning'],
        notes: 'Continue current treatment. Patient tolerating well.',
      },
    ],
  },
  {
    id: 'wound-002',
    admissionId: 'ADM-12345',
    location: 'right-heel',
    type: 'diabetic-ulcer',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    currentStatus: 'stable',
    isActive: true,
    createdBy: 'Michael Chen, RN',
    createdDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    assessments: [
      {
        id: 'assess-002-3',
        woundId: 'wound-002',
        visitId: 'visit-105',
        assessmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Michael Chen, RN',
        length: 1.5,
        width: 1.2,
        depth: 0.2,
        area: 1.8,
        woundBed: ['granulation'],
        woundBedPercentages: { 'granulation': 100, 'slough': 0, 'epithelial': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'scant',
        drainageType: 'serous',
        odor: 'none',
        edgeType: 'attached',
        periwoundCondition: ['intact', 'dry'],
        painLevel: 2,
        status: 'stable',
        statusRationale: 'No significant change in size',
        notes: 'Wound bed looks healthy. Continue offloading.',
        trend: 'stable',
        percentChange: 0,
      },
      {
        id: 'assess-002-2',
        woundId: 'wound-002',
        visitId: 'visit-098',
        assessmentDate: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Sarah Johnson, RN',
        length: 1.5,
        width: 1.2,
        depth: 0.3,
        area: 1.8,
        woundBed: ['granulation', 'slough'],
        woundBedPercentages: { 'granulation': 85, 'slough': 15, 'epithelial': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'scant',
        drainageType: 'serous',
        odor: 'none',
        edgeType: 'attached',
        periwoundCondition: ['intact', 'dry'],
        painLevel: 2,
        status: 'stable',
        statusRationale: 'Stable size and appearance',
        notes: 'Small amount of slough present. Otherwise stable.',
        trend: 'stable',
        percentChange: -5,
      },
      {
        id: 'assess-002-1',
        woundId: 'wound-002',
        visitId: 'visit-092',
        assessmentDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Michael Chen, RN',
        length: 1.6,
        width: 1.2,
        depth: 0.4,
        area: 1.92,
        woundBed: ['granulation', 'slough'],
        woundBedPercentages: { 'granulation': 70, 'slough': 30, 'epithelial': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'small',
        drainageType: 'serous',
        odor: 'slight',
        edgeType: 'callused',
        periwoundCondition: ['dry'],
        painLevel: 3,
        status: 'stable',
        statusRationale: 'Baseline assessment for this episode',
        notes: 'Diabetic ulcer on right heel. Patient has neuropathy.',
        trend: 'stable',
      },
    ],
    photos: [
      {
        id: 'photo-002-3',
        woundId: 'wound-002',
        assessmentId: 'assess-002-3',
        photoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
        capturedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        capturedBy: 'Michael Chen, RN',
        isRulerIncluded: true,
      },
    ],
    treatments: [
      {
        id: 'treatment-002',
        woundId: 'wound-002',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        primaryDressing: 'Alginate dressing',
        primaryDressingFrequency: 'Daily',
        secondaryDressing: 'Gauze wrap',
        topicalMedications: [],
        offloading: ['Total contact cast', 'Wheelchair for mobility'],
        notes: 'Strict offloading protocol. Patient educated on importance of compliance.',
      },
    ],
  },
  {
    id: 'wound-003',
    admissionId: 'ADM-12345',
    location: 'left-ankle',
    type: 'venous-ulcer',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    healedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    currentStatus: 'healed',
    isActive: false,
    createdBy: 'Sarah Johnson, RN',
    createdDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastUpdatedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    assessments: [
      {
        id: 'assess-003-5',
        woundId: 'wound-003',
        visitId: 'visit-104',
        assessmentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Sarah Johnson, RN',
        length: 0,
        width: 0,
        depth: 0,
        area: 0,
        woundBed: ['epithelial'],
        woundBedPercentages: { 'epithelial': 100, 'granulation': 0, 'slough': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'none',
        odor: 'none',
        edgeType: 'attached',
        periwoundCondition: ['intact'],
        painLevel: 0,
        status: 'healed',
        statusRationale: 'Wound completely epithelialized',
        notes: 'Wound healed. Continue compression therapy to prevent recurrence.',
        trend: 'improving',
        percentChange: -100,
      },
      {
        id: 'assess-003-4',
        woundId: 'wound-003',
        visitId: 'visit-101',
        assessmentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        assessedBy: 'Michael Chen, RN',
        length: 0.5,
        width: 0.4,
        depth: 0.1,
        area: 0.2,
        woundBed: ['epithelial', 'granulation'],
        woundBedPercentages: { 'epithelial': 80, 'granulation': 20, 'slough': 0, 'eschar': 0, 'bone-tendon': 0, 'muscle': 0 },
        drainageAmount: 'scant',
        drainageType: 'serous',
        odor: 'none',
        edgeType: 'attached',
        periwoundCondition: ['intact'],
        painLevel: 0,
        status: 'healing',
        statusRationale: 'Nearly healed, excellent epithelialization',
        notes: 'Almost completely healed. Continue current plan.',
        trend: 'improving',
        percentChange: -75,
      },
    ],
    photos: [],
    treatments: [
      {
        id: 'treatment-003',
        woundId: 'wound-003',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: false,
        primaryDressing: 'Foam dressing',
        primaryDressingFrequency: 'Every 3 days',
        topicalMedications: [],
        offloading: ['Compression stockings 30-40 mmHg', 'Leg elevation'],
        notes: 'Compression therapy was key to healing.',
      },
    ],
  },
];

export function getMockWounds(admissionId: string = 'ADM-12345'): Wound[] {
  return MOCK_WOUNDS.filter(w => w.admissionId === admissionId);
}

export function getMockWoundById(woundId: string): Wound | undefined {
  return MOCK_WOUNDS.find(w => w.id === woundId);
}
