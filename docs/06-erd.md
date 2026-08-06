# 06 — Entity Relationship Diagram (ERD)

ERD menggambarkan relasi antar entitas database (lihat [05-database-design.md](05-database-design.md) untuk detail kolom).

## 1. Diagram (Mermaid)

```mermaid
erDiagram
    COMPANY_SETTINGS {
        uuid id PK
        text company_name
        text logo_url
        text training_name
        text signer1_name
        text signer2_name
        text certificate_background_url
    }

    ADMIN {
        uuid id PK
        text email
        text full_name
        text role
    }

    POSITIONS {
        uuid id PK
        text name
        bool is_active
    }

    LOCATIONS {
        uuid id PK
        text name
        bool is_active
    }

    USERS {
        uuid id PK
        text full_name
        uuid position_id FK
        uuid location_id FK
    }

    MATERIAL_CHAPTERS {
        uuid id PK
        text training_key
        int order_no
        text code
        text title
    }

    MATERIAL_BLOCKS {
        uuid id PK
        uuid chapter_id FK
        int order_no
        text type
        jsonb payload
    }

    TRAINING_PROGRESS {
        uuid id PK
        uuid user_id FK
        uuid chapter_id FK
        int progress
        bool completed
    }

    ATTENDANCE {
        uuid id PK
        uuid user_id FK
        uuid position_id FK
        uuid location_id FK
        date attend_date
        time attend_time
    }

    QUESTIONS {
        uuid id PK
        text training_key
        text chapter_ref
        text question_text
        text explanation
    }

    QUESTION_OPTIONS {
        uuid id PK
        uuid question_id FK
        text option_text
        bool is_correct
    }

    QUIZ_RESULT {
        uuid id PK
        uuid user_id FK
        int score
        int correct_count
        int wrong_count
        text status
        int attempt_no
    }

    QUIZ_ANSWERS {
        uuid id PK
        uuid quiz_result_id FK
        uuid question_id FK
        uuid selected_option_id FK
        bool is_correct
    }

    CERTIFICATES {
        uuid id PK
        uuid user_id FK
        uuid quiz_result_id FK
        text certificate_number
        text qr_payload
        date issued_date
    }

    POSITIONS   ||--o{ USERS            : "memiliki"
    LOCATIONS   ||--o{ USERS            : "memiliki"
    POSITIONS   ||--o{ ATTENDANCE       : "dipakai"
    LOCATIONS   ||--o{ ATTENDANCE       : "dipakai"

    USERS       ||--o{ ATTENDANCE       : "mengisi"
    USERS       ||--o{ TRAINING_PROGRESS: "membaca"
    USERS       ||--o{ QUIZ_RESULT      : "mengerjakan"
    USERS       ||--o{ CERTIFICATES     : "menerima"

    MATERIAL_CHAPTERS ||--o{ MATERIAL_BLOCKS    : "berisi"
    MATERIAL_CHAPTERS ||--o{ TRAINING_PROGRESS  : "diprogres"

    QUESTIONS   ||--o{ QUESTION_OPTIONS : "punya opsi"
    QUESTIONS   ||--o{ QUIZ_ANSWERS     : "dijawab"

    QUIZ_RESULT ||--o{ QUIZ_ANSWERS     : "merinci"
    QUIZ_RESULT ||--|| CERTIFICATES     : "menghasilkan (jika lulus)"

    QUESTION_OPTIONS ||--o{ QUIZ_ANSWERS : "dipilih"
```

## 2. Ringkasan Relasi

| Relasi | Kardinalitas | Keterangan |
|--------|--------------|------------|
| positions → users | 1 : N | Satu jabatan untuk banyak peserta |
| locations → users | 1 : N | Satu lokasi untuk banyak peserta |
| users → attendance | 1 : N | Peserta bisa hadir di beberapa hari (unik per hari) |
| users → training_progress | 1 : N | Progres per bab |
| material_chapters → material_blocks | 1 : N | Bab berisi banyak blok konten |
| material_chapters → training_progress | 1 : N | Progres dilacak per bab |
| users → quiz_result | 1 : N | Beberapa percobaan (retry) |
| quiz_result → quiz_answers | 1 : N | Detail 10 jawaban per sesi |
| questions → question_options | 1 : N | Satu soal banyak opsi |
| questions → quiz_answers | 1 : N | Soal dijawab di banyak sesi |
| question_options → quiz_answers | 1 : N | Opsi yang dipilih peserta |
| quiz_result → certificates | 1 : 1 | Satu hasil lulus → satu sertifikat |
| users → certificates | 1 : N | Peserta bisa punya sertifikat dari beberapa training |

## 3. Entitas Independen (tanpa FK keluar)

- `company_settings` — singleton konfigurasi, dibaca semua halaman (relasi logis, bukan FK).
- `admin` — terhubung ke Supabase `auth.users` (di luar diagram aplikasi).

## 4. Catatan Integritas

- **Snapshot** pada `attendance` (nama) & `certificates` (nama/jabatan/lokasi/training) menjaga histori tetap valid meski master (`users`, `positions`, `locations`, `company_settings`) berubah.
- **Unique constraints** kunci: `attendance(user_id, attend_date)`, `training_progress(user_id, chapter_id)`, `certificates(certificate_number)`.
- **Multi-training** difasilitasi kolom `training_key` pada materi, soal, dan hasil — mendukung reusability.
