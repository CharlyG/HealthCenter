/**
 * RecurrenceBadge
 * Visual indicator shown on visit cards/rows that belong to a recurrence series.
 * Shows a repeating icon and "X of Y" label with a tooltip.
 */
import { Repeat } from 'lucide-react';
import { Badge } from '../ui/badge';

interface RecurrenceBadgeProps {
  recurrenceIndex: number;
  recurrenceTotal: number;
  /** Compact mode for small cards (calendar week/month cells) */
  compact?: boolean;
  className?: string;
}

export default function RecurrenceBadge({
  recurrenceIndex,
  recurrenceTotal,
  compact = false,
  className = '',
}: RecurrenceBadgeProps) {
  if (compact) {
    return (
      <span
        className={`inline-flex items-center text-indigo-600 ${className}`}
        title={`Recurring: Visit ${recurrenceIndex + 1} of ${recurrenceTotal}`}
      >
        <Repeat className="size-3" />
      </span>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 h-5 border-indigo-200 bg-indigo-50 text-indigo-700 gap-1 ${className}`}
      title={`This visit is part of a recurring series (${recurrenceIndex + 1} of ${recurrenceTotal})`}
    >
      <Repeat className="size-3" />
      <span>{recurrenceIndex + 1}/{recurrenceTotal}</span>
    </Badge>
  );
}
