/**
 * AgingHeatmap — Alternative view of the pipeline showing all referrals in a
 * grid colored by how long they've been sitting. Rows grouped by stage,
 * each cell is a referral tile colored green → yellow → orange → red.
 *
 * Supports per-stage SLA thresholds (configurable via inline settings panel).
 */
import React, { useMemo, useState, useCallback } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import {
  AlertTriangle,
  Clock,
  ThermometerSun,
  Settings2,
  X,
  RotateCcw,
} from 'lucide-react';
import type { Referral, PipelineStage } from '../../lib/referralPipelineTypes';
import { STAGE_CONFIGS, getStageConfig, getUrgencyConfig } from '../../lib/referralPipelineTypes';

// ─── SLA Threshold Types ────────────────────────────────────────────────────

export interface StageSla {
  onTrack: number;
  aging: number;
  atRisk: number;
}

export type SlaThresholds = Record<PipelineStage, StageSla>;

const DEFAULT_SLA: SlaThresholds = {
  new_referral: { onTrack: 1, aging: 2, atRisk: 3 },
  insurance_verification: { onTrack: 2, aging: 4, atRisk: 6 },
  clinical_review: { onTrack: 2, aging: 5, atRisk: 7 },
  admission_scheduled: { onTrack: 3, aging: 5, atRisk: 7 },
  admitted: { onTrack: 7, aging: 14, atRisk: 21 },
  rejected: { onTrack: 7, aging: 14, atRisk: 21 },
};

// ─── Aging Levels ───────────────────────────────────────────────────────────

interface AgingLevel {
  label: string;
  bg: string;
  text: string;
  border: string;
}

const AGING_STYLES: AgingLevel[] = [
  { label: 'On Track', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  { label: 'Aging', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  { label: 'At Risk', bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  { label: 'Critical', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-400' },
];

function getAgingLevel(days: number, sla: StageSla): AgingLevel {
  if (days <= sla.onTrack) return AGING_STYLES[0];
  if (days <= sla.aging) return AGING_STYLES[1];
  if (days <= sla.atRisk) return AGING_STYLES[2];
  return AGING_STYLES[3];
}

// ─── Legend ─────────────────────────────────────────────────────────────────

const HeatmapLegend = React.memo(function HeatmapLegend() {
  const labels = ['On Track', 'Aging', 'At Risk', 'Critical'];
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="text-gray-500 font-medium">Status:</span>
      {AGING_STYLES.map((level, i) => (
        <div key={level.label} className="flex items-center gap-1">
          <div className={cn('w-3.5 h-3.5 rounded', level.bg, level.border, 'border')} />
          <span className="text-gray-600">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
});

// ─── SLA Settings Panel ─────────────────────────────────────────────────────

const SlaSettingsPanel = React.memo(function SlaSettingsPanel({
  thresholds,
  onChange,
  onReset,
  onClose,
}: {
  thresholds: SlaThresholds;
  onChange: (stage: PipelineStage, field: keyof StageSla, value: number) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-full max-w-3xl animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Settings2 className="size-4 text-gray-600" />
          <h3 className="text-sm font-bold text-gray-800">SLA Thresholds (days)</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 text-gray-500" onClick={onReset}>
            <RotateCcw className="size-3" />
            Reset Defaults
          </Button>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2 text-xs mb-2">
        <div className="text-gray-400 font-semibold">Stage</div>
        <div className="text-emerald-600 font-semibold text-center">On Track ≤</div>
        <div className="text-yellow-600 font-semibold text-center">Aging ≤</div>
        <div className="text-orange-600 font-semibold text-center">At Risk ≤</div>
        <div className="text-red-600 font-semibold text-center">Critical &gt;</div>
        <div />
      </div>

      {STAGE_CONFIGS.map((config) => {
        const sla = thresholds[config.id];
        return (
          <div key={config.id} className="grid grid-cols-6 gap-2 items-center py-1.5 border-t border-gray-50">
            <div className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', config.iconBg)} />
              <span className={cn('text-xs font-medium', config.color)}>{config.shortLabel}</span>
            </div>
            <Input
              type="number"
              min={0}
              value={sla.onTrack}
              onChange={(e) => onChange(config.id, 'onTrack', Math.max(0, parseInt(e.target.value) || 0))}
              className="h-7 text-xs text-center w-full"
            />
            <Input
              type="number"
              min={0}
              value={sla.aging}
              onChange={(e) => onChange(config.id, 'aging', Math.max(0, parseInt(e.target.value) || 0))}
              className="h-7 text-xs text-center w-full"
            />
            <Input
              type="number"
              min={0}
              value={sla.atRisk}
              onChange={(e) => onChange(config.id, 'atRisk', Math.max(0, parseInt(e.target.value) || 0))}
              className="h-7 text-xs text-center w-full"
            />
            <div className="text-xs text-red-500 text-center font-medium">&gt; {sla.atRisk}d</div>
            <div />
          </div>
        );
      })}

      <p className="text-[10px] text-gray-400 mt-2">
        Each stage has independent SLA targets. Colors in the heatmap adjust to these thresholds.
      </p>
    </div>
  );
});

// ─── Referral Tile ──────────────────────────────────────────────────────────

const ReferralTile = React.memo(function ReferralTile({
  referral,
  sla,
  onClick,
}: {
  referral: Referral;
  sla: StageSla;
  onClick: (r: Referral) => void;
}) {
  const aging = getAgingLevel(referral.daysInStage, sla);
  const urgency = getUrgencyConfig(referral.urgency);
  const isStat = referral.urgency === 'stat';
  const isCritical = referral.daysInStage > sla.atRisk;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={() => onClick(referral)}
          className={cn(
            'relative w-full text-left px-3 py-2.5 rounded-lg border transition-all',
            'hover:shadow-md hover:-translate-y-0.5 cursor-pointer',
            aging.bg, aging.border,
            isStat && 'ring-2 ring-red-300',
          )}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className={cn('text-xs font-semibold truncate', aging.text)}>
              {referral.patientLastName}, {referral.patientFirstName}
            </span>
            {referral.urgency !== 'routine' && (
              <Badge
                variant="outline"
                className={cn('text-[8px] h-3.5 px-1 shrink-0 font-bold rounded-full', urgency.bg, urgency.border, urgency.text)}
              >
                {urgency.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] text-gray-600 truncate flex-1">
              {referral.primaryDiagnosis}
            </span>
            <span className={cn('text-[10px] font-bold flex items-center gap-0.5 shrink-0', aging.text)}>
              <Clock className="size-3" />
              {referral.daysInStage}d
              {isCritical && <AlertTriangle className="size-3" />}
            </span>
          </div>
          {/* SLA indicator bar */}
          <div className="mt-1.5 h-1 bg-gray-200/50 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                referral.daysInStage <= sla.onTrack ? 'bg-emerald-400' :
                referral.daysInStage <= sla.aging ? 'bg-yellow-400' :
                referral.daysInStage <= sla.atRisk ? 'bg-orange-400' : 'bg-red-500',
              )}
              style={{ width: `${Math.min(100, (referral.daysInStage / Math.max(sla.atRisk * 1.5, 1)) * 100)}%` }}
            />
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-semibold text-sm">
            {referral.patientLastName}, {referral.patientFirstName}
          </p>
          <p className="text-xs">{referral.primaryDiagnosis} ({referral.primaryDiagnosisIcd})</p>
          <p className="text-xs">
            Insurance: {referral.insurancePlan} &middot; Auth: {referral.authorizationStatus}
          </p>
          <p className="text-xs">
            In stage {referral.daysInStage}d &middot; Total {referral.daysTotal}d &middot; Assigned: {referral.assignedTo}
          </p>
          <p className="text-xs text-gray-400">
            SLA: On Track ≤{sla.onTrack}d &middot; Aging ≤{sla.aging}d &middot; At Risk ≤{sla.atRisk}d
          </p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
});

// ─── Stage Row ──────────────────────────────────────────────────────────────

const StageRow = React.memo(function StageRow({
  config,
  referrals,
  sla,
  onCardClick,
}: {
  config: (typeof STAGE_CONFIGS)[number];
  referrals: Referral[];
  sla: StageSla;
  onCardClick: (r: Referral) => void;
}) {
  const sorted = useMemo(
    () => [...referrals].sort((a, b) => b.daysInStage - a.daysInStage),
    [referrals],
  );

  const avgDays = referrals.length > 0
    ? Math.round(referrals.reduce((s, r) => s + r.daysInStage, 0) / referrals.length)
    : 0;
  const maxDays = referrals.length > 0 ? Math.max(...referrals.map((r) => r.daysInStage)) : 0;
  const criticalCount = referrals.filter((r) => r.daysInStage > sla.atRisk).length;
  const atRiskCount = referrals.filter((r) => r.daysInStage > sla.aging && r.daysInStage <= sla.atRisk).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className={cn('flex items-center justify-between px-4 py-3 border-b', config.bgColor, config.borderColor)}>
        <div className="flex items-center gap-2.5">
          <div className={cn('w-3 h-3 rounded-full', config.iconBg)} />
          <span className={cn('text-sm font-bold', config.color)}>{config.label}</span>
          <Badge variant="secondary" className={cn('text-xs h-6 px-2 font-bold rounded-full', config.bgColor, config.color)}>
            {referrals.length}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>SLA: <strong className="text-gray-600">{sla.onTrack}/{sla.aging}/{sla.atRisk}d</strong></span>
          <span>Avg: <strong className="text-gray-700">{avgDays}d</strong></span>
          <span>Max: <strong className={maxDays > sla.atRisk ? 'text-red-600' : 'text-gray-700'}>{maxDays}d</strong></span>
          {criticalCount > 0 && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-red-50 border-red-200 text-red-600 gap-0.5 rounded-full">
              <AlertTriangle className="size-3" />
              {criticalCount} critical
            </Badge>
          )}
          {atRiskCount > 0 && (
            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-orange-50 border-orange-200 text-orange-600 gap-0.5 rounded-full">
              {atRiskCount} at risk
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3">
        {sorted.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No referrals in this stage</p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {sorted.map((referral) => (
              <ReferralTile key={referral.id} referral={referral} sla={sla} onClick={onCardClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Main Component ─────────────────────────────────────────────────────────

interface AgingHeatmapProps {
  referrals: Referral[];
  onCardClick: (referral: Referral) => void;
}

export const AgingHeatmap = React.memo(function AgingHeatmap({
  referrals,
  onCardClick,
}: AgingHeatmapProps) {
  const [slaThresholds, setSlaThresholds] = useState<SlaThresholds>(DEFAULT_SLA);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleSlaChange = useCallback((stage: PipelineStage, field: keyof StageSla, value: number) => {
    setSlaThresholds((prev) => ({
      ...prev,
      [stage]: { ...prev[stage], [field]: value },
    }));
  }, []);

  const handleReset = useCallback(() => {
    setSlaThresholds(DEFAULT_SLA);
  }, []);

  const stageGroups = useMemo(() => {
    const groups: Record<PipelineStage, Referral[]> = {
      new_referral: [],
      insurance_verification: [],
      clinical_review: [],
      admission_scheduled: [],
      admitted: [],
      rejected: [],
    };
    for (const ref of referrals) {
      if (groups[ref.stage]) groups[ref.stage].push(ref);
    }
    return groups;
  }, [referrals]);

  // Summary stats using per-stage thresholds
  const totalCritical = referrals.filter(
    (r) => r.daysInStage > slaThresholds[r.stage]?.atRisk,
  ).length;
  const totalAtRisk = referrals.filter(
    (r) => {
      const sla = slaThresholds[r.stage];
      return sla && r.daysInStage > sla.aging && r.daysInStage <= sla.atRisk;
    },
  ).length;
  const avgOverall = referrals.length > 0
    ? Math.round(referrals.reduce((s, r) => s + r.daysInStage, 0) / referrals.length)
    : 0;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Summary bar */}
      <div className="shrink-0 px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ThermometerSun className="size-4 text-orange-500" />
            <span className="text-sm font-semibold text-gray-700">Aging Heatmap</span>
            <span className="text-xs text-gray-400">— color-coded by per-stage SLA thresholds</span>
          </div>
          <div className="flex items-center gap-4">
            <HeatmapLegend />
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-3 text-xs">
              {totalCritical > 0 && (
                <span className="text-red-600 font-semibold">{totalCritical} critical</span>
              )}
              {totalAtRisk > 0 && (
                <span className="text-orange-600 font-semibold">{totalAtRisk} at risk</span>
              )}
              <span className="text-gray-500">Avg: {avgOverall}d</span>
            </div>
            <Button
              variant={settingsOpen ? 'default' : 'outline'}
              size="sm"
              className={cn('gap-1.5 text-xs h-7', settingsOpen && 'bg-gray-800 text-white hover:bg-gray-700')}
              onClick={() => setSettingsOpen((p) => !p)}
            >
              <Settings2 className="size-3" />
              SLA Settings
            </Button>
          </div>
        </div>

        {/* Inline SLA settings */}
        {settingsOpen && (
          <div className="mt-3">
            <SlaSettingsPanel
              thresholds={slaThresholds}
              onChange={handleSlaChange}
              onReset={handleReset}
              onClose={() => setSettingsOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Stage rows */}
      <ScrollArea className="flex-1">
        <div className="px-6 py-4 space-y-4">
          {STAGE_CONFIGS.map((config) => (
            <StageRow
              key={config.id}
              config={config}
              referrals={stageGroups[config.id] || []}
              sla={slaThresholds[config.id]}
              onCardClick={onCardClick}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

export default AgingHeatmap;