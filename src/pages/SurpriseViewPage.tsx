import React, { useEffect, useState } from 'react';
import { SurpriseData } from '../types';
import { SurpriseThemeView } from '../components/SurpriseThemeView';
import { Heart } from 'lucide-react';

interface SurpriseViewPageProps {
  surpriseId: string;
  onNavigateHome: () => void;
}

export const SurpriseViewPage: React.FC<SurpriseViewPageProps> = ({
  surpriseId,
  onNavigateHome,
}) => {
  const [surprise, setSurprise] = useState<SurpriseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/surprises/${surpriseId}`)
      .then(res => res.json())
      .then(data => {
        if (data.surprise) {
          setSurprise(data.surprise);
        } else {
          setError('Surprise gift website not found');
        }
      })
      .catch(err => {
        console.error('Failed to load surprise', err);
        setError('Failed to load surprise gift');
      })
      .finally(() => setLoading(false));
  }, [surpriseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 text-rose-950 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-serif italic text-lg text-rose-800 font-bold">Opening your love surprise...</p>
      </div>
    );
  }

  if (error || !surprise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 text-rose-950 flex flex-col items-center justify-center p-6 text-center space-y-4">
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
      {/* Top Floating Logo Home Link */}
      <button
        onClick={onNavigateHome}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-white/80 hover:text-white transition-colors text-xs font-serif italic"
      >
        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        <span className="font-bold">LoveLink</span>
      </button>

      {/* Main Fullscreen Interactive Experience */}
      <SurpriseThemeView surprise={surprise} />
    </div>
  );
};
