import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
  Calendar,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Download,
  Share2,
  X,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { SurpriseData } from '../types';
import { CuteCatGift } from './CuteCatGift';
import { BouquetGoodbyeCat } from './BouquetGoodbyeCat';
import { CertificateComponent } from './CertificateComponent';

interface Props {
  surprise: SurpriseData;
  isMobilePreview?: boolean;
}

/**
 * Step definitions for the guided linear flow.
 * Steps: Welcome → Cover → Love Letter → Reasons → Memories → Gallery → Music → Certificate → Final Surprise
 */
const STEPS = [
  { id: 1, key: 'welcome', label: 'Welcome' },
  { id: 2, key: 'cover', label: 'Cover' },
  { id: 3, key: 'letter', label: 'Letter' },
  { id: 4, key: 'reasons', label: 'Reasons' },
  { id: 5, key: 'memories', label: 'Memories' },
  { id: 6, key: 'gallery', label: 'Gallery' },
  { id: 7, key: 'music', label: 'Music' },
  { id: 8, key: 'certificate', label: 'Certificate' },
  { id: 9, key: 'final', label: 'Final' },
] as const;

const TOTAL_STEPS = STEPS.length;

export const SurpriseThemeView: React.FC<Props> = ({ surprise, isMobilePreview = false }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Flash-card state for Reasons step
  const [reasonIndex, setReasonIndex] = useState<number>(0);
  const [reasonDir, setReasonDir] = useState<1 | -1>(1); // 1=next, -1=prev

  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const swipeStartX = useRef<number | null>(null);

  // Default images if empty
  const memoryImages =
    surprise.memoryImages && surprise.memoryImages.length > 0
      ? surprise.memoryImages
      : [
          { id: '1', url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1000&auto=format&fit=crop', caption: 'Our unforgettable sunset moment', date: 'Summer' },
          { id: '2', url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop', caption: 'Cozy coffee date laughing together', date: 'Autumn' },
          { id: '3', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=1000&auto=format&fit=crop', caption: 'Stargazing under the night sky', date: 'Winter' },
        ];

  const coverPhoto = surprise.coverImage || memoryImages[0]?.url;

  const reasons =
    surprise.reasons && surprise.reasons.length > 0
      ? surprise.reasons
      : [
          'Your smile instantly brightens even my darkest days.',
          'You always listen to me with kindness and warmth.',
          'Your laugh is my absolute favorite sound in the world.',
          'You inspire me to be a better person every single day.',
          'In your arms, I have found my safest home.',
        ];

  // Initialize audio
  useEffect(() => {
    if (surprise.music?.url) {
      const audio = new Audio(surprise.music.url);
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [surprise.music?.url]);

  const togglePlayMusic = () => {
    if (!audioRef.current) return;
    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Navigation
  const goNext = () => {
    if (currentStep < TOTAL_STEPS) {
      // Auto-play music when leaving welcome
      if (currentStep === 1 && audioRef.current && !isPlayingMusic) {
        audioRef.current.play().then(() => setIsPlayingMusic(true)).catch(() => {});
      }
      // Confetti on certain transitions
      if (currentStep === 2) {
        confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 }, colors: ['#f43f5e', '#ec4899', '#fb7185', '#ffffff'] });
      }
      setCurrentStep(s => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) setCurrentStep(s => s - 1);
  };

  // Flash-card navigation for Reasons
  const goReasonNext = () => {
    if (reasonIndex < reasons.length - 1) {
      setReasonDir(1);
      confetti({ particleCount: 20, spread: 50, origin: { y: 0.7 }, colors: ['#f43f5e', '#fb7185'] });
      setReasonIndex(i => i + 1);
    }
  };

  const goReasonPrev = () => {
    if (reasonIndex > 0) {
      setReasonDir(-1);
      setReasonIndex(i => i - 1);
    }
  };

  // Swipe gesture handler (for flash cards)
  const handleTouchStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) goReasonNext();
      else goReasonPrev();
    }
    swipeStartX.current = null;
  };

  // Progress bar width
  const progressPct = Math.round((currentStep / TOTAL_STEPS) * 100);

  return (
    <div
      className={`relative w-full h-full min-h-screen font-sans text-rose-950 bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100 overflow-x-hidden flex flex-col items-center select-none ${isMobilePreview ? 'text-sm' : ''}`}
    >
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-200/50 via-rose-50/80 to-pink-100 z-0 opacity-90" />

      {/* Floating Hearts */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-rose-300/30"
            initial={{ x: `${(i * 17) % 100}vw`, y: '105vh', scale: 0.4 + (i % 3) * 0.25 }}
            animate={{ y: '-10vh', rotate: 360 }}
            transition={{ duration: 14 + (i % 5) * 2.5, repeat: Infinity, ease: 'linear', delay: i * 0.9 }}
          >
            <Heart fill="currentColor" size={20 + (i % 4) * 7} />
          </motion.div>
        ))}
      </div>

      {/* ─── Floating Music Pill ─── */}
      {surprise.music?.url && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-white/90 backdrop-blur-md border border-rose-200 px-3 py-1.5 rounded-full shadow-lg text-xs"
        >
          <button
            onClick={togglePlayMusic}
            className="w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white transition-all shadow-md active:scale-95 min-w-[28px] min-h-[28px]"
            title={isPlayingMusic ? 'Pause Music' : 'Play Music'}
          >
            {isPlayingMusic ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>
          <span className="max-w-[90px] truncate text-rose-900 font-semibold hidden sm:block">
            {surprise.music.name || 'Love Melody'}
          </span>
          <button onClick={toggleMute} className="text-rose-400 hover:text-rose-600 transition-colors p-1 min-w-[28px] min-h-[28px] flex items-center justify-center">
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </motion.div>
      )}

      {/* ─── Linear Progress Bar (Step X of Y) ─── */}
      {currentStep > 1 && currentStep < TOTAL_STEPS && (
        <div className="fixed top-0 left-0 right-0 z-40 px-4 pt-2 pb-1 bg-white/80 backdrop-blur-md border-b border-rose-100 shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between text-[10px] font-bold text-rose-700 mb-1">
              <span>{STEPS[currentStep - 1]?.label || ''}</span>
              <span>Step {currentStep} of {TOTAL_STEPS}</span>
            </div>
            <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── Main Content ─── */}
      <div className="relative z-10 w-full max-w-md mx-auto min-h-screen flex flex-col justify-center px-4 py-20">
        <AnimatePresence mode="wait">

          {/* ====== STEP 1: WELCOME ====== */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -20 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center space-y-6 my-auto"
            >
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-xl opacity-70 animate-pulse" />
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full border-4 border-rose-300 p-1 bg-white shadow-2xl overflow-hidden">
                  <img src={coverPhoto} alt="Cover" className="w-full h-full object-cover rounded-full group-hover:scale-105 transition duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-950/60 via-transparent to-transparent flex items-end justify-center pb-3">
                    <Heart size={28} className="text-rose-500 fill-rose-500 animate-bounce" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-200/70 border border-rose-300 text-rose-800 text-xs tracking-wider uppercase font-extrabold">
                  <Sparkles size={12} /> A Special Digital Surprise
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-rose-950">
                  {surprise.creatorName} & {surprise.partnerName}
                </h1>
                <p className="text-rose-800 font-serif italic text-base">"{surprise.title || 'Our Love Story ❤️'}"</p>
              </div>

              <div className="w-full bg-white/90 backdrop-blur-md border border-rose-200 rounded-2xl p-4 text-rose-900 text-sm leading-relaxed shadow-xl text-center font-medium">
                <p>{surprise.welcomeMessage || 'Welcome to our special digital memory book ❤️'}</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={goNext}
                className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white font-bold shadow-lg shadow-rose-300 flex items-center justify-center gap-2 transition-all min-h-[52px]"
              >
                <Heart fill="currentColor" size={18} />
                Open Our Story
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* ====== STEP 2: COVER / GIFT OPENING ====== */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center my-auto w-full"
            >
              <CuteCatGift
                partnerName={surprise.partnerName}
                onOpenGift={goNext}
              />
              <NavButtons onBack={goBack} onNext={goNext} nextLabel="Skip →" />
            </motion.div>
          )}

          {/* ====== STEP 3: LOVE LETTER ====== */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center space-y-5 my-auto"
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-bold tracking-widest text-rose-600 uppercase bg-rose-200/80 px-3 py-1 rounded-full">From My Heart</span>
                <h2 className="text-2xl font-bold text-rose-950 font-serif flex items-center justify-center gap-2 pt-1">
                  <Heart size={20} className="text-rose-600 fill-rose-600" /> A Letter For You
                </h2>
              </div>

              <div className="w-full bg-white/95 border border-rose-300 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-200/40 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 space-y-4 font-serif leading-relaxed text-rose-950 text-sm">
                  <p className="text-rose-700 font-bold text-base">My Dearest {surprise.partnerName},</p>
                  <p className="whitespace-pre-line font-medium italic">
                    {surprise.loveLetter || 'You are the best part of my life. Every moment spent with you is a blessing that I cherish deeply. I love you today, tomorrow, and forever.'}
                  </p>
                  <div className="pt-4 text-right border-t border-rose-100">
                    <p className="text-xs text-rose-500 font-sans uppercase tracking-wider">With all my love,</p>
                    <p className="text-rose-700 font-bold text-base font-serif">{surprise.creatorName}</p>
                  </div>
                </div>
              </div>

              <NavButtons onBack={goBack} onNext={goNext} nextLabel="Reasons Why I Love You →" />
            </motion.div>
          )}

          {/* ====== STEP 4: REASONS — FLASH CARDS ====== */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-5 my-auto w-full"
            >
              {/* Header */}
              <div className="text-center space-y-1">
                <span className="text-[11px] font-extrabold text-rose-700 bg-rose-200/80 border border-rose-300 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                  Reasons Why I Love You
                </span>
                <h2 className="text-2xl font-bold text-rose-950 font-serif">
                  Reason {reasonIndex + 1} of {reasons.length}
                </h2>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center gap-1.5 justify-center">
                {reasons.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      i === reasonIndex
                        ? 'w-4 h-2.5 bg-rose-600'
                        : i < reasonIndex
                        ? 'w-2 h-2 bg-rose-400'
                        : 'w-2 h-2 bg-rose-200'
                    }`}
                  />
                ))}
              </div>

              {/* Flash Card */}
              <div
                className="w-full touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={reasonIndex}
                    initial={{ opacity: 0, x: reasonDir * 60, rotateY: reasonDir * 15 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: reasonDir * -60, rotateY: reasonDir * -15 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-br from-rose-50 via-white to-pink-50 border-2 border-rose-200 rounded-3xl p-7 sm:p-8 shadow-xl text-center relative overflow-hidden min-h-[200px] flex flex-col items-center justify-center"
                    style={{ perspective: 800 }}
                  >
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/30 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-pink-200/30 rounded-full blur-xl pointer-events-none" />

                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center mb-4 shadow-md">
                      <Heart size={22} fill="white" className="text-white" />
                    </div>

                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 bg-rose-100 px-3 py-1 rounded-full mb-3">
                      #{reasonIndex + 1}
                    </span>

                    <p className="text-base sm:text-lg font-serif italic font-medium text-rose-900 leading-relaxed">
                      "{reasons[reasonIndex]}"
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Flash Card Navigation */}
              <div className="flex items-center justify-between w-full gap-3">
                <button
                  onClick={goReasonPrev}
                  disabled={reasonIndex === 0}
                  className="flex-1 py-3 rounded-2xl border-2 border-rose-300 text-rose-700 font-bold text-sm flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-rose-50 transition-colors min-h-[48px]"
                >
                  <ArrowLeft size={16} /> Previous
                </button>

                {reasonIndex < reasons.length - 1 ? (
                  <button
                    onClick={goReasonNext}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-rose-300/50 transition-all min-h-[48px]"
                  >
                    Next <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-500 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-rose-300/50 transition-all min-h-[48px]"
                  >
                    See Memories <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Back to section navigation */}
              <button onClick={goBack} className="text-xs text-rose-400 hover:text-rose-600 underline underline-offset-2 transition-colors">
                ← Back to Letter
              </button>
            </motion.div>
          )}

          {/* ====== STEP 5: MEMORIES / TIMELINE ====== */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-5 my-auto"
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-rose-700 bg-rose-200/80 px-3 py-1 rounded-full uppercase tracking-widest">Our Story</span>
                <h2 className="text-2xl font-bold text-rose-950 font-serif pt-1">Our Journey</h2>
                <p className="text-xs text-rose-800/80">Milestones of our beautiful bond ❤️</p>
              </div>

              {/* Vertical Timeline */}
              <div className="w-full relative border-l-2 border-rose-400 ml-4 space-y-5 py-2">
                {memoryImages.slice(0, 4).map((img, idx) => (
                  <motion.div
                    key={img.id || idx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative pl-6 space-y-1"
                  >
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                    {img.date && (
                      <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider bg-rose-200/80 border border-rose-300 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Calendar size={9} /> {img.date}
                      </span>
                    )}
                    <p className="text-xs text-rose-900 leading-relaxed font-medium italic">
                      {img.caption || 'An unforgettable memory ❤️'}
                    </p>
                  </motion.div>
                ))}
              </div>

              <NavButtons onBack={goBack} onNext={goNext} nextLabel="Photo Gallery →" />
            </motion.div>
          )}

          {/* ====== STEP 6: GALLERY ====== */}
          {currentStep === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-5 my-auto"
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-rose-700 bg-rose-200/80 px-3 py-1 rounded-full uppercase tracking-widest">Precious Moments</span>
                <h2 className="text-2xl font-bold text-rose-950 flex items-center justify-center gap-2 pt-1 font-serif">
                  <ImageIcon size={20} className="text-rose-600" /> Our Memories
                </h2>
                <p className="text-xs text-rose-800/80">Tap any photo to enlarge</p>
              </div>

              <div className="w-full grid grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                {memoryImages.map((img, idx) => (
                  <motion.div
                    key={img.id || idx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActivePhoto(img.url)}
                    className="group relative bg-white border border-rose-200 rounded-xl overflow-hidden shadow-md cursor-pointer aspect-square"
                  >
                    <img src={img.url} alt={img.caption || 'Memory'} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-950/90 via-rose-950/20 to-transparent opacity-80 flex flex-col justify-end p-2">
                      {img.date && (
                        <span className="text-[10px] text-rose-200 font-semibold flex items-center gap-0.5">
                          <Calendar size={9} /> {img.date}
                        </span>
                      )}
                      <p className="text-xs text-white line-clamp-2 font-medium leading-snug">
                        {img.caption || 'Unforgettable moment ❤️'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <NavButtons onBack={goBack} onNext={goNext} nextLabel="Music 🎵 →" />
            </motion.div>
          )}

          {/* ====== STEP 7: MUSIC ====== */}
          {currentStep === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-5 my-auto w-full"
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-rose-700 bg-rose-200/80 px-3 py-1 rounded-full uppercase tracking-widest">🎵 Our Song</span>
                <h2 className="text-2xl font-bold text-rose-950 font-serif pt-1">Background Serenade</h2>
              </div>

              <div className="w-full bg-white/90 border border-rose-200 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={togglePlayMusic}
                    className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-300/50 transition-all active:scale-95 flex-shrink-0 min-w-[56px] min-h-[56px]"
                  >
                    {isPlayingMusic ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-rose-900 truncate">{surprise.music?.name || 'Love Melody'}</p>
                    <p className="text-xs text-rose-600">
                      {isPlayingMusic ? '♫ Playing now…' : 'Tap to play'}
                    </p>
                  </div>
                  <button onClick={toggleMute} className="p-2 text-rose-400 hover:text-rose-600 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center">
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>
                </div>

                {/* Animated waveform bars */}
                <div className="flex items-end gap-0.5 h-8 justify-center">
                  {[...Array(20)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 rounded-full bg-rose-400"
                      animate={isPlayingMusic ? { height: [8, 20 + (i % 5) * 5, 8] } : { height: 4 }}
                      transition={{ duration: 0.6 + (i % 4) * 0.15, repeat: Infinity, repeatType: 'reverse', delay: i * 0.05 }}
                    />
                  ))}
                </div>
              </div>

              <NavButtons onBack={goBack} onNext={goNext} nextLabel="Certificate 🏆 →" />
            </motion.div>
          )}

          {/* ====== STEP 8: CERTIFICATE ====== */}
          {currentStep === 8 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center space-y-4 my-auto w-full"
            >
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-widest flex items-center justify-center gap-1">
                  <Award size={13} /> Official Certificate
                </span>
                <h2 className="text-2xl font-bold text-rose-950 font-serif pt-1">
                  {surprise.certificate?.certificateType === 'Best Friend'
                    ? 'Certificate of Friendship'
                    : surprise.certificate?.certificateType === 'Husband' || surprise.certificate?.certificateType === 'Wife'
                    ? 'Certificate of Forever'
                    : 'Certificate of Love'}
                </h2>
              </div>

              <CertificateComponent
                data={surprise.certificate || {
                  recipientName: surprise.partnerName,
                  presentedBy: surprise.creatorName,
                  award: 'Best Partner ❤️',
                  date: new Date().toLocaleDateString(),
                }}
                allowDownload={true}
              />

              <NavButtons onBack={goBack} onNext={goNext} nextLabel="Final Surprise 🎁 →" />
            </motion.div>
          )}

          {/* ====== STEP 9: FINAL SURPRISE ====== */}
          {currentStep === 9 && (
            <motion.div
              key="step9"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center my-auto w-full"
            >
              <BouquetGoodbyeCat
                partnerName={surprise.partnerName}
                creatorName={surprise.creatorName}
                finalMessage={surprise.finalMessage}
                onReplay={() => {
                  setCurrentStep(1);
                  setReasonIndex(0);
                }}
                onShare={() => {
                  if (navigator.share) {
                    navigator.share({ title: surprise.title, url: window.location.href }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Surprise link copied to clipboard!');
                  }
                }}
              />
              <button
                onClick={goBack}
                className="mt-4 text-xs text-rose-400 hover:text-rose-600 underline underline-offset-2 transition-colors"
              >
                ← Back to Certificate
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ─── Lightbox Modal ─── */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActivePhoto(null)}
          >
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-slate-800/80 rounded-full min-w-[40px] min-h-[40px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
            <img
              src={activePhoto}
              alt="Enlarged Memory"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/20"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/** Reusable Back/Next nav row */
function NavButtons({
  onBack,
  onNext,
  nextLabel = 'Next →',
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 w-full pt-1">
      <button
        onClick={onBack}
        className="flex items-center justify-center gap-1 px-4 py-3 rounded-2xl border-2 border-rose-300 text-rose-700 font-bold text-xs hover:bg-rose-50 transition-colors min-h-[48px] min-w-[80px]"
      >
        <ChevronLeft size={16} /> Back
      </button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={onNext}
        className="flex-1 py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-rose-300/50 transition-all min-h-[48px]"
      >
        {nextLabel}
      </motion.button>
    </div>
  );
}
