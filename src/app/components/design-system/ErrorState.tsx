/**
 * Healthcare Design System - Error State Component
 */
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const ErrorState = React.memo(({
  title = 'Error',
  message,
  action,
  className = '',
}: ErrorStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <div className="mb-4 text-red-600">
        <AlertCircle className="size-12" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant="outline">
          {action.label}
        </Button>
      )}
    </div>
  );
});

ErrorState.displayName = 'ErrorState';
