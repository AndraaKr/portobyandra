import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { ContactSheet } from '../components/work/ContactSheet';
import { WorkRow } from '../components/work/WorkRow';
import { isPublicWork, normalizeWork, sortWorks, Work } from '../utils/work';

type FilterType = 'semua' | 'video' | 'desain';
type ViewMode = 'lembar' | 'daftar';

export const PortfolioPage: React.FC = () => {
  const { portfolioItems, isLoadingData, openWork } = usePortfolio();
  const [filter, setFilter] = useState<FilterType>('semua');
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'lembar';
    try {
      const saved = localStorage.getItem('andrakr_view_mode');
      return saved === 'daftar' ? 'daftar' : 'lembar';
    } catch {
      return 'lembar';
    }
  });

  useEffect(() => {
    document.title = 'Karya — Portofolio Muhammad Andra Kusuma Ramadhan';
  }, []);

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('andrakr_view_mode', mode);
    } catch {
      // Ignore
    }
  };

  // Filter hanya item publik (Video Editing & Desain, bukan showreel)
  const publicItems = portfolioItems.filter(isPublicWork).sort(sortWorks);

  const filteredItems = publicItems.filter((item) => {
    if (filter === 'video') return item.category === 'Video Editing';
    if (filter === 'desain') return item.category === 'Desain';
    return true;
  });

  const normalizedWorks = filteredItems.map(normalizeWork);
  const totalCountStr = String(publicItems.length).padStart(2, '0');

  // Kelompokkan per tahun bila ada >= 2 tahun berbeda dan karya cukup banyak (>= 4)
  const years = Array.from(
    new Set(normalizedWorks.map((w) => w.workYear).filter((y): y is number => typeof y === 'number'))
  ).sort((a, b) => b - a);

  const hasMultipleYears = normalizedWorks.length >= 4 && years.length >= 2;

  const worksByYear: { year?: number; works: Work[] }[] = hasMultipleYears
    ? years.map((year) => ({
        year,
        works: normalizedWorks.filter((w) => w.workYear === year),
      }))
    : [{ works: normalizedWorks }];

  return (
    <div className="page py-8 md:py-16">
      {/* Header Halaman: Judul, Hitungan, dan Kontrol */}
      <div className="border-b border-rule pb-6 mb-8 flex flex-col md:flex-row md:items-baseline justify-between gap-6">
        <div className="flex items-baseline gap-3">
          <h1
            className="text-ink font-serif tracking-tight select-none"
            style={{
              fontSize: 'var(--step-display-l)',
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
            }}
          >
            Karya
          </h1>
          <span className="label-mono text-sm text-ink-2 font-bold">
            ({totalCountStr})
          </span>
        </div>

        {/* Kontrol: Filter Kategori & Toggle Lembar/Daftar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Filter Baris Mono (Garis bawah vermilion pada filter aktif — aksen #2) */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setFilter('semua')}
              aria-pressed={filter === 'semua'}
              className="cursor-pointer bg-transparent border-none p-0 pb-1 label-mono text-xs text-ink transition-opacity duration-120 min-h-[44px] flex items-center"
              style={{
                borderBottom: filter === 'semua' ? '2px solid var(--vermilion)' : '2px solid transparent',
                fontWeight: filter === 'semua' ? 700 : 400,
              }}
            >
              Semua
            </button>
            <span className="text-rule select-none">/</span>
            <button
              type="button"
              onClick={() => setFilter('video')}
              aria-pressed={filter === 'video'}
              className="cursor-pointer bg-transparent border-none p-0 pb-1 label-mono text-xs text-ink transition-opacity duration-120 min-h-[44px] flex items-center"
              style={{
                borderBottom: filter === 'video' ? '2px solid var(--vermilion)' : '2px solid transparent',
                fontWeight: filter === 'video' ? 700 : 400,
              }}
            >
              Video
            </button>
            <span className="text-rule select-none">/</span>
            <button
              type="button"
              onClick={() => setFilter('desain')}
              aria-pressed={filter === 'desain'}
              className="cursor-pointer bg-transparent border-none p-0 pb-1 label-mono text-xs text-ink transition-opacity duration-120 min-h-[44px] flex items-center"
              style={{
                borderBottom: filter === 'desain' ? '2px solid var(--vermilion)' : '2px solid transparent',
                fontWeight: filter === 'desain' ? 700 : 400,
              }}
            >
              Desain
            </button>
          </div>

          {/* Toggle Tampilan (Lembar / Daftar) — Disembunyikan di HP (< 768px) */}
          <div className="hidden md:flex items-center gap-2 pl-4 border-l border-rule">
            <button
              type="button"
              onClick={() => handleViewChange('lembar')}
              aria-pressed={viewMode === 'lembar'}
              className={`label-mono text-xs cursor-pointer bg-transparent border-none p-0 pb-0.5 transition-opacity duration-120 min-h-[44px] flex items-center ${
                viewMode === 'lembar' ? 'text-ink font-bold border-b border-ink' : 'text-ink-2 hover:text-ink'
              }`}
            >
              Lembar
            </button>
            <span className="text-rule select-none">/</span>
            <button
              type="button"
              onClick={() => handleViewChange('daftar')}
              aria-pressed={viewMode === 'daftar'}
              className={`label-mono text-xs cursor-pointer bg-transparent border-none p-0 pb-0.5 transition-opacity duration-120 min-h-[44px] flex items-center ${
                viewMode === 'daftar' ? 'text-ink font-bold border-b border-ink' : 'text-ink-2 hover:text-ink'
              }`}
            >
              Daftar
            </button>
          </div>
        </div>
      </div>

      {/* Konten Karya */}
      {isLoadingData ? (
        <div className="w-full flex items-center justify-center py-24 bg-paper-2">
          <span className="label-mono text-xs text-ink-2">Memuat</span>
        </div>
      ) : publicItems.length === 0 ? (
        <div className="py-20 text-center">
          <p className="label-mono text-xs text-ink-2">Belum ada karya yang diterbitkan.</p>
        </div>
      ) : normalizedWorks.length === 0 ? (
        <div className="py-20 text-center">
          <p className="label-mono text-xs text-ink-2">Tidak ada karya untuk filter ini.</p>
        </div>
      ) : viewMode === 'daftar' ? (
        /* Tampilan DAFTAR (WorkRow yang dipadatkan) */
        <div className="divide-y divide-rule border-b border-rule">
          {normalizedWorks.map((work, idx) => (
            <WorkRow
              key={work.id}
              work={work}
              index={idx}
              openWork={openWork}
              priority={idx === 0}
            />
          ))}
        </div>
      ) : (
        /* Tampilan LEMBAR (ContactSheet, per tahun bila ada >= 2 tahun) */
        <div className="space-y-12">
          {worksByYear.map((group, gIdx) => (
            <div key={group.year ?? gIdx} className="space-y-4">
              {hasMultipleYears && group.year && (
                <div className="border-t border-rule pt-4 pb-2">
                  <span className="label-mono text-xs text-ink font-bold">
                    {group.year}
                  </span>
                </div>
              )}
              <ContactSheet
                works={group.works}
                openWork={openWork}
                isFilmstripOnMobile={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
