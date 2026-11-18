import React, { useState, useEffect } from 'react';
import { X, Briefcase, Save } from 'lucide-react';
import { Experience } from '../types';
import { usePortfolio } from '../context/PortfolioContext';

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experienceToEdit?: Experience | null;
}

export const ExperienceModal: React.FC<ExperienceModalProps> = ({
  isOpen,
  onClose,
  experienceToEdit,
}) => {
  const { addExperience, updateExperience } = usePortfolio();

  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [period, setPeriod] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [order, setOrder] = useState<number>(1);

  useEffect(() => {
    if (experienceToEdit) {
      setRole(experienceToEdit.role);
      setOrganization(experienceToEdit.organization);
      setPeriod(experienceToEdit.period);
      setLocation(experienceToEdit.location || '');
      setDescription(experienceToEdit.description);
      setSkillsInput(experienceToEdit.skills ? experienceToEdit.skills.join(', ') : '');
      setOrder(experienceToEdit.order || 1);
    } else {
      setRole('');
      setOrganization('');
      setPeriod('');
      setLocation('Indonesia');
      setDescription('');
      setSkillsInput('');
      setOrder(1);
    }
  }, [experienceToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim() || !organization.trim() || !period.trim() || !description.trim()) {
      alert('Mohon lengkapi Posisi, Organisasi, Periode, dan Deskripsi.');
      return;
    }

    const parsedSkills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      role: role.trim(),
      organization: organization.trim(),
      period: period.trim(),
      location: location.trim(),
      description: description.trim(),
      skills: parsedSkills,
      order: Number(order) || 1,
    };

    const ok = experienceToEdit
      ? await updateExperience(experienceToEdit.id, payload)
      : await addExperience(payload);

    if (ok !== false) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(20, 18, 15, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-rule"
        style={{ backgroundColor: 'var(--paper)', borderRadius: 0, color: 'var(--ink)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-ink hover:text-ink-2 cursor-pointer bg-transparent border-none"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 border border-rule flex items-center justify-center" style={{ backgroundColor: 'var(--paper-2)' }}>
            <Briefcase className="w-5 h-5 text-ink" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="font-bold text-lg text-ink"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {experienceToEdit ? 'Edit Pengalaman Kerja' : 'Tambah Pengalaman Baru'}
              </h3>
              {experienceToEdit && (
                <span className="label-mono text-xs px-2 py-0.5 border border-rule">
                  {experienceToEdit.id}
                </span>
              )}
            </div>
            <p className="label-mono text-xs text-ink-2">
              {experienceToEdit
                ? 'Memperbarui data pengalaman yang tersimpan.'
                : 'Data ini langsung tampil di bagian Pengalaman pada beranda.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block label-mono text-ink mb-1">
                Posisi / Role *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="mis. Video Editor"
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
                placeholder="mis. PT Studio Kreatif"
                className="input-swiss"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
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
                Urutan (Order)
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
              Lokasi
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
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan peran kerja, kontribusi dalam tim, strategi yang diimplementasikan…"
              className="input-swiss resize-y"
            />
          </div>

          <div>
            <label className="block label-mono text-ink mb-1">
              Keahlian &amp; Tag (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="mis. Video Production, Color Grading, Motion"
              className="input-swiss"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-rule">
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
              <Save className="w-3.5 h-3.5 text-paper" />
              <span>{experienceToEdit ? 'Simpan Perubahan' : 'Tambah Pengalaman'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
