/**
 * Payer Contract Management
 * Fee schedule management with automatic underpayment detection.
 * Shows contracts, fee schedules, underpayment alerts.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  Handshake, CheckCircle2, AlertTriangle, Clock, FileText,
  ChevronDown, ChevronRight, DollarSign, Calendar, User,
  Mail, Shield, TrendingDown, Search, RefreshCw, Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchContracts } from '../../lib/billingApi';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
const formatCurrencyExact = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

interface FeeScheduleItem { code: string; description: string; rate: number; }

interface Contract {
  id: string; payer: string; name: string; type: string;
  effectiveDate: string; terminationDate: string; reimbursementRate: number;
  feeSchedule: FeeScheduleItem[]; status: string; autoRenew: boolean;
  notes: string; contactName: string; contactEmail: string;
  lastReviewDate: string; underpaymentThreshold: number;
}

interface Underpayment {
  claimId: string; claimNumber: string; patientName: string; payer: string;
  billedAmount: number; expectedAmount: number; paidAmount: number;
  underpayment: number; contractName: string; contractRate: number;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  active:   { label: 'Active',   bg: 'bg-emerald-50', color: 'text-emerald-700', border: 'border-emerald-200' },
  expiring: { label: 'Expiring', bg: 'bg-amber-50',   color: 'text-amber-700',   border: 'border-amber-200' },
  expired:  { label: 'Expired',  bg: 'bg-red-50',     color: 'text-red-700',     border: 'border-red-200' },
};

const TYPE_LABELS: Record<string, string> = {
  prospective: 'Prospective (PPS)', fee_for_service: 'Fee-for-Service',
  capitated: 'Capitated', value_based: 'Value-Based',
};

// ─── Contract Card ──────────────────────────────────────────────────────────

const ContractCard = React.memo(function ContractCard({ contract, expanded, onToggle, underpayments }: {
  contract: Contract; expanded: boolean; onToggle: () => void; underpayments: Underpayment[];
}) {
  const sc = STATUS_CONFIG[contract.status] || STATUS_CONFIG.active;
  const daysUntilExpiry = Math.ceil((new Date(contract.terminationDate).getTime() - Date.now()) / 86400000);
  const isExpiringSoon = daysUntilExpiry <= 90;
  const contractUnderpayments = underpayments.filter(u => u.payer === contract.payer);

  return (
    <div className={cn('rounded-xl border-2 transition-all overflow-hidden',
      contract.status === 'expiring' ? 'border-amber-200' :
      contractUnderpayments.length > 0 ? 'border-red-200' : 'border-gray-200',
    )}>
      <button className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-gray-50/50" onClick={onToggle}>
        {expanded ? <ChevronDown className="size-4 text-gray-400 shrink-0" /> : <ChevronRight className="size-4 text-gray-400 shrink-0" />}

        {/* Payer icon */}
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', sc.bg)}>
          <Handshake className={cn('size-5', sc.color)} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{contract.payer}</span>
            <Badge variant="outline" className={cn('text-[9px] h-4 px-1 border', sc.bg, sc.color, sc.border)}>
              {sc.label}
            </Badge>
            <Badge variant="outline" className="text-[9px] h-4 px-1 bg-gray-50 text-gray-500 border-gray-200">
              {TYPE_LABELS[contract.type] || contract.type}
            </Badge>
            {contract.autoRenew && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 bg-blue-50 text-blue-600 border-blue-200">
                <RefreshCw className="size-2 mr-0.5" /> Auto-Renew
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">{contract.name}</p>
        </div>

        {/* Rate */}
        <div className="text-right shrink-0 hidden md:block">
          <span className="text-sm font-bold text-gray-900 tabular-nums">{Math.round(contract.reimbursementRate * 100)}%</span>
          <p className="text-[9px] text-gray-400">Reimb. Rate</p>
        </div>

        {/* Expiry */}
        <div className="text-right shrink-0 hidden md:block">
          <span className={cn('text-xs font-semibold tabular-nums', isExpiringSoon ? 'text-amber-600' : 'text-gray-600')}>
            {daysUntilExpiry > 0 ? `${daysUntilExpiry}d` : 'Expired'}
          </span>
          <p className="text-[9px] text-gray-400">Until expiry</p>
        </div>

        {/* Underpayment indicator */}
        {contractUnderpayments.length > 0 && (
          <Badge variant="outline" className="text-[9px] h-5 px-1.5 bg-red-50 text-red-700 border-red-200 shrink-0">
            <TrendingDown className="size-2.5 mr-0.5" />
            {contractUnderpayments.length} underpaid
          </Badge>
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            {/* Contract details */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                <FileText className="size-3" /> Contract Details
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-semibold">{TYPE_LABELS[contract.type] || contract.type}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Effective</span><span className="font-semibold">{new Date(contract.effectiveDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Terminates</span><span className={cn('font-semibold', isExpiringSoon ? 'text-amber-600' : '')}>{new Date(contract.terminationDate).toLocaleDateString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Reimb. Rate</span><span className="font-semibold">{Math.round(contract.reimbursementRate * 100)}%</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Auto-Renew</span><span className="font-semibold">{contract.autoRenew ? 'Yes' : 'No'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Underpay Threshold</span><span className="font-semibold">{formatCurrencyExact(contract.underpaymentThreshold)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Last Reviewed</span><span className="font-semibold">{new Date(contract.lastReviewDate).toLocaleDateString()}</span></div>
              </div>
              {contract.notes && (
                <p className="text-[10px] text-gray-500 bg-gray-100 rounded-lg p-2 mt-2">{contract.notes}</p>
              )}

              {/* Contact info */}
              <div className="pt-2 border-t border-gray-200 space-y-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <User className="size-3 text-gray-400" />
                  <span className="text-gray-700">{contract.contactName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Mail className="size-3 text-gray-400" />
                  <a href={`mailto:${contract.contactEmail}`} className="text-blue-600 hover:underline">{contract.contactEmail}</a>
                </div>
              </div>
            </div>

            {/* Fee schedule */}
            <div className="bg-gray-50 rounded-xl p-3 md:col-span-2">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1 mb-2">
                <DollarSign className="size-3" /> Fee Schedule
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-1.5 px-2 text-left text-[9px] font-semibold text-gray-400 uppercase">Code</th>
                      <th className="py-1.5 px-2 text-left text-[9px] font-semibold text-gray-400 uppercase">Description</th>
                      <th className="py-1.5 px-2 text-right text-[9px] font-semibold text-gray-400 uppercase">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contract.feeSchedule.map(fee => (
                      <tr key={fee.code} className="hover:bg-gray-100/50">
                        <td className="py-1.5 px-2 font-mono font-semibold text-blue-600">{fee.code}</td>
                        <td className="py-1.5 px-2 text-gray-700">{fee.description}</td>
                        <td className="py-1.5 px-2 text-right font-bold text-gray-900 tabular-nums">
                          {fee.rate < 1 ? `${Math.round(fee.rate * 100)}%` : formatCurrencyExact(fee.rate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Underpayments for this contract */}
              {contractUnderpayments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-[10px] font-semibold text-red-600 uppercase flex items-center gap-1 mb-2">
                    <AlertTriangle className="size-3" /> Detected Underpayments ({contractUnderpayments.length})
                  </h4>
                  <div className="space-y-1.5">
                    {contractUnderpayments.map(u => (
                      <div key={u.claimId} className="flex items-center justify-between bg-red-50 rounded-lg px-2.5 py-1.5 text-xs">
                        <div>
                          <span className="font-mono text-[10px] text-blue-600 font-semibold">{u.claimNumber}</span>
                          <span className="text-gray-500 ml-2">{u.patientName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500">Expected: {formatCurrencyExact(u.expectedAmount)}</span>
                          <span className="text-gray-500 mx-1">·</span>
                          <span className="text-gray-500">Paid: {formatCurrencyExact(u.paidAmount)}</span>
                          <span className="text-red-600 font-bold ml-2">-{formatCurrencyExact(u.underpayment)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────

export const PayerContracts = React.memo(function PayerContracts() {
  const [data, setData] = useState<{ contracts: Contract[]; underpayments: Underpayment[]; summary: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { const result = await fetchContracts(); setData(result); }
    catch (err: any) { console.error('[PayerContracts] Error:', err); setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredContracts = useMemo(() => {
    if (!data?.contracts) return [];
    if (!searchQuery) return data.contracts;
    const q = searchQuery.toLowerCase();
    return data.contracts.filter(c => c.payer.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [data, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  if (loading) return <LoadingState message="Loading payer contracts..." />;
  if (error) return (
    <div className="text-center py-8 text-red-500">
      <p className="text-sm mb-2">{error}</p>
      <Button size="sm" variant="outline" onClick={loadData}>Retry</Button>
    </div>
  );
  if (!data) return null;
  const { summary, underpayments } = data;

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard title="Total Contracts" value={summary.totalContracts} subtitle="Payer agreements" icon={<Handshake className="size-4" />} />
        <MetricCard title="Active" value={summary.active} subtitle="Currently in effect" icon={<CheckCircle2 className="size-4" />} variant="success" />
        <MetricCard title="Expiring" value={summary.expiring} subtitle="Needs renewal" icon={<Clock className="size-4" />} variant="warning" />
        <MetricCard title="Underpayments" value={summary.underpaymentCount} subtitle="Auto-detected" icon={<TrendingDown className="size-4" />} variant={summary.underpaymentCount > 0 ? 'danger' : 'default'} />
        <MetricCard title="Underpaid Total" value={formatCurrency(summary.underpaymentTotal)} subtitle="Recovery opportunity" icon={<DollarSign className="size-4" />} variant={summary.underpaymentTotal > 0 ? 'danger' : 'default'} />
      </div>

      {/* Underpayment alert banner */}
      {underpayments.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="size-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-800">
              Underpayment Alert: {underpayments.length} claim{underpayments.length > 1 ? 's' : ''} paid below contract terms
            </h3>
            <p className="text-xs text-red-600 mt-0.5">
              Total underpayment: {formatCurrency(summary.underpaymentTotal)} across {[...new Set(underpayments.map(u => u.payer))].length} payer{[...new Set(underpayments.map(u => u.payer))].length > 1 ? 's' : ''}. Expand contracts below to review individual claims and initiate appeals.
            </p>
          </div>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-xs gap-1 shrink-0">
            <TrendingDown className="size-3" /> Review All
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search payer or contract..." className="pl-9 h-8 text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Contract list */}
      <div className="space-y-3">
        {filteredContracts.map(contract => (
          <ContractCard
            key={contract.id}
            contract={contract}
            expanded={expandedIds.has(contract.id)}
            onToggle={() => toggleExpand(contract.id)}
            underpayments={underpayments}
          />
        ))}
        {filteredContracts.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-gray-400">
              <Handshake className="size-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No contracts match your search</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
});
