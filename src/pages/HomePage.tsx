import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Award, Download } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { downloadAtsCvPdf } from '../utils/generateAtsPdf';
import { Filmstrip } from '../components/work/Filmstrip';
import { HomeWorkGrid } from '../components/home/HomeWorkGrid';
import { Ruler } from '../components/motion/Ruler';
import { TypewriterText } from '../components/motion/TypewriterText';
import { AboutBento } from '../components/home/AboutBento';
import { ExperienceDetailModal } from '../components/experience/ExperienceDetailModal';
import { isPublicWork, normalizeWork, sortWorks } from '../utils/work';
import type { Experience } from '../types';

export const HomePage: React.FC = () => {
  const {
    portfolioItems,
    experiences,
    siteProfile,
    marketingResults,
    setActiveTab,
    openWork,
    addMessage,
  } = usePortfolio();

  const [kineticKey, setKineticKey] = useState(0);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);

  // Form Kontak Langsung di Beranda
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactProjectType, setContactProjectType] = useState('Video Editing & Motion');
  const [contactMessage, setContactMessage] = useState('');
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);
  const [contactStatus, setContactStatus] = useState<{ type: 'BERHASIL' | 'GALAT'; text: string } | null>(null);

  useEffect(() => {
    document.title = 'Portofolio Muhammad Andra Kusuma Ramadhan';
  }, []);

  const replayKinetic = () => {
    setKineticKey((k) => k + 1);
  };

  // 03 Karya: maks 6 karya (featured dulu, lalu terbaru)
  const publicItems = portfolioItems.filter(isPublicWork).sort(sortWorks);
  const featured = publicItems.filter((p) => p.featured);
  const nonFeatured = publicItems.filter((p) => !p.featured);
  const selectedWorks = [...featured, ...nonFeatured].slice(0, 6).map(normalizeWork);

  // 02 Pengalaman: 3 entri terbaru
  const recentExperiences = [...experiences]
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .slice(0, 3);

  const getDescriptionPoints = (desc?: string): string[] => {
    if (!desc) return [];
    const byLine = desc
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    const allPoints =
      byLine.length > 1
        ? byLine
        : desc
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter(Boolean);
    return allPoints.slice(0, 2);
  };

  const tagline = siteProfile?.tagline?.trim();

  const scrollToKarya = () => {
    const el = document.getElementById('section-karya');
    if (el) {
      el.scrollIntoView({ behavior: 'auto' });
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus(null);

    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactStatus({
        type: 'GALAT',
        text: 'Mohon lengkapi nama, email, dan pesan Anda.',
      });
      return;
    }

    setIsContactSubmitting(true);
    const ok = await addMessage({
      name: contactName.trim(),
      email: contactEmail.trim(),
      subject: `Inquiry Beranda: ${contactProjectType}`,
      projectType: contactProjectType,
      message: contactMessage.trim(),
    });
    setIsContactSubmitting(false);

    if (ok !== false) {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactStatus({
        type: 'BERHASIL',
        text: 'Pesan Anda berhasil dikirim. Tanggapan akan disampaikan melalui surel.',
      });
    } else {
      setContactStatus({
        type: 'GALAT',
        text: 'Pesan gagal dikirim. Silakan hubungi langsung melalui surel.',
      });
    }
  };

  return (
    <div className="page py-8 md:py-16 relative">
      {/* Penggaris indeks (khusus desktop >= 1024px) */}
      <Ruler />

      {/* ========================================================
          HERO SECTION (Maksimal 80svh)
          ======================================================== */}
      <section className="min-h-[50svh] max-h-[80svh] flex flex-col justify-between mb-16 md:mb-24">
        {/* Label Hero — kata "Portofolio" adalah aksen vermilion #2 dengan animasi ketikkan pada deskripsi peran */}
        <div className="border-b border-rule pb-3">
          <p className="label-mono text-xs flex flex-wrap items-baseline">
            <span className="text-vermilion font-bold shrink-0">Portofolio</span>
            <span className="text-ink-2 ml-1">
              —{' '}
              <TypewriterText
                text="Video editor, designer & digital marketing"
                speed={26}
                delay={150}
                cursorChar="▍"
                replayKey={kineticKey}
              />
            </span>
          </p>
        </div>

        {/* Nama Besar (Display Serif, tidak uppercase) dengan Animasi Masuk Kinetik Editorial Swiss */}
        <div className="py-6 sm:py-8 overflow-hidden select-none">
          <h1
            key={kineticKey}
            onClick={replayKinetic}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                replayKinetic();
              }
            }}
            tabIndex={0}
            role="button"
            title="Klik untuk memutar ulang animasi nama"
            aria-label="Muhammad Andra Kusuma Ramadhan — Andra Kusuma"
            className="text-ink tracking-tight font-serif font-semibold cursor-pointer focus:outline-none"
            style={{
              fontSize: 'var(--step-display-xl)',
              lineHeight: 0.88,
              letterSpacing: '-0.035em',
            }}
          >
            {/* Baris 1: Atas "Muhammad Andra" dari Kanan ke Kiri, "Andra" berhenti, "Muhammad" out frame ke kiri */}
            <div className="hero-name-row hero-name-top">
              <span className="hero-track hero-kinetic-track-top">
                <span className="hero-ghost hero-word-muhammad" aria-hidden="true">
                  Muhammad
                </span>
                <span className="hero-primary hero-word-andra">
                  Andra
                </span>
              </span>
            </div>

            {/* Baris 2: Bawah "Kusuma Ramadhan" dari Kiri ke Kanan, "Kusuma" berhenti, "Ramadhan" out frame ke kanan */}
            <div className="hero-name-row hero-name-bottom">
              <span className="hero-track hero-kinetic-track-bottom">
                <span className="hero-primary hero-word-kusuma">
                  Kusuma
                </span>
                <span className="hero-ghost hero-word-ramadhan" aria-hidden="true">
                  Ramadhan
                </span>
              </span>
            </div>
          </h1>
        </div>

        {/* Pengantar Aksi Hero: Tombol Unduh CV & Tautan Lihat Karya */}
        <div className="border-t border-rule pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => {
                if (siteProfile) {
                  downloadAtsCvPdf(siteProfile, experiences, portfolioItems, { language: 'id', includeProjects: false });
                }
              }}
              className="btn-primary inline-flex items-center gap-2 min-h-[44px]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CV (ATS)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('portofolio')}
            className="group inline-flex items-center gap-2 label-mono text-xs text-ink font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 shrink-0 min-h-[44px] accent-link"
          >
            <span>Lihat karya</span>
            <span className="arrow-fly-target arrow-fly-right">
              <ArrowRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      </section>

      {/* ========================================================
          STRIP FILM (Karya Sinematik Bergerak Kanan ke Kiri)
          ======================================================== */}
      <Filmstrip works={selectedWorks} />

      {/* ========================================================
          01 TENTANG SAYA (Modular Bento Grid ala Styfen Sagala - Versi Editorial Swiss)
          ======================================================== */}
      <section id="section-tentang" className="border-t border-rule pt-8 sm:pt-10 mb-16 md:mb-24">
        <div className="flex items-baseline justify-between mb-8">
          <div className="flex items-baseline gap-3">
            <span className="label-mono text-xs text-vermilion font-bold">01</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink">Tentang Saya</h2>
          </div>
        </div>

        <AboutBento
          siteProfile={siteProfile}
          onNavigateToContact={() => {
            const el = document.getElementById('section-kontak');
            if (el) {
              el.scrollIntoView({ behavior: 'auto' });
            }
          }}
        />
      </section>

      {/* ========================================================
          02 PENGALAMAN (Garis Waktu Vertikal Editorial Swiss — Ramah HRD, Tanpa Nomor)
          ======================================================== */}
      <section id="section-pengalaman" className="border-t border-rule pt-8 sm:pt-10 mb-16 md:mb-24">
        <div className="flex items-baseline justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <span className="label-mono text-xs text-vermilion font-bold">02</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink">Pengalaman</h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('pengalaman')}
            className="inline-flex items-center gap-1.5 label-mono text-xs text-ink hover:underline cursor-pointer bg-transparent border-none p-0 min-h-[44px] accent-link"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {recentExperiences.length > 0 ? (
          <div className="border-t border-b border-rule divide-y divide-rule">
            {recentExperiences.map((exp) => {
              const isActiveExp = /sekarang|present|aktif|now/i.test(exp.period);
              const points = getDescriptionPoints(exp.description);

              return (
                <article
                  key={exp.id}
                  className="grid grid-cols-1 md:grid-cols-12"
                >
                  {/* Kolom Kiri (Desktop): Perusahaan, Lokasi di bawahnya, & Periode */}
                  <div className="hidden md:flex md:col-span-4 py-6 pr-8 flex-col justify-between gap-3 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <p className="font-sans text-sm sm:text-base font-semibold text-ink break-words leading-snug">
                        {exp.organization}
                      </p>
                      {exp.location && (
                        <p className="label-mono text-xs text-ink-2 break-words">
                          {exp.location}
                        </p>
                      )}
                    </div>

                    <span
                      className={`label-mono text-xs font-semibold ${
                        isActiveExp ? 'text-vermilion' : 'text-ink-2'
                      }`}
                    >
                      {exp.period}
                    </span>
                  </div>

                  {/* Kolom Kanan (+ Garis Sumbu Timeline Vertikal & Penanda Kotak) */}
                  <div className="md:col-span-8 relative border-l border-rule pl-5 sm:pl-6 md:pl-8 py-5 sm:py-6 space-y-3 min-w-0">
                    {/* Titik Sumbu Timeline Kotak Arsitektural */}
                    <span
                      className={`absolute -left-[5px] top-6 sm:top-7 w-2.5 h-2.5 block ${
                        isActiveExp
                          ? 'bg-vermilion'
                          : 'bg-paper border border-ink'
                      }`}
                      aria-hidden="true"
                    />

                    {/* Meta Mobile (Hanya muncul di HP agar alur baca HRD tetap instan) */}
                    <div className="md:hidden space-y-0.5 min-w-0">
                      <span
                        className={`label-mono text-xs font-semibold block ${
                          isActiveExp ? 'text-vermilion' : 'text-ink-2'
                        }`}
                      >
                        {exp.period}
                      </span>
                      <p className="font-sans text-xs font-semibold text-ink break-words">
                        {exp.organization}
                      </p>
                      {exp.location && (
                        <p className="label-mono text-xs text-ink-2 break-words">
                          {exp.location}
                        </p>
                      )}
                    </div>

                    {/* Jabatan / Peran */}
                    <h3 className="font-serif text-xl sm:text-2xl text-ink font-semibold leading-snug break-words">
                      {exp.role}
                    </h3>

                    {/* Ringkasan Poin Kerja (Langsung terbaca tanpa perlu klik) */}
                    {points.length > 0 && (
                      <ul className="space-y-1.5 max-w-[64ch]">
                        {points.map((pt, pIdx) => (
                          <li
                            key={pIdx}
                            className="font-sans text-xs sm:text-sm text-ink-2 leading-relaxed flex items-start gap-2.5 min-w-0"
                          >
                            <span className="text-ink-3 select-none shrink-0">—</span>
                            <span className="break-words">{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Keahlian & Aksi Detail */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      {exp.skills && exp.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 min-w-0">
                          {exp.skills.slice(0, 4).map((s, idx) => (
                            <span
                              key={idx}
                              className="label-mono text-xs text-ink-2 border border-rule px-2 py-0.5 max-w-full break-words"
                            >
                              {s}
                            </span>
                          ))}
                          {exp.skills.length > 4 && (
                            <span className="label-mono text-xs text-ink-2 py-0.5">
                              +{exp.skills.length - 4}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div />
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedExperience(exp)}
                        className="label-mono text-xs text-ink font-semibold hover:underline cursor-pointer inline-flex items-center gap-1.5 min-h-[44px] bg-transparent border-none p-0 accent-link shrink-0"
                      >
                        <span>Lihat detail</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="label-mono text-xs text-ink-2 py-4">Belum ada data pengalaman.</p>
        )}
      </section>

      {/* ========================================================
          03 KARYA (Lembar Kontak dengan Rasio Asli Karya)
          ======================================================== */}
      <section id="section-karya" className="border-t border-rule pt-8 sm:pt-10 mb-16 md:mb-24">
        <div className="flex items-baseline justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <span className="label-mono text-xs text-vermilion font-bold">03</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink">Karya</h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('portofolio')}
            className="inline-flex md:hidden items-center gap-1.5 label-mono text-xs text-ink hover:underline cursor-pointer bg-transparent border-none p-0 min-h-[44px] accent-link"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <HomeWorkGrid
          works={selectedWorks}
          openWork={openWork}
          onSeeAll={() => setActiveTab('portofolio')}
        />
      </section>

      {/* ========================================================
          04 SERTIFIKAT & PELATIHAN (Kartu Sertifikat Berstruktur & Kredibel)
          ======================================================== */}
      <section id="section-sertifikat" className="border-t border-rule pt-8 sm:pt-10 mb-16 md:mb-24">
        <div className="flex items-baseline justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <span className="label-mono text-xs text-vermilion font-bold">04</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink">Sertifikat &amp; Pelatihan</h2>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('sertifikat')}
            className="inline-flex items-center gap-1.5 label-mono text-xs text-ink hover:underline cursor-pointer bg-transparent border-none p-0 min-h-[44px] accent-link"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {siteProfile?.certificates && siteProfile.certificates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {siteProfile.certificates.slice(0, 4).map((cert, cIdx) => (
              <div
                key={cert.id || cIdx}
                className="border border-rule bg-paper p-5 sm:p-6 flex flex-col justify-between hover:border-ink transition-colors duration-150 relative group"
              >
                <div className="space-y-3">
                  {/* Baris Atas Kartu */}
                  <div className="flex items-center justify-between border-b border-rule pb-2.5">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-vermilion shrink-0" />
                      <span className="label-mono text-xs text-ink font-bold">
                        {cert.type === 'pelatihan' ? 'PELATIHAN' : 'SERTIFIKAT'} 0{cIdx + 1}
                      </span>
                    </div>
                    <span className="label-mono text-xs text-ink-2 font-semibold">
                      {cert.year}
                    </span>
                  </div>

                  {/* Judul & Penerbit */}
                  <div>
                    <h3 className="font-serif text-lg sm:text-xl text-ink font-semibold leading-snug">
                      {cert.name}
                    </h3>
                    <p className="label-mono text-xs text-ink-2 mt-1">
                      Penerbit: {cert.issuer}
                    </p>
                  </div>

                  {/* Deskripsi Kredensial Resmi */}
                  {cert.description && (
                    <p className="font-sans text-xs sm:text-sm text-ink-2 leading-relaxed">
                      {cert.description}
                    </p>
                  )}
                </div>

                {/* Footer Kartu: Status & Link */}
                <div className="pt-4 mt-4 border-t border-rule flex items-center justify-between text-xs label-mono">
                  <span className="text-ink-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-vermilion inline-block shrink-0" />
                    <span>Kredensial Resmi</span>
                  </span>
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link text-ink inline-flex items-center gap-1 font-semibold min-h-[44px]"
                    >
                      <span>Lihat Kredensial</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="label-mono text-xs text-ink-2 py-4">Belum ada data sertifikat.</p>
        )}
      </section>

      {/* ========================================================
          05 KONTAK (Formulir Langsung di Beranda Tanpa Tombol Buka Halaman)
          ======================================================== */}
      <section id="section-kontak" className="border-t border-rule pt-8 sm:pt-10 mb-8">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="label-mono text-xs text-vermilion font-bold">05</span>
          <h2
            className="text-ink font-serif tracking-tight select-none"
            style={{
              fontSize: 'var(--step-display-l)',
              lineHeight: 0.92,
              letterSpacing: '-0.03em',
            }}
          >
            Mari berkolaborasi
          </h2>
        </div>

        {/* Deskripsi Singkat Kolaborasi */}
        <p className="text-ink-2 font-sans text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
          Punya ide proyek, kebutuhan video sinematik, desain antarmuka, atau strategi digital marketing?
          Mari diskusikan bersama untuk mewujudkan visual dan hasil nyata yang terukur.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pt-6 border-t border-rule">
          {/* Kolom Kiri: Surel Langsung & Saluran Profesional */}
          <div className="md:col-span-5 space-y-6">
            <div>
              <span className="label-mono text-xs text-ink-2 block mb-2">SUREL LANGSUNG</span>
              <a
                href={`mailto:${siteProfile?.email || 'andrakusuma.ramadhan@gmail.com'}`}
                className="text-link font-serif text-2xl sm:text-3xl text-ink break-all block min-h-[44px] flex items-center"
              >
                {siteProfile?.email || 'andrakusuma.ramadhan@gmail.com'}
              </a>
            </div>

            {siteProfile?.socials && (
              <div className="space-y-2 border-t border-rule pt-4">
                <span className="label-mono text-xs text-ink-2 block mb-2">SALURAN PROFESIONAL</span>
                <div className="flex flex-col gap-2">
                  {Object.entries(siteProfile.socials).map(([platform, url]) => {
                    // Kecualikan website URL karena user sudah berada di situs ini
                    if (!url || platform === 'website') return null;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group text-link label-mono text-xs text-ink capitalize min-h-[44px] flex items-center gap-1.5"
                      >
                        <span>{platform}</span>
                        <span className="arrow-fly-target arrow-fly-upright">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-rule pt-4">
              <span className="label-mono text-xs text-ink-2 block">DOMISILI &amp; STATUS KERJA</span>
              <p className="font-sans text-xs text-ink-2 mt-1 leading-relaxed">
                {siteProfile?.location || 'Surabaya, Indonesia'} —{' '}
                <span className="text-ink font-semibold">
                  {siteProfile?.availabilityStatus || 'OPEN TO WORK'}
                </span>
                . Respon surel dalam 1×24 jam kerja.
              </p>
            </div>
          </div>

          {/* Kolom Kanan: Formulir Kontak Langsung */}
          <div className="md:col-span-7">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label htmlFor="hp-name" className="label-mono text-xs text-ink block mb-1">
                  Nama Lengkap *
                </label>
                <input
                  id="hp-name"
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="input-swiss h-11"
                  placeholder="Nama Anda atau Perusahaan"
                />
              </div>

              <div>
                <label htmlFor="hp-email" className="label-mono text-xs text-ink block mb-1">
                  Alamat Email *
                </label>
                <input
                  id="hp-email"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="input-swiss h-11"
                  placeholder="email@domain.com"
                />
              </div>

              <div>
                <label htmlFor="hp-project" className="label-mono text-xs text-ink block mb-1">
                  Kebutuhan Layanan
                </label>
                <select
                  id="hp-project"
                  value={contactProjectType}
                  onChange={(e) => setContactProjectType(e.target.value)}
                  className="select-swiss h-11"
                >
                  <option value="Video Editing & Motion">Video Editing &amp; Motion</option>
                  <option value="Digital Marketing & Konten AI">Digital Marketing &amp; Konten AI</option>
                  <option value="Desain Grafis & Editorial">Desain Grafis &amp; Editorial</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label htmlFor="hp-message" className="label-mono text-xs text-ink block mb-1">
                  Pesan *
                </label>
                <textarea
                  id="hp-message"
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="textarea-swiss"
                  placeholder="Tuliskan ringkasan kebutuhan proyek atau pertanyaan Anda..."
                />
              </div>

              {contactStatus && (
                <div
                  role="status"
                  className={`p-3 border label-mono text-xs ${
                    contactStatus.type === 'BERHASIL'
                      ? 'bg-paper-2 border-rule text-ink'
                      : 'bg-paper-2 border-vermilion text-vermilion'
                  }`}
                >
                  {contactStatus.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isContactSubmitting}
                className="group btn-primary text-xs inline-flex items-center gap-2 min-h-[44px]"
              >
                <span>{isContactSubmitting ? 'Mengirim...' : 'Kirim Pesan'}</span>
                <span className="arrow-fly-target arrow-fly-right">
                  <ArrowRight className="w-3.5 h-3.5 text-paper" />
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Pop-up Modal Detail Pengalaman */}
      <ExperienceDetailModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
        marketingResults={marketingResults}
        portfolioItems={portfolioItems}
        openWork={openWork}
      />
    </div>
  );
};
