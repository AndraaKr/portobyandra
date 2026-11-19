import React from 'react';
import type { Work } from '../../utils/work';
import { SheetItem } from './SheetItem';

interface ContactSheetProps {
  works: Work[];
  openWork?: (slug: string) => void;
  rowHeight?: string;
  isFilmstripOnMobile?: boolean;
}

export const ContactSheet: React.FC<ContactSheetProps> = ({
  works,
  openWork,
  rowHeight,
  isFilmstripOnMobile = false,
}) => {
  if (works.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="label-mono text-xs text-ink-2">Belum ada karya yang diterbitkan.</p>
      </div>
    );
  }

  // Jika di Beranda HP: filmstrip horizontal
  if (isFilmstripOnMobile) {
    return (
      <div className="w-full">
        {/* Tampilan HP: Filmstrip Horizontal (< 768px) */}
        <div className="flex md:hidden overflow-x-auto snap-x snap-proximity gap-3 pb-4 pt-1 -mx-4 px-4 no-scrollbar">
          {works.map((work, idx) => {
            const ar = work.mediaWidth / work.mediaHeight;
            const itemWidth = ar < 0.8 ? 'min(70vw, 260px)' : 'min(88vw, 360px)';
            return (
              <div
                key={work.id}
                className="snap-start shrink-0"
                style={{ width: itemWidth }}
              >
                <SheetItem work={work} index={idx} openWork={openWork} priority={idx < 2} />
              </div>
            );
          })}
        </div>

        {/* Tampilan Desktop/Tablet (>= 768px): Contact Sheet */}
        <div
          className="hidden md:flex sheet"
          style={rowHeight ? ({ '--row-h': rowHeight } as React.CSSProperties) : undefined}
        >
          {works.map((work, idx) => (
            <SheetItem key={work.id} work={work} index={idx} openWork={openWork} priority={idx < 4} />
          ))}
        </div>
      </div>
    );
  }

  // Tampilan halaman Karya (#portofolio):
  // Rasio seragam 3:4 di semua tampilan: 2 kolom di mobile, 4 di tablet, dan 5 kolom sejajar (jejer 5) di desktop
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-3.5 sm:gap-x-4 lg:gap-x-5 gap-y-8 md:gap-y-10">
        {works.map((work, idx) => (
          <SheetItem
            key={work.id}
            work={work}
            index={idx}
            openWork={openWork}
            priority={idx < 5}
            layout="grid"
          />
        ))}
      </div>
    </div>
  );
};
