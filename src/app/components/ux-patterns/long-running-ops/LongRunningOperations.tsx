/**
 * Long-Running Operations
 * 
 * Progress feedback system for operations that take significant time.
 * 
 * Features:
 * - Progress bars with percentage
 * - Estimated time remaining
 * - Step-by-step progress indicators
 * - Background operation tracking
 * - Cancellation support
 * 
 * @example
 * ```tsx
 * // Report generation with progress
 * <LongRunningOperation
 *   operation={generateReport}
 *   operationName="Generating Report"
 *   estimatedDuration={30000}
 *   showProgress
 *   showEstimatedTime
 *   onComplete={(result) => downloadReport(result)}
 * />
 * 
 * // Multi-step operation
 * <StepProgress
 *   steps={[
 *     { id: '1', label: 'Exporting data', status: 'complete' },
 *     { id: '2', label: 'Processing records', status: 'active' },
 *     { id: '3', label: 'Generating file', status: 'pending' }
 *   ]}
 * />
 * ```
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, CheckCircle, XCircle, Clock, Download, AlertCircle } from 'lucide-react';

// ==================== TYPES ====================

export interface OperationProgress {
  percentage: number;
  currentStep?: string;
  totalSteps?: number;
  currentStepNumber?: number;
  estimatedTimeRemaining?: number; // milliseconds
  status: 'pending' | 'running' | 'complete' | 'error' | 'cancelled';
  message?: string;
}

export interface LongRunningOperationConfig {
  onProgress?: (progress: OperationProgress) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  estimatedDuration?: number; // milliseconds
  allowCancel?: boolean;
}

export interface OperationStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  message?: string;
}

// ==================== PROGRESS BAR ====================

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  animated?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percentage,
  label,
  showPercentage = true,
  size = 'md',
  variant = 'default',
  animated = true
}) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));

  const heightClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600'
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-600">{Math.round(clampedPercentage)}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heightClasses[size]}`}>
        <div
          className={`${heightClasses[size]} ${colorClasses[variant]} rounded-full transition-all duration-300 ${
            animated ? 'ease-out' : ''
          }`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
};

// ==================== TIME REMAINING ====================

interface TimeRemainingProps {
  milliseconds: number;
  label?: string;
  compact?: boolean;
}

export const TimeRemaining: React.FC<TimeRemainingProps> = ({
  milliseconds,
  label = 'Time remaining',
  compact = false
}) => {
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        {formatTime(milliseconds)}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <Clock className="w-4 h-4" />
      <span>
        {label}: <span className="font-medium">{formatTime(milliseconds)}</span>
      </span>
    </div>
  );
};

// ==================== LONG RUNNING OPERATION COMPONENT ====================

interface LongRunningOperationProps<T> {
  operation: (onProgress: (progress: OperationProgress) => void) => Promise<T>;
  operationName: string;
  config?: LongRunningOperationConfig;
  autoStart?: boolean;
  children?: (progress: OperationProgress, controls: OperationControls) => React.ReactNode;
}

interface OperationControls {
  start: () => void;
  cancel: () => void;
}

export function LongRunningOperation<T>({
  operation,
  operationName,
  config = {},
  autoStart = true,
  children
}: LongRunningOperationProps<T>) {
  const [progress, setProgress] = useState<OperationProgress>({
    percentage: 0,
    status: 'pending'
  });

  const cancelledRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  const handleProgress = useCallback((newProgress: OperationProgress) => {
    if (cancelledRef.current) return;

    // Calculate estimated time remaining if duration provided
    if (config.estimatedDuration && newProgress.percentage > 0 && newProgress.percentage < 100) {
      const elapsed = Date.now() - startTimeRef.current;
      const estimatedTotal = (elapsed / newProgress.percentage) * 100;
      const estimatedRemaining = estimatedTotal - elapsed;
      
      newProgress.estimatedTimeRemaining = Math.max(0, estimatedRemaining);
    }

    setProgress(newProgress);
    config.onProgress?.(newProgress);
  }, [config]);

  const start = useCallback(async () => {
    cancelledRef.current = false;
    startTimeRef.current = Date.now();

    setProgress({ percentage: 0, status: 'running' });

    try {
      const result = await operation(handleProgress);
      
      if (cancelledRef.current) {
        setProgress({ percentage: 0, status: 'cancelled', message: 'Operation cancelled' });
        config.onCancel?.();
        return;
      }

      setProgress({ percentage: 100, status: 'complete', message: 'Operation completed' });
      config.onComplete?.(result);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setProgress({
        percentage: progress.percentage,
        status: 'error',
        message: err.message
      });
      config.onError?.(err);
    }
  }, [operation, handleProgress, config, progress.percentage]);

  const cancel = useCallback(() => {
    cancelledRef.current = true;
    setProgress(prev => ({
      ...prev,
      status: 'cancelled',
      message: 'Cancelling...'
    }));
  }, []);

  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart]); // Only run on mount if autoStart changes

  if (children) {
    return <>{children(progress, { start, cancel })}</>;
  }

  return null;
}

// ==================== OPERATION STATUS CARD ====================

interface OperationStatusCardProps {
  progress: OperationProgress;
  operationName: string;
  onCancel?: () => void;
  showTimeRemaining?: boolean;
  showProgressBar?: boolean;
  compact?: boolean;
}

export const OperationStatusCard: React.FC<OperationStatusCardProps> = ({
  progress,
  operationName,
  onCancel,
  showTimeRemaining = true,
  showProgressBar = true,
  compact = false
}) => {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  if (compact) {
    return (
      <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-lg">
        {getStatusIcon()}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-900">{operationName}</span>
          {progress.status === 'running' && (
            <span className="text-sm text-gray-600">{Math.round(progress.percentage)}%</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getStatusIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-900">{operationName}</h3>
            
            {progress.status === 'running' && onCancel && (
              <button
                onClick={onCancel}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Cancel
              </button>
            )}
          </div>
          
          {progress.currentStep && (
            <p className="text-sm text-gray-600 mb-2">{progress.currentStep}</p>
          )}
          
          {progress.message && progress.status !== 'running' && (
            <p className={`text-sm mb-2 ${
              progress.status === 'error' ? 'text-red-600' :
              progress.status === 'complete' ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {progress.message}
            </p>
          )}
          
          {showProgressBar && progress.status === 'running' && (
            <div className="mb-2">
              <ProgressBar percentage={progress.percentage} showPercentage={false} />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {progress.status === 'running' && (
              <span className="text-sm font-medium text-gray-700">
                {Math.round(progress.percentage)}%
              </span>
            )}
            
            {showTimeRemaining && progress.estimatedTimeRemaining && progress.status === 'running' && (
              <TimeRemaining milliseconds={progress.estimatedTimeRemaining} compact />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== STEP PROGRESS ====================

interface StepProgressProps {
  steps: OperationStep[];
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export const StepProgress: React.FC<StepProgressProps> = ({
  steps,
  orientation = 'vertical',
  size = 'md'
}) => {
  const getStepIcon = (status: OperationStep['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'active':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />;
    }
  };

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              {getStepIcon(step.status)}
              <span className={`text-sm ${
                step.status === 'active' ? 'font-semibold text-gray-900' :
                step.status === 'complete' ? 'text-gray-700' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 bg-gray-200 mx-4">
                <div
                  className={`h-full transition-all duration-500 ${
                    steps[index].status === 'complete' ? 'bg-green-600 w-full' : 'bg-gray-200 w-0'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            {getStepIcon(step.status)}
            
            {index < steps.length - 1 && (
              <div className="w-0.5 h-full bg-gray-200 mt-2">
                <div
                  className={`w-full transition-all duration-500 ${
                    step.status === 'complete' ? 'bg-green-600 h-full' : 'bg-gray-200 h-0'
                  }`}
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-4">
            <p className={`text-sm font-medium ${
              step.status === 'active' ? 'text-gray-900' :
              step.status === 'complete' ? 'text-gray-700' :
              'text-gray-500'
            }`}>
              {step.label}
            </p>
            
            {step.message && (
              <p className="text-xs text-gray-600 mt-1">{step.message}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ==================== BACKGROUND OPERATIONS TRAY ====================

export interface BackgroundOperation {
  id: string;
  name: string;
  progress: OperationProgress;
  onCancel?: () => void;
}

interface BackgroundOperationsTrayProps {
  operations: BackgroundOperation[];
  onDismiss?: (operationId: string) => void;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const BackgroundOperationsTray: React.FC<BackgroundOperationsTrayProps> = ({
  operations,
  onDismiss,
  position = 'bottom-right'
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeOperations = operations.filter(op => op.progress.status === 'running');
  const completedOperations = operations.filter(op => op.progress.status === 'complete');

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  };

  if (operations.length === 0) {
    return null;
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-50 w-80`}>
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        <div
          className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">
              Background Operations ({activeOperations.length} active)
            </span>
          </div>
          
          <button className="text-gray-500 hover:text-gray-700">
            {isExpanded ? '−' : '+'}
          </button>
        </div>
        
        {isExpanded && (
          <div className="max-h-96 overflow-y-auto">
            {operations.map(op => (
              <div key={op.id} className="p-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-900">{op.name}</span>
                  
                  {onDismiss && op.progress.status === 'complete' && (
                    <button
                      onClick={() => onDismiss(op.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {op.progress.status === 'running' && (
                  <>
                    <ProgressBar percentage={op.progress.percentage} size="sm" showPercentage={false} />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-600">{Math.round(op.progress.percentage)}%</span>
                      {op.onCancel && (
                        <button
                          onClick={op.onCancel}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </>
                )}
                
                {op.progress.status === 'complete' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Complete</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
