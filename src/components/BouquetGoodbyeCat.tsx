import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Flower2 as FlowerIcon, RotateCcw, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BouquetGoodbyeCatProps {
  partnerName: string;
  creatorName: string;
  finalMessage: string;
  onReplay: () => void;
  onShare: () => void;
}

export const BouquetGoodbyeCat: React.FC<BouquetGoodbyeCatProps> = ({
  partnerName,
  creatorName,
  finalMessage,
  onReplay,
  onShare,
}) => {
  const [showBouquet, setShowBouquet] = useState(false);

  const handleRevealBouquet = () => {
    setShowBouquet(true);
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#fda4af', '#fef08a', '#fb7185', '#ffffff', '#e11d48'],
    });
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto select-none py-6 px-4 max-w-sm mx-auto">
      
      {/* Title */}
      <div className="space-y-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold uppercase tracking-widest"
        >
          <Sparkles size={14} className="text-amber-300 animate-spin" />
          A Final Gift For You
        </motion.div>

        <h2 className="text-3xl font-extrabold text-white font-serif tracking-tight">
          Forever & Always ❤️
        </h2>
      </div>

      {/* Final Message Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-slate-900/80 backdrop-blur-md border border-rose-500/30 rounded-2xl p-5 shadow-2xl space-y-3 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <p className="text-sm font-serif italic text-rose-100 leading-relaxed font-light">
          "{finalMessage || 'Thank you for being my favorite person in the entire universe. I love you endlessly!'}"
        </p>
        <div className="w-12 h-0.5 bg-rose-500/60 mx-auto rounded-full" />
        <p className="text-xs text-rose-300 font-semibold uppercase tracking-wider">
          With Love, {creatorName}
        </p>
      </motion.div>

      {/* Flower Bouquet & Waving Cat Container */}
      <div className="relative w-64 h-64 flex items-center justify-center my-2">
        <div className="absolute inset-0 bg-rose-600/20 rounded-full blur-3xl animate-pulse" />

        {/* Waving Cat Vector SVG */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 w-44 h-44 drop-shadow-[0_10px_25px_rgba(0,0,0,0.6)]"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Body */}
            <ellipse cx="100" cy="130" rx="55" ry="40" fill="#fbcfe8" />
            <ellipse cx="100" cy="132" rx="42" ry="28" fill="#fce7f3" />

            {/* Head */}
            <circle cx="100" cy="85" r="38" fill="#fbcfe8" />

            {/* Ears */}
            <polygon points="70,55 80,25 98,52" fill="#fbcfe8" />
            <polygon points="74,53 82,32 94,51" fill="#f472b6" />
            <polygon points="130,55 120,25 102,52" fill="#fbcfe8" />
            <polygon points="126,53 118,32 106,51" fill="#f472b6" />

            {/* Blushes */}
            <circle cx="78" cy="92" r="7" fill="#f472b6" opacity="0.6" />
            <circle cx="122" cy="92" r="7" fill="#f472b6" opacity="0.6" />

            {/* Eyes - Happy Curves */}
            <path d="M 74,80 Q 82,72 90,80" fill="none" stroke="#831843" strokeWidth="3" strokeLinecap="round" />
            <path d="M 110,80 Q 118,72 126,80" fill="none" stroke="#831843" strokeWidth="3" strokeLinecap="round" />

            {/* Nose & Mouth */}
            <polygon points="97,88 103,88 100,92" fill="#db2777" />
            <path d="M 94,94 Q 97,100 100,95 Q 103,100 106,94" fill="none" stroke="#be185d" strokeWidth="2.5" strokeLinecap="round" />

            {/* Whiskers */}
            <line x1="60" y1="86" x2="72" y2="88" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="140" y1="86" x2="128" y2="88" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />

            {/* Left Paw */}
            <ellipse cx="60" cy="120" rx="12" ry="16" fill="#fbcfe8" />

            {/* Right Paw - Waving Animation */}
            <motion.g
              animate={{ rotate: [-20, 20, -20] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '135px 125px' }}
            >
              <ellipse cx="140" cy="110" rx="14" ry="20" fill="#fbcfe8" />
              <circle cx="140" cy="100" r="5" fill="#f472b6" />
            </motion.g>

            {/* Tail */}
            <motion.path
              d="M 152,140 C 185,120 180,170 160,160"
              fill="none"
              stroke="#fbcfe8"
              strokeWidth="12"
              strokeLinecap="round"
              animate={{ rotate: [-15, 15, -15] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </svg>
        </motion.div>

        {/* Flower Bouquet Overlay */}
        {showBouquet && (
          <motion.div
            initial={{ scale: 0, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="absolute -bottom-2 z-20 flex flex-col items-center"
          >
            {/* SVG Rose Flower Bouquet */}
            <div className="relative filter drop-shadow-[0_10px_20px_rgba(244,63,94,0.6)]">
              <svg width="120" height="120" viewBox="0 0 100 100">
                {/* Bouquet Wrapper Ribbon */}
                <polygon points="30,60 70,60 55,95 45,95" fill="#fda4af" />
                <path d="M 40,65 Q 50,75 60,65" fill="none" stroke="#be123c" strokeWidth="3" />
                
                {/* Rose 1 - Center */}
                <circle cx="50" cy="40" r="16" fill="#e11d48" />
                <circle cx="50" cy="40" r="10" fill="#be123c" />
                <circle cx="50" cy="40" r="5" fill="#fda4af" />

                {/* Rose 2 - Left */}
                <circle cx="32" cy="48" r="14" fill="#f43f5e" />
                <circle cx="32" cy="48" r="8" fill="#e11d48" />

                {/* Rose 3 - Right */}
                <circle cx="68" cy="48" r="14" fill="#fb7185" />
                <circle cx="68" cy="48" r="8" fill="#f43f5e" />

                {/* Rose 4 - Top */}
                <circle cx="50" cy="22" r="12" fill="#f472b6" />
                <circle cx="50" cy="22" r="6" fill="#ec4899" />

                {/* Leaves */}
                <ellipse cx="22" cy="42" rx="8" ry="4" fill="#15803d" transform="rotate(-30 22 42)" />
                <ellipse cx="78" cy="42" rx="8" ry="4" fill="#15803d" transform="rotate(30 78 42)" />
              </svg>
            </div>
          </motion.div>
        )}

      </div>

      {/* Interactive Bouquet Reveal or Replay Controls */}
      {!showBouquet ? (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRevealBouquet}
          className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-rose-600/40 hover:shadow-rose-600/60 flex items-center justify-center gap-2"
        >
          <FlowerIcon size={18} />
          Accept Your Bouquet of Roses 💐
        </motion.button>
      ) : (
        <div className="w-full flex gap-3 pt-2">
          <button
            onClick={onReplay}
            className="flex-1 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-md"
          >
            <RotateCcw size={16} /> Replay
          </button>
          <button
            onClick={onShare}
            className="flex-1 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all"
          >
            <Share2 size={16} /> Share Love
          </button>
        </div>
      )}

    </div>
  );
};
