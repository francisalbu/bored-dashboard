import React, { useState } from 'react';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../../lib/authContext';
import { supabase } from '../../lib/supabase';

export function LoginPage() {
  const { signIn } = useAuth();

  // ── Login state
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ── Forgot password state
  const [mode, setMode]               = useState<'login' | 'forgot'>('login');
  const [resetEmail, setResetEmail]   = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent]     = useState(false);
  const [resetError, setResetError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetError(null);
    // In development, redirect to the production URL so Supabase doesn't
    // redirect back to localhost (which browsers block from external redirects).
    // In production, window.location.origin is already the correct URL.
    const isProd = window.location.hostname !== 'localhost';
    const redirectBase = isProd
      ? window.location.origin
      : 'https://homing.boredtourist.com';

    const { error: err } = await supabase.auth.resetPasswordForEmail(
      resetEmail.trim(),
      { redirectTo: `${redirectBase}?type=recovery` }
    );
    setResetLoading(false);
    if (err) { setResetError(err.message); return; }
    setResetSent(true);
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
            {mode === 'login' ? 'bored. dashboard' : 'Reset password'}
          </h1>
          <p className="text-sm text-bored-gray-400 mt-1">
            {mode === 'login'
              ? 'Sign in to your hotel workspace'
              : "We'll send you a link to set a new password"
            }
          </p>
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-bored-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-8 space-y-4">

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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium text-bored-gray-400 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setResetEmail(email); }}
                  className="text-[11px] text-bored-gray-400 hover:text-bored-black underline underline-offset-2 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
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
        )}

        {/* ── FORGOT PASSWORD FORM ── */}
        {mode === 'forgot' && (
          <div className="bg-white rounded-2xl border border-bored-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-8 space-y-4">

            {resetSent ? (
              <div className="text-center space-y-3 py-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100">
                  <CheckCircle size={22} className="text-green-600" />
                </div>
                <p className="text-sm font-medium text-bored-black">Check your inbox!</p>
                <p className="text-sm text-bored-gray-400">
                  We sent a password reset link to <strong>{resetEmail}</strong>.
                </p>
                <button
                  onClick={() => { setMode('login'); setResetSent(false); }}
                  className="text-sm text-bored-gray-400 hover:text-bored-black underline underline-offset-2 transition-colors"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                {resetError && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
                    <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600">{resetError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bored-gray-300" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="you@hotel.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-bored-gray-150 rounded-xl text-sm text-bored-black bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/30 focus:border-bored-gray-300 placeholder:text-bored-gray-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 disabled:opacity-40 transition-colors"
                >
                  {resetLoading
                    ? <><Loader2 size={15} className="animate-spin" /> Sending…</>
                    : 'Send reset link'
                  }
                </button>

                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-bored-gray-400 hover:text-bored-black transition-colors"
                >
                  <ArrowLeft size={13} /> Back to sign in
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-xs text-bored-gray-300 mt-6">
          bored. Experience Management Platform
        </p>
      </div>
    </div>
  );
}
