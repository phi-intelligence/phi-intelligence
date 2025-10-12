import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKey?: string | number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to production monitoring service
    this.logErrorToMonitoring(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error state when resetKey changes
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private logErrorToMonitoring(error: Error, errorInfo: ErrorInfo) {
    // Production error logging
    if (process.env.NODE_ENV === 'production') {
      try {
        // Log to console with structured data
        console.error('Production Error:', {
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          // Add any additional context you want to capture
        });

        // Here you could send to your error monitoring service
        // Example: Sentry, LogRocket, or custom endpoint
        this.sendToErrorService(error, errorInfo);
      } catch (loggingError) {
        // Fallback logging if error logging fails
        console.error('Failed to log error:', loggingError);
      }
    }
  }

  private sendToErrorService(error: Error, errorInfo: ErrorInfo) {
    // Example implementation for sending to error monitoring service
    // Replace with your actual error reporting service
    if (import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true') {
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            errorId: this.state.errorId,
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        }).catch(() => {
          // Silently fail if error reporting fails
        });
      } catch {
        // Silently fail if error reporting fails
      }
    }
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    });
  };

  private handleReportError = () => {
    if (this.state.error) {
      // Open email client with error details
      const subject = encodeURIComponent(`phi_intelligence Error Report - ${this.state.errorId}`);
      const body = encodeURIComponent(`
Error Report Details:
Error ID: ${this.state.errorId}
Message: ${this.state.error.message}
Stack: ${this.state.error.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
      `);
      
      window.open(`mailto:support@phiintelligence.com?subject=${subject}&body=${body}`);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold mb-4 text-red-400">
                Something went wrong
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                We encountered an unexpected error. Our team has been notified and is working to fix it.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-900 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-semibold text-red-400 mb-2">Error Details (Development):</h3>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>Message:</strong> {this.state.error.message}
                  </p>
                  <p className="text-sm text-gray-300 mb-2">
                    <strong>Error ID:</strong> {this.state.errorId}
                  </p>
                  {this.state.errorInfo && (
                    <details className="text-sm text-gray-400">
                      <summary className="cursor-pointer hover:text-gray-300 mb-2">
                        Component Stack Trace
                      </summary>
                      <pre className="bg-gray-800 p-3 rounded text-xs overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Go Home
              </button>
              <button
                onClick={this.handleReportError}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Report Error
              </button>
            </div>

            <div className="mt-8 text-sm text-gray-500">
              <p>Error ID: {this.state.errorId}</p>
              <p>If this problem persists, please contact our support team.</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for functional components to handle errors
export function useErrorHandler() {
  return {
    handleError: (error: Error, context?: string) => {
      console.error('Error caught by useErrorHandler:', error, context);
      
      if (process.env.NODE_ENV === 'production') {
        // Send to error monitoring service
        try {
          fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: error.message,
              stack: error.stack,
              context,
              timestamp: new Date().toISOString(),
              url: window.location.href,
            }),
          }).catch(() => {
            // Silently fail if error reporting fails
          });
        } catch {
          // Silently fail if error reporting fails
        }
      }
    }
  };
}
