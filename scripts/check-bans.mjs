// scripts/check-bans.mjs — pagar larangan Editorial Swiss V2. Keluar dengan kode 1 bila ada temuan.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const ROOTS = ['src', 'index.html'];
const EXT = new Set(['.ts', '.tsx', '.css', '.html']);
const SKIP_HEX = new Set(['tokens.css', 'generateAtsPdf.ts']);

// Whitelist berkas untuk text-vermilion / bg-vermilion (Bab 4)
const VERMILION_WHITELIST = new Set([
  'Navbar.tsx',
  'MobileMenu.tsx',
  'HomePage.tsx',
  'PortfolioPage.tsx',
  'WorkDetailPage.tsx',
  'MarketingPage.tsx',
  'CaseRow.tsx',
  'AboutBento.tsx',
  'index.css',
  'tokens.css',
  'components.css'
]);

const walk = (p) => {
  const s = statSync(p);
  if (s.isFile()) return EXT.has(extname(p)) || p.endsWith('index.html') ? [p] : [];
  return readdirSync(p).flatMap((n) => walk(join(p, n)));
};
const files = ROOTS.flatMap((r) => { try { return walk(r); } catch { return []; } });

const RULES = [
  ['glass/backdrop', new RegExp('backdrop-' + '(filter|blur)|liquid-glass|navbar-glass|card-deck-glass', 'i')],
  ['gradien', /(linear|radial|conic)-gradient|bg-gradient|bg-linear|bg-radial|bg-conic|\b(from|via|to)-(\[|[a-z]+-\d{2,3})/i],
  ['emoji', /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}]/u],
  ['transition-all', /transition-all|transition\s*:\s*all|transition-property\s*:\s*all/i],
  ['transition polos (tinjau manual)', /(["'`\s])transition(["'`\s])(?!:)/],
  ['animasi/loop', /animate-(pulse|spin|bounce|ping)|\binfinite\b|animation-iteration-count:\s*infinite/i],
  ['grid 3 kolom', /grid-cols-3|repeat\(\s*3\b/],
  ['radius > 4px (tailwind)', /\brounded-(md|lg|xl|2xl|3xl|full|\[)/],
  ['mode gelap', /\bdark:|html\.dark|\btoggleTheme\b/],
  ['font/CDN', /fonts\.(googleapis|gstatic)\.com|cdnjs\.|unpkg\.com|cdn\.jsdelivr/i],
  ['palet lama', /\b(text|bg|border|ring|fill|stroke|divide|placeholder|from|via|to)-(neutral|gray|slate|zinc|stone|indigo|violet|purple|blue|sky|cyan|teal|emerald|green|amber|orange|rose|pink|red)-\d{2,3}/],
  ['kelas vermilion terlarang', /\b(stamp-vermilion|tag-vermilion|btn-vermilion|hover:text-vermilion|hover:bg-vermilion|hover:border-vermilion)\b/],
];

const COPY_BLACKLIST = /EDISI|VOL\.|RINGKASAN TEKNIS|FOKUS PRODUKSI|ALUR KERJA|PERANGKAT INTI|KETERSEDIAAN|TERSEDIA|TERBUKA UNTUK|4K DCI|COLOR LOG|STANDAR MUTU|KURASI|STEMPEL|ARSIP|Pendekatan ritmik|muhandra081|Lorem/i;
const PUBLIC_PREVIEW_RE = /\b(Pratinjau|Preview)\b/i;
const OBJECT_COVER_RE = /object-fit:\s*cover|\bobject-cover\b/i;

const numOver = (re, limit, scale = 1) => (line) => {
  const out = [];
  for (const m of line.matchAll(re)) if (parseFloat(m[1]) * scale > limit) out.push(m[0]);
  return out.length ? out.join(', ') : null;
};

const CUSTOM = [
  ['durasi tailwind > 250ms', numOver(/\bduration-(\d+)\b/g, 250)],
  ['durasi framer > 0.25s', numOver(/\bduration\s*:\s*([\d.]+)/g, 0.25)],
  ['durasi css (ms) > 250', numOver(/(?:transition|animation)[^;{]*?\b(\d+(?:\.\d+)?)ms/g, 250)],
  ['durasi css (s) > 0.25', numOver(/(?:transition|animation)[^;{]*?\b(\d*\.?\d+)s\b/g, 0.25)],
  ['border-radius css > 4px', numOver(/border-radius\s*:\s*(\d*\.?\d+)px/g, 4)],
  ['border-radius css > 0.25rem', numOver(/border-radius\s*:\s*(\d*\.?\d+)rem/g, 4, 16)],
];

let hits = 0;
for (const f of files) {
  const base = basename(f);
  const isDev = f.includes('src/dev') || f.includes('docs');
  const isPageOrComponent = f.includes('src/pages') || f.includes('src/components');
  const isAdminPage = base.startsWith('Admin') || f.includes('Admin');
  const isWorkMedia = f.includes('components/work') || f.includes('SheetItem') || f.includes('WorkRow') || f.includes('MediaFrame') || f.includes('ContactSheet');

  const lines = readFileSync(f, 'utf8').split('\n');
  lines.forEach((line, i) => {
    // Basic rules
    for (const [name, re] of RULES) {
      if (re.test(line)) {
        console.log(`${f}:${i + 1}  [${name}]  ${line.trim().slice(0, 110)}`);
        hits++;
      }
    }

    // Custom threshold rules (dikecualikan untuk baris animasi kinetik nama hero yang diminta slow oleh pemilik)
    const isHeroKineticLine = line.includes('hero-slide') || line.includes('hero-ghost') || line.includes('hero-kinetic') || line.includes('--dur-hero');
    if (!isHeroKineticLine) {
      for (const [name, fn] of CUSTOM) {
        const r = fn(line);
        if (r) {
          console.log(`${f}:${i + 1}  [${name}]  ${r}`);
          hits++;
        }
      }
    }

    // Hex outside tokens.css
    if (!SKIP_HEX.has(base) && /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/.test(line) && !/&#|href="#|url\(#|"#\//.test(line)) {
      console.log(`${f}:${i + 1}  [hex di luar tokens.css]  ${line.trim().slice(0, 110)}`);
      hits++;
    }

    // Copy blacklist (Bab 3.6 & 11.1)
    if (!isDev && isPageOrComponent && COPY_BLACKLIST.test(line)) {
      // Don't flag comments or imports
      if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        console.log(`${f}:${i + 1}  [copy terlarang]  ${line.trim().slice(0, 110)}`);
        hits++;
      }
    }

    // Public preview check (Bab 10 & 11.1)
    if (f.includes('src/pages') && !isAdminPage && PUBLIC_PREVIEW_RE.test(line)) {
      if (!line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        console.log(`${f}:${i + 1}  [pratinjau publik]  ${line.trim().slice(0, 110)}`);
        hits++;
      }
    }

    // AtsCvModal import check (only allowed in AdminDashboardPage.tsx)
    if (base !== 'AdminDashboardPage.tsx' && /import.*AtsCvModal/i.test(line)) {
      console.log(`${f}:${i + 1}  [impor AtsCvModal di luar Admin]  ${line.trim().slice(0, 110)}`);
      hits++;
    }

    // Vermilion whitelist (Bab 4)
    if (!VERMILION_WHITELIST.has(base) && /\b(text-vermilion|bg-vermilion|border-vermilion)\b/.test(line)) {
      console.log(`${f}:${i + 1}  [vermilion di luar whitelist]  ${line.trim().slice(0, 110)}`);
      hits++;
    }

    // Font size < 12px
    const fontPxMatch = line.match(/\btext-\[(\d+(?:\.\d+)?)px\]/);
    if (fontPxMatch && parseFloat(fontPxMatch[1]) < 12) {
      console.log(`${f}:${i + 1}  [font < 12px]  ${fontPxMatch[0]}`);
      hits++;
    }
    const fontRemMatch = line.match(/font-size:\s*(0\.[0-6]\d*|0\.7[0-4]\d*)rem/);
    if (fontRemMatch) {
      console.log(`${f}:${i + 1}  [font < 12px rem]  ${fontRemMatch[0]}`);
      hits++;
    }

    // object-fit: cover pada karya diizinkan khusus untuk kartu index rasio seragam 3:4 sesuai instruksi user,
    // sedangkan halaman detail mempertahankan rasio asli karya.
    /*
    if (isWorkMedia && OBJECT_COVER_RE.test(line)) {
      console.log(`${f}:${i + 1}  [object-fit: cover pada karya]  ${line.trim().slice(0, 110)}`);
      hits++;
    }
    */
  });
}

console.log(hits ? `\nTEMUAN: ${hits}` : '\nBERSIH: 0 temuan');
process.exit(hits ? 1 : 0);
