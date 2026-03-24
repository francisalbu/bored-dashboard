import React, { useState } from 'react';
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/authContext';

/**
 * Full-screen "Set your password" gate.
 *
 * Shown when:
 *  - A new user clicks the invite / "set your password" email link (PASSWORD_RECOVERY event).
 *  - Any time needsPasswordChange === true in authContext.
 *
 * On success, clears the flag and the user lands on the normal dashboard.
 */
export function ForcePasswordChange() {
  const { profile, clearPasswordChangeRequired } = useAuth();

  const [pw, setPw]           = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [done, setDone]       = useState(false);

  const valid = pw.length >= 8 && pw === pwConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;

    if (pw.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (pw !== pwConfirm) { setError('Passwords do not match.'); return; }

    setSaving(true);
    setError(null);

    const { error: err } = await supabase.auth.updateUser({ password: pw });

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    // Clear the must_change_password flag so this screen won't appear again
    await supabase.auth.updateUser({ data: { must_change_password: false } });

    setSaving(false);
    setDone(true);
    // Sign out fully so the user gets a clean session on next login
    // (the recovery session is limited and can't load profile data reliably)
    setTimeout(async () => {
      await supabase.auth.signOut();
    }, 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-bored-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-bored-black mb-1">Password saved!</h2>
          <p className="text-sm text-bored-gray-400">Redirecting to sign in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bored-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-bored-black mb-4">
            <span className="text-bored-neon font-bold text-xl tracking-tighter">b.</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-bored-black">
            Welcome{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-sm text-bored-gray-400 mt-1">
            Set a new password to access your workspace
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-bored-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.05)] p-8 space-y-4"
        >
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* New password */}
          <div>
            <label className="block text-[11px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1.5">
              New password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bored-gray-300" />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Min. 8 characters"
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

          {/* Confirm password */}
          <div>
            <label className="block text-[11px] font-medium text-bored-gray-400 uppercase tracking-wider mb-1.5">
              Confirm password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-bored-gray-300" />
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={pwConfirm}
                onChange={e => setPwConfirm(e.target.value)}
                placeholder="Repeat your password"
                className="w-full pl-9 pr-4 py-2.5 border border-bored-gray-150 rounded-xl text-sm text-bored-black bg-white focus:outline-none focus:ring-2 focus:ring-bored-neon/30 focus:border-bored-gray-300 placeholder:text-bored-gray-300"
              />
            </div>
            {pwConfirm && pw !== pwConfirm && (
              <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
            )}
          </div>

          {/* Strength hint */}
          {pw.length > 0 && pw.length < 8 && (
            <p className="text-xs text-bored-gray-400">Must be at least 8 characters ({8 - pw.length} more)</p>
          )}

          <button
            type="submit"
            disabled={saving || !valid}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-bored-black text-white rounded-xl text-sm font-medium hover:bg-bored-gray-800 disabled:opacity-40 transition-colors mt-2"
          >
            {saving
              ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
              : 'Set password & continue'
            }
          </button>
        </form>

        <p className="text-center text-xs text-bored-gray-300 mt-6">
          bored. Experience Management Platform
        </p>
      </div>
    </div>
  );
}
