# Supabase Schema — LMS Training

Skema database untuk aplikasi LMS. Dibangun pada **Tahap 3** (schema saja — UI tidak diubah, integrasi data belum di-wire).

## Isi

```
supabase/
├── migrations/
│   ├── 0001_extensions_and_helpers.sql   # pgcrypto, set_updated_at, is_admin, generate_certificate_number
│   ├── 0002_core_tables.sql              # company_settings, admin, positions, locations, users
│   ├── 0003_material_tables.sql          # material_chapters, material_blocks
│   ├── 0004_training_tables.sql          # progress, attendance, questions, options, quiz_result, quiz_answers, certificates
│   ├── 0005_indexes_and_triggers.sql     # index + trigger updated_at
│   └── 0006_rls_policies.sql             # RLS seluruh tabel
└── seed/
    └── 0001_seed_master.sql              # 8 jabatan (PRD) + baris singleton company_settings
```

Total **14 tabel** sesuai [docs/05-database-design.md](../docs/05-database-design.md) & [docs/06-erd.md](../docs/06-erd.md).

## Cara Menerapkan

### Opsi A — Sekali tempel (paling mudah, disarankan)
Buka [`schema.sql`](schema.sql) (gabungan semua migrasi + seed), salin seluruh
isinya ke **Supabase → SQL Editor**, lalu **Run**. Lihat panduan lengkap di
[`../SUPABASE_SETUP.md`](../SUPABASE_SETUP.md).

### Opsi A2 — SQL Editor per file
Jalankan berurutan pada SQL Editor Supabase: `0001` → `0007`, lalu `seed/0001`.

> `0007_app_client_access.sql` menambah kolom denormalisasi (nama jabatan/lokasi)
> dan melonggarkan RLS agar aplikasi klien (tanpa Supabase Auth) dapat menulis.

### Opsi B — Supabase CLI
```bash
supabase db push          # menerapkan migrations/
# lalu jalankan seed:
psql "$DATABASE_URL" -f supabase/seed/0001_seed_master.sql
```

Semua skrip **idempoten** (aman dijalankan ulang).

## Helper (Functions)

| Fungsi | Guna |
|--------|------|
| `set_updated_at()` | Trigger auto-isi `updated_at` (company_settings, training_progress) |
| `is_admin()` | `true` bila `auth.uid()` terdaftar di `admin`. Dipakai di policy RLS. `SECURITY DEFINER` agar tidak rekursif |
| `generate_certificate_number()` | Nomor sertifikat unik `CERT/YYYY/MM/000001` (dipakai pada tahap Sertifikat) |

## Ringkasan RLS

| Kelompok | Peserta (anon) | Admin (`is_admin()`) |
|----------|----------------|----------------------|
| company_settings, material_*, positions, locations, questions, certificates | SELECT | ALL |
| users, training_progress, attendance, quiz_result, quiz_answers | INSERT/SELECT (alur peserta) | ALL |
| `question_options` | **tidak bisa SELECT** (jawaban benar dilindungi) | ALL |
| admin | — | ALL (baca diri) |

### Catatan Integritas (akan diperketat pada tahap berikutnya)
Aplikasi saat ini SPA tanpa server, sehingga sebagian alur peserta memakai policy `INSERT` publik. Operasi bernilai integritas tinggi akan dipindah ke **RPC `SECURITY DEFINER`**:
- **Ujian:** ambil 10 soal acak (opsi tanpa `is_correct`) + scoring di server.
- **Sertifikat:** penerbitan + nomor unik via RPC (bukan insert langsung dari client).

Perlindungan jawaban (`question_options.is_correct`) sudah aktif sejak tahap ini: peserta tidak dapat membaca opsi jawaban sama sekali.
