/**
 * Care Plan Management Service
 * 
 * Comprehensive care plan architecture for home health platform.
 * 
 * CORE COMPONENTS:
 * - Problems (Diagnoses/Issues)
 * - Goals (Patient-specific outcomes)
 * - Interventions (Specific actions)
 * - Disciplines (Responsible caregivers)
 * - Timeline (Start/Target dates)
 * - Status Tracking
 * 
 * FEATURES:
 * - Admission association
 * - Version control
 * - CMS compliance
 * - Multi-disciplinary coordination
 * - Progress tracking
 * - Auto-save
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ProblemStatus = 'active' | 'resolved' | 'inactive';
export type GoalStatus = 'active' | 'met' | 'partially-met' | 'not-met' | 'revised' | 'discontinued';
export type InterventionStatus = 'active' | 'completed' | 'discontinued' | 'on-hold';
export type DisciplineType = 'skilled-nursing' | 'physical-therapy' | 'occupational-therapy' | 'speech-therapy' | 'medical-social-work' | 'home-health-aide';
export type ProblemSeverity = 'high' | 'medium' | 'low';

/**
 * Care Plan - Main container
 * Associated with an admission
 */
export interface CarePlan {
  id: string;
  admissionId: string;
  patientId: string;
  
  // Version tracking
  version: number;
  status: 'draft' | 'active' | 'updated' | 'completed';
  
  // Components
  problems: Problem[];
  goals: Goal[];
  interventions: Intervention[];
  
  // Metadata
  createdDate: string;
  createdBy: string;
  lastModifiedDate: string;
  lastModifiedBy: string;
  effectiveDate: string;
  expirationDate?: string;
  
  // Approval/Sign-off
  approvedBy?: string;
  approvedDate?: string;
  physicianReviewDate?: string;
  physicianName?: string;
  
  // Progress
  lastReviewedDate?: string;
  nextReviewDate?: string;
}

/**
 * Problem - Health issue/diagnosis
 * Can be linked to ICD-10 codes
 */
export interface Problem {
  id: string;
  carePlanId: string;
  
  // Problem details
  name: string;
  description?: string;
  icd10Code?: string;
  icd10Description?: string;
  
  // Classification
  severity: ProblemSeverity;
  isPrimary: boolean; // Primary diagnosis
  
  // Status tracking
  status: ProblemStatus;
  identifiedDate: string;
  resolvedDate?: string;
  
  // Related items
  relatedGoalIds: string[];
  relatedInterventionIds: string[];
  
  // Metadata
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
}

/**
 * Goal - Patient-specific outcome
 * SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)
 */
export interface Goal {
  id: string;
  carePlanId: string;
  problemId: string;
  
  // Goal details
  name: string;
  description: string;
  
  // SMART criteria
  measurableCriteria: string; // How to measure success
  targetValue?: string; // e.g., "Walk 50 feet independently"
  
  // Timeline
  startDate: string;
  targetDate: string;
  achievedDate?: string;
  
  // Status tracking
  status: GoalStatus;
  progressPercentage: number; // 0-100
  progressNotes?: string;
  
  // Disciplines
  responsibleDisciplines: DisciplineType[];
  primaryDiscipline: DisciplineType;
  
  // Related items
  relatedInterventionIds: string[];
  
  // Barriers/Facilitators
  barriers?: string[];
  facilitators?: string[];
  
  // Metadata
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  lastReviewedDate?: string;
}

/**
 * Intervention - Specific action/treatment
 * Frequency-based activities
 */
export interface Intervention {
  id: string;
  carePlanId: string;
  goalId: string;
  problemId: string;
  
  // Intervention details
  name: string;
  description: string;
  instructions?: string;
  
  // Frequency/Schedule
  frequency: string; // e.g., "3x per week", "Daily", "PRN"
  duration?: string; // e.g., "30 minutes", "1 hour"
  route?: string; // For medications/treatments
  
  // Disciplines
  responsibleDisciplines: DisciplineType[];
  primaryDiscipline: DisciplineType;
  
  // Timeline
  startDate: string;
  endDate?: string;
  
  // Status tracking
  status: InterventionStatus;
  completedCount?: number;
  totalPlannedCount?: number;
  
  // Safety/Precautions
  precautions?: string[];
  contraindications?: string[];
  
  // Teaching component
  requiresPatientTeaching: boolean;
  teachingCompleted: boolean;
  teachingDate?: string;
  
  // Metadata
  createdBy: string;
  createdDate: string;
  lastModifiedBy?: string;
  lastModifiedDate?: string;
  lastPerformedDate?: string;
  lastPerformedBy?: string;
}

/**
 * Care Plan Progress Note
 * Documents progress toward goals
 */
export interface CarePlanProgressNote {
  id: string;
  carePlanId: string;
  goalId?: string;
  
  // Note details
  date: string;
  author: string;
  discipline: DisciplineType;
  
  // Content
  progressSummary: string;
  barriers?: string;
  modifications?: string;
  
  // Recommendations
  recommendations?: string;
  needsRevision: boolean;
}

/**
 * Care Plan Revision
 * Tracks changes to care plan
 */
export interface CarePlanRevision {
  id: string;
  carePlanId: string;
  
  // Revision details
  revisionNumber: number;
  revisionDate: string;
  revisedBy: string;
  reason: string;
  
  // Changes
  changesSummary: string;
  problemsAdded: string[];
  problemsRemoved: string[];
  goalsAdded: string[];
  goalsModified: string[];
  goalsDiscontinued: string[];
  interventionsAdded: string[];
  interventionsModified: string[];
  interventionsDiscontinued: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const DISCIPLINE_CONFIG = {
  'skilled-nursing': {
    label: 'Skilled Nursing',
    abbreviation: 'SN',
    color: 'blue',
  },
  'physical-therapy': {
    label: 'Physical Therapy',
    abbreviation: 'PT',
    color: 'green',
  },
  'occupational-therapy': {
    label: 'Occupational Therapy',
    abbreviation: 'OT',
    color: 'purple',
  },
  'speech-therapy': {
    label: 'Speech Therapy',
    abbreviation: 'ST',
    color: 'orange',
  },
  'medical-social-work': {
    label: 'Medical Social Work',
    abbreviation: 'MSW',
    color: 'pink',
  },
  'home-health-aide': {
    label: 'Home Health Aide',
    abbreviation: 'HHA',
    color: 'teal',
  },
} as const;

export const PROBLEM_STATUS_CONFIG = {
  'active': {
    label: 'Active',
    color: 'text-blue-700 bg-blue-100',
    description: 'Currently being addressed',
  },
  'resolved': {
    label: 'Resolved',
    color: 'text-green-700 bg-green-100',
    description: 'Problem has been resolved',
  },
  'inactive': {
    label: 'Inactive',
    color: 'text-gray-700 bg-gray-100',
    description: 'No longer being addressed',
  },
} as const;

export const GOAL_STATUS_CONFIG = {
  'active': {
    label: 'Active',
    color: 'text-blue-700 bg-blue-100',
    description: 'In progress',
  },
  'met': {
    label: 'Met',
    color: 'text-green-700 bg-green-100',
    description: 'Goal achieved',
  },
  'partially-met': {
    label: 'Partially Met',
    color: 'text-amber-700 bg-amber-100',
    description: 'Progress made but not complete',
  },
  'not-met': {
    label: 'Not Met',
    color: 'text-red-700 bg-red-100',
    description: 'Goal not achieved',
  },
  'revised': {
    label: 'Revised',
    color: 'text-purple-700 bg-purple-100',
    description: 'Goal has been modified',
  },
  'discontinued': {
    label: 'Discontinued',
    color: 'text-gray-700 bg-gray-100',
    description: 'No longer applicable',
  },
} as const;

export const INTERVENTION_STATUS_CONFIG = {
  'active': {
    label: 'Active',
    color: 'text-blue-700 bg-blue-100',
  },
  'completed': {
    label: 'Completed',
    color: 'text-green-700 bg-green-100',
  },
  'discontinued': {
    label: 'Discontinued',
    color: 'text-gray-700 bg-gray-100',
  },
  'on-hold': {
    label: 'On Hold',
    color: 'text-amber-700 bg-amber-100',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CARE PLAN SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class CarePlanService {
  /**
   * Create a new care plan for an admission
   */
  createCarePlan(
    admissionId: string,
    patientId: string,
    createdBy: string
  ): CarePlan {
    return {
      id: `cp-${Date.now()}`,
      admissionId,
      patientId,
      version: 1,
      status: 'draft',
      problems: [],
      goals: [],
      interventions: [],
      createdDate: new Date().toISOString(),
      createdBy,
      lastModifiedDate: new Date().toISOString(),
      lastModifiedBy: createdBy,
      effectiveDate: new Date().toISOString(),
    };
  }

  /**
   * Add problem to care plan
   */
  addProblem(
    carePlan: CarePlan,
    problem: Omit<Problem, 'id' | 'carePlanId' | 'createdDate' | 'relatedGoalIds' | 'relatedInterventionIds'>
  ): Problem {
    const newProblem: Problem = {
      ...problem,
      id: `prob-${Date.now()}-${Math.random()}`,
      carePlanId: carePlan.id,
      createdDate: new Date().toISOString(),
      relatedGoalIds: [],
      relatedInterventionIds: [],
    };

    carePlan.problems.push(newProblem);
    return newProblem;
  }

  /**
   * Add goal to care plan
   */
  addGoal(
    carePlan: CarePlan,
    goal: Omit<Goal, 'id' | 'carePlanId' | 'createdDate' | 'relatedInterventionIds'>
  ): Goal {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random()}`,
      carePlanId: carePlan.id,
      createdDate: new Date().toISOString(),
      relatedInterventionIds: [],
    };

    carePlan.goals.push(newGoal);

    // Update problem relationship
    const problem = carePlan.problems.find(p => p.id === newGoal.problemId);
    if (problem && !problem.relatedGoalIds.includes(newGoal.id)) {
      problem.relatedGoalIds.push(newGoal.id);
    }

    return newGoal;
  }

  /**
   * Add intervention to care plan
   */
  addIntervention(
    carePlan: CarePlan,
    intervention: Omit<Intervention, 'id' | 'carePlanId' | 'createdDate'>
  ): Intervention {
    const newIntervention: Intervention = {
      ...intervention,
      id: `int-${Date.now()}-${Math.random()}`,
      carePlanId: carePlan.id,
      createdDate: new Date().toISOString(),
    };

    carePlan.interventions.push(newIntervention);

    // Update goal relationship
    const goal = carePlan.goals.find(g => g.id === newIntervention.goalId);
    if (goal && !goal.relatedInterventionIds.includes(newIntervention.id)) {
      goal.relatedInterventionIds.push(newIntervention.id);
    }

    // Update problem relationship
    const problem = carePlan.problems.find(p => p.id === newIntervention.problemId);
    if (problem && !problem.relatedInterventionIds.includes(newIntervention.id)) {
      problem.relatedInterventionIds.push(newIntervention.id);
    }

    return newIntervention;
  }

  /**
   * Update goal progress
   */
  updateGoalProgress(
    goal: Goal,
    progressPercentage: number,
    notes?: string
  ): void {
    goal.progressPercentage = Math.max(0, Math.min(100, progressPercentage));
    goal.progressNotes = notes;
    goal.lastReviewedDate = new Date().toISOString();

    // Auto-update status based on progress
    if (progressPercentage >= 100) {
      goal.status = 'met';
      goal.achievedDate = new Date().toISOString();
    } else if (progressPercentage >= 50) {
      goal.status = 'partially-met';
    }
  }

  /**
   * Get care plan statistics
   */
  getStatistics(carePlan: CarePlan) {
    return {
      totalProblems: carePlan.problems.length,
      activeProblems: carePlan.problems.filter(p => p.status === 'active').length,
      resolvedProblems: carePlan.problems.filter(p => p.status === 'resolved').length,
      
      totalGoals: carePlan.goals.length,
      activeGoals: carePlan.goals.filter(g => g.status === 'active').length,
      metGoals: carePlan.goals.filter(g => g.status === 'met').length,
      partiallyMetGoals: carePlan.goals.filter(g => g.status === 'partially-met').length,
      
      totalInterventions: carePlan.interventions.length,
      activeInterventions: carePlan.interventions.filter(i => i.status === 'active').length,
      completedInterventions: carePlan.interventions.filter(i => i.status === 'completed').length,
      
      overallProgress: this.calculateOverallProgress(carePlan),
      disciplinesInvolved: this.getDisciplinesInvolved(carePlan),
    };
  }

  /**
   * Calculate overall progress
   */
  private calculateOverallProgress(carePlan: CarePlan): number {
    if (carePlan.goals.length === 0) return 0;
    
    const totalProgress = carePlan.goals.reduce((sum, goal) => sum + goal.progressPercentage, 0);
    return Math.round(totalProgress / carePlan.goals.length);
  }

  /**
   * Get disciplines involved in care plan
   */
  private getDisciplinesInvolved(carePlan: CarePlan): DisciplineType[] {
    const disciplines = new Set<DisciplineType>();
    
    carePlan.goals.forEach(goal => {
      goal.responsibleDisciplines.forEach(d => disciplines.add(d));
    });
    
    carePlan.interventions.forEach(intervention => {
      intervention.responsibleDisciplines.forEach(d => disciplines.add(d));
    });
    
    return Array.from(disciplines);
  }

  /**
   * Get goals for a specific problem
   */
  getGoalsForProblem(carePlan: CarePlan, problemId: string): Goal[] {
    return carePlan.goals.filter(g => g.problemId === problemId);
  }

  /**
   * Get interventions for a specific goal
   */
  getInterventionsForGoal(carePlan: CarePlan, goalId: string): Intervention[] {
    return carePlan.interventions.filter(i => i.goalId === goalId);
  }

  /**
   * Check if care plan needs review
   */
  needsReview(carePlan: CarePlan, daysThreshold: number = 30): boolean {
    if (!carePlan.lastReviewedDate) return true;
    
    const lastReview = new Date(carePlan.lastReviewedDate);
    const daysSinceReview = Math.floor((Date.now() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceReview >= daysThreshold;
  }

  /**
   * Create revision record
   */
  createRevision(
    carePlan: CarePlan,
    revisedBy: string,
    reason: string,
    changes: Partial<CarePlanRevision>
  ): CarePlanRevision {
    return {
      id: `rev-${Date.now()}`,
      carePlanId: carePlan.id,
      revisionNumber: carePlan.version + 1,
      revisionDate: new Date().toISOString(),
      revisedBy,
      reason,
      changesSummary: changes.changesSummary || '',
      problemsAdded: changes.problemsAdded || [],
      problemsRemoved: changes.problemsRemoved || [],
      goalsAdded: changes.goalsAdded || [],
      goalsModified: changes.goalsModified || [],
      goalsDiscontinued: changes.goalsDiscontinued || [],
      interventionsAdded: changes.interventionsAdded || [],
      interventionsModified: changes.interventionsModified || [],
      interventionsDiscontinued: changes.interventionsDiscontinued || [],
    };
  }
}

// Singleton instance
export const carePlanService = new CarePlanService();

// ═══════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export const MOCK_CARE_PLAN: CarePlan = {
  id: 'cp-001',
  admissionId: 'adm-12345',
  patientId: 'pat-334455',
  version: 2,
  status: 'active',
  
  createdDate: '2024-03-01T08:00:00Z',
  createdBy: 'Jennifer Lee, RN',
  lastModifiedDate: '2024-03-10T14:30:00Z',
  lastModifiedBy: 'Jennifer Lee, RN',
  effectiveDate: '2024-03-01T08:00:00Z',
  
  approvedBy: 'Dr. Sarah Johnson',
  approvedDate: '2024-03-01T16:00:00Z',
  physicianReviewDate: '2024-03-01T15:30:00Z',
  physicianName: 'Dr. Sarah Johnson',
  
  lastReviewedDate: '2024-03-10T14:30:00Z',
  nextReviewDate: '2024-03-24T00:00:00Z',
  
  problems: [
    {
      id: 'prob-001',
      carePlanId: 'cp-001',
      name: 'Congestive Heart Failure',
      description: 'Chronic CHF with recent exacerbation requiring home health services',
      icd10Code: 'I50.9',
      icd10Description: 'Heart failure, unspecified',
      severity: 'high',
      isPrimary: true,
      status: 'active',
      identifiedDate: '2024-03-01T08:00:00Z',
      relatedGoalIds: ['goal-001', 'goal-002'],
      relatedInterventionIds: ['int-001', 'int-002', 'int-003'],
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
    },
    {
      id: 'prob-002',
      carePlanId: 'cp-001',
      name: 'Impaired Mobility',
      description: 'Decreased mobility due to deconditioning and CHF symptoms',
      icd10Code: 'M62.81',
      icd10Description: 'Muscle weakness',
      severity: 'medium',
      isPrimary: false,
      status: 'active',
      identifiedDate: '2024-03-01T08:00:00Z',
      relatedGoalIds: ['goal-003'],
      relatedInterventionIds: ['int-004', 'int-005'],
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
    },
    {
      id: 'prob-003',
      carePlanId: 'cp-001',
      name: 'Knowledge Deficit - Medication Management',
      description: 'Patient requires education on new medication regimen',
      severity: 'medium',
      isPrimary: false,
      status: 'active',
      identifiedDate: '2024-03-01T08:00:00Z',
      relatedGoalIds: ['goal-004'],
      relatedInterventionIds: ['int-006'],
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
    },
  ],
  
  goals: [
    {
      id: 'goal-001',
      carePlanId: 'cp-001',
      problemId: 'prob-001',
      name: 'Improve Cardiac Function',
      description: 'Patient will demonstrate improved cardiac function as evidenced by decreased dyspnea and edema',
      measurableCriteria: 'Reduction in dyspnea from 3/10 to 1/10 on exertion; Reduction in lower extremity edema from 3+ to trace',
      targetValue: 'Dyspnea ≤1/10, Edema ≤trace',
      startDate: '2024-03-01T00:00:00Z',
      targetDate: '2024-04-01T00:00:00Z',
      status: 'active',
      progressPercentage: 65,
      progressNotes: 'Patient showing improvement. Dyspnea now 2/10, edema reduced to 2+',
      responsibleDisciplines: ['skilled-nursing', 'physical-therapy'],
      primaryDiscipline: 'skilled-nursing',
      relatedInterventionIds: ['int-001', 'int-002'],
      barriers: ['Patient compliance with fluid restriction', 'Weather affecting mobility'],
      facilitators: ['Supportive family', 'Motivated patient'],
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
      lastReviewedDate: '2024-03-10T14:30:00Z',
    },
    {
      id: 'goal-002',
      carePlanId: 'cp-001',
      problemId: 'prob-001',
      name: 'Stable Vital Signs',
      description: 'Patient will maintain vital signs within normal limits',
      measurableCriteria: 'Blood pressure 120-140/70-90, Heart rate 60-100, SpO2 >92%',
      targetValue: 'All vital signs within target ranges',
      startDate: '2024-03-01T00:00:00Z',
      targetDate: '2024-03-15T00:00:00Z',
      status: 'met',
      progressPercentage: 100,
      progressNotes: 'Vital signs have been stable for 7 days',
      achievedDate: '2024-03-12T00:00:00Z',
      responsibleDisciplines: ['skilled-nursing'],
      primaryDiscipline: 'skilled-nursing',
      relatedInterventionIds: ['int-001', 'int-003'],
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
      lastReviewedDate: '2024-03-12T10:00:00Z',
    },
    {
      id: 'goal-003',
      carePlanId: 'cp-001',
      problemId: 'prob-002',
      name: 'Improve Functional Mobility',
      description: 'Patient will ambulate 50 feet with walker independently',
      measurableCriteria: 'Ambulate 50 feet with standard walker without assistance',
      targetValue: '50 feet independent ambulation',
      startDate: '2024-03-02T00:00:00Z',
      targetDate: '2024-04-02T00:00:00Z',
      status: 'active',
      progressPercentage: 40,
      progressNotes: 'Currently ambulating 30 feet with walker and minimal assistance',
      responsibleDisciplines: ['physical-therapy'],
      primaryDiscipline: 'physical-therapy',
      relatedInterventionIds: ['int-004', 'int-005'],
      barriers: ['Patient fatigue', 'Fear of falling'],
      facilitators: ['Motivated to regain independence'],
      createdBy: 'Michael Chen, PT',
      createdDate: '2024-03-02T08:00:00Z',
      lastReviewedDate: '2024-03-10T14:30:00Z',
    },
    {
      id: 'goal-004',
      carePlanId: 'cp-001',
      problemId: 'prob-003',
      name: 'Medication Knowledge',
      description: 'Patient will verbalize understanding of medication regimen',
      measurableCriteria: 'Patient can name all medications, explain purpose, and state correct dosing schedule',
      targetValue: '100% accuracy on medication teach-back',
      startDate: '2024-03-01T00:00:00Z',
      targetDate: '2024-03-15T00:00:00Z',
      status: 'partially-met',
      progressPercentage: 75,
      progressNotes: 'Patient understands purpose and dosing but needs review on side effects',
      responsibleDisciplines: ['skilled-nursing'],
      primaryDiscipline: 'skilled-nursing',
      relatedInterventionIds: ['int-006'],
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
      lastReviewedDate: '2024-03-10T14:30:00Z',
    },
  ],
  
  interventions: [
    {
      id: 'int-001',
      carePlanId: 'cp-001',
      goalId: 'goal-001',
      problemId: 'prob-001',
      name: 'Skilled Nursing Assessment',
      description: 'Comprehensive cardiovascular assessment including vital signs, lung sounds, edema assessment',
      instructions: 'Monitor BP, HR, RR, SpO2, lung sounds, peripheral edema, weight',
      frequency: '3 times per week',
      duration: '45 minutes',
      responsibleDisciplines: ['skilled-nursing'],
      primaryDiscipline: 'skilled-nursing',
      startDate: '2024-03-01T00:00:00Z',
      status: 'active',
      completedCount: 12,
      totalPlannedCount: 24,
      precautions: ['Monitor for signs of decompensation', 'Report weight gain >2 lbs in 24 hours'],
      requiresPatientTeaching: true,
      teachingCompleted: true,
      teachingDate: '2024-03-02T00:00:00Z',
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
      lastPerformedDate: '2024-03-13T10:00:00Z',
      lastPerformedBy: 'Jennifer Lee, RN',
    },
    {
      id: 'int-002',
      carePlanId: 'cp-001',
      goalId: 'goal-001',
      problemId: 'prob-001',
      name: 'Medication Management',
      description: 'Monitor medication compliance and effectiveness, educate on cardiac medications',
      instructions: 'Review med list, check compliance, assess for side effects, provide education',
      frequency: '3 times per week',
      duration: '20 minutes',
      responsibleDisciplines: ['skilled-nursing'],
      primaryDiscipline: 'skilled-nursing',
      startDate: '2024-03-01T00:00:00Z',
      status: 'active',
      completedCount: 12,
      totalPlannedCount: 24,
      requiresPatientTeaching: true,
      teachingCompleted: true,
      teachingDate: '2024-03-01T00:00:00Z',
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
      lastPerformedDate: '2024-03-13T10:15:00Z',
      lastPerformedBy: 'Jennifer Lee, RN',
    },
    {
      id: 'int-003',
      carePlanId: 'cp-001',
      goalId: 'goal-002',
      problemId: 'prob-001',
      name: 'Vital Signs Monitoring',
      description: 'Daily vital signs monitoring and documentation',
      instructions: 'Take and record BP, HR, temp, RR, SpO2 daily',
      frequency: 'Daily',
      duration: '10 minutes',
      responsibleDisciplines: ['home-health-aide', 'skilled-nursing'],
      primaryDiscipline: 'skilled-nursing',
      startDate: '2024-03-01T00:00:00Z',
      status: 'active',
      requiresPatientTeaching: true,
      teachingCompleted: true,
      teachingDate: '2024-03-01T00:00:00Z',
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
    },
    {
      id: 'int-004',
      carePlanId: 'cp-001',
      goalId: 'goal-003',
      problemId: 'prob-002',
      name: 'Gait Training',
      description: 'Progressive gait training with walker',
      instructions: 'Ambulation training with walker, progress distance as tolerated, focus on safety',
      frequency: '3 times per week',
      duration: '30 minutes',
      responsibleDisciplines: ['physical-therapy'],
      primaryDiscipline: 'physical-therapy',
      startDate: '2024-03-02T00:00:00Z',
      status: 'active',
      completedCount: 10,
      totalPlannedCount: 24,
      precautions: ['Monitor vitals during activity', 'Fall risk - close supervision'],
      requiresPatientTeaching: true,
      teachingCompleted: true,
      teachingDate: '2024-03-02T00:00:00Z',
      createdBy: 'Michael Chen, PT',
      createdDate: '2024-03-02T08:00:00Z',
      lastPerformedDate: '2024-03-12T14:00:00Z',
      lastPerformedBy: 'Michael Chen, PT',
    },
    {
      id: 'int-005',
      carePlanId: 'cp-001',
      goalId: 'goal-003',
      problemId: 'prob-002',
      name: 'Therapeutic Exercise',
      description: 'Lower extremity strengthening exercises',
      instructions: 'Ankle pumps, quad sets, hip abduction, heel slides - 10 reps each, 2 sets',
      frequency: 'Daily',
      duration: '15 minutes',
      responsibleDisciplines: ['physical-therapy'],
      primaryDiscipline: 'physical-therapy',
      startDate: '2024-03-02T00:00:00Z',
      status: 'active',
      requiresPatientTeaching: true,
      teachingCompleted: true,
      teachingDate: '2024-03-02T00:00:00Z',
      createdBy: 'Michael Chen, PT',
      createdDate: '2024-03-02T08:00:00Z',
    },
    {
      id: 'int-006',
      carePlanId: 'cp-001',
      goalId: 'goal-004',
      problemId: 'prob-003',
      name: 'Medication Teaching',
      description: 'Comprehensive medication education including purpose, dosing, side effects',
      instructions: 'Teach medication purpose, dosing schedule, side effects, when to call MD',
      frequency: 'Each visit until independent',
      duration: '15 minutes',
      responsibleDisciplines: ['skilled-nursing'],
      primaryDiscipline: 'skilled-nursing',
      startDate: '2024-03-01T00:00:00Z',
      status: 'active',
      requiresPatientTeaching: true,
      teachingCompleted: false,
      createdBy: 'Jennifer Lee, RN',
      createdDate: '2024-03-01T08:00:00Z',
      lastPerformedDate: '2024-03-13T10:30:00Z',
      lastPerformedBy: 'Jennifer Lee, RN',
    },
  ],
};
