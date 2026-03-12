/**
 * Healthcare Design System - Empty State Component
 */
import React from 'react';
import { Button } from '../ui/button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState = React.memo(({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.icon}
          {action.icon && <span className="ml-2">{action.label}</span>}
          {!action.icon && action.label}
        </Button>
      )}
    </div>
  );
});

EmptyState.displayName = 'EmptyState';