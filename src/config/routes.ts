/**
 * Definisi path terpusat. Semua rute mengacu ke sini agar konsisten
 * dan mudah di-refactor (single source of truth).
 */
export const ROUTES = {
  // Area peserta
  dashboard: '/',
  materi: '/materi',
  daftarHadir: '/daftar-hadir',
  ujian: '/ujian',
  sertifikat: '/sertifikat',
  riwayat: '/riwayat',

  // Autentikasi admin
  login: '/login',

  // Area admin (terkunci — wajib login)
  admin: '/admin',
  adminCompanySettings: '/admin/company-settings',
  adminPeserta: '/admin/peserta',
  adminDaftarHadir: '/admin/daftar-hadir',
  adminMateri: '/admin/materi',
  adminBankSoal: '/admin/bank-soal',
  adminLokasi: '/admin/lokasi',
  adminJabatan: '/admin/jabatan',
  adminSertifikat: '/admin/sertifikat',
  adminExport: '/admin/export',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
