import { BookOpen, ClipboardCheck, FileQuestion, Award } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';

const TIMELINE = [
  { icon: BookOpen, label: 'Membaca Materi' },
  { icon: ClipboardCheck, label: 'Mengisi Daftar Hadir' },
  { icon: FileQuestion, label: 'Mengerjakan Ujian' },
  { icon: Award, label: 'Lulus & Mendapat Sertifikat' },
];

export default function DashboardPage() {
  const { settings } = useCompanySettings();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={
          settings.trainingName
            ? `Selamat datang di ${settings.trainingName}.`
            : 'Ringkasan pelatihan.'
        }
      />

      {/* Banner training (identitas dari Company Settings) */}
      <Card className="mb-6 overflow-hidden">
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

      {/* Timeline langkah training */}
      <Card>
        <CardHeader>
          <CardTitle>Alur Training</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((step, i) => (
              <li
                key={step.label}
                className="flex items-center gap-3 rounded-md border border-border p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <step.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Langkah {i + 1}</p>
                  <p className="text-sm font-medium">{step.label}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">
            Statistik & grafik akan ditambahkan pada tahap pengembangan berikutnya.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
