import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdminGateModal } from './components/AdminGateModal';
import { LandingPage } from './pages/LandingPage';

// Heavier, less-frequently-needed pages are code-split so the initial bundle
// only pays for the landing page most visitors actually see.
const UserDashboard = lazy(() => import('./pages/UserDashboard').then(m => ({ default: m.UserDashboard })));
const WizardPage = lazy(() => import('./pages/WizardPage').then(m => ({ default: m.WizardPage })));
const SurpriseViewPage = lazy(() => import('./pages/SurpriseViewPage').then(m => ({ default: m.SurpriseViewPage })));
const AdminPanel = lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));

const PageLoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center py-24">
    <div className="w-8 h-8 border-2 border-rose-300 border-t-rose-600 rounded-full animate-spin" />
  </div>
);

export function MainApp() {
  const { user, logout, openAdminGate } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [surpriseId, setSurpriseId] = useState<string>('priya-kabir');

  // Handle URL path on load & window back/forward events
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.startsWith('/s/')) {
        const id = path.split('/s/')[1];
        if (id) {
          setSurpriseId(id);
          setCurrentTab('s');
        }
      } else if (path.startsWith('/surprise/')) {
        const id = path.split('/surprise/')[1];
        if (id) {
          setSurpriseId(id);
          setCurrentTab('s');
        }
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
      } else {
        setCurrentTab('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  // If someone navigates to /admin without admin privileges, prompt for the passcode.
  useEffect(() => {
    if (currentTab === 'admin' && user && user.role !== 'admin') {
      openAdminGate();
    }
  }, [currentTab, user, openAdminGate]);

  const navigateTo = (tab: string, id?: string) => {
    setCurrentTab(tab);
    if (id) setSurpriseId(id);

    let newPath = '/';
    if (tab === 'home') newPath = '/';
    else if (tab === 'dashboard') newPath = '/dashboard';
    else if (tab === 'create') newPath = '/create';
    else if (tab === 'edit' && id) newPath = `/edit/${id}`;
    else if (tab === 's' && id) newPath = `/s/${id}`;
    else if (tab === 'admin') newPath = '/admin';
    else if (tab === 'how-it-works') newPath = '/how-it-works';

    window.history.pushState({}, '', newPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1A1A1A] font-sans selection:bg-rose-100 selection:text-rose-900">
      
      {/* Hide standard Navbar on full-screen recipient view */}
      {currentTab !== 's' && (
        <Navbar currentTab={currentTab} onNavigate={navigateTo} />
      )}

      {/* Main Page View Router */}
      <div className="flex-1 flex flex-col">
        <Suspense fallback={<PageLoadingFallback />}>
          {currentTab === 'home' || currentTab === 'how-it-works' ? (
            <LandingPage onNavigate={navigateTo} />
          ) : currentTab === 'dashboard' ? (
            <UserDashboard onNavigate={navigateTo} />
          ) : currentTab === 'create' ? (
            <WizardPage onNavigate={navigateTo} />
          ) : currentTab === 'edit' ? (
            <WizardPage editSurpriseId={surpriseId} onNavigate={navigateTo} />
          ) : currentTab === 's' ? (
            <SurpriseViewPage surpriseId={surpriseId} onNavigateHome={() => navigateTo('home')} />
          ) : currentTab === 'admin' && user?.role === 'admin' ? (
            <AdminPanel user={user} onLogout={() => { logout(); navigateTo('home'); }} onNavigate={navigateTo} />
          ) : (
            <LandingPage onNavigate={navigateTo} />
          )}
        </Suspense>
      </div>

      {/* Footer */}
      {currentTab !== 's' && <Footer onNavigate={navigateTo} />}

      {/* Admin passcode gate (the only login-like flow left in the app) */}
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
