# LMS Training — Dokumen Perencanaan Proyek

Repositori ini berisi **dokumen perencanaan (Stage 1)** untuk aplikasi **Learning Management System (LMS)** pelatihan internal perusahaan berbasis web.

> ⚠️ **Status:** Tahap perencanaan. Belum ada source code / UI yang ditulis. Seluruh output pada tahap ini murni berupa dokumen perencanaan sesuai instruksi.

## Ringkasan Proyek

Aplikasi LMS untuk pelatihan internal yang **modern, profesional, responsif, dan reusable**. Aplikasi dapat dipakai ulang untuk berbagai jenis training hanya dengan mengganti materi & pengaturan, tanpa mengubah source code. Identitas perusahaan (nama, logo, alamat, tanda tangan sertifikat, dll.) sepenuhnya dikelola melalui halaman **Company Settings** — tidak ada nilai yang di-hardcode.

Materi pertama yang digunakan sebagai referensi adalah **Training Food Handler (Food Safety)** yang terdiri dari 18 bab (BAB I – BAB XVIII) + Penutup.

## Daftar Dokumen Perencanaan

| No | Dokumen | Isi |
|----|---------|-----|
| 01 | [Analisa PRD](01-analisa-prd.md) | Analisa menyeluruh terhadap PRD, fitur, aturan bisnis, dan batasan |
| 02 | [Analisa Struktur Materi DOCX](02-analisa-materi-docx.md) | Struktur bab/section materi training, komponen konten (box, list, tabel suhu) |
| 03 | [Project Architecture](03-project-architecture.md) | Arsitektur sistem, tech stack, lapisan aplikasi, integrasi Supabase |
| 04 | [Folder Structure](04-folder-structure.md) | Struktur folder & konvensi penamaan modular |
| 05 | [Database Design](05-database-design.md) | Skema tabel, kolom, tipe data, relasi, index, RLS |
| 06 | [Entity Relationship Diagram](06-erd.md) | ERD (Mermaid) & penjelasan relasi antar entitas |
| 07 | [User Flow](07-user-flow.md) | Alur peserta & admin dari awal hingga sertifikat |
| 08 | [Navigation Flow](08-navigation-flow.md) | Peta navigasi, struktur menu, guard/route protection |
| 09 | [Technical Specification](09-technical-specification.md) | Spesifikasi teknis detail per modul, API/kontrak data, non-functional |
| 10 | [Todo List Development](10-todo-development.md) | Rencana pengembangan bertahap (milestone & checklist) |

## Prinsip Utama (Wajib Dipatuhi)

1. **Tidak ada data dummy** — semua data berasal dari database nyata.
2. **Tidak hardcode identitas perusahaan** — nama, logo, alamat diambil dari `company_settings`.
3. **Materi berasal dari DOCX** — ditampilkan apa adanya sesuai struktur dokumen.
4. **Bank soal dibuat berdasarkan materi DOCX** (bukan soal acak sembarang).
5. **Reusable, modular, scalable** — ganti materi & settings, aplikasi siap dipakai untuk training lain.

## Tech Stack (Ringkas)

- **Frontend/Framework:** Next.js (App Router) + React + TypeScript
- **Styling:** Tailwind CSS (Card UI, rounded, shadow, dark mode)
- **Backend & DB:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **PDF Sertifikat & Export:** library PDF (mis. `@react-pdf/renderer` / `pdf-lib`) + QR code
- **Export Excel:** library spreadsheet (mis. `exceljs` / `xlsx`)

Detail pada [03-project-architecture.md](03-project-architecture.md) dan [09-technical-specification.md](09-technical-specification.md).

---

**Setelah dokumen ini di-review, tunggu instruksi berikutnya sebelum masuk ke tahap implementasi.**
