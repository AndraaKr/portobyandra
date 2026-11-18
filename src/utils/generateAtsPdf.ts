import { jsPDF } from 'jspdf';
import { Experience, PortfolioItem, SiteProfile } from '../types';

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
export const parseEducationText = (rawEducation: string, fallbackLocation = ''): ParsedEducation => {
  const lines = rawEducation
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      institution: '',
      degree: '',
      gpa: '',
      period: '',
      location: fallbackLocation,
      bullets: [],
    };
  }

  const firstLine = lines[0];
  const bullets = lines.slice(1).map(b => b.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean);

  // Jika dipisahkan dengan pipa "|"
  if (firstLine.includes('|')) {
    const parts = firstLine.split('|').map(p => p.trim()).filter(Boolean);
    return {
      institution: parts[0] || '',
      degree: parts[1] || '',
      gpa: parts[2] || '',
      period: parts[3] || '',
      location: parts[4] || fallbackLocation,
      bullets,
    };
  }

  let working = firstLine;
  let period = '';
  let gpa = '';

  // Ekstrak periode dalam kurung di akhir, mis: (2021 - 2025) atau (Agu 2021 - Nov 2025)
  const periodMatch = working.match(/\(([^)]*\d{4}[^)]*)\)\s*$/);
  if (periodMatch) {
    period = periodMatch[1].trim();
    working = working.slice(0, periodMatch.index).trim();
  }

  // Ekstrak IPK / GPA jika ada di dalam teks
  const gpaMatch = working.match(/(?:IPK|GPA)\s*:?\s*([0-9.,]+(?:\/[0-9.,]+)?)/i);
  if (gpaMatch) {
    gpa = `IPK: ${gpaMatch[1]}`;
    working = working.replace(gpaMatch[0], '').replace(/[,;|\s]+$/, '').trim();
  }

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
    period,
    location: fallbackLocation,
    bullets,
  };
};

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
  // Menggunakan warna biru untuk link (email, linkedin, website/porto) dan warna hitam untuk nomor telepon
  interface ContactSegment {
    text: string;
    isLink: boolean;
  }
  const segments: ContactSegment[] = [];
  if (safeProfile.email) {
    segments.push({ text: safeProfile.email.trim(), isLink: true });
  }
  if (safeProfile.phone) {
    segments.push({ text: safeProfile.phone.trim(), isLink: false });
  }
  if (safeProfile.socials?.linkedin) {
    segments.push({
      text: safeProfile.socials.linkedin.trim().replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, ''),
      isLink: true,
    });
  }
  const portfolioLink = safeProfile.socials?.website || safeProfile.socials?.github;
  if (portfolioLink) {
    segments.push({
      text: portfolioLink.trim().replace(/^https?:\/\/(www\.)?/, '').replace(/\/+$/, ''),
      isLink: true,
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
        if (seg.isLink) {
          doc.setTextColor(37, 99, 235); // Biru link seperti referensi
        } else {
          doc.setTextColor(20, 20, 20);
        }
        doc.text(seg.text, startX, currentY);
        startX += doc.getTextWidth(seg.text);

        if (idx < segments.length - 1) {
          doc.setTextColor(80, 80, 80);
          doc.text(separator, startX, currentY);
          startX += sepWidth;
        }
      });
      currentY += 4.5;
    } else {
      // Fallback jika terlalu panjang: bungkus otomatis di tengah
      doc.setTextColor(35, 35, 35);
      const joined = segments.map(s => s.text).join('  |  ');
      const wrapped = doc.splitTextToSize(joined, contentWidth);
      doc.text(wrapped, centerX, currentY, { align: 'center' });
      currentY += wrapped.length * 4.2;
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
  // 3. PENDIDIKAN (Mengikuti urutan & tata letak referensi gambar)
  // =========================================================================
  if (safeProfile.education) {
    drawSectionHeader(isId ? 'PENDIDIKAN' : 'EDUCATION');
    const edu = parseEducationText(safeProfile.education, safeProfile.location);
    // IPK bisa datang dari teks pendidikan ("IPK: 3.78") atau dari field profil terpisah
    const profileGpa = (safeProfile.gpa || '').trim();
    const gpaText =
      edu.gpa ||
      (profileGpa
        ? /^(ipk|gpa)\b/i.test(profileGpa)
          ? profileGpa
          : `IPK: ${profileGpa}`
        : 'IPK: 3.78');

    checkPageBreak(12);

    // Baris 1: Nama Universitas/Institusi (Kiri, Bold) & Lokasi (Kanan, Bold)
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 15, 15);
    doc.text(edu.institution || safeProfile.education, marginX, currentY);

    if (edu.location) {
      doc.text(edu.location, marginX + contentWidth, currentY, { align: 'right' });
    }
    currentY += 4.2;

    // Baris 2: Gelar/Program Studi (Kiri, Italic) + IPK (Normal) & Periode (Kanan, Bold)
    if (edu.degree || gpaText || edu.period) {
      let leftCursor = marginX;
      if (edu.degree) {
        doc.setFont('times', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(25, 25, 25);
        doc.text(edu.degree, leftCursor, currentY);
        leftCursor += doc.getTextWidth(edu.degree);
      }
      if (gpaText) {
        doc.setFont('times', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(25, 25, 25);
        const gpaLabel = edu.degree ? `  |  ${gpaText}` : gpaText;
        doc.text(gpaLabel, leftCursor, currentY);
      }
      if (edu.period) {
        doc.setFont('times', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 15, 15);
        doc.text(edu.period, marginX + contentWidth, currentY, { align: 'right' });
      }
      currentY += 4.4;
    }

    // Bullet aktivitas pendidikan jika ada
    if (edu.bullets.length > 0) {
      drawBulletList(edu.bullets);
    }
    currentY += 1;
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
  // 6. SERTIFIKASI (CERTIFICATION)
  // =========================================================================
  if (safeProfile.certificates && safeProfile.certificates.length > 0) {
    drawSectionHeader(isId ? 'SERTIFIKASI' : 'CERTIFICATION');

    const certBullets = safeProfile.certificates.map(cert => {
      const parts = [cert.name, cert.issuer, cert.year].map(p => (p || '').trim()).filter(Boolean);
      return parts.join(', ');
    });

    drawBulletList(certBullets);
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
  const skillEntries = [
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
      // Data lama mungkin belum punya aiTools. Ambil frontend hanya sebagai migrasi otomatis.
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
