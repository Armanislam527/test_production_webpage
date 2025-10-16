import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [stage, setStage] = useState<'checking' | 'ready' | 'done'>('checking');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setStage('ready');
      }
    });
    // If already have a session (email link), allow reset
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setStage('ready'); else setStage('ready');
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      return;
    }
    setMessage('Password updated successfully. You can close this tab or go back to the app.');
    setStage('done');
  };

  if (stage === 'checking') {
    return <div className="min-h-screen flex items-center justify-center">Checking link…</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
        {message ? (
          <div className="text-green-700 bg-green-50 border border-green-200 rounded p-3">{message}</div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input type="password" className="w-full border rounded px-3 py-2" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} required />
            </div>
            {error && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-3 text-sm">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white rounded px-4 py-2">Update Password</button>
          </form>
        )}
      </div>
    </div>
  );
}


