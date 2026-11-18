import React, { useState, useEffect } from 'react';
import { usePortfolio } from '../context/PortfolioContext';

export const ContactPage: React.FC = () => {
  const { addMessage, siteProfile } = usePortfolio();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [projectType, setProjectType] = useState('Video editing & motion');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'BERHASIL' | 'GALAT'; text: string } | null>(null);

  useEffect(() => {
    document.title = 'Kontak — Portofolio Muhammad Andra Kusuma Ramadhan';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatusMessage({
        type: 'GALAT',
        text: 'Isi nama, email, dan pesan.',
      });
      return;
    }

    setIsSubmitting(true);
    const ok = await addMessage({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim() || `Inquiry: ${projectType}`,
      projectType,
      message: message.trim(),
    });
    setIsSubmitting(false);

    if (ok !== false) {
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setStatusMessage({
        type: 'BERHASIL',
        text: 'Pesan terkirim. Saya akan membalas lewat email.',
      });
    } else {
      setStatusMessage({
        type: 'GALAT',
        text: 'Pesan gagal dikirim. Coba lagi atau kirim langsung lewat email.',
      });
    }
  };

  const socials = siteProfile?.socials;

  return (
    <div className="page py-8 md:py-16">
      {/* Header Halaman (Bab 3.5) */}
      <div className="border-b border-rule pb-6 mb-8">
        <h1
          className="text-ink font-serif tracking-tight select-none"
          style={{
            fontSize: 'var(--step-display-l)',
            lineHeight: 0.92,
            letterSpacing: '-0.03em',
          }}
        >
          Mari berkolaborasi
        </h1>
      </div>

      {/* Konten Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-y-12 md:gap-x-12">
        {/* Kolom Kiri: Email & Sosial */}
        <div className="md:col-span-5 space-y-8">
          {siteProfile?.email && (
            <div>
              <span className="label-mono text-xs text-ink block mb-2">Email</span>
              <a
                href={`mailto:${siteProfile.email}`}
                className="text-ink text-link font-serif text-2xl sm:text-3xl block break-all min-h-[44px] flex items-center"
              >
                {siteProfile.email}
              </a>
            </div>
          )}

          {socials && (
            <div className="border-t border-rule pt-6 space-y-2">
              <span className="label-mono text-xs text-ink block mb-2">Tautan</span>
              <div className="flex flex-col gap-2">
                {Object.entries(socials).map(([key, url]) => {
                  if (!url) return null;
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link label-mono text-xs text-ink capitalize min-h-[44px] flex items-center"
                    >
                      {key} →
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Formulir Kontak (Bab 3.5) */}
        <div className="md:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="contact-name" className="label-mono text-xs text-ink block mb-1">
                Nama *
              </label>
              <input
                id="contact-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-swiss h-12"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="label-mono text-xs text-ink block mb-1">
                Email *
              </label>
              <input
                id="contact-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-swiss h-12"
              />
            </div>

            <div>
              <label htmlFor="contact-category" className="label-mono text-xs text-ink block mb-1">
                Kategori
              </label>
              <select
                id="contact-category"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="input-swiss h-12 cursor-pointer bg-transparent"
              >
                <option value="Video editing & motion">Video editing &amp; motion</option>
                <option value="Desain">Desain</option>
                <option value="Digital marketing">Digital marketing</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-subject" className="label-mono text-xs text-ink block mb-1">
                Subjek
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-swiss h-12"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="label-mono text-xs text-ink block mb-1">
                Pesan *
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-swiss resize-y py-2"
              />
            </div>

            {/* Status Feedback (Bab 4: label teks + garis kiri 2px ink, bukan vermilion) */}
            {statusMessage && (
              <div className="border-l-2 border-ink pl-4 py-2">
                <span className="label-mono text-xs font-bold text-ink mr-2">
                  {statusMessage.type}:
                </span>
                <span className="text-ink text-xs">
                  {statusMessage.text}
                </span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary min-h-[44px]"
              >
                {isSubmitting ? 'Memuat' : 'Kirim pesan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
