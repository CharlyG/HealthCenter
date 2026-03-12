/**
 * Caregiver Compliance Alerts for Command Center
 * 
 * Integration component that displays workforce compliance alerts
 * in the Care Operations Command Center.
 */

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Shield,
  AlertTriangle,
  XCircle,
  GraduationCap,
  Clock,
  ChevronRight,
  User,
  TrendingDown,
} from 'lucide-react';
import { cn } from '../../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CaregiverComplianceAlert {
  id: string;
  caregiverId: string;
  caregiverName: string;
  alertType: 'expiring-credential' | 'expired-credential' | 'missing-training' | 'overdue-training' | 'low-compliance-score';
  severity: 'critical' | 'high' | 'medium';
  title: string;
  description: string;
  daysUntilExpiration?: number;
  daysOverdue?: number;
  complianceScore?: number;
  actionUrl: string;
  createdAt: string;
}

export interface ComplianceSummary {
  totalCaregivers: number;
  compliantCaregivers: number;
  caregiversWith ExpiringCredentials: number;
  caregiversWithExpiredCredentials: number;
  caregiversWithMissingTraining: number;
  overallComplianceRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE ALERTS WIDGET (For Command Center Sidebar)
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceAlertsWidgetProps {
  alerts: CaregiverComplianceAlert[];
  summary: ComplianceSummary;
  onViewAll?: () => void;
  onViewAlert?: (alertId: string) => void;
}

export function ComplianceAlertsWidget({
  alerts,
  summary,
  onViewAll,
  onViewAlert,
}: ComplianceAlertsWidgetProps) {
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
  const highAlerts = alerts.filter((a) => a.severity === 'high');

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Workforce Compliance</h3>
        </div>
        <Badge
          variant="outline"
          className={cn(
            'text-xs',
            criticalAlerts.length > 0
              ? 'bg-red-100 text-red-700 border-red-300'
              : highAlerts.length > 0
              ? 'bg-amber-100 text-amber-700 border-amber-300'
              : 'bg-green-100 text-green-700 border-green-300'
          )}
        >
          {alerts.length}
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Compliance Rate:</span>
          <span
            className={cn(
              'font-bold',
              summary.overallComplianceRate >= 90
                ? 'text-green-700'
                : summary.overallComplianceRate >= 70
                ? 'text-amber-700'
                : 'text-red-700'
            )}
          >
            {summary.overallComplianceRate}%
          </span>
        </div>

        {criticalAlerts.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-red-50 rounded">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-900 font-medium">Critical</span>
            </div>
            <span className="text-sm font-bold text-red-900">{criticalAlerts.length}</span>
          </div>
        )}

        {highAlerts.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-900 font-medium">High Priority</span>
            </div>
            <span className="text-sm font-bold text-amber-900">{highAlerts.length}</span>
          </div>
        )}
      </div>

      {/* Top 3 Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-3">
          {alerts.slice(0, 3).map((alert) => (
            <ComplianceAlertRow
              key={alert.id}
              alert={alert}
              onClick={() => onViewAlert?.(alert.id)}
            />
          ))}
        </div>
      )}

      {onViewAll && (
        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          View All Alerts
          <ChevronRight className="w-3 h-3 ml-2" />
        </Button>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE ALERT ROW (Compact)
// ═══════════════════════════════════════════════════════════════════════════

function ComplianceAlertRow({
  alert,
  onClick,
}: {
  alert: CaregiverComplianceAlert;
  onClick?: () => void;
}) {
  const iconMap = {
    'expiring-credential': Shield,
    'expired-credential': XCircle,
    'missing-training': GraduationCap,
    'overdue-training': Clock,
    'low-compliance-score': TrendingDown,
  };

  const Icon = iconMap[alert.alertType];

  return (
    <div
      className={cn(
        'p-2 rounded border-l-2 cursor-pointer hover:bg-gray-50 transition-colors',
        alert.severity === 'critical'
          ? 'border-red-500 bg-red-50'
          : alert.severity === 'high'
          ? 'border-amber-500 bg-amber-50'
          : 'border-blue-500 bg-blue-50'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={cn(
            'w-4 h-4 mt-0.5 flex-shrink-0',
            alert.severity === 'critical'
              ? 'text-red-600'
              : alert.severity === 'high'
              ? 'text-amber-600'
              : 'text-blue-600'
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-900 truncate">
            {alert.caregiverName}
          </div>
          <div className="text-xs text-gray-600 truncate">{alert.title}</div>
          {alert.daysUntilExpiration !== undefined && alert.daysUntilExpiration >= 0 && (
            <div className="text-xs text-amber-700">{alert.daysUntilExpiration}d</div>
          )}
          {alert.daysOverdue !== undefined && (
            <div className="text-xs text-red-700">{alert.daysOverdue}d overdue</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE CRITICAL ISSUES (For Command Center Main Panel)
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceCriticalIssuesProps {
  alerts: CaregiverComplianceAlert[];
  onViewAlert?: (alertId: string) => void;
  onViewAll?: () => void;
}

export function ComplianceCriticalIssues({
  alerts,
  onViewAlert,
  onViewAll,
}: ComplianceCriticalIssuesProps) {
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical');

  if (criticalAlerts.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 border-l-4 border-red-500 bg-red-50">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <Shield className="w-6 h-6 text-red-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">Critical Compliance Issues</h3>
          <p className="text-sm text-red-800 mb-3">
            {criticalAlerts.length} caregiver{criticalAlerts.length !== 1 ? 's have' : ' has'}{' '}
            critical compliance issues requiring immediate attention
          </p>

          <div className="space-y-2">
            {criticalAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-white rounded-lg border border-red-200 cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => onViewAlert?.(alert.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <User className="w-4 h-4 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {alert.caregiverName}
                      </div>
                      <div className="text-xs text-gray-600">{alert.description}</div>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {criticalAlerts.length > 5 && onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll} className="mt-3">
              View All {criticalAlerts.length} Issues
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPLIANCE METRICS CARD (For Command Center Metrics Grid)
// ═══════════════════════════════════════════════════════════════════════════

interface ComplianceMetricsCardProps {
  summary: ComplianceSummary;
  onClick?: () => void;
}

export function ComplianceMetricsCard({ summary, onClick }: ComplianceMetricsCardProps) {
  return (
    <Card className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              summary.overallComplianceRate >= 90
                ? 'bg-green-100'
                : summary.overallComplianceRate >= 70
                ? 'bg-amber-100'
                : 'bg-red-100'
            )}
          >
            <Shield
              className={cn(
                'w-6 h-6',
                summary.overallComplianceRate >= 90
                  ? 'text-green-600'
                  : summary.overallComplianceRate >= 70
                  ? 'text-amber-600'
                  : 'text-red-600'
              )}
            />
          </div>
          <div>
            <div className="text-sm text-gray-600">Workforce Compliance</div>
            <div
              className={cn(
                'text-2xl font-bold',
                summary.overallComplianceRate >= 90
                  ? 'text-green-700'
                  : summary.overallComplianceRate >= 70
                  ? 'text-amber-700'
                  : 'text-red-700'
              )}
            >
              {summary.overallComplianceRate}%
            </div>
          </div>
        </div>

        {(summary.caregiversWithExpiredCredentials > 0 ||
          summary.caregiversWithMissingTraining > 0) && (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
            {summary.caregiversWithExpiredCredentials + summary.caregiversWithMissingTraining}{' '}
            Issues
          </Badge>
        )}
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Compliant:</span>
          <span className="font-semibold text-green-700">
            {summary.compliantCaregivers}/{summary.totalCaregivers}
          </span>
        </div>

        {summary.caregiversWithExpiringCredentials > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Expiring Soon:</span>
            <span className="font-semibold text-amber-700">
              {summary.caregiversWithExpiringCredentials}
            </span>
          </div>
        )}

        {summary.caregiversWithExpiredCredentials > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Expired:</span>
            <span className="font-semibold text-red-700">
              {summary.caregiversWithExpiredCredentials}
            </span>
          </div>
        )}

        {summary.caregiversWithMissingTraining > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-600">Missing Training:</span>
            <span className="font-semibold text-red-700">
              {summary.caregiversWithMissingTraining}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
