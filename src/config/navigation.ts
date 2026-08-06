import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  FileQuestion,
  Award,
  History,
  Settings,
  Users,
  MapPin,
  Briefcase,
  FileSpreadsheet,
  Database,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** true jika path harus cocok persis (mis. root "/") */
  end?: boolean;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

/**
 * Struktur menu sidebar — data-driven agar mudah ditambah/diubah.
 * Sesuai menu pada PRD. Menu selain Company Settings masih placeholder
 * (halaman "coming soon") karena fitur dibuat bertahap.
 */
export const NAVIGATION: NavGroup[] = [
  {
    title: 'Menu',
    items: [
      { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard, end: true },
      { label: 'Materi', to: ROUTES.materi, icon: BookOpen },
      { label: 'Daftar Hadir', to: ROUTES.daftarHadir, icon: ClipboardCheck },
      { label: 'Ujian', to: ROUTES.ujian, icon: FileQuestion },
      { label: 'Sertifikat', to: ROUTES.sertifikat, icon: Award },
      { label: 'Riwayat Training', to: ROUTES.riwayat, icon: History },
    ],
  },
  {
    title: 'Admin',
    items: [
      { label: 'Company Settings', to: ROUTES.adminCompanySettings, icon: Settings },
      { label: 'Peserta', to: ROUTES.adminPeserta, icon: Users },
      { label: 'Bank Soal', to: ROUTES.adminBankSoal, icon: Database },
      { label: 'Lokasi', to: ROUTES.adminLokasi, icon: MapPin },
      { label: 'Jabatan', to: ROUTES.adminJabatan, icon: Briefcase },
      { label: 'Export', to: ROUTES.adminExport, icon: FileSpreadsheet },
    ],
  },
];
