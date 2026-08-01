import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck } from 'lucide-react';

export const AdminGateModal: React.FC = () => {
  const { isAdminGateOpen, closeAdminGate, loginAsAdmin } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAdminGateOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setLoading(true);
    setError('');
    try {
      await loginAsAdmin(passcode.trim());
    } catch (err: any) {
      setError(err.message || 'Incorrect passcode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#FAF9F6] border border-[#1A1A1A]/15 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="p-6 border-b border-[#1A1A1A]/10 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-semibold text-[#1A1A1A]">Admin Access</h3>
          </div>
          <button
            onClick={closeAdminGate}
            className="w-8 h-8 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center hover:bg-[#1A1A1A]/5 transition-colors"
          >
            <X className="w-4 h-4 text-[#1A1A1A]/70" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-[#1A1A1A]/60">
            Enter the admin passcode to access the admin panel.
          </p>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          <input
            type="password"
            placeholder="Passcode"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            autoFocus
            className="w-full px-3.5 py-2.5 bg-white border border-[#1A1A1A]/20 rounded-xl text-sm focus:outline-none focus:border-rose-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-black transition-colors shadow-sm disabled:opacity-60"
          >
            {loading ? 'Checking...' : 'Unlock Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
