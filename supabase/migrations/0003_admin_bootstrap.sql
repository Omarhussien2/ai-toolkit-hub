-- Promote the approved project owner to admin after their first sign-in.
-- Run this in Supabase SQL Editor if admin buttons appear but writes are rejected by RLS.

insert into public.profiles (id, email, role, display_name)
select id, email, 'admin', coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
from auth.users
where lower(email) = 'omarsamawah@gmail.com'
on conflict (id) do update
set
  email = excluded.email,
  role = 'admin',
  updated_at = now();
