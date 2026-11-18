import React from 'react';
import type { Work } from '../../utils/work';
import { usePortfolio } from '../../context/PortfolioContext';
import { MediaFrame } from './MediaFrame';
import { WorkMeta } from './WorkMeta';

interface WorkRowProps {
  work: Work;
  index: number;
  openWork?: (slug: string) => void;
  priority?: boolean;
}

export const WorkRow: React.FC<WorkRowProps> = ({ work, index, openWork: openWorkProp, priority = false }) => {
  const context = usePortfolio();
  const openWork = openWorkProp || context.openWork;
  const indexStr = String(index + 1).padStart(2, '0');
  const isFlip = index % 2 === 1;
  const orientation = work.orientation;

  // Media max 7 kolom di desktop (Bab 6.3)
  let mediaColClass = '';
  let metaColClass = '';

  if (orientation === 'landscape') {
    if (!isFlip) {
      mediaColClass = 'md:col-start-2 md:col-end-8';
      metaColClass = 'md:col-start-8 md:col-end-12';
    } else {
      mediaColClass = 'md:col-start-6 md:col-end-12';
      metaColClass = 'md:col-start-2 md:col-end-6 md:row-start-1';
    }
  } else if (orientation === 'square') {
    if (!isFlip) {
      mediaColClass = 'md:col-start-2 md:col-end-7';
      metaColClass = 'md:col-start-7 md:col-end-12';
    } else {
      mediaColClass = 'md:col-start-7 md:col-end-12';
      metaColClass = 'md:col-start-2 md:col-end-7 md:row-start-1';
    }
  } else {
    // portrait
    if (!isFlip) {
      mediaColClass = 'md:col-start-2 md:col-end-6';
      metaColClass = 'md:col-start-7 md:col-end-11';
    } else {
      mediaColClass = 'md:col-start-7 md:col-end-11';
      metaColClass = 'md:col-start-2 md:col-end-6 md:row-start-1';
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (openWork) {
      openWork(work.slug);
    } else {
      window.location.hash = `portofolio/${work.slug}`;
    }
  };

  return (
    <article
      className="work-row group relative py-8 md:py-10"
      data-orientation={orientation}
      data-flip={isFlip ? 'true' : 'false'}
    >
      {/* Mobile Layout (< md) */}
      <div className="flex flex-col gap-4 md:hidden">
        <div className="flex items-center justify-between">
          <span className="label-mono text-xs font-bold text-ink-2">[{indexStr}]</span>
          <span className="label-mono text-xs text-ink-2">{work.category}</span>
        </div>

        <div className={orientation === 'portrait' ? 'max-w-[70%]' : 'w-full'}>
          <div className="group-hover:opacity-90 transition-opacity duration-120">
            <MediaFrame work={work} variant="index" priority={priority} />
          </div>
        </div>

        <div>
          <h3
            className="text-ink font-serif"
            style={{
              fontSize: 'var(--step-display-m)',
              lineHeight: 0.98,
              letterSpacing: '-0.02em',
            }}
          >
            <a
              href={`#portofolio/${work.slug}`}
              onClick={handleClick}
              className="after:absolute after:inset-0 text-inherit hover:underline"
            >
              {work.title}
            </a>
          </h3>
          <div className="mt-3">
            <WorkMeta work={work} />
          </div>
        </div>
      </div>

      {/* Desktop Layout (>= md) 12 Column Grid */}
      <div className="hidden md:grid grid-12 items-start">
        {/* Kolom 1: Margin Nomor Indeks */}
        <div className="col-start-1 col-end-2">
          <span className="label-mono text-xs text-ink-2 font-bold">
            {indexStr}
          </span>
        </div>

        {/* Media Frame (Maks 7 Kolom) */}
        <div className={mediaColClass}>
          <div className="group-hover:opacity-90 transition-opacity duration-120">
            <MediaFrame work={work} variant="index" priority={priority} />
          </div>
        </div>

        {/* Metadata & Judul Karya */}
        <div className={`${metaColClass} flex flex-col justify-between self-stretch py-2`}>
          <div>
            <div className="mb-2">
              <span className="label-mono text-xs text-ink-2">{work.category}</span>
            </div>
            <h3
              className="text-ink font-serif"
              style={{
                fontSize: 'var(--step-display-m)',
                lineHeight: 0.98,
                letterSpacing: '-0.02em',
              }}
            >
              <a
                href={`#portofolio/${work.slug}`}
                onClick={handleClick}
                className="after:absolute after:inset-0 text-inherit hover:underline"
              >
                {work.title}
              </a>
            </h3>
          </div>
          <div className="mt-6">
            <WorkMeta work={work} />
          </div>
        </div>
      </div>
    </article>
  );
};
