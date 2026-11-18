import React, { useEffect } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { MediaFrame } from '../components/work/MediaFrame';
import { WorkMeta } from '../components/work/WorkMeta';
import { isPublicWork, normalizeWork, sortWorks } from '../utils/work';

export const WorkDetailPage: React.FC = () => {
  const { portfolioItems, activeWorkSlug, setActiveTab, openWork, getMarketingResultForWork } = usePortfolio();

  // Daftar karya publik yang terurut
  const publicItems = portfolioItems.filter(isPublicWork).sort(sortWorks);

  // Cari index dan item berdasarkan slug
  const currentIndex = publicItems.findIndex((p) => p.slug === activeWorkSlug);
  const rawItem = currentIndex !== -1 ? publicItems[currentIndex] : null;

  useEffect(() => {
    if (rawItem) {
      document.title = `${rawItem.title} — Muhammad Andra Kusuma Ramadhan`;
    } else {
      document.title = 'Karya tidak ditemukan. — Muhammad Andra Kusuma Ramadhan';
    }
  }, [rawItem]);

  // Jika slug tidak ditemukan atau bukan karya publik
  if (!rawItem || currentIndex === -1) {
    return (
      <div className="page py-12 md:py-20">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('portofolio')}
            className="text-link label-mono text-ink cursor-pointer bg-transparent border-none p-0 min-h-[44px] flex items-center"
          >
            ← Karya
          </button>
        </div>
        <h1
          className="text-ink font-serif text-3xl sm:text-4xl mb-4"
        >
          Karya tidak ditemukan.
        </h1>
        <button
          type="button"
          onClick={() => setActiveTab('portofolio')}
          className="btn-primary"
        >
          Kembali ke Karya
        </button>
      </div>
    );
  }

  const work = normalizeWork(rawItem);
  const marketingResult = getMarketingResultForWork ? getMarketingResultForWork(work) : undefined;
  const indexStr = String(currentIndex + 1).padStart(2, '0');
  const prevItem = currentIndex > 0 ? publicItems[currentIndex - 1] : null;
  const nextItem = currentIndex < publicItems.length - 1 ? publicItems[currentIndex + 1] : null;
  const isPortrait = work.orientation === 'portrait';

  const compactNumber = (val: number) =>
    new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(val);

  const renderQuickMetricsBlock = () => {
    const viewsCount = marketingResult ? compactNumber(marketingResult.resultValue) : null;
    const directUrl = work.projectUrl || marketingResult?.evidenceUrl || work.videoUrl;

    if (!viewsCount && !work.metrics && !directUrl) return null;

    return (
      <div className="border-t border-rule pt-4 space-y-3">
        <div>
          <span className="label-mono text-xs text-ink block mb-1 font-semibold">Hasil</span>
          {viewsCount ? (
            <p className="font-serif text-3xl text-ink font-bold">
              {viewsCount} <span className="text-base font-sans font-normal text-ink-2">views</span>
            </p>
          ) : work.metrics ? (
            <p className="font-serif text-2xl text-ink font-bold">
              {work.metrics}
            </p>
          ) : null}
        </div>

        {directUrl && (
          <div className="pt-1">
            <a
              href={directUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs inline-flex items-center gap-1.5 min-h-[44px]"
            >
              <span>Tonton di platform asli</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-paper" />
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page py-8 md:py-16">
      {/* Tombol Kembali: "← Karya" (Bab 3.3) */}
      <div className="border-b border-rule pb-3 mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setActiveTab('portofolio')}
          className="text-link label-mono text-xs text-ink cursor-pointer bg-transparent border-none p-0 inline-flex items-center min-h-[44px]"
        >
          <span>← Karya</span>
        </button>
        <div className="flex items-center gap-3">
          {work.aiAssisted && (
            <span className="label-mono text-xs text-ink-2 font-semibold">
              Dibuat dengan AI
            </span>
          )}
          <span className="label-mono text-xs text-ink-2">
            {work.category}
          </span>
        </div>
      </div>

      {/* Header Judul Ringkas (Tinggi <= 22svh, Bab 6.4) */}
      <div className="max-h-[22svh] mb-8">
        <div className="flex items-baseline gap-4">
          {/* Nomor Indeks Besar Vermilion (Aksen #2) */}
          <span
            className="font-serif text-4xl sm:text-6xl text-vermilion select-none font-bold shrink-0 leading-none"
            style={{ letterSpacing: '-0.03em' }}
          >
            {indexStr}
          </span>
          <h1
            className="text-ink font-serif text-2xl sm:text-4xl md:text-5xl leading-tight text-balance"
            style={{ letterSpacing: '-0.02em' }}
          >
            {work.title}
          </h1>
        </div>
      </div>

      {/* ========================================================
          MEDIA PEMUTAR & METADATA (Di atas lipatan)
          ======================================================== */}
      {isPortrait ? (
        // Tata Letak Video Vertikal 9:16: Dibatasi proporsional agar ringkas, seimbang, dan tidak menutupi teks
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-x-10 mb-16 items-start">
          <div className="md:col-span-5 flex flex-col items-center md:items-start">
            <div className="w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] max-h-[52vh] md:max-h-[500px] overflow-hidden bg-paper-2 border border-rule flex items-center justify-center">
              <MediaFrame work={work} variant="detail" priority />
            </div>
            {work.mediaType === 'image' && work.posterUrl && (
              <div className="mt-3">
                <a
                  href={work.posterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link label-mono text-xs text-ink inline-flex items-center gap-1 min-h-[44px]"
                >
                  <span>Buka gambar asli</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="md:col-span-7 space-y-6">
            <WorkMeta work={work} />

            {/* Alat */}
            {work.tools && work.tools.length > 0 && (
              <div className="border-t border-rule pt-4">
                <span className="label-mono text-xs text-ink block mb-1">Alat</span>
                <span className="label-mono text-xs text-ink-2">{work.tools.join(' / ')}</span>
              </div>
            )}

            {/* Hasil */}
            {work.metrics && (
              <div className="border-t border-rule pt-4">
                <span className="label-mono text-xs text-ink block mb-1">Hasil</span>
                <p className="text-ink-2 text-sm">
                  {work.metrics}
                </p>
              </div>
            )}

            {/* Deskripsi */}
            {work.description && (
              <div className="border-t border-rule pt-4">
                <p className="text-ink font-sans text-sm sm:text-base leading-relaxed max-w-[62ch]">
                  {work.description}
                </p>
              </div>
            )}

            {/* Metrik Hasil & Link Tonton Ringkas */}
            {renderQuickMetricsBlock()}
          </div>
        </div>
      ) : (
        // Tata Letak Landscape / Square
        <div className="space-y-8 mb-16">
          <div className="max-w-5xl">
            <MediaFrame work={work} variant="detail" priority />
            {work.mediaType === 'image' && work.posterUrl && (
              <div className="mt-3">
                <a
                  href={work.posterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link label-mono text-xs text-ink inline-flex items-center gap-1 min-h-[44px]"
                >
                  <span>Buka gambar asli</span>
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-rule pt-8">
            <div className="md:col-span-5 space-y-6">
              <WorkMeta work={work} />

              {/* Alat */}
              {work.tools && work.tools.length > 0 && (
                <div className="border-t border-rule pt-4">
                  <span className="label-mono text-xs text-ink block mb-1">Alat</span>
                  <span className="label-mono text-xs text-ink-2">{work.tools.join(' / ')}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-7 space-y-4">
              {work.description && (
                <p className="text-ink font-sans text-base leading-relaxed max-w-[62ch]">
                  {work.description}
                </p>
              )}

              {/* Metrik Hasil & Link Tonton Ringkas */}
              {renderQuickMetricsBlock()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          NAVIGASI SEBELUMNYA / BERIKUTNYA
          ======================================================== */}
      <nav
        className="border-t border-rule pt-6 flex items-center justify-between label-mono text-xs text-ink"
        aria-label="Navigasi Karya"
      >
        <div className="w-1/2">
          {prevItem ? (
            <button
              type="button"
              onClick={() => openWork(prevItem.slug)}
              className="text-link cursor-pointer bg-transparent border-none p-0 text-left min-h-[44px] flex items-center"
            >
              ← {String(currentIndex).padStart(2, '0')} {prevItem.title}
            </button>
          ) : (
            <span className="text-ink-2 select-none">—</span>
          )}
        </div>

        <div className="w-1/2 flex justify-end">
          {nextItem ? (
            <button
              type="button"
              onClick={() => openWork(nextItem.slug)}
              className="text-link cursor-pointer bg-transparent border-none p-0 text-right min-h-[44px] flex items-center justify-end"
            >
              {String(currentIndex + 2).padStart(2, '0')} {nextItem.title} →
            </button>
          ) : (
            <span className="text-ink-2 select-none">—</span>
          )}
        </div>
      </nav>
    </div>
  );
};
