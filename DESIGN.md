# DESIGN.md â€” Spesifikasi Desain Editorial Swiss (Revisi V2)

Dokumen ini adalah sumber kebenaran visual mengikat untuk portofolio Muhammad Andra Kusuma Ramadhan (`andrakr-portfolio`). Semua file CSS dan TSX mengacu ke nilai dalam dokumen ini.
*Pembaruan Revisi V2 (16 November 2026):* Mengoreksi penyimpangan copywriting, memulihkan anggaran ketat aksen vermilion (maks 3 per halaman, tanpa hover), menerapkan sistem gerak stepped/timeline anti-mainstream (delay+durasi â‰¤ 250ms), galeri lembar kontak (contact sheet), bagian digital marketing terukur, navigasi mobile-first khusus HP dengan lembar indeks, dan menghapus pratinjau CV publik.

---

## 5.1 Prinsip Desain
1. **Kertas, tinta, garis.** Tidak ada kedalaman buatan: tanpa shadow, tanpa blur, tanpa gradien.
2. **Hierarki lewat ukuran dan posisi, bukan dekorasi.** Serif display besar membawa suara; sans membawa bacaan; mono membawa data.
3. **Grid 12 kolom, asimetris.** Kolom kanan sering dibiarkan kosong. Konten tidak diratakan ke tengah.
4. **Karya adalah pusat.** Tidak ada elemen UI yang bersaing dengan poster/video.
5. **Gerak anti-mainstream dari dunia editing.** Patah per-frame (`steps()`) atau linear seperti playhead timeline; tanpa bounce atau parallax. Bento Tentang Saya memakai reveal scroll-triggered bertahap, dengan hormat pada `prefers-reduced-motion`.
6. **Whitelist Copy Deck.** Hanya teks yang tercantum di Copy Deck (Bab 3) atau dari database yang boleh tampil di antarmuka publik. Tanpa jargon desain, tanpa teks pengisi, tanpa klaim karangan.

---

## 5.2 Token Warna (`src/styles/tokens.css`)

| Token | Nilai | Pakai untuk |
|---|---|---|
| `--paper` | `#F3EEE3` | Latar halaman (gading cetak) |
| `--paper-2` | `#EAE4D6` | Blok placeholder poster, latar field/panel |
| `--ink` | `#14120F` | Teks utama, garis tebal, tombol primer |
| `--ink-2` | `#5C574D` | Teks sekunder, label mono (kontras â‰ˆ 6.2:1 di atas `--paper`) |
| `--ink-3` | `#8C867A` | Batang grafik data "Sebelum", penanda netral |
| `--rule` | `#CFC8B8` | Garis rambut 1px pembagi section / frame |
| `--vermilion` | `#C8341B` | Satu-satunya aksen (maksimal 3 per halaman, kondisi diam) |
| `--status-live` | `#16A34A` | Titik status OPEN TO WORK |
| `--focus` | `var(--ink)` | Outline fokus keyboard 2px, offset 3px (bukan vermilion) |

> Dihapus dari versi sebelumnya: `--vermilion-hover`, `--vermilion-tint`, `.btn-vermilion`, `.stamp-vermilion`, `.tag-vermilion`. Hover tidak pernah menggunakan vermilion.

---

## 5.3 Tipografi & Skala Minimum 12px
- Display: `Instrument Serif` (`@fontsource/instrument-serif`)
- Sans: `Inter Tight Variable` (`@fontsource-variable/inter-tight`)
- Mono: `JetBrains Mono Variable` (`@fontsource-variable/jetbrains-mono`)

### Skala Tipografi
| Token | Nilai | Line-height | Letter-spacing | Keluarga |
|---|---|---|---|---|
| `--step-display-xl` | `clamp(3rem, 1.2rem + 11vw, 12rem)` | 0.88 | -0.035em | display serif |
| `--step-display-l` | `clamp(2.5rem, 1.4rem + 7vw, 7.5rem)` | 0.92 | -0.03em | display serif |
| `--step-display-m` | `clamp(1.75rem, 1.3rem + 3.4vw, 4rem)` | 0.98 | -0.02em | display serif |
| `--step-title` | `clamp(1.25rem, 1.1rem + 0.8vw, 1.75rem)` | 1.15 | -0.01em | display serif |
| `--step-body` | `1rem` (16px) | 1.55 | 0 | sans |
| `--step-small` | `0.875rem` (14px) | 1.5 | 0 | sans |
| `--step-label` | `0.75rem` (12px) | 1.3 | +0.08em, UPPERCASE | mono |

**Aturan font minimum:** Tidak ada teks di bawah 12px (`0.75rem`). Dilarang memakai `text-[10px]` atau `text-[11px]`. Nama hero tidak memakai uppercase (dapat pecah dua baris secara alami).

---

## 5.4 Anggaran Aksen Vermilion (Maksimal 3 Per Halaman, Diam, Tanpa Hover)
Vermilion `#C8341B` hanya boleh hadir maksimal 3 elemen per halaman dalam kondisi diam. Hover/fokus dilarang menggunakan vermilion.

| Rute / Halaman | Penggunaan Aksen Vermilion | Jumlah |
|---|---|---|
| **Semua Halaman** | Titik `.` pada brand `AndraKr.` di navbar | 1 |
| **Beranda — Tentang Saya** | Titik brand (#1) + kata `Portofolio` pada label hero (#2) + status `OPEN TO WORK` (#3), IPK `3.78` dan empat subjudul keahlian (#4) | 4 |
| **Karya (`#portofolio`)** | Titik brand (#1) + garis bawah tab filter aktif (#2) | 2 |
| **Detail Karya** | Titik brand (#1) + nomor indeks besar (#2) | 2 |
| **Tentang / Pengalaman / Kontak / Admin** | Titik brand (#1) saja | 1 |

---

## 5.5 Sistem Gerak Anti-Mainstream (Delay + Durasi â‰¤ 250ms)
Semua animasi berbasis timeline editing: patah per-frame (`steps()`) atau linear seperti playhead.
- **M1 â€” Playhead cut:** Garis vertikal 1px `--ink` menyapu kiriâ†’kanan (`--dur-cut: 220ms` linear), halaman baru tersingkap lewat `clip-path: inset(0 100% 0 0)` â†’ `inset(0 0 0 0)`.
- **M2 â€” Frame bertahap:** Poster dan judul di bawah lipatan tersingkap lewat `clip-path: inset(0 0 100% 0)` â†’ `inset(0)` dengan `steps(4, jump-end)` selama `--dur-step: 200ms`.
- **M3 â€” Odometer angka:** Digit angka Marketing / indeks berputar dengan `steps(5)` selama `--dur-tick: 180ms`.
- **M4 â€” Tanda potong (crop marks):** Sudut 4 garis 1px ink muncul pada hover/fokus bingkai (`opacity` 0 â†’ 1 dalam `--dur-fast: 120ms`).
- **M5 â€” Penggaris indeks (desktop â‰¥ 1024px):** Indikator vertikal 01â€“05 di margin kiri bergeser dengan `steps(4)`.
- **M6 â€” Lembar menu potong keras (HP):** Lembar menu layar penuh terbuka dengan `clip-path` `steps(5)` selama 200ms, menutup dengan `steps(3)` dalam 180ms.
- **M7 â€” Animasi masuk kinetik nama hero (Editorial Swiss):** Teks nama hero bergerak pelan dan stabil melintasi layar dari luar frame:
  - Baris atas: "Muhammad Andra" masuk dari kanan ke kiri, "Muhammad" keluar ke kiri lalu menghilang, "Andra" berhenti presisi di rata kiri.
  - Baris bawah: "Kusuma Ramadhan" masuk dari kiri ke kanan, "Kusuma" berhenti presisi di rata kiri bawah "Andra", dan "Ramadhan" melanjutkan perjalanannya sendiri secara linear keluar ke kanan layar.
  - Interaktif: Klik atau tekan tombol hero name memicu replay animasi kapan saja.
- **M8 â€” Animasi Ketikkan Mesin Tik (TypewriterText):** Animasi pengetikan mekanis karakter demi karakter khas estetika editorial Swiss diterapkan khusus pada teks hero yang pertama kali dilihat saat membuka situs (subheader peran dan tagline).
- **M9 â€” Strip Film Sinematik (Filmstrip):** Strip rol film 35mm kontinu yang digambar murni dari kode (HTML/CSS) tanpa gradien dan non-interaktif (`pointer-events-none`):
  - Terletak tepat di bawah Hero sebelum bagian 01.
  - Berisi karya featured/unggulan, bergerak kontinu dari kanan ke kiri secara looping.
  - Pita memakai warna tinta (`var(--ink)`), lubang film (*sprocket holes*) memakai warna kertas (`var(--paper)`).
  - Teks di tepi pita hanya memuat nomor frame mono dan `AndraKr`.
- **Aturan:** Delay + durasi â‰¤ 250 ms untuk transisi UI interaktif; animasi kinetik tipografi hero disesuaikan pelan dan elegan. Tanpa infinite. Mati total saat `prefers-reduced-motion: reduce`. Konten tetap tampil tanpa JS/animasi (kelas `.motion-on` hanya mengaktifkan transisi setelah JS siap).

---

## 5.6 Tentang Saya — Bento Editorial
- Empat kartu: profil/status; bio + pendidikan dalam kartu gabungan; keahlian lebar penuh.
- Status: `OPEN TO WORK`, lokasi, dan peran. Peran memakai vermilion.
- Bio diawali sapaan `Hi, Aku Muhammad Andra Kusuma Ramadhan`.
- Pendidikan dan IPK `3.78 / 4.00` ditampilkan bersama; angka IPK memakai vermilion.
- Skill dikelompokkan menjadi Multimedia, Digital Marketing, UI/UX Desain, Tool AI. Subjudul teks saja tanpa ikon dan berwarna vermilion; ikon hanya pada daftar skill. Tidak ada label `DIKURASI`.
- Reveal dipicu `IntersectionObserver`, bertahap saat section memasuki viewport; hormati `prefers-reduced-motion`.

## 5.7 Galeri Karya & Detail Karya Minimalis
- **Tampilan Umum (Beranda & Halaman Karya `#portofolio`):**
  - Semua kartu karya diatur ke rasio seragam **3:4** (`aspect-ratio: 3 / 4`), terlepas dari apakah rasio asli video/desain adalah 16:9 (landscape) atau 9:16 (portrait vertikal).
  - Media di dalam bingkai difit menggunakan `object-cover` bersih dan rapi, menghasilkan ritme grid editorial Swiss yang tenang, teratur, dan sejajar di setiap baris.
  - **Layar Mobile (< 768px):** Grid 2 kolom seragam (`grid-cols-2 gap-x-3.5 gap-y-8`), setiap kartu mengambil 1 kolom.
  - **Layar Desktop (â‰¥ 768px):** Grid 12 kolom terstruktur dengan `col-span-4` (3 kartu sejajar seimbang per baris) dengan jarak napas proporsional.
- **Halaman Detail Karya (`#portofolio/<slug>`):**
  - Alur elemen minimalis teratur: **Pemutar atau gambar â†’ Judul â†’ Deskripsi â†’ Hasil â†’ Navigasi sebelum/sesudah**.
  - **Hasil:** Hanya menampilkan satu angka views terakhir (misal `4,9 rb views` atau `4.920 views`), tanpa angka sebelum, persentase delta, atau grafik.
  - Media ditampilkan dalam rasio aslinya (16:9 atau 9:16) dengan pembatasan tinggi proporsional pada portrait agar tidak menutupi teks.

---

## 5.8 Sinergi Dua Arah: Metrik Ringkas di Karya & Studi Kasus Terukur di Pengalaman
Hasil magang digital marketing diorganisasikan dengan pemisahan peran yang tegas:
- **Di Halaman Detail Karya (`#portofolio/<slug>`):**
  - Disajikan ringkas dan padat: satu angka views terakhir + tombol `Tonton di platform asli â†—`.
- **Di Halaman Pengalaman Kerja (`#pengalaman` pada PT. Reja Aton Energi):**
  - Menjadi etalase utama kredibilitas profesional: blok capaian terukur, grafik batang komparasi horizontal `BarPair`, ringkasan pendekatan AI, dan sumber analitik resmi.

---

## 5.9 Navigasi & Mobile-First (HP)
- **Navbar Utama (Desktop & Mobile):**
  1. `Tentang` (`#tentang`)
  2. `Pengalaman` (`#pengalaman`)
  3. `Karya` (`#portofolio`)
  4. `Sertifikat` (`#sertifikat` - Halaman khusus baru)
  5. `Kontak` (`#kontak`)
- **Nomor Menu HP (MobileMenu):** Sama persis dengan nomor urut bagian di Beranda:
  - `01 Tentang & Skill`
  - `02 Pengalaman`
  - `03 Karya`
  - `04 Sertifikat`
  - `05 Kontak`
- Setiap klik item navigasi langsung membuka halaman khusus yang bersangkutan.

---

## 5.9 Struktur Halaman Beranda (Homepage)
Alur konten Beranda:
1. **Hero:** Nama kinetik, typewriter subheader peran & tagline pengantar.
2. **Strip Film:** Karya featured, ticker kanan ke kiri, pita tinta & lubang kertas.
3. **01 Tentang & Skill:** Ringkasan bio, foto avatar, pendidikan, dan blok keahlian (Multimedia & Digital Marketing).
4. **02 Pengalaman:** Ringkasan 3 pengalaman kerja terbaru.
5. **03 Karya:** Grid karya pilihan rasio 3:4 seragam.
6. **04 Sertifikat & Pelatihan:** Daftar sertifikasi dan kredensial teknis terbaru.
7. **05 Kontak:** Email dan tautan media sosial.
- Navbar: 4 item utama (`Karya`, `Tentang`, `Pengalaman`, `Kontak`).
- Desktop: Baris tunggal mono solid `--paper`, garis rambut bawah, brand kiri, menu kanan.
- Mobile (< 768px): Bar atas 52px sticky (brand + tombol `Menu` area sentuh 44px). Menekan `Menu` membuka Lembar Indeks Layar Penuh (M6) berisi menu 01â€“04 besar (`01 Karya`, `02 Tentang`, `03 Pengalaman`, `04 Kontak`), email, dan unduh CV. Latar `--paper` solid tanpa blur/bayangan.
- Target sentuh â‰¥ 44Ã—44px untuk seluruh tautan dan tombol.

---

## 5.9 Copy Deck (Whitelist Teks Publik)
Satu-satunya teks yang boleh tampil di antarmuka publik:
- Brand: `AndraKr.` (titik vermilion)
- Hero Beranda: `Portofolio` (vermilion) ` â€” Video editor, designer & digital marketing` (ink-2), nama, tagline (bila ada), tautan `Lihat karya` dengan ikon `ArrowDown`.
- Ringkasan Beranda: `01 Karya`, `02 Keahlian`, `03 Tentang`, `04 Pengalaman`, `05 Kontak` dengan tautan `Buka halaman` + `ArrowRight`.
- Showreel: Label `Showreel`, tombol `Jeda` / `Putar`.
- Karya: `Karya (08)`, `Semua / Video / Desain`, `Lembar / Daftar`, `Buka di platform asli`, `Dibuat dengan AI`, `Ada hasil`.
- Hasil Pemasaran (Detail Karya): `Hasil Pemasaran Digital`, label `Platform`, `Periode`, `Sebelum`, `Sesudah`, `Kenaikan`, `Sumber data`, `Lihat bukti performa`.
- Tentang & Keahlian: `Tentang`, `Keahlian`, isi bio/pendidikan dari `siteProfile`, keahlian multimedia di atas, keahlian marketing & lain di bawah.
- Pengalaman: `Pengalaman`, riwayat karier, tautan `Unduh CV (PDF)`. **Tanpa pratinjau publik.**
- Kontak: `Kontak`, `Mari berkolaborasi`, field `Nama`, `Email`, `Subjek`, `Kategori`, `Pesan`, tombol `Kirim pesan`.

---

## 5.10 Studi Kasus Produksi & Galeri Potongan Frame Sinematik (Fitur B)
Di halaman detail karya (`WorkDetailPage`), disajikan studi kasus editorial mendalam standar sutradara video dan desainer visual profesional:
1. **3 Pilar Studi Kasus Editorial (`WorkCaseStudySection`):**
   - `01 Â· TANTANGAN BRIEF`: Konteks kebutuhan klien, masalah audiens, dan batas media.
   - `02 Â· METODOLOGI VISUAL & AI`: Eksplorasi perangkat lunak (Remotion, Three.js, After Effects, DaVinci), prompt engineering AI terarah, dan perlakuan tata letak Swiss.
   - `03 Â· HASIL & EVALUASI`: Dampak nyata pada views, retensi tontonan penuh, atau keterbacaan promosi.
2. **Galeri Potongan Frame Sinematik (Still Frames Reel):**
   - Bingkai rasio 16:9 sinematik dengan micro-chip waktu mono (`FRAME 01 Â· 00:03`) dan overlay tanda potong M4 saat hover.
   - Modal lightbox minimalis (`StillFrameLightbox`) dengan navigasi keyboard (`â†`, `â†’`, `Esc`) dan thumbnail strip.
3. **Palet Warna Produksi:**
   - 5 swatch warna harmoni visual dengan nama tonal dan nilai HEX mono.


