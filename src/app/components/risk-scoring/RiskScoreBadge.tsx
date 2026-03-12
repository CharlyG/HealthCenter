/**
 * RiskScoreBadge — Compact risk score indicator for patient headers and lists.
 * Shows the overall 0–100 score with color-coded risk level.
 * Clicking opens the RiskScoreDetailPanel.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { riskScoringGateway } from '../../lib/dataGateway';
import type { PatientRiskScore } from '../../lib/riskScoringTypes';
import { getRiskColor, getRiskLevel } from '../../lib/riskScoringTypes';
import RiskScoreDetailPanel from './RiskScoreDetailPanel';

// ─── Score Ring (SVG) ───────────────────────────────────────────────────────

const ScoreRing = React.memo(function ScoreRing({
  score,
  size = 32,
  strokeWidth = 3,
  color,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
});

// ─── Trend Icon ─────────────────────────────────────────────────────────────

const TrendIcon = React.memo(function TrendIcon({
  trend,
  className,
}: {
  trend: string;
  className?: string;
}) {
  if (trend === 'worsening') return <TrendingUp className={cn('text-red-500', className)} />;
  if (trend === 'improving') return <TrendingDown className={cn('text-emerald-500', className)} />;
  return <Minus className={cn('text-gray-400', className)} />;
});

// ─── Props ──────────────────────────────────────────────────────────────────

interface RiskScoreBadgeProps {
  patientId: string;
  /** Compact mode shows just the ring + number for inline use */
  compact?: boolean;
  /** Variant for dark backgrounds (patient header) */
  variant?: 'default' | 'header';
  className?: string;
}

export const RiskScoreBadge = React.memo(function RiskScoreBadge({
  patientId,
  compact = false,
  variant = 'default',
  className,
}: RiskScoreBadgeProps) {
  const [riskScore, setRiskScore] = useState<PatientRiskScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadScore = useCallback(async () => {
    try {
      setLoading(true);
      const res = await riskScoringGateway.getPatientRiskScore(patientId);
      setRiskScore(res.riskScore);
    } catch (err: any) {
      console.error('[RiskScoreBadge] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadScore();
  }, [loadScore]);

  if (loading) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <Loader2 className="size-3 animate-spin text-gray-400" />
        {!compact && <span className="text-[9px] text-gray-400">Scoring...</span>}
      </div>
    );
  }

  if (!riskScore) return null;

  const colors = getRiskColor(riskScore.level);
  const isHeader = variant === 'header';

  if (compact) {
    return (
      <>
        <button
          onClick={() => setDetailOpen(true)}
          className={cn(
            'flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity',
            className
          )}
          title={`Risk Score: ${riskScore.overallScore}/100 (${riskScore.level})`}
        >
          <div className="relative">
            <ScoreRing score={riskScore.overallScore} size={24} strokeWidth={2.5} color={colors.ring} />
            <span className={cn(
              'absolute inset-0 flex items-center justify-center text-[7px] font-bold',
              isHeader ? 'text-white' : colors.text
            )}>
              {riskScore.overallScore}
            </span>
          </div>
        </button>
        {detailOpen && riskScore && (
          <RiskScoreDetailPanel
            riskScore={riskScore}
            open={detailOpen}
            onOpenChange={setDetailOpen}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setDetailOpen(true)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-2.5 py-1.5 cursor-pointer transition-all',
          isHeader
            ? 'bg-white/15 hover:bg-white/25 border border-white/20'
            : cn(colors.bg, 'hover:opacity-90 border', colors.border),
          className
        )}
        title="Click to view risk score details"
      >
        <div className="relative">
          <ScoreRing
            score={riskScore.overallScore}
            size={28}
            strokeWidth={2.5}
            color={isHeader ? '#ffffff' : colors.ring}
          />
          <span className={cn(
            'absolute inset-0 flex items-center justify-center text-[8px] font-bold',
            isHeader ? 'text-white' : colors.text
          )}>
            {riskScore.overallScore}
          </span>
        </div>
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1">
            <span className={cn(
              'text-[10px] font-semibold uppercase tracking-wide',
              isHeader ? 'text-white' : colors.text
            )}>
              {riskScore.level} Risk
            </span>
            <TrendIcon trend={riskScore.trend} className="size-3" />
          </div>
          {riskScore.recommendations.length > 0 && (
            <span className={cn(
              'text-[8px]',
              isHeader ? 'text-white/70' : 'text-gray-500'
            )}>
              {riskScore.recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high').length} actions needed
            </span>
          )}
        </div>
      </button>
      {detailOpen && riskScore && (
        <RiskScoreDetailPanel
          riskScore={riskScore}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </>
  );
});

export default RiskScoreBadge;
