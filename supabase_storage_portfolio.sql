-- ============================================================
-- OPSIONAL: Buat Bucket Storage 'portfolio' untuk Gambar Karya
-- Jalankan di Supabase Dashboard > SQL Editor
-- (Jika belum dijalankan, aplikasi otomatis fallback ke bucket 'avatars' atau Base64)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do update set public = true;

-- Izinkan publik melihat gambar portofolio
drop policy if exists "Public can view portfolio images" on storage.objects;
create policy "Public can view portfolio images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio');

-- Izinkan admin (authenticated) mengunggah, mengubah, dan menghapus gambar portofolio
drop policy if exists "Admin can upload portfolio images" on storage.objects;
create policy "Admin can upload portfolio images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio');

drop policy if exists "Admin can update portfolio images" on storage.objects;
create policy "Admin can update portfolio images"
on storage.objects for update
to authenticated
using (bucket_id = 'portfolio');

drop policy if exists "Admin can delete portfolio images" on storage.objects;
create policy "Admin can delete portfolio images"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio');
