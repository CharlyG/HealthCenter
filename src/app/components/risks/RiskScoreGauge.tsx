/**
 * Risk Score Gauge — circular gauge showing overall risk score.
 */
import React from 'react';
import { cn } from '../ui/utils';

interface RiskScoreGaugeProps {
  score: number;
  previousScore?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskScoreGauge = React.memo(function RiskScoreGauge({
  score,
  previousScore,
  size = 'md',
  className,
}: RiskScoreGaugeProps) {
  const sizeMap = { sm: 80, md: 120, lg: 160 };
  const dim = sizeMap[size];
  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const color =
    score >= 70 ? 'text-red-500' :
    score >= 50 ? 'text-orange-500' :
    score >= 30 ? 'text-amber-500' :
    'text-emerald-500';

  const strokeColor =
    score >= 70 ? '#ef4444' :
    score >= 50 ? '#f97316' :
    score >= 30 ? '#f59e0b' :
    '#10b981';

  const delta = previousScore !== undefined ? score - previousScore : undefined;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold', color, size === 'sm' ? 'text-lg' : size === 'md' ? 'text-3xl' : 'text-4xl')}>
            {score}
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Risk Score</span>
          )}
        </div>
      </div>
      {delta !== undefined && (
        <div className={cn(
          'flex items-center gap-1 mt-1.5 text-xs font-medium',
          delta > 0 ? 'text-red-600' : delta < 0 ? 'text-emerald-600' : 'text-gray-500'
        )}>
          <span>{delta > 0 ? '▲' : delta < 0 ? '▼' : '—'}</span>
          <span>{Math.abs(delta)} pts {delta > 0 ? 'increase' : delta < 0 ? 'decrease' : 'no change'}</span>
        </div>
      )}
    </div>
  );
});

export default RiskScoreGauge;
