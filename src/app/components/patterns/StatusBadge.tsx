/**
 * Status Badge System
 * 
 * Consistent status badge components across the platform.
 * Never relies on color alone (includes icons/text for accessibility).
 * 
 * Statuses:
 * - Draft, In Progress, Completed, Submitted
 * - Approved, Returned, Blocked, Signed, Pending
 * - Active, Inactive, Expired, Scheduled
 * - And more...
 * 
 * Accessibility:
 * - WCAG AA compliant
 * - Icon + text for color-blind users
 * - Proper contrast ratios
 */

import { memo, ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { 
  FileText,
  Clock,
  CheckCircle,
  Send,
  ThumbsUp,
  RotateCcw,
  Ban,
  FileSignature,
  AlertTriangle,
  Circle,
  XCircle,
  Calendar,
  Pause,
  Play,
  Archive,
} from 'lucide-react';
import { cn } from '../ui/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type StatusType =
  // Document/Workflow statuses
  | 'draft'
  | 'in-progress'
  | 'completed'
  | 'submitted'
  | 'approved'
  | 'returned'
  | 'blocked'
  | 'signed'
  | 'pending'
  // General statuses
  | 'active'
  | 'inactive'
  | 'expired'
  | 'scheduled'
  | 'cancelled'
  | 'on-hold'
  | 'archived'
  // Clinical statuses
  | 'admitted'
  | 'discharged'
  | 'transferred'
  // Custom
  | 'custom';

interface StatusConfig {
  label: string;
  icon: typeof FileText;
  color: string;
  bg: string;
  border: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface StatusBadgeProps {
  /** Status type */
  status: StatusType;
  
  /** Custom label (overrides default) */
  label?: string;
  
  /** Custom icon (overrides default) */
  icon?: ReactNode;
  
  /** Show icon */
  showIcon?: boolean;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Dot indicator instead of icon */
  dot?: boolean;
  
  /** Pulsing animation for active statuses */
  pulse?: boolean;
  
  /** Custom className */
  className?: string;
  
  /** Click handler */
  onClick?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// STATUS CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

const statusConfigs: Record<StatusType, StatusConfig> = {
  // Document/Workflow
  draft: {
    label: 'Draft',
    icon: FileText,
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    variant: 'secondary',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    variant: 'default',
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle,
    color: 'text-green-700',
    bg: 'bg-green-100',
    border: 'border-green-300',
    variant: 'outline',
  },
  submitted: {
    label: 'Submitted',
    icon: Send,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    variant: 'outline',
  },
  approved: {
    label: 'Approved',
    icon: ThumbsUp,
    color: 'text-green-700',
    bg: 'bg-green-100',
    border: 'border-green-300',
    variant: 'outline',
  },
  returned: {
    label: 'Returned',
    icon: RotateCcw,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    variant: 'outline',
  },
  blocked: {
    label: 'Blocked',
    icon: Ban,
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-300',
    variant: 'destructive',
  },
  signed: {
    label: 'Signed',
    icon: FileSignature,
    color: 'text-indigo-700',
    bg: 'bg-indigo-100',
    border: 'border-indigo-300',
    variant: 'outline',
  },
  pending: {
    label: 'Pending',
    icon: AlertTriangle,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    variant: 'secondary',
  },

  // General
  active: {
    label: 'Active',
    icon: Circle,
    color: 'text-green-700',
    bg: 'bg-green-100',
    border: 'border-green-300',
    variant: 'default',
  },
  inactive: {
    label: 'Inactive',
    icon: Circle,
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    variant: 'secondary',
  },
  expired: {
    label: 'Expired',
    icon: XCircle,
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-300',
    variant: 'destructive',
  },
  scheduled: {
    label: 'Scheduled',
    icon: Calendar,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    variant: 'outline',
  },
  cancelled: {
    label: 'Cancelled',
    icon: XCircle,
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-300',
    variant: 'outline',
  },
  'on-hold': {
    label: 'On Hold',
    icon: Pause,
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    border: 'border-amber-300',
    variant: 'secondary',
  },
  archived: {
    label: 'Archived',
    icon: Archive,
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    variant: 'secondary',
  },

  // Clinical
  admitted: {
    label: 'Admitted',
    icon: Play,
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-300',
    variant: 'default',
  },
  discharged: {
    label: 'Discharged',
    icon: CheckCircle,
    color: 'text-green-700',
    bg: 'bg-green-100',
    border: 'border-green-300',
    variant: 'outline',
  },
  transferred: {
    label: 'Transferred',
    icon: Send,
    color: 'text-purple-700',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    variant: 'outline',
  },

  // Custom (use with custom props)
  custom: {
    label: 'Custom',
    icon: Circle,
    color: 'text-gray-700',
    bg: 'bg-gray-100',
    border: 'border-gray-300',
    variant: 'secondary',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const StatusBadge = memo(function StatusBadge({
  status,
  label: customLabel,
  icon: customIcon,
  showIcon = true,
  size = 'md',
  dot = false,
  pulse = false,
  className,
  onClick,
}: StatusBadgeProps) {
  const config = statusConfigs[status];
  const Icon = config.icon;
  const label = customLabel || config.label;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-all',
        config.bg,
        config.border,
        config.color,
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80',
        !onClick && 'cursor-default',
        className
      )}
    >
      {/* Icon or Dot */}
      {dot ? (
        <span
          className={cn(
            'rounded-full',
            size === 'sm' && 'w-1.5 h-1.5',
            size === 'md' && 'w-2 h-2',
            size === 'lg' && 'w-2.5 h-2.5',
            config.color.replace('text-', 'bg-'),
            pulse && 'animate-pulse'
          )}
        />
      ) : showIcon && (customIcon || Icon) ? (
        <span className={cn('flex-shrink-0', pulse && 'animate-pulse')}>
          {customIcon || <Icon className={iconSizes[size]} />}
        </span>
      ) : null}

      {/* Label */}
      <span>{label}</span>
    </button>
  );
});

// ═══════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

// Status Badge Group - for displaying multiple related statuses
interface StatusBadgeGroupProps {
  statuses: Array<{
    status: StatusType;
    label?: string;
    count?: number;
  }>;
  size?: 'sm' | 'md' | 'lg';
  onStatusClick?: (status: StatusType) => void;
}

export const StatusBadgeGroup = memo(function StatusBadgeGroup({
  statuses,
  size = 'md',
  onStatusClick,
}: StatusBadgeGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {statuses.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <StatusBadge
            status={item.status}
            label={item.label}
            size={size}
            onClick={onStatusClick ? () => onStatusClick(item.status) : undefined}
          />
          {item.count !== undefined && (
            <span className="text-xs text-gray-600 font-medium">
              ({item.count})
            </span>
          )}
        </div>
      ))}
    </div>
  );
});

// Status Indicator - minimal dot indicator for space-constrained areas
interface StatusIndicatorProps {
  status: StatusType;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
}

export const StatusIndicator = memo(function StatusIndicator({
  status,
  label: customLabel,
  showLabel = true,
  size = 'md',
  pulse = false,
}: StatusIndicatorProps) {
  const config = statusConfigs[status];
  const label = customLabel || config.label;

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={cn(
          'rounded-full flex-shrink-0',
          dotSizes[size],
          config.color.replace('text-', 'bg-'),
          pulse && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className={cn('font-medium', config.color, textSizes[size])}>
          {label}
        </span>
      )}
    </div>
  );
});

StatusBadge.displayName = 'StatusBadge';
StatusBadgeGroup.displayName = 'StatusBadgeGroup';
StatusIndicator.displayName = 'StatusIndicator';

export default StatusBadge;

// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE USAGE
// ═══════════════════════════════════════════════════════════════════════════

/*
// Single Badge
<StatusBadge status="in-progress" />
<StatusBadge status="approved" size="lg" />
<StatusBadge status="pending" dot pulse />
<StatusBadge status="signed" onClick={() => viewDocument()} />

// Custom Badge
<StatusBadge
  status="custom"
  label="Under Review"
  icon={<Eye className="w-3.5 h-3.5" />}
  className="bg-purple-100 text-purple-700 border-purple-300"
/>

// Badge Group
<StatusBadgeGroup
  statuses={[
    { status: 'draft', count: 5 },
    { status: 'submitted', count: 12 },
    { status: 'approved', count: 45 },
  ]}
  onStatusClick={(status) => filterByStatus(status)}
/>

// Status Indicator (minimal)
<StatusIndicator status="active" pulse />
<StatusIndicator status="expired" showLabel size="sm" />
*/
