-- =============================================================================
-- 0002 — Core & Master Tables
-- company_settings, admin, positions, locations, users
-- =============================================================================

-- -----------------------------------------------------------------------------
-- company_settings — singleton identitas perusahaan (sumber tunggal identitas).
-- Kolom is_singleton + unique constraint memastikan hanya ada SATU baris.
-- -----------------------------------------------------------------------------
create table if not exists public.company_settings (
  id                          uuid primary key default gen_random_uuid(),
  is_singleton                boolean not null default true,

  company_name                text not null default '',
  logo_url                    text not null default '',
  address                     text not null default '',
  website                     text not null default '',
  email                       text not null default '',
  phone                       text not null default '',

  training_name               text not null default '',
  training_description        text not null default '',

  signer1_name                text not null default '',
  signer1_title               text not null default '',
  signer1_signature_url       text not null default '',
  signer2_name                text not null default '',
  signer2_title               text not null default '',
  signer2_signature_url       text not null default '',

  certificate_background_url  text not null default '',
  certificate_logo_url        text not null default '',

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now(),

  constraint company_settings_singleton unique (is_singleton)
);

comment on table public.company_settings is
  'Identitas perusahaan & konfigurasi sertifikat (satu baris). Tanpa hardcode di kode.';

-- -----------------------------------------------------------------------------
-- admin — administrator (terhubung ke auth.users Supabase).
-- -----------------------------------------------------------------------------
create table if not exists public.admin (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null unique,
  full_name   text not null default '',
  role        text not null default 'administrator',
  created_at  timestamptz not null default now()
);

comment on table public.admin is 'Administrator aplikasi (id = auth.users.id).';

-- is_admin(): true bila user terautentikasi terdaftar pada tabel admin.
-- Didefinisikan di sini (setelah tabel admin ada) agar validasi body lolos.
-- SECURITY DEFINER + search_path tetap agar tidak terkena RLS tabel admin
-- (mencegah rekursi saat dipakai di dalam policy RLS).
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin a where a.id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- positions — master jabatan (dapat ditambah admin).
-- -----------------------------------------------------------------------------
create table if not exists public.positions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.positions is 'Master jabatan peserta.';

-- -----------------------------------------------------------------------------
-- locations — master lokasi/site.
-- -----------------------------------------------------------------------------
create table if not exists public.locations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

comment on table public.locations is 'Master lokasi/site peserta.';

-- -----------------------------------------------------------------------------
-- users — peserta training (tanpa akun login).
-- -----------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  full_name     text not null,
  position_id   uuid references public.positions (id) on delete set null,
  location_id   uuid references public.locations (id) on delete set null,
  created_at    timestamptz not null default now()
);

comment on table public.users is 'Peserta training. Identitas dari form Daftar Hadir.';
