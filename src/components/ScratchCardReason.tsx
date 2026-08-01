import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Lock, Sparkles, Hand, Check } from 'lucide-react';

interface ScratchCardReasonProps {
  index: number;
  reason: string;
  isUnlocked: boolean;
  isActive: boolean;
  onReveal: () => void;
}

export const ScratchCardReason: React.FC<ScratchCardReasonProps> = ({
  index,
  reason,
  isUnlocked,
  isActive,
  onReveal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchedPercent, setScratchedPercent] = useState(0);
  const isRevealedRef = useRef(isUnlocked);

  useEffect(() => {
    isRevealedRef.current = isUnlocked;
  }, [isUnlocked]);

  // Setup the scratch foil canvas when active and not yet unlocked
  useEffect(() => {
    if (!isActive || isUnlocked) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas width/height to bounding element
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 340;
    canvas.height = rect.height || 100;

    // Draw metallic rose-gold glitter pattern
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#f472b6'); // pink-400
    grad.addColorStop(0.3, '#fb7185'); // rose-400
    grad.addColorStop(0.7, '#e11d48'); // rose-600
    grad.addColorStop(1, '#be123c'); // rose-700
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add glitter dots
    for (let i = 0; i < 120; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const radius = Math.random() * 2 + 1;
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.7)' : 'rgba(253, 224, 71, 0.6)';
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add text instruction on canvas
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4;
    ctx.fillText(`🪙 Scratch here to reveal Reason #${index + 1}!`, canvas.width / 2, canvas.height / 2);
  }, [isActive, isUnlocked, index]);

  const checkScratchPercentage = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (isRevealedRef.current) return;
    try {
      const imgData = ctx.getImageData(0, 0, width, height);
      const pixels = imgData.data;
      let transparentPixels = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
      }
      const totalPixels = pixels.length / 4;
      const percent = (transparentPixels / totalPixels) * 100;
      setScratchedPercent(percent);

      if (percent >= 25 && !isRevealedRef.current) {
        isRevealedRef.current = true;
        onReveal();
      }
    } catch {
      // Fallback
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    if (!isActive || isUnlocked) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage(ctx, canvas.width, canvas.height);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsScratching(true);
    scratch(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleMouseUp = () => setIsScratching(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsScratching(true);
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      scratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleQuickReveal = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReveal();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border transition-all overflow-hidden ${
        isUnlocked
          ? 'bg-gradient-to-r from-rose-50 to-pink-100/90 border-rose-300 text-rose-950 shadow-md shadow-rose-200/50'
          : isActive
          ? 'bg-white border-rose-400 shadow-lg shadow-rose-300/40 ring-2 ring-rose-400/50'
          : 'bg-rose-50/40 border-rose-200/60 text-rose-300 opacity-60'
      }`}
    >
      {/* 1. REVEALED STATE */}
      {isUnlocked && (
        <div className="p-4.5 flex items-start gap-3.5 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-md"
          >
            <Heart size={18} fill="currentColor" />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 bg-rose-100/80 px-2 py-0.5 rounded-full">
                Reason #{index + 1}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                <Check size={12} /> Revealed
              </span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold leading-relaxed text-rose-900 font-serif italic"
            >
              "{reason}"
            </motion.p>
          </div>
        </div>
      )}

      {/* 2. ACTIVE SCRATCH CARD STATE */}
      {isActive && !isUnlocked && (
        <div className="p-4 relative flex flex-col justify-between min-h-[105px]">
          {/* Background reason content hidden under canvas */}
          <div className="flex items-start gap-3 opacity-90 select-none">
            <div className="w-8 h-8 rounded-full bg-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-bold text-rose-700">Reason #{index + 1}</p>
              <p className="text-xs text-rose-800 font-medium italic">"{reason}"</p>
            </div>
          </div>

          {/* Canvas Scratch Foil Layer */}
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none rounded-2xl"
          />

          {/* Quick Reveal Button overlay */}
          <div className="absolute bottom-2 right-2 z-20">
            <button
              onClick={handleQuickReveal}
              type="button"
              className="px-2.5 py-1 bg-white/90 hover:bg-white text-rose-600 text-[10px] font-bold rounded-full shadow-md border border-rose-200 flex items-center gap-1 transition-transform hover:scale-105 active:scale-95"
            >
              <Sparkles size={11} className="text-pink-500 animate-spin" />
              <span>Tap to Reveal</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. LOCKED STATE (Waiting for previous card to be scratched) */}
      {!isActive && !isUnlocked && (
        <div className="p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-400 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200">
            <Lock size={14} />
          </div>
          <div className="flex-1">
            <span className="text-xs font-semibold text-rose-400">Reason #{index + 1}</span>
            <p className="text-[11px] text-rose-400/80 italic">
              Scratch Reason #{index} first to unlock this card ✨
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
};
