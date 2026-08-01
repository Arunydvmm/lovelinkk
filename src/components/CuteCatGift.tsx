import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Gift, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CuteCatGiftProps {
  partnerName: string;
  onOpenGift: () => void;
}

export const CuteCatGift: React.FC<CuteCatGiftProps> = ({ partnerName, onOpenGift }) => {
  // Cat states: 'sleeping' | 'wake' | 'blink' | 'smile' | 'tail' | 'heart' | 'giftAppears' | 'opened'
  const [catState, setCatState] = useState<'sleeping' | 'wake' | 'blink' | 'smile' | 'tail' | 'heart' | 'giftAppears' | 'opened'>('sleeping');
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    // Sequence timing
    const t1 = setTimeout(() => setCatState('wake'), 1500);       // Wake up eyes
    const t2 = setTimeout(() => setCatState('blink'), 2800);      // Blink
    const t3 = setTimeout(() => setCatState('smile'), 4000);      // Smile
    const t4 = setTimeout(() => setCatState('tail'), 5200);       // Tail wag
    const t5 = setTimeout(() => setCatState('heart'), 6400);      // Heart appears
    const t6 = setTimeout(() => setCatState('giftAppears'), 7600); // Gift appears!

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  const handleGiftClick = () => {
    if (isOpening) return;
    setIsOpening(true);
    setCatState('opened');

    // Trigger sweet festive confetti
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ['#e11d48', '#f43f5e', '#fb7185', '#ffffff', '#fef08a', '#d946ef'],
    });

    setTimeout(() => {
      onOpenGift();
    }, 1500);
  };

  const isAwake = catState !== 'sleeping';
  const isSmiling = ['smile', 'tail', 'heart', 'giftAppears', 'opened'].includes(catState);
  const showHeart = ['heart', 'giftAppears', 'opened'].includes(catState);
  const showGift = ['giftAppears', 'opened'].includes(catState);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 select-none my-auto max-w-sm mx-auto text-center px-4">
      
      {/* Title & Prompt */}
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider"
        >
          <Sparkles size={14} className="text-rose-400" />
          Special Digital Gift
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-wide">
          {catState === 'sleeping' && 'Shh... Someone is guarding your gift 🐾'}
          {catState === 'wake' && 'Oh! They noticed you! 👀'}
          {catState === 'blink' && 'Giving you a warm blink... ✨'}
          {catState === 'smile' && `Happy to see you, ${partnerName}! 😊`}
          {catState === 'tail' && 'Wagging tail with happiness! 🐾'}
          {showHeart && !showGift && 'Sending love to your heart... ❤️'}
          {showGift && !isOpening && 'Your gift has arrived! Tap to open 🎁'}
          {isOpening && 'Unboxing magic moments... ✨'}
        </h2>
      </div>

      {/* Cat + Heart + Gift Animation Canvas */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        
        {/* Soft Background Radial Glow */}
        <div className="absolute inset-0 bg-rose-600/20 rounded-full blur-3xl animate-pulse" />

        {/* Floating Heart Above Cat Head */}
        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, y: 10, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], y: -50, opacity: 1 }}
              transition={{ duration: 0.8, ease: "backOut" }}
              className="absolute top-2 z-20 text-rose-500 fill-rose-500 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]"
            >
              <Heart size={44} className="animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cute Vector Sleeping / Awake Cat SVG */}
        <motion.div
          animate={
            catState === 'tail' || showGift
              ? { rotate: [-2, 2, -2] }
              : { y: [0, -4, 0] }
          }
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 w-48 h-48 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Cat Body */}
            <ellipse cx="100" cy="130" rx="55" ry="40" fill="#fbcfe8" className="transition-colors duration-500" />
            <ellipse cx="100" cy="132" rx="42" ry="28" fill="#fce7f3" />

            {/* Cat Head */}
            <circle cx="100" cy="85" r="38" fill="#fbcfe8" />

            {/* Cat Ears */}
            <polygon points="70,55 80,25 98,52" fill="#fbcfe8" />
            <polygon points="74,53 82,32 94,51" fill="#f472b6" />

            <polygon points="130,55 120,25 102,52" fill="#fbcfe8" />
            <polygon points="126,53 118,32 106,51" fill="#f472b6" />

            {/* Cat Cheeks / Blushes */}
            <circle cx="78" cy="92" r="7" fill="#f472b6" opacity={isAwake ? '0.6' : '0.3'} />
            <circle cx="122" cy="92" r="7" fill="#f472b6" opacity={isAwake ? '0.6' : '0.3'} />

            {/* Cat Nose */}
            <polygon points="97,88 103,88 100,92" fill="#db2777" />

            {/* Cat Mouth */}
            {isSmiling ? (
              <path d="M 94,94 Q 97,100 100,95 Q 103,100 106,94" fill="none" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <path d="M 95,95 Q 100,98 105,95" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round" />
            )}

            {/* Cat Eyes */}
            {catState === 'sleeping' ? (
              <>
                <path d="M 75,82 Q 82,88 88,82" fill="none" stroke="#831843" strokeWidth="3" strokeLinecap="round" />
                <path d="M 112,82 Q 118,88 124,82" fill="none" stroke="#831843" strokeWidth="3" strokeLinecap="round" />
                {/* Zzz floating bubbles */}
                <text x="140" y="50" fill="#f472b6" fontSize="16" fontWeight="bold" className="animate-pulse">z</text>
                <text x="155" y="35" fill="#f472b6" fontSize="20" fontWeight="bold" className="animate-pulse">Z</text>
              </>
            ) : catState === 'blink' ? (
              <>
                <line x1="75" y1="82" x2="88" y2="82" stroke="#831843" strokeWidth="3" strokeLinecap="round" />
                <line x1="112" y1="82" x2="124" y2="82" stroke="#831843" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Cute Open Eyes */}
                <ellipse cx="82" cy="81" rx="6" ry="7" fill="#831843" />
                <circle cx="80" cy="79" r="2" fill="#ffffff" />
                <ellipse cx="118" cy="81" rx="6" ry="7" fill="#831843" />
                <circle cx="116" cy="79" r="2" fill="#ffffff" />
              </>
            )}

            {/* Cat Whiskers */}
            <line x1="60" y1="86" x2="72" y2="88" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="58" y1="92" x2="72" y2="92" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="140" y1="86" x2="128" y2="88" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="142" y1="92" x2="128" y2="92" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />

            {/* Cat Tail */}
            <motion.path
              d="M 152,140 C 185,120 180,170 160,160"
              fill="none"
              stroke="#fbcfe8"
              strokeWidth="12"
              strokeLinecap="round"
              animate={catState === 'tail' || showGift ? { rotate: [-10, 15, -10] } : {}}
              transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>

        {/* Gift Box Pop Up */}
        <AnimatePresence>
          {showGift && (
            <motion.div
              initial={{ scale: 0, y: 40 }}
              animate={
                isOpening
                  ? { scale: [1, 1.3, 0], y: -20, rotate: [0, -10, 10, 0] }
                  : { scale: 1, y: 0 }
              }
              transition={
                isOpening
                  ? { duration: 0.6, ease: "easeInOut" }
                  : { type: 'spring', stiffness: 260, damping: 20 }
              }
              onClick={handleGiftClick}
              className="absolute -bottom-4 z-30 cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-4 bg-rose-500/40 rounded-full blur-xl group-hover:bg-rose-500/70 transition-all" />
                
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-24 h-24 bg-gradient-to-br from-rose-600 via-pink-600 to-rose-700 rounded-2xl shadow-2xl border-2 border-rose-300 flex items-center justify-center relative overflow-hidden"
                >
                  {/* Ribbon cross */}
                  <div className="absolute inset-y-0 w-4 bg-amber-300 left-1/2 -translate-x-1/2 shadow-xs" />
                  <div className="absolute inset-x-0 h-4 bg-amber-300 top-1/2 -translate-y-1/2 shadow-xs" />
                  <Gift size={36} className="text-white z-10 relative drop-shadow-md" />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Button Action */}
      {showGift && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleGiftClick}
          disabled={isOpening}
          className="w-full max-w-xs py-4 px-6 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 text-white font-extrabold text-sm uppercase tracking-widest shadow-xl shadow-rose-600/40 hover:shadow-rose-600/70 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Gift size={18} />
          {isOpening ? 'Opening Gift...' : 'Open My Gift ❤️'}
        </motion.button>
      )}

    </div>
  );
};
