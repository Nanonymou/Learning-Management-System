# 05 — Database Design

Desain database untuk **Supabase (PostgreSQL)**. Mencakup tabel yang disebut PRD + tabel tambahan untuk materi terstruktur (agar reusable & mendukung e-book). Semua identitas perusahaan disimpan di `company_settings` (tidak hardcode).

## 1. Ikhtisar Tabel

| Tabel | Fungsi | Sumber |
|-------|--------|--------|
| `company_settings` | Identitas perusahaan & konfigurasi sertifikat | PRD |
| `admin` | Akun administrator | PRD |
| `users` | Data peserta | PRD |
| `positions` | Master jabatan | PRD |
| `locations` | Master lokasi | PRD |
| `material_chapters` | Bab materi (hasil ingest DOCX) | Tambahan |
| `material_blocks` | Blok konten per bab | Tambahan |
| `training_progress` | Progres baca materi per peserta | PRD |
| `attendance` | Daftar hadir | PRD |
| `questions` | Bank soal | PRD |
| `question_options` | Opsi jawaban (dinormalisasi) | Tambahan |
| `quiz_result` | Hasil ujian | PRD |
| `quiz_answers` | Detail jawaban per soal (pembahasan) | Tambahan |
| `certificates` | Sertifikat terbit | PRD |

> Tabel `question_options`, `quiz_answers`, `material_chapters`, `material_blocks` adalah normalisasi/pendukung agar fitur (opsi acak, pembahasan, e-book) berjalan rapi & reusable.

## 2. Konvensi Umum

- Primary key: `id uuid default gen_random_uuid()`.
- Timestamp: `created_at timestamptz default now()`, `updated_at timestamptz`.
- Relasi via `*_id uuid references ...`.
- Semua nama tabel/kolom **snake_case**.

## 3. Definisi Tabel

### 3.1 `company_settings`
Baris tunggal (singleton) berisi identitas & konfigurasi sertifikat.

| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| company_name | text | Nama perusahaan |
| logo_url | text | Logo perusahaan (Storage) |
| address | text | Alamat |
| website | text | |
| email | text | |
| phone | text | |
| training_name | text | Nama training aktif |
| training_description | text | |
| signer1_name | text | Penandatangan 1 |
| signer1_title | text | Jabatan penandatangan 1 |
| signer1_signature_url | text | TTD digital 1 (Storage) |
| signer2_name | text | Penandatangan 2 |
| signer2_title | text | Jabatan penandatangan 2 |
| signer2_signature_url | text | TTD digital 2 (Storage) |
| certificate_background_url | text | Background sertifikat |
| certificate_logo_url | text | Logo sertifikat |
| created_at / updated_at | timestamptz | |

### 3.2 `admin`
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | Terhubung ke `auth.users.id` |
| email | text unique | |
| full_name | text | |
| role | text default 'administrator' | Role admin |
| created_at | timestamptz | |

> Autentikasi memakai Supabase Auth; `admin.id` = `auth.uid()`.

### 3.3 `positions` (Jabatan)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| name | text unique | Cook, Helper Cook, Butcher, Packer, PJO, PJS, Supervisor, HSE, … |
| is_active | boolean default true | |
| created_at | timestamptz | |

### 3.4 `locations` (Lokasi)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| name | text unique | Nama lokasi/site |
| is_active | boolean default true | |
| created_at | timestamptz | |

### 3.5 `users` (Peserta)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| full_name | text not null | Nama lengkap |
| position_id | uuid FK → positions | Jabatan |
| location_id | uuid FK → locations | Lokasi |
| created_at | timestamptz | |

> Peserta tanpa akun login. Identitas peserta dipetakan dari form Daftar Hadir. Kombinasi (full_name, position_id, location_id) dapat dijadikan acuan identifikasi.

### 3.6 `material_chapters` (Bab Materi)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| training_key | text | Penanda training (mendukung multi-training) |
| order_no | int | Urutan bab |
| code | text | "I", "II", … |
| title | text | Judul bab |
| created_at | timestamptz | |

### 3.7 `material_blocks` (Blok Konten)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| chapter_id | uuid FK → material_chapters | |
| order_no | int | Urutan blok |
| type | text | heading, paragraph, list_bullet, list_check, temperature, case_finding, commitment, quote |
| payload | jsonb | Konten blok (teks/list/label) sesuai tipe |
| created_at | timestamptz | |

> `payload` fleksibel: mis. `list_check` → `{ items: [{text, ok:true}] }`; `case_finding` → `{ finding, risk, control }`.

### 3.8 `training_progress` (Progres Baca)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| chapter_id | uuid FK → material_chapters | |
| progress | int default 0 | 0–100 (%) per bab |
| completed | boolean default false | |
| updated_at | timestamptz | |

Unik: `(user_id, chapter_id)`. Progres total training = agregasi seluruh bab.

### 3.9 `attendance` (Daftar Hadir)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| full_name | text | Snapshot nama |
| position_id | uuid FK → positions | |
| location_id | uuid FK → locations | |
| attend_date | date not null | Tanggal (otomatis) |
| attend_time | time not null | Jam (otomatis) |
| created_at | timestamptz | |

**Constraint unik:** `(user_id, attend_date)` → tidak boleh mengisi 2× sehari (BR-03).

### 3.10 `questions` (Bank Soal)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| training_key | text | Multi-training |
| chapter_ref | text | Bab sumber (traceability ke materi) |
| question_text | text not null | |
| explanation | text | Pembahasan |
| is_active | boolean default true | |
| created_at | timestamptz | |

### 3.11 `question_options` (Opsi Jawaban)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| question_id | uuid FK → questions | |
| option_text | text not null | |
| is_correct | boolean default false | |
| order_no | int | Urutan default (diacak saat disajikan) |

> Opsi disajikan **teracak** ke peserta (BR-09).

### 3.12 `quiz_result` (Hasil Ujian)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| training_key | text | |
| score | int | 0–100 |
| total_questions | int | (10) |
| correct_count | int | |
| wrong_count | int | |
| status | text | 'lulus' / 'tidak_lulus' |
| attempt_no | int default 1 | Urutan percobaan (retry) |
| started_at | timestamptz | |
| finished_at | timestamptz | |
| created_at | timestamptz | |

Status ditentukan server: `score >= 80 → lulus`.

### 3.13 `quiz_answers` (Detail Jawaban)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| quiz_result_id | uuid FK → quiz_result | |
| question_id | uuid FK → questions | |
| selected_option_id | uuid FK → question_options | |
| is_correct | boolean | |

Untuk menampilkan **Pembahasan Jawaban** di halaman hasil.

### 3.14 `certificates` (Sertifikat)
| Kolom | Tipe | Ket. |
|-------|------|------|
| id | uuid PK | |
| user_id | uuid FK → users | |
| quiz_result_id | uuid FK → quiz_result | |
| certificate_number | text unique | Nomor otomatis |
| training_name | text | Snapshot nama training |
| participant_name | text | Snapshot nama peserta |
| position_name | text | Snapshot jabatan |
| location_name | text | Snapshot lokasi |
| score | int | |
| qr_payload | text | URL validasi (mengandung certificate_number) |
| issued_date | date | Tanggal terbit |
| created_at | timestamptz | |

> Sertifikat dibuat hanya bila `quiz_result.status = 'lulus'` (BR-05/06). Nomor unik (BR-07). Field snapshot menjaga keabsahan histori meski master berubah.

## 4. Index yang Disarankan

| Index | Tujuan |
|-------|--------|
| `attendance (user_id, attend_date)` UNIQUE | Cegah dobel/hari |
| `training_progress (user_id, chapter_id)` UNIQUE | 1 progres/bab |
| `certificates (certificate_number)` UNIQUE | Validasi cepat |
| `questions (training_key, is_active)` | Ambil bank soal aktif |
| `quiz_result (user_id, created_at)` | Riwayat |
| `material_blocks (chapter_id, order_no)` | Render terurut |

## 5. Aturan Nomor Sertifikat

Format contoh: `CERT/{TRAINING_CODE}/{YYYY}/{MM}/{SEQ}` — komponen diambil dari settings/training & sekuens per periode. Generate di server (atomik) untuk menjamin unik.

## 6. Row Level Security (RLS) — Garis Besar

| Tabel | Peserta (anon/public) | Admin (auth) |
|-------|-----------------------|--------------|
| company_settings | SELECT (read-only) | ALL |
| material_chapters/blocks | SELECT | ALL |
| positions / locations | SELECT (aktif) | ALL |
| users | INSERT (buat identitas), SELECT terbatas | ALL |
| attendance | INSERT (validasi unik), SELECT milik sendiri | ALL |
| questions/options | (via API server saja) | ALL |
| quiz_result / quiz_answers | INSERT via server, SELECT milik sendiri | ALL |
| certificates | SELECT untuk validasi publik (by number) | ALL |

> Operasi bernilai integritas tinggi (mulai ujian, submit nilai, generate sertifikat, export) dieksekusi via **Route Handler server** dengan service role, bukan langsung dari client.

## 7. Data Awal (Seed) — Bukan Dummy Konten

- `positions`: 8 jabatan sesuai PRD.
- `locations`: diisi admin (kosong di awal / sesuai site nyata).
- `material_chapters` + `material_blocks`: hasil ingest DOCX (18 bab + penutup).
- `questions` + `question_options`: bank soal ≥30 disusun dari materi.
- `company_settings`: satu baris kosong/placeholder untuk diisi admin (tanpa identitas hardcode).
