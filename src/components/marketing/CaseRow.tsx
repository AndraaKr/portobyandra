import React from 'react';
import { MarketingResult, PortfolioItem } from '../../types';
import { BarPair } from './BarPair';
import { Odometer } from '../motion/Odometer';
import { ExternalLink } from 'lucide-react';

interface CaseRowProps {
  item: MarketingResult;
  index: number;
  isFirstCase: boolean;
  portfolioItems: PortfolioItem[];
  openWork?: (slug: string) => void;
}

export const CaseRow: React.FC<CaseRowProps> = ({
  item,
  index,
  isFirstCase,
  portfolioItems,
  openWork,
}) => {
  const indexStr = `M${String(index + 1).padStart(2, '0')}`;

  // Perhitungan kenaikan otomatis
  let deltaText = '';
  let isPositive = false;
  if (item.baselineValue === 0) {
    deltaText = 'Dari 0';
  } else {
    const pct = Math.round(((item.resultValue - item.baselineValue) / item.baselineValue) * 100);
    if (pct > 0) {
      deltaText = `+${pct}%`;
      isPositive = true;
    } else {
      deltaText = `${pct}%`;
    }
  }

  // Format tanggal periode: YYYY-MM-DD -> format ringkas
  const formatPeriod = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      const sStr = s.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      const eStr = e.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
      return sStr === eStr ? sStr : `${sStr} — ${eStr}`;
    } catch {
      return `${start} — ${end}`;
    }
  };

  const compactNumber = (val: number) =>
    new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(val);

  // Akses aksen vermilion Bab 4: angka Kenaikan pada kasus pertama bila positif
  const useVermilion = isFirstCase && isPositive;

  const relatedWorks = portfolioItems.filter((w) =>
    item.relatedWorkSlugs?.includes(w.slug)
  );

  return (
    <article className="border-t border-rule py-8 sm:py-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-x-8">
        {/* Margin Kiri: Indeks Mono */}
        <div className="md:col-span-1">
          <span className="label-mono text-xs font-bold text-ink-2">{indexStr}</span>
        </div>

        {/* Kolom Utama: Judul & Konteks */}
        <div className="md:col-span-6 space-y-4">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl text-ink leading-tight">
              {item.title}
            </h3>
            <p className="label-mono text-xs text-ink-2 mt-1">
              {item.platform.toUpperCase()} · {item.accountName} · {formatPeriod(item.periodStart, item.periodEnd)}
            </p>
          </div>

          {item.contentSummary && (
            <p className="text-ink font-sans text-sm sm:text-base leading-relaxed max-w-[60ch]">
              {item.contentSummary}
            </p>
          )}

          <div className="space-y-1.5 label-mono text-xs text-ink-2 pt-2 border-t border-rule">
            {item.contentCount !== undefined && item.contentCount > 0 && (
              <div>
                <span className="text-ink font-medium">Konten:</span> {item.contentCount} unggahan
              </div>
            )}
            {item.aiTools && item.aiTools.length > 0 && (
              <div>
                <span className="text-ink font-medium">Alat AI:</span> {item.aiTools.join(' / ')}
              </div>
            )}
            <div>
              <span className="text-ink font-medium">Sumber data:</span> {item.sourceNote}
            </div>
            {item.evidenceUrl && (
              <div className="pt-1">
                <a
                  href={item.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-link inline-flex items-center gap-1 text-ink font-semibold"
                >
                  <span>Bukti</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Karya Terkait */}
          {relatedWorks.length > 0 && (
            <div className="pt-3 border-t border-rule">
              <span className="label-mono text-xs block text-ink font-medium mb-1.5">
                Karya terkait:
              </span>
              <div className="flex flex-wrap gap-3">
                {relatedWorks.map((rw, rwIdx) => (
                  <button
                    key={rw.slug}
                    type="button"
                    onClick={() => openWork && openWork(rw.slug)}
                    className="label-mono text-xs text-ink hover:underline cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    {String(rwIdx + 1).padStart(2, '0')} {rw.title} →
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Hasil & Metrik */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <Odometer
                value={compactNumber(item.resultValue)}
                className="font-serif text-4xl sm:text-5xl text-ink leading-none tracking-tight"
              />
              <span className="label-mono text-xs text-ink-2">
                {item.metricLabel}
              </span>
            </div>
            <p className="label-mono text-xs text-ink-2">
              dari {compactNumber(item.baselineValue)} ({item.baselineValue})
            </p>
            <div className="pt-2">
              <span className="label-mono text-xs text-ink-2 mr-2">Kenaikan:</span>
              <span
                className={`font-serif text-2xl sm:text-3xl font-bold ${
                  useVermilion ? 'text-vermilion' : 'text-ink'
                }`}
              >
                {deltaText}
              </span>
            </div>
          </div>

          {/* Batang Datar SVG */}
          <BarPair
            baselineValue={item.baselineValue}
            resultValue={item.resultValue}
            metricLabel={item.metricLabel}
          />
        </div>
      </div>
    </article>
  );
};
