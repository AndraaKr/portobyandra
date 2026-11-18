import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import type { PortfolioItem } from '../../types';
import { useReducedMotion } from '../../lib/useReducedMotion';

interface ShowreelProps {
  item: PortfolioItem;
}

export const Showreel: React.FC<ShowreelProps> = ({ item }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const reducedMotion = useReducedMotion();

  const mediaWidth = item.mediaWidth || 1920;
  const mediaHeight = item.mediaHeight || 1080;
  const posterUrl = item.posterUrl || item.imageUrl;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (reducedMotion) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false);
        });
    }

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [reducedMotion]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  return (
    <div className="relative w-full group">
      <video
        ref={videoRef}
        src={item.videoUrl}
        poster={posterUrl}
        autoPlay={!reducedMotion}
        muted
        loop
        playsInline
        preload="metadata"
        width={mediaWidth}
        height={mediaHeight}
        className="w-full h-auto block"
        style={{ aspectRatio: `${mediaWidth} / ${mediaHeight}` }}
      />
      <div className="mt-3 flex items-center justify-between border-b border-rule pb-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 inline-block bg-ink" />
          <span className="label-mono text-xs text-ink font-semibold">
            Showreel
          </span>
        </div>
        <button
          type="button"
          onClick={togglePlay}
          aria-pressed={!isPlaying}
          className="inline-flex items-center gap-1.5 label-mono text-ink cursor-pointer bg-transparent border border-rule px-3 py-1 text-xs hover:border-ink transition-colors duration-120 min-h-[44px]"
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 text-ink" />
              <span>Jeda</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-ink" />
              <span>Putar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
