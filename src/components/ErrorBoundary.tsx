import React, { ReactNode } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "./Button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  scope?: 'page' | 'app'; // Distinguish between page-level and app-level errors
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorCount: number; // Track how many times error occurred
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error("Error caught by ErrorBoundary:", error);
    console.error("Error info:", errorInfo);
    
    // Increment error count
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }));
    
    // If error happens repeatedly, suggest page reload
    if (this.state.errorCount > 2) {
      console.warn("Multiple errors detected. Consider reloading the page.");
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  goHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const scope = this.props.scope || 'app';
      const isPageError = scope === 'page';
      const canReload = this.state.errorCount <= 2; // Don't keep retrying after 3 failures

      return (
        this.props.fallback?.(this.state.error, this.retry) || (
          <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {isPageError ? "Page Error" : "Application Error"}
              </h2>
              
              <p className="text-muted-foreground mb-2">
                {this.state.error.message || "An unexpected error occurred"}
              </p>

              {this.state.errorCount > 2 && (
                <p className="text-sm text-amber-600 bg-amber-50 rounded p-2 mb-4">
                  ⚠️ Multiple errors detected. Please reload the page.
                </p>
              )}
              
              <div className="space-y-3">
                {canReload && (
                  <Button 
                    onClick={this.retry}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {isPageError ? "Retry Page" : "Try Again"}
                  </Button>
                )}
                
                <Button 
                  onClick={this.goHome}
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </Button>
              </div>

              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-6 text-left">
                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto max-h-40">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
