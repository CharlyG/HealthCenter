/**
 * AlertCard Component
 * Displays a single alert with severity indicator, explanation,
 * suggested resolution, and quick action button.
 * 
 * Follows React.memo pattern for performance.
 */
import React, { useCallback } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronRight,
  Clock,
  CheckCircle2,
  Eye,
  X,
} from 'lucide-react';
import { cn } from '../ui/utils';
import type { ClinicalAlert, AlertSeverity } from '../../lib/alertTypes';

// ─── Severity Config ────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<AlertSeverity, {
  icon: React.ElementType;
  iconClass: string;
  bgClass: string;
  borderClass: string;
  badgeVariant: 'destructive' | 'default' | 'secondary' | 'outline';
  label: string;
}> = {
  critical: {
    icon: AlertOctagon,
    iconClass: 'text-red-600',
    bgClass: 'bg-red-50 hover:bg-red-100',
    borderClass: 'border-red-300',
    badgeVariant: 'destructive',
    label: 'Critical',
  },
  high: {
    icon: AlertTriangle,
    iconClass: 'text-orange-600',
    bgClass: 'bg-orange-50 hover:bg-orange-100',
    borderClass: 'border-orange-300',
    badgeVariant: 'destructive',
    label: 'High Priority',
  },
  warning: {
    icon: AlertCircle,
    iconClass: 'text-yellow-600',
    bgClass: 'bg-yellow-50 hover:bg-yellow-100',
    borderClass: 'border-yellow-300',
    badgeVariant: 'default',
    label: 'Warning',
  },
  info: {
    icon: Info,
    iconClass: 'text-blue-600',
    bgClass: 'bg-blue-50 hover:bg-blue-100',
    borderClass: 'border-blue-200',
    badgeVariant: 'secondary',
    label: 'Info',
  },
};

// ─── Status Badge ───────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: ClinicalAlert['status'] }) {
  switch (status) {
    case 'open':
      return <Badge variant="destructive" className="text-[11px] px-1.5 py-0">Open</Badge>;
    case 'acknowledged':
      return <Badge variant="default" className="text-[11px] px-1.5 py-0 bg-blue-600">Acknowledged</Badge>;
    case 'resolved':
      return <Badge variant="secondary" className="text-[11px] px-1.5 py-0">Resolved</Badge>;
    case 'dismissed':
      return <Badge variant="outline" className="text-[11px] px-1.5 py-0 text-gray-500">Dismissed</Badge>;
    default:
      return null;
  }
}

// ─── Time Ago ───────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: ClinicalAlert;
  compact?: boolean;
  showPatient?: boolean;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
  onDismiss?: (alertId: string) => void;
  onQuickAction?: (alert: ClinicalAlert) => void;
  onClick?: (alert: ClinicalAlert) => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export const AlertCard = React.memo(function AlertCard({
  alert,
  compact = false,
  showPatient = true,
  onAcknowledge,
  onResolve,
  onDismiss,
  onQuickAction,
  onClick,
}: AlertCardProps) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  const handleAcknowledge = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAcknowledge?.(alert.id);
  }, [alert.id, onAcknowledge]);

  const handleResolve = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onResolve?.(alert.id);
  }, [alert.id, onResolve]);

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDismiss?.(alert.id);
  }, [alert.id, onDismiss]);

  const handleQuickAction = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickAction?.(alert);
  }, [alert, onQuickAction]);

  const handleClick = useCallback(() => {
    onClick?.(alert);
  }, [alert, onClick]);

  // ─── Compact variant (for badges, sidebar counts) ─────────────────────
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm',
          config.bgClass, config.borderClass, 'border'
        )}
        onClick={handleClick}
      >
        <Icon className={cn('size-4 flex-shrink-0', config.iconClass)} />
        <span className="flex-1 truncate font-medium text-gray-900">{alert.title}</span>
        <span className="text-xs text-gray-500 flex-shrink-0">{timeAgo(alert.createdAt)}</span>
      </div>
    );
  }

  // ─── Full card ────────────────────────────────────────────────────────
  return (
    <Card
      className={cn(
        'border-2 cursor-pointer transition-all',
        config.bgClass, config.borderClass,
        alert.status === 'resolved' && 'opacity-60',
        alert.status === 'dismissed' && 'opacity-40'
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start gap-3">
          <Icon className={cn('size-5 flex-shrink-0 mt-0.5', config.iconClass)} />
          <div className="flex-1 min-w-0">
            {/* Title + Status */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className="font-semibold text-gray-900 text-sm">{alert.title}</h4>
              <StatusIndicator status={alert.status} />
              <Badge variant={config.badgeVariant} className="text-[11px] px-1.5 py-0">
                {config.label}
              </Badge>
            </div>

            {/* Category + Patient */}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <span className="font-medium">{alert.category}</span>
              {showPatient && alert.patientName && (
                <>
                  <span className="text-gray-400">|</span>
                  <span>{alert.patientName}</span>
                  {alert.patientMrn && (
                    <span className="text-gray-400">({alert.patientMrn})</span>
                  )}
                </>
              )}
              <span className="text-gray-400">|</span>
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {timeAgo(alert.createdAt)}
              </span>
            </div>

            {/* Explanation */}
            <p className="text-sm text-gray-700 mb-2">{alert.explanation}</p>

            {/* Suggested Resolution */}
            {alert.suggestedResolution && (
              <div className="flex items-start gap-2 bg-white/60 rounded-md px-3 py-2 mb-3 border border-gray-200/50">
                <CheckCircle2 className="size-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Suggested Resolution</span>
                  <p className="text-sm text-gray-700 mt-0.5">{alert.suggestedResolution}</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick Action */}
              {alert.quickAction && alert.status !== 'resolved' && alert.status !== 'dismissed' && (
                <Button
                  size="sm"
                  variant="default"
                  className="h-7 text-xs"
                  onClick={handleQuickAction}
                >
                  <ChevronRight className="size-3 mr-1" />
                  {alert.quickAction.label}
                </Button>
              )}

              {/* Acknowledge */}
              {alert.status === 'open' && onAcknowledge && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={handleAcknowledge}
                >
                  <Eye className="size-3 mr-1" />
                  Acknowledge
                </Button>
              )}

              {/* Resolve */}
              {(alert.status === 'open' || alert.status === 'acknowledged') && onResolve && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs text-green-700 border-green-300 hover:bg-green-50"
                  onClick={handleResolve}
                >
                  <CheckCircle2 className="size-3 mr-1" />
                  Resolve
                </Button>
              )}

              {/* Dismiss (info/warning only) */}
              {(alert.severity === 'info' || alert.severity === 'warning') && alert.status === 'open' && onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-gray-500"
                  onClick={handleDismiss}
                >
                  <X className="size-3 mr-1" />
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default AlertCard;
