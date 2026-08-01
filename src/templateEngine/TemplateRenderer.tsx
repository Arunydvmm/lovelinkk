/**
 * TemplateRenderer
 *
 * The single component that turns a TemplateSpec JSON + SurpriseData into a
 * live, cinematic, personalized page.
 *
 * Architecture:
 *  - Reads template.sections[] array — NO switch(slug), NO if(name)
 *  - Looks up each section.type in the SECTION_REGISTRY
 *  - Renders the matching component with theme tokens + userData
 *  - Falls back gracefully if a section type is unknown
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { TemplateSpec, TemplateSectionDef, TemplateTheme } from './types';
import { SurpriseData } from '../types';
import {
  SectionProps,
  HeroSectionRenderer,
  GiftOpeningSectionRenderer,
  LetterSectionRenderer,
  ReasonsSectionRenderer,
  GallerySectionRenderer,
  TimelineSectionRenderer,
  QuotesSectionRenderer,
  MusicSectionRenderer,
  CertificateSectionRenderer,
  CountdownSectionRenderer,
  EndingSectionRenderer,
} from './sections';

// ─── Section Registry ─────────────────────────────────────────────────────────
// Adding a new section type requires ONLY adding an entry here.

const SECTION_REGISTRY: Partial<Record<string, React.ComponentType<SectionProps>>> = {
  'hero':          HeroSectionRenderer,
  'gift-opening':  GiftOpeningSectionRenderer,
  'letter':        LetterSectionRenderer,
  'reasons':       ReasonsSectionRenderer,
  'gallery':       GallerySectionRenderer,
  'timeline':      TimelineSectionRenderer,
  'quotes':        QuotesSectionRenderer,
  'music':         MusicSectionRenderer,
  'certificate':   CertificateSectionRenderer,
  'countdown':     CountdownSectionRenderer,
  'ending':        EndingSectionRenderer,
};

// ─── Default fallback theme ───────────────────────────────────────────────────

const DEFAULT_THEME: TemplateTheme = {
  background: 'linear-gradient(135deg, #fce7f3 0%, #fff1f2 40%, #fce7f3 100%)',
  accent: '#f43f5e',
  headingColor: '#4c0519',
  textColor: '#9f1239',
  cardBg: 'rgba(255,255,255,0.92)',
  cardBorder: '#fecdd3',
  fontSerif: "'Playfair Display', Georgia, serif",
  fontSans: "'Plus Jakarta Sans', system-ui, sans-serif",
  particle: '❤️',
  particleCount: 8,
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface TemplateRendererProps {
  /** Parsed TemplateSpec from the database templateJson field */
  template: TemplateSpec;
  /** The user's personalization data */
  userData: SurpriseData;
  isMobilePreview?: boolean;
}

// ─── Floating particles ───────────────────────────────────────────────────────

function FloatingParticles({ theme }: { theme: TemplateTheme }) {
  const count = theme.particleCount ?? 8;
  const emoji = theme.particle ?? '❤️';
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <motion.div key={i}
          className="absolute text-2xl select-none"
          style={{ left: `${(i * 17 + 5) % 95}%` }}
          initial={{ y: '108vh', scale: 0.4 + (i % 3) * 0.2, opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.6, 0.6, 0] }}
          transition={{
            duration: 12 + (i % 6) * 2,
            repeat: Infinity,
            delay: i * 1.4,
            ease: 'linear',
          }}>
          {emoji}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Music Pill ───────────────────────────────────────────────────────────────

function MusicPill({
  theme, musicName, isPlaying, isMuted, onToggle, onToggleMute,
}: {
  theme: TemplateTheme; musicName: string;
  isPlaying: boolean; isMuted: boolean;
  onToggle: () => void; onToggleMute: () => void;
}) {
  return (
    <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg px-3 py-1.5 text-xs"
      style={{ border: `1px solid ${theme.cardBorder}` }}>
      <button onClick={onToggle}
        className="w-7 h-7 rounded-full flex items-center justify-center text-white shadow-md transition-all active:scale-95"
        style={{ background: theme.accent }}>
        {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
      </button>
      <span className="max-w-[80px] truncate font-semibold hidden sm:block"
        style={{ color: theme.headingColor }}>{musicName}</span>
      <button onClick={onToggleMute}
        className="p-1 transition-colors"
        style={{ color: theme.accent }}>
        {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
      </button>
    </motion.div>
  );
}

// ─── TemplateRenderer ─────────────────────────────────────────────────────────

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({
  template,
  userData,
  isMobilePreview = false,
}) => {
  const theme: TemplateTheme = { ...DEFAULT_THEME, ...template.theme };

  // Filter to only enabled sections
  const sections = template.sections.filter(s => s.enabled !== false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ── Audio init ──
  useEffect(() => {
    if (userData.music?.url) {
      const audio = new Audio(userData.music.url);
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
    }
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, [userData.music?.url]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) { audioRef.current.pause(); setIsPlayingMusic(false); }
    else { audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {}); }
  };
  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(m => !m);
  };

  const goNext = () => {
    // Auto-play music when leaving welcome
    if (currentIdx === 0 && audioRef.current && !isPlayingMusic) {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
    setCurrentIdx(i => Math.min(i + 1, sections.length - 1));
  };
  const goBack  = () => setCurrentIdx(i => Math.max(i - 1, 0));
  const replay  = () => { setCurrentIdx(0); };

  const progressPct = sections.length > 1
    ? Math.round((currentIdx / (sections.length - 1)) * 100)
    : 100;

  const currentSection = sections[currentIdx];

  // Resolve the component from the registry
  const SectionComponent = SECTION_REGISTRY[currentSection?.type ?? ''];

  const sharedProps: SectionProps = {
    config: currentSection,
    userData,
    theme,
    onNext: goNext,
    onBack: goBack,
    onReplay: replay,
    isFirst: currentIdx === 0,
    isLast: currentIdx === sections.length - 1,
    audioRef,
    isPlayingMusic,
    setIsPlayingMusic,
  };

  return (
    <div
      className={`relative w-full min-h-screen overflow-x-hidden flex flex-col items-center select-none ${isMobilePreview ? 'text-sm' : ''}`}
      style={{
        background: theme.background,
        fontFamily: theme.fontSans,
        color: theme.textColor,
      }}>

      {/* Ambient radial overlay */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.3) 0%, transparent 70%)' }} />

      <FloatingParticles theme={theme} />

      {/* Music pill */}
      {userData.music?.url && (
        <MusicPill
          theme={theme} musicName={userData.music.name}
          isPlaying={isPlayingMusic} isMuted={isMuted}
          onToggle={togglePlay} onToggleMute={toggleMute}
        />
      )}

      {/* Progress bar (hidden on first and last step) */}
      {currentIdx > 0 && currentIdx < sections.length - 1 && (
        <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-2 pb-1 backdrop-blur-md border-b"
          style={{ background: 'rgba(255,255,255,0.85)', borderColor: theme.cardBorder }}>
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-[10px] font-bold mb-1"
              style={{ color: theme.accent }}>
              <span>{currentSection?.type?.replace('-', ' ') ?? ''}</span>
              <span>Step {currentIdx + 1} of {sections.length}</span>
            </div>
            <div className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ background: theme.cardBorder }}>
              <motion.div className="h-full rounded-full"
                animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }}
                style={{ background: theme.accent }} />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col justify-center px-4 py-20">
        <AnimatePresence mode="wait">
          {SectionComponent ? (
            <SectionComponent key={currentSection.id} {...sharedProps} />
          ) : (
            // Unknown section type — skip gracefully
            <motion.div key={`unknown-${currentIdx}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-12 text-center">
              <Heart size={36} style={{ color: theme.accent }} />
              <p className="text-sm opacity-60" style={{ color: theme.textColor }}>
                Unknown section type: "{currentSection?.type}"
              </p>
              <button onClick={goNext}
                className="px-6 py-3 rounded-full text-white font-bold text-sm"
                style={{ background: theme.accent }}>
                Continue →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
