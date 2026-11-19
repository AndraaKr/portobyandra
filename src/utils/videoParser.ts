export type VideoSourceType = 'direct' | 'youtube' | 'vimeo' | 'gdrive' | 'unknown';

export interface ParsedVideoSource {
  type: VideoSourceType;
  embedUrl?: string;
  originalUrl: string;
  videoId?: string;
}

/**
 * Mendeteksi jenis tautan video (YouTube, Vimeo, Google Drive, atau Direct MP4/WebM)
 * dan mengembalikan URL embed resmi yang siap diputar di web browser.
 */
export function parseVideoSource(rawUrl?: string): ParsedVideoSource {
  if (!rawUrl || !rawUrl.trim()) {
    return { type: 'unknown', originalUrl: '' };
  }

  const url = rawUrl.trim();

  // 1. YouTube (youtube.com, youtu.be, youtube-nocookie.com, shorts)
  // Format yang didukung:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      originalUrl: url,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`,
    };
  }

  // 2. Google Drive
  // Format yang didukung:
  // - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // - https://drive.google.com/file/d/FILE_ID/preview
  // - https://drive.google.com/open?id=FILE_ID
  const gdriveMatch = url.match(
    /(?:drive\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]{25,})/i
  );
  if (gdriveMatch && gdriveMatch[1]) {
    const fileId = gdriveMatch[1];
    return {
      type: 'gdrive',
      videoId: fileId,
      originalUrl: url,
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
    };
  }

  // 3. Vimeo
  // Format: https://vimeo.com/VIDEO_ID
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      videoId,
      originalUrl: url,
      embedUrl: `https://player.vimeo.com/video/${videoId}?dnt=1`,
    };
  }

  // 4. File Video Langsung (MP4, WebM, OGG, atau Supabase Storage Direct Stream)
  return {
    type: 'direct',
    originalUrl: url,
    embedUrl: url,
  };
}
