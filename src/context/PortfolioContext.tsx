import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  Experience,
  PortfolioItem,
  MarketingResult,
  ContactMessage,
  ActiveTab,
  AdminUser,
  EducationItem,
  SkillCategory,
  SiteProfile,
} from '../types';
import { supabase } from '../lib/supabaseClient';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface PortfolioContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeWorkSlug: string | null;
  setActiveWorkSlug: (slug: string | null) => void;
  openWork: (slug: string) => void;

  // Loading flags — dipakai untuk tampilkan skeleton/spinner saat data pertama kali diambil
  isLoadingData: boolean;
  isAuthLoading: boolean;

  // Experience CRUD
  experiences: Experience[];
  addExperience: (item: Omit<Experience, 'id' | 'createdAt'>) => Promise<boolean>;
  updateExperience: (id: string, item: Partial<Experience>) => Promise<boolean>;
  deleteExperience: (id: string) => Promise<void>;

  // Portfolio CRUD
  portfolioItems: PortfolioItem[];
  addPortfolioItem: (item: Omit<PortfolioItem, 'id' | 'createdAt'>) => Promise<boolean>;
  updatePortfolioItem: (id: string, item: Partial<PortfolioItem>) => Promise<boolean>;
  deletePortfolioItem: (id: string) => Promise<void>;

  // Marketing Results CRUD
  marketingResults: MarketingResult[];
  addMarketingResult: (item: Omit<MarketingResult, 'id' | 'createdAt'>) => Promise<boolean>;
  updateMarketingResult: (id: string, item: Partial<MarketingResult>) => Promise<boolean>;
  deleteMarketingResult: (id: string) => Promise<void>;
  getMarketingResultForWork: (work: { slug: string; id?: string; title?: string; client?: string }) => MarketingResult | undefined;

  // Portfolio Filters & Selection
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Contact messages
  messages: ContactMessage[];
  addMessage: (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>) => Promise<boolean>;
  markMessageRead: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;

  // Admin Auth (Supabase Auth asli)
  currentUser: AdminUser | null;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  updateAdminEmail: (newEmail: string) => Promise<{ success: boolean; error?: string }>;
  updateAdminPassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;

  // True kalau admin masuk lewat link "reset password" dari email Supabase
  isRecoverySession: boolean;

  // Foto profil (tampil publik di Beranda/Tentang)
  avatarUrl: string | null;
  uploadAvatar: (file: File) => Promise<{ success: boolean; error?: string }>;

  // Profil situs lengkap (bio, kontak, skill, sertifikat) — diedit dari Dashboard Admin
  siteProfile: SiteProfile | null;
  updateSiteProfile: (updates: Partial<SiteProfile>) => Promise<{ success: boolean; error?: string }>;

  // Notifications
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;

  // Data management
  refetchAllData: () => Promise<void>;
  exportDataJson: () => void;
  importDataJson: (jsonData: string) => Promise<boolean>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

// ============================================================
// Mapper: baris Supabase (snake_case) <-> tipe aplikasi (camelCase)
// ============================================================
const mapPortfolioFromDb = (row: any): PortfolioItem => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  category: row.category,
  description: row.description,
  tools: row.tools ?? [],
  imageUrl: row.image_url ?? undefined,
  gradient: row.gradient ?? undefined,
  projectUrl: row.project_url ?? undefined,
  featured: row.featured ?? false,
  metrics: row.metrics ?? undefined,
  createdAt: row.created_at,
  mediaType: row.media_type ?? 'image',
  videoUrl: row.video_url ?? undefined,
  posterUrl: row.poster_url ?? undefined,
  mediaWidth: row.media_width ?? undefined,
  mediaHeight: row.media_height ?? undefined,
  roles: row.roles ?? [],
  durationSeconds: row.duration_seconds ?? undefined,
  client: row.client ?? undefined,
  workYear: row.work_year ?? undefined,
  isShowreel: row.is_showreel ?? false,
  sortOrder: row.sort_order ?? undefined,
  aiAssisted: row.ai_assisted ?? false,
});

const mapPortfolioToDb = (item: Partial<PortfolioItem>) => ({
  ...(item.slug !== undefined && { slug: item.slug }),
  ...(item.title !== undefined && { title: item.title }),
  ...(item.category !== undefined && { category: item.category }),
  ...(item.description !== undefined && { description: item.description }),
  ...(item.tools !== undefined && { tools: item.tools }),
  ...(item.imageUrl !== undefined && { image_url: item.imageUrl }),
  ...(item.gradient !== undefined && { gradient: item.gradient }),
  ...(item.projectUrl !== undefined && { project_url: item.projectUrl }),
  ...(item.featured !== undefined && { featured: item.featured }),
  ...(item.metrics !== undefined && { metrics: item.metrics }),
  ...(item.mediaType !== undefined && { media_type: item.mediaType }),
  ...(item.videoUrl !== undefined && { video_url: item.videoUrl }),
  ...(item.posterUrl !== undefined && { poster_url: item.posterUrl }),
  ...(item.mediaWidth !== undefined && { media_width: item.mediaWidth }),
  ...(item.mediaHeight !== undefined && { media_height: item.mediaHeight }),
  ...(item.roles !== undefined && { roles: item.roles }),
  ...(item.durationSeconds !== undefined && { duration_seconds: item.durationSeconds }),
  ...(item.client !== undefined && { client: item.client }),
  ...(item.workYear !== undefined && { work_year: item.workYear }),
  ...(item.isShowreel !== undefined && { is_showreel: item.isShowreel }),
  ...(item.sortOrder !== undefined && { sort_order: item.sortOrder }),
  ...(item.aiAssisted !== undefined && { ai_assisted: item.aiAssisted }),
});

const mapMarketingFromDb = (row: any): MarketingResult => ({
  id: row.id,
  slug: row.slug,
  title: row.title,
  accountName: row.account_name,
  platform: row.platform,
  organization: row.organization ?? undefined,
  periodStart: row.period_start,
  periodEnd: row.period_end,
  metricLabel: row.metric_label ?? 'Views',
  baselineValue: Number(row.baseline_value ?? 0),
  resultValue: Number(row.result_value ?? 0),
  contentSummary: row.content_summary ?? undefined,
  contentCount: row.content_count !== null && row.content_count !== undefined ? Number(row.content_count) : undefined,
  aiTools: row.ai_tools ?? [],
  evidenceUrl: row.evidence_url ?? undefined,
  sourceNote: row.source_note ?? '',
  relatedWorkSlugs: row.related_work_slugs ?? [],
  published: row.published ?? false,
  sortOrder: row.sort_order !== null && row.sort_order !== undefined ? Number(row.sort_order) : undefined,
  createdAt: row.created_at,
});

const mapMarketingToDb = (item: Partial<MarketingResult>) => ({
  ...(item.slug !== undefined && { slug: item.slug }),
  ...(item.title !== undefined && { title: item.title }),
  ...(item.accountName !== undefined && { account_name: item.accountName }),
  ...(item.platform !== undefined && { platform: item.platform }),
  ...(item.organization !== undefined && { organization: item.organization }),
  ...(item.periodStart !== undefined && { period_start: item.periodStart }),
  ...(item.periodEnd !== undefined && { period_end: item.periodEnd }),
  ...(item.metricLabel !== undefined && { metric_label: item.metricLabel }),
  ...(item.baselineValue !== undefined && { baseline_value: item.baselineValue }),
  ...(item.resultValue !== undefined && { result_value: item.resultValue }),
  ...(item.contentSummary !== undefined && { content_summary: item.contentSummary }),
  ...(item.contentCount !== undefined && { content_count: item.contentCount }),
  ...(item.aiTools !== undefined && { ai_tools: item.aiTools }),
  ...(item.evidenceUrl !== undefined && { evidence_url: item.evidenceUrl }),
  ...(item.sourceNote !== undefined && { source_note: item.sourceNote }),
  ...(item.relatedWorkSlugs !== undefined && { related_work_slugs: item.relatedWorkSlugs }),
  ...(item.published !== undefined && { published: item.published }),
  ...(item.sortOrder !== undefined && { sort_order: item.sortOrder }),
});

const mapExperienceFromDb = (row: any): Experience => ({
  id: row.id,
  role: row.role,
  organization: row.organization,
  period: row.period,
  description: row.description,
  order: row.order ?? 0,
  location: row.location ?? undefined,
  skills: row.skills ?? [],
  createdAt: row.created_at,
});

const mapExperienceToDb = (item: Partial<Experience>) => ({
  ...(item.role !== undefined && { role: item.role }),
  ...(item.organization !== undefined && { organization: item.organization }),
  ...(item.period !== undefined && { period: item.period }),
  ...(item.description !== undefined && { description: item.description }),
  ...(item.order !== undefined && { order: item.order }),
  ...(item.location !== undefined && { location: item.location }),
  ...(item.skills !== undefined && { skills: item.skills }),
});

const mapMessageFromDb = (row: any): ContactMessage => ({
  id: row.id,
  name: row.name,
  email: row.email,
  subject: row.subject,
  message: row.message,
  projectType: row.project_type ?? '',
  createdAt: row.created_at,
  read: row.read ?? false,
});

const mapMessageToDb = (item: Partial<ContactMessage>) => ({
  ...(item.name !== undefined && { name: item.name }),
  ...(item.email !== undefined && { email: item.email }),
  ...(item.subject !== undefined && { subject: item.subject }),
  ...(item.message !== undefined && { message: item.message }),
  ...(item.projectType !== undefined && { project_type: item.projectType }),
  ...(item.read !== undefined && { read: item.read }),
});

const DEFAULT_SITE_PROFILE: SiteProfile = {
  avatarUrl: null,
  name: '',
  shortName: '',
  title: '',
  tagline: '',
  bio: '',
  email: '',
  phone: '',
  location: '',
  education: 'D4 Teknik Informatika — Politeknik Negeri Jember (PSDKU Sidoarjo)',
  educationPeriod: '2021 – 2025',
  educations: [
    {
      id: 'edu-1',
      institution: 'Politeknik Negeri Jember (PSDKU Sidoarjo)',
      degree: 'D4 Teknik Informatika',
      period: '2021 – 2025',
      location: 'Sidoarjo, Jawa Timur',
      gpa: '3.79',
      activities: 'Fokus: Rekayasa Perangkat Lunak, Multimedia & Pengembangan Sistem Informasi',
    },
  ],
  gpa: '3.79',
  coursework: [],
  availabilityStatus: 'OPEN TO WORK',
  currentRole: '',
  socials: { github: '', linkedin: '', instagram: '', youtube: '', website: '' },
  skills: { uiux: [], frontend: [], multimedia: [], marketing: [] },
  skillCategories: [
    {
      id: 'cat-multimedia',
      name: 'Video Editing & Multimedia',
      skills: ['Adobe Premiere Pro', 'After Effects', 'CapCut Pro', 'DaVinci Resolve', 'Storyboarding', 'Color Grading'],
    },
    {
      id: 'cat-marketing',
      name: 'Digital Marketing & Konten AI',
      skills: ['TikTok & Reels Growth', 'Meta Ads', 'SEO Content Strategy', 'Copywriting', 'Content Calendar'],
    },
    {
      id: 'cat-uiux',
      name: 'UI/UX & Product Design',
      skills: ['Figma', 'Wireframing', 'Prototyping', 'Design System', 'User Flow'],
    },
    {
      id: 'cat-ai',
      name: 'Tool AI & Generatif',
      skills: ['ChatGPT & Claude', 'Midjourney', 'ElevenLabs', 'Runway Gen-2'],
    },
  ],
  certificates: [],
};

const mapSiteProfileFromDb = (row: any): SiteProfile => {
  const rawEducations = Array.isArray(row.skills?.educations)
    ? row.skills.educations
    : Array.isArray(row.educations)
      ? row.educations
      : [];

  const educations: EducationItem[] = rawEducations.length > 0
    ? rawEducations
    : [
        {
          id: 'edu-init-1',
          institution: row.education && row.education.includes('—')
            ? row.education.split('—')[1]?.trim()
            : (row.education || 'Politeknik Negeri Jember (PSDKU Sidoarjo)'),
          degree: row.education && row.education.includes('—')
            ? row.education.split('—')[0]?.trim()
            : 'D4 Teknik Informatika',
          period: row.education_period ?? row.skills?.educationPeriod ?? '2021 – 2025',
          location: row.location || 'Sidoarjo, Jawa Timur',
          gpa: row.gpa ?? row.skills?.gpa ?? '3.79',
          activities: 'Fokus: Rekayasa Perangkat Lunak, Multimedia & Pengembangan Sistem Informasi',
        },
      ];

  return {
    avatarUrl: row.avatar_url ?? null,
    name: row.name ?? '',
    shortName: row.short_name ?? '',
    title: row.title ?? '',
    tagline: row.tagline ?? '',
    bio: row.bio ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    location: row.location ?? '',
    education: row.education ?? '',
    educationPeriod: row.education_period ?? row.skills?.educationPeriod ?? '',
    educations,
    // GPA & mata kuliah relevan disimpan di dalam kolom JSON skills agar tidak perlu migrasi kolom baru
    gpa: row.gpa ?? row.skills?.gpa ?? '',
    coursework: Array.isArray(row.coursework)
      ? row.coursework
      : Array.isArray(row.skills?.coursework)
        ? row.skills.coursework
        : [],
    // GPA, coursework, dan currentRole cadangan jika kolom tabel belum ada
    availabilityStatus: row.availability_status ?? row.skills?.availabilityStatus ?? 'OPEN TO WORK',
    currentRole: row.current_role_label ?? row.skills?.currentRole ?? row.skills?.current_role ?? '',
    socials: {
      github: row.github_url ?? '',
      linkedin: row.linkedin_url ?? '',
      instagram: row.instagram_url ?? '',
      youtube: row.youtube_url ?? '',
      website: row.website_url ?? '',
    },
    skills: {
      uiux: row.skills?.uiux ?? [],
      frontend: row.skills?.frontend ?? [],
      multimedia: row.skills?.multimedia ?? [],
      marketing: row.skills?.marketing ?? [],
      aiTools: row.skills?.aiTools ?? row.skills?.ai_tools ?? ['ChatGPT & Claude', 'Midjourney', 'ElevenLabs', 'Runway Gen-2'],
    },
    skillCategories: (() => {
      const rawCats = Array.isArray(row.skills?.skillCategories)
        ? row.skills.skillCategories
        : Array.isArray(row.skills?.categories)
          ? row.skills.categories
          : [];
      if (rawCats.length > 0) return rawCats;
      return [
        {
          id: 'cat-multimedia',
          name: 'Video Editing & Multimedia',
          skills: row.skills?.multimedia ?? ['Adobe Premiere Pro', 'After Effects', 'CapCut Pro', 'DaVinci Resolve', 'Storyboarding', 'Color Grading'],
        },
        {
          id: 'cat-marketing',
          name: 'Digital Marketing & Konten AI',
          skills: row.skills?.marketing ?? ['TikTok & Reels Growth', 'Meta Ads', 'SEO Content Strategy', 'Copywriting', 'Content Calendar'],
        },
        {
          id: 'cat-uiux',
          name: 'UI/UX & Product Design',
          skills: row.skills?.uiux ?? ['Figma', 'Wireframing', 'Prototyping', 'Design System', 'User Flow'],
        },
        {
          id: 'cat-ai',
          name: 'Tool AI & Generatif',
          skills: row.skills?.aiTools ?? row.skills?.ai_tools ?? ['ChatGPT & Claude', 'Midjourney', 'ElevenLabs', 'Runway Gen-2'],
        },
      ];
    })(),
    certificates: Array.isArray(row.certificates) ? row.certificates : [],
  };
};

const mapSiteProfileToDb = (updates: Partial<SiteProfile>) => {
  const row: Record<string, any> = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.shortName !== undefined) row.short_name = updates.shortName;
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.tagline !== undefined) row.tagline = updates.tagline;
  if (updates.bio !== undefined) row.bio = updates.bio;
  if (updates.email !== undefined) row.email = updates.email;
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.location !== undefined) row.location = updates.location;
  if (updates.education !== undefined) row.education = updates.education;
  if (updates.currentRole !== undefined) row.current_role_label = updates.currentRole;
  if (updates.socials?.github !== undefined) row.github_url = updates.socials.github;
  if (updates.socials?.linkedin !== undefined) row.linkedin_url = updates.socials.linkedin;
  if (updates.socials?.instagram !== undefined) row.instagram_url = updates.socials.instagram;
  if (updates.socials?.youtube !== undefined) row.youtube_url = updates.socials.youtube;
  if (updates.socials?.website !== undefined) row.website_url = updates.socials.website;
  if (updates.certificates !== undefined) row.certificates = updates.certificates;

  // Bangun payload skills dengan menggabungkan field ekstensi agar tidak tertimpa
  const skillsPayload: Record<string, any> = updates.skills ? { ...updates.skills } : {};
  if (updates.availabilityStatus !== undefined) {
    skillsPayload.availabilityStatus = updates.availabilityStatus;
  }
  if (updates.currentRole !== undefined) {
    skillsPayload.currentRole = updates.currentRole;
  }
  if (updates.gpa !== undefined) {
    skillsPayload.gpa = updates.gpa;
  }
  if (updates.coursework !== undefined) {
    skillsPayload.coursework = updates.coursework;
  }
  if (updates.educationPeriod !== undefined) {
    skillsPayload.educationPeriod = updates.educationPeriod;
  }
  if (updates.skillCategories !== undefined) {
    skillsPayload.skillCategories = updates.skillCategories;
    // Sinkronkan ke field legacy
    updates.skillCategories.forEach(cat => {
      const lower = cat.name.toLowerCase();
      if (lower.includes('multimedia') || lower.includes('video')) {
        skillsPayload.multimedia = cat.skills;
      } else if (lower.includes('marketing')) {
        skillsPayload.marketing = cat.skills;
      } else if (lower.includes('ui/ux') || lower.includes('design')) {
        skillsPayload.uiux = cat.skills;
      } else if (lower.includes('ai') || lower.includes('generatif')) {
        skillsPayload.aiTools = cat.skills;
      }
    });
  }
  if (updates.educations !== undefined) {
    skillsPayload.educations = updates.educations;
    if (updates.educations.length > 0) {
      const topEdu = updates.educations[0];
      row.education = topEdu.degree ? `${topEdu.degree} — ${topEdu.institution}` : topEdu.institution;
      skillsPayload.educationPeriod = topEdu.period || '2021 – 2025';
      if (topEdu.gpa) {
        skillsPayload.gpa = topEdu.gpa;
      }
    }
  }

  if (Object.keys(skillsPayload).length > 0) {
    row.skills = skillsPayload;
  }

  return row;
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation tab — ditentukan dari URL saat pertama kali dimuat (penting untuk refresh/deep-link)
  const resolveInitialTab = (): ActiveTab => {
    if (typeof window === 'undefined') return 'beranda';
    const pathname = window.location.pathname.toLowerCase().replace(/\/+$/, '');
    const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '');

    if (rawHash.startsWith('portofolio/')) return 'portofolio-detail';

    // Rute admin rahasia: HANYA /gwadmin atau #gwadmin
    const isAdminRoute =
      pathname === '/gwadmin' ||
      pathname.endsWith('/gwadmin') ||
      rawHash === 'gwadmin';
    // Status login belum diketahui di titik ini (Supabase masih memeriksa sesi),
    // jadi mulai dari 'admin-login' sebagai tebakan aman — App.tsx akan mengoreksi
    // ke 'admin-dashboard' begitu sesi selesai diperiksa, kalau ternyata sudah login.
    if (isAdminRoute) return 'admin-login';

    const validTabs: ActiveTab[] = [
      'beranda',
      'pengalaman',
      'portofolio',
      'sertifikat',
      'kontak',
      'marketing',
    ];
    if (validTabs.includes(rawHash as ActiveTab)) return rawHash as ActiveTab;
    for (const tab of validTabs) {
      if (pathname.endsWith(`/${tab}`)) return tab;
    }
    return 'beranda';
  };

  const [activeTab, setActiveTabState] = useState<ActiveTab>(resolveInitialTab);
  const [activeWorkSlug, setActiveWorkSlug] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const rawHash = window.location.hash.toLowerCase().replace(/^#\/?/, '').replace(/\/+$/, '');
    if (rawHash.startsWith('portofolio/')) {
      return rawHash.replace(/^portofolio\//, '');
    }
    return null;
  });

  const openWork = useCallback((slug: string) => {
    setActiveWorkSlug(slug);
    setActiveTabState('portofolio-detail');
    window.location.hash = `portofolio/${slug}`;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Data state — sekarang sumber datanya Supabase, bukan localStorage
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [marketingResults, setMarketingResults] = useState<MarketingResult[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [siteProfile, setSiteProfile] = useState<SiteProfile | null>(null);

  // Auth state — dikelola oleh Supabase Auth, bukan localStorage manual
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isRecoverySession, setIsRecoverySession] = useState(false);

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('Desain');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // ============================================================
  // Ambil data awal dari Supabase (dipanggil saat mount & bisa dipanggil ulang manual)
  // ============================================================
  const fetchPortfolio = useCallback(async () => {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Gagal mengambil data portofolio:', error);
      showToast('Gagal memuat data portofolio dari server.', 'error');
      return;
    }
    setPortfolioItems((data ?? []).map(mapPortfolioFromDb));
  }, [showToast]);

  const fetchExperiences = useCallback(async () => {
    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .order('order', { ascending: true });
    if (error) {
      console.error('Gagal mengambil data pengalaman:', error);
      showToast('Gagal memuat data pengalaman dari server.', 'error');
      return;
    }
    setExperiences((data ?? []).map(mapExperienceFromDb));
  }, [showToast]);

  const fetchMarketing = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('marketing_results')
        .select('*')
        .order('sort_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('Belum bisa mengambil data marketing (tabel belum siap):', error.message);
        setMarketingResults([]);
        return;
      }
      setMarketingResults((data ?? []).map(mapMarketingFromDb));
    } catch (err) {
      console.warn('Error saat fetch marketing:', err);
      setMarketingResults([]);
    }
  }, []);

  // Pesan hanya bisa dibaca kalau sedang login (sesuai RLS policy) — publik tidak akan dapat data ini.
  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      // Untuk pengunjung publik (belum login), ini WAJAR gagal karena RLS memblokir SELECT.
      // Jadi kita diamkan saja errornya di sini, bukan tampilkan sebagai kegagalan.
      setMessages([]);
      return;
    }
    setMessages((data ?? []).map(mapMessageFromDb));
  }, []);

  // Profil situs — data publik, boleh diambil siapapun (RLS: select untuk anon & authenticated)
  const fetchSiteProfile = useCallback(async () => {
    const { data, error } = await supabase
      .from('site_profile')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) {
      // Wajar gagal kalau tabel/baris belum dibuat (skrip SQL belum dijalankan) — jangan ribut ke user.
      console.warn('Belum bisa mengambil profil situs:', error.message);
      setSiteProfile(DEFAULT_SITE_PROFILE);
      return;
    }
    setSiteProfile(mapSiteProfileFromDb(data));
  }, []);

  const refetchAllData = useCallback(async () => {
    setIsLoadingData(true);
    if (import.meta.env.DEV && import.meta.env.VITE_USE_FIXTURES === 'true') {
      try {
        const fixtures = await import('../dev/fixtures');
        setPortfolioItems(fixtures.FIXTURE_PORTFOLIO_ITEMS);
        setExperiences(fixtures.FIXTURE_EXPERIENCES);
        setMarketingResults(fixtures.FIXTURE_MARKETING_RESULTS);
        setSiteProfile(fixtures.FIXTURE_SITE_PROFILE);
        setIsLoadingData(false);
        return;
      } catch (e) {
        console.warn('Gagal memuat fixtures dev:', e);
      }
    }
    await Promise.all([fetchPortfolio(), fetchExperiences(), fetchMarketing(), fetchMessages(), fetchSiteProfile()]);
    setIsLoadingData(false);
  }, [fetchPortfolio, fetchExperiences, fetchMarketing, fetchMessages, fetchSiteProfile]);

  // Ambil data publik (portfolio + experiences + marketing + foto profil) saat pertama kali load
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      setIsLoadingData(true);
      if (import.meta.env.DEV && import.meta.env.VITE_USE_FIXTURES === 'true') {
        try {
          const fixtures = await import('../dev/fixtures');
          if (!isCancelled) {
            setPortfolioItems(fixtures.FIXTURE_PORTFOLIO_ITEMS);
            setExperiences(fixtures.FIXTURE_EXPERIENCES);
            setMarketingResults(fixtures.FIXTURE_MARKETING_RESULTS);
            setSiteProfile(fixtures.FIXTURE_SITE_PROFILE);
            setIsLoadingData(false);
          }
          return;
        } catch (e) {
          console.warn('Gagal memuat fixtures dev:', e);
        }
      }
      await Promise.all([fetchPortfolio(), fetchExperiences(), fetchMarketing(), fetchSiteProfile()]);
      if (!isCancelled) {
        setIsLoadingData(false);
      }
    })();
    return () => {
      isCancelled = true;
    };
  }, [fetchPortfolio, fetchExperiences, fetchMarketing, fetchSiteProfile]);

  // ============================================================
  // Auth: dengarkan sesi Supabase (login manual, refresh token, dsb)
  // ============================================================
  const sessionToAdminUser = (session: Session | null): AdminUser | null => {
    if (!session?.user?.email) return null;
    return {
      email: session.user.email,
      name: 'Muhammad Andra Kusuma Ramadhan',
      role: 'admin',
    };
  };

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      const nextUser = sessionToAdminUser(session);
      setCurrentUser(prev => (prev?.email === nextUser?.email ? prev : nextUser));
      setIsAuthLoading(false);
      // Kalau sudah login sejak awal, langsung tarik data pesan (butuh sesi admin)
      if (session) {
        fetchMessages();
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = sessionToAdminUser(session);
      setCurrentUser(prev => (prev?.email === nextUser?.email ? prev : nextUser));
      // Admin klik link "reset password" dari email: arahkan ke dashboard (tab Akun)
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoverySession(true);
        setActiveTabState('admin-dashboard');
      }
      if (session) {
        fetchMessages();
      } else {
        setMessages([]);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // Helper untuk membuat slug unik agar tidak bentrok dengan unique constraint di Supabase
  const makeUniqueSlug = (rawSlug: string | undefined, title: string, excludeId?: string): string => {
    const base = (rawSlug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `karya-${Date.now().toString(36)}`;

    const isTaken = portfolioItems.some(
      item => item.slug === base && item.id !== excludeId
    );
    if (!isTaken) return base;
    return `${base}-${Date.now().toString(36).slice(-4)}`;
  };

  // ============================================================
  // Experiences CRUD — kirim ke Supabase, lalu sinkronkan state lokal dari hasil server
  // ============================================================
  const addExperience = async (item: Omit<Experience, 'id' | 'createdAt'>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('experiences')
      .insert(mapExperienceToDb(item))
      .select()
      .single();

    if (error || !data) {
      console.error('Gagal menambah pengalaman:', error);
      showToast('Gagal menyimpan pengalaman ke server.', 'error');
      return false;
    }
    setExperiences(prev =>
      [...prev, mapExperienceFromDb(data)].sort((a, b) => (a.order || 0) - (b.order || 0))
    );
    showToast('Pengalaman kerja berhasil ditambahkan!');
    return true;
  };

  const updateExperience = async (id: string, updated: Partial<Experience>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('experiences')
      .update(mapExperienceToDb(updated))
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Gagal memperbarui pengalaman:', error);
      showToast('Gagal menyimpan perubahan ke server.', 'error');
      return false;
    }
    setExperiences(prev =>
      prev
        .map(exp => (exp.id === id ? mapExperienceFromDb(data) : exp))
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    );
    showToast('Data pengalaman berhasil diperbarui!');
    return true;
  };

  const deleteExperience = async (id: string) => {
    const { error } = await supabase.from('experiences').delete().eq('id', id);
    if (error) {
      console.error('Gagal menghapus pengalaman:', error);
      showToast('Gagal menghapus data di server.', 'error');
      return;
    }
    setExperiences(prev => prev.filter(exp => exp.id !== id));
    showToast('Pengalaman kerja telah dihapus.', 'info');
  };

  // ============================================================
  // Portfolio CRUD
  // ============================================================
  const addPortfolioItem = async (item: Omit<PortfolioItem, 'id' | 'createdAt'>): Promise<boolean> => {
    const slug = makeUniqueSlug(item.slug, item.title);

    const { data, error } = await supabase
      .from('portfolio_items')
      .insert(mapPortfolioToDb({ ...item, slug }))
      .select()
      .single();

    if (error || !data) {
      console.error('Gagal menambah portofolio:', error);
      showToast('Gagal menyimpan karya ke server.', 'error');
      return false;
    }
    setPortfolioItems(prev => [mapPortfolioFromDb(data), ...prev]);
    showToast('Karya portofolio berhasil ditambahkan!');
    return true;
  };

  const updatePortfolioItem = async (id: string, updated: Partial<PortfolioItem>): Promise<boolean> => {
    const payload: Partial<PortfolioItem> = { ...updated };
    if (payload.slug !== undefined || payload.title !== undefined) {
      payload.slug = makeUniqueSlug(payload.slug, payload.title || 'karya', id);
    }

    const { data, error } = await supabase
      .from('portfolio_items')
      .update(mapPortfolioToDb(payload))
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Gagal memperbarui portofolio:', error);
      showToast('Gagal menyimpan perubahan ke server.', 'error');
      return false;
    }
    setPortfolioItems(prev => prev.map(item => (item.id === id ? mapPortfolioFromDb(data) : item)));
    showToast('Karya portofolio berhasil diperbarui!');
    return true;
  };

  const deletePortfolioItem = async (id: string) => {
    const { error } = await supabase.from('portfolio_items').delete().eq('id', id);
    if (error) {
      console.error('Gagal menghapus portofolio:', error);
      showToast('Gagal menghapus data di server.', 'error');
      return;
    }
    setPortfolioItems(prev => prev.filter(item => item.id !== id));
    showToast('Karya portofolio telah dihapus.', 'info');
  };

  // ============================================================
  // Marketing Results CRUD
  // ============================================================
  const addMarketingResult = async (item: Omit<MarketingResult, 'id' | 'createdAt'>): Promise<boolean> => {
    const slug = (item.slug || item.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') || `mkt-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from('marketing_results')
      .insert(mapMarketingToDb({ ...item, slug }))
      .select()
      .single();

    if (error || !data) {
      console.error('Gagal menambah hasil marketing:', error);
      showToast('Gagal menyimpan hasil marketing ke server.', 'error');
      return false;
    }
    setMarketingResults(prev => [mapMarketingFromDb(data), ...prev]);
    showToast('Hasil marketing berhasil ditambahkan!');
    return true;
  };

  const updateMarketingResult = async (id: string, updated: Partial<MarketingResult>): Promise<boolean> => {
    const { data, error } = await supabase
      .from('marketing_results')
      .update(mapMarketingToDb(updated))
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Gagal memperbarui hasil marketing:', error);
      showToast('Gagal menyimpan perubahan ke server.', 'error');
      return false;
    }
    setMarketingResults(prev => prev.map(item => (item.id === id ? mapMarketingFromDb(data) : item)));
    showToast('Hasil marketing berhasil diperbarui!');
    return true;
  };

  const deleteMarketingResult = async (id: string) => {
    const { error } = await supabase.from('marketing_results').delete().eq('id', id);
    if (error) {
      console.error('Gagal menghapus hasil marketing:', error);
      showToast('Gagal menghapus hasil marketing di server.', 'error');
      return;
    }
    setMarketingResults(prev => prev.filter(item => item.id !== id));
    showToast('Hasil marketing telah dihapus.', 'info');
  };

  const getMarketingResultForWork = (work: { slug: string; id?: string; title?: string; client?: string }): MarketingResult | undefined => {
    if (!work || !work.slug) return undefined;
    const workSlug = work.slug.toLowerCase();
    const workTitle = work.title?.toLowerCase() || '';
    const workClient = (work.client || '').toLowerCase();

    return marketingResults.find((m) => {
      if (!m.published) return false;
      const slugs = (m.relatedWorkSlugs || []).map((s) => s.toLowerCase());
      if (slugs.includes(workSlug)) return true;
      if (work.id && slugs.includes(work.id.toLowerCase())) return true;
      if (m.slug && m.slug.toLowerCase() === workSlug) return true;

      // Pencocokan relasi karya: bila slug mengacu pada edukasi 3D / Reja Aton
      if (
        (workSlug === 'edu-3' || workSlug === 'edukasi-3d' || workSlug.startsWith('edu')) &&
        (m.slug === 'kampanye-edukasi-energi-bersih' || slugs.includes('reja-aton-brand-film') || slugs.includes('edukasi-3d') || slugs.includes('edu-3'))
      ) {
        return true;
      }

      // Cocokkan bila judul atau slug saling beririsan
      if (workTitle && m.title) {
        const mTitleLower = m.title.toLowerCase();
        if (mTitleLower.includes(workTitle) || workTitle.includes(mTitleLower)) {
          return true;
        }
        // Irisan kata kunci signifikan (mis. "edukasi")
        const workWords = workTitle.split(/[^a-z0-9]+/).filter((w) => w.length >= 4);
        const hasKeywordMatch = workWords.some((w) => mTitleLower.includes(w) || (m.contentSummary || '').toLowerCase().includes(w));
        if (hasKeywordMatch && (workClient.includes('reja') || (m.organization || '').toLowerCase().includes('reja') || workWords.includes('edukasi'))) {
          return true;
        }
      }

      return false;
    });
  };

  // ============================================================
  // Contact Messages
  // Insert diizinkan untuk publik (anon) sesuai RLS policy, select/update/delete hanya admin.
  // ============================================================
  const addMessage = async (msg: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): Promise<boolean> => {
    const { error } = await supabase.from('messages').insert(mapMessageToDb({ ...msg, read: false }));
    if (error) {
      console.error('Gagal mengirim pesan:', error);
      showToast('Gagal mengirim pesan. Coba lagi beberapa saat.', 'error');
      return false;
    }
    showToast('Pesan Anda berhasil dikirim! Terima kasih telah menghubungi.', 'success');
    return true;
  };

  const markMessageRead = async (id: string) => {
    const { error } = await supabase.from('messages').update({ read: true }).eq('id', id);
    if (error) {
      console.error('Gagal menandai pesan:', error);
      showToast('Gagal memperbarui status pesan.', 'error');
      return;
    }
    setMessages(prev => prev.map(msg => (msg.id === id ? { ...msg, read: true } : msg)));
  };

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) {
      console.error('Gagal menghapus pesan:', error);
      showToast('Gagal menghapus pesan di server.', 'error');
      return;
    }
    setMessages(prev => prev.filter(msg => msg.id !== id));
    showToast('Pesan telah dihapus.', 'info');
  };

  // ============================================================
  // Admin Auth — Supabase Auth asli, bukan kredensial hardcoded
  // ============================================================
  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error || !data.session) {
      return { success: false, error: 'Email atau kata sandi salah.' };
    }

    showToast('Selamat datang kembali!');
    return { success: true };
  };

  const logoutAdmin = async () => {
    await supabase.auth.signOut();
    showToast('Anda telah keluar dari mode admin.', 'info');
    setActiveTab('beranda');
  };

  const updateAdminEmail = async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      console.error('Gagal mengubah email:', error);
      return { success: false, error: error.message || 'Gagal mengubah email.' };
    }
    showToast('Cek inbox email baru & lama untuk konfirmasi perubahan email.', 'info');
    return { success: true };
  };

  const updateAdminPassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (newPassword.length < 8) {
      return { success: false, error: 'Kata sandi minimal 8 karakter.' };
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error('Gagal mengubah password:', error);
      return { success: false, error: error.message || 'Gagal mengubah kata sandi.' };
    }
    setIsRecoverySession(false);
    showToast('Kata sandi berhasil diperbarui!');
    return { success: true };
  };

  // Upload foto profil ke Supabase Storage (bucket 'avatars'), lalu simpan URL publiknya ke tabel site_profile.
  // Nama file selalu sama ("profile.<ext>") supaya foto lama otomatis tertimpa, bukan menumpuk file baru terus.
  const uploadAvatar = async (file: File): Promise<{ success: boolean; error?: string }> => {
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File harus berupa gambar.' };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Ukuran gambar maksimal 5MB.' };
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const path = `profile.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' });

    if (uploadError) {
      console.error('Gagal upload foto:', uploadError);
      return { success: false, error: uploadError.message || 'Gagal mengunggah foto ke server.' };
    }

    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(path);
    // Tambahkan cache-buster supaya browser tidak menampilkan foto lama yang ter-cache
    const bustedUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: dbError } = await supabase
      .from('site_profile')
      .update({ avatar_url: bustedUrl, updated_at: new Date().toISOString() })
      .eq('id', 1);

    if (dbError) {
      console.error('Gagal menyimpan URL foto:', dbError);
      return { success: false, error: 'Foto terunggah tapi gagal disimpan ke database.' };
    }

    setSiteProfile(prev => (prev ? { ...prev, avatarUrl: bustedUrl } : prev));
    showToast('Foto profil berhasil diperbarui!');
    return { success: true };
  };

  // Update bio, kontak, skill, sertifikat, dll — satu baris tabel site_profile.
  const updateSiteProfile = async (updates: Partial<SiteProfile>): Promise<{ success: boolean; error?: string }> => {
    const row = mapSiteProfileToDb(updates);
    if (Object.keys(row).length === 0) {
      return { success: true };
    }
    row.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('site_profile')
      .update(row)
      .eq('id', 1)
      .select()
      .single();

    if (error || !data) {
      console.error('Gagal memperbarui profil situs:', error);
      return { success: false, error: error?.message || 'Gagal menyimpan profil ke server.' };
    }

    setSiteProfile(mapSiteProfileFromDb(data));
    showToast('Profil situs berhasil diperbarui!');
    return { success: true };
  };

  // Backup manual (unduh JSON) — tetap berguna untuk cadangan, tidak menyentuh database.
  const exportDataJson = () => {
    const data = {
      experiences,
      portfolioItems,
      marketingResults,
      messages,
      exportedAt: new Date().toISOString(),
      owner: 'Muhammad Andra Kusuma Ramadhan',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `andra-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup data berhasil diunduh!');
  };

  // Impor dari file backup JSON (hasil exportDataJson) — ditambahkan sebagai data BARU ke Supabase,
  // bukan menimpa data yang sudah ada. ID lama diabaikan (server generate ID baru).
  const importDataJson = async (jsonString: string): Promise<boolean> => {
    try {
      const data = JSON.parse(jsonString);
      let importedCount = 0;

      if (Array.isArray(data.experiences) && data.experiences.length > 0) {
        const rows = data.experiences.map((exp: Experience) => mapExperienceToDb(exp));
        const { error } = await supabase.from('experiences').insert(rows);
        if (error) throw error;
        importedCount += data.experiences.length;
      }

      if (Array.isArray(data.portfolioItems) && data.portfolioItems.length > 0) {
        const rows = data.portfolioItems.map((item: PortfolioItem) => {
          const mapped = mapPortfolioToDb(item);
          const fallbackSlug = `${item.title}-${Date.now()}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
          return { ...mapped, slug: mapped.slug || fallbackSlug };
        });
        const { error } = await supabase.from('portfolio_items').insert(rows);
        if (error) throw error;
        importedCount += data.portfolioItems.length;
      }

      if (Array.isArray(data.marketingResults) && data.marketingResults.length > 0) {
        const rows = data.marketingResults.map((item: MarketingResult) => {
          const mapped = mapMarketingToDb(item);
          const fallbackSlug = `${item.title}-${Date.now()}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
          return { ...mapped, slug: mapped.slug || fallbackSlug };
        });
        const { error } = await supabase.from('marketing_results').insert(rows);
        if (error) throw error;
        importedCount += data.marketingResults.length;
      }

      await refetchAllData();
      showToast(`Berhasil mengimpor ${importedCount} item ke database.`);
      return true;
    } catch (err) {
      console.error('Gagal mengimpor data:', err);
      showToast('Format JSON tidak valid atau gagal mengimpor ke server.', 'error');
      return false;
    }
  };

  return (
    <PortfolioContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeWorkSlug,
        setActiveWorkSlug,
        openWork,
        isLoadingData,
        isAuthLoading,
        experiences,
        addExperience,
        updateExperience,
        deleteExperience,
        portfolioItems,
        addPortfolioItem,
        updatePortfolioItem,
        deletePortfolioItem,
        marketingResults,
        addMarketingResult,
        updateMarketingResult,
        deleteMarketingResult,
        getMarketingResultForWork,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        messages,
        addMessage,
        markMessageRead,
        deleteMessage,
        currentUser,
        loginAdmin,
        logoutAdmin,
        updateAdminEmail,
        updateAdminPassword,
        isRecoverySession,
        avatarUrl: siteProfile?.avatarUrl ?? null,
        uploadAvatar,
        siteProfile,
        updateSiteProfile,
        toasts,
        showToast,
        refetchAllData,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
