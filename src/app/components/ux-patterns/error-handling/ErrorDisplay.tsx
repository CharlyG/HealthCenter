/**
 * ErrorDisplay Component
 * 
 * Displays errors with clear explanation, what went wrong, and suggested next steps.
 * Part of the Error Handling Pattern for HIPAA-compliant healthcare platform.
 * 
 * Design Principles:
 * - Clear, non-technical language
 * - Actionable next steps
 * - Appropriate visual severity
 * - HIPAA-compliant error messages (no PHI in errors)
 * 
 * @module UXPatterns/ErrorHandling
 */

import { memo } from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export type ErrorSeverity = 'error' | 'warning' | 'info';

export interface ErrorAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface ErrorDisplayProps {
  /** Error title - short, clear explanation */
  title: string;
  
  /** What went wrong - more detailed description */
  description?: string;
  
  /** Suggested next step(s) */
  suggestion?: string;
  
  /** Visual severity level */
  severity?: ErrorSeverity;
  
  /** Actions user can take */
  actions?: ErrorAction[];
  
  /** Optional technical error code for support */
  errorCode?: string;
  
  /** Show/hide component */
  visible?: boolean;
  
  /** Callback when dismissed */
  onDismiss?: () => void;
}

/**
 * ErrorDisplay - Shows user-friendly error messages
 */
export const ErrorDisplay = memo<ErrorDisplayProps>(({
  title,
  description,
  suggestion,
  severity = 'error',
  actions,
  errorCode,
  visible = true,
  onDismiss
}) => {
  if (!visible) return null;

  const severityConfig = {
    error: {
      icon: XCircle,
      bgColor: 'bg-danger-50 dark:bg-danger-900/10',
      borderColor: 'border-danger-200 dark:border-danger-800',
      iconColor: 'text-danger-600 dark:text-danger-400',
      textColor: 'text-danger-900 dark:text-danger-100'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'bg-warning-50 dark:bg-warning-900/10',
      borderColor: 'border-warning-200 dark:border-warning-800',
      iconColor: 'text-warning-600 dark:text-warning-400',
      textColor: 'text-warning-900 dark:text-warning-100'
    },
    info: {
      icon: Info,
      bgColor: 'bg-info-50 dark:bg-info-900/10',
      borderColor: 'border-info-200 dark:border-info-800',
      iconColor: 'text-info-600 dark:text-info-400',
      textColor: 'text-info-900 dark:text-info-100'
    }
  };

  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <div 
      className={`
        rounded-lg border p-4 ${config.bgColor} ${config.borderColor}
        transition-all duration-200
      `}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`text-sm font-semibold ${config.textColor}`}>
            {title}
          </h3>
          
          {/* Description */}
          {description && (
            <p className={`text-sm mt-1 ${config.textColor} opacity-90`}>
              {description}
            </p>
          )}
          
          {/* Suggestion */}
          {suggestion && (
            <div className="mt-2 text-sm">
              <span className={`font-medium ${config.textColor}`}>Next step:</span>
              <span className={`ml-1 ${config.textColor} opacity-90`}>{suggestion}</span>
            </div>
          )}
          
          {/* Error Code */}
          {errorCode && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 font-mono">
              Error Code: {errorCode}
            </p>
          )}
          
          {/* Actions */}
          {actions && actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    px-3 py-1.5 text-sm font-medium rounded-md
                    transition-colors duration-150
                    ${action.variant === 'primary' 
                      ? `bg-${severity === 'error' ? 'danger' : severity === 'warning' ? 'warning' : 'info'}-600 text-white hover:bg-${severity === 'error' ? 'danger' : severity === 'warning' ? 'warning' : 'info'}-700`
                      : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-700'
                    }
                  `}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Dismiss */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${config.iconColor} hover:opacity-75 transition-opacity`}
            aria-label="Dismiss error"
          >
            <XCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';
