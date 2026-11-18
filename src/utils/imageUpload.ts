import { supabase } from '../lib/supabaseClient';

export interface ProcessedImageResult {
  dataUrl: string;
  fileName: string;
  sizeKb: number;
  storageType: 'supabase' | 'base64';
}

/**
 * Utilitas untuk membaca, mengompresi gambar dari perangkat lokal, dan mengunggahnya ke Supabase Storage.
 * Dilengkapi fallback otomatis:
 * 1. Coba unggah ke bucket 'portfolio' di Supabase Storage.
 * 2. Jika bucket 'portfolio' belum ada, coba unggah ke bucket 'avatars' (folder portfolio/).
 * 3. Jika keduanya belum tersedia / offline, otomatis fallback ke Data URL (Base64) terkompresi.
 */
export const processLocalImage = (
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.85
): Promise<ProcessedImageResult> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang dipilih harus berupa file gambar (JPG, PNG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar lokal.'));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Gagal memproses gambar.'));

      img.onload = async () => {
        let width = img.width;
        let height = img.height;

        // Resize proporsional jika melebihi batas resolusi
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dataUrl: reader.result as string,
            fileName: file.name,
            sizeKb: Math.round(file.size / 1024),
            storageType: 'base64',
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const ext = mimeType === 'image/png' ? 'png' : 'jpg';
        const base64DataUrl = canvas.toDataURL(mimeType, quality);
        const approxSizeKb = Math.round((base64DataUrl.length * 3) / 4 / 1024);

        // Konversi canvas ke Blob untuk diunggah ke Supabase Storage
        const blob: Blob | null = await new Promise(res => canvas.toBlob(res, mimeType, quality));

        if (blob) {
          const cleanBaseName = file.name
            .replace(/\.[^/.]+$/, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
            .slice(0, 40) || 'image';
          const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${cleanBaseName}.${ext}`;

          const bucketCandidates = [
            { bucket: 'portfolio', path: `items/${uniqueName}` },
            { bucket: 'avatars', path: `portfolio/${uniqueName}` },
          ];

          for (const candidate of bucketCandidates) {
            try {
              const { error: uploadError } = await supabase.storage
                .from(candidate.bucket)
                .upload(candidate.path, blob, {
                  contentType: mimeType,
                  upsert: true,
                  cacheControl: '3600',
                });

              if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                  .from(candidate.bucket)
                  .getPublicUrl(candidate.path);

                if (publicUrlData?.publicUrl) {
                  resolve({
                    dataUrl: publicUrlData.publicUrl,
                    fileName: file.name,
                    sizeKb: Math.round(blob.size / 1024) || approxSizeKb,
                    storageType: 'supabase',
                  });
                  return;
                }
              }
            } catch {
              // Lanjut ke kandidat berikutnya atau fallback ke Base64
            }
          }
        }

        resolve({
          dataUrl: base64DataUrl,
          fileName: file.name,
          sizeKb: approxSizeKb,
          storageType: 'base64',
        });
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
};
