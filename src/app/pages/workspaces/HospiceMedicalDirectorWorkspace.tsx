/**
 * Role-Specific Workspace: Hospice Staff / Medical Director
 * 5-ZONE DESIGN:
 * 1. Critical Issues - Pending physician orders, IDG documentation, compliance
 * 2. Today's Work - IDG meetings, patient reviews, orders
 * 3. Resume Work - Recent patients, recent orders
 * 4. Quick Actions - Sign orders, schedule IDG, review chart
 * 5. Operational Insights - Hospice metrics, patient census
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  WorkspaceZone,
  CriticalIssuesZone,
  TodaysWorkZone,
  ResumeWorkZone,
  QuickActionsZone,
  OperationalInsightsZone,
} from '../../components/workspace/WorkspaceZones';
import {
  Heart,
  FileSignature,
  Users,
  ClipboardList,
  FileText,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Stethoscope,
  Loader2,
} from 'lucide-react';
import { fetchHospiceMetrics } from '../../lib/hospiceApi';
import { WorkspaceAlertQueue } from '../../components/alerts/WorkspaceAlertQueue';

interface HospiceStats {
  activePatients: number;
  pendingOrders: number;
  upcomingIDG: number;
}

export default function HospiceMedicalDirectorWorkspace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<HospiceStats>({ activePatients: 0, pendingOrders: 0, upcomingIDG: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const metrics = await fetchHospiceMetrics().catch(() => null);
        if (metrics) {
          setStats({
            activePatients: metrics.activePatients ?? 0,
            pendingOrders: metrics.pendingOrders ?? 0,
            upcomingIDG: metrics.upcomingIDG ?? 0,
          });
        }
      } catch (err) {
        console.error('[HospiceWorkspace] Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-12 text-pink-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // ============= ZONE 1: Critical Issues =============
  const criticalIssues = [
    {
      id: '1',
      title: 'Pending Physician Orders',
      description: '12 verbal orders and plan of care documents need physician signature',
      severity: 'critical' as const,
      category: 'Physician Orders',
      count: 12,
      onClick: () => navigate('/clinical/verbal-orders?filter=pending-physician'),
    },
    {
      id: '2',
      title: 'IDG Documentation Overdue',
      description: '5 patients missing required Interdisciplinary Group meeting notes',
      severity: 'high' as const,
      category: 'IDG Documentation',
      count: 5,
      daysOverdue: 3,
      onClick: () => navigate('/hospice?view=idg-overdue'),
    },
    {
      id: '3',
      title: 'Hospice Recertifications Due',
      description: '8 patients due for hospice recertification within 7 days',
      severity: 'high' as const,
      category: 'Recertifications',
      count: 8,
      onClick: () => navigate('/hospice?view=recert-due'),
    },
    {
      id: '4',
      title: 'Volunteer Visit Coordination',
      description: '6 patients need volunteer visit assignments',
      severity: 'medium' as const,
      category: 'Volunteer Services',
      count: 6,
      onClick: () => navigate('/hospice?view=volunteers'),
    },
  ];

  // ============= ZONE 2: Today's Work =============
  const todaysWork = [
    {
      id: '1',
      title: 'Interdisciplinary Group (IDG) Meeting',
      subtitle: 'Review 12 patient cases, plan of care updates',
      time: '10:00 AM',
      status: 'scheduled' as const,
      icon: <Users className="size-5 text-blue-600" />,
      labels: [
        { text: '12 Patients', variant: 'default' as const },
        { text: 'Weekly IDG', variant: 'default' as const },
      ],
      onClick: () => navigate('/hospice?view=idg-meeting'),
    },
    {
      id: '2',
      title: 'Sign Physician Orders (8 pending)',
      subtitle: 'Review and sign verbal orders and medication changes',
      status: 'in_progress' as const,
      icon: <FileSignature className="size-5 text-purple-600" />,
      labels: [
        { text: '8 Orders', variant: 'warning' as const },
        { text: 'Urgent', variant: 'destructive' as const },
      ],
      onClick: () => navigate('/clinical/verbal-orders'),
    },
    {
      id: '3',
      title: 'Patient Chart Reviews (4 scheduled)',
      subtitle: 'Quarterly chart review for compliance and quality',
      status: 'scheduled' as const,
      icon: <ClipboardList className="size-5 text-green-600" />,
      labels: [{ text: '4 Charts', variant: 'default' as const }],
      onClick: () => navigate('/hospice?view=chart-review'),
    },
  ];

  // ============= ZONE 3: Resume Work =============
  const recentItems = [
    {
      id: '1',
      title: 'Johnson, Mary - Hospice Care Plan',
      subtitle: 'End-stage CHF · Comfort care',
      lastAccessed: '30 minutes ago',
      icon: <Heart className="size-5 text-pink-600" />,
      onClick: () => navigate('/patient/patient-001'),
    },
    {
      id: '2',
      title: 'Williams, Robert - Physician Orders',
      subtitle: 'Pain management adjustments',
      lastAccessed: '1 hour ago',
      icon: <FileSignature className="size-5 text-purple-600" />,
      onClick: () => navigate('/clinical/verbal-orders/vo-001'),
    },
    {
      id: '3',
      title: 'IDG Meeting Notes - March 4',
      subtitle: '15 patients reviewed',
      lastAccessed: 'Yesterday',
      icon: <FileText className="size-5 text-blue-600" />,
      onClick: () => navigate('/hospice/idg/2024-03-04'),
    },
    {
      id: '4',
      title: 'Davis, Linda - Recertification',
      subtitle: 'Hospice recert completed',
      lastAccessed: '2 days ago',
      icon: <CheckCircle2 className="size-5 text-green-600" />,
      onClick: () => navigate('/patient/patient-003'),
    },
  ];

  // ============= ZONE 4: Quick Actions =============
  const quickActions = [
    {
      id: '1',
      label: 'Sign Physician Orders',
      icon: <FileSignature className="size-5" />,
      onClick: () => navigate('/clinical/verbal-orders'),
    },
    {
      id: '2',
      label: 'Schedule IDG Meeting',
      icon: <Users className="size-5" />,
      onClick: () => navigate('/hospice?action=schedule-idg'),
    },
    {
      id: '3',
      label: 'Review Patient Chart',
      icon: <ClipboardList className="size-5" />,
      onClick: () => navigate('/hospice?action=chart-review'),
    },
    {
      id: '4',
      label: 'Create Care Plan',
      icon: <FileText className="size-5" />,
      onClick: () => navigate('/clinical/plans-of-care?action=create'),
    },
    {
      id: '5',
      label: 'Patient Census',
      icon: <Heart className="size-5" />,
      onClick: () => navigate('/hospice?view=census'),
    },
    {
      id: '6',
      label: 'Clinical Rounds',
      icon: <Stethoscope className="size-5" />,
      onClick: () => navigate('/hospice?view=rounds'),
    },
  ];

  // ============= ZONE 5: Operational Insights =============
  const metrics = [
    {
      id: '1',
      label: 'Hospice Census',
      value: stats.activePatients,
      subtitle: 'Active patients',
      variant: 'default' as const,
      icon: <Heart className="size-4" />,
      onClick: () => navigate('/hospice?view=census'),
    },
    {
      id: '2',
      label: 'Pending Orders',
      value: stats.pendingOrders,
      variant: 'danger' as const,
      icon: <FileSignature className="size-4" />,
      onClick: () => navigate('/clinical/verbal-orders'),
    },
    {
      id: '3',
      label: 'Recerts Due',
      value: 8,
      variant: 'warning' as const,
      icon: <AlertCircle className="size-4" />,
      onClick: () => navigate('/hospice?view=recert-due'),
    },
    {
      id: '4',
      label: 'IDG Compliance',
      value: '96%',
      subtitle: 'This quarter',
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
            <Heart className="size-8 text-pink-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hospice & Medical Director</h1>
              <p className="text-gray-600">
                {stats.activePatients} active patients · {stats.pendingOrders} pending orders · 8 recerts due
              </p>
            </div>
          </div>
        </div>

        {/* ZONE 1: Critical Issues */}
        <WorkspaceZone
          title="🚨 Critical Issues"
          description="Physician orders, IDG documentation, and compliance items"
        >
          <WorkspaceAlertQueue
            categories={['patient', 'assessment', 'documentation', 'compliance']}
            title="Hospice Clinical Alerts"
            maxVisible={3}
            className="mb-4"
          />
          <CriticalIssuesZone issues={criticalIssues} />
        </WorkspaceZone>

        {/* ZONE 2: Today's Work */}
        <WorkspaceZone
          title="📅 Today's Work"
          description="IDG meetings, orders, and chart reviews"
        >
          <TodaysWorkZone items={todaysWork} />
        </WorkspaceZone>

        {/* ZONE 3: Resume Work */}
        <WorkspaceZone
          title="🔄 Resume Work"
          description="Recently accessed patients and documents"
        >
          <ResumeWorkZone items={recentItems} />
        </WorkspaceZone>

        {/* ZONE 4: Quick Actions */}
        <WorkspaceZone title="⚡ Quick Actions" description="Common hospice tasks">
          <QuickActionsZone actions={quickActions} />
        </WorkspaceZone>

        {/* ZONE 5: Operational Insights */}
        <WorkspaceZone title="📊 Operational Insights" description="Hospice program metrics">
          <OperationalInsightsZone metrics={metrics} />
        </WorkspaceZone>
      </div>
    </div>
  );
}