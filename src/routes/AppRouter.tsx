import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ComingSoon } from '@/components/common/ComingSoon';
import NotFoundPage from '@/components/common/NotFoundPage';
import DashboardPage from '@/features/dashboard/pages/DashboardPage';
import CompanySettingsPage from '@/features/company-settings/pages/CompanySettingsPage';
import { ROUTES } from '@/config/routes';

/**
 * Konfigurasi rute aplikasi.
 *
 * Fitur yang belum dikembangkan memakai placeholder <ComingSoon /> agar
 * struktur navigasi lengkap namun scalable. Saat fitur dibuat, cukup ganti
 * elemen-nya dengan komponen halaman terkait.
 */
const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.dashboard, element: <DashboardPage /> },

      // Area peserta (placeholder — tahap berikutnya)
      {
        path: ROUTES.materi,
        element: <ComingSoon title="Materi" description="E-book materi training." milestone="Milestone 4" />,
      },
      {
        path: ROUTES.daftarHadir,
        element: <ComingSoon title="Daftar Hadir" description="Form kehadiran peserta." milestone="Milestone 5" />,
      },
      {
        path: ROUTES.ujian,
        element: <ComingSoon title="Ujian" description="Ujian berbasis bank soal." milestone="Milestone 7" />,
      },
      {
        path: ROUTES.sertifikat,
        element: <ComingSoon title="Sertifikat" description="Sertifikat kelulusan." milestone="Milestone 9" />,
      },
      {
        path: ROUTES.riwayat,
        element: <ComingSoon title="Riwayat Training" description="Riwayat pelatihan peserta." milestone="Milestone 10" />,
      },

      // Area admin
      { path: ROUTES.adminCompanySettings, element: <CompanySettingsPage /> },
      {
        path: ROUTES.adminPeserta,
        element: <ComingSoon title="Kelola Peserta" description="Manajemen data peserta." milestone="Milestone 12" />,
      },
      {
        path: ROUTES.adminBankSoal,
        element: <ComingSoon title="Bank Soal" description="Manajemen bank soal." milestone="Milestone 6" />,
      },
      {
        path: ROUTES.adminLokasi,
        element: <ComingSoon title="Kelola Lokasi" description="Manajemen master lokasi." milestone="Milestone 12" />,
      },
      {
        path: ROUTES.adminJabatan,
        element: <ComingSoon title="Kelola Jabatan" description="Manajemen master jabatan." milestone="Milestone 12" />,
      },
      {
        path: ROUTES.adminExport,
        element: <ComingSoon title="Export" description="Export data Excel/PDF." milestone="Milestone 13" />,
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
