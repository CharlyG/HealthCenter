/**
 * Payment Variance Report
 * Compares expected vs actual reimbursement by payer contract terms.
 * Shows underpayment detection, payer breakdown charts, variance table.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  Scale, TrendingDown, TrendingUp, AlertTriangle, CheckCircle2,
  Search, Download, DollarSign, BarChart3, ArrowDown, ArrowUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchPaymentVariance } from '../../lib/billingApi';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const formatCurrencyExact = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

interface VarianceItem {
  id: string; claimNumber: string; patientName: string; mrn: string;
  payer: string; claimType: string; serviceFrom: string; serviceTo: string;
  billedAmount: number; expectedAmount: number; actualPaid: number;
  variance: number; variancePct: number; isUnderpaid: boolean;
  contractRate: number; contractName: string;
}

export const PaymentVariance = React.memo(function PaymentVariance() {
  const [data, setData] = useState<{ variances: VarianceItem[]; payerSummary: any[]; summary: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [payerFilter, setPayerFilter] = useState('all');
  const [varianceFilter, setVarianceFilter] = useState<'all' | 'underpaid' | 'overpaid'>('all');

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { const result = await fetchPaymentVariance(); setData(result); }
    catch (err: any) { console.error('[PaymentVariance] Error:', err); setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredVariances = useMemo(() => {
    if (!data?.variances) return [];
    let items = data.variances;
    if (payerFilter !== 'all') items = items.filter(v => v.payer === payerFilter);
    if (varianceFilter === 'underpaid') items = items.filter(v => v.isUnderpaid);
    else if (varianceFilter === 'overpaid') items = items.filter(v => v.variance > 50);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(v => v.patientName.toLowerCase().includes(q) || v.claimNumber.toLowerCase().includes(q) || v.payer.toLowerCase().includes(q));
    }
    return items;
  }, [data, payerFilter, varianceFilter, searchQuery]);

  const payers = useMemo(() => data?.variances ? [...new Set(data.variances.map(v => v.payer))].sort() : [], [data]);

  // Chart: expected vs actual by payer
  const payerChartData = useMemo(() => {
    if (!data?.payerSummary) return [];
    return data.payerSummary.map((ps: any) => ({
      payer: ps.payer,
      expected: Math.round(ps.totalExpected),
      actual: Math.round(ps.totalPaid),
      variance: Math.round(ps.totalVariance),
    }));
  }, [data]);

  if (loading) return <LoadingState message="Analyzing payment variances..." />;
  if (error) return (
    <div className="text-center py-8 text-red-500">
      <p className="text-sm mb-2">{error}</p>
      <Button size="sm" variant="outline" onClick={loadData}>Retry</Button>
    </div>
  );
  if (!data) return null;
  const { summary } = data;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard title="Total Billed" value={formatCurrency(summary.totalBilled)} subtitle={`${summary.totalClaims} paid claims`} icon={<DollarSign className="size-4" />} />
        <MetricCard title="Expected" value={formatCurrency(summary.totalExpected)} subtitle="Per contract terms" icon={<Scale className="size-4" />} />
        <MetricCard title="Actual Paid" value={formatCurrency(summary.totalPaid)} subtitle="Received" icon={<CheckCircle2 className="size-4" />} variant={summary.totalPaid >= summary.totalExpected ? 'success' : 'warning'} />
        <MetricCard title="Underpaid" value={`${summary.underpaidCount} claims`} subtitle={formatCurrency(summary.underpaidAmount)} icon={<TrendingDown className="size-4" />} variant="danger" />
        <MetricCard title="Net Variance" value={formatCurrency(Math.abs(summary.totalVariance))} subtitle={summary.totalVariance >= 0 ? 'Over expected' : 'Under expected'} icon={summary.totalVariance >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />} variant={summary.totalVariance >= 0 ? 'success' : 'danger'} />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="size-4 text-blue-600" />
            Expected vs Actual Reimbursement by Payer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={payerChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="payer" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="expected" fill="#93c5fd" name="Expected (Contract)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#3b82f6" name="Actual Paid" radius={[4, 4, 0, 0]} />
              <ReferenceLine y={0} stroke="#9ca3af" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payer summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {(data.payerSummary || []).map((ps: any) => {
          const isUnder = ps.totalVariance < -50;
          return (
            <Card key={ps.payer} className={cn('transition-all', isUnder && 'border-red-200')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-gray-900">{ps.payer}</span>
                  <Badge variant="outline" className={cn('text-[9px] h-5 px-1.5',
                    isUnder ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  )}>
                    {isUnder ? <ArrowDown className="size-2.5 mr-0.5" /> : <ArrowUp className="size-2.5 mr-0.5" />}
                    {formatCurrencyExact(Math.abs(ps.totalVariance))}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px]">
                  <div><span className="text-gray-400 block">Expected</span><span className="font-bold text-gray-700">{formatCurrency(ps.totalExpected)}</span></div>
                  <div><span className="text-gray-400 block">Actual</span><span className="font-bold text-gray-700">{formatCurrency(ps.totalPaid)}</span></div>
                  <div><span className="text-gray-400 block">Rate</span><span className="font-bold text-gray-700">{Math.round(ps.contractRate * 100)}%</span></div>
                </div>
                {ps.underpaidCount > 0 && (
                  <p className="text-[9px] text-red-600 mt-1.5 font-semibold">
                    <AlertTriangle className="size-2.5 inline mr-0.5" />
                    {ps.underpaidCount} underpaid claim{ps.underpaidCount > 1 ? 's' : ''}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search..." className="pl-9 h-8 text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={payerFilter} onValueChange={setPayerFilter}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Payer" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payers</SelectItem>
            {payers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={varianceFilter} onValueChange={(v: any) => setVarianceFilter(v)}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Claims</SelectItem>
            <SelectItem value="underpaid">Underpaid Only</SelectItem>
            <SelectItem value="overpaid">Overpaid Only</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 ml-auto">
          <Download className="size-3" /> Export
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="pt-4">
          <div className="overflow-x-auto border border-gray-200 rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Claim #</th>
                  <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Patient</th>
                  <th className="py-2 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase">Payer</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold text-gray-500 uppercase">Billed</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold text-gray-500 uppercase">Expected</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold text-gray-500 uppercase">Actual</th>
                  <th className="py-2 px-3 text-right text-[10px] font-semibold text-gray-500 uppercase">Variance</th>
                  <th className="py-2 px-3 text-center text-[10px] font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVariances.map(v => (
                  <tr key={v.id} className={cn('hover:bg-gray-50/80', v.isUnderpaid && 'bg-red-50/30')}>
                    <td className="py-2 px-3"><span className="font-mono text-[11px] font-semibold text-blue-600">{v.claimNumber}</span></td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-gray-900 text-xs">{v.patientName}</div>
                      <div className="text-[10px] text-gray-400">{v.mrn}</div>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-700">{v.payer}</td>
                    <td className="py-2 px-3 text-right text-xs tabular-nums text-gray-600">{formatCurrencyExact(v.billedAmount)}</td>
                    <td className="py-2 px-3 text-right text-xs tabular-nums text-blue-600 font-medium">{formatCurrencyExact(v.expectedAmount)}</td>
                    <td className="py-2 px-3 text-right text-xs tabular-nums font-semibold text-gray-900">{formatCurrencyExact(v.actualPaid)}</td>
                    <td className="py-2 px-3 text-right">
                      <span className={cn('text-xs font-bold tabular-nums',
                        v.variance < -50 ? 'text-red-600' : v.variance > 50 ? 'text-emerald-600' : 'text-gray-500',
                      )}>
                        {v.variance >= 0 ? '+' : ''}{formatCurrencyExact(v.variance)}
                      </span>
                      <div className={cn('text-[9px] tabular-nums',
                        v.variancePct < -5 ? 'text-red-500' : v.variancePct > 5 ? 'text-emerald-500' : 'text-gray-400',
                      )}>
                        {v.variancePct >= 0 ? '+' : ''}{v.variancePct}%
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      {v.isUnderpaid ? (
                        <Badge variant="outline" className="text-[9px] h-5 px-1.5 bg-red-50 text-red-700 border-red-200">
                          <TrendingDown className="size-2.5 mr-0.5" /> Underpaid
                        </Badge>
                      ) : v.variance > 50 ? (
                        <Badge variant="outline" className="text-[9px] h-5 px-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                          <TrendingUp className="size-2.5 mr-0.5" /> Over
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] h-5 px-1.5 bg-gray-50 text-gray-500 border-gray-200">
                          <CheckCircle2 className="size-2.5 mr-0.5" /> OK
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVariances.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Scale className="size-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No variance data matches your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
