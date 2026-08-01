import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music, Disc } from 'lucide-react';
import { MusicData } from '../types';

interface MusicPlayerProps {
  music: MusicData;
  autoPlay?: boolean;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ music, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (music?.url) {
      if (!audioRef.current) {
        audioRef.current = new Audio(music.url);
        audioRef.current.loop = true;
      } else {
        audioRef.current.src = music.url;
      }

      if (autoPlay) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
          console.log('Autoplay blocked by browser until user click', err);
          setIsPlaying(false);
        });
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [music, autoPlay]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  if (!music || !music.url) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-[#1A1A1A]/90 backdrop-blur-md text-[#FAF9F6] px-4 py-2.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-3 transition-all hover:scale-105">
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center transition-transform ${
          isPlaying ? 'animate-spin' : ''
        }`}
        style={{ animationDuration: '4s' }}
        title={isPlaying ? 'Pause Music' : 'Play Music'}
      >
        <Disc className="w-4 h-4" />
      </button>

      <div className="text-left hidden sm:block pr-1">
        <p className="text-[10px] uppercase tracking-widest font-bold text-rose-300">
          Background Music
        </p>
        <p className="text-xs font-medium text-white truncate max-w-[120px]">
          {music.name || 'Love Melody'}
        </p>
      </div>

      <button
        onClick={toggleMute}
        className="text-white/70 hover:text-white transition-colors p-1"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
};
