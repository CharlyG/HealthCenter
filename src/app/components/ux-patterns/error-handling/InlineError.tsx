/**
 * InlineError Component
 * 
 * Compact error display for inline use in forms, cards, and small spaces.
 * Part of the Error Handling Pattern.
 * 
 * @module UXPatterns/ErrorHandling
 */

import { memo } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InlineErrorProps {
  /** Error message */
  message: string;
  
  /** Show/hide component */
  visible?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * InlineError - Compact error message for inline use
 */
export const InlineError = memo<InlineErrorProps>(({
  message,
  visible = true,
  className = ''
}) => {
  if (!visible) return null;

  return (
    <div 
      className={`flex items-start gap-1.5 text-danger-600 dark:text-danger-400 ${className}`}
      role="alert"
    >
      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
});

InlineError.displayName = 'InlineError';
