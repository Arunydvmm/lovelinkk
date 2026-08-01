import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus, LogOut, Shield, LayoutDashboard, Sparkles, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, surpriseId?: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate }) => {
  const { user, openAdminGate, logout, isGoogleReady, googleClientId, loginWithGoogle } = useAuth();
  const [googleError, setGoogleError] = useState<string>('');
  const [signingIn, setSigningIn] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Whether the current session is a real Google/named account vs anonymous guest
  const isGuestUser = !user || user.googleId?.startsWith('device_');

  // ─── Initialize GIS + render the button once script is ready ───
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
      // Don't show One Tap automatically — user must click the button
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Render the styled button into our ref div
    if (googleBtnRef.current) {
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: 'standard',
        shape: 'pill',
        theme: 'outline',
        text: 'signin_with',
        size: 'medium',
        logo_alignment: 'left',
      });
    }
  }, [isGoogleReady, googleClientId, loginWithGoogle]);

  return (
    <header className="sticky top-4 z-50 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      <nav className="bg-white/85 backdrop-blur-xl border border-rose-100/90 shadow-xl shadow-rose-100/30 rounded-full h-16 px-6 sm:px-8 flex items-center justify-between transition-all">

        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-gradient-to-tr from-rose-600 via-pink-600 to-rose-400 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-md shadow-rose-500/25">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 block flex items-center gap-1">
              LoveLink <span className="text-rose-600 font-extrabold">Builder</span>
            </span>
          </div>
        </div>

        {/* Center Nav Links */}
        <div className="hidden lg:flex items-center gap-7">
          <button
            onClick={() => onNavigate('home')}
            className={`text-xs font-semibold transition-colors relative py-1 ${
              currentTab === 'home' ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Home
            {currentTab === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1"
          >
            How It Works
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1"
          >
            Features
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1 flex items-center gap-1"
          >
            Examples
            <Sparkles className="w-3 h-3 text-rose-500" />
          </button>

          <button
            onClick={() => onNavigate('templates')}
            className={`text-xs font-semibold transition-colors relative py-1 flex items-center gap-1 ${
              currentTab === 'templates' ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Templates
            {currentTab === 'templates' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full" />
            )}
          </button>

          <button
            onClick={() => {
              onNavigate('home');
              setTimeout(() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }), 100);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1"
          >
            About
          </button>

          {user && (
            <button
              onClick={() => onNavigate('dashboard')}
              className={`text-xs font-semibold transition-colors relative py-1 ${
                currentTab === 'dashboard' ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Websites
            </button>
          )}

          {user?.role === 'admin' && (
            <button
              onClick={() => onNavigate('admin')}
              className={`text-xs font-semibold transition-colors flex items-center gap-1.5 py-1 ${
                currentTab === 'admin' ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-rose-600'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-rose-500" />
              Admin
            </button>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('create')}
            className="px-5 py-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-full hover:shadow-lg hover:shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Website</span>
          </button>

          {/* ── Google Sign-In button (shown only when Google is ready + user is guest) ── */}
          {isGoogleReady && googleClientId && isGuestUser && (
            <div className="relative group">
              {/* GIS renders its own button into this div */}
              <div
                ref={googleBtnRef}
                className={`transition-opacity ${signingIn ? 'opacity-50 pointer-events-none' : ''}`}
                title="Sign in with Google to save your work across devices"
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

          {/* ── User avatar + dropdown (shown when signed in) ── */}
          {user && (
            <div className="relative group">
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 cursor-pointer">
                {isGuestUser ? (
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center border border-rose-200">
                    <UserIcon className="w-4 h-4 text-rose-400" />
                  </div>
                ) : (
                  <img
                    src={user.picture}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-rose-200 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-rose-100 rounded-2xl shadow-xl py-2 hidden group-hover:block animate-fadeIn z-50">
                <div className="px-4 py-3 border-b border-rose-50">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {isGuestUser ? 'Guest' : user.name}
                  </p>
                  {!isGuestUser && (
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  )}
                  {user.role === 'admin' && (
                    <p className="text-[10px] text-rose-500 font-bold uppercase tracking-wider">Admin</p>
                  )}
                  {isGuestUser && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Sign in with Google to save work across devices
                    </p>
                  )}
                </div>

                <button
                  onClick={() => onNavigate('dashboard')}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-rose-50/50 flex items-center gap-2 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-rose-500" />
                  My Websites
                </button>

                {user.role === 'admin' ? (
                  <>
                    <button
                      onClick={() => onNavigate('admin')}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-rose-600" />
                      Admin Panel
                    </button>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Exit Admin
                    </button>
                  </>
                ) : (
                  <div className="border-t border-slate-100 mt-1">
                    {/* Only show sign-out for real Google accounts */}
                    {!isGuestUser && (
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    )}
                    <button
                      onClick={openAdminGate}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-400 hover:text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      Admin Access
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};
