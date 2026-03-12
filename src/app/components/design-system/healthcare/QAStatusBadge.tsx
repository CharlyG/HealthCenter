/**
 * Healthcare Design System - QA Status Badge
 * Quality Assurance status indicators
 */
import React from 'react';
import { Badge } from '../../ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Clock, Shield } from 'lucide-react';

export type QAStatus = 'passed' | 'failed' | 'pending' | 'needs_review' | 'exempt';

interface QAStatusBadgeProps {
  status: QAStatus;
  score?: number;
  showIcon?: boolean;
  showScore?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const qaConfig: Record<QAStatus, {
  label: string;
  icon: React.ReactNode;
  className: string;
}> = {
  passed: {
    label: 'QA Passed',
    icon: <CheckCircle2 className="size-3" />,
    className: 'bg-green-50 text-green-700 border-green-200',
  },
  failed: {
    label: 'QA Failed',
    icon: <XCircle className="size-3" />,
    className: 'bg-red-50 text-red-700 border-red-200',
  },
  pending: {
    label: 'QA Pending',
    icon: <Clock className="size-3" />,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  },
  needs_review: {
    label: 'Needs Review',
    icon: <AlertCircle className="size-3" />,
    className: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  exempt: {
    label: 'QA Exempt',
    icon: <Shield className="size-3" />,
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
};

export const QAStatusBadge = React.memo(({
  status,
  score,
  showIcon = true,
  showScore = false,
  size = 'md',
  className = '',
}: QAStatusBadgeProps) => {
  const config = qaConfig[status];
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} font-medium ${className}`}>
      <span className="flex items-center gap-1.5">
        {showIcon && config.icon}
        <span>{config.label}</span>
        {showScore && score !== undefined && (
          <span className="ml-1 font-semibold">({score}%)</span>
        )}
      </span>
    </Badge>
  );
});

QAStatusBadge.displayName = 'QAStatusBadge';