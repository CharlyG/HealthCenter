/**
 * SectionProgress — Section header with inline progress indicator.
 * Shows required field count, completion status, and incomplete field warnings.
 */
import React from 'react';
import { cn } from '../ui/utils';
import { Badge } from '../ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { SectionProgressData } from '../../lib/documentationTypes';

interface SectionProgressProps {
  title: string;
  description: string;
  progress: SectionProgressData | undefined;
  isActive: boolean;
  showValidation: boolean;
}

export const SectionProgress = React.memo(function SectionProgress({
  title,
  description,
  progress,
  isActive,
  showValidation,
}: SectionProgressProps) {
  const sp = progress;
  const isComplete = sp?.complete ?? false;
  const hasMissing = sp && sp.requiredFilled < sp.requiredTotal;
  const pct = sp && sp.requiredTotal > 0
    ? Math.round((sp.requiredFilled / sp.requiredTotal) * 100)
    : 0;

  return (
    <div className={cn(
      'flex items-start justify-between pb-3 mb-4 border-b',
      isActive ? 'border-blue-200' : 'border-gray-200'
    )}>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {isComplete && (
            <CheckCircle2 className="size-4.5 text-emerald-500" />
          )}
          {showValidation && hasMissing && !isComplete && (
            <AlertCircle className="size-4.5 text-amber-500" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>

      {sp && (
        <div className="flex items-center gap-2 shrink-0">
          {/* Numeric badge */}
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] h-5 px-1.5',
              isComplete
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : hasMissing && showValidation
                ? 'bg-amber-50 border-amber-200 text-amber-700'
                : 'bg-gray-50 border-gray-200 text-gray-600'
            )}
          >
            {sp.requiredFilled}/{sp.requiredTotal} required
          </Badge>
          {/* Micro progress */}
          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isComplete ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-400'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
});

export default SectionProgress;
