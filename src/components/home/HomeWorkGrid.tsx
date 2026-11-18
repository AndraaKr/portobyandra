import React from 'react';
import type { Work } from '../../utils/work';
import { SheetItem } from '../work/SheetItem';

interface HomeWorkGridProps {
  works: Work[];
  openWork?: (slug: string) => void;
}

export const HomeWorkGrid: React.FC<HomeWorkGridProps> = ({ works, openWork }) => {
  if (works.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="label-mono text-xs text-ink-2">Belum ada karya yang diterbitkan.</p>
      </div>
    );
  }

  // Maksimal 6 karya terpilih untuk lembar kontak Beranda
  const displayWorks = works.slice(0, 6);
  const mainWork = displayWorks[0];
  const secondaryWorks = displayWorks.slice(1);

  return (
    <div className="w-full">
      {/* ========================================================
          1. TAMPILAN DESKTOP & TABLET (>= 768px):
          Lembar Kontak Asimetris dengan Rasio Asli Karya
          - Kiri (col-span-7): Karya utama besar dengan rasio aslinya
          - Kanan (col-span-5): Sisa karya dalam grid kontak 2 kolom
          ======================================================== */}
      <div className="hidden md:grid md:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Kolom Kiri: Karya Utama Besar */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between border-b border-rule pb-2">
            <span className="label-mono text-xs font-bold text-ink">
              [ 01 · KARYA UTAMA ]
            </span>
            <span className="label-mono text-xs text-ink-2">
              {mainWork.category.toUpperCase()}
            </span>
          </div>

          <SheetItem
            work={mainWork}
            index={0}
            openWork={openWork}
            priority={true}
            layout="grid"
            aspectRatio="original"
          />

          {mainWork.description && (
            <p className="font-sans text-xs sm:text-sm text-ink-2 leading-relaxed pt-1">
              {mainWork.description}
            </p>
          )}
        </div>

        {/* Kolom Kanan: Sisa Karya dalam Lembar Kontak 2 Kolom */}
        {secondaryWorks.length > 0 && (
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between border-b border-rule pb-2">
              <span className="label-mono text-xs font-bold text-ink-2">
                LEMBAR KONTAK · KARYA PILIHAN
              </span>
              <span className="label-mono text-xs text-ink-2">
                02 — 0{displayWorks.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:gap-5">
              {secondaryWorks.map((work, idx) => (
                <SheetItem
                  key={work.id}
                  work={work}
                  index={idx + 1}
                  openWork={openWork}
                  priority={idx < 2}
                  layout="grid"
                  aspectRatio="original"
                />
              ))}
            </div>
          </div>
        )}
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
