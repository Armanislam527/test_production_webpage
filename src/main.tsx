import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import App from './App';
import ResetPassword from './pages/ResetPassword';
import ProductDetails from './pages/ProductDetails';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

function AppRouter() {
  return (
    <Router>
      <AuthProvider>
        <ErrorBoundary>
          <Toaster position="top-right" />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </Router>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRouter />
  </StrictMode>
);