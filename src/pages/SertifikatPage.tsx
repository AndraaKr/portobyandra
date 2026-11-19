import React, { useEffect } from 'react';
import { ArrowUpRight, Award } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const SertifikatPage: React.FC = () => {
  const { siteProfile } = usePortfolio();

  useEffect(() => {
    document.title = 'Sertifikat & Pelatihan — Muhammad Andra Kusuma Ramadhan';
  }, []);

  const certificates = siteProfile?.certificates || [];
  const countStr = String(certificates.length).padStart(2, '0');

  return (
    <div className="page py-8 md:py-16">
      {/* Header Halaman: Judul & Jumlah */}
      <div className="border-b border-rule pb-6 mb-8 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <h1
            className="text-ink font-serif tracking-tight select-none"
            style={{
              fontSize: 'var(--step-display-l)',
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
            }}
          >
            Sertifikat &amp; Pelatihan
          </h1>
          <span className="label-mono text-sm text-ink-2 font-bold">
            ({countStr})
          </span>
        </div>

        <p className="label-mono text-xs text-ink-2 max-w-[48ch]">
          Kredensial profesional, lisensi perangkat lunak, dan sertifikasi teknis resmi.
        </p>
      </div>

      {/* Daftar Sertifikat */}
      {certificates.length === 0 ? (
        <div className="py-20 text-center bg-paper-2 border border-rule">
          <p className="label-mono text-xs text-ink-2">Belum ada data sertifikat yang diterbitkan.</p>
        </div>
      ) : (
        <div className="divide-y divide-rule border-b border-rule">
          {certificates.map((cert, idx) => {
            const indexStr = String(idx + 1).padStart(2, '0');
            return (
              <article
                key={cert.id || idx}
                className="py-5 sm:py-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 sm:gap-6 group hover:bg-paper-2 transition-colors duration-120 px-2 -mx-2"
              >
                <div className="flex items-baseline gap-4 sm:gap-6">
                  {/* Nomor Urut Mono & Label Tipe */}
                  <div className="flex flex-col sm:items-start shrink-0">
                    <span className="label-mono text-xs text-ink-2 font-bold">
                      [{indexStr}]
                    </span>
                    <span className="label-mono text-xs text-ink uppercase font-semibold mt-0.5">
                      {cert.type === 'pelatihan' ? 'Pelatihan' : 'Sertifikat'}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-ink font-sans text-base sm:text-lg font-semibold leading-snug">
                      {cert.name}
                    </h2>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="label-mono text-xs text-ink-2 font-medium">
                        {cert.issuer}
                      </span>
                      {cert.url && (
                        <>
                          <span className="text-rule select-none">·</span>
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-link label-mono text-xs text-ink inline-flex items-center gap-1 min-h-[44px]"
                          >
                            <span>Lihat kredensial</span>
                            <ArrowUpRight className="w-3 h-3 text-ink" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tahun Perolehan */}
                <div className="sm:text-right shrink-0 pl-8 sm:pl-0">
                  <span className="label-mono text-xs text-ink font-bold px-2 py-0.5 bg-paper-2 border border-rule">
                    {cert.year}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
