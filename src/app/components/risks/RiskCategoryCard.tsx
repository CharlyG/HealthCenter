/**
 * Risk Category Card — summary card for each risk category.
 */
import React from 'react';
import { cn } from '../ui/utils';
import { Card, CardContent } from '../ui/card';
import type { RiskCategorySummary, RiskCategory } from '../../lib/riskTypes';
import {
  Activity,
  CalendarX,
  UserX,
  FileWarning,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

const CATEGORY_CONFIG: Record<RiskCategory, {
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  bgColor: string;
}> = {
  hospitalization: {
    icon: Activity,
    gradient: 'from-red-500 to-rose-600',
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  missed_visits: {
    icon: CalendarX,
    gradient: 'from-orange-500 to-amber-600',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  caregiver_reliability: {
    icon: UserX,
    gradient: 'from-purple-500 to-violet-600',
    iconColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  missing_documentation: {
    icon: FileWarning,
    gradient: 'from-amber-500 to-yellow-600',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
  },
  claim_rejection: {
    icon: DollarSign,
    gradient: 'from-blue-500 to-indigo-600',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  expiring_authorization: {
    icon: Clock,
    gradient: 'from-teal-500 to-cyan-600',
    iconColor: 'text-teal-600',
    bgColor: 'bg-teal-50',
  },
};

interface RiskCategoryCardProps {
  summary: RiskCategorySummary;
  isSelected: boolean;
  onClick: () => void;
}

export const RiskCategoryCard = React.memo(function RiskCategoryCard({
  summary,
  isSelected,
  onClick,
}: RiskCategoryCardProps) {
  const config = CATEGORY_CONFIG[summary.category];
  const Icon = config.icon;
  const TrendIcon = summary.trend === 'increasing' ? TrendingUp : summary.trend === 'decreasing' ? TrendingDown : Minus;
  const trendColor = summary.trend === 'increasing' ? 'text-red-600' : summary.trend === 'decreasing' ? 'text-emerald-600' : 'text-gray-500';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'ring-2 ring-blue-500 shadow-md',
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br', config.gradient)}>
            <Icon className="size-5 text-white" />
          </div>
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon className="size-3" />
            <span>{Math.abs(summary.trendPct)}%</span>
          </div>
        </div>
        <div className="text-sm font-semibold text-gray-900 mb-1 leading-tight">{summary.label}</div>
        <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
        <div className="flex items-center gap-2 mt-2">
          {summary.critical > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 rounded px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {summary.critical}
            </span>
          )}
          {summary.high > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-700 bg-orange-100 rounded px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              {summary.high}
            </span>
          )}
          {summary.medium > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              {summary.medium}
            </span>
          )}
          {summary.low > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {summary.low}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default RiskCategoryCard;
