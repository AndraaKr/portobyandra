import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, GraduationCap } from 'lucide-react';
import type { SiteProfile } from '../../types';
import { SkillIcon } from './SkillIcon';

interface AboutBentoProps {
  siteProfile: SiteProfile | null;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
}

export const AboutBento: React.FC<AboutBentoProps> = ({
  siteProfile,
  onNavigateToAbout,
  onNavigateToContact,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Jika reduced motion aktif, langsung tampilkan tanpa jeda animasi
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const multimediaSkills = siteProfile?.skills?.multimedia || [];
  const marketingSkills = siteProfile?.skills?.marketing || [];
  const uiuxSkills = siteProfile?.skills?.uiux || [];
  const rawAiSkills = siteProfile?.skills?.aiTools;
  const aiSkills =
    rawAiSkills && rawAiSkills.length > 0
      ? rawAiSkills
      : ['ChatGPT & Claude', 'Midjourney', 'ElevenLabs', 'Runway Gen-2'];

  const locationText = siteProfile?.location || 'Surabaya, ID';
  const gpaText = siteProfile?.gpa?.trim() || '3.78';
  const courseworkList =
    siteProfile?.coursework && siteProfile.coursework.length > 0
      ? siteProfile.coursework
      : [
          'Produksi Media Audio-Visual',
          'Komunikasi Massa & Periklanan',
          'Riset Audiens',
          'Strategi Kampanye Digital',
        ];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Grid Bento Asimetris Gaya Editorial Swiss dengan Animasi Masuk Scroll-Triggered */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        {/* ========================================================
            CARD 1: AVATAR & STATUS BAR HUD (Col 1-4)
            ======================================================== */}
        <div
          className={`md:col-span-4 border border-rule bg-paper flex flex-col justify-between transition-none ${
            isVisible ? 'bento-card-enter' : 'bento-card-hidden'
          }`}
        >
          <div>
            {/* Header Mini Kartu */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-rule bg-paper-2">
              <span className="label-mono text-xs text-ink-2 font-bold">
                PROFIL
              </span>
              <span className="label-mono text-xs text-ink-2">
                ANDRA KUSUMA R.
              </span>
            </div>

            {/* Foto Profil */}
            <div className="p-4 flex items-center justify-center">
              {siteProfile?.avatarUrl ? (
                <img
                  src={siteProfile.avatarUrl}
                  alt={siteProfile.name || 'Andra Kusuma Ramadhan'}
                  width={320}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto aspect-[4/5] object-cover border border-rule grayscale contrast-105"
                />
              ) : (
                <div className="w-full aspect-[4/5] bg-paper-2 border border-rule flex items-center justify-center">
                  <span className="label-mono text-xs text-ink-2">FOTO PROFIL</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Bar HUD: OPEN TO WORK & Lokasi */}
          <div className="border-t border-rule p-4 bg-paper-2 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: 'var(--status-live)' }}
                  aria-hidden="true"
                />
                <span className="label-mono text-xs font-bold text-ink tracking-wider">
                  OPEN TO WORK
                </span>
              </div>
              <span className="label-mono text-xs text-ink-2 uppercase">
                {locationText}
              </span>
            </div>

            <p className="label-mono text-xs text-vermilion font-bold pt-1 border-t border-rule border-dashed">
              {siteProfile?.currentRole || 'DIGITAL MARKETING INTERN'}
            </p>
          </div>
        </div>

        {/* ========================================================
            CARD 2: BIO & PENDIDIKAN DIGABUNG JADI SATU (Col 5-12)
            Padat, berbobot, ada callout IPK 3.78 & coursework
            ======================================================== */}
        <div
          className={`md:col-span-8 border border-rule bg-paper p-6 sm:p-8 flex flex-col justify-between transition-none ${
            isVisible ? 'bento-card-enter-delay-1' : 'bento-card-hidden'
          }`}
        >
          <div className="space-y-6">
            {/* Bagian Atas: Sapaan & Narasi Bio */}
            <div className="space-y-3">
              <h3 className="font-serif text-2xl sm:text-3xl text-ink leading-snug">
                Hi, Aku Muhammad Andra Kusuma Ramadhan
              </h3>
              <p className="font-sans text-sm sm:text-base text-ink-2 leading-relaxed">
                {siteProfile?.bio ||
                  'Lulusan Ilmu Komunikasi yang sehari-hari ngulik video editing, motion graphics, dan digital marketing. Suka bikin konten yang enak ditonton sekaligus bisa ngasih hasil nyata buat brand — mulai dari ngedit video promosi sampai ngatur strategi konten di media sosial.'}
              </p>
            </div>

            {/* Bagian Bawah Terintegrasi: Info Pendidikan & Callout IPK 3.78 Vermilion */}
            <div className="pt-5 border-t border-rule space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-ink shrink-0" />
                  <span className="label-mono text-xs text-ink-2 font-bold uppercase tracking-wider">
                    PENDIDIKAN
                  </span>
                </div>
                <span className="label-mono text-xs px-2 py-0.5 bg-paper-2 border border-rule text-ink font-semibold rounded-sm">
                  LULUS
                </span>
              </div>

              {/* Grid Baris: Institusi & Widget Nilai GPA Vermilion */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-paper-2 border border-rule p-4 rounded-sm">
                <div className="sm:col-span-8 space-y-1">
                  <h4 className="font-sans font-bold text-sm sm:text-base text-ink">
                    {siteProfile?.education || 'S1 Ilmu Komunikasi — Universitas 17 Agustus 1945 Surabaya'}
                  </h4>
                  <p className="font-sans text-xs text-ink-2">
                    Fokus: Produksi Audio-Visual, Komunikasi Massa &amp; Manajemen Kampanye Digital
                  </p>
                </div>

                {/* Widget GPA / IPK 3.78 Vermilion Callout */}
                <div className="sm:col-span-4 flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-rule pt-2 sm:pt-0 sm:pl-4">
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-2xl sm:text-3xl font-bold text-vermilion leading-none">
                      {gpaText}
                    </span>
                    <span className="label-mono text-xs text-ink-2 font-medium">
                      / 4.00
                    </span>
                  </div>
                  <span className="label-mono text-xs text-ink-2 font-semibold tracking-wider uppercase mt-1">
                    IPK Kumulatif
                  </span>
                </div>
              </div>

              {/* Tags / Coursework Mata Kuliah Relevan */}
              <div className="flex flex-wrap gap-2 pt-1">
                {courseworkList.map((item) => (
                  <span
                    key={item}
                    className="label-mono text-xs px-2.5 py-1 bg-paper border border-rule text-ink rounded-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Tombol Aksi Cepat */}
          <div className="pt-6 mt-6 border-t border-rule flex flex-wrap items-center justify-between gap-4">
            {onNavigateToContact ? (
              <button
                type="button"
                onClick={onNavigateToContact}
                className="inline-flex items-center gap-2 label-mono text-xs font-semibold text-paper bg-ink px-4 py-2 rounded-sm hover:opacity-90 cursor-pointer border-none min-h-[44px]"
              >
                <span>Hubungi Saya</span>
                <ArrowUpRight className="w-4 h-4 text-paper" />
              </button>
            ) : (
              <span />
            )}

            {onNavigateToAbout && (
              <button
                type="button"
                onClick={onNavigateToAbout}
                className="inline-flex items-center gap-1.5 label-mono text-xs text-ink hover:underline cursor-pointer bg-transparent border-none p-0 min-h-[44px]"
              >
                <span>Profil Lengkap</span>
                <ArrowUpRight className="w-4 h-4 text-ink" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================
            CARD 3: KEAHLIAN & PERANGKAT KERJA (Full Width Col 1-12)
            Sub-judul hanya teks vermilion tanpa logo/ikon
            ======================================================== */}
        <div
          className={`md:col-span-12 border border-rule bg-paper p-6 sm:p-8 space-y-6 transition-none ${
            isVisible ? 'bento-card-enter-delay-2' : 'bento-card-hidden'
          }`}
        >
          <div className="border-b border-rule pb-3">
            <span className="label-mono text-xs text-ink-2 font-bold tracking-wider">
              KEAHLIAN &amp; PERANGKAT KERJA
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pilar 1: Multimedia — Teks Vermilion Saja Tanpa Logo */}
            {multimediaSkills.length > 0 && (
              <div className="space-y-3">
                <span className="label-mono text-xs font-bold text-vermilion block border-b border-rule pb-1.5">
                  MULTIMEDIA
                </span>
                <ul className="space-y-2">
                  {multimediaSkills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2 label-mono text-xs text-ink">
                      <SkillIcon name={skill} />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pilar 2: Digital Marketing — Teks Vermilion Saja Tanpa Logo */}
            {marketingSkills.length > 0 && (
              <div className="space-y-3">
                <span className="label-mono text-xs font-bold text-vermilion block border-b border-rule pb-1.5">
                  DIGITAL MARKETING
                </span>
                <ul className="space-y-2">
                  {marketingSkills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2 label-mono text-xs text-ink">
                      <SkillIcon name={skill} />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pilar 3: UI/UX Desain — Teks Vermilion Saja Tanpa Logo */}
            {uiuxSkills.length > 0 && (
              <div className="space-y-3">
                <span className="label-mono text-xs font-bold text-vermilion block border-b border-rule pb-1.5">
                  UI/UX DESAIN
                </span>
                <ul className="space-y-2">
                  {uiuxSkills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2 label-mono text-xs text-ink">
                      <SkillIcon name={skill} />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pilar 4: Tool AI — Teks Vermilion Saja Tanpa Logo */}
            {aiSkills.length > 0 && (
              <div className="space-y-3">
                <span className="label-mono text-xs font-bold text-vermilion block border-b border-rule pb-1.5">
                  TOOL AI
                </span>
                <ul className="space-y-2">
                  {aiSkills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2 label-mono text-xs text-ink">
                      <SkillIcon name={skill} />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
