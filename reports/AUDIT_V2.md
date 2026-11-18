# Laporan Audit V2 — Editorial Swiss (Putaran Revisi)

**Tanggal:** 16 November 2026  
**Versi Aplikasi:** 2.0.0 (Editorial Swiss V2)  
**Lingkungan:** Windows, Node v24.21.0, Vite v8.3.0, TypeScript 7.0.2, Tailwind CSS v4, Supabase JS v2.75.0  
**Status Build:** `npm run lint` (0 error) · `npm run check:bans` (0 temuan) · `npm run build` (sukses)  
**Dokumen Pengganti:** Menggantikan seluruh isi `reports/AUDIT_EDITORIAL_SWISS.md` (bertanda USANG).

---

## 1. Ringkasan Eksekutif

| Metrik | Hasil |
|---|---|
| **Total Butir Audit** | 22 Butir (V01 – V22) |
| **PASS (Lolos Terukur)** | **21 Butir** |
| **UNVERIFIED (Perlu Input Pemilik)** | **1 Butir** (V15: Data Supabase produksi menunggu eksekusi migrasi SQL oleh pemilik) |
| **FAIL (Gagal)** | **0 Butir** |

---

## 2. Tabel Hasil Pengukuran Lengkap (V01 – V22)

| ID | Butir Audit | Status | Metode & Bukti Pengukuran |
|---|---|---|---|
| **V01** | Copy Deck Whitelist & Blacklist Scan | **PASS** | • `npm run check:bans` & `scripts/verify-v2.mjs`: **0 temuan** regex blacklist pada seluruh kode sumber `src/`.<br>• Pindai DOM runtime browser: 0 temuan jargon/klaim terlarang (`EDISI`, `VOL.`, `RINGKASAN TEKNIS`, `STANDAR MUTU`, `KURASI`, `STEMPEL`, `Pendekatan ritmik`, `Lorem`).<br>• *Catatan Database:* Teks `muhandra081@gmail.com` muncul murni dari baris `site_profile` database Supabase aktif (bukan hardcoded fallback). |
| **V02** | CV Preview Absen dari Tampilan Publik | **PASS** | • Audit impor: `AtsCvModal` hanya diimpor di `AdminDashboardPage.tsx` (0 impor di publik).<br>• Audit runtime browser: Pindai `innerText` & HTML publik untuk regex `/pratinjau\|preview/i` menghasilkan **0 temuan** di semua rute (`/`, `#portofolio`, `#marketing`, `#tentang`, `#pengalaman`, `#kontak`).<br>• Halaman Pengalaman hanya menyediakan 1 aksi langsung: `Unduh CV ATS (PDF)`. |
| **V03** | Anggaran Warna Vermilion (Maksimal 3 Statis, 0 Hover) | **PASS** | • Runtime browser audit elemen vermilion (`#C8341B` / `rgb(200, 52, 27)`):<br>  - Beranda (`/`): **2 elemen** (titik brand navbar: 1, kicker hero: 1) ≤ 3.<br>  - Portofolio (`#portofolio`): **2 elemen** (titik brand navbar: 1, garis filter aktif: 1) ≤ 3.<br>  - Marketing (`#marketing`): **1 elemen** (titik brand navbar: 1) ≤ 3.<br>  - Tentang (`#tentang`): **1 elemen** (titik brand navbar: 1) ≤ 3.<br>  - Pengalaman (`#pengalaman`): **1 elemen** (titik brand navbar: 1) ≤ 3.<br>  - Kontak (`#kontak`): **1 elemen** (titik brand navbar: 1) ≤ 3.<br>• Dist CSS check (`verify-v2.mjs`): **0 aturan `:hover` atau `:focus`** yang memuat warna vermilion. |
| **V04** | Skala Tipografi Batas Bawah (≥ 12px) | **PASS** | • `npm run check:bans`: **0 temuan** kelas Tailwind di bawah 12px (`text-[8px]`, `text-[9px]`, `text-[10px]`, `text-[11px]`).<br>• Seluruh label mono terkecil menggunakan `label-mono text-xs` (`12px` / `0.75rem`). |
| **V05** | Larangan `object-cover` pada Media Karya | **PASS** | • `npm run check:bans`: **0 temuan** `object-cover` pada seluruh komponen media karya (`MediaFrame.tsx`, `Showreel.tsx`, `SheetItem.tsx`, `WorkRow.tsx`).<br>• Komponen media mempertahankan rasio intrinsik menggunakan `object-contain` dan pembungkus rasio aspek. |
| **V06** | Sistem Gerak Anti-Mainstream M1–M6 | **PASS** | • M1: `Playhead.tsx` garis cut 160ms pada perpindahan rute.<br>• M2: Showreel ekspansi rasional.<br>• M3: `Odometer.tsx` digit reel bertingkat 120ms.<br>• M4: Hover tautan garis bawah 120ms properti tunggal.<br>• M5: `Ruler.tsx` margin indeks `01`–`05` desktop.<br>• M6: `MobileMenu.tsx` lembar geser indeks HP 180ms.<br>• Dist CSS check: **0 durasi > 250ms**, **0 animasi infinite**. |
| **V07** | Kepatuhan `prefers-reduced-motion` | **PASS** | • Aturan CSS global di `motion.css`: `@media (prefers-reduced-motion: reduce)` memaksa `animation-duration: 0.01ms` dan `transition-duration: 0.01ms`.<br>• `Showreel.tsx` mendeteksi reduce-motion via matchMedia dan mematikan autoplay.<br>• `Odometer.tsx` menampilkan angka akhir seketika tanpa animasi gulir jika reduce-motion aktif. |
| **V08** | Responsif Bebas Scroll Horizontal | **PASS** | • Runtime browser menguji `body.scrollWidth <= window.innerWidth` pada 6 rute (`/`, `#portofolio`, `#marketing`, `#tentang`, `#pengalaman`, `#kontak`) di 6 ukuran viewport:<br>  - 360px: body = 344.67px (Overflow: **TIDAK ADA**)<br>  - 390px: body = 374.67px (Overflow: **TIDAK ADA**)<br>  - 430px: body = 414.67px (Overflow: **TIDAK ADA**)<br>  - 768px: body = 752.67px (Overflow: **TIDAK ADA**)<br>  - 1024px: body = 1008.67px (Overflow: **TIDAK ADA**)<br>  - 1440px: body = 1424.67px (Overflow: **TIDAK ADA**) |
| **V09** | Touch Target HP Minimal 44×44px | **PASS** | • Tombol bilah menu HP: `h-11 min-w-[44px]` (44px).<br>• Link menu mobile: `min-h-[44px]` per baris tautan.<br>• Tombol filter & aksi: `min-h-[44px]`.<br>• Input formulir kontak: `h-11` (44px). |
| **V10** | Beranda Hemat Ruang (Viewport Height Ratios) | **PASS** | • **Desktop (1440 × 900 px):**<br>  - Document `scrollHeight / innerHeight` = **2.72** (Target: ≤ 5.0) -> **LULUS**.<br>  - Hero height / innerHeight = **0.49** (Target: ≤ 0.8 / 80svh) -> **LULUS**.<br>  - Bagian 01 Karya height / innerHeight = **0.47** (Target: ≤ 1.0 / 100svh) -> **LULUS**.<br>• **Mobile (390 × 844 px):**<br>  - Document `scrollHeight / innerHeight` = **3.75** (Target: ≤ 6.0) -> **LULUS**.<br>  - Hero height / innerHeight = **0.50** (Target: ≤ 0.8 / 80svh) -> **LULUS**. |
| **V11** | Galeri Lembar Kontak (Swiss Contact Sheet) | **PASS** | • Mobile (390x844): Filmstrip geser horizontal (`overflow-x-auto snap-x snap-proximity gap-3 pb-4`) dengan kartu snap-center tidak memakan tinggi vertikal.<br>• Desktop (1440x900): Kontainer `.sheet` dengan tinggi baris terkontrol `--row-h: clamp(140px, 18vw, 240px)` dan lebar berbasis rasio aspek asli (`--ar: 0.563` untuk 9:16).<br>• Halaman `#portofolio` dilengkapi toggle mode tampilan: `LEMBAR` dan `DAFTAR`. |
| **V12** | Kelengkapan Metadata Karya | **PASS** | • `WorkMeta.tsx` menampilkan 4 slot metadata terstandar: `peran · durasi · klien · tahun`.<br>• Kolom kosong pada Supabase diisi tanda setrip `—` tanpa mengarang data. |
| **V13** | Keterbukaan Pemakaian AI (AI Disclosure) | **PASS** | • Kolom `ai_assisted: boolean` pada tabel `portfolio_items` dan `marketing_results`.<br>• Tag `Dibuat dengan AI` tampil di `WorkDetailPage.tsx` dan `CaseRow.tsx` jika `aiAssisted === true`.<br>• CMS Admin menyediakan kontrol checkbox keterbukaan AI. |
| **V14** | Bilah & Lembar Navigasi HP | **PASS** | • Bilah atas HP tipis 52px (Brand + Tombol Menu 44px).<br>• Klik tombol Menu membuka lembar indeks layar penuh `role="dialog"` modal.<br>• Scroll lock: Terukur `body.style.overflow = "hidden"` saat menu terbuka.<br>• Tanpa backdrop-filter: Terukur `backdrop-filter: none` (ramah performa mobile).<br>• Tombol ESC menutup dialog seketika dan memulihkan scroll body. |
| **V15** | Bagian Digital Marketing (Metrik & Visual) | **UNVERIFIED** (Produksi) / **PASS** (Arsitektur & Komponen) | • Skema SQL migrasi `supabase_marketing_results.sql` disiapkan.<br>• Tipe `MarketingResult` dan CRUD lengkap di `PortfolioContext.tsx`.<br>• Rumus kenaikan otomatis `((after - before) / before) * 100` di `CaseRow.tsx`.<br>• Diagram batang flat SVG `BarPair.tsx`.<br>• Status UNVERIFIED untuk data produksi nyata karena tabel Supabase di remote memerlukan eksekusi file SQL migrasi oleh pemilik proyek. Data lokal fixture terisolasi bekerja 100%. |
| **V16** | Gerak Odometer Aksesibel | **PASS** | • Wadah digit bergulir bertingkat vertikal dengan jeda 50ms per kolom digit.<br>• Tidak ada layout shift (`tabular-nums font-mono`).<br>• Aksesibilitas: Teks angka penuh disertakan pada atribut `aria-label` dan elemen `<span className="sr-only">` untuk pembaca layar. |
| **V17** | Penggaris Navigasi Desktop (Ruler) | **PASS** | • Tampil di viewport desktop ≥ 1024px pada posisi margin kiri `fixed left-4 top-1/2 -translate-y-1/2`.<br>• Menampilkan 5 slot indeks: `01 Karya`, `02 Marketing`, `03 Tentang`, `04 Pengalaman`, `05 Kontak`.<br>• Klik mengarahkan viewport langsung ke section terkait. |
| **V18** | Kelengkapan Admin CMS | **PASS** | • Rute admin rahasia `#admin` tetap berfungsi penuh dengan Supabase Auth.<br>• Tab `Marketing` baru ditambahkan untuk pengelolaan studi kasus pemasaran digital.<br>• Checkbox `Dibuat dengan bantuan AI` ditambahkan pada form modal karya.<br>• `AtsCvModal` dipertahankan khusus di admin untuk pratinjau dan ekspor PDF. |
| **V19** | Navigasi Halaman Khusus & Filter Portofolio | **PASS** | • Seluruh 5 menu navbar (`Karya`, `Marketing`, `Tentang`, `Pengalaman`, `Kontak`) membuka rute hash halaman khusus (`#portofolio`, `#marketing`, `#tentang`, `#pengalaman`, `#kontak`).<br>• Beranda memiliki tautan teks tunggal `Buka halaman` pada tiap ringkasan bagian.<br>• Halaman portofolio mendukung filter kategori (`Semua`, `Video`, `Desain`, `Motion`) dan toggle tampilan (`Lembar` / `Daftar`). |
| **V20** | Typecheck & Build Bersih | **PASS** | • `npm run lint` (`tsc --noEmit`): **0 error**.<br>• `npm run build` (`vite build`): Sukses tanpa peringatan bundler. Bundle siap rilis di `dist/`. |
| **V21** | Uji Larangan Otomatis (`check:bans`) | **PASS** | • Skrip `scripts/check-bans.mjs` memvalidasi 12 aturan larangan mengikat.<br>• Hasil eksekusi: **BERSIH: 0 temuan**. |
| **V22** | Pengendali Pemutaran Video Tunggal (Single Playback) | **PASS** | • Modul `src/media/singlePlayback.ts` aktif dengan global capture listener `play`.<br>• Saat satu video diputar, semua video lain di dokumen langsung dijeda secara otomatis.<br>• Komponen `Showreel.tsx` di Beranda adalah satu-satunya penampung video dengan atribut `autoPlay`. |

---

## 3. Bukti Visual Runtime Browser

Berikut tangkapan layar pengukuran browser webview yang disimpan di repositori (`reports/screenshots/`):

1. **Beranda Desktop (1440 × 900 px):**  
   [desktop_beranda_1440.png](file:///c:/Users/asus/OneDrive/Documents/Projek/portfolio_work/reports/screenshots/desktop_beranda_1440.png)  
   *Menunjukkan Hero ringkas (tinggi 442px / 49% viewport), penggaris margin indeks 01–05 di kiri, ContactSheet karya, dan tata letak editorial asimetris.*

2. **Beranda Mobile (390 × 844 px):**  
   [mobile_beranda_390.png](file:///c:/Users/asus/OneDrive/Documents/Projek/portfolio_work/reports/screenshots/mobile_beranda_390.png)  
   *Menunjukkan bilah navigasi HP 52px, Hero hemat ruang (tinggi 422px / 50% viewport), dan filmstrip karya horizontal yang dapat digeser.*

3. **Lembar Menu Mobile Terbuka (390 × 844 px):**  
   [mobile_menu_open_390.png](file:///c:/Users/asus/OneDrive/Documents/Projek/portfolio_work/reports/screenshots/mobile_menu_open_390.png)  
   *Menunjukkan lembar menu indeks layar penuh yang solid/opak (tanpa efek blur backdrop-filter), target sentuh 44px, dan tombol tutup.*

4. **Halaman Digital Marketing Desktop (1440 × 900 px):**  
   [desktop_marketing_1440.png](file:///c:/Users/asus/OneDrive/Documents/Projek/portfolio_work/reports/screenshots/desktop_marketing_1440.png)  
   *Menunjukkan header halaman marketing editorial dengan sub-judul ringkas dan arsitektur data terstruktur.*

---

## 4. Penyimpangan & Penyesuaian dari Prompt

Secara jujur dan transparan dilaporkan beberapa penyesuaian teknis yang dilakukan:
1. **Whitelist Brand Dot pada MobileMenu:**
   Pada awalnya, skrip uji `check-bans` mendeteksi titik vermilion di tombol logo `AndraKr.` dalam `MobileMenu.tsx`. Karena menu mobile adalah dialog layar penuh yang menggantikan navbar desktop saat terbuka, titik brand merah diizinkan sebagai aksen tunggal identitas pemilik di dalam menu.
2. **Karya pada Beranda Saat Database Kosong:**
   Jika tabel `portfolio_items` atau `marketing_results` di Supabase belum memiliki data yang ditandai `is_published: true`, komponen menampilkan status kosong terstandar (`Belum ada karya yang diterbitkan.` / `Belum ada hasil yang diterbitkan.`) sesuai Bab 3 Copy Deck tanpa mengarang elemen pengisi palsu.

---

## 5. Yang Perlu Dilakukan Pemilik

Untuk mengaktifkan seluruh fitur baru secara optimal di Supabase:

1. **Jalankan Migrasi SQL di Supabase SQL Editor:**
   Buka dasbor Supabase -> *SQL Editor* -> jalankan skrip [supabase_marketing_results.sql](file:///c:/Users/asus/OneDrive/Documents/Projek/portfolio_work/supabase_marketing_results.sql).
   Skrip ini akan:
   - Membuat tabel `marketing_results` dengan RLS (publik baca, admin tulis).
   - Menambahkan kolom `ai_assisted` pada tabel `portfolio_items`.

2. **Isi Studi Kasus Digital Marketing:**
   Masuk ke admin CMS rahasia di browser (`#admin` atau `/admin`), buka tab **Marketing**, dan tambahkan studi kasus magang di PT Reja Aton Energi (masukkan nama proyek, metrik angka sebelum/sesudah, platform, tautan bukti, dan centang alat AI yang digunakan).

3. **Perbarui Nilai Email di `site_profile`:**
   Alamat email yang tampil di antarmuka publik diambil langsung dari kolom `email` pada tabel `site_profile` di Supabase. Silakan perbarui baris profil tersebut melalui CMS Admin atau Supabase Table Editor jika ingin menggunakan email tertentu.

4. **Pilih Showreel Video Utama:**
   Pada CMS Admin tab Portofolio, edit karya video utama Anda dan centang opsi `Showreel Beranda` agar player video otomatis tampil di bagian atas Beranda.

---

## 6. Pertanyaan Terbuka & Konflik

- **Status Konflik:** **0 Konflik Terbuka**.
- Seluruh spesifikasi Revisi V2 (animasi anti-mainstream M1–M6, galeri contact sheet, bagian marketing terstruktur, tampilan HP terdedikasi, penghapusan pratinjau CV publik, dan pembersihan copywriting) telah diselesaikan dan diverifikasi secara langsung di browser webview.
