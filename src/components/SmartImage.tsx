import React, { useState, useEffect, useRef } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  placeholderSrc?: string;
  className?: string;
  imgClassName?: string;
  onClick?: () => void;
  aspectRatio?: string;
  placeholderColor?: string;
  rootMargin?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** show shimmer skeleton while loading (default true) */
  shimmer?: boolean;
  /** dark-theme shimmer variant */
  shimmerDark?: boolean;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  placeholderSrc,
  className = '',
  imgClassName = '',
  onClick,
  aspectRatio,
  placeholderColor = 'bg-rose-100/60',
  rootMargin = '120px',
  objectFit = 'cover',
  shimmer = true,
  shimmerDark = false,
}) => {
  const [isLoaded, setIsLoaded]   = useState(false);
  const [isInView, setIsInView]   = useState(false);
  const [hasError, setHasError]   = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer — only start loading when near viewport
  useEffect(() => {
    if (!containerRef.current) return;

    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { rootMargin }
      );
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, [rootMargin]);

  // Reset when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  const shimmerClass = shimmerDark ? 'skeleton-shimmer-dark' : 'skeleton-shimmer';

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      style={{ aspectRatio }}
      className={`relative overflow-hidden ${placeholderColor} ${className}`}
    >
      {/* ── Shimmer / placeholder shown while loading ── */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0">
          {placeholderSrc ? (
            <img
              src={placeholderSrc}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter blur-lg scale-110 opacity-70 transition-all duration-500"
            />
          ) : shimmer ? (
            /* travelling-light shimmer bar */
            <div className={`w-full h-full ${shimmerClass} rounded-[inherit]`} />
          ) : (
            /* simple pulse fallback */
            <div className="w-full h-full animate-pulse bg-gradient-to-r from-rose-100/70 via-pink-100/50 to-rose-100/70" />
          )}
        </div>
      )}

      {/* ── Actual image — only rendered when in viewport ── */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => { setHasError(true); setIsLoaded(true); }}
          style={{ objectFit }}
          className={`w-full h-full transition-all duration-700 ease-out z-10 relative ${imgClassName} ${
            isLoaded && !hasError
              ? 'opacity-100 blur-0 scale-100'
              : 'opacity-0 blur-md scale-105'
          }`}
        />
      )}

      {/* ── Error state ── */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-rose-50 text-rose-400 text-xs font-medium p-2 text-center z-20">
          <span>❌ Failed to load</span>
        </div>
      )}
    </div>
  );
};
