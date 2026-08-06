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
