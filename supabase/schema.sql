-- =============================================================================
-- LMS Training — SKEMA LENGKAP (gabungan semua migrasi + seed)
-- Jalankan SEKALI di Supabase: SQL Editor -> tempel semua -> Run.
-- Aman diulang (idempoten).
-- =============================================================================


-- >>> supabase/migrations/0001_extensions_and_helpers.sql
-- =============================================================================
-- 0001 — Extensions & Helper Functions
-- =============================================================================
-- Fungsi helper dipakai lintas tabel: auto updated_at, cek admin, dan
-- generator nomor sertifikat. Idempoten (aman dijalankan ulang).
-- =============================================================================

-- gen_random_uuid() tersedia via pgcrypto (Supabase mengaktifkannya default).
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- set_updated_at(): trigger untuk memperbarui kolom updated_at otomatis.
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Catatan: is_admin() didefinisikan di 0002 (setelah tabel admin dibuat),
-- karena body fungsi SQL divalidasi terhadap katalog saat pembuatan.

-- -----------------------------------------------------------------------------
-- generate_certificate_number(): helper nomor sertifikat unik.
-- Format: CERT/YYYY/MM/000001. Sekuens global + prefiks periode.
-- Belum di-wire ke trigger — pemakaian diatur pada tahap Sertifikat.
-- -----------------------------------------------------------------------------
create sequence if not exists public.certificate_seq;

create or replace function public.generate_certificate_number()
returns text
language sql
volatile
as $$
  select 'CERT/'
    || to_char(now(), 'YYYY') || '/'
    || to_char(now(), 'MM') || '/'
    || lpad(nextval('public.certificate_seq')::text, 6, '0');
$$;


-- >>> supabase/migrations/0002_core_tables.sql
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


-- >>> supabase/migrations/0003_material_tables.sql
-- =============================================================================
-- 0003 — Material Tables (e-book terstruktur, hasil ingest DOCX)
-- material_chapters, material_blocks
-- =============================================================================

-- -----------------------------------------------------------------------------
-- material_chapters — bab materi (BAB I, II, ...).
-- training_key mendukung multi-training (reusability).
-- -----------------------------------------------------------------------------
create table if not exists public.material_chapters (
  id            uuid primary key default gen_random_uuid(),
  training_key  text not null default 'default',
  order_no      integer not null,
  code          text not null default '',
  title         text not null,
  created_at    timestamptz not null default now(),

  constraint material_chapters_order_unique unique (training_key, order_no)
);

comment on table public.material_chapters is 'Bab materi training (hasil ingest DOCX).';

-- -----------------------------------------------------------------------------
-- material_blocks — blok konten per bab.
-- type: heading | paragraph | list_bullet | list_check | temperature
--       | case_finding | commitment | quote
-- payload (jsonb) menyesuaikan tipe blok.
-- -----------------------------------------------------------------------------
create table if not exists public.material_blocks (
  id          uuid primary key default gen_random_uuid(),
  chapter_id  uuid not null references public.material_chapters (id) on delete cascade,
  order_no    integer not null,
  type        text not null,
  payload     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),

  constraint material_blocks_type_check check (type in (
    'heading', 'paragraph', 'list_bullet', 'list_check',
    'temperature', 'case_finding', 'commitment', 'quote'
  )),
  constraint material_blocks_order_unique unique (chapter_id, order_no)
);

comment on table public.material_blocks is 'Blok konten materi (ditampilkan apa adanya).';


-- >>> supabase/migrations/0004_training_tables.sql
-- =============================================================================
-- 0004 — Training Flow Tables
-- training_progress, attendance, questions, question_options,
-- quiz_result, quiz_answers, certificates
-- =============================================================================

-- -----------------------------------------------------------------------------
-- training_progress — progres baca per bab (0..100). Unik per user+bab.
-- -----------------------------------------------------------------------------
create table if not exists public.training_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users (id) on delete cascade,
  chapter_id  uuid not null references public.material_chapters (id) on delete cascade,
  progress    integer not null default 0,
  completed   boolean not null default false,
  updated_at  timestamptz not null default now(),

  constraint training_progress_range check (progress between 0 and 100),
  constraint training_progress_unique unique (user_id, chapter_id)
);

comment on table public.training_progress is 'Progres membaca materi per bab per peserta.';

-- -----------------------------------------------------------------------------
-- attendance — daftar hadir. Unik per user per tanggal (tidak boleh dobel/hari).
-- -----------------------------------------------------------------------------
create table if not exists public.attendance (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users (id) on delete cascade,
  full_name     text not null,
  position_id   uuid references public.positions (id) on delete set null,
  location_id   uuid references public.locations (id) on delete set null,
  attend_date   date not null default current_date,
  attend_time   time not null default current_time,
  created_at    timestamptz not null default now(),

  constraint attendance_unique_per_day unique (user_id, attend_date)
);

comment on table public.attendance is 'Daftar hadir peserta (maksimal 1x per hari).';

-- -----------------------------------------------------------------------------
-- questions — bank soal (berbasis materi DOCX). chapter_ref = traceability bab.
-- -----------------------------------------------------------------------------
create table if not exists public.questions (
  id             uuid primary key default gen_random_uuid(),
  training_key   text not null default 'default',
  chapter_ref    text not null default '',
  question_text  text not null,
  explanation    text not null default '',
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

comment on table public.questions is 'Bank soal ujian (min. 30, dari materi).';

-- -----------------------------------------------------------------------------
-- question_options — opsi jawaban (disajikan teracak; is_correct dilindungi RLS).
-- -----------------------------------------------------------------------------
create table if not exists public.question_options (
  id           uuid primary key default gen_random_uuid(),
  question_id  uuid not null references public.questions (id) on delete cascade,
  option_text  text not null,
  is_correct   boolean not null default false,
  order_no     integer not null default 0,
  created_at   timestamptz not null default now()
);

comment on table public.question_options is 'Opsi jawaban per soal.';

-- -----------------------------------------------------------------------------
-- quiz_result — hasil ujian per percobaan. status: lulus | tidak_lulus.
-- -----------------------------------------------------------------------------
create table if not exists public.quiz_result (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users (id) on delete cascade,
  training_key     text not null default 'default',
  score            integer not null default 0,
  total_questions  integer not null default 0,
  correct_count    integer not null default 0,
  wrong_count      integer not null default 0,
  status           text not null default 'tidak_lulus',
  attempt_no       integer not null default 1,
  started_at       timestamptz,
  finished_at      timestamptz,
  created_at       timestamptz not null default now(),

  constraint quiz_result_status_check check (status in ('lulus', 'tidak_lulus')),
  constraint quiz_result_score_range check (score between 0 and 100)
);

comment on table public.quiz_result is 'Hasil ujian peserta (per percobaan).';

-- -----------------------------------------------------------------------------
-- quiz_answers — detail jawaban per soal (untuk pembahasan).
-- -----------------------------------------------------------------------------
create table if not exists public.quiz_answers (
  id                  uuid primary key default gen_random_uuid(),
  quiz_result_id      uuid not null references public.quiz_result (id) on delete cascade,
  question_id         uuid not null references public.questions (id) on delete cascade,
  selected_option_id  uuid references public.question_options (id) on delete set null,
  is_correct          boolean not null default false,
  created_at          timestamptz not null default now()
);

comment on table public.quiz_answers is 'Rincian jawaban peserta per soal.';

-- -----------------------------------------------------------------------------
-- certificates — sertifikat (hanya untuk peserta lulus). Field snapshot
-- menjaga keabsahan histori meski master berubah.
-- -----------------------------------------------------------------------------
create table if not exists public.certificates (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  quiz_result_id      uuid references public.quiz_result (id) on delete set null,
  certificate_number  text not null unique,
  training_name       text not null default '',
  participant_name    text not null default '',
  position_name       text not null default '',
  location_name       text not null default '',
  score               integer not null default 0,
  qr_payload          text not null default '',
  issued_date         date not null default current_date,
  created_at          timestamptz not null default now()
);

comment on table public.certificates is 'Sertifikat terbit (nomor unik + QR).';


-- >>> supabase/migrations/0005_indexes_and_triggers.sql
-- =============================================================================
-- 0005 — Indexes & Triggers
-- =============================================================================

-- --- Indexes (selain unique constraint yang sudah otomatis ter-index) --------
create index if not exists idx_users_position on public.users (position_id);
create index if not exists idx_users_location on public.users (location_id);

create index if not exists idx_material_blocks_chapter
  on public.material_blocks (chapter_id, order_no);

create index if not exists idx_attendance_user_date
  on public.attendance (user_id, attend_date);
create index if not exists idx_attendance_location on public.attendance (location_id);
create index if not exists idx_attendance_position on public.attendance (position_id);

create index if not exists idx_questions_active
  on public.questions (training_key, is_active);
create index if not exists idx_question_options_question
  on public.question_options (question_id);

create index if not exists idx_quiz_result_user
  on public.quiz_result (user_id, created_at desc);
create index if not exists idx_quiz_answers_result
  on public.quiz_answers (quiz_result_id);

create index if not exists idx_certificates_number
  on public.certificates (certificate_number);
create index if not exists idx_certificates_user on public.certificates (user_id);

-- --- Triggers: auto updated_at ----------------------------------------------
drop trigger if exists trg_company_settings_updated_at on public.company_settings;
create trigger trg_company_settings_updated_at
  before update on public.company_settings
  for each row execute function public.set_updated_at();

drop trigger if exists trg_training_progress_updated_at on public.training_progress;
create trigger trg_training_progress_updated_at
  before update on public.training_progress
  for each row execute function public.set_updated_at();


-- >>> supabase/migrations/0006_rls_policies.sql
-- =============================================================================
-- 0006 — Row Level Security (RLS) Policies
-- =============================================================================
-- Model peran:
--   * Peserta  -> role `anon` / `authenticated` non-admin (tanpa login akun).
--   * Admin    -> `authenticated` yang terdaftar di tabel admin (is_admin()).
--
-- Catatan integritas: aplikasi saat ini SPA tanpa server. Beberapa operasi
-- peserta memakai policy INSERT publik sebagai placeholder. Operasi bernilai
-- integritas tinggi (scoring ujian, penerbitan sertifikat) akan dipindahkan ke
-- SECURITY DEFINER RPC pada tahap Ujian & Sertifikat. Kolom jawaban benar
-- (question_options.is_correct) sudah dilindungi: SELECT hanya untuk admin.
-- =============================================================================

-- Aktifkan RLS di seluruh tabel.
alter table public.company_settings   enable row level security;
alter table public.admin              enable row level security;
alter table public.positions          enable row level security;
alter table public.locations          enable row level security;
alter table public.users              enable row level security;
alter table public.material_chapters  enable row level security;
alter table public.material_blocks    enable row level security;
alter table public.training_progress  enable row level security;
alter table public.attendance         enable row level security;
alter table public.questions          enable row level security;
alter table public.question_options   enable row level security;
alter table public.quiz_result        enable row level security;
alter table public.quiz_answers       enable row level security;
alter table public.certificates       enable row level security;

-- =============================================================================
-- company_settings — publik: baca; admin: kelola.
-- =============================================================================
drop policy if exists company_settings_read on public.company_settings;
create policy company_settings_read on public.company_settings
  for select using (true);

drop policy if exists company_settings_admin_write on public.company_settings;
create policy company_settings_admin_write on public.company_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- admin — hanya admin yang dapat membaca/mengelola.
-- =============================================================================
drop policy if exists admin_self_read on public.admin;
create policy admin_self_read on public.admin
  for select using (public.is_admin());

drop policy if exists admin_manage on public.admin;
create policy admin_manage on public.admin
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- positions & locations — publik: baca; admin: kelola.
-- =============================================================================
drop policy if exists positions_read on public.positions;
create policy positions_read on public.positions
  for select using (true);
drop policy if exists positions_admin_write on public.positions;
create policy positions_admin_write on public.positions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists locations_read on public.locations;
create policy locations_read on public.locations
  for select using (true);
drop policy if exists locations_admin_write on public.locations;
create policy locations_admin_write on public.locations
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- users — peserta: buat identitas + baca; admin: kelola penuh.
-- =============================================================================
drop policy if exists users_public_read on public.users;
create policy users_public_read on public.users
  for select using (true);
drop policy if exists users_public_insert on public.users;
create policy users_public_insert on public.users
  for insert with check (true);
drop policy if exists users_admin_write on public.users;
create policy users_admin_write on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- material_chapters & material_blocks — publik: baca; admin: kelola.
-- =============================================================================
drop policy if exists material_chapters_read on public.material_chapters;
create policy material_chapters_read on public.material_chapters
  for select using (true);
drop policy if exists material_chapters_admin_write on public.material_chapters;
create policy material_chapters_admin_write on public.material_chapters
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists material_blocks_read on public.material_blocks;
create policy material_blocks_read on public.material_blocks
  for select using (true);
drop policy if exists material_blocks_admin_write on public.material_blocks;
create policy material_blocks_admin_write on public.material_blocks
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- training_progress — peserta: baca/tulis progres; admin: kelola.
-- =============================================================================
drop policy if exists training_progress_read on public.training_progress;
create policy training_progress_read on public.training_progress
  for select using (true);
drop policy if exists training_progress_insert on public.training_progress;
create policy training_progress_insert on public.training_progress
  for insert with check (true);
drop policy if exists training_progress_update on public.training_progress;
create policy training_progress_update on public.training_progress
  for update using (true) with check (true);
drop policy if exists training_progress_admin_write on public.training_progress;
create policy training_progress_admin_write on public.training_progress
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- attendance — peserta: isi + baca (cek dobel/hari); admin: kelola.
-- (Unik user+tanggal mencegah pengisian ganda.)
-- =============================================================================
drop policy if exists attendance_read on public.attendance;
create policy attendance_read on public.attendance
  for select using (true);
drop policy if exists attendance_insert on public.attendance;
create policy attendance_insert on public.attendance
  for insert with check (true);
drop policy if exists attendance_admin_write on public.attendance;
create policy attendance_admin_write on public.attendance
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- questions — publik: baca teks soal; admin: kelola.
-- =============================================================================
drop policy if exists questions_read on public.questions;
create policy questions_read on public.questions
  for select using (true);
drop policy if exists questions_admin_write on public.questions;
create policy questions_admin_write on public.questions
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- question_options — LINDUNGI jawaban benar: SELECT hanya admin.
-- Peserta mengambil opsi (tanpa is_correct) via RPC pada tahap Ujian.
-- =============================================================================
drop policy if exists question_options_admin_read on public.question_options;
create policy question_options_admin_read on public.question_options
  for select using (public.is_admin());
drop policy if exists question_options_admin_write on public.question_options;
create policy question_options_admin_write on public.question_options
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- quiz_result & quiz_answers — peserta: simpan + baca miliknya; admin: kelola.
-- (Scoring final akan lewat RPC pada tahap Ujian.)
-- =============================================================================
drop policy if exists quiz_result_read on public.quiz_result;
create policy quiz_result_read on public.quiz_result
  for select using (true);
drop policy if exists quiz_result_insert on public.quiz_result;
create policy quiz_result_insert on public.quiz_result
  for insert with check (true);
drop policy if exists quiz_result_admin_write on public.quiz_result;
create policy quiz_result_admin_write on public.quiz_result
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists quiz_answers_read on public.quiz_answers;
create policy quiz_answers_read on public.quiz_answers
  for select using (true);
drop policy if exists quiz_answers_insert on public.quiz_answers;
create policy quiz_answers_insert on public.quiz_answers
  for insert with check (true);
drop policy if exists quiz_answers_admin_write on public.quiz_answers;
create policy quiz_answers_admin_write on public.quiz_answers
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================================
-- certificates — publik: baca (validasi QR); admin: kelola/terbitkan.
-- =============================================================================
drop policy if exists certificates_read on public.certificates;
create policy certificates_read on public.certificates
  for select using (true);
drop policy if exists certificates_admin_write on public.certificates;
create policy certificates_admin_write on public.certificates
  for all using (public.is_admin()) with check (public.is_admin());


-- >>> supabase/migrations/0007_app_client_access.sql
-- =============================================================================
-- 0007 — Penyesuaian untuk aplikasi klien (tanpa Supabase Auth)
-- =============================================================================
-- Aplikasi memakai anon key tanpa sesi Supabase Auth, dan login admin masih
-- di sisi klien. Karena itu:
--   1) Tambah kolom nama (denormalisasi) agar admin dapat menampilkan
--      jabatan/lokasi/nama tanpa bergantung pada JOIN/id lintas perangkat.
--   2) Longgarkan RLS agar peran anon dapat melakukan operasi yang memang
--      dijalankan aplikasi (isi hadir, simpan ujian, terbitkan sertifikat,
--      dan admin menyimpan Company Settings dari sisi klien).
--
-- CATATAN KEAMANAN: ini menurunkan proteksi (anon bisa menulis). Cukup untuk
-- training internal tanpa backend. Saat memakai Supabase Auth sungguhan,
-- kembalikan kebijakan ke is_admin() (lihat 0006).
-- =============================================================================

-- 1) Kolom denormalisasi (aman diulang) --------------------------------------
alter table public.users
  add column if not exists position_name text not null default '',
  add column if not exists location_name text not null default '';

alter table public.attendance
  add column if not exists position_name text not null default '',
  add column if not exists location_name text not null default '';

alter table public.quiz_result
  add column if not exists participant_name text not null default '',
  add column if not exists position_name text not null default '',
  add column if not exists location_name text not null default '';

-- 2) RLS untuk model klien tanpa auth ----------------------------------------
-- company_settings: anon boleh baca + tulis (admin sisi klien menyimpannya).
drop policy if exists company_settings_admin_write on public.company_settings;
drop policy if exists company_settings_anon_write on public.company_settings;
create policy company_settings_anon_write on public.company_settings
  for all using (true) with check (true);

-- users / attendance / quiz_result / quiz_answers: anon boleh baca & tulis.
drop policy if exists users_admin_write on public.users;
drop policy if exists users_anon_write on public.users;
create policy users_anon_write on public.users
  for all using (true) with check (true);

drop policy if exists attendance_admin_write on public.attendance;
drop policy if exists attendance_anon_write on public.attendance;
create policy attendance_anon_write on public.attendance
  for all using (true) with check (true);

drop policy if exists quiz_result_admin_write on public.quiz_result;
drop policy if exists quiz_result_anon_write on public.quiz_result;
create policy quiz_result_anon_write on public.quiz_result
  for all using (true) with check (true);

drop policy if exists quiz_answers_admin_write on public.quiz_answers;
drop policy if exists quiz_answers_anon_write on public.quiz_answers;
create policy quiz_answers_anon_write on public.quiz_answers
  for all using (true) with check (true);

-- certificates: anon boleh baca (validasi) + insert (penerbitan sisi klien).
drop policy if exists certificates_admin_write on public.certificates;
drop policy if exists certificates_anon_write on public.certificates;
create policy certificates_anon_write on public.certificates
  for all using (true) with check (true);


-- >>> supabase/seed/0001_seed_master.sql
-- =============================================================================
-- SEED — Data awal (bukan dummy konten): jabatan sesuai PRD + baris singleton
-- company_settings kosong untuk diisi admin. Idempoten.
-- =============================================================================

-- 8 jabatan awal (PRD). Admin dapat menambah jabatan lain.
insert into public.positions (name)
values
  ('Cook'),
  ('Helper Cook'),
  ('Butcher'),
  ('Packer'),
  ('PJO'),
  ('PJS'),
  ('Supervisor'),
  ('HSE')
on conflict (name) do nothing;

-- Baris singleton company_settings (semua kolom kosong / placeholder netral).
-- Identitas perusahaan diisi melalui halaman Company Settings — tanpa hardcode.
insert into public.company_settings (is_singleton)
values (true)
on conflict (is_singleton) do nothing;

