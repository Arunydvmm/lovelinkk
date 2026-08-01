import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, getAuthToken, removeAuthToken, removeStoredUser, setAuthToken, setStoredUser } from '../api';

// Augment window with GIS types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, options: object) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
          cancel: () => void;
        };
      };
    };
    __lovelinkGoogleReady?: boolean;
  }
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  /** true when the GIS script is loaded and clientId is available */
  isGoogleReady: boolean;
  googleClientId: string | null;
  /** Sign in with a Google credential JWT (from GIS callback) */
  loginWithGoogle: (credential: string) => Promise<void>;
  // Admin gate
  isAdminGateOpen: boolean;
  openAdminGate: () => void;
  closeAdminGate: () => void;
  loginAsAdmin: (passcode: string) => Promise<void>;
  logout: () => void;
}

const DEVICE_ID_KEY = 'lovelink_device_id';

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdminGateOpen, setIsAdminGateOpen] = useState<boolean>(false);
  const [googleClientId, setGoogleClientId] = useState<string | null>(null);
  const [isGoogleReady, setIsGoogleReady] = useState<boolean>(false);

  // ─── Fetch Google Client ID from server + load GIS script ───
  useEffect(() => {
    fetch('/api/auth/google-client-id')
      .then(r => r.json())
      .then(data => {
        if (!data.clientId) return; // not configured
        setGoogleClientId(data.clientId);

        // Load GIS script dynamically only when we have a clientId
        if (document.getElementById('gsi-script')) {
          setIsGoogleReady(true);
          return;
        }
        const script = document.createElement('script');
        script.id = 'gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => setIsGoogleReady(true);
        document.head.appendChild(script);
      })
      .catch(() => {/* server not configured — silently ignore */});
  }, []);

  // ─── On first load: verify stored token or provision silent guest ───
  useEffect(() => {
    const init = async () => {
      const existingToken = getAuthToken();

      if (existingToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${existingToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
            setToken(existingToken);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Failed to verify existing session', err);
        }
        removeAuthToken();
        removeStoredUser();
      }

      try {
        const deviceId = getOrCreateDeviceId();
        const data = await api.guestLogin(deviceId);
        setUser(data.user);
        setToken(data.token);
      } catch (err) {
        console.error('Failed to establish guest session', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ─── Google Sign-In ───
  const loginWithGoogle = useCallback(async (credential: string) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Google sign-in failed');
    }
    const data = await res.json();
    setAuthToken(data.token);
    setStoredUser(data.user);
    setToken(data.token);
    setUser(data.user);
  }, []);

  // ─── Admin login ───
  const loginAsAdmin = async (passcode: string) => {
    const data = await api.adminLogin(passcode);
    setUser(data.user);
    setToken(data.token);
    setIsAdminGateOpen(false);
  };

  // ─── Logout: demote back to guest ───
  const logout = () => {
    // Cancel any active Google session so One Tap doesn't auto-sign back in
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    removeAuthToken();
    removeStoredUser();
    setToken(null);
    setUser(null);
    setLoading(true);
    const deviceId = getOrCreateDeviceId();
    api.guestLogin(deviceId)
      .then(data => {
        setUser(data.user);
        setToken(data.token);
      })
      .catch(err => console.error('Failed to restore guest session after logout', err))
      .finally(() => setLoading(false));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isGoogleReady,
        googleClientId,
        loginWithGoogle,
        isAdminGateOpen,
        openAdminGate: () => setIsAdminGateOpen(true),
        closeAdminGate: () => setIsAdminGateOpen(false),
        loginAsAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
