# Menghubungkan Aplikasi ke Supabase

Panduan agar data **daftar hadir, ujian, sertifikat, dan riwayat semua peserta**
tersimpan terpusat di Supabase — sehingga **admin bisa memantau seluruh peserta
dari perangkat mana pun**.

> Tanpa langkah ini, aplikasi tetap berjalan memakai penyimpanan lokal
> (localStorage) — data hanya terlihat di perangkat/browser yang sama.

## Cara kerja singkat

- Aplikasi mendeteksi Supabase otomatis dari env `VITE_SUPABASE_URL` &
  `VITE_SUPABASE_ANON_KEY`.
- Jika **terisi** → data peserta (hadir/ujian/sertifikat) ditulis ke Supabase,
  dan halaman **Admin membaca dari Supabase** (semua peserta, semua perangkat).
  Company Settings juga tersimpan terpusat.
- Jika **kosong** → fallback ke localStorage (mode 1 perangkat).

## Langkah 1 — Buat tabel di Supabase (WAJIB)

Menghubungkan Supabase di bolt hanya menyediakan kredensial; **tabelnya belum
tentu terbuat**. Buat tabel dengan menjalankan skema:

1. Buka **Supabase Dashboard** → project Anda → menu **SQL Editor** → **New query**.
2. Buka file [`supabase/schema.sql`](supabase/schema.sql) di repo ini, **salin
   seluruh isinya**, tempel ke SQL Editor.
3. Klik **Run**. (Skrip aman dijalankan ulang.)

Ini membuat 14 tabel + RLS + helper + seed (8 jabatan & baris Company Settings),
termasuk penyesuaian `0007` agar aplikasi (tanpa login Supabase) boleh menulis.

## Langkah 2 — Pastikan environment variables terisi

Di **bolt**: fitur *Connect Supabase* biasanya otomatis mengisi `.env`. Pastikan
ada dua baris ini (lihat contoh di `.env.example`):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...   (anon public key)
```

Nilainya diambil dari **Supabase Dashboard → Project Settings → API**
(*Project URL* dan *anon public* key).

> Setelah `.env` berubah, restart dev server bolt (Vite membaca env saat start).

## Langkah 3 — Uji

1. Buka aplikasi, jalankan alur peserta: Materi → Daftar Hadir → Ujian.
2. Cek di **Supabase → Table Editor** → tabel `attendance`, `quiz_result`,
   `certificates` harus terisi.
3. Login admin (`adminLMS` / `lms123`) → **Daftar Hadir / Peserta** menampilkan
   data tsb. Coba dari perangkat/browser lain → data yang sama tetap tampil.

## Catatan keamanan (penting)

Karena login admin masih **sisi klien** (bukan Supabase Auth), migrasi `0007`
melonggarkan RLS agar peran `anon` boleh menulis (isi hadir, simpan ujian,
terbitkan sertifikat, simpan Company Settings). Artinya siapa pun yang memiliki
anon key secara teknis bisa menulis ke tabel tsb. Ini **cukup untuk training
internal**, tetapi bukan keamanan tingkat produksi.

Untuk keamanan sesungguhnya (langkah lanjutan, opsional):
- Pindahkan login admin ke **Supabase Auth**, lalu kembalikan kebijakan RLS
  admin ke `is_admin()` (lihat `supabase/migrations/0006_rls_policies.sql`).
- Pindahkan penilaian ujian & penerbitan sertifikat ke **RPC SECURITY DEFINER**.

Beri tahu saya bila ingin lanjut ke tahap keamanan ini.
