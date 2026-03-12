/**
 * Design System - Status Badge
 * Standardized status indicators across the application
 * 
 * COMPLIANT WITH:
 * - SCREEN_GENERATION.md - Use semantic tokens
 * - PATTERNS.md - Standard status badges
 * - WCAG 2.1 AA - Color + icon for accessibility
 */
import React from 'react';
import { CheckCircle2, Clock, XCircle, AlertCircle, Circle, Ban } from 'lucide-react';
import { status, textColor, borderRadius, typography } from '../../design-system/semantic/tokens';

export type StatusType = 
  | 'active' | 'inactive' | 'pending' | 'discharged'
  | 'in-progress' | 'completed' | 'cancelled'
  | 'approved' | 'rejected' | 'draft'
  | 'error' | 'warning' | 'success' | 'info'
  | 'default';

interface StatusBadgeProps {
  status: StatusType | string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ReactNode;
}

const statusConfig: Record<string, StatusConfig> = {
  // Clinical/Operational statuses
  active: {
    label: 'Active',
    bg: status.success.bg,
    text: status.success.text,
    border: status.success.border,
    icon: <CheckCircle2 className="size-3" />,
  },
  inactive: {
    label: 'Inactive',
    bg: '#f3f4f6', // neutral[100]
    text: '#6b7280', // neutral[500]
    border: '#e5e7eb', // neutral[200]
    icon: <Circle className="size-3" />,
  },
  pending: {
    label: 'Pending',
    bg: status.warning.bg,
    text: status.warning.text,
    border: status.warning.border,
    icon: <Clock className="size-3" />,
  },
  discharged: {
    label: 'Discharged',
    bg: '#f3f4f6', // neutral[100]
    text: '#6b7280', // neutral[500]
    border: '#e5e7eb', // neutral[200]
    icon: <XCircle className="size-3" />,
  },
  
  // Workflow statuses
  'in-progress': {
    label: 'In Progress',
    bg: status.info.bg,
    text: status.info.text,
    border: status.info.border,
    icon: <Clock className="size-3" />,
  },
  completed: {
    label: 'Completed',
    bg: status.success.bg,
    text: status.success.text,
    border: status.success.border,
    icon: <CheckCircle2 className="size-3" />,
  },
  cancelled: {
    label: 'Cancelled',
    bg: '#f3f4f6', // neutral[100]
    text: '#6b7280', // neutral[500]
    border: '#e5e7eb', // neutral[200]
    icon: <Ban className="size-3" />,
  },
  
  // Approval statuses
  approved: {
    label: 'Approved',
    bg: status.success.bg,
    text: status.success.text,
    border: status.success.border,
    icon: <CheckCircle2 className="size-3" />,
  },
  rejected: {
    label: 'Rejected',
    bg: status.danger.bg,
    text: status.danger.text,
    border: status.danger.border,
    icon: <XCircle className="size-3" />,
  },
  draft: {
    label: 'Draft',
    bg: '#f3f4f6', // neutral[100]
    text: '#6b7280', // neutral[500]
    border: '#e5e7eb', // neutral[200]
    icon: <Circle className="size-3" />,
  },
  
  // Generic statuses
  error: {
    label: 'Error',
    bg: status.danger.bg,
    text: status.danger.text,
    border: status.danger.border,
    icon: <AlertCircle className="size-3" />,
  },
  warning: {
    label: 'Warning',
    bg: status.warning.bg,
    text: status.warning.text,
    border: status.warning.border,
    icon: <AlertCircle className="size-3" />,
  },
  success: {
    label: 'Success',
    bg: status.success.bg,
    text: status.success.text,
    border: status.success.border,
    icon: <CheckCircle2 className="size-3" />,
  },
  info: {
    label: 'Info',
    bg: status.info.bg,
    text: status.info.text,
    border: status.info.border,
    icon: <Circle className="size-3" />,
  },
  default: {
    label: 'Unknown',
    bg: '#f3f4f6', // neutral[100]
    text: '#6b7280', // neutral[500]
    border: '#e5e7eb', // neutral[200]
    icon: <Circle className="size-3" />,
  },
};

export const StatusBadge = React.memo(({ 
  status: statusValue, 
  showIcon = true, 
  size = 'md' 
}: StatusBadgeProps) => {
  const config = statusConfig[statusValue.toLowerCase()] || statusConfig.default;
  
  const sizeConfig = {
    sm: {
      fontSize: typography.helper.size,
      padding: '2px 8px',
    },
    md: {
      fontSize: typography.compactTable.size,
      padding: '2px 10px',
    },
    lg: {
      fontSize: typography.body.size,
      padding: '4px 12px',
    },
  };
  
  const currentSize = sizeConfig[size];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderRadius: borderRadius.default,
        fontSize: currentSize.fontSize,
        fontWeight: 500,
        padding: currentSize.padding,
        whiteSpace: 'nowrap',
      }}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';