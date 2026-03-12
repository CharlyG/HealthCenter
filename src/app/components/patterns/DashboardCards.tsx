/**
 * Dashboard Card System
 * 
 * Reusable card components for consistent dashboard layouts.
 * Supports metric cards, queue cards, summary cards, alert cards, insight cards.
 * 
 * Use Cases:
 * - Workspace dashboards
 * - Admission dashboards
 * - Command center pages
 * - Analytics views
 * 
 * Performance:
 * - Memoized components
 * - Lazy icon loading
 * - Optimized rendering
 */

import { memo, ReactNode } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// METRIC CARD
// ═══════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  /** Card title */
  title: string;
  
  /** Primary metric value */
  value: string | number;
  
  /** Metric unit/suffix */
  unit?: string;
  
  /** Trend indicator */
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
  
  /** Icon */
  icon?: ReactNode;
  
  /** Status color */
  status?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  
  /** Click handler */
  onClick?: () => void;
  
  /** Loading state */
  loading?: boolean;
  
  /** Compact mode */
  compact?: boolean;
}

export const MetricCard = memo(function MetricCard({
  title,
  value,
  unit,
  trend,
  icon,
  status = 'neutral',
  onClick,
  loading = false,
  compact = false,
}: MetricCardProps) {
  const statusColors = {
    success: 'border-green-200 bg-green-50',
    warning: 'border-amber-200 bg-amber-50',
    danger: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
    neutral: 'border-gray-200 bg-white',
  };

  const statusTextColors = {
    success: 'text-green-900',
    warning: 'text-amber-900',
    danger: 'text-red-900',
    info: 'text-blue-900',
    neutral: 'text-gray-900',
  };

  const trendIcons = {
    up: ArrowUp,
    down: ArrowDown,
    neutral: Minus,
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600',
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick || loading}
      className={cn(
        'w-full text-left rounded-lg border transition-all',
        statusColors[status],
        onClick && !loading && 'hover:shadow-md cursor-pointer',
        !onClick && 'cursor-default',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
            {title}
          </div>
          
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
          ) : (
            <div className={cn('text-3xl font-bold', statusTextColors[status])}>
              {typeof value === 'number' ? value.toLocaleString() : value}
              {unit && <span className="text-lg ml-1">{unit}</span>}
            </div>
          )}

          {trend && !loading && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trendColors[trend.direction]
            )}>
              {React.createElement(trendIcons[trend.direction], { className: 'w-3 h-3' })}
              <span>{trend.value}</span>
              {trend.label && (
                <span className="text-gray-600 ml-1">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {icon && !loading && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </button>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// QUEUE CARD
// ═══════════════════════════════════════════════════════════════════════════

interface QueueCardProps {
  /** Queue title */
  title: string;
  
  /** Queue count */
  count: number;
  
  /** Short description */
  description?: string;
  
  /** Priority breakdown */
  priority?: {
    critical?: number;
    high?: number;
    medium?: number;
    low?: number;
  };
  
  /** Icon */
  icon?: ReactNode;
  
  /** Quick action */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Click handler for entire card */
  onClick?: () => void;
  
  /** Loading state */
  loading?: boolean;
}

export const QueueCard = memo(function QueueCard({
  title,
  count,
  description,
  priority,
  icon,
  action,
  onClick,
  loading = false,
}: QueueCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-4 transition-all',
        onClick && !loading && 'hover:shadow-md cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1">
          {icon && (
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            {description && (
              <p className="text-xs text-gray-600">{description}</p>
            )}
          </div>
        </div>

        <Badge variant={count > 0 ? 'default' : 'secondary'} className="text-lg px-3 py-1">
          {loading ? '...' : count}
        </Badge>
      </div>

      {priority && !loading && (
        <div className="flex items-center gap-2 mb-3">
          {priority.critical !== undefined && priority.critical > 0 && (
            <Badge variant="destructive" className="text-xs">
              {priority.critical} Critical
            </Badge>
          )}
          {priority.high !== undefined && priority.high > 0 && (
            <Badge className="text-xs bg-orange-600">
              {priority.high} High
            </Badge>
          )}
          {priority.medium !== undefined && priority.medium > 0 && (
            <Badge variant="secondary" className="text-xs">
              {priority.medium} Medium
            </Badge>
          )}
        </div>
      )}

      {action && !loading && (
        <Button
          size="sm"
          variant="outline"
          className="w-full justify-between"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
        >
          {action.label}
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// SUMMARY CARD
// ═══════════════════════════════════════════════════════════════════════════

interface SummaryCardProps {
  /** Card title */
  title: string;
  
  /** Summary items */
  items: Array<{
    label: string;
    value: string | number;
    status?: 'success' | 'warning' | 'danger' | 'neutral';
  }>;
  
  /** Icon */
  icon?: ReactNode;
  
  /** Footer action */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Click handler */
  onClick?: () => void;
}

export const SummaryCard = memo(function SummaryCard({
  title,
  items,
  icon,
  action,
  onClick,
}: SummaryCardProps) {
  const statusTextColors = {
    success: 'text-green-700',
    warning: 'text-amber-700',
    danger: 'text-red-700',
    neutral: 'text-gray-900',
  };

  return (
    <div
      className={cn(
        'bg-white rounded-lg border p-4 transition-all',
        onClick && 'hover:shadow-md cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-4">
        {icon && (
          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span className={cn(
              'text-sm font-semibold',
              statusTextColors[item.status || 'neutral']
            )}>
              {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
            </span>
          </div>
        ))}
      </div>

      {action && (
        <div className="mt-4 pt-4 border-t">
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-between"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick();
            }}
          >
            {action.label}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// ALERT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface AlertCardProps {
  /** Alert title */
  title: string;
  
  /** Alert message */
  message: string;
  
  /** Alert type */
  type: 'critical' | 'warning' | 'info';
  
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Dismiss handler */
  onDismiss?: () => void;
  
  /** Timestamp */
  timestamp?: string;
}

export const AlertCard = memo(function AlertCard({
  title,
  message,
  type,
  action,
  onDismiss,
  timestamp,
}: AlertCardProps) {
  const typeConfig = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      textColor: 'text-red-900',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-lg border p-4', config.bg, config.border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', config.iconColor)} />
        
        <div className="flex-1 min-w-0">
          <h3 className={cn('font-semibold text-sm mb-1', config.textColor)}>
            {title}
          </h3>
          <p className="text-sm text-gray-700 mb-2">
            {message}
          </p>
          
          {timestamp && (
            <p className="text-xs text-gray-600 mb-3">
              {timestamp}
            </p>
          )}

          {action && (
            <Button
              size="sm"
              variant="outline"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-1 rounded hover:bg-white/50 transition-colors"
            aria-label="Dismiss"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// INSIGHT CARD
// ═══════════════════════════════════════════════════════════════════════════

interface InsightCardProps {
  /** Insight title */
  title: string;
  
  /** Primary value */
  value: string | number;
  
  /** Insight description */
  description: string;
  
  /** Trend */
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  
  /** Icon */
  icon?: ReactNode;
  
  /** Action */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Variant */
  variant?: 'default' | 'success' | 'warning';
}

export const InsightCard = memo(function InsightCard({
  title,
  value,
  description,
  trend,
  icon,
  action,
  variant = 'default',
}: InsightCardProps) {
  const variantColors = {
    default: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-amber-200 bg-amber-50',
  };

  const variantTextColors = {
    default: 'text-blue-900',
    success: 'text-green-900',
    warning: 'text-amber-900',
  };

  return (
    <div className={cn('rounded-lg border p-4', variantColors[variant])}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}

        <div className="flex-1">
          <div className="text-xs font-semibold text-gray-600 uppercase mb-1">
            {title}
          </div>
          
          <div className={cn('text-2xl font-bold mb-1', variantTextColors[variant])}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>

          {trend && (
            <div className={cn(
              'flex items-center gap-1 mb-2 text-xs font-medium',
              trend.direction === 'up' ? 'text-green-600' :
              trend.direction === 'down' ? 'text-red-600' :
              'text-gray-600'
            )}>
              {trend.direction === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend.direction === 'down' && <TrendingDown className="w-3 h-3" />}
              <span>{trend.value}</span>
            </div>
          )}

          <p className="text-sm text-gray-700 mb-3">
            {description}
          </p>

          {action && (
            <Button
              size="sm"
              variant="outline"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

// Export all cards
export default {
  MetricCard,
  QueueCard,
  SummaryCard,
  AlertCard,
  InsightCard,
};
