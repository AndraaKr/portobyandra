import React from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { downloadAtsCvPdf } from '../utils/generateAtsPdf';

export const Footer: React.FC = () => {
  const { siteProfile, experiences, portfolioItems } = usePortfolio();
  const currentYear = new Date().getFullYear();
  const name = siteProfile?.name || 'Muhammad Andra Kusuma Ramadhan';
  const email = siteProfile?.email;
  const socials = siteProfile?.socials;

  const handleDownloadCv = () => {
    if (!siteProfile) return;
    downloadAtsCvPdf(siteProfile, experiences, portfolioItems, {
      language: 'id',
      includeProjects: false,
    });
  };

  return (
    <footer className="w-full mt-24 py-8 border-t border-rule bg-paper">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 label-mono text-xs text-ink-2">
        <div>
          <span>© {currentYear} {name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-6 w-full md:w-auto">
          {email && (
            <a
              href={`mailto:${email}`}
              className="text-link text-ink break-all py-2 min-h-[44px] flex items-center"
            >
              {email}
            </a>
          )}

          {socials?.linkedin && (
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noreferrer"
              className="text-link text-ink py-2 min-h-[44px] flex items-center"
            >
              LinkedIn
            </a>
          )}

          {socials?.github && (
            <a
              href={socials.github}
              target="_blank"
              rel="noreferrer"
              className="text-link text-ink py-2 min-h-[44px] flex items-center"
            >
              GitHub
            </a>
          )}

          {socials?.instagram && (
            <a
              href={socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-link text-ink py-2 min-h-[44px] flex items-center"
            >
              Instagram
            </a>
          )}

          {socials?.youtube && (
            <a
              href={socials.youtube}
              target="_blank"
              rel="noreferrer"
              className="text-link text-ink py-2 min-h-[44px] flex items-center"
            >
              YouTube
            </a>
          )}

          <button
            type="button"
            onClick={handleDownloadCv}
            className="text-link text-left cursor-pointer bg-transparent border-none p-0 label-mono text-xs text-ink font-semibold py-2 min-h-[44px] flex items-center"
          >
            Unduh CV (PDF)
          </button>
        </div>
      </div>
    </footer>
  );
};
