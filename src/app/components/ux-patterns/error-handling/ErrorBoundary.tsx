/**
 * ErrorBoundary Component
 * 
 * React Error Boundary for catching and displaying runtime errors gracefully.
 * Part of the Error Handling Pattern.
 * 
 * @module UXPatterns/ErrorHandling
 */

import { Component, ReactNode } from 'react';
import { ErrorDisplay } from './ErrorDisplay';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catches React errors and displays user-friendly fallback
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for debugging
    console.error('ErrorBoundary caught error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error display
      return (
        <div className="p-6">
          <ErrorDisplay
            title="Something went wrong"
            description="An unexpected error occurred while displaying this content."
            suggestion="Try refreshing the page or contact support if the problem persists."
            severity="error"
            errorCode={this.state.error?.name}
            actions={[
              {
                label: 'Try Again',
                onClick: this.handleReset,
                variant: 'primary'
              },
              {
                label: 'Refresh Page',
                onClick: () => window.location.reload(),
                variant: 'secondary'
              }
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
