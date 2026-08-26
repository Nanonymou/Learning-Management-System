# CLAUDE.md — Universal Web App Guidelines

> Panduan lintas-proyek untuk semua web app. Berlaku default di setiap proyek.
> **Warna & brand tidak dikunci di sini** — nilai palet ditentukan per proyek lewat prompt, CLI, atau file `PROJECT.md` lokal. File ini mengatur *cara* mengeksekusi UI & animasi, bukan *apa* warnanya.

---

## 0. Prinsip inti

- **Kualitas floor, bukan ceiling.** Setiap UI wajib: responsif sampai mobile, focus keyboard terlihat, `prefers-reduced-motion` dihormati, kontras teks lolos WCAG AA. Ini minimum, bukan target.
- **Hindari tampilan "AI-generated default".** Jangan otomatis jatuh ke pola generik. Tiga default yang harus dihindari kecuali brief memang memintanya:
  1. Background cream (~#F4F1EA) + serif kontras tinggi + aksen terracotta/clay (~#D97757).
  2. Background near-black + satu aksen acid-green atau vermilion.
  3. Layout broadsheet: hairline rules, border-radius 0, kolom padat seperti koran.
  Kalau brief membebaskan sebuah axis, jangan habiskan kebebasan itu untuk default di atas.
- **Setiap keputusan harus punya alasan.** Palet, tipografi, layout, dan motion diturunkan dari subjek proyek — bukan disalin dari proyek lain.
- **Spend boldness in one place.** Satu elemen signature yang diingat orang; sisanya tenang dan disiplin. Sebelum selesai, "lepas satu aksesori" — buang dekorasi yang tidak melayani brief.

---

## 1. Warna (fleksibel — ditentukan per proyek)

- **Jangan pernah hardcode nilai hex** di komponen. Semua warna lewat design token (CSS custom properties atau konfigurasi Tailwind theme).
- Struktur token yang diharapkan (nilainya diisi per proyek):
  ```css
  :root {
    --bg, --surface, --surface-elevated;
    --text, --text-muted, --text-subtle;
    --primary, --primary-hover, --primary-contrast;
    --accent, --accent-hover;
    --border, --ring;
    --success, --warning, --danger, --info;
  }
  ```
- Ketika palet belum diberikan: **tanya atau tunggu input** palet dari prompt/CLI sebelum menetapkan warna. Jangan mengarang palet default sendiri. Boleh usulkan opsi, tapi jangan commit tanpa konfirmasi.
- Selalu sediakan **light & dark** menggunakan token yang sama; jangan bikin dua set warna terpisah.
- Semua pasangan teks/background wajib dicek kontras (target AA: 4.5:1 teks normal, 3:1 teks besar/ikon).

---

## 2. Tipografi

- **Tipografi membawa kepribadian halaman** — bukan sekadar pengantar konten netral.
- Tetapkan minimal 2 peran typeface: **display** (karakterful, dipakai dengan restraint) + **body** (nyaman dibaca). Tambah **utility/mono** untuk data/caption jika perlu.
- Definisikan type scale eksplisit (mis. modular scale), dengan weight, width, dan spacing yang disengaja. Jangan pakai default browser.
- Nama typeface spesifik ditentukan per proyek. Kalau belum ditentukan, usulkan pairing yang cocok dengan subjek — jangan default ke pasangan yang sama untuk setiap proyek.
- Sentence case untuk UI (bukan Title Case di tombol/label), kecuali brand meminta lain.

---

## 3. Layout & struktur

- **Struktur adalah informasi.** Numbering (01/02/03), eyebrow, divider, label hanya dipakai kalau benar-benar meng-encode sesuatu (urutan nyata, timeline). Jangan jadi dekorasi.
- Hero = thesis. Buka dengan hal paling khas dari subjek (headline, visual, animasi, demo interaktif) — bukan otomatis "angka besar + label kecil + gradient".
- Spacing pakai skala konsisten (mis. kelipatan 4px). Jangan angka acak.
- Hati-hati specificity CSS: hindari selector yang saling membatalkan (mis. `.section` vs `.cta` pada padding/margin antar-section).
- Mobile-first. Uji breakpoint kecil dulu, lalu naik.

---

## 4. Animasi & motion

> Toolkit standar: **GSAP + ScrollTrigger**, **Framer Motion / Motion**, **Three.js / React Three Fiber** untuk 3D/WebGL, **Lottie** untuk vektor ringan. Semua plugin GSAP kini gratis — SplitText, MorphSVG, DrawSVG boleh dipakai.

### Filosofi
- **Motion melayani subjek, bukan menghias.** Satu momen ter-orkestrasi (page-load sequence, scroll reveal berurutan) biasanya lebih kuat daripada banyak efek tersebar.
- **Less is more.** Animasi berlebihan justru membuat desain terasa AI-generated. Ragu? Kurangi.
- **Wajib** hormati `prefers-reduced-motion: reduce` — sediakan versi statis/minimal untuk setiap animasi non-esensial.

### Standar teknis
- Target 60fps. Animasikan hanya `transform` dan `opacity` untuk hal yang sering bergerak; hindari menganimasikan `width/height/top/left` (memicu layout/reflow).
- Gunakan `will-change` hemat dan hanya saat perlu; lepas setelah animasi selesai.
- Easing bermakna: default ke ease-out untuk masuk, ease-in untuk keluar. Hindari linear kecuali untuk loop ambient/scroll-scrub.
- Durasi micro-interaction 120–260ms; transisi seksi/halaman 300–600ms. Konsisten lintas komponen.
- GSAP: `gsap.registerPlugin(ScrollTrigger)` dipanggil sekali sebelum dipakai; bersihkan ScrollTrigger saat unmount (React).
- Framer Motion: gunakan `variants` + `AnimatePresence`; bungkus dengan cek reduced-motion (`useReducedMotion`).

### Pola yang disukai (default berkualitas)
- **Kartu/list:** stagger reveal saat masuk viewport, hover lift halus (translateY kecil + shadow), tap feedback.
- **Hero:** satu momen bermakna — text reveal (SplitText), ambient gradient/shader ringan, atau elemen interaktif yang merespons pointer/scroll.
- **Transisi state:** perubahan (loading→loaded, tab switch, ganti bahasa) dianimasikan halus, tidak "meloncat".
- **Scroll:** parallax/scrub secukupnya; jangan setiap elemen bergerak saat scroll.

### Interaktivitas (yang bikin terasa "hidup")
- Elemen merespons aksi user (hover, focus, drag, scroll, pointer) — ini pembeda web app premium dari sekadar video/gambar bergerak.
- Semua elemen interaktif punya state jelas: default, hover, focus-visible, active, disabled, loading.

---

## 5. Komponen & sistem

- Utamakan komponen yang bisa dipakai ulang; jangan duplikasi. Cek komponen yang ada sebelum bikin baru.
- Kalau proyek pakai **shadcn/ui**: pakai komponennya, styling lewat token, jangan hardcode warna.
- Kalau ada **Figma** + Code Connect: petakan komponen desain ke komponen kode yang sudah ada, jangan bikin duplikat.
- Ikon: konsisten satu set per proyek (mis. lucide). Jangan campur banyak icon library.
- State kosong (empty state) = ajakan bertindak, bukan sekadar "No data". Error = jelaskan apa yang salah + cara memperbaiki, dengan suara interface (tidak minta maaf, tidak vague).

---

## 6. Copy / microcopy

- Kata dalam UI = material desain, bukan hiasan. Tulis dari sisi pengguna, bukan dari cara sistem dibangun ("Kelola notifikasi", bukan "Konfigurasi webhook").
- Active voice. Tombol menyebut aksinya persis ("Simpan perubahan", bukan "Kirim"). Nama aksi konsisten sepanjang flow (tombol "Publikasikan" → toast "Dipublikasikan").
- Sentence case, tanpa filler. Setiap elemen satu tugas: label melabeli, contoh mendemokan.

---

## 7. Verifikasi visual (Playwright MCP)

Setelah mengubah UI, **verifikasi secara visual, jangan menebak**:
1. Pastikan dev server jalan (mis. Vite di `localhost:5173`).
2. Buka lewat Playwright, ambil screenshot halaman yang diubah.
3. Periksa: layout tidak rusak, animasi jalan, responsif di viewport kecil, focus terlihat, kontras cukup.
4. Iterasi berdasarkan screenshot. "A picture is worth 1000 tokens."
5. Cek juga versi `prefers-reduced-motion` aktif.

Hemat token: matikan MCP yang tidak dipakai (`/mcp disable <name>`), aktifkan lagi saat verifikasi.

---

## 8. Alur kerja default per tugas UI

1. **Pahami subjek & brief.** Kalau brief tidak jelas, tetapkan: subjek konkret, audiens, dan satu tujuan halaman. Nyatakan asumsinya.
2. **Rencana singkat (token system):** palet (4–6 hex bernama — tunggu/tanya kalau belum ada), tipografi (2+ peran), konsep layout, dan **satu elemen signature**.
3. **Kritik rencana** terhadap brief: bagian mana yang terasa default generik? Revisi, sebutkan apa yang diubah dan kenapa.
4. **Build** mengikuti rencana yang sudah direvisi. Turunkan semua warna/tipe dari token.
5. **Kritik lagi** sambil membangun. Ambil screenshot (Playwright). Buang satu dekorasi berlebih.
6. **Verifikasi** kualitas floor (responsif, focus, reduced-motion, kontras) sebelum menyerahkan.

---

## 9. Yang harus dihindari

- Hardcode warna hex di komponen.
- Palet/typeface default yang sama untuk setiap proyek tanpa alasan.
- Animasi bertebaran tanpa maksud; menganimasikan properti yang memicu reflow.
- Numbering/eyebrow/divider sebagai dekorasi tanpa makna.
- Menganggap tugas UI selesai tanpa verifikasi visual.
- Empty/error state yang malas ("No data", "Something went wrong").
