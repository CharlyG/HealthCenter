/**
 * FormSkeleton Component
 * 
 * Skeleton loading state for forms.
 * Part of the Loading States Pattern.
 * 
 * @module UXPatterns/Loading
 */

import { memo } from 'react';
import { SkeletonLoader } from './SkeletonLoader';

export interface FormSkeletonProps {
  /** Number of form fields */
  fields?: number;
  
  /** Show submit button */
  showSubmit?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormSkeleton - Loading state for forms
 */
export const FormSkeleton = memo<FormSkeletonProps>(({
  fields = 5,
  showSubmit = true,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <SkeletonLoader variant="text" width="30%" height={20} />
          <SkeletonLoader variant="rectangle" width="100%" height={40} className="rounded-md" />
        </div>
      ))}

      {showSubmit && (
        <div className="pt-4 flex gap-2">
          <SkeletonLoader variant="button" width={120} />
          <SkeletonLoader variant="button" width={100} />
        </div>
      )}
    </div>
  );
});

FormSkeleton.displayName = 'FormSkeleton';
