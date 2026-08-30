-- ============================================================================
-- JobSeek — Database Schema
-- Jalankan seluruh file ini di Supabase Dashboard → SQL Editor.
-- Idempotent: aman untuk dijalankan berulang kali.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enums
-- Dibuat lebih dulu karena fungsi helper di bawahnya memakai tipe ini
-- sebagai return type (PostgreSQL memvalidasi tipe saat CREATE FUNCTION).
-- ----------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('admin', 'hrd', 'job_seeker');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.employment_type as enum ('full_time', 'part_time', 'internship', 'contract', 'freelance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.job_status as enum ('draft', 'pending', 'published', 'closed', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.application_status as enum ('applied', 'reviewing', 'shortlisted', 'interview', 'accepted', 'rejected');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2. Tables
-- ----------------------------------------------------------------------------

create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users (id) on delete cascade,
  full_name   text not null default '',
  email       text not null default '',
  role        public.user_role not null default 'job_seeker',
  avatar_url  text,
  phone       text,
  bio         text,
  location    text,
  education   text,
  experience  text,
  position    text,
  cv_url      text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.companies (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null unique references auth.users (id) on delete cascade,
  company_name text not null,
  description  text,
  logo_url     text,
  location     text,
  website      text,
  industry     text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  company_id      uuid not null references public.companies (id) on delete cascade,
  created_by      uuid not null references auth.users (id) on delete cascade,
  title           text not null,
  description     text not null,
  location        text,
  employment_type public.employment_type not null default 'full_time',
  salary_min      numeric(14, 2),
  salary_max      numeric(14, 2),
  requirements    text,
  status          public.job_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  job_id       uuid not null references public.jobs (id) on delete cascade,
  applicant_id uuid not null references auth.users (id) on delete cascade,
  cv_url       text,
  cover_letter text,
  status       public.application_status not null default 'applied',
  applied_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Satu user hanya boleh melamar satu kali per lowongan.
  constraint applications_job_applicant_unique unique (job_id, applicant_id)
);

create table if not exists public.skills (
  id   bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists public.user_skills (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users (id) on delete cascade,
  skill_id bigint not null references public.skills (id) on delete cascade,
  constraint user_skills_user_skill_unique unique (user_id, skill_id)
);

-- ----------------------------------------------------------------------------
-- 3. Helper functions
-- Dibuat SETELAH tabel karena isi fungsi `language sql` divalidasi
-- terhadap tabel saat CREATE FUNCTION.
-- ----------------------------------------------------------------------------

-- Role milist user yang sedang login.
-- SECURITY DEFINER supaya policy di tabel lain tidak rekursif membaca profiles.
create or replace function public.my_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role from public.profiles p where p.user_id = auth.uid();
$$;

-- Men-set kolom updated_at otomatis pada setiap UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 4. Indexes
-- ----------------------------------------------------------------------------

create index if not exists jobs_status_idx            on public.jobs (status);
create index if not exists jobs_company_idx           on public.jobs (company_id);
create index if not exists jobs_created_by_idx        on public.jobs (created_by);
create index if not exists jobs_created_at_idx        on public.jobs (created_at desc);
create index if not exists applications_job_idx       on public.applications (job_id);
create index if not exists applications_applicant_idx on public.applications (applicant_id);
create index if not exists companies_owner_idx        on public.companies (owner_id);
create index if not exists user_skills_user_idx       on public.user_skills (user_id);

-- FK tambahan agar PostgREST dapat meng-embed data profil pelamar
-- langsung dari tabel applications (setiap auth user selalu punya profile).
alter table public.applications
  drop constraint if exists applications_applicant_profile_fkey;
alter table public.applications
  add constraint applications_applicant_profile_fkey
  foreign key (applicant_id) references public.profiles (user_id)
  on delete cascade;

-- ----------------------------------------------------------------------------
-- 5. Triggers
-- ----------------------------------------------------------------------------

drop trigger if exists set_updated_at_profiles      on public.profiles;
drop trigger if exists set_updated_at_companies     on public.companies;
drop trigger if exists set_updated_at_jobs          on public.jobs;
drop trigger if exists set_updated_at_applications  on public.applications;

create trigger set_updated_at_profiles     before update on public.profiles     for each row execute function public.set_updated_at();
create trigger set_updated_at_companies    before update on public.companies    for each row execute function public.set_updated_at();
create trigger set_updated_at_jobs         before update on public.jobs         for each row execute function public.set_updated_at();
create trigger set_updated_at_applications before update on public.applications for each row execute function public.set_updated_at();

-- Membuat profile (dan company untuk HRD) secara otomatis saat signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  v_role := coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'job_seeker');

  -- Admin tidak boleh dibuat lewat registrasi publik.
  if v_role not in ('hrd', 'job_seeker') then
    v_role := 'job_seeker';
  end if;

  insert into public.profiles (user_id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(new.email, ''),
    v_role
  );

  if v_role = 'hrd' then
    insert into public.companies (owner_id, company_name)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data ->> 'company_name', ''), 'My Company')
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Sinkronkan email profile ketika user mengganti email di Auth.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email and new.email is not null then
    update public.profiles set email = new.email where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
after update of email on auth.users
for each row execute procedure public.handle_user_email_change();

-- ----------------------------------------------------------------------------
-- 6. Row Level Security
-- ----------------------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.companies    enable row level security;
alter table public.jobs         enable row level security;
alter table public.applications enable row level security;
alter table public.skills       enable row level security;
alter table public.user_skills  enable row level security;

-- ---- profiles ---------------------------------------------------------------

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles for select to authenticated
using (
  user_id = (select auth.uid())
  or public.my_role() = 'admin'
  -- HRD dapat melihat profil kandidat yang melamar lowongannya.
  or exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.applicant_id = profiles.user_id
      and j.created_by = (select auth.uid())
  )
);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- Cegah eskalasi privilege: user biasa tidak boleh mengubah kolom role sendiri.
revoke update (role) on table public.profiles from authenticated;

-- ---- companies --------------------------------------------------------------

drop policy if exists "companies_select_public" on public.companies;
create policy "companies_select_public"
on public.companies for select to anon, authenticated
using (true);

drop policy if exists "companies_insert_own" on public.companies;
create policy "companies_insert_own"
on public.companies for insert to authenticated
with check (
  public.my_role() = 'hrd'
  and owner_id = (select auth.uid())
);

drop policy if exists "companies_update_own" on public.companies;
create policy "companies_update_own"
on public.companies for update to authenticated
using (
  owner_id = (select auth.uid())
  or public.my_role() = 'admin'
)
with check (owner_id = (select auth.uid()) or public.my_role() = 'admin');

drop policy if exists "companies_delete_own" on public.companies;
create policy "companies_delete_own"
on public.companies for delete to authenticated
using (owner_id = (select auth.uid()) or public.my_role() = 'admin');

-- ---- jobs --------------------------------------------------------------------

-- Lowongan published bisa dilihat siapa pun (termasuk pengunjung anonim).
drop policy if exists "jobs_select" on public.jobs;
create policy "jobs_select"
on public.jobs for select to anon, authenticated
using (
  status = 'published'
  or created_by = (select auth.uid())
  or public.my_role() = 'admin'
  -- HRD pemilik company juga boleh melihat lowongan di company-nya.
  or (
    public.my_role() = 'hrd'
    and exists (
      select 1 from public.companies c
      where c.id = jobs.company_id and c.owner_id = (select auth.uid())
    )
  )
);

drop policy if exists "jobs_insert_hrd" on public.jobs;
create policy "jobs_insert_hrd"
on public.jobs for insert to authenticated
with check (
  public.my_role() = 'hrd'
  and created_by = (select auth.uid())
  -- Lowongan harus dibuat di dalam company milik HRD tersebut.
  and exists (
    select 1 from public.companies c
    where c.id = company_id and c.owner_id = (select auth.uid())
  )
);

drop policy if exists "jobs_update_own" on public.jobs;
create policy "jobs_update_own"
on public.jobs for update to authenticated
using (
  created_by = (select auth.uid())
  or public.my_role() = 'admin'
)
with check (
  created_by = (select auth.uid())
  or public.my_role() = 'admin'
);

drop policy if exists "jobs_delete_own" on public.jobs;
create policy "jobs_delete_own"
on public.jobs for delete to authenticated
using (
  created_by = (select auth.uid())
  or public.my_role() = 'admin'
);

-- ---- applications -------------------------------------------------------------

drop policy if exists "applications_select" on public.applications;
create policy "applications_select"
on public.applications for select to authenticated
using (
  applicant_id = (select auth.uid())
  or public.my_role() = 'admin'
  or exists (
    select 1 from public.jobs j
    where j.id = applications.job_id
      and j.created_by = (select auth.uid())
  )
);

drop policy if exists "applications_insert_own" on public.applications;
create policy "applications_insert_own"
on public.applications for insert to authenticated
with check (
  applicant_id = (select auth.uid())
  and public.my_role() = 'job_seeker'
  -- Hanya lowongan yang sudah published yang menerima lamaran.
  and exists (
    select 1 from public.jobs j
    where j.id = job_id and j.status = 'published'
  )
);

-- HRD mengubah status lamaran pada lowongan miliknya; admin boleh semuanya.
drop policy if exists "applications_update" on public.applications;
create policy "applications_update"
on public.applications for update to authenticated
using (
  public.my_role() = 'admin'
  or exists (
    select 1 from public.jobs j
    where j.id = applications.job_id
      and j.created_by = (select auth.uid())
  )
)
with check (
  public.my_role() = 'admin'
  or exists (
    select 1 from public.jobs j
    where j.id = applications.job_id
      and j.created_by = (select auth.uid())
  )
);

drop policy if exists "applications_delete_admin" on public.applications;
create policy "applications_delete_admin"
on public.applications for delete to authenticated
using (public.my_role() = 'admin');

-- ---- skills ---------------------------------------------------------------------

drop policy if exists "skills_select" on public.skills;
create policy "skills_select"
on public.skills for select to anon, authenticated
using (true);

drop policy if exists "skills_insert" on public.skills;
create policy "skills_insert"
on public.skills for insert to authenticated
with check (true);

drop policy if exists "skills_delete_admin" on public.skills;
create policy "skills_delete_admin"
on public.skills for delete to authenticated
using (public.my_role() = 'admin');

-- ---- user_skills ------------------------------------------------------------------

drop policy if exists "user_skills_select_own" on public.user_skills;
create policy "user_skills_select_own"
on public.user_skills for select to authenticated
using (
  user_id = (select auth.uid())
  -- HRD dapat melihat skill kandidat yang melamar lowongannya.
  or exists (
    select 1
    from public.applications a
    join public.jobs j on j.id = a.job_id
    where a.applicant_id = user_skills.user_id
      and j.created_by = (select auth.uid())
  )
);

drop policy if exists "user_skills_write_own" on public.user_skills;
create policy "user_skills_write_own"
on public.user_skills for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists "user_skills_update_own" on public.user_skills;
create policy "user_skills_update_own"
on public.user_skills for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

drop policy if exists "user_skills_delete_own" on public.user_skills;
create policy "user_skills_delete_own"
on public.user_skills for delete to authenticated
using (user_id = (select auth.uid()));

-- ----------------------------------------------------------------------------
-- 7. Storage buckets + policies
--    Konvensi path: <bucket>/<user_id>/<nama-file>
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('company-logos', 'company-logos', true)
on conflict (id) do nothing;

-- ---- avatars (publik untuk dibaca, tulis hanya di folder sendiri) ------------

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_write" on storage.objects;
create policy "avatars_owner_write"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.objects.name like ((select auth.uid())::text || '/%'))
);

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'avatars'
  and (storage.objects.name like ((select auth.uid())::text || '/%'))
);

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'avatars'
  and (storage.objects.name like ((select auth.uid())::text || '/%'))
);

-- ---- company-logos (publik untuk dibaca, tulis oleh HRD pemilik) --------------

drop policy if exists "logos_public_read" on storage.objects;
create policy "logos_public_read"
on storage.objects for select to anon, authenticated
using (bucket_id = 'company-logos');

drop policy if exists "logos_hrd_write" on storage.objects;
create policy "logos_hrd_write"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'company-logos'
  and public.my_role() = 'hrd'
  and (storage.objects.name like ((select auth.uid())::text || '/%'))
);

drop policy if exists "logos_hrd_update" on storage.objects;
create policy "logos_hrd_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'company-logos'
  and public.my_role() = 'hrd'
  and (storage.objects.name like ((select auth.uid())::text || '/%'))
);

drop policy if exists "logos_hrd_delete" on storage.objects;
create policy "logos_hrd_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'company-logos'
  and public.my_role() = 'hrd'
  and (storage.objects.name like ((select auth.uid())::text || '/%'))
);

-- ---- cvs (privat: pemilik, HRD dari lowongan yang dilamar, dan admin) --------

drop policy if exists "cvs_owner_read" on storage.objects;
create policy "cvs_owner_read"
on storage.objects for select to authenticated
using (
  bucket_id = 'cvs'
  and (
    storage.objects.name like ((select auth.uid())::text || '/%')
    or public.my_role() = 'admin'
    -- HRD boleh mengunduh CV kandidat yang melamar lowongannya.
    or exists (
      select 1
      from public.applications a
      join public.jobs j on j.id = a.job_id
      where a.cv_url is not null
        and a.cv_url like '%/object/cvs/' || storage.objects.name
        and j.created_by = (select auth.uid())
    )
  )
);

drop policy if exists "cvs_owner_write" on storage.objects;
create policy "cvs_owner_write"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'cvs'
  and (storage.objects.name like ((select auth.uid())::text || '/%'))
);

drop policy if exists "cvs_owner_update" on storage.objects;
create policy "cvs_owner_update"
on storage.objects for update to authenticated
using (
  bucket_id = 'cvs'
  and (storage.objects.name like ((select auth.uid())::text || '/%'))
);

drop policy if exists "cvs_owner_delete" on storage.objects;
create policy "cvs_owner_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'cvs'
  and (
    storage.objects.name like ((select auth.uid())::text || '/%')
    or public.my_role() = 'admin'
  )
);

-- ----------------------------------------------------------------------------
-- 8. Seed data
-- ----------------------------------------------------------------------------

insert into public.skills (name) values
  ('JavaScript'), ('TypeScript'), ('React'), ('Next.js'), ('Node.js'),
  ('Python'), ('Java'), ('Go'), ('PHP'), ('Laravel'),
  ('SQL'), ('PostgreSQL'), ('MySQL'), ('MongoDB'), ('Redis'),
  ('Docker'), ('Kubernetes'), ('AWS'), ('Git'), ('CI/CD'),
  ('HTML'), ('CSS'), ('Tailwind CSS'), ('Vue.js'), ('Angular'),
  ('Flutter'), ('React Native'), ('Data Analysis'), ('Machine Learning'),
  ('Figma'), ('UI/UX Design'), ('Digital Marketing'), ('SEO'),
  ('Copywriting'), ('Project Management'), ('Communication'), ('Leadership')
on conflict (name) do nothing;

-- ----------------------------------------------------------------------------
-- 9. Membuat Admin
--    Registrasi publik tidak menyediakan role admin.
--    Caranya: daftar sebagai job seeker/HRD seperti biasa, lalu jalankan:
--
--    update public.profiles set role = 'admin' where email = 'admin@example.com';
-- ----------------------------------------------------------------------------
