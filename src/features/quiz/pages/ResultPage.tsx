import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle, RotateCcw, Award, Check, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DonutChart } from '@/components/charts/DonutChart';
import { cn } from '@/lib/utils/cn';
import { useCompanySettings } from '@/features/company-settings/CompanySettingsProvider';
import { getReview } from '../quiz.service';
import { issueCertificate } from '@/features/certificate/certificate.service';
import { ROUTES } from '@/config/routes';

export default function ResultPage() {
  const { resultId = '' } = useParams();
  const navigate = useNavigate();
  const { settings } = useCompanySettings();
  const review = useMemo(() => getReview(resultId), [resultId]);

  // Terbitkan sertifikat otomatis bila lulus (dikelola admin).
  useEffect(() => {
    if (review?.status === 'lulus') {
      issueCertificate(review.id, settings);
    }
  }, [review, settings]);

  if (!review) {
    return (
      <div className="space-y-4">
        <PageHeader title="Hasil tidak ditemukan" />
        <Button onClick={() => navigate(ROUTES.ujian)}>Kembali ke Ujian</Button>
      </div>
    );
  }

  const passed = review.status === 'lulus';

  return (
    <div className="space-y-6">
      <PageHeader title="Hasil Ujian" description={`Percobaan ke-${review.attemptNo}`} />

      {/* Ringkasan nilai */}
      <Card>
        <CardContent className="flex flex-col items-center gap-5 p-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-5">
            <DonutChart value={review.score} label="nilai" tone={passed ? 'success' : 'primary'} />
            <div className="space-y-2">
              <Badge tone={passed ? 'success' : 'danger'}>
                {passed ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> LULUS
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5" /> TIDAK LULUS
                  </>
                )}
              </Badge>
              <div className="flex gap-4 text-sm">
                <span className="text-success">Benar: {review.correctCount}</span>
                <span className="text-danger">Salah: {review.wrongCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Nilai kelulusan minimal 80.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2">
            {passed ? (
              <>
                <Badge tone="success" className="justify-center py-1.5">
                  <Award className="h-3.5 w-3.5" /> Sertifikat diterbitkan
                </Badge>
                <p className="max-w-[13rem] text-xs text-muted-foreground">
                  Sertifikat dikelola dan dicetak oleh admin.
                </p>
                <Button variant="outline" onClick={() => navigate(ROUTES.riwayat)}>
                  Lihat Riwayat
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate(ROUTES.ujian)}>
                <RotateCcw className="h-4 w-4" /> Ulangi Ujian
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pembahasan */}
      <Card>
        <CardHeader>
          <CardTitle>Pembahasan Jawaban</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {review.answers.map((a, i) => (
            <div key={a.questionId} className="rounded-lg border border-border p-4">
              <p className="mb-2 font-medium">
                {i + 1}. {a.questionText}
              </p>
              <div className="space-y-1.5 text-sm">
                <p
                  className={cn(
                    'flex items-center gap-2',
                    a.isCorrect ? 'text-success' : 'text-danger',
                  )}
                >
                  {a.isCorrect ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Jawaban Anda: {a.selectedText}
                </p>
                {!a.isCorrect && (
                  <p className="flex items-center gap-2 text-success">
                    <Check className="h-4 w-4" /> Jawaban benar: {a.correctText}
                  </p>
                )}
                <p className="text-muted-foreground">{a.explanation}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
