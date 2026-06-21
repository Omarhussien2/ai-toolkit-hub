-- Adds the GitHub library section to an existing MyToolkit database.
-- Run after 0001_init.sql if your database was created before the GitHub section.

alter table public.tools
  drop constraint if exists tools_type_check;

alter table public.tools
  add constraint tools_type_check check (type in ('tool', 'learn', 'github'));

alter table public.tools
  add column if not exists use_cases text[] not null default '{}',
  add column if not exists libraries text[] not null default '{}',
  add column if not exists github_owner text,
  add column if not exists github_repo text,
  add column if not exists github_full_name text,
  add column if not exists github_stars integer,
  add column if not exists github_forks integer,
  add column if not exists github_language text,
  add column if not exists github_license text,
  add column if not exists github_topics text[] not null default '{}',
  add column if not exists github_pushed_at timestamptz,
  add column if not exists github_metadata jsonb not null default '{}';

create index if not exists tools_libraries_idx on public.tools using gin(libraries);
create index if not exists tools_github_full_name_idx on public.tools(github_full_name);

insert into public.categories (slug, name_ar, name_en, color, sort_order)
values ('github', 'GitHub', 'GitHub', '#24292f', 140)
on conflict (slug) do update
set name_ar = excluded.name_ar,
    name_en = excluded.name_en,
    color = excluded.color,
    sort_order = excluded.sort_order;
