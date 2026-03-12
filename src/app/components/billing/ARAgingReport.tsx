/**
 * A/R Aging Report
 * Shows 30/60/90/120-day buckets with payer breakdown charts.
 * Uses recharts for stacked bar chart and pie chart visualizations.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  Clock, DollarSign, TrendingUp, AlertTriangle, BarChart3,
  Search, Download, RefreshCw, ChevronDown, ChevronRight,
  ArrowUpDown, Filter, Loader2,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchARAgingReport } from '../../lib/billingApi';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const BUCKET_COLORS: Record<string, { bg: string; color: string; fill: string; label: string }> = {
  '0-30':   { bg: 'bg-emerald-50', color: 'text-emerald-700', fill: '#10b981', label: '0–30 Days' },
  '31-60':  { bg: 'bg-amber-50',   color: 'text-amber-700',   fill: '#f59e0b', label: '31–60 Days' },
  '61-90':  { bg: 'bg-orange-50',  color: 'text-orange-700',  fill: '#f97316', label: '61–90 Days' },
  '91-120+': { bg: 'bg-red-50',     color: 'text-red-700',     fill: '#ef4444', label: '91–120+ Days' },
};

const PIE_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

interface AgingItem {
  id: string;
  patientName: string;
  mrn: string;
  payer: string;
  claimNumber: string;
  billedAmount: number;
  paidAmount: number;
  balance: number;
  submittedDate: string;
  daysOutstanding: number;
  status: string;
  bucket: string;
}

export const ARAgingReport = React.memo(function ARAgingReport() {
  const [data, setData] = useState<{
    items: AgingItem[];
    buckets: Record<string, { count: number; amount: number }>;
    payerBreakdown: any[];
    summary: { totalOutstanding: number; avgDays: number; totalItems: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bucketFilter, setBucketFilter] = useState<string>('all');
  const [payerFilter, setPayerFilter] = useState<string>('all');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchARAgingReport();
      setData(result);
    } catch (err: any) {
      console.error('[ARAgingReport] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    let items = data.items;
    if (bucketFilter !== 'all') items = items.filter(i => i.bucket === bucketFilter);
    if (payerFilter !== 'all') items = items.filter(i => i.payer === payerFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.patientName.toLowerCase().includes(q) ||
        i.claimNumber.toLowerCase().includes(q) ||
        i.payer.toLowerCase().includes(q)
      );
    }
    return items;
  }, [data, bucketFilter, payerFilter, searchQuery]);

  const payers = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.items.map(i => i.payer))].sort();
  }, [data]);

  // Chart data
  const barChartData = useMemo(() => {
    if (!data?.payerBreakdown) return [];
    return data.payerBreakdown.map(p => ({
      payer: p.payer,
      '0-30': p['0-30'] || 0,
      '31-60': p['31-60'] || 0,
      '61-90': p['61-90'] || 0,
      '91-120+': p['91-120+'] || 0,
    }));
  }, [data]);

  const pieChartData = useMemo(() => {
    if (!data?.buckets) return [];
    return Object.entries(data.buckets).map(([key, val]) => ({
      name: BUCKET_COLORS[key]?.label || key,
      value: val.amount,
      bucket: key,
    }));
  }, [data]);

  if (loading) return <LoadingState message="Loading A/R aging report..." />;
  if (error) return (
    <div className="text-center py-8 text-red-500">
      <p className="text-sm mb-2">{error}</p>
      <Button size="sm" variant="outline" onClick={loadData}>Retry</Button>
    </div>
  );
  if (!data) return null;

  const { buckets, summary } = data;

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          title="Total Outstanding"
          value={formatCurrency(summary.totalOutstanding)}
          subtitle={`${summary.totalItems} claims`}
          icon={<DollarSign className="size-4" />}
          variant="warning"
        />
        <MetricCard
          title="Avg Days in A/R"
          value={summary.avgDays}
          subtitle="Industry avg: 35-45"
          icon={<Clock className="size-4" />}
          variant={summary.avgDays > 45 ? 'danger' : summary.avgDays > 35 ? 'warning' : 'success'}
        />
        <MetricCard
          title="Over 90 Days"
          value={formatCurrency(buckets['91-120+']?.amount || 0)}
          subtitle={`${buckets['91-120+']?.count || 0} claims`}
          icon={<AlertTriangle className="size-4" />}
          variant="danger"
        />
        <MetricCard
          title="Current (0-30)"
          value={formatCurrency(buckets['0-30']?.amount || 0)}
          subtitle={`${buckets['0-30']?.count || 0} claims`}
          icon={<TrendingUp className="size-4" />}
          variant="success"
        />
      </div>

      {/* Bucket cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(BUCKET_COLORS).map(([key, cfg]) => {
          const bucket = buckets[key] || { count: 0, amount: 0 };
          const pct = summary.totalOutstanding > 0
            ? Math.round((bucket.amount / summary.totalOutstanding) * 100)
            : 0;
          return (
            <button
              key={key}
              onClick={() => setBucketFilter(bucketFilter === key ? 'all' : key)}
              className={cn(
                'rounded-xl border-2 p-4 text-left transition-all hover:shadow-md',
                bucketFilter === key
                  ? cn(cfg.bg, 'border-current shadow-sm', cfg.color)
                  : 'bg-white border-gray-200',
              )}
            >
              <p className={cn('text-xs font-bold', bucketFilter === key ? cfg.color : 'text-gray-600')}>
                {cfg.label}
              </p>
              <p className="text-xl font-bold text-gray-900 mt-1 tabular-nums">
                {formatCurrency(bucket.amount)}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-gray-400">{bucket.count} claims</span>
                <span className={cn('text-[10px] font-bold', cfg.color)}>{pct}%</span>
              </div>
              {/* Mini bar */}
              <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.fill }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stacked bar chart by payer */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="size-4 text-blue-600" />
              A/R by Payer & Aging Bucket
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="payer" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), BUCKET_COLORS[name]?.label || name]}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} formatter={(v) => BUCKET_COLORS[v]?.label || v} />
                <Bar dataKey="0-30" stackId="a" fill={BUCKET_COLORS['0-30'].fill} radius={[0, 0, 0, 0]} />
                <Bar dataKey="31-60" stackId="a" fill={BUCKET_COLORS['31-60'].fill} />
                <Bar dataKey="61-90" stackId="a" fill={BUCKET_COLORS['61-90'].fill} />
                <Bar dataKey="91-120+" stackId="a" fill={BUCKET_COLORS['91-120+'].fill} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Aging Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieChartData.map((entry, idx) => (
                    <Cell key={entry.bucket} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {pieChartData.map((entry, idx) => (
                <div key={entry.bucket} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }} />
                    {entry.name}
                  </span>
                  <span className="font-semibold tabular-nums">{formatCurrency(entry.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-sm">Outstanding Claims Detail</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search..." className="pl-9 w-48 h-8 text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Select value={payerFilter} onValueChange={setPayerFilter}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Payer" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payers</SelectItem>
                  {payers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                <Download className="size-3" /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Claim #</th>
                  <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Patient</th>
                  <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Payer</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold text-gray-500 uppercase">Billed</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold text-gray-500 uppercase">Paid</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold text-gray-500 uppercase">Balance</th>
                  <th className="py-2 px-3 text-center text-[10px] font-semibold text-gray-500 uppercase">Days</th>
                  <th className="py-2 px-3 text-center text-[10px] font-semibold text-gray-500 uppercase">Bucket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map(item => {
                  const bcfg = BUCKET_COLORS[item.bucket];
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80">
                      <td className="py-2 px-3">
                        <span className="font-mono text-[11px] font-semibold text-blue-600">{item.claimNumber}</span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium text-gray-900 text-xs">{item.patientName}</div>
                        <div className="text-[10px] text-gray-400">{item.mrn}</div>
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-700">{item.payer}</td>
                      <td className="py-2 px-3 text-right text-xs tabular-nums">{formatCurrency(item.billedAmount)}</td>
                      <td className="py-2 px-3 text-right text-xs tabular-nums text-gray-500">{formatCurrency(item.paidAmount)}</td>
                      <td className="py-2 px-3 text-right text-xs font-bold tabular-nums text-gray-900">{formatCurrency(item.balance)}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={cn('text-xs font-bold tabular-nums', item.daysOutstanding > 90 ? 'text-red-600' : item.daysOutstanding > 60 ? 'text-orange-600' : item.daysOutstanding > 30 ? 'text-amber-600' : 'text-gray-600')}>
                          {item.daysOutstanding}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge variant="outline" className={cn('text-[9px] h-5 px-1.5', bcfg?.bg, bcfg?.color)}>
                          {bcfg?.label || item.bucket}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Clock className="size-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No outstanding claims in this view</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
