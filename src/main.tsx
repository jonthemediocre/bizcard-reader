import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

// Add error boundary for better error handling
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
      <h2 className="text-red-600 text-xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Reload Page
      </button>
    </div>
  </div>
);

// Wrap the app in an error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error!} />;
    }

    return this.props.children;
  }
}

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);