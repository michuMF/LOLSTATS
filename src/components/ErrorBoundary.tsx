import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
          <h1 className="text-4xl font-bold mb-4 text-red-500">Oops! Coś poszło nie tak.</h1>
          <p className="text-xl mb-8 text-center text-slate-300">
            Wystąpił nieoczekiwany błąd aplikacji.
          </p>
          <div className="bg-slate-800 p-6 rounded-lg max-w-2xl w-full overflow-auto border border-slate-700">
            <h2 className="text-lg font-semibold mb-2 text-yellow-500">Szczegóły błędu:</h2>
            <pre className="text-sm font-mono text-slate-400 whitespace-pre-wrap">
              {this.state.error?.toString()}
            </pre>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors duration-200"
          >
            Odśwież stronę
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
