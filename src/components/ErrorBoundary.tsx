import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-12 h-12 text-red-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-400 mb-6">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={this.handleRetry}
                className="
                  w-full px-6 py-3
                  bg-tmdb-secondary hover:bg-tmdb-secondary/90
                  text-white font-semibold rounded-lg
                  transition-colors duration-200
                "
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="
                  w-full px-6 py-3
                  bg-gray-800 hover:bg-gray-700
                  text-white font-semibold rounded-lg
                  transition-colors duration-200
                "
              >
                Go Home
              </button>
            </div>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-gray-400 hover:text-white mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="bg-gray-800 p-4 rounded-lg overflow-auto max-h-64">
                  <pre className="text-red-400 text-xs whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              </details>
            )}
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
  fallback?: ReactNode
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Functional error UI components
export function ErrorMessage({ 
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  onRetry,
  className = ""
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="w-8 h-8 text-red-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-400 mb-6">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            px-6 py-2
            bg-tmdb-secondary hover:bg-tmdb-secondary/90
            text-white font-semibold rounded-lg
            transition-colors duration-200
          "
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Network error specific component
export function NetworkError({ 
  onRetry,
  className = ""
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ErrorMessage
      title="Connection Problem"
      message="Unable to connect to the server. Please check your internet connection and try again."
      onRetry={onRetry}
      className={className}
    />
  );
}

// API error specific component
export function APIError({ 
  error,
  onRetry,
  className = ""
}: {
  error?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <ErrorMessage
      title="Service Unavailable"
      message={error || "The movie database service is temporarily unavailable. Please try again in a moment."}
      onRetry={onRetry}
      className={className}
    />
  );
}

// Not found error component
export function NotFoundError({ 
  title = "Not Found",
  message = "The content you're looking for doesn't exist or may have been removed.",
  className = ""
}: {
  title?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-400 mb-6">
        {message}
      </p>
      
      <button
        onClick={() => window.history.back()}
        className="
          px-6 py-2
          bg-gray-800 hover:bg-gray-700
          text-white font-semibold rounded-lg
          transition-colors duration-200
        "
      >
        Go Back
      </button>
    </div>
  );
}