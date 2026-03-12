/**
 * System-wide Interaction Rules
 * 
 * Defines consistent interaction patterns across the platform.
 * 
 * Rules:
 * 1. Save Behavior - Auto-save vs manual save patterns
 * 2. Navigation Patterns - Consistent routing and navigation
 * 3. Error Handling - Uniform error display and recovery
 * 4. Confirmation Dialogs - Standard confirmation flows
 * 5. Notifications - Toast/alert patterns
 * 
 * This module provides utilities and components that enforce
 * consistent behavior across all features.
 * 
 * @example
 * ```tsx
 * // Use consistent save behavior
 * <FormWithAutoSave
 *   onSave={handleSave}
 *   debounceMs={2000}
 * >
 *   {form content}
 * </FormWithAutoSave>
 * 
 * // Use standard confirmation dialog
 * const { confirm } = useConfirmation();
 * await confirm({
 *   title: 'Delete patient?',
 *   message: 'This action cannot be undone',
 *   confirmLabel: 'Delete',
 *   confirmVariant: 'danger'
 * });
 * ```
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

// ==================== INTERACTION RULES DOCUMENTATION ====================

/**
 * RULE 1: SAVE BEHAVIOR
 * 
 * - Forms with <5 fields: Manual save with "Save" button
 * - Forms with 5+ fields: Auto-save with debounce (2s default)
 * - Always show save status indicator
 * - Provide undo option for auto-saved changes
 * - Show "Saving..." → "Saved" → "Error" states clearly
 */

/**
 * RULE 2: NAVIGATION PATTERNS
 * 
 * - Use React Router for all navigation
 * - Preserve scroll position on back navigation
 * - Show loading state during route transitions
 * - Breadcrumbs for hierarchical navigation
 * - Tab navigation persists in URL
 */

/**
 * RULE 3: ERROR HANDLING
 * 
 * - Inline errors for form validation
 * - Toast notifications for operation failures
 * - Error boundaries for component crashes
 * - Retry buttons for network failures
 * - Clear error messages (no tech jargon)
 */

/**
 * RULE 4: CONFIRMATION DIALOGS
 * 
 * - Destructive actions require confirmation
 * - Non-destructive actions skip confirmation
 * - Confirmation shows what will happen
 * - Primary action on the right
 * - Escape key dismisses dialog
 */

/**
 * RULE 5: NOTIFICATIONS
 * 
 * - Success: Auto-dismiss after 3s
 * - Info: Auto-dismiss after 5s
 * - Warning: Manual dismiss
 * - Error: Manual dismiss + retry option
 * - Max 3 toasts visible simultaneously
 */

// ==================== CONFIRMATION DIALOG ====================

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  icon?: 'warning' | 'info' | 'question';
}

interface ConfirmationContextValue {
  confirm: (options: ConfirmationOptions) => Promise<boolean>;
}

const ConfirmationContext = createContext<ConfirmationContextValue | null>(null);

export const useConfirmation = () => {
  const context = useContext(ConfirmationContext);
  if (!context) {
    throw new Error('useConfirmation must be used within ConfirmationProvider');
  }
  return context;
};

interface ConfirmationState extends ConfirmationOptions {
  isOpen: boolean;
  resolve: (value: boolean) => void;
}

export const ConfirmationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ConfirmationState | null>(null);

  const confirm = useCallback((options: ConfirmationOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        isOpen: true,
        resolve
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    if (state) {
      state.resolve(true);
      setState(null);
    }
  }, [state]);

  const handleCancel = useCallback(() => {
    if (state) {
      state.resolve(false);
      setState(null);
    }
  }, [state]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state?.isOpen) {
        handleCancel();
      }
    };

    if (state?.isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [state, handleCancel]);

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      
      {state?.isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleCancel}
          />
          
          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex gap-4">
                {state.icon && (
                  <div className="flex-shrink-0">
                    {state.icon === 'warning' && (
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                      </div>
                    )}
                    {state.icon === 'info' && (
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Info className="w-6 h-6 text-blue-600" />
                      </div>
                    )}
                    {state.icon === 'question' && (
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">?</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {state.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {state.message}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-medium transition-colors"
                >
                  {state.cancelLabel || 'Cancel'}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    state.confirmVariant === 'danger'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {state.confirmLabel || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </ConfirmationContext.Provider>
  );
};

// ==================== SAVE STATUS INDICATOR ====================

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  errorMessage?: string;
  compact?: boolean;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({
  status,
  errorMessage,
  compact = false
}) => {
  if (status === 'idle') {
    return null;
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs">
        {status === 'saving' && (
          <>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-gray-600">Saving...</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <CheckCircle className="w-3 h-3 text-green-600" />
            <span className="text-green-600">Saved</span>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-3 h-3 text-red-600" />
            <span className="text-red-600">Error</span>
          </>
        )}
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
      {status === 'saving' && (
        <>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-gray-700">Saving changes...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-medium">All changes saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-red-600 font-medium">
            {errorMessage || 'Failed to save'}
          </span>
        </>
      )}
    </div>
  );
};

// ==================== AUTO-SAVE HOOK ====================

interface AutoSaveOptions {
  onSave: (data: any) => Promise<void>;
  debounceMs?: number;
  onError?: (error: Error) => void;
}

export const useAutoSave = ({ onSave, debounceMs = 2000, onError }: AutoSaveOptions) => {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dataRef = useRef<any>(null);

  const save = useCallback(async () => {
    if (!dataRef.current) return;

    setStatus('saving');
    
    try {
      await onSave(dataRef.current);
      setStatus('saved');
      setLastSaved(new Date());
      
      // Auto-hide "saved" status after 3 seconds
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      setStatus('error');
      if (onError) {
        onError(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }, [onSave, onError]);

  const scheduleAutoSave = useCallback((data: any) => {
    dataRef.current = data;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule new save
    timeoutRef.current = setTimeout(() => {
      save();
    }, debounceMs);
  }, [save, debounceMs]);

  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    save();
  }, [save]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSaved,
    scheduleAutoSave,
    saveNow
  };
};

// ==================== NAVIGATION WITH UNSAVED CHANGES ====================

export const useUnsavedChangesWarning = (hasUnsavedChanges: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);
};

// ==================== STANDARD ACTION BUTTON ====================

interface ActionButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  loading?: boolean;
  requireConfirmation?: boolean;
  confirmationOptions?: ConfirmationOptions;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled,
  loading,
  requireConfirmation,
  confirmationOptions
}) => {
  const { confirm } = useConfirmation();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (requireConfirmation && confirmationOptions) {
      const confirmed = await confirm(confirmationOptions);
      if (!confirmed) return;
    }

    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const isDisabled = disabled || loading || isLoading;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      {label}
      {(loading || isLoading) && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  );
};

// ==================== CONSISTENT ERROR DISPLAY ====================

interface ErrorDisplayProps {
  error: Error | string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'inline' | 'banner' | 'toast';
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onDismiss,
  variant = 'inline'
}) => {
  const errorMessage = error instanceof Error ? error.message : error;

  if (variant === 'banner') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-red-900 mb-1">Error</h3>
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
          <div className="flex items-center gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors"
              >
                Retry
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <AlertTriangle className="w-4 h-4" />
        <span>{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return null; // toast variant handled by toast system
};

// ==================== CONSISTENCY UTILITIES ====================

/**
 * Standard spacing scale (Tailwind-based)
 */
export const SPACING = {
  xs: '0.25rem',   // 1
  sm: '0.5rem',    // 2
  md: '1rem',      // 4
  lg: '1.5rem',    // 6
  xl: '2rem',      // 8
  '2xl': '3rem',   // 12
  '3xl': '4rem'    // 16
} as const;

/**
 * Standard animation durations
 */
export const DURATION = {
  fast: 150,
  normal: 300,
  slow: 500
} as const;

/**
 * Standard z-index layers
 */
export const Z_INDEX = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 40,
  popover: 50,
  tooltip: 60
} as const;
