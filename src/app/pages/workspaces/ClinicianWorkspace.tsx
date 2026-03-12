/**
 * Role-Specific Workspace: Clinician
 * 5-ZONE DESIGN:
 * 1. Critical Issues - Missing signatures, delayed documentation, HOPE/OASIS due
 * 2. Today's Work - Today's visit schedule
 * 3. Resume Work - Recent visits, recent documentation
 * 4. Quick Actions - Start visit, complete documentation, start assessment
 * 5. Operational Insights - Visit completion, documentation status
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  WorkspaceZone,
  CriticalIssuesZone,
  TodaysWorkZone,
  ResumeWorkZone,
  QuickActionsZone,
  OperationalInsightsZone,
} from '../../components/workspace/WorkspaceZones';
import { WorkspaceAlertQueue } from '../../components/alerts/WorkspaceAlertQueue';
import { HighRiskPatientsWidget } from '../../components/risk-scoring/HighRiskPatientsWidget';
import {
  Stethoscope,
  Calendar,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  MapPin,
  ClipboardList,
  FileSignature,
  Loader2,
} from 'lucide-react';
import { fetchVisitNotes, fetchVerbalOrders } from '../../lib/clinicalApi';
import * as dataGateway from '../../lib/dataGateway';
import { useAuth } from '../../context/AuthContext';

interface ClinicianStats {
  visitsToday: number;
  inProgress: number;
  pendingDocs: number;
  assessmentsDue: number;
  unsignedOrders: number;
}

export default function ClinicianWorkspace() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ClinicianStats>({
    visitsToday: 0, inProgress: 0, pendingDocs: 0, assessmentsDue: 0, unsignedOrders: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [visitNotes, verbalOrders, visits] = await Promise.all([
          fetchVisitNotes().catch(() => []),
          fetchVerbalOrders().catch(() => []),
          profile?.id
            ? dataGateway.evvGateway.getMyVisits(profile.id).catch(() => [])
            : Promise.resolve([]),
        ]);

        const pendingDocs = visitNotes.filter((v: any) => v.status === 'in_progress' || v.qaStatus === 'in_progress').length;
        const unsignedOrders = verbalOrders.filter((o: any) => !o.physicianSignedAt).length;
        const inProgressVisits = visits.filter((v: any) => v.status === 'in_progress').length;

        setStats({
          visitsToday: visits.length,
          inProgress: inProgressVisits,
          pendingDocs,
          assessmentsDue: Math.max(0, Math.floor(visits.length * 0.5)), // Approximate from visit count
          unsignedOrders,
        });
      } catch (err) {
        console.error('[ClinicianWorkspace] Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-12 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // ============= ZONE 1: Critical Issues =============
  const criticalIssues = [
    {
      id: '1',
      title: 'Pending Documentation',
      description: '3 visit notes from last week require completion',
      severity: 'critical' as const,
      category: 'Documentation',
      count: 3,
      daysOverdue: 4,
      onClick: () => navigate('/clinical/visit-notes?filter=pending'),
    },
    {
      id: '2',
      title: 'OASIS Assessments Due',
      description: '2 OASIS-E assessments due within 48 hours',
      severity: 'high' as const,
      category: 'Assessments',
      count: 2,
      onClick: () => navigate('/poc?view=assessments'),
    },
    {
      id: '3',
      title: 'Missing Signatures',
      description: '5 visit notes need your signature',
      severity: 'high' as const,
      category: 'Signatures',
      count: 5,
      onClick: () => navigate('/clinical/visit-notes?filter=unsigned'),
    },
    {
      id: '4',
      title: 'Verbal Orders Pending',
      description: '2 verbal orders need physician signature',
      severity: 'medium' as const,
      category: 'Orders',
      count: 2,
      onClick: () => navigate('/clinical/verbal-orders'),
    },
  ];

  // ============= ZONE 2: Today's Work =============
  const todaysWork = [
    {
      id: '1',
      title: 'Johnson, Mary - Wound Care',
      subtitle: '123 Main St, Apt 4B · Skilled Nursing',
      time: '9:00 AM',
      status: 'scheduled' as const,
      icon: <Calendar className="size-5 text-blue-600" />,
      labels: [{ text: 'Stage 2 Pressure Ulcer', variant: 'warning' as const }],
      onClick: () => navigate('/poc/visit/visit-001'),
    },
    {
      id: '2',
      title: 'Williams, Robert - Medication Management',
      subtitle: '456 Oak Ave · Weekly insulin training',
      time: '11:00 AM',
      status: 'in_progress' as const,
      icon: <Clock className="size-5 text-green-600" />,
      labels: [{ text: 'In Progress', variant: 'warning' as const }],
      onClick: () => navigate('/poc/visit/visit-002'),
    },
    {
      id: '3',
      title: 'Davis, Linda - OASIS Recert',
      subtitle: '789 Elm St · Recertification assessment',
      time: '2:00 PM',
      status: 'scheduled' as const,
      icon: <FileSignature className="size-5 text-purple-600" />,
      labels: [
        { text: 'OASIS-E', variant: 'default' as const },
        { text: 'Due Today', variant: 'destructive' as const },
      ],
      onClick: () => navigate('/poc/visit/visit-003'),
    },
    {
      id: '4',
      title: 'Smith, John - Routine SN Visit',
      subtitle: '321 Pine St · Vital signs, medication review',
      time: '4:00 PM',
      status: 'scheduled' as const,
      icon: <Stethoscope className="size-5 text-orange-600" />,
      labels: [{ text: 'Skilled Nursing', variant: 'default' as const }],
      onClick: () => navigate('/poc/visit/visit-004'),
    },
  ];

  // ============= ZONE 3: Resume Work =============
  const recentItems = [
    {
      id: '1',
      title: 'Brown, Patricia - Visit Note',
      subtitle: 'Draft saved 30 min ago',
      lastAccessed: '30 minutes ago',
      icon: <FileText className="size-5 text-blue-600" />,
      onClick: () => navigate('/clinical/visit-notes/vn-001'),
    },
    {
      id: '2',
      title: 'Anderson, Michael - OASIS',
      subtitle: 'Start of Care assessment',
      lastAccessed: '2 hours ago',
      icon: <ClipboardList className="size-5 text-purple-600" />,
      onClick: () => navigate('/poc/visit/visit-005'),
    },
    {
      id: '3',
      title: 'Wilson, Sarah - Care Plan',
      subtitle: 'Plan of Care review',
      lastAccessed: 'Yesterday',
      icon: <FileSignature className="size-5 text-green-600" />,
      onClick: () => navigate('/clinical/plans-of-care/poc-001'),
    },
    {
      id: '4',
      title: 'Taylor, James - Visit',
      subtitle: 'Completed visit from 3/5',
      lastAccessed: '2 days ago',
      icon: <CheckCircle2 className="size-5 text-orange-600" />,
      onClick: () => navigate('/poc/visit/visit-006'),
    },
  ];

  // ============= ZONE 4: Quick Actions =============
  const quickActions = [
    {
      id: '1',
      label: 'Start Visit',
      icon: <Calendar className="size-5" />,
      onClick: () => navigate('/poc?action=start-visit'),
    },
    {
      id: '2',
      label: 'Complete Documentation',
      icon: <FileText className="size-5" />,
      onClick: () => navigate('/clinical/visit-notes?action=create'),
    },
    {
      id: '3',
      label: 'Start OASIS/HOPE',
      icon: <ClipboardList className="size-5" />,
      onClick: () => navigate('/poc?action=assessment'),
    },
    {
      id: '4',
      label: 'View Route Map',
      icon: <MapPin className="size-5" />,
      onClick: () => navigate('/scheduling?view=my-route'),
    },
    {
      id: '5',
      label: 'Enter Verbal Order',
      icon: <FileSignature className="size-5" />,
      onClick: () => navigate('/clinical/verbal-orders?action=create'),
    },
    {
      id: '6',
      label: 'My Schedule',
      icon: <Calendar className="size-5" />,
      onClick: () => navigate('/scheduling?view=my-schedule'),
    },
  ];

  // ============= ZONE 5: Operational Insights =============
  const metrics = [
    {
      id: '1',
      label: 'Visits Today',
      value: stats.visitsToday,
      subtitle: `${stats.inProgress} in progress`,
      variant: 'default' as const,
      icon: <Calendar className="size-4" />,
      onClick: () => navigate('/scheduling?view=my-schedule'),
    },
    {
      id: '2',
      label: 'Pending Documentation',
      value: stats.pendingDocs,
      variant: 'danger' as const,
      icon: <FileText className="size-4" />,
      onClick: () => navigate('/clinical/visit-notes?filter=pending'),
    },
    {
      id: '3',
      label: 'Assessments Due',
      value: stats.assessmentsDue,
      variant: 'warning' as const,
      icon: <AlertCircle className="size-4" />,
      onClick: () => navigate('/poc?view=assessments'),
    },
    {
      id: '4',
      label: 'Completed This Month',
      value: 52,
      subtitle: 'Visits',
      variant: 'success' as const,
      icon: <CheckCircle2 className="size-4" />,
    },
  ];

  return (
    <div className="size-full bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="size-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Clinical Workspace</h1>
              <p className="text-gray-600">
                {stats.visitsToday} visits today · {stats.pendingDocs} pending documentation · {stats.assessmentsDue} assessments due
              </p>
            </div>
          </div>
        </div>

        {/* ZONE 1: Critical Issues */}
        <WorkspaceZone
          title="🚨 Critical Issues"
          description="Documentation and assessments requiring immediate attention"
        >
          <WorkspaceAlertQueue
            categories={['documentation', 'assessment', 'visit', 'patient']}
            title="Clinical Alerts"
            maxVisible={3}
            className="mb-4"
          />
          <CriticalIssuesZone issues={criticalIssues} />
        </WorkspaceZone>

        {/* ZONE 2: Today's Work */}
        <WorkspaceZone
          title="📅 Today's Schedule"
          description="Your visits for today"
        >
          <TodaysWorkZone items={todaysWork} />
        </WorkspaceZone>

        {/* ZONE 3: Resume Work */}
        <WorkspaceZone
          title="🔄 Resume Work"
          description="Recently accessed visits and documentation"
        >
          <ResumeWorkZone items={recentItems} />
        </WorkspaceZone>

        {/* ZONE 4: Quick Actions */}
        <WorkspaceZone title="⚡ Quick Actions" description="Common clinical tasks">
          <QuickActionsZone actions={quickActions} />
        </WorkspaceZone>

        {/* ZONE 5: Operational Insights */}
        <WorkspaceZone title="📊 Operational Insights" description="Your productivity metrics">
          <OperationalInsightsZone metrics={metrics} />
        </WorkspaceZone>

        {/* ZONE 6: Patient Risk Scores */}
        <WorkspaceZone
          title="🛡️ Patient Risk Scores"
          description="Patients ranked by clinical risk — click for detailed breakdown"
        >
          <HighRiskPatientsWidget maxVisible={6} />
        </WorkspaceZone>
      </div>
    </div>
  );
}