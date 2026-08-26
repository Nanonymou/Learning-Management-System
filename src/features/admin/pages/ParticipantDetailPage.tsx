import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Award, ClipboardCheck, FileQuestion } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Skeleton } from '@/components/feedback/Skeleton';
import { formatDate, formatDateTime } from '@/lib/utils/format';
import { useAsync } from '@/lib/hooks/useAsync';
import { getParticipantDetail } from '../admin.service';
import { ROUTES } from '@/config/routes';

export default function ParticipantDetailPage() {
  const { userId = '' } = useParams();
  const navigate = useNavigate();
  const { data: detail, loading } = useAsync(() => getParticipantDetail(userId), [userId]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!detail) {
    return (
      <div className="space-y-4">
        <PageHeader title="Peserta tidak ditemukan" />
        <Button onClick={() => navigate(ROUTES.adminPeserta)}>Kembali</Button>
      </div>
    );
  }

  const { user, attendance, results, certificate } = detail;
  const latest = attendance[0];
  const pos = latest?.positionName || certificate?.positionName || '-';
  const loc = latest?.locationName || certificate?.locationName || '-';

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(ROUTES.adminPeserta)}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Kelola Peserta
      </button>

      <PageHeader
        title={user.fullName || '(tanpa nama)'}
        description={`${pos} • ${loc}`}
      />

      {/* Riwayat Kehadiran */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-5 w-5 text-primary" /> Riwayat Kehadiran
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {attendance.length === 0 ? (
            <EmptyState title="Belum ada kehadiran" />
          ) : (
            <ul className="divide-y divide-border">
              {attendance.map((a) => (
                <li key={a.id} className="flex justify-between p-4 text-sm">
                  <span>{formatDate(a.attendDate)}</span>
                  <span className="text-muted-foreground">Jam {a.attendTime}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Riwayat Ujian */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileQuestion className="h-5 w-5 text-primary" /> Riwayat Ujian
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {results.length === 0 ? (
            <EmptyState title="Belum ada ujian" />
          ) : (
            <ul className="divide-y divide-border">
              {results.map((r) => (
                <li key={r.id} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <p className="font-medium">
                      Percobaan ke-{r.attemptNo} • Nilai {r.score}
                    </p>
                    <p className="text-muted-foreground">
                      {formatDateTime(r.finishedAt)} • Benar {r.correctCount}/{r.totalQuestions}
                    </p>
                  </div>
                  <Badge tone={r.status === 'lulus' ? 'success' : 'danger'}>
                    {r.status === 'lulus' ? 'Lulus' : 'Tidak Lulus'}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Sertifikat */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="h-5 w-5 text-primary" /> Sertifikat
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificate ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium">{certificate.certificateNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {certificate.trainingName} • Nilai {certificate.score} •{' '}
                  {formatDate(certificate.issuedDate)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/admin/sertifikat/${certificate.id}`)}
              >
                Lihat Sertifikat
              </Button>
            </div>
          ) : (
            <EmptyState icon={Award} title="Belum ada sertifikat" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
