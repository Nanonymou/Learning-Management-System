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
