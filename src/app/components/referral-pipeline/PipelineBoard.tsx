/**
 * PipelineBoard — Main orchestrator for the referral intake pipeline.
 * Kanban board (DnD) with batch-select mode, an Aging Heatmap toggle,
 * KPI strip, search/urgency filters, detail panel, and new-referral form.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  GitPullRequest,
  Search,
  Loader2,
  TrendingUp,
  Clock,
  BarChart3,
  RefreshCw,
  Plus,
  Zap,
  ChevronRight,
  Columns3,
  Grid3x3,
  CheckSquare,
  X,
  ArrowRight,
  Settings2,
  AlertOctagon,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { referralPipelineGateway } from '../../lib/dataGateway';
import type {
  Referral,
  PipelineStage,
  PipelineMetrics,
  ReferralUrgency,
} from '../../lib/referralPipelineTypes';
import { STAGE_CONFIGS, PIPELINE_STAGES, getStageConfig } from '../../lib/referralPipelineTypes';
import { PipelineColumn } from './PipelineColumn';
import { ReferralDetailPanel } from './ReferralDetailPanel';
import { NewReferralForm } from './NewReferralForm';
import { AgingHeatmap } from './AgingHeatmap';
import { StageTransitionDialog, requiresPrompt } from './StageTransitionDialog';
import SlaBreachAlerts from './SlaBreachAlerts';
import { SlaSettingsPanel, loadSlaConfig, type SlaThresholdConfig } from './SlaSettingsPanel';
import { NotificationCenter, useNotifications } from './NotificationCenter';

// ─── View modes ─────────────────────────────────────────────────────────────

type ViewMode = 'kanban' | 'heatmap' | 'alerts';

// ─── Default SLA thresholds per stage (in days) ─────────────────────────────

export type SlaThresholds = Record<PipelineStage, { onTrack: number; aging: number; atRisk: number }>;

const DEFAULT_SLA_THRESHOLDS: SlaThresholds = {
  new_referral: { onTrack: 1, aging: 2, atRisk: 3 },
  insurance_verification: { onTrack: 2, aging: 4, atRisk: 6 },
  clinical_review: { onTrack: 2, aging: 5, atRisk: 7 },
  admission_scheduled: { onTrack: 3, aging: 5, atRisk: 7 },
  admitted: { onTrack: 7, aging: 14, atRisk: 21 },
  rejected: { onTrack: 7, aging: 14, atRisk: 21 },
};

// ─── KPI Pill ───────────────────────────────────────────────────────────────

const KpiPill = React.memo(function KpiPill({
  icon: Icon,
  label,
  value,
  iconColor,
  bgColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className={cn('flex items-center gap-2.5 px-4 py-2.5 rounded-xl border', bgColor)}>
      <Icon className={cn('size-4 shrink-0', iconColor)} />
      <div>
        <p className="text-lg font-bold text-gray-900 leading-none">{value}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
});

// ─── Urgency Toggle ─────────────────────────────────────────────────────────

const UrgencyToggle = React.memo(function UrgencyToggle({
  label,
  active,
  count,
  dotColor,
  onClick,
}: {
  label: string;
  active: boolean;
  count: number;
  dotColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border',
        active
          ? 'bg-white border-gray-300 shadow-sm text-gray-900'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100',
      )}
    >
      <span className={cn('w-2 h-2 rounded-full', dotColor)} />
      {label}
      <span className="text-[10px] text-gray-400">({count})</span>
    </button>
  );
});

// ─── Stage Arrow Connector ──────────────────────────────────────────────────

const StageArrow = React.memo(function StageArrow() {
  return (
    <div className="flex items-center justify-center shrink-0 w-4 -mx-1 z-10">
      <ChevronRight className="size-5 text-gray-300" />
    </div>
  );
});

// ─── Floating Batch Action Bar ──────────────────────────────────────────────

const BatchActionBar = React.memo(function BatchActionBar({
  count,
  selectedStages,
  onMove,
  onCancel,
  moving,
}: {
  count: number;
  selectedStages: Set<PipelineStage>;
  onMove: (toStage: PipelineStage) => void;
  onCancel: () => void;
  moving: boolean;
}) {
  // Determine which stages are valid targets (exclude stages cards are already in)
  const validTargets = STAGE_CONFIGS.filter((s) => !selectedStages.has(s.id));

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 border border-gray-700">
        {/* Count */}
        <div className="flex items-center gap-2">
          <CheckSquare className="size-4 text-blue-400" />
          <span className="text-sm font-semibold">{count} selected</span>
        </div>

        <div className="w-px h-5 bg-gray-700" />

        {/* Stage targets */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1">Move to:</span>
          {validTargets.map((stage) => (
            <button
              key={stage.id}
              onClick={() => onMove(stage.id)}
              disabled={moving}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
                'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700',
                moving && 'opacity-50 cursor-not-allowed',
              )}
            >
              <ArrowRight className="size-3 text-gray-400" />
              {stage.shortLabel}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-700" />

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <X className="size-3" />
          Cancel
        </button>

        {moving && <Loader2 className="size-4 text-blue-400 animate-spin ml-1" />}
      </div>
    </div>
  );
});

// ─── Main Board ─────────────────────────────────────────────────────────────

export default function PipelineBoard() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<ReferralUrgency | 'all'>('all');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [newFormOpen, setNewFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // Batch selection
  const [batchMode, setBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchMoving, setBatchMoving] = useState(false);

  // SLA thresholds for heatmap
  const [slaThresholds, setSlaThresholds] = useState<SlaThresholds>(DEFAULT_SLA_THRESHOLDS);

  // Stage transition dialog
  const [transitionRef, setTransitionRef] = useState<Referral | null>(null);
  const [transitionStage, setTransitionStage] = useState<PipelineStage>('new_referral');
  const [transitionDialogOpen, setTransitionDialogOpen] = useState(false);

  // SLA settings
  const [slaSettingsOpen, setSlaSettingsOpen] = useState(false);

  // Notifications
  const {
    notifications,
    unreadCount,
    addNotification,
    markRead,
    markAllRead,
    clearAll: clearNotifications,
    generateSlaNotifications,
  } = useNotifications();

  const navigate = useNavigate();

  // ─── Data Loading ───────────────────────────────────────────────────────

  const loadData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const [pipelineRes, metricsRes] = await Promise.all([
        referralPipelineGateway.getAll(),
        referralPipelineGateway.getMetrics(),
      ]);
      setReferrals(pipelineRes.referrals || []);
      setMetrics(metricsRes);
    } catch (err: any) {
      console.error('[PipelineBoard] Load error:', err);
      toast.error('Failed to load pipeline data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Filtering & Grouping ──────────────────────────────────────────────

  const filteredReferrals = useMemo(() => {
    let result = referrals;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          `${r.patientFirstName} ${r.patientLastName}`.toLowerCase().includes(q) ||
          r.primaryDiagnosis.toLowerCase().includes(q) ||
          r.referringPhysician.toLowerCase().includes(q) ||
          r.insurancePlan.toLowerCase().includes(q) ||
          r.assignedTo.toLowerCase().includes(q),
      );
    }
    if (urgencyFilter !== 'all') {
      result = result.filter((r) => r.urgency === urgencyFilter);
    }
    return result;
  }, [referrals, searchQuery, urgencyFilter]);

  const stageGroups = useMemo(() => {
    const groups: Record<PipelineStage, Referral[]> = {
      new_referral: [],
      insurance_verification: [],
      clinical_review: [],
      admission_scheduled: [],
      admitted: [],
      rejected: [],
    };
    for (const ref of filteredReferrals) {
      if (groups[ref.stage]) groups[ref.stage].push(ref);
    }
    const urgencyPriority: Record<string, number> = { stat: 0, urgent: 1, routine: 2 };
    for (const stage of Object.keys(groups) as PipelineStage[]) {
      groups[stage].sort((a, b) => {
        const up = (urgencyPriority[a.urgency] ?? 2) - (urgencyPriority[b.urgency] ?? 2);
        if (up !== 0) return up;
        return (a.stageOrder || 0) - (b.stageOrder || 0);
      });
    }
    return groups;
  }, [filteredReferrals]);

  const urgencyCounts = useMemo(
    () => ({
      all: referrals.length,
      stat: referrals.filter((r) => r.urgency === 'stat').length,
      urgent: referrals.filter((r) => r.urgency === 'urgent').length,
      routine: referrals.filter((r) => r.urgency === 'routine').length,
    }),
    [referrals],
  );

  // ─── Batch Selection ──────────────────────────────────────────────────

  const toggleBatchMode = useCallback(() => {
    setBatchMode((prev) => {
      if (prev) setSelectedIds(new Set());
      return !prev;
    });
  }, []);

  const toggleSelectId = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedStages = useMemo(() => {
    const stages = new Set<PipelineStage>();
    for (const id of selectedIds) {
      const ref = referrals.find((r) => r.id === id);
      if (ref) stages.add(ref.stage);
    }
    return stages;
  }, [selectedIds, referrals]);

  const handleBatchMove = useCallback(
    async (toStage: PipelineStage) => {
      if (selectedIds.size === 0) return;
      try {
        setBatchMoving(true);
        const ids = Array.from(selectedIds);
        const label = getStageConfig(toStage).label;

        // Optimistic update
        setReferrals((prev) =>
          prev.map((r) =>
            selectedIds.has(r.id) ? { ...r, stage: toStage, daysInStage: 0 } : r,
          ),
        );

        const result = await referralPipelineGateway.batchMoveStage({
          referralIds: ids,
          toStage,
          note: `Batch moved to ${label}`,
          movedBy: 'Current User',
        });

        toast.success(`${result.moved} referral${result.moved !== 1 ? 's' : ''} moved to ${label}`);
        if (result.failed > 0) {
          toast.error(`${result.failed} failed to move`);
        }

        setSelectedIds(new Set());
        setBatchMode(false);

        // Reload for fresh data
        await loadData(false);
      } catch (err: any) {
        console.error('[PipelineBoard] Batch move error:', err);
        toast.error('Batch move failed');
        await loadData(false);
      } finally {
        setBatchMoving(false);
      }
    },
    [selectedIds, loadData],
  );

  const cancelBatch = useCallback(() => {
    setSelectedIds(new Set());
    setBatchMode(false);
  }, []);

  // ─── Select All / Deselect All in Column ──────────────────────────────

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const handleDeselectAll = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  // ─── Card Handlers ────────────────────────────────────────────────────

  const handleMoveReferral = useCallback(
    async (referralId: string, toStage: PipelineStage) => {
      if (batchMode) return; // Disable DnD in batch mode
      const ref = referrals.find((r) => r.id === referralId);
      if (!ref) return;

      // If target stage requires a prompt, open the transition dialog instead
      if (requiresPrompt(toStage)) {
        setTransitionRef(ref);
        setTransitionStage(toStage);
        setTransitionDialogOpen(true);
        return;
      }

      setReferrals((prev) =>
        prev.map((r) => (r.id === referralId ? { ...r, stage: toStage, daysInStage: 0 } : r)),
      );

      try {
        const label = getStageConfig(toStage).label;
        await referralPipelineGateway.moveStage(referralId, {
          toStage,
          note: `Moved to ${label} via drag-and-drop`,
          movedBy: 'Current User',
        });
        toast.success(`${ref.patientLastName}, ${ref.patientFirstName} → ${label}`);
      } catch (err: any) {
        console.error('[PipelineBoard] Move error:', err);
        setReferrals((prev) => prev.map((r) => (r.id === referralId ? ref : r)));
        toast.error('Failed to move referral');
      }
    },
    [referrals, batchMode],
  );

  const handleCardClick = useCallback(
    (referral: Referral) => {
      if (batchMode) {
        toggleSelectId(referral.id);
      } else {
        setSelectedReferral(referral);
      }
    },
    [batchMode, toggleSelectId],
  );

  const handleReferralUpdated = useCallback((updated: Referral) => {
    setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setSelectedReferral(updated);
  }, []);

  const handleTransitionComplete = useCallback((updated: Referral) => {
    setReferrals((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setTransitionDialogOpen(false);
    setTransitionRef(null);
  }, []);

  // Generate SLA notifications when referrals change
  useEffect(() => {
    if (referrals.length > 0) {
      generateSlaNotifications(referrals);
    }
  }, [referrals, generateSlaNotifications]);

  // Compute SLA breach count for KPI
  const slaBreachCount = useMemo(() => {
    const SLA: Record<string, number> = {
      new_referral: 3, insurance_verification: 6, clinical_review: 7, admission_scheduled: 7,
    };
    return referrals.filter(r => {
      if (r.stage === 'admitted' || r.stage === 'rejected') return false;
      const threshold = SLA[r.stage];
      return threshold && r.daysInStage >= threshold;
    }).length;
  }, [referrals]);

  // Handle notification click → open referral detail
  const handleNotificationClick = useCallback((referralId: string) => {
    const ref = referrals.find(r => r.id === referralId);
    if (ref) setSelectedReferral(ref);
  }, [referrals]);

  // ─── Loading ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-blue-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading referral pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="size-full flex flex-col bg-gray-100/60 overflow-hidden">
        {/* ═══ Header ═══════════════════════════════════════════════════════ */}
        <div className="shrink-0 bg-white border-b border-gray-200 px-6 py-4">
          {/* Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <GitPullRequest className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Referral Intake Pipeline</h1>
                <p className="text-sm text-gray-500">Manage referral workflows visually</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mr-1">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    viewMode === 'kanban'
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  <Columns3 className="size-3.5" />
                  Board
                </button>
                <button
                  onClick={() => { setViewMode('heatmap'); if (batchMode) { setBatchMode(false); setSelectedIds(new Set()); } }}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    viewMode === 'heatmap'
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  <Grid3x3 className="size-3.5" />
                  Heatmap
                </button>
                <button
                  onClick={() => { setViewMode('alerts'); if (batchMode) { setBatchMode(false); setSelectedIds(new Set()); } }}
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors',
                    viewMode === 'alerts'
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  <Zap className="size-3.5" />
                  Alerts
                </button>
              </div>

              {/* Batch Mode Toggle */}
              {viewMode === 'kanban' && (
                <Button
                  variant={batchMode ? 'default' : 'outline'}
                  size="sm"
                  className={cn('gap-1.5 text-xs', batchMode && 'bg-indigo-600 hover:bg-indigo-700')}
                  onClick={toggleBatchMode}
                >
                  <CheckSquare className="size-3.5" />
                  {batchMode ? 'Exit Batch' : 'Batch Select'}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => navigate('/referral-analytics')}
              >
                <BarChart3 className="size-3.5" />
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => loadData(false)}
                disabled={refreshing}
              >
                <RefreshCw className={cn('size-3.5', refreshing && 'animate-spin')} />
                Refresh
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 shadow-sm"
                onClick={() => setNewFormOpen(true)}
              >
                <Plus className="size-3.5" />
                New Referral
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs h-9 w-9 p-0"
                onClick={() => setSlaSettingsOpen(true)}
                title="SLA Settings"
              >
                <Settings2 className="size-3.5" />
              </Button>
              <NotificationCenter
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkRead={markRead}
                onMarkAllRead={markAllRead}
                onClearAll={clearNotifications}
                onClickReferral={handleNotificationClick}
              />
            </div>
          </div>

          {/* KPI + Filters */}
          <div className="flex items-center justify-between gap-4">
            {metrics && (
              <div className="flex items-center gap-2.5">
                <KpiPill icon={GitPullRequest} label="Active" value={metrics.totalActive} iconColor="text-blue-600" bgColor="bg-blue-50 border-blue-100" />
                <KpiPill icon={Zap} label="STAT / Urgent" value={`${metrics.statCount} / ${metrics.urgentCount}`} iconColor="text-red-500" bgColor="bg-red-50 border-red-100" />
                <KpiPill icon={Clock} label="Avg to Admit" value={`${metrics.avgDaysToAdmit}d`} iconColor="text-amber-600" bgColor="bg-amber-50 border-amber-100" />
                <KpiPill icon={TrendingUp} label="Conversion" value={`${metrics.conversionRate}%`} iconColor="text-emerald-600" bgColor="bg-emerald-50 border-emerald-100" />
                <KpiPill icon={AlertOctagon} label="SLA Breaches" value={slaBreachCount} iconColor="text-red-500" bgColor="bg-red-50 border-red-100" />
              </div>
            )}
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 h-9 w-52 text-sm"
                />
              </div>
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
                <UrgencyToggle label="All" active={urgencyFilter === 'all'} count={urgencyCounts.all} dotColor="bg-blue-500" onClick={() => setUrgencyFilter('all')} />
                <UrgencyToggle label="STAT" active={urgencyFilter === 'stat'} count={urgencyCounts.stat} dotColor="bg-red-500" onClick={() => setUrgencyFilter('stat')} />
                <UrgencyToggle label="Urgent" active={urgencyFilter === 'urgent'} count={urgencyCounts.urgent} dotColor="bg-orange-400" onClick={() => setUrgencyFilter('urgent')} />
                <UrgencyToggle label="Routine" active={urgencyFilter === 'routine'} count={urgencyCounts.routine} dotColor="bg-gray-400" onClick={() => setUrgencyFilter('routine')} />
              </div>
            </div>
          </div>

          {/* Batch mode hint */}
          {batchMode && (
            <div className="mt-3 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center gap-2">
              <CheckSquare className="size-4 text-indigo-600" />
              <span className="text-xs text-indigo-700 font-medium">
                Batch selection mode — click cards to select, then use the action bar below to move them together.
              </span>
              {selectedIds.size > 0 && (
                <Badge variant="secondary" className="text-xs ml-auto bg-indigo-100 text-indigo-700">
                  {selectedIds.size} selected
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* ═══ Body ════════════════════════════════════════════════════════ */}
        {viewMode === 'kanban' ? (
          <div className="flex-1 overflow-x-auto px-4 py-4">
            <div className="flex items-start gap-0 h-full min-w-max">
              {STAGE_CONFIGS.map((config, idx) => (
                <React.Fragment key={config.id}>
                  <PipelineColumn
                    config={config}
                    referrals={stageGroups[config.id] || []}
                    onMoveReferral={handleMoveReferral}
                    onCardClick={handleCardClick}
                    batchMode={batchMode}
                    selectedIds={selectedIds}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                  />
                  {idx < STAGE_CONFIGS.length - 1 && <StageArrow />}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : viewMode === 'heatmap' ? (
          <AgingHeatmap
            referrals={filteredReferrals}
            onCardClick={handleCardClick}
          />
        ) : (
          <SlaBreachAlerts
            referrals={filteredReferrals}
            onCardClick={handleCardClick}
            onRefresh={() => loadData(false)}
          />
        )}
      </div>

      {/* ═══ Batch Action Bar ═══════════════════════════════════════════ */}
      {batchMode && selectedIds.size > 0 && (
        <BatchActionBar
          count={selectedIds.size}
          selectedStages={selectedStages}
          onMove={handleBatchMove}
          onCancel={cancelBatch}
          moving={batchMoving}
        />
      )}

      {/* ═══ Detail Panel ═══════════════════════════════════════════════ */}
      {selectedReferral && (
        <ReferralDetailPanel
          referral={selectedReferral}
          open={!!selectedReferral}
          onOpenChange={(open) => {
            if (!open) setSelectedReferral(null);
          }}
          onUpdated={handleReferralUpdated}
        />
      )}

      {/* ═══ New Referral Form ══════════════════════════════════════════ */}
      <NewReferralForm open={newFormOpen} onOpenChange={setNewFormOpen} onCreated={() => loadData(false)} />

      {/* ═══ Stage Transition Dialog ═══════════════════════════════════ */}
      <StageTransitionDialog
        referral={transitionRef}
        toStage={transitionStage}
        open={transitionDialogOpen}
        onClose={() => { setTransitionDialogOpen(false); setTransitionRef(null); }}
        onTransitioned={handleTransitionComplete}
      />

      {/* ═══ SLA Settings ═════════════════════════════════════════════ */}
      <SlaSettingsPanel
        open={slaSettingsOpen}
        onOpenChange={setSlaSettingsOpen}
        onSave={(config) => {
          setSlaThresholds(config as SlaThresholds);
        }}
      />
    </DndProvider>
  );
}