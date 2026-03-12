/**
 * QA Operational Alerts Component
 * 
 * Operational alerts for QA workflows including documents pending too long,
 * repeatedly returned, overdue, and compliance issues. Appears in command
 * center and QA dashboard.
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  AlertTriangle,
  Clock,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  X,
  Bell,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type QAAlertType =
  | 'pending-too-long'
  | 'repeatedly-returned'
  | 'documentation-overdue'
  | 'compliance-issue';

export type QAAlertSeverity = 'critical' | 'warning' | 'info';

export interface QAAlert {
  id: string;
  type: QAAlertType;
  severity: QAAlertSeverity;
  title: string;
  message: string;
  affectedDocuments: number;
  timestamp: string;
  metadata?: {
    documentIds?: string[];
    clinicianName?: string;
    daysOverdue?: number;
    returnCount?: number;
    complianceCategory?: string;
  };
  actionLabel?: string;
  actionRoute?: string;
  dismissed?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const ALERT_TYPE_CONFIG: Record<
  QAAlertType,
  { label: string; icon: any; color: string }
> = {
  'pending-too-long': {
    label: 'Pending Too Long',
    icon: Clock,
    color: 'amber',
  },
  'repeatedly-returned': {
    label: 'Repeatedly Returned',
    icon: RefreshCw,
    color: 'orange',
  },
  'documentation-overdue': {
    label: 'Documentation Overdue',
    icon: AlertCircle,
    color: 'red',
  },
  'compliance-issue': {
    label: 'Compliance Issue',
    icon: AlertTriangle,
    color: 'red',
  },
};

const SEVERITY_CONFIG: Record<
  QAAlertSeverity,
  { label: string; bgClass: string; textClass: string; borderClass: string }
> = {
  critical: {
    label: 'Critical',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-300',
  },
  warning: {
    label: 'Warning',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
  },
  info: {
    label: 'Info',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-300',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QAOperationalAlertsProps {
  alerts: QAAlert[];
  onDismiss: (alertId: string) => void;
  onAction: (alertId: string, route?: string) => void;
  mode?: 'full' | 'compact';
}

export default function QAOperationalAlerts({
  alerts,
  onDismiss,
  onAction,
  mode = 'full',
}: QAOperationalAlertsProps) {
  const activeAlerts = alerts.filter((a) => !a.dismissed);
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical');
  const warningAlerts = activeAlerts.filter((a) => a.severity === 'warning');

  if (mode === 'compact') {
    return <CompactAlerts alerts={activeAlerts} onAction={onAction} />;
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-900">QA Operational Alerts</h3>
              <p className="text-xs text-gray-600">
                {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {criticalAlerts.length > 0 && (
              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                {criticalAlerts.length} Critical
              </Badge>
            )}
            {warningAlerts.length > 0 && (
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300">
                {warningAlerts.length} Warning
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Alert List */}
      {activeAlerts.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No Active Alerts</h3>
            <p className="text-sm text-gray-600">All QA operations are running smoothly</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onDismiss={() => onDismiss(alert.id)}
              onAction={() => onAction(alert.id, alert.actionRoute)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT CARD
// ═══════════════════════════════════════════════════════════════════════════

function AlertCard({
  alert,
  onDismiss,
  onAction,
}: {
  alert: QAAlert;
  onDismiss: () => void;
  onAction: () => void;
}) {
  const typeConfig = ALERT_TYPE_CONFIG[alert.type];
  const severityConfig = SEVERITY_CONFIG[alert.severity];
  const TypeIcon = typeConfig.icon;

  return (
    <Card
      className={cn(
        'p-4 border-l-4 transition-all',
        severityConfig.bgClass,
        severityConfig.borderClass
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            alert.severity === 'critical'
              ? 'bg-red-100'
              : alert.severity === 'warning'
              ? 'bg-amber-100'
              : 'bg-blue-100'
          )}
        >
          <TypeIcon
            className={cn(
              'w-5 h-5',
              alert.severity === 'critical'
                ? 'text-red-600'
                : alert.severity === 'warning'
                ? 'text-amber-600'
                : 'text-blue-600'
            )}
          />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                <Badge
                  variant="outline"
                  className={cn('text-xs', severityConfig.bgClass, severityConfig.textClass)}
                >
                  {severityConfig.label}
                </Badge>
                <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                  {typeConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 mb-2">{alert.message}</p>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{alert.affectedDocuments} document{alert.affectedDocuments !== 1 ? 's' : ''}</span>
                </div>
                {alert.metadata?.daysOverdue && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{alert.metadata.daysOverdue} days overdue</span>
                  </div>
                )}
                {alert.metadata?.returnCount && (
                  <div className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    <span>{alert.metadata.returnCount} returns</span>
                  </div>
                )}
                {alert.metadata?.clinicianName && (
                  <span className="font-medium">{alert.metadata.clinicianName}</span>
                )}
                <span className="ml-auto">{new Date(alert.timestamp).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onDismiss}
              className="ml-2 p-1 hover:bg-white/50 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Action Button */}
          {alert.actionLabel && (
            <Button variant="outline" size="sm" onClick={onAction}>
              {alert.actionLabel}
              <ChevronRight className="w-3 h-3 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT ALERTS
// ═══════════════════════════════════════════════════════════════════════════

function CompactAlerts({
  alerts,
  onAction,
}: {
  alerts: QAAlert[];
  onAction: (alertId: string, route?: string) => void;
}) {
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;

  if (alerts.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Bell className="w-4 h-4 text-green-600" />
          <span>No QA alerts</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">QA Alerts</span>
          </div>
          {criticalCount > 0 && (
            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
              {criticalCount} Critical
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          {alerts.slice(0, 3).map((alert) => {
            const typeConfig = ALERT_TYPE_CONFIG[alert.type];
            const TypeIcon = typeConfig.icon;

            return (
              <button
                key={alert.id}
                onClick={() => onAction(alert.id, alert.actionRoute)}
                className="w-full text-left p-2 hover:bg-gray-50 rounded transition-colors"
              >
                <div className="flex items-center gap-2">
                  <TypeIcon className="w-3 h-3 text-gray-500 flex-shrink-0" />
                  <span className="text-xs text-gray-700 flex-1 truncate">{alert.title}</span>
                  <ChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>

        {alerts.length > 3 && (
          <div className="text-xs text-gray-600 text-center pt-1">
            +{alerts.length - 3} more alert{alerts.length - 3 !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockQAAlerts(): QAAlert[] {
  const now = new Date();

  return [
    {
      id: 'alert-1',
      type: 'pending-too-long',
      severity: 'warning',
      title: '12 Documents Pending Review Over 48 Hours',
      message:
        'Multiple documents have been waiting for QA review for more than 48 hours. Review capacity may need adjustment.',
      affectedDocuments: 12,
      timestamp: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
      actionLabel: 'View Pending Queue',
      actionRoute: '/qa-workspace?queue=pending',
    },
    {
      id: 'alert-2',
      type: 'repeatedly-returned',
      severity: 'critical',
      title: 'Document Returned for Correction 3 Times',
      message:
        'Visit Note VN-2024-556 has been returned for correction 3 times. Consider escalation to clinical supervisor.',
      affectedDocuments: 1,
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      metadata: {
        documentIds: ['VN-2024-556'],
        clinicianName: 'John Davis, RN',
        returnCount: 3,
      },
      actionLabel: 'Review Document',
      actionRoute: '/document-review-interface?docId=VN-2024-556',
    },
    {
      id: 'alert-3',
      type: 'documentation-overdue',
      severity: 'critical',
      title: '5 Documents Overdue for Correction',
      message:
        'Five documents returned for correction are now overdue. Billing deadlines may be at risk.',
      affectedDocuments: 5,
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      metadata: {
        daysOverdue: 3,
      },
      actionLabel: 'View Overdue Documents',
      actionRoute: '/qa-workspace?queue=overdue',
    },
    {
      id: 'alert-4',
      type: 'compliance-issue',
      severity: 'critical',
      title: 'Critical Compliance Issue Detected',
      message:
        'OASIS Assessment missing required M items. Document cannot be approved for billing without resolution.',
      affectedDocuments: 1,
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
      metadata: {
        documentIds: ['OASIS-2024-123'],
        complianceCategory: 'Missing Required Fields',
      },
      actionLabel: 'Review Compliance',
      actionRoute: '/document-review-interface?docId=OASIS-2024-123',
    },
    {
      id: 'alert-5',
      type: 'repeatedly-returned',
      severity: 'warning',
      title: '8 Documents from Same Clinician Returned',
      message:
        'Emily Chen has had 8 documents returned this week. Consider additional training or mentorship.',
      affectedDocuments: 8,
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      metadata: {
        clinicianName: 'Emily Chen, RN',
        returnCount: 8,
      },
      actionLabel: 'View Clinician Reports',
      actionRoute: '/qa-workspace?clinician=emily-chen',
    },
  ];
}
