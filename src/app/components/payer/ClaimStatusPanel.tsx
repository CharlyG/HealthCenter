/**
 * Claim Status Panel
 * Visual lifecycle tracking: Submitted → Accepted → In Process → Paid/Denied
 */
import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  Send, CheckCircle2, Loader2, DollarSign, XCircle,
  Clock, AlertCircle, Search, Calendar, TrendingUp,
  ArrowRight, FileText, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { LoadingState } from '../design-system/LoadingState';
import { fetchClaimStatus } from '../../lib/payerApi';
import { toast } from 'sonner';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n);

type ClaimLifecycleStatus = 'draft' | 'submitted' | 'accepted' | 'in_process' | 'paid' | 'denied' | 'appealed';

interface ClaimStatusDetail {
  id: string;
  claimNumber: string;
  patientName: string;
  mrn: string;
  payer: string;
  serviceDate: string;
  billedAmount: number;
  allowedAmount?: number;
  paidAmount?: number;
  adjustmentAmount?: number;
  patientResponsibility?: number;
  status: ClaimLifecycleStatus;
  submittedDate?: string;
  acceptedDate?: string;
  processedDate?: string;
  paidDate?: string;
  denialReason?: string;
  denialCode?: string;
  statusHistory: {
    status: ClaimLifecycleStatus;
    date: string;
    note?: string;
  }[];
  clearinghouseId?: string;
  payerClaimId?: string;
}

const LIFECYCLE_STAGES: {
  status: ClaimLifecycleStatus;
  label: string;
  icon: React.ElementType;
  color: string;
}[] = [
  { status: 'draft', label: 'Draft', icon: FileText, color: 'text-gray-400' },
  { status: 'submitted', label: 'Submitted', icon: Send, color: 'text-blue-500' },
  { status: 'accepted', label: 'Accepted', icon: CheckCircle2, color: 'text-green-500' },
  { status: 'in_process', label: 'In Process', icon: Loader2, color: 'text-purple-500' },
  { status: 'paid', label: 'Paid', icon: DollarSign, color: 'text-emerald-600' },
];

const STATUS_CONFIG: Record<ClaimLifecycleStatus, { label: string; bg: string; color: string }> = {
  draft: { label: 'Draft', bg: 'bg-gray-50', color: 'text-gray-700' },
  submitted: { label: 'Submitted', bg: 'bg-blue-50', color: 'text-blue-700' },
  accepted: { label: 'Accepted', bg: 'bg-green-50', color: 'text-green-700' },
  in_process: { label: 'In Process', bg: 'bg-purple-50', color: 'text-purple-700' },
  paid: { label: 'Paid', bg: 'bg-emerald-50', color: 'text-emerald-700' },
  denied: { label: 'Denied', bg: 'bg-red-50', color: 'text-red-700' },
  appealed: { label: 'Appealed', bg: 'bg-amber-50', color: 'text-amber-700' },
};

// ─── Lifecycle Tracker ─────────────────────────────────────────────────────

const LifecycleTracker = React.memo(function LifecycleTracker({
  claim,
}: {
  claim: ClaimStatusDetail;
}) {
  const currentStageIndex = LIFECYCLE_STAGES.findIndex((s) => s.status === claim.status);
  const isDenied = claim.status === 'denied';

  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Claim Lifecycle</h4>
      
      {isDenied ? (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="size-6 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-900">Claim Denied</p>
            <p className="text-sm text-red-700 mt-1">{claim.denialReason}</p>
            {claim.denialCode && (
              <p className="text-xs text-red-600 mt-1">Code: {claim.denialCode}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline */}
          <div className="flex items-center justify-between mb-2">
            {LIFECYCLE_STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isComplete = idx <= currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              
              return (
                <React.Fragment key={stage.status}>
                  {idx > 0 && (
                    <div className="flex-1 h-1 mx-2">
                      <div className={cn(
                        'h-full rounded-full transition-all',
                        isComplete ? 'bg-blue-500' : 'bg-gray-200'
                      )} />
                    </div>
                  )}
                  <div className="relative">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                        isComplete ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400',
                        isCurrent && 'ring-4 ring-blue-100'
                      )}
                    >
                      <Icon className={cn('size-5', stage.status === 'in_process' && isCurrent && 'animate-spin')} />
                    </div>
                    <p className={cn(
                      'text-xs text-center mt-2 font-medium absolute left-1/2 -translate-x-1/2 whitespace-nowrap',
                      isComplete ? 'text-gray-900' : 'text-gray-500'
                    )}>
                      {stage.label}
                    </p>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Progress Percentage */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Progress</span>
              <span className="text-xs font-semibold text-gray-900">
                {Math.round(((currentStageIndex + 1) / LIFECYCLE_STAGES.length) * 100)}%
              </span>
            </div>
            <Progress value={((currentStageIndex + 1) / LIFECYCLE_STAGES.length) * 100} className="h-2" />
          </div>
        </div>
      )}
    </div>
  );
});

// ─── Status History Timeline ───────────────────────────────────────────────

const StatusHistoryTimeline = React.memo(function StatusHistoryTimeline({
  history,
}: {
  history: ClaimStatusDetail['statusHistory'];
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-900">Status History</h4>
      <div className="space-y-2">
        {history.map((entry, idx) => {
          const config = STATUS_CONFIG[entry.status];
          return (
            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', config.bg)} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('text-sm font-semibold', config.color)}>{config.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {new Date(entry.date).toLocaleString()}
                  </Badge>
                </div>
                {entry.note && <p className="text-xs text-gray-600">{entry.note}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── Claim Detail Card ─────────────────────────────────────────────────────

const ClaimDetailCard = React.memo(function ClaimDetailCard({
  claim,
}: {
  claim: ClaimStatusDetail;
}) {
  const statusConfig = STATUS_CONFIG[claim.status];
  const daysSinceSubmit = claim.submittedDate
    ? Math.floor((Date.now() - new Date(claim.submittedDate).getTime()) / 86400000)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => {
      if (e.target === e.currentTarget) {
        // Close on backdrop click - would be handled by parent
      }
    }}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{claim.patientName}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Claim #{claim.claimNumber} • {claim.payer}
              </p>
            </div>
            <Badge className={cn('text-sm', statusConfig.bg, statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lifecycle Tracker */}
          <LifecycleTracker claim={claim} />

          {/* Financial Summary */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 mb-1">Billed</p>
              <p className="text-xl font-bold text-blue-900">{formatCurrency(claim.billedAmount)}</p>
            </div>
            {claim.allowedAmount && (
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-green-700 mb-1">Allowed</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(claim.allowedAmount)}</p>
              </div>
            )}
            {claim.paidAmount !== undefined && (
              <div className="p-4 bg-emerald-50 rounded-lg">
                <p className="text-xs text-emerald-700 mb-1">Paid</p>
                <p className="text-xl font-bold text-emerald-900">{formatCurrency(claim.paidAmount)}</p>
              </div>
            )}
            {claim.patientResponsibility && (
              <div className="p-4 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-700 mb-1">Patient Resp.</p>
                <p className="text-xl font-bold text-amber-900">{formatCurrency(claim.patientResponsibility)}</p>
              </div>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Patient MRN</p>
              <p className="font-semibold text-gray-900">{claim.mrn}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Service Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(claim.serviceDate).toLocaleDateString()}
              </p>
            </div>
            {claim.submittedDate && (
              <div>
                <p className="text-gray-600 mb-1">Submitted Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(claim.submittedDate).toLocaleDateString()}
                  <span className="text-xs text-gray-600 ml-2">({daysSinceSubmit} days ago)</span>
                </p>
              </div>
            )}
            {claim.paidDate && (
              <div>
                <p className="text-gray-600 mb-1">Paid Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(claim.paidDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {claim.clearinghouseId && (
              <div>
                <p className="text-gray-600 mb-1">Clearinghouse ID</p>
                <p className="font-semibold text-gray-900 font-mono text-xs">{claim.clearinghouseId}</p>
              </div>
            )}
            {claim.payerClaimId && (
              <div>
                <p className="text-gray-600 mb-1">Payer Claim ID</p>
                <p className="font-semibold text-gray-900 font-mono text-xs">{claim.payerClaimId}</p>
              </div>
            )}
          </div>

          {/* Status History */}
          <StatusHistoryTimeline history={claim.statusHistory} />
        </CardContent>
      </Card>
    </div>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────

export const ClaimStatusPanel = React.memo(function ClaimStatusPanel() {
  const [claims, setClaims] = useState<ClaimStatusDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClaimLifecycleStatus | 'all'>('all');
  const [selectedClaim, setSelectedClaim] = useState<ClaimStatusDetail | null>(null);

  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClaimStatus();
      setClaims(data);
    } catch (err: any) {
      console.error('[ClaimStatusPanel] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = claims;
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.patientName.toLowerCase().includes(q) ||
          c.claimNumber.toLowerCase().includes(q) ||
          c.mrn.toLowerCase().includes(q)
      );
    }
    return result;
  }, [claims, statusFilter, searchQuery]);

  if (loading) {
    return (
      <div className="p-8">
        <LoadingState message="Loading claim status..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Claim Status Tracking</h2>
        <p className="text-sm text-gray-600 mt-1">
          Real-time claim lifecycle monitoring from submission to payment
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="size-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by claim #, patient, or MRN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="in_process">In Process</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Claims List */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Send className="size-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No claims found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((claim) => {
            const statusConfig = STATUS_CONFIG[claim.status];
            return (
              <Card
                key={claim.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedClaim(claim)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', statusConfig.bg)}>
                        <FileText className={cn('size-6', statusConfig.color)} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{claim.patientName}</h3>
                          <Badge variant="outline" className="text-xs">{claim.mrn}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Claim #{claim.claimNumber} • {claim.payer}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(claim.billedAmount)}</p>
                      <Badge className={cn('mt-1', statusConfig.bg, statusConfig.color)}>
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedClaim && (
        <div onClick={() => setSelectedClaim(null)}>
          <ClaimDetailCard claim={selectedClaim} />
        </div>
      )}
    </div>
  );
});
