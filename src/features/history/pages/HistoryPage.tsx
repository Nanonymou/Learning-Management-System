import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Award } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { formatDateTime } from '@/lib/utils/format';
import { getCurrentUser } from '@/features/participant/participant.service';
import { resultsForUser } from '@/features/quiz/quiz.service';
import { certificatesForUser } from '@/features/certificate/certificate.service';
import { ROUTES } from '@/config/routes';

export default function HistoryPage() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const results = useMemo(() => (user ? resultsForUser(user.id) : []), [user]);
  const certs = useMemo(() => (user ? certificatesForUser(user.id) : []), [user]);

  return (
    <div className="space-y-6">
      <PageHeader title="Riwayat Training" description="Training yang pernah Anda ikuti." />

      {results.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={History}
              title="Belum ada riwayat"
              description="Riwayat ujian & sertifikat akan tampil di sini."
              action={<Button onClick={() => navigate(ROUTES.materi)}>Mulai Training</Button>}
            />
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2">
          {results.map((r) => {
            const cert = certs.find((c) => c.quizResultId === r.id);
            return (
              <li key={r.id}>
                <Card>
                  <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-medium">
                        Percobaan ke-{r.attemptNo} • Nilai {r.score}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(r.finishedAt)} • Benar {r.correctCount}/{r.totalQuestions}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={r.status === 'lulus' ? 'success' : 'danger'}>
                        {r.status === 'lulus' ? 'Lulus' : 'Tidak Lulus'}
                      </Badge>
                      {cert && (
                        <Badge tone="primary">
                          <Award className="h-3.5 w-3.5" /> Bersertifikat
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
