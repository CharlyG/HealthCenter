/**
 * EvvComplianceAnalytics — Analytics tab for the POC Monitor.
 * Shows compliance trend, error type breakdown, caregiver compliance ranking,
 * and discipline-level metrics.
 */
import React, { useMemo, useEffect, useState } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import {
  TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon,
  Users, ShieldCheck, AlertOctagon, CheckCircle, Clock,
  ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { MonitorVisit, MonitorMetrics } from './MonitorTypes';
import { pointOfCareGateway, type ComplianceData } from '../../lib/dataGateway';

// ─── Mock trend data ────────────────────────────────────────────────────────

const COMPLIANCE_TREND = [
  { day: 'Mon', compliance: 88, errors: 4, transmitted: 22 },
  { day: 'Tue', compliance: 92, errors: 2, transmitted: 25 },
  { day: 'Wed', compliance: 85, errors: 5, transmitted: 20 },
  { day: 'Thu', compliance: 91, errors: 3, transmitted: 24 },
  { day: 'Fri', compliance: 94, errors: 1, transmitted: 28 },
  { day: 'Sat', compliance: 90, errors: 3, transmitted: 15 },
  { day: 'Today', compliance: 83, errors: 3, transmitted: 8 },
];

const ERROR_TYPES = [
  { name: 'GPS Mismatch', value: 12, fill: '#ef4444' },
  { name: 'Duration Exceeded', value: 8, fill: '#f97316' },
  { name: 'Cert Expired', value: 5, fill: '#eab308' },
  { name: 'Missing Clock Out', value: 4, fill: '#8b5cf6' },
  { name: 'Duplicate Entry', value: 2, fill: '#6b7280' },
];

// ─── Mini KPI ───────────────────────────────────────────────────────────────

const MiniKpi = React.memo(function MiniKpi({
  label, value, subValue, trend, icon: Icon, color, bgColor,
}: {
  label: string; value: string | number; subValue?: string;
  trend?: 'up' | 'down'; icon: React.ElementType;
  color: string; bgColor: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bgColor)}>
          <Icon className={cn('size-5', color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-bold text-gray-900 leading-none">{value}</span>
            {trend && (
              <span className={cn('flex items-center text-[10px] font-bold', trend === 'up' ? 'text-emerald-600' : 'text-red-600')}>
                {trend === 'up' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500 font-medium mt-0.5">{label}</p>
          {subValue && <p className="text-[9px] text-gray-400">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
});

// ─── Caregiver Compliance Row ───────────────────────────────────────────────

interface CaregiverComplianceData {
  name: string;
  discipline: string;
  totalVisits: number;
  evvCompliant: number;
  complianceRate: number;
  avgResponseTime: string;
}

function CaregiverRow({ data, rank }: { data: CaregiverComplianceData; rank: number }) {
  const rateColor = data.complianceRate >= 95 ? 'text-emerald-600' :
                    data.complianceRate >= 85 ? 'text-amber-600' : 'text-red-600';
  const rateBg = data.complianceRate >= 95 ? 'bg-emerald-500' :
                 data.complianceRate >= 85 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0',
        rank <= 3 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500',
      )}>
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{data.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge variant="outline" className="text-[9px] h-4 px-1 rounded">{data.discipline}</Badge>
          <span className="text-[10px] text-gray-400">{data.totalVisits} visits</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all', rateBg)} style={{ width: `${data.complianceRate}%` }} />
          </div>
          <span className={cn('text-sm font-bold tabular-nums', rateColor)}>{data.complianceRate}%</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">{data.avgResponseTime} avg</p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface EvvComplianceAnalyticsProps {
  visits: MonitorVisit[];
  metrics: MonitorMetrics;
}

export default function EvvComplianceAnalytics({ visits, metrics }: EvvComplianceAnalyticsProps) {
  // Server compliance data (trend)
  const [serverTrend, setServerTrend] = useState<ComplianceData | null>(null);
  useEffect(() => {
    pointOfCareGateway.getComplianceData(7).then(data => {
      if (data && data.daily && data.daily.length > 0) {
        setServerTrend(data);
      }
    }).catch(() => {});
  }, []);

  // Use server trend data if available, else mock
  const trendData = useMemo(() => {
    if (serverTrend && serverTrend.daily.length > 0) {
      return serverTrend.daily.map(d => ({
        day: d.day,
        compliance: d.compliance,
        errors: d.errors,
        transmitted: d.transmitted,
      }));
    }
    return COMPLIANCE_TREND;
  }, [serverTrend]);

  // Caregiver compliance data
  const caregiverData = useMemo<CaregiverComplianceData[]>(() => {
    const map = new Map<string, { name: string; discipline: string; total: number; compliant: number }>();
    for (const v of visits) {
      const key = v.caregiverId;
      if (!map.has(key)) {
        map.set(key, { name: v.caregiverName, discipline: v.discipline, total: 0, compliant: 0 });
      }
      const entry = map.get(key)!;
      entry.total++;
      if (v.evvStatus === 'transmitted' || v.evvStatus === 'verified') entry.compliant++;
    }
    return Array.from(map.values())
      .map(d => ({
        name: d.name,
        discipline: d.discipline,
        totalVisits: d.total,
        evvCompliant: d.compliant,
        complianceRate: d.total > 0 ? Math.round((d.compliant / d.total) * 100) : 0,
        avgResponseTime: `${Math.floor(Math.random() * 10 + 2)}m`,
      }))
      .sort((a, b) => b.complianceRate - a.complianceRate);
  }, [visits]);

  // Discipline breakdown
  const disciplineData = useMemo(() => {
    const map = new Map<string, { total: number; compliant: number; errors: number }>();
    for (const v of visits) {
      if (!map.has(v.discipline)) map.set(v.discipline, { total: 0, compliant: 0, errors: 0 });
      const entry = map.get(v.discipline)!;
      entry.total++;
      if (v.evvStatus === 'transmitted' || v.evvStatus === 'verified') entry.compliant++;
      if (v.evvStatus === 'evv_error' || v.evvStatus === 'exception') entry.errors++;
    }
    return Array.from(map.entries()).map(([disc, data]) => ({
      discipline: disc,
      total: data.total,
      compliant: data.compliant,
      errors: data.errors,
      rate: data.total > 0 ? Math.round((data.compliant / data.total) * 100) : 0,
    })).sort((a, b) => b.total - a.total);
  }, [visits]);

  const weeklyAvg = useMemo(() => {
    const rates = trendData.map(d => d.compliance);
    return Math.round(rates.reduce((a, b) => a + b, 0) / rates.length);
  }, [trendData]);

  return (
    <ScrollArea className="flex-1">
      <div className="px-6 py-5 space-y-5 max-w-7xl mx-auto">
        {/* KPI Row */}
        <div className="grid grid-cols-4 gap-3">
          <MiniKpi
            icon={ShieldCheck} label="Weekly Avg Compliance" value={`${weeklyAvg}%`}
            subValue="Last 7 days" trend="up"
            color="text-emerald-600" bgColor="bg-emerald-50"
          />
          <MiniKpi
            icon={AlertOctagon} label="Total EVV Errors (Week)" value={ERROR_TYPES.reduce((a, b) => a + b.value, 0)}
            subValue="Across all disciplines" trend="down"
            color="text-red-500" bgColor="bg-red-50"
          />
          <MiniKpi
            icon={Clock} label="Avg Time to Resolve" value="18m"
            subValue="Error → retransmit"
            color="text-amber-600" bgColor="bg-amber-50"
          />
          <MiniKpi
            icon={Users} label="Active Caregivers" value={caregiverData.length}
            subValue={`${caregiverData.filter(c => c.complianceRate >= 95).length} at 95%+`}
            color="text-blue-600" bgColor="bg-blue-50"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-3 gap-5">
          {/* Compliance Trend */}
          <Card className="col-span-2 border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 font-bold">
                <TrendingUp className="size-4 text-emerald-500" />
                EVV Compliance Trend (7 Days)
              </CardTitle>
              <p className="text-xs text-gray-500">Daily compliance rate and error count</p>
            </CardHeader>
            <CardContent>
              <div style={{ height: 240 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} domain={[70, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e5e7eb', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="compliance" name="Compliance %" stroke="#10b981" strokeWidth={3}
                      dot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                      activeDot={{ r: 7, fill: '#10b981', strokeWidth: 3, stroke: '#fff' }}
                    />
                    <Line yAxisId="right" type="monotone" dataKey="errors" name="Errors" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5"
                      dot={{ r: 4, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Error Type Breakdown */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 font-bold">
                <PieChartIcon className="size-4 text-red-500" />
                Error Type Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ERROR_TYPES} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {ERROR_TYPES.map((entry, idx) => (
                        <Cell key={idx} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      formatter={(value: number, name: string) => [`${value} errors`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 mt-2">
                {ERROR_TYPES.map(e => (
                  <div key={e.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.fill }} />
                      <span className="text-gray-600">{e.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{e.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-5 gap-5">
          {/* Caregiver Ranking */}
          <Card className="col-span-3 border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 font-bold">
                <Users className="size-4 text-blue-500" />
                Caregiver Compliance Ranking
              </CardTitle>
              <p className="text-xs text-gray-500">EVV compliance rate by caregiver</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {caregiverData.map((cg, idx) => (
                  <CaregiverRow key={cg.name} data={cg} rank={idx + 1} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Discipline Breakdown */}
          <Card className="col-span-2 border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 font-bold">
                <BarChart3 className="size-4 text-purple-500" />
                Discipline Metrics
              </CardTitle>
              <p className="text-xs text-gray-500">Compliance by care discipline</p>
            </CardHeader>
            <CardContent>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={disciplineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="discipline" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Bar dataKey="compliant" name="Compliant" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="errors" name="Errors" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Discipline table */}
              <div className="mt-3 space-y-2">
                {disciplineData.map(d => (
                  <div key={d.discipline} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded font-bold">{d.discipline}</Badge>
                      <span className="text-gray-500">{d.total} visits</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600 font-medium">{d.compliant} OK</span>
                      {d.errors > 0 && <span className="text-red-600 font-medium">{d.errors} err</span>}
                      <span className={cn(
                        'font-bold tabular-nums',
                        d.rate >= 90 ? 'text-emerald-600' : d.rate >= 70 ? 'text-amber-600' : 'text-red-600',
                      )}>
                        {d.rate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}