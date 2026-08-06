import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/providers/ToastProvider';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';
import { getCertificate } from '../certificate.service';
import { CertificatePreview } from '../components/CertificatePreview';
import { downloadCertificatePdf } from '../certificatePdf';
import { ROUTES } from '@/config/routes';

export default function CertificateDetailPage() {
  const { certId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useCompanySettings();
  const cert = useMemo(() => getCertificate(certId), [certId]);
  const [downloading, setDownloading] = useState(false);

  if (!cert) {
    return (
      <div className="space-y-4">
        <PageHeader title="Sertifikat tidak ditemukan" />
        <Button onClick={() => navigate(ROUTES.sertifikat)}>Kembali</Button>
      </div>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadCertificatePdf(cert, settings);
      toast('Sertifikat PDF diunduh.', 'success');
    } catch {
      toast('Gagal membuat PDF.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(ROUTES.sertifikat)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Daftar Sertifikat
      </button>

      <PageHeader
        title="Sertifikat"
        description={cert.certificateNumber}
        actions={
          <Button onClick={handleDownload} disabled={downloading}>
            <Download className="h-4 w-4" /> {downloading ? 'Menyiapkan…' : 'Download PDF'}
          </Button>
        }
      />

      <CertificatePreview cert={cert} settings={settings} />
    </div>
  );
}
