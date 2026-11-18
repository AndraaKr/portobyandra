import jsPDF from 'jspdf';
import { generateAtsCvPdf } from '../src/utils/generateAtsPdf';

const log: string[] = [];
const proto: any = (jsPDF as any).prototype;
const origText = proto.text;
proto.text = function (text: any, ...rest: any[]) {
  log.push('TEXT :: ' + (Array.isArray(text) ? text.join(' ') : String(text)));
  return origText.call(this, text, ...rest);
};
const origSetFont = proto.setFont;
proto.setFont = function (family: string, style?: string) {
  log.push(`FONT :: ${family} ${style ?? ''}`.trim());
  return origSetFont.call(this, family, style);
};

const profile: any = {
  avatarUrl: null,
  name: 'Muhammad Andra Kusuma Ramadhan',
  shortName: 'Andra',
  title: 'Digital Marketing Intern',
  tagline: 'x',
  bio: 'Deskripsi diri contoh.',
  email: 'a@b.com',
  phone: '0812',
  location: 'Surabaya',
  education: 'Politeknik Elektronika Negeri Surabaya — D4 Teknik Informatika (2021 – 2025)',
  gpa: '3.78',
  coursework: ['Digital Marketing', 'UI/UX'],
  currentRole: '',
  socials: { github: '', linkedin: 'linkedin.com/in/x', instagram: '', youtube: '', website: '' },
  skills: { uiux: ['Figma'], frontend: ['React'], multimedia: ['Premiere'], marketing: ['Meta Ads'], aiTools: ['ChatGPT'] },
  certificates: [
    { id: 'c1', name: 'Adobe Certified Professional', issuer: 'Adobe', year: '2024' },
    { id: 'c2', name: 'Bootcamp Digital Marketing', issuer: 'MySkill', year: '2024', kind: 'pelatihan' },
  ],
};

const experiences: any[] = [
  {
    id: 'e1',
    role: 'Digital Marketing Intern',
    organization: 'PT Reja Aton Energi',
    period: 'Jun 2024 - Sep 2024',
    description: 'Mengelola konten. Menaikkan engagement.',
    order: 1,
    location: 'Surabaya',
    createdAt: '2024-06-01',
  },
];

generateAtsCvPdf(profile, experiences, [], { language: 'id' });

// Ringkas: hanya baris teks penting
log.forEach((l) => console.log(l));
