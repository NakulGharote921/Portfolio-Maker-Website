create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  title text not null,
  skills text[] not null,
  projects text[] not null,
  image_url text not null,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists portfolios_set_updated_at on public.portfolios;
create trigger portfolios_set_updated_at
before update on public.portfolios
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
using (
  auth.uid() = id
  or exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and (
    (lower(email) = 'adminnakul@gmail.com' and role = 'admin')
    or (lower(email) <> 'adminnakul@gmail.com' and role = 'user')
  )
);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles
for insert
with check (
  auth.uid() = id
  and (
    (lower(email) = 'adminnakul@gmail.com' and role = 'admin')
    or (lower(email) <> 'adminnakul@gmail.com' and role = 'user')
  )
);

drop policy if exists "portfolios_public_select" on public.portfolios;
create policy "portfolios_public_select"
on public.portfolios
for select
using (true);

drop policy if exists "portfolios_insert_owner_or_admin" on public.portfolios;
create policy "portfolios_insert_owner_or_admin"
on public.portfolios
for insert
with check (
  auth.uid() = created_by
  or exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

drop policy if exists "portfolios_update_owner_or_admin" on public.portfolios;
create policy "portfolios_update_owner_or_admin"
on public.portfolios
for update
using (
  auth.uid() = created_by
  or exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
)
with check (
  created_by = old.created_by
  and (
    auth.uid() = created_by
    or exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
);

drop policy if exists "portfolios_delete_owner_or_admin" on public.portfolios;
create policy "portfolios_delete_owner_or_admin"
on public.portfolios
for delete
using (
  auth.uid() = created_by
  or exists (
    select 1
    from public.profiles admin_profile
    where admin_profile.id = auth.uid()
      and admin_profile.role = 'admin'
  )
);

insert into storage.buckets (id, name, public)
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

drop policy if exists "portfolio_images_public_read" on storage.objects;
create policy "portfolio_images_public_read"
on storage.objects
for select
using (bucket_id = 'portfolio-images');

drop policy if exists "portfolio_images_authenticated_upload" on storage.objects;
drop policy if exists "portfolio_images_public_upload" on storage.objects;
create policy "portfolio_images_public_upload"
on storage.objects
for insert
to public
with check (bucket_id = 'portfolio-images');

drop policy if exists "portfolio_images_owner_or_admin_update" on storage.objects;
create policy "portfolio_images_owner_or_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'portfolio-images'
  and (
    (storage.foldername(name))[2] = auth.uid()::text
    or exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
)
with check (
  bucket_id = 'portfolio-images'
  and (
    (storage.foldername(name))[2] = auth.uid()::text
    or exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
);

drop policy if exists "portfolio_images_owner_or_admin_delete" on storage.objects;
create policy "portfolio_images_owner_or_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'portfolio-images'
  and (
    (storage.foldername(name))[2] = auth.uid()::text
    or exists (
      select 1
      from public.profiles admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin'
    )
  )
);
