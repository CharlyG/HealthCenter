/**
 * SlaBreachAlerts — SLA monitoring panel for the referral pipeline.
 * Surfaces referrals that are aging beyond thresholds with escalation levels,
 * actionable quick-move buttons, and auto-escalation rules.
 *
 * Escalation levels:
 *  - Warning (aging): approaching SLA limit
 *  - Breach (at risk): exceeded SLA limit
 *  - Critical: exceeded 2x SLA limit, needs immediate attention
 */
import React, { useMemo, useCallback, useState } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  AlertTriangle, AlertOctagon, Clock, ChevronRight, ArrowRight,
  Bell, ShieldAlert, User, Zap, Filter, Flame,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Referral, PipelineStage } from '../../lib/referralPipelineTypes';
import { getStageConfig, getUrgencyConfig, STAGE_CONFIGS } from '../../lib/referralPipelineTypes';
import { referralPipelineGateway } from '../../lib/dataGateway';

// ─── Escalation Types ──────────────────────────────────────────────────────

type EscalationLevel = 'warning' | 'breach' | 'critical';

interface SlaAlert {
  referral: Referral;
  level: EscalationLevel;
  daysOverSla: number;
  slaThreshold: number;
  suggestedAction: string;
  nextStage: PipelineStage | null;
}

interface SlaThreshold {
  onTrack: number;
  aging: number;
  atRisk: number;
}

type SlaThresholds = Record<PipelineStage, SlaThreshold>;

const DEFAULT_SLA: SlaThresholds = {
  new_referral: { onTrack: 1, aging: 2, atRisk: 3 },
  insurance_verification: { onTrack: 2, aging: 4, atRisk: 6 },
  clinical_review: { onTrack: 2, aging: 5, atRisk: 7 },
  admission_scheduled: { onTrack: 3, aging: 5, atRisk: 7 },
  admitted: { onTrack: 7, aging: 14, atRisk: 21 },
  rejected: { onTrack: 7, aging: 14, atRisk: 21 },
};

const LEVEL_CONFIG: Record<EscalationLevel, {
  label: string;
  icon: React.ElementType;
  bg: string;
  border: string;
  text: string;
  badge: string;
  dot: string;
}> = {
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700 border-amber-300',
    dot: 'bg-amber-500',
  },
  breach: {
    label: 'SLA Breach',
    icon: ShieldAlert,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-800',
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
    dot: 'bg-orange-500',
  },
  critical: {
    label: 'Critical',
    icon: AlertOctagon,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    badge: 'bg-red-100 text-red-700 border-red-300',
    dot: 'bg-red-500 animate-pulse',
  },
};

const NEXT_STAGE_MAP: Record<string, PipelineStage> = {
  new_referral: 'insurance_verification',
  insurance_verification: 'clinical_review',
  clinical_review: 'admission_scheduled',
  admission_scheduled: 'admitted',
};

const SUGGESTED_ACTIONS: Record<string, string> = {
  new_referral: 'Triage and begin insurance verification',
  insurance_verification: 'Follow up on authorization status',
  clinical_review: 'Complete clinical eligibility review',
  admission_scheduled: 'Confirm SOC date with patient and clinician',
};

function getEscalationLevel(daysInStage: number, sla: SlaThreshold): EscalationLevel | null {
  if (daysInStage >= sla.atRisk * 2) return 'critical';
  if (daysInStage >= sla.atRisk) return 'breach';
  if (daysInStage >= sla.aging) return 'warning';
  return null;
}

// ─── Alert Card ─────────────────────────────────────────────────────────────

interface AlertCardProps {
  alert: SlaAlert;
  onAdvance: (referral: Referral, toStage: PipelineStage) => void;
  onViewDetail: (referral: Referral) => void;
  advancing: string | null;
}

const AlertCard = React.memo(function AlertCard({ alert, onAdvance, onViewDetail, advancing }: AlertCardProps) {
  const { referral, level, daysOverSla, slaThreshold, suggestedAction, nextStage } = alert;
  const config = LEVEL_CONFIG[level];
  const stageConfig = getStageConfig(referral.stage);
  const urgencyConfig = getUrgencyConfig(referral.urgency);
  const LevelIcon = config.icon;

  const initials = referral.assignedTo
    ? referral.assignedTo.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '??';

  return (
    <div className={cn(
      'rounded-lg border-l-4 border bg-white shadow-sm transition-all hover:shadow-md',
      config.border,
    )}>
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <LevelIcon className={cn('size-4 shrink-0', config.text)} />
            <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 rounded-full font-bold', config.badge)}>
              {config.label}
            </Badge>
            <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 rounded-full', stageConfig.bgColor, stageConfig.borderColor, stageConfig.color)}>
              {stageConfig.shortLabel}
            </Badge>
            <Badge variant="outline" className={cn('text-[10px] h-5 px-1.5 rounded-full font-bold gap-1', urgencyConfig.bg, urgencyConfig.border, urgencyConfig.text)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', urgencyConfig.dot)} />
              {urgencyConfig.label}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className={cn('size-3.5', level === 'critical' ? 'text-red-500 animate-pulse' : 'text-orange-400')} />
            <span className={cn('text-sm font-bold tabular-nums', config.text)}>
              {referral.daysInStage}d
            </span>
            <span className="text-[10px] text-gray-400">
              / {slaThreshold}d SLA
            </span>
          </div>
        </div>

        {/* Patient info */}
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold', stageConfig.iconBg, stageConfig.color)}>
            {referral.patientFirstName[0]}{referral.patientLastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {referral.patientLastName}, {referral.patientFirstName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {referral.primaryDiagnosis}
              {referral.primaryDiagnosisIcd && <span className="text-gray-400 ml-1">({referral.primaryDiagnosisIcd})</span>}
            </p>
          </div>
          {referral.assignedTo && (
            <div className="flex items-center gap-1.5 shrink-0" title={referral.assignedTo}>
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-[8px] font-bold text-blue-700">{initials}</span>
              </div>
              <span className="text-[10px] text-gray-500 max-w-[70px] truncate">
                {referral.assignedTo.split(',')[0]}
              </span>
            </div>
          )}
        </div>

        {/* Suggested action */}
        <div className={cn('rounded-lg px-3 py-2 mb-3 text-xs', config.bg)}>
          <div className="flex items-center gap-1.5">
            <Bell className="size-3 shrink-0 text-gray-500" />
            <span className="font-medium text-gray-700">Suggested Action:</span>
          </div>
          <p className="text-gray-600 mt-0.5 ml-4.5">{suggestedAction}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {nextStage && referral.stage !== 'admitted' && referral.stage !== 'rejected' && (
            <Button
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={() => onAdvance(referral, nextStage)}
              disabled={advancing === referral.id}
            >
              {advancing === referral.id ? (
                <Clock className="size-3 animate-spin" />
              ) : (
                <ArrowRight className="size-3" />
              )}
              Advance to {getStageConfig(nextStage).shortLabel}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs h-7"
            onClick={() => onViewDetail(referral)}
          >
            View Details
          </Button>
          <div className="flex-1" />
          <span className="text-[10px] text-gray-400">
            +{daysOverSla}d over SLA &middot; {referral.daysTotal}d total
          </span>
        </div>
      </div>
    </div>
  );
});

// ─── Main Panel ─────────────────────────────────────────────────────────────

interface SlaBreachAlertsProps {
  referrals: Referral[];
  onCardClick: (referral: Referral) => void;
  onRefresh: () => void;
}

export default function SlaBreachAlerts({ referrals, onCardClick, onRefresh }: SlaBreachAlertsProps) {
  const [levelFilter, setLevelFilter] = useState<EscalationLevel | 'all'>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [advancing, setAdvancing] = useState<string | null>(null);

  // Compute SLA alerts
  const alerts: SlaAlert[] = useMemo(() => {
    const result: SlaAlert[] = [];
    for (const ref of referrals) {
      if (ref.stage === 'admitted' || ref.stage === 'rejected') continue;
      const sla = DEFAULT_SLA[ref.stage];
      if (!sla) continue;
      const level = getEscalationLevel(ref.daysInStage, sla);
      if (!level) continue;

      result.push({
        referral: ref,
        level,
        daysOverSla: Math.max(0, ref.daysInStage - sla.aging),
        slaThreshold: sla.atRisk,
        suggestedAction: SUGGESTED_ACTIONS[ref.stage] || 'Review and take action',
        nextStage: NEXT_STAGE_MAP[ref.stage] || null,
      });
    }

    // Sort: critical first, then breach, then warning; within same level, by days desc
    const levelPriority: Record<EscalationLevel, number> = { critical: 0, breach: 1, warning: 2 };
    result.sort((a, b) => {
      const lp = levelPriority[a.level] - levelPriority[b.level];
      if (lp !== 0) return lp;
      // Within same level, STAT/urgent first
      const up: Record<string, number> = { stat: 0, urgent: 1, routine: 2 };
      const urgDiff = (up[a.referral.urgency] ?? 2) - (up[b.referral.urgency] ?? 2);
      if (urgDiff !== 0) return urgDiff;
      return b.referral.daysInStage - a.referral.daysInStage;
    });

    return result;
  }, [referrals]);

  const filtered = useMemo(() => {
    let result = alerts;
    if (levelFilter !== 'all') result = result.filter(a => a.level === levelFilter);
    if (stageFilter !== 'all') result = result.filter(a => a.referral.stage === stageFilter);
    return result;
  }, [alerts, levelFilter, stageFilter]);

  // Summary counts
  const counts = useMemo(() => ({
    total: alerts.length,
    critical: alerts.filter(a => a.level === 'critical').length,
    breach: alerts.filter(a => a.level === 'breach').length,
    warning: alerts.filter(a => a.level === 'warning').length,
  }), [alerts]);

  const handleAdvance = useCallback(async (referral: Referral, toStage: PipelineStage) => {
    setAdvancing(referral.id);
    try {
      const label = getStageConfig(toStage).label;
      await referralPipelineGateway.moveStage(referral.id, {
        toStage,
        note: `SLA escalation: advanced to ${label} due to aging (${referral.daysInStage}d in stage)`,
        movedBy: 'Current User',
      });
      toast.success(`${referral.patientLastName}, ${referral.patientFirstName} → ${label}`);
      onRefresh();
    } catch (err: any) {
      console.error('[SlaBreachAlerts] advance error:', err);
      toast.error(err.message || 'Failed to advance referral');
    } finally {
      setAdvancing(null);
    }
  }, [onRefresh]);

  // Active stages with alerts
  const alertStages = useMemo(() => {
    const set = new Set(alerts.map(a => a.referral.stage));
    return STAGE_CONFIGS.filter(s => set.has(s.id));
  }, [alerts]);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Summary Cards */}
      <div className="px-6 pt-4 pb-3">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card className={counts.total > 0 ? 'ring-1 ring-gray-200' : ''}>
            <CardContent className="pt-3 pb-2.5 px-4">
              <div className="flex items-center gap-2 mb-1">
                <Bell className="size-4 text-gray-500" />
                <span className="text-[10px] font-medium text-gray-500 uppercase">Total Alerts</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{counts.total}</p>
            </CardContent>
          </Card>
          <Card className={counts.critical > 0 ? 'ring-2 ring-red-300' : ''}>
            <CardContent className="pt-3 pb-2.5 px-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertOctagon className="size-4 text-red-500" />
                <span className="text-[10px] font-medium text-red-600 uppercase">Critical</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{counts.critical}</p>
            </CardContent>
          </Card>
          <Card className={counts.breach > 0 ? 'ring-1 ring-orange-200' : ''}>
            <CardContent className="pt-3 pb-2.5 px-4">
              <div className="flex items-center gap-2 mb-1">
                <ShieldAlert className="size-4 text-orange-500" />
                <span className="text-[10px] font-medium text-orange-600 uppercase">SLA Breach</span>
              </div>
              <p className="text-2xl font-bold text-orange-700">{counts.breach}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-3 pb-2.5 px-4">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="size-4 text-amber-500" />
                <span className="text-[10px] font-medium text-amber-600 uppercase">Warning</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">{counts.warning}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Filter className="size-3.5 text-gray-400" />
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as any)}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="breach">SLA Breach</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {alertStages.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1" />
          <span className="text-[10px] text-gray-400">
            Showing {filtered.length} of {alerts.length} alerts
          </span>
        </div>
      </div>

      {/* Alert List */}
      <ScrollArea className="flex-1 px-6 pb-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <Zap className="size-8 text-green-400" />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              {alerts.length === 0 ? 'No SLA breaches detected' : 'No alerts match your filters'}
            </p>
            <p className="text-xs text-gray-400">
              {alerts.length === 0
                ? 'All referrals are within their SLA thresholds. Great work!'
                : 'Try adjusting your filter criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(alert => (
              <AlertCard
                key={alert.referral.id}
                alert={alert}
                onAdvance={handleAdvance}
                onViewDetail={onCardClick}
                advancing={advancing}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
