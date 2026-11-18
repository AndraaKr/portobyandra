-- Migrasi SQL untuk Portofolio Editorial Swiss (Media & Showreel)
-- Jalankan skrip ini di SQL Editor dashboard Supabase Anda.

alter table public.portfolio_items
  add column if not exists media_type text not null default 'image'
    check (media_type in ('video','image')),
  add column if not exists video_url text,
  add column if not exists poster_url text,
  add column if not exists media_width integer check (media_width > 0),
  add column if not exists media_height integer check (media_height > 0),
  add column if not exists roles text[] not null default '{}',
  add column if not exists duration_seconds integer check (duration_seconds >= 0),
  add column if not exists client text,
  add column if not exists work_year smallint,
  add column if not exists is_showreel boolean not null default false,
  add column if not exists sort_order integer;

create unique index if not exists portfolio_one_showreel
  on public.portfolio_items (is_showreel) where is_showreel;
