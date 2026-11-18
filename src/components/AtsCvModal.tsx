import React, { useState } from 'react';
import { X, Download, FileText, CheckCircle2, ShieldCheck, Globe2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { downloadAtsCvPdf, parseEducationText } from '../utils/generateAtsPdf';

interface AtsCvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtsCvModal: React.FC<AtsCvModalProps> = ({ isOpen, onClose }) => {
  const { experiences, portfolioItems, showToast, siteProfile } = usePortfolio();
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [includeProjects, setIncludeProjects] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!siteProfile) {
      showToast('Data profil belum termuat, coba lagi sesaat.', 'error');
      return;
    }
    setIsGenerating(true);
    try {
      downloadAtsCvPdf(siteProfile, experiences, portfolioItems, {
        language,
        includeProjects,
      });
      showToast('CV format ATS (PDF) berhasil diunduh!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal membuat file PDF. Silakan coba kembali.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const isId = language === 'id';
  const p = siteProfile;

  const skillGroupsForPreview = p
    ? [
        { label: 'UI/UX & Product Design', items: p.skills.uiux },
        { label: 'Video Editing & Multimedia', items: p.skills.multimedia },
        { label: 'Digital Marketing & Content', items: p.skills.marketing },
        {
          label: 'Tool AI & Generatif',
          items: p.skills.aiTools?.length ? p.skills.aiTools : p.skills.frontend,
        },
      ].filter((g) => g.items.length > 0)
    : [];

  const parsedEdu = p?.education ? parseEducationText(p.education, p.location) : null;
  const profileGpa = (p?.gpa || '').trim();
  const educationGpa =
    parsedEdu?.gpa ||
    (profileGpa
      ? /^(ipk|gpa)\b/i.test(profileGpa)
        ? profileGpa
        : `IPK: ${profileGpa}`
      : 'IPK: 3.78');

  const contactSegments = p
    ? [
        p.email ? { text: p.email.trim(), isLink: true } : null,
        p.phone ? { text: p.phone.trim(), isLink: false } : null,
        p.socials.linkedin
          ? {
              text: p.socials.linkedin.trim().replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, ''),
              isLink: true,
            }
          : null,
        p.socials.website || p.socials.github
          ? {
              text: (p.socials.website || p.socials.github)
                .trim()
                .replace(/^https?:\/\/(www\.)?/, '')
                .replace(/\/+$/, ''),
              isLink: true,
            }
          : null,
      ].filter((x): x is { text: string; isLink: boolean } => Boolean(x))
    : [];
  const sortedExperiences = [...experiences].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      style={{ backgroundColor: 'rgba(20, 18, 15, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl border border-rule overflow-hidden my-auto max-h-[92vh] flex flex-col"
        style={{ backgroundColor: 'var(--paper)', borderRadius: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-rule flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-lg font-bold text-ink"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Curriculum Vitae (Format ATS)
                </h2>
                <span className="label-mono text-xs px-2 py-0.5 border border-rule">
                  STANDAR ATS
                </span>
              </div>
              <p className="label-mono text-ink-2 text-xs mt-0.5">
                Format standar ATS 1-kolom bergaya klasik (Times New Roman).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink hover:text-ink-2 cursor-pointer bg-transparent border-none"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div
          className="px-6 py-3 border-b border-rule flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{ backgroundColor: 'var(--paper-2)' }}
        >
          <div className="flex items-center gap-4">
            <span className="label-mono text-ink font-semibold flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-ink" /> Bahasa Judul:
            </span>
            <div className="inline-flex border border-rule">
              <button
                type="button"
                onClick={() => setLanguage('id')}
                className="px-3 py-1 label-mono cursor-pointer border-none"
                style={{
                  backgroundColor: language === 'id' ? 'var(--ink)' : 'transparent',
                  color: language === 'id' ? 'var(--paper)' : 'var(--ink)',
                  borderRadius: 0,
                }}
              >
                ID - Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className="px-3 py-1 label-mono cursor-pointer border-none"
                style={{
                  backgroundColor: language === 'en' ? 'var(--ink)' : 'transparent',
                  color: language === 'en' ? 'var(--paper)' : 'var(--ink)',
                  borderRadius: 0,
                }}
              >
                EN - English
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none label-mono text-ink">
              <input
                type="checkbox"
                checked={includeProjects}
                onChange={(e) => setIncludeProjects(e.target.checked)}
                className="w-4 h-4"
                style={{ borderRadius: 0 }}
              />
              <span>Sertakan Pengalaman Terkait &amp; Proyek</span>
            </label>
          </div>
        </div>

        {/* Modal Scrollable Body - ATS CV Live Preview */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          style={{ backgroundColor: 'var(--paper-2)' }}
        >
          {/* ATS Key Guidelines Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 border border-rule flex items-center gap-2" style={{ backgroundColor: 'var(--paper)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-ink shrink-0" />
              <span className="label-mono text-ink text-xs">Header Rata Tengah</span>
            </div>
            <div className="p-2 border border-rule flex items-center gap-2" style={{ backgroundColor: 'var(--paper)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-ink shrink-0" />
              <span className="label-mono text-ink text-xs">Deskripsi Tanpa Judul</span>
            </div>
            <div className="p-2 border border-rule flex items-center gap-2" style={{ backgroundColor: 'var(--paper)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-ink shrink-0" />
              <span className="label-mono text-ink text-xs">Font Standar Times</span>
            </div>
            <div className="p-2 border border-rule flex items-center gap-2" style={{ backgroundColor: 'var(--paper)' }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-ink shrink-0" />
              <span className="label-mono text-ink text-xs">Vektor Searchable</span>
            </div>
          </div>

          {!p ? (
            <div className="text-center py-16 label-mono text-ink-2">
              MEMUAT DATA PROFIL…
            </div>
          ) : (
            <div
              style={{
                fontFamily: "'Times New Roman', Times, Georgia, serif",
                backgroundColor: 'var(--paper)',
                color: 'var(--ink)',
                borderRadius: 0,
              }}
              className="border border-rule p-6 sm:p-11 text-xs sm:text-[13px] space-y-4 max-w-3xl mx-auto leading-snug"
            >
              {/* Header Kontak */}
              <div className="text-center border-b border-rule pb-3 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-normal tracking-wide text-ink uppercase">
                  {p.name || (isId ? 'NAMA LENGKAP' : 'FULL NAME')}
                </h1>

                {contactSegments.length > 0 && (
                  <div className="text-[12px] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                    {contactSegments.map((seg, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="text-ink-2">|</span>}
                        <span className="text-ink font-medium">
                          {seg.text}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {p.location && (
                  <p className="text-[12px] text-ink-2">
                    {p.location}
                  </p>
                )}
              </div>

              {/* Bio */}
              {p.bio && (
                <p className="text-[12.5px] leading-relaxed text-ink whitespace-pre-line">
                  {p.bio}
                </p>
              )}

              {/* Pendidikan */}
              {p.education && parsedEdu && (
                <div className="space-y-1.5 pt-1">
                  <div className="font-bold uppercase tracking-wide text-[13px] border-b border-rule pb-0.5 text-ink">
                    {isId ? 'PENDIDIKAN' : 'EDUCATION'}
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-[13px] text-ink">
                        {parsedEdu.institution || p.education}
                      </span>
                      {parsedEdu.location && (
                        <span className="font-bold text-[12.5px] text-ink text-right">
                          {parsedEdu.location}
                        </span>
                      )}
                    </div>

                    {(parsedEdu.degree || educationGpa || parsedEdu.period) && (
                      <div className="flex justify-between items-baseline gap-2">
                        <span className="text-[12.5px] text-ink-2">
                          {parsedEdu.degree && <em>{parsedEdu.degree}</em>}
                          {educationGpa && (
                            <span>{parsedEdu.degree ? ` | ${educationGpa}` : educationGpa}</span>
                          )}
                        </span>
                        {parsedEdu.period && (
                          <span className="font-bold text-[12.5px] text-ink text-right">
                            {parsedEdu.period}
                          </span>
                        )}
                      </div>
                    )}

                    {parsedEdu.bullets.length > 0 && (
                      <ul className="list-disc list-outside pl-5 mt-1 text-[12.5px] text-ink space-y-0.5">
                        {parsedEdu.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Pengalaman Kerja */}
              {sortedExperiences.length > 0 && (
                <div className="space-y-3 pt-1">
                  <div className="font-bold uppercase tracking-wide text-[13px] border-b border-rule pb-0.5 text-ink">
                    {isId ? 'PENGALAMAN KERJA' : 'WORK EXPERIENCE'}
                  </div>

                  <div className="space-y-3">
                    {sortedExperiences.map((exp) => {
                      const rawLines = exp.description
                        .split(/\r?\n/)
                        .map((s) => s.replace(/^[•\-*]\s*/, '').trim())
                        .filter(Boolean);
                      const bullets =
                        rawLines.length > 1
                          ? rawLines
                          : exp.description
                              .split(/(?<=[.!?])\s+/)
                              .map((s) => s.replace(/^[•\-*]\s*/, '').trim())
                              .filter(Boolean);

                      return (
                        <div key={exp.id} className="space-y-0.5">
                          <div className="flex justify-between items-baseline gap-2">
                            <span className="font-bold text-[13px] text-ink">
                              {exp.organization}
                            </span>
                            {exp.location && (
                              <span className="font-bold text-[12.5px] text-ink text-right">
                                {exp.location}
                              </span>
                            )}
                          </div>

                          <div className="flex justify-between items-baseline gap-2">
                            <span className="italic text-[12.5px] text-ink-2">
                              {exp.role}
                            </span>
                            <span className="font-bold text-[12.5px] text-ink text-right">
                              {exp.period}
                            </span>
                          </div>

                          <ul className="list-disc list-outside pl-5 pt-0.5 text-[12.5px] text-ink space-y-0.5 leading-relaxed">
                            {bullets.map((sent, idx) => (
                              <li key={idx}>{sent}</li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Proyek */}
              {includeProjects && portfolioItems.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="font-bold uppercase tracking-wide text-[13px] border-b border-rule pb-0.5 text-ink">
                    {isId ? 'PENGALAMAN TERKAIT & PROYEK' : 'RELATED EXPERIENCES'}
                  </div>

                  <div className="space-y-2.5">
                    {portfolioItems.slice(0, 3).map((proj) => (
                      <div key={proj.id} className="space-y-0.5">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-[13px] text-ink">{proj.title}</span>
                          {p.location && (
                            <span className="font-bold text-[12.5px] text-ink text-right">
                              {p.location}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="italic text-[12.5px] text-ink-2">{proj.category}</span>
                          {proj.createdAt && (
                            <span className="font-bold text-[12.5px] text-ink text-right">
                              {new Date(proj.createdAt).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                        <ul className="list-disc list-outside pl-5 pt-0.5 text-[12.5px] text-ink space-y-0.5">
                          <li>
                            {proj.description}{' '}
                            {proj.metrics && (
                              <strong>({isId ? 'Pencapaian' : 'Result'}: {proj.metrics})</strong>
                            )}
                          </li>
                          {proj.tools && proj.tools.length > 0 && (
                            <li>
                              {isId ? 'Perangkat & Teknologi' : 'Tools'}: {proj.tools.join(', ')}.
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sertifikasi */}
              {p.certificates.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="font-bold uppercase tracking-wide text-[13px] border-b border-rule pb-0.5 text-ink">
                    {isId ? 'SERTIFIKASI' : 'CERTIFICATION'}
                  </div>
                  <ul className="list-disc list-outside pl-5 text-[12.5px] text-ink space-y-0.5">
                    {p.certificates.map((cert) => (
                      <li key={cert.id}>
                        {[cert.name, cert.issuer, cert.year].filter(Boolean).join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Keahlian */}
              {skillGroupsForPreview.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="font-bold uppercase tracking-wide text-[13px] border-b border-rule pb-0.5 text-ink">
                    {isId ? 'KEAHLIAN' : 'SKILLS'}
                  </div>
                  <ul className="list-disc list-outside pl-5 text-[12.5px] text-ink space-y-0.5">
                    {skillGroupsForPreview.map((group, i) => (
                      <li key={i}>
                        <strong>{group.label}: </strong>
                        {group.items.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-rule flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="label-mono text-ink-2 text-xs">
            Format: Dokumen PDF (A4, Times New Roman, Searchable Vector)
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn-primary"
              style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
            >
              TUTUP
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="btn-primary"
            >
              <Download className="w-4 h-4 text-paper" />
              <span>{isGenerating ? 'MEMBUAT PDF…' : 'UNDUH CV ATS (PDF)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
