import React, { useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { CaseRow } from '../components/marketing/CaseRow';

export const MarketingPage: React.FC = () => {
  const { marketingResults, portfolioItems, siteProfile, openWork } = usePortfolio();

  useEffect(() => {
    document.title = 'Marketing — Portofolio Muhammad Andra Kusuma Ramadhan';
  }, []);

  // Hanya tampilkan yang published
  const publishedCases = marketingResults
    .filter((m) => m.published)
    .sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));

  const countStr = String(publishedCases.length).padStart(2, '0');

  return (
    <div className="page py-10 md:py-16">
      {/* Header Halaman */}
      <header className="border-b border-rule pb-6 mb-8">
        <div className="flex items-baseline gap-4">
          <h1
            className="text-ink tracking-tight font-serif select-none"
            style={{
              fontSize: 'var(--step-display-l)',
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
            }}
          >
            Marketing
          </h1>
          <span className="label-mono text-sm text-ink-2 font-bold">
            ({countStr})
          </span>
        </div>

        {/* Kalimat pengantar hanya bila ada di siteProfile */}
        {siteProfile?.tagline && (
          <p className="text-ink-2 font-sans text-sm sm:text-base mt-3 max-w-[60ch]">
            {siteProfile.tagline}
          </p>
        )}
      </header>

      {/* Kasus-Kasus Marketing */}
      {publishedCases.length > 0 ? (
        <div className="divide-y divide-rule border-b border-rule">
          {publishedCases.map((item, idx) => (
            <CaseRow
              key={item.id}
              item={item}
              index={idx}
              isFirstCase={idx === 0}
              portfolioItems={portfolioItems}
              openWork={openWork}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="label-mono text-xs text-ink-2">
            Belum ada hasil yang diterbitkan.
          </p>
        </div>
      )}
    </div>
  );
};
