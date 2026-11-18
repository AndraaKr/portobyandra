import React from 'react';
import type { Work } from '../../utils/work';
import { MediaFrame } from './MediaFrame';
import { Play } from 'lucide-react';
import { useInViewOnce } from '../../lib/useInViewOnce';
import { usePortfolio } from '../../context/PortfolioContext';

interface SheetItemProps {
  work: Work;
  index: number;
  openWork?: (slug: string) => void;
  priority?: boolean;
  layout?: 'sheet' | 'grid';
  aspectRatio?: 'original' | '3:4';
  className?: string;
}

export const SheetItem: React.FC<SheetItemProps> = ({
  work,
  index,
  openWork,
  priority = false,
  layout = 'sheet',
  aspectRatio = '3:4',
  className = '',
}) => {
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.05, priority);
  const isFrameInView = priority || inView;
  const { getMarketingResultForWork } = usePortfolio();
  const marketingResult = getMarketingResultForWork ? getMarketingResultForWork(work) : undefined;
  const hasMarketingResult = Boolean(marketingResult || (work.metrics && work.metrics.toLowerCase().includes('view')));

  const indexStr = String(index + 1).padStart(2, '0');
  const ar = aspectRatio === 'original'
    ? `${work.mediaWidth} / ${work.mediaHeight}`
    : '0.75';
  const containerAspect = aspectRatio === 'original'
    ? `${work.mediaWidth} / ${work.mediaHeight}`
    : '3 / 4';

  // Peran
  const roleText = work.roles && work.roles.length > 0
    ? work.roles.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(' / ')
    : '—';

  // Durasi
  const durationText = work.mediaType === 'image'
    ? 'Statis'
    : work.durationSeconds
    ? `${String(Math.floor(work.durationSeconds / 60)).padStart(2, '0')}:${String(work.durationSeconds % 60).padStart(2, '0')}`
    : '—';

  // Klien & Tahun
  const clientText = work.client || '—';
  const yearText = work.workYear ? String(work.workYear) : '—';

  const metadataLine = `${roleText} · ${durationText} · ${clientText} · ${yearText}`;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (openWork) {
      openWork(work.slug);
    } else {
      window.location.hash = `portofolio/${work.slug}`;
    }
  };

  const rootClass = layout === 'grid'
    ? `group relative flex flex-col w-full ${className}`
    : `sheet__item group relative flex flex-col ${className}`;

  return (
    <div
      ref={ref}
      className={rootClass}
      style={{ '--ar': ar } as React.CSSProperties}
    >
      {/* Container Poster Media 3:4 — animasi frame-step M2 hanya pada frame media */}
      <div
        className={`relative w-full overflow-hidden bg-paper-2 frame-step ${isFrameInView ? 'in-view' : ''}`}
        style={{ aspectRatio: containerAspect }}
      >
        <MediaFrame work={work} variant="index" priority={priority} aspectRatio={aspectRatio} />

        {/* Chip 'Ada hasil' di Sudut Kiri-Atas (Petunjuk Ringan untuk Perekrut Marketing) */}
        {hasMarketingResult && (
          <div className="absolute top-2 left-2 pointer-events-none z-10">
            <span className="media-chip font-bold">
              Ada hasil
            </span>
          </div>
        )}

        {/* Chip Durasi Video di Sudut Kiri-Bawah */}
        {work.mediaType === 'video' && (
          <div className="absolute bottom-2 left-2 pointer-events-none z-10">
            <span className="media-chip">
              <Play className="w-3 h-3 fill-ink stroke-none" />
              <span>{durationText}</span>
            </span>
          </div>
        )}

        {/* Chip AI di Sudut Kanan-Bawah */}
        {work.aiAssisted && (
          <div className="absolute bottom-2 right-2 pointer-events-none z-10">
            <span className="media-chip font-bold">
              AI
            </span>
          </div>
        )}

        {/* M4: Tanda Potong (Crop Marks) Overlay saat Hover/Fokus */}
        <div className="crop-overlay" aria-hidden="true" />
      </div>

      {/* Caption di Bawah Poster */}
      <div className="pt-2.5 pb-1 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="label-mono text-xs text-ink-2 font-bold shrink-0">{indexStr}</span>
          <h3 className="font-sans text-base text-ink font-semibold leading-snug line-clamp-2 text-balance">
            <a
              href={`#portofolio/${work.slug}`}
              onClick={handleClick}
              className="text-ink hover:underline focus:outline-none after:absolute after:inset-0 after:z-10"
            >
              {work.title}
            </a>
          </h3>
        </div>

        <p className="label-mono text-xs text-ink-2 line-clamp-1 truncate">
          {metadataLine}
        </p>
      </div>
    </div>
  );
};
