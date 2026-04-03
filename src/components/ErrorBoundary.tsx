'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

/**
 * Global Error Boundary Component
 * Catches unhandled errors in the component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error Info:', errorInfo);
    this.setState({ errorInfo: errorInfo.componentStack || undefined });
    
    // Here you could also send to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI or the provided one
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--news-bg-light)] p-4">
          <div className="max-w-lg w-full bg-white border border-[var(--news-grey-200)] p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-[var(--news-red-100)] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-[var(--news-red-700)]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              
              <h1 className="font-serif text-3xl font-bold text-[var(--news-grey-900)] mb-3">
                Something Went Wrong
              </h1>
              
              <p className="text-[var(--news-grey-600)] text-base leading-relaxed mb-2">
                We&apos;re sorry, but something unexpected happened while loading this page.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 text-left bg-[var(--news-bg-light)] p-4 rounded text-xs">
                  <summary className="cursor-pointer font-bold text-[var(--news-red-700)] mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="overflow-x-auto text-[var(--news-grey-700)]">
                    {this.state.error.toString()}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                    {this.state.errorInfo && `\n\n${this.state.errorInfo}`}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-[var(--news-red-700)] text-white font-bold uppercase tracking-wide text-sm hover:bg-[var(--news-red-800)] transition-colors"
              >
                Reload Page
              </button>
              
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-white border-2 border-[var(--news-grey-300)] text-[var(--news-grey-900)] font-bold uppercase tracking-wide text-sm hover:bg-[var(--news-bg-light)] transition-colors"
              >
                Go to Homepage
              </button>
            </div>

            <p className="mt-6 text-xs text-[var(--news-grey-500)]">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
