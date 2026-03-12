/**
 * Medication Alerts Components
 * 
 * Reusable components for displaying medication alerts across the platform.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle2,
  X,
  Eye,
  ChevronDown,
  ChevronRight,
  Pill,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { MedicationAlert, AlertSeverity } from '../services/medicationAlerts';
import { ALERT_SEVERITY_CONFIG } from '../services/medicationAlerts';

// ═══════════════════════════════════════════════════════════════════════════
// ALERT BANNER - Compact summary view
// ═══════════════════════════════════════════════════════════════════════════

interface AlertBannerProps {
  alerts: MedicationAlert[];
  onViewAll?: () => void;
}

export function MedicationAlertBanner({ alerts, onViewAll }: AlertBannerProps) {
  const activeAlerts = alerts.filter(a => a.status === 'active');
  
  if (activeAlerts.length === 0) {
    return null;
  }

  const counts = {
    critical: activeAlerts.filter(a => a.severity === 'critical').length,
    high: activeAlerts.filter(a => a.severity === 'high').length,
    warning: activeAlerts.filter(a => a.severity === 'warning').length,
    info: activeAlerts.filter(a => a.severity === 'info').length,
  };

  const highestSeverity: AlertSeverity = 
    counts.critical > 0 ? 'critical' :
    counts.high > 0 ? 'high' :
    counts.warning > 0 ? 'warning' : 'info';

  const config = ALERT_SEVERITY_CONFIG[highestSeverity];

  return (
    <Card className={cn(
      'p-4 border-l-4',
      config.bgColor,
      config.borderColor
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
          <div className="flex-1">
            <h4 className={cn('font-semibold mb-1', config.textColor)}>
              {activeAlerts.length} Medication Alert{activeAlerts.length !== 1 ? 's' : ''}
            </h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {counts.critical > 0 && (
                <Badge className="bg-red-600 text-white text-xs">
                  {counts.critical} Critical
                </Badge>
              )}
              {counts.high > 0 && (
                <Badge className="bg-orange-600 text-white text-xs">
                  {counts.high} High Priority
                </Badge>
              )}
              {counts.warning > 0 && (
                <Badge className="bg-amber-600 text-white text-xs">
                  {counts.warning} Warning{counts.warning !== 1 ? 's' : ''}
                </Badge>
              )}
              {counts.info > 0 && (
                <Badge className="bg-blue-600 text-white text-xs">
                  {counts.info} Info
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-700">
              Review medication alerts before proceeding with patient care.
            </p>
          </div>
        </div>
        {onViewAll && (
          <Button variant="outline" size="sm" onClick={onViewAll}>
            <Eye className="w-4 h-4 mr-2" />
            View All
          </Button>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT LIST - Full list view
// ═══════════════════════════════════════════════════════════════════════════

interface AlertListProps {
  alerts: MedicationAlert[];
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string, notes: string) => void;
  showActions?: boolean;
}

export function MedicationAlertList({ 
  alerts, 
  onAcknowledge, 
  onResolve,
  showActions = true,
}: AlertListProps) {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const activeAlerts = alerts.filter(a => a.status === 'active');

  if (activeAlerts.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-600 opacity-50" />
          <p className="text-gray-600 font-medium">No Active Medication Alerts</p>
          <p className="text-sm text-gray-500 mt-1">
            All medication alerts have been reviewed and resolved.
          </p>
        </div>
      </Card>
    );
  }

  const handleToggleExpanded = (alertId: string) => {
    setExpandedAlerts(prev => {
      const next = new Set(prev);
      if (next.has(alertId)) {
        next.delete(alertId);
      } else {
        next.add(alertId);
      }
      return next;
    });
  };

  const handleResolve = () => {
    if (resolvingAlertId && onResolve) {
      onResolve(resolvingAlertId, resolutionNotes);
      setResolvingAlertId(null);
      setResolutionNotes('');
    }
  };

  return (
    <>
      <div className="space-y-3">
        {activeAlerts.map(alert => (
          <AlertCard
            key={alert.id}
            alert={alert}
            isExpanded={expandedAlerts.has(alert.id)}
            onToggleExpanded={() => handleToggleExpanded(alert.id)}
            onAcknowledge={onAcknowledge ? () => onAcknowledge(alert.id) : undefined}
            onResolve={onResolve ? () => setResolvingAlertId(alert.id) : undefined}
            showActions={showActions}
          />
        ))}
      </div>

      {/* Resolve Dialog */}
      <Dialog open={!!resolvingAlertId} onOpenChange={() => setResolvingAlertId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Document how this alert was resolved
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Describe the action taken to resolve this alert..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolvingAlertId(null)}>
              Cancel
            </Button>
            <Button onClick={handleResolve}>
              Resolve Alert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT CARD - Individual alert display
// ═══════════════════════════════════════════════════════════════════════════

interface AlertCardProps {
  alert: MedicationAlert;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onAcknowledge?: () => void;
  onResolve?: () => void;
  showActions?: boolean;
}

export function AlertCard({
  alert,
  isExpanded = false,
  onToggleExpanded,
  onAcknowledge,
  onResolve,
  showActions = true,
}: AlertCardProps) {
  const config = ALERT_SEVERITY_CONFIG[alert.severity];
  const Icon = getSeverityIcon(alert.severity);

  return (
    <Card className={cn(
      'p-4 border-l-4 transition-all',
      config.bgColor,
      config.borderColor,
      isExpanded && 'shadow-md'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn('p-2 rounded-lg bg-white/50')}>
            <Icon className={cn('w-5 h-5', config.iconColor)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn('font-bold', config.textColor)}>
                {alert.title}
              </h4>
              <Badge className={cn('text-xs', config.badgeColor)}>
                {config.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-700 mb-2">
              {alert.affectedMedicationNames.join(', ')}
            </p>
          </div>
        </div>
        {onToggleExpanded && (
          <Button variant="ghost" size="sm" onClick={onToggleExpanded}>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-3 pl-11">
        {alert.description}
      </p>

      {/* Suggested Action - Always visible for critical/high */}
      {(alert.severity === 'critical' || alert.severity === 'high' || isExpanded) && (
        <div className="mb-3 pl-11">
          <div className="p-3 bg-white/70 rounded-lg border border-gray-200">
            <p className="text-xs font-medium text-gray-900 mb-1">Suggested Action:</p>
            <p className="text-sm text-gray-700">{alert.suggestedAction}</p>
          </div>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="pt-3 border-t pl-11">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Alert Type:</p>
              <p className="font-medium text-gray-900">{alert.type.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Created:</p>
              <p className="font-medium text-gray-900">
                {new Date(alert.createdDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 mt-3 pl-11">
          {onAcknowledge && (
            <Button variant="outline" size="sm" onClick={onAcknowledge}>
              Acknowledge
            </Button>
          )}
          {onResolve && (
            <Button size="sm" onClick={onResolve}>
              Resolve
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT SUMMARY - Count badges
// ═══════════════════════════════════════════════════════════════════════════

interface AlertSummaryProps {
  alerts: MedicationAlert[];
  onFilterBySeverity?: (severity: AlertSeverity | null) => void;
  selectedSeverity?: AlertSeverity | null;
}

export function MedicationAlertSummary({ 
  alerts, 
  onFilterBySeverity,
  selectedSeverity,
}: AlertSummaryProps) {
  const activeAlerts = alerts.filter(a => a.status === 'active');
  
  const counts = {
    critical: activeAlerts.filter(a => a.severity === 'critical').length,
    high: activeAlerts.filter(a => a.severity === 'high').length,
    warning: activeAlerts.filter(a => a.severity === 'warning').length,
    info: activeAlerts.filter(a => a.severity === 'info').length,
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      <SeverityCard
        severity="critical"
        count={counts.critical}
        isSelected={selectedSeverity === 'critical'}
        onClick={() => onFilterBySeverity?.(selectedSeverity === 'critical' ? null : 'critical')}
      />
      <SeverityCard
        severity="high"
        count={counts.high}
        isSelected={selectedSeverity === 'high'}
        onClick={() => onFilterBySeverity?.(selectedSeverity === 'high' ? null : 'high')}
      />
      <SeverityCard
        severity="warning"
        count={counts.warning}
        isSelected={selectedSeverity === 'warning'}
        onClick={() => onFilterBySeverity?.(selectedSeverity === 'warning' ? null : 'warning')}
      />
      <SeverityCard
        severity="info"
        count={counts.info}
        isSelected={selectedSeverity === 'info'}
        onClick={() => onFilterBySeverity?.(selectedSeverity === 'info' ? null : 'info')}
      />
    </div>
  );
}

function SeverityCard({
  severity,
  count,
  isSelected,
  onClick,
}: {
  severity: AlertSeverity;
  count: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const config = ALERT_SEVERITY_CONFIG[severity];
  const Icon = getSeverityIcon(severity);

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all',
        isSelected ? `${config.bgColor} border-2 ${config.borderColor}` : 'hover:shadow-md'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900">{count}</div>
          <div className="text-xs text-gray-600">{config.label}</div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE ALERT - Compact inline version
// ═══════════════════════════════════════════════════════════════════════════

interface InlineAlertProps {
  alert: MedicationAlert;
  onDismiss?: () => void;
}

export function InlineAlert({ alert, onDismiss }: InlineAlertProps) {
  const config = ALERT_SEVERITY_CONFIG[alert.severity];
  const Icon = getSeverityIcon(alert.severity);

  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border',
      config.bgColor,
      config.borderColor
    )}>
      <Icon className={cn('w-4 h-4 flex-shrink-0 mt-0.5', config.iconColor)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', config.textColor)}>
          {alert.title}
        </p>
        <p className="text-xs text-gray-700 mt-0.5">
          {alert.affectedMedicationNames.join(', ')}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function getSeverityIcon(severity: AlertSeverity) {
  switch (severity) {
    case 'critical':
      return XCircle;
    case 'high':
      return AlertCircle;
    case 'warning':
      return AlertTriangle;
    case 'info':
      return Info;
  }
}
