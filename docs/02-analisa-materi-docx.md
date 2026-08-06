# 02 — Analisa Struktur Materi DOCX

Analisa file `Training_Foodhandler_Khusus.docx`. Tujuan: memahami struktur materi agar dapat dinormalisasi menjadi model konten yang **reusable** (dapat diganti untuk training lain) dan di-render sebagai **e-book**.

## 1. Ikhtisar Dokumen

- **Judul materi:** Training Food Handler (Food Safety).
- **Struktur:** 18 bab (BAB I – BAB XVIII) + bagian **PENUTUP**.
- **Pola konten:** setiap bab diawali judul (`BAB X` + JUDUL), diikuti paragraf penjelas, daftar poin (bullet), serta beberapa blok khusus (checklist ✔/✘, tabel suhu, studi kasus Temuan/Risiko/Pengendalian).

## 2. Daftar Bab (Table of Contents)

| Bab | Judul | Jenis Konten Utama |
|-----|-------|--------------------|
| I | Pendahuluan | Tujuan training (list) |
| II | Apa Itu Food Safety | Definisi + tujuan (list) |
| III | Foodborne Disease | Definisi + gejala + penyebab (list) |
| IV | Jenis Kontaminasi | 3 sub: Fisik, Kimia, Biologi (list) |
| V | Sumber Kontaminasi | List sumber |
| VI | Personal Hygiene | Checklist wajib (✔) & larangan (✘) |
| VII | Five Keys to Safer Food | 5 prinsip (list) |
| VIII | Cross Contamination | Definisi + pencegahan (list) |
| IX | CCP (Critical Control Point) | Definisi + contoh per tahap (Receiving→Serving) dgn suhu |
| X | Temperature Danger Zone | Zona bahaya suhu + suhu aman (data suhu) |
| XI | Thawing yang Benar | Checklist ✔/✘ |
| XII | Penyimpanan Makanan Matang | Aturan waktu (0–2 / 2–4 / >4 jam) |
| XIII | Penerimaan Bahan Makanan | Checklist ✔ |
| XIV | Clean As You Go | Prinsip kerja (list) |
| XV | Tanggung Jawab Food Handler | Kewajiban (list) |
| XVI | Studi Kasus & Temuan | 10 temuan (Temuan/Risiko/Pengendalian) |
| XVII | Ringkasan Materi (Key Takeaways) | 6 poin ringkasan |
| XVIII | Komitmen Food Handler | Pernyataan komitmen (✅) |
| — | Penutup | Paragraf penutup + tagline |

## 3. Komponen Konten (Content Blocks)

Materi dipetakan ke **tipe blok** ternormalisasi. Tipe inilah yang dijadikan model data & komponen render (lihat mapping ke UI PRD: Highlight/Warning/Best Practice Box).

| Tipe Blok | Contoh di Materi | Rendering (mapping PRD) |
|-----------|------------------|-------------------------|
| `heading` | "BAB IX — CCP" | Judul bab / sub-bab (accordion header) |
| `paragraph` | Definisi Food Safety | Teks biasa |
| `list_bullet` | Gejala foodborne disease | Bullet list |
| `list_check` | ✔ Mencuci tangan, ✘ Memakai cincin | **Best Practice Box** (✔) / **Warning Box** (✘) |
| `temperature` | Frozen ≤ -18°C, Chiller 1–4°C, Cooking ≥75°C | **Highlight Box** (nilai suhu ditonjolkan) |
| `case_finding` | Temuan / Risiko / Pengendalian (Bab XVI) | Kartu studi kasus (3 kolom/label) |
| `commitment` | ✅ Pernyataan komitmen | Highlight/callout box |
| `quote` | Tagline penutup | Blockquote |

### Mapping ke "Box" pada PRD
- **Highlight Box** → data penting/angka (suhu, batas waktu, nilai kritis).
- **Warning Box** → larangan (✘) & risiko.
- **Best Practice Box** → tindakan benar (✔) & pengendalian.

## 4. Data Kritis (Angka & Suhu) — untuk Highlight Box & Bank Soal

| Parameter | Nilai (sesuai materi) |
|-----------|------------------------|
| Temperature Danger Zone | 5°C – 60°C |
| Frozen / Freezer | ≤ -18°C |
| Chiller | 1–4°C dan 5–10°C |
| Dry Storage | 18–25°C |
| Cooking (suhu inti) | minimal 75°C |
| Hot Holding | ≥ 60°C (aman ≥65°C) |
| Cold Holding | ≤ 5°C |
| Penyimpanan matang | 0–2 jam aman; 2–4 jam segera dikonsumsi; >4 jam dibuang |

> Catatan: materi memuat beberapa penyebutan rentang suhu yang sedikit berbeda (mis. Hot Holding ≥60°C vs ≥65°C, Chiller 0–4 vs 1–4 vs 5–10). Nilai **ditampilkan apa adanya** sesuai dokumen; untuk bank soal, jawaban mengacu pada nilai yang dominan/eksplisit disebut pada bab terkait.

## 5. Relevansi ke Bank Soal (≥30 soal)

Contoh soal pada PRD selaras dengan materi. Pemetaan topik → sumber bab:

| Topik Soal | Bab Sumber |
|------------|-----------|
| APD / Personal Hygiene / hairnet / kuku / grooming | VI, XVI |
| Cuci tangan | VI, XVI |
| Kebersihan & sanitasi area | XIV, XV |
| Plastic curtain / insect killer / pengendalian hama | XIV (pengendalian hama) |
| Pisah mentah–matang / Cross Contamination | VII, VIII, XVI |
| CCP & pentingnya | IX |
| Temperature Danger Zone & suhu (freezer/chiller/holding/cooking) | IX, X |
| Thermometer | IX, XVI |
| FIFO / FEFO | XVI |
| Penyimpanan suhu benar | IX, X, XII |
| Bahan kimia tidak boleh bercampur | IV, XVI |
| Tidak bekerja saat sakit | VI, XV, XVI |
| Dokumentasi monitoring | XVI |

## 6. Model Normalisasi Materi (untuk Reusability)

Agar aplikasi reusable, DOCX diproses menjadi struktur berjenjang:

```
Material (1 training)
└── Chapter (BAB)         { order, code: "I", title }
    └── Block             { order, type, payload }
        - heading | paragraph | list_bullet | list_check
        - temperature | case_finding | commitment | quote
```

Konsekuensi desain (dirinci di [05](05-database-design.md) & [09](09-technical-specification.md)):
- Materi disimpan sebagai data terstruktur (chapter + block), **bukan** file DOCX mentah.
- Proses ingest: DOCX → parser → JSON block → seed ke tabel `material_chapters` / `material_blocks`.
- Mengganti training = mengganti isi tabel materi + Company Settings, **tanpa** ubah kode.

## 7. Kesimpulan

Struktur materi konsisten dan berpola (heading → paragraf → list → box), sehingga sangat cocok dimodelkan sebagai *chapter/block* generik. Model ini memenuhi 3 tuntutan PRD sekaligus: **tampil apa adanya**, **e-book dengan box/accordion/search/bookmark**, dan **reusable** untuk training lain.
