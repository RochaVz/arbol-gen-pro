import React, { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Error boundary component to catch rendering errors in the React Flow tree.
 *
 * React 19 error boundaries only work with class components, not function components.
 * This component catches errors in its child tree and displays a fallback UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log comprehensive error information
    const errorData = {
      timestamp: new Date().toISOString(),
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack,
      errorString: String(error),
    };

    // Log to console
    console.error('[ErrorBoundary] Caught error:', errorData);

    // Log to window object for debugging
    if (typeof window !== 'undefined') {
      (window as any).__LAST_ERROR__ = errorData;
    }

    // Update state
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error callback (e.g., for error reporting service)
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div
          className="w-full h-full flex items-center justify-center bg-white rounded-lg border border-slate-200"
          role="alert"
        >
          <div className="text-center p-6 max-w-md">
            <div className="text-lg font-semibold text-slate-800 mb-2">
              Error al cargar el árbol
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Ha ocurrido un error inesperado al renderizar la visualización del árbol genealógico.
              Por favor, recarga la página para intentar de nuevo.
            </p>
            {typeof import.meta !== 'undefined' && import.meta.env.DEV && this.state.error && (
              <details className="mt-4 p-3 bg-slate-100 rounded text-left text-xs text-slate-700 max-h-48 overflow-auto">
                <summary className="font-semibold cursor-pointer mb-2">
                  Detalles del error (desarrollo)
                </summary>
                <pre className="whitespace-pre-wrap break-words">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => {
                this.handleReset();
                window.location.reload();
              }}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors mt-4"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
