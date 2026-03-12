/**
 * Error Handling Pattern - Exports
 * 
 * Consistent error handling pattern for the healthcare platform.
 * 
 * @module UXPatterns/ErrorHandling
 */

export { ErrorDisplay } from './ErrorDisplay';
export type { ErrorDisplayProps, ErrorSeverity, ErrorAction } from './ErrorDisplay';

export { InlineError } from './InlineError';
export type { InlineErrorProps } from './InlineError';

export { ErrorBoundary } from './ErrorBoundary';

export { useErrorHandler, getErrorMessage } from './useErrorHandler';
export type { ErrorInfo, UseErrorHandlerReturn } from './useErrorHandler';
