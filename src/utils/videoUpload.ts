import { supabase } from '../lib/supabaseClient';

export interface UploadVideoResult {
  publicUrl: string;
  fileName: string;
  sizeMb: number;
}

/**
 * Mengunggah berkas video (.mp4, .webm) dari perangkat lokal (HP / Laptop)
 * langsung ke Supabase Storage (bucket 'portfolio' atau 'avatars').
 */
export async function uploadLocalVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadVideoResult> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
  if (!isVideo) {
    throw new Error('Berkas harus berupa video berformat MP4, WebM, atau MOV.');
  }

  // Batas free-tier Supabase adalah 50MB per file
  const maxBytes = 50 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(
      `Ukuran video (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas 50MB Supabase Storage. Untuk video resolusi tinggi/panjang, gunakan link YouTube (Unlisted).`
    );
  }

  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 40) || 'video';
  const uniqueName = `video-${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${cleanBaseName}.${ext}`;

  // Coba unggah ke bucket 'portfolio' (folder videos/), fallback ke bucket 'avatars' (folder videos/)
  const bucketCandidates = [
    { bucket: 'portfolio', path: `videos/${uniqueName}` },
    { bucket: 'avatars', path: `videos/${uniqueName}` },
  ];

  let lastError: any = null;

  for (const candidate of bucketCandidates) {
    try {
      if (onProgress) onProgress(20);

      const mimeType = file.type || (ext === 'webm' ? 'video/webm' : 'video/mp4');

      const { error: uploadError } = await supabase.storage
        .from(candidate.bucket)
        .upload(candidate.path, file, {
          contentType: mimeType,
          upsert: true,
          cacheControl: '3600',
        });

      if (!uploadError) {
        if (onProgress) onProgress(90);
        const { data: publicUrlData } = supabase.storage
          .from(candidate.bucket)
          .getPublicUrl(candidate.path);

        if (publicUrlData?.publicUrl) {
          if (onProgress) onProgress(100);
          return {
            publicUrl: publicUrlData.publicUrl,
            fileName: file.name,
            sizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
          };
        }
      } else {
        lastError = uploadError;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw new Error(
    lastError?.message ||
      'Gagal mengunggah video ke Supabase Storage. Pastikan izin bucket storage publik aktif atau gunakan link YouTube/Google Drive.'
  );
}
