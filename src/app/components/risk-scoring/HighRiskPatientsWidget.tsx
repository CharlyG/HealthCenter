/**
 * HighRiskPatientsWidget — Dashboard widget showing high/critical risk patients.
 * Displays a ranked list with scores, trends, and quick-access to details.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  ArrowRight,
  ChevronRight,
  AlertTriangle,
  Users,
} from 'lucide-react';
import { riskScoringGateway } from '../../lib/dataGateway';
import type { PatientRiskScore } from '../../lib/riskScoringTypes';
import { getRiskColor } from '../../lib/riskScoringTypes';
import RiskScoreDetailPanel from './RiskScoreDetailPanel';
import { RiskTrendSparkline } from './RiskTrendSparkline';

// ─── Score Ring (small) ─────────────────────────────────────────────────────

const MiniScoreRing = React.memo(function MiniScoreRing({
  score,
  color,
}: {
  score: number;
  color: string;
}) {
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gray-900">
        {score}
      </span>
    </div>
  );
});

// ─── Trend Icon ─────────────────────────────────────────────────────────────

const TrendIcon = React.memo(function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'worsening') return <TrendingUp className="size-3 text-red-500" />;
  if (trend === 'improving') return <TrendingDown className="size-3 text-emerald-500" />;
  return <Minus className="size-3 text-gray-400" />;
});

// ─── Patient Row ────────────────────────────────────────────────────────────

const PatientRow = React.memo(function PatientRow({
  score,
  rank,
  onViewDetails,
}: {
  score: PatientRiskScore;
  rank: number;
  onViewDetails: (score: PatientRiskScore) => void;
}) {
  const colors = getRiskColor(score.level);
  const urgentActions = score.recommendations.filter(r => r.priority === 'urgent' || r.priority === 'high').length;

  return (
    <button
      onClick={() => onViewDetails(score)}
      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-b-0"
    >
      {/* Rank */}
      <span className="text-[10px] font-semibold text-gray-400 w-4 shrink-0 text-center">
        {rank}
      </span>

      {/* Score Ring */}
      <MiniScoreRing score={score.overallScore} color={colors.ring} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-900 truncate">
            {score.patientName}
          </span>
          <TrendIcon trend={score.trend} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <Badge
            variant="outline"
            className={cn('text-[7px] h-3.5 px-1', colors.bg, colors.border, colors.text)}
          >
            {score.level.toUpperCase()}
          </Badge>
          {urgentActions > 0 && (
            <span className="text-[9px] text-red-500 flex items-center gap-0.5">
              <AlertTriangle className="size-2.5" />
              {urgentActions} action{urgentActions !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Sparkline */}
      <RiskTrendSparkline
        patientId={score.patientId}
        width={80}
        height={28}
        showThresholds={false}
      />

      <ChevronRight className="size-3.5 text-gray-300 shrink-0" />
    </button>
  );
});

// ─── Main Widget ────────────────────────────────────────────────────────────

interface HighRiskPatientsWidgetProps {
  maxVisible?: number;
  className?: string;
}

export const HighRiskPatientsWidget = React.memo(function HighRiskPatientsWidget({
  maxVisible = 5,
  className,
}: HighRiskPatientsWidgetProps) {
  const navigate = useNavigate();
  const [scores, setScores] = useState<PatientRiskScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [selectedScore, setSelectedScore] = useState<PatientRiskScore | null>(null);

  const loadScores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await riskScoringGateway.getAllRiskScores();
      setScores(res.scores || []);
      setHighRiskCount(res.highRiskCount || 0);
      setCriticalCount(res.criticalCount || 0);
    } catch (err: any) {
      console.error('[HighRiskWidget] Load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadScores();
  }, [loadScores]);

  const visibleScores = scores.slice(0, maxVisible);

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <ShieldAlert className="size-4 text-red-600" />
              Patient Risk Scores
            </div>
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <Badge variant="outline" className="text-[8px] h-5 px-1.5 gap-0.5 bg-red-50 border-red-200 text-red-700">
                  {criticalCount} Critical
                </Badge>
              )}
              {highRiskCount > 0 && (
                <Badge variant="outline" className="text-[8px] h-5 px-1.5 gap-0.5 bg-orange-50 border-orange-200 text-orange-700">
                  {highRiskCount} High Risk
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-5 animate-spin text-gray-400" />
              <span className="ml-2 text-xs text-gray-500">Calculating risk scores...</span>
            </div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8">
              <Users className="size-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs text-gray-500">No patient risk data available</p>
            </div>
          ) : (
            <>
              <div>
                {visibleScores.map((score, idx) => (
                  <PatientRow
                    key={score.patientId}
                    score={score}
                    rank={idx + 1}
                    onViewDetails={setSelectedScore}
                  />
                ))}
              </div>
              {scores.length > maxVisible && (
                <div className="p-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-7 text-[10px] text-blue-600 gap-1"
                    onClick={() => navigate('/risk-dashboard')}
                  >
                    View All {scores.length} Patients
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Panel */}
      {selectedScore && (
        <RiskScoreDetailPanel
          riskScore={selectedScore}
          open={!!selectedScore}
          onOpenChange={(open) => { if (!open) setSelectedScore(null); }}
        />
      )}
    </>
  );
});

export default HighRiskPatientsWidget;