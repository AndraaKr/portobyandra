import React, { useRef, useEffect } from 'react';
import type { Work } from '../../utils/work';
import { parseVideoSource } from '../../utils/videoParser';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const parsedVideo = parseVideoSource(videoUrl);

  // Efek loop autoplay seperti GIF untuk video langsung di tampilan index
  useEffect(() => {
    if (variant === 'index' && mediaType === 'video' && parsedVideo.type === 'direct' && videoRef.current) {
      const vid = videoRef.current;
      vid.muted = true;
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser menolak autoplay tanpa gesture, diamkan agar poster tetap tampil sebagai fallback
        });
      }
    }
  }, [variant, mediaType, parsedVideo.type]);

  if (!posterUrl && !videoUrl) {
    console.warn(`[MediaFrame] Media belum ada untuk karya: "${title}" (${work.id})`);
    return (
      <div
        className="w-full h-full relative flex flex-col items-center justify-center p-4 overflow-hidden select-none"
        style={{
          aspectRatio: variant === 'index' ? targetAr : `${mediaWidth} / ${mediaHeight}`,
          backgroundColor: 'var(--paper-2)',
        }}
      >
        <span className="label-mono text-xs text-ink-2 font-semibold">MEDIA BELUM ADA</span>
      </div>
    );
  }

  // Jika berupa video dan memiliki videoUrl
  if (mediaType === 'video' && videoUrl) {
    // 1. Tampilan Halaman Detail Karya
    if (variant === 'detail') {
      const isPortrait = work.orientation === 'portrait';
      const containerClass = isPortrait
        ? 'w-full h-auto object-contain block mx-auto'
        : 'w-full h-auto max-h-[75vh] object-contain block';

      // 1A. Embed YouTube, Vimeo, atau Google Drive
      if (parsedVideo.type === 'youtube' || parsedVideo.type === 'vimeo' || parsedVideo.type === 'gdrive') {
        // Khusus Google Drive: pratinjau Drive memiliki bilah toolbar header ~56px di bagian atas.
        // Jika rasio dipatok 16:9 murni pada layar mobile, video terdesak ke bawah sehingga bagian bawahnya terpotong.
        // Memberi rasio 16/11 pada video landscape Google Drive memberi ruang bagi toolbar tersebut sehingga video tidak terpotong sama sekali.
        const effectiveAspectRatio =
          parsedVideo.type === 'gdrive' && !isPortrait
            ? '16 / 11'
            : `${mediaWidth} / ${mediaHeight}`;

        return (
          <div
            className="w-full relative overflow-hidden bg-black mx-auto"
            style={{
              aspectRatio: effectiveAspectRatio,
            }}
          >
            <iframe
              src={parsedVideo.embedUrl}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0 absolute inset-0"
            />
          </div>
        );
      }

      // 1B. Berkas Video Langsung (MP4 / WebM / Supabase)
      return (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          preload="metadata"
          width={mediaWidth}
          height={mediaHeight}
          controls
          playsInline
          className={containerClass}
          style={{ aspectRatio: `${mediaWidth} / ${mediaHeight}` }}
        />
      );
    }

    // 2. Tampilan Index / Grid: Pratinjau Video Bergerak Seperti GIF
    if (parsedVideo.type === 'direct') {
      return (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          preload="metadata"
          width={mediaWidth}
          height={mediaHeight}
          autoPlay
          muted
          loop
          playsInline
          tabIndex={-1}
          aria-hidden="true"
          className="w-full h-full object-cover block"
          style={{ aspectRatio: targetAr }}
        />
      );
    }

    // Jika video dari YouTube/Drive di grid: gunakan poster (atau animasi WebP/GIF jika diunggah sebagai poster)
  }

  // Karya statis (Desain/Foto) atau video YouTube di halaman daftar grid
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
