import { useMemo } from 'react';
import { Award } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { listCertificates } from '@/features/certificate/certificate.service';

export default function ManageSertifikatPage() {
  const certificates = useMemo(() => listCertificates(), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Sertifikat" description="Seluruh sertifikat yang telah diterbitkan." />

      {certificates.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={Award} title="Belum ada sertifikat diterbitkan" />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="p-3 font-medium">Nomor</th>
                    <th className="p-3 font-medium">Nama</th>
                    <th className="p-3 font-medium">Jabatan</th>
                    <th className="p-3 font-medium">Lokasi</th>
                    <th className="p-3 font-medium">Nilai</th>
                    <th className="p-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {certificates.map((c) => (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="p-3 font-mono text-xs">{c.certificateNumber}</td>
                      <td className="p-3 font-medium">{c.participantName}</td>
                      <td className="p-3">{c.positionName}</td>
                      <td className="p-3">{c.locationName}</td>
                      <td className="p-3">{c.score}</td>
                      <td className="p-3">{formatDate(c.issuedDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
