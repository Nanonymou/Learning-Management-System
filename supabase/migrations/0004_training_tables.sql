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
