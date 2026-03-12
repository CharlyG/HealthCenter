/**
 * FormField Component
 * 
 * Form field wrapper with inline validation support.
 * Part of the Inline Validation Pattern.
 * 
 * Validation occurs:
 * - On blur (when user leaves field)
 * - On submit (when form is submitted)
 * 
 * @module UXPatterns/Validation
 */

import { memo, ReactNode, useId } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface FormFieldProps {
  /** Field label */
  label: string;
  
  /** Field input element */
  children: ReactNode;
  
  /** Validation error message */
  error?: string;
  
  /** Success message (optional) */
  success?: string;
  
  /** Helper text shown below field */
  helperText?: string;
  
  /** Mark field as required */
  required?: boolean;
  
  /** Show validation state visually */
  showValidationState?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** HTML id for the input (auto-generated if not provided) */
  htmlFor?: string;
}

/**
 * FormField - Field wrapper with validation display
 */
export const FormField = memo<FormFieldProps>(({
  label,
  children,
  error,
  success,
  helperText,
  required = false,
  showValidationState = true,
  className = '',
  htmlFor
}) => {
  const autoId = useId();
  const fieldId = htmlFor || autoId;
  
  const hasError = !!error;
  const hasSuccess = !!success && !hasError;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      <label 
        htmlFor={fieldId}
        className="block text-sm font-medium text-neutral-900 dark:text-neutral-100"
      >
        {label}
        {required && (
          <span className="text-danger-600 dark:text-danger-400 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {/* Input with validation wrapper */}
      <div className="relative">
        {children}
        
        {/* Validation icon */}
        {showValidationState && (hasError || hasSuccess) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {hasError && (
              <AlertCircle className="w-5 h-5 text-danger-600 dark:text-danger-400" />
            )}
            {hasSuccess && (
              <CheckCircle2 className="w-5 h-5 text-success-600 dark:text-success-400" />
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <div 
          className="flex items-start gap-1.5 text-danger-600 dark:text-danger-400"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Success message */}
      {hasSuccess && (
        <div className="flex items-start gap-1.5 text-success-600 dark:text-success-400">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Helper text */}
      {helperText && !hasError && !hasSuccess && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';
