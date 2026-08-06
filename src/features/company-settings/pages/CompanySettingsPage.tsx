import { PageHeader } from '@/components/ui/PageHeader';
import { CompanySettingsForm } from '../components/CompanySettingsForm';

export default function CompanySettingsPage() {
  return (
    <div>
      <PageHeader
        title="Company Settings"
        description="Kelola identitas perusahaan, training, dan desain sertifikat. Semua halaman mengambil data dari sini."
      />
      <CompanySettingsForm />
    </div>
  );
}
