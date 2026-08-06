import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatDate } from '@/lib/utils/format';
import { getCurrentUser } from '@/features/participant/participant.service';
import { certificatesForUser } from '../certificate.service';
import { ROUTES } from '@/config/routes';

export default function CertificateListPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const certificates = useMemo(
    () => (user ? certificatesForUser(user.id) : []),
    [user],
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Sertifikat" description="Sertifikat kelulusan Anda." />

      {certificates.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Award}
              title="Belum ada sertifikat"
              description="Sertifikat muncul otomatis setelah Anda lulus ujian (nilai ≥ 80)."
              action={<Button onClick={() => navigate(ROUTES.ujian)}>Ke Ujian</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {certificates.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => navigate(`/sertifikat/${c.id}`)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/15 text-warning">
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{c.trainingName}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.certificateNumber} • {formatDate(c.issuedDate)} • Nilai {c.score}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
