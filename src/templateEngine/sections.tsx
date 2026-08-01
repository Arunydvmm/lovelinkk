/**
 * Section Renderers — each receives the section config from JSON + resolved userData.
 * Zero hardcoded template names or switch statements.
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Heart, ChevronRight, ChevronLeft, Play, Pause, Volume2, VolumeX,
  ArrowLeft, ArrowRight, Award, Calendar, Quote, X, Share2,
  RotateCcw, Download, Sparkles,
} from 'lucide-react';
import {
  TemplateTheme, HeroSection, LetterSection, ReasonsSection,
  GallerySection, TimelineSection, QuotesSection, MusicSection,
  CertificateSection, CountdownSection, EndingSection, GiftOpeningSection,
} from './types';
import { SurpriseData } from '../types';
import { CertificateComponent } from '../components/CertificateComponent';
import { CuteCatGift } from '../components/CuteCatGift';
import { BouquetGoodbyeCat } from '../components/BouquetGoodbyeCat';

export interface SectionProps {
  config: any;           // typed per section below
  userData: SurpriseData;
  theme: TemplateTheme;
  onNext: () => void;
  onBack: () => void;
  onReplay: () => void;
  isFirst: boolean;
  isLast: boolean;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  isPlayingMusic: boolean;
  setIsPlayingMusic: (v: boolean) => void;
}

// ─── Animation variants ───────────────────────────────────────────────────────

const ANIM: Record<string, { initial: object; animate: object; exit: object }> = {
  fadeUp:    { initial: { opacity: 0, y: 24 },  animate: { opacity: 1, y: 0 },    exit: { opacity: 0, y: -24 } },
  fadeIn:    { initial: { opacity: 0 },          animate: { opacity: 1 },           exit: { opacity: 0 } },
  slideLeft: { initial: { opacity: 0, x: 40 },   animate: { opacity: 1, x: 0 },    exit: { opacity: 0, x: -40 } },
  slideRight:{ initial: { opacity: 0, x: -40 },  animate: { opacity: 1, x: 0 },    exit: { opacity: 0, x: 40 } },
  zoomIn:    { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 } },
  none:      { initial: {}, animate: {}, exit: {} },
};

function getAnim(preset?: string) {
  return ANIM[preset ?? 'fadeUp'] ?? ANIM.fadeUp;
}

// ─── Nav Buttons ──────────────────────────────────────────────────────────────

function NavRow({
  onBack, onNext, nextLabel = 'Continue →', theme,
}: { onBack: () => void; onNext: () => void; nextLabel?: string; theme: TemplateTheme }) {
  return (
    <div className="flex items-center gap-3 w-full mt-5">
      <button onClick={onBack}
        className="w-1/4 py-3 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-1 min-h-[48px] transition-all active:scale-95"
        style={{ borderColor: theme.cardBorder, color: theme.textColor, background: theme.cardBg }}>
        <ChevronLeft size={16} /> Back
      </button>
      <button onClick={onNext}
        className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 min-h-[48px] shadow-lg transition-all active:scale-95"
        style={{ background: theme.accent, color: '#fff' }}>
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

export function HeroSectionRenderer({ config, userData, theme, onNext }: SectionProps) {
  const cfg = config as HeroSection;
  const anim = getAnim(cfg.animation);
  const cover = userData.coverImage || userData.memoryImages?.[0]?.url || '';
  const profilePic = userData.profilePicture || cover;

  return (
    <motion.div key="hero" {...anim} transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center space-y-6 py-8 px-2">
      {/* Cover circle */}
      {cover && (
        <div className="relative">
          <div className="absolute -inset-3 rounded-full blur-2xl opacity-60 animate-pulse"
            style={{ background: theme.accent }} />
          <div className="relative w-44 h-44 rounded-full border-4 overflow-hidden shadow-2xl"
            style={{ borderColor: theme.accent }}>
            <img src={cfg.showProfilePicture && profilePic ? profilePic : cover}
              alt="Cover" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Names & title */}
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider"
          style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.accent }}>
          <Sparkles size={12} /> A Special Digital Surprise
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
          {userData.creatorName} & {userData.partnerName}
        </h1>
        <p className="font-serif italic text-base opacity-80"
          style={{ fontFamily: theme.fontSerif, color: theme.textColor }}>
          "{userData.title}"
        </p>
        {userData.yearsTogether && (
          <p className="text-sm font-semibold opacity-70" style={{ color: theme.textColor }}>
            {userData.yearsTogether} {Number(userData.yearsTogether) === 1 ? 'year' : 'years'} together ❤️
          </p>
        )}
      </div>

      {/* Welcome message */}
      <div className="w-full rounded-2xl p-4 text-sm leading-relaxed shadow-lg"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textColor }}>
        {userData.welcomeMessage}
      </div>

      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext}
        className="w-full py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 shadow-xl min-h-[52px]"
        style={{ background: theme.accent }}>
        <Heart fill="white" size={18} />
        {cfg.buttonLabel || 'Open Our Story'}
        <ChevronRight size={18} />
      </motion.button>
    </motion.div>
  );
}

// ─── GIFT OPENING ─────────────────────────────────────────────────────────────

export function GiftOpeningSectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as GiftOpeningSection;
  const anim = getAnim(cfg.animation ?? 'zoomIn');
  return (
    <motion.div key="gift" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center text-center py-4">
      <CuteCatGift partnerName={userData.partnerName} onOpenGift={onNext} />
      <NavRow onBack={onBack} onNext={onNext} nextLabel="Skip →" theme={theme} />
    </motion.div>
  );
}

// ─── LETTER ───────────────────────────────────────────────────────────────────

export function LetterSectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as LetterSection;
  const anim = getAnim(cfg.animation ?? 'slideLeft');
  return (
    <motion.div key="letter" {...anim} transition={{ duration: 0.6 }}
      className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: theme.cardBg, color: theme.accent }}>
          From My Heart 💌
        </span>
        <h2 className="text-2xl font-bold pt-1"
          style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
          A Letter For You
        </h2>
      </div>

      <div className="w-full rounded-2xl p-5 shadow-xl relative overflow-hidden"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        {userData.headline && (
          <p className="text-xs font-bold uppercase tracking-widest mb-3 opacity-70"
            style={{ color: theme.accent }}>
            {userData.headline}
          </p>
        )}
        <div className="space-y-4 leading-relaxed text-sm"
          style={{ fontFamily: theme.fontSerif, color: theme.textColor }}>
          <p className="font-bold text-base" style={{ color: theme.accent }}>
            My Dearest {userData.nickname || userData.partnerName},
          </p>
          <p className="whitespace-pre-line italic font-medium">{userData.loveLetter}</p>
          {cfg.showSignature !== false && (
            <div className="pt-4 text-right border-t" style={{ borderColor: theme.cardBorder }}>
              <p className="text-xs uppercase tracking-wider opacity-60">With all my love,</p>
              <p className="font-bold text-base" style={{ fontFamily: theme.fontSerif, color: theme.accent }}>
                {userData.letterSignature || userData.creatorName}
              </p>
            </div>
          )}
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Reasons Why I Love You →" theme={theme} />
    </motion.div>
  );
}

// ─── REASONS ──────────────────────────────────────────────────────────────────

export function ReasonsSectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as ReasonsSection;
  const anim = getAnim(cfg.animation ?? 'fadeIn');
  const reasons = userData.reasons ?? [];
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const swipeRef = useRef<number | null>(null);

  const next = () => {
    if (idx < reasons.length - 1) {
      setDir(1);
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.7 }, colors: [theme.accent, '#fb7185'] });
      setIdx(i => i + 1);
    }
  };
  const prev = () => { if (idx > 0) { setDir(-1); setIdx(i => i - 1); } };

  return (
    <motion.div key="reasons" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: theme.cardBg, color: theme.accent }}>
          Reasons Why I Love You
        </span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
          Reason {idx + 1} of {reasons.length}
        </h2>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {reasons.map((_, i) => (
          <div key={i} className="rounded-full transition-all"
            style={{
              width: i === idx ? 16 : 8, height: 8,
              background: i <= idx ? theme.accent : theme.cardBorder,
            }} />
        ))}
      </div>

      {/* Flash card */}
      <div className="w-full"
        onTouchStart={e => { swipeRef.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (swipeRef.current === null) return;
          const dx = e.changedTouches[0].clientX - swipeRef.current;
          if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
          swipeRef.current = null;
        }}>
        <AnimatePresence mode="wait">
          <motion.div key={idx}
            initial={{ opacity: 0, x: dir * 60 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -60 }} transition={{ duration: 0.3 }}
            className="w-full rounded-3xl p-7 text-center shadow-xl min-h-[200px] flex flex-col items-center justify-center gap-4"
            style={{ background: theme.cardBg, border: `2px solid ${theme.cardBorder}` }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md"
              style={{ background: theme.accent }}>
              <Heart size={22} fill="white" className="text-white" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{ background: theme.cardBorder, color: theme.accent }}>
              #{idx + 1}
            </span>
            <p className="text-base sm:text-lg italic font-medium leading-relaxed"
              style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
              "{reasons[idx]}"
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3 w-full">
        <button onClick={prev} disabled={idx === 0}
          className="flex-1 py-3 rounded-2xl border-2 font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-30 min-h-[48px] transition-all"
          style={{ borderColor: theme.cardBorder, color: theme.textColor }}>
          <ArrowLeft size={16} /> Previous
        </button>
        {idx < reasons.length - 1 ? (
          <button onClick={next}
            className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-1 shadow-md min-h-[48px] text-white transition-all"
            style={{ background: theme.accent }}>
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={onNext}
            className="flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-1 shadow-md min-h-[48px] text-white transition-all"
            style={{ background: theme.accent }}>
            See Memories <ChevronRight size={16} />
          </button>
        )}
      </div>

      <button onClick={onBack} className="text-xs underline opacity-50 transition-opacity hover:opacity-80"
        style={{ color: theme.accent }}>
        ← Back to Letter
      </button>
    </motion.div>
  );
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────

export function GallerySectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as GallerySection;
  const anim = getAnim(cfg.animation ?? 'fadeUp');
  const photos = (userData.memoryImages ?? []).slice(0, cfg.maxPhotos ?? 20);
  const [active, setActive] = useState<string | null>(null);

  return (
    <motion.div key="gallery" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: theme.cardBg, color: theme.accent }}>
          📸 Precious Moments
        </span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
          Our Memories
        </h2>
        {cfg.showCaptions !== false && (
          <p className="text-xs opacity-60" style={{ color: theme.textColor }}>Tap any photo to enlarge</p>
        )}
      </div>

      <div className="w-full grid grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto">
        {photos.map((img, i) => (
          <motion.div key={img.id || i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActive(img.url)}
            className="relative rounded-xl overflow-hidden cursor-pointer shadow-md"
            style={{ aspectRatio: '1', border: `1px solid ${theme.cardBorder}` }}>
            <img src={img.url} alt={img.caption || 'Memory'} className="w-full h-full object-cover" />
            {(cfg.showCaptions !== false || cfg.showDates !== false) && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                {cfg.showDates !== false && img.date && (
                  <span className="text-[10px] opacity-80 flex items-center gap-0.5 text-white">
                    <Calendar size={9} /> {img.date}
                  </span>
                )}
                {cfg.showCaptions !== false && img.caption && (
                  <p className="text-xs text-white line-clamp-2 font-medium">{img.caption}</p>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Music 🎵 →" theme={theme} />

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActive(null)}>
            <button onClick={() => setActive(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800/80 text-white rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center">
              <X size={20} />
            </button>
            <img src={active} alt="Enlarged"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────

export function TimelineSectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as TimelineSection;
  const anim = getAnim(cfg.animation ?? 'fadeUp');
  const events = userData.timeline ?? [];

  // Fallback to memory image dates if no timeline events
  const items = events.length > 0 ? events : (userData.memoryImages ?? []).slice(0, 4).map((m, i) => ({
    id: m.id || String(i),
    title: m.caption || 'Our Memory',
    date: m.date || '',
    description: '',
    photo: m.url,
    icon: '💑',
  }));

  return (
    <motion.div key="timeline" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: theme.cardBg, color: theme.accent }}>
          📅 Our Story
        </span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
          Our Journey Together
        </h2>
      </div>

      <div className="w-full relative pl-5 space-y-5 py-2"
        style={{ borderLeft: `2px solid ${theme.accent}` }}>
        {items.map((ev, i) => (
          <motion.div key={ev.id || i}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 }}
            className="relative space-y-1.5">
            <div className="absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm text-xs"
              style={{ background: theme.accent }}>
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>

            {ev.icon && (
              <span className="text-lg">{ev.icon}</span>
            )}
            {ev.date && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                style={{ background: theme.cardBg, color: theme.accent, border: `1px solid ${theme.cardBorder}` }}>
                <Calendar size={9} /> {typeof ev.date === 'string' ? ev.date : new Date(ev.date).toLocaleDateString()}
              </span>
            )}
            {ev.title && (
              <p className="text-sm font-bold" style={{ color: theme.headingColor }}>{ev.title}</p>
            )}
            {ev.description && (
              <p className="text-xs leading-relaxed italic" style={{ color: theme.textColor, fontFamily: theme.fontSerif }}>
                {ev.description}
              </p>
            )}
            {cfg.showPhotos !== false && ev.photo && (
              <img src={ev.photo} alt={ev.title}
                className="w-full h-28 object-cover rounded-xl mt-1 shadow-md"
                style={{ border: `1px solid ${theme.cardBorder}` }} />
            )}
          </motion.div>
        ))}
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Gallery 📸 →" theme={theme} />
    </motion.div>
  );
}

// ─── QUOTES ───────────────────────────────────────────────────────────────────

export function QuotesSectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as QuotesSection;
  const anim = getAnim(cfg.animation ?? 'fadeUp');
  const allQuotes = userData.quotes ?? [];
  const filtered = cfg.filter ? allQuotes.filter(q => cfg.filter!.includes(q.type)) : allQuotes;

  if (filtered.length === 0) {
    onNext(); // no quotes — skip this section automatically
    return null;
  }

  const typeLabel: Record<string, string> = {
    'quote': '💬 Quote', 'inside-joke': '😄 Inside Joke',
    'promise': '🤞 Promise', 'goal': '🌟 Goal',
  };

  return (
    <motion.div key="quotes" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: theme.cardBg, color: theme.accent }}>
          Words From The Heart
        </span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
          Quotes & Promises
        </h2>
      </div>

      <div className="w-full space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {filtered.map((q, i) => (
          <motion.div key={q.id || i}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-4 shadow-md space-y-2"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <span className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: theme.accent }}>
              {typeLabel[q.type] ?? q.type}
            </span>
            <p className="text-sm italic leading-relaxed"
              style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
              {q.emoji && <span className="mr-1">{q.emoji}</span>}"{q.text}"
            </p>
            {q.author && (
              <p className="text-xs text-right opacity-60" style={{ color: theme.textColor }}>
                — {q.author}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Music 🎵 →" theme={theme} />
    </motion.div>
  );
}

// ─── MUSIC ────────────────────────────────────────────────────────────────────

export function MusicSectionRenderer({ config, userData, theme, onNext, onBack, audioRef, isPlayingMusic, setIsPlayingMusic }: SectionProps) {
  const cfg = config as MusicSection;
  const anim = getAnim(cfg.animation ?? 'fadeIn');
  const [isMuted, setIsMuted] = useState(false);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) { audioRef.current.pause(); setIsPlayingMusic(false); }
    else { audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {}); }
  };
  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <motion.div key="music" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-5">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: theme.cardBg, color: theme.accent }}>
          🎵 Our Song
        </span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
          Background Serenade
        </h2>
      </div>

      <div className="w-full rounded-2xl p-5 shadow-xl space-y-4"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
        <div className="flex items-center gap-4">
          <button onClick={toggle}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-all active:scale-95"
            style={{ background: theme.accent }}>
            {isPlayingMusic ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: theme.headingColor }}>
              {userData.music?.name || 'Love Melody'}
            </p>
            <p className="text-xs opacity-60" style={{ color: theme.textColor }}>
              {isPlayingMusic ? '♫ Playing now…' : 'Tap to play'}
            </p>
          </div>
          <button onClick={toggleMute}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center transition-opacity"
            style={{ color: theme.accent }}>
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Animated waveform */}
        {cfg.showWaveform !== false && (
          <div className="flex items-end gap-0.5 h-8 justify-center">
            {[...Array(22)].map((_, i) => (
              <motion.div key={i} className="w-1.5 rounded-full"
                style={{ background: theme.accent, opacity: 0.7 }}
                animate={isPlayingMusic ? { height: [6, 18 + (i % 5) * 5, 6] } : { height: 4 }}
                transition={{ duration: 0.6 + (i % 4) * 0.15, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }} />
            ))}
          </div>
        )}
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Certificate 🏆 →" theme={theme} />
    </motion.div>
  );
}

// ─── CERTIFICATE ──────────────────────────────────────────────────────────────

export function CertificateSectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as CertificateSection;
  const anim = getAnim(cfg.animation ?? 'zoomIn');

  return (
    <motion.div key="cert" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-4">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: theme.cardBg, color: theme.accent }}>
          <Award size={12} className="inline mr-1" /> Official Certificate
        </span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
          {userData.certificate?.certificateType === 'Best Friend'
            ? 'Certificate of Friendship'
            : userData.certificate?.certificateType === 'Husband' || userData.certificate?.certificateType === 'Wife'
            ? 'Certificate of Forever'
            : 'Certificate of Love'}
        </h2>
      </div>

      <CertificateComponent
        data={userData.certificate || {
          recipientName: userData.partnerName,
          presentedBy: userData.creatorName,
          award: 'Best Partner ❤️',
          date: new Date().toLocaleDateString(),
        }}
        allowDownload={cfg.allowDownload !== false}
      />

      <NavRow onBack={onBack} onNext={onNext} nextLabel="Final Surprise 🎁 →" theme={theme} />
    </motion.div>
  );
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────

export function CountdownSectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as CountdownSection;
  const anim = getAnim(cfg.animation ?? 'fadeUp');
  const targetDate = userData.countdownDate ? new Date(userData.countdownDate) : null;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!targetDate) return;
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 }); return; }
      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000)  / 60000);
      const secs  = Math.floor((diff % 60000)    / 1000);
      setTimeLeft({ days, hours, mins, secs });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [userData.countdownDate]);

  if (!targetDate) { onNext(); return null; }

  return (
    <motion.div key="countdown" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-6">
      <div className="text-center space-y-1">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: theme.cardBg, color: theme.accent }}>
          ⏳ Countdown
        </span>
        <h2 className="text-2xl font-bold" style={{ fontFamily: theme.fontSerif, color: theme.headingColor }}>
          {cfg.label || 'Counting Down To Our Day'}
        </h2>
      </div>

      <div className="grid grid-cols-4 gap-3 w-full">
        {[
          { value: timeLeft.days,  label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.mins,  label: 'Mins' },
          { value: timeLeft.secs,  label: 'Secs' },
        ].map(({ value, label }) => (
          <div key={label} className="rounded-2xl p-4 text-center shadow-lg"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}` }}>
            <p className="text-3xl font-extrabold" style={{ color: theme.accent }}>
              {String(value).padStart(2, '0')}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: theme.textColor }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <NavRow onBack={onBack} onNext={onNext} theme={theme} />
    </motion.div>
  );
}

// ─── ENDING ───────────────────────────────────────────────────────────────────

export function EndingSectionRenderer({ config, userData, theme, onBack, onReplay }: SectionProps) {
  const cfg = config as EndingSection;
  const anim = getAnim(cfg.animation ?? 'zoomIn');

  useEffect(() => {
    if (cfg.showConfetti !== false) {
      confetti({ particleCount: 120, spread: 160, origin: { y: 0.5 }, colors: [theme.accent, '#fb7185', '#fda4af', '#fff'] });
    }
  }, []);

  return (
    <motion.div key="ending" {...anim} transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center">
      <BouquetGoodbyeCat
        partnerName={userData.partnerName}
        creatorName={userData.creatorName}
        finalMessage={userData.finalMessage}
        onReplay={() => { if (cfg.showReplay !== false) onReplay(); }}
        onShare={() => {
          if (cfg.showShare !== false) {
            if (navigator.share) {
              navigator.share({ title: userData.title, url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('Link copied!');
            }
          }
        }}
      />
      <button onClick={onBack}
        className="mt-4 text-xs underline opacity-50 hover:opacity-80 transition-opacity"
        style={{ color: theme.accent }}>
        ← Back to Certificate
      </button>
    </motion.div>
  );
}
