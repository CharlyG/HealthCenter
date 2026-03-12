/**
 * MonitorMockData — Realistic demo data for the PointOfCare Monitor.
 * This simulates what would come from the server via `pointOfCareGateway`.
 */
import type {
  MonitorVisit, EvvError, ConflictItem, MonitorMetrics,
} from './MonitorTypes';

const today = new Date().toISOString().split('T')[0];

export const MOCK_VISITS: MonitorVisit[] = [
  {
    id: 'mv-001', patientId: 'p-101', patientName: 'Garcia, Maria', patientMrn: 'MRN-4401',
    admissionId: 'adm-201', admissionLabel: 'HH-2026-0201', caregiverId: 'cg-301', caregiverName: 'Sarah Johnson, RN',
    discipline: 'SN', visitType: 'Skilled Nursing', scheduledDate: today, scheduledTime: '08:00',
    actualStartTime: '08:02', actualEndTime: '08:55',
    status: 'completed', evvStatus: 'transmitted', docStatus: 'completed', conflicts: [],
  },
  {
    id: 'mv-002', patientId: 'p-102', patientName: 'Thompson, Robert', patientMrn: 'MRN-4402',
    admissionId: 'adm-202', admissionLabel: 'HH-2026-0202', caregiverId: 'cg-302', caregiverName: 'Michael Chen, PT',
    discipline: 'PT', visitType: 'Physical Therapy', scheduledDate: today, scheduledTime: '09:00',
    actualStartTime: '09:05',
    status: 'in_progress', evvStatus: 'clocked_in', docStatus: 'pending', conflicts: [],
  },
  {
    id: 'mv-003', patientId: 'p-103', patientName: 'Williams, Dorothy', patientMrn: 'MRN-4403',
    admissionId: 'adm-203', admissionLabel: 'HH-2026-0203', caregiverId: 'cg-303', caregiverName: 'Lisa Martinez, OT',
    discipline: 'OT', visitType: 'Occupational Therapy', scheduledDate: today, scheduledTime: '10:00',
    status: 'scheduled', evvStatus: 'pending', docStatus: 'n/a', conflicts: [],
  },
  {
    id: 'mv-004', patientId: 'p-104', patientName: 'Brown, James', patientMrn: 'MRN-4404',
    admissionId: 'adm-204', admissionLabel: 'HH-2026-0204', caregiverId: 'cg-304', caregiverName: 'Angela Davis, HHA',
    discipline: 'HHA', visitType: 'Home Health Aide', scheduledDate: today, scheduledTime: '07:30',
    actualStartTime: '07:28',
    status: 'missing_clock_out', evvStatus: 'clocked_in', docStatus: 'pending',
    conflicts: ['missing_clock_out'],
  },
  {
    id: 'mv-005', patientId: 'p-105', patientName: 'Johnson, Helen', patientMrn: 'MRN-4405',
    admissionId: 'adm-205', admissionLabel: 'HH-2026-0205', caregiverId: 'cg-301', caregiverName: 'Sarah Johnson, RN',
    discipline: 'SN', visitType: 'Skilled Nursing', scheduledDate: today, scheduledTime: '10:30',
    actualStartTime: '10:25', actualEndTime: '11:30',
    status: 'completed', evvStatus: 'evv_error', docStatus: 'completed',
    conflicts: [],
  },
  {
    id: 'mv-006', patientId: 'p-106', patientName: 'Davis, Patricia', patientMrn: 'MRN-4406',
    admissionId: 'adm-206', admissionLabel: 'HH-2026-0206', caregiverId: 'cg-305', caregiverName: 'David Wilson, SLP',
    discipline: 'ST', visitType: 'Speech Therapy', scheduledDate: today, scheduledTime: '11:00',
    actualStartTime: '11:10', actualEndTime: '12:00',
    status: 'completed', evvStatus: 'transmitted', docStatus: 'in_progress', conflicts: [],
  },
  {
    id: 'mv-007', patientId: 'p-107', patientName: 'Miller, Richard', patientMrn: 'MRN-4407',
    admissionId: 'adm-207', admissionLabel: 'HH-2026-0207', caregiverId: 'cg-302', caregiverName: 'Michael Chen, PT',
    discipline: 'PT', visitType: 'Physical Therapy', scheduledDate: today, scheduledTime: '09:15',
    status: 'scheduled', evvStatus: 'pending', docStatus: 'n/a',
    conflicts: ['overlapping_visits'],
  },
  {
    id: 'mv-008', patientId: 'p-108', patientName: 'Wilson, Margaret', patientMrn: 'MRN-4408',
    admissionId: 'adm-208', admissionLabel: 'HH-2026-0208', caregiverId: 'cg-306', caregiverName: 'Jennifer Lee, RN',
    discipline: 'SN', visitType: 'Skilled Nursing', scheduledDate: today, scheduledTime: '13:00',
    actualStartTime: '13:05', actualEndTime: '14:00',
    status: 'completed', evvStatus: 'evv_error', docStatus: 'completed', conflicts: [],
  },
  {
    id: 'mv-009', patientId: 'p-109', patientName: 'Anderson, Charles', patientMrn: 'MRN-4409',
    admissionId: 'adm-209', admissionLabel: 'HH-2026-0209', caregiverId: 'cg-307', caregiverName: 'Robert Taylor, MSW',
    discipline: 'MSW', visitType: 'Medical Social Work', scheduledDate: today, scheduledTime: '14:00',
    status: 'scheduled', evvStatus: 'pending', docStatus: 'n/a',
    conflicts: ['authorization_conflict'], authorizationRemaining: 0,
  },
  {
    id: 'mv-010', patientId: 'p-110', patientName: 'Taylor, Elizabeth', patientMrn: 'MRN-4410',
    admissionId: 'adm-210', admissionLabel: 'HH-2026-0210', caregiverId: 'cg-304', caregiverName: 'Angela Davis, HHA',
    discipline: 'HHA', visitType: 'Home Health Aide', scheduledDate: today, scheduledTime: '15:00',
    status: 'scheduled', evvStatus: 'pending', docStatus: 'n/a',
    conflicts: ['unscheduled_visit'],
  },
  {
    id: 'mv-011', patientId: 'p-111', patientName: 'Moore, William', patientMrn: 'MRN-4411',
    admissionId: 'adm-211', admissionLabel: 'HH-2026-0211', caregiverId: 'cg-301', caregiverName: 'Sarah Johnson, RN',
    discipline: 'SN', visitType: 'Skilled Nursing', scheduledDate: today, scheduledTime: '14:30',
    actualStartTime: '14:35', actualEndTime: '15:25',
    status: 'completed', evvStatus: 'transmitted', docStatus: 'completed', conflicts: [],
  },
  {
    id: 'mv-012', patientId: 'p-112', patientName: 'Jackson, Barbara', patientMrn: 'MRN-4412',
    admissionId: 'adm-212', admissionLabel: 'HH-2026-0212', caregiverId: 'cg-303', caregiverName: 'Lisa Martinez, OT',
    discipline: 'OT', visitType: 'Occupational Therapy', scheduledDate: today, scheduledTime: '13:30',
    actualStartTime: '13:28', actualEndTime: '14:25',
    status: 'completed', evvStatus: 'evv_error', docStatus: 'in_progress', conflicts: [],
  },
];

export const MOCK_EVV_ERRORS: EvvError[] = [
  {
    id: 'evv-err-001',
    visit: MOCK_VISITS.find(v => v.id === 'mv-005')!,
    errorCode: 'EVV-101',
    errorDescription: 'GPS coordinates outside patient service address radius (1.2 mi from registered address)',
    suggestedFix: 'Verify visit occurred at an alternate approved location, or update patient address if they moved.',
    severity: 'high',
    occurredAt: `${today}T11:35:00Z`,
    retryCount: 1,
  },
  {
    id: 'evv-err-002',
    visit: MOCK_VISITS.find(v => v.id === 'mv-008')!,
    errorCode: 'EVV-203',
    errorDescription: 'Clock-out time exceeds authorized visit duration by 45 minutes (auth: 60min, actual: 105min)',
    suggestedFix: 'Adjust clock-out time to match authorized duration, or request authorization extension.',
    severity: 'medium',
    occurredAt: `${today}T14:05:00Z`,
    retryCount: 0,
  },
  {
    id: 'evv-err-003',
    visit: MOCK_VISITS.find(v => v.id === 'mv-012')!,
    errorCode: 'EVV-305',
    errorDescription: 'Caregiver certification expired. License renewal date was 03/01/2026.',
    suggestedFix: 'Reassign visit to a caregiver with current certification, or verify license renewal was submitted.',
    severity: 'high',
    occurredAt: `${today}T14:30:00Z`,
    retryCount: 2,
  },
];

export const MOCK_CONFLICTS: ConflictItem[] = [
  {
    id: 'conf-001',
    type: 'missing_clock_out',
    severity: 'critical',
    description: 'Angela Davis, HHA clocked in for Brown, James at 07:28 but has not clocked out after 6+ hours.',
    visits: [MOCK_VISITS.find(v => v.id === 'mv-004')!],
    suggestedAction: 'Contact caregiver to confirm visit status and clock out.',
  },
  {
    id: 'conf-002',
    type: 'overlapping_visits',
    severity: 'warning',
    description: 'Michael Chen, PT is scheduled for Thompson, Robert at 09:00 and Miller, Richard at 09:15 — overlapping time slots.',
    visits: [MOCK_VISITS.find(v => v.id === 'mv-002')!, MOCK_VISITS.find(v => v.id === 'mv-007')!],
    suggestedAction: 'Reschedule one visit or reassign to another PT caregiver.',
  },
  {
    id: 'conf-003',
    type: 'authorization_conflict',
    severity: 'critical',
    description: 'Anderson, Charles has 0 authorized MSW visits remaining. Next visit requires new authorization.',
    visits: [MOCK_VISITS.find(v => v.id === 'mv-009')!],
    suggestedAction: 'Request authorization extension before visit occurs.',
  },
  {
    id: 'conf-004',
    type: 'unscheduled_visit',
    severity: 'warning',
    description: 'Taylor, Elizabeth HHA visit at 15:00 was not on the original schedule. May need scheduling coordinator approval.',
    visits: [MOCK_VISITS.find(v => v.id === 'mv-010')!],
    suggestedAction: 'Confirm with scheduling coordinator and add to official schedule.',
  },
];

export function computeMetrics(visits: MonitorVisit[]): MonitorMetrics {
  const completed = visits.filter(v => v.status === 'completed').length;
  const evvTransmitted = visits.filter(v => v.evvStatus === 'transmitted' || v.evvStatus === 'verified').length;
  const evvErrors = visits.filter(v => v.evvStatus === 'evv_error' || v.evvStatus === 'exception').length;
  const total = visits.length;

  return {
    totalVisits: total,
    scheduled: visits.filter(v => v.status === 'scheduled').length,
    inProgress: visits.filter(v => v.status === 'in_progress').length,
    completed,
    missingClockOut: visits.filter(v => v.status === 'missing_clock_out' || v.conflicts.includes('missing_clock_out')).length,
    evvTransmitted,
    evvErrors,
    conflictCount: visits.filter(v => v.conflicts.length > 0).length,
    complianceRate: completed > 0 ? Math.round((evvTransmitted / completed) * 100) : 100,
  };
}

export const AVAILABLE_CAREGIVERS = [
  { id: 'cg-301', name: 'Sarah Johnson, RN', discipline: 'SN', available: true },
  { id: 'cg-302', name: 'Michael Chen, PT', discipline: 'PT', available: false },
  { id: 'cg-303', name: 'Lisa Martinez, OT', discipline: 'OT', available: true },
  { id: 'cg-304', name: 'Angela Davis, HHA', discipline: 'HHA', available: false },
  { id: 'cg-305', name: 'David Wilson, SLP', discipline: 'ST', available: true },
  { id: 'cg-306', name: 'Jennifer Lee, RN', discipline: 'SN', available: true },
  { id: 'cg-307', name: 'Robert Taylor, MSW', discipline: 'MSW', available: true },
  { id: 'cg-308', name: 'Karen White, PT', discipline: 'PT', available: true },
  { id: 'cg-309', name: 'James Brown, HHA', discipline: 'HHA', available: true },
];
