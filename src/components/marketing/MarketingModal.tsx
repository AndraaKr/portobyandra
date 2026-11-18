import React, { useState, useEffect } from 'react';
import { X, Save, TrendingUp } from 'lucide-react';
import { MarketingResult, Platform, PortfolioItem } from '../../types';

interface MarketingModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: MarketingResult | null;
  portfolioItems: PortfolioItem[];
  onSave: (data: Omit<MarketingResult, 'id' | 'createdAt'>) => Promise<boolean>;
}

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'threads', label: 'Threads' },
  { value: 'x', label: 'X (Twitter)' },
  { value: 'lainnya', label: 'Lainnya' },
];

export const MarketingModal: React.FC<MarketingModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
  portfolioItems,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [accountName, setAccountName] = useState('');
  const [platform, setPlatform] = useState<Platform>('instagram');
  const [organization, setOrganization] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [metricLabel, setMetricLabel] = useState('Views');
  const [baselineValue, setBaselineValue] = useState<number>(0);
  const [resultValue, setResultValue] = useState<number>(0);
  const [contentSummary, setContentSummary] = useState('');
  const [contentCount, setContentCount] = useState<number | undefined>(undefined);
  const [aiToolsInput, setAiToolsInput] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [sourceNote, setSourceNote] = useState('');
  const [relatedWorkSlugs, setRelatedWorkSlugs] = useState<string[]>([]);
  const [published, setPublished] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setSlug(itemToEdit.slug);
      setAccountName(itemToEdit.accountName);
      setPlatform(itemToEdit.platform);
      setOrganization(itemToEdit.organization || '');
      setPeriodStart(itemToEdit.periodStart);
      setPeriodEnd(itemToEdit.periodEnd);
      setMetricLabel(itemToEdit.metricLabel || 'Views');
      setBaselineValue(itemToEdit.baselineValue);
      setResultValue(itemToEdit.resultValue);
      setContentSummary(itemToEdit.contentSummary || '');
      setContentCount(itemToEdit.contentCount);
      setAiToolsInput((itemToEdit.aiTools || []).join(', '));
      setEvidenceUrl(itemToEdit.evidenceUrl || '');
      setSourceNote(itemToEdit.sourceNote || '');
      setRelatedWorkSlugs(itemToEdit.relatedWorkSlugs || []);
      setPublished(itemToEdit.published);
      setSortOrder(itemToEdit.sortOrder ?? 1);
    } else {
      setTitle('');
      setSlug('');
      setAccountName('');
      setPlatform('instagram');
      setOrganization('');
      setPeriodStart('');
      setPeriodEnd('');
      setMetricLabel('Views');
      setBaselineValue(0);
      setResultValue(0);
      setContentSummary('');
      setContentCount(undefined);
      setAiToolsInput('');
      setEvidenceUrl('');
      setSourceNote('');
      setRelatedWorkSlugs([]);
      setPublished(false);
      setSortOrder(1);
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  // Hitung kenaikan otomatis untuk pratinjau form (Bab 7.5)
  let calculatedIncrease = '0%';
  if (baselineValue === 0 && resultValue > 0) {
    calculatedIncrease = 'Dari 0';
  } else if (baselineValue > 0) {
    const pct = Math.round(((resultValue - baselineValue) / baselineValue) * 100);
    calculatedIncrease = pct > 0 ? `+${pct}%` : `${pct}%`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !accountName.trim() || !periodStart || !periodEnd) {
      alert('Judul, akun, dan periode wajib diisi.');
      return;
    }

    if (new Date(periodEnd) < new Date(periodStart)) {
      alert('Periode akhir tidak boleh sebelum periode mulai.');
      return;
    }

    if (published && !sourceNote.trim()) {
      alert('Sumber data (source_note) wajib diisi untuk menerbitkan hasil marketing.');
      return;
    }

    setIsSubmitting(true);
    const parsedAiTools = aiToolsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const ok = await onSave({
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      accountName: accountName.trim(),
      platform,
      organization: organization.trim() || undefined,
      periodStart,
      periodEnd,
      metricLabel: metricLabel.trim() || 'Views',
      baselineValue: Number(baselineValue) || 0,
      resultValue: Number(resultValue) || 0,
      contentSummary: contentSummary.trim() || undefined,
      contentCount: contentCount !== undefined && !isNaN(Number(contentCount)) ? Number(contentCount) : undefined,
      aiTools: parsedAiTools,
      evidenceUrl: evidenceUrl.trim() || undefined,
      sourceNote: sourceNote.trim(),
      relatedWorkSlugs,
      published,
      sortOrder: Number(sortOrder) || 1,
    });
    setIsSubmitting(false);

    if (ok) {
      onClose();
    }
  };

  const toggleRelatedWork = (slug: string) => {
    setRelatedWorkSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(20, 18, 15, 0.65)' }}
    >
      <div
        className="w-full max-w-2xl border border-rule p-6 space-y-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--paper)', borderRadius: 0 }}
      >
        <div className="flex items-center justify-between border-b border-rule pb-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-ink">
              {itemToEdit ? 'Edit Hasil Marketing' : 'Tambah Hasil Marketing'}
            </h3>
            <p className="label-mono text-xs text-ink-2">
              Kelola data studi kasus capaian pemasaran digital &amp; konten AI.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-ink-2 hover:text-ink cursor-pointer bg-transparent border-none"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block label-mono text-xs text-ink mb-1">
                Judul Kasus *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Kampanye Edukasi Energi"
                className="input-swiss"
              />
            </div>
            <div>
              <label className="block label-mono text-xs text-ink mb-1">
                Akun / Handle *
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="cth: @rejaaton.energi"
                className="input-swiss"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block label-mono text-xs text-ink mb-1">
                Platform *
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="input-swiss bg-transparent"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block label-mono text-xs text-ink mb-1">
                Organisasi / Brand
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="cth: PT Reja Aton Energi"
                className="input-swiss"
              />
            </div>
            <div className="flex-1">
              <label className="block label-mono text-xs text-ink mb-1">
                Label Metrik
              </label>
              <input
                type="text"
                value={metricLabel}
                onChange={(e) => setMetricLabel(e.target.value)}
                placeholder="Views / Impressions"
                className="input-swiss"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block label-mono text-xs text-ink mb-1">
                Periode Mulai *
              </label>
              <input
                type="date"
                required
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
                className="input-swiss"
              />
            </div>
            <div>
              <label className="block label-mono text-xs text-ink mb-1">
                Periode Akhir *
              </label>
              <input
                type="date"
                required
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
                className="input-swiss"
              />
            </div>
          </div>

          {/* Angka Sebelum & Sesudah + Pratinjau Kenaikan */}
          <div className="p-4 border border-rule bg-paper-2 space-y-3">
            <span className="label-mono text-xs text-ink font-bold block">
              DATA METRIK &amp; HASIL TERUKUR
            </span>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block label-mono text-xs text-ink mb-1">
                  Nilai Sebelum *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={baselineValue}
                  onChange={(e) => setBaselineValue(Number(e.target.value))}
                  className="input-swiss bg-paper"
                />
              </div>
              <div className="flex-1 w-full">
                <label className="block label-mono text-xs text-ink mb-1">
                  Nilai Sesudah *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={resultValue}
                  onChange={(e) => setResultValue(Number(e.target.value))}
                  className="input-swiss bg-paper"
                />
              </div>
              <div className="flex-1 w-full p-2 border border-rule bg-paper">
                <span className="label-mono text-xs text-ink-2 block">
                  Kenaikan Dihitung:
                </span>
                <span className="font-serif text-xl font-bold text-ink flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{calculatedIncrease}</span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block label-mono text-xs text-ink mb-1">
              Sumber Data * (Wajib untuk diterbitkan)
            </label>
            <input
              type="text"
              required
              value={sourceNote}
              onChange={(e) => setSourceNote(e.target.value)}
              placeholder="cth: Insight Instagram Reels, periode Jan–Mar 2026"
              className="input-swiss"
            />
            <span className="label-mono text-xs text-ink-2 block mt-1">
              Data harus dapat dipertanggungjawabkan kebenarannya.
            </span>
          </div>

          <div>
            <label className="block label-mono text-xs text-ink mb-1">
              Ringkasan Konten
            </label>
            <textarea
              rows={3}
              value={contentSummary}
              onChange={(e) => setContentSummary(e.target.value)}
              placeholder="Jelaskan jenis konten, pendekatan narasi, atau strategi yang diterapkan."
              className="input-swiss"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block label-mono text-xs text-ink mb-1">
                Jumlah Konten (Unggahan)
              </label>
              <input
                type="number"
                min="0"
                value={contentCount ?? ''}
                onChange={(e) => setContentCount(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="cth: 12"
                className="input-swiss"
              />
            </div>
            <div>
              <label className="block label-mono text-xs text-ink mb-1">
                Alat AI (Dipisah Koma)
              </label>
              <input
                type="text"
                value={aiToolsInput}
                onChange={(e) => setAiToolsInput(e.target.value)}
                placeholder="Midjourney, ElevenLabs, ChatGPT"
                className="input-swiss"
              />
            </div>
          </div>

          <div>
            <label className="block label-mono text-xs text-ink mb-1">
              URL Bukti (Tangkapan Layar Analytics / Link)
            </label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="https://..."
              className="input-swiss"
            />
          </div>

          {/* Karya Terkait */}
          {portfolioItems.length > 0 && (
            <div className="border-t border-rule pt-3">
              <span className="label-mono text-xs text-ink block mb-2 font-semibold">
                Karya Terkait (Pilih dari Portofolio)
              </span>
              <div className="max-h-32 overflow-y-auto border border-rule p-2 space-y-1 bg-paper-2">
                {portfolioItems.map((p) => {
                  const isChecked = relatedWorkSlugs.includes(p.slug);
                  return (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 label-mono text-xs text-ink cursor-pointer hover:bg-paper p-1"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleRelatedWork(p.slug)}
                      />
                      <span>{p.title}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Terbitkan & Urutan */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-rule pt-4">
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 label-mono text-xs text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <span className="font-bold">TERBITKAN KE HALAMAN PUBLIK</span>
              </label>

              <div className="flex items-center gap-2">
                <label className="label-mono text-xs text-ink">Urutan:</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="input-swiss w-16 text-center"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-primary"
                style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                <Save className="w-3.5 h-3.5 text-paper" />
                <span>{itemToEdit ? 'Simpan' : 'Tambah'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
