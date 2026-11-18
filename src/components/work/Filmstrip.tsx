import React, { useEffect, useRef } from 'react';
import type { Work } from '../../utils/work';

interface FilmstripProps {
  works: Work[];
}

export const Filmstrip: React.FC<FilmstripProps> = ({ works }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  // Ambil karya featured atau karya publik yang memiliki poster
  const featuredWorks = works.filter((w) => w.featured || w.posterUrl);
  const sourceItems = featuredWorks.length >= 3 ? featuredWorks : works;

  // Duplikasi daftar karya agar scrolling kontinu tanpa jeda
  const displayItems = [...sourceItems, ...sourceItems, ...sourceItems];

  useEffect(() => {
    // Jika prefers-reduced-motion aktif, hentikan animasi gerak
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animId: number;
    let pos = 0;
    const speed = 0.65; // Kecepatan gerak sinematik pelan dan stabil (px per frame)

    const step = () => {
      pos -= speed;
      if (trackRef.current) {
        // Karena ada 3 duplikasi, ketika sudah bergeser 1/3 panjang, reset posisi dengan mulus
        const loopThreshold = trackRef.current.scrollWidth / 3;
        if (Math.abs(pos) >= loopThreshold) {
          pos += loopThreshold;
        }
        trackRef.current.style.transform = `translate3d(${pos}px, 0, 0)`;
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [displayItems.length]);

  if (sourceItems.length === 0) return null;

  return (
    <section
      aria-label="Strip Film 35mm Karya Sinematik"
      className="w-full overflow-hidden select-none pointer-events-none my-8 md:my-14"
      style={{ backgroundColor: 'var(--ink)' }}
    >
      {/* Track Bergerak Kanan ke Kiri */}
      <div ref={trackRef} className="flex will-change-transform py-1.5 md:py-2">
        {displayItems.map((work, idx) => {
          const frameNum = String(18 + (idx % 24)).padStart(2, '0');
          const halfFrameNum = `${frameNum}A`;

          return (
            <div
              key={`${work.id}-${idx}`}
              className="shrink-0 flex flex-col justify-between"
              style={{
                width: 'clamp(180px, 28vw, 320px)',
                backgroundColor: 'var(--ink)',
                borderRight: '8px solid var(--ink)', // Pemisah hitam antar-frame film 35mm
              }}
            >
              {/* ========================================================
                  PITA ATAS:
                  1. Tepi Luar: Teks Kode Tepi (Nomor Frame & AndraKr)
                  2. Dekat Foto: Lubang Perforasi Film 35mm (Paper)
                  ======================================================== */}
              <div className="px-2 pt-1 pb-1.5 flex flex-col gap-1.5">
                {/* 1. Teks Kode Tepi Paling Atas (seperti film Kodak 35mm asli) */}
                <div className="flex items-center justify-between text-xs label-mono tracking-widest text-paper leading-none px-1">
                  <span className="font-bold">{frameNum}</span>
                  <span className="opacity-70 tracking-[0.2em]">ANDRAKR</span>
                  <span className="font-bold flex items-center gap-0.5">
                    <span className="opacity-80">▶</span>
                    {halfFrameNum}
                  </span>
                </div>

                {/* 2. Baris Lubang Perforasi Atas (8 perforasi standar per frame 35mm) */}
                <div className="flex justify-between items-center w-full px-1">
                  {Array.from({ length: 8 }).map((_, sIdx) => (
                    <div
                      key={sIdx}
                      className="w-2 sm:w-2.5 h-3 sm:h-3.5 shrink-0"
                      style={{
                        backgroundColor: 'var(--paper)',
                        borderRadius: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* ========================================================
                  FRAME TENGAH: Poster Karya dengan Rasio 3:2 (Klasik 35mm)
                  ======================================================== */}
              <div
                className="w-full relative overflow-hidden"
                style={{
                  aspectRatio: '3 / 2',
                  backgroundColor: 'var(--ink)',
                }}
              >
                {work.posterUrl ? (
                  <img
                    src={work.posterUrl}
                    alt=""
                    width={480}
                    height={320}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover block filter grayscale contrast-115"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-paper-2">
                    <span className="label-mono text-xs text-ink-2">KARYA</span>
                  </div>
                )}
              </div>

              {/* ========================================================
                  PITA BAWAH:
                  1. Dekat Foto: Lubang Perforasi Film 35mm (Paper)
                  2. Tepi Luar: Teks Kode Tepi (AndraKr & Nomor Frame)
                  ======================================================== */}
              <div className="px-2 pt-1.5 pb-1 flex flex-col gap-1.5">
                {/* 1. Baris Lubang Perforasi Bawah (8 perforasi standar per frame 35mm) */}
                <div className="flex justify-between items-center w-full px-1">
                  {Array.from({ length: 8 }).map((_, sIdx) => (
                    <div
                      key={sIdx}
                      className="w-2 sm:w-2.5 h-3 sm:h-3.5 shrink-0"
                      style={{
                        backgroundColor: 'var(--paper)',
                        borderRadius: '2px',
                      }}
                    />
                  ))}
                </div>

                {/* 2. Teks Kode Tepi Paling Bawah (seperti film Kodak 35mm asli) */}
                <div className="flex items-center justify-between text-xs label-mono tracking-widest text-paper leading-none px-1">
                  <span className="font-bold flex items-center gap-0.5">
                    <span className="opacity-80">▶</span>
                    {frameNum}
                  </span>
                  <span className="opacity-70 tracking-[0.2em]">ANDRAKR FILM</span>
                  <span className="font-bold">{halfFrameNum}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
