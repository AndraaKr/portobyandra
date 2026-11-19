import { jsPDF } from 'jspdf';
import { EducationItem, Experience, PortfolioItem, SiteProfile, SkillCategory } from '../types';

export interface AtsCvOptions {
  language?: 'id' | 'en';
  emphasis?: 'all' | 'marketing' | 'tech';
  includeProjects?: boolean;
}

const FALLBACK_PROFILE: SiteProfile = {
  avatarUrl: null,
  name: '',
  shortName: '',
  title: '',
  tagline: '',
  bio: '',
  email: '',
  phone: '',
  location: '',
  education: '',
  currentRole: '',
  socials: { github: '', linkedin: '', instagram: '', youtube: '', website: '' },
  skills: { uiux: [], frontend: [], multimedia: [], marketing: [] },
  certificates: [],
};

export interface ParsedEducation {
  institution: string;
  degree: string;
  gpa: string;
  period: string;
  location: string;
  bullets: string[];
}

/**
 * Memecah string pendidikan tunggal menjadi struktur bagian Pendidikan ala CV ATS referensi.
 * Mendukung format seperti:
 * - "D4 Teknik Informatika — Politeknik Elektronika Negeri Surabaya (2021–2025)"
 * - "Universitas X | S1 Teknik Informatika | IPK: 3.85/4.00 | Agu 2021 - Nov 2025 | Surabaya"
 * - Baris baru (Enter) setelah baris pertama akan dianggap sebagai bullet poin aktivitas/pencapaian.
 */
export const parseEducationText = (
  rawEducation: string,
  fallbackLocation = '',
  overridePeriod = ''
): ParsedEducation => {
  const lines = rawEducation
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      institution: '',
      degree: '',
      gpa: '',
      period: overridePeriod?.trim() || '2021 – 2025',
      location: fallbackLocation,
      bullets: [],
    };
  }

  const firstLine = lines[0];
  const bullets = lines.slice(1).map(b => b.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean);

  // Jika dipisahkan dengan pipa "|"
  if (firstLine.includes('|')) {
    const parts = firstLine.split('|').map(p => p.trim()).filter(Boolean);
    const parsedPeriod = parts[3] || overridePeriod || '';
    return {
      institution: parts[0] || '',
      degree: parts[1] || '',
      gpa: parts[2] || '',
      period: parsedPeriod ? normalizePeriodString(parsedPeriod) : (overridePeriod?.trim() || '2021 – 2025'),
      location: parts[4] || fallbackLocation,
      bullets,
    };
  }

  let working = firstLine;
  let period = overridePeriod?.trim() || '';
  let gpa = '';

  // 1. Ekstrak periode dalam kurung di akhir, mis: (2021 - 2025) atau (Agu 2021 - Nov 2025) atau (Lulus 2025)
  const periodMatch = working.match(/\(([^)]*\d{4}[^)]*)\)\s*$/);
  if (periodMatch) {
    if (!period) period = periodMatch[1].trim();
    working = working.slice(0, periodMatch.index).trim();
  }

  // 2. Ekstrak rentang tahun eksplisit di dalam teks, mis: 2021 - 2025 atau 2021–2025
  if (!period) {
    const rangeMatch = working.match(/\b((?:(?:Jan|Feb|Mar|Apr|Mei|May|Jun|Jul|Agu|Aug|Sep|Okt|Oct|Nov|Des|Dec)[a-z]*\s+)?(?:19|20)\d{2}\s*(?:—|–|-|s\/d|to)\s*(?:(?:Jan|Feb|Mar|Apr|Mei|May|Jun|Jul|Agu|Aug|Sep|Okt|Oct|Nov|Des|Dec)[a-z]*\s+)?(?:(?:19|20)\d{2}|Sekarang|Present))\b/i);
    if (rangeMatch) {
      period = rangeMatch[1].trim();
      working = working.replace(rangeMatch[0], '').trim();
    }
  }

  // 3. Normalisasi periode agar selalu format "dari tahun berapa sampai berapa" (misal: "2021 – 2025")
  period = normalizePeriodString(period);

  // Ekstrak IPK / GPA jika ada di dalam teks
  const gpaMatch = working.match(/(?:IPK|GPA)\s*:?\s*([0-9.,]+(?:\/[0-9.,]+)?)/i);
  if (gpaMatch) {
    gpa = `IPK: ${gpaMatch[1]}`;
    working = working.replace(gpaMatch[0], '').replace(/[,;|\s]+$/, '').trim();
  }

  // Bersihkan karakter pemisah di ujung string setelah pembersihan
  working = working.replace(/[,;|\-—–\s]+$/, '').trim();

  // Pisahkan antara Gelar/Jurusan dan Nama Institusi jika ada tanda hubung " — " atau " - "
  const dashParts = working.split(/\s+(?:—|–|-)\s+/);
  let institution = working;
  let degree = '';

  if (dashParts.length >= 2) {
    const firstPart = dashParts[0].trim();
    const secondPart = dashParts.slice(1).join(' - ').trim();
    // Deteksi mana yang merupakan nama institusi vs jurusan/gelar
    if (/^(D3|D4|S1|S2|S3|Sarjana|Diploma|Bachelor|Master|Teknik|Ilmu|Sistem|Manajemen|Desain)/i.test(firstPart)) {
      degree = firstPart;
      institution = secondPart;
    } else {
      institution = firstPart;
      degree = secondPart;
    }
  }

  return {
    institution,
    degree,
    gpa,
    period: period || '2021 – 2025',
    location: fallbackLocation,
    bullets,
  };
};

/**
 * Normalisasi format rentang tahun agar menjadi "YYYY – YYYY" (misal "2021 – 2025")
 */
function normalizePeriodString(raw: string): string {
  if (!raw || !raw.trim()) return '2021 – 2025';
  const clean = raw.trim();

  // Jika sudah berupa rentang tahun seperti "2021 - 2025" atau "2021–2025"
  const rangeMatch = clean.match(/^(\d{4})\s*(?:—|–|-)\s*(\d{4}|Sekarang|Present)$/i);
  if (rangeMatch) {
    return `${rangeMatch[1]} – ${rangeMatch[2]}`;
  }

  // Jika berupa bulan & tahun seperti "Agu 2021 - Nov 2025"
  if (/(?:—|–|-)/.test(clean)) {
    return clean.replace(/\s*(?:—|–|-)\s*/g, ' – ');
  }

  // Jika berupa "Lulus 2025" atau angka tahun tunggal "2025", estimasikan rentang 4 tahun studi sarjana/diploma
  const singleYearMatch = clean.match(/\b(20\d{2})\b/);
  if (singleYearMatch) {
    const endYear = parseInt(singleYearMatch[1], 10);
    const startYear = endYear - 4;
    return `${startYear} – ${endYear}`;
  }

  return clean;
}

export const generateAtsCvPdf = (
  profile: SiteProfile | null | undefined,
  experiences: Experience[],
  portfolioItems: PortfolioItem[],
  options: AtsCvOptions = {}
): jsPDF => {
  const safeProfile: SiteProfile = profile ?? FALLBACK_PROFILE;
  const {
    language = 'id',
    includeProjects = true,
  } = options;

  const isId = language === 'id';

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 16;
  const marginTop = 16;
  const marginBottom = 16;
  const contentWidth = pageWidth - marginX * 2;
  const centerX = pageWidth / 2;

  let currentY = marginTop;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      return true;
    }
    return false;
  };

  // Helper menggambar judul section huruf kapital tebal + garis horizontal di bawahnya (persis referensi)
  const drawSectionHeader = (title: string) => {
    checkPageBreak(13);
    currentY += 3.5;
    doc.setFont('times', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 15, 15);
    doc.text(title.toUpperCase(), marginX, currentY);
    currentY += 1.6;
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(0.4);
    doc.line(marginX, currentY, marginX + contentWidth, currentY);
    currentY += 4.5;
  };

  // Helper menggambar bullet point dengan hanging indent rapi
  const drawBulletList = (items: string[]) => {
    const bulletIndent = 3.5;
    const textIndent = 7.2;
    const lineHeight = 4.1;

    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);

    items.forEach(rawItem => {
      const cleaned = rawItem.replace(/^[•\-*]\s*/, '').trim();
      if (!cleaned) return;
      const wrappedLines = doc.splitTextToSize(cleaned, contentWidth - textIndent);
      checkPageBreak(wrappedLines.length * lineHeight + 1);
      doc.text('•', marginX + bulletIndent, currentY);
      doc.text(wrappedLines, marginX + textIndent, currentY);
      currentY += wrappedLines.length * lineHeight + 0.4;
    });
  };

  // =========================================================================
  // 1. HEADER TENGAH: Nama Lengkap -> Email | Nomor | LinkedIn | Porto -> Domisili
  // =========================================================================
  doc.setFont('times', 'normal');
  doc.setFontSize(20);
  doc.setTextColor(15, 15, 15);
  const fullName = (safeProfile.name || (isId ? 'NAMA LENGKAP' : 'FULL NAME')).toUpperCase();
  doc.text(fullName, centerX, currentY, { align: 'center' });
  currentY += 6;

  // Baris Kontak & Tautan (Email | Nomor | LinkedIn | Link Porto) berada di tengah
  // Format bersih ATS: Tanpa warna biru (warna hitam/ink standar), tautan dapat diklik dan bergaris bawah
  interface ContactSegment {
    text: string;
    isLink: boolean;
    targetUrl?: string;
  }
  const segments: ContactSegment[] = [];
  if (safeProfile.email) {
    segments.push({
      text: safeProfile.email.trim(),
      isLink: true,
      targetUrl: `mailto:${safeProfile.email.trim()}`,
    });
  }
  if (safeProfile.phone) {
    segments.push({
      text: safeProfile.phone.trim(),
      isLink: false,
    });
  }
  if (safeProfile.socials?.linkedin) {
    const rawLinkedin = safeProfile.socials.linkedin.trim();
    const linkedinTarget = rawLinkedin.startsWith('http') ? rawLinkedin : `https://${rawLinkedin}`;
    segments.push({
      text: rawLinkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, ''),
      isLink: true,
      targetUrl: linkedinTarget,
    });
  }
  const portfolioLink = safeProfile.socials?.website || safeProfile.socials?.github;
  if (portfolioLink) {
    const rawPorto = portfolioLink.trim();
    const portoTarget = rawPorto.startsWith('http') ? rawPorto : `https://${rawPorto}`;
    segments.push({
      text: rawPorto.replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, ''),
      isLink: true,
      targetUrl: portoTarget,
    });
  }

  if (segments.length > 0) {
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    const separator = '  |  ';
    const sepWidth = doc.getTextWidth(separator);
    const totalWidth =
      segments.reduce((acc, seg) => acc + doc.getTextWidth(seg.text), 0) +
      sepWidth * (segments.length - 1);

    if (totalWidth <= contentWidth) {
      let startX = centerX - totalWidth / 2;
      segments.forEach((seg, idx) => {
        const segW = doc.getTextWidth(seg.text);
        doc.setTextColor(20, 20, 20);
        doc.text(seg.text, startX, currentY);

        // Jika tautan (email, linkedin, porto), tambahkan garis bawah & clickable link (tanpa warna biru)
        if (seg.isLink && seg.targetUrl) {
          doc.setDrawColor(20, 20, 20);
          doc.setLineWidth(0.2);
          doc.line(startX, currentY + 0.4, startX + segW, currentY + 0.4);
          doc.link(startX, currentY - 3.2, segW, 4.0, { url: seg.targetUrl });
        }

        startX += segW;

        if (idx < segments.length - 1) {
          doc.setTextColor(80, 80, 80);
          doc.text(separator, startX, currentY);
          startX += sepWidth;
        }
      });
      currentY += 4.5;
    } else {
      // Fallback jika terlalu panjang: cetak per segmen dengan garis bawah
      let lineX = marginX;
      segments.forEach((seg, idx) => {
        const segW = doc.getTextWidth(seg.text);
        doc.setTextColor(20, 20, 20);
        doc.text(seg.text, lineX, currentY);

        if (seg.isLink && seg.targetUrl) {
          doc.setDrawColor(20, 20, 20);
          doc.setLineWidth(0.2);
          doc.line(lineX, currentY + 0.4, lineX + segW, currentY + 0.4);
          doc.link(lineX, currentY - 3.2, segW, 4.0, { url: seg.targetUrl });
        }

        lineX += segW;
        if (idx < segments.length - 1) {
          doc.setTextColor(80, 80, 80);
          doc.text(separator, lineX, currentY);
          lineX += sepWidth;
        }
      });
      currentY += 4.5;
    }
  }

  // Baris Domisili / Lokasi di tengah
  if (safeProfile.location) {
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    doc.text(safeProfile.location.trim(), centerX, currentY, { align: 'center' });
    currentY += 3.8;
  }

  // Garis pemisah di bawah header
  currentY += 1;
  doc.setDrawColor(30, 30, 30);
  doc.setLineWidth(0.45);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);
  currentY += 5;

  // =========================================================================
  // 2. DESKRIPSI DIRI (Langsung isi tanpa judul section)
  // =========================================================================
  if (safeProfile.bio) {
    doc.setFont('times', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(20, 20, 20);
    const splitBio = doc.splitTextToSize(safeProfile.bio.trim(), contentWidth);
    checkPageBreak(splitBio.length * 4.2 + 2);
    doc.text(splitBio, marginX, currentY);
    currentY += splitBio.length * 4.2 + 1.5;
  }

  // =========================================================================
  // 3. PENDIDIKAN (Mendukung banyak riwayat pendidikan dari Admin)
  // =========================================================================
  const eduList: EducationItem[] =
    safeProfile.educations && safeProfile.educations.length > 0
      ? safeProfile.educations
      : safeProfile.education
        ? [
            {
              id: 'edu-default',
              institution: parseEducationText(safeProfile.education, safeProfile.location).institution || safeProfile.education,
              degree: parseEducationText(safeProfile.education, safeProfile.location).degree || '',
              period: safeProfile.educationPeriod || parseEducationText(safeProfile.education, safeProfile.location).period || '2021 – 2025',
              location: safeProfile.location || 'Surabaya, Indonesia',
              gpa: safeProfile.gpa || '3.79',
              activities: '',
            },
          ]
        : [];

  if (eduList.length > 0) {
    drawSectionHeader(isId ? 'PENDIDIKAN' : 'EDUCATION');

    eduList.forEach((eduItem) => {
      checkPageBreak(12);

      const institutionText = eduItem.institution;
      const locationText = eduItem.location || safeProfile.location || 'Surabaya, Indonesia';
      const periodText = eduItem.period || '2021 – 2025';
      const gpaText = eduItem.gpa
        ? (/^(ipk|gpa)\b/i.test(eduItem.gpa) ? eduItem.gpa : `IPK: ${eduItem.gpa}`)
        : '';

      // Baris 1: Nama Universitas/Institusi (Kiri, Bold) & Lokasi (Kanan, Bold)
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 15, 15);
      doc.text(institutionText, marginX, currentY);

      if (locationText) {
        doc.text(locationText, marginX + contentWidth, currentY, { align: 'right' });
      }
      currentY += 4.2;

      // Baris 2: Gelar/Program Studi (Kiri, Italic) + IPK (Normal) & Periode Tahun (Kanan, Bold - tepat di bawah Lokasi)
      let leftCursor = marginX;
      if (eduItem.degree) {
        doc.setFont('times', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(25, 25, 25);
        doc.text(eduItem.degree, leftCursor, currentY);
        leftCursor += doc.getTextWidth(eduItem.degree);
      }
      if (gpaText) {
        doc.setFont('times', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(25, 25, 25);
        const gpaLabel = eduItem.degree ? `  |  ${gpaText}` : gpaText;
        doc.text(gpaLabel, leftCursor, currentY);
      }
      if (periodText) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 15, 15);
        doc.text(periodText, marginX + contentWidth, currentY, { align: 'right' });
      }
      currentY += 4.8;
    });
    currentY += 0.5;
  }

  // =========================================================================
  // 4. PENGALAMAN KERJA (Urutan baris persis referensi gambar)
  //    Baris 1: Nama Perusahaan/Organisasi (Bold Kiri) | Lokasi (Bold Kanan)
  //    Baris 2: Posisi/Jabatan (Italic Kiri)           | Periode (Bold Kanan)
  //    Diikuti daftar bullet poin tanggung jawab & pencapaian
  // =========================================================================
  if (experiences && experiences.length > 0) {
    drawSectionHeader(isId ? 'PENGALAMAN KERJA' : 'WORK EXPERIENCE');

    const sortedExperiences = [...experiences].sort((a, b) => (a.order || 0) - (b.order || 0));

    sortedExperiences.forEach(exp => {
      checkPageBreak(18);

      // Baris 1: Organisasi/Perusahaan (Bold Kiri) & Lokasi (Bold Kanan)
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 15, 15);
      doc.text(exp.organization, marginX, currentY);

      if (exp.location) {
        doc.text(exp.location, marginX + contentWidth, currentY, { align: 'right' });
      }
      currentY += 4.2;

      // Baris 2: Posisi/Role (Italic Kiri) & Periode (Bold Kanan)
      doc.setFont('times', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(25, 25, 25);
      doc.text(exp.role, marginX, currentY);

      if (exp.period) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 15, 15);
        doc.text(exp.period, marginX + contentWidth, currentY, { align: 'right' });
      }
      currentY += 4.4;

      // Pecah deskripsi menjadi poin-poin bullet (mendukung pisah baris Enter atau pisah kalimat)
      const rawLines = exp.description
        .split(/\r?\n/)
        .map(s => s.trim())
        .filter(Boolean);

      const bullets =
        rawLines.length > 1
          ? rawLines
          : exp.description
              .split(/(?<=[.!?])\s+/)
              .map(s => s.trim())
              .filter(Boolean);

      drawBulletList(bullets);
      currentY += 2;
    });
  }

  // =========================================================================
  // 5. PENGALAMAN TERKAIT / PROYEK (RELATED EXPERIENCES)
  // =========================================================================
  if (includeProjects && portfolioItems && portfolioItems.length > 0) {
    drawSectionHeader(isId ? 'PENGALAMAN TERKAIT & PROYEK' : 'RELATED EXPERIENCES');

    const selectedProjects = portfolioItems.slice(0, 3);

    selectedProjects.forEach(proj => {
      checkPageBreak(16);

      // Baris 1: Judul Proyek / Instansi (Bold Kiri) & Lokasi/Domisili (Bold Kanan)
      doc.setFont('times', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 15, 15);
      doc.text(proj.title, marginX, currentY);

      if (safeProfile.location) {
        doc.text(safeProfile.location, marginX + contentWidth, currentY, { align: 'right' });
      }
      currentY += 4.2;

      // Baris 2: Kategori / Peran (Italic Kiri) & Tahun Proyek (Bold Kanan)
      doc.setFont('times', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(25, 25, 25);
      doc.text(proj.category, marginX, currentY);

      const projDate = proj.createdAt
        ? new Date(proj.createdAt).toLocaleDateString(isId ? 'id-ID' : 'en-US', {
            month: 'short',
            year: 'numeric',
          })
        : '';
      if (projDate) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 15, 15);
        doc.text(projDate, marginX + contentWidth, currentY, { align: 'right' });
      }
      currentY += 4.4;

      const projBullets: string[] = [];
      if (proj.description) {
        projBullets.push(
          `${proj.description.trim()}${proj.metrics ? ` (${isId ? 'Pencapaian' : 'Result'}: ${proj.metrics})` : ''}`
        );
      }
      if (proj.tools && proj.tools.length > 0) {
        projBullets.push(`${isId ? 'Perangkat & Teknologi' : 'Tools'}: ${proj.tools.join(', ')}.`);
      }

      drawBulletList(projBullets);
      currentY += 1.8;
    });
  }

  // =========================================================================
  // 6. SERTIFIKASI DAN PELATIHAN (CERTIFICATIONS AND TRAINING)
  // Format referensi:
  // • Nama/Penerbit - Bidang/Materi (Kiri, Bold/Normal)      Tahun (Kanan, Bold)
  //   Kompetensi Utama: Deskripsi (Kiri, Normal)
  // =========================================================================
  const rawCerts = safeProfile.certificates || [];
  const allCerts = [
    ...rawCerts.filter(c => c.type !== 'pelatihan'),
    ...rawCerts.filter(c => c.type === 'pelatihan'),
  ];

  if (allCerts.length > 0) {
    drawSectionHeader(isId ? 'SERTIFIKASI DAN PELATIHAN' : 'CERTIFICATIONS & TRAINING');

    const bulletIndent = 3.5;
    const textIndent = 7.2;
    const lineHeight = 4.1;

    allCerts.forEach(item => {
      checkPageBreak(item.description ? 12 : 8);

      // Baris 1: Bullet + Judul (Bold + Link Underline bila ada URL) - Penyelenggara (Normal) (Sertifikat/Pelatihan) & Tanggal (Kanan)
      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text('•', marginX + bulletIndent, currentY);

      const titleText = (item.name || '').trim();
      const issuerPart = item.issuer && item.issuer.trim() ? ` - ${item.issuer.trim()}` : '';
      const typeLabel =
        item.type === 'pelatihan'
          ? isId
            ? ' (Pelatihan)'
            : ' (Training)'
          : isId
          ? ' (Sertifikat)'
          : ' (Certificate)';

      // Periode tanggal di kanan
      const dateText = (item.period || item.year || '').trim();
      let dateW = 0;
      if (dateText) {
        doc.setFont('times', 'bold');
        dateW = doc.getTextWidth(dateText) + 5;
        doc.text(dateText, marginX + contentWidth, currentY, { align: 'right' });
      }

      const maxHeaderW = contentWidth - textIndent - dateW;
      const startX = marginX + textIndent;

      // Render Judul terlebih dahulu (BOLD, garis bawah & link HANYA pada judul)
      doc.setFont('times', 'bold');
      doc.setTextColor(20, 20, 20);
      const titleW = doc.getTextWidth(titleText);

      // Hitung lebar Penyelenggara & Label jenis
      doc.setFont('times', 'normal');
      const issuerW = doc.getTextWidth(issuerPart);
      doc.setFont('times', 'italic');
      const typeW = doc.getTextWidth(typeLabel);

      const certTarget =
        item.url && item.url.trim()
          ? item.url.trim().startsWith('http')
            ? item.url.trim()
            : `https://${item.url.trim()}`
          : '';

      if (titleW <= maxHeaderW) {
        doc.setFont('times', 'bold');
        doc.setTextColor(20, 20, 20);
        doc.text(titleText, startX, currentY);

        if (certTarget && titleW > 0) {
          doc.setDrawColor(20, 20, 20);
          doc.setLineWidth(0.2);
          doc.line(startX, currentY + 0.4, startX + titleW, currentY + 0.4);
          doc.link(startX, currentY - 3.2, titleW, 4.0, { url: certTarget });
        }

        if (titleW + issuerW + typeW <= maxHeaderW) {
          // Muat dalam 1 baris
          if (issuerPart) {
            doc.setFont('times', 'normal');
            doc.setTextColor(20, 20, 20);
            doc.text(issuerPart, startX + titleW, currentY);
          }
          doc.setFont('times', 'italic');
          doc.setTextColor(80, 80, 80);
          doc.text(typeLabel, startX + titleW + issuerW, currentY);
          doc.setTextColor(20, 20, 20);
        } else {
          // Judul panjang: turunkan Penyelenggara + Label ke baris berikutnya agar tidak bertabrakan dengan tanggal
          currentY += lineHeight;
          const cleanIssuer = item.issuer && item.issuer.trim() ? item.issuer.trim() : '';
          let nextX = startX;
          if (cleanIssuer) {
            doc.setFont('times', 'normal');
            doc.setTextColor(20, 20, 20);
            doc.text(cleanIssuer, nextX, currentY);
            nextX += doc.getTextWidth(cleanIssuer);
          }
          doc.setFont('times', 'italic');
          doc.setTextColor(80, 80, 80);
          doc.text(cleanIssuer ? typeLabel : typeLabel.trimStart(), nextX, currentY);
          doc.setTextColor(20, 20, 20);
        }
      } else {
        // Jika judul sendiri melebihi lebar baris pertama, bungkus judul dengan link pada tiap baris judul
        doc.setFont('times', 'bold');
        doc.setTextColor(20, 20, 20);
        const wrappedTitle: string[] = doc.splitTextToSize(titleText, maxHeaderW);
        wrappedTitle.forEach((tLine, tIdx) => {
          if (tIdx > 0) currentY += lineHeight;
          doc.text(tLine, startX, currentY);
          const lw = doc.getTextWidth(tLine);
          if (certTarget && lw > 0) {
            doc.setDrawColor(20, 20, 20);
            doc.setLineWidth(0.2);
            doc.line(startX, currentY + 0.4, startX + lw, currentY + 0.4);
            doc.link(startX, currentY - 3.2, lw, 4.0, { url: certTarget });
          }
        });
        currentY += lineHeight;
        const cleanIssuer = item.issuer && item.issuer.trim() ? item.issuer.trim() : '';
        let nextX = startX;
        if (cleanIssuer) {
          doc.setFont('times', 'normal');
          doc.setTextColor(20, 20, 20);
          doc.text(cleanIssuer, nextX, currentY);
          nextX += doc.getTextWidth(cleanIssuer);
        }
        doc.setFont('times', 'italic');
        doc.setTextColor(80, 80, 80);
        doc.text(cleanIssuer ? typeLabel : typeLabel.trimStart(), nextX, currentY);
        doc.setTextColor(20, 20, 20);
      }

      currentY += lineHeight;

      // Baris 2: Sub-deskripsi (Kompetensi Utama / Materi)
      if (item.description) {
        const descPrefix = isId ? 'Kompetensi Utama: ' : 'Core Competencies: ';
        const fullDesc = `${descPrefix}${item.description}`;
        const wrappedDesc = doc.splitTextToSize(fullDesc, contentWidth - textIndent);

        checkPageBreak(wrappedDesc.length * lineHeight);
        doc.setFont('times', 'normal');
        doc.text(wrappedDesc, marginX + textIndent, currentY);
        currentY += wrappedDesc.length * lineHeight;
      }

      currentY += 1.5;
    });

    currentY += 1;
  }

  // =========================================================================
  // 7. KEAHLIAN (SKILLS)
  // =========================================================================
  const skillCategoryLabels: Record<keyof SiteProfile['skills'], { id: string; en: string }> = {
    uiux: { id: 'UI/UX & Product Design', en: 'UI/UX & Product Design' },
    frontend: { id: 'Front-End Web Development', en: 'Front-End Web Development' },
    multimedia: { id: 'Video Editing & Multimedia', en: 'Video Editing & Multimedia' },
    marketing: { id: 'Digital Marketing & Content', en: 'Digital Marketing & Content' },
    aiTools: { id: 'Tool AI & Generatif', en: 'AI Tools & Generative AI' },
  };

  const skillsObj = safeProfile.skills ?? FALLBACK_PROFILE.skills;
  const skillEntries =
    safeProfile.skillCategories && safeProfile.skillCategories.length > 0
      ? safeProfile.skillCategories
          .filter(cat => cat.skills && cat.skills.length > 0)
          .map(cat => ({
            label: cat.name,
            items: cat.skills,
          }))
      : [
          {
            label: isId ? skillCategoryLabels.uiux.id : skillCategoryLabels.uiux.en,
            items: skillsObj.uiux ?? [],
          },
          {
            label: isId ? skillCategoryLabels.multimedia.id : skillCategoryLabels.multimedia.en,
            items: skillsObj.multimedia ?? [],
          },
          {
            label: isId ? skillCategoryLabels.marketing.id : skillCategoryLabels.marketing.en,
            items: skillsObj.marketing ?? [],
          },
          {
            label: isId ? skillCategoryLabels.aiTools.id : skillCategoryLabels.aiTools.en,
            items: skillsObj.aiTools?.length ? skillsObj.aiTools : (skillsObj.frontend ?? []),
          },
        ].filter(group => group.items.length > 0);

  if (skillEntries.length > 0) {
    drawSectionHeader(isId ? 'KEAHLIAN' : 'SKILLS');

    const bulletIndent = 3.5;
    const textIndent = 7.2;
    const lineHeight = 4.1;

    skillEntries.forEach(group => {
      const labelText = `${group.label}: `;
      const itemsText = group.items.join(', ');

      doc.setFont('times', 'bold');
      doc.setFontSize(9.5);
      const labelW = doc.getTextWidth(labelText);

      // Lebar baris pertama menyisakan ruang untuk label bold, baris berikutnya selebar konten
      const textIndentX = marginX + textIndent;
      const firstLineWidth = contentWidth - textIndent - labelW;
      const nextLineWidth = contentWidth - textIndent;

      doc.setFont('times', 'normal');
      const words = itemsText.split(/\s+/).filter(Boolean);
      const itemLines: string[] = [];
      let currentLine = '';
      let available = firstLineWidth;

      for (const word of words) {
        const attempt = currentLine ? `${currentLine} ${word}` : word;
        if (doc.getTextWidth(attempt) <= available || !currentLine) {
          currentLine = attempt;
        } else {
          itemLines.push(currentLine);
          currentLine = word;
          available = nextLineWidth;
        }
      }
      if (currentLine) itemLines.push(currentLine);

      checkPageBreak(itemLines.length * lineHeight + 1);

      doc.setFont('times', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(20, 20, 20);
      doc.text('•', marginX + bulletIndent, currentY);

      // Label bold hanya dicetak sekali, isi skill menyambung setelahnya
      doc.setFont('times', 'bold');
      doc.text(labelText, textIndentX, currentY);

      doc.setFont('times', 'normal');
      itemLines.forEach((line, idx) => {
        const x = idx === 0 ? textIndentX + labelW : textIndentX;
        doc.text(line, x, currentY);
        currentY += lineHeight;
      });
      currentY += 0.4;
    });
  }

  return doc;
};

export const downloadAtsCvPdf = (
  profile: SiteProfile | null | undefined,
  experiences: Experience[],
  portfolioItems: PortfolioItem[],
  options: AtsCvOptions = {}
) => {
  const doc = generateAtsCvPdf(profile, experiences, portfolioItems, options);
  const langSuffix = options.language === 'en' ? 'EN' : 'ID';
  const cleanName = (profile?.name || 'CV').trim().replace(/\s+/g, '_');
  const year = new Date().getFullYear();
  const filename = `CV_ATS_${cleanName}_${year}_${langSuffix}.pdf`;
  doc.save(filename);
};
