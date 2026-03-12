/**
 * Credential Mock Data Generator
 * 
 * Generates realistic mock data for credential management testing.
 */

import type {
  Credential,
  CredentialAlert,
  ComplianceDashboardData,
  CaregiverCredentialSummary,
} from './credentialTypes';
import {
  getDaysUntilExpiration,
  canCaregiverBeScheduled,
  getComplianceStatus,
} from './credentialTypes';

export function generateMockCredentials(caregiverId: string): Credential[] {
  const now = new Date();

  return [
    {
      id: 'cred-1',
      caregiverId,
      credentialType: 'professional-license',
      credentialNumber: 'RN123456',
      issuingAuthority: 'Massachusetts Board of Nursing',
      issueDate: '2020-06-15',
      expirationDate: '2025-06-15',
      status: 'active',
      documentUrl: '/docs/rn-license.pdf',
      documentName: 'RN License - Massachusetts',
      uploadDate: '2024-01-15',
      verificationDate: '2024-01-15',
      required: true,
    },
    {
      id: 'cred-2',
      caregiverId,
      credentialType: 'cpr-certification',
      credentialNumber: 'BLS-789456',
      issuingAuthority: 'American Heart Association',
      issueDate: '2023-06-01',
      expirationDate: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(),
      status: 'expiring-soon',
      documentUrl: '/docs/bls-cert.pdf',
      documentName: 'BLS Certification',
      uploadDate: '2023-06-01',
      required: true,
      renewalReminderSent: true,
    },
    {
      id: 'cred-3',
      caregiverId,
      credentialType: 'background-check',
      issuingAuthority: 'State Background Check Division',
      issueDate: '2024-01-10',
      expirationDate: '2025-01-10',
      status: 'active',
      documentUrl: '/docs/background-check.pdf',
      documentName: 'Background Check Report',
      uploadDate: '2024-01-10',
      required: true,
    },
    {
      id: 'cred-4',
      caregiverId,
      credentialType: 'tb-test',
      issuingAuthority: 'Occupational Health Services',
      issueDate: '2024-01-05',
      expirationDate: '2025-01-05',
      status: 'active',
      documentUrl: '/docs/tb-test.pdf',
      documentName: 'TB Test Results',
      uploadDate: '2024-01-05',
      required: true,
    },
    {
      id: 'cred-5',
      caregiverId,
      credentialType: 'drivers-license',
      credentialNumber: 'MA-DL-987654',
      issuingAuthority: 'Massachusetts RMV',
      issueDate: '2021-03-15',
      expirationDate: '2026-03-15',
      status: 'active',
      required: false,
    },
  ];
}

export function generateMockAlerts(): CredentialAlert[] {
  const now = new Date();

  return [
    {
      id: 'alert-1',
      credentialId: 'cred-2',
      caregiverId: 'caregiver-001',
      caregiverName: 'Sarah Johnson, RN',
      credentialType: 'cpr-certification',
      alertTiming: '30-days',
      severity: 'high',
      expirationDate: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(),
      daysUntilExpiration: 28,
      message: 'BLS certification expires in 28 days. Schedule renewal to maintain scheduling eligibility.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert-2',
      credentialId: 'cred-6',
      caregiverId: 'caregiver-002',
      caregiverName: 'Michael Chen, PT',
      credentialType: 'professional-license',
      alertTiming: 'expired',
      severity: 'critical',
      expirationDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      daysUntilExpiration: -15,
      message: 'PT License has expired. Caregiver cannot be scheduled until renewed.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'alert-3',
      credentialId: 'cred-7',
      caregiverId: 'caregiver-003',
      caregiverName: 'Emily Rodriguez, OT',
      credentialType: 'background-check',
      alertTiming: '90-days',
      severity: 'info',
      expirationDate: new Date(now.getFullYear(), now.getMonth() + 3, 10).toISOString(),
      daysUntilExpiration: 85,
      message: 'Background check expires in 85 days. Plan for renewal.',
      createdAt: new Date().toISOString(),
      acknowledged: true,
      acknowledgedBy: 'HR Manager',
      acknowledgedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function generateMockComplianceDashboard(): ComplianceDashboardData {
  const now = new Date();

  const caregiverSummaries: CaregiverCredentialSummary[] = [
    {
      caregiverId: 'caregiver-001',
      caregiverName: 'Sarah Johnson',
      discipline: 'SN',
      office: 'Boston Main',
      totalCredentials: 5,
      activeCredentials: 4,
      expiringSoonCredentials: 1,
      expiredCredentials: 0,
      missingRequiredCredentials: [],
      complianceRate: 90,
      complianceStatus: 'at-risk',
      canBeScheduled: true,
      alerts: [],
    },
    {
      caregiverId: 'caregiver-002',
      caregiverName: 'Michael Chen',
      discipline: 'PT',
      office: 'Boston Main',
      totalCredentials: 4,
      activeCredentials: 3,
      expiringSoonCredentials: 0,
      expiredCredentials: 1,
      missingRequiredCredentials: ['Professional License'],
      complianceRate: 60,
      complianceStatus: 'non-compliant',
      canBeScheduled: false,
      alerts: [],
    },
    {
      caregiverId: 'caregiver-003',
      caregiverName: 'Emily Rodriguez',
      discipline: 'OT',
      office: 'Cambridge',
      totalCredentials: 5,
      activeCredentials: 5,
      expiringSoonCredentials: 0,
      expiredCredentials: 0,
      missingRequiredCredentials: [],
      complianceRate: 100,
      complianceStatus: 'compliant',
      canBeScheduled: true,
      alerts: [],
    },
    {
      caregiverId: 'caregiver-004',
      caregiverName: 'David Kim',
      discipline: 'ST',
      office: 'Boston Main',
      totalCredentials: 4,
      activeCredentials: 3,
      expiringSoonCredentials: 1,
      expiredCredentials: 0,
      missingRequiredCredentials: [],
      complianceRate: 85,
      complianceStatus: 'at-risk',
      canBeScheduled: true,
      alerts: [],
    },
    {
      caregiverId: 'caregiver-005',
      caregiverName: 'Lisa Thompson',
      discipline: 'MSW',
      office: 'Cambridge',
      totalCredentials: 3,
      activeCredentials: 3,
      expiringSoonCredentials: 0,
      expiredCredentials: 0,
      missingRequiredCredentials: ['CPR Certification'],
      complianceRate: 75,
      complianceStatus: 'non-compliant',
      canBeScheduled: false,
      alerts: [],
    },
    {
      caregiverId: 'caregiver-006',
      caregiverName: 'James Wilson',
      discipline: 'HHA',
      office: 'Somerville',
      totalCredentials: 4,
      activeCredentials: 4,
      expiringSoonCredentials: 0,
      expiredCredentials: 0,
      missingRequiredCredentials: [],
      complianceRate: 100,
      complianceStatus: 'compliant',
      canBeScheduled: true,
      alerts: [],
    },
  ];

  const expiringCredentials: Credential[] = [
    {
      id: 'exp-1',
      caregiverId: 'caregiver-001',
      credentialType: 'cpr-certification',
      credentialNumber: 'BLS-789456',
      issuingAuthority: 'American Heart Association',
      issueDate: '2023-06-01',
      expirationDate: new Date(now.getFullYear(), now.getMonth() + 1, 15).toISOString(),
      status: 'expiring-soon',
      required: true,
    },
    {
      id: 'exp-2',
      caregiverId: 'caregiver-004',
      credentialType: 'tb-test',
      issuingAuthority: 'Occupational Health',
      issueDate: '2024-02-10',
      expirationDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 20).toISOString(),
      status: 'expiring-soon',
      required: true,
    },
  ];

  const expiredCredentials: Credential[] = [
    {
      id: 'expired-1',
      caregiverId: 'caregiver-002',
      credentialType: 'professional-license',
      credentialNumber: 'PT-123456',
      issuingAuthority: 'State PT Board',
      issueDate: '2020-05-01',
      expirationDate: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      status: 'expired',
      required: true,
    },
  ];

  const totalCaregivers = caregiverSummaries.length;
  const compliantCaregivers = caregiverSummaries.filter(
    (c) => c.complianceStatus === 'compliant'
  ).length;
  const atRiskCaregivers = caregiverSummaries.filter(
    (c) => c.complianceStatus === 'at-risk'
  ).length;
  const nonCompliantCaregivers = caregiverSummaries.filter(
    (c) => c.complianceStatus === 'non-compliant'
  ).length;

  const totalCredentials = caregiverSummaries.reduce((sum, c) => sum + c.totalCredentials, 0);
  const activeCredentials = caregiverSummaries.reduce((sum, c) => sum + c.activeCredentials, 0);
  const expiringSoonCredentials = caregiverSummaries.reduce(
    (sum, c) => sum + c.expiringSoonCredentials,
    0
  );
  const expiredCredentialsCount = caregiverSummaries.reduce(
    (sum, c) => sum + c.expiredCredentials,
    0
  );

  return {
    metrics: {
      totalCaregivers,
      compliantCaregivers,
      atRiskCaregivers,
      nonCompliantCaregivers,
      totalCredentials,
      activeCredentials,
      expiringSoonCredentials,
      expiredCredentials: expiredCredentialsCount,
      overallComplianceRate: Math.round((compliantCaregivers / totalCaregivers) * 100),
      averageCredentialsPerCaregiver: totalCredentials / totalCaregivers,
    },
    caregiverSummaries,
    expiringCredentials,
    expiredCredentials,
    missingRequiredCertifications: [
      {
        caregiverId: 'caregiver-002',
        caregiverName: 'Michael Chen',
        discipline: 'PT',
        missingCredentials: ['Professional License'],
      },
      {
        caregiverId: 'caregiver-005',
        caregiverName: 'Lisa Thompson',
        discipline: 'MSW',
        missingCredentials: ['CPR Certification'],
      },
    ],
    recentAlerts: generateMockAlerts(),
    lastUpdated: new Date().toISOString(),
  };
}
