/**
 * QA Performance Dashboard Component
 * 
 * Performance dashboard displaying key QA metrics including documents reviewed,
 * pending review, average turnaround time, documents returned, and approved.
 * Provides visual charts to help administrators monitor QA performance.
 */

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import {
  Eye,
  Clock,
  XCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { cn } from '../lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface QAPerformanceMetrics {
  reviewedToday: number;
  pendingReview: number;
  averageTurnaroundHours: number;
  returned: number;
  approved: number;
  trends: {
    reviewedToday: number; // percentage change from yesterday
    pendingReview: number;
    averageTurnaround: number;
    returned: number;
    approved: number;
  };
}

export interface QAReviewerPerformance {
  reviewerName: string;
  reviewed: number;
  approved: number;
  returned: number;
  avgTurnaroundHours: number;
}

export interface QADailyTrend {
  date: string;
  reviewed: number;
  approved: number;
  returned: number;
}

export interface QADocumentTypeBreakdown {
  documentType: string;
  count: number;
  percentage: number;
}

export interface QAPerformanceDashboardData {
  metrics: QAPerformanceMetrics;
  reviewerPerformance: QAReviewerPerformance[];
  dailyTrends: QADailyTrend[]; // Last 7 days
  documentTypeBreakdown: QADocumentTypeBreakdown[];
  currentDate: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface QAPerformanceDashboardProps {
  data: QAPerformanceDashboardData;
  mode?: 'full' | 'compact';
}

export default function QAPerformanceDashboard({
  data,
  mode = 'full',
}: QAPerformanceDashboardProps) {
  if (mode === 'compact') {
    return <CompactDashboard data={data} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">QA Performance Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">
          {new Date(data.currentDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-5 gap-4">
        <MetricCard
          label="Reviewed Today"
          value={data.metrics.reviewedToday}
          icon={Eye}
          color="blue"
          trend={data.metrics.trends.reviewedToday}
        />
        <MetricCard
          label="Pending Review"
          value={data.metrics.pendingReview}
          icon={Clock}
          color="amber"
          trend={data.metrics.trends.pendingReview}
          invertTrend
        />
        <MetricCard
          label="Avg Turnaround"
          value={`${data.metrics.averageTurnaroundHours}h`}
          icon={TrendingUp}
          color="purple"
          trend={data.metrics.trends.averageTurnaround}
          invertTrend
        />
        <MetricCard
          label="Returned"
          value={data.metrics.returned}
          icon={XCircle}
          color="red"
          trend={data.metrics.trends.returned}
          invertTrend
        />
        <MetricCard
          label="Approved"
          value={data.metrics.approved}
          icon={CheckCircle}
          color="green"
          trend={data.metrics.trends.approved}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Daily Trends Chart */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            7-Day Trend
          </h3>
          <DailyTrendsChart trends={data.dailyTrends} />
        </Card>

        {/* Document Type Breakdown */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Type Breakdown
          </h3>
          <DocumentTypeChart breakdown={data.documentTypeBreakdown} />
        </Card>
      </div>

      {/* Reviewer Performance Table */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Reviewer Performance
        </h3>
        <ReviewerPerformanceTable reviewers={data.reviewerPerformance} />
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
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
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
              isTrendPositive ? 'text-green-600' : isTrendNegative ? 'text-red-600' : 'text-gray-600'
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
// DAILY TRENDS CHART
// ═══════════════════════════════════════════════════════════════════════════

function DailyTrendsChart({ trends }: { trends: QADailyTrend[] }) {
  const maxValue = Math.max(...trends.map((t) => Math.max(t.reviewed, t.approved, t.returned)));
  const chartHeight = 200;

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative" style={{ height: chartHeight }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600">
          <span>{maxValue}</span>
          <span>{Math.floor(maxValue / 2)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-8 h-full flex items-end justify-between gap-2">
          {trends.map((trend, index) => {
            const reviewedHeight = (trend.reviewed / maxValue) * chartHeight;
            const approvedHeight = (trend.approved / maxValue) * chartHeight;
            const returnedHeight = (trend.returned / maxValue) * chartHeight;

            return (
              <div key={trend.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center gap-0.5" style={{ height: chartHeight }}>
                  {/* Reviewed */}
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                    style={{ height: reviewedHeight }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Reviewed: {trend.reviewed}
                    </div>
                  </div>
                  {/* Approved */}
                  <div
                    className="w-full bg-green-500 rounded-t hover:bg-green-600 transition-colors relative group"
                    style={{ height: approvedHeight }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Approved: {trend.approved}
                    </div>
                  </div>
                  {/* Returned */}
                  <div
                    className="w-full bg-red-500 rounded-t hover:bg-red-600 transition-colors relative group"
                    style={{ height: returnedHeight }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Returned: {trend.returned}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600">
                  {new Date(trend.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span className="text-gray-700">Reviewed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span className="text-gray-700">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span className="text-gray-700">Returned</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT TYPE CHART
// ═══════════════════════════════════════════════════════════════════════════

function DocumentTypeChart({ breakdown }: { breakdown: QADocumentTypeBreakdown[] }) {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  return (
    <div className="space-y-3">
      {breakdown.map((item, index) => (
        <div key={item.documentType} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={cn('w-3 h-3 rounded', colors[index % colors.length])} />
              <span className="font-medium text-gray-900">{item.documentType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{item.count}</span>
              <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 text-xs">
                {item.percentage}%
              </Badge>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={cn('h-full', colors[index % colors.length])}
              style={{ width: `${item.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REVIEWER PERFORMANCE TABLE
// ═══════════════════════════════════════════════════════════════════════════

function ReviewerPerformanceTable({ reviewers }: { reviewers: QAReviewerPerformance[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm">Reviewer</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">Reviewed</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">Approved</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">Returned</th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
              Approval Rate
            </th>
            <th className="text-center py-3 px-4 font-semibold text-gray-900 text-sm">
              Avg Turnaround
            </th>
          </tr>
        </thead>
        <tbody>
          {reviewers.map((reviewer, index) => {
            const approvalRate = reviewer.reviewed > 0
              ? Math.round((reviewer.approved / reviewer.reviewed) * 100)
              : 0;

            return (
              <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">{reviewer.reviewerName}</td>
                <td className="py-3 px-4 text-sm text-center">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    {reviewer.reviewed}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-center">
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    {reviewer.approved}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-center">
                  <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                    {reviewer.returned}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm text-center">
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-medium text-gray-900">{approvalRate}%</span>
                    {approvalRate >= 80 ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : approvalRate >= 60 ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-center text-gray-900">
                  {reviewer.avgTurnaroundHours}h
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

function CompactDashboard({ data }: { data: QAPerformanceDashboardData }) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-gray-900 mb-3">QA Performance</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.metrics.reviewedToday}</div>
          <div className="text-xs text-gray-600">Reviewed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">{data.metrics.pendingReview}</div>
          <div className="text-xs text-gray-600">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {data.metrics.averageTurnaroundHours}h
          </div>
          <div className="text-xs text-gray-600">Avg Time</div>
        </div>
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT MOCK DATA
// ═══════════════════════════════════════════════════════════════════════════

export function generateMockQAPerformanceData(): QAPerformanceDashboardData {
  return {
    metrics: {
      reviewedToday: 32,
      pendingReview: 18,
      averageTurnaroundHours: 4.2,
      returned: 8,
      approved: 24,
      trends: {
        reviewedToday: 15, // +15% from yesterday
        pendingReview: -12, // -12% from yesterday
        averageTurnaround: -8, // -8% (improvement)
        returned: -5, // -5% (improvement)
        approved: 20, // +20%
      },
    },
    reviewerPerformance: [
      {
        reviewerName: 'Jane Smith',
        reviewed: 12,
        approved: 10,
        returned: 2,
        avgTurnaroundHours: 3.5,
      },
      {
        reviewerName: 'Bob Johnson',
        reviewed: 10,
        approved: 8,
        returned: 2,
        avgTurnaroundHours: 4.0,
      },
      {
        reviewerName: 'Sarah Williams',
        reviewed: 8,
        approved: 5,
        returned: 3,
        avgTurnaroundHours: 5.2,
      },
      {
        reviewerName: 'Mike Davis',
        reviewed: 2,
        approved: 1,
        returned: 1,
        avgTurnaroundHours: 4.5,
      },
    ],
    dailyTrends: [
      { date: '2024-12-04', reviewed: 28, approved: 22, returned: 6 },
      { date: '2024-12-05', reviewed: 31, approved: 24, returned: 7 },
      { date: '2024-12-06', reviewed: 25, approved: 19, returned: 6 },
      { date: '2024-12-07', reviewed: 29, approved: 23, returned: 6 },
      { date: '2024-12-08', reviewed: 27, approved: 21, returned: 6 },
      { date: '2024-12-09', reviewed: 30, approved: 23, returned: 7 },
      { date: '2024-12-10', reviewed: 32, approved: 24, returned: 8 },
    ],
    documentTypeBreakdown: [
      { documentType: 'Visit Notes', count: 12, percentage: 38 },
      { documentType: 'OASIS Assessments', count: 8, percentage: 25 },
      { documentType: 'Plans of Care (485)', count: 6, percentage: 19 },
      { documentType: 'Physician Orders', count: 4, percentage: 13 },
      { documentType: 'Recertifications', count: 2, percentage: 6 },
    ],
    currentDate: new Date().toISOString(),
  };
}
