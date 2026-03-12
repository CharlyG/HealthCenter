/**
 * CosignAnalytics — Co-signature workflow analytics dashboard.
 *
 * Features:
 * - Summary KPI cards (total, pending, approved, rejected, avg turnaround, approval rate)
 * - Daily trend line chart (14-day window)
 * - Turnaround time distribution bar chart
 * - Top supervisors table with volume & avg turnaround
 * - Clinician submission stats table
 * - Responsive layout with recharts
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { cn } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  UserCheck,
  TrendingUp,
  RefreshCw,
  Loader2,
  FileText,
  Users,
  Timer,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { documentationGateway } from '../lib/dataGateway';
import type { CosignAnalyticsData } from '../lib/documentationTypes';

// ─── KPI Card ───────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const KpiCard = React.memo(function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bgColor,
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
              {title}
            </p>
            <p className={cn('text-2xl font-bold mt-1', color)}>{value}</p>
            {subtitle && (
              <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bgColor)}>
            <Icon className={cn('size-5', color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────

export default function CosignAnalytics() {
  const [data, setData] = useState<CosignAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await documentationGateway.getCosignAnalytics();
      setData(res.analytics);
    } catch (err: any) {
      console.error('[CosignAnalytics] Load error:', err);
      toast.error(`Failed to load analytics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading analytics...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const { summary, supervisorStats, clinicianStats, dailyTrend, turnaroundDistribution } = data;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2.5">
              <BarChart3 className="size-6 text-indigo-600" />
              Co-Signature Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Turnaround times, approval rates, and supervisor performance metrics
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            title="Total Documents"
            value={summary.totalDocuments}
            subtitle="In co-sign workflow"
            icon={FileText}
            color="text-gray-900"
            bgColor="bg-gray-100"
          />
          <KpiCard
            title="Pending"
            value={summary.pendingCount}
            subtitle="Awaiting review"
            icon={Clock}
            color="text-indigo-600"
            bgColor="bg-indigo-100"
          />
          <KpiCard
            title="Approved"
            value={summary.approvedCount}
            subtitle="Co-signed"
            icon={CheckCircle2}
            color="text-emerald-600"
            bgColor="bg-emerald-100"
          />
          <KpiCard
            title="Returned"
            value={summary.rejectedCount}
            subtitle="For revision"
            icon={XCircle}
            color="text-red-600"
            bgColor="bg-red-100"
          />
          <KpiCard
            title="Avg Turnaround"
            value={`${summary.avgTurnaroundHours}h`}
            subtitle="Request to approval"
            icon={Timer}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <KpiCard
            title="Approval Rate"
            value={`${summary.approvalRate}%`}
            subtitle="First-pass approval"
            icon={Percent}
            color="text-teal-600"
            bgColor="bg-teal-100"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Daily Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUp className="size-4 text-blue-600" />
                14-Day Activity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="requested"
                      stroke="#6366f1"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Requested"
                    />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Approved"
                    />
                    <Line
                      type="monotone"
                      dataKey="rejected"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      name="Returned"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Turnaround Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Timer className="size-4 text-blue-600" />
                Turnaround Time Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={turnaroundDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="range"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        borderRadius: 8,
                        border: '1px solid #e5e7eb',
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                      name="Documents"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Supervisor Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <UserCheck className="size-4 text-indigo-600" />
                Supervisor Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {supervisorStats.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No supervisor data yet
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-[10px] font-semibold text-gray-500 uppercase px-4 py-2">
                          Supervisor
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-500 uppercase px-2 py-2">
                          Approved
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-500 uppercase px-2 py-2">
                          Returned
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-500 uppercase px-2 py-2">
                          Avg Time
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-500 uppercase px-4 py-2">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {supervisorStats.map((sup, idx) => (
                        <tr
                          key={sup.name}
                          className={cn(
                            'border-b border-gray-50',
                            idx === 0 && 'bg-indigo-50/30'
                          )}
                        >
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              {idx === 0 && (
                                <Badge variant="outline" className="text-[7px] h-3.5 px-1 bg-indigo-50 border-indigo-200 text-indigo-600">
                                  Top
                                </Badge>
                              )}
                              <span className="text-xs font-medium text-gray-900 truncate">
                                {sup.name}
                              </span>
                            </div>
                          </td>
                          <td className="text-center px-2 py-2.5">
                            <span className="text-xs font-semibold text-emerald-600">
                              {sup.approved}
                            </span>
                          </td>
                          <td className="text-center px-2 py-2.5">
                            <span className="text-xs font-semibold text-red-600">
                              {sup.rejected}
                            </span>
                          </td>
                          <td className="text-center px-2 py-2.5">
                            <span className="text-xs text-gray-600">
                              {sup.avgTurnaroundHours}h
                            </span>
                          </td>
                          <td className="text-center px-4 py-2.5">
                            <Badge variant="outline" className="text-[9px] h-5 px-1.5">
                              {sup.total}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinician Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-blue-600" />
                Clinician Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {clinicianStats.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No clinician data yet
                </div>
              ) : (
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-[10px] font-semibold text-gray-500 uppercase px-4 py-2">
                          Clinician
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-500 uppercase px-2 py-2">
                          Submitted
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-500 uppercase px-2 py-2">
                          Approved
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-500 uppercase px-2 py-2">
                          Returned
                        </th>
                        <th className="text-center text-[10px] font-semibold text-gray-500 uppercase px-4 py-2">
                          Pending
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {clinicianStats.map((clin) => (
                        <tr key={clin.name} className="border-b border-gray-50">
                          <td className="px-4 py-2.5">
                            <span className="text-xs font-medium text-gray-900 truncate">
                              {clin.name}
                            </span>
                          </td>
                          <td className="text-center px-2 py-2.5">
                            <span className="text-xs font-semibold text-gray-700">
                              {clin.submitted}
                            </span>
                          </td>
                          <td className="text-center px-2 py-2.5">
                            <span className="text-xs font-semibold text-emerald-600">
                              {clin.approved}
                            </span>
                          </td>
                          <td className="text-center px-2 py-2.5">
                            <span className="text-xs font-semibold text-red-600">
                              {clin.rejected}
                            </span>
                          </td>
                          <td className="text-center px-4 py-2.5">
                            {clin.pending > 0 ? (
                              <Badge variant="outline" className="text-[9px] h-5 px-1.5 bg-indigo-50 border-indigo-200 text-indigo-700">
                                {clin.pending}
                              </Badge>
                            ) : (
                              <span className="text-xs text-gray-400">0</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* HIPAA notice */}
        <div className="text-center pb-4">
          <p className="text-[9px] text-gray-400">
            HIPAA Compliance Analytics — Data aggregated from audit trail logs. Individual PHI is not displayed.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
