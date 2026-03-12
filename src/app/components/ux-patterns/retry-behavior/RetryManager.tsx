/**
 * Retry Manager
 * 
 * Automatic retry behavior for failed operations with progress feedback.
 * 
 * Features:
 * - Configurable retry strategies (exponential backoff, linear, custom)
 * - Progress feedback and status updates
 * - Manual retry triggers
 * - Failed operation queuing
 * 
 * @example
 * ```tsx
 * // Auto-retry with exponential backoff
 * <RetryableOperation
 *   operation={async () => await sendEVVData(visit)}
 *   operationName="EVV Transmission"
 *   maxRetries={3}
 *   strategy="exponential"
 *   onSuccess={() => toast.success('EVV sent successfully')}
 *   onFinalFailure={(error) => toast.error('Failed to send EVV')}
 * />
 * 
 * // Manual retry button
 * <RetryButton
 *   operation={retryFailedIntegration}
 *   label="Retry Integration"
 *   showProgress
 * />
 * ```
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// ==================== TYPES ====================

export type RetryStrategy = 'immediate' | 'linear' | 'exponential' | 'custom';

export interface RetryConfig {
  maxRetries: number;
  strategy: RetryStrategy;
  baseDelay?: number; // milliseconds (default: 1000)
  maxDelay?: number; // milliseconds (default: 30000)
  customDelayFn?: (attemptNumber: number) => number;
}

export interface RetryStatus {
  status: 'idle' | 'running' | 'retrying' | 'success' | 'failed';
  currentAttempt: number;
  maxAttempts: number;
  lastError?: Error;
  nextRetryIn?: number; // milliseconds
}

// ==================== UTILITIES ====================

const calculateDelay = (attemptNumber: number, config: RetryConfig): number => {
  const { strategy, baseDelay = 1000, maxDelay = 30000, customDelayFn } = config;

  if (strategy === 'custom' && customDelayFn) {
    return Math.min(customDelayFn(attemptNumber), maxDelay);
  }

  if (strategy === 'immediate') {
    return 0;
  }

  if (strategy === 'linear') {
    return Math.min(baseDelay * attemptNumber, maxDelay);
  }

  // Exponential backoff (default)
  return Math.min(baseDelay * Math.pow(2, attemptNumber - 1), maxDelay);
};

// ==================== RETRYABLE OPERATION COMPONENT ====================

interface RetryableOperationProps<T> {
  operation: () => Promise<T>;
  operationName: string;
  config?: Partial<RetryConfig>;
  onSuccess?: (result: T) => void;
  onFinalFailure?: (error: Error) => void;
  onRetry?: (attemptNumber: number) => void;
  autoStart?: boolean;
  children?: (status: RetryStatus, retry: () => void) => React.ReactNode;
}

export function RetryableOperation<T>({
  operation,
  operationName,
  config = {},
  onSuccess,
  onFinalFailure,
  onRetry,
  autoStart = true,
  children
}: RetryableOperationProps<T>) {
  const fullConfig: RetryConfig = {
    maxRetries: 3,
    strategy: 'exponential',
    baseDelay: 1000,
    maxDelay: 30000,
    ...config
  };

  const [status, setStatus] = useState<RetryStatus>({
    status: 'idle',
    currentAttempt: 0,
    maxAttempts: fullConfig.maxRetries
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const executeOperation = useCallback(async (attemptNumber: number) => {
    if (!isMountedRef.current) return;

    setStatus(prev => ({
      ...prev,
      status: attemptNumber === 1 ? 'running' : 'retrying',
      currentAttempt: attemptNumber
    }));

    try {
      const result = await operation();
      
      if (!isMountedRef.current) return;

      setStatus(prev => ({
        ...prev,
        status: 'success',
        lastError: undefined
      }));

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      if (!isMountedRef.current) return;

      const err = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (attemptNumber < fullConfig.maxRetries) {
        const delay = calculateDelay(attemptNumber, fullConfig);

        setStatus(prev => ({
          ...prev,
          status: 'retrying',
          lastError: err,
          nextRetryIn: delay
        }));

        if (onRetry) {
          onRetry(attemptNumber + 1);
        }

        // Schedule next retry
        timeoutRef.current = setTimeout(() => {
          executeOperation(attemptNumber + 1);
        }, delay);
      } else {
        // Final failure
        setStatus(prev => ({
          ...prev,
          status: 'failed',
          lastError: err
        }));

        if (onFinalFailure) {
          onFinalFailure(err);
        }
      }
    }
  }, [operation, fullConfig, onSuccess, onFinalFailure, onRetry]);

  const retry = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    executeOperation(1);
  }, [executeOperation]);

  useEffect(() => {
    if (autoStart) {
      executeOperation(1);
    }
  }, [autoStart]); // Only run on mount if autoStart is true

  if (children) {
    return <>{children(status, retry)}</>;
  }

  return null;
}

// ==================== RETRY BUTTON ====================

interface RetryButtonProps {
  operation: () => Promise<any>;
  label?: string;
  config?: Partial<RetryConfig>;
  showProgress?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  operation,
  label = 'Retry',
  config,
  showProgress = true,
  variant = 'secondary',
  size = 'md',
  onSuccess,
  onFailure
}) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await operation();
      if (onSuccess) onSuccess();
    } catch (error) {
      if (onFailure) {
        onFailure(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      setIsRetrying(false);
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

  return (
    <button
      onClick={handleRetry}
      disabled={isRetrying}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {isRetrying ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {showProgress && <span>Retrying...</span>}
        </>
      ) : (
        <>
          <RefreshCw className="w-4 h-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};

// ==================== RETRY STATUS INDICATOR ====================

interface RetryStatusIndicatorProps {
  status: RetryStatus;
  operationName: string;
  onManualRetry?: () => void;
  compact?: boolean;
}

export const RetryStatusIndicator: React.FC<RetryStatusIndicatorProps> = ({
  status,
  operationName,
  onManualRetry,
  compact = false
}) => {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'running':
      case 'retrying':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (status.status) {
      case 'running':
        return `${operationName} in progress...`;
      case 'retrying':
        return `Retrying ${operationName} (Attempt ${status.currentAttempt}/${status.maxAttempts})`;
      case 'success':
        return `${operationName} completed successfully`;
      case 'failed':
        return `${operationName} failed after ${status.currentAttempt} attempts`;
      default:
        return operationName;
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2 text-sm">
        {getStatusIcon()}
        <span className="text-gray-700">{getStatusMessage()}</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{getStatusMessage()}</p>
          
          {status.status === 'retrying' && status.nextRetryIn && (
            <p className="text-xs text-gray-500 mt-1">
              Next retry in {Math.ceil(status.nextRetryIn / 1000)}s
            </p>
          )}
          
          {status.lastError && (
            <p className="text-xs text-red-600 mt-2">
              Error: {status.lastError.message}
            </p>
          )}
          
          {status.status === 'failed' && onManualRetry && (
            <button
              onClick={onManualRetry}
              className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==================== FAILED OPERATIONS QUEUE ====================

export interface FailedOperation {
  id: string;
  name: string;
  timestamp: Date;
  error: Error;
  retry: () => Promise<void>;
}

interface FailedOperationsQueueProps {
  operations: FailedOperation[];
  onRetry: (operationId: string) => void;
  onDismiss: (operationId: string) => void;
  onRetryAll?: () => void;
}

export const FailedOperationsQueue: React.FC<FailedOperationsQueueProps> = ({
  operations,
  onRetry,
  onDismiss,
  onRetryAll
}) => {
  if (operations.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <h3 className="text-sm font-semibold text-red-900">
            Failed Operations ({operations.length})
          </h3>
        </div>
        
        {onRetryAll && operations.length > 1 && (
          <button
            onClick={onRetryAll}
            className="text-sm text-red-700 hover:text-red-900 font-medium"
          >
            Retry All
          </button>
        )}
      </div>
      
      <div className="space-y-2">
        {operations.map(op => (
          <div
            key={op.id}
            className="bg-white rounded-lg p-3 flex items-center justify-between"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{op.name}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {op.timestamp.toLocaleTimeString()} - {op.error.message}
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onRetry(op.id)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Retry"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDismiss(op.id)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                title="Dismiss"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== HOOK ====================

export const useRetry = () => {
  const [failedOperations, setFailedOperations] = useState<FailedOperation[]>([]);

  const addFailedOperation = useCallback((operation: FailedOperation) => {
    setFailedOperations(prev => [...prev, operation]);
  }, []);

  const retryOperation = useCallback(async (operationId: string) => {
    const operation = failedOperations.find(op => op.id === operationId);
    if (!operation) return;

    try {
      await operation.retry();
      // Remove from failed queue on success
      setFailedOperations(prev => prev.filter(op => op.id !== operationId));
    } catch (error) {
      // Update error if retry fails again
      setFailedOperations(prev =>
        prev.map(op =>
          op.id === operationId
            ? { ...op, error: error instanceof Error ? error : new Error(String(error)), timestamp: new Date() }
            : op
        )
      );
    }
  }, [failedOperations]);

  const dismissOperation = useCallback((operationId: string) => {
    setFailedOperations(prev => prev.filter(op => op.id !== operationId));
  }, []);

  const retryAll = useCallback(async () => {
    for (const op of failedOperations) {
      await retryOperation(op.id);
    }
  }, [failedOperations, retryOperation]);

  return {
    failedOperations,
    addFailedOperation,
    retryOperation,
    dismissOperation,
    retryAll
  };
};
