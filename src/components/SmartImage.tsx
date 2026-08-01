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
  rootMargin = '100px',
  objectFit = 'cover'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(true); // Default to true so above-the-fold images load instantly
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

      return () => {
        observer.disconnect();
      };
    } else {
      setIsInView(true);
    }
  }, [rootMargin]);

  // Reset state if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      style={{ aspectRatio }}
      className={`relative overflow-hidden ${placeholderColor} ${className}`}
    >
      {/* Blur-Up Low-Res / Shimmer Skeleton Placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 z-0">
          {placeholderSrc ? (
            <img
              src={placeholderSrc}
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter blur-lg scale-110 opacity-80 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-rose-100/70 via-pink-100/50 to-rose-100/70 animate-pulse blur-sm scale-105" />
          )}
        </div>
      )}

      {/* Actual High-Res Lazy Loaded Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
          style={{ objectFit }}
          className={`w-full h-full transition-all duration-700 ease-out z-10 ${imgClassName} ${
            isLoaded && !hasError
              ? 'opacity-100 blur-0 scale-100'
              : 'opacity-0 blur-xl scale-105'
          }`}
        />
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-rose-50 text-rose-400 text-xs font-medium p-2 text-center z-20">
          Failed to load image
        </div>
      )}
    </div>
  );
};
