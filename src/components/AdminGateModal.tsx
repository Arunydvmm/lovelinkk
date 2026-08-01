import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, User, Lock } from 'lucide-react';

export const AdminGateModal: React.FC = () => {
  const { isAdminGateOpen, closeAdminGate, loginAsAdmin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAdminGateOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await loginAsAdmin(username.trim(), password.trim());
    } catch (err: any) {
      setError(err.message || 'Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] border border-[#1A1A1A]/15 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-[#1A1A1A]/10 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-[#1A1A1A] leading-none">Admin Access</h3>
              <p className="text-[11px] text-[#1A1A1A]/50 mt-0.5">Sign in with admin credentials</p>
            </div>
          </div>
          <button
            onClick={closeAdminGate}
            className="w-8 h-8 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#1A1A1A]/5 transition-colors"
          >
            <X className="w-4 h-4 text-[#1A1A1A]/70" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          {/* Username field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <User className="w-4 h-4 text-[#1A1A1A]/40" />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Password field */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <Lock className="w-4 h-4 text-[#1A1A1A]/40" />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-xl text-sm focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};
