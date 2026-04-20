// client/src/components/ErrorBoundary.jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
          <span className="text-5xl">⚖️</span>
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="text-gray-400 text-sm">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.href = "/dashboard"}
            className="mt-2 px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-medium hover:bg-amber-400"
          >
            Back to Dashboard
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;