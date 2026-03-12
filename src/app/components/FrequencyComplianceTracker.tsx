/**
 * Frequency Compliance Tracker Component
 * 
 * Compact tracker for admission dashboards that compares:
 * - Ordered visits by discipline
 * - Scheduled visits
 * - Completed visits
 * - Missed visits
 * 
 * Displays warnings when visit frequency is falling behind care plan.
 * Designed for care coordinators and clinicians.
 */

import { useState, useMemo } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import {
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Calendar,
  Clock,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ChevronRight,
  Info,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { VisitFrequencyTracking } from '../services/visitFrequency';
import { DISCIPLINE_CONFIG } from '../services/carePlan';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface FrequencyComplianceTrackerProps {
  trackings: VisitFrequencyTracking[];
  admissionId?: string;
  showTitle?: boolean;
  compact?: boolean;
  onViewDetails?: () => void;
}

type ViewMode = 'overview' | 'detailed';

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function FrequencyComplianceTracker({
  trackings,
  admissionId,
  showTitle = true,
  compact = false,
  onViewDetails,
}: FrequencyComplianceTrackerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  // Calculate summary stats
  const summary = useMemo(() => {
    const totalDisciplines = trackings.length;
    const compliantDisciplines = trackings.filter(
      t => t.complianceStatus === 'on-track' || t.complianceStatus === 'ahead'
    ).length;
    const behindDisciplines = trackings.filter(t => t.complianceStatus === 'behind').length;
    const criticalDisciplines = trackings.filter(t => t.complianceStatus === 'critical').length;
    const totalExpected = trackings.reduce((sum, t) => sum + t.frequency.totalExpectedVisits, 0);
    const totalCompleted = trackings.reduce((sum, t) => sum + t.completedVisits, 0);
    const totalScheduled = trackings.reduce((sum, t) => sum + t.scheduledVisits, 0);
    const totalMissed = trackings.reduce((sum, t) => sum + t.missedVisits, 0);
    const totalExpectedToDate = trackings.reduce((sum, t) => sum + t.expectedToDate, 0);
    const overallCompliance = totalExpectedToDate > 0 
      ? Math.min(100, Math.round((totalCompleted / totalExpectedToDate) * 100))
      : 100;
    
    // Critical warnings
    const warnings = trackings.flatMap(t => 
      t.alerts.filter(a => a.severity === 'critical' || a.severity === 'warning')
    );

    return {
      totalDisciplines,
      compliantDisciplines,
      behindDisciplines,
      criticalDisciplines,
      totalExpected,
      totalCompleted,
      totalScheduled,
      totalMissed,
      totalExpectedToDate,
      overallCompliance,
      warnings,
      hasIssues: behindDisciplines > 0 || criticalDisciplines > 0,
    };
  }, [trackings]);

  if (compact) {
    return <CompactView trackings={trackings} summary={summary} onViewDetails={onViewDetails} />;
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      {showTitle && (
        <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Visit Frequency Compliance</h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Tracking ordered vs actual visit activity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'overview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('overview')}
            >
              Overview
            </Button>
            <Button
              variant={viewMode === 'detailed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('detailed')}
            >
              Detailed
            </Button>
            {onViewDetails && (
              <Button variant="outline" size="sm" onClick={onViewDetails}>
                Full View
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        {viewMode === 'overview' ? (
          <OverviewMode trackings={trackings} summary={summary} />
        ) : (
          <DetailedMode trackings={trackings} />
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT VIEW (for embedding in dashboards)
// ═══════════════════════════════════════════════════════════════════════════

interface CompactViewProps {
  trackings: VisitFrequencyTracking[];
  summary: any;
  onViewDetails?: () => void;
}

function CompactView({ trackings, summary, onViewDetails }: CompactViewProps) {
  return (
    <Card className={cn(
      'p-4',
      summary.hasIssues && 'border-l-4 border-l-amber-500'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-sm text-gray-900">Visit Frequency</h4>
            {summary.hasIssues && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                {summary.criticalDisciplines > 0 ? 'Critical' : 'Behind'}
              </Badge>
            )}
            {!summary.hasIssues && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                On Track
              </Badge>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3 mb-3">
            <div>
              <div className="text-xs text-gray-600">Ordered</div>
              <div className="text-lg font-bold text-gray-900">{summary.totalExpected}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Completed</div>
              <div className="text-lg font-bold text-green-700">{summary.totalCompleted}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Scheduled</div>
              <div className="text-lg font-bold text-blue-700">{summary.totalScheduled}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600">Missed</div>
              <div className="text-lg font-bold text-red-700">{summary.totalMissed}</div>
            </div>
          </div>

          {/* Compliance Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Overall Compliance</span>
              <span className="font-semibold text-gray-900">{summary.overallCompliance}%</span>
            </div>
            <Progress 
              value={summary.overallCompliance} 
              className={cn(
                'h-2',
                summary.overallCompliance < 70 && '[&>div]:bg-red-500',
                summary.overallCompliance >= 70 && summary.overallCompliance < 90 && '[&>div]:bg-amber-500',
                summary.overallCompliance >= 90 && '[&>div]:bg-green-500'
              )}
            />
          </div>

          {/* Discipline Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {trackings.map(tracking => (
              <DisciplinePill key={tracking.frequency.id} tracking={tracking} />
            ))}
          </div>

          {/* Warnings */}
          {summary.warnings.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-amber-900">
                    {summary.warnings.length} Active Alert{summary.warnings.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-700 mt-0.5">
                    {summary.warnings[0]?.message}
                    {summary.warnings.length > 1 && ` +${summary.warnings.length - 1} more`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {onViewDetails && (
          <Button variant="ghost" size="sm" onClick={onViewDetails}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// OVERVIEW MODE
// ═══════════════════════════════════════════════════════════════════════════

function OverviewMode({ trackings, summary }: { trackings: VisitFrequencyTracking[]; summary: any }) {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-3">
        <SummaryCard
          icon={<Calendar className="w-4 h-4 text-blue-600" />}
          label="Total Ordered"
          value={summary.totalExpected}
          subValue="visits"
          bgColor="bg-blue-50"
        />
        <SummaryCard
          icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
          label="Completed"
          value={summary.totalCompleted}
          subValue={`${summary.overallCompliance}% compliance`}
          bgColor="bg-green-50"
        />
        <SummaryCard
          icon={<Clock className="w-4 h-4 text-purple-600" />}
          label="Scheduled"
          value={summary.totalScheduled}
          subValue="upcoming"
          bgColor="bg-purple-50"
        />
        <SummaryCard
          icon={<XCircle className="w-4 h-4 text-red-600" />}
          label="Missed"
          value={summary.totalMissed}
          subValue="requires follow-up"
          bgColor="bg-red-50"
          highlight={summary.totalMissed > 0}
        />
      </div>

      {/* Overall Progress */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm text-gray-900">Overall Compliance</h4>
          <div className="text-2xl font-bold text-gray-900">{summary.overallCompliance}%</div>
        </div>
        <Progress 
          value={summary.overallCompliance} 
          className="h-3 mb-2"
        />
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>{summary.totalCompleted} of {summary.totalExpectedToDate} expected completed</span>
          <span>{summary.totalExpected - summary.totalCompleted} remaining</span>
        </div>
      </div>

      {/* Compliance Status Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border rounded-lg p-3 bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-900">On Track</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{summary.compliantDisciplines}</div>
          <div className="text-xs text-green-700">discipline{summary.compliantDisciplines !== 1 ? 's' : ''}</div>
        </div>
        <div className="border rounded-lg p-3 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-900">Behind</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">{summary.behindDisciplines}</div>
          <div className="text-xs text-amber-700">discipline{summary.behindDisciplines !== 1 ? 's' : ''}</div>
        </div>
        <div className="border rounded-lg p-3 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-xs font-medium text-red-900">Critical</span>
          </div>
          <div className="text-2xl font-bold text-red-900">{summary.criticalDisciplines}</div>
          <div className="text-xs text-red-700">discipline{summary.criticalDisciplines !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* Active Warnings */}
      {summary.warnings.length > 0 && (
        <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm text-amber-900">
                {summary.warnings.length} Active Warning{summary.warnings.length !== 1 ? 's' : ''}
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Requires immediate attention to maintain compliance
              </p>
            </div>
          </div>
          <div className="space-y-2 mt-3">
            {summary.warnings.slice(0, 3).map((warning: any, idx: number) => (
              <div key={idx} className="text-sm text-amber-900 flex items-start gap-2">
                <div className={cn(
                  'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                  warning.severity === 'critical' ? 'bg-red-600' : 'bg-amber-600'
                )} />
                <span>{warning.message}</span>
              </div>
            ))}
            {summary.warnings.length > 3 && (
              <p className="text-xs text-amber-700">
                +{summary.warnings.length - 3} more warning{summary.warnings.length - 3 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Discipline Breakdown - Compact */}
      <div className="space-y-2">
        <h4 className="font-semibold text-sm text-gray-900">By Discipline</h4>
        {trackings.map(tracking => (
          <DisciplineRow key={tracking.frequency.id} tracking={tracking} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DETAILED MODE
// ═══════════════════════════════════════════════════════════════════════════

function DetailedMode({ trackings }: { trackings: VisitFrequencyTracking[] }) {
  return (
    <div className="space-y-3">
      {trackings.map(tracking => (
        <DisciplineDetailCard key={tracking.frequency.id} tracking={tracking} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function SummaryCard({
  icon,
  label,
  value,
  subValue,
  bgColor,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subValue: string;
  bgColor: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn('border rounded-lg p-3', bgColor, highlight && 'ring-2 ring-red-300')}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600">{subValue}</div>
    </div>
  );
}

function DisciplinePill({ tracking }: { tracking: VisitFrequencyTracking }) {
  const config = DISCIPLINE_CONFIG[tracking.frequency.discipline];
  const statusColor = {
    'on-track': 'bg-green-100 border-green-300',
    'ahead': 'bg-blue-100 border-blue-300',
    'behind': 'bg-amber-100 border-amber-300',
    'critical': 'bg-red-100 border-red-300',
  }[tracking.complianceStatus];

  return (
    <div className={cn('px-2 py-1 rounded-full border text-xs font-medium flex items-center gap-1', statusColor)}>
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      <span>{config.abbreviation}</span>
      <span className="text-gray-600">{tracking.completedVisits}/{tracking.frequency.totalExpectedVisits}</span>
    </div>
  );
}

function DisciplineRow({ tracking }: { tracking: VisitFrequencyTracking }) {
  const config = DISCIPLINE_CONFIG[tracking.frequency.discipline];
  const completionPct = (tracking.completedVisits / tracking.frequency.totalExpectedVisits) * 100;
  
  return (
    <div className="border rounded-lg p-3">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: config.color }}
        >
          {config.abbreviation}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-gray-900">{config.label}</span>
            <Badge variant="outline" className="text-xs font-mono">
              {tracking.frequency.frequencyCode}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-gray-900">
            {tracking.completedVisits}/{tracking.frequency.totalExpectedVisits}
          </div>
          <div className="text-xs text-gray-600">{Math.round(completionPct)}%</div>
        </div>
      </div>

      <Progress value={completionPct} className="h-1.5 mb-2" />

      <div className="grid grid-cols-4 gap-2 text-xs">
        <div>
          <div className="text-gray-600">Expected</div>
          <div className="font-semibold text-gray-900">{tracking.expectedToDate}</div>
        </div>
        <div>
          <div className="text-gray-600">Scheduled</div>
          <div className="font-semibold text-blue-700">{tracking.scheduledVisits}</div>
        </div>
        <div>
          <div className="text-gray-600">Completed</div>
          <div className="font-semibold text-green-700">{tracking.completedVisits}</div>
        </div>
        <div>
          <div className="text-gray-600">Missed</div>
          <div className="font-semibold text-red-700">{tracking.missedVisits}</div>
        </div>
      </div>

      {tracking.alerts.length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-900">{tracking.alerts[0].message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DisciplineDetailCard({ tracking }: { tracking: VisitFrequencyTracking }) {
  const config = DISCIPLINE_CONFIG[tracking.frequency.discipline];
  
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: config.color }}
          >
            {config.abbreviation}
          </div>
          <div>
            <h5 className="font-semibold text-gray-900">{config.label}</h5>
            <p className="text-xs text-gray-600">
              {tracking.frequency.visitsPerWeek}x/week for {tracking.frequency.durationWeeks} weeks
            </p>
          </div>
        </div>
        <Badge className={cn(
          tracking.complianceStatus === 'on-track' && 'bg-green-100 text-green-800',
          tracking.complianceStatus === 'ahead' && 'bg-blue-100 text-blue-800',
          tracking.complianceStatus === 'behind' && 'bg-amber-100 text-amber-800',
          tracking.complianceStatus === 'critical' && 'bg-red-100 text-red-800',
        )}>
          {tracking.complianceStatus === 'on-track' && 'On Track'}
          {tracking.complianceStatus === 'ahead' && 'Ahead'}
          {tracking.complianceStatus === 'behind' && 'Behind'}
          {tracking.complianceStatus === 'critical' && 'Critical'}
        </Badge>
      </div>

      {/* Body */}
      <div className="p-3 space-y-3">
        {/* Visit Comparison */}
        <div className="grid grid-cols-4 gap-3">
          <ComparisonMetric
            label="Ordered"
            value={tracking.frequency.totalExpectedVisits}
            icon={<Calendar className="w-3 h-3 text-gray-600" />}
          />
          <ComparisonMetric
            label="Scheduled"
            value={tracking.scheduledVisits}
            icon={<Clock className="w-3 h-3 text-blue-600" />}
            status={tracking.scheduledVisits < tracking.remainingExpectedVisits ? 'warning' : undefined}
          />
          <ComparisonMetric
            label="Completed"
            value={tracking.completedVisits}
            icon={<CheckCircle2 className="w-3 h-3 text-green-600" />}
          />
          <ComparisonMetric
            label="Missed"
            value={tracking.missedVisits}
            icon={<XCircle className="w-3 h-3 text-red-600" />}
            status={tracking.missedVisits > 0 ? 'error' : undefined}
          />
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-600">Completion Progress</span>
            <span className="font-semibold text-gray-900">
              {tracking.completedVisits}/{tracking.frequency.totalExpectedVisits} ({tracking.compliancePercentage}%)
            </span>
          </div>
          <Progress 
            value={(tracking.completedVisits / tracking.frequency.totalExpectedVisits) * 100} 
            className="h-2"
          />
        </div>

        {/* Expected vs Actual */}
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-600">Expected to Date</span>
            <span className="text-sm font-semibold text-gray-900">{tracking.expectedToDate}</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-600">Actual Completed</span>
            <span className="text-sm font-semibold text-gray-900">{tracking.completedVisits}</span>
          </div>
          <div className="pt-1.5 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">Variance</span>
              <span className={cn(
                'text-sm font-bold',
                tracking.variance >= 0 ? 'text-green-700' : 'text-red-700'
              )}>
                {tracking.variance >= 0 ? '+' : ''}{tracking.variance}
              </span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {tracking.alerts.length > 0 && (
          <div className="space-y-1.5">
            {tracking.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={cn(
                  'p-2 rounded border flex items-start gap-2 text-xs',
                  alert.severity === 'critical' && 'bg-red-50 border-red-200',
                  alert.severity === 'warning' && 'bg-amber-50 border-amber-200',
                  alert.severity === 'info' && 'bg-blue-50 border-blue-200'
                )}
              >
                {alert.severity === 'critical' && <AlertCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />}
                {alert.severity === 'warning' && <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />}
                {alert.severity === 'info' && <Info className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  {alert.details && <p className="text-gray-700 mt-0.5">{alert.details}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ComparisonMetric({
  label,
  value,
  icon,
  status,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  status?: 'warning' | 'error';
}) {
  return (
    <div className={cn(
      'border rounded p-2',
      status === 'warning' && 'border-amber-300 bg-amber-50',
      status === 'error' && 'border-red-300 bg-red-50',
      !status && 'bg-white'
    )}>
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  );
}
