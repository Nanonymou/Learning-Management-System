# LMS Training

Learning Management System (LMS) berbasis web untuk pelatihan internal — **modern, responsif, reusable**. Dibangun dengan React + TypeScript + Vite + Tailwind CSS + Supabase.

> Dokumen perencanaan lengkap ada di folder [`docs/`](docs/00-README.md).

## Status Pengembangan

Fondasi + fitur inti selesai (Tahap 2–10). Yang sudah tersedia:

- ✅ Struktur folder scalable (feature-based) + routing (lazy-loaded)
- ✅ Theme + **Dark Mode**, layout responsif (Sidebar, Header, Footer)
- ✅ **Company Settings** (identitas perusahaan tanpa hardcode)
- ✅ **Skema Supabase** (`supabase/`) — tabel, relasi, RLS, helper
- ✅ **Dashboard** — statistik nyata, grafik, timeline alur training
- ✅ **Materi** — e-book dari DOCX (accordion, search, bookmark, progress, box)
- ✅ **Daftar Hadir** — validasi field wajib & 1×/hari, gating materi 100%
- ✅ **Ujian** — 10 soal acak (dari ≥33 bank), opsi acak, timer 15 mnt, retry
- ✅ **Hasil Ujian** — nilai, benar/salah, status, pembahasan
- ✅ **Sertifikat** — terbit otomatis saat lulus, nomor unik, QR, PDF, validasi publik
- ✅ **Riwayat Training** & **Dashboard Admin** (kelola peserta/jabatan/lokasi/soal/sertifikat, export Excel/PDF)

Belum dibuat: **auth admin** (rute admin masih terbuka), integrasi data ke Supabase
(saat ini memakai adapter localStorage yang siap di-swap).

### Catatan data layer
Data disimpan lokal (localStorage) melalui **service** per fitur. Antarmuka
service dirancang agar tinggal diganti implementasinya ke Supabase tanpa
mengubah komponen. Materi berasal dari ingest DOCX (`scripts/ingest-docx.py`
→ `src/features/material/data/`).

## Menjalankan

```bash
npm install
cp .env.example .env   # opsional pada tahap ini (Supabase belum diperlukan)
npm run dev            # http://localhost:5173
```

Perintah lain: `npm run build`, `npm run preview`, `npm run typecheck`, `npm run lint`.

## Struktur Folder

```
src/
├── main.tsx, App.tsx          # Entry point
├── index.css                  # Tailwind + design tokens (light/dark)
├── config/                    # routes.ts, navigation.ts (single source of truth)
├── providers/                 # ThemeProvider, AppProviders
├── routes/                    # AppRouter
├── lib/
│   ├── supabase/client.ts     # Supabase client (config)
│   └── utils/cn.ts
├── components/
│   ├── ui/                    # Button, Card, Input, Label, PageHeader
│   ├── layout/                # AppLayout, Sidebar, Header, Footer, BrandLogo, ThemeToggle
│   └── common/                # ComingSoon, NotFoundPage
└── features/                  # Modul per fitur (scalable)
    ├── company-settings/      # identitas perusahaan
    ├── dashboard/             # statistik & agregasi
    ├── material/              # e-book (data ingest DOCX, reader, progress)
    ├── attendance/            # daftar hadir + validasi
    ├── quiz/                  # bank soal, ujian, penilaian
    ├── certificate/           # penerbitan, QR, PDF, validasi
    ├── history/               # riwayat training
    ├── admin/                 # dashboard admin, kelola data, export
    ├── participant/           # identitas peserta (tanpa auth)
    ├── master/                # jabatan & lokasi
    └── training/              # gating alur (useTrainingFlow, timeline)
```

Arsitektur berlapis: **komponen** (UI) → **hooks** → **service** (logika + data)
→ penyimpanan. Tidak ada logika bisnis di komponen; tidak ada identitas
perusahaan yang di-hardcode.

## Prinsip

- **Tanpa hardcode identitas** — nama, logo, alamat, dll. dari Company Settings.
- **Reusable** — ganti Company Settings + materi untuk training lain, tanpa ubah kode.
- **Modular** — setiap fitur self-contained di `features/`.
- **Swappable data layer** — service memakai interface; adapter lokal sekarang, Supabase saat tahap database (lihat `company-settings/services`).
