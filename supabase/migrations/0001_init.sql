-- MyToolkit initial schema.
-- Run this file in the Supabase SQL Editor.
-- After signing in once with omarsamawah@gmail.com, run the admin bootstrap
-- statement at the bottom of this file.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  avatar_url text,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  name_en text,
  color text not null default '#14b8a6',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  name text not null,
  name_en text,
  description text not null,
  type text not null default 'tool' check (type in ('tool', 'learn', 'github')),
  category_id uuid references public.categories(id) on delete set null,
  category_name text,
  url text not null,
  normalized_url text,
  domain text,
  image_url text,
  favicon_url text,
  pricing text not null default 'unknown' check (pricing in ('free', 'paid', 'freemium', 'unknown')),
  tags text[] not null default '{}',
  use_cases text[] not null default '{}',
  libraries text[] not null default '{}',
  notes text,
  related_tools uuid[] not null default '{}',
  github_owner text,
  github_repo text,
  github_full_name text,
  github_stars integer,
  github_forks integer,
  github_language text,
  github_license text,
  github_topics text[] not null default '{}',
  github_pushed_at timestamptz,
  github_metadata jsonb not null default '{}',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  usage_count integer not null default 0,
  favorite_count integer not null default 0,
  average_rating numeric(3, 2) not null default 0,
  review_count integer not null default 0,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_by_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  color text not null default 'teal',
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_id uuid not null references public.tools(id) on delete cascade,
  collection_id uuid references public.collections(id) on delete set null,
  custom_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tool_id)
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_email text,
  action_type text not null check (action_type in ('create', 'update', 'delete', 'import', 'backup', 'favorite')),
  tool_id uuid references public.tools(id) on delete set null,
  tool_name text,
  details text,
  created_at timestamptz not null default now()
);

create table if not exists public.backup_runs (
  id uuid primary key default gen_random_uuid(),
  target text not null default 'google_sheets',
  status text not null check (status in ('pending', 'success', 'error')),
  message text,
  rows_synced integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists tools_status_type_idx on public.tools(status, type);
create index if not exists tools_category_id_idx on public.tools(category_id);
create index if not exists tools_domain_idx on public.tools(domain);
create index if not exists tools_tags_idx on public.tools using gin(tags);
create index if not exists tools_libraries_idx on public.tools using gin(libraries);
create index if not exists tools_github_full_name_idx on public.tools(github_full_name);
create index if not exists favorites_user_id_idx on public.favorites(user_id);
create index if not exists collections_user_id_idx on public.collections(user_id);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tools enable row level security;
alter table public.collections enable row level security;
alter table public.favorites enable row level security;
alter table public.activity_logs enable row level security;
alter table public.backup_runs enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.tools to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant all on public.categories, public.tools, public.collections, public.favorites, public.activity_logs, public.backup_runs to authenticated;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own"
on public.profiles for insert
to authenticated
with check ((select auth.uid()) = id and role = 'user');

drop policy if exists "categories public read active" on public.categories;
create policy "categories public read active"
on public.categories for select
to anon, authenticated
using (is_active = true);

drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write"
on public.categories for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

drop policy if exists "tools public read published" on public.tools;
create policy "tools public read published"
on public.tools for select
to anon, authenticated
using (
  status = 'published'
  or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin')
);

drop policy if exists "tools admin write" on public.tools;
create policy "tools admin write"
on public.tools for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

drop policy if exists "collections own access" on public.collections;
create policy "collections own access"
on public.collections for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "favorites own access" on public.favorites;
create policy "favorites own access"
on public.favorites for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "activity admin access" on public.activity_logs;
create policy "activity admin access"
on public.activity_logs for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

drop policy if exists "backup admin access" on public.backup_runs;
create policy "backup admin access"
on public.backup_runs for all
to authenticated
using (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.role = 'admin'));

insert into public.categories (slug, name_ar, name_en, color, sort_order)
values
  ('ميديا', 'ميديا', 'Media', '#ef4444', 10),
  ('صوت', 'صوت', 'Audio', '#14b8a6', 20),
  ('إنتاجية', 'إنتاجية', 'Productivity', '#22c55e', 30),
  ('وكلاء', 'وكلاء', 'Agents', '#eab308', 40),
  ('منصات', 'منصات', 'Platforms', '#38bdf8', 50),
  ('تسويق', 'تسويق', 'Marketing', '#f97316', 60),
  ('برمجة', 'برمجة', 'Development', '#6366f1', 70),
  ('تصميم', 'تصميم', 'Design', '#ec4899', 80),
  ('كتابة', 'كتابة', 'Writing', '#84cc16', 90),
  ('تحليل-بيانات', 'تحليل بيانات', 'Data analysis', '#06b6d4', 100),
  ('بحث', 'بحث', 'Research', '#64748b', 110),
  ('محادثة', 'محادثة', 'Chat', '#a855f7', 120),
  ('تعلم', 'تعلم', 'Learning', '#f59e0b', 130),
  ('github', 'GitHub', 'GitHub', '#24292f', 140),
  ('أخرى', 'أخرى', 'Other', '#78716c', 999)
on conflict (slug) do update
set name_ar = excluded.name_ar,
    name_en = excluded.name_en,
    color = excluded.color,
    sort_order = excluded.sort_order;

-- Admin bootstrap, run only after signing in once with this email:
-- insert into public.profiles (id, email, role)
-- select id, email, 'admin'
-- from auth.users
-- where email = 'omarsamawah@gmail.com'
-- on conflict (id) do update set role = 'admin', email = excluded.email;
