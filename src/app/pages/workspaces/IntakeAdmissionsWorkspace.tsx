/**
 * Role-Specific Workspace: Intake/Admissions Coordinator
 * 5-ZONE DESIGN:
 * 1. Critical Issues - Incomplete admissions, delayed processing
 * 2. Today's Work - Scheduled admissions, pending contacts
 * 3. Resume Work - Recently opened patients/admissions
 * 4. Quick Actions - Create patient, create admission, verify insurance
 * 5. Operational Insights - Lightweight metrics
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
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  UserPlus,
  ClipboardList,
  FileCheck,
  Calendar,
  Phone,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Loader2,
} from 'lucide-react';
import { supabase, publicAnonKey, API_BASE } from '../../lib/supabaseClient';
import { WorkspaceAlertQueue } from '../../components/alerts/WorkspaceAlertQueue';

interface IntakeStats {
  pendingReferrals: number;
  activeAdmissions: number;
  totalThisMonth: number;
}

export default function IntakeAdmissionsWorkspace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<IntakeStats>({ pendingReferrals: 0, activeAdmissions: 0, totalThisMonth: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token || publicAnonKey;
        const res = await fetch(`${API_BASE}/admissions`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const json = await res.json();
          const admissions = json.admissions || [];
          const now = new Date();
          setStats({
            pendingReferrals: admissions.filter((a: any) => a.status === 'pending').length,
            activeAdmissions: admissions.filter((a: any) => a.status === 'active').length,
            totalThisMonth: admissions.filter((a: any) => {
              const d = new Date(a.admission_date);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            }).length,
          });
        }
      } catch (err) {
        console.error('[IntakeWorkspace] Error loading stats:', err);
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
      title: 'Incomplete Admissions',
      description: '3 admissions missing required signatures or documentation',
      severity: 'critical' as const,
      category: 'Documentation',
      count: 3,
      onClick: () => navigate('/admissions?filter=incomplete'),
    },
    {
      id: '2',
      title: 'Delayed Referrals',
      description: '5 referrals pending contact for more than 48 hours',
      severity: 'high' as const,
      category: 'Referrals',
      count: 5,
      daysOverdue: 2,
      onClick: () => navigate('/admissions?filter=delayed'),
    },
    {
      id: '3',
      title: 'Pending Insurance Verification',
      description: '8 patients waiting for insurance authorization',
      severity: 'medium' as const,
      category: 'Insurance',
      count: 8,
      onClick: () => navigate('/admissions?filter=insurance'),
    },
  ];

  // ============= ZONE 2: Today's Work =============
  const todaysWork = [
    {
      id: '1',
      title: 'Johnson, Mary - Initial Home Health Admission',
      subtitle: 'Medicare Part A · Referred by Community Hospital',
      time: '10:00 AM',
      status: 'scheduled' as const,
      icon: <Calendar className="size-5 text-blue-600" />,
      labels: [{ text: 'Skilled Nursing', variant: 'default' as const }],
      onClick: () => navigate('/admissions/adm-001'),
    },
    {
      id: '2',
      title: 'Williams, Robert - Hospice Intake',
      subtitle: 'Aetna · Dr. Anderson referral',
      time: '2:00 PM',
      status: 'in_progress' as const,
      icon: <ClipboardList className="size-5 text-purple-600" />,
      labels: [
        { text: 'Hospice', variant: 'secondary' as const },
        { text: 'Insurance Verified', variant: 'success' as const },
      ],
      onClick: () => navigate('/admissions/adm-002'),
    },
    {
      id: '3',
      title: 'Davis, Linda - PT Re-certification',
      subtitle: 'Blue Cross · Case Manager: Sarah Johnson',
      time: '4:00 PM',
      status: 'scheduled' as const,
      icon: <FileCheck className="size-5 text-green-600" />,
      labels: [{ text: 'Physical Therapy', variant: 'default' as const }],
      onClick: () => navigate('/admissions/adm-003'),
    },
  ];

  // ============= ZONE 3: Resume Work =============
  const recentItems = [
    {
      id: '1',
      title: 'Smith, Patricia',
      subtitle: 'Home Health Admission',
      lastAccessed: '2 hours ago',
      icon: <UserPlus className="size-5 text-blue-600" />,
      onClick: () => navigate('/patient/patient-001'),
    },
    {
      id: '2',
      title: 'Brown, Michael',
      subtitle: 'Hospice Intake',
      lastAccessed: '4 hours ago',
      icon: <ClipboardList className="size-5 text-purple-600" />,
      onClick: () => navigate('/patient/patient-002'),
    },
    {
      id: '3',
      title: 'Anderson, Sarah',
      subtitle: 'Skilled Nursing Admission',
      lastAccessed: 'Yesterday',
      icon: <FileCheck className="size-5 text-green-600" />,
      onClick: () => navigate('/patient/patient-003'),
    },
    {
      id: '4',
      title: 'Wilson, James',
      subtitle: 'OT/PT Admission',
      lastAccessed: '2 days ago',
      icon: <Calendar className="size-5 text-orange-600" />,
      onClick: () => navigate('/patient/patient-004'),
    },
  ];

  // ============= ZONE 4: Quick Actions =============
  const quickActions = [
    {
      id: '1',
      label: 'Create Patient',
      icon: <UserPlus className="size-5" />,
      onClick: () => navigate('/patient?action=create'),
    },
    {
      id: '2',
      label: 'Create Admission',
      icon: <ClipboardList className="size-5" />,
      onClick: () => navigate('/new-admission'),
    },
    {
      id: '3',
      label: 'Schedule Admission',
      icon: <Calendar className="size-5" />,
      onClick: () => navigate('/scheduling?type=admission'),
    },
    {
      id: '4',
      label: 'Verify Insurance',
      icon: <FileCheck className="size-5" />,
      onClick: () => navigate('/admissions?action=insurance'),
    },
    {
      id: '5',
      label: 'Contact Referral',
      icon: <Phone className="size-5" />,
      onClick: () => navigate('/admissions?action=contact'),
    },
    {
      id: '6',
      label: 'Upload Documents',
      icon: <Upload className="size-5" />,
      onClick: () => navigate('/admissions?action=upload'),
    },
  ];

  // ============= ZONE 5: Operational Insights =============
  const metrics = [
    {
      id: '1',
      label: 'Pending Referrals',
      value: stats.pendingReferrals,
      variant: 'warning' as const,
      icon: <Clock className="size-4" />,
      onClick: () => navigate('/admissions?filter=pending'),
    },
    {
      id: '2',
      label: 'Ready for Admission',
      value: stats.activeAdmissions,
      variant: 'success' as const,
      icon: <CheckCircle2 className="size-4" />,
      onClick: () => navigate('/admissions?filter=ready'),
    },
    {
      id: '3',
      label: 'Unresolved Issues',
      value: 16,
      variant: 'danger' as const,
      icon: <AlertCircle className="size-4" />,
      onClick: () => navigate('/admissions?filter=issues'),
    },
    {
      id: '4',
      label: 'Total Admissions',
      value: stats.totalThisMonth,
      subtitle: 'This month',
      variant: 'default' as const,
      icon: <Users className="size-4" />,
    },
  ];

  return (
    <div className="size-full bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="size-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Intake & Admissions</h1>
              <p className="text-gray-600">
                {stats.pendingReferrals} pending referrals · {stats.activeAdmissions} active admissions · {stats.totalThisMonth} this month
              </p>
            </div>
          </div>
        </div>

        {/* ZONE 1: Critical Issues */}
        <WorkspaceZone
          title="🚨 Critical Issues"
          description="These items need immediate attention"
        >
          <WorkspaceAlertQueue
            categories={['admission', 'referral', 'authorization']}
            title="Intake & Admissions Alerts"
            maxVisible={3}
            className="mb-4"
          />
          <CriticalIssuesZone issues={criticalIssues} />
        </WorkspaceZone>

        {/* ZONE 2: Today's Work */}
        <WorkspaceZone
          title="📅 Today's Work"
          description="Scheduled admissions and pending contacts for today"
        >
          <TodaysWorkZone items={todaysWork} />
        </WorkspaceZone>

        {/* ZONE 3: Resume Work */}
        <WorkspaceZone title="🔄 Resume Work" description="Recently accessed patients and admissions">
          <ResumeWorkZone items={recentItems} />
        </WorkspaceZone>

        {/* ZONE 4: Quick Actions */}
        <WorkspaceZone title="⚡ Quick Actions" description="Common tasks and workflows">
          <QuickActionsZone actions={quickActions} />
        </WorkspaceZone>

        {/* ZONE 5: Operational Insights */}
        <WorkspaceZone title="📊 Operational Insights" description="Key metrics at a glance">
          <OperationalInsightsZone metrics={metrics} />
        </WorkspaceZone>
      </div>
    </div>
  );
}