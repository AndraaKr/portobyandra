import type { Work } from './work';
import type { PortfolioItem, WorkCaseStudy } from '../types';
import caseStudiesData from '../../data/work_case_studies.json';

const CASE_STUDIES: Record<string, WorkCaseStudy> = caseStudiesData as unknown as Record<string, WorkCaseStudy>;

export const getCaseStudyForWork = (work: Work | PortfolioItem): WorkCaseStudy => {
  const slug = (work.slug || '').toLowerCase();
  const title = (work.title || '').toLowerCase();

  // 1. Pencocokan langsung berdasarkan slug
  if (CASE_STUDIES[slug]) {
    return CASE_STUDIES[slug];
  }

  // 2. Pencocokan alias & kata kunci tematik
  if (slug === 'edu-3' || slug === 'edukasi-3d' || title.includes('edukasi') || title.includes('reja')) {
    return CASE_STUDIES['edu-3'];
  }
  if (slug.includes('pacet') || title.includes('pacet') || title.includes('recap')) {
    return CASE_STUDIES['recap-acara-di-pacet'];
  }
  if (slug.includes('dapbun') || title.includes('dapur') || title.includes('poster')) {
    return CASE_STUDIES['poster-dapbun'];
  }

  // 3. Fallback cerdas untuk karya lain yang ditambahkan di masa depan
  const posterUrl = work.posterUrl || work.imageUrl || '';
  const toolsText = work.tools && work.tools.length > 0 ? work.tools.join(', ') : 'perangkat lunak kreatif';
  const clientText = work.client || 'klien';
  const categoryText = work.category || 'karya visual';

  return {
    challenge: `Menghasilkan ${categoryText.toLowerCase()} untuk ${clientText} dengan standar kualitas tinggi yang memadukan kejelasan pesan dan daya pikat visual.`,
    approach: `Proses pengerjaan menggunakan ${toolsText} dengan memperhatikan hirarki tata letak, ritme visual, serta konsistensi identitas merek.`,
    outcome: `Karya berhasil dipublikasikan dan memenuhi objektif komunikasi dengan respon positif dari audiens sasaran.`,
    palette: [
      { name: 'Primary Ink', hex: 'var(--ink)' },
      { name: 'Secondary Ink', hex: 'var(--ink-2)' },
      { name: 'Muted Ink', hex: 'var(--ink-3)' },
      { name: 'Hairline Rule', hex: 'var(--rule)' },
      { name: 'Paper Surface', hex: 'var(--paper-2)' }
    ],
    stills: posterUrl
      ? [
          {
            id: `${slug}-still-1`,
            title: 'Komposisi Utama',
            timestamp: 'Frame 01',
            imageUrl: posterUrl,
            caption: `Eksplorasi komposisi visual karya ${work.title}.`
          }
        ]
      : []
  };
};
