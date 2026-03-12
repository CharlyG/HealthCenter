/**
 * CardSkeleton Component
 * 
 * Skeleton loading state for cards.
 * Part of the Loading States Pattern.
 * 
 * @module UXPatterns/Loading
 */

import { memo } from 'react';
import { SkeletonLoader } from './SkeletonLoader';

export interface CardSkeletonProps {
  /** Show avatar/icon */
  showAvatar?: boolean;
  
  /** Number of text lines */
  lines?: number;
  
  /** Show action buttons */
  showActions?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * CardSkeleton - Loading state for cards
 */
export const CardSkeleton = memo<CardSkeletonProps>(({
  showAvatar = false,
  lines = 3,
  showActions = false,
  className = ''
}) => {
  return (
    <div className={`
      bg-white dark:bg-neutral-900 
      border border-neutral-200 dark:border-neutral-700 
      rounded-lg p-4 space-y-3
      ${className}
    `}>
      {/* Header with optional avatar */}
      <div className="flex items-start gap-3">
        {showAvatar && (
          <SkeletonLoader variant="circle" width={40} height={40} />
        )}
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="title" width="60%" />
          <SkeletonLoader variant="text" width="40%" />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonLoader
            key={index}
            variant="text"
            width={index === lines - 1 ? '70%' : '100%'}
          />
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-2">
          <SkeletonLoader variant="button" width={100} />
          <SkeletonLoader variant="button" width={100} />
        </div>
      )}
    </div>
  );
});

CardSkeleton.displayName = 'CardSkeleton';
