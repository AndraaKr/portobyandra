import type { PortfolioItem, WorkRole } from '../types';

export const PUBLIC_CATEGORIES = ['Video Editing', 'Desain'] as const;

export const ROLE_LABEL: Record<WorkRole, string> = {
  editor: 'Editor',
  colorist: 'Colorist',
  director: 'Director',
  designer: 'Designer',
  motion: 'Motion',
};

export type Orientation = 'landscape' | 'square' | 'portrait';

export interface Work extends PortfolioItem {
  posterUrl?: string;
  mediaWidth: number;
  mediaHeight: number;
  orientation: Orientation;
  incomplete: string[]; // nama field wajib yang belum terisi, untuk penanda di admin
}

export const orientationOf = (w: number, h: number): Orientation => {
  const r = w / h;
  return r > 1.25 ? 'landscape' : r < 0.8 ? 'portrait' : 'square';
};

export function normalizeWork(i: PortfolioItem): Work {
  const isVideoCat = i.category === 'Video Editing';
  const posterUrl = i.posterUrl ?? i.imageUrl; // baris lama: image_url dianggap poster
  const mediaWidth = i.mediaWidth ?? (isVideoCat ? 1920 : 1600);
  const mediaHeight = i.mediaHeight ?? (isVideoCat ? 1080 : 1200);
  const incomplete: string[] = [];
  if (!posterUrl) incomplete.push('poster');
  if (!i.mediaWidth || !i.mediaHeight) incomplete.push('dimensi');
  if (!i.roles?.length) incomplete.push('peran');
  if (!i.client) incomplete.push('klien');
  if (!i.workYear) incomplete.push('tahun');
  if (i.mediaType === 'video') {
    if (!i.videoUrl) incomplete.push('video');
    if (i.durationSeconds == null) incomplete.push('durasi');
  }
  return { ...i, posterUrl, mediaWidth, mediaHeight, orientation: orientationOf(mediaWidth, mediaHeight), incomplete };
}

export const isPublicWork = (i: PortfolioItem) =>
  !i.isShowreel && (PUBLIC_CATEGORIES as readonly string[]).includes(i.category);

export const sortWorks = (a: PortfolioItem, b: PortfolioItem) =>
  (a.sortOrder ?? Infinity) - (b.sortOrder ?? Infinity) ||
  (b.workYear ?? 0) - (a.workYear ?? 0) ||
  b.createdAt.localeCompare(a.createdAt);

export const formatDuration = (s?: number) => {
  if (s == null) return '—';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(sec).padStart(2, '0');
  return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export const formatRoles = (r: WorkRole[]) => (r?.length ? r.map((x) => ROLE_LABEL[x]).join(' / ') : '—');
