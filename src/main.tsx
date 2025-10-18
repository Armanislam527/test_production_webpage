import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ResetPassword from './ResetPassword.tsx';
import { Component, ReactNode } from 'react';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }
  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Unhandled UI error:', error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white shadow rounded-lg p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-4">{this.state.message || 'An unexpected error occurred.'}</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => location.reload()}>Reload</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function Router() {
  const path = window.location.pathname;
  
  // Handle reset password route
  if (path.startsWith('/reset-password')) {
    return <ResetPassword />;
  }
  
  // Handle hash-based routing for modals
  const hash = window.location.hash;
  if (hash === '#signin' || hash === '#signup') {
    // The App component will handle showing the auth modal based on hash
    return <App />;
  }
  
  // Default to main app
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  </StrictMode>
);
