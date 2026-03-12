/**
 * Role-Specific Workspace: QA Reviewer
 * 5-ZONE DESIGN:
 * 1. Critical Issues - QA returns, missing signatures, compliance gaps
 * 2. Today's Work - Documents in review queue
 * 3. Resume Work - Recently reviewed documents
 * 4. Quick Actions - Review document, approve, return for correction
 * 5. Operational Insights - QA metrics, turnaround time
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
  Shield,
  FileText,
  ClipboardList,
  FileSignature,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { fetchQADocuments } from '../../lib/clinicalApi';
import { WorkspaceAlertQueue } from '../../components/alerts/WorkspaceAlertQueue';

interface QAStats {
  total: number;
  inQueue: number;
  highPriority: number;
  returned: number;
  approved: number;
  byType: { visit_note: number; plan_of_care: number; verbal_order: number };
}

export default function QAWorkspace() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<QAStats>({
    total: 0, inQueue: 0, highPriority: 0, returned: 0, approved: 0,
    byType: { visit_note: 0, plan_of_care: 0, verbal_order: 0 },
  });

  useEffect(() => {
    const load = async () => {
      try {
        const docs = await fetchQADocuments().catch(() => []);
        const inQueue = docs.filter((d: any) => d.qaStatus === 'completed' || d.qaStatus === 'corrected');
        const highPriority = docs.filter((d: any) => d.priority === 'high' && d.qaStatus !== 'approved');
        const returned = docs.filter((d: any) => d.qaStatus === 'returned');
        const approved = docs.filter((d: any) => d.qaStatus === 'approved');
        setStats({
          total: docs.length,
          inQueue: inQueue.length,
          highPriority: highPriority.length,
          returned: returned.length,
          approved: approved.length,
          byType: {
            visit_note: docs.filter((d: any) => d.documentType === 'visit_note').length,
            plan_of_care: docs.filter((d: any) => d.documentType === 'plan_of_care').length,
            verbal_order: docs.filter((d: any) => d.documentType === 'verbal_order').length,
          },
        });
      } catch (err) {
        console.error('[QAWorkspace] Error loading stats:', err);
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
          <Loader2 className="size-12 text-purple-600 animate-spin" />
          <p className="text-sm text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  // ============= ZONE 1: Critical Issues =============
  const criticalIssues = [
    {
      id: '1',
      title: 'High Priority Documents in Queue',
      description: '8 documents marked high priority waiting for review',
      severity: 'critical' as const,
      category: 'Review Queue',
      count: 8,
      onClick: () => navigate('/clinical/qa-review?priority=high'),
    },
    {
      id: '2',
      title: 'Returned Documents Not Corrected',
      description: '12 documents returned for correction over 48 hours ago',
      severity: 'high' as const,
      category: 'Corrections',
      count: 12,
      daysOverdue: 2,
      onClick: () => navigate('/clinical/qa-review?filter=returned'),
    },
    {
      id: '3',
      title: 'Compliance Gaps Identified',
      description: '5 charts with missing required documentation',
      severity: 'high' as const,
      category: 'Compliance',
      count: 5,
      onClick: () => navigate('/clinical/qa-review?filter=compliance'),
    },
    {
      id: '4',
      title: 'Aging Documents in Queue',
      description: '18 documents in queue for more than 5 days',
      severity: 'medium' as const,
      category: 'Aging',
      count: 18,
      onClick: () => navigate('/clinical/qa-review?filter=aging'),
    },
  ];

  // ============= ZONE 2: Today's Work =============
  const todaysWork = [
    {
      id: '1',
      title: 'Visit Notes - Skilled Nursing (15 documents)',
      subtitle: 'Review and approve routine skilled nursing visit notes',
      time: 'Ongoing',
      status: 'in_progress' as const,
      icon: <FileText className="size-5 text-blue-600" />,
      labels: [
        { text: '15 Documents', variant: 'default' as const },
        { text: '8 High Priority', variant: 'destructive' as const },
      ],
      onClick: () => navigate('/clinical/qa-review?type=visit_note'),
    },
    {
      id: '2',
      title: 'Plans of Care - Recertifications (6 documents)',
      subtitle: 'Review POCs for recertification period',
      status: 'scheduled' as const,
      icon: <ClipboardList className="size-5 text-green-600" />,
      labels: [
        { text: '6 Documents', variant: 'default' as const },
        { text: '2 High Priority', variant: 'warning' as const },
      ],
      onClick: () => navigate('/clinical/qa-review?type=plan_of_care'),
    },
    {
      id: '3',
      title: 'Verbal Orders - Pending Physician Signature (4 documents)',
      subtitle: 'Review verbal orders and follow up on missing signatures',
      status: 'scheduled' as const,
      icon: <FileSignature className="size-5 text-purple-600" />,
      labels: [
        { text: '4 Documents', variant: 'default' as const },
        { text: 'Signature Required', variant: 'warning' as const },
      ],
      onClick: () => navigate('/clinical/qa-review?type=verbal_order'),
    },
  ];

  // ============= ZONE 3: Resume Work =============
  const recentItems = [
    {
      id: '1',
      title: 'Johnson, Mary - Visit Note',
      subtitle: 'Returned for correction',
      lastAccessed: '15 minutes ago',
      icon: <XCircle className="size-5 text-red-600" />,
      onClick: () => navigate('/clinical/qa-review/visit_note/vn-001'),
    },
    {
      id: '2',
      title: 'Williams, Robert - Plan of Care',
      subtitle: 'Approved',
      lastAccessed: '1 hour ago',
      icon: <CheckCircle2 className="size-5 text-green-600" />,
      onClick: () => navigate('/clinical/qa-review/plan_of_care/poc-001'),
    },
    {
      id: '3',
      title: 'Davis, Linda - Verbal Order',
      subtitle: 'Under review',
      lastAccessed: '2 hours ago',
      icon: <Clock className="size-5 text-blue-600" />,
      onClick: () => navigate('/clinical/qa-review/verbal_order/vo-001'),
    },
    {
      id: '4',
      title: 'Smith, Patricia - Visit Note',
      subtitle: 'Approved',
      lastAccessed: 'Yesterday',
      icon: <CheckCircle2 className="size-5 text-green-600" />,
      onClick: () => navigate('/clinical/qa-review/visit_note/vn-002'),
    },
  ];

  // ============= ZONE 4: Quick Actions =============
  const quickActions = [
    {
      id: '1',
      label: 'Review Next Document',
      icon: <FileText className="size-5" />,
      onClick: () => navigate('/clinical/qa-review?action=next'),
    },
    {
      id: '2',
      label: 'Approve Batch',
      icon: <CheckCircle2 className="size-5" />,
      onClick: () => navigate('/clinical/qa-review?action=batch-approve'),
    },
    {
      id: '3',
      label: 'Return for Correction',
      icon: <XCircle className="size-5" />,
      onClick: () => navigate('/clinical/qa-review?action=return'),
    },
    {
      id: '4',
      label: 'High Priority Queue',
      icon: <AlertCircle className="size-5" />,
      onClick: () => navigate('/clinical/qa-review?priority=high'),
    },
    {
      id: '5',
      label: 'Compliance Review',
      icon: <Shield className="size-5" />,
      onClick: () => navigate('/clinical/qa-review?view=compliance'),
    },
    {
      id: '6',
      label: 'QA Reports',
      icon: <FileText className="size-5" />,
      onClick: () => navigate('/admin/reports?type=qa'),
    },
  ];

  // ============= ZONE 5: Operational Insights =============
  const metrics = [
    {
      id: '1',
      label: 'In Queue',
      value: stats.inQueue,
      subtitle: `${stats.highPriority} high priority`,
      variant: 'warning' as const,
      icon: <Clock className="size-4" />,
      onClick: () => navigate('/clinical/qa-review'),
    },
    {
      id: '2',
      label: 'Returned',
      value: stats.returned,
      variant: 'danger' as const,
      icon: <XCircle className="size-4" />,
      onClick: () => navigate('/clinical/qa-review?filter=returned'),
    },
    {
      id: '3',
      label: 'Approved Today',
      value: stats.approved,
      variant: 'success' as const,
      icon: <CheckCircle2 className="size-4" />,
      onClick: () => navigate('/clinical/qa-review?filter=approved'),
    },
    {
      id: '4',
      label: 'Avg Turnaround',
      value: '2.3d',
      subtitle: 'Days',
      variant: 'default' as const,
      icon: <Clock className="size-4" />,
    },
  ];

  return (
    <div className="size-full bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="size-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">QA Review Workspace</h1>
              <p className="text-gray-600">
                {stats.total} documents in queue · {stats.highPriority} high priority · {stats.returned} pending correction
              </p>
            </div>
          </div>
        </div>

        {/* ZONE 1: Critical Issues */}
        <WorkspaceZone
          title="🚨 Critical Issues"
          description="High priority and aging documents requiring attention"
        >
          <WorkspaceAlertQueue
            categories={['documentation', 'compliance']}
            title="QA & Compliance Alerts"
            maxVisible={3}
            className="mb-4"
          />
          <CriticalIssuesZone issues={criticalIssues} />
        </WorkspaceZone>

        {/* ZONE 2: Today's Work */}
        <WorkspaceZone
          title="📅 Today's Review Queue"
          description="Documents organized by type"
        >
          <TodaysWorkZone items={todaysWork} />
        </WorkspaceZone>

        {/* ZONE 3: Resume Work */}
        <WorkspaceZone
          title="🔄 Resume Work"
          description="Recently reviewed documents"
        >
          <ResumeWorkZone items={recentItems} />
        </WorkspaceZone>

        {/* ZONE 4: Quick Actions */}
        <WorkspaceZone title="⚡ Quick Actions" description="Common QA tasks">
          <QuickActionsZone actions={quickActions} />
        </WorkspaceZone>

        {/* ZONE 5: Operational Insights */}
        <WorkspaceZone title="📊 Operational Insights" description="QA performance metrics">
          <OperationalInsightsZone metrics={metrics} />
        </WorkspaceZone>
      </div>
    </div>
  );
}