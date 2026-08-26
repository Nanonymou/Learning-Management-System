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
