import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'checking' | 'ready' | 'done' | 'error'>('checking');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Check if we have a session (user clicked the reset link)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStage('error');
          setError('Invalid or expired reset link. Please request a new password reset.');
          return;
        }

        if (session) {
          setStage('ready');
        } else {
          // Check URL parameters for token
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get('token');
          const type = urlParams.get('type');
          
          if (token && type === 'recovery') {
            // Try to verify the token
            const { error: verifyError } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'recovery'
            });
            
            if (verifyError) {
              console.error('Token verification error:', verifyError);
              setStage('error');
              setError('Invalid or expired reset link. Please request a new password reset.');
            } else {
              setStage('ready');
            }
          } else {
            setStage('error');
            setError('Invalid reset link. Please request a new password reset.');
          }
        }
      } catch (error) {
        console.error('Password reset error:', error);
        setStage('error');
        setError('An error occurred while processing the reset link.');
      }
    };

    handlePasswordReset();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }
    
    if (password !== confirm) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      
      setMessage('Password updated successfully! You can now close this tab or go back to the app.');
      setStage('done');
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating your password.');
    } finally {
      setLoading(false);
    }
  };

  if (stage === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Reset Link Invalid</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </a>
            <a
              href="/#signin"
              className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Updated!</h1>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </a>
            <a
              href="/#signin"
              className="block w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below</p>
        </div>

        <form onSubmit={submit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new password"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirm new password"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            ← Back to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}


