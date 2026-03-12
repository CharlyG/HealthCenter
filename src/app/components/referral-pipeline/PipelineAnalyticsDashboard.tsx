/**
 * PipelineAnalyticsDashboard — Full analytics for the referral intake pipeline.
 * Funnel, conversion rates, time-to-admit trend, source breakdown, urgency distribution.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import {
  GitPullRequest,
  TrendingDown,
  Clock,
  CheckCircle2,
  BarChart3,
  ArrowRight,
  Loader2,
  RefreshCw,
  Users,
  ArrowLeft,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { referralPipelineGateway } from '../../lib/dataGateway';
import type { PipelineAnalytics } from '../../lib/referralPipelineTypes';
import { useNavigate } from 'react-router';

// ─── KPI Card ───────────────────────────────────────────────────────────────

const KpiCard = React.memo(function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', color)}>
          <Icon className="size-6 text-white" />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">{label}</p>
          {subtitle && <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Funnel ─────────────────────────────────────────────────────────────────

const FunnelChart = React.memo(function FunnelChart({
  data,
}: {
  data: PipelineAnalytics['funnel'];
}) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {data.map((stage, idx) => {
        const widthPct = Math.max(25, (stage.count / maxCount) * 100);
        return (
          <div key={stage.stage}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-600">{stage.label}</span>
              <span className="text-xs text-gray-400">{stage.percentage}%</span>
            </div>
            <div className="relative h-9 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className="h-full rounded-lg flex items-center px-4 transition-all duration-700"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: stage.color,
                }}
              >
                <span className="text-sm font-bold text-white drop-shadow-sm">{stage.count}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ─── Conversion Cards ───────────────────────────────────────────────────────

const ConversionCards = React.memo(function ConversionCards({
  data,
}: {
  data: PipelineAnalytics['conversions'];
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {data.map((conv) => (
        <div key={`${conv.fromStage}-${conv.toStage}`} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
          <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
            <span className="truncate font-medium">{conv.fromLabel}</span>
            <ArrowRight className="size-3 shrink-0 text-gray-400" />
            <span className="truncate font-medium">{conv.toLabel}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <span
                className={cn(
                  'text-2xl font-bold leading-none',
                  conv.rate >= 80 ? 'text-emerald-600' : conv.rate >= 60 ? 'text-amber-600' : 'text-red-600',
                )}
              >
                {conv.rate}%
              </span>
              <p className="text-[10px] text-gray-400 mt-1">conversion</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold text-gray-700">{conv.avgDays}d</span>
              <p className="text-[10px] text-gray-400 mt-0.5">avg time</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

// ─── Source Table ────────────────────────────────────────────────────────────

const SourceTable = React.memo(function SourceTable({
  data,
}: {
  data: PipelineAnalytics['sourceBreakdown'];
}) {
  const sorted = useMemo(() => [...data].sort((a, b) => b.count - a.count), [data]);
  const maxCount = Math.max(...sorted.map((d) => d.count), 1);

  return (
    <div className="space-y-3">
      {sorted.map((src) => (
        <div key={src.source} className="flex items-center gap-4">
          <span className="text-sm text-gray-700 font-medium w-40 truncate shrink-0">{src.label}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${Math.max(12, (src.count / maxCount) * 100)}%` }}
            >
              <span className="text-[10px] text-white font-bold">{src.count}</span>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-600 w-10 text-right shrink-0">{src.percentage}%</span>
          {src.avgDaysToAdmit > 0 && (
            <span className="text-xs text-gray-400 w-14 text-right shrink-0">{src.avgDaysToAdmit}d avg</span>
          )}
        </div>
      ))}
    </div>
  );
});

// ─── Urgency Colors ─────────────────────────────────────────────────────────

const URGENCY_COLORS: Record<string, string> = {
  stat: '#ef4444',
  urgent: '#f97316',
  routine: '#6b7280',
};

// ─── Dashboard ──────────────────────────────────────────────────────────────

export default function PipelineAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<PipelineAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);
      const data = await referralPipelineGateway.getAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.error('[PipelineAnalytics] Load error:', err);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500">Loading pipeline analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const urgencyPieData = analytics.urgencyDistribution.map((u) => ({
    name: u.label,
    value: u.count,
    fill: URGENCY_COLORS[u.urgency] || '#6b7280',
  }));

  const admitRate =
    analytics.totalProcessed > 0
      ? Math.round((analytics.totalAdmitted / analytics.totalProcessed) * 100)
      : 0;

  return (
    <div className="size-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-6 py-5 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/referral-pipeline')}>
              <ArrowLeft className="size-4" />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <BarChart3 className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Pipeline Analytics</h1>
              <p className="text-sm text-gray-500">Referral intake funnel performance</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => loadData(false)} disabled={refreshing}>
            <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard icon={GitPullRequest} label="Total Processed" value={analytics.totalProcessed} color="bg-blue-600" />
            <KpiCard
              icon={CheckCircle2}
              label="Admitted"
              value={analytics.totalAdmitted}
              subtitle={`${admitRate}% admission rate`}
              color="bg-emerald-600"
            />
            <KpiCard icon={Clock} label="Avg Days to Admit" value={`${analytics.avgOverallDays}d`} color="bg-amber-600" />
            <KpiCard
              icon={Users}
              label="Active in Pipeline"
              value={analytics.totalProcessed - analytics.totalAdmitted}
              subtitle="Currently progressing"
              color="bg-purple-600"
            />
          </div>

          {/* Funnel + Time Trend */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 font-bold">
                  <TrendingDown className="size-4 text-blue-500" />
                  Referral Funnel
                </CardTitle>
                <p className="text-xs text-gray-500">Referrals that have reached or passed each stage</p>
              </CardHeader>
              <CardContent>
                <FunnelChart data={analytics.funnel} />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 font-bold">
                  <Clock className="size-4 text-amber-500" />
                  Time to Admit Trend
                </CardTitle>
                <p className="text-xs text-gray-500">Average days from referral to admission (8 weeks)</p>
              </CardHeader>
              <CardContent>
                <div style={{ height: 230 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.timeToAdmitTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e5e7eb', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        formatter={(value: number) => [`${value} days`, 'Avg Days']}
                      />
                      <Line
                        type="monotone"
                        dataKey="avgDays"
                        stroke="#f59e0b"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 7, fill: '#f59e0b', strokeWidth: 3, stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Rates */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 font-bold">
                <ArrowRight className="size-4 text-emerald-500" />
                Stage Conversion Rates
              </CardTitle>
              <p className="text-xs text-gray-500">Advancement rate and average time between consecutive stages</p>
            </CardHeader>
            <CardContent>
              <ConversionCards data={analytics.conversions} />
            </CardContent>
          </Card>

          {/* Source + Urgency */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="col-span-2 border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 font-bold">
                  <GitPullRequest className="size-4 text-blue-500" />
                  Referral Source Breakdown
                </CardTitle>
                <p className="text-xs text-gray-500">Volume and performance by referral source</p>
              </CardHeader>
              <CardContent>
                <SourceTable data={analytics.sourceBreakdown} />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 font-bold">
                  <BarChart3 className="size-4 text-orange-500" />
                  Urgency Mix
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={urgencyPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3} dataKey="value">
                        {urgencyPieData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                        formatter={(value: number, name: string) => [`${value} referrals`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 mt-3">
                  {analytics.urgencyDistribution.map((u) => (
                    <div key={u.urgency} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: URGENCY_COLORS[u.urgency] || '#6b7280' }} />
                        <span className="text-sm text-gray-700 font-medium">{u.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">{u.count}</span>
                        <span className="text-xs text-gray-400">({u.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
