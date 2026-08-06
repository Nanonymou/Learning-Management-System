# 03 — Project Architecture

Arsitektur sistem LMS: tech stack, lapisan aplikasi, dan integrasi Supabase. Prinsip: **modular, reusable, scalable**.

## 1. Tech Stack

| Lapisan | Teknologi | Alasan |
|---------|-----------|--------|
| Framework | **Next.js (App Router) + React 18 + TypeScript** | SSR/CSR fleksibel, routing modular, type-safe |
| Styling | **Tailwind CSS** + komponen UI (shadcn/ui opsional) | Card UI, rounded, shadow, dark mode cepat |
| State (client) | React Context + hooks / Zustand (ringan) | State peserta, tema, progres baca |
| Data fetching | Supabase JS client + React Query (opsional) | Cache, loading/skeleton state |
| Backend/DB | **Supabase — PostgreSQL** | Sesuai PRD |
| Auth | **Supabase Auth** (admin) | Login administrator |
| Storage | **Supabase Storage** | Logo, background sertifikat, aset |
| Keamanan data | **Row Level Security (RLS)** | Proteksi tabel |
| Charts | Recharts / Chart.js | Grafik dashboard |
| PDF | `@react-pdf/renderer` atau `pdf-lib` | Sertifikat & export PDF |
| QR Code | `qrcode` | QR validasi sertifikat |
| Excel | `exceljs` | Export data |
| DOCX ingest | `mammoth` / parser XML kustom | Konversi materi DOCX → block |

> Catatan: pilihan library final dikonfirmasi saat implementasi; arsitektur tidak bergantung pada satu library spesifik.

## 2. Gaya Arsitektur

**Layered + Modular (feature-based)** dengan Next.js sebagai *full-stack*:

```
┌──────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                        │
│   UI Components · Pages/Routes · Theme (Dark Mode)         │
└───────────────┬───────────────────────────┬───────────────┘
                │                           │
        ┌───────▼────────┐         ┌────────▼─────────┐
        │  App Layer     │         │  Server Actions / │
        │  (features)    │         │  Route Handlers   │
        │  hooks, state  │         │  (API internal)   │
        └───────┬────────┘         └────────┬─────────┘
                │                           │
        ┌───────▼───────────────────────────▼─────────┐
        │            Service / Data Layer               │
        │  supabase client · repositories · validators  │
        │  domain logic (scoring, gating, cert number)  │
        └───────┬───────────────────────────────────────┘
                │
        ┌───────▼───────────────────────────────────────┐
        │                 SUPABASE                        │
        │  PostgreSQL (RLS) · Auth · Storage              │
        └────────────────────────────────────────────────┘
```

### Prinsip Lapisan
- **UI Layer** — presentasi murni, tanpa logika bisnis. Konsumsi data lewat hooks.
- **App/Feature Layer** — orkestrasi per fitur (materi, ujian, sertifikat, admin). Setiap fitur self-contained.
- **Service/Data Layer** — akses Supabase melalui *repository* + logika domain (perhitungan nilai, aturan gating, generate nomor sertifikat, seleksi soal acak).
- **Supabase** — sumber kebenaran data.

## 3. Modul Fungsional (Feature Modules)

| Modul | Tanggung Jawab |
|-------|----------------|
| `company-settings` | CRUD identitas perusahaan; jadi sumber data seluruh halaman |
| `dashboard` | Statistik, grafik, timeline |
| `material` | Render e-book, progres baca, bookmark, search, gating |
| `attendance` | Form & validasi daftar hadir (1×/hari) |
| `exam` | Seleksi soal acak, timer, submit, scoring, retry |
| `result` | Tampil hasil + pembahasan |
| `certificate` | Generate nomor, QR, PDF, validasi publik |
| `history` | Riwayat training peserta |
| `admin` | Kelola peserta, materi, bank soal, lokasi, jabatan, sertifikat, settings, export |
| `auth` | Login admin, guard route |
| `shared` | Komponen UI, util, tema, toast, skeleton, empty state |

## 4. Konfigurasi & Reusability

- **Company Settings** = konfigurasi runtime (di DB), memasok semua identitas.
- **Materi** = data terstruktur (chapter/block) di DB, hasil ingest DOCX.
- Mengganti training cukup: (a) ubah Company Settings, (b) ganti materi & bank soal. **Tanpa** ubah source code.
- Tidak ada konstanta identitas perusahaan di kode; nilai default netral hanya sebagai *placeholder* kosong.

## 5. Integrasi Supabase

- **Database:** seluruh tabel pada [05-database-design.md](05-database-design.md).
- **Auth:** hanya admin. Peserta diidentifikasi via data diri (tanpa akun) — lihat catatan di [01](01-analisa-prd.md) §8.
- **Storage buckets:** `company-assets` (logo, background/logo sertifikat), `public` untuk aset yang boleh diakses tanpa auth (mis. logo di sertifikat publik).
- **RLS:**
  - Data publik/peserta (materi, settings publik, submit attendance/quiz) diatur policy khusus.
  - Data admin (kelola, export, reset) hanya untuk role admin terautentikasi.
- **Server-side untuk operasi sensitif:** scoring & generate nomor sertifikat dijalankan di server (Server Action/Route Handler) agar tidak dapat dimanipulasi client.

## 6. Alur Data Kunci (Ringkas)

1. **Baca materi** → progres per chapter disimpan (`training_progress`) → total 100% membuka ujian.
2. **Daftar hadir** → insert `attendance` (validasi unik user+tanggal) → buka ujian.
3. **Ujian** → server pilih 10 soal acak dari `questions` → submit jawaban → server hitung nilai → simpan `quiz_result`.
4. **Lulus (≥80)** → generate `certificates` (nomor + QR) → PDF.
5. **Admin** → kelola seluruh entitas + export Excel/PDF.

## 7. Keputusan Arsitektur (ADR ringkas)

| Keputusan | Alasan |
|-----------|--------|
| Materi disimpan sebagai block terstruktur, bukan DOCX mentah | Mendukung e-book (accordion/search/box) & reusability |
| Scoring & seleksi soal di server | Integritas nilai, cegah manipulasi |
| Identitas via Company Settings di DB | Menghindari hardcode, mendukung multi-training |
| Feature-based folder | Modular & scalable |
| Supabase RLS | Keamanan data sesuai PRD |
