import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  Layers, 
  Eye, 
  RotateCcw, 
  Upload, 
  Trash2 
} from 'lucide-react';
import { PortfolioItem, Category, MediaType, WorkRole } from '../types';
import { usePortfolio } from '../context/PortfolioContext';
import { processLocalImage } from '../utils/imageUpload';
import { uploadLocalVideo } from '../utils/videoUpload';

interface PortfolioInlineEditorProps {
  item: PortfolioItem;
  onClose: () => void;
  onOpenModal?: () => void;
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

export const PortfolioInlineEditor: React.FC<PortfolioInlineEditorProps> = ({
  item,
  onClose,
}) => {
  const { updatePortfolioItem, showToast } = usePortfolio();

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

  const [title, setTitle] = useState(item.title);
  const [slug, setSlug] = useState(item.slug);
  const [category, setCategory] = useState<Category>(item.category);
  const [description, setDescription] = useState(item.description);
  const [toolsInput, setToolsInput] = useState(item.tools.join(', '));
  const [projectUrl, setProjectUrl] = useState(item.projectUrl || '');
  const [metrics, setMetrics] = useState(item.metrics || '');
  const [featured, setFeatured] = useState(!!item.featured);
  const [showPreview, setShowPreview] = useState(false);

  // Field Media Baru
  const [mediaType, setMediaType] = useState<MediaType>(
    item.mediaType || (item.category === 'Video Editing' ? 'video' : 'image')
  );
  const [posterUrl, setPosterUrl] = useState(item.posterUrl || item.imageUrl || '');
  const [videoUrl, setVideoUrl] = useState(item.videoUrl || '');
  const [mediaWidth, setMediaWidth] = useState<number>(
    item.mediaWidth || (item.category === 'Video Editing' ? 1920 : 1600)
  );
  const [mediaHeight, setMediaHeight] = useState<number>(
    item.mediaHeight || (item.category === 'Video Editing' ? 1080 : 1200)
  );
  const [selectedRatioIndex, setSelectedRatioIndex] = useState<number>(0);
  const [roles, setRoles] = useState<WorkRole[]>(item.roles || []);
  const [durationInput, setDurationInput] = useState(secondsToMmSs(item.durationSeconds));
  const [client, setClient] = useState(item.client || '');
  const [workYear, setWorkYear] = useState<number>(item.workYear || new Date().getFullYear());
  const [isShowreel, setIsShowreel] = useState(!!item.isShowreel);
  const [aiAssisted, setAiAssisted] = useState(!!item.aiAssisted);
  const [sortOrder, setSortOrder] = useState<number | undefined>(item.sortOrder);

  // File Upload dari Local
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // File Upload Video Langsung (.mp4 / .webm)
  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);

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

  const handleReset = () => {
    setTitle(item.title);
    setSlug(item.slug);
    setCategory(item.category);
    setDescription(item.description);
    setToolsInput(item.tools.join(', '));
    setProjectUrl(item.projectUrl || '');
    setMetrics(item.metrics || '');
    setFeatured(!!item.featured);

    setMediaType(item.mediaType || (item.category === 'Video Editing' ? 'video' : 'image'));
    setPosterUrl(item.posterUrl || item.imageUrl || '');
    setVideoUrl(item.videoUrl || '');
    setMediaWidth(item.mediaWidth || (item.category === 'Video Editing' ? 1920 : 1600));
    setMediaHeight(item.mediaHeight || (item.category === 'Video Editing' ? 1080 : 1200));
    setRoles(item.roles || []);
    setDurationInput(secondsToMmSs(item.durationSeconds));
    setClient(item.client || '');
    setWorkYear(item.workYear || new Date().getFullYear());
    setIsShowreel(!!item.isShowreel);
    setSortOrder(item.sortOrder);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Judul karya tidak boleh kosong.');
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
      const ok = await updatePortfolioItem(item.id, payload);
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
      className="mt-3 p-5 sm:p-6 border border-rule transition-colors duration-150"
      style={{ backgroundColor: 'var(--paper-2)', borderRadius: 0, color: 'var(--ink)' }}
    >
      {/* Editor Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-rule">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 border border-rule" style={{ backgroundColor: 'var(--paper)' }}>
            <Layers className="w-4 h-4 text-ink" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="label-mono text-ink font-bold">
                Mode Edit Karya Portofolio
              </span>
              <span className="label-mono text-xs px-2 py-0.5 border border-rule">
                ID: {item.id}
              </span>
            </div>
            <p className="label-mono text-xs text-ink-2">
              Sunting metadata video, poster, dan rasio media.
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
            Pratinjau Data Karya:
          </span>
          <div className="p-4 border border-rule space-y-2" style={{ backgroundColor: 'var(--paper)' }}>
            <div className="flex items-baseline justify-between gap-2">
              <h5
                className="font-bold text-sm text-ink"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {title || 'Judul Karya'}
              </h5>
              <span className="label-mono text-ink-2">
                {category} · {mediaType}
              </span>
            </div>
            <p className="label-mono text-xs text-ink-2">
              PERAN: {roles.join(' / ') || '—'} · KLIEN: {client || '—'} · TAHUN: {workYear} · DURASI: {durationInput || '—'}
            </p>
            {posterUrl && (
              <div className="w-32 h-20 border border-rule overflow-hidden">
                <img src={posterUrl} alt="Poster preview" className="w-full h-full object-cover" />
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
              Judul Karya *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              className="input-swiss"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block label-mono text-ink mb-1">
              Kategori Proyek
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
              Jenis Media
            </label>
            <div className="flex gap-4 pt-2">
              <label className="inline-flex items-center gap-2 label-mono text-ink cursor-pointer">
                <input
                  type="radio"
                  name={`inline-media-type-${item.id}`}
                  value="video"
                  checked={mediaType === 'video'}
                  onChange={() => setMediaType('video')}
                />
                <span>Video</span>
              </label>
              <label className="inline-flex items-center gap-2 label-mono text-ink cursor-pointer">
                <input
                  type="radio"
                  name={`inline-media-type-${item.id}`}
                  value="image"
                  checked={mediaType === 'image'}
                  onChange={() => setMediaType('image')}
                />
                <span>Gambar Statis</span>
              </label>
            </div>
          </div>
        </div>

        {/* Poster Frame */}
        <div className="border border-rule p-3" style={{ backgroundColor: 'var(--paper)' }}>
          <label className="block label-mono text-ink mb-1 font-semibold">
            POSTER FRAME (WAJIB) *
          </label>
          <div className="flex flex-col sm:flex-row gap-3 items-start">
            {posterUrl ? (
              <div className="relative border border-rule shrink-0 w-28 h-20 flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--paper-2)' }}>
                <img src={posterUrl} alt="Poster" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPosterUrl('')}
                  className="absolute top-1 right-1 p-0.5 bg-ink text-paper border-none cursor-pointer"
                  title="Hapus poster"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="w-28 h-20 border border-rule border-dashed flex items-center justify-center shrink-0 label-mono text-xs text-ink-2">
                NO POSTER
              </div>
            )}
            <div className="flex-1 space-y-1.5 w-full">
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
                className="btn-primary text-xs py-1 px-3"
              >
                <Upload className="w-3 h-3" />
                <span>{isProcessingImage ? 'MEMPROSES…' : 'UNGGAH BERKAS POSTER'}</span>
              </button>
              <input
                type="text"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="URL poster…"
                className="input-swiss text-xs"
              />
            </div>
          </div>
        </div>

        {/* Video URL */}
        {mediaType === 'video' && (
          <div className="border border-rule p-3" style={{ backgroundColor: 'var(--paper-2)' }}>
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
                  style={{ padding: '4px 10px' }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {isUploadingVideo
                      ? `MENGUNGGAH... ${videoUploadProgress}%`
                      : 'UNGGAH BERKAS VIDEO'}
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
              Mendukung: YouTube, Google Drive, Vimeo, atau berkas MP4/WebM langsung (maks 50MB).
            </span>
          </div>
        )}

        {/* Rasio & Dimensi */}
        <div className="flex flex-col sm:flex-row gap-3 border-t border-rule pt-3">
          <div className="flex-1">
            <label className="block label-mono text-ink mb-1">
              Preset Rasio
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
              Lebar (px)
            </label>
            <input
              type="number"
              value={mediaWidth}
              onChange={(e) => setMediaWidth(Number(e.target.value))}
              className="input-swiss"
            />
          </div>
          <div className="flex-1">
            <label className="block label-mono text-ink mb-1">
              Tinggi (px)
            </label>
            <input
              type="number"
              value={mediaHeight}
              onChange={(e) => setMediaHeight(Number(e.target.value))}
              className="input-swiss"
            />
          </div>
        </div>

        {/* Peran Produksi */}
        <div className="border-t border-rule pt-3">
          <label className="block label-mono text-ink mb-1">
            PERAN PRODUKSI *
          </label>
          <div className="flex flex-wrap gap-3">
            {ALL_ROLES.map((r) => (
              <label key={r.id} className="inline-flex items-center gap-1.5 label-mono text-xs text-ink cursor-pointer">
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

        {/* Klien, Tahun, Durasi */}
        <div className="flex flex-col sm:flex-row gap-3 border-t border-rule pt-3">
          <div className="flex-1">
            <label className="block label-mono text-ink mb-1">
              Klien *
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="Nama Klien"
              className="input-swiss"
            />
          </div>
          <div className="flex-1">
            <label className="block label-mono text-ink mb-1">
              Tahun *
            </label>
            <input
              type="number"
              value={workYear}
              onChange={(e) => setWorkYear(Number(e.target.value))}
              className="input-swiss"
            />
          </div>
          <div className="flex-1">
            <label className="block label-mono text-ink mb-1">
              Durasi (mm:ss)
            </label>
            <input
              type="text"
              value={durationInput}
              onChange={(e) => setDurationInput(e.target.value)}
              placeholder="01:24"
              className="input-swiss"
            />
          </div>
        </div>

        {/* Showreel, Featured, Sort Order */}
        <div className="flex flex-col sm:flex-row gap-3 border-t border-rule pt-3 items-center">
          <div className="flex-1">
            <label className="inline-flex items-center gap-1.5 label-mono text-xs text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={isShowreel}
                onChange={(e) => setIsShowreel(e.target.checked)}
              />
              <span className="font-semibold">SHOWREEL (Maks 1)</span>
            </label>
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center gap-1.5 label-mono text-xs text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={aiAssisted}
                onChange={(e) => setAiAssisted(e.target.checked)}
              />
              <span>Dibuat dengan AI</span>
            </label>
          </div>
          <div className="flex-1">
            <label className="inline-flex items-center gap-1.5 label-mono text-xs text-ink cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <span>Unggulan (Featured)</span>
            </label>
          </div>
          <div className="flex-1">
            <label className="block label-mono text-ink mb-1">
              Urutan
            </label>
            <input
              type="number"
              value={sortOrder ?? ''}
              onChange={(e) => setSortOrder(e.target.value ? Number(e.target.value) : undefined)}
              className="input-swiss"
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div className="space-y-3 border-t border-rule pt-3">
          <div>
            <label className="block label-mono text-ink mb-1">
              Deskripsi *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-swiss resize-y"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Alat
              </label>
              <input
                type="text"
                value={toolsInput}
                onChange={(e) => setToolsInput(e.target.value)}
                className="input-swiss"
              />
            </div>
            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Tautan Platform Asli
              </label>
              <input
                type="url"
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                className="input-swiss"
              />
            </div>
            <div className="flex-1">
              <label className="block label-mono text-ink mb-1">
                Hasil / Metrik
              </label>
              <input
                type="text"
                value={metrics}
                onChange={(e) => setMetrics(e.target.value)}
                className="input-swiss"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-rule">
          <div className="label-mono text-xs text-ink-2">
            ID: {item.id}
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
