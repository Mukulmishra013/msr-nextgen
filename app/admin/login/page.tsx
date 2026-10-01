'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Login request failed. Please check network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-4 text-brand-400">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            MSR Admin Login
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Solo Operator Access & AI Automation Controls
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Admin Passcode
            </label>
            <input
              type="password"
              required
              placeholder="Enter your admin secret key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm py-3.5 px-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 shadow-md hover:shadow-brand-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Access Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Server-Verified Session Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
