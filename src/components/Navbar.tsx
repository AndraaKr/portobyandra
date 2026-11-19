import React, { useState } from 'react';
import { usePortfolio } from '../context/PortfolioContext';
import { ActiveTab } from '../types';
import { MobileMenu } from './navigation/MobileMenu';
import { downloadAtsCvPdf } from '../utils/generateAtsPdf';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, siteProfile, experiences, portfolioItems } = usePortfolio();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToHomeSection = (id: string) => {
    setActiveTab('beranda');
    let tries = 0;
    const attempt = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (tries++ < 24) window.setTimeout(attempt, 50);
    };
    window.setTimeout(attempt, 0);
  };

  const navItems: {
    label: string;
    tab?: ActiveTab;
    sectionId?: string;
    match: (t: ActiveTab) => boolean;
  }[] = [
    {
      label: 'Tentang',
      sectionId: 'section-tentang',
      match: () => false,
    },
    {
      label: 'Pengalaman',
      tab: 'pengalaman',
      match: (t) => t === 'pengalaman',
    },
    {
      label: 'Karya',
      tab: 'portofolio',
      match: (t) => t === 'portofolio' || t === 'portofolio-detail',
    },
    {
      label: 'Sertifikat',
      tab: 'sertifikat',
      match: (t) => t === 'sertifikat',
    },
    {
      label: 'Kontak',
      tab: 'kontak',
      match: (t) => t === 'kontak',
    },
  ];

  const handleDownloadCv = () => {
    if (!siteProfile) return;
    downloadAtsCvPdf(siteProfile, experiences, portfolioItems, {
      language: 'id',
      includeProjects: false,
    });
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full bg-paper border-b border-rule h-[52px] sm:h-[56px]"
      >
        <div className="max-w-[1440px] mx-auto h-full px-4 sm:px-6 md:px-8 flex items-center justify-between">
          {/* Brand — titik vermilion adalah aksen #1 */}
          <button
            type="button"
            onClick={() => setActiveTab('beranda')}
            className="text-left font-serif text-2xl tracking-tight text-ink cursor-pointer bg-transparent border-none p-0 flex items-center"
          >
            <span>AndraKr</span>
            <span className="text-vermilion">.</span>
          </button>

          {/* Desktop Navigation (>= 768px): satu baris mono */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Navigasi Utama">
            {navItems.map((item) => {
              const isActive = item.match(activeTab);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() =>
                    item.sectionId ? scrollToHomeSection(item.sectionId) : item.tab && setActiveTab(item.tab)
                  }
                  aria-current={isActive ? 'page' : undefined}
                  className={`label-mono text-xs cursor-pointer bg-transparent border-none p-0 transition-opacity duration-120 ${
                    isActive
                      ? 'text-ink font-bold accent-rule'
                      : 'text-ink-2 accent-link'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Admin link bila login */}
            {currentUser && (
              <button
                type="button"
                onClick={() => setActiveTab('admin-dashboard')}
                aria-current={activeTab === 'admin-dashboard' ? 'page' : undefined}
                className={`label-mono text-xs cursor-pointer bg-transparent border-none p-0 transition-opacity duration-120 ${
                  activeTab === 'admin-dashboard'
                    ? 'text-ink font-bold accent-rule'
                    : 'text-ink-2 accent-link'
                }`}
              >
                Admin
              </button>
            )}
          </nav>

          {/* Mobile Menu Button (< 768px) — min 44x44 area */}
          <div className="flex md:hidden items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] label-mono text-xs text-ink cursor-pointer bg-transparent border-none p-2"
              aria-label="Buka menu"
              aria-expanded={isMobileMenuOpen}
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      {/* Lembar Indeks Layar Penuh HP */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        email={siteProfile?.email}
        onDownloadCv={handleDownloadCv}
      />
    </>
  );
};
