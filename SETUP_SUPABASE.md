# Panduan Integrasi Supabase — Portofolio AndraKr

File ini menjelaskan apa saja yang berubah dari versi sebelumnya (localStorage)
ke versi ini (Supabase), dan langkah yang perlu kamu lakukan secara manual.

## 1. File yang berubah / baru

| File | Perubahan |
|---|---|
| `src/lib/supabaseClient.ts` | **BARU.** Membuat koneksi ke Supabase pakai Project URL & anon/publishable key. |
| `src/vite-env.d.ts` | **BARU.** Supaya TypeScript kenal `import.meta.env.VITE_SUPABASE_URL` dkk. |
| `src/context/PortfolioContext.tsx` | **Dirombak total.** Semua CRUD (portfolio, pengalaman, pesan) & login admin sekarang lewat Supabase, bukan localStorage. Semua fungsi CRUD sekarang **async** (return `Promise`). |
| `src/pages/AdminLoginPage.tsx` | `handleSubmit` diubah jadi `async`, ada state `isSubmitting` untuk loading. |
| `src/pages/ContactPage.tsx` | `handleSubmit` diubah jadi `async`, menunggu server konfirmasi sebelum form dikosongkan. |
| `src/pages/AdminDashboardPage.tsx` | Tombol "Reset ke Data Bawaan" diganti "Muat Ulang dari Server" (lebih aman — tidak menimpa data asli dengan dummy). `handleImportSubmit` jadi async. |
| `src/App.tsx` | Tunggu Supabase selesai cek sesi dulu sebelum redirect ke halaman login admin (mencegah "kedip"). |
| `package.json` | Tambah `@supabase/supabase-js`, perbaikan versi `esbuild`. |
| `.env.example` | Tambah `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY`. |

`src/data/initialData.ts` **masih ada** tapi **sudah tidak dipakai** untuk isi awal data —
dibiarkan saja sebagai referensi kalau kamu mau lihat contoh format data lama.

## 2. Langkah yang HARUS kamu lakukan secara manual

### a. Jalankan skrip SQL di Supabase (kalau belum)
Buka **SQL Editor** di dashboard Supabase, jalankan isi file `supabase_schema.sql`
yang sudah dikirim sebelumnya (bikin tabel `portfolio_items`, `experiences`, `messages`
+ Row Level Security).

### b. Buat file `.env.local`
Di root proyek (sejajar dengan `package.json`), buat file baru bernama **`.env.local`**
(BUKAN `.env.example`), isinya:

```
VITE_SUPABASE_URL="https://vxhezuplsvqsthutdvpl.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_TNrYR0BSJAcvWLwUacDG2w_Lr0syNEH"
```

Ganti dengan Project URL & Publishable key **milikmu sendiri** (ambil dari
Settings > API di dashboard Supabase). File `.env.local` ini TIDAK akan ter-push
ke GitHub karena sudah ada di `.gitignore`.

> [!WARNING]
> **Rekomendasi Keamanan:** Disarankan untuk menghapus Project URL & publishable key asli di atas dari file Markdown ini atau menggantinya dengan nilai placeholder sebelum di-commit/dibagikan, dan hanya menyimpannya di file rahasia `.env.local`.

### c. Install ulang dependency
```
npm install
```
Ini akan menambahkan `@supabase/supabase-js` ke `node_modules`.

### d. Jalankan & tes
```
npm run dev
```
Coba:
1. Buka halaman **Portofolio** — harusnya kosong (karena tabel Supabase masih kosong, data dummy lama tidak lagi dipakai).
2. Buka `/admin` atau `#admin` — login pakai email & password akun admin yang kamu buat di Supabase Auth (Tahap 3).
3. Coba tambah 1 portofolio dummy dari Dashboard Admin — cek apakah muncul di tabel `portfolio_items` di Supabase Table Editor.
4. Coba kirim pesan dari halaman Kontak — cek muncul di tabel `messages`.

### e. (Opsional) Isi data awal lewat SQL langsung
Kalau males input satu-satu lewat form admin, kamu bisa juga `INSERT` data awal
langsung lewat SQL Editor di Supabase, mengacu ke struktur di `supabase_schema.sql`.

## 3. Yang BELUM ditangani di update ini
- **Upload gambar** (`src/utils/imageUpload.ts`) masih menghasilkan base64 di browser
  dan disimpan sebagai teks panjang ke kolom `image_url`. Ini SEKARANG AMAN tersimpan
  ke database Supabase (jadi tidak hilang), tapi belum pindah ke **Supabase Storage**.
  Base64 gambar ukuran besar bisa bikin database Supabase cepat penuh (row jadi berat).
  Rekomendasi lanjutan: pindahkan upload gambar ke Supabase Storage bucket, simpan
  hanya URL publiknya di kolom `image_url`.
- Dependency `@google/genai`, `express`, `dotenv` di `package.json` belum dihapus —
  aman dibiarkan, tapi bisa dibersihkan kapan saja karena tidak dipakai di kode.


---

## Update: Profil Situs, Akun & CV ATS dinamis

Urutan pasang:
1. Jalankan `supabase_profile_full_addon.sql` di Supabase SQL Editor (aman dijalankan walau `supabase_profile_addon.sql` sudah pernah dijalankan).
2. Timpa isi folder proyek dengan isi zip terbaru, lalu `npm run dev` (restart kalau sudah jalan).
3. Login `/admin` -> tab **Profil Situs** (nama, kontak, bio, skill, sertifikat) dan tab **Akun** (foto, ganti email, ganti password).

Catatan:
- Halaman publik (Beranda, Tentang, Kontak, Footer) dan CV ATS sekarang membaca dari tabel `site_profile`, bukan lagi data statis di kode.
- Bagian yang kosong (mis. telepon, sertifikat) otomatis tidak ditampilkan di situs maupun CV.
- CV lama berisi klaim yang dikarang (IPK, sertifikasi, judul tugas akhir). Semua itu sudah dihapus; CV kini hanya memuat data yang kamu isi sendiri.
- Teks naratif di halaman Tentang (prinsip kerja, deskripsi kurikulum) masih statis di kode.

---

## Update Visual Editorial Swiss (Versi 1.2.0)

Langkah manual untuk skema media portofolio:
1. Buka **SQL Editor** di dashboard Supabase milikmu.
2. Buka dan jalankan seluruh isi file `supabase_portfolio_media.sql` yang ada di root repo ini.
   - Skrip ini akan menambahkan kolom metadata media baru ke tabel `portfolio_items`:
     - `media_type` ('video' / 'image')
     - `video_url` (URL video mp4 / stream)
     - `poster_url` (URL poster frame wajib)
     - `media_width` & `media_height` (dimensi intrinsik)
     - `roles` (array text peran produksi)
     - `duration_seconds` (durasi video dalam detik)
     - `client` (nama klien / pemilik brand)
     - `work_year` (tahun rilis 4-digit)
     - `is_showreel` (boolean showreel tunggal)
     - `sort_order` (urutan numerik manual)
     - Memperbarui constraint kategori agar `Video Editing` dan `Desain` terdaftar valid.
3. Setelah dieksekusi di Supabase, Dashboard Admin `/admin` langsung siap mengelola kolom media dan showreel.
