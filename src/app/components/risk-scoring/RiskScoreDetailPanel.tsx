/**
 * RiskScoreDetailPanel — Full risk factor breakdown dialog.
 * Shows per-category scores, data points, trends, recommendations,
 * 12-week trend chart with threshold zones, and threshold settings access.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  ShieldAlert,
  Activity,
  Calendar,
  ClipboardCheck,
  Stethoscope,
  Pill,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  Lightbulb,
  Settings2,
  BarChart3,
} from 'lucide-react';
import type {
  PatientRiskScore,
  RiskFactor,
  RiskRecommendation,
  RiskScoreSnapshot,
  RiskThresholdRule,
} from '../../lib/riskScoringTypes';
import { getRiskColor, getRiskLevel } from '../../lib/riskScoringTypes';
import { riskScoringGateway } from '../../lib/dataGateway';
import { RiskTrendChart } from './RiskTrendChart';
import { RiskThresholdSettings } from './RiskThresholdSettings';

// ─── Category Icons ─────────────────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  hospitalization: Activity,
  visit_compliance: Calendar,
  clinical_assessment: ClipboardCheck,
  diagnosis_severity: Stethoscope,
  medication_complexity: Pill,
};

// ─── Trend Badge ────────────────────────────────────────────────────────────

const TrendBadge = React.memo(function TrendBadge({ trend }: { trend: string }) {
  if (trend === 'worsening') {
    return (
      <Badge variant="outline" className="text-[8px] h-4 px-1 gap-0.5 bg-red-50 border-red-200 text-red-600">
        <TrendingUp className="size-2.5" />
        Worsening
      </Badge>
    );
  }
  if (trend === 'improving') {
    return (
      <Badge variant="outline" className="text-[8px] h-4 px-1 gap-0.5 bg-emerald-50 border-emerald-200 text-emerald-600">
        <TrendingDown className="size-2.5" />
        Improving
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[8px] h-4 px-1 gap-0.5 bg-gray-50 border-gray-200 text-gray-500">
      <Minus className="size-2.5" />
      Stable
    </Badge>
  );
});

// ─── Impact Indicator ───────────────────────────────────────────────────────

const ImpactDot = React.memo(function ImpactDot({ impact }: { impact: string }) {
  if (impact === 'negative') return <AlertTriangle className="size-3 text-red-500 shrink-0" />;
  if (impact === 'positive') return <CheckCircle2 className="size-3 text-emerald-500 shrink-0" />;
  return <MinusCircle className="size-3 text-gray-400 shrink-0" />;
});

// ─── Factor Card ────────────────────────────────────────────────────────────

const FactorCard = React.memo(function FactorCard({ factor }: { factor: RiskFactor }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[factor.category] || ShieldAlert;
  const level = getRiskLevel(factor.score);
  const colors = getRiskColor(level);
  const pct = Math.round((factor.score / factor.maxScore) * 100);

  return (
    <div className={cn('border rounded-lg transition-all', colors.border)}>
      <button
        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', colors.bg)}>
          <Icon className={cn('size-4', colors.text)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-900">{factor.label}</span>
            <TrendBadge trend={factor.trend} />
          </div>
          <p className="text-[10px] text-gray-500 truncate">{factor.description}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className={cn('text-lg font-bold', colors.text)}>{factor.score}</span>
            <span className="text-[9px] text-gray-400">/100</span>
          </div>
          {expanded ? (
            <ChevronUp className="size-4 text-gray-400" />
          ) : (
            <ChevronDown className="size-4 text-gray-400" />
          )}
        </div>
      </button>

      <div className="px-3 pb-2">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%`, backgroundColor: colors.ring }}
          />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-[8px] text-gray-400">
            Weight: {Math.round(factor.weight * 100)}%
          </span>
          <span className="text-[8px] text-gray-400">
            Contribution: {Math.round(factor.score * factor.weight)} pts
          </span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-3 py-2 space-y-1.5">
          {factor.dataPoints.map((dp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <ImpactDot impact={dp.impact} />
              <span className="text-[10px] text-gray-600 flex-1">{dp.label}</span>
              <span className={cn(
                'text-[10px] font-semibold',
                dp.impact === 'negative' ? 'text-red-600' :
                dp.impact === 'positive' ? 'text-emerald-600' :
                'text-gray-700'
              )}>
                {String(dp.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Recommendation Item ────────────────────────────────────────────────────

const PRIORITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  urgent: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

const RecommendationItem = React.memo(function RecommendationItem({
  rec,
}: {
  rec: RiskRecommendation;
}) {
  const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.low;
  const CatIcon = CATEGORY_ICONS[rec.category] || ShieldAlert;

  return (
    <div className={cn('flex items-start gap-2 px-3 py-2 rounded-lg border', style.bg, style.border)}>
      <CatIcon className={cn('size-3.5 mt-0.5 shrink-0', style.text)} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-800">{rec.text}</p>
      </div>
      <Badge variant="outline" className={cn('text-[7px] h-4 px-1 shrink-0', style.bg, style.border, style.text)}>
        {rec.priority.toUpperCase()}
      </Badge>
    </div>
  );
});

// ─── Score Change Indicator ─────────────────────────────────────────────────

const ScoreChange = React.memo(function ScoreChange({
  current,
  previous,
}: {
  current: number;
  previous?: number;
}) {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (diff === 0) return null;

  return (
    <span className={cn(
      'text-[10px] font-semibold flex items-center gap-0.5',
      diff > 0 ? 'text-red-500' : 'text-emerald-500'
    )}>
      {diff > 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {diff > 0 ? '+' : ''}{diff} from last week
    </span>
  );
});

// ─── Main Panel ─────────────────────────────────────────────────────────────

interface RiskScoreDetailPanelProps {
  riskScore: PatientRiskScore;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RiskScoreDetailPanel = React.memo(function RiskScoreDetailPanel({
  riskScore,
  open,
  onOpenChange,
}: RiskScoreDetailPanelProps) {
  const colors = getRiskColor(riskScore.level);
  const urgentRecs = riskScore.recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high');
  const otherRecs = riskScore.recommendations.filter(r => r.priority !== 'urgent' && r.priority !== 'high');

  const [snapshots, setSnapshots] = useState<RiskScoreSnapshot[]>([]);
  const [thresholdRules, setThresholdRules] = useState<RiskThresholdRule[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Load history and threshold config when panel opens
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [historyRes, configRes] = await Promise.all([
          riskScoringGateway.getPatientRiskHistory(riskScore.patientId),
          riskScoringGateway.getThresholdConfig(),
        ]);
        setSnapshots(historyRes.snapshots || []);
        setThresholdRules(configRes.config?.rules || []);
      } catch (err) {
        console.error('[RiskDetailPanel] Load error:', err);
      }
    })();
  }, [open, riskScore.patientId]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <ShieldAlert className={cn('size-5', colors.text)} />
                Patient Risk Assessment
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-[10px] h-7"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings2 className="size-3" />
                Alert Thresholds
              </Button>
            </div>
          </DialogHeader>

          {/* Overall Score Banner */}
          <div className={cn('rounded-lg p-4 flex items-center gap-4 shrink-0', colors.bg, 'border', colors.border)}>
            <div className="relative">
              <svg width={64} height={64} className="transform -rotate-90">
                <circle cx={32} cy={32} r={28} fill="none" stroke="#e5e7eb" strokeWidth={4} />
                <circle
                  cx={32} cy={32} r={28} fill="none"
                  stroke={colors.ring}
                  strokeWidth={4}
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - riskScore.overallScore / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <span className={cn('absolute inset-0 flex items-center justify-center text-xl font-bold', colors.text)}>
                {riskScore.overallScore}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={cn('text-lg font-bold uppercase', colors.text)}>
                  {riskScore.level} Risk
                </span>
                <TrendBadge trend={riskScore.trend} />
              </div>
              <p className="text-xs text-gray-600 mt-0.5">{riskScore.patientName}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-[9px] text-gray-400">
                  Calculated {new Date(riskScore.calculatedAt).toLocaleString()}
                </p>
                <ScoreChange
                  current={riskScore.overallScore}
                  previous={riskScore.previousScore}
                />
              </div>
            </div>

            {urgentRecs.length > 0 && (
              <div className="shrink-0 text-center">
                <span className="text-2xl font-bold text-red-600">{urgentRecs.length}</span>
                <p className="text-[9px] text-red-500">Urgent Actions</p>
              </div>
            )}
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-4 pr-2">
              {/* 12-Week Trend Chart */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <BarChart3 className="size-3.5 text-indigo-500" />
                  12-Week Score Trend
                </h3>
                <div className="border border-gray-100 rounded-lg p-2 bg-white">
                  <RiskTrendChart
                    patientId={riskScore.patientId}
                    snapshots={snapshots}
                    thresholdRules={thresholdRules}
                    height={180}
                  />
                  <div className="flex items-center justify-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-0.5 bg-red-200" />
                      <span className="text-[7px] text-gray-400">Critical (75)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-0.5 bg-orange-200" />
                      <span className="text-[7px] text-gray-400">High (50)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2.5 h-0.5 bg-amber-200" />
                      <span className="text-[7px] text-gray-400">Moderate (25)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-1.5 rounded-full bg-indigo-500" />
                      <span className="text-[7px] text-gray-400">Score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Factor Breakdown */}
              <div>
                <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Activity className="size-3.5" />
                  Risk Factor Breakdown
                </h3>
                <div className="space-y-2">
                  {riskScore.factors.map((factor) => (
                    <FactorCard key={factor.category} factor={factor} />
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {riskScore.recommendations.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Lightbulb className="size-3.5 text-amber-500" />
                    Clinical Recommendations ({riskScore.recommendations.length})
                  </h3>
                  <div className="space-y-1.5">
                    {urgentRecs.map((rec) => (
                      <RecommendationItem key={rec.id} rec={rec} />
                    ))}
                    {otherRecs.map((rec) => (
                      <RecommendationItem key={rec.id} rec={rec} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="shrink-0 pt-2 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[9px] text-gray-400">
              Risk scores are calculated using deterministic clinical rules and do not constitute medical advice.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Threshold Settings Dialog */}
      <RiskThresholdSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </>
  );
});

export default RiskScoreDetailPanel;
