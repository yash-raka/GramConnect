import { useState } from 'react';
import { Shield, AlertCircle } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { isBackendAvailable } from '../utils/api';

interface AdminLoginProps {
  onLogin: (accessToken: string) => void;
}

function getUserRole(user: { user_metadata?: { role?: string }; app_metadata?: { role?: string } } | null | undefined) {
  return user?.user_metadata?.role ?? user?.app_metadata?.role;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if backend is available
    const backendOnline = await isBackendAvailable();
    if (!backendOnline) {
      setError('Admin login requires cloud backend. Please deploy the edge function first: supabase functions deploy server');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      console.log('Attempting admin login for:', email);

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) throw signInError;

      console.log('Login successful, user role:', getUserRole(data.user));

      if (getUserRole(data.user) !== 'admin') {
        throw new Error('Access denied. Admin privileges required.');
      }

      if (data.session?.access_token) {
        console.log('Access token received, length:', data.session.access_token.length);
        onLogin(data.session.access_token);
      } else {
        throw new Error('No access token received after login');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <Shield className="w-8 h-8 text-green-700" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Admin Login
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Access the administrative dashboard
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg'
            }`}
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <Shield className="w-5 h-5" />
                Login as Admin
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
