import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, XCircle, Award, Settings, Database, MapPin, Briefcase, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { BarList } from '@/components/charts/BarList';
import { getDashboardStats } from '@/features/dashboard/stats.service';
import { questionBankSize } from '@/features/quiz/quiz.service';
import { ROUTES } from '@/config/routes';

const LINKS = [
  { to: ROUTES.adminPeserta, label: 'Kelola Peserta', icon: Users },
  { to: ROUTES.adminBankSoal, label: 'Bank Soal', icon: Database },
  { to: ROUTES.adminJabatan, label: 'Kelola Jabatan', icon: Briefcase },
  { to: ROUTES.adminLokasi, label: 'Kelola Lokasi', icon: MapPin },
  { to: ROUTES.adminSertifikat, label: 'Sertifikat', icon: Award },
  { to: ROUTES.adminCompanySettings, label: 'Company Settings', icon: Settings },
  { to: ROUTES.adminExport, label: 'Export Data', icon: FileSpreadsheet },
];

export default function AdminDashboardPage() {
  const stats = useMemo(() => getDashboardStats(), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Admin" description="Kelola data & pantau statistik training." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Peserta" value={stats.totalParticipants} />
        <StatCard icon={GraduationCap} label="Lulus" value={stats.totalPassed} tone="success" />
        <StatCard icon={XCircle} label="Tidak Lulus" value={stats.totalFailed} tone="danger" />
        <StatCard icon={Award} label="Sertifikat" value={stats.totalCertificates} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Peserta per Lokasi</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={stats.byLocation} emptyText="Belum ada data." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Peserta per Jabatan</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={stats.byPosition} emptyText="Belum ada data." />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manajemen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
            >
              <l.icon className="h-5 w-5 text-primary" />
              <span className="flex-1 text-sm font-medium">{l.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Bank soal aktif: {questionBankSize()} soal.
      </p>
    </div>
  );
}
