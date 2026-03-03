import React, { useState } from 'react';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/authContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <div className="min-h-screen bg-bored-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-bored-black mb-4">
            <span className="text-bored-neon font-bold text-xl tracking-tighter">b.</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-bored-black">
            bored. dashboard
          </h1>
          <p className="text-sm text-bored-gray-400 mt-1">Sign in to your hotel workspace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-bored-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-8 space-y-4">

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-[11px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bored-gray-300" />
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hotel.com"
                className="w-full pl-9 pr-4 py-2.5 border border-bored-gray-150 rounded-xl text-sm text-bored-black bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/30 focus:border-bored-gray-300 placeholder:text-bored-gray-300"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bored-gray-300" />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 border border-bored-gray-150 rounded-xl text-sm text-bored-black bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/30 focus:border-bored-gray-300 placeholder:text-bored-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-bored-gray-300 hover:text-bored-gray-500"
              >
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 disabled:opacity-40 transition-colors"
          >
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Signing in…</>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-bored-gray-300 mt-6">
          bored. Experience Management Platform
        </p>
      </div>
    </div>
  );
}
