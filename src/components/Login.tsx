import React, { useState } from 'react';

const GAS_URL = import.meta.env.VITE_GAS_URL || '';

async function validateUser(email: string) {
  const url = new URL(GAS_URL);
  url.searchParams.set('page', 'api');
  url.searchParams.set('action', 'validateUser');
  url.searchParams.set('email', email);
  const response = await fetch(url.toString(), { redirect: 'follow' });
  const text = await response.text();
  return JSON.parse(text);
}

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!email.trim()) { setError('Enter your email.'); return; }
    setLoading(true);
    setError('');
    try {
      const result = await validateUser(email.trim().toLowerCase());
      if (result.success) {
        onLoginSuccess(email.trim().toLowerCase());
      } else {
        setError(result.error || 'Access not authorized.');
      }
    } catch (e) {
      setError('Connection error. Try again.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-black text-slate-950">
            B
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">BGrowth Club</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="your@email.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Access your BGrowth Club dashboard.
        </p>
      </div>
    </div>
  );
}