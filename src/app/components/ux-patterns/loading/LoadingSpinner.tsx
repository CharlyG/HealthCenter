/**
 * LoadingSpinner Component
 * 
 * Spinner for loading states (use sparingly, prefer skeletons).
 * Part of the Loading States Pattern.
 * 
 * @module UXPatterns/Loading
 */

import { memo } from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingSpinnerProps {
  /** Size of spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /** Loading message */
  message?: string;
  
  /** Center spinner */
  centered?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * LoadingSpinner - Animated loading spinner
 */
export const LoadingSpinner = memo<LoadingSpinnerProps>(({
  size = 'md',
  message,
  centered = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const content = (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-primary-600 dark:text-primary-400`}
      />
      {message && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {message}
        </p>
      )}
    </div>
  );

  if (centered) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        {content}
      </div>
    );
  }

  return content;
});

LoadingSpinner.displayName = 'LoadingSpinner';
