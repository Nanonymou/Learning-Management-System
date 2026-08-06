import { useNavigate } from 'react-router-dom';
import { Award, Eye } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/Skeleton';
import { formatDate } from '@/lib/utils/format';
import { useAsync } from '@/lib/hooks/useAsync';
import { getAllCertificates } from '../admin.service';

export default function ManageSertifikatPage() {
  const navigate = useNavigate();
  const { data, loading } = useAsync(getAllCertificates, []);
  const certificates = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Sertifikat" description="Seluruh sertifikat yang telah diterbitkan." />

      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : certificates.length === 0 ? (
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
                    <th className="p-3 font-medium">Aksi</th>
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
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => navigate(`/sertifikat/${c.id}`)}
                          title="Lihat & unduh sertifikat"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
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
