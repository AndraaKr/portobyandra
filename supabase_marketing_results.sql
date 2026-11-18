-- supabase_marketing_results.sql
-- Migrasi tabel hasil digital marketing dan penanda AI pada karya (Idempoten)
-- Jalankan skrip ini melalui Supabase SQL Editor.

create table if not exists public.marketing_results (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  account_name text not null,
  platform text not null
    check (platform in ('instagram','tiktok','youtube','facebook','linkedin','threads','x','lainnya')),
  organization text,
  period_start date not null,
  period_end date not null,
  metric_label text not null default 'Views',
  baseline_value numeric not null check (baseline_value >= 0),
  result_value numeric not null check (result_value >= 0),
  content_summary text,
  content_count integer check (content_count >= 0),
  ai_tools text[] not null default '{}',
  evidence_url text,
  source_note text not null,
  related_work_slugs text[] not null default '{}',
  published boolean not null default false,
  sort_order integer,
  created_at timestamptz not null default now(),
  check (period_end >= period_start)
);

alter table public.marketing_results enable row level security;

drop policy if exists "Public can read published marketing results" on public.marketing_results;
create policy "Public can read published marketing results"
  on public.marketing_results for select to anon, authenticated
  using (published = true);

drop policy if exists "Admin manage marketing results" on public.marketing_results;
create policy "Admin manage marketing results"
  on public.marketing_results for all to authenticated
  using (true) with check (true);

-- Kolom penanda AI pada portfolio_items
alter table public.portfolio_items
  add column if not exists ai_assisted boolean not null default false;
