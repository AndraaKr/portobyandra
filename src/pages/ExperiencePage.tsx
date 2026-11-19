import React, { useEffect } from 'react';
import { Download, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { downloadAtsCvPdf } from '../utils/generateAtsPdf';
import { BarPair } from '../components/marketing/BarPair';

export const ExperiencePage: React.FC = () => {
  const { experiences, portfolioItems, marketingResults, openWork, siteProfile, showToast } = usePortfolio();

  useEffect(() => {
    document.title = 'Pengalaman — Portofolio Muhammad Andra Kusuma Ramadhan';
  }, []);

  const sortedExperiences = [...experiences].sort((a, b) => (a.order || 0) - (b.order || 0));

  const compactNumber = (val: number) =>
    new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(val);

  const handleDownloadCv = () => {
    if (!siteProfile) {
      showToast('Data profil belum termuat, coba lagi sesaat.', 'error');
      return;
    }
    try {
      downloadAtsCvPdf(siteProfile, experiences, portfolioItems, {
        language: 'id',
        includeProjects: false,
      });
      showToast('CV (PDF) berhasil diunduh.', 'success');
    } catch {
      showToast('Gagal membuat PDF', 'error');
    }
  };

  return (
    <div className="page py-8 md:py-16">
      {/* Header Halaman: Judul & Satu Aksi Unduh CV */}
      <div className="border-b border-rule pb-6 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <h1
          className="text-ink font-serif tracking-tight select-none"
          style={{
            fontSize: 'var(--step-display-l)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
          }}
        >
          Pengalaman
        </h1>

        <button
          type="button"
          onClick={handleDownloadCv}
          className="btn-primary text-xs inline-flex items-center gap-2 min-h-[44px]"
        >
          <Download className="w-3.5 h-3.5 text-paper" />
          <span>Unduh CV (PDF)</span>
        </button>
      </div>

      {/* Daftar Kronologis Bergaris Rambut */}
      {sortedExperiences.length === 0 ? (
        <div className="py-16 text-center">
          <p className="label-mono text-xs text-ink-2">Belum ada data.</p>
        </div>
      ) : (
        <div className="border-t border-rule divide-y divide-rule border-b">
          {sortedExperiences.map((exp) => {
            const orgLower = (exp.organization || '').toLowerCase();
            const roleLower = (exp.role || '').toLowerCase();
            const isMarketingExp = orgLower.includes('reja') || roleLower.includes('marketing');

            // Ambil data marketing results untuk tempat magang PT Reja Aton Energi
            const relatedMarketingResults = isMarketingExp
              ? marketingResults.filter(
                  (m) =>
                    m.published &&
                    ((m.organization && m.organization.toLowerCase().includes('reja')) ||
                      (m.accountName && m.accountName.toLowerCase().includes('reja')) ||
                      m.slug.includes('edukasi'))
                )
              : [];

            // Ambil karya portofolio yang dihasilkan selama magang di tempat tersebut
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

            return (
              <article key={exp.id} className="py-6 sm:py-8 grid grid-cols-1 md:grid-cols-12 gap-y-3 md:gap-x-8">
                {/* Periode & Lokasi */}
                <div className="md:col-span-3 space-y-1">
                  <span className="label-mono text-xs font-semibold text-ink-2 block">
                    {exp.period}
                  </span>
                  {exp.location && (
                    <span className="label-mono text-xs text-ink-2 block">
                      {exp.location}
                    </span>
                  )}
                </div>

                {/* Peran, Organisasi, Deskripsi */}
                <div className="md:col-span-9 space-y-4">
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl text-ink leading-tight">
                      {exp.role}
                    </h2>
                    <p className="label-mono text-xs text-ink-2 mt-0.5">
                      {exp.organization}
                    </p>
                  </div>

                  {exp.description && (
                    <p className="text-ink font-sans text-sm sm:text-base leading-relaxed max-w-[62ch]">
                      {exp.description}
                    </p>
                  )}

                  {/* Keahlian terkait */}
                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {exp.skills.map((s, i) => (
                        <span
                          key={i}
                          className="label-mono text-xs text-ink-2 px-2 py-0.5 border border-rule"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* ========================================================
                      BLOK CAPAIAN DIGITAL MARKETING TERUKUR (PADA PT REJA ATON ENERGI)
                      ======================================================== */}
                  {isMarketingExp && relatedMarketingResults.length > 0 && (
                    <div className="border border-rule p-5 bg-paper-2 space-y-5 mt-4">
                      {relatedMarketingResults.map((mkt) => {
                        const deltaPct =
                          mkt.baselineValue === 0
                            ? 'Dari 0'
                            : `+${Math.round(((mkt.resultValue - mkt.baselineValue) / mkt.baselineValue) * 100)}%`;

                        return (
                          <div key={mkt.id} className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-rule pb-2.5">
                              <div>
                                <span className="label-mono text-xs text-ink-2 font-bold block mb-0.5">
                                  CAPAIAN DIGITAL MARKETING TERUKUR
                                </span>
                                <h3 className="font-serif text-lg sm:text-xl text-ink font-bold">
                                  {mkt.title}
                                </h3>
                              </div>
                              <span className="label-mono text-xs text-ink font-semibold">
                                {mkt.platform.toUpperCase()} · {mkt.accountName}
                              </span>
                            </div>

                            {/* Angka Sebelum & Sesudah + BarPair */}
                            <div className="border border-rule p-4 bg-paper space-y-3">
                              <div className="flex items-baseline justify-between">
                                <div className="flex items-baseline gap-6">
                                  <div>
                                    <span className="label-mono text-xs text-ink-2 block">Sebelum</span>
                                    <span className="font-serif text-2xl text-ink font-bold">
                                      {compactNumber(mkt.baselineValue)}
                                    </span>
                                  </div>
                                  <div className="border-l border-rule pl-6">
                                    <span className="label-mono text-xs text-ink-2 block">Sesudah</span>
                                    <span className="font-serif text-2xl text-ink font-bold">
                                      {compactNumber(mkt.resultValue)}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="label-mono text-xs text-ink-2 block">Kenaikan</span>
                                  <span className="font-serif text-2xl text-ink font-bold">
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
                              <p className="font-sans text-xs sm:text-sm text-ink-2 leading-relaxed">
                                {mkt.contentSummary}
                              </p>
                            )}

                            {/* Catatan Sumber Data & Tautan Bukti */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-rule text-xs label-mono text-ink-2">
                              <span>Sumber data: {mkt.sourceNote}</span>
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

                      {/* Tautan Silang ke Karya yang Dihasilkan Selama Magang */}
                      {linkedWorks.length > 0 && (
                        <div className="pt-3 border-t border-rule space-y-2">
                          <span className="label-mono text-xs text-ink font-bold block">
                            KARYA YANG DIHASILKAN SELAMA MAGANG:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {linkedWorks.map((lw) => (
                              <button
                                key={lw.id}
                                type="button"
                                onClick={() => openWork(lw.slug)}
                                className="btn-primary text-xs inline-flex items-center gap-1.5 py-1.5 px-3 min-h-[44px]"
                              >
                                <span>{lw.title}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 text-paper" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
