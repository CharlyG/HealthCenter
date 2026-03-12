/**
 * Eligibility Verification
 * Real-time payer checks for new admissions.
 * Shows patient eligibility status, coverage details, authorization info,
 * with ability to re-verify and batch verify.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  Shield, CheckCircle2, XCircle, AlertTriangle, Clock,
  Search, RefreshCw, ChevronDown, ChevronRight, Loader2,
  User, CreditCard, Calendar, Activity, Zap, FileCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchEligibility, verifyEligibility, verifyAllEligibility } from '../../lib/billingApi';
import { toast } from 'sonner';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

type EligStatus = 'active' | 'expiring' | 'inactive';

const STATUS_CONFIG: Record<EligStatus, { label: string; bg: string; color: string; dot: string; border: string }> = {
  active:   { label: 'Active',   bg: 'bg-emerald-50', color: 'text-emerald-700', dot: 'bg-emerald-500', border: 'border-emerald-200' },
  expiring: { label: 'Expiring', bg: 'bg-amber-50',   color: 'text-amber-700',   dot: 'bg-amber-500',   border: 'border-amber-200' },
  inactive: { label: 'Inactive', bg: 'bg-red-50',     color: 'text-red-700',     dot: 'bg-red-500',     border: 'border-red-200' },
};

interface EligRecord {
  id: string;
  patientName: string;
  mrn: string;
  dob: string;
  payer: string;
  memberId: string;
  planName: string;
  groupNumber: string;
  effectiveDate: string;
  terminationDate: string;
  copay: number;
  coinsurance: number;
  deductible: number;
  deductibleMet: number;
  status: EligStatus;
  lastVerified: string;
  admissionId: string;
  admissionDate: string;
  homeHealthCovered: boolean;
  visitsAuthorized: number;
  visitsUsed: number;
  authNumber: string;
  authExpires: string;
  authPending?: boolean;
}

// ─── Eligibility Card ──────────────────────────────────────────────────────

const EligibilityCard = React.memo(function EligibilityCard({ record, expanded, onToggle, onVerify, verifying }: {
  record: EligRecord;
  expanded: boolean;
  onToggle: () => void;
  onVerify: () => void;
  verifying: boolean;
}) {
  const sc = STATUS_CONFIG[record.status];
  const lastVerified = new Date(record.lastVerified);
  const daysSinceVerify = Math.floor((Date.now() - lastVerified.getTime()) / 86400000);
  const stale = daysSinceVerify > 7;
  const deductiblePct = record.deductible > 0
    ? Math.min(100, Math.round((record.deductibleMet / record.deductible) * 100))
    : 100;
  const visitsPct = record.visitsAuthorized > 0
    ? Math.round((record.visitsUsed / record.visitsAuthorized) * 100)
    : 0;
  const visitsRemaining = record.visitsAuthorized - record.visitsUsed;
  const authDaysLeft = record.authExpires
    ? Math.ceil((new Date(record.authExpires).getTime() - Date.now()) / 86400000)
    : 0;

  return (
    <div className={cn(
      'rounded-xl border-2 transition-all overflow-hidden',
      record.status === 'inactive' ? 'border-red-200 bg-red-50/20' :
      record.status === 'expiring' ? 'border-amber-200' :
      'border-gray-200',
    )}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50" onClick={onToggle}>
        {expanded ? <ChevronDown className="size-4 text-gray-400 shrink-0" /> : <ChevronRight className="size-4 text-gray-400 shrink-0" />}

        {/* Status indicator */}
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', sc.bg)}>
          {record.status === 'active' ? <CheckCircle2 className={cn('size-5', sc.color)} /> :
           record.status === 'expiring' ? <AlertTriangle className={cn('size-5', sc.color)} /> :
           <XCircle className={cn('size-5', sc.color)} />}
        </div>

        {/* Patient info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{record.patientName}</span>
            <span className="text-[10px] text-gray-400">{record.mrn}</span>
            <Badge variant="outline" className={cn('text-[9px] h-4 px-1 border', sc.bg, sc.color, sc.border)}>
              <span className={cn('w-1.5 h-1.5 rounded-full mr-0.5', sc.dot)} />
              {sc.label}
            </Badge>
            {record.authPending && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 bg-purple-50 text-purple-700 border-purple-200">
                Auth Pending
              </Badge>
            )}
            {stale && (
              <Badge variant="outline" className="text-[9px] h-4 px-1 bg-gray-100 text-gray-500 border-gray-200">
                <Clock className="size-2.5 mr-0.5" /> Stale
              </Badge>
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {record.payer} · {record.planName} · Member: {record.memberId}
          </p>
        </div>

        {/* Auth visits remaining */}
        {record.visitsAuthorized > 0 && (
          <div className="hidden md:flex flex-col items-end shrink-0">
            <span className={cn('text-xs font-bold tabular-nums',
              visitsRemaining <= 5 ? 'text-red-600' : visitsRemaining <= 10 ? 'text-amber-600' : 'text-gray-700',
            )}>
              {visitsRemaining} visits left
            </span>
            <span className="text-[9px] text-gray-400">{record.visitsUsed}/{record.visitsAuthorized} used</span>
          </div>
        )}

        {/* Verify button */}
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[10px] gap-1 shrink-0"
          onClick={(e) => { e.stopPropagation(); onVerify(); }}
          disabled={verifying}
        >
          {verifying ? <Loader2 className="size-3 animate-spin" /> : <Zap className="size-3" />}
          Verify
        </Button>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {/* Coverage Details */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                <CreditCard className="size-3" /> Coverage Details
              </h4>
              <div className="space-y-1.5 text-xs">
                <InfoRow label="Plan" value={record.planName} />
                <InfoRow label="Group" value={record.groupNumber} />
                <InfoRow label="Effective" value={new Date(record.effectiveDate).toLocaleDateString()} />
                <InfoRow label="Terminates" value={new Date(record.terminationDate).toLocaleDateString()}
                  danger={new Date(record.terminationDate) < new Date(Date.now() + 30 * 86400000)} />
                <InfoRow label="Home Health" value={record.homeHealthCovered ? 'Covered' : 'NOT Covered'}
                  danger={!record.homeHealthCovered} success={record.homeHealthCovered} />
              </div>
            </div>

            {/* Cost Sharing */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                <Activity className="size-3" /> Cost Sharing
              </h4>
              <div className="space-y-1.5 text-xs">
                <InfoRow label="Copay" value={record.copay > 0 ? formatCurrency(record.copay) : 'None'} />
                <InfoRow label="Coinsurance" value={`${record.coinsurance}%`} />
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-gray-500">Deductible</span>
                    <span className="font-semibold">{formatCurrency(record.deductibleMet)} / {formatCurrency(record.deductible)}</span>
                  </div>
                  <Progress
                    value={deductiblePct}
                    className={cn('h-1.5',
                      deductiblePct >= 100
                        ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
                        : '[&>[data-slot=progress-indicator]]:bg-blue-500',
                    )}
                  />
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {deductiblePct >= 100 ? 'Deductible fully met' : `${100 - deductiblePct}% remaining`}
                  </p>
                </div>
              </div>
            </div>

            {/* Authorization */}
            <div className={cn('rounded-xl p-3 space-y-2',
              record.authPending ? 'bg-purple-50' :
              !record.authNumber ? 'bg-red-50' :
              authDaysLeft <= 30 ? 'bg-amber-50' : 'bg-gray-50',
            )}>
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase flex items-center gap-1">
                <Shield className="size-3" /> Authorization
              </h4>
              {record.authPending ? (
                <div className="flex items-center gap-2 text-xs text-purple-700">
                  <Loader2 className="size-4 animate-spin" />
                  <span className="font-medium">Authorization request pending</span>
                </div>
              ) : record.authNumber ? (
                <div className="space-y-1.5 text-xs">
                  <InfoRow label="Auth #" value={record.authNumber} />
                  <InfoRow label="Expires" value={new Date(record.authExpires).toLocaleDateString()}
                    danger={authDaysLeft <= 14} />
                  {authDaysLeft > 0 && <InfoRow label="Days Left" value={`${authDaysLeft} days`}
                    danger={authDaysLeft <= 14} />}
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">Visits Used</span>
                      <span className={cn('font-semibold', visitsPct > 80 ? 'text-red-600' : 'text-gray-700')}>
                        {record.visitsUsed} / {record.visitsAuthorized}
                      </span>
                    </div>
                    <Progress
                      value={visitsPct}
                      className={cn('h-1.5',
                        visitsPct > 80 ? '[&>[data-slot=progress-indicator]]:bg-red-500' :
                        visitsPct > 60 ? '[&>[data-slot=progress-indicator]]:bg-amber-500' :
                        '[&>[data-slot=progress-indicator]]:bg-emerald-500',
                      )}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-red-700">
                  <XCircle className="size-4" />
                  <span className="font-medium">No authorization on file</span>
                </div>
              )}
            </div>
          </div>

          {/* Last verified info */}
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Clock className="size-3" />
              Last verified: {lastVerified.toLocaleDateString()} at {lastVerified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {stale && <span className="text-amber-600 font-semibold ml-1">({daysSinceVerify} days ago — reverification recommended)</span>}
            </span>
            <span className="text-[10px] text-gray-400">Admission: {new Date(record.admissionDate).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
});

function InfoRow({ label, value, danger, success }: { label: string; value: string; danger?: boolean; success?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={cn('font-semibold',
        danger ? 'text-red-600' : success ? 'text-emerald-600' : 'text-gray-800',
      )}>{value}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export const EligibilityVerification = React.memo(function EligibilityVerification() {
  const [records, setRecords] = useState<EligRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyingAll, setVerifyingAll] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchEligibility({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setRecords(result.records || []);
      setSummary(result.summary || null);
    } catch (err: any) {
      console.error('[EligibilityVerification] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(loadData, 300);
    return () => clearTimeout(debounce);
  }, [loadData]);

  const handleVerify = useCallback(async (id: string) => {
    setVerifyingId(id);
    try {
      const result = await verifyEligibility(id);
      toast.success(`Eligibility verified for ${records.find(r => r.id === id)?.patientName || 'patient'}`);
      await loadData();
    } catch (err: any) {
      toast.error('Verification failed');
    } finally {
      setVerifyingId(null);
    }
  }, [records, loadData]);

  const handleVerifyAll = useCallback(async () => {
    setVerifyingAll(true);
    try {
      const result = await verifyAllEligibility();
      toast.success(`${result.updated} records verified`);
      await loadData();
    } catch (err: any) {
      toast.error('Batch verification failed');
    } finally {
      setVerifyingAll(false);
    }
  }, [loadData]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (loading) return <LoadingState message="Loading eligibility records..." />;
  if (error) return (
    <div className="text-center py-8 text-red-500">
      <p className="text-sm mb-2">{error}</p>
      <Button size="sm" variant="outline" onClick={loadData}>Retry</Button>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard title="Total Patients" value={summary?.total || 0} subtitle="With active admissions" icon={<User className="size-4" />} />
        <MetricCard title="Active" value={summary?.active || 0} subtitle="Verified eligible" icon={<CheckCircle2 className="size-4" />} variant="success" />
        <MetricCard title="Expiring" value={summary?.expiring || 0} subtitle="Auth/coverage expiring" icon={<AlertTriangle className="size-4" />} variant="warning" />
        <MetricCard title="Inactive" value={summary?.inactive || 0} subtitle="Coverage terminated" icon={<XCircle className="size-4" />} variant="danger" />
        <MetricCard title="Needs Re-Verify" value={summary?.needsReverification || 0} subtitle="Stale > 7 days" icon={<RefreshCw className="size-4" />}
          variant={(summary?.needsReverification || 0) > 0 ? 'warning' : 'default'} />
      </div>

      {/* Filters + batch verify */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search patient, MRN, payer, member ID..." className="pl-9 h-8 text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>
                <span className="flex items-center gap-1">
                  <span className={cn('w-2 h-2 rounded-full', v.dot)} /> {v.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="ml-auto gap-1.5 text-xs bg-blue-600 hover:bg-blue-700"
          onClick={handleVerifyAll}
          disabled={verifyingAll}
        >
          {verifyingAll ? <Loader2 className="size-3.5 animate-spin" /> : <Zap className="size-3.5" />}
          Verify All ({records.length})
        </Button>
      </div>

      {/* Records list */}
      <div className="space-y-3">
        {records.map(record => (
          <EligibilityCard
            key={record.id}
            record={record}
            expanded={expandedIds.has(record.id)}
            onToggle={() => toggleExpand(record.id)}
            onVerify={() => handleVerify(record.id)}
            verifying={verifyingId === record.id}
          />
        ))}
        {records.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-gray-400">
              <FileCheck className="size-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No eligibility records match your filters</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
});
