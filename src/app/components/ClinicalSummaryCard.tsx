/**
 * Clinical Summary Card Component
 * 
 * Reusable card component for displaying clinical summary information
 * on the admission dashboard. Shows key metrics, status, warnings, and quick actions.
 */

import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Pill,
  Target,
  Calendar,
  Activity,
  FileText,
  ClipboardCheck,
  Zap,
  Users,
  XCircle,
  BarChart,
  Edit,
  Play,
  UserCheck,
  CheckSquare,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { ClinicalSummaryCard as ClinicalSummaryCardType } from '../services/clinicalSummaryCards';
import { useNavigate } from 'react-router';

// ═══════════════════════════════════════════════════════════════════════════
// ICON MAPPING
// ═══════════════════════════════════════════════════════════════════════════

const ICON_MAP: Record<string, any> = {
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  'check-circle': CheckCircle,
  info: Info,
  eye: Eye,
  'arrow-right': ArrowRight,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  minus: Minus,
  clock: Clock,
  pill: Pill,
  target: Target,
  calendar: Calendar,
  activity: Activity,
  'file-text': FileText,
  'clipboard-check': ClipboardCheck,
  clipboard: ClipboardCheck,
  zap: Zap,
  users: Users,
  'x-circle': XCircle,
  'bar-chart': BarChart,
  edit: Edit,
  play: Play,
  'user-check': UserCheck,
  'check-square': CheckSquare,
};

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const STATUS_CONFIG = {
  success: {
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-900',
    iconColor: 'text-green-600',
  },
  warning: {
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-900',
    iconColor: 'text-amber-600',
  },
  error: {
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-900',
    iconColor: 'text-red-600',
  },
  info: {
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-900',
    iconColor: 'text-blue-600',
  },
};

const SEVERITY_CONFIG = {
  critical: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    badge: 'bg-red-500 text-white',
  },
  high: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    badge: 'bg-orange-500 text-white',
  },
  medium: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    badge: 'bg-amber-500 text-white',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ClinicalSummaryCardProps {
  data: ClinicalSummaryCardType;
  compact?: boolean;
  onAction?: (actionId: string) => void;
}

export default function ClinicalSummaryCard({
  data,
  compact = false,
  onAction,
}: ClinicalSummaryCardProps) {
  const navigate = useNavigate();
  const statusConfig = STATUS_CONFIG[data.status.type];
  const HeaderIcon = ICON_MAP[data.icon] || Activity;

  const handleQuickAction = (action: any) => {
    if (action.route) {
      navigate(action.route);
    } else if (action.action) {
      onAction?.(action.action);
    }
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-lg',
        compact ? 'p-4' : 'p-6'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${data.color}20` }}
          >
            <HeaderIcon className="w-6 h-6" style={{ color: data.color }} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">{data.title}</h3>
            {data.lastUpdated && (
              <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {formatTimeAgo(data.lastUpdated)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      {!compact && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {data.metrics.map(metric => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      )}

      {compact && (
        <div className="flex items-center justify-around mb-4">
          {data.metrics.slice(0, 3).map(metric => (
            <div key={metric.id} className="text-center">
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              <p className="text-xs text-gray-600">{metric.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Status Banner */}
      <div
        className={cn(
          'p-3 rounded-lg border mb-4',
          statusConfig.bgColor,
          statusConfig.borderColor
        )}
      >
        <div className="flex items-start gap-2">
          {data.status.icon && (() => {
            const StatusIcon = ICON_MAP[data.status.icon] || Info;
            return <StatusIcon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', statusConfig.iconColor)} />;
          })()}
          <div className="flex-1">
            <p className={cn('text-sm font-semibold', statusConfig.textColor)}>
              {data.status.label}
            </p>
            <p className={cn('text-xs', statusConfig.textColor)}>{data.status.message}</p>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {data.warnings.length > 0 && !compact && (
        <div className="space-y-2 mb-4">
          {data.warnings.map(warning => {
            const severityConfig = SEVERITY_CONFIG[warning.severity];
            return (
              <div
                key={warning.id}
                className={cn(
                  'p-2 rounded border flex items-center justify-between',
                  severityConfig.bgColor,
                  severityConfig.borderColor
                )}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className={cn('w-4 h-4', severityConfig.color)} />
                  <p className={cn('text-sm font-medium', severityConfig.color)}>
                    {warning.message}
                  </p>
                </div>
                {warning.count && (
                  <Badge className={cn('text-xs', severityConfig.badge)}>
                    {warning.count}
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        {data.quickActions.map((action, idx) => {
          const ActionIcon = ICON_MAP[action.icon] || ArrowRight;
          return (
            <Button
              key={action.id}
              variant={action.variant || (idx === 0 ? 'default' : 'outline')}
              size="sm"
              onClick={() => handleQuickAction(action)}
              className="flex-1"
            >
              <ActionIcon className="w-4 h-4 mr-1.5" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// METRIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  metric: ClinicalSummaryCardType['metrics'][0];
}

function MetricCard({ metric }: MetricCardProps) {
  const Icon = metric.icon ? ICON_MAP[metric.icon] : null;
  const TrendIcon =
    metric.trend === 'up'
      ? TrendingUp
      : metric.trend === 'down'
      ? TrendingDown
      : metric.trend === 'stable'
      ? Minus
      : null;

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-600">{metric.label}</p>
        {Icon && (
          <Icon
            className="w-4 h-4"
            style={{ color: metric.color || '#6B7280' }}
          />
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <p
          className="text-2xl font-bold"
          style={{ color: metric.color || '#111827' }}
        >
          {metric.value}
        </p>
        {metric.trend && TrendIcon && (
          <div
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              metric.trend === 'up' && 'text-red-600',
              metric.trend === 'down' && 'text-green-600',
              metric.trend === 'stable' && 'text-gray-600'
            )}
          >
            <TrendIcon className="w-3 h-3" />
            {metric.trendValue}
          </div>
        )}
      </div>
      {metric.subtext && (
        <p className="text-xs text-gray-600 mt-1">{metric.subtext}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT CARD VARIANT
// ═══════════════════════════════════════════════════════════════════════════

export function CompactClinicalSummaryCard({
  data,
  onAction,
}: ClinicalSummaryCardProps) {
  return <ClinicalSummaryCard data={data} compact onAction={onAction} />;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
