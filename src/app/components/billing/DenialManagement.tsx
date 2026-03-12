/**
 * Denial Management
 * Root cause analysis + appeal tracking workflow.
 * Shows denial categories, individual denials with status tracking,
 * and appeal/correction workflows.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  XCircle, AlertTriangle, Clock, Search, Filter,
  ChevronDown, ChevronRight, Send, RotateCcw, FileText,
  CheckCircle2, Shield, Code, Unlink, BookOpen, Timer,
  RefreshCw, Loader2, BarChart3, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchDenials, updateDenial } from '../../lib/billingApi';
import { toast } from 'sonner';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

type DenialStatus = 'open' | 'appeal_submitted' | 'corrected' | 'resolved';
type DenialCategory = 'authorization' | 'coding' | 'eligibility' | 'duplicate' | 'documentation' | 'timely_filing' | 'coverage';
type DenialPriority = 'critical' | 'high' | 'medium' | 'low';

const STATUS_CONFIG: Record<DenialStatus, { label: string; bg: string; color: string; icon: React.ReactNode }> = {
  open:             { label: 'Open',             bg: 'bg-red-50',    color: 'text-red-700',     icon: <XCircle className="size-3" /> },
  appeal_submitted: { label: 'Appeal Submitted', bg: 'bg-blue-50',   color: 'text-blue-700',    icon: <Send className="size-3" /> },
  corrected:        { label: 'Corrected',        bg: 'bg-amber-50',  color: 'text-amber-700',   icon: <RotateCcw className="size-3" /> },
  resolved:         { label: 'Resolved',         bg: 'bg-emerald-50', color: 'text-emerald-700', icon: <CheckCircle2 className="size-3" /> },
};

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  authorization:  { label: 'Authorization',  icon: <Shield className="size-4" />,     color: '#8b5cf6' },
  coding:         { label: 'Coding',         icon: <Code className="size-4" />,       color: '#3b82f6' },
  eligibility:    { label: 'Eligibility',    icon: <AlertTriangle className="size-4" />, color: '#f59e0b' },
  duplicate:      { label: 'Duplicate',      icon: <Unlink className="size-4" />,     color: '#6b7280' },
  documentation:  { label: 'Documentation',  icon: <FileText className="size-4" />,   color: '#10b981' },
  timely_filing:  { label: 'Timely Filing',  icon: <Timer className="size-4" />,      color: '#ef4444' },
  coverage:       { label: 'Coverage',       icon: <BookOpen className="size-4" />,   color: '#ec4899' },
};

const PRIORITY_CONFIG: Record<DenialPriority, { label: string; color: string; dot: string }> = {
  critical: { label: 'Critical', color: 'text-red-700 bg-red-50 border-red-200', dot: 'bg-red-500' },
  high:     { label: 'High',     color: 'text-orange-700 bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   color: 'text-amber-700 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
  low:      { label: 'Low',      color: 'text-gray-600 bg-gray-50 border-gray-200', dot: 'bg-gray-400' },
};

interface Denial {
  id: string;
  claimId: string;
  claimNumber: string;
  patientName: string;
  mrn: string;
  payer: string;
  billedAmount: number;
  denialDate: string;
  denialCode: string;
  denialReason: string;
  category: DenialCategory;
  status: DenialStatus;
  assignedTo: string;
  daysOpen: number;
  appealDeadline: string;
  priority: DenialPriority;
  notes?: string;
  appealDate?: string;
  appealNotes?: string;
  correctionDate?: string;
  correctionNotes?: string;
  resolutionDate?: string;
  resolutionNotes?: string;
  resolution?: string;
}

// ─── Appeal Action Dialog ──────────────────────────────────────────────────

function AppealDialog({ denial, onSubmit, onCancel, actionType }: {
  denial: Denial;
  onSubmit: (data: Record<string, any>) => void;
  onCancel: () => void;
  actionType: 'appeal' | 'correct' | 'resolve';
}) {
  const [notes, setNotes] = useState('');
  const [resolution, setResolution] = useState('overturned');

  const titles = { appeal: 'Submit Appeal', correct: 'Correct & Resubmit', resolve: 'Resolve Denial' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-base font-bold text-gray-900">{titles[actionType]}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{denial.claimNumber} — {denial.patientName}</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-gray-500">Denial Code</span><span className="font-semibold">{denial.denialCode}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Reason</span><span className="font-semibold text-right max-w-[200px]">{denial.denialReason}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-semibold">{formatCurrency(denial.billedAmount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Deadline</span><span className="font-semibold">{new Date(denial.appealDeadline).toLocaleDateString()}</span></div>
          </div>

          {actionType === 'resolve' && (
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Resolution Type</label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="overturned">Overturned — Paid in full</SelectItem>
                  <SelectItem value="partial">Partially overturned</SelectItem>
                  <SelectItem value="upheld">Upheld — Write off</SelectItem>
                  <SelectItem value="voided">Voided</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block">
              {actionType === 'appeal' ? 'Appeal Notes' : actionType === 'correct' ? 'Correction Details' : 'Resolution Notes'}
            </label>
            <Textarea
              className="text-xs min-h-[80px]"
              placeholder={actionType === 'appeal' ? 'Describe the basis for this appeal...' : actionType === 'correct' ? 'Describe the correction made...' : 'Describe the resolution...'}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
          <Button
            size="sm"
            className={actionType === 'resolve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}
            disabled={!notes.trim()}
            onClick={() => {
              const now = new Date().toISOString().split('T')[0];
              if (actionType === 'appeal') onSubmit({ status: 'appeal_submitted', appealDate: now, appealNotes: notes });
              else if (actionType === 'correct') onSubmit({ status: 'corrected', correctionDate: now, correctionNotes: notes });
              else onSubmit({ status: 'resolved', resolutionDate: now, resolutionNotes: notes, resolution });
            }}
          >
            {actionType === 'appeal' ? 'Submit Appeal' : actionType === 'correct' ? 'Submit Correction' : 'Mark Resolved'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Denial Row ─────────────────────────────────────────────────────────────

const DenialRow = React.memo(function DenialRow({ denial, expanded, onToggle, onAction }: {
  denial: Denial;
  expanded: boolean;
  onToggle: () => void;
  onAction: (type: 'appeal' | 'correct' | 'resolve') => void;
}) {
  const sc = STATUS_CONFIG[denial.status];
  const cc = CATEGORY_CONFIG[denial.category];
  const pc = PRIORITY_CONFIG[denial.priority];
  const deadlineDays = Math.ceil((new Date(denial.appealDeadline).getTime() - Date.now()) / 86400000);
  const deadlineUrgent = deadlineDays <= 14;

  return (
    <div className={cn('rounded-xl border-2 transition-all overflow-hidden',
      denial.status === 'resolved' ? 'border-gray-200 opacity-75' :
      denial.priority === 'critical' ? 'border-red-200' :
      denial.status === 'open' ? 'border-amber-200' : 'border-gray-200',
    )}>
      <button className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50" onClick={onToggle}>
        {expanded ? <ChevronDown className="size-4 text-gray-400 shrink-0" /> : <ChevronRight className="size-4 text-gray-400 shrink-0" />}
        {/* Priority dot */}
        <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', pc.dot)} title={pc.label} />
        {/* Patient info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{denial.patientName}</span>
            <span className="font-mono text-[10px] text-blue-600">{denial.claimNumber}</span>
            <Badge variant="outline" className={cn('text-[9px] h-4 px-1', sc.bg, sc.color)}>{sc.icon}<span className="ml-0.5">{sc.label}</span></Badge>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {denial.payer} · {denial.denialCode} · {denial.denialReason}
          </p>
        </div>
        {/* Category */}
        <Badge variant="outline" className="text-[9px] h-5 px-1.5 shrink-0 hidden md:flex" style={{ borderColor: cc?.color, color: cc?.color }}>
          {cc?.icon}<span className="ml-0.5">{cc?.label}</span>
        </Badge>
        {/* Amount */}
        <span className="text-sm font-bold text-gray-900 tabular-nums shrink-0">{formatCurrency(denial.billedAmount)}</span>
        {/* Deadline */}
        {denial.status !== 'resolved' && (
          <span className={cn('text-[10px] font-semibold tabular-nums shrink-0', deadlineUrgent ? 'text-red-600' : 'text-gray-400')}>
            {deadlineDays > 0 ? `${deadlineDays}d left` : 'Overdue'}
          </span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {/* Details */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-xs">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase">Denial Details</h4>
              <div className="flex justify-between"><span className="text-gray-500">Denial Code</span><span className="font-semibold">{denial.denialCode}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Denial Date</span><span className="font-semibold">{new Date(denial.denialDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Days Open</span><span className={cn('font-semibold', denial.daysOpen > 14 ? 'text-red-600' : 'text-gray-800')}>{denial.daysOpen}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Assigned To</span><span className="font-semibold">{denial.assignedTo}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Appeal Deadline</span><span className={cn('font-semibold', deadlineUrgent ? 'text-red-600' : '')}>{new Date(denial.appealDeadline).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-semibold">{cc?.label}</span></div>
            </div>

            {/* Timeline / progress */}
            <div className="bg-gray-50 rounded-xl p-3 space-y-2 text-xs">
              <h4 className="text-[10px] font-semibold text-gray-400 uppercase">Tracking Timeline</h4>
              <TimelineStep label="Denial Received" date={denial.denialDate} done />
              {denial.notes && <div className="text-[10px] text-gray-500 pl-5 -mt-1">{denial.notes}</div>}
              <TimelineStep
                label="Appeal Submitted"
                date={denial.appealDate}
                done={!!denial.appealDate}
                active={denial.status === 'open'}
              />
              {denial.appealNotes && <div className="text-[10px] text-blue-600 pl-5 -mt-1">{denial.appealNotes}</div>}
              <TimelineStep
                label="Correction Made"
                date={denial.correctionDate}
                done={!!denial.correctionDate}
                active={denial.status === 'appeal_submitted'}
              />
              {denial.correctionNotes && <div className="text-[10px] text-amber-600 pl-5 -mt-1">{denial.correctionNotes}</div>}
              <TimelineStep
                label="Resolved"
                date={denial.resolutionDate}
                done={denial.status === 'resolved'}
              />
              {denial.resolutionNotes && <div className="text-[10px] text-emerald-600 pl-5 -mt-1">{denial.resolution}: {denial.resolutionNotes}</div>}
            </div>
          </div>

          {/* Actions */}
          {denial.status !== 'resolved' && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
              {denial.status === 'open' && (
                <>
                  <Button size="sm" className="text-xs gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => onAction('appeal')}>
                    <Send className="size-3" /> Submit Appeal
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => onAction('correct')}>
                    <RotateCcw className="size-3" /> Correct & Resubmit
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" className="text-xs gap-1 ml-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => onAction('resolve')}>
                <CheckCircle2 className="size-3" /> Mark Resolved
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

function TimelineStep({ label, date, done, active }: { label: string; date?: string; done?: boolean; active?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn('w-2.5 h-2.5 rounded-full border-2 shrink-0',
        done ? 'bg-emerald-500 border-emerald-500' :
        active ? 'bg-blue-500 border-blue-500 animate-pulse' :
        'bg-white border-gray-300',
      )} />
      <div className="flex-1 flex items-center justify-between">
        <span className="text-xs text-gray-700">{label}</span>
        <span className={cn('text-[10px] tabular-nums', done ? 'text-gray-600' : 'text-gray-300')}>
          {date ? new Date(date).toLocaleDateString() : '—'}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export const DenialManagement = React.memo(function DenialManagement() {
  const [denials, setDenials] = useState<Denial[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [actionDialog, setActionDialog] = useState<{ denial: Denial; type: 'appeal' | 'correct' | 'resolve' } | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchDenials({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      });
      setDenials(result.denials || []);
      setAnalytics(result.analytics || null);
    } catch (err: any) {
      console.error('[DenialManagement] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, categoryFilter]);

  useEffect(() => {
    const debounce = setTimeout(loadData, 300);
    return () => clearTimeout(debounce);
  }, [loadData]);

  const handleAction = useCallback(async (data: Record<string, any>) => {
    if (!actionDialog) return;
    setUpdating(true);
    try {
      await updateDenial(actionDialog.denial.id, data);
      toast.success(`Denial ${data.status === 'resolved' ? 'resolved' : data.status === 'appeal_submitted' ? 'appeal submitted' : 'corrected'}`);
      setActionDialog(null);
      await loadData();
    } catch (err: any) {
      toast.error('Failed to update denial');
    } finally {
      setUpdating(false);
    }
  }, [actionDialog, loadData]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Root cause chart data
  const rootCauseData = useMemo(() => {
    if (!analytics?.byCategory) return [];
    return Object.entries(analytics.byCategory as Record<string, { count: number; amount: number }>)
      .map(([key, val]) => ({
        name: CATEGORY_CONFIG[key]?.label || key,
        count: val.count,
        amount: val.amount,
        fill: CATEGORY_CONFIG[key]?.color || '#6b7280',
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [analytics]);

  const payerData = useMemo(() => {
    if (!analytics?.byPayer) return [];
    return Object.entries(analytics.byPayer as Record<string, { count: number; amount: number }>)
      .map(([key, val]) => ({ name: key, count: val.count, amount: val.amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [analytics]);

  if (loading) return <LoadingState message="Loading denial management..." />;
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
        <MetricCard title="Total Denials" value={analytics?.total || 0} subtitle={formatCurrency(analytics?.totalAmount || 0)} icon={<XCircle className="size-4" />} />
        <MetricCard title="Open" value={analytics?.open || 0} subtitle="Needs action" icon={<AlertTriangle className="size-4" />} variant="danger" />
        <MetricCard title="Appeals Pending" value={analytics?.appealSubmitted || 0} subtitle="Awaiting response" icon={<Send className="size-4" />} variant="warning" />
        <MetricCard title="Corrected" value={analytics?.corrected || 0} subtitle="Resubmitted" icon={<RotateCcw className="size-4" />} />
        <MetricCard title="Resolved" value={analytics?.resolved || 0} subtitle="Closed" icon={<CheckCircle2 className="size-4" />} variant="success" />
      </div>

      {/* Root Cause Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="size-4 text-purple-600" />
              Root Cause Analysis — by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={rootCauseData} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={75} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                  {rootCauseData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="size-4 text-blue-600" />
              Denials by Payer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={payerData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="amount" nameKey="name">
                  {payerData.map((_, idx) => (
                    <Cell key={idx} fill={['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'][idx % 6]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search patient, claim #, payer..." className="pl-9 h-8 text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}><span className="flex items-center gap-1">{v.icon} {v.label}</span></SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}><span className="flex items-center gap-1">{v.icon} {v.label}</span></SelectItem>)}
          </SelectContent>
        </Select>
        {(statusFilter !== 'all' || categoryFilter !== 'all') && (
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); }}>
            Clear Filters
          </Button>
        )}
      </div>

      {/* Denial list */}
      <div className="space-y-3">
        {denials.map(denial => (
          <DenialRow
            key={denial.id}
            denial={denial}
            expanded={expandedIds.has(denial.id)}
            onToggle={() => toggleExpand(denial.id)}
            onAction={(type) => setActionDialog({ denial, type })}
          />
        ))}
        {denials.length === 0 && (
          <Card className="p-8">
            <div className="text-center text-gray-400">
              <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-400" />
              <p className="text-sm font-medium">No denials match your filters</p>
            </div>
          </Card>
        )}
      </div>

      {/* Action dialog */}
      {actionDialog && (
        <AppealDialog
          denial={actionDialog.denial}
          actionType={actionDialog.type}
          onSubmit={handleAction}
          onCancel={() => setActionDialog(null)}
        />
      )}
    </div>
  );
});
