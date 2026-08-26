import { useMemo } from 'react';
import { Users, GraduationCap, XCircle, Award, UserPlus } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarList } from '@/components/charts/BarList';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';
import { useTrainingFlow } from '@/features/training/useTrainingFlow';
import { TrainingTimeline } from '@/features/training/TrainingTimeline';
import { startNewParticipant } from '@/features/participant/participant.service';
import { getDashboardStats } from '../stats.service';

export default function DashboardPage() {
  const { settings } = useCompanySettings();
  const flow = useTrainingFlow();
  const stats = useMemo(() => getDashboardStats(), []);

  const handleNewParticipant = () => {
    startNewParticipant();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={
          settings.trainingName
            ? `Ringkasan pelatihan ${settings.trainingName}.`
            : 'Ringkasan pelatihan.'
        }
        actions={
          <Button variant="outline" size="sm" onClick={handleNewParticipant}>
            <UserPlus className="h-4 w-4" /> Peserta Baru
          </Button>
        }
      />

      {/* Banner training */}
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col gap-2 bg-gradient-to-r from-primary/10 to-accent p-6">
          <h3 className="text-xl font-semibold">
            {settings.trainingName || 'Nama Training'}
          </h3>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {settings.trainingDescription ||
              'Deskripsi training akan tampil di sini setelah diisi pada Company Settings.'}
          </p>
        </CardContent>
      </Card>

      {/* Statistik */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Peserta" value={stats.totalParticipants} />
        <StatCard icon={GraduationCap} label="Total Lulus" value={stats.totalPassed} tone="success" />
        <StatCard icon={XCircle} label="Total Tidak Lulus" value={stats.totalFailed} tone="danger" />
        <StatCard icon={Award} label="Sertifikat Terbit" value={stats.totalCertificates} tone="warning" />
      </div>

      {/* Progress & grafik kelulusan */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Training Completion Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DonutChart value={stats.completionRate} label="peserta lulus" tone="success" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tingkat Kelulusan</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DonutChart value={stats.passRate} label="dari yang ujian" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress Materi Anda</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <DonutChart value={flow.reading.percent} label="materi dibaca" />
          </CardContent>
        </Card>
      </div>

      {/* Grafik kategori */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Peserta per Lokasi</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={stats.byLocation} emptyText="Belum ada data lokasi." />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Peserta per Jabatan</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList data={stats.byPosition} emptyText="Belum ada data jabatan." />
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Alur Training Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingTimeline flow={flow} />
        </CardContent>
      </Card>
    </div>
  );
}
