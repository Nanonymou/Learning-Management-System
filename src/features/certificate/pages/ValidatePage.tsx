import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldX, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils/format';
import { useAsync } from '@/lib/hooks/useAsync';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { fetchCertificateByNumber } from '@/lib/supabase/sync';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';
import { getCertificateByNumber } from '../certificate.service';
import { ROUTES } from '@/config/routes';

/** Halaman validasi publik (dituju oleh QR code sertifikat). */
export default function ValidatePage() {
  const { certNumber = '' } = useParams();
  const { settings } = useCompanySettings();
  const number = decodeURIComponent(certNumber);

  // Utamakan Supabase (validasi lintas perangkat); fallback ke lokal.
  const { data: cert } = useAsync(async () => {
    if (isSupabaseConfigured) {
      const remote = await fetchCertificateByNumber(number);
      if (remote) return remote;
    }
    return getCertificateByNumber(number) ?? null;
  }, [number]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-5 p-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
            <GraduationCap className="h-5 w-5 text-primary" />
            {settings.companyName || 'Validasi Sertifikat'}
          </div>

          {cert ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
                  <ShieldCheck className="h-8 w-8 text-success" />
                </div>
                <Badge tone="success">SERTIFIKAT VALID</Badge>
              </div>
              <dl className="space-y-2 text-left text-sm">
                <Row label="Nama" value={cert.participantName} />
                <Row label="Training" value={cert.trainingName} />
                <Row label="Jabatan" value={cert.positionName} />
                <Row label="Lokasi" value={cert.locationName} />
                <Row label="Nilai" value={String(cert.score)} />
                <Row label="Nomor" value={cert.certificateNumber} />
                <Row label="Tanggal" value={formatDate(cert.issuedDate)} />
              </dl>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/15">
                <ShieldX className="h-8 w-8 text-danger" />
              </div>
              <Badge tone="danger">TIDAK VALID</Badge>
              <p className="text-sm text-muted-foreground">
                Nomor sertifikat “{number}” tidak ditemukan.
              </p>
            </div>
          )}

          <Link to={ROUTES.dashboard} className="inline-block text-sm text-primary underline">
            Ke Beranda
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-1.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
