/**
 * Documentation Quality Metrics Component
 * 
 * Comprehensive quality metrics dashboard including correction rate per
 * clinician, average completion time, QA turnaround time, and common
 * validation errors. Helps agencies improve documentation quality.
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ClinicianMetrics {
  clinicianId: string;
  clinicianName: string;
  discipline: string;
  documentsSubmitted: number;
  documentsReturned: number;
  correctionRate: number; // percentage
  avgCompletionTimeHours: number;
  commonErrors: string[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface ValidationError {
  errorType: string;
  category: string;
  occurrences: number;
  percentage: number;
  affectedClinicians: number;
}

export interface QualityMetricsSummary {
  overallCorrectionRate: number;
  avgCompletionTimeHours: number;
  avgQATurnaroundHours: number;
  totalDocumentsReviewed: number;
  trends: {
    correctionRate: number; // percentage change
    completionTime: number;
    turnaroundTime: number;
  };
}

export interface DocumentationQualityMetricsData {
  summary: QualityMetricsSummary;
  clinicianMetrics: ClinicianMetrics[];
  validationErrors: ValidationError[];
  timeframe: '7d' | '30d' | '90d';
  lastUpdated: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const TIMEFRAME_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
];

const ERROR_CATEGORIES = [
  'Missing Information',
  'Incorrect Data',
  'Compliance',
  'Documentation Quality',
  'Billing',
];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface DocumentationQualityMetricsProps {
  data: DocumentationQualityMetricsData;
  onTimeframeChange?: (timeframe: '7d' | '30d' | '90d') => void;
  onClinicianClick?: (clinicianId: string) => void;
  mode?: 'full' | 'compact';
}

export default function DocumentationQualityMetrics({
  data,
  onTimeframeChange,
  onClinicianClick,
  mode = 'full',
}: DocumentationQualityMetricsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState(data.timeframe);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string | null>(null);

  const handleTimeframeChange = (timeframe: '7d' | '30d' | '90d') => {
    setSelectedTimeframe(timeframe);
    onTimeframeChange?.(timeframe);
  };

  const filteredClinicians = selectedDiscipline
    ? data.clinicianMetrics.filter((c) => c.discipline === selectedDiscipline)
    : data.clinicianMetrics;

  const disciplines = Array.from(new Set(data.clinicianMetrics.map((c) => c.discipline)));

  if (mode === 'compact') {
    return <CompactMetrics data={data} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documentation Quality Metrics</h2>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {new Date(data.lastUpdated).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          {TIMEFRAME_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant="outline"
              size="sm"
              onClick={() => handleTimeframeChange(option.value as any)}
              className={cn(
                selectedTimeframe === option.value && 'bg-blue-100 border-blue-300 text-blue-700'
              )}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          label="Overall Correction Rate"
          value={`${data.summary.overallCorrectionRate}%`}
          icon={XCircle}
          color="red"
          trend={data.summary.trends.correctionRate}
          invertTrend
        />
        <MetricCard
          label="Avg Completion Time"
          value={`${data.summary.avgCompletionTimeHours}h`}
          icon={Clock}
          color="blue"
          trend={data.summary.trends.completionTime}
          invertTrend
        />
        <MetricCard
          label="Avg QA Turnaround"
          value={`${data.summary.avgQATurnaroundHours}h`}
          icon={TrendingUp}
          color="purple"
          trend={data.summary.trends.turnaroundTime}
          invertTrend
        />
        <MetricCard
          label="Documents Reviewed"
          value={data.summary.totalDocumentsReviewed}
          icon={FileText}
          color="green"
        />
      </div>

      {/* Clinician Performance */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Clinician Performance
          </h3>

          {/* Discipline Filter */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDiscipline(null)}
              className={cn(!selectedDiscipline && 'bg-blue-100 border-blue-300')}
            >
              All Disciplines
            </Button>
            {disciplines.map((discipline) => (
              <Button
                key={discipline}
                variant="outline"
                size="sm"
                onClick={() => setSelectedDiscipline(discipline)}
                className={cn(
                  selectedDiscipline === discipline && 'bg-blue-100 border-blue-300'
                )}
              >
                {discipline}
              </Button>
            ))}
          </div>
        </div>

        <ClinicianMetricsTable
          clinicians={filteredClinicians}
          onClinicianClick={onClinicianClick}
        />
      </Card>

      {/* Common Validation Errors */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Common Validation Errors
        </h3>

        <ValidationErrorsChart errors={data.validationErrors} />

        <div className="mt-4 space-y-2">
          {data.validationErrors.slice(0, 5).map((error, index) => (
            <ValidationErrorRow key={index} error={error} rank={index + 1} />
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// METRIC CARD
// ═══════════════════════════════════════════════════════════════════════════

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  invertTrend = false,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: number;
  invertTrend?: boolean;
}) {
  const colorClasses = {
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
  };

  const hasTrend = trend !== undefined && trend !== 0;
  const isTrendPositive = invertTrend ? trend! < 0 : trend! > 0;
  const isTrendNegative = invertTrend ? trend! > 0 : trend! < 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            colorClasses[color as keyof typeof colorClasses]
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {hasTrend && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-medium',
              isTrendPositive
                ? 'text-green-600'
                : isTrendNegative
                ? 'text-red-600'
                : 'text-gray-600'
            )}
          >
            {isTrendPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isTrendNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : null}
            {Math.abs(trend!)}%
          </div>
        )}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CLINICIAN METRICS TABLE
// ═══════════════════════════════════════════════════════════════════════════

function ClinicianMetricsTable({
  clinicians,
  onClinicianClick,
}: {
  clinicians: ClinicianMetrics[];
  onClinicianClick?: (clinicianId: string) => void;
}) {
  // Sort by correction rate (descending - highest first)
  const sortedClinicians = [...clinicians].sort((a, b) => b.correctionRate - a.correctionRate);

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Clinician</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
              Discipline
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
              Submitted
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
              Returned
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
              Correction Rate
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
              Avg Completion
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">Trend</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
              Common Errors
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedClinicians.map((clinician, index) => (
            <tr
              key={clinician.clinicianId}
              className={cn(
                'border-b last:border-0 hover:bg-gray-50 transition-colors',
                onClinicianClick && 'cursor-pointer'
              )}
              onClick={() => onClinicianClick?.(clinician.clinicianId)}
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="font-medium text-gray-900">{clinician.clinicianName}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                  {clinician.discipline}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center text-sm text-gray-900">
                {clinician.documentsSubmitted}
              </td>
              <td className="py-3 px-4 text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    clinician.documentsReturned > 0
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  )}
                >
                  {clinician.documentsReturned}
                </Badge>
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span
                    className={cn(
                      'font-semibold',
                      clinician.correctionRate > 30
                        ? 'text-red-700'
                        : clinician.correctionRate > 15
                        ? 'text-amber-700'
                        : 'text-green-700'
                    )}
                  >
                    {clinician.correctionRate}%
                  </span>
                  {clinician.correctionRate > 30 ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : clinician.correctionRate > 15 ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center text-sm text-gray-900">
                {clinician.avgCompletionTimeHours}h
              </td>
              <td className="py-3 px-4 text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    clinician.trend === 'improving'
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : clinician.trend === 'declining'
                      ? 'bg-red-100 text-red-700 border-red-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300'
                  )}
                >
                  {clinician.trend}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1 justify-center">
                  {clinician.commonErrors.slice(0, 2).map((error, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-300 text-xs"
                    >
                      {error}
                    </Badge>
                  ))}
                  {clinician.commonErrors.length > 2 && (
                    <span className="text-xs text-gray-600">
                      +{clinician.commonErrors.length - 2}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION ERRORS CHART
// ═══════════════════════════════════════════════════════════════════════════

function ValidationErrorsChart({ errors }: { errors: ValidationError[] }) {
  const maxOccurrences = Math.max(...errors.map((e) => e.occurrences));
  const chartHeight = 200;

  return (
    <div className="mb-4">
      <div className="relative" style={{ height: chartHeight }}>
        {/* Y-axis */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600">
          <span>{maxOccurrences}</span>
          <span>{Math.floor(maxOccurrences / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart bars */}
        <div className="ml-8 h-full flex items-end justify-between gap-2">
          {errors.slice(0, 10).map((error, index) => {
            const barHeight = (error.occurrences / maxOccurrences) * chartHeight;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-red-500 rounded-t hover:bg-red-600 transition-colors relative group"
                  style={{ height: barHeight }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {error.occurrences} occurrences
                  </div>
                </div>
                <span className="text-xs text-gray-600 text-center line-clamp-2">
                  {error.errorType}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION ERROR ROW
// ═══════════════════════════════════════════════════════════════════════════

function ValidationErrorRow({ error, rank }: { error: ValidationError; rank: number }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm flex-shrink-0">
        {rank}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900">{error.errorType}</span>
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
            {error.category}
          </Badge>
        </div>
        <div className="text-xs text-gray-600">
          {error.occurrences} occurrences • {error.affectedClinicians} clinician
          {error.affectedClinicians !== 1 ? 's' : ''} affected
        </div>
      </div>

      <div className="text-right">
        <div className="text-lg font-bold text-red-700">{error.percentage}%</div>
        <div className="text-xs text-gray-600">of total</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT METRICS
// ═══════════════════════════════════════════════════════════════════════════

function CompactMetrics({ data }: { data: DocumentationQualityMetricsData }) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-900 mb-3 text-sm">Quality Metrics</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Correction Rate</span>
          <span
            className={cn(
              'font-semibold',
              data.summary.overallCorrectionRate > 20 ? 'text-red-700' : 'text-green-700'
            )}
          >
            {data.summary.overallCorrectionRate}%
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Avg Completion</span>
          <span className="font-semibold text-gray-900">
            {data.summary.avgCompletionTimeHours}h
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">QA Turnaround</span>
          <span className="font-semibold text-gray-900">
            {data.summary.avgQATurnaroundHours}h
          </span>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockDocumentationQualityMetrics(): DocumentationQualityMetricsData {
  return {
    summary: {
      overallCorrectionRate: 18.5,
      avgCompletionTimeHours: 4.2,
      avgQATurnaroundHours: 6.8,
      totalDocumentsReviewed: 342,
      trends: {
        correctionRate: -5.2, // Improving (down 5.2%)
        completionTime: -8.1, // Improving (down 8.1%)
        turnaroundTime: 3.5, // Declining (up 3.5%)
      },
    },
    clinicianMetrics: [
      {
        clinicianId: 'clin-1',
        clinicianName: 'Emily Chen, RN',
        discipline: 'SN',
        documentsSubmitted: 45,
        documentsReturned: 12,
        correctionRate: 26.7,
        avgCompletionTimeHours: 5.2,
        commonErrors: ['Missing Vitals', 'Incomplete Assessment'],
        trend: 'declining',
      },
      {
        clinicianId: 'clin-2',
        clinicianName: 'Michael Johnson, PT',
        discipline: 'PT',
        documentsSubmitted: 38,
        documentsReturned: 4,
        correctionRate: 10.5,
        avgCompletionTimeHours: 3.8,
        commonErrors: ['Documentation Quality'],
        trend: 'improving',
      },
      {
        clinicianId: 'clin-3',
        clinicianName: 'Sarah Williams, OT',
        discipline: 'OT',
        documentsSubmitted: 32,
        documentsReturned: 6,
        correctionRate: 18.8,
        avgCompletionTimeHours: 4.5,
        commonErrors: ['Missing Information', 'Billing'],
        trend: 'stable',
      },
      {
        clinicianId: 'clin-4',
        clinicianName: 'David Brown, SLP',
        discipline: 'SLP',
        documentsSubmitted: 28,
        documentsReturned: 2,
        correctionRate: 7.1,
        avgCompletionTimeHours: 3.2,
        commonErrors: [],
        trend: 'improving',
      },
      {
        clinicianId: 'clin-5',
        clinicianName: 'Lisa Anderson, MSW',
        discipline: 'MSW',
        documentsSubmitted: 25,
        documentsReturned: 8,
        correctionRate: 32.0,
        avgCompletionTimeHours: 6.1,
        commonErrors: ['Incomplete Assessment', 'Documentation Quality', 'Compliance'],
        trend: 'declining',
      },
    ],
    validationErrors: [
      {
        errorType: 'Missing Vital Signs',
        category: 'Missing Information',
        occurrences: 28,
        percentage: 22.4,
        affectedClinicians: 8,
      },
      {
        errorType: 'Incomplete Clinical Assessment',
        category: 'Documentation Quality',
        occurrences: 24,
        percentage: 19.2,
        affectedClinicians: 12,
      },
      {
        errorType: 'Outdated Medication List',
        category: 'Incorrect Data',
        occurrences: 18,
        percentage: 14.4,
        affectedClinicians: 6,
      },
      {
        errorType: 'Missing Homebound Justification',
        category: 'Billing',
        occurrences: 15,
        percentage: 12.0,
        affectedClinicians: 9,
      },
      {
        errorType: 'Missing Signature',
        category: 'Compliance',
        occurrences: 12,
        percentage: 9.6,
        affectedClinicians: 5,
      },
      {
        errorType: 'Inadequate Patient Education Documentation',
        category: 'Documentation Quality',
        occurrences: 10,
        percentage: 8.0,
        affectedClinicians: 7,
      },
      {
        errorType: 'Missing Visit Frequency Justification',
        category: 'Billing',
        occurrences: 8,
        percentage: 6.4,
        affectedClinicians: 4,
      },
      {
        errorType: 'Incomplete Wound Assessment',
        category: 'Documentation Quality',
        occurrences: 6,
        percentage: 4.8,
        affectedClinicians: 3,
      },
      {
        errorType: 'Missing Progress Toward Goals',
        category: 'Documentation Quality',
        occurrences: 4,
        percentage: 3.2,
        affectedClinicians: 2,
      },
    ],
    timeframe: '30d',
    lastUpdated: new Date().toISOString(),
  };
}
