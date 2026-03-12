/**
 * WorkspaceAlertQueue Component
 * Displays alerts relevant to a workspace module as a prioritized queue.
 * Used in workspace zone layouts (Zone 1: Critical Issues).
 */
import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAlerts } from '../../context/AlertContext';
import { AlertCard } from './AlertCard';
import { AlertBadge } from './AlertBadge';
import { Button } from '../ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { computeAlertCounts } from '../../lib/alertTypes';
import type { ClinicalAlert, AlertCategory } from '../../lib/alertTypes';

interface WorkspaceAlertQueueProps {
  /** Filter alerts by source module */
  sourceModule?: string;
  /** Filter alerts by categories */
  categories?: AlertCategory[];
  /** Filter by office */
  officeId?: string;
  /** Max alerts to show before "View All" */
  maxVisible?: number;
  /** Title override */
  title?: string;
  className?: string;
}

export const WorkspaceAlertQueue = React.memo(function WorkspaceAlertQueue({
  sourceModule,
  categories,
  officeId,
  maxVisible = 5,
  title = 'Active Alerts',
  className,
}: WorkspaceAlertQueueProps) {
  const navigate = useNavigate();
  const { alerts, acknowledge, resolve, dismiss } = useAlerts();

  // ─── Filter alerts for this workspace ─────────────────────────────────
  const workspaceAlerts = useMemo(() => {
    let filtered = alerts.filter(a => a.status === 'open' || a.status === 'acknowledged');
    if (sourceModule) {
      filtered = filtered.filter(a => a.sourceModule === sourceModule);
    }
    if (categories && categories.length > 0) {
      filtered = filtered.filter(a => categories.includes(a.category));
    }
    if (officeId) {
      filtered = filtered.filter(a => !a.officeId || a.officeId === officeId);
    }
    return filtered;
  }, [alerts, sourceModule, categories, officeId]);

  const counts = useMemo(() => computeAlertCounts(workspaceAlerts), [workspaceAlerts]);
  const visibleAlerts = useMemo(() => workspaceAlerts.slice(0, maxVisible), [workspaceAlerts, maxVisible]);
  const hasMore = workspaceAlerts.length > maxVisible;

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleQuickAction = useCallback((alert: ClinicalAlert) => {
    if (alert.quickAction?.route) {
      navigate(alert.quickAction.route);
    }
  }, [navigate]);

  const handleClick = useCallback((alert: ClinicalAlert) => {
    if (alert.patientId) {
      navigate(`/patient/${alert.patientId}/chart`);
    }
  }, [navigate]);

  // ─── Empty state ──────────────────────────────────────────────────────
  if (workspaceAlerts.length === 0) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="border-2 border-green-200 bg-green-50 rounded-lg p-6 text-center">
          <CheckCircle2 className="size-10 mx-auto mb-2 text-green-600" />
          <p className="text-sm font-semibold text-green-900">No Active Alerts</p>
          <p className="text-xs text-green-700 mt-1">All systems operating normally</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <AlertBadge counts={counts} />
        </div>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => {/* Could open notification center or navigate */}}
          >
            View All ({workspaceAlerts.length})
            <ArrowRight className="size-3" />
          </Button>
        )}
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {visibleAlerts.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onAcknowledge={acknowledge}
            onResolve={resolve}
            onDismiss={dismiss}
            onQuickAction={handleQuickAction}
            onClick={handleClick}
          />
        ))}
      </div>
    </div>
  );
});

export default WorkspaceAlertQueue;
