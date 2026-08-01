import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface FloatingItem {
  id: number;
  type: 'heart' | 'flower' | 'rose' | 'petal' | 'sparkle';
  left: number; // percentage (0 to 100)
  size: number; // px
  duration: number; // seconds
  delay: number; // seconds
  opacity: number;
  color: string;
  xOffset: number; // px horizontal drift sway
}

interface RomanticBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'dark' | 'warm';
}

export const RomanticBackground: React.FC<RomanticBackgroundProps> = ({
  children,
  className = '',
  variant = 'warm'
}) => {
  // Generate floating items (hearts, blooming roses, cherry blossom flowers, rose petals, and sparkles)
  const items: FloatingItem[] = useMemo(() => {
    const colors = [
      '#f43f5e', // rose-500
      '#e11d48', // rose-600
      '#fb7185', // rose-400
      '#fda4af', // rose-300
      '#f472b6', // pink-400
      '#ec4899', // pink-500
      '#be123c', // rose-700
      '#fecdd3', // rose-200
    ];

    const types: ('heart' | 'flower' | 'rose' | 'petal' | 'sparkle')[] = [
      'rose', 'petal', 'heart', 'flower', 'petal', 'sparkle', 'rose', 'heart', 'petal', 'flower'
    ];

    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      type: types[i % types.length],
      left: Math.abs(Math.sin(i * 123.456 + 78.9) * 92) + 4, // distribute 4% to 96%
      size: (i % 4 + 1) * 6 + (types[i % types.length] === 'rose' || types[i % types.length] === 'flower' ? 18 : 12),
      duration: (i % 5 + 1) * 3.5 + 12, // 12s to 30s
      delay: (i % 10) * 1.5, // 0s to 13.5s
      opacity: 0.3 + (i % 4) * 0.12, // 0.3 to 0.66
      color: colors[i % colors.length],
      xOffset: (i % 2 === 0 ? 1 : -1) * ((i % 5 + 1) * 12),
    }));
  }, []);

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${className}`}>
      {/* Base ambient gradient background */}
      {variant === 'dark' ? (
        <div className="fixed inset-0 z-0 bg-[#0c0408] bg-radial from-[#220713] via-[#0f0308] to-[#080205] pointer-events-none">
          {/* Glowing ambient background orbs */}
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-900/30 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.5, 0.35] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-950/40 rounded-full blur-[140px]" 
          />
        </div>
      ) : (
        <div className="fixed inset-0 z-0 bg-white bg-gradient-to-b from-rose-50/70 via-white to-pink-50/50 pointer-events-none">
          {/* Soft Radial Light Orbs & Bokeh */}
          <motion.div 
            animate={{ scale: [1, 1.12, 1], x: [0, 15, 0], y: [0, -10, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-200/35 rounded-full blur-[130px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.18, 1], x: [0, -20, 0], y: [0, 15, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[35%] right-[-10%] w-[550px] h-[550px] bg-pink-200/40 rounded-full blur-[140px]" 
          />
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.45, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-[-10%] left-[15%] w-[700px] h-[700px] bg-rose-100/50 rounded-full blur-[150px]" 
          />
          
          {/* Subtle Pink Mist Layer */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-100/20 via-transparent to-rose-50/20" />

          {/* Large Blooming Roses & Floral Silhouettes - Bottom Left Corner */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [-1, 2, -1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 left-0 w-64 h-64 sm:w-80 sm:h-80 opacity-25 pointer-events-none text-rose-400 transform -translate-x-10 translate-y-10"
          >
            <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
              <path d="M40,160 C10,120 20,70 60,50 C100,30 150,60 160,100 C170,140 120,190 70,180 Z" opacity="0.4" />
              <circle cx="80" cy="110" r="45" fill="#f43f5e" opacity="0.25" />
              <circle cx="120" cy="140" r="35" fill="#fb7185" opacity="0.3" />
              <circle cx="50" cy="130" r="28" fill="#fda4af" opacity="0.35" />
            </svg>
          </motion.div>

          {/* Large Blooming Roses & Floral Silhouettes - Bottom Right Corner */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [1, -2, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 opacity-25 pointer-events-none text-pink-400 transform translate-x-10 translate-y-10 scale-x-[-1]"
          >
            <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
              <path d="M40,160 C10,120 20,70 60,50 C100,30 150,60 160,100 C170,140 120,190 70,180 Z" opacity="0.4" />
              <circle cx="80" cy="110" r="45" fill="#ec4899" opacity="0.25" />
              <circle cx="120" cy="140" r="35" fill="#f472b6" opacity="0.3" />
              <circle cx="50" cy="130" r="28" fill="#fbcfe8" opacity="0.35" />
            </svg>
          </motion.div>
        </div>
      )}

      {/* Floating Animated Flowers, Petals & Hearts Layer (Framer Motion) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={{ y: '105vh', opacity: 0, x: 0, rotate: 0 }}
            animate={{ 
              y: '-15vh', 
              opacity: [0, item.opacity, item.opacity, 0],
              x: [0, item.xOffset, -item.xOffset, 0],
              rotate: [0, 120, 240, 360]
            }}
            transition={{ 
              duration: item.duration, 
              repeat: Infinity, 
              delay: item.delay, 
              ease: "linear" 
            }}
            className="absolute"
            style={{ left: `${item.left}%` }}
          >
            {item.type === 'rose' && (
              <svg
                width={item.size}
                height={item.size}
                viewBox="0 0 24 24"
                fill={item.color}
                className="drop-shadow-[0_0_8px_rgba(225,29,72,0.4)]"
              >
                <path d="M12 2C9.24 2 7 4.24 7 7c0 1.38.56 2.63 1.46 3.54C7.03 11.25 6 12.98 6 15c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.02-1.03-3.75-2.46-4.46C16.44 9.63 17 8.38 17 7c0-2.76-2.24-5-5-5zm0 2c1.66 0 3 1.34 3 3 0 1.14-.64 2.12-1.58 2.62L12 10.33l-1.42-.71C9.64 9.12 9 8.14 9 7c0-1.66 1.34-3 3-3zm0 8c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z" />
                <path d="M12 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" opacity="0.7" />
              </svg>
            )}

            {item.type === 'flower' && (
              <svg
                width={item.size}
                height={item.size}
                viewBox="0 0 24 24"
                fill={item.color}
                className="drop-shadow-[0_0_8px_rgba(251,113,133,0.4)]"
              >
                <path d="M12 12c-1.5-2.5-4-3-6-2 0 2.5 1.5 4.5 4 5-2.5 1.5-3 4-2 6 2.5 0 4.5-1.5 5-4 1.5 2.5 4 3 6 2 0-2.5-1.5-4.5-4-5 2.5-1.5 3-4 2-6-2.5 0-4.5 1.5-5 4z" />
                <circle cx="12" cy="12" r="2.5" fill="#fef08a" />
              </svg>
            )}

            {item.type === 'petal' && (
              <svg
                width={item.size * 0.85}
                height={item.size * 1.2}
                viewBox="0 0 20 30"
                fill={item.color}
                className="drop-shadow-[0_0_6px_rgba(244,63,94,0.3)] transform -rotate-45"
              >
                <path d="M10 0 C 18 10, 20 20, 10 30 C 0 20, 2 10, 10 0 Z" opacity="0.85" />
              </svg>
            )}

            {item.type === 'heart' && (
              <svg
                width={item.size}
                height={item.size}
                viewBox="0 0 24 24"
                fill={item.color}
                className="drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}

            {item.type === 'sparkle' && (
              <svg
                width={item.size}
                height={item.size}
                viewBox="0 0 24 24"
                fill="#fbcfe8"
                className="drop-shadow-[0_0_10px_rgba(251,207,232,0.8)]"
              >
                <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
              </svg>
            )}
          </motion.div>
        ))}
      </div>

      {/* Page Content Layer */}
      <div className="relative z-10 w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};
