import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SurpriseData } from '../types';
import { SurpriseThemeView } from '../components/SurpriseThemeView';
import { Heart, Lock } from 'lucide-react';

interface SurpriseViewPageProps {
  surpriseId: string;
  /** The viewToken parsed from ?token= in the URL */
  viewToken: string;
  onNavigateHome: () => void;
}

export const SurpriseViewPage: React.FC<SurpriseViewPageProps> = ({
  surpriseId,
  viewToken,
  onNavigateHome,
}) => {
  const { token: authToken } = useAuth();
  const [surprise, setSurprise] = useState<SurpriseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [forbidden, setForbidden] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    setForbidden(false);
    setError('');

    // Build URL — include the viewToken as a query param if we have one.
    // The owner's JWT (authToken) is sent in Authorization header so they can
    // always see their own surprises without needing the token.
    const url = viewToken
      ? `/api/surprises/${surpriseId}?token=${encodeURIComponent(viewToken)}`
      : `/api/surprises/${surpriseId}`;

    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    fetch(url, { headers })
      .then(async res => {
        if (res.status === 403) { setForbidden(true); return; }
        const data = await res.json();
        if (data.surprise) {
          setSurprise(data.surprise);
        } else {
          setError('Surprise gift website not found');
        }
      })
      .catch(() => setError('Failed to load surprise gift'))
      .finally(() => setLoading(false));
  }, [surpriseId, viewToken, authToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-serif italic text-lg text-rose-800 font-bold">Opening your love surprise...</p>
      </div>
    );
  }

  // Someone tried to access the URL without the correct token
  if (forbidden) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 flex flex-col items-center justify-center p-6 text-center space-y-5">
        <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center shadow-md">
          <Lock className="w-9 h-9 text-rose-500" />
        </div>
        <h2 className="text-3xl font-serif italic font-bold text-rose-950">Private Surprise</h2>
        <p className="text-sm text-[#1A1A1A]/60 max-w-sm leading-relaxed">
          This surprise website is private. You can only open it using the full share link or QR code sent to you by the creator.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-6 py-3 bg-[#1A1A1A] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-rose-900 transition-colors shadow-lg"
        >
          Go to LoveLink Home
        </button>
      </div>
    );
  }

  if (error || !surprise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-md">
          <Heart className="w-8 h-8 fill-rose-600" />
        </div>
        <h2 className="text-3xl font-serif italic font-bold">Surprise Gift Not Found</h2>
        <p className="text-xs text-[#1A1A1A]/60 max-w-sm">
          The link may be invalid or the creator may have removed this surprise website.
        </p>
        <button
          onClick={onNavigateHome}
          className="px-6 py-3 bg-[#1A1A1A] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-rose-900 transition-colors shadow-lg"
        >
          Go to LoveLink Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      <button
        onClick={onNavigateHome}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-colors text-xs font-serif italic"
      >
        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        <span className="font-bold">LoveLink</span>
      </button>
      <SurpriseThemeView surprise={surprise} />
    </div>
  );
};
