import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/feedback/Skeleton';
import NotFoundPage from '@/components/common/NotFoundPage';
import { ROUTES } from '@/config/routes';

/**
 * Rute aplikasi dengan code-splitting (React.lazy) agar bundle awal ringan —
 * modul berat (PDF/QR pada sertifikat, ujian, admin) dimuat saat dibutuhkan.
 * Halaman validasi sertifikat berdiri sendiri (diakses publik via QR).
 */

// Peserta
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const MateriPage = lazy(() => import('@/features/material/pages/MateriPage'));
const ChapterPage = lazy(() => import('@/features/material/pages/ChapterPage'));
const AttendancePage = lazy(() => import('@/features/attendance/pages/AttendancePage'));
const ExamPage = lazy(() => import('@/features/quiz/pages/ExamPage'));
const ResultPage = lazy(() => import('@/features/quiz/pages/ResultPage'));
const CertificateListPage = lazy(() => import('@/features/certificate/pages/CertificateListPage'));
const CertificateDetailPage = lazy(() => import('@/features/certificate/pages/CertificateDetailPage'));
const ValidatePage = lazy(() => import('@/features/certificate/pages/ValidatePage'));
const HistoryPage = lazy(() => import('@/features/history/pages/HistoryPage'));

// Company Settings & Admin
const CompanySettingsPage = lazy(() => import('@/features/company-settings/pages/CompanySettingsPage'));
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const ManagePesertaPage = lazy(() => import('@/features/admin/pages/ManagePesertaPage'));
const ManageJabatanPage = lazy(() => import('@/features/admin/pages/ManageJabatanPage'));
const ManageLokasiPage = lazy(() => import('@/features/admin/pages/ManageLokasiPage'));
const ManageBankSoalPage = lazy(() => import('@/features/admin/pages/ManageBankSoalPage'));
const ManageSertifikatPage = lazy(() => import('@/features/admin/pages/ManageSertifikatPage'));
const ExportPage = lazy(() => import('@/features/admin/pages/ExportPage'));

function Lazy({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Peserta
      { path: ROUTES.dashboard, element: <Lazy><DashboardPage /></Lazy> },
      { path: ROUTES.materi, element: <Lazy><MateriPage /></Lazy> },
      { path: '/materi/:chapterId', element: <Lazy><ChapterPage /></Lazy> },
      { path: ROUTES.daftarHadir, element: <Lazy><AttendancePage /></Lazy> },
      { path: ROUTES.ujian, element: <Lazy><ExamPage /></Lazy> },
      { path: '/ujian/hasil/:resultId', element: <Lazy><ResultPage /></Lazy> },
      { path: ROUTES.sertifikat, element: <Lazy><CertificateListPage /></Lazy> },
      { path: '/sertifikat/:certId', element: <Lazy><CertificateDetailPage /></Lazy> },
      { path: ROUTES.riwayat, element: <Lazy><HistoryPage /></Lazy> },

      // Admin
      { path: ROUTES.admin, element: <Lazy><AdminDashboardPage /></Lazy> },
      { path: ROUTES.adminCompanySettings, element: <Lazy><CompanySettingsPage /></Lazy> },
      { path: ROUTES.adminPeserta, element: <Lazy><ManagePesertaPage /></Lazy> },
      { path: ROUTES.adminBankSoal, element: <Lazy><ManageBankSoalPage /></Lazy> },
      { path: ROUTES.adminJabatan, element: <Lazy><ManageJabatanPage /></Lazy> },
      { path: ROUTES.adminLokasi, element: <Lazy><ManageLokasiPage /></Lazy> },
      { path: ROUTES.adminSertifikat, element: <Lazy><ManageSertifikatPage /></Lazy> },
      { path: ROUTES.adminExport, element: <Lazy><ExportPage /></Lazy> },
    ],
  },

  // Publik (tanpa shell)
  { path: '/validasi/:certNumber', element: <Lazy><ValidatePage /></Lazy> },
  { path: '*', element: <NotFoundPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
