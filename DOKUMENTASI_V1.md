# Dokumentasi Struktur & Alur Website Portofolio (Versi 1.1.2)
**Proyek:** Portofolio Interaktif & Personal CMS  
**Brand Identity:** AndraKr  
**Pemilik:** Muhammad Andra Kusuma Ramadhan (Andra Ramadhan)  
**Versi:** 1.1.2 (Release Update)  
**Tanggal Rilis:** 27 September 2026  

> **Pembaruan Gaya Visual (Versi 1.2.0):** Seluruh arah visual berbasis iOS Liquid Glassmorphism, gradien, backdrop-blur, dan tombol ganda telah dicabut. Untuk pedoman arah visual baru, skala tipografi, token warna, motion, dan media rule, lihat [DESIGN.md](DESIGN.md). Dokumen ini tetap berlaku untuk skema data dan alur CV.

---

## 1. Ringkasan Proyek & Identitas Visual
> DICABUT — lihat DESIGN.md

Website portofolio ini dibangun dengan standar antarmuka kontemporer bergaya **iOS Liquid Glassmorphism**, cepat, bersih, dan berfokus pada showcase karya serta konversi profesional tanpa distraksi yang tidak perlu.

- **Brand Identity:** Tipografi premium **AndraKr** dengan titik aksen (*dot accent*) yang bersih dan minimalis tanpa box monogram.
- **Tema Visual:** Mode Terang (*Light Glass*) & Mode Gelap (*Dark Liquid Glass*) yang dapat diganti instan.

---

## 2. Struktur Navigasi & Header Minimalis

### A. Header Bar (Frosted Liquid Glass & Permanent Floating / Stay)
> DICABUT — lihat DESIGN.md

Header bar berada melayang (*floating*) secara permanen (*stay*) di bagian atas layar dengan efek kaca tembus pandang (*frosted liquid glass blur*) yang nyata:
1. **Posisi Permanen (Always Stay):** Navbar tetap melayang standby di bagian atas layar setiap saat saat pengguna melakukan scroll, memberikan akses navigasi instan tanpa sembunyi.
2. **Transparansi Kaca Frosted (Backdrop Blur Nyata):** Background tembus pandang bergradasi halus (`rgba` 0.65 - 0.68) dengan *backdrop blur* 24px, saturasi 200%, dan refleksi tepi kaca (*specular highlight*), sehingga elemen dan warna di belakang navbar terlihat terdistorsi secara estetis saat di-scroll.
3. **Pill Navigation Desktop (Tengah):** Tautan navigasi ringkas (*Beranda, Tentang, Portofolio, Pengalaman, Kontak*) dengan sistem *Scroll-Spy* yang berpindah status aktif secara otomatis mengikuti posisi bagian halaman saat ini.
4. **Brand AndraKr (Kiri):** Tipografi elegan `AndraKr.` beraksen warna gradien indigo. Mengarahkan dan melakukan *smooth-scroll* ke puncak Beranda saat diklik.
5. **Mode Switcher (Kanan):** Tombol pengalih tema (Terang / Gelap) dengan ikon Sun / Moon.
6. **Garis Tiga / Hamburger Menu (Kanan):** Tombol menu utama yang membuka laci navigasi interaktif (*floating glass drawer*).
7. **Indikator Admin (Kondisional):** Hanya muncul jika sesi login pemilik aktif.

### B. Menu Drawer Navigasi
> DICABUT — lihat DESIGN.md

Membuka daftar navigasi komprehensif saat tombol garis tiga diklik:
- **Beranda** (Halaman Utama & Profil Singkat)
- **Tentang** (Latar Belakang Pendidikan & Keahlian)
- **Portofolio** (Galeri Karya, Filter Kategori, & Detail Modal)
- **Pengalaman** (Riwayat Karier & Magang)
- **Kontak** (Formulir Pesan Interaktif & Kanal Kolaborasi)
- *(Opsional)* **CMS Admin Portofolio & Tombol Keluar** (Hanya tampil saat sesi login admin aktif).

---

## 3. Struktur Halaman & Alur Pengunjung (Public Flow)

### 3.1. Halaman Beranda (`/` atau `#beranda`)
> DICABUT — lihat DESIGN.md (Greeting pill, skill chips ber-emoji, CTA ganda berdampingan, Fanned Card Deck 3D/ambient glow, dan SectionDivider gradien dicabut. Digantikan Hero tipografi display serif editorial dengan satu CTA, Showreel tunggal autoplay, dan daftar karya asimetris).

Halaman pertama yang menyambut pengunjung dengan konsep *fresh*, elegan, dan tidak berlebihan:
- **Greeting Pill:** Badge ramah `👋 Hi, aku Andra`.
- **Hero Title:** Judul dinamis bergradien: *"Merancang Pengalaman Digital & Visual Kreatif"*.
- **Ringkasan Singkat:** Pengantar peran yang menghubungkan rekayasa front-end web, desain UI/UX, produksi video, dan digital marketing.
- **Keahlian Utama (Skill Chips):**
  - 🎨 *UI/UX Design*
  - 💻 *Front-End Dev*
  - 🎬 *Video Editing & Motion*
  - ✨ *Digital Marketing*
- **Aksi CTA Utama (Berdampingan):**
  - **Tombol "Lihat Portofolio":** Dilengkapi ikon panah ke kanan (*right arrow*) yang langsung mengarahkan dan membuka halaman penuh **Portofolio** (`PortfolioPage`).
  - **Tombol "Unduh CV":** Mengunduh langsung berkas resmi **Curriculum Vitae Standar ATS Indonesia (Format PDF)** berkecepatan tinggi.
- **Pilar Kompetensi Profesional:** 3 kartu keahlian interaktif (Video Editing & Motion, UI/UX & Product Design, Front-End Development).
- **Portofolio Terpilih (Fanned Card Deck UI):** Showcase karya unggulan dalam tata letak kipas (*fanned card deck*) dengan tampilan bersih dan minimalis (tanpa label/angka yang berlebihan). Dilengkapi animasi 3D slide dinamis: kartu baru bergerak maju dari belakang ke depan (*emerge from back to front*), sementara kartu aktif sebelumnya mundur dari depan ke belakang (*recede from front to back*) secara sinkron melalui `translate3d(x, y, z)`. Otomatis berputar bergantian setiap 4 detik menggunakan React `useEffect` interval (otomatis dijeda saat kartu disentuh/di-hover kursor), navigasi manual tombol panah dan dot scrubber dengan transisi mulus yang identik, serta ambient glow ungu-violet di latar belakang.
- **Cuplikan Karier Terkini:** Ringkasan 2 pengalaman kerja terbaru (PT Reja Aton Energi & Proyek Independen).
- **Banner Kolaborasi:** CTA ajakan proyek langsung dengan tautan email instan.
- **Pemisah Bagian Kaca Horisontal (SectionDivider):** Garis gradien halus semi-transparan (`1px`) yang memisahkan tiap bagian utama halaman secara estetis dengan aksen refraksi *liquid glass*, ambient bloom indigo, dan titik specular di tengahnya.

### 3.2. Halaman Tentang (`#tentang`)
- Profil mendalam mengenai latar belakang akademis (Lulusan D4 Teknik Informatika 2025).
- Pengalaman nyata magang Digital Marketing di PT Reja Aton Energi.
- Filosofi kerja: menggabungkan ketelitian rekayasa kode dengan kepekaan estetika visual.
- Rincian *tools & software stack* (Figma, Adobe Suite, React, Next.js, DaVinci Resolve, dll).

### 3.3. Halaman Pengalaman Kerja (`#pengalaman`)
- Riwayat kerja & kepemimpinan organisasi dalam urutan kronologis terpadu.
- Tampilan bersih tanpa bilah pencarian berlebih untuk keterbacaan riwayat yang optimal.
- Generator CV ATS Indonesia resmi (PDF) dengan opsi download instan dan modal pratinjau teks.

### 3.4. Halaman Portofolio Karya (`#portofolio`)
> DICABUT — lihat DESIGN.md (Grid simetris 2-panel grid-cols-2, tema warna #5B5FEF, DesignFullscreenModal, dan PortfolioDetailModal dicabut. Digantikan indeks editorial karya asimetris, filter mono dengan garis bawah vermilion, kartu asimetris dengan poster frame eksplisit, dan navigasi ke halaman detail hash `#portofolio/<slug>`).

- **Filter Multi-Kategori Kaca:** Pilihan kategori terfokus (*Desain*, *Video Editing*, *UI/UX Desain*, *Web Development*) di mana kategori "Semua" telah digantikan langsung oleh "Desain" sebagai filter default.
- **Tata Letak 2 Panel Kanan-Kiri Khusus Desain:**
  - Kategori Desain menggunakan tata letak **2 Panel (Kiri & Kanan)** secara berdampingan (`grid grid-cols-2`), di mana karya-karya berikutnya tersusun mengalir ke bawah dalam 2 kolom teratur (tidak ditumpuk 1 kolom ke bawah).
- **Card Khusus Kategori Desain (Fokus Visual & Tema Biru `#5B5FEF`):**
  - Mengikuti palet warna biru/indigo standar portofolio (`#5B5FEF`).
  - Berbeda dengan kartu kategori lain yang memuat paragraf deskripsi panjang dan tombol "Lihat Detail", card Desain hanya menyajikan:
    1. **Gambar Karya Seni:** Pratinjau visual 2 panel dominan dengan efek hover zoom halus.
    2. **Judul:** Nama karya visual/desain grafis.
    3. **Keywords / Tools:** Chip perangkat seperti *Canva*, *Figma*, *Photoshop*, *Illustrator* dengan aksen biru *liquid glass*.
    4. **Tanggal:** Waktu pembuatan karya.
    5. **Aksi Fullscreen:** Tombol dan klik kartu langsung membuka **Design Fullscreen Lightbox Modal**.
- **Mode Fullscreen Bersih (Tanpa Teks Keyword):**
  - Tampilan layar penuh imersif bebas dari teks "Keywords:" maupun tag kata kunci sehingga pandangan murni tertuju pada estetika karya visual.
  - Dilengkapi kontrol zoom (Zoom In, Zoom Out, Reset 100%), buka gambar asli di tab baru, serta tombol tutup (shortcut ESC).
- **Card Kategori Standar (Video Editing, UI/UX, Web Dev):** Tetap menyajikan ringkasan deskripsi proyek dan membuka pop-up tampilan penuh (`PortfolioDetailModal`) untuk melihat tantangan, solusi teknis, dan tautan live proyek.

### 3.5. Transisi Halaman Mulus (Framer Motion)
> DICABUT — lihat DESIGN.md (Paket Framer Motion dan transisi 320 ms dicabut. Digantikan transisi CSS opacity murni 180 ms tanpa layout shift).

- Seluruh navigasi perpindahan halaman di `App.tsx` didukung oleh **Framer Motion (`AnimatePresence mode="wait"` & `motion.div`)**.
- Efek transisi berupa pemudaran halus (*seamless fade*) dan luncuran vertikal lembut (*subtle vertical slide `y: 16 -> 0`*) dengan kurva `cubic-bezier(0.22, 1, 0.36, 1)`, serta auto-scroll instan ke atas saat halaman berpindah.

### 3.5. Halaman Kontak (`#kontak`)
- Formulir pesan interaktif dengan validasi form (Nama, Email, Subjek, Kategori Proyek, Pesan).
- Tombol kirim terhubung langsung dengan penyimpanan pesan lokal / pesan terproteksi ke inbox pemilik.
- Kartu informasi kontak langsung (Email, WhatsApp, LinkedIn, GitHub, Instagram).

---

## 4. Alur Akses Khusus Pemilik / Admin (Secret Admin Flow)

Untuk menjaga privasi dan integritas portofolio, **tidak ada tombol login admin di tampilan publik umum** (baik di navbar publik maupun di footer).

### 4.1. Cara Mengakses Portal Admin
Pemilik situs dapat mengakses portal login secara privat melalui URL:
- `URL_WEBSITE/#admin`
- `URL_WEBSITE/porto/admin`
- `URL_WEBSITE/admin`

Sistem otomatis mendeteksi rute ini dan mengalihkan ke halaman **Portal Akses Pemilik**.

### 4.2. Keamanan Portal Login
- Tidak ada teks/kotak demo "Akun Pemilik (Admin)" yang dibocorkan ke umum.
- Kolom email dan kata sandi dikosongkan secara *default* (bebas dari autofill publik).
- Dilengkapi enkripsi visual, proteksi status, dan validasi sesi pemilik.

### 4.3. Dashboard CMS Admin (`#admin-dashboard`)
Setelah login berhasil, pemilik situs mendapatkan akses penuh untuk:
1. **Kelola Portofolio (CRUD):** Tambah proyek baru, edit proyek eksisting, hapus proyek, serta atur status unggulan (*featured*).
2. **Kelola Pengalaman (CRUD):** Tambah, ubah deskripsi peran, masa kerja, institusi, dan tag keahlian.
3. **Kelola Pesan Masuk:** Membaca pesan yang dikirim oleh calon klien/kolaborator melalui form kontak, menandai pesan sudah dibaca, atau menghapus pesan.
4. **Keluar Sesi (Logout):** Menghapus sesi dan mengembalikan antarmuka ke mode publik murni.

---

## 5. Arsitektur Teknis & Penyimpanan Data

- **Framework:** React 19 SPA + Vite + TypeScript.
- **Styling:** Tailwind CSS dengan konsep kustom iOS Glassmorphism (`liquid-glass-light` & `liquid-glass-dark`).
- **Icons:** Lucide React icons.
- **State Management:** `PortfolioContext` berbasis React Context API.
- **Persistensi Data:** Data portofolio, pengalaman kerja, dan pesan tersimpan persisten melalui `localStorage` sehingga perubahan yang dilakukan oleh admin tetap tersimpan di peramban.
- **PDF Engine:** Generator CV PDF client-side terstandarisasi ATS 1-kolom.

---

## 6. Checklist Spesifikasi & Status Fitur
> Catatan: Butir 1, 2, 4, 11, 13–17 dicabut sepanjang menyangkut gaya visual lama (liquid glass, gradien, drawer hamburger, fanned 3D deck, modal detail). Lihat DESIGN.md untuk panduan implementasi Editorial Swiss.

| No | Komponen / Fitur | Status Versi |
|---|---|---|
| 1 | Header: Brand "AndraKr" + Mode + Garis Tiga | > DICABUT — lihat DESIGN.md (Diganti Navbar solid --paper 4 tautan) |
| 2 | Hero: Greeting "Hi, aku Andra" + Perkenalan Fresh | > DICABUT — lihat DESIGN.md (Diganti display serif besar tanpa emoji) |
| 3 | Hero: Chip Keahlian Utama (UI/UX, Dev, Video, Marketing) | ✅ Selesai (v1.0.0) |
| 4 | Hero: Tombol "Lihat Portofolio" (Arrow Right) & "Unduh CV" (PDF) | > DICABUT — lihat DESIGN.md (Diganti single CTA "Lihat karya") |
| 5 | Penghapusan badge "2025" & card metrik lama di Hero | ✅ Selesai (v1.0.0) |
| 6 | Modal Pratinjau CV ATS Indonesia | ✅ Selesai (v1.0.0) |
| 7 | Penyembunyian Login Admin dari antarmuka publik | ✅ Selesai (v1.0.0) |
| 8 | Akses Rahasia Admin via `/porto/admin` & `/admin` | ✅ Selesai (v1.0.0) |
| 9 | Penonaktifan autofill / kotak demo akun admin | ✅ Selesai (v1.0.0) |
| 10 | CMS Dashboard Admin untuk update konten mandiri | ✅ Selesai (v1.0.0) |
| 11 | Fanned Card Deck: Klik "Buka Detail / Buka Desain" navigasi ke PortfolioPage | > DICABUT — lihat DESIGN.md (Dihapus total) |
| 12 | Penambahan Kategori "Desain" & Penggantian Kategori "Semua" menjadi "Desain" | ✅ Selesai (v1.1.0) |
| 13 | Card Khusus Desain: Hanya Judul, Keywords (Canva, Figma, dll), Tanggal, & Fullscreen | > DICABUT — lihat DESIGN.md (Diganti kartu editorial asimetris) |
| 14 | Modal Lightbox Fullscreen Khusus Desain dengan Fitur Zoom (Zoom In/Out/Reset) | > DICABUT — lihat DESIGN.md (Diganti halaman detail hash `#portofolio/<slug>`) |
| 15 | Tata Letak 2 Panel Kanan-Kiri Khusus Desain (`grid-cols-2`, tidak 1 panel bertumpuk) | > DICABUT — lihat DESIGN.md (Diganti grid editorial asimetris) |
| 16 | Penyelarasan Tema Warna Kategori Desain ke Biru Portofolio (`#5B5FEF`) | > DICABUT — lihat DESIGN.md (Diganti palet paper/ink/vermilion) |
| 17 | Penghapusan Label & Tag Keyword pada Tampilan Fullscreen untuk Tampilan Bersih | > DICABUT — lihat DESIGN.md |
| 18 | Unggah Berkas Gambar Lokal Wajib untuk Kategori Desain (Kompresi & Simpan Otomatis) | ✅ Selesai (v1.1.2) |

---

## 7. Catatan Rilis Versi 1.1.2 (Changelog)

### Update Versi 1.1.2 (27 September 2026):
1. **Penghapusan Teks Keyword pada Mode Fullscreen:**
   - Menghapus label *"Keywords:"* dan chip tag pada `DesignFullscreenModal` sehingga pengguna dapat menikmati karya visual secara maksimal tanpa distraksi teks.
2. **Penyelarasan Warna ke Biru Utama Portofolio (`#5B5FEF`):**
   - Mengganti seluruh aksen merah muda/pink pada kategori Desain menjadi palet biru/indigo resmi portofolio (`#5B5FEF`, `#8d90ff`), meliputi badge kategori, border hover, chip keywords, ikon kalender, dan tombol *Fullscreen*.
3. **Grid 2 Panel Kanan-Kiri untuk Kategori Desain:**
   - Mengubah layout galeri kategori Desain menjadi 2 panel berdampingan (`grid grid-cols-2`), di mana karya-karya selanjutnya tersusun teratur mengalir ke bawah dalam 2 kolom simetris (bukan 1 panel menumpuk ke bawah).
4. **Sinkronisasi Navigasi FanCardDeck & Portofolio:**
   - Mengintegrasikan interaksi klik kartu pada `FanCardDeck` di halaman Beranda agar otomatis menyetel filter kategori yang bersangkutan dan langsung berpindah ke `PortfolioPage`.
5. **Wajib Unggah Gambar Visual dari Perangkat Lokal (Kategori Desain):**
   - Pada form tambah dan edit proyek di Dashboard Admin (`PortfolioModal` & `PortfolioInlineEditor`), ditambahkan fitur pemilihan dan pengunggahan berkas gambar langsung dari komputer atau HP pengguna (`PNG`, `JPG`, `JPEG`, `WebP`).
   - Berkas otomatis dikompresi secara efisien melalui HTML5 Canvas client-side dan disimpan persisten di `localStorage`.
   - Untuk kategori **Desain**, sistem memberlakukan validasi wajib: pengguna harus mengunggah gambar visual dari perangkat lokal sebelum dapat menyimpan karya.
