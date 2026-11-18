# Portofolio Muhammad Andra Kusuma Ramadhan (Editorial Swiss)

Portofolio pribadi Video Editor, Designer & Digital Marketing dengan gaya Editorial Swiss, sistem tipografi terukur, galeri lembar kontak (contact sheet), dan pelaporan hasil pemasaran terukur.

## Cara Menjalankan Secara Lokal

### Prasyarat
- Node.js 18+
- Proyek Supabase aktif

### Langkah Setup
1. Pasang dependensi:
   ```bash
   npm install
   ```
2. Siapkan berkas `.env.local`:
   Salin `.env.example` ke `.env.local` dan lengkapi konfigurasi Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   ```
3. Migrasi Database Supabase:
   Jalankan skrip SQL berikut di SQL Editor dashboard Supabase Anda:
   - `supabase_storage_portfolio.sql` (Storage bucket `portfolio` & RLS)
   - `supabase_portfolio_media.sql` (Metadata media & showreel)
   - `supabase_marketing_results.sql` (Tabel hasil marketing & RLS)
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
5. Akses antarmuka:
   - Publik: `http://localhost:3000/`
   - Admin rahasia: `http://localhost:3000/#admin`

## Perintah Tersedia
- `npm run dev`: Menjalankan Vite dev server.
- `npm run build`: Kompilasi aplikasi untuk produksi.
- `npm run preview`: Pratinjau hasil build produksi.
- `npm run lint`: Pengecekan tipe TypeScript (`tsc --noEmit`).
- `npm run check:bans`: Audit otomatis pagar larangan visual dan copy Editorial Swiss.
