# 10 — Todo List Development

Rencana pengembangan **bertahap** (milestone). Diurutkan berdasarkan dependensi. Belum dikerjakan pada tahap ini — menunggu instruksi untuk mulai implementasi.

Legenda: `[ ]` belum · `[~]` opsional/lanjutan · Prioritas: **P0** wajib inti, **P1** penting, **P2** peningkatan.

---

## Milestone 0 — Fondasi Proyek (P0)
- [ ] Inisialisasi Next.js + TypeScript + Tailwind.
- [ ] Setup struktur folder (feature-based) sesuai [04](04-folder-structure.md).
- [ ] Konfigurasi ESLint/Prettier, path alias.
- [ ] Setup tema + Dark Mode (ThemeProvider, toggle, persist).
- [ ] Setup komponen shared dasar: Button, Card, Input, Modal, Toast, Skeleton, EmptyState.
- [ ] `.env.example` + koneksi Supabase (client/server/admin).

## Milestone 1 — Database & Supabase (P0)
- [ ] Buat migrasi seluruh tabel ([05](05-database-design.md)).
- [ ] Index & unique constraints (attendance, training_progress, certificates).
- [ ] RLS policies (publik vs admin).
- [ ] Storage buckets (company-assets) + policy.
- [ ] Seed `positions` (8 jabatan).

## Milestone 2 — Company Settings (P0)
- [ ] Tabel + service `company_settings` (singleton).
- [ ] Hook `useCompanySettings()` global.
- [ ] Halaman Admin Company Settings (form + upload aset).
- [ ] Integrasikan identitas ke layout/footer (tanpa hardcode).

## Milestone 3 — Ingest Materi DOCX (P0)
- [ ] Script `ingest-docx.ts`: DOCX → chapter/block JSON.
- [ ] Klasifikasi blok (bullet, list_check ✔/✘, temperature, case_finding, quote).
- [ ] Seed `material_chapters` + `material_blocks` (18 bab + penutup).
- [ ] Verifikasi materi tampil **apa adanya**.

## Milestone 4 — Modul Materi / E-book (P0)
- [ ] Halaman daftar bab + halaman detail bab.
- [ ] Accordion, Previous/Next.
- [ ] Render box: Highlight / Warning / Best Practice.
- [ ] Search materi.
- [ ] Bookmark.
- [ ] Progress membaca (auto-save ke `training_progress`).
- [ ] Gate: ujian terkunci hingga 100%.

## Milestone 5 — Daftar Hadir (P0)
- [ ] Form (Nama, Jabatan, Lokasi; tanggal/jam otomatis).
- [ ] Validasi field wajib + unik (user, tanggal).
- [ ] Buat/relasikan record `users`.
- [ ] Sukses → buka menu ujian.

## Milestone 6 — Bank Soal (Admin) (P0)
- [ ] CRUD `questions` + `question_options`.
- [ ] Susun ≥30 soal dari materi (traceable ke bab).
- [ ] Tandai jawaban benar + pembahasan.

## Milestone 7 — Ujian (P0)
- [ ] `POST /api/exam/start` (verifikasi gate, pilih 10 soal acak, opsi acak).
- [ ] UI sesi ujian + Timer 15 menit (basis server).
- [ ] `POST /api/exam/submit` (scoring server, simpan `quiz_result` + `quiz_answers`).
- [ ] Auto-submit saat waktu habis.
- [ ] Retry set soal berbeda bila < 80.

## Milestone 8 — Hasil Ujian (P0)
- [ ] Halaman hasil: Nilai, Benar, Salah, Status.
- [ ] Pembahasan jawaban.
- [ ] Tombol Ulangi (jika tidak lulus).

## Milestone 9 — Sertifikat (P0)
- [ ] `POST /api/certificate/generate` (prasyarat lulus, nomor unik, QR).
- [ ] Preview sertifikat (background/logo/2 TTD dari settings).
- [ ] Download PDF.
- [ ] Halaman validasi publik `/validasi/:certNumber`.

## Milestone 10 — Riwayat Training (P1)
- [ ] Daftar training yang diikuti peserta.
- [ ] Nilai, status, akses sertifikat.

## Milestone 11 — Dashboard & Statistik (P1)
- [ ] Kartu statistik (Total Peserta, Lulus, Tidak Lulus, Completion Rate).
- [ ] Grafik: Kelulusan, Peserta per Lokasi, Peserta per Jabatan.
- [ ] Progress Training + Timeline langkah.
- [ ] Banner training dari settings.

## Milestone 12 — Admin Lengkap (P1)
- [ ] Login admin (Supabase Auth) + guard rute.
- [ ] Dashboard admin.
- [ ] Kelola Peserta (+ Hapus Data Peserta).
- [ ] Kelola Materi.
- [ ] Kelola Lokasi.
- [ ] Kelola Jabatan (tambah jabatan baru).
- [ ] Kelola Sertifikat.
- [ ] Reset Hasil Ujian.

## Milestone 13 — Export (P1)
- [ ] Export Excel (`exceljs`).
- [ ] Export PDF.
- [ ] Kolom: Nama, Jabatan, Lokasi, Tanggal, Nilai, Status, Nomor Sertifikat.

## Milestone 14 — Polish UI/UX & Non-Functional (P1/P2)
- [ ] Skeleton loading seluruh fetch.
- [ ] Empty state seluruh daftar.
- [ ] Toast konsisten.
- [ ] Smooth animation.
- [ ] Responsif Desktop/Tablet/Mobile.
- [ ] Lazy load komponen berat (charts, PDF, e-book).
- [ ] Audit aksesibilitas.

## Milestone 15 — QA, Reusability & Rilis (P1)
- [ ] Uji end-to-end alur peserta (materi→sertifikat).
- [ ] Uji alur admin & export.
- [ ] Verifikasi tanpa hardcode identitas & tanpa data dummy.
- [ ] Uji reusability: ganti training via Settings + materi + bank soal.
- [ ] Dokumentasi setup & deployment.

---

## Ringkasan Urutan Kritis (Jalur Utama)
```
M0 Fondasi → M1 DB → M2 Settings → M3 Ingest Materi → M4 E-book →
M5 Daftar Hadir → M6 Bank Soal → M7 Ujian → M8 Hasil → M9 Sertifikat →
(M10 Riwayat, M11 Dashboard, M12 Admin, M13 Export) → M14 Polish → M15 QA/Rilis
```

## Definition of Done (Global)
- Semua ketentuan PRD ([09](09-technical-specification.md) §14) terpenuhi.
- Tidak ada data dummy & tidak ada identitas hardcode.
- Materi dari DOCX apa adanya; bank soal berbasis materi.
- Aplikasi reusable untuk training lain via Company Settings + ganti materi/soal.
