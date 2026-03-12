/**
 * Role-Aware Workspace Configurations
 * 
 * Pre-configured workspaces for different healthcare roles.
 * Each role has customized:
 * - Critical issues
 * - Today's tasks
 * - Quick actions
 * - Operational metrics
 */

import {
  User,
  FileText,
  Calendar,
  Phone,
  ClipboardCheck,
  Receipt,
  Users,
  Stethoscope,
  Heart,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle2,
  TrendingUp,
  Activity,
  Target,
  BarChart3,
  MessageSquare,
  Briefcase,
  Plus,
} from 'lucide-react';
import type { WorkspaceConfig } from './OperationalWorkspace';

// ==================== CLINICIAN WORKSPACE ====================

export const clinicianWorkspace: WorkspaceConfig = {
  role: 'clinician',
  displayName: 'Clinician Workspace',
  
  criticalIssues: [
    {
      id: 'c1',
      type: 'urgent',
      title: 'Late Visit - Requires Documentation',
      description: 'Visit with Mary Johnson completed 3 hours ago, documentation pending',
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      dueDate: new Date(Date.now() + 3600000).toISOString(),
      action: { label: 'Complete Documentation', path: '/clinical/visit-notes' },
      icon: FileText,
    },
    {
      id: 'c2',
      type: 'warning',
      title: 'OASIS Due Tomorrow',
      description: 'Recertification OASIS assessment due by end of day tomorrow',
      patientName: 'Smith, Robert',
      admissionId: 'ADM-2024-015',
      dueDate: new Date(Date.now() + 86400000).toISOString(),
      action: { label: 'Start Assessment', path: '/assessments' },
      icon: ClipboardCheck,
    },
  ],

  todayTasks: [
    {
      id: 't1',
      type: 'visit',
      title: 'Skilled Nursing Visit - Johnson, Mary',
      patientName: 'Johnson, Mary',
      scheduledTime: '9:00 AM',
      status: 'pending',
      priority: 'high',
      action: { label: 'Start Visit', path: '/poc/caregiver-field-app' },
    },
    {
      id: 't2',
      type: 'visit',
      title: 'Physical Therapy - Williams, David',
      patientName: 'Williams, David',
      scheduledTime: '11:00 AM',
      status: 'pending',
      priority: 'medium',
      action: { label: 'Start Visit', path: '/poc/caregiver-field-app' },
    },
    {
      id: 't3',
      type: 'assessment',
      title: 'OASIS SOC - Thompson, Sarah',
      patientName: 'Thompson, Sarah',
      scheduledTime: '2:00 PM',
      status: 'pending',
      priority: 'high',
      action: { label: 'Begin OASIS', path: '/assessments' },
    },
    {
      id: 't4',
      type: 'call',
      title: 'MD Call - Review Orders',
      patientName: 'Brown, James',
      scheduledTime: '3:30 PM',
      status: 'pending',
      priority: 'medium',
      action: { label: 'Make Call', path: '/clinical/verbal-orders' },
    },
  ],

  recentItems: [
    {
      id: 'r1',
      type: 'patient',
      title: 'Johnson, Mary',
      subtitle: 'CHF, Diabetes • Active',
      lastAccessed: new Date(Date.now() - 1800000).toISOString(),
      path: '/patient/001234/chart',
      metadata: { status: 'active', alerts: 1 },
    },
    {
      id: 'r2',
      type: 'visit',
      title: 'Visit #12345',
      subtitle: 'Williams, David • PT',
      lastAccessed: new Date(Date.now() - 3600000).toISOString(),
      path: '/poc/visit/12345',
    },
    {
      id: 'r3',
      type: 'document',
      title: 'Plan of Care',
      subtitle: 'Smith, Robert',
      lastAccessed: new Date(Date.now() - 7200000).toISOString(),
      path: '/clinical/plans-of-care',
    },
  ],

  quickActions: [
    {
      id: 'qa1',
      label: 'Start Visit',
      description: 'Begin patient visit',
      icon: Stethoscope,
      path: '/poc/caregiver-field-app',
      color: 'blue',
    },
    {
      id: 'qa2',
      label: 'OASIS',
      description: 'Start assessment',
      icon: ClipboardCheck,
      path: '/assessments',
      color: 'green',
    },
    {
      id: 'qa3',
      label: 'Visit Notes',
      description: 'Document visit',
      icon: FileText,
      path: '/clinical/visit-notes',
      color: 'purple',
    },
    {
      id: 'qa4',
      label: 'View Schedule',
      description: 'Today\'s visits',
      icon: Calendar,
      path: '/scheduling',
      color: 'orange',
    },
  ],

  metrics: [
    {
      id: 'm1',
      label: 'Visits Today',
      value: 4,
      target: 6,
      icon: Stethoscope,
      color: 'blue',
    },
    {
      id: 'm2',
      label: 'Documentation Rate',
      value: '92%',
      change: { value: 5, direction: 'up', isPositive: true },
      icon: CheckCircle2,
      color: 'green',
    },
    {
      id: 'm3',
      label: 'Pending Notes',
      value: 2,
      change: { value: 1, direction: 'down', isPositive: true },
      icon: FileText,
      color: 'orange',
    },
    {
      id: 'm4',
      label: 'Productivity',
      value: '95%',
      change: { value: 3, direction: 'up', isPositive: true },
      icon: TrendingUp,
      color: 'indigo',
    },
  ],
};

// ==================== BILLING SPECIALIST WORKSPACE ====================

export const billingWorkspace: WorkspaceConfig = {
  role: 'billing_specialist',
  displayName: 'Billing Workspace',

  criticalIssues: [
    {
      id: 'b1',
      type: 'urgent',
      title: 'Claim Rejection - Requires Action',
      description: 'Medicare claim rejected due to missing OASIS signature',
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      dueDate: new Date(Date.now() + 7200000).toISOString(),
      action: { label: 'Resolve Rejection', path: '/billing' },
      icon: AlertCircle,
    },
    {
      id: 'b2',
      type: 'error',
      title: 'Missing Authorization',
      description: 'Episode ready for billing but authorization not on file',
      patientName: 'Williams, David',
      admissionId: 'ADM-2024-015',
      action: { label: 'Upload Authorization', path: '/authorization-tracker' },
      icon: DollarSign,
    },
    {
      id: 'b3',
      type: 'warning',
      title: 'Episode Ending Soon',
      description: '5 episodes ending in next 3 days - prepare for billing',
      action: { label: 'Review Episodes', path: '/billing' },
      icon: Clock,
    },
  ],

  todayTasks: [
    {
      id: 't1',
      type: 'billing',
      title: 'Review Episode - ADM-2024-001',
      patientName: 'Johnson, Mary',
      scheduledTime: '9:00 AM',
      status: 'in_progress',
      priority: 'high',
      action: { label: 'Continue Review', path: '/billing' },
    },
    {
      id: 't2',
      type: 'billing',
      title: 'Submit Claims - Batch #45',
      scheduledTime: '11:00 AM',
      status: 'pending',
      priority: 'high',
      action: { label: 'Submit Claims', path: '/billing' },
    },
    {
      id: 't3',
      type: 'documentation',
      title: 'Address Documentation Holds',
      scheduledTime: '2:00 PM',
      status: 'pending',
      priority: 'medium',
      action: { label: 'View Holds', path: '/admission-queues' },
    },
  ],

  recentItems: [
    {
      id: 'r1',
      type: 'admission',
      title: 'ADM-2024-001 - Johnson, Mary',
      subtitle: 'Episode 1 • Day 55',
      lastAccessed: new Date(Date.now() - 900000).toISOString(),
      path: '/admissions/ADM-2024-001',
    },
    {
      id: 'r2',
      type: 'admission',
      title: 'ADM-2024-015 - Williams, David',
      subtitle: 'Episode 2 • Day 30',
      lastAccessed: new Date(Date.now() - 3600000).toISOString(),
      path: '/admissions/ADM-2024-015',
      metadata: { alerts: 2 },
    },
  ],

  quickActions: [
    {
      id: 'qa1',
      label: 'Ready for Billing',
      description: 'Process claims',
      icon: Receipt,
      path: '/billing',
      color: 'green',
    },
    {
      id: 'qa2',
      label: 'Holds Queue',
      description: 'Review holds',
      icon: AlertCircle,
      path: '/admission-queues',
      color: 'red',
    },
    {
      id: 'qa3',
      label: 'Claims Status',
      description: 'Track submissions',
      icon: BarChart3,
      path: '/billing',
      color: 'blue',
    },
    {
      id: 'qa4',
      label: 'Authorizations',
      description: 'Manage auth',
      icon: CheckCircle2,
      path: '/authorization-tracker',
      color: 'purple',
    },
  ],

  metrics: [
    {
      id: 'm1',
      label: 'Ready for Billing',
      value: 24,
      change: { value: 8, direction: 'up', isPositive: false },
      icon: Receipt,
      color: 'blue',
    },
    {
      id: 'm2',
      label: 'Clean Claim Rate',
      value: '94%',
      change: { value: 2, direction: 'up', isPositive: true },
      icon: CheckCircle2,
      color: 'green',
    },
    {
      id: 'm3',
      label: 'Avg Days to Bill',
      value: '3.2',
      unit: 'days',
      change: { value: 0.5, direction: 'down', isPositive: true },
      icon: Clock,
      color: 'orange',
    },
    {
      id: 'm4',
      label: 'Revenue at Risk',
      value: '$45K',
      change: { value: 12, direction: 'down', isPositive: true },
      icon: DollarSign,
      color: 'red',
    },
  ],
};

// ==================== SCHEDULER WORKSPACE ====================

export const schedulerWorkspace: WorkspaceConfig = {
  role: 'scheduler',
  displayName: 'Scheduler Workspace',

  criticalIssues: [
    {
      id: 's1',
      type: 'urgent',
      title: 'Unassigned Visits Today',
      description: '3 visits scheduled for today have no clinician assigned',
      action: { label: 'Assign Clinicians', path: '/scheduling' },
      icon: AlertCircle,
    },
    {
      id: 's2',
      type: 'warning',
      title: 'Frequency Violations',
      description: '5 patients at risk of frequency violations this week',
      action: { label: 'Review Schedules', path: '/scheduling' },
      icon: Calendar,
    },
  ],

  todayTasks: [
    {
      id: 't1',
      type: 'call',
      title: 'Confirm Visits - Johnson, Mary',
      patientName: 'Johnson, Mary',
      scheduledTime: '8:30 AM',
      status: 'completed',
      priority: 'high',
      action: { label: 'View Details', path: '/scheduling' },
    },
    {
      id: 't2',
      type: 'meeting',
      title: 'Weekly Scheduling Meeting',
      scheduledTime: '10:00 AM',
      status: 'pending',
      priority: 'medium',
      action: { label: 'Join Meeting', path: '/scheduling' },
    },
    {
      id: 't3',
      type: 'call',
      title: 'Schedule Next Week - 15 Patients',
      scheduledTime: '1:00 PM',
      status: 'pending',
      priority: 'high',
      action: { label: 'Build Schedule', path: '/scheduling' },
    },
  ],

  recentItems: [
    {
      id: 'r1',
      type: 'patient',
      title: 'Johnson, Mary',
      subtitle: 'RN 3x/week • PT 2x/week',
      lastAccessed: new Date(Date.now() - 600000).toISOString(),
      path: '/patient/001234/chart',
    },
    {
      id: 'r2',
      type: 'patient',
      title: 'Williams, David',
      subtitle: 'PT 3x/week',
      lastAccessed: new Date(Date.now() - 1800000).toISOString(),
      path: '/patient/002345/chart',
    },
  ],

  quickActions: [
    {
      id: 'qa1',
      label: 'Schedule Visit',
      description: 'Add new visit',
      icon: Plus,
      path: '/scheduling/new',
      color: 'blue',
    },
    {
      id: 'qa2',
      label: 'View Calendar',
      description: 'Weekly view',
      icon: Calendar,
      path: '/scheduling',
      color: 'green',
    },
    {
      id: 'qa3',
      label: 'Clinician Availability',
      description: 'Check schedules',
      icon: Users,
      path: '/scheduling',
      color: 'purple',
    },
    {
      id: 'qa4',
      label: 'Auto-Schedule',
      description: 'Optimize routes',
      icon: Target,
      path: '/scheduling',
      color: 'orange',
    },
  ],

  metrics: [
    {
      id: 'm1',
      label: 'Scheduled Today',
      value: 48,
      target: 50,
      icon: Calendar,
      color: 'blue',
    },
    {
      id: 'm2',
      label: 'Unassigned',
      value: 3,
      change: { value: 2, direction: 'down', isPositive: true },
      icon: AlertCircle,
      color: 'red',
    },
    {
      id: 'm3',
      label: 'Fill Rate',
      value: '96%',
      change: { value: 4, direction: 'up', isPositive: true },
      icon: CheckCircle2,
      color: 'green',
    },
    {
      id: 'm4',
      label: 'Avg Drive Time',
      value: '18',
      unit: 'min',
      change: { value: 3, direction: 'down', isPositive: true },
      icon: Clock,
      color: 'orange',
    },
  ],
};

// ==================== CASE MANAGER WORKSPACE ====================

export const caseManagerWorkspace: WorkspaceConfig = {
  role: 'case_manager',
  displayName: 'Case Manager Workspace',

  criticalIssues: [
    {
      id: 'cm1',
      type: 'urgent',
      title: 'Patient Deteriorating - Requires MD Call',
      description: 'Mary Johnson showing signs of CHF exacerbation',
      patientName: 'Johnson, Mary',
      admissionId: 'ADM-2024-001',
      action: { label: 'Contact Physician', path: '/careconnect' },
      icon: Phone,
    },
    {
      id: 'cm2',
      type: 'warning',
      title: 'Recertification Due',
      description: '3 patients require recertification within 5 days',
      action: { label: 'Review Recerts', path: '/admissions' },
      icon: ClipboardCheck,
    },
  ],

  todayTasks: [
    {
      id: 't1',
      type: 'call',
      title: 'Weekly Check-in - Johnson, Mary',
      patientName: 'Johnson, Mary',
      scheduledTime: '9:00 AM',
      status: 'pending',
      priority: 'high',
      action: { label: 'Make Call', path: '/careconnect' },
    },
    {
      id: 't2',
      type: 'meeting',
      title: 'IDG Meeting - Review 8 Patients',
      scheduledTime: '11:00 AM',
      status: 'pending',
      priority: 'high',
      action: { label: 'Prepare for IDG', path: '/hospice/idg' },
    },
    {
      id: 't3',
      type: 'assessment',
      title: 'Care Plan Review - Williams, David',
      patientName: 'Williams, David',
      scheduledTime: '2:00 PM',
      status: 'pending',
      priority: 'medium',
      action: { label: 'Review Plan', path: '/clinical/plans-of-care' },
    },
  ],

  recentItems: [
    {
      id: 'r1',
      type: 'patient',
      title: 'Johnson, Mary',
      subtitle: 'CHF exacerbation risk',
      lastAccessed: new Date(Date.now() - 1200000).toISOString(),
      path: '/patient/001234/chart',
      metadata: { alerts: 2 },
    },
    {
      id: 'r2',
      type: 'admission',
      title: 'ADM-2024-015 - Williams, David',
      subtitle: 'Recert due 3/15',
      lastAccessed: new Date(Date.now() - 2400000).toISOString(),
      path: '/admissions/ADM-2024-015',
    },
  ],

  quickActions: [
    {
      id: 'qa1',
      label: 'CareConnect',
      description: 'Team coordination',
      icon: Users,
      path: '/careconnect',
      color: 'blue',
    },
    {
      id: 'qa2',
      label: 'My Patients',
      description: 'Active caseload',
      icon: User,
      path: '/patient',
      color: 'green',
    },
    {
      id: 'qa3',
      label: 'Care Plans',
      description: 'Review plans',
      icon: FileText,
      path: '/clinical/plans-of-care',
      color: 'purple',
    },
    {
      id: 'qa4',
      label: 'Messages',
      description: 'Team chat',
      icon: MessageSquare,
      path: '/careconnect',
      color: 'orange',
    },
  ],

  metrics: [
    {
      id: 'm1',
      label: 'Active Patients',
      value: 32,
      target: 35,
      icon: Users,
      color: 'blue',
    },
    {
      id: 'm2',
      label: 'High Risk',
      value: 4,
      change: { value: 1, direction: 'up', isPositive: false },
      icon: AlertCircle,
      color: 'red',
    },
    {
      id: 'm3',
      label: 'Care Plan Compliance',
      value: '98%',
      change: { value: 3, direction: 'up', isPositive: true },
      icon: CheckCircle2,
      color: 'green',
    },
    {
      id: 'm4',
      label: 'Recerts This Week',
      value: 3,
      icon: ClipboardCheck,
      color: 'orange',
    },
  ],
};

// ==================== INTAKE COORDINATOR WORKSPACE ====================

export const intakeWorkspace: WorkspaceConfig = {
  role: 'intake_coordinator',
  displayName: 'Intake Coordinator Workspace',

  criticalIssues: [
    {
      id: 'i1',
      type: 'urgent',
      title: 'New Referral - Requires Response',
      description: 'Hospital discharge referral received, insurance verification needed',
      action: { label: 'Process Referral', path: '/referral-pipeline' },
      icon: Briefcase,
    },
    {
      id: 'i2',
      type: 'warning',
      title: 'SOC Visit Not Scheduled',
      description: 'Admission approved 48 hours ago, no SOC visit scheduled',
      patientName: 'Thompson, Sarah',
      action: { label: 'Schedule SOC', path: '/scheduling/new' },
      icon: Calendar,
    },
  ],

  todayTasks: [
    {
      id: 't1',
      type: 'call',
      title: 'Verify Insurance - New Referral',
      patientName: 'Anderson, James',
      scheduledTime: '9:00 AM',
      status: 'pending',
      priority: 'high',
      action: { label: 'Verify Coverage', path: '/referral-pipeline' },
    },
    {
      id: 't2',
      type: 'documentation',
      title: 'Complete Admission Packet',
      patientName: 'Thompson, Sarah',
      scheduledTime: '11:00 AM',
      status: 'in_progress',
      priority: 'high',
      action: { label: 'Complete Packet', path: '/new-admission' },
    },
    {
      id: 't3',
      type: 'call',
      title: 'Call Referral Sources',
      scheduledTime: '2:00 PM',
      status: 'pending',
      priority: 'medium',
      action: { label: 'Make Calls', path: '/referral-pipeline' },
    },
  ],

  recentItems: [
    {
      id: 'r1',
      type: 'patient',
      title: 'Anderson, James',
      subtitle: 'New referral - pending',
      lastAccessed: new Date(Date.now() - 900000).toISOString(),
      path: '/referral-pipeline',
    },
    {
      id: 'r2',
      type: 'admission',
      title: 'ADM-2024-025 - Thompson, Sarah',
      subtitle: 'Approved - awaiting SOC',
      lastAccessed: new Date(Date.now() - 1800000).toISOString(),
      path: '/admissions/ADM-2024-025',
      metadata: { alerts: 1 },
    },
  ],

  quickActions: [
    {
      id: 'qa1',
      label: 'New Referral',
      description: 'Add referral',
      icon: Plus,
      path: '/referral-pipeline',
      color: 'blue',
    },
    {
      id: 'qa2',
      label: 'Referral Pipeline',
      description: 'Track referrals',
      icon: Target,
      path: '/referral-pipeline',
      color: 'green',
    },
    {
      id: 'qa3',
      label: 'New Admission',
      description: 'Start admission',
      icon: Briefcase,
      path: '/new-admission',
      color: 'purple',
    },
    {
      id: 'qa4',
      label: 'Schedule SOC',
      description: 'First visit',
      icon: Calendar,
      path: '/scheduling/new',
      color: 'orange',
    },
  ],

  metrics: [
    {
      id: 'm1',
      label: 'Active Referrals',
      value: 12,
      change: { value: 3, direction: 'up', isPositive: true },
      icon: Briefcase,
      color: 'blue',
    },
    {
      id: 'm2',
      label: 'Conversion Rate',
      value: '78%',
      change: { value: 5, direction: 'up', isPositive: true },
      icon: TrendingUp,
      color: 'green',
    },
    {
      id: 'm3',
      label: 'Avg Response Time',
      value: '2.3',
      unit: 'hrs',
      change: { value: 0.5, direction: 'down', isPositive: true },
      icon: Clock,
      color: 'orange',
    },
    {
      id: 'm4',
      label: 'Pending Approvals',
      value: 5,
      icon: AlertCircle,
      color: 'red',
    },
  ],
};

// ==================== EXPORT ALL CONFIGS ====================

export const workspaceConfigs = {
  clinician: clinicianWorkspace,
  billing_specialist: billingWorkspace,
  scheduler: schedulerWorkspace,
  case_manager: caseManagerWorkspace,
  intake_coordinator: intakeWorkspace,
};

export function getWorkspaceConfig(role: keyof typeof workspaceConfigs): WorkspaceConfig {
  return workspaceConfigs[role] || clinicianWorkspace;
}
