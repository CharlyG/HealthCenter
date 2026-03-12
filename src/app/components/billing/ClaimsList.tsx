/**
 * Claims List Component — Enhanced
 * Full claims table with fields: Patient, Admission, Payer, Claim Type,
 * Statement Period, Status, Amount.
 * Supports filter, search, sort, bulk actions, pagination.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FileText, Search, Send, Eye, RotateCcw, XCircle,
  CheckCircle2, Clock, AlertCircle, Download, MoreHorizontal,
  ChevronLeft, ChevronRight, RefreshCw, Filter, ArrowUpDown,
  Loader2, Banknote, Receipt,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchClaims, submitClaim, voidClaim, batchSubmitClaims } from '../../lib/billingApi';

type ClaimStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'paid' | 'partial' | 'voided';

interface Claim {
  id: string;
  claimNumber: string;
  patientName: string;
  mrn: string;
  payer: string;
  claimType: 'initial' | 'recert' | 'rap' | 'final';
  status: ClaimStatus;
  billedAmount: number;
  paidAmount?: number;
  serviceFrom: string;
  serviceTo: string;
  submittedDate?: string;
  paidDate?: string;
  rejectionReason?: string;
  episodeId: string;
}

const statusConfig: Record<ClaimStatus, { label: string; bg: string; color: string; dot: string; icon: React.ReactNode }> = {
  draft:     { label: 'Draft',       bg: 'bg-gray-50',    color: 'text-gray-600',    dot: 'bg-gray-400',    icon: <FileText className="size-3" /> },
  submitted: { label: 'Submitted',   bg: 'bg-blue-50',    color: 'text-blue-700',    dot: 'bg-blue-500',    icon: <Send className="size-3" /> },
  accepted:  { label: 'Accepted',    bg: 'bg-green-50',   color: 'text-green-700',   dot: 'bg-green-500',   icon: <CheckCircle2 className="size-3" /> },
  rejected:  { label: 'Rejected',    bg: 'bg-red-50',     color: 'text-red-700',     dot: 'bg-red-500',     icon: <XCircle className="size-3" /> },
  paid:      { label: 'Paid',        bg: 'bg-emerald-50', color: 'text-emerald-700', dot: 'bg-emerald-500', icon: <CheckCircle2 className="size-3" /> },
  partial:   { label: 'Partial Pay', bg: 'bg-amber-50',   color: 'text-amber-700',   dot: 'bg-amber-500',   icon: <AlertCircle className="size-3" /> },
  voided:    { label: 'Voided',      bg: 'bg-gray-50',    color: 'text-gray-500',    dot: 'bg-gray-400',    icon: <XCircle className="size-3" /> },
};

const claimTypeConfig: Record<string, { label: string; color: string }> = {
  initial: { label: 'Initial', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  recert:  { label: 'Recert',  color: 'bg-purple-50 text-purple-700 border-purple-200' },
  rap:     { label: 'RAP',     color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  final:   { label: 'Final',   color: 'bg-green-50 text-green-700 border-green-200' },
};

// Simulated admission labels from episode IDs
const admissionLabels: Record<string, string> = {
  'EP-001': 'Home Health — SOC 01/15',
  'EP-002': 'Home Health — SOC 02/01',
  'EP-003': 'Home Health — SOC 02/10',
  'EP-004': 'Home Health — SOC 02/15',
  'EP-005': 'Home Health — Recert 01/20',
  'EP-006': 'Home Health — Recert 03/01',
  'EP-007': 'Home Health — SOC 01/10',
  'EP-008': 'Home Health — SOC 02/20',
  'EP-009': 'Home Health — SOC 01/05',
  'EP-010': 'Home Health — Discharge 01/29',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

const formatDateShort = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

type SortField = 'patient' | 'payer' | 'status' | 'amount' | 'date';

export const ClaimsList = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimStatus | 'all'>('all');
  const [payerFilter, setPayerFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedClaims, setSelectedClaims] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pageSize: 25, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const pageSize = 15;

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchClaims({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        payer: payerFilter !== 'all' ? payerFilter : undefined,
        page: currentPage,
        pageSize,
      });
      setClaims(result.claims);
      setPagination(result.pagination);
    } catch (err: any) {
      console.error('[ClaimsList] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, payerFilter, currentPage]);

  useEffect(() => {
    const debounce = setTimeout(loadClaims, 300);
    return () => clearTimeout(debounce);
  }, [loadClaims]);

  const handleSubmit = useCallback(async (id: string) => {
    setActionLoading(id);
    try { await submitClaim(id); await loadClaims(); } catch (err: any) { console.error(err); } finally { setActionLoading(null); }
  }, [loadClaims]);

  const handleVoid = useCallback(async (id: string) => {
    setActionLoading(id);
    try { await voidClaim(id); await loadClaims(); } catch (err: any) { console.error(err); } finally { setActionLoading(null); }
  }, [loadClaims]);

  const handleBatchSubmit = useCallback(async () => {
    if (selectedClaims.size === 0) return;
    setActionLoading('batch');
    try {
      await batchSubmitClaims(Array.from(selectedClaims));
      setSelectedClaims(new Set());
      await loadClaims();
    } catch (err: any) { console.error(err); } finally { setActionLoading(null); }
  }, [selectedClaims, loadClaims]);

  const payers = useMemo(() => [...new Set(claims.map((c) => c.payer))].sort(), [claims]);

  // Client-side sort + type filter
  const displayClaims = useMemo(() => {
    let filtered = typeFilter !== 'all'
      ? claims.filter(c => c.claimType === typeFilter)
      : claims;

    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'patient': cmp = a.patientName.localeCompare(b.patientName); break;
        case 'payer': cmp = a.payer.localeCompare(b.payer); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'amount': cmp = a.billedAmount - b.billedAmount; break;
        case 'date': cmp = a.serviceFrom.localeCompare(b.serviceFrom); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [claims, typeFilter, sortField, sortDir]);

  const stats = useMemo(() => ({
    total: pagination.total,
    totalBilled: claims.reduce((s, c) => s + c.billedAmount, 0),
    totalPaid: claims.reduce((s, c) => s + (c.paidAmount || 0), 0),
    rejected: claims.filter((c) => c.status === 'rejected').length,
    draft: claims.filter(c => c.status === 'draft').length,
  }), [claims, pagination]);

  const toggleSelectAll = useCallback(() => {
    if (selectedClaims.size === displayClaims.length) setSelectedClaims(new Set());
    else setSelectedClaims(new Set(displayClaims.map((c) => c.id)));
  }, [displayClaims, selectedClaims.size]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedClaims((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="py-2.5 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 select-none"
      onClick={() => handleSort(field)}
    >
      <span className="flex items-center gap-1">
        {children}
        {sortField === field && (
          <ArrowUpDown className={cn('size-3', sortDir === 'desc' && 'rotate-180')} />
        )}
      </span>
    </th>
  );

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard title="Total Claims" value={stats.total} subtitle="All records" icon={<FileText className="size-4" />} />
        <MetricCard title="Total Billed" value={formatCurrency(stats.totalBilled)} subtitle="Sum of billed amounts" icon={<Send className="size-4" />} />
        <MetricCard
          title="Collected"
          value={formatCurrency(stats.totalPaid)}
          subtitle={stats.totalBilled > 0 ? `${Math.round((stats.totalPaid / stats.totalBilled) * 100)}% rate` : '—'}
          icon={<Banknote className="size-4" />} variant="success"
        />
        <MetricCard title="Rejected" value={stats.rejected} subtitle="Needs correction" icon={<XCircle className="size-4" />} variant="danger" />
        <MetricCard title="Draft" value={stats.draft} subtitle="Ready to submit" icon={<FileText className="size-4" />} variant="warning" />
      </div>

      {/* Filters + actions bar */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="size-4 text-green-600" />
              Claims Table
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedClaims.size > 0 && (
                <>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {selectedClaims.size} selected
                  </Badge>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={handleBatchSubmit}
                    disabled={actionLoading === 'batch'}>
                    {actionLoading === 'batch' ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
                    Submit Selected
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                    <Download className="size-3" /> Export
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" className="h-8" onClick={loadClaims}>
                <RefreshCw className="size-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Filter row */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search patient, claim #, payer..."
                className="pl-9 h-8 text-xs"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: any) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>
                    <span className="flex items-center gap-1.5">{v.icon} {v.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={payerFilter} onValueChange={(v) => { setPayerFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Payer" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payers</SelectItem>
                {payers.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Claim Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(claimTypeConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <LoadingState message="Loading claims..." />
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p className="text-sm mb-2">{error}</p>
              <Button size="sm" variant="outline" onClick={loadClaims}>Retry</Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      <th className="py-2.5 px-3 text-left w-10">
                        <Checkbox
                          checked={selectedClaims.size === displayClaims.length && displayClaims.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="py-2.5 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Claim #
                      </th>
                      <SortHeader field="patient">Patient</SortHeader>
                      <th className="py-2.5 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Admission
                      </th>
                      <SortHeader field="payer">Payer</SortHeader>
                      <th className="py-2.5 px-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Claim Type
                      </th>
                      <SortHeader field="date">Statement Period</SortHeader>
                      <SortHeader field="status">Status</SortHeader>
                      <SortHeader field="amount">Amount</SortHeader>
                      <th className="py-2.5 px-3 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        Paid
                      </th>
                      <th className="py-2.5 px-3 w-10" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayClaims.map((claim) => {
                      const sc = statusConfig[claim.status];
                      const tc = claimTypeConfig[claim.claimType];
                      const admission = admissionLabels[claim.episodeId] || `Episode ${claim.episodeId}`;
                      const isSelected = selectedClaims.has(claim.id);

                      return (
                        <tr
                          key={claim.id}
                          className={cn(
                            'hover:bg-gray-50/80 transition-colors',
                            isSelected && 'bg-blue-50/40',
                            claim.status === 'rejected' && 'bg-red-50/30',
                          )}
                        >
                          <td className="py-2.5 px-3">
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSelect(claim.id)} />
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="font-mono text-[11px] font-semibold text-blue-600 cursor-pointer hover:underline">
                              {claim.claimNumber}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-gray-900 text-xs">{claim.patientName}</div>
                            <div className="text-[10px] text-gray-400">{claim.mrn}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-xs text-gray-600 truncate block max-w-[160px]" title={admission}>
                              {admission}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-xs text-gray-700">{claim.payer}</td>
                          <td className="py-2.5 px-3">
                            <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5', tc?.color)}>
                              {tc?.label || claim.claimType}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="text-xs text-gray-600 tabular-nums whitespace-nowrap">
                              {formatDateShort(claim.serviceFrom)} – {formatDate(claim.serviceTo)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                              sc.bg, sc.color,
                              claim.status === 'rejected' ? 'border-red-200' :
                              claim.status === 'paid' ? 'border-emerald-200' :
                              'border-gray-200',
                            )}>
                              <span className={cn('w-1.5 h-1.5 rounded-full', sc.dot)} />
                              {sc.label}
                            </span>
                            {claim.rejectionReason && (
                              <div className="text-[9px] text-red-500 mt-0.5 truncate max-w-[140px]" title={claim.rejectionReason}>
                                {claim.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className="font-semibold text-gray-900 text-xs tabular-nums">
                              {formatCurrency(claim.billedAmount)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {claim.paidAmount !== undefined ? (
                              <span className={cn(
                                'text-xs tabular-nums font-medium',
                                claim.paidAmount >= claim.billedAmount ? 'text-emerald-600' :
                                claim.paidAmount > 0 ? 'text-amber-600' : 'text-red-500',
                              )}>
                                {formatCurrency(claim.paidAmount)}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem className="text-xs gap-2">
                                  <Eye className="size-3.5" /> View Claim Detail
                                </DropdownMenuItem>
                                {claim.status === 'draft' && (
                                  <DropdownMenuItem
                                    className="text-xs gap-2"
                                    onClick={() => handleSubmit(claim.id)}
                                    disabled={actionLoading === claim.id}
                                  >
                                    <Send className="size-3.5" /> Submit to Payer
                                  </DropdownMenuItem>
                                )}
                                {claim.status === 'rejected' && (
                                  <DropdownMenuItem className="text-xs gap-2">
                                    <RotateCcw className="size-3.5" /> Correct & Resubmit
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-xs gap-2">
                                  <Download className="size-3.5" /> Download 837
                                </DropdownMenuItem>
                                {claim.status !== 'voided' && (
                                  <DropdownMenuItem
                                    className="text-xs gap-2 text-red-600"
                                    onClick={() => handleVoid(claim.id)}
                                    disabled={actionLoading === claim.id}
                                  >
                                    <XCircle className="size-3.5" /> Void Claim
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {displayClaims.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <FileText className="size-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No claims match your filters</p>
                    <p className="text-xs mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <p className="text-[10px] text-gray-400">
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} total claims
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => p - 1)}>
                      <ChevronLeft className="size-4" />
                    </Button>
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map(p => (
                      <Button
                        key={p}
                        variant="outline"
                        size="sm"
                        className={cn('h-7 min-w-[28px] text-xs',
                          p === currentPage && 'bg-green-50 text-green-700 border-green-200')}
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={currentPage >= pagination.totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}>
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ClaimsList.displayName = 'ClaimsList';