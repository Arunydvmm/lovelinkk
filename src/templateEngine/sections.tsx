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
  /** Which way the visitor was travelling when this section mounted. Used by self-skipping sections. */
  direction?: 'forward' | 'back';
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

// ─── Style helpers (theme tokens → CSS) ───────────────────────────────────────

const RADIUS_PX = { sharp: 4, soft: 16, round: 28 } as const;
const BUTTON_PX = { square: 4, rounded: 16, pill: 9999 } as const;

/** Card corner radius in px. Falls back to the classic look when the theme sets nothing. */
function cardR(theme: TemplateTheme, fallback = 16): number {
  return theme.radius ? RADIUS_PX[theme.radius] : fallback;
}
/** Button corner radius in px. */
function btnR(theme: TemplateTheme, fallback = 16): number {
  if (theme.buttonShape) return BUTTON_PX[theme.buttonShape];
  return theme.radius ? RADIUS_PX[theme.radius] : fallback;
}
function shadowOf(theme: TemplateTheme): string | undefined {
  return theme.cardShadow;
}
function headingCss(theme: TemplateTheme): React.CSSProperties {
  return {
    fontFamily: theme.fontSerif,
    color: theme.headingColor,
    textTransform: theme.headingStyle === 'uppercase' ? 'uppercase' : undefined,
    letterSpacing: theme.headingStyle === 'uppercase' ? '0.08em' : undefined,
    fontStyle: theme.headingStyle === 'italic' ? 'italic' : undefined,
  };
}

/** Replace {partnerName} / {creatorName} / {nickname} … with real data. */
function fill(text: string | undefined, fallback: string, u: SurpriseData): string {
  const t = text ?? fallback;
  return t.replace(/\{(\w+)\}/g, (_m, k) => {
    const v = (u as any)[k];
    return v === undefined || v === null ? '' : String(v);
  });
}

/** Shared badge + heading block used by every section. JSON can override all text. */
function SectionHeader({
  theme, userData, cfg, badge, title, children,
}: {
  theme: TemplateTheme; userData: SurpriseData; cfg: any;
  badge: React.ReactNode; title: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <div className="text-center space-y-1">
      <span className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1"
        style={{ background: theme.cardBg, color: theme.accent, borderRadius: btnR(theme, 9999) }}>
        {cfg?.badge !== undefined ? fill(cfg.badge, '', userData) : badge}
      </span>
      <h2 className="text-2xl font-bold pt-1" style={headingCss(theme)}>
        {cfg?.title !== undefined ? fill(cfg.title, '', userData) : title}
      </h2>
      {cfg?.subtitle && (
        <p className="text-xs opacity-70" style={{ color: theme.textColor }}>
          {fill(cfg.subtitle, '', userData)}
        </p>
      )}
      {children}
    </div>
  );
}

// ─── Nav Buttons ──────────────────────────────────────────────────────────────

function NavRow({
  onBack, onNext, nextLabel = 'Continue →', theme,
}: { onBack: () => void; onNext: () => void; nextLabel?: string; theme: TemplateTheme }) {
  return (
    <div className="flex items-center gap-3 w-full mt-5">
      <button onClick={onBack}
        className="w-1/4 py-3 border-2 font-bold text-sm flex items-center justify-center gap-1 min-h-[48px] transition-all active:scale-95"
        style={{ borderColor: theme.cardBorder, color: theme.textColor, background: theme.cardBg, borderRadius: btnR(theme) }}>
        <ChevronLeft size={16} /> Back
      </button>
      <button onClick={onNext}
        className="flex-1 py-3 font-bold text-sm flex items-center justify-center gap-2 min-h-[48px] shadow-lg transition-all active:scale-95"
        style={{ background: theme.accent, color: '#fff', borderRadius: btnR(theme) }}>
        {nextLabel} <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────

export function HeroSectionRenderer({ config, userData, theme, onNext }: SectionProps) {
  const cfg = config as HeroSection;
  const anim = getAnim(cfg.animation);
  const layout = cfg.layout ?? 'circle';
  const cover = userData.coverImage || userData.memoryImages?.[0]?.url || '';
  const profilePic = userData.profilePicture || cover;
  const subtitle = cfg.subtitleField
    ? String((userData as any)[cfg.subtitleField] ?? '')
    : `"${userData.title ?? ''}"`;

  const picture =
    layout === 'minimal' || !cover ? null : layout === 'banner' ? (
      <div className="relative w-full">
        <div className="absolute -inset-2 blur-2xl opacity-40" style={{ background: theme.accent, borderRadius: cardR(theme, 24) }} />
        <img src={cover} alt="Cover"
          className="relative w-full h-56 object-cover shadow-2xl"
          style={{ borderRadius: cardR(theme, 24), border: `3px solid ${theme.accent}` }} />
      </div>
    ) : (
      <div className="relative">
        <div className="absolute -inset-3 rounded-full blur-2xl opacity-60 animate-pulse"
          style={{ background: theme.accent }} />
        <div className="relative w-44 h-44 rounded-full border-4 overflow-hidden shadow-2xl"
          style={{ borderColor: theme.accent }}>
          <img src={cfg.showProfilePicture && profilePic ? profilePic : cover}
            alt="Cover" className="w-full h-full object-cover" />
        </div>
      </div>
    );

  return (
    <motion.div key="hero" {...anim} transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center space-y-6 py-8 px-2">
      {picture}

      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 border text-xs font-bold uppercase tracking-wider"
          style={{ background: theme.cardBg, borderColor: theme.cardBorder, color: theme.accent, borderRadius: btnR(theme, 9999) }}>
          <Sparkles size={12} />
          {cfg.badge !== undefined ? fill(cfg.badge, '', userData) : 'A Special Digital Surprise'}
        </span>
        <h1 className={`${layout === 'minimal' ? 'text-5xl' : 'text-3xl sm:text-4xl'} font-extrabold tracking-tight`}
          style={headingCss(theme)}>
          {cfg.title !== undefined ? fill(cfg.title, '', userData) : `${userData.creatorName} & ${userData.partnerName}`}
        </h1>
        {cfg.subtitle !== undefined ? (
          <p className="text-base opacity-80" style={{ fontFamily: theme.fontSerif, color: theme.textColor }}>
            {fill(cfg.subtitle, '', userData)}
          </p>
        ) : subtitle && (
          <p className="font-serif italic text-base opacity-80"
            style={{ fontFamily: theme.fontSerif, color: theme.textColor }}>
            {subtitle}
          </p>
        )}
        {userData.yearsTogether && (
          <p className="text-sm font-semibold opacity-70" style={{ color: theme.textColor }}>
            {userData.yearsTogether} {Number(userData.yearsTogether) === 1 ? 'year' : 'years'} together ❤️
          </p>
        )}
      </div>

      {userData.welcomeMessage && (
        <div className="w-full p-4 text-sm leading-relaxed"
          style={{
            background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, color: theme.textColor,
            borderRadius: cardR(theme), boxShadow: shadowOf(theme) ?? '0 10px 15px -3px rgba(0,0,0,0.1)',
          }}>
          {userData.welcomeMessage}
        </div>
      )}

      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onNext}
        className="w-full py-4 font-bold text-white flex items-center justify-center gap-2 shadow-xl min-h-[52px]"
        style={{ background: theme.accent, borderRadius: btnR(theme, 9999) }}>
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
      <NavRow onBack={onBack} onNext={onNext} nextLabel={cfg.nextLabel ?? "Skip →"} theme={theme} />
    </motion.div>
  );
}

// ─── LETTER ───────────────────────────────────────────────────────────────────

export function LetterSectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as LetterSection;
  const anim = getAnim(cfg.animation ?? 'slideLeft');
  const style = cfg.style ?? 'card';

  const boxStyle: React.CSSProperties =
    style === 'minimal'
      ? { borderLeft: `3px solid ${theme.accent}`, padding: '4px 0 4px 16px' }
      : style === 'paper'
      ? {
          background: `repeating-linear-gradient(transparent, transparent 27px, ${theme.cardBorder} 28px), ${theme.cardBg}`,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: Math.min(cardR(theme), 8),
          padding: '20px 20px 20px 24px',
          transform: 'rotate(-0.8deg)',
          boxShadow: shadowOf(theme) ?? '0 14px 30px rgba(0,0,0,0.18)',
        }
      : {
          background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
          borderRadius: cardR(theme), padding: 20,
          boxShadow: shadowOf(theme) ?? '0 20px 25px -5px rgba(0,0,0,0.1)',
        };

  const greeting = cfg.greeting !== undefined
    ? fill(cfg.greeting, '', userData)
    : `My Dearest ${userData.nickname || userData.partnerName},`;

  return (
    <motion.div key="letter" {...anim} transition={{ duration: 0.6 }}
      className="flex flex-col items-center space-y-5">
      <SectionHeader theme={theme} userData={userData} cfg={cfg}
        badge="From My Heart 💌" title="A Letter For You" />

      <div className="w-full relative overflow-hidden" style={boxStyle}>
        {userData.headline && (
          <p className="text-xs font-bold uppercase tracking-widest mb-3 opacity-70"
            style={{ color: theme.accent }}>
            {userData.headline}
          </p>
        )}
        <div className="space-y-4 leading-relaxed text-sm"
          style={{ fontFamily: theme.fontSerif, color: theme.textColor, lineHeight: style === 'paper' ? '28px' : undefined }}>
          <p className="font-bold text-base" style={{ color: theme.accent }}>{greeting}</p>
          <p className="whitespace-pre-line italic font-medium">{userData.loveLetter}</p>
          {cfg.showSignature !== false && (
            <div className="pt-4 text-right border-t" style={{ borderColor: theme.cardBorder }}>
              <p className="text-xs uppercase tracking-wider opacity-60">
                {cfg.closing !== undefined ? fill(cfg.closing, '', userData) : 'With all my love,'}
              </p>
              <p className="font-bold text-base" style={{ fontFamily: theme.fontSerif, color: theme.accent }}>
                {userData.letterSignature || userData.creatorName}
              </p>
            </div>
          )}
        </div>
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel={cfg.nextLabel ?? "Reasons Why I Love You →"} theme={theme} />
    </motion.div>
  );
}

// ─── REASONS ──────────────────────────────────────────────────────────────────

export function ReasonsSectionRenderer({ config, userData, theme, onNext, onBack }: SectionProps) {
  const cfg = config as ReasonsSection;
  const anim = getAnim(cfg.animation ?? 'fadeIn');
  const style = cfg.cardStyle ?? 'slide';
  const all = userData.reasons ?? [];
  const reasons = cfg.maxVisible && cfg.maxVisible > 0 ? all.slice(0, cfg.maxVisible) : all;
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [flipped, setFlipped] = useState(false);
  const swipeRef = useRef<number | null>(null);

  useEffect(() => { setFlipped(false); }, [idx]);

  const next = () => {
    if (idx < reasons.length - 1) {
      setDir(1);
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.7 }, colors: [theme.accent, '#fb7185'] });
      setIdx(i => i + 1);
    }
  };
  const prev = () => { if (idx > 0) { setDir(-1); setIdx(i => i - 1); } };

  const cardBox: React.CSSProperties = {
    background: theme.cardBg, border: `2px solid ${theme.cardBorder}`,
    borderRadius: cardR(theme, 24), boxShadow: shadowOf(theme) ?? '0 20px 25px -5px rgba(0,0,0,0.1)',
  };

  const reasonText = (
    <p className="text-base sm:text-lg italic font-medium leading-relaxed" style={headingCss(theme)}>
      "{reasons[idx]}"
    </p>
  );
  const iconBadge = (
    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-md" style={{ background: theme.accent }}>
      <Heart size={22} fill="white" className="text-white" />
    </div>
  );
  const numPill = (
    <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full"
      style={{ background: theme.cardBorder, color: theme.accent }}>
      #{idx + 1}
    </span>
  );

  return (
    <motion.div key="reasons" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-5">
      <SectionHeader theme={theme} userData={userData} cfg={cfg}
        badge="Reasons Why I Love You"
        title={`Reason ${idx + 1} of ${reasons.length}`} />

      <div className="flex gap-1.5">
        {reasons.map((_, i) => (
          <div key={i} className="rounded-full transition-all"
            style={{ width: i === idx ? 16 : 8, height: 8, background: i <= idx ? theme.accent : theme.cardBorder }} />
        ))}
      </div>

      <div className="w-full"
        onTouchStart={e => { swipeRef.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (swipeRef.current === null) return;
          const dx = e.changedTouches[0].clientX - swipeRef.current;
          if (Math.abs(dx) > 40) { if (dx < 0) next(); else prev(); }
          swipeRef.current = null;
        }}>
        {style === 'flip' ? (
          // Tap-to-reveal 3D flip card
          <div key={idx} style={{ perspective: 1000 }} className="w-full cursor-pointer"
            onClick={() => setFlipped(f => !f)}>
            <motion.div animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.6 }}
              style={{ transformStyle: 'preserve-3d', position: 'relative', minHeight: 220 }}>
              <div className="absolute inset-0 p-7 text-center flex flex-col items-center justify-center gap-4"
                style={{ ...cardBox, backfaceVisibility: 'hidden' }}>
                {iconBadge}
                {numPill}
                <p className="text-sm font-semibold opacity-80" style={{ color: theme.textColor }}>Tap to reveal 💌</p>
              </div>
              <div className="absolute inset-0 p-7 text-center flex flex-col items-center justify-center gap-4"
                style={{ ...cardBox, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                {numPill}
                {reasonText}
              </div>
            </motion.div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={idx}
              initial={style === 'fade' ? { opacity: 0 } : { opacity: 0, x: dir * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={style === 'fade' ? { opacity: 0 } : { opacity: 0, x: dir * -60 }}
              transition={{ duration: 0.3 }}
              className="w-full p-7 text-center min-h-[200px] flex flex-col items-center justify-center gap-4"
              style={cardBox}>
              {iconBadge}
              {numPill}
              {reasonText}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div className="flex gap-3 w-full">
        <button onClick={prev} disabled={idx === 0}
          className="flex-1 py-3 border-2 font-bold text-sm flex items-center justify-center gap-1 disabled:opacity-30 min-h-[48px] transition-all"
          style={{ borderColor: theme.cardBorder, color: theme.textColor, borderRadius: btnR(theme) }}>
          <ArrowLeft size={16} /> Previous
        </button>
        {idx < reasons.length - 1 ? (
          <button onClick={next}
            className="flex-1 py-3 font-bold text-sm flex items-center justify-center gap-1 shadow-md min-h-[48px] text-white transition-all"
            style={{ background: theme.accent, borderRadius: btnR(theme) }}>
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button onClick={onNext}
            className="flex-1 py-3 font-bold text-sm flex items-center justify-center gap-1 shadow-md min-h-[48px] text-white transition-all"
            style={{ background: theme.accent, borderRadius: btnR(theme) }}>
            {cfg.nextLabel ?? 'See Memories'} <ChevronRight size={16} />
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
  const layout = cfg.layout ?? 'grid';
  const photos = (userData.memoryImages ?? []).slice(0, cfg.maxPhotos ?? 20);
  const [active, setActive] = useState<string | null>(null);
  const showCap = cfg.showCaptions !== false;
  const showDate = cfg.showDates !== false;
  const cols = Math.min(Math.max(cfg.columns ?? 2, 1), 3);

  const overlay = (img: any) =>
    (showCap || showDate) && (img.caption || img.date) ? (
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
        {showDate && img.date && (
          <span className="text-[10px] opacity-80 flex items-center gap-0.5 text-white">
            <Calendar size={9} /> {img.date}
          </span>
        )}
        {showCap && img.caption && <p className="text-xs text-white line-clamp-2 font-medium">{img.caption}</p>}
      </div>
    ) : null;

  const radius = Math.min(cardR(theme, 12), 20);

  let body: React.ReactNode;
  if (layout === 'polaroid') {
    body = (
      <div className="w-full grid grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto p-2">
        {photos.map((img, i) => (
          <motion.div key={img.id || i} whileTap={{ scale: 0.97 }}
            onClick={() => setActive(img.url)}
            className="cursor-pointer shadow-xl"
            style={{
              background: '#fff', padding: '8px 8px 10px', borderRadius: 4,
              transform: `rotate(${i % 2 === 0 ? -2.5 : 2.5}deg)`,
            }}>
            <img src={img.url} alt={img.caption || 'Memory'} className="w-full aspect-square object-cover" />
            {(showCap || showDate) && (
              <p className="text-[11px] text-center mt-2 text-gray-700 line-clamp-2" style={{ fontFamily: theme.fontSerif }}>
                {showCap && img.caption ? img.caption : ''}{showDate && img.date ? ` · ${img.date}` : ''}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    );
  } else if (layout === 'carousel') {
    body = (
      <div className="w-full flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1">
        {photos.map((img, i) => (
          <div key={img.id || i} onClick={() => setActive(img.url)}
            className="relative snap-center shrink-0 w-[78%] aspect-[4/5] overflow-hidden cursor-pointer shadow-lg"
            style={{ borderRadius: radius, border: `1px solid ${theme.cardBorder}` }}>
            <img src={img.url} alt={img.caption || 'Memory'} className="w-full h-full object-cover" />
            {overlay(img)}
          </div>
        ))}
      </div>
    );
  } else if (layout === 'masonry') {
    body = (
      <div className="w-full max-h-[55vh] overflow-y-auto" style={{ columnCount: 2, columnGap: 12 }}>
        {photos.map((img, i) => (
          <div key={img.id || i} onClick={() => setActive(img.url)}
            className="relative mb-3 overflow-hidden cursor-pointer shadow-md break-inside-avoid"
            style={{ borderRadius: radius, border: `1px solid ${theme.cardBorder}` }}>
            <img src={img.url} alt={img.caption || 'Memory'} className="w-full block" />
            {overlay(img)}
          </div>
        ))}
      </div>
    );
  } else {
    body = (
      <div className="w-full grid gap-3 max-h-[55vh] overflow-y-auto"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {photos.map((img, i) => (
          <motion.div key={img.id || i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setActive(img.url)}
            className="relative overflow-hidden cursor-pointer shadow-md"
            style={{ aspectRatio: '1', borderRadius: radius, border: `1px solid ${theme.cardBorder}` }}>
            <img src={img.url} alt={img.caption || 'Memory'} className="w-full h-full object-cover" />
            {overlay(img)}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <motion.div key="gallery" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-5">
      <SectionHeader theme={theme} userData={userData} cfg={cfg}
        badge="📸 Precious Moments" title="Our Memories">
        {showCap && <p className="text-xs opacity-60" style={{ color: theme.textColor }}>Tap any photo to enlarge</p>}
      </SectionHeader>

      {body}

      <NavRow onBack={onBack} onNext={onNext} nextLabel={cfg.nextLabel ?? 'Music 🎵 →'} theme={theme} />

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
      <SectionHeader theme={theme} userData={userData} cfg={cfg}
        badge="📅 Our Story" title="Our Journey Together" />

      {cfg.layout === 'cards' ? (
        <div className="w-full space-y-3 max-h-[55vh] overflow-y-auto pr-1">
          {items.map((ev, i) => (
            <motion.div key={ev.id || i}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-4 space-y-2"
              style={{
                background: theme.cardBg, border: `1px solid ${theme.cardBorder}`,
                borderRadius: cardR(theme), boxShadow: shadowOf(theme) ?? '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}>
              <div className="flex items-center gap-2">
                {ev.icon && <span className="text-xl">{ev.icon}</span>}
                {ev.date && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: theme.accent }}>
                    {typeof ev.date === 'string' ? ev.date : new Date(ev.date).toLocaleDateString()}
                  </span>
                )}
              </div>
              {ev.title && <p className="text-sm font-bold" style={{ color: theme.headingColor }}>{ev.title}</p>}
              {ev.description && (
                <p className="text-xs leading-relaxed italic" style={{ color: theme.textColor, fontFamily: theme.fontSerif }}>
                  {ev.description}
                </p>
              )}
              {cfg.showPhotos !== false && ev.photo && (
                <img src={ev.photo} alt={ev.title} className="w-full h-32 object-cover"
                  style={{ borderRadius: Math.min(cardR(theme), 14) }} />
              )}
            </motion.div>
          ))}
        </div>
      ) : (
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
      )}

      <NavRow onBack={onBack} onNext={onNext} nextLabel={cfg.nextLabel ?? "Gallery 📸 →"} theme={theme} />
    </motion.div>
  );
}

// ─── QUOTES ───────────────────────────────────────────────────────────────────

export function QuotesSectionRenderer({ config, userData, theme, onNext, onBack, direction }: SectionProps) {
  const cfg = config as QuotesSection;
  const anim = getAnim(cfg.animation ?? 'fadeUp');
  const allQuotes = userData.quotes ?? [];
  const filtered = cfg.filter ? allQuotes.filter(q => cfg.filter!.includes(q.type)) : allQuotes;

  const isEmpty = filtered.length === 0;

  // No quotes — skip this section automatically (in the direction the visitor was travelling).
  // Must run in an effect: calling onNext()/onBack() during render updates the parent mid-render.
  useEffect(() => {
    if (!isEmpty) return;
    if (direction === 'back') onBack(); else onNext();
  }, [isEmpty]);

  if (isEmpty) return null;

  const typeLabel: Record<string, string> = {
    'quote': '💬 Quote', 'inside-joke': '😄 Inside Joke',
    'promise': '🤞 Promise', 'goal': '🌟 Goal',
  };

  return (
    <motion.div key="quotes" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-5">
      <SectionHeader theme={theme} userData={userData} cfg={cfg}
        badge="Words From The Heart" title="Quotes & Promises" />

      <div className="w-full space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {filtered.map((q, i) => (
          <motion.div key={q.id || i}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 shadow-md space-y-2"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: cardR(theme), boxShadow: shadowOf(theme) }}>
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

      <NavRow onBack={onBack} onNext={onNext} nextLabel={cfg.nextLabel ?? "Music 🎵 →"} theme={theme} />
    </motion.div>
  );
}

// ─── MUSIC ────────────────────────────────────────────────────────────────────

export function MusicSectionRenderer({ config, userData, theme, onNext, onBack, audioRef, isPlayingMusic, setIsPlayingMusic }: SectionProps) {
  const cfg = config as MusicSection;
  const anim = getAnim(cfg.animation ?? 'fadeIn');
  const [isMuted, setIsMuted] = useState(false);

  // autoplay: true in the JSON starts the song as soon as this section opens
  useEffect(() => {
    if (cfg.autoplay && audioRef.current && !isPlayingMusic) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  }, []);

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
      <SectionHeader theme={theme} userData={userData} cfg={cfg}
        badge="🎵 Our Song" title="Background Serenade" />

      <div className="w-full p-5 shadow-xl space-y-4"
        style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: cardR(theme), boxShadow: shadowOf(theme) }}>
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

      <NavRow onBack={onBack} onNext={onNext} nextLabel={cfg.nextLabel ?? "Certificate 🏆 →"} theme={theme} />
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
      <SectionHeader theme={theme} userData={userData} cfg={cfg}
        badge={<><Award size={12} className="inline mr-1" /> Official Certificate</>}
        title={userData.certificate?.certificateType === 'Best Friend'
          ? 'Certificate of Friendship'
          : userData.certificate?.certificateType === 'Husband' || userData.certificate?.certificateType === 'Wife'
          ? 'Certificate of Forever'
          : 'Certificate of Love'} />

      <CertificateComponent
        data={userData.certificate || {
          recipientName: userData.partnerName,
          presentedBy: userData.creatorName,
          award: 'Best Partner ❤️',
          date: new Date().toLocaleDateString(),
        }}
        allowDownload={cfg.allowDownload !== false}
      />

      <NavRow onBack={onBack} onNext={onNext} nextLabel={cfg.nextLabel ?? "Final Surprise 🎁 →"} theme={theme} />
    </motion.div>
  );
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────

export function CountdownSectionRenderer({ config, userData, theme, onNext, onBack, direction }: SectionProps) {
  const cfg = config as CountdownSection;
  const anim = getAnim(cfg.animation ?? 'fadeUp');
  const targetDate = userData.countdownDate ? new Date(userData.countdownDate) : null;

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!targetDate || isNaN(targetDate.getTime())) return;
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

  // No (or invalid) target date — skip this section automatically. Effect, not render-time call.
  const hasTarget = !!targetDate && !isNaN(targetDate.getTime());
  useEffect(() => {
    if (hasTarget) return;
    if (direction === 'back') onBack(); else onNext();
  }, [hasTarget]);

  if (!hasTarget) return null;

  return (
    <motion.div key="countdown" {...anim} transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-6">
      <SectionHeader theme={theme} userData={userData} cfg={cfg}
        badge="⏳ Countdown" title={cfg.label || 'Counting Down To Our Day'} />

      <div className="grid grid-cols-4 gap-3 w-full">
        {[
          { value: timeLeft.days,  label: 'Days' },
          { value: timeLeft.hours, label: 'Hours' },
          { value: timeLeft.mins,  label: 'Mins' },
          { value: timeLeft.secs,  label: 'Secs' },
        ].map(({ value, label }) => (
          <div key={label} className="p-4 text-center shadow-lg"
            style={{ background: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: cardR(theme), boxShadow: shadowOf(theme) }}>
            <p className="text-3xl font-extrabold" style={{ color: theme.accent }}>
              {String(value).padStart(2, '0')}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: theme.textColor }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      <NavRow onBack={onBack} onNext={onNext} nextLabel={cfg.nextLabel} theme={theme} />
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
        finalMessage={cfg.message !== undefined ? fill(cfg.message, '', userData) : userData.finalMessage}
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
