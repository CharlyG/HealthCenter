/**
 * Role-Specific Workspace: Billing / A/R Specialist
 * 5-ZONE DESIGN:
 * 1. Critical Issues - Claims ready, denied claims, authorization expiring
 * 2. Today's Work - Claims batches, billing tasks
 * 3. Resume Work - Recent claims, recent patients
 * 4. Quick Actions - Submit claims, verify eligibility, follow up on denials
 * 5. Operational Insights - Revenue metrics, A/R aging
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
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Send,
  RefreshCw,
  FileCheck,
  Loader2,
} from 'lucide-react';
import { fetchBillingMetrics } from '../../lib/billingApi';
import { WorkspaceAlertQueue } from '../../components/alerts/WorkspaceAlertQueue';

interface BillingStats {
  claimsReady: number;
  claimsReadyAmount: string;
  deniedClaims: number;
  authExpiring: number;
  collectionRate: string;
}

export default function BillingWorkspace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BillingStats>({
    claimsReady: 0, claimsReadyAmount: '$0', deniedClaims: 0, authExpiring: 0, collectionRate: '0%',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const metrics = await fetchBillingMetrics().catch(() => null);
        if (metrics) {
          setStats({
            claimsReady: metrics.claimsReady ?? 0,
            claimsReadyAmount: metrics.claimsReadyAmount ? `$${Number(metrics.claimsReadyAmount).toLocaleString()}` : '$0',
            deniedClaims: metrics.deniedClaims ?? 0,
            authExpiring: metrics.authExpiring ?? 0,
            collectionRate: metrics.collectionRate ? `${metrics.collectionRate}%` : '94.2%',
          });
        }
      } catch (err) {
        console.error('[BillingWorkspace] Error loading stats:', err);
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
          <Loader2 className="size-12 text-green-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // ============= ZONE 1: Critical Issues =============
  const criticalIssues = [
    {
      id: '1',
      title: 'Claims Ready for Submission',
      description: '47 claims ready to submit - $186,450 in billable revenue',
      severity: 'critical' as const,
      category: 'Claims Submission',
      count: 47,
      onClick: () => navigate('/billing?view=ready-claims'),
    },
    {
      id: '2',
      title: 'Denied Claims Requiring Action',
      description: '23 denied claims need resubmission or correction',
      severity: 'high' as const,
      category: 'Denials',
      count: 23,
      onClick: () => navigate('/billing?filter=denied'),
    },
    {
      id: '3',
      title: 'Authorization Expiring Soon',
      description: '15 patient authorizations expire within 7 days',
      severity: 'high' as const,
      category: 'Authorization',
      count: 15,
      onClick: () => navigate('/billing?view=expiring-auth'),
    },
    {
      id: '4',
      title: 'Aging A/R Over 90 Days',
      description: '$42,300 in outstanding receivables over 90 days old',
      severity: 'medium' as const,
      category: 'A/R Aging',
      onClick: () => navigate('/billing?view=aging'),
    },
  ];

  // ============= ZONE 2: Today's Work =============
  const todaysWork = [
    {
      id: '1',
      title: 'Submit Medicare Batch #2024-0306',
      subtitle: '$124,500 across 32 claims · Due today',
      time: 'Due by 5:00 PM',
      status: 'scheduled' as const,
      icon: <Send className="size-5 text-blue-600" />,
      labels: [
        { text: '32 Claims', variant: 'default' as const },
        { text: 'Due Today', variant: 'destructive' as const },
      ],
      onClick: () => navigate('/billing/batch/2024-0306'),
    },
    {
      id: '2',
      title: 'Follow Up on Denied Claims',
      subtitle: 'Review and resubmit 12 denied claims from last week',
      status: 'in_progress' as const,
      icon: <RefreshCw className="size-5 text-orange-600" />,
      labels: [
        { text: '12 Denials', variant: 'warning' as const },
        { text: '$18,200', variant: 'default' as const },
      ],
      onClick: () => navigate('/billing?filter=denied'),
    },
    {
      id: '3',
      title: 'Verify Eligibility - New Admissions',
      subtitle: '8 new admissions need insurance verification',
      status: 'scheduled' as const,
      icon: <FileCheck className="size-5 text-green-600" />,
      labels: [{ text: '8 Patients', variant: 'default' as const }],
      onClick: () => navigate('/billing?action=eligibility'),
    },
  ];

  // ============= ZONE 3: Resume Work =============
  const recentItems = [
    {
      id: '1',
      title: 'Medicare Batch #2024-0305',
      subtitle: 'Submitted yesterday',
      lastAccessed: '1 hour ago',
      icon: <Send className="size-5 text-blue-600" />,
      onClick: () => navigate('/billing/batch/2024-0305'),
    },
    {
      id: '2',
      title: 'Johnson, Mary - Authorization',
      subtitle: 'Extended through 6/30/2026',
      lastAccessed: '2 hours ago',
      icon: <FileCheck className="size-5 text-green-600" />,
      onClick: () => navigate('/patient/patient-001/billing'),
    },
    {
      id: '3',
      title: 'Denial Analysis Report',
      subtitle: 'February 2026 denials',
      lastAccessed: 'Yesterday',
      icon: <FileText className="size-5 text-orange-600" />,
      onClick: () => navigate('/billing/reports/denials'),
    },
    {
      id: '4',
      title: 'A/R Aging Report',
      subtitle: 'As of 3/5/2026',
      lastAccessed: '2 days ago',
      icon: <Clock className="size-5 text-red-600" />,
      onClick: () => navigate('/billing/reports/aging'),
    },
  ];

  // ============= ZONE 4: Quick Actions =============
  const quickActions = [
    {
      id: '1',
      label: 'Submit Claims Batch',
      icon: <Send className="size-5" />,
      onClick: () => navigate('/billing?action=submit'),
    },
    {
      id: '2',
      label: 'Verify Eligibility',
      icon: <FileCheck className="size-5" />,
      onClick: () => navigate('/billing?action=eligibility'),
    },
    {
      id: '3',
      label: 'Review Denials',
      icon: <XCircle className="size-5" />,
      onClick: () => navigate('/billing?filter=denied'),
    },
    {
      id: '4',
      label: 'Check Authorization',
      icon: <CheckCircle2 className="size-5" />,
      onClick: () => navigate('/billing?view=auth'),
    },
    {
      id: '5',
      label: 'A/R Follow-up',
      icon: <RefreshCw className="size-5" />,
      onClick: () => navigate('/billing?view=followup'),
    },
    {
      id: '6',
      label: 'Billing Reports',
      icon: <FileText className="size-5" />,
      onClick: () => navigate('/billing/reports'),
    },
  ];

  // ============= ZONE 5: Operational Insights =============
  const metrics = [
    {
      id: '1',
      label: 'Claims Ready',
      value: stats.claimsReady,
      subtitle: stats.claimsReadyAmount,
      variant: 'success' as const,
      icon: <DollarSign className="size-4" />,
      onClick: () => navigate('/billing?view=ready'),
    },
    {
      id: '2',
      label: 'Denied Claims',
      value: stats.deniedClaims,
      variant: 'danger' as const,
      icon: <XCircle className="size-4" />,
      onClick: () => navigate('/billing?filter=denied'),
    },
    {
      id: '3',
      label: 'Auth Expiring',
      value: stats.authExpiring,
      variant: 'warning' as const,
      icon: <AlertCircle className="size-4" />,
      onClick: () => navigate('/billing?view=expiring-auth'),
    },
    {
      id: '4',
      label: 'Collection Rate',
      value: stats.collectionRate,
      subtitle: 'This month',
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
            <DollarSign className="size-8 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Billing & A/R Workspace</h1>
              <p className="text-gray-600">
                {stats.claimsReady} claims ready ({stats.claimsReadyAmount}) · {stats.deniedClaims} denials · {stats.authExpiring} auth expiring
              </p>
            </div>
          </div>
        </div>

        {/* ZONE 1: Critical Issues */}
        <WorkspaceZone
          title="🚨 Critical Issues"
          description="Claims, denials, and authorization issues requiring immediate action"
        >
          <WorkspaceAlertQueue
            categories={['claims', 'authorization']}
            title="Billing & Authorization Alerts"
            maxVisible={3}
            className="mb-4"
          />
          <CriticalIssuesZone issues={criticalIssues} />
        </WorkspaceZone>

        {/* ZONE 2: Today's Work */}
        <WorkspaceZone
          title="📅 Today's Work"
          description="Claims batches and billing tasks for today"
        >
          <TodaysWorkZone items={todaysWork} />
        </WorkspaceZone>

        {/* ZONE 3: Resume Work */}
        <WorkspaceZone
          title="🔄 Resume Work"
          description="Recently accessed claims and reports"
        >
          <ResumeWorkZone items={recentItems} />
        </WorkspaceZone>

        {/* ZONE 4: Quick Actions */}
        <WorkspaceZone title="⚡ Quick Actions" description="Common billing tasks">
          <QuickActionsZone actions={quickActions} />
        </WorkspaceZone>

        {/* ZONE 5: Operational Insights */}
        <WorkspaceZone title="📊 Operational Insights" description="Revenue cycle metrics">
          <OperationalInsightsZone metrics={metrics} />
        </WorkspaceZone>
      </div>
    </div>
  );
}