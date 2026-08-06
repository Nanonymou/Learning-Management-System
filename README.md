# LMS Training

Learning Management System (LMS) berbasis web untuk pelatihan internal — **modern, responsif, reusable**. Dibangun dengan React + TypeScript + Vite + Tailwind CSS + Supabase.

> Dokumen perencanaan lengkap ada di folder [`docs/`](docs/00-README.md).

## Status Pengembangan

**Tahap 2** — fondasi aplikasi. Yang sudah tersedia:

- ✅ Struktur folder scalable (feature-based)
- ✅ Routing (React Router) + placeholder halaman fitur
- ✅ Theme + **Dark Mode**
- ✅ Layout (Sidebar, Header, Footer, shell responsif)
- ✅ **Company Settings** (berfungsi; identitas perusahaan tanpa hardcode)
- ✅ Supabase client (konfigurasi saja)

Belum dibuat (tahap berikutnya): database, quiz, sertifikat, export, auth.

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
    ├── company-settings/      # types, service, provider, form, page
    └── dashboard/
```

## Prinsip

- **Tanpa hardcode identitas** — nama, logo, alamat, dll. dari Company Settings.
- **Reusable** — ganti Company Settings + materi untuk training lain, tanpa ubah kode.
- **Modular** — setiap fitur self-contained di `features/`.
- **Swappable data layer** — service memakai interface; adapter lokal sekarang, Supabase saat tahap database (lihat `company-settings/services`).
