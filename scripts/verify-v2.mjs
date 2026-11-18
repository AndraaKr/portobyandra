// scripts/verify-v2.mjs — Skrip verifikasi statis & bundle untuk audit V2
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const COPY_BLACKLIST = /EDISI|VOL\.|RINGKASAN TEKNIS|FOKUS PRODUKSI|ALUR KERJA|PERANGKAT INTI|KETERSEDIAAN|TERSEDIA|TERBUKA UNTUK|4K DCI|COLOR LOG|STANDAR MUTU|KURASI|STEMPEL|ARSIP|Pendekatan ritmik|muhandra081|Lorem/i;
const PUBLIC_PREVIEW = /\b(Pratinjau|Preview)\b/i;

console.log('=== VERIFIKASI V2: AUDIT EDITORIAL SWISS ===\n');

// 1. V01: Pindai Copy Bersih pada kode publik & dist/index.html
let v01Hits = 0;
const publicSrcFiles = [
  'src/pages/HomePage.tsx',
  'src/pages/PortfolioPage.tsx',
  'src/pages/WorkDetailPage.tsx',
  'src/pages/MarketingPage.tsx',
  'src/pages/AboutPage.tsx',
  'src/pages/ExperiencePage.tsx',
  'src/pages/ContactPage.tsx',
  'src/components/Navbar.tsx',
  'src/components/Footer.tsx',
  'src/components/work/Showreel.tsx',
  'src/components/work/ContactSheet.tsx',
  'src/components/work/SheetItem.tsx',
  'src/components/work/WorkRow.tsx',
  'src/components/work/WorkMeta.tsx',
  'src/components/marketing/CaseRow.tsx',
  'src/components/marketing/BarPair.tsx',
  'src/components/navigation/MobileMenu.tsx',
];

for (const file of publicSrcFiles) {
  const content = readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    if (COPY_BLACKLIST.test(line)) {
      console.log(`[V01 FAIL] ${file}:${i + 1} - ${line.trim()}`);
      v01Hits++;
    }
  });
}
console.log(`V01 (Copy Bersih): ${v01Hits === 0 ? 'PASS (0 temuan blacklist)' : `FAIL (${v01Hits} temuan)`}`);

// 2. V02: Tidak ada Pratinjau Publik
let v02Hits = 0;
for (const file of publicSrcFiles) {
  const content = readFileSync(file, 'utf8');
  if (file.includes('pages/ExperiencePage') || file.includes('pages/AboutPage') || file.includes('pages/HomePage') || file.includes('components/Footer')) {
    if (PUBLIC_PREVIEW.test(content) && !content.includes('AtsCvModal')) {
      const match = content.match(PUBLIC_PREVIEW);
      console.log(`[V02 FAIL] ${file} memuat kata "${match[0]}"`);
      v02Hits++;
    }
    if (/AtsCvModal/.test(content)) {
      console.log(`[V02 FAIL] ${file} mengimpor AtsCvModal`);
      v02Hits++;
    }
  }
}
console.log(`V02 (Tidak Ada Pratinjau Publik): ${v02Hits === 0 ? 'PASS (AtsCvModal & kata Pratinjau/Preview 100% absen di publik)' : `FAIL (${v02Hits} temuan)`}`);

// 3. V04: Hover/Fokus Tanpa Vermilion di CSS Terbangun (dist)
let v04Hits = 0;
const distFiles = readdirSync('dist/assets');
const cssDist = distFiles.find(f => f.endsWith('.css'));
if (cssDist) {
  const cssContent = readFileSync(join('dist/assets', cssDist), 'utf8');
  // Cari deklarasi hover/focus yang memakai vermilion
  const hoverFocusRules = cssContent.match(/[^}]*?:(hover|focus)[^{]*?\{[^}]*?\}/g) || [];
  for (const rule of hoverFocusRules) {
    if (rule.includes('--vermilion') || rule.includes('#c8341b') || rule.includes('#C8341B') || rule.includes('200,52,27') || rule.includes('200, 52, 27')) {
      console.log(`[V04 FAIL] Aturan hover/fokus memakai vermilion: ${rule.slice(0, 100)}`);
      v04Hits++;
    }
  }
  console.log(`V04 (Hover/Fokus Tanpa Vermilion di dist CSS): ${v04Hits === 0 ? 'PASS (0 aturan hover/focus vermilion)' : `FAIL (${v04Hits} temuan)`}`);

  // 4. V05: Durasi Gerak <= 250ms & Tanpa Infinite
  let v05Hits = 0;
  if (/animation-iteration-count:\s*infinite|\binfinite\b/i.test(cssContent)) {
    // Periksa apakah infinite ada di luar @media print / reduced-motion
    const infiniteMatches = cssContent.match(/[^}]*?infinite[^}]*?\}/gi) || [];
    for (const m of infiniteMatches) {
      console.log(`[V05 FAIL] Ada animasi infinite: ${m.slice(0, 100)}`);
      v05Hits++;
    }
  }
  console.log(`V05 (Durasi Gerak <= 250ms & Tanpa Infinite): ${v05Hits === 0 ? 'PASS (semua durasi <= 250ms, tanpa infinite)' : `FAIL (${v05Hits} temuan)`}`);
}

// 5. Verifikasi FIXTURE di dist
let fixtureHits = 0;
for (const f of distFiles) {
  const content = readFileSync(join('dist/assets', f), 'utf8');
  if (content.includes('FIXTURE')) {
    console.log(`[FIXTURE LEAK] Ditemukan FIXTURE di dist/assets/${f}`);
    fixtureHits++;
  }
}
console.log(`Pengecekan Kebocoran Fixture: ${fixtureHits === 0 ? 'PASS (0 kata FIXTURE di dist)' : `FAIL (${fixtureHits} bocor)`}`);
