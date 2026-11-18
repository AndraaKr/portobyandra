export type Category = 'Desain' | 'Video Editing' | 'UI/UX Desain' | 'Web Development';

export type MediaType = 'video' | 'image';
export type WorkRole = 'editor' | 'colorist' | 'director' | 'designer' | 'motion';
export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin' | 'threads' | 'x' | 'lainnya';

export interface Experience {
  id: string;
  role: string;
  organization: string;
  period: string;
  description: string;
  order: number;
  location?: string;
  skills?: string[];
  createdAt: string;
}

export interface PortfolioItem {
  id: string;
  slug: string;
  title: string;
  category: Category;
  description: string;
  tools: string[];
  imageUrl?: string;
  /** @deprecated tidak dirender */
  gradient?: string;
  projectUrl?: string;
  featured?: boolean;
  metrics?: string;
  createdAt: string;
  mediaType: MediaType;
  videoUrl?: string;
  posterUrl?: string;
  mediaWidth?: number;
  mediaHeight?: number;
  roles: WorkRole[];
  durationSeconds?: number;
  client?: string;
  workYear?: number;
  isShowreel: boolean;
  sortOrder?: number;
  aiAssisted?: boolean;
}

export interface WorkStill {
  id: string;
  title: string;
  timestamp?: string;
  imageUrl: string;
  caption?: string;
}

export interface WorkColorSwatch {
  name: string;
  hex: string;
}

export interface WorkCaseStudy {
  challenge: string;
  approach: string;
  outcome: string;
  palette?: WorkColorSwatch[];
  stills: WorkStill[];
}

export interface MarketingResult {
  id: string;
  slug: string;
  title: string;
  accountName: string;
  platform: Platform;
  organization?: string;
  periodStart: string;
  periodEnd: string;
  metricLabel: string;
  baselineValue: number;
  resultValue: number;
  contentSummary?: string;
  contentCount?: number;
  aiTools: string[];
  evidenceUrl?: string;
  sourceNote: string;
  relatedWorkSlugs: string[];
  published: boolean;
  sortOrder?: number;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  projectType: string;
  createdAt: string;
  read: boolean;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin';
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  year: string;
  url?: string;
  description?: string;
}

export interface SiteProfile {
  avatarUrl: string | null;
  name: string;
  shortName: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  education: string;
  /** Nilai IPK / GPA, contoh "3.78" */
  gpa?: string;
  /** Mata kuliah / fokus studi relevan yang tampil sebagai tag di Tentang Saya */
  coursework?: string[];
  currentRole: string;
  socials: {
    github: string;
    linkedin: string;
    instagram: string;
    youtube: string;
    website: string;
  };
  skills: {
    uiux: string[];
    frontend: string[];
    multimedia: string[];
    marketing: string[];
    aiTools?: string[];
  };
  certificates: Certificate[];
}

export type ActiveTab =
  | 'beranda'
  | 'pengalaman'
  | 'portofolio'
  | 'portofolio-detail'
  | 'sertifikat'
  | 'kontak'
  | 'marketing'
  | 'admin-login'
  | 'admin-dashboard';
