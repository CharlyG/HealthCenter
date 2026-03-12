/**
 * RiskTrendChart — Full-size recharts area chart showing 12-week risk score history.
 * Displays threshold zone background bands, factor score lines, and score trend.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '../ui/utils';
import { Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { riskScoringGateway } from '../../lib/dataGateway';
import type { RiskScoreSnapshot, RiskThresholdRule } from '../../lib/riskScoringTypes';

interface RiskTrendChartProps {
  patientId: string;
  /** Pre-loaded snapshots */
  snapshots?: RiskScoreSnapshot[];
  /** Threshold rules to render as reference lines */
  thresholdRules?: RiskThresholdRule[];
  height?: number;
  className?: string;
}

const THRESHOLD_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  moderate: '#f59e0b',
  low: '#10b981',
};

export const RiskTrendChart = React.memo(function RiskTrendChart({
  patientId,
  snapshots: externalSnapshots,
  thresholdRules,
  height = 200,
  className,
}: RiskTrendChartProps) {
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
        console.error('[RiskTrendChart] Load error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [patientId, externalSnapshots]);

  const chartData = useMemo(() => {
    return snapshots.map((s) => {
      const d = new Date(s.timestamp);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: s.score,
        hospitalization: s.factorScores?.hospitalization ?? 0,
        visit_compliance: s.factorScores?.visit_compliance ?? 0,
        clinical_assessment: s.factorScores?.clinical_assessment ?? 0,
        diagnosis_severity: s.factorScores?.diagnosis_severity ?? 0,
        medication_complexity: s.factorScores?.medication_complexity ?? 0,
      };
    });
  }, [snapshots]);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <Loader2 className="size-4 animate-spin text-gray-400" />
        <span className="ml-1 text-[10px] text-gray-500">Loading trend...</span>
      </div>
    );
  }

  if (chartData.length < 2) {
    return (
      <div className={cn('flex items-center justify-center border border-dashed border-gray-200 rounded-lg', className)} style={{ height }}>
        <span className="text-[10px] text-gray-400">Insufficient history for trend chart</span>
      </div>
    );
  }

  // Get enabled threshold rules for reference lines
  const enabledThresholds = (thresholdRules || []).filter(r => r.enabled);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />

          {/* Threshold zone backgrounds */}
          <ReferenceArea y1={75} y2={100} fill="#fef2f2" fillOpacity={0.5} />
          <ReferenceArea y1={50} y2={75} fill="#fff7ed" fillOpacity={0.3} />
          <ReferenceArea y1={25} y2={50} fill="#fefce8" fillOpacity={0.2} />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            ticks={[0, 25, 50, 75, 100]}
          />
          <Tooltip
            contentStyle={{
              fontSize: 10,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              padding: '8px 12px',
            }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                score: 'Overall Score',
                hospitalization: 'Hospitalization',
                visit_compliance: 'Visit Compliance',
                clinical_assessment: 'Clinical Assessment',
                diagnosis_severity: 'Diagnosis Severity',
                medication_complexity: 'Medication Complexity',
              };
              return [value, labels[name] || name];
            }}
          />

          {/* Threshold reference lines */}
          {enabledThresholds.map((rule) => (
            <ReferenceLine
              key={rule.id}
              y={rule.scoreThreshold}
              stroke={THRESHOLD_COLORS[rule.level] || '#9ca3af'}
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{
                value: `${rule.name} (${rule.scoreThreshold})`,
                position: 'right',
                fontSize: 8,
                fill: THRESHOLD_COLORS[rule.level] || '#9ca3af',
              }}
            />
          ))}

          {/* Main score area */}
          <Area
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#riskGradient)"
            dot={{ r: 3, fill: '#6366f1' }}
            activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

export default RiskTrendChart;
