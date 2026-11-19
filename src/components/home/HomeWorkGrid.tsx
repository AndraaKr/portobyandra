import React from 'react';
import { ArrowDown, ArrowUpRight, Play } from 'lucide-react';
import type { Work } from '../../utils/work';
import { MediaFrame } from '../work/MediaFrame';
import { SheetItem } from '../work/SheetItem';

interface HomeWorkGridProps {
  works: Work[];
  openWork?: (slug: string) => void;
  onSeeAll?: () => void;
}

export const HomeWorkGrid: React.FC<HomeWorkGridProps> = ({ works, openWork, onSeeAll }) => {
  if (works.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="label-mono text-xs text-ink-2">Belum ada karya yang diterbitkan.</p>
      </div>
    );
  }

  // Maksimal 6 karya terpilih untuk Beranda (sisanya di halaman Karya)
  const displayWorks = works.slice(0, 6);

  const handleOpen = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    if (openWork) {
      openWork(slug);
    } else {
      window.location.hash = `portofolio/${slug}`;
    }
  };

  return (
    <div className="w-full">
      {/* ========================================================
          1. TAMPILAN DESKTOP & TABLET (>= 768px):
          Satu Kartu Utuh Model "Selected Work" (Grid Garis Rambut Editorial Swiss)
          ======================================================== */}
      <div className="hidden md:grid md:grid-cols-12 border border-rule bg-paper">
        {/* Kolom Kiri (Col 1-3): Penanda Bagian, Ringkasan & Tautan Semua Karya */}
        <div className="md:col-span-3 border-r border-rule bg-paper-2 p-6 flex flex-col justify-between min-w-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-rule pb-2.5">
              <span className="label-mono text-xs font-bold text-ink tracking-wider">
                KARYA PILIHAN
              </span>
              <span className="label-mono text-xs text-ink-2">
                01 — {String(displayWorks.length).padStart(2, '0')}
              </span>
            </div>

            <p className="font-sans text-xs text-ink-2 leading-relaxed">
              Sorotan proyek video editing, animasi motion, dan desain visual pilihan.
            </p>

            <ArrowDown className="w-4 h-4 text-ink" />
          </div>

          {onSeeAll && (
            <div className="border-t border-rule pt-4 mt-6">
              <button
                type="button"
                onClick={onSeeAll}
                className="group w-full inline-flex items-center justify-between label-mono text-xs text-ink font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 min-h-[44px] accent-link text-left"
              >
                <span>Lihat semua karya</span>
                <span className="arrow-fly-target arrow-fly-upright">
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Kolom Kanan (Col 4-12): Daftar Baris Karya (01..06) dengan Sel Thumbnail Terpisah Garis Rambut */}
        <div className="md:col-span-9 divide-y divide-rule min-w-0">
          {displayWorks.map((work, idx) => {
            const indexStr = String(idx + 1).padStart(2, '0');
            const durationText =
              work.mediaType === 'image'
                ? 'Statis'
                : work.durationSeconds
                ? `${String(Math.floor(work.durationSeconds / 60)).padStart(2, '0')}:${String(
                    work.durationSeconds % 60
                  ).padStart(2, '0')}`
                : null;
            const roleText =
              work.roles && work.roles.length > 0
                ? work.roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(' / ')
                : null;
            const topMeta = [work.category, work.client].filter(Boolean).join(' · ');
            const bottomMeta = [roleText, durationText, work.workYear ? String(work.workYear) : null]
              .filter(Boolean)
              .join(' · ');

            return (
              <article
                key={work.id}
                className="group accent-row relative grid grid-cols-12 items-stretch hover:bg-paper-2 transition-colors duration-150 min-w-0"
              >
                {/* Sel Kiri-Tengah (Col 1-8): Nomor Besar + Detail Judul & Metadata */}
                <div className="col-span-8 p-5 lg:px-6 lg:py-5 flex items-center gap-5 lg:gap-6 min-w-0">
                  {/* Nomor Urut Besar (Playfair Display) */}
                  <span className="font-serif text-4xl lg:text-5xl text-ink font-bold leading-none select-none shrink-0 w-12 lg:w-14 accent-row-target">
                    {indexStr}
                  </span>

                  {/* Judul & Baris Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="label-mono text-xs text-ink-2 block truncate">
                      {topMeta}
                    </span>

                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-serif text-xl lg:text-2xl text-ink font-semibold leading-snug line-clamp-1 break-words">
                        <a
                          href={`#portofolio/${work.slug}`}
                          onClick={(e) => handleOpen(e, work.slug)}
                          className="text-ink focus:outline-none after:absolute after:inset-0 after:z-10"
                        >
                          {work.title}
                        </a>
                      </h3>

                      <span className="arrow-fly-target arrow-fly-upright accent-row-target text-ink-2 shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>

                    <p className="label-mono text-xs text-ink-2 truncate pt-0.5">
                      {bottomMeta}
                    </p>
                  </div>
                </div>

                {/* Sel Kanan (Col 9-12): Bingkai Thumbnail Presisi dengan Garis Pemisah Vertikal */}
                <div className="col-span-4 border-l border-rule p-3 lg:p-3.5 bg-paper-2 flex items-center">
                  <div className="relative w-full aspect-[16/10] overflow-hidden bg-paper border border-rule">
                    <div className="absolute inset-0 w-full h-full">
                      <MediaFrame
                        work={work}
                        variant="index"
                        priority={idx < 3}
                        aspectRatio="original"
                      />
                    </div>
                    {work.mediaType === 'video' && durationText && (
                      <div className="absolute bottom-1.5 left-1.5 pointer-events-none z-10">
                        <span className="media-chip">
                          <Play className="w-3 h-3 fill-ink stroke-none" />
                          <span>{durationText}</span>
                        </span>
                      </div>
                    )}
                    {work.aiAssisted && (
                      <div className="absolute bottom-1.5 right-1.5 pointer-events-none z-10">
                        <span className="media-chip font-bold">AI</span>
                      </div>
                    )}
                    <div className="crop-overlay" aria-hidden="true" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          2. TAMPILAN HP (< 768px):
          Filmstrip Horizontal Geser dengan Rasio 3:4 (Tanpa Teks Judul Strip)
          ======================================================== */}
      <div className="block md:hidden w-full">
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3.5 pb-4 -mx-4 px-4 no-scrollbar">
          {displayWorks.map((work, idx) => (
            <div
              key={work.id}
              className="snap-start shrink-0 w-[68vw] max-w-[260px]"
            >
              <SheetItem
                work={work}
                index={idx}
                openWork={openWork}
                priority={idx < 2}
                layout="grid"
                aspectRatio="3:4"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
