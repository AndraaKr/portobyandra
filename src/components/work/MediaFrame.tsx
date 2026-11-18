import React from 'react';
import type { Work } from '../../utils/work';

interface MediaFrameProps {
  work: Work;
  variant: 'index' | 'detail';
  priority?: boolean;
  aspectRatio?: 'original' | '3:4';
}

export const MediaFrame: React.FC<MediaFrameProps> = ({
  work,
  variant,
  priority = false,
  aspectRatio = '3:4',
}) => {
  const { posterUrl, videoUrl, mediaWidth, mediaHeight, mediaType, title } = work;
  const targetAr = aspectRatio === 'original' ? `${mediaWidth} / ${mediaHeight}` : '3 / 4';

  if (!posterUrl) {
    console.warn(`[MediaFrame] Poster belum ada untuk karya: "${title}" (${work.id})`);
    return (
      <div
        className="w-full h-full relative flex flex-col items-center justify-center p-4 overflow-hidden select-none"
        style={{
          aspectRatio: variant === 'index' ? targetAr : `${mediaWidth} / ${mediaHeight}`,
          backgroundColor: 'var(--paper-2)',
        }}
      >
        <span className="label-mono text-xs text-ink-2 font-semibold">POSTER BELUM ADA</span>
      </div>
    );
  }

  // Jika berupa video dan memiliki videoUrl
  if (mediaType === 'video' && videoUrl) {
    if (variant === 'detail') {
      const isPortrait = work.orientation === 'portrait';
      return (
        <video
          src={videoUrl}
          poster={posterUrl}
          preload="metadata"
          width={mediaWidth}
          height={mediaHeight}
          controls
          playsInline
          className={
            isPortrait
              ? 'w-full h-auto max-h-[50vh] md:max-h-[480px] object-contain block mx-auto'
              : 'w-full h-auto max-h-[60vh] object-contain block'
          }
          style={{ aspectRatio: `${mediaWidth} / ${mediaHeight}` }}
        />
      );
    }

    // Di index: rasio 3:4 seragam atau rasio asli, tanpa controls, tanpa suara, tabIndex -1, aria-hidden (judul adalah tautannya)
    return (
      <video
        src={videoUrl}
        poster={posterUrl}
        preload="none"
        width={mediaWidth}
        height={mediaHeight}
        muted
        playsInline
        tabIndex={-1}
        aria-hidden="true"
        className="w-full h-full object-cover block"
        style={{ aspectRatio: targetAr }}
      />
    );
  }

  // Karya statis atau video tanpa videoUrl: gunakan <img>
  if (variant === 'detail') {
    const isPortrait = work.orientation === 'portrait';
    return (
      <img
        src={posterUrl}
        alt={title}
        width={mediaWidth}
        height={mediaHeight}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={
          isPortrait
            ? 'w-full h-auto max-h-[50vh] md:max-h-[480px] object-contain block mx-auto'
            : 'w-full h-auto max-h-[60vh] object-contain block'
        }
        style={{ aspectRatio: `${mediaWidth} / ${mediaHeight}` }}
      />
    );
  }

  // Di index: rasio 3:4 atau rasio asli
  return (
    <img
      src={posterUrl}
      alt=""
      width={mediaWidth}
      height={mediaHeight}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className="w-full h-full object-cover block"
      style={{ aspectRatio: targetAr }}
    />
  );
};
