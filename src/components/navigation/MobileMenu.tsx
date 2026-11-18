import React, { useEffect, useRef } from 'react';
import { ActiveTab, AdminUser } from '../../types';
import { X, ArrowRight } from 'lucide-react';
import { useReducedMotion } from '../../lib/useReducedMotion';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: AdminUser | null;
  email?: string;
  onDownloadCv?: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string; num: string; sectionId?: string }[] = [
  { id: 'beranda', label: 'Tentang Saya', num: '01', sectionId: 'section-tentang' },
  { id: 'pengalaman', label: 'Pengalaman', num: '02' },
  { id: 'portofolio', label: 'Karya', num: '03' },
  { id: 'sertifikat', label: 'Sertifikat', num: '04' },
  { id: 'kontak', label: 'Kontak', num: '05' },
];

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  currentUser,
  email,
  onDownloadCv,
}) => {
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Kunci scroll body saat menu terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Tangkap fokus
      closeBtnRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Tutup dengan ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  // Bagian di beranda: pindah ke beranda lalu gulir ke section-nya
  const handleSection = (sectionId: string) => {
    setActiveTab('beranda');
    onClose();
    let tries = 0;
    const attempt = () => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (tries++ < 24) window.setTimeout(attempt, 50);
    };
    window.setTimeout(attempt, 60);
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi utama"
      className={`fixed inset-0 z-50 bg-paper flex flex-col justify-between p-6 sm:p-8 ${
        reducedMotion ? '' : 'mobile-sheet-enter'
      }`}
    >
      {/* Bar Atas Dialog */}
      <div className="flex items-center justify-between border-b border-rule pb-4">
        <button
          type="button"
          onClick={() => handleSelect('beranda')}
          className="text-left font-serif text-2xl tracking-tight text-ink cursor-pointer bg-transparent border-none p-0"
        >
          <span>AndraKr</span>
          <span className="text-vermilion">.</span>
        </button>

        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] label-mono text-xs text-ink cursor-pointer bg-transparent border border-rule px-3"
          aria-label="Tutup menu"
        >
          <X className="w-4 h-4 mr-1.5" />
          <span>Tutup</span>
        </button>
      </div>

      {/* Daftar Menu Utama Bernomor 01–05 */}
      <nav aria-label="Navigasi layar kecil" className="my-auto py-6">
        <ul className="divide-y divide-rule list-none p-0 m-0">
          {NAV_ITEMS.map((item) => {
            const isActive = !item.sectionId && activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => (item.sectionId ? handleSection(item.sectionId) : handleSelect(item.id))}
                  className={`w-full py-4 text-left flex items-baseline justify-between cursor-pointer bg-transparent border-none px-0 min-h-[52px] group accent-row`}
                >
                  <div className="flex items-baseline gap-4">
                    <span className={`label-mono text-xs font-bold ${isActive ? 'text-vermilion' : 'text-ink-2'}`}>{item.num}</span>
                    <span
                      className={`font-serif text-3xl sm:text-4xl leading-tight accent-link ${
                        isActive ? 'text-vermilion underline decoration-2 underline-offset-4' : 'text-ink'
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-ink-2 opacity-50 group-hover:opacity-100 accent-row-target" />
                </button>
              </li>
            );
          })}

          {/* Menu Admin jika sudah login */}
          {currentUser && (
            <li>
              <button
                type="button"
                onClick={() => handleSelect('admin-dashboard')}
                className="w-full py-4 text-left flex items-baseline justify-between cursor-pointer bg-transparent border-none px-0 min-h-[52px]"
              >
                <div className="flex items-baseline gap-4">
                  <span className="label-mono text-xs font-bold text-ink-2">06</span>
                  <span className="label-mono text-base font-semibold text-ink">
                    Dashboard Admin
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-2" />
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Bagian Bawah: Email & Unduh CV */}
      <div className="border-t border-rule pt-4 space-y-2">
        {email && (
          <div>
            <a
              href={`mailto:${email}`}
              className="text-link label-mono text-xs text-ink block break-all py-2 min-h-[44px] flex items-center"
            >
              {email}
            </a>
          </div>
        )}
        {onDownloadCv && (
          <div>
            <button
              type="button"
              onClick={() => {
                onDownloadCv();
                onClose();
              }}
              className="label-mono text-xs text-ink text-left cursor-pointer bg-transparent border-none p-0 py-2 min-h-[44px] flex items-center underline underline-offset-4"
            >
              Unduh CV (PDF)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
