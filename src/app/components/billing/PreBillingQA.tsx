/**
 * Pre-Billing QA Panel — Enhanced
 * Validation checks grouped by category:
 * - Missing OASIS assessment
 * - Missing physician signature
 * - Authorization issues
 * - Incomplete documentation
 *
 * Each episode shows pass/fail per check with actionable resolve buttons.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { cn } from '../ui/utils';
import {
  CheckCircle2, XCircle, AlertTriangle, FileText,
  ClipboardCheck, Calendar, Shield, ChevronDown, ChevronRight,
  Search, ArrowRight, Loader2, PenTool, FileX, Filter,
  BarChart3, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MetricCard } from '../design-system/MetricCard';
import { LoadingState } from '../design-system/LoadingState';
import { fetchPreBillingQA, moveQAToClaims } from '../../lib/billingApi';
import { toast } from 'sonner';

interface QACheck {
  key: string;
  label: string;
  icon: React.ReactNode;
  passed: boolean;
  detail?: string;
}

interface PatientQARecord {
  id: string;
  patientName: string;
  mrn: string;
  payer: string;
  episodeStart: string;
  episodeEnd: string;
  amount: number;
  checks: QACheck[];
}

// ─── Check type configuration ───────────────────────────────────────────────

type CheckCategory = 'oasis' | 'poc' | 'first_visit' | 'auth';

const checkConfig: Record<CheckCategory, {
  label: string;
  fullLabel: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  oasis: {
    label: 'Missing OASIS',
    fullLabel: 'OASIS Assessment',
    description: 'Start of Care / Recertification assessment must be completed and finalized',
    icon: <FileText className="size-5 text-blue-600" />,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  poc: {
    label: 'Missing Physician Signature',
    fullLabel: 'Physician Signature on Plan of Care',
    description: 'Plan of Care (485) must be signed by the attending or certifying physician',
    icon: <PenTool className="size-5 text-purple-600" />,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  first_visit: {
    label: 'Incomplete Documentation',
    fullLabel: 'First Discipline Visit',
    description: 'At least one qualifying discipline visit must be completed with documentation',
    icon: <Calendar className="size-5 text-green-600" />,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  auth: {
    label: 'Authorization Issues',
    fullLabel: 'Payer Authorization',
    description: 'Valid payer authorization must be on file for the billing period',
    icon: <Shield className="size-5 text-orange-600" />,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// ─── Check Category Card ────────────────────────────────────────────────────

interface CheckCategoryCardProps {
  category: CheckCategory;
  failCount: number;
  totalCount: number;
  isActive: boolean;
  onClick: () => void;
}

const CheckCategoryCard = React.memo(function CheckCategoryCard({
  category, failCount, totalCount, isActive, onClick,
}: CheckCategoryCardProps) {
  const config = checkConfig[category];
  const passRate = totalCount > 0 ? Math.round(((totalCount - failCount) / totalCount) * 100) : 100;
  const hasIssues = failCount > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-start rounded-xl border-2 p-3 text-left transition-all w-full',
        'hover:shadow-md focus:outline-none',
        isActive
          ? cn(config.bgColor, config.borderColor, 'shadow-sm')
          : hasIssues
            ? 'bg-white border-gray-200 hover:border-gray-300'
            : 'bg-white border-gray-200 hover:border-gray-300',
      )}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
          {config.icon}
        </div>
        {failCount > 0 ? (
          <span className="flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
            {failCount}
          </span>
        ) : (
          <CheckCircle2 className="size-4 text-emerald-500" />
        )}
      </div>
      <p className={cn('text-xs font-bold w-full', isActive ? config.color : 'text-gray-700')}>
        {config.label}
      </p>
      <div className="w-full mt-1.5">
        <div className="flex items-center justify-between text-[9px] mb-1">
          <span className="text-gray-400">Pass rate</span>
          <span className={cn('font-bold', passRate === 100 ? 'text-emerald-600' : passRate >= 75 ? 'text-amber-600' : 'text-red-600')}>
            {passRate}%
          </span>
        </div>
        <Progress
          value={passRate}
          className={cn(
            'h-1.5',
            passRate === 100
              ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
              : passRate >= 75
                ? '[&>[data-slot=progress-indicator]]:bg-amber-500'
                : '[&>[data-slot=progress-indicator]]:bg-red-500',
          )}
        />
      </div>
    </button>
  );
});

// ─── Episode Row ────────────────────────────────────────────────────────────

interface EpisodeRowProps {
  record: PatientQARecord;
  expanded: boolean;
  onToggle: () => void;
  onMoveToClaims: () => void;
  moving: boolean;
  highlightCheck?: CheckCategory;
}

const EpisodeRow = React.memo(function EpisodeRow({
  record, expanded, onToggle, onMoveToClaims, moving, highlightCheck,
}: EpisodeRowProps) {
  const passed = record.checks.filter(c => c.passed).length;
  const total = record.checks.length;
  const allPassed = passed === total;

  return (
    <div className={cn(
      'rounded-xl border-2 transition-all overflow-hidden',
      allPassed ? 'border-emerald-200' : 'border-gray-200 hover:border-gray-300',
    )}>
      {/* Row header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50"
        onClick={onToggle}
      >
        {expanded ? <ChevronDown className="size-4 text-gray-400 shrink-0" /> :
                    <ChevronRight className="size-4 text-gray-400 shrink-0" />}

        {/* Status icon */}
        {allPassed ? (
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
        ) : (
          <AlertTriangle className="size-5 text-amber-500 shrink-0" />
        )}

        {/* Patient info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{record.patientName}</span>
            <span className="text-[10px] text-gray-400">{record.mrn}</span>
            <Badge className={cn(
              'text-[10px] h-5 px-1.5 border',
              allPassed
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200',
            )}>
              {allPassed ? 'Ready' : `${total - passed} Blocker${total - passed > 1 ? 's' : ''}`}
            </Badge>
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">
            {record.payer} · Episode: {new Date(record.episodeStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date(record.episodeEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Check indicators */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {record.checks.map(check => {
            const isHighlighted = highlightCheck === check.key;
            return (
              <div
                key={check.key}
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center',
                  check.passed ? 'bg-emerald-100' : 'bg-red-100',
                  isHighlighted && !check.passed && 'ring-2 ring-red-400 ring-offset-1',
                )}
                title={`${check.label}: ${check.passed ? 'Passed' : 'Failed'}`}
              >
                {check.passed ? (
                  <CheckCircle2 className="size-3 text-emerald-600" />
                ) : (
                  <XCircle className="size-3 text-red-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="w-20 shrink-0 hidden sm:block">
          <div className="flex items-center justify-between text-[9px] mb-0.5">
            <span className="text-gray-400">Checks</span>
            <span className={cn('font-bold', allPassed ? 'text-emerald-600' : 'text-amber-600')}>
              {passed}/{total}
            </span>
          </div>
          <Progress
            value={(passed / total) * 100}
            className={cn(
              'h-1.5',
              allPassed
                ? '[&>[data-slot=progress-indicator]]:bg-emerald-500'
                : '[&>[data-slot=progress-indicator]]:bg-amber-500',
            )}
          />
        </div>

        {/* Amount */}
        <div className="text-right shrink-0 w-20">
          <span className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(record.amount)}</span>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {record.checks.map((check) => {
              const cfg = checkConfig[check.key as CheckCategory];
              const isHighlighted = highlightCheck === check.key;
              return (
                <div
                  key={check.key}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border transition-all',
                    check.passed
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-red-50/50 border-red-200',
                    isHighlighted && !check.passed && 'ring-2 ring-red-300',
                  )}
                >
                  {check.passed ? (
                    <CheckCircle2 className="size-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {cfg?.icon || <FileText className="size-4 text-gray-400" />}
                      <span className={cn(
                        'text-sm font-semibold',
                        check.passed ? 'text-emerald-800' : 'text-red-800',
                      )}>
                        {check.label}
                      </span>
                    </div>
                    <p className={cn('text-xs mt-1', check.passed ? 'text-emerald-600' : 'text-red-600')}>
                      {check.detail}
                    </p>
                  </div>
                  {!check.passed && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-[10px] h-7 shrink-0 gap-1 border-red-200 text-red-700 hover:bg-red-50"
                      onClick={(e) => { e.stopPropagation(); toast.info(`Resolving: ${check.label}`); }}
                    >
                      <ArrowRight className="size-3" />
                      Resolve
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action footer */}
          {allPassed && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                All checks passed — eligible for claim generation
              </span>
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 gap-1 text-xs"
                onClick={(e) => { e.stopPropagation(); onMoveToClaims(); }}
                disabled={moving}
              >
                {moving ? <Loader2 className="size-3 animate-spin" /> : <ArrowRight className="size-3" />}
                Move to Claims
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────

export const PreBillingQA = React.memo(() => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<CheckCategory | 'all'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [records, setRecords] = useState<PatientQARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPreBillingQA({
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setRecords(data);
    } catch (err: any) {
      console.error('[PreBillingQA] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => {
    const debounce = setTimeout(loadRecords, 300);
    return () => clearTimeout(debounce);
  }, [loadRecords]);

  const handleMoveToClaims = useCallback(async (id: string) => {
    setMovingId(id);
    try {
      await moveQAToClaims(id);
      toast.success('Episode moved to Claims queue');
      await loadRecords();
    } catch (err: any) {
      console.error('[PreBillingQA] Move error:', err);
      toast.error('Failed to move to claims');
    } finally {
      setMovingId(null);
    }
  }, [loadRecords]);

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── Stats ─────────────────────────────────────────────────────────────

  const isFullyPassed = (r: PatientQARecord) => r.checks.every(c => c.passed);

  const stats = useMemo(() => {
    const total = records.length;
    const passed = records.filter(isFullyPassed).length;
    const readyAmount = records.filter(isFullyPassed).reduce((s, r) => s + r.amount, 0);
    const passRate = total > 0
      ? Math.round((records.reduce((s, r) => s + r.checks.filter(c => c.passed).length, 0) /
          (total * 4)) * 100)
      : 0;
    return { total, passed, failed: total - passed, passRate, readyAmount };
  }, [records]);

  // ─── Category failure counts ───────────────────────────────────────────

  const categoryFailures = useMemo(() => {
    const counts: Record<CheckCategory, number> = { oasis: 0, poc: 0, first_visit: 0, auth: 0 };
    records.forEach(r => {
      r.checks.forEach(c => {
        if (!c.passed && counts[c.key as CheckCategory] !== undefined) {
          counts[c.key as CheckCategory]++;
        }
      });
    });
    return counts;
  }, [records]);

  // ─── Filtered records ─────────────────────────────────────────────────

  const filteredRecords = useMemo(() => {
    if (categoryFilter === 'all') return records;
    return records.filter(r =>
      r.checks.some(c => c.key === categoryFilter && !c.passed)
    );
  }, [records, categoryFilter]);

  return (
    <div className="space-y-5">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard title="Total Episodes" value={stats.total} subtitle="Under QA review" icon={<FileText className="size-4" />} />
        <MetricCard title="Passed All Checks" value={stats.passed} subtitle={formatCurrency(stats.readyAmount)} variant="success" icon={<CheckCircle2 className="size-4" />} />
        <MetricCard title="Blocked" value={stats.failed} subtitle="Need resolution" variant="danger" icon={<XCircle className="size-4" />} />
        <MetricCard
          title="QA Pass Rate"
          value={`${stats.passRate}%`}
          subtitle="Individual checks"
          variant={stats.passRate >= 80 ? 'success' : 'warning'}
          icon={<BarChart3 className="size-4" />}
        />
      </div>

      {/* Validation Check Categories */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ClipboardCheck className="size-4 text-purple-600" />
              Validation Checks
            </CardTitle>
            <p className="text-[10px] text-gray-400">Click a category to filter episodes</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.keys(checkConfig) as CheckCategory[]).map(category => (
              <CheckCategoryCard
                key={category}
                category={category}
                failCount={categoryFailures[category]}
                totalCount={records.length}
                isActive={categoryFilter === category}
                onClick={() => setCategoryFilter(categoryFilter === category ? 'all' : category)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters + bulk action */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search patient, MRN, payer..."
            className="pl-9 h-8 text-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <Filter className="size-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Episodes</SelectItem>
            <SelectItem value="passed">Passed</SelectItem>
            <SelectItem value="failed">Has Blockers</SelectItem>
          </SelectContent>
        </Select>
        {categoryFilter !== 'all' && (
          <Badge
            className="bg-blue-50 text-blue-700 border-blue-200 text-xs cursor-pointer hover:bg-blue-100"
            onClick={() => setCategoryFilter('all')}
          >
            Filtered: {checkConfig[categoryFilter].label}
            <XCircle className="size-3 ml-1" />
          </Badge>
        )}
        <Button
          size="sm"
          className="bg-green-600 hover:bg-green-700 ml-auto gap-1 text-xs"
          disabled={stats.passed === 0 || movingId !== null}
          onClick={async () => {
            const passed = records.filter(isFullyPassed);
            for (const r of passed) {
              await handleMoveToClaims(r.id);
            }
          }}
        >
          <ArrowRight className="size-3" />
          Move {stats.passed} to Claims
        </Button>
      </div>

      {/* Episode list */}
      {loading ? (
        <LoadingState message="Loading QA records..." />
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p className="text-sm mb-2">{error}</p>
          <Button size="sm" variant="outline" onClick={loadRecords}>Retry</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => (
            <EpisodeRow
              key={record.id}
              record={record}
              expanded={expandedRows.has(record.id)}
              onToggle={() => toggleRow(record.id)}
              onMoveToClaims={() => handleMoveToClaims(record.id)}
              moving={movingId === record.id}
              highlightCheck={categoryFilter !== 'all' ? categoryFilter : undefined}
            />
          ))}

          {filteredRecords.length === 0 && (
            <Card className="p-8">
              <div className="text-center text-gray-400">
                {categoryFilter !== 'all' ? (
                  <>
                    <CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-400" />
                    <p className="text-sm font-medium">No episodes have this issue</p>
                    <p className="text-xs mt-1">All episodes pass the {checkConfig[categoryFilter].fullLabel} check</p>
                  </>
                ) : (
                  <>
                    <Search className="size-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No episodes match your search criteria</p>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
});

PreBillingQA.displayName = 'PreBillingQA';
