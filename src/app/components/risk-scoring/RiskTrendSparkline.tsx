/**
 * RiskTrendSparkline — Compact SVG sparkline showing risk score history.
 * Renders threshold zone bands and a polyline of score snapshots.
 * Used inline in patient rows and the detail panel.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '../ui/utils';
import { riskScoringGateway } from '../../lib/dataGateway';
import type { RiskScoreSnapshot } from '../../lib/riskScoringTypes';

interface RiskTrendSparklineProps {
  patientId: string;
  /** Pre-loaded snapshots (avoids extra API call when parent already has them) */
  snapshots?: RiskScoreSnapshot[];
  width?: number;
  height?: number;
  showThresholds?: boolean;
  className?: string;
}

export const RiskTrendSparkline = React.memo(function RiskTrendSparkline({
  patientId,
  snapshots: externalSnapshots,
  width = 120,
  height = 32,
  showThresholds = true,
  className,
}: RiskTrendSparklineProps) {
  const [snapshots, setSnapshots] = useState<RiskScoreSnapshot[]>(externalSnapshots || []);
  const [loading, setLoading] = useState(!externalSnapshots);

  useEffect(() => {
    if (externalSnapshots) {
      setSnapshots(externalSnapshots);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await riskScoringGateway.getPatientRiskHistory(patientId);
        if (!cancelled) setSnapshots(res.snapshots || []);
      } catch (err) {
        console.error('[Sparkline] Load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [patientId, externalSnapshots]);

  const { points, currentColor } = useMemo(() => {
    if (snapshots.length < 2) return { points: '', currentColor: '#9ca3af' };

    const pad = 2;
    const w = width - pad * 2;
    const h = height - pad * 2;

    const pts = snapshots.map((s, i) => {
      const x = pad + (i / (snapshots.length - 1)) * w;
      const y = pad + h - (s.score / 100) * h;
      return `${x},${y}`;
    });

    const lastScore = snapshots[snapshots.length - 1].score;
    const color =
      lastScore >= 75 ? '#ef4444' :
      lastScore >= 50 ? '#f97316' :
      lastScore >= 25 ? '#f59e0b' :
      '#10b981';

    return { points: pts.join(' '), currentColor: color };
  }, [snapshots, width, height]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ width, height }}>
        <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (snapshots.length < 2) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ width, height }}>
        <span className="text-[7px] text-gray-400">No history</span>
      </div>
    );
  }

  const pad = 2;
  const h = height - pad * 2;

  // Threshold lines (y positions)
  const thresholdLines = showThresholds
    ? [
        { score: 75, color: '#fecaca' }, // Critical
        { score: 50, color: '#fed7aa' }, // High
        { score: 25, color: '#fef3c7' }, // Moderate
      ]
    : [];

  // Current score dot
  const lastSnap = snapshots[snapshots.length - 1];
  const dotX = width - pad;
  const dotY = pad + h - (lastSnap.score / 100) * h;

  return (
    <svg
      width={width}
      height={height}
      className={cn('shrink-0', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      {/* Threshold zone bands */}
      {showThresholds && (
        <>
          {/* Critical zone (75-100) */}
          <rect x={0} y={pad} width={width} height={(25 / 100) * h} fill="#fef2f2" opacity={0.5} />
          {/* High zone (50-75) */}
          <rect x={0} y={pad + (25 / 100) * h} width={width} height={(25 / 100) * h} fill="#fff7ed" opacity={0.4} />
        </>
      )}

      {/* Threshold lines */}
      {thresholdLines.map(({ score, color }) => {
        const y = pad + h - (score / 100) * h;
        return (
          <line
            key={score}
            x1={0}
            y1={y}
            x2={width}
            y2={y}
            stroke={color}
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
        );
      })}

      {/* Trend line */}
      <polyline
        fill="none"
        stroke={currentColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />

      {/* Current score dot */}
      <circle cx={dotX} cy={dotY} r={2.5} fill={currentColor} />
      <circle cx={dotX} cy={dotY} r={4} fill={currentColor} opacity={0.2} />
    </svg>
  );
});

export default RiskTrendSparkline;
