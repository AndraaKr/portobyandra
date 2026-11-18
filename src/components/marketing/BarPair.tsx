import React from 'react';

interface BarPairProps {
  baselineValue: number;
  resultValue: number;
  metricLabel: string;
}

export const BarPair: React.FC<BarPairProps> = ({ baselineValue, resultValue, metricLabel }) => {
  const maxVal = Math.max(baselineValue, resultValue, 1);
  const baselinePct = Math.max(0, Math.min(100, (baselineValue / maxVal) * 100));
  const resultPct = Math.max(0, Math.min(100, (resultValue / maxVal) * 100));

  const formatCompact = (val: number) =>
    new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(val);

  return (
    <div className="w-full space-y-2 select-none" aria-label={`Grafik perbandingan ${metricLabel}: Sebelum ${baselineValue}, Sesudah ${resultValue}`}>
      {/* Batang Sebelum */}
      <div className="flex items-center gap-3">
        <span className="label-mono text-xs w-16 text-ink-2 shrink-0">Sebelum</span>
        <div className="flex-1 bg-paper-2 h-1.5 relative">
          <div
            className="h-full bg-ink-3"
            style={{ width: `${baselinePct}%` }}
          />
        </div>
        <span className="label-mono text-xs text-ink-2 w-12 text-right shrink-0">
          {formatCompact(baselineValue)}
        </span>
      </div>

      {/* Batang Sesudah */}
      <div className="flex items-center gap-3">
        <span className="label-mono text-xs w-16 text-ink font-semibold shrink-0">Sesudah</span>
        <div className="flex-1 bg-paper-2 h-1.5 relative">
          <div
            className="h-full bg-ink"
            style={{ width: `${resultPct}%` }}
          />
        </div>
        <span className="label-mono text-xs text-ink font-semibold w-12 text-right shrink-0">
          {formatCompact(resultValue)}
        </span>
      </div>
    </div>
  );
};
