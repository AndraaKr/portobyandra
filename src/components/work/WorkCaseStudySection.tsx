import React, { useState } from 'react';
import type { Work } from '../../utils/work';
import { getCaseStudyForWork } from '../../utils/caseStudies';
import { StillFrameLightbox } from './StillFrameLightbox';
import { Maximize2 } from 'lucide-react';

interface WorkCaseStudySectionProps {
  work: Work;
}

export const WorkCaseStudySection: React.FC<WorkCaseStudySectionProps> = ({ work }) => {
  const caseStudy = getCaseStudyForWork(work);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const hasStills = caseStudy.stills && caseStudy.stills.length > 0;
  const hasPalette = caseStudy.palette && caseStudy.palette.length > 0;

  return (
    <section
      aria-label="Studi Kasus dan Potongan Frame"
      className="border-t border-rule pt-12 mt-12 mb-16 space-y-12"
    >
      {/* ========================================================
          BAGIAN 1: STUDI KASUS 3 PILAR (EDITORIAL BREAKDOWN)
          ======================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-rule pb-3">
          <div>
            <span className="label-mono text-xs text-ink-2 font-bold block mb-1">
              02 / STUDI KASUS PRODUKSI
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink">
              Proses Kreatif &amp; Eksplorasi Visual
            </h2>
          </div>
          <span className="label-mono text-xs text-ink-2">
            Metodologi Terukur
          </span>
        </div>

        {/* Grid 3 Pilar Menggunakan 12-Kolom Asimetris */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Pilar 1: Tantangan Brief */}
          <div className="md:col-span-4 border border-rule p-5 bg-paper flex flex-col justify-between space-y-3">
            <div>
              <span className="label-mono text-xs text-ink font-bold block mb-2 pb-1 border-b border-rule">
                01 · TANTANGAN BRIEF
              </span>
              <p className="font-sans text-sm text-ink-2 leading-relaxed">
                {caseStudy.challenge}
              </p>
            </div>
          </div>

          {/* Pilar 2: Pendekatan Visual & AI */}
          <div className="md:col-span-4 border border-rule p-5 bg-paper flex flex-col justify-between space-y-3">
            <div>
              <span className="label-mono text-xs text-ink font-bold block mb-2 pb-1 border-b border-rule">
                02 · METODOLOGI VISUAL &amp; AI
              </span>
              <p className="font-sans text-sm text-ink-2 leading-relaxed">
                {caseStudy.approach}
              </p>
            </div>
          </div>

          {/* Pilar 3: Hasil & Dampak */}
          <div className="md:col-span-4 border border-rule p-5 bg-paper flex flex-col justify-between space-y-3">
            <div>
              <span className="label-mono text-xs text-ink font-bold block mb-2 pb-1 border-b border-rule">
                03 · HASIL &amp; EVALUASI
              </span>
              <p className="font-sans text-sm text-ink-2 leading-relaxed">
                {caseStudy.outcome}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          BAGIAN 2: GALERI POTONGAN FRAME SINEMATIK (STILLS REEL)
          ======================================================== */}
      {hasStills && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-rule pb-3">
            <div>
              <span className="label-mono text-xs text-ink-2 font-bold block mb-1">
                03 / POTONGAN FRAME SINEMATIK
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-ink">
                Tangkapan Adegan Kunci &amp; Perlakuan Visual
              </h3>
            </div>
            <span className="label-mono text-xs text-ink-2">
              Klik bingkai untuk melihat detail
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {caseStudy.stills.map((still, idx) => {
              const frameNum = String(idx + 1).padStart(2, '0');
              return (
                <div
                  key={still.id || idx}
                  className="group relative flex flex-col border border-rule bg-paper"
                >
                  {/* Container Bingkai 16:9 dengan Efek Tanda Potong M4 */}
                  <div className="relative aspect-video w-full overflow-hidden bg-paper-2 border-b border-rule">
                    <img
                      src={still.imageUrl}
                      alt={still.title}
                      className="w-full h-full object-contain select-none"
                    />

                    {/* Chip Sudut Kiri-Atas Frame */}
                    <div className="absolute top-2 left-2 pointer-events-none z-10">
                      <span className="media-chip font-bold">
                        FRAME {frameNum}
                        {still.timestamp ? ` · ${still.timestamp}` : ''}
                      </span>
                    </div>

                    {/* Tombol Perbesar Hover */}
                    <button
                      type="button"
                      onClick={() => setLightboxIndex(idx)}
                      className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 cursor-pointer bg-transparent border-none z-20"
                      aria-label={`Buka detail frame ${frameNum}: ${still.title}`}
                    >
                      <span className="media-chip font-bold inline-flex items-center gap-1">
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Perbesar</span>
                      </span>
                    </button>

                    {/* Tanda Potong Overlay M4 */}
                    <div className="crop-overlay" aria-hidden="true" />
                  </div>

                  {/* Keterangan Teks Frame */}
                  <div className="p-3 space-y-1">
                    <h4 className="font-sans text-xs sm:text-sm font-semibold text-ink leading-snug line-clamp-1">
                      {still.title}
                    </h4>
                    {still.caption && (
                      <p className="font-sans text-xs text-ink-2 leading-relaxed line-clamp-2">
                        {still.caption}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          BAGIAN 3: PALET WARNA SINEMATIK
          ======================================================== */}
      {hasPalette && (
        <div className="border border-rule p-4 bg-paper space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <span className="label-mono text-xs text-ink-2 font-bold block">
              PALET WARNA PRODUKSI
            </span>
            <span className="label-mono text-xs text-ink-2">
              Harmoni Tonal &amp; Mood Visual
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {caseStudy.palette?.map((swatch, sIdx) => (
              <div
                key={sIdx}
                className="border border-rule p-2 bg-paper-2 flex flex-col justify-between min-h-[64px]"
              >
                <div
                  className="w-full h-6 border border-rule mb-1.5"
                  style={{ backgroundColor: swatch.hex }}
                  aria-hidden="true"
                />
                <div className="flex items-baseline justify-between label-mono text-xs">
                  <span className="text-ink font-semibold truncate mr-1">
                    {swatch.name}
                  </span>
                  <span className="text-ink-2 shrink-0">
                    {swatch.hex}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL LIGHTBOX DETAIL FRAME
          ======================================================== */}
      {lightboxIndex !== null && (
        <StillFrameLightbox
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
          stills={caseStudy.stills}
          activeIndex={lightboxIndex}
          onSelectIndex={(idx) => setLightboxIndex(idx)}
          workTitle={work.title}
        />
      )}
    </section>
  );
};
