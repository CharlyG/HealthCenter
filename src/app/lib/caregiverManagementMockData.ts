/**
 * Caregiver Management Mock Data
 * 
 * Generates realistic mock data for all caregiver management modules.
 */

import type {
  CaregiverManagementData,
  CaregiverDiscipline,
  CaregiverAvailability,
  CaregiverDocument,
  TrainingRecord,
  TrainingAlert,
  WorkloadMetrics,
  WorkloadAlert,
  CaregiverActivity,
  SchedulingValidationResult,
} from './caregiverManagementTypes';

export function generateMockCaregiverManagementData(): CaregiverManagementData {
  const now = new Date();

  return {
    caregiverId: 'caregiver-001',
    caregiverName: 'Sarah Johnson, RN',
    disciplines: generateMockDisciplines(),
    availability: generateMockAvailability(),
    documents: generateMockDocuments(),
    training: generateMockTraining(),
    workload: generateMockWorkload(),
    activities: generateMockActivities(),
    validationStatus: generateMockValidation(true),
  };
}

function generateMockDisciplines(): CaregiverDiscipline[] {
  return [
    {
      discipline: 'SN',
      isPrimary: true,
      certifiedDate: '2012-06-01',
      specializations: ['Wound Care', 'Diabetes Management', 'Post-Op Care'],
      yearsExperience: 12,
    },
    {
      discipline: 'HHA',
      isPrimary: false,
      certifiedDate: '2015-03-01',
      specializations: [],
      yearsExperience: 8,
    },
  ];
}

function generateMockAvailability(): CaregiverAvailability {
  return {
    caregiverId: 'caregiver-001',
    weeklySchedule: [
      { dayOfWeek: 1, isAvailable: true, startTime: '08:00', endTime: '17:00', maxVisits: 7 },
      { dayOfWeek: 2, isAvailable: true, startTime: '08:00', endTime: '17:00', maxVisits: 7 },
      { dayOfWeek: 3, isAvailable: true, startTime: '08:00', endTime: '17:00', maxVisits: 7 },
      { dayOfWeek: 4, isAvailable: true, startTime: '08:00', endTime: '17:00', breakStartTime: '12:00', breakEndTime: '13:00', maxVisits: 6 },
      { dayOfWeek: 5, isAvailable: true, startTime: '08:00', endTime: '14:00', maxVisits: 5 },
    ],
    maxVisitsPerDay: 7,
    maxVisitsPerWeek: 35,
    preferredGeographicAreas: [
      { territory: 'Downtown Boston', travelRadiusMiles: 25 },
      { city: 'Cambridge', travelRadiusMiles: 15 },
      { zipCode: '02101', travelRadiusMiles: 10 },
    ],
    restrictions: ['No overnight shifts', 'No weekends'],
    notes: 'Prefers morning starts. Available for on-call rotation on weekdays.',
    effectiveDate: '2024-01-01',
    lastUpdated: new Date().toISOString(),
  };
}

function generateMockDocuments(): CaregiverDocument[] {
  const now = new Date();

  return [
    {
      id: 'doc-1',
      caregiverId: 'caregiver-001',
      documentName: 'RN License - Massachusetts',
      documentType: 'Professional License',
      category: 'credential',
      uploadDate: '2024-01-15',
      uploadedBy: 'HR Department',
      expirationDate: '2025-06-15',
      status: 'active',
      fileUrl: '/documents/rn-license.pdf',
      fileSize: 245760,
      mimeType: 'application/pdf',
      tags: ['license', 'nursing', 'massachusetts'],
    },
    {
      id: 'doc-2',
      caregiverId: 'caregiver-001',
      documentName: 'BLS Certification Card',
      documentType: 'CPR Certification',
      category: 'training',
      uploadDate: '2023-06-01',
      uploadedBy: 'Sarah Johnson',
      expirationDate: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(),
      status: 'expiring-soon',
      fileUrl: '/documents/bls-cert.pdf',
      fileSize: 153600,
      mimeType: 'application/pdf',
      previewUrl: '/previews/bls-cert.jpg',
      tags: ['certification', 'cpr', 'bls'],
    },
    {
      id: 'doc-3',
      caregiverId: 'caregiver-001',
      documentName: 'Employment Contract 2024',
      documentType: 'Employment Agreement',
      category: 'employment',
      uploadDate: '2024-01-01',
      uploadedBy: 'HR Department',
      status: 'active',
      fileUrl: '/documents/employment-contract.pdf',
      fileSize: 524288,
      mimeType: 'application/pdf',
      tags: ['employment', 'contract', '2024'],
    },
    {
      id: 'doc-4',
      caregiverId: 'caregiver-001',
      documentName: 'Background Check Report',
      documentType: 'Background Screening',
      category: 'background-check',
      uploadDate: '2024-01-10',
      uploadedBy: 'Screening Services Inc',
      expirationDate: '2025-01-10',
      status: 'active',
      fileUrl: '/documents/background-check.pdf',
      fileSize: 327680,
      mimeType: 'application/pdf',
      tags: ['background-check', 'screening', 'compliance'],
    },
  ];
}

function generateMockTraining(): TrainingRecord[] {
  const now = new Date();

  return [
    {
      id: 'train-1',
      caregiverId: 'caregiver-001',
      trainingName: 'Infection Control Best Practices',
      category: 'infection-control',
      completionDate: '2024-01-15',
      expirationDate: '2025-01-15',
      status: 'completed',
      provider: 'Healthcare Training Institute',
      hours: 4,
      certificateUrl: '/certificates/infection-control.pdf',
      required: true,
    },
    {
      id: 'train-2',
      caregiverId: 'caregiver-001',
      trainingName: 'HIPAA Compliance Training',
      category: 'hipaa',
      completionDate: '2024-02-01',
      expirationDate: '2025-02-01',
      status: 'completed',
      provider: 'Compliance Training Solutions',
      hours: 2,
      certificateUrl: '/certificates/hipaa.pdf',
      required: true,
    },
    {
      id: 'train-3',
      caregiverId: 'caregiver-001',
      trainingName: 'Advanced Wound Care',
      category: 'clinical-protocol',
      completionDate: '2023-11-10',
      expirationDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20).toISOString(),
      status: 'expiring-soon',
      provider: 'Clinical Education Center',
      hours: 8,
      certificateUrl: '/certificates/wound-care.pdf',
      required: false,
    },
    {
      id: 'train-4',
      caregiverId: 'caregiver-001',
      trainingName: 'Workplace Safety',
      category: 'safety',
      expirationDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      status: 'overdue',
      provider: 'Safety Training Services',
      hours: 3,
      required: true,
    },
  ];
}

export function generateMockTrainingAlerts(): TrainingAlert[] {
  return [
    {
      trainingId: 'train-3',
      caregiverId: 'caregiver-001',
      caregiverName: 'Sarah Johnson, RN',
      trainingName: 'Advanced Wound Care',
      alertType: 'expiring-soon',
      daysUntilExpiration: 20,
      expirationDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      severity: 'medium',
    },
    {
      trainingId: 'train-4',
      caregiverId: 'caregiver-001',
      caregiverName: 'Sarah Johnson, RN',
      trainingName: 'Workplace Safety',
      alertType: 'overdue',
      daysOverdue: 15,
      severity: 'critical',
    },
  ];
}

function generateMockWorkload(): WorkloadMetrics {
  return {
    caregiverId: 'caregiver-001',
    caregiverName: 'Sarah Johnson, RN',
    currentWeek: {
      scheduledVisits: 28,
      completedVisits: 22,
      cancelledVisits: 2,
      averageVisitsPerDay: 5.6,
      totalHours: 38,
      totalMileage: 145,
    },
    monthToDate: {
      scheduledVisits: 98,
      completedVisits: 85,
      averageVisitsPerWeek: 24.5,
      totalHours: 152,
    },
    utilizationRate: 85,
    workloadStatus: 'optimal',
    burnoutRisk: 'low',
    trend: 'stable',
  };
}

export function generateMockWorkloadAlerts(): WorkloadAlert[] {
  return [
    {
      caregiverId: 'caregiver-001',
      caregiverName: 'Sarah Johnson, RN',
      alertType: 'high-workload',
      severity: 'warning',
      message: 'Approaching maximum weekly visit capacity',
      metrics: {
        current: 28,
        threshold: 35,
        unit: 'visits',
      },
      recommendations: [
        'Consider redistributing some visits to other available caregivers',
        'Monitor for signs of fatigue or stress',
      ],
    },
  ];
}

function generateMockActivities(): CaregiverActivity[] {
  const now = new Date();

  return [
    {
      id: 'act-1',
      caregiverId: 'caregiver-001',
      activityType: 'visit-completed',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      title: 'Visit Completed',
      description: 'Completed skilled nursing visit for Margaret Johnson',
      relatedEntityId: 'visit-445',
      relatedEntityType: 'visit',
    },
    {
      id: 'act-2',
      caregiverId: 'caregiver-001',
      activityType: 'documentation-submitted',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      title: 'Documentation Submitted',
      description: 'Submitted visit note for QA review',
      relatedEntityId: 'doc-VN-445',
      relatedEntityType: 'document',
      performedBy: 'Sarah Johnson',
    },
    {
      id: 'act-3',
      caregiverId: 'caregiver-001',
      activityType: 'training-completed',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      title: 'Training Completed',
      description: 'Completed HIPAA Compliance Training',
      relatedEntityId: 'train-2',
      relatedEntityType: 'training',
    },
    {
      id: 'act-4',
      caregiverId: 'caregiver-001',
      activityType: 'credential-updated',
      timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Credential Updated',
      description: 'RN License renewed for 2 years',
      relatedEntityId: 'cred-1',
      relatedEntityType: 'credential',
      performedBy: 'HR Department',
    },
    {
      id: 'act-5',
      caregiverId: 'caregiver-001',
      activityType: 'visit-scheduled',
      timestamp: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      title: 'Visit Scheduled',
      description: 'Scheduled for 5 visits this week',
      performedBy: 'Scheduling Team',
    },
  ];
}

export function generateMockValidation(canBeAssigned: boolean): SchedulingValidationResult {
  if (canBeAssigned) {
    return {
      canBeAssigned: true,
      disciplineMatch: true,
      credentialValid: true,
      trainingCurrent: true,
      availabilityMatch: true,
      workloadCapacity: true,
      warnings: [
        {
          type: 'expiring-credential',
          message: 'BLS certification expires in 28 days',
          severity: 'medium',
        },
        {
          type: 'high-workload',
          message: 'Caregiver is approaching maximum weekly capacity (28/35 visits)',
          severity: 'low',
        },
      ],
      blockers: [],
    };
  } else {
    return {
      canBeAssigned: false,
      disciplineMatch: false,
      credentialValid: false,
      trainingCurrent: false,
      availabilityMatch: true,
      workloadCapacity: true,
      warnings: [],
      blockers: [
        {
          type: 'invalid-discipline',
          message: 'Caregiver discipline (SN) does not match visit requirement (PT)',
          requirement: 'Physical Therapy certification',
        },
        {
          type: 'expired-credential',
          message: 'RN License has expired',
          requirement: 'Valid RN License',
        },
        {
          type: 'missing-training',
          message: 'Workplace Safety training is overdue by 15 days',
          requirement: 'Current Workplace Safety training',
        },
      ],
    };
  }
}
