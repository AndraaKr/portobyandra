import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Briefcase, 
  Layers, 
  Mail, 
  Database, 
  Plus, 
  Edit3, 
  Trash2, 
  LogOut, 
  ExternalLink, 
  Clock, 
  Download, 
  Upload, 
  RefreshCw,
  Search,
  Check,
  ToggleLeft,
  ToggleRight,
  FileText,
  UserCog,
  Camera,
  Eye,
  EyeOff,
  TrendingUp,
  GraduationCap,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { Experience, PortfolioItem, ContactMessage, Certificate, MarketingResult, EducationItem, SkillCategory } from '../types';
import { ExperienceModal } from '../components/ExperienceModal';
import { PortfolioModal } from '../components/PortfolioModal';
import { PortfolioInlineEditor } from '../components/PortfolioInlineEditor';
import { ExperienceInlineEditor } from '../components/ExperienceInlineEditor';
import { MarketingModal } from '../components/marketing/MarketingModal';
import { downloadAtsCvPdf } from '../utils/generateAtsPdf';
import { AtsCvModal } from '../components/AtsCvModal';
import { normalizeWork, PUBLIC_CATEGORIES } from '../utils/work';

type AdminTab = 'portfolio' | 'marketing' | 'experience' | 'messages' | 'backup' | 'account' | 'profile';

export const AdminDashboardPage: React.FC = () => {
  const { 
    currentUser, 
    logoutAdmin, 
    setActiveTab, 
    portfolioItems, 
    deletePortfolioItem, 
    marketingResults,
    addMarketingResult,
    updateMarketingResult,
    deleteMarketingResult,
    experiences, 
    deleteExperience, 
    messages, 
    markMessageRead, 
    deleteMessage,
    refetchAllData,
    exportDataJson,
    importDataJson,
    showToast,
    avatarUrl,
    uploadAvatar,
    updateAdminEmail,
    updateAdminPassword,
    siteProfile,
    updateSiteProfile,
    isRecoverySession 
  } = usePortfolio();

  const [currentAdminTab, setCurrentAdminTab] = useState<AdminTab>(isRecoverySession ? 'account' : 'portfolio');
  const [isAtsModalOpen, setIsAtsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('Semua');

  // Pengaturan Akun
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailUpdateStatus, setEmailUpdateStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordUpdateStatus, setPasswordUpdateStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Edit Mode state tracking
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [quickEditModeEnabled, setQuickEditModeEnabled] = useState<boolean>(true);

  // Modals state
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<PortfolioItem | null>(null);

  const [experienceModalOpen, setExperienceModalOpen] = useState(false);
  const [experienceToEdit, setExperienceToEdit] = useState<Experience | null>(null);

  const [marketingModalOpen, setMarketingModalOpen] = useState(false);
  const [marketingToEdit, setMarketingToEdit] = useState<MarketingResult | null>(null);

  // Import JSON input
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  // Profil Form
  const [profileForm, setProfileForm] = useState({
    name: '', shortName: '', title: '', tagline: '', bio: '',
    email: '', phone: '', location: '', education: '', educationPeriod: '', gpa: '', coursework: '', currentRole: '',
    availabilityStatus: 'OPEN TO WORK',
    github: '', linkedin: '', instagram: '', youtube: '', website: '',
    skillsUiux: '', skillsAiTools: '', skillsMultimedia: '', skillsMarketing: '',
  });
  const [certForm, setCertForm] = useState<Certificate[]>([]);
  const [educationForm, setEducationForm] = useState<EducationItem[]>([]);
  const [skillCategoryForm, setSkillCategoryForm] = useState<{ id: string; name: string; rawSkills: string }[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    if (!siteProfile) return;
    const aiSkillsList = (siteProfile.skills.aiTools && siteProfile.skills.aiTools.length > 0)
      ? siteProfile.skills.aiTools
      : siteProfile.skills.frontend;

    setProfileForm({
      name: siteProfile.name,
      shortName: siteProfile.shortName,
      title: siteProfile.title,
      tagline: siteProfile.tagline,
      bio: siteProfile.bio,
      email: siteProfile.email,
      phone: siteProfile.phone,
      location: siteProfile.location,
      education: siteProfile.education,
      educationPeriod: siteProfile.educationPeriod || '',
      gpa: siteProfile.gpa ?? '',
      coursework: (siteProfile.coursework ?? []).join(', '),
      currentRole: siteProfile.currentRole,
      availabilityStatus: siteProfile.availabilityStatus || 'OPEN TO WORK',
      github: siteProfile.socials.github,
      linkedin: siteProfile.socials.linkedin,
      instagram: siteProfile.socials.instagram,
      youtube: siteProfile.socials.youtube,
      website: siteProfile.socials.website,
      skillsUiux: siteProfile.skills.uiux.join(', '),
      skillsAiTools: aiSkillsList.join(', '),
      skillsMultimedia: siteProfile.skills.multimedia.join(', '),
      skillsMarketing: siteProfile.skills.marketing.join(', '),
    });
    setCertForm(siteProfile.certificates);
    setEducationForm(
      siteProfile.educations && siteProfile.educations.length > 0
        ? siteProfile.educations
        : [
            {
              id: `edu-default-1`,
              institution: siteProfile.education && siteProfile.education.includes('—')
                ? siteProfile.education.split('—')[1]?.trim()
                : (siteProfile.education || 'Politeknik Negeri Jember (PSDKU Sidoarjo)'),
              degree: siteProfile.education && siteProfile.education.includes('—')
                ? siteProfile.education.split('—')[0]?.trim()
                : 'D4 Teknik Informatika',
              period: siteProfile.educationPeriod || '2021 – 2025',
              location: siteProfile.location || 'Sidoarjo, Jawa Timur',
              gpa: siteProfile.gpa || '3.79',
              activities: 'Fokus: Rekayasa Perangkat Lunak, Multimedia & Pengembangan Sistem Informasi',
            },
          ]
    );

    // Kategori keahlian dinamis
    const initialSkillCats =
      siteProfile.skillCategories && siteProfile.skillCategories.length > 0
        ? siteProfile.skillCategories.map(c => ({
            id: c.id,
            name: c.name,
            rawSkills: c.skills.join(', '),
          }))
        : [
            {
              id: 'cat-multimedia',
              name: 'Video Editing & Multimedia',
              rawSkills: siteProfile.skills.multimedia.join(', ') || 'Premiere Pro, After Effects, CapCut Pro, DaVinci Resolve, Motion Design',
            },
            {
              id: 'cat-marketing',
              name: 'Digital Marketing & Konten AI',
              rawSkills: siteProfile.skills.marketing.join(', ') || 'TikTok & Reels Growth, Meta Ads, SEO Konten, Copywriting',
            },
            {
              id: 'cat-uiux',
              name: 'UI/UX & Product Design',
              rawSkills: siteProfile.skills.uiux.join(', ') || 'Figma, Wireframing, Prototyping, Design System',
            },
            {
              id: 'cat-ai',
              name: 'Tool AI & Generatif',
              rawSkills: aiSkillsList.join(', ') || 'ChatGPT & Claude, Midjourney, ElevenLabs, Runway Gen-2',
            },
          ];
    setSkillCategoryForm(initialSkillCats);
  }, [siteProfile]);

  const setPF = (key: keyof typeof profileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfileForm(prev => ({ ...prev, [key]: e.target.value }));

  const splitTags = (v: string) => v.split(',').map(t => t.trim()).filter(Boolean);

  const addSkillCategoryRow = () =>
    setSkillCategoryForm(prev => [
      ...prev,
      {
        id: `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        rawSkills: '',
      },
    ]);
  const updateSkillCategoryRow = (id: string, field: 'name' | 'rawSkills', value: string) =>
    setSkillCategoryForm(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  const removeSkillCategoryRow = (id: string) =>
    setSkillCategoryForm(prev => prev.filter(c => c.id !== id));
  const moveSkillCategoryRow = (index: number, direction: 'up' | 'down') => {
    setSkillCategoryForm(prev => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const [moved] = next.splice(index, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  const addEducationRow = () =>
    setEducationForm(prev => [
      ...prev,
      {
        id: `edu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        institution: '',
        degree: '',
        period: '2021 – 2025',
        location: profileForm.location || 'Surabaya, Indonesia',
        gpa: '',
        activities: '',
      },
    ]);
  const updateEducationRow = (id: string, field: keyof EducationItem, value: string) =>
    setEducationForm(prev => prev.map(e => (e.id === id ? { ...e, [field]: value } : e)));
  const removeEducationRow = (id: string) =>
    setEducationForm(prev => prev.filter(e => e.id !== id));
  const moveEducationRow = (index: number, direction: 'up' | 'down') => {
    setEducationForm(prev => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      const [moved] = next.splice(index, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    });
  };

  const addCertRow = (type: 'sertifikat' | 'pelatihan' = 'sertifikat') =>
    setCertForm(prev => [
      ...prev,
      {
        id: `cert-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: '',
        issuer: '',
        year: '',
        url: '',
        description: '',
        type,
      },
    ]);
  const updateCertRow = (id: string, field: keyof Certificate, value: string) =>
    setCertForm(prev => prev.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  const removeCertRow = (id: string) => setCertForm(prev => prev.filter(c => c.id !== id));

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus(null);
    setIsSavingProfile(true);
    const validEducations = educationForm.filter(e => e.institution.trim());
    const topEdu = validEducations[0];

    const mappedSkillCategories: SkillCategory[] = skillCategoryForm
      .filter(c => c.name.trim())
      .map(c => ({
        id: c.id,
        name: c.name.trim(),
        skills: splitTags(c.rawSkills),
      }));

    let legacyMultimedia: string[] = [];
    let legacyMarketing: string[] = [];
    let legacyUiux: string[] = [];
    let legacyAi: string[] = [];

    mappedSkillCategories.forEach(cat => {
      const lower = cat.name.toLowerCase();
      if (lower.includes('multimedia') || lower.includes('video')) legacyMultimedia = cat.skills;
      else if (lower.includes('marketing')) legacyMarketing = cat.skills;
      else if (lower.includes('ui/ux') || lower.includes('design')) legacyUiux = cat.skills;
      else if (lower.includes('ai') || lower.includes('generatif')) legacyAi = cat.skills;
    });

    const result = await updateSiteProfile({
      name: profileForm.name.trim(),
      shortName: profileForm.shortName.trim(),
      title: profileForm.title.trim(),
      tagline: profileForm.tagline.trim(),
      bio: profileForm.bio.trim(),
      email: profileForm.email.trim(),
      phone: profileForm.phone.trim(),
      location: profileForm.location.trim(),
      education: topEdu ? (topEdu.degree ? `${topEdu.degree} — ${topEdu.institution}` : topEdu.institution) : profileForm.education.trim(),
      educationPeriod: topEdu?.period || profileForm.educationPeriod.trim(),
      educations: validEducations,
      gpa: topEdu?.gpa || profileForm.gpa.trim(),
      coursework: splitTags(profileForm.coursework),
      currentRole: profileForm.currentRole.trim(),
      availabilityStatus: profileForm.availabilityStatus.trim(),
      socials: {
        github: profileForm.github.trim(),
        linkedin: profileForm.linkedin.trim(),
        instagram: profileForm.instagram.trim(),
        youtube: profileForm.youtube.trim(),
        website: profileForm.website.trim(),
      },
      skills: {
        uiux: legacyUiux.length > 0 ? legacyUiux : splitTags(profileForm.skillsUiux),
        frontend: [],
        aiTools: legacyAi.length > 0 ? legacyAi : splitTags(profileForm.skillsAiTools),
        multimedia: legacyMultimedia.length > 0 ? legacyMultimedia : splitTags(profileForm.skillsMultimedia),
        marketing: legacyMarketing.length > 0 ? legacyMarketing : splitTags(profileForm.skillsMarketing),
      },
      skillCategories: mappedSkillCategories,
      certificates: certForm.filter(c => c.name.trim()),
    });
    setIsSavingProfile(false);
    if (result.success) {
      setProfileStatus({ type: 'success', msg: 'BERHASIL: Profil situs berhasil disimpan.' });
    } else {
      setProfileStatus({ type: 'error', msg: `GALAT: ${result.error || 'Gagal menyimpan profil.'}` });
    }
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran berkas melebihi batas 5MB.', 'error');
      return;
    }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setIsUploadingAvatar(true);
    const result = await uploadAvatar(avatarFile);
    setIsUploadingAvatar(false);
    if (result.success) {
      showToast('Foto profil berhasil diperbarui.');
      setAvatarFile(null);
      setAvatarPreview(null);
    } else {
      showToast(result.error || 'Gagal mengunggah foto profil.', 'error');
    }
  };

  const handleEmailUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailUpdateStatus(null);
    setIsUpdatingEmail(true);
    const result = await updateAdminEmail(newEmail.trim());
    setIsUpdatingEmail(false);
    if (result.success) {
      setEmailUpdateStatus({
        type: 'success',
        msg: 'BERHASIL: Tautan konfirmasi telah dikirim ke email baru dan lama. Silakan klik kedua tautan tersebut.',
      });
      setNewEmail('');
    } else {
      setEmailUpdateStatus({ type: 'error', msg: `GALAT: ${result.error || 'Gagal memperbarui email.'}` });
    }
  };

  const handlePasswordUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordUpdateStatus(null);
    if (newPassword.length < 8) {
      setPasswordUpdateStatus({ type: 'error', msg: 'GALAT: Kata sandi minimal 8 karakter.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordUpdateStatus({ type: 'error', msg: 'GALAT: Konfirmasi kata sandi tidak cocok.' });
      return;
    }
    setIsUpdatingPassword(true);
    const result = await updateAdminPassword(newPassword);
    setIsUpdatingPassword(false);
    if (result.success) {
      setPasswordUpdateStatus({ type: 'success', msg: 'BERHASIL: Kata sandi berhasil diperbarui.' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordUpdateStatus({ type: 'error', msg: `GALAT: ${result.error || 'Gagal memperbarui kata sandi.'}` });
    }
  };

  // If not logged in, prompt
  if (!currentUser) {
    return (
      <div className="pt-32 pb-16 max-w-md mx-auto px-4 text-center space-y-4">
        <div className="w-12 h-12 border border-rule flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--paper-2)' }}>
          <ShieldCheck className="w-6 h-6 text-ink" />
        </div>
        <h2 className="font-bold text-2xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
          Akses Terkunci
        </h2>
        <p className="label-mono text-xs text-ink-2">
          Halaman Dashboard Admin hanya dapat diakses oleh pemilik situs.
        </p>
        <button
          type="button"
          onClick={() => setActiveTab('admin-login')}
          className="btn-primary"
        >
          MENUJU HALAMAN LOGIN
        </button>
      </div>
    );
  }

  const unreadMessagesCount = messages.filter((m) => !m.read).length;

  const handleAddPortfolio = () => {
    setItemToEdit(null);
    setPortfolioModalOpen(true);
  };

  const handleEditPortfolioModal = (item: PortfolioItem) => {
    setItemToEdit(item);
    setPortfolioModalOpen(true);
  };

  const toggleInlineEditPortfolio = (id: string) => {
    setEditingPortfolioId((prev) => (prev === id ? null : id));
  };

  const handleDeletePortfolio = (id: string, title: string) => {
    if (confirm(`Hapus karya "${title}" dari portofolio? Tindakan ini tidak dapat dibatalkan.`)) {
      if (editingPortfolioId === id) setEditingPortfolioId(null);
      deletePortfolioItem(id);
    }
  };

  const handleAddExperience = () => {
    setExperienceToEdit(null);
    setExperienceModalOpen(true);
  };

  const handleEditExperienceModal = (exp: Experience) => {
    setExperienceToEdit(exp);
    setExperienceModalOpen(true);
  };

  const toggleInlineEditExperience = (id: string) => {
    setEditingExperienceId((prev) => (prev === id ? null : id));
  };

  const handleDeleteExperience = (id: string, role: string) => {
    if (confirm(`Hapus pengalaman "${role}"? Tindakan ini tidak dapat dibatalkan.`)) {
      if (editingExperienceId === id) setEditingExperienceId(null);
      deleteExperience(id);
    }
  };

  const handleAddMarketing = () => {
    setMarketingToEdit(null);
    setMarketingModalOpen(true);
  };

  const handleEditMarketing = (item: MarketingResult) => {
    setMarketingToEdit(item);
    setMarketingModalOpen(true);
  };

  const handleDeleteMarketing = async (id: string, title: string) => {
    if (confirm(`Hapus hasil marketing "${title}"? Tindakan ini tidak dapat dibatalkan.`)) {
      await deleteMarketingResult(id);
    }
  };

  const handleTogglePublishMarketing = async (item: MarketingResult) => {
    if (!item.published && !item.sourceNote?.trim()) {
      alert('Sumber data (source_note) wajib diisi sebelum menerbitkan hasil.');
      return;
    }
    await updateMarketingResult(item.id, { published: !item.published });
  };

  const handleImportSubmit = async () => {
    if (!importText.trim()) return;
    const ok = await importDataJson(importText);
    if (ok) {
      setImportText('');
      setShowImportBox(false);
    }
  };

  // Filter Portofolio
  const filteredPortfolio = portfolioItems.filter((item) => {
    const matchesCategory =
      selectedCategoryFilter === 'Semua' || item.category === selectedCategoryFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tools.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Filter Pengalaman
  const filteredExperiences = experiences.filter((exp) => {
    const s = searchTerm.toLowerCase();
    return (
      exp.role.toLowerCase().includes(s) ||
      exp.organization.toLowerCase().includes(s) ||
      (exp.skills && exp.skills.some((k) => k.toLowerCase().includes(s)))
    );
  });

  return (
    <div className="page py-12 md:py-20 space-y-10">
      {/* Top Bar Banner */}
      <div className="border border-rule p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: 'var(--paper-2)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-rule flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--paper)' }}>
            <ShieldCheck className="w-5 h-5 text-ink" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-ink" style={{ fontFamily: 'var(--font-display)' }}>
                Panel Kontrol CMS Portofolio
              </h1>
              <span className="label-mono text-xs px-2 py-0.5 border border-rule">
                MODE ADMIN
              </span>
            </div>
            <p className="label-mono text-xs text-ink-2">
              Masuk sebagai <strong>{currentUser.name}</strong> ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('beranda')}
            className="btn-primary"
            style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
          >
            <span>Lihat Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={logoutAdmin}
            className="btn-primary"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 border border-rule" style={{ backgroundColor: 'var(--paper-2)' }}>
          <div className="flex items-center justify-between label-mono text-xs text-ink-2 mb-2">
            <span>TOTAL KARYA</span>
            <Layers className="w-4 h-4 text-ink" />
          </div>
          <div className="font-bold text-2xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {portfolioItems.length}
          </div>
          <span className="label-mono text-xs text-ink-2">Termasuk non-publik</span>
        </div>

        <div className="p-5 border border-rule" style={{ backgroundColor: 'var(--paper-2)' }}>
          <div className="flex items-center justify-between label-mono text-xs text-ink-2 mb-2">
            <span>RIWAYAT KARIER</span>
            <Briefcase className="w-4 h-4 text-ink" />
          </div>
          <div className="font-bold text-2xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {experiences.length}
          </div>
          <span className="label-mono text-xs text-ink-2">Pengalaman kerja</span>
        </div>

        <div className="p-5 border border-rule" style={{ backgroundColor: 'var(--paper-2)' }}>
          <div className="flex items-center justify-between label-mono text-xs text-ink-2 mb-2">
            <span>PESAN MASUK</span>
            <Mail className="w-4 h-4 text-ink" />
          </div>
          <div className="font-bold text-2xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            {messages.length}
          </div>
          <span className="label-mono text-xs text-ink-2 font-medium">
            {unreadMessagesCount} belum dibaca
          </span>
        </div>

        <div className="p-5 border border-rule" style={{ backgroundColor: 'var(--paper-2)' }}>
          <div className="flex items-center justify-between label-mono text-xs text-ink-2 mb-2">
            <span>DATABASE</span>
            <Database className="w-4 h-4 text-ink" />
          </div>
          <div className="font-bold text-2xl text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            Supabase
          </div>
          <span className="label-mono text-xs text-ink-2">Sinkronisasi Cloud</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-rule pb-3 label-mono">
        {[
          { id: 'portfolio', label: `Kelola Portofolio (${portfolioItems.length})`, icon: Layers },
          { id: 'marketing', label: `Kelola Marketing (${marketingResults.length})`, icon: TrendingUp },
          { id: 'experience', label: `Kelola Pengalaman (${experiences.length})`, icon: Briefcase },
          { id: 'messages', label: `Pesan Masuk (${messages.length})`, icon: Mail },
          { id: 'backup', label: 'Cadangan & Ekspor', icon: Database },
          { id: 'profile', label: 'Profil Situs', icon: UserCog },
          { id: 'account', label: 'Akun Login', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = currentAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setCurrentAdminTab(tab.id as AdminTab);
                setSearchTerm('');
              }}
              className="px-3.5 py-1.5 cursor-pointer flex items-center gap-1.5"
              style={{
                backgroundColor: isActive ? 'var(--ink)' : 'transparent',
                color: isActive ? 'var(--paper)' : 'var(--ink)',
                border: '1px solid var(--rule)',
                borderRadius: 0,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================
          TAB 1: PORTOFOLIO
          ======================================================== */}
      {currentAdminTab === 'portfolio' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-rule" style={{ backgroundColor: 'var(--paper-2)' }}>
            <div>
              <h2 className="font-bold text-base text-ink" style={{ fontFamily: 'var(--font-display)' }}>
                Daftar Karya &amp; Produksi Media
              </h2>
              <p className="label-mono text-xs text-ink-2">
                Karya dengan kategori non-publik (UI/UX Desain &amp; Web Development) disembunyikan dari halaman depan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuickEditModeEnabled(!quickEditModeEnabled)}
                className="inline-flex items-center gap-1.5 px-3 py-1 label-mono border border-rule cursor-pointer"
                style={{ backgroundColor: 'var(--paper)', color: 'var(--ink)' }}
              >
                {quickEditModeEnabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                <span>Edit Cepat: {quickEditModeEnabled ? 'Aktif' : 'Standar'}</span>
              </button>

              <button
                type="button"
                onClick={handleAddPortfolio}
                className="btn-primary"
              >
                <Plus className="w-3.5 h-3.5 text-paper" />
                <span>Tambah Karya</span>
              </button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1 label-mono">
              {['Semua', 'Desain', 'Video Editing', 'UI/UX Desain', 'Web Development'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className="px-3 py-1 cursor-pointer border border-rule"
                  style={{
                    backgroundColor: selectedCategoryFilter === cat ? 'var(--ink)' : 'transparent',
                    color: selectedCategoryFilter === cat ? 'var(--paper)' : 'var(--ink)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-ink-2 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari judul atau tools…"
                className="input-swiss pl-8 text-xs"
              />
            </div>
          </div>

          {/* Portfolio List */}
          <div className="border border-rule divide-y divide-rule" style={{ backgroundColor: 'var(--paper)' }}>
            {filteredPortfolio.map((item) => {
              const isCurrentlyEditing = editingPortfolioId === item.id;
              const norm = normalizeWork(item);
              const isNonPublic = !PUBLIC_CATEGORIES.includes(item.category as any);

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 transition-colors duration-150"
                  style={{
                    backgroundColor: isCurrentlyEditing ? 'var(--paper-2)' : 'transparent',
                    borderLeft: isCurrentlyEditing ? '4px solid var(--ink)' : 'none',
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Media Thumb */}
                      <div className="w-16 h-12 border border-rule shrink-0 overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--paper-2)' }}>
                        {item.posterUrl || item.imageUrl ? (
                          <img
                            src={item.posterUrl || item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="label-mono text-xs text-ink-2">NO POSTER</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className="font-bold text-sm text-ink"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {item.title}
                          </h3>

                          {item.isShowreel && (
                            <span className="label-mono text-xs px-1.5 py-0.5 border border-rule font-bold">
                              SHOWREEL
                            </span>
                          )}

                          {item.featured && (
                            <span className="label-mono text-xs px-1.5 py-0.5 border border-rule">
                              UNGGULAN
                            </span>
                          )}

                          {isNonPublic && (
                            <span className="label-mono text-xs px-1.5 py-0.5 border border-rule font-semibold">
                              NON-PUBLIK
                            </span>
                          )}

                          {norm.incomplete.length > 0 && (
                            <span className="label-mono text-xs px-1.5 py-0.5 border border-rule">
                              BELUM LENGKAP: {norm.incomplete.join(', ')}
                            </span>
                          )}

                          {isCurrentlyEditing && (
                            <span className="label-mono text-xs px-1.5 py-0.5 bg-ink text-paper">
                              SEDANG DIEDIT
                            </span>
                          )}
                        </div>

                        <div className="label-mono text-xs text-ink-2 flex flex-wrap items-center gap-2">
                          <span>{item.category}</span>
                          <span>·</span>
                          <span>{item.mediaType}</span>
                          {item.client && (
                            <>
                              <span>·</span>
                              <span>Klien: {item.client}</span>
                            </>
                          )}
                          {item.workYear && (
                            <>
                              <span>·</span>
                              <span>Tahun: {item.workYear}</span>
                            </>
                          )}
                          {item.tools?.length > 0 && (
                            <>
                              <span>·</span>
                              <span>{item.tools.slice(0, 3).join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() =>
                          quickEditModeEnabled
                            ? toggleInlineEditPortfolio(item.id)
                            : handleEditPortfolioModal(item)
                        }
                        className="btn-primary text-xs py-1 px-3"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isCurrentlyEditing ? 'Tutup' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePortfolio(item.id, item.title)}
                        className="btn-primary text-xs py-1 px-3"
                        style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                        title="Hapus karya"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Editor */}
                  {isCurrentlyEditing && (
                    <PortfolioInlineEditor
                      item={item}
                      onClose={() => setEditingPortfolioId(null)}
                      onOpenModal={() => handleEditPortfolioModal(item)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {filteredPortfolio.length === 0 && (
            <div className="p-8 text-center border border-rule label-mono text-xs text-ink-2">
              Tidak ada karya yang sesuai dengan kriteria pencarian.
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB: MARKETING (Digital Marketing & AI Content)
          ======================================================== */}
      {currentAdminTab === 'marketing' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-rule" style={{ backgroundColor: 'var(--paper-2)' }}>
            <div>
              <h2 className="font-bold text-base text-ink" style={{ fontFamily: 'var(--font-display)' }}>
                Daftar Capaian Digital Marketing &amp; Konten AI
              </h2>
              <p className="label-mono text-xs text-ink-2">
                Hanya hasil berstatus Terbit dan memiliki Sumber Data (source_note) yang tampil di publik.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMarketing}
              className="btn-primary"
            >
              <Plus className="w-3.5 h-3.5 text-paper" />
              <span>Tambah Hasil Marketing</span>
            </button>
          </div>

          {marketingResults.length === 0 ? (
            <div className="p-8 text-center border border-rule label-mono text-xs text-ink-2">
              Belum ada hasil marketing tersimpan.
            </div>
          ) : (
            <div className="border border-rule divide-y divide-rule" style={{ backgroundColor: 'var(--paper)' }}>
              {marketingResults.map((mkt) => {
                let deltaText = 'Dari 0';
                if (mkt.baselineValue > 0) {
                  const pct = Math.round(((mkt.resultValue - mkt.baselineValue) / mkt.baselineValue) * 100);
                  deltaText = pct > 0 ? `+${pct}%` : `${pct}%`;
                }
                return (
                  <div key={mkt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="label-mono text-xs px-2 py-0.5 border border-rule uppercase">
                          {mkt.platform}
                        </span>
                        <h3 className="font-bold text-ink">{mkt.title}</h3>
                        <span className={`label-mono text-xs px-2 py-0.5 ${mkt.published ? 'bg-ink text-paper' : 'border border-rule text-ink-2'}`}>
                          {mkt.published ? 'TERBIT' : 'DRAF'}
                        </span>
                      </div>
                      <p className="label-mono text-xs text-ink-2">
                        {mkt.accountName} · Sebelum: {mkt.baselineValue} · Sesudah: {mkt.resultValue} ({deltaText}) · Sumber: {mkt.sourceNote}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTogglePublishMarketing(mkt)}
                        className="btn-primary text-xs py-1 px-2.5"
                        style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                      >
                        {mkt.published ? 'Jadikan Draf' : 'Terbitkan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditMarketing(mkt)}
                        className="btn-primary text-xs py-1 px-2.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMarketing(mkt.id, mkt.title)}
                        className="btn-primary text-xs py-1 px-2.5"
                        style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 2: PENGALAMAN
          ======================================================== */}
      {currentAdminTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-rule" style={{ backgroundColor: 'var(--paper-2)' }}>
            <div>
              <h2 className="font-bold text-base text-ink" style={{ fontFamily: 'var(--font-display)' }}>
                Daftar Pengalaman Kerja &amp; Karier
              </h2>
              <p className="label-mono text-xs text-ink-2">
                Atur riwayat karier, peran, organisasi, periode, dan nomor urut prioritas.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddExperience}
              className="btn-primary"
            >
              <Plus className="w-3.5 h-3.5 text-paper" />
              <span>Tambah Pengalaman</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="w-3.5 h-3.5 text-ink-2 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari posisi, organisasi, atau skill…"
              className="input-swiss pl-8 text-xs"
            />
          </div>

          {/* Experience List */}
          <div className="border border-rule divide-y divide-rule" style={{ backgroundColor: 'var(--paper)' }}>
            {filteredExperiences.map((exp) => {
              const isCurrentlyEditing = editingExperienceId === exp.id;

              return (
                <div
                  key={exp.id}
                  className="p-4 sm:p-5 transition-colors duration-150"
                  style={{
                    backgroundColor: isCurrentlyEditing ? 'var(--paper-2)' : 'transparent',
                    borderLeft: isCurrentlyEditing ? '4px solid var(--ink)' : 'none',
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="label-mono text-xs font-bold px-2 py-0.5 border border-rule">
                          #{exp.order || 1}
                        </span>
                        <h3 className="font-bold text-sm text-ink" style={{ fontFamily: 'var(--font-display)' }}>
                          {exp.role}
                        </h3>
                        {isCurrentlyEditing && (
                          <span className="label-mono text-xs px-1.5 py-0.5 bg-ink text-paper">
                            SEDANG DIEDIT
                          </span>
                        )}
                      </div>
                      <p className="label-mono text-xs text-ink-2">
                        <strong>{exp.organization}</strong> · {exp.period} {exp.location && `· ${exp.location}`}
                      </p>
                      <p className="text-xs text-ink-2 line-clamp-2">
                        {exp.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => toggleInlineEditExperience(exp.id)}
                        className="btn-primary text-xs py-1 px-3"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isCurrentlyEditing ? 'Tutup' : 'Edit'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(exp.id, exp.role)}
                        className="btn-primary text-xs py-1 px-3"
                        style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isCurrentlyEditing && (
                    <ExperienceInlineEditor
                      exp={exp}
                      onClose={() => setEditingExperienceId(null)}
                      onOpenModal={() => handleEditExperienceModal(exp)}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {filteredExperiences.length === 0 && (
            <div className="p-8 text-center border border-rule label-mono text-xs text-ink-2">
              Tidak ada riwayat pengalaman yang cocok dengan pencarian.
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: PESAN MASUK
          ======================================================== */}
      {currentAdminTab === 'messages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-rule pb-3">
            <h2 className="font-bold text-lg text-ink" style={{ fontFamily: 'var(--font-display)' }}>
              Pesan Masuk dari Formulir Kontak
            </h2>
            <span className="label-mono text-xs text-ink-2">
              {unreadMessagesCount} pesan belum dibaca
            </span>
          </div>

          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-5 border border-rule space-y-3"
                style={{
                  backgroundColor: msg.read ? 'var(--paper)' : 'var(--paper-2)',
                  borderLeft: msg.read ? '1px solid var(--rule)' : '4px solid var(--ink)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-ink">
                      {msg.name}
                    </h3>
                    <span className="label-mono text-xs px-2 py-0.5 border border-rule">
                      {msg.projectType}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 label-mono text-xs text-ink-2">
                    <Clock className="w-3.5 h-3.5 text-ink-2" />
                    <span>{new Date(msg.createdAt).toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <p className="label-mono text-xs text-ink-2">
                  Email: <a href={`mailto:${msg.email}`} className="text-link text-ink">{msg.email}</a> · Subjek: <strong>{msg.subject}</strong>
                </p>

                <p className="text-xs text-ink leading-relaxed p-3 border border-rule whitespace-pre-line" style={{ backgroundColor: 'var(--paper)' }}>
                  {msg.message}
                </p>

                <div className="flex items-center justify-end gap-2 pt-2">
                  {!msg.read && (
                    <button
                      type="button"
                      onClick={() => markMessageRead(msg.id)}
                      className="btn-primary text-xs py-1 px-3"
                      style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Tandai Dibaca</span>
                    </button>
                  )}
                  <a
                    href={`mailto:${msg.email}?subject=Balasan: ${encodeURIComponent(msg.subject)}`}
                    className="btn-primary text-xs py-1 px-3"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Balas Email</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteMessage(msg.id)}
                    className="btn-primary text-xs py-1 px-3"
                    style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                    title="Hapus pesan"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="p-8 text-center border border-rule label-mono text-xs text-ink-2">
                Belum ada pesan masuk dari pengunjung.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: BACKUP & EKSPOR
          ======================================================== */}
      {currentAdminTab === 'backup' && (
        <div className="space-y-6">
          <h2 className="font-bold text-lg text-ink" style={{ fontFamily: 'var(--font-display)' }}>
            Pengelolaan Data &amp; Cadangan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 border border-rule space-y-3" style={{ backgroundColor: 'var(--paper-2)' }}>
              <FileText className="w-6 h-6 text-ink" />
              <h3 className="font-bold text-sm text-ink">CV ATS (PDF)</h3>
              <p className="label-mono text-xs text-ink-2">
                Hasilkan CV ATS standar Indonesia berbasis data riwayat aktif.
              </p>
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!siteProfile) {
                      showToast('Data profil belum termuat, coba lagi sesaat.', 'error');
                      return;
                    }
                    try {
                      downloadAtsCvPdf(siteProfile, experiences, portfolioItems, { language: 'id', includeProjects: true });
                      showToast('CV ATS (PDF) berhasil diunduh!');
                    } catch {
                      showToast('Gagal mengunduh PDF', 'error');
                    }
                  }}
                  className="btn-primary w-full text-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAtsModalOpen(true)}
                  className="btn-primary w-full text-xs"
                  style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                >
                  Pratinjau CV
                </button>
              </div>
            </div>

            <div className="p-5 border border-rule space-y-3" style={{ backgroundColor: 'var(--paper-2)' }}>
              <Download className="w-6 h-6 text-ink" />
              <h3 className="font-bold text-sm text-ink">Ekspor Cadangan</h3>
              <p className="label-mono text-xs text-ink-2">
                Unduh seluruh data pengalaman kerja dan portofolio dalam file JSON.
              </p>
              <button
                type="button"
                onClick={exportDataJson}
                className="btn-primary w-full text-xs"
              >
                Unduh JSON
              </button>
            </div>

            <div className="p-5 border border-rule space-y-3" style={{ backgroundColor: 'var(--paper-2)' }}>
              <Upload className="w-6 h-6 text-ink" />
              <h3 className="font-bold text-sm text-ink">Impor Cadangan</h3>
              <p className="label-mono text-xs text-ink-2">
                Pulihkan atau perbarui data portofolio dari file JSON.
              </p>
              <button
                type="button"
                onClick={() => setShowImportBox(!showImportBox)}
                className="btn-primary w-full text-xs"
                style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
              >
                {showImportBox ? 'Tutup Form' : 'Buka Form'}
              </button>
            </div>

            <div className="p-5 border border-rule space-y-3" style={{ backgroundColor: 'var(--paper-2)' }}>
              <RefreshCw className="w-6 h-6 text-ink" />
              <h3 className="font-bold text-sm text-ink">Muat Ulang Server</h3>
              <p className="label-mono text-xs text-ink-2">
                Ambil ulang data terbaru langsung dari database Supabase.
              </p>
              <button
                type="button"
                onClick={() => refetchAllData()}
                className="btn-primary w-full text-xs"
              >
                Muat Ulang
              </button>
            </div>
          </div>

          {showImportBox && (
            <div className="p-6 border border-rule space-y-3" style={{ backgroundColor: 'var(--paper)' }}>
              <h3 className="font-bold text-sm text-ink">
                Tempelkan Teks JSON Cadangan:
              </h3>
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"experiences": [...], "portfolioItems": [...]}'
                className="input-swiss font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleImportSubmit}
                className="btn-primary"
              >
                Proses Impor Data
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 5: PROFIL SITUS
          ======================================================== */}
      {currentAdminTab === 'profile' && (
        <form onSubmit={handleProfileSave} className="space-y-6 max-w-3xl">
          <div className="p-6 border border-rule space-y-4" style={{ backgroundColor: 'var(--paper)' }}>
            <h3 className="font-bold text-sm text-ink border-b border-rule pb-2">
              Identitas Pemilik
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block label-mono text-ink mb-1">Nama Lengkap</label>
                <input value={profileForm.name} onChange={setPF('name')} className="input-swiss" />
              </div>
              <div>
                <label className="block label-mono text-ink mb-1">Nama Singkat (Hero)</label>
                <input value={profileForm.shortName} onChange={setPF('shortName')} className="input-swiss" />
              </div>
              <div className="sm:col-span-2">
                <label className="block label-mono text-ink mb-1">Jabatan / Headline</label>
                <input value={profileForm.title} onChange={setPF('title')} className="input-swiss" />
              </div>
              <div className="sm:col-span-2">
                <label className="block label-mono text-ink mb-1">Tagline Pengantar Hero (Maks ~38 kata)</label>
                <input value={profileForm.tagline} onChange={setPF('tagline')} className="input-swiss" />
              </div>
              <div className="sm:col-span-2">
                <label className="block label-mono text-ink mb-1">Bio Lengkap (Halaman Tentang &amp; CV)</label>
                <textarea value={profileForm.bio} onChange={setPF('bio')} rows={5} className="input-swiss resize-y" />
              </div>
              <div className="sm:col-span-2">
                <label className="block label-mono text-ink mb-1">Status Ketersediaan Kerja (Status Bar Profil)</label>
                <div className="flex gap-2 mb-2">
                  <select
                    value={profileForm.availabilityStatus}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, availabilityStatus: e.target.value }))}
                    className="input-swiss bg-paper cursor-pointer py-1 text-xs"
                  >
                    <option value="OPEN TO WORK">● OPEN TO WORK (Siap menerima pekerjaan/proyek penuh)</option>
                    <option value="OPEN FOR CONTRACT / INTERN">◐ OPEN FOR CONTRACT / INTERN (Sedang magang/kontrak, fleksibel)</option>
                    <option value="LIMITED AVAILABILITY">◐ LIMITED AVAILABILITY (Jadwal padat, selektif freelance ringan)</option>
                    <option value="BUSY / FULL-TIME">■ BUSY / FULL-TIME (Jadwal penuh, tidak menerima side job/freelance)</option>
                    <option value="UNAVAILABLE">■ UNAVAILABLE (Tidak tersedia saat ini)</option>
                  </select>
                </div>
                <input
                  value={profileForm.availabilityStatus}
                  onChange={setPF('availabilityStatus')}
                  placeholder="Ketik status kustom atau pilih dari dropdown di atas"
                  className="input-swiss text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block label-mono text-ink mb-1">Status Pekerjaan / Peran Saat Ini (tampil di Status Bar Profil)</label>
                <input value={profileForm.currentRole} onChange={setPF('currentRole')} placeholder="DIGITAL MARKETING INTERN" className="input-swiss" />
              </div>
              <div className="sm:col-span-2">
                <label className="block label-mono text-ink mb-1">Mata Kuliah Relevan (pisahkan dengan koma)</label>
                <input value={profileForm.coursework} onChange={setPF('coursework')} placeholder="Riset Audiens, Strategi Kampanye Digital" className="input-swiss" />
              </div>
            </div>
          </div>

          {/* KARTU: RIWAYAT PENDIDIKAN DEDIKASI */}
          <div className="p-6 border border-rule space-y-4" style={{ backgroundColor: 'var(--paper)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-rule pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-ink shrink-0" />
                  <h3 className="font-bold text-sm text-ink">Riwayat Pendidikan</h3>
                </div>
                <p className="label-mono text-xs text-ink-2 mt-1">
                  Semua riwayat pendidikan formal akan muncul di dokumen CV ATS. Di beranda (homepage), hanya 1 pendidikan terakhir (#1 teratas) yang ditampilkan.
                </p>
              </div>
              <button
                type="button"
                onClick={addEducationRow}
                className="btn-swiss text-xs flex items-center gap-1.5 py-1.5 px-3 self-start sm:self-auto shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Pendidikan</span>
              </button>
            </div>

            {educationForm.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-rule text-xs text-ink-2">
                Belum ada data pendidikan. Klik "+ Tambah Pendidikan" untuk menambahkan riwayat studi Anda.
              </div>
            ) : (
              <div className="space-y-4">
                {educationForm.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-4 border border-rule space-y-3"
                    style={{ backgroundColor: 'var(--paper-2)' }}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-rule pb-2">
                      <div className="flex items-center gap-2">
                        <span className={`label-mono text-xs px-2 py-0.5 border ${
                          idx === 0
                            ? 'bg-paper text-ink border-rule font-bold'
                            : 'bg-paper text-ink-2 border-rule'
                        }`}>
                          {idx === 0 ? '#1 (Pendidikan Terakhir — Tampil di Beranda)' : `#${idx + 1}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveEducationRow(idx, 'up')}
                          title="Geser ke atas"
                          className="p-1 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === educationForm.length - 1}
                          onClick={() => moveEducationRow(idx, 'down')}
                          title="Geser ke bawah"
                          className="p-1 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeEducationRow(item.id)}
                          title="Hapus baris pendidikan"
                          className="p-1 border border-rule text-ink hover:bg-paper ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block label-mono text-ink mb-1">Nama Institusi / Universitas / Sekolah</label>
                        <input
                          value={item.institution}
                          onChange={e => updateEducationRow(item.id, 'institution', e.target.value)}
                          placeholder="Politeknik Negeri Jember (PSDKU Sidoarjo)"
                          className="input-swiss text-xs"
                        />
                      </div>
                      <div>
                        <label className="block label-mono text-ink mb-1">Jenjang &amp; Jurusan / Program Studi</label>
                        <input
                          value={item.degree}
                          onChange={e => updateEducationRow(item.id, 'degree', e.target.value)}
                          placeholder="D4 Teknik Informatika"
                          className="input-swiss text-xs"
                        />
                      </div>
                      <div>
                        <label className="block label-mono text-ink mb-1">Tahun / Periode Studi (CV ATS)</label>
                        <input
                          value={item.period}
                          onChange={e => updateEducationRow(item.id, 'period', e.target.value)}
                          placeholder="2021 – 2025"
                          className="input-swiss text-xs"
                        />
                      </div>
                      <div>
                        <label className="block label-mono text-ink mb-1">Lokasi Kampus / Kota</label>
                        <input
                          value={item.location}
                          onChange={e => updateEducationRow(item.id, 'location', e.target.value)}
                          placeholder="Sidoarjo, Jawa Timur"
                          className="input-swiss text-xs"
                        />
                      </div>
                      <div>
                        <label className="block label-mono text-ink mb-1">Nilai IPK / GPA Kumulatif</label>
                        <input
                          value={item.gpa || ''}
                          onChange={e => updateEducationRow(item.id, 'gpa', e.target.value)}
                          placeholder="3.79"
                          className="input-swiss text-xs"
                        />
                      </div>
                      <div>
                        <label className="block label-mono text-ink mb-1">Fokus Studi / Aktivitas / Catatan</label>
                        <input
                          value={item.activities || ''}
                          onChange={e => updateEducationRow(item.id, 'activities', e.target.value)}
                          placeholder="Fokus: Rekayasa Perangkat Lunak, Multimedia &amp; Pengembangan Sistem"
                          className="input-swiss text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border border-rule space-y-4" style={{ backgroundColor: 'var(--paper)' }}>
            <h3 className="font-bold text-sm text-ink border-b border-rule pb-2">
              Kontak &amp; Tautan Sosial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block label-mono text-ink mb-1">Email Publik</label>
                <input type="email" value={profileForm.email} onChange={setPF('email')} className="input-swiss" />
              </div>
              <div>
                <label className="block label-mono text-ink mb-1">No. WhatsApp</label>
                <input value={profileForm.phone} onChange={setPF('phone')} className="input-swiss" />
              </div>
              <div className="sm:col-span-2">
                <label className="block label-mono text-ink mb-1">Lokasi Domisili</label>
                <input value={profileForm.location} onChange={setPF('location')} className="input-swiss" />
              </div>
              <div>
                <label className="block label-mono text-ink mb-1">LinkedIn (URL)</label>
                <input value={profileForm.linkedin} onChange={setPF('linkedin')} className="input-swiss" />
              </div>
              <div>
                <label className="block label-mono text-ink mb-1">GitHub (URL)</label>
                <input value={profileForm.github} onChange={setPF('github')} className="input-swiss" />
              </div>
              <div>
                <label className="block label-mono text-ink mb-1">Instagram (URL)</label>
                <input value={profileForm.instagram} onChange={setPF('instagram')} className="input-swiss" />
              </div>
              <div>
                <label className="block label-mono text-ink mb-1">YouTube (URL)</label>
                <input value={profileForm.youtube} onChange={setPF('youtube')} className="input-swiss" />
              </div>
              <div className="sm:col-span-2">
                <label className="block label-mono text-ink mb-1">Website URL</label>
                <input value={profileForm.website} onChange={setPF('website')} className="input-swiss" />
              </div>
            </div>
          </div>

          {/* KARTU: KATEGORI KEAHLIAN & PERANGKAT KERJA (DENGAN CRUD LENGKAP) */}
          <div className="p-6 border border-rule space-y-4" style={{ backgroundColor: 'var(--paper)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-rule pb-3">
              <div>
                <h3 className="font-bold text-sm text-ink">Kategori Keahlian &amp; Perangkat Kerja</h3>
              </div>
              <button
                type="button"
                onClick={addSkillCategoryRow}
                className="btn-swiss text-xs flex items-center gap-1.5 py-1.5 px-3 self-start sm:self-auto shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori</span>
              </button>
            </div>

            {skillCategoryForm.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-rule text-xs text-ink-2">
                Belum ada kategori keahlian. Klik &quot;+ Tambah Kategori&quot; untuk menambahkan kategori keahlian Anda.
              </div>
            ) : (
              <div className="space-y-4">
                {skillCategoryForm.map((cat, idx) => (
                  <div
                    key={cat.id}
                    className="p-4 border border-rule space-y-3"
                    style={{ backgroundColor: 'var(--paper-2)' }}
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-rule pb-2">
                      <div className="flex items-center gap-2 flex-1 max-w-md">
                        <span className="label-mono text-xs px-2 py-0.5 border bg-paper text-ink border-rule">
                          #{idx + 1}
                        </span>
                        <input
                          value={cat.name}
                          onChange={(e) => updateSkillCategoryRow(cat.id, 'name', e.target.value)}
                          placeholder="Nama Kategori (mis. Video Editing &amp; Multimedia)"
                          className="input-swiss text-xs font-bold"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSkillCategoryRow(idx, 'up')}
                          title="Geser ke atas"
                          className="p-1 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === skillCategoryForm.length - 1}
                          onClick={() => moveSkillCategoryRow(idx, 'down')}
                          title="Geser ke bawah"
                          className="p-1 border border-rule text-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-paper"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSkillCategoryRow(cat.id)}
                          title="Hapus kategori keahlian"
                          className="p-1 border border-rule text-ink hover:bg-paper ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block label-mono text-ink mb-1">
                        Daftar Keahlian / Tool (pisahkan dengan koma)
                      </label>
                      <textarea
                        value={cat.rawSkills}
                        onChange={(e) => updateSkillCategoryRow(cat.id, 'rawSkills', e.target.value)}
                        rows={2}
                        placeholder="Premiere Pro, After Effects, DaVinci Resolve, CapCut Pro"
                        className="input-swiss text-xs resize-y"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KARTU 1: SERTIFIKASI PROFESIONAL RESMI */}
          <div className="p-6 border border-rule space-y-4" style={{ backgroundColor: 'var(--paper)' }}>
            <div className="flex items-center justify-between border-b border-rule pb-2">
              <div>
                <h3 className="font-bold text-sm text-ink">Sertifikasi Resmi (Lisensi &amp; Profesi)</h3>
                <p className="label-mono text-xs text-ink-2 mt-0.5">Sertifikasi keahlian, lisensi BNSP/industri, atau ujian profesi.</p>
              </div>
              <button
                type="button"
                onClick={() => addCertRow('sertifikat')}
                className="btn-primary text-xs py-1 px-3"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Sertifikat
              </button>
            </div>

            {certForm.filter(c => c.type !== 'pelatihan').length === 0 ? (
              <p className="label-mono text-xs text-ink-2 py-2">Belum ada sertifikat ditambahkan.</p>
            ) : (
              certForm
                .filter(c => c.type !== 'pelatihan')
                .map((cert) => (
                  <div key={cert.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 border border-rule" style={{ backgroundColor: 'var(--paper-2)' }}>
                    <input
                      value={cert.name}
                      onChange={(e) => updateCertRow(cert.id, 'name', e.target.value)}
                      placeholder="Nama Sertifikasi (mis: BNSP Digital Marketing)"
                      className="input-swiss sm:col-span-5"
                    />
                    <input
                      value={cert.issuer}
                      onChange={(e) => updateCertRow(cert.id, 'issuer', e.target.value)}
                      placeholder="Lembaga Penerbit"
                      className="input-swiss sm:col-span-3"
                    />
                    <input
                      value={cert.year}
                      onChange={(e) => updateCertRow(cert.id, 'year', e.target.value)}
                      placeholder="Tahun Perolehan"
                      className="input-swiss sm:col-span-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertRow(cert.id)}
                      className="sm:col-span-2 btn-primary text-xs py-1 px-2"
                      style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                    <input
                      value={cert.validity || ''}
                      onChange={(e) => updateCertRow(cert.id, 'validity', e.target.value)}
                      placeholder="Masa Berlaku / Kadaluarsa (mis: Berlaku s.d. Nov 2027 atau Seumur Hidup)"
                      className="input-swiss sm:col-span-6"
                    />
                    <input
                      value={cert.url || ''}
                      onChange={(e) => updateCertRow(cert.id, 'url', e.target.value)}
                      placeholder="Link Kredensial / Verifikasi Sertifikat (URL)"
                      className="input-swiss sm:col-span-6"
                    />
                    <input
                      value={cert.description || ''}
                      onChange={(e) => updateCertRow(cert.id, 'description', e.target.value)}
                      placeholder="Deskripsi ringkas / kompetensi yang diujikan"
                      className="input-swiss sm:col-span-12"
                    />
                  </div>
                ))
            )}
          </div>

          {/* KARTU 2: PELATIHAN, WORKSHOP & BOOTCAMP */}
          <div className="p-6 border border-rule space-y-4" style={{ backgroundColor: 'var(--paper)' }}>
            <div className="flex items-center justify-between border-b border-rule pb-2">
              <div>
                <h3 className="font-bold text-sm text-ink">Pelatihan, Workshop &amp; Bootcamp</h3>
                <p className="label-mono text-xs text-ink-2 mt-0.5">Program pengembangan keahlian, durasi jam/minggu, dan intensif belajar.</p>
              </div>
              <button
                type="button"
                onClick={() => addCertRow('pelatihan')}
                className="btn-primary text-xs py-1 px-3"
              >
                <Plus className="w-3.5 h-3.5" /> + Tambah Pelatihan
              </button>
            </div>

            {certForm.filter(c => c.type === 'pelatihan').length === 0 ? (
              <p className="label-mono text-xs text-ink-2 py-2">Belum ada pelatihan ditambahkan.</p>
            ) : (
              certForm
                .filter(c => c.type === 'pelatihan')
                .map((pelatihan) => (
                  <div key={pelatihan.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 border border-rule" style={{ backgroundColor: 'var(--paper-2)' }}>
                    <input
                      value={pelatihan.name}
                      onChange={(e) => updateCertRow(pelatihan.id, 'name', e.target.value)}
                      placeholder="Nama Program Pelatihan / Workshop"
                      className="input-swiss sm:col-span-5"
                    />
                    <input
                      value={pelatihan.issuer}
                      onChange={(e) => updateCertRow(pelatihan.id, 'issuer', e.target.value)}
                      placeholder="Penyelenggara / Platform"
                      className="input-swiss sm:col-span-3"
                    />
                    <input
                      value={pelatihan.year}
                      onChange={(e) => updateCertRow(pelatihan.id, 'year', e.target.value)}
                      placeholder="Tahun"
                      className="input-swiss sm:col-span-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeCertRow(pelatihan.id)}
                      className="sm:col-span-2 btn-primary text-xs py-1 px-2"
                      style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </button>
                    <input
                      value={pelatihan.period || ''}
                      onChange={(e) => updateCertRow(pelatihan.id, 'period', e.target.value)}
                      placeholder="Periode Pelaksanaan (mis: Mei 2024 atau Agu 2024 - Nov 2024)"
                      className="input-swiss sm:col-span-4"
                    />
                    <input
                      value={pelatihan.duration || ''}
                      onChange={(e) => updateCertRow(pelatihan.id, 'duration', e.target.value)}
                      placeholder="Durasi Total (mis: 3 Bulan / 48 Jam)"
                      className="input-swiss sm:col-span-4"
                    />
                    <input
                      value={pelatihan.url || ''}
                      onChange={(e) => updateCertRow(pelatihan.id, 'url', e.target.value)}
                      placeholder="Link Portofolio Proyek / Bukti Kelulusan (URL)"
                      className="input-swiss sm:col-span-4"
                    />
                    <input
                      value={pelatihan.description || ''}
                      onChange={(e) => updateCertRow(pelatihan.id, 'description', e.target.value)}
                      placeholder="Materi utama yang dipelajari selama pelatihan"
                      className="input-swiss sm:col-span-12"
                    />
                  </div>
                ))
            )}
          </div>

          {profileStatus && (
            <div className="border-l-2 border-ink pl-3 py-1 label-mono text-xs text-ink">
              {profileStatus.msg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSavingProfile}
            className="btn-primary"
          >
            {isSavingProfile ? 'MENYIMPAN…' : 'SIMPAN PROFIL'}
          </button>
        </form>
      )}

      {/* ========================================================
          TAB 6: AKUN LOGIN
          ======================================================== */}
      {currentAdminTab === 'account' && (
        <div className="space-y-6 max-w-xl">
          {/* Foto Profil */}
          <div className="p-6 border border-rule space-y-4" style={{ backgroundColor: 'var(--paper)' }}>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Camera className="w-4 h-4 text-ink" />
              Foto Profil Pemilik
            </h3>
            <p className="label-mono text-xs text-ink-2">
              Format JPG/PNG, rasio 4:5 di halaman Tentang.
            </p>

            <div className="flex items-center gap-4">
              <div className="w-20 h-24 border border-rule flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--paper-2)' }}>
                {avatarPreview || avatarUrl ? (
                  <img src={avatarPreview || avatarUrl || ''} alt="Foto profil" className="w-full h-full object-cover" />
                ) : (
                  <UserCog className="w-8 h-8 text-ink-2" />
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileSelect}
                  className="hidden"
                  id="avatar-upload-input"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('avatar-upload-input')?.click()}
                  className="btn-primary text-xs py-1.5 px-3"
                  style={{ backgroundColor: 'transparent', color: 'var(--ink)', border: '1px solid var(--rule)' }}
                >
                  PILIH FOTO BARU
                </button>

                {avatarFile && (
                  <button
                    type="button"
                    onClick={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                    className="btn-primary text-xs py-1.5 px-3 block"
                  >
                    {isUploadingAvatar ? 'MENGUNGGAH…' : 'SIMPAN FOTO INI'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Ganti Email */}
          <form onSubmit={handleEmailUpdateSubmit} className="p-6 border border-rule space-y-3" style={{ backgroundColor: 'var(--paper)' }}>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Mail className="w-4 h-4 text-ink" />
              Ganti Email Login
            </h3>
            <p className="label-mono text-xs text-ink-2">
              Email saat ini: <strong>{currentUser?.email}</strong>
            </p>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email baru…"
              required
              className="input-swiss"
            />
            {emailUpdateStatus && (
              <div className="border-l-2 border-ink pl-3 py-1 label-mono text-xs text-ink">
                {emailUpdateStatus.msg}
              </div>
            )}
            <button
              type="submit"
              disabled={isUpdatingEmail}
              className="btn-primary"
            >
              {isUpdatingEmail ? 'MEMPROSES…' : 'PERBARUI EMAIL'}
            </button>
          </form>

          {/* Ganti Password */}
          <form onSubmit={handlePasswordUpdateSubmit} className="p-6 border border-rule space-y-3" style={{ backgroundColor: 'var(--paper)' }}>
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-ink" />
              Ganti Kata Sandi
            </h3>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kata sandi baru (min. 8 karakter)…"
                required
                minLength={8}
                className="input-swiss pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-2 hover:text-ink cursor-pointer bg-transparent border-none"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi kata sandi baru…"
              required
              minLength={8}
              className="input-swiss"
            />
            {passwordUpdateStatus && (
              <div className="border-l-2 border-ink pl-3 py-1 label-mono text-xs text-ink">
                {passwordUpdateStatus.msg}
              </div>
            )}
            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="btn-primary"
            >
              {isUpdatingPassword ? 'MEMPROSES…' : 'PERBARUI KATA SANDI'}
            </button>
          </form>
        </div>
      )}

      {/* Modals */}
      <PortfolioModal
        isOpen={portfolioModalOpen}
        onClose={() => setPortfolioModalOpen(false)}
        itemToEdit={itemToEdit}
      />

      <ExperienceModal
        isOpen={experienceModalOpen}
        onClose={() => setExperienceModalOpen(false)}
        experienceToEdit={experienceToEdit}
      />

      <MarketingModal
        isOpen={marketingModalOpen}
        onClose={() => setMarketingModalOpen(false)}
        itemToEdit={marketingToEdit}
        portfolioItems={portfolioItems}
        onSave={async (data) => {
          if (marketingToEdit) {
            return await updateMarketingResult(marketingToEdit.id, data);
          } else {
            return await addMarketingResult(data);
          }
        }}
      />

      <AtsCvModal
        isOpen={isAtsModalOpen}
        onClose={() => setIsAtsModalOpen(false)}
      />
    </div>
  );
};
