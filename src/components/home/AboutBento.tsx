import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, GraduationCap } from 'lucide-react';
import type { SiteProfile } from '../../types';
import { SkillIcon } from './SkillIcon';
import { TypewriterText } from '../motion/TypewriterText';

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
  // Hanya 1 pendidikan terakhir yang ditampilkan di beranda
  const latestEdu = (siteProfile?.educations && siteProfile.educations.length > 0)
    ? siteProfile.educations[0]
    : null;

  const eduTitle = latestEdu
    ? (latestEdu.degree ? `${latestEdu.degree} — ${latestEdu.institution}` : latestEdu.institution)
    : (siteProfile?.education || 'D4 Teknik Informatika — Politeknik Negeri Jember (PSDKU Sidoarjo)');

  const eduFocus = latestEdu?.activities || 'Fokus: Rekayasa Perangkat Lunak, Multimedia & Pengembangan Sistem Informasi';

  const gpaText = latestEdu?.gpa || siteProfile?.gpa?.trim() || '3.79';
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
                  className="w-full h-auto aspect-[4/5] object-cover border border-rule"
                />
              ) : (
                <div className="w-full aspect-[4/5] bg-paper-2 border border-rule flex items-center justify-center">
                  <span className="label-mono text-xs text-ink-2">FOTO PROFIL</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Bar HUD: Status Ketersediaan & Lokasi */}
          <div className="border-t border-rule p-4 bg-paper-2 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="status-indicator-dot"
                  style={{
                    backgroundColor:
                      siteProfile?.availabilityStatus === 'UNAVAILABLE' || siteProfile?.availabilityStatus === 'BUSY / FULL-TIME'
                        ? 'var(--vermilion)'
                        : siteProfile?.availabilityStatus === 'LIMITED AVAILABILITY' || siteProfile?.availabilityStatus === 'OPEN FOR CONTRACT / INTERN'
                        ? 'var(--ink)'
                        : 'var(--status-live)',
                  }}
                  aria-hidden="true"
                />
                <span className="label-mono text-xs font-bold text-ink tracking-wider">
                  {siteProfile?.availabilityStatus || 'OPEN TO WORK'}
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
            {/* Bagian Atas: Sapaan & Narasi Bio dengan Animasi Ketik Bertahap */}
            <div className="space-y-3">
              <h3 className="font-serif text-2xl sm:text-3xl text-ink leading-snug">
                {isVisible ? (
                  <TypewriterText
                    text="Hi, Aku Muhammad Andra Kusuma Ramadhan"
                    speed={28}
                    delay={100}
                    blinkCountAfterFinish={0}
                  />
                ) : (
                  <span>Hi, Aku Muhammad Andra Kusuma Ramadhan</span>
                )}
              </h3>
              <div className="font-sans text-sm sm:text-base text-ink-2 leading-relaxed">
                {isVisible ? (
                  <TypewriterText
                    text={
                      siteProfile?.bio ||
                      'Lulusan Sarjana Terapan (D4) Teknik Informatika angkatan 2025 yang menggabungkan presisi engineering dan daya visual kreatif. Saat ini berfokus pada strategi Digital Marketing dengan keahlian mendalam pada UI/UX Design, Front-End Development, Video Editing sinematik, serta Content Writing.'
                    }
                    speed={14}
                    delay={1200}
                    blinkCountAfterFinish={2}
                    as="p"
                  />
                ) : (
                  <p>
                    {siteProfile?.bio ||
                      'Lulusan Sarjana Terapan (D4) Teknik Informatika angkatan 2025 yang menggabungkan presisi engineering dan daya visual kreatif. Saat ini berfokus pada strategi Digital Marketing dengan keahlian mendalam pada UI/UX Design, Front-End Development, Video Editing sinematik, serta Content Writing.'}
                  </p>
                )}
              </div>
            </div>

            {/* Bagian Bawah Terintegrasi: Info Pendidikan & Callout IPK 3.78 Vermilion (Animasi Stagger Masuk) */}
            <div className="pt-5 border-t border-rule space-y-4">
              {/* Langkah 1: Bar Header Pendidikan */}
              <div
                className={`flex items-center justify-between flex-wrap gap-2 ${
                  isVisible ? 'edu-stagger-1' : 'edu-stagger-hidden'
                }`}
              >
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

              {/* Langkah 2: Kotak Institusi & Nilai IPK */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-paper-2 border border-rule p-4 rounded-sm ${
                  isVisible ? 'edu-stagger-2' : 'edu-stagger-hidden'
                }`}
              >
                <div className="sm:col-span-8 space-y-1">
                  <h4 className="font-sans font-bold text-sm sm:text-base text-ink">
                    {eduTitle}
                  </h4>
                  <p className="font-sans text-xs text-ink-2">
                    {eduFocus}
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

              {/* Langkah 3: Tags / Coursework Mata Kuliah Relevan */}
              <div
                className={`flex flex-wrap gap-2 pt-1 ${
                  isVisible ? 'edu-stagger-3' : 'edu-stagger-hidden'
                }`}
              >
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
            {((siteProfile?.skillCategories && siteProfile.skillCategories.length > 0)
              ? siteProfile.skillCategories
              : [
                  { id: 'cat-1', name: 'MULTIMEDIA', skills: multimediaSkills },
                  { id: 'cat-2', name: 'DIGITAL MARKETING', skills: marketingSkills },
                  { id: 'cat-3', name: 'UI/UX DESAIN', skills: uiuxSkills },
                  { id: 'cat-4', name: 'TOOL AI', skills: aiSkills },
                ]
            ).filter(c => c.skills && c.skills.length > 0).map((cat) => (
              <div key={cat.id} className="space-y-3">
                <span className="label-mono text-xs font-bold text-vermilion block border-b border-rule pb-1.5 uppercase">
                  {cat.name}
                </span>
                <ul className="space-y-2">
                  {cat.skills.map((skill) => (
                    <li key={skill} className="flex items-center gap-2 label-mono text-xs text-ink">
                      <SkillIcon name={skill} />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
