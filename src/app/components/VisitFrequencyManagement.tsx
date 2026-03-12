/**
 * Visit Frequency Management Component
 * 
 * Displays and tracks visit frequencies by discipline for active admission.
 * Shows compliance status and highlights mismatches.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  FileText,
  Plus,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  User,
  Activity,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type {
  VisitFrequencyTracking,
  ComplianceStatus,
  FrequencyAlert,
} from '../services/visitFrequency';
import {
  VisitFrequencyService,
  getMockFrequencyTracking,
  getFrequencyDescription,
  DISCIPLINE_CONFIG,
} from '../services/visitFrequency';
import { DISCIPLINE_CONFIG as CARE_PLAN_DISCIPLINE_CONFIG } from '../services/carePlan';

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const COMPLIANCE_STATUS_CONFIG: Record<
  ComplianceStatus,
  { label: string; color: string; icon: React.ReactNode; bgColor: string }
> = {
  'on-track': {
    label: 'On Track',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    icon: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  },
  ahead: {
    label: 'Ahead',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
  },
  behind: {
    label: 'Behind',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
    icon: <TrendingDown className="w-4 h-4 text-amber-600" />,
  },
  critical: {
    label: 'Critical',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    icon: <AlertCircle className="w-4 h-4 text-red-600" />,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function VisitFrequencyManagement() {
  const [trackings] = useState<VisitFrequencyTracking[]>(getMockFrequencyTracking());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const overallStats = useMemo(
    () => VisitFrequencyService.calculateOverallCompliance(trackings),
    [trackings]
  );

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Visit Frequency Management</h2>
        <p className="text-sm text-gray-600 mt-1">
          Track ordered frequencies and ensure care delivery matches plan of care
        </p>
      </div>

      {/* Overall Compliance Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Overall Compliance</h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-gray-900">
              {overallStats.overallPercentage}%
            </span>
          </div>
        </div>

        <Progress value={overallStats.overallPercentage} className="h-3 mb-4" />

        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">{overallStats.onTrack}</span>
            </div>
            <p className="text-xs text-gray-600">On Track</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span className="text-2xl font-bold text-gray-900">{overallStats.behind}</span>
            </div>
            <p className="text-xs text-gray-600">Behind</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-2xl font-bold text-gray-900">{overallStats.critical}</span>
            </div>
            <p className="text-xs text-gray-600">Critical</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Activity className="w-4 h-4 text-gray-600" />
              <span className="text-2xl font-bold text-gray-900">{overallStats.totalAlerts}</span>
            </div>
            <p className="text-xs text-gray-600">Active Alerts</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Frequency
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          Showing {trackings.length} active frequenc{trackings.length === 1 ? 'y' : 'ies'}
        </div>
      </div>

      {/* Frequency Cards */}
      <div className="space-y-3">
        {trackings.map(tracking => (
          <FrequencyCard
            key={tracking.frequency.id}
            tracking={tracking}
            expanded={expandedIds.has(tracking.frequency.id)}
            onToggleExpand={() => toggleExpand(tracking.frequency.id)}
          />
        ))}
      </div>

      {trackings.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <h4 className="font-semibold text-gray-900 mb-1">No Visit Frequencies Defined</h4>
            <p className="text-sm text-gray-600 mb-4">
              Add visit frequencies to track compliance with plan of care
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add First Frequency
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FREQUENCY CARD
// ═══════════════════════════════════════════════════════════════════════════

interface FrequencyCardProps {
  tracking: VisitFrequencyTracking;
  expanded: boolean;
  onToggleExpand: () => void;
}

function FrequencyCard({ tracking, expanded, onToggleExpand }: FrequencyCardProps) {
  const { frequency, complianceStatus, compliancePercentage, alerts } = tracking;
  const statusConfig = COMPLIANCE_STATUS_CONFIG[complianceStatus];
  const disciplineConfig = CARE_PLAN_DISCIPLINE_CONFIG[frequency.discipline];
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  return (
    <Card className={cn('overflow-hidden border-l-4', statusConfig.bgColor)}>
      {/* Header */}
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <button className="mt-1" onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}>
              {expanded ? (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: disciplineConfig.color }}
            >
              {disciplineConfig.abbreviation}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-bold text-gray-900">{disciplineConfig.label}</h4>
                <Badge variant="outline" className="font-mono text-xs">
                  {frequency.frequencyCode}
                </Badge>
                <Badge className={cn('text-xs', statusConfig.color)}>
                  {statusConfig.label}
                </Badge>
                {criticalAlerts.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {criticalAlerts.length} Critical Alert{criticalAlerts.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                {warningAlerts.length > 0 && (
                  <Badge className="bg-amber-600 text-white text-xs">
                    {warningAlerts.length} Warning{warningAlerts.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <p className="text-sm text-gray-700 mb-2">
                {getFrequencyDescription(frequency.visitsPerWeek, frequency.durationWeeks)}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(frequency.startDate).toLocaleDateString()} -{' '}
                  {new Date(frequency.endDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {frequency.orderedBy}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{compliancePercentage}%</div>
              <div className="text-xs text-gray-600">Compliance</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {tracking.completedVisits}/{tracking.frequency.totalExpectedVisits}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Visit Progress</span>
            <span className="text-gray-900 font-medium">
              {tracking.completedVisits} of {tracking.frequency.totalExpectedVisits} visits
            </span>
          </div>
          <Progress
            value={(tracking.completedVisits / tracking.frequency.totalExpectedVisits) * 100}
            className="h-2"
          />
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t bg-gray-50 p-4 space-y-4">
          {/* Visit Statistics */}
          <div>
            <h5 className="font-semibold text-sm text-gray-900 mb-3">Visit Statistics</h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox
                icon={<FileText className="w-4 h-4 text-blue-600" />}
                label="Ordered Frequency"
                value={`${frequency.visitsPerWeek}x/week`}
                subValue={`${frequency.durationWeeks} weeks`}
              />
              <MetricBox
                icon={<Calendar className="w-4 h-4 text-purple-600" />}
                label="Scheduled Visits"
                value={tracking.scheduledVisits.toString()}
                subValue="Upcoming"
                highlight={tracking.scheduledVisits < tracking.remainingExpectedVisits ? 'warning' : undefined}
              />
              <MetricBox
                icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
                label="Completed Visits"
                value={tracking.completedVisits.toString()}
                subValue={`of ${tracking.frequency.totalExpectedVisits} total`}
              />
              <MetricBox
                icon={<Activity className="w-4 h-4 text-gray-600" />}
                label="Remaining Expected"
                value={tracking.remainingExpectedVisits.toString()}
                subValue="To complete"
              />
            </div>
          </div>

          {/* Timeline Progress */}
          <div>
            <h5 className="font-semibold text-sm text-gray-900 mb-3">Timeline Progress</h5>
            <div className="grid grid-cols-3 gap-4">
              <MetricBox
                icon={<Clock className="w-4 h-4 text-blue-600" />}
                label="Weeks Elapsed"
                value={tracking.weeksElapsed.toFixed(1)}
                subValue={`of ${frequency.durationWeeks} weeks`}
              />
              <MetricBox
                icon={<TrendingUp className="w-4 h-4 text-green-600" />}
                label="Expected to Date"
                value={tracking.expectedToDate.toString()}
                subValue="visits expected"
              />
              <MetricBox
                icon={tracking.variance >= 0 ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                label="Variance"
                value={`${tracking.variance >= 0 ? '+' : ''}${tracking.variance}`}
                subValue={tracking.variance >= 0 ? 'ahead of pace' : 'behind pace'}
                highlight={tracking.variance < 0 ? 'warning' : undefined}
              />
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div>
              <h5 className="font-semibold text-sm text-gray-900 mb-3">
                Alerts ({alerts.length})
              </h5>
              <div className="space-y-2">
                {alerts.map((alert, idx) => (
                  <AlertItem key={idx} alert={alert} />
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {frequency.notes && (
            <div>
              <h5 className="font-semibold text-sm text-gray-900 mb-2">Notes</h5>
              <p className="text-sm text-gray-700">{frequency.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm">
              View Visit History
            </Button>
            <Button variant="outline" size="sm">
              Schedule Visits
            </Button>
            <Button variant="outline" size="sm">
              Edit Frequency
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// METRIC BOX
// ═══════════════════════════════════════════════════════════════════════════

interface MetricBoxProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  highlight?: 'warning' | 'error';
}

function MetricBox({ icon, label, value, subValue, highlight }: MetricBoxProps) {
  return (
    <div
      className={cn(
        'p-3 border rounded-lg bg-white',
        highlight === 'warning' && 'border-amber-300 bg-amber-50',
        highlight === 'error' && 'border-red-300 bg-red-50'
      )}
    >
      <div className="flex items-start gap-2 mb-1">
        {icon}
        <div className="flex-1">
          <p className="text-xs text-gray-600">{label}</p>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          {subValue && <p className="text-xs text-gray-600">{subValue}</p>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALERT ITEM
// ═══════════════════════════════════════════════════════════════════════════

interface AlertItemProps {
  alert: FrequencyAlert;
}

function AlertItem({ alert }: AlertItemProps) {
  const severityConfig = {
    critical: {
      icon: <AlertCircle className="w-4 h-4 text-red-600" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
    },
    info: {
      icon: <AlertCircle className="w-4 h-4 text-blue-600" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
    },
  };

  const config = severityConfig[alert.severity];

  return (
    <div
      className={cn(
        'p-3 border rounded-lg flex items-start gap-2',
        config.bgColor,
        config.borderColor
      )}
    >
      {config.icon}
      <div className="flex-1">
        <p className={cn('font-medium text-sm', config.textColor)}>{alert.message}</p>
        {alert.details && <p className="text-xs text-gray-700 mt-0.5">{alert.details}</p>}
      </div>
    </div>
  );
}
