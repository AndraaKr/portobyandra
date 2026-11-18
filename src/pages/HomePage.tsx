import React, { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Award } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
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
            className="text-ink tracking-tight font-serif cursor-pointer focus:outline-none"
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

        {/* Pengantar dengan Animasi Ketikkan Mesin Tik & Satu Tautan Aksi */}
        <div className="border-t border-rule pt-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          {tagline ? (
            <p className="text-ink font-sans text-sm sm:text-base leading-relaxed max-w-[50ch] min-h-[3.5rem] sm:min-h-[3rem]">
              <TypewriterText
                text={tagline}
                speed={24}
                delay={450}
                cursorChar="▍"
                replayKey={kineticKey}
              />
            </p>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={scrollToKarya}
            className="inline-flex items-center gap-2 label-mono text-xs text-ink font-semibold hover:underline cursor-pointer bg-transparent border-none p-0 shrink-0 min-h-[44px] accent-link"
          >
            <span>Lihat karya</span>
            <ArrowDown className="w-4 h-4" />
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
          02 PENGALAMAN (Deskriptif dengan Tombol Lihat Detail -> Pop-up)
          ======================================================== */}
      <section id="section-pengalaman" className="border-t border-rule pt-8 sm:pt-10 mb-16 md:mb-24">
        <div className="flex items-baseline justify-between mb-6">
          <div className="flex items-baseline gap-3">
            <span className="label-mono text-xs text-vermilion font-bold">02</span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ink">Pengalaman</h2>
          </div>
        </div>

        {recentExperiences.length > 0 ? (
          <div className="divide-y divide-rule border-b border-rule">
            {recentExperiences.map((exp) => (
              <div key={exp.id} className="py-5 sm:py-6 space-y-3 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 min-w-0">
                    <span className="font-serif text-lg sm:text-xl text-ink font-semibold break-words">
                      {exp.role}
                    </span>
                    <span className="label-mono text-xs text-vermilion break-words">
                      — {exp.organization}
                    </span>
                  </div>
                  <span className="label-mono text-xs text-ink-2 font-medium shrink-0">
                    {exp.period}
                  </span>
                </div>

                {/* Deskripsi Singkat di Beranda (Dipersingkat, versi lengkap di modal) */}
                {exp.description && (
                  <p className="font-sans text-xs sm:text-sm text-ink-2 leading-relaxed max-w-2xl line-clamp-2 break-words">
                    {exp.description.split(/(?<=[.!?])\s+/)[0]}
                  </p>
                )}

                {/* Aksi & Tag Ringkas */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  {exp.skills && exp.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 min-w-0">
                      {exp.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="label-mono text-xs text-ink-2 border border-rule px-2 py-0.5 max-w-full break-words">
                          {s}
                        </span>
                      ))}
                      {exp.skills.length > 3 && (
                        <span className="label-mono text-xs text-ink-2 py-0.5">
                          +{exp.skills.length - 3} lainnya
                        </span>
                      )}
                    </div>
                  ) : (
                    <div />
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedExperience(exp)}
                    className="label-mono text-xs text-ink font-bold hover:underline cursor-pointer inline-flex items-center gap-1 min-h-[44px] accent-link"
                  >
                    <span>Lihat detail</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
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
            className="inline-flex items-center gap-1.5 label-mono text-xs text-ink hover:underline cursor-pointer bg-transparent border-none p-0 min-h-[44px] accent-link"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <HomeWorkGrid
          works={selectedWorks}
          openWork={openWork}
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
                        SERTIFIKAT 0{cIdx + 1}
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
        <div className="flex items-baseline gap-3 mb-3">
          <span className="label-mono text-xs text-vermilion font-bold">05</span>
          <h2 className="font-serif text-2xl sm:text-3xl text-ink">Kontak</h2>
        </div>

        {/* Deskripsi Kolaborasi */}
        <p className="text-ink font-sans text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
          Tertarik bekerja sama atau ingin mendiskusikan kebutuhan proyek? Siap berkolaborasi untuk
          produksi video komersial, motion design, strategi konten digital marketing, maupun
          kebutuhan visual lainnya. Silakan hubungi langsung melalui surel atau lengkapi formulir di
          bawah ini.
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
                    if (!url) return null;
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link label-mono text-xs text-ink capitalize min-h-[44px] flex items-center gap-1"
                      >
                        <span>{platform}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t border-rule pt-4">
              <span className="label-mono text-xs text-ink-2 block">DOMISILI &amp; WAKTU RESPONS</span>
              <p className="font-sans text-xs text-ink-2 mt-1 leading-relaxed">
                Surabaya, Indonesia — Balasan surel biasanya disampaikan dalam 1×24 jam kerja.
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
                className="btn-primary text-xs inline-flex items-center gap-2 min-h-[44px]"
              >
                <span>{isContactSubmitting ? 'Mengirim...' : 'Kirim Pesan'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-paper" />
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
