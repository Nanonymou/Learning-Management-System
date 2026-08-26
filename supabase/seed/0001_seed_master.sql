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
