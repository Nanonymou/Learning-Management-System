# 01 — Analisa PRD

Dokumen ini merangkum hasil analisa menyeluruh terhadap PRD (`PRD_training.txt`) menjadi kebutuhan yang terstruktur: tujuan, aktor, fitur fungsional, aturan bisnis, dan batasan.

## 1. Tujuan Produk

Membangun **LMS berbasis web** untuk pelatihan internal perusahaan yang berfungsi sebagai:
- Media **pembelajaran** (materi e-book dari DOCX).
- Media **evaluasi** (ujian berbasis bank soal).
- Media **monitoring** peserta (dashboard & statistik).
- Media **penerbitan sertifikat** (otomatis, dengan QR validasi).

Karakter produk: **modern, profesional, responsif, mudah digunakan, dan reusable** untuk berbagai jenis training.

## 2. Aktor / Peran

| Aktor | Deskripsi | Autentikasi |
|-------|-----------|-------------|
| **Peserta (Trainee)** | Mengikuti training: baca materi → daftar hadir → ujian → sertifikat | Identifikasi via data diri (Nama, Jabatan, Lokasi). Tanpa login admin |
| **Administrator** | Mengelola seluruh data & konfigurasi aplikasi | Login (autentikasi Supabase) |

Jabatan peserta awal: **Cook, Helper Cook, Butcher, Packer, PJO, PJS, Supervisor, HSE**. Admin dapat **menambah jabatan baru** melalui dashboard (data-driven, bukan hardcode).

## 3. Modul & Fitur Fungsional

### 3.1 Company Settings (Admin)
Sumber tunggal identitas perusahaan. Field yang dapat diubah admin:
- Nama Perusahaan, Logo Perusahaan, Alamat, Website, Email, Nomor Telepon
- Nama Training, Deskripsi Training
- Nama & Jabatan Penandatangan 1
- Nama & Jabatan Penandatangan 2
- Background Sertifikat, Logo Sertifikat

**Aturan:** seluruh halaman mengambil data dari Company Settings. **Tidak boleh** ada teks/identitas perusahaan yang ditulis langsung di kode.

### 3.2 Dashboard (Peserta/Umum)
Menampilkan: Banner Training, Total Peserta, Total Lulus, Total Tidak Lulus, Progress Training, Grafik Kelulusan, Grafik Peserta per Lokasi, Grafik Peserta per Jabatan, Training Completion Rate.
**Timeline langkah:** Membaca Materi → Mengisi Daftar Hadir → Mengerjakan Ujian → Lulus → Mendapat Sertifikat.

### 3.3 Materi
- Berasal dari **file DOCX**, ditampilkan **apa adanya** (tidak diubah isinya), gaya **e-book**.
- Tiap BAB memiliki: Progress membaca, Accordion, Previous, Next, Search, Bookmark, Highlight Box, Warning Box, Best Practice Box.
- Progress membaca **disimpan otomatis**.
- **Gate:** peserta tidak dapat membuka Ujian sebelum materi selesai dibaca (100%).

### 3.4 Daftar Hadir
- Wajib diisi **sebelum** ujian.
- Field: Nama Lengkap, Jabatan, Lokasi, Tanggal (otomatis), Jam (otomatis).
- Validasi: **tidak boleh mengisi dua kali pada hari yang sama**; semua field wajib.
- Setelah berhasil → menu Ujian **otomatis terbuka**.

### 3.5 Ujian
- Bank soal berdasarkan materi DOCX. **Minimal 30 soal.**
- Tiap peserta mendapat **10 soal acak**; **pilihan jawaban diacak**.
- **Timer 15 menit.**
- **Passing grade ≥ 80.** Jika < 80 → peserta boleh **mengulang** dengan **soal berbeda**.

### 3.6 Hasil Ujian
Menampilkan: Nilai, Jumlah Benar, Jumlah Salah, Status (Lulus/Tidak), Pembahasan Jawaban.

### 3.7 Sertifikat
- Muncul **hanya** jika lulus.
- Desain diubah via Company Settings.
- Memuat: Logo, Nama Perusahaan, Nama Training, Nama Peserta, Jabatan, Lokasi, Nilai, **Nomor Sertifikat Otomatis**, **QR Code Validasi**, **Dua Tanda Tangan Digital**, Tanggal.
- **Download PDF.**

### 3.8 Riwayat Training
Peserta melihat: Training yang pernah diikuti, Nilai, Status, Sertifikat.

### 3.9 Login Admin & Dashboard Admin
Autentikasi dengan role **Administrator**. Admin dapat:
- Mengelola Peserta, Materi, Bank Soal, Lokasi, Jabatan, Sertifikat, Company Settings
- Melihat Statistik
- Menghapus Data Peserta, Reset Hasil Ujian

### 3.10 Export
Admin mengunduh **Excel** & **PDF** berisi: Nama, Jabatan, Lokasi, Tanggal, Nilai, Status, Nomor Sertifikat.

## 4. Aturan Bisnis (Business Rules)

| ID | Aturan |
|----|--------|
| BR-01 | Ujian terkunci hingga progres baca materi = 100% |
| BR-02 | Ujian terkunci hingga Daftar Hadir hari ini terisi |
| BR-03 | Daftar hadir hanya boleh 1× per peserta per hari (unik: user + tanggal) |
| BR-04 | Nilai < 80 = Tidak Lulus → boleh mengulang dengan set soal berbeda |
| BR-05 | Nilai ≥ 80 = Lulus → sertifikat diterbitkan otomatis |
| BR-06 | Sertifikat hanya untuk peserta lulus |
| BR-07 | Nomor sertifikat digenerate otomatis & unik |
| BR-08 | QR Code sertifikat mengarah ke halaman validasi publik |
| BR-09 | Setiap sesi ujian: 10 soal acak dari bank (≥30), opsi jawaban diacak |
| BR-10 | Timer ujian 15 menit; habis waktu = auto-submit |
| BR-11 | Identitas perusahaan selalu dari `company_settings` |

## 5. Kebutuhan Non-Fungsional

- **Performa:** Fast loading, lazy load.
- **Responsif:** Desktop, Tablet, Mobile.
- **UI/UX:** Clean, Corporate, Modern, Card UI, Rounded, Shadow, Skeleton Loading, Empty State, Toast Notification, Smooth Animation, **Dark Mode**.
- **Database:** Supabase (PostgreSQL).
- **Keamanan:** Autentikasi admin, proteksi data peserta, validasi input.

## 6. Batasan & Ketentuan Penting

1. **Jangan** menggunakan data dummy.
2. **Jangan** hardcode nama perusahaan / logo / identitas.
3. Semua identitas perusahaan diambil dari Company Settings.
4. Materi **harus** dari DOCX yang dilampirkan.
5. Soal **harus** dibuat otomatis berdasarkan materi DOCX.
6. Struktur kode **modular, reusable, scalable**, siap dikembangkan untuk berbagai pelatihan.

## 7. Tabel Database yang Disebut PRD

`company_settings`, `admin`, `users`, `attendance`, `questions`, `quiz_result`, `certificates`, `locations`, `positions`, `training_progress`. (Perincian & tambahan pada [05-database-design.md](05-database-design.md).)

## 8. Catatan Analisa (Poin yang Diperjelas untuk Implementasi)

- **Identitas peserta**: PRD tidak menyebut login peserta; identifikasi peserta memakai kombinasi data diri (Nama + Jabatan + Lokasi) melalui form Daftar Hadir. Untuk kontinuitas progres antar sesi, disarankan menyimpan identitas peserta di client (local session) yang dipetakan ke record `users`.
- **Materi dari DOCX**: agar reusable, DOCX perlu di-*parse* menjadi struktur konten ter-normalisasi (bab, paragraf, list, box) yang disimpan/di-render — bukan menampilkan file mentah. Detail pada [02](02-analisa-materi-docx.md) & [09](09-technical-specification.md).
- **Bank soal**: minimal 30 soal disusun dari materi (contoh soal sudah diberikan di PRD). Soal & opsi dikelola admin melalui "Kelola Bank Soal".
