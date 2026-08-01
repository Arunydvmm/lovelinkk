import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SurpriseData, FullTemplate } from '../types';
import { SurpriseThemeView } from '../components/SurpriseThemeView';
import { TemplateRenderer } from '../templateEngine/TemplateRenderer';
import { DEFAULT_TEMPLATE } from '../templateEngine/defaultTemplate';
import { validateTemplateJson } from '../templateEngine/validator';
import { TemplateSpec } from '../templateEngine/types';
import { Heart, Lock } from 'lucide-react';

interface SurpriseViewPageProps {
  surpriseId: string;
  viewToken: string;
  onNavigateHome: () => void;
}

export const SurpriseViewPage: React.FC<SurpriseViewPageProps> = ({
  surpriseId,
  viewToken,
  onNavigateHome,
}) => {
  const { token: authToken } = useAuth();
  const [surprise, setSurprise]     = useState<SurpriseData | null>(null);
  const [templateSpec, setTemplateSpec] = useState<TemplateSpec | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [forbidden, setForbidden]   = useState(false);

  useEffect(() => {
    setLoading(true);
    setForbidden(false);
    setError('');

    const url = viewToken
      ? `/api/surprises/${surpriseId}?token=${encodeURIComponent(viewToken)}`
      : `/api/surprises/${surpriseId}`;

    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    fetch(url, { headers })
      .then(async res => {
        if (res.status === 403) { setForbidden(true); return; }
        const data = await res.json();
        if (!data.surprise) { setError('Surprise gift website not found'); return; }

        const s: SurpriseData = data.surprise;
        setSurprise(s);

        // ── Resolve template ──────────────────────────────────────────────
        // 1. If the surprise carries a templateId, try to fetch that template's JSON
        // 2. Validate — if invalid or missing, fall back to DEFAULT_TEMPLATE
        if ((s as any).templateId) {
          try {
            const tRes = await fetch(`/api/templates/${(s as any).templateId}`);
            if (tRes.ok) {
              const tData = await tRes.json();
              const ft: FullTemplate = tData.template ?? tData;
              if (ft.templateJson) {
                const validation = validateTemplateJson(ft.templateJson);
                if (validation.valid) {
                  setTemplateSpec(ft.templateJson as unknown as TemplateSpec);
                  return;
                }
              }
            }
          } catch { /* fall through */ }
        }
        // Default engine template
        setTemplateSpec(DEFAULT_TEMPLATE);
      })
      .catch(() => setError('Failed to load surprise gift'))
      .finally(() => setLoading(false));
  }, [surpriseId, viewToken, authToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 flex flex-col items-center justify-center p-6 space-y-4">
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-serif italic text-lg text-rose-800 font-bold">Opening your love surprise…</p>
      </div>
    );
  }

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
        <button onClick={onNavigateHome}
          className="px-6 py-3 bg-[#1A1A1A] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-rose-900 transition-colors shadow-lg">
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
        <button onClick={onNavigateHome}
          className="px-6 py-3 bg-[#1A1A1A] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-rose-900 transition-colors shadow-lg">
          Go to LoveLink Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <button onClick={onNavigateHome}
        className="fixed top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-rose-200 text-rose-700 hover:text-rose-900 transition-colors text-xs font-serif italic shadow-md">
        <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
        <span className="font-bold">LoveLink</span>
      </button>

      {/* ── JSON-driven renderer (primary) ── */}
      {templateSpec ? (
        <TemplateRenderer
          template={templateSpec}
          userData={surprise}
        />
      ) : (
        /* ── Legacy fallback (while templateSpec is resolving) ── */
        <SurpriseThemeView surprise={surprise} />
      )}
    </div>
  );
};
