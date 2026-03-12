/**
 * useErrorHandler Hook
 * 
 * Custom hook for standardized error handling across the application.
 * Provides consistent error messages for common scenarios.
 * 
 * @module UXPatterns/ErrorHandling
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorInfo {
  title: string;
  description?: string;
  suggestion?: string;
  errorCode?: string;
}

/**
 * Common error scenarios with user-friendly messages
 */
const ERROR_MESSAGES: Record<string, ErrorInfo> = {
  // Save/Update Errors
  SAVE_FAILED: {
    title: 'Failed to save changes',
    description: 'Your changes could not be saved at this time.',
    suggestion: 'Please check your connection and try again.'
  },
  
  // Load/Fetch Errors
  LOAD_FAILED: {
    title: 'Failed to load data',
    description: 'The requested information could not be retrieved.',
    suggestion: 'Please refresh the page or try again later.'
  },
  
  // Integration Errors
  INTEGRATION_ERROR: {
    title: 'Integration connection failed',
    description: 'Unable to connect to the external system.',
    suggestion: 'Please verify the integration is configured and try again.'
  },
  
  // Validation Errors
  VALIDATION_ERROR: {
    title: 'Please fix validation errors',
    description: 'Some required fields are missing or invalid.',
    suggestion: 'Review the highlighted fields and make corrections.'
  },
  
  // Permission Errors
  PERMISSION_DENIED: {
    title: 'Access denied',
    description: 'You do not have permission to perform this action.',
    suggestion: 'Contact your administrator if you need access.'
  },
  
  // Network Errors
  NETWORK_ERROR: {
    title: 'Connection problem',
    description: 'Unable to reach the server.',
    suggestion: 'Check your internet connection and try again.'
  },
  
  // Timeout Errors
  TIMEOUT_ERROR: {
    title: 'Request timed out',
    description: 'The operation took too long to complete.',
    suggestion: 'Please try again. If the problem persists, contact support.'
  },
  
  // Not Found Errors
  NOT_FOUND: {
    title: 'Record not found',
    description: 'The requested record could not be found.',
    suggestion: 'It may have been deleted or you may not have access.'
  },
  
  // Conflict Errors
  CONFLICT_ERROR: {
    title: 'Changes conflict detected',
    description: 'Another user has modified this record.',
    suggestion: 'Please refresh to see the latest changes before editing.'
  }
};

export interface UseErrorHandlerReturn {
  /** Current error state */
  error: ErrorInfo | null;
  
  /** Set error using predefined error type */
  setError: (errorType: keyof typeof ERROR_MESSAGES, customMessage?: Partial<ErrorInfo>) => void;
  
  /** Set custom error */
  setCustomError: (error: ErrorInfo) => void;
  
  /** Clear error */
  clearError: () => void;
  
  /** Show error as toast notification */
  showErrorToast: (errorType: keyof typeof ERROR_MESSAGES, customMessage?: Partial<ErrorInfo>) => void;
  
  /** Handle API errors automatically */
  handleApiError: (error: unknown, context?: string) => void;
}

/**
 * useErrorHandler - Standardized error handling hook
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setErrorState] = useState<ErrorInfo | null>(null);

  const setError = useCallback((
    errorType: keyof typeof ERROR_MESSAGES,
    customMessage?: Partial<ErrorInfo>
  ) => {
    const baseError = ERROR_MESSAGES[errorType];
    setErrorState({
      ...baseError,
      ...customMessage
    });
  }, []);

  const setCustomError = useCallback((errorInfo: ErrorInfo) => {
    setErrorState(errorInfo);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const showErrorToast = useCallback((
    errorType: keyof typeof ERROR_MESSAGES,
    customMessage?: Partial<ErrorInfo>
  ) => {
    const errorInfo = {
      ...ERROR_MESSAGES[errorType],
      ...customMessage
    };
    
    toast.error(errorInfo.title, {
      description: errorInfo.description
    });
  }, []);

  const handleApiError = useCallback((error: unknown, context?: string) => {
    console.error(`API Error${context ? ` (${context})` : ''}:`, error);
    
    // Determine error type based on error object
    if (error instanceof Error) {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('NETWORK_ERROR');
      } else if (error.message.includes('timeout')) {
        setError('TIMEOUT_ERROR');
      } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        setError('PERMISSION_DENIED');
      } else {
        setCustomError({
          title: 'An error occurred',
          description: error.message,
          suggestion: 'Please try again or contact support if the problem persists.'
        });
      }
    } else {
      setError('LOAD_FAILED');
    }
  }, [setError, setCustomError]);

  return {
    error,
    setError,
    setCustomError,
    clearError,
    showErrorToast,
    handleApiError
  };
}

/**
 * Get user-friendly error message from error type
 */
export function getErrorMessage(errorType: keyof typeof ERROR_MESSAGES): ErrorInfo {
  return ERROR_MESSAGES[errorType];
}
