# 04 — Folder Structure

Struktur folder **feature-based & modular** untuk Next.js (App Router) + TypeScript + Supabase. Tujuan: reusable, scalable, mudah dipelihara.

> Struktur ini adalah rencana. Belum dibuat pada tahap ini (tahap perencanaan). Nama file/route final dapat menyesuaikan saat implementasi.

## 1. Struktur Tingkat Atas

```
learning-management-system/
├── docs/                       # Dokumen perencanaan (tahap ini)
├── public/                     # Aset statis netral (favicon, ilustrasi empty-state)
├── src/
│   ├── app/                    # Routing (App Router)
│   ├── components/             # Komponen UI reusable (shared)
│   ├── features/               # Modul per fitur (inti aplikasi)
│   ├── lib/                    # Integrasi & util lintas fitur
│   ├── hooks/                  # Custom hooks global
│   ├── stores/                 # State global (tema, sesi peserta)
│   ├── types/                  # Tipe TypeScript global
│   ├── config/                 # Konstanta non-identitas (rute, key netral)
│   └── styles/                 # Tailwind & global CSS
├── supabase/                   # Skema DB, migrasi, seed, policies
├── scripts/                    # Skrip utilitas (ingest DOCX, seed)
├── .env.example                # Variabel lingkungan (tanpa nilai rahasia)
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

## 2. `src/app/` — Routing

```
app/
├── (public)/                       # Area peserta (tanpa login)
│   ├── layout.tsx                  # Layout publik (ambil Company Settings)
│   ├── page.tsx                    # Dashboard
│   ├── materi/
│   │   ├── page.tsx                # Daftar bab / e-book
│   │   └── [chapterId]/page.tsx    # Detail bab
│   ├── daftar-hadir/page.tsx
│   ├── ujian/
│   │   ├── page.tsx                # Sesi ujian (terkunci sesuai gating)
│   │   └── hasil/[resultId]/page.tsx
│   ├── sertifikat/
│   │   └── [certId]/page.tsx
│   ├── riwayat/page.tsx
│   └── validasi/[certNumber]/page.tsx   # Validasi QR (publik)
│
├── (admin)/                        # Area admin (butuh login)
│   ├── layout.tsx                  # Guard auth + layout admin
│   ├── login/page.tsx
│   └── admin/
│       ├── page.tsx                # Dashboard admin
│       ├── peserta/page.tsx
│       ├── materi/page.tsx
│       ├── bank-soal/page.tsx
│       ├── lokasi/page.tsx
│       ├── jabatan/page.tsx
│       ├── sertifikat/page.tsx
│       ├── company-settings/page.tsx
│       └── export/page.tsx
│
├── api/                            # Route Handlers (operasi server)
│   ├── exam/start/route.ts         # Pilih 10 soal acak
│   ├── exam/submit/route.ts        # Scoring & simpan hasil
│   ├── certificate/generate/route.ts
│   ├── export/excel/route.ts
│   └── export/pdf/route.ts
│
├── layout.tsx                      # Root layout (ThemeProvider, Toast)
└── not-found.tsx
```

## 3. `src/features/` — Modul Fitur

Setiap fitur *self-contained*: komponen, hooks, service, tipe, dan (bila perlu) validasi.

```
features/
├── company-settings/
│   ├── components/
│   ├── hooks/            # useCompanySettings()
│   ├── services/         # companySettings.repository.ts
│   └── types.ts
├── dashboard/
│   ├── components/       # StatCard, charts, TrainingTimeline
│   ├── hooks/
│   └── services/
├── material/
│   ├── components/       # EbookReader, Accordion, Boxes, SearchBar, Bookmark
│   ├── hooks/            # useReadingProgress()
│   ├── services/
│   └── types.ts          # Chapter, Block types
├── attendance/
│   ├── components/
│   ├── services/
│   └── validation.ts     # aturan 1×/hari, field wajib
├── exam/
│   ├── components/       # QuestionCard, Timer, ProgressBar
│   ├── hooks/            # useExamTimer()
│   ├── services/         # scoring, seleksi soal (client bridge ke API)
│   └── types.ts
├── result/
├── certificate/
│   ├── components/       # CertificatePreview
│   ├── services/         # number generator, qr, pdf builder
│   └── types.ts
├── history/
├── auth/
│   ├── services/
│   └── guards.ts
└── admin/
    ├── peserta/
    ├── materi/
    ├── bank-soal/
    ├── lokasi/
    ├── jabatan/
    ├── sertifikat/
    ├── settings/
    └── export/
```

## 4. `src/components/` — Shared UI

```
components/
├── ui/            # Button, Card, Modal, Input, Select, Badge, Tabs
├── feedback/      # Toast, Skeleton, EmptyState, ErrorState
├── layout/        # Navbar, Sidebar, Footer, ThemeToggle, Container
├── charts/        # Wrapper chart reusable
└── icons/
```

## 5. `src/lib/` — Integrasi & Util

```
lib/
├── supabase/
│   ├── client.ts          # Browser client
│   ├── server.ts          # Server client (Server Actions/Route Handlers)
│   └── admin.ts           # Service-role client (server-only)
├── pdf/                   # Helper pembuatan PDF
├── qrcode/
├── excel/
├── docx/                  # Parser DOCX → block (dipakai script ingest)
└── utils/                 # format tanggal/jam, cn(), guards
```

## 6. `supabase/` — Database

```
supabase/
├── migrations/            # SQL migrasi tabel & index
├── policies/              # RLS policies
├── seed/
│   ├── positions.sql      # 8 jabatan awal (data nyata, bukan dummy konten)
│   ├── material.sql       # Hasil ingest DOCX (chapter/block)
│   └── questions.sql      # Bank soal ≥30
└── README.md
```

## 7. `scripts/` — Utilitas

```
scripts/
├── ingest-docx.ts         # DOCX → JSON block → seed material
└── generate-questions.ts  # Bantu susun bank soal dari materi (review manual admin)
```

## 8. Konvensi Penamaan

| Item | Konvensi | Contoh |
|------|----------|--------|
| Folder fitur | kebab-case | `bank-soal/` |
| Komponen React | PascalCase | `EbookReader.tsx` |
| Hook | camelCase `use...` | `useReadingProgress.ts` |
| Service/repo | `*.repository.ts` / `*.service.ts` | `attendance.repository.ts` |
| Tipe | `types.ts` / PascalCase | `Chapter`, `QuizResult` |
| Route (URL) | Bahasa Indonesia sesuai menu | `/daftar-hadir` |
| Tabel DB | snake_case (sesuai PRD) | `quiz_result` |

## 9. Aturan Modularitas

- **Tidak ada** identitas perusahaan di kode/konstanta — hanya dari `company-settings`.
- Logika bisnis di `services/`, bukan di komponen.
- Komponen shared bebas dari logika domain.
- Setiap fitur bisa dikembangkan/diuji terpisah → mendukung skala & reuse untuk training lain.
