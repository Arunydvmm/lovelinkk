import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdminGateModal } from './components/AdminGateModal';
import { LandingPage } from './pages/LandingPage';
import { Heart, LogIn } from 'lucide-react';

const UserDashboard   = lazy(() => import('./pages/UserDashboard').then(m => ({ default: m.UserDashboard })));
const WizardPage      = lazy(() => import('./pages/WizardPage').then(m => ({ default: m.WizardPage })));
const SurpriseViewPage= lazy(() => import('./pages/SurpriseViewPage').then(m => ({ default: m.SurpriseViewPage })));
const AdminPanel      = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));
const TemplateGallery = lazy(() => import('./pages/TemplateGallery').then(m => ({ default: m.TemplateGallery })));

const PageLoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center py-24">
    <div className="w-8 h-8 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
  </div>
);

/** Full-page wall shown when a guest tries to access a creator-only route */
function LoginRequiredPage({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-6 text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center shadow-md">
        <Heart className="w-10 h-10 text-rose-600 fill-rose-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-serif italic font-bold text-[#1A1A1A]">Sign in to create</h2>
        <p className="text-sm text-[#1A1A1A]/60 max-w-sm leading-relaxed">
          You need to sign in with Google to create and manage your surprise websites.
          Signing in keeps your creations safe and lets you share them from any device.
        </p>
      </div>
      {/* The Google button in the Navbar handles the actual sign-in.
          We just nudge the user to look there. */}
      <p className="text-xs text-[#1A1A1A]/50 flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-full">
        <LogIn className="w-3.5 h-3.5 text-rose-500" />
        Click the <strong className="text-rose-600">Sign in with Google</strong> button in the top-right navbar
      </p>
      <button
        onClick={() => onNavigate('home')}
        className="text-xs text-[#1A1A1A]/50 hover:text-rose-600 underline underline-offset-4 transition-colors"
      >
        ← Back to Home
      </button>
    </div>
  );
}

export function MainApp() {
  const { user, loading, logout, openAdminGate } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [surpriseId, setSurpriseId] = useState<string>('priya-kabir');
  // viewToken extracted from ?token= query param for recipient view
  const [viewToken, setViewToken] = useState<string>('');

  const isGuestUser = !user || user.googleId?.startsWith('device_');

  // ── URL router ──
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token') || '';

      if (path.startsWith('/s/')) {
        const id = path.split('/s/')[1];
        if (id) { setSurpriseId(id); setViewToken(token); setCurrentTab('s'); }
      } else if (path.startsWith('/surprise/')) {
        const id = path.split('/surprise/')[1];
        if (id) { setSurpriseId(id); setViewToken(token); setCurrentTab('s'); }
      } else if (path === '/dashboard' || path === '/my-surprises') {
        setCurrentTab('dashboard');
      } else if (path === '/create') {
        setCurrentTab('create');
      } else if (path.startsWith('/edit/')) {
        const id = path.split('/edit/')[1];
        setSurpriseId(id);
        setCurrentTab('edit');
      } else if (path === '/admin') {
        setCurrentTab('admin');
      } else if (path === '/how-it-works') {
        setCurrentTab('how-it-works');
      } else if (path === '/templates') {
        setCurrentTab('templates');
      } else {
        setCurrentTab('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // Admin gate
  useEffect(() => {
    if (currentTab === 'admin' && user && user.role !== 'admin') {
      openAdminGate();
    }
  }, [currentTab, user, openAdminGate]);

  const navigateTo = (tab: string, id?: string, token?: string) => {
    setCurrentTab(tab);
    if (id) setSurpriseId(id);
    if (token !== undefined) setViewToken(token);

    let newPath = '/';
    if (tab === 'home') newPath = '/';
    else if (tab === 'dashboard') newPath = '/dashboard';
    else if (tab === 'create') newPath = '/create';
    else if (tab === 'edit' && id) newPath = `/edit/${id}`;
    else if (tab === 's' && id) {
      newPath = `/s/${id}${token ? `?token=${token}` : ''}`;
    }
    else if (tab === 'admin') newPath = '/admin';
    else if (tab === 'how-it-works') newPath = '/how-it-works';
    else if (tab === 'templates') newPath = '/templates';

    window.history.pushState({}, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // While auth is still initialising, show nothing (avoids flash of login wall)
  if (loading) return <PageLoadingFallback />;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1A1A1A] font-sans selection:bg-rose-100 selection:text-rose-900">

      {currentTab !== 's' && (
        <Navbar currentTab={currentTab} onNavigate={navigateTo} />
      )}

      <div className="flex-1 flex flex-col">
        <Suspense fallback={<PageLoadingFallback />}>
          {currentTab === 'templates' ? (
            <TemplateGallery onNavigate={navigateTo} />
          ) : currentTab === 'home' || currentTab === 'how-it-works' ? (
            <LandingPage onNavigate={navigateTo} />
          ) : currentTab === 'dashboard' ? (
            <UserDashboard onNavigate={navigateTo} />
          ) : currentTab === 'create' ? (
            isGuestUser
              ? <LoginRequiredPage onNavigate={navigateTo} />
              : <WizardPage onNavigate={navigateTo} />
          ) : currentTab === 'edit' ? (
            isGuestUser
              ? <LoginRequiredPage onNavigate={navigateTo} />
              : <WizardPage editSurpriseId={surpriseId} onNavigate={navigateTo} />
          ) : currentTab === 's' ? (
            <SurpriseViewPage
              surpriseId={surpriseId}
              viewToken={viewToken}
              onNavigateHome={() => navigateTo('home')}
            />
          ) : currentTab === 'admin' && user?.role === 'admin' ? (
            <AdminPanel user={user} onLogout={() => { logout(); navigateTo('home'); }} onNavigate={navigateTo} />
          ) : (
            <LandingPage onNavigate={navigateTo} />
          )}
        </Suspense>
      </div>

      {currentTab !== 's' && <Footer onNavigate={navigateTo} />}

      <AdminGateModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
