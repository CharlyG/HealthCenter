/**
 * InsightCard — renders a single AI-generated clinical insight
 * with severity indicator, evidence trail, and suggested action.
 */
import React, { useState } from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import type { ClinicalInsight, InsightSeverity } from '../../lib/clinicalAssistantTypes';
import { INSIGHT_CATEGORY_LABELS } from '../../lib/clinicalAssistantTypes';

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  { icon: React.ElementType; color: string; bgColor: string; borderColor: string; label: string }
> = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Critical',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    label: 'Info',
  },
  positive: {
    icon: CheckCircle2,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    label: 'Positive',
  },
};

interface InsightCardProps {
  insight: ClinicalInsight;
  onNavigate?: (route: string) => void;
  compact?: boolean;
}

export const InsightCard = React.memo(function InsightCard({
  insight,
  onNavigate,
  compact = false,
}: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const sev = SEVERITY_CONFIG[insight.severity];
  const SevIcon = sev.icon;

  return (
    <div
      className={cn(
        'rounded-lg border transition-all',
        sev.borderColor,
        sev.bgColor,
        'hover:shadow-sm'
      )}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <div
            className={cn(
              'w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5',
              insight.severity === 'critical' ? 'bg-red-100' :
              insight.severity === 'warning' ? 'bg-amber-100' :
              insight.severity === 'positive' ? 'bg-emerald-100' :
              'bg-blue-100'
            )}
          >
            <SevIcon className={cn('size-3.5', sev.color)} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={cn('text-sm font-semibold', sev.color)}>
                {insight.title}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge
                variant="outline"
                className="text-[9px] px-1 py-0 h-4 border-0 bg-white/60"
              >
                {INSIGHT_CATEGORY_LABELS[insight.category]}
              </Badge>
              <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                <Sparkles className="size-2.5" />
                {Math.round(insight.confidence * 100)}% confidence
              </span>
            </div>

            {/* Body */}
            <p
              className={cn(
                'text-xs text-gray-700 leading-relaxed',
                compact && !expanded && 'line-clamp-2'
              )}
            >
              {insight.body}
            </p>

            {/* Suggested Action */}
            {insight.suggestedAction && (
              <div className="mt-2 flex items-start gap-1.5 bg-white/60 rounded-md px-2.5 py-1.5">
                <Sparkles className="size-3 text-indigo-500 shrink-0 mt-0.5" />
                <span className="text-[11px] text-indigo-700 font-medium">
                  {insight.suggestedAction}
                </span>
              </div>
            )}

            {/* Evidence (expandable) */}
            {insight.evidence.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {expanded ? (
                    <ChevronUp className="size-3" />
                  ) : (
                    <ChevronDown className="size-3" />
                  )}
                  {insight.evidence.length} supporting factor{insight.evidence.length !== 1 ? 's' : ''}
                </button>
                {expanded && (
                  <ul className="mt-1.5 space-y-0.5 pl-3">
                    {insight.evidence.map((e, i) => (
                      <li
                        key={i}
                        className="text-[10px] text-gray-600 flex items-start gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0 mt-1.5" />
                        {e}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Action button */}
            {insight.actionRoute && onNavigate && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-6 text-[10px] gap-1"
                onClick={() => onNavigate(insight.actionRoute!)}
              >
                <ExternalLink className="size-2.5" />
                Go to Module
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default InsightCard;
