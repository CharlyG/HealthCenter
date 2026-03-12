/**
 * Credential Expiration Alert System
 * 
 * Multi-level alert system for credential expiration tracking appearing
 * across HR dashboard, Command Center, Caregiver Profile, and Scheduling.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  AlertTriangle,
  XCircle,
  Bell,
  BellOff,
  ChevronRight,
  User,
  Calendar,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { CredentialAlert, AlertTiming, AlertSeverity } from '../lib/credentialTypes';
import { CREDENTIAL_TYPE_CONFIG, ALERT_TIMING_CONFIG } from '../lib/credentialTypes';

// ═══════════════════════════════════════════════════════════════════════════
// ALERT BANNER (For top of dashboards)
// ═══════════════════════════════════════════════════════════════════════════

interface CredentialAlertBannerProps {
  alerts: CredentialAlert[];
  onViewAll?: () => void;
  onAcknowledge?: (alertId: string) => void;
  mode?: 'full' | 'compact';
}

export function CredentialAlertBanner({
  alerts,
  onViewAll,
  onAcknowledge,
  mode = 'full',
}: CredentialAlertBannerProps) {
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical' && !a.acknowledged);
  const highAlerts = alerts.filter((a) => a.severity === 'high' && !a.acknowledged);

  if (criticalAlerts.length === 0 && highAlerts.length === 0) {
    return null;
  }

  if (mode === 'compact') {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-900">
            {criticalAlerts.length} critical credential alert{criticalAlerts.length !== 1 ? 's' : ''}
          </span>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="ml-auto text-xs">
              View <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6 border-l-4 border-red-500 bg-red-50">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-1">Credential Expiration Alerts</h3>
          <p className="text-sm text-red-800 mb-3">
            {criticalAlerts.length > 0 && (
              <>
                <span className="font-semibold">{criticalAlerts.length}</span> expired or critically
                expiring credentials
              </>
            )}
            {criticalAlerts.length > 0 && highAlerts.length > 0 && <span> • </span>}
            {highAlerts.length > 0 && (
              <>
                <span className="font-semibold">{highAlerts.length}</span> expiring within 30 days
              </>
            )}
          </p>

          {/* Top 3 Critical Alerts */}
          <div className="space-y-2 mb-3">
            {criticalAlerts.slice(0, 3).map((alert) => (
              <AlertRow key={alert.id} alert={alert} onAcknowledge={onAcknowledge} />
            ))}
          </div>

          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              View All Alerts
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT LIST (Full detailed list)
// ═══════════════════════════════════════════════════════════════════════════

interface CredentialAlertListProps {
  alerts: CredentialAlert[];
  onAcknowledge?: (alertId: string) => void;
  onViewCaregiver?: (caregiverId: string) => void;
  showFilters?: boolean;
}

export function CredentialAlertList({
  alerts,
  onAcknowledge,
  onViewCaregiver,
  showFilters = true,
}: CredentialAlertListProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) {
      return false;
    }
    if (!showAcknowledged && alert.acknowledged) {
      return false;
    }
    return true;
  });

  const severityCounts = {
    critical: alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length,
    high: alerts.filter((a) => a.severity === 'high' && !a.acknowledged).length,
    medium: alerts.filter((a) => a.severity === 'medium' && !a.acknowledged).length,
    info: alerts.filter((a) => a.severity === 'info' && !a.acknowledged).length,
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Severity:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSeverity('all')}
                className={cn(selectedSeverity === 'all' && 'bg-blue-100 border-blue-300')}
              >
                All ({alerts.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSeverity('critical')}
                className={cn(selectedSeverity === 'critical' && 'bg-red-100 border-red-300')}
              >
                Critical ({severityCounts.critical})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSeverity('high')}
                className={cn(selectedSeverity === 'high' && 'bg-orange-100 border-orange-300')}
              >
                High ({severityCounts.high})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSeverity('medium')}
                className={cn(selectedSeverity === 'medium' && 'bg-amber-100 border-amber-300')}
              >
                Medium ({severityCounts.medium})
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAcknowledged(!showAcknowledged)}
            >
              {showAcknowledged ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
              {showAcknowledged ? 'Hide' : 'Show'} Acknowledged
            </Button>
          </div>
        </Card>
      )}

      {/* Alert List */}
      <Card className="p-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
            <p className="font-medium mb-1">No active alerts</p>
            <p className="text-sm">All credentials are up to date</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={onAcknowledge}
                onViewCaregiver={onViewCaregiver}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT ROW (Compact)
// ═══════════════════════════════════════════════════════════════════════════

function AlertRow({
  alert,
  onAcknowledge,
}: {
  alert: CredentialAlert;
  onAcknowledge?: (alertId: string) => void;
}) {
  const config = CREDENTIAL_TYPE_CONFIG[alert.credentialType];

  return (
    <div className="flex items-center justify-between p-2 bg-white rounded-lg border">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-lg">{config.icon}</span>
        <div className="text-sm">
          <span className="font-medium text-gray-900">{alert.caregiverName}</span>
          <span className="text-gray-600"> • {config.label}</span>
          {alert.daysUntilExpiration < 0 ? (
            <span className="text-red-700 font-medium"> • Expired</span>
          ) : (
            <span className="text-amber-700"> • {alert.daysUntilExpiration}d</span>
          )}
        </div>
      </div>

      {onAcknowledge && !alert.acknowledged && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAcknowledge(alert.id)}
          className="text-xs"
        >
          Acknowledge
        </Button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT CARD (Detailed)
// ═══════════════════════════════════════════════════════════════════════════

function AlertCard({
  alert,
  onAcknowledge,
  onViewCaregiver,
}: {
  alert: CredentialAlert;
  onAcknowledge?: (alertId: string) => void;
  onViewCaregiver?: (caregiverId: string) => void;
}) {
  const config = CREDENTIAL_TYPE_CONFIG[alert.credentialType];
  const severityConfig = {
    critical: { color: 'red', label: 'Critical' },
    high: { color: 'orange', label: 'High' },
    medium: { color: 'amber', label: 'Medium' },
    info: { color: 'blue', label: 'Info' },
  };

  const severity = severityConfig[alert.severity];

  return (
    <div
      className={cn(
        'p-4 rounded-lg border-l-4',
        alert.severity === 'critical'
          ? 'border-red-500 bg-red-50'
          : alert.severity === 'high'
          ? 'border-orange-500 bg-orange-50'
          : alert.severity === 'medium'
          ? 'border-amber-500 bg-amber-50'
          : 'border-blue-500 bg-blue-50',
        alert.acknowledged && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">{config.icon}</div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900">{alert.caregiverName}</h4>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    severity.color === 'red'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : severity.color === 'orange'
                      ? 'bg-orange-100 text-orange-700 border-orange-300'
                      : severity.color === 'amber'
                      ? 'bg-amber-100 text-amber-700 border-amber-300'
                      : 'bg-blue-100 text-blue-700 border-blue-300'
                  )}
                >
                  {severity.label}
                </Badge>
                {alert.acknowledged && (
                  <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Acknowledged
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-700">{config.label}</div>
            </div>

            <div className="text-right">
              {alert.daysUntilExpiration < 0 ? (
                <div className="text-sm font-semibold text-red-700">EXPIRED</div>
              ) : (
                <div className="text-sm font-semibold text-gray-900">
                  {alert.daysUntilExpiration} days
                </div>
              )}
              <div className="text-xs text-gray-600">
                {new Date(alert.expirationDate).toLocaleDateString()}
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-900 mb-3">{alert.message}</p>

          <div className="flex items-center gap-2">
            {onViewCaregiver && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewCaregiver(alert.caregiverId)}
              >
                <User className="w-3 h-3 mr-1" />
                View Profile
              </Button>
            )}

            {onAcknowledge && !alert.acknowledged && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge(alert.id)}
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Acknowledge
              </Button>
            )}
          </div>

          {alert.acknowledged && alert.acknowledgedBy && (
            <div className="mt-2 pt-2 border-t text-xs text-gray-600">
              Acknowledged by {alert.acknowledgedBy} on{' '}
              {new Date(alert.acknowledgedAt!).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT WIDGET (For sidebar/command center)
// ═══════════════════════════════════════════════════════════════════════════

interface CredentialAlertWidgetProps {
  alerts: CredentialAlert[];
  onViewAll?: () => void;
}

export function CredentialAlertWidget({ alerts, onViewAll }: CredentialAlertWidgetProps) {
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const criticalCount = unacknowledgedAlerts.filter((a) => a.severity === 'critical').length;
  const highCount = unacknowledgedAlerts.filter((a) => a.severity === 'high').length;

  if (unacknowledgedAlerts.length === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-green-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Credential Alerts</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-700">
          <CheckCircle className="w-4 h-4" />
          <span>All credentials up to date</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-600" />
          <h3 className="font-semibold text-gray-900 text-sm">Credential Alerts</h3>
        </div>
        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
          {unacknowledgedAlerts.length}
        </Badge>
      </div>

      <div className="space-y-2 mb-3">
        {criticalCount > 0 && (
          <div className="flex items-center justify-between p-2 bg-red-50 rounded">
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-900 font-medium">Critical</span>
            </div>
            <span className="text-sm font-bold text-red-900">{criticalCount}</span>
          </div>
        )}

        {highCount > 0 && (
          <div className="flex items-center justify-between p-2 bg-amber-50 rounded">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-sm text-amber-900 font-medium">High Priority</span>
            </div>
            <span className="text-sm font-bold text-amber-900">{highCount}</span>
          </div>
        )}
      </div>

      {onViewAll && (
        <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
          View All Alerts
          <ChevronRight className="w-3 h-3 ml-2" />
        </Button>
      )}
    </Card>
  );
}
