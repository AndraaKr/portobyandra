import React, { useEffect } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import type { Experience, MarketingResult, PortfolioItem } from '../../types';
import { BarPair } from '../marketing/BarPair';

interface ExperienceDetailModalProps {
  experience: Experience | null;
  onClose: () => void;
  marketingResults: MarketingResult[];
  portfolioItems: PortfolioItem[];
  openWork: (slug: string) => void;
}

export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({
  experience,
  onClose,
  marketingResults,
  portfolioItems,
  openWork,
}) => {
  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (experience) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [experience, onClose]);

  if (!experience) return null;

  const orgLower = (experience.organization || '').toLowerCase();
  const roleLower = (experience.role || '').toLowerCase();
  const isMarketingExp = orgLower.includes('reja') || roleLower.includes('marketing');

  const relatedMarketingResults = isMarketingExp
    ? marketingResults.filter(
        (m) =>
          m.published &&
          ((m.organization && m.organization.toLowerCase().includes('reja')) ||
            (m.accountName && m.accountName.toLowerCase().includes('reja')) ||
            m.slug.includes('edukasi'))
      )
    : [];

  const linkedWorks = isMarketingExp
    ? portfolioItems.filter(
        (p) =>
          p.slug === 'edu-3' ||
          (p.client && p.client.toLowerCase().includes('reja')) ||
          relatedMarketingResults.some((m) =>
            (m.relatedWorkSlugs || []).some((s) => s.toLowerCase() === p.slug.toLowerCase())
          )
      )
    : [];

  const compactNumber = (val: number) =>
    new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(val);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-exp-title"
      className="fixed inset-0 z-50 bg-ink/50 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-paper border border-rule w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-6 sm:p-8 flex flex-col justify-between relative">
        {/* Header Modal */}
        <div className="flex items-start justify-between gap-4 border-b border-rule pb-4 mb-6">
          <div className="min-w-0 flex-1">
            <span className="label-mono text-xs text-ink-2 font-bold block mb-1">
              DETAIL PENGALAMAN KERJA
            </span>
            <h2 id="modal-exp-title" className="font-serif text-2xl sm:text-3xl text-ink font-semibold break-words">
              {experience.role}
            </h2>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1.5 label-mono text-xs text-ink-2">
              <span className="font-semibold text-ink break-words max-w-full">{experience.organization}</span>
              <span>·</span>
              <span>{experience.period}</span>
              {experience.location && (
                <>
                  <span>·</span>
                  <span className="break-words max-w-full">{experience.location}</span>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela pop up"
            className="p-2 border border-rule text-ink hover:bg-paper-2 cursor-pointer transition-colors duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Isi Modal */}
        <div className="space-y-6 min-w-0">
          {/* Deskripsi Pengalaman */}
          <div className="space-y-2 min-w-0">
            <span className="label-mono text-xs text-ink-2 font-bold block">
              DESKRIPSI TANGGUNG JAWAB &amp; LINGKUP KERJA
            </span>
            <p className="text-ink font-sans text-sm sm:text-base leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
              {experience.description}
            </p>
          </div>

          {/* Keahlian Terkait */}
          {experience.skills && experience.skills.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-rule min-w-0">
              <span className="label-mono text-xs text-ink-2 font-bold block">
                KEAHLIAN &amp; PERANGKAT LUNAK TERKAIT
              </span>
              <div className="flex flex-wrap gap-1.5">
                {experience.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="label-mono text-xs text-ink px-2.5 py-1 border border-rule bg-paper-2 max-w-full break-words"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Blok Capaian Digital Marketing Terukur (jika ada) */}
          {isMarketingExp && relatedMarketingResults.length > 0 && (
            <div className="border border-rule p-5 bg-paper-2 space-y-5 pt-4 min-w-0">
              <span className="label-mono text-xs text-ink-2 font-bold block border-b border-rule pb-2">
                CAPAIAN DIGITAL MARKETING TERUKUR
              </span>

              {relatedMarketingResults.map((mkt) => {
                const deltaPct =
                  mkt.baselineValue === 0
                    ? 'Dari 0'
                    : `+${Math.round(((mkt.resultValue - mkt.baselineValue) / mkt.baselineValue) * 100)}%`;

                return (
                  <div key={mkt.id} className="space-y-3 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-rule pb-2 min-w-0">
                      <h3 className="font-serif text-base sm:text-lg text-ink font-bold break-words min-w-0">
                        {mkt.title}
                      </h3>
                      <span className="label-mono text-xs text-ink font-semibold break-words min-w-0">
                        {mkt.platform.toUpperCase()} · {mkt.accountName}
                      </span>
                    </div>

                    <div className="border border-rule p-4 bg-paper space-y-3 min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <div className="flex items-baseline gap-6 min-w-0">
                          <div>
                            <span className="label-mono text-xs text-ink-2 block">Sebelum</span>
                            <span className="font-serif text-xl sm:text-2xl text-ink font-bold">
                              {compactNumber(mkt.baselineValue)}
                            </span>
                          </div>
                          <div className="border-l border-rule pl-6">
                            <span className="label-mono text-xs text-ink-2 block">Sesudah</span>
                            <span className="font-serif text-xl sm:text-2xl text-ink font-bold">
                              {compactNumber(mkt.resultValue)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="label-mono text-xs text-ink-2 block">Kenaikan</span>
                          <span className="font-serif text-xl sm:text-2xl text-ink font-bold">
                            {deltaPct}
                          </span>
                        </div>
                      </div>

                      <BarPair
                        baselineValue={mkt.baselineValue}
                        resultValue={mkt.resultValue}
                        metricLabel={mkt.metricLabel}
                      />
                    </div>

                    {mkt.contentSummary && (
                      <p className="font-sans text-xs sm:text-sm text-ink-2 leading-relaxed break-words [overflow-wrap:anywhere]">
                        {mkt.contentSummary}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-rule text-xs label-mono text-ink-2 min-w-0">
                      <span className="break-words min-w-0">Sumber data: {mkt.sourceNote}</span>
                      {mkt.evidenceUrl && (
                        <a
                          href={mkt.evidenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-link text-ink inline-flex items-center gap-1 min-h-[44px]"
                        >
                          <span>Lihat bukti performa</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Tautan Karya Terkait */}
              {linkedWorks.length > 0 && (
                <div className="pt-3 border-t border-rule space-y-2">
                  <span className="label-mono text-xs text-ink font-bold block">
                    KARYA TERKAIT PADA MASA KERJA INI:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {linkedWorks.map((lw) => (
                      <button
                        key={lw.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          openWork(lw.slug);
                        }}
                        className="btn-primary text-xs inline-flex items-center gap-1.5 py-1.5 px-3 min-h-[44px] max-w-full text-left"
                      >
                        <span className="break-words min-w-0">{lw.title}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-paper shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="pt-6 mt-6 border-t border-rule flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs px-4 py-2 min-h-[44px]"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
