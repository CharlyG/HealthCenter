/**
 * Operational Insight Card — actionable insight with navigation.
 */
import React from 'react';
import { cn } from '../ui/utils';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { OperationalInsight } from '../../lib/riskTypes';
import {
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Bell,
  ArrowRight,
} from 'lucide-react';

const INSIGHT_CONFIG = {
  trend: { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
  anomaly: { icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200' },
  recommendation: { icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
  alert: { icon: Bell, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-200' },
};

interface OperationalInsightCardProps {
  insight: OperationalInsight;
  onAction?: (route: string) => void;
}

export const OperationalInsightCard = React.memo(function OperationalInsightCard({
  insight,
  onAction,
}: OperationalInsightCardProps) {
  const config = INSIGHT_CONFIG[insight.type];
  const Icon = config.icon;

  return (
    <Card className={cn('border', config.border, 'transition-all hover:shadow-sm')}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
            <Icon className={cn('size-4', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-semibold text-gray-900">{insight.title}</h4>
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize shrink-0',
                insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                insight.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-gray-100 text-gray-600',
              )}>
                {insight.impact}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2 leading-relaxed">{insight.description}</p>

            {insight.metricValue !== undefined && (
              <div className="inline-flex items-center gap-1.5 bg-gray-50 rounded px-2 py-1 mb-2">
                <span className="text-[10px] text-gray-500">{insight.metric}:</span>
                <span className="text-xs font-bold text-gray-900">
                  {insight.metricUnit === 'USD' ? `$${insight.metricValue.toLocaleString()}` : insight.metricValue}
                </span>
              </div>
            )}

            {insight.actionLabel && insight.actionRoute && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 px-2 -ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => onAction?.(insight.actionRoute!)}
              >
                {insight.actionLabel}
                <ArrowRight className="size-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default OperationalInsightCard;
