import React, { useState } from 'react';
import { X, Save, Briefcase, RotateCcw, Eye } from 'lucide-react';
import { Experience } from '../types';
import { usePortfolio } from '../context/PortfolioContext';

interface ExperienceInlineEditorProps {
  exp: Experience;
  onClose: () => void;
  onOpenModal?: () => void;
}

export const ExperienceInlineEditor: React.FC<ExperienceInlineEditorProps> = ({
  exp,
  onClose,
}) => {
  const { updateExperience } = usePortfolio();

  const [role, setRole] = useState(exp.role);
  const [organization, setOrganization] = useState(exp.organization);
  const [period, setPeriod] = useState(exp.period);
  const [location, setLocation] = useState(exp.location || '');
  const [description, setDescription] = useState(exp.description);
  const [skillsInput, setSkillsInput] = useState(exp.skills ? exp.skills.join(', ') : '');
  const [order, setOrder] = useState<number>(exp.order || 1);
  const [showPreview, setShowPreview] = useState(false);

  const handleReset = () => {
    setRole(exp.role);
    setOrganization(exp.organization);
    setPeriod(exp.period);
    setLocation(exp.location || '');
    setDescription(exp.description);
    setSkillsInput(exp.skills ? exp.skills.join(', ') : '');
    setOrder(exp.order || 1);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !organization.trim() || !period.trim() || !description.trim()) {
      alert('Mohon lengkapi Posisi, Organisasi, Periode, dan Deskripsi.');
      return;
    }

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const ok = await updateExperience(exp.id, {
      role: role.trim(),
      organization: organization.trim(),
      period: period.trim(),
      location: location.trim(),
      description: description.trim(),
      skills: parsedSkills,
      order: Number(order) || 1,
    });

    if (ok !== false) {
      onClose();
    }
  };

  const parsedSkillsPreview = skillsInput
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div
      className="mt-3 p-5 sm:p-6 border border-rule transition-colors duration-150"
      style={{ backgroundColor: 'var(--paper-2)', borderRadius: 0, color: 'var(--ink)' }}
    >
      {/* Editor Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-rule">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 border border-rule" style={{ backgroundColor: 'var(--paper)' }}>
            <Briefcase className="w-4 h-4 text-ink" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="label-mono text-ink font-bold">
                Mode Edit Pengalaman Kerja
              </span>
              <span className="label-mono text-xs px-2 py-0.5 border border-rule">
                ID: {exp.id}
              </span>
            </div>
            <p className="label-mono text-xs text-ink-2">
              Perbarui catatan karier langsung di dashboard.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1 label-mono border border-rule cursor-pointer"
            style={{
              backgroundColor: showPreview ? 'var(--ink)' : 'transparent',
              color: showPreview ? 'var(--paper)' : 'var(--ink)',
            }}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showPreview ? 'Sembunyikan Preview' : 'Pratinjau Live'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 text-ink hover:text-ink-2 cursor-pointer bg-transparent border-none"
            title="Kembalikan ke data awal"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink hover:text-ink-2 cursor-pointer bg-transparent border-none"
            title="Batal edit"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Live Preview Card if enabled */}
      {showPreview && (
        <div className="mb-6 p-4 border border-rule space-y-2" style={{ backgroundColor: 'var(--paper)' }}>
          <span className="label-mono text-ink block font-semibold">
            Pratinjau Tampilan Timeline Publik:
          </span>
          <div className="p-4 border border-rule space-y-2" style={{ backgroundColor: 'var(--paper)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h5
                className="font-bold text-sm text-ink"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {role || 'Posisi / Role'}
              </h5>
              <span className="label-mono text-ink-2">
                {period || 'Periode'}
              </span>
            </div>
            <p className="label-mono text-xs text-ink-2 font-medium">
              {organization || 'Organisasi'} {location && `· ${location}`}
            </p>
            <p className="text-xs text-ink leading-relaxed whitespace-pre-line">
              {description || 'Deskripsi tugas dan pencapaian…'}
            </p>
            {parsedSkillsPreview.length > 0 && (
              <div className="label-mono text-xs text-ink-2 pt-1">
                {parsedSkillsPreview.join(' / ')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block label-mono text-ink mb-1">
              Posisi / Role *
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-swiss"
            />
          </div>

          <div>
            <label className="block label-mono text-ink mb-1">
              Organisasi / Perusahaan *
            </label>
            <input
              type="text"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="input-swiss"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-[2]">
            <label className="block label-mono text-ink mb-1">
              Periode Waktu *
            </label>
            <input
              type="text"
              required
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="mis. 2024 — Sekarang"
              className="input-swiss"
            />
          </div>

          <div className="flex-1">
            <label className="block label-mono text-ink mb-1">
              Urutan Prioritas (Order)
            </label>
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              min="1"
              className="input-swiss"
            />
          </div>
        </div>

        <div>
          <label className="block label-mono text-ink mb-1">
            Lokasi / Penempatan
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="mis. Surabaya / Remote, Indonesia"
            className="input-swiss"
          />
        </div>

        <div>
          <label className="block label-mono text-ink mb-1">
            Deskripsi Tanggung Jawab &amp; Pencapaian *
          </label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-swiss resize-y"
          />
        </div>

        <div>
          <label className="block label-mono text-ink mb-1">
            Keahlian &amp; Tag Kompetensi (pisahkan dengan koma)
          </label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="input-swiss"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-rule">
          <div className="label-mono text-xs text-ink-2">
            Dibuat pada: {new Date(exp.createdAt).toLocaleDateString('id-ID')}
          </div>

          <div className="flex items-center gap-2">
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
              className="btn-primary"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
