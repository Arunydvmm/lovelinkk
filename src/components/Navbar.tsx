import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Heart, Plus, LogOut, Shield, LayoutDashboard, User as UserIcon,
  Menu, X, LayoutTemplate,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, surpriseId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, openAdminGate, logout, isGoogleReady, googleClientId, loginWithGoogle } = useAuth();
  const [googleError, setGoogleError] = useState<string>('');
  const [signingIn, setSigningIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const isGuestUser = !user || user.googleId?.startsWith('device_');

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [currentTab]);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#mobile-menu') && !target.closest('#hamburger-btn')) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  useEffect(() => {
    if (!isGoogleReady || !googleClientId || !window.google?.accounts?.id) return;
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response: { credential: string }) => {
        setSigningIn(true);
        setGoogleError('');
        try {
          await loginWithGoogle(response.credential);
        } catch (err: any) {
          setGoogleError(err.message || 'Sign-in failed');
        } finally {
          setSigningIn(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard', shape: 'pill', theme: 'outline',
        text: 'signin_with', size: 'medium', logo_alignment: 'left',
      });
    }
  }, [isGoogleReady, googleClientId, loginWithGoogle]);

  const navLink = (tab: string, label: string) => (
    <button
      onClick={() => onNavigate(tab)}
      className={`text-sm font-semibold transition-colors relative py-1 ${
        currentTab === tab
          ? 'text-rose-600 font-bold'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {label}
      {currentTab === tab && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
      )}
    </button>
  );

  return (
    <header className="sticky top-0 sm:top-4 z-50 px-3 sm:px-8 max-w-7xl mx-auto w-full">
      <nav className="bg-white/90 backdrop-blur-xl border border-rose-100/90 shadow-lg shadow-rose-100/20 sm:rounded-full h-14 sm:h-16 px-4 sm:px-8 flex items-center justify-between transition-all">

        {/* ── Brand ── */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-400 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-md shadow-rose-500/25">
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
            LoveLink <span className="text-rose-600 font-extrabold">Builder</span>
          </span>
        </div>

        {/* ── Desktop nav ── */}
        <div className="hidden lg:flex items-center gap-6">
          {navLink('home', 'Home')}
          {navLink('templates', 'Templates')}
          {user && navLink('dashboard', 'My Websites')}
          {user?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`text-sm font-semibold transition-colors flex items-center gap-1.5 py-1 ${
                currentTab === 'admin' ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-500" /> Admin
            </button>
          )}
        </div>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Create button */}
          <button
            onClick={() => onNavigate('create')}
            className="px-3 sm:px-5 py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-full hover:shadow-lg hover:shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Create</span>
          </button>

          {/* Google sign-in */}
          {isGoogleReady && googleClientId && isGuestUser && (
            <div className="relative hidden sm:block">
              <div
                ref={googleBtnRef}
                className={`transition-opacity ${signingIn ? 'opacity-50 pointer-events-none' : ''}`}
                title="Sign in with Google"
              />
              {signingIn && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {googleError && (
                <div className="absolute top-full mt-2 right-0 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-xl shadow-lg whitespace-nowrap z-50">
                  {googleError}
                </div>
              )}
            </div>
          )}

          {/* User avatar dropdown (desktop) */}
          {user && (
            <div className="relative group hidden sm:block">
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer">
                {isGuestUser ? (
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200">
                    <UserIcon className="w-4 h-4 text-rose-400" />
                  </div>
                ) : (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-rose-200"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-rose-100 rounded-2xl shadow-xl py-2 hidden group-hover:block animate-fadeIn z-50">
                <div className="px-4 py-3 border-b border-rose-50">
                  <p className="text-xs font-bold text-slate-900 truncate">{isGuestUser ? 'Guest' : user.name}</p>
                  {!isGuestUser && <p className="text-[10px] text-slate-500 truncate">{user.email}</p>}
                  {user.role === 'admin' && <p className="text-[10px] text-rose-500 font-bold uppercase">Admin</p>}
                  {isGuestUser && <p className="text-[10px] text-slate-400 mt-0.5">Sign in to save across devices</p>}
                </div>
                <button onClick={() => onNavigate('dashboard')} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-rose-50/50 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-rose-500" /> My Websites
                </button>
                <button onClick={() => onNavigate('templates')} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-rose-50/50 flex items-center gap-2">
                  <LayoutTemplate className="w-4 h-4 text-rose-500" /> Templates
                </button>
                {user.role === 'admin' ? (
                  <>
                    <button onClick={() => onNavigate('admin')} className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-rose-600" /> Admin Panel
                    </button>
                    <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1">
                      <LogOut className="w-4 h-4" /> Exit Admin
                    </button>
                  </>
                ) : (
                  <div className="border-t border-slate-100 mt-1">
                    {!isGuestUser && (
                      <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    )}
                    <button onClick={openAdminGate} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-400" /> Admin Access
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hamburger (mobile only) */}
          <button
            id="hamburger-btn"
            onClick={() => setMobileOpen(v => !v)}
            className="lg:hidden p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 active:scale-95 transition-transform"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile slide-down menu ── */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden mx-1 mt-1 bg-white border border-rose-100 rounded-2xl shadow-xl overflow-hidden animate-fadeIn"
        >
          <div className="px-4 py-3 space-y-1">
            {[
              { tab: 'home',      label: '🏠 Home' },
              { tab: 'templates', label: '🎨 Templates' },
              { tab: 'create',    label: '✨ Create Website' },
              ...(user ? [{ tab: 'dashboard', label: '📁 My Websites' }] : []),
              ...(user?.role === 'admin' ? [{ tab: 'admin', label: '🛡 Admin Panel' }] : []),
            ].map(({ tab, label }) => (
              <button
                key={tab}
                onClick={() => { onNavigate(tab); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  currentTab === tab
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}

            {/* Google sign-in inside mobile menu */}
            {isGoogleReady && googleClientId && isGuestUser && (
              <div className="pt-2 border-t border-rose-50">
                <div ref={googleBtnRef} className={signingIn ? 'opacity-50 pointer-events-none' : ''} />
              </div>
            )}

            {/* Sign out / admin for signed-in mobile users */}
            {user && !isGuestUser && (
              <div className="pt-2 border-t border-rose-50 space-y-1">
                <div className="flex items-center gap-2 px-4 py-2">
                  <img src={user.picture} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-rose-200" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
                {user.role !== 'admin' && (
                  <button onClick={() => { openAdminGate(); setMobileOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-700 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Admin Access
                  </button>
                )}
                <button onClick={() => { logout(); setMobileOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-500 hover:bg-rose-50 flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
