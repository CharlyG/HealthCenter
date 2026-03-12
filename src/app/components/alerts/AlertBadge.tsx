/**
 * AlertBadge Component
 * Displays alert count badges for use in headers, sidebar, and navigation.
 * Shows severity-coded counts with animated indicators for critical alerts.
 */
import React from 'react';
import { cn } from '../ui/utils';
import type { AlertCounts } from '../../lib/alertTypes';

interface AlertBadgeProps {
  counts: AlertCounts;
  /** Show only the total count */
  compact?: boolean;
  className?: string;
}

export const AlertBadge = React.memo(function AlertBadge({
  counts,
  compact = false,
  className,
}: AlertBadgeProps) {
  if (counts.total === 0) return null;

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
          counts.critical > 0
            ? 'bg-red-600 text-white'
            : counts.high > 0
            ? 'bg-orange-500 text-white'
            : counts.warning > 0
            ? 'bg-yellow-500 text-white'
            : 'bg-blue-500 text-white',
          className
        )}
      >
        {counts.total}
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {counts.critical > 0 && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-red-600 text-white">
          <span className="relative flex size-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex rounded-full size-1.5 bg-white" />
          </span>
          {counts.critical}
        </span>
      )}
      {counts.high > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500 text-white">
          {counts.high}
        </span>
      )}
      {counts.warning > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-yellow-500 text-white">
          {counts.warning}
        </span>
      )}
      {counts.info > 0 && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500 text-white">
          {counts.info}
        </span>
      )}
    </div>
  );
});

export default AlertBadge;
