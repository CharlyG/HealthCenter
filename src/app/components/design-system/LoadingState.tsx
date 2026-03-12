/**
 * Healthcare Design System - Loading State Component
 */
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = React.memo(({
  message = 'Loading...',
  className = '',
}: LoadingStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
      <Loader2 className="size-8 text-blue-600 animate-spin mb-4" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  );
});

LoadingState.displayName = 'LoadingState';
