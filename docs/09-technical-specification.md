# 09 — Technical Specification

Spesifikasi teknis detail per modul, kontrak data operasi server, dan kebutuhan non-fungsional. Menjadi acuan implementasi (tahap berikutnya).

## 1. Stack & Lingkungan

- **Next.js (App Router) + React + TypeScript**, **Tailwind CSS**, **Supabase** (PostgreSQL, Auth, Storage, RLS).
- Variabel lingkungan (`.env`), tanpa nilai rahasia di repo:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- Operasi sensitif (start/submit ujian, generate sertifikat, export) via **Route Handler** server dengan service role.

## 2. Modul: Company Settings

- **Sumber tunggal identitas.** Hook `useCompanySettings()` menyediakan data ke seluruh halaman (SSR untuk metadata + client untuk komponen).
- Upload aset (logo, background, TTD) ke Supabase Storage; simpan URL di tabel.
- **Tidak ada** string identitas di kode; komponen membaca dari settings, fallback = placeholder netral kosong.
- Validasi: format email/URL, ukuran & tipe file gambar.

## 3. Modul: Materi (E-book)

### Model Konten
`Chapter { id, order_no, code, title }` → `Block { order_no, type, payload }`. Tipe blok: `heading, paragraph, list_bullet, list_check, temperature, case_finding, commitment, quote` (mapping ke Highlight/Warning/Best Practice Box — lihat [02](02-analisa-materi-docx.md)).

### Ingest DOCX (script `scripts/ingest-docx.ts`)
1. Parse DOCX → deteksi heading `BAB` → chapter.
2. Klasifikasi paragraf → tipe blok (bullet, ✔/✘ → list_check, suhu → temperature, Temuan/Risiko/Pengendalian → case_finding).
3. Output JSON → seed `material_chapters` + `material_blocks`.
4. Isi materi **tidak diubah** (tampil apa adanya).

### Fitur UI Materi
- **Accordion** per bab; **Previous/Next**; **Search** (index judul + teks blok); **Bookmark** (simpan chapter/blok favorit — localStorage + opsional DB).
- **Box render**: Highlight (angka/suhu), Warning (✘/risiko), Best Practice (✔/pengendalian).
- **Progress membaca**: dihitung per bab (mis. berdasarkan scroll/section terbaca), disimpan otomatis (debounce) ke `training_progress`. Total = rata-rata/agregasi seluruh bab. 100% membuka gate ujian.

## 4. Modul: Daftar Hadir

- Form: Nama Lengkap, Jabatan (dari `positions` aktif), Lokasi (dari `locations` aktif). Tanggal & Jam **otomatis** (server time).
- Validasi client + server: semua field wajib; **unik (user, tanggal)** → tolak dobel (BR-03).
- Sukses → set flag pembuka ujian (state + verifikasi server saat start ujian).

## 5. Modul: Ujian

### `POST /api/exam/start`
- **Prasyarat (verifikasi server):** progress 100% & attendance hari ini ada.
- **Proses:** pilih **10 soal acak** dari `questions` aktif (training aktif); untuk retry, hindari set soal sebelumnya bila memungkinkan; acak urutan `question_options`.
- **Response:** daftar soal + opsi teracak (tanpa `is_correct`), `session token`, `started_at`, durasi 15 menit.

### `POST /api/exam/submit`
- **Input:** jawaban terpilih per soal, `session token`.
- **Proses (server):** cocokkan ke `question_options.is_correct`, hitung `correct/wrong`, `score = correct/10*100`, status `>=80 ? lulus : tidak_lulus`. Simpan `quiz_result` + `quiz_answers` (untuk pembahasan). `attempt_no` bertambah per percobaan.
- **Auto-submit** bila timer habis (client kirim state; server tetap otoritatif).
- **Output:** `resultId` → redirect halaman hasil.

### Timer
- 15 menit; hitung mundur di client dengan basis `started_at` server (anti-manipulasi). Habis → submit otomatis.

## 6. Modul: Hasil Ujian

- Tampilkan Nilai, Jumlah Benar, Jumlah Salah, Status, **Pembahasan** (dari `quiz_answers` + `questions.explanation` + opsi benar).
- Jika tidak lulus → tombol **Ulangi Ujian** (memanggil `/api/exam/start` set baru).

## 7. Modul: Sertifikat

### `POST /api/certificate/generate`
- **Prasyarat:** `quiz_result.status = lulus` & belum ada sertifikat untuk hasil tsb.
- **Proses:** generate `certificate_number` unik (atomik), susun `qr_payload` = URL `/validasi/:certNumber`, ambil desain & identitas dari `company_settings` (snapshot ke record).
- **Output:** record `certificates`.

### Render & PDF
- Preview sertifikat memakai background & logo dari settings; QR di-generate (`qrcode`); 2 TTD digital (gambar dari settings).
- **Download PDF** via `@react-pdf/renderer`/`pdf-lib`. Isi: Logo, Nama Perusahaan, Nama Training, Nama Peserta, Jabatan, Lokasi, Nilai, Nomor Sertifikat, QR, 2 TTD, Tanggal.

### Validasi Publik
- `/validasi/:certNumber` (read-only) → tampilkan status VALID + data ringkas bila nomor ditemukan.

## 8. Modul: Dashboard & Statistik

- Query agregasi: Total Peserta, Total Lulus/Tidak Lulus (dari `quiz_result`), Completion Rate, Progress Training.
- Grafik: Kelulusan, Peserta per Lokasi, Peserta per Jabatan (Recharts/Chart.js).
- **Timeline** langkah training (Materi→Hadir→Ujian→Lulus→Sertifikat).
- Banner training dari `company_settings.training_name` + deskripsi.

## 9. Modul: Admin

- **CRUD**: peserta, materi (chapter/block), bank soal (question + options), lokasi, jabatan, sertifikat, company settings.
- **Aksi khusus**: Hapus Data Peserta (cascade terkontrol), Reset Hasil Ujian (`quiz_result`/`quiz_answers` terkait).
- **Auth guard** pada seluruh rute admin; operasi via server dengan cek role.

## 10. Modul: Export

### `GET /api/export/excel` & `GET /api/export/pdf`
- Kolom: Nama, Jabatan, Lokasi, Tanggal, Nilai, Status, Nomor Sertifikat.
- Sumber: join `users`/`attendance`/`quiz_result`/`certificates`.
- Excel via `exceljs`; PDF via library PDF. Hanya admin.

## 11. Keamanan

- RLS aktif seluruh tabel (garis besar di [05](05-database-design.md) §6).
- Service-role hanya di server; anon key di client dengan policy ketat.
- Validasi input (Zod/skema) di client & server.
- Nilai & nomor sertifikat **tidak** ditentukan client.

## 12. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| Performa | Fast loading; lazy load komponen berat (charts, PDF, e-book) |
| Responsif | Desktop, Tablet, Mobile (Tailwind breakpoints) |
| UI/UX | Card UI, rounded, shadow, smooth animation |
| Loading | Skeleton loading di setiap fetch |
| Kosong | Empty state informatif |
| Feedback | Toast notification untuk aksi |
| Tema | Dark mode (persist preferensi) |
| Aksesibilitas | Kontras memadai, fokus keyboard, label form |
| i18n teks UI | Bahasa Indonesia (materi apa adanya) |

## 13. Kontrak Data (Ringkas Tipe)

```ts
type Block =
  | { type: 'heading'; payload: { text: string; level: number } }
  | { type: 'paragraph'; payload: { text: string } }
  | { type: 'list_bullet'; payload: { items: string[] } }
  | { type: 'list_check'; payload: { items: { text: string; ok: boolean }[] } }
  | { type: 'temperature'; payload: { label: string; value: string }[] }
  | { type: 'case_finding'; payload: { finding: string; risk: string; control: string } }
  | { type: 'commitment'; payload: { items: string[] } }
  | { type: 'quote'; payload: { text: string } };

type ExamStartResponse = {
  sessionToken: string;
  startedAt: string;      // ISO, dari server
  durationSec: 900;       // 15 menit
  questions: { id: string; text: string; options: { id: string; text: string }[] }[];
};

type ExamSubmitResult = {
  resultId: string; score: number; correct: number; wrong: number;
  status: 'lulus' | 'tidak_lulus';
};
```

## 14. Ketentuan yang Wajib Terpenuhi (Traceability ke PRD)

- [ ] Tidak ada data dummy — semua dari DB.
- [ ] Tidak ada identitas perusahaan di kode — dari `company_settings`.
- [ ] Materi dari DOCX, tampil apa adanya.
- [ ] Bank soal ≥30, berbasis materi; 10 acak per sesi; opsi acak.
- [ ] Timer 15 menit; passing ≥80; retry soal berbeda.
- [ ] Sertifikat hanya jika lulus; nomor otomatis + QR + 2 TTD; PDF.
- [ ] Export Excel & PDF sesuai kolom.
- [ ] Dark mode, skeleton, empty state, toast, responsive.
