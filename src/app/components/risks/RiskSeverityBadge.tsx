/**
 * Risk Severity Badge — small reusable badge for risk levels.
 */
import React from 'react';
import { cn } from '../ui/utils';
import type { RiskSeverity } from '../../lib/riskTypes';

const SEVERITY_STYLES: Record<RiskSeverity, string> = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  high: 'bg-orange-100 text-orange-800 border-orange-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
};

const SEVERITY_DOT: Record<RiskSeverity, string> = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

interface RiskSeverityBadgeProps {
  severity: RiskSeverity;
  className?: string;
  showDot?: boolean;
}

export const RiskSeverityBadge = React.memo(function RiskSeverityBadge({
  severity,
  className,
  showDot = true,
}: RiskSeverityBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize',
      SEVERITY_STYLES[severity],
      className,
    )}>
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', SEVERITY_DOT[severity])} />}
      {severity}
    </span>
  );
});

export default RiskSeverityBadge;
