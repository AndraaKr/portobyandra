import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Layers, 
  Save, 
  Upload, 
  Trash2, 
  Video as VideoIcon, 
  Image as ImageIcon 
} from 'lucide-react';
import { PortfolioItem, Category, MediaType, WorkRole } from '../types';
import { usePortfolio } from '../context/PortfolioContext';
import { processLocalImage } from '../utils/imageUpload';
import { uploadLocalVideo } from '../utils/videoUpload';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: PortfolioItem | null;
}

const ALL_ROLES: { id: WorkRole; label: string }[] = [
  { id: 'editor', label: 'Editor' },
  { id: 'colorist', label: 'Colorist' },
  { id: 'director', label: 'Director' },
  { id: 'designer', label: 'Designer' },
  { id: 'motion', label: 'Motion' },
];

const RATIO_PRESETS = [
  { label: '16:9 (Landscape — 1920×1080)', w: 1920, h: 1080 },
  { label: '9:16 (Vertikal — 1080×1920)', w: 1080, h: 1920 },
  { label: '4:5 (Sosial — 1600×2000)', w: 1600, h: 2000 },
  { label: '1:1 (Persegi — 1600×1600)', w: 1600, h: 1600 },
  { label: 'Kustom Manual', w: 0, h: 0 },
];

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { addPortfolioItem, updatePortfolioItem, showToast } = usePortfolio();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<Category>('Video Editing');
  const [description, setDescription] = useState('');
  const [toolsInput, setToolsInput] = useState('');
  const [projectUrl, setProjectUrl] = useState('');
  const [metrics, setMetrics] = useState('');
  const [featured, setFeatured] = useState(false);

  // Field Media Baru (Tahap 5b)
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [posterUrl, setPosterUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaWidth, setMediaWidth] = useState<number>(1920);
  const [mediaHeight, setMediaHeight] = useState<number>(1080);
  const [selectedRatioIndex, setSelectedRatioIndex] = useState<number>(0);
  const [roles, setRoles] = useState<WorkRole[]>([]);
  const [durationInput, setDurationInput] = useState('');
  const [client, setClient] = useState('');
  const [workYear, setWorkYear] = useState<number>(new Date().getFullYear());
  const [isShowreel, setIsShowreel] = useState(false);
  const [aiAssisted, setAiAssisted] = useState(false);
  const [sortOrder, setSortOrder] = useState<number | undefined>(undefined);

  // File Upload Poster
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // File Upload Video Langsung (.mp4 / .webm)
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);

  const secondsToMmSs = (s?: number) => {
    if (s == null) return '';
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const mmSsToSeconds = (val: string): number | undefined => {
    if (!val.trim()) return undefined;
    const parts = val.split(':');
    if (parts.length === 2) {
      const m = parseInt(parts[0], 10);
      const s = parseInt(parts[1], 10);
      if (!isNaN(m) && !isNaN(s)) return m * 60 + s;
    }
    const num = parseInt(val, 10);
    return !isNaN(num) ? num : undefined;
  };

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setSlug(itemToEdit.slug);
      setCategory(itemToEdit.category);
      setDescription(itemToEdit.description);
      setToolsInput(itemToEdit.tools.join(', '));
      setProjectUrl(itemToEdit.projectUrl || '');
      setMetrics(itemToEdit.metrics || '');
      setFeatured(!!itemToEdit.featured);

      setMediaType(itemToEdit.mediaType || (itemToEdit.category === 'Video Editing' ? 'video' : 'image'));
      setPosterUrl(itemToEdit.posterUrl || itemToEdit.imageUrl || '');
      setVideoUrl(itemToEdit.videoUrl || '');
      setMediaWidth(itemToEdit.mediaWidth || (itemToEdit.category === 'Video Editing' ? 1920 : 1600));
      setMediaHeight(itemToEdit.mediaHeight || (itemToEdit.category === 'Video Editing' ? 1080 : 1200));
      setRoles(itemToEdit.roles || []);
      setDurationInput(secondsToMmSs(itemToEdit.durationSeconds));
      setClient(itemToEdit.client || '');
      setWorkYear(itemToEdit.workYear || new Date().getFullYear());
      setIsShowreel(!!itemToEdit.isShowreel);
      setAiAssisted(!!itemToEdit.aiAssisted);
      setSortOrder(itemToEdit.sortOrder);
    } else {
      setTitle('');
      setSlug('');
      setCategory('Video Editing');
      setDescription('');
      setToolsInput('Adobe Premiere Pro, After Effects');
      setProjectUrl('');
      setMetrics('');
      setFeatured(false);

      setMediaType('video');
      setPosterUrl('');
      setVideoUrl('');
      setMediaWidth(1920);
      setMediaHeight(1080);
      setSelectedRatioIndex(0);
      setRoles(['editor']);
      setDurationInput('');
      setClient('');
      setWorkYear(new Date().getFullYear());
      setIsShowreel(false);
      setAiAssisted(false);
      setSortOrder(undefined);
    }
  }, [itemToEdit, isOpen]);

  const handleRatioPresetChange = (idx: number) => {
    setSelectedRatioIndex(idx);
    const preset = RATIO_PRESETS[idx];
    if (preset && preset.w > 0) {
      setMediaWidth(preset.w);
      setMediaHeight(preset.h);
    }
  };

  const handleLocalFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const result = await processLocalImage(file);
      setPosterUrl(result.dataUrl);
    } catch (err: any) {
      alert(err.message || 'Gagal memproses berkas gambar');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVideoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingVideo(true);
      setVideoUploadProgress(10);
      const res = await uploadLocalVideo(file, (p) => setVideoUploadProgress(p));
      setVideoUrl(res.publicUrl);
      showToast(`Video berhasil diunggah (${res.sizeMb} MB)`, 'success');
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah berkas video');
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadProgress(0);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  const toggleRole = (r: WorkRole) => {
    setRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]
    );
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!itemToEdit) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generated);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Mohon isi Judul karya.');
      return;
    }

    const durationSeconds = mmSsToSeconds(durationInput);

    const parsedTools = toolsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      description: description.trim(),
      tools: parsedTools.length > 0 ? parsedTools : ['Adobe Premiere Pro'],
      imageUrl: posterUrl.trim() || undefined,
      posterUrl: posterUrl.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      mediaType,
      mediaWidth: Number(mediaWidth) || 1920,
      mediaHeight: Number(mediaHeight) || 1080,
      roles,
      durationSeconds,
      client: client.trim() || undefined,
      workYear: Number(workYear) || undefined,
      isShowreel,
      aiAssisted,
      sortOrder: sortOrder !== undefined && !isNaN(Number(sortOrder)) ? Number(sortOrder) : undefined,
      projectUrl: projectUrl.trim() || undefined,
      metrics: metrics.trim() || undefined,
      featured,
    };

    try {
      const ok = itemToEdit
        ? await updatePortfolioItem(itemToEdit.id, payload)
        : await addPortfolioItem(payload);

      if (ok !== false) {
        onClose();
      }
    } catch (err: any) {
      if (err?.message?.includes('portfolio_one_showreel') || err?.code === '23505') {
        showToast('Gagal: Hanya satu item showreel yang boleh aktif di database.', 'error');
      } else {
        showToast('Gagal menyimpan data karya.', 'error');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: 'rgba(20, 18, 15, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 border border-rule my-auto"
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
            <Layers className="w-5 h-5 text-ink" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="font-bold text-lg text-ink"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {itemToEdit ? 'Edit Karya Portofolio' : 'Tambah Karya Baru'}
              </h3>
              {itemToEdit && (
                <span className="label-mono text-xs px-2 py-0.5 border border-rule">
                  ID: {itemToEdit.id}
                </span>
              )}
            </div>
            <p className="label-mono text-xs text-ink-2">
              Atur metadata video, poster frame, rasio media, dan peran produksi.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Baris 1: Judul & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block label-mono text-ink mb-1">
                Judul Karya *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="mis. Film Pendek / Rekap Acara"
                className="input-swiss"
              />
            </div>

            <div>
              <label className="block label-mono text-ink mb-1">
                Slug URL (Unik) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="mis. rekap-acara-2025"
                className="input-swiss"
              />
            </div>
          </div>

          {/* Baris 2: Kategori & Jenis Media */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block label-mono text-ink mb-1">
                Kategori Proyek *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as Category;
                  setCategory(cat);
                  if (cat === 'Video Editing') setMediaType('video');
                  if (cat === 'Desain') setMediaType('image');
                }}
                className="input-swiss cursor-pointer bg-transparent"
              >
                <option value="Video Editing">Video Editing (Publik)</option>
                <option value="Desain">Desain (Publik)</option>
                <option value="UI/UX Desain">UI/UX Desain (Non-Publik)</option>
                <option value="Web Development">Web Development (Non-Publik)</option>
              </select>
            </div>

            <div>
              <label className="block label-mono text-ink mb-1">
                Jenis Media *
              </label>
              <div className="flex gap-4 pt-2">
                <label className="inline-flex items-center gap-2 label-mono text-ink cursor-pointer">
                  <input
                    type="radio"
                    name="modal-media-type"
                    value="video"
                    checked={mediaType === 'video'}
                    onChange={() => setMediaType('video')}
                  />
                  <span>Video</span>
                </label>
                <label className="inline-flex items-center gap-2 label-mono text-ink cursor-pointer">
                  <input
                    type="radio"
                    name="modal-media-type"
                    value="image"
                    checked={mediaType === 'image'}
                    onChange={() => setMediaType('image')}
                  />
                  <span>Gambar Statis</span>
                </label>
              </div>
            </div>
          </div>

          {/* Baris 3: Poster Frame (Wajib untuk semua karya) */}
          <div className="border border-rule p-4" style={{ backgroundColor: 'var(--paper-2)' }}>
            <label className="block label-mono text-ink mb-1 font-semibold">
              POSTER FRAME (WAJIB) *
            </label>
            <p className="label-mono text-xs text-ink-2 mb-3">
              Gambar pratinjau utama sebelum video diputar atau gambar karya statis.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {posterUrl ? (
                <div className="relative border border-rule shrink-0 w-36 h-24 flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--paper)' }}>
                  <img src={posterUrl} alt="Pratinjau poster" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPosterUrl('')}
                    className="absolute top-1 right-1 p-1 bg-ink text-paper border-none cursor-pointer"
                    title="Hapus poster"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-36 h-24 border border-rule border-dashed flex items-center justify-center shrink-0 label-mono text-xs text-ink-2" style={{ backgroundColor: 'var(--paper)' }}>
                  TIDAK ADA POSTER
                </div>
              )}

              <div className="flex-1 space-y-2 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleLocalFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingImage}
                  className="btn-primary text-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessingImage ? 'MEMPROSES…' : 'UNGGAH BERKAS POSTER'}</span>
                </button>
                <input
                  type="text"
                  value={posterUrl}
                  onChange={(e) => setPosterUrl(e.target.value)}
                  placeholder="Atau tempel URL gambar poster…"
                  className="input-swiss text-xs"
                />
              </div>
            </div>
          </div>

          {/* Baris 4: Video URL (Jika jenis media adalah Video) */}
          {mediaType === 'video' && (
            <div className="border border-rule p-4" style={{ backgroundColor: 'var(--paper-2)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <label className="block label-mono text-ink">
                  URL Video / Sumber Video *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleVideoFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    disabled={isUploadingVideo}
                    className="btn-swiss-secondary text-xs flex items-center gap-1.5"
                    style={{ padding: '6px 12px' }}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isUploadingVideo
                        ? `MENGUNGGAH... ${videoUploadProgress}%`
                        : 'UNGGAH BERKAS VIDEO (.MP4 / .WEBM)'}
                    </span>
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtu.be/... atau https://drive.google.com/file/d/... atau https://.../video.mp4"
                className="input-swiss"
              />
              <span className="label-mono text-xs text-ink-2 mt-2 block">
                Mendukung: Tautan YouTube, Google Drive, Vimeo, atau berkas MP4/WebM langsung (maks 50MB diunggah ke storage).
              </span>
            </div>
          )}

          {/* Baris 5: Rasio Media & Dimensi */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-rule pt-4">
            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Preset Rasio Media
              </label>
              <select
                value={selectedRatioIndex}
                onChange={(e) => handleRatioPresetChange(Number(e.target.value))}
                className="input-swiss cursor-pointer bg-transparent"
              >
                {RATIO_PRESETS.map((p, i) => (
                  <option key={i} value={i}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Lebar (Width px) *
              </label>
              <input
                type="number"
                required
                value={mediaWidth}
                onChange={(e) => setMediaWidth(Number(e.target.value))}
                className="input-swiss"
              />
            </div>

            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Tinggi (Height px) *
              </label>
              <input
                type="number"
                required
                value={mediaHeight}
                onChange={(e) => setMediaHeight(Number(e.target.value))}
                className="input-swiss"
              />
            </div>
          </div>

          {/* Baris 6: Peran Produksi (Checkboxes) */}
          <div className="border-t border-rule pt-4">
            <label className="block label-mono text-ink mb-2">
              PERAN PRODUKSI (PILIH MINIMAL SATU) *
            </label>
            <div className="flex flex-wrap gap-4">
              {ALL_ROLES.map((r) => (
                <label key={r.id} className="inline-flex items-center gap-2 label-mono text-ink cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roles.includes(r.id)}
                    onChange={() => toggleRole(r.id)}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Baris 7: Metadata Klien, Tahun, Durasi */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-rule pt-4">
            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Nama Klien *
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="mis. PT Brand Indonesia"
                className="input-swiss"
              />
            </div>

            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Tahun Rilis (4 Digit) *
              </label>
              <input
                type="number"
                value={workYear}
                onChange={(e) => setWorkYear(Number(e.target.value))}
                placeholder="2025"
                className="input-swiss"
              />
            </div>

            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Durasi (mm:ss) {mediaType === 'video' ? '*' : '(Opsional)'}
              </label>
              <input
                type="text"
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                placeholder="mis. 01:24"
                className="input-swiss"
              />
            </div>
          </div>

          {/* Baris 8: Showreel, Featured, Sort Order */}
          <div className="flex flex-col sm:flex-row gap-4 border-t border-rule pt-4 items-center">
            <div className="flex-1">
              <label className="inline-flex items-center gap-2 label-mono text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={isShowreel}
                  onChange={(e) => setIsShowreel(e.target.checked)}
                />
                <span className="font-semibold">SET SEBAGAI SHOWREEL</span>
              </label>
              <span className="label-mono text-xs text-ink-2 block mt-1">
                Hanya 1 showreel aktif diperbolehkan di sistem.
              </span>
            </div>

            <div className="flex-1">
              <label className="inline-flex items-center gap-2 label-mono text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiAssisted}
                  onChange={(e) => setAiAssisted(e.target.checked)}
                />
                <span>Dibuat dengan AI</span>
              </label>
            </div>

            <div className="flex-1">
              <label className="inline-flex items-center gap-2 label-mono text-ink cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                />
                <span>Karya Unggulan (Featured)</span>
              </label>
            </div>

            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Urutan Tampil (Sort Order)
              </label>
              <input
                type="number"
                value={sortOrder ?? ''}
                onChange={(e) => setSortOrder(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="mis. 1, 2, 3..."
                className="input-swiss"
              />
            </div>
          </div>

          {/* Baris 9: Deskripsi, Alat, Tautan Asli, Hasil */}
          <div className="space-y-4 border-t border-rule pt-4">
            <div>
              <label className="block label-mono text-ink mb-1">
                Deskripsi / Catatan Produksi *
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan konsep, tantangan kreatif, pendekatan visual, atau eksekusi editing…"
                className="input-swiss resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block label-mono text-ink mb-1">
                  Perangkat / Tools (Pisahkan Koma)
                </label>
                <input
                  type="text"
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  placeholder="Premiere Pro, DaVinci, AE"
                  className="input-swiss"
                />
              </div>

              <div className="flex-1">
                <label className="block label-mono text-ink mb-1">
                  Tautan Platform Asli (URL)
                </label>
                <input
                  type="url"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="input-swiss"
                />
              </div>

              <div className="flex-1">
                <label className="block label-mono text-ink mb-1">
                  Hasil / Metrik Pencapaian
                </label>
                <input
                  type="text"
                  value={metrics}
                  onChange={(e) => setMetrics(e.target.value)}
                  placeholder="mis. 250K+ Tayangan Organik"
                  className="input-swiss"
                />
              </div>
            </div>
          </div>

          {/* Tombol Simpan */}
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
              <span>{itemToEdit ? 'Simpan Perubahan' : 'Tambah Karya'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
