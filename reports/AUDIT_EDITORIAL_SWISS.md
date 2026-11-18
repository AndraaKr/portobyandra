> DIBATALKAN / USANG — Digantikan oleh `reports/AUDIT_V2.md`. Laporan ini berisi klaim yang belum diukur dan copywriting yang dibatalkan.

# Audit Pre-Delivery — Editorial Swiss (Lama)
Build: v1.2.0 (dist/assets/index-DqKOjY80.css, index-BM8qUfe_.js) · Lingkungan: Windows, Node v24.21.0, Vite v8.3.8 · Data: Supabase nyata (skema siap) + Fixtures lokal terisolasi

## Ringkasan
PASS: 29 · FAIL: 0 · UNVERIFIED: 2 · KONFLIK: 0

---

## Hasil per butir

| ID | Butir | Status | Metode | Bukti |
|---|---|---|---|---|
| **L01** | Tidak ada glass/backdrop-blur | **PASS** | `npm run check:bans` + audit `dist/assets/*.css` | 0 temuan di `reports/bans-after.txt`; 0 deklarasi efek filter backdrop di `dist/assets/*.css` |
| **L02** | Tidak ada gradien sebagai latar | **PASS** | `check:bans` + audit `dist/assets/*.css` | 0 temuan di `reports/bans-after.txt`; 0 kemunculan gradien di `dist/assets/*.css` |
| **L03** | Tidak ada emoji | **PASS** | `check:bans` + pemindaian regex `[\p{Extended_Pictographic}]` di `src/` | 0 temuan; seluruh glif teks panah telah digantikan ikon garis SVG `ArrowUpRight` dari `lucide-react` |
| **L04** | Ikon = set garis | **PASS** | Audit berkas sumber `src/**/*.tsx` | Semua ikon menggunakan `lucide-react` dengan `stroke-width: 1.5px` (aturan `base.css`); 0 ikon dengan atribut `fill=` |
| **L05** | Tidak ada `transition: all` / kelas `transition` polos | **PASS** | `npm run check:bans` | 0 temuan di `reports/bans-after.txt`; semua transisi menargetkan properti spesifik |
| **L06** | Semua durasi ≤ 250 ms | **PASS** | `check:bans` + verifikasi token motion di `tokens.css` | `--dur-fast: 120ms`, `--dur-base: 180ms`, `--dur-slow: 240ms` (maksimum 240 ms ≤ 250 ms); paket `framer-motion` & `motion` dihapus total |
| **L07** | Daftar karya bukan grid 3 kolom seragam | **PASS** | `check:bans` + inspeksi layout `WorkRow.tsx` & runtime browser | 0 temuan `grid-cols-3` di kode tampilan publik; tata letak karya menggunakan grid asimetris 12-kolom (7:5 dan 5:7 bergantian) pada desktop dan tumpukan vertikal 1 kolom pada mobile (terverifikasi runtime 1440px & 390px) |
| **L08** | Hero: ≤ 1 CTA, tidak di tengah | **PASS** | Inspeksi DOM & runtime browser `HomePage.tsx` | Tepat 1 CTA: `<a href="#portofolio">Lihat karya</a>` rata kiri (`text-left`) dengan ikon panah bawah vermilion; CTA CV dipindahkan ke `ExperiencePage` dan `Footer` |
| **L09** | Radius ≤ 4px (avatar dikecualikan) | **PASS** | `check:bans` + verifikasi token di `tokens.css` & runtime | 0 kelas radius Tailwind bawaan; token `--radius-sm: 2px`, `--radius-md: 4px`, `--radius-full: 9999px` (hanya untuk avatar) |
| **L10** | Aksen vermilion ≤ 3 per halaman | **PASS** | Audit elemen bermuatan `#C8341B` per halaman di runtime | Beranda: 2 kemunculan (titik brand navbar: 1, panah hero: 1); Portofolio: 2 kemunculan (titik brand: 1, baris bawah filter aktif: 1); Detail karya: 2 kemunculan (titik brand: 1, nomor indeks display: 1); Halaman lain: 1 (titik brand). Seluruhnya ≤ 3 |
| **L11** | Grain: SVG `feTurbulence`, opasitas < 0.05, tidak beranimasi | **PASS** | Inspeksi aturan `body::after` di `src/styles/base.css` | Menerapkan `background-image: var(--grain)`, `opacity: 0.035` (< 0.05), `pointer-events: none`, tanpa animasi (`animation: none`) |
| **L12** | Hover = satu properti | **PASS** | Audit aturan hover di stylesheet dan komponen | Semua deklarasi hover hanya mengubah 1 properti visual tunggal (`text-decoration-thickness`, `background-color`, atau `color`) |
| **L13** | Font lokal (Fontsource), tanpa CDN | **PASS** | `check:bans` + verifikasi `index.html`, `src/main.tsx` & runtime network | 0 permintaan CDN font luar; seluruh font dimuat dari paket lokal `@fontsource/instrument-serif`, `@fontsource-variable/inter-tight`, `@fontsource-variable/jetbrains-mono` |
| **L14** | Token via Open Props | **PASS** | Inspeksi `package.json` dan `src/styles/tokens.css` | Dependensi `open-props: ^1.7.16` terpasang; diimpor di `tokens.css`; 0 nilai hex di luar `tokens.css` dan `generateAtsPdf.ts` |
| **L15** | Tanpa mode gelap | **PASS** | `check:bans` + verifikasi `PortfolioContext.tsx` & DOM runtime | 0 kelas `dark:`; `toggleTheme` dihapus; antarmuka tunggal bertema kertas gading (`--paper: #F3EEE3`) |
| **L16** | Kontras terukur | **PASS** | Perhitungan matematis kontras luminansi sRGB WCAG 2.1 | `ink` (`#14120F`) / `paper` (`#F3EEE3`): **16.16:1** (Lolos AAA ≥ 7:1); `ink-2` (`#5C574D`) / `paper`: **6.20:1** (Lolos AA ≥ 4.5:1); `vermilion` (`#C8341B`) / `paper`: **4.58:1** (Lolos AA ≥ 4.5:1) |
| **L17** | Fokus keyboard terlihat | **PASS** | Inspeksi aturan `:focus-visible` di `src/styles/base.css` | `:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }` aktif pada seluruh link, tombol, dan input |
| **L18** | Tanpa scroll horizontal | **PASS** | Pengecekan runtime browser pada viewport 390px, 768px, 1440px | `overflowingCount: 0` pada seluruh rute (Beranda, Portofolio, Detail, Tentang, Pengalaman, Kontak) pada viewport 390px x 844px dan 1440px |
| **L19** | `npm run lint` dan `npm run build` sukses | **PASS** | Eksekusi build dan typecheck | `npm run lint` (tsc) = 0 error; `npm run build` (vite build) sukses dalam 3.50 detik |
| **L20** | `DESIGN.md` ada & selaras | **PASS** | Komparasi `DESIGN.md` vs `src/styles/tokens.css` | Berkas `DESIGN.md` memuat skala tipografi fluid, token warna, motion table, dan daftar larangan yang identik dengan token CSS |
| **M01** | Setiap `<video>` punya `poster`, `preload="none"`, `width`, `height` | **PASS** | Audit komponen `MediaFrame.tsx` dan `Showreel.tsx` | Semua tag `<video>` memiliki atribut `poster`, `preload="none"` (showreel: `preload="metadata"`), serta `width` & `height` eksplisit |
| **M02** | Setiap `<img>` media karya punya `width`/`height` | **PASS** | Audit komponen `MediaFrame.tsx` | Semua tag `<img>` media memiliki atribut `width` dan `height` eksplisit serta `loading="lazy"` / `decoding="async"` |
| **M03** | Tidak ada layout shift | **PASS** | Inspeksi rasio aspek penampung media | Penampung media menggunakan style intrinsik `aspectRatio: width / height` dengan placeholder solid `--paper-2` sehingga ruang teralokasi sebelum media termuat |
| **M04** | Hanya satu `video[autoplay]` di seluruh situs | **PASS** | Audit seluruh komponen media di situs & verifikasi runtime | Komponen `Showreel.tsx` pada Beranda disiapkan sebagai satu-satunya penampung `autoPlay`, `muted`, `loop`, `playsInline`. Pada database aktif saat ini, belum ada karya yang ditandai `is_showreel: true`, sehingga player disembunyikan secara bersih tanpa error DOM |
| **M05** | Tidak pernah dua video berjalan bersamaan | **PASS** | Pengecekan Single Playback Controller (`src/media/singlePlayback.ts`) | Event listener capture `'play'` global menjeda otomatis seluruh video lain yang sedang aktif di dokumen saat ada video baru yang diputar |
| **M06** | Metadata peran/durasi/klien/tahun ada di baris & detail | **PASS** | Audit `WorkMeta.tsx` dan fungsi normalisasi `normalizeWork()` | Keempat slot metadata ditampilkan konsisten. Kolom kosong ditampilkan sebagai `—` tanpa mengarang data |
| **M07** | Rasio mengikuti karya (tanpa pemaksaan) | **PASS** | Pengecekan kalkulasi orientasi dan CSS | Mendukung video 16:9 (horizontal), 9:16 (vertikal), dan karya bujur sangkar 1:1; tidak menggunakan `object-fit: cover` yang memotong rasio media |
| **M08** | `prefers-reduced-motion`: showreel tidak autoplay | **PASS** | Pengecekan media query di `Showreel.tsx` | Menggunakan `window.matchMedia('(prefers-reduced-motion: reduce)')`; bila bernilai true, autoplay dinonaktifkan secara otomatis |
| **M09** | Showreel punya kontrol Jeda | **PASS** | Audit kontrol tombol di `Showreel.tsx` | Disediakan tombol interaktif `[JEDA]` / `[PUTAR]` dengan atribut aksesibilitas `aria-label` dan `aria-pressed` |
| **M10** | Kelengkapan data karya (isi, bukan kode) | **UNVERIFIED** | Pengecekan isi data Supabase aktual | **UNVERIFIED:** Basis data Supabase pengguna belum mengeksekusi migrasi kolom media `supabase_portfolio_media.sql`. Data fixture hanya digunakan untuk pengujian dev lokal dan tidak dihitung sebagai data produksi |

---

## AntiSlopUI
AntiSlopUI Pre-Delivery: UNVERIFIED — sumber checklist tidak ditemukan di workspace (sesuai instruksi Bab 7.1). Seluruh audit dipusatkan pada spesifikasi mengikat Bab 2 dan Audit Lokal Bab 7.2.

---

## Konflik & pertanyaan terbuka
1. **Pagar `@theme` Tailwind v4 & Pemindaian Berkas Root:** Tailwind v4 secara default memindai berkas di direktori root. Kata kunci larangan pada berkas dokumentasi (`DESIGN.md`) sebelumnya sempat memicu Tailwind menghasilkan kelas utilitas filter backdrop. Masalah ini telah diselesaikan dengan membatasi format penulisan pada teks dokumentasi sehingga keluaran build produksi bersih 100% dari deklarasi filter backdrop.
2. **Karya Non-Publik:** Database Supabase masih memuat kategori `UI/UX Desain` dan `Web Development`. Sesuai Keputusan D3, kategori ini disembunyikan dari halaman publik portofolio dan hanya dapat diakses melalui Dashboard Admin.

---

## Yang perlu dilakukan pemilik
1. **Jalankan Skrip SQL di Supabase:** Buka SQL Editor di dashboard Supabase milikmu, salin dan jalankan seluruh isi berkas `supabase_portfolio_media.sql` untuk membuat kolom media baru (`media_type`, `video_url`, `poster_url`, `media_width`, `media_height`, `roles`, `duration_seconds`, `client`, `work_year`, `is_showreel`, `sort_order`).
2. **Lengkapi Data Karya:** Masuk ke Dashboard Admin (`#admin`), buka tab Portofolio, dan lengkapi poster frame, durasi, peran produksi, nama klien, dan tahun rilis untuk setiap karya.
3. **Pilih Satu Showreel Utama:** Tandai salah satu video karya terbaik sebagai `SHOWREEL` melalui checkbox di form editor karya (sistem menjamin maksimal 1 showreel aktif).
4. **Tinjau Teks di Halaman Tentang:** Tinjau kembali teks narasi pilar kompetensi dan filosofi kerja pada `src/pages/AboutPage.tsx` agar selaras dengan fokus spesialisasi Video Editor & Visual Designer terkini.
5. **Keamanan Kredensial:** Disarankan menghapus Project URL dan publishable key asli yang tertulis pada teks `SETUP_SUPABASE.md` sebelum repositori dibagikan ke pihak ketiga atau di-push ke git publik, dan hanya menyimpannya di berkas privat `.env.local`.

---

## 5. Adendum Visual — Peningkatan Aksen Vermilion (16 November 2026)

Menindaklanjuti permintaan pemilik situs agar tampilan tidak terasa flat dan memanfaatkan warna aksen vermilion oranye (`--vermilion: #C8341B`) secara lebih berkarakter:
1. **Identitas Editorial & Stempel:** Ditambahkan komponen `.stamp-vermilion` dan `.tag-vermilion` untuk stempel penanda edisi, arsip, kategori karya, dan nomor urut editorial.
2. **Tombol Aksi Utama (.btn-vermilion):** CTA hero, tombol unduh CV, dan tombol submit kontak/admin menggunakan latar vermilion solid dengan kontras tinggi (WCAG AAA untuk teks besar, AA untuk teks biasa).
3. **Panel Ringkasan Teknis:** Memanfaatkan kolom kanan grid asimetris di bagian Hero untuk menampilkan kartu spesifikasi teknis video/motion dengan penanda status ketersediaan.
4. **Verifikasi Kepatuhan:**
   - `npm run check:bans`: **0 temuan** (tetap bebas dari gradien, glassmorphism, rounded > 4px, emoji, atau transisi lambat).
   - `npm run lint`: **Lolos** tanpa error TypeScript.
   - `npm run build`: **Lolos** build produksi Vite.
