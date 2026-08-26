import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { GateNotice } from '@/components/feedback/GateNotice';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/providers/ToastProvider';
import { useTrainingFlow } from '@/features/training/useTrainingFlow';
import { getCurrentUser } from '@/features/participant/participant.service';
import { EXAM_QUESTION_COUNT } from '@/types/domain';
import { startExam, submitExam, type ExamSession } from '../quiz.service';
import { ExamTimer } from '../components/ExamTimer';
import { ROUTES } from '@/config/routes';

export default function ExamPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const flow = useTrainingFlow();
  const user = getCurrentUser();

  const [session, setSession] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);

  const begin = useCallback(() => {
    if (!user) return;
    setSession(startExam(user.id));
    setAnswers({});
    setCurrent(0);
  }, [user]);

  const handleSubmit = useCallback(
    (auto = false) => {
      if (!session || !user) return;
      const result = submitExam({
        userId: user.id,
        startedAt: session.startedAt,
        answers: session.questions.map((q) => ({
          questionId: q.id,
          selectedOptionId: answers[q.id] ?? null,
        })),
      });
      if (auto) toast('Waktu habis — ujian otomatis dikumpulkan.', 'info');
      navigate(`/ujian/hasil/${result.id}`);
    },
    [session, user, answers, navigate, toast],
  );

  const answeredCount = useMemo(
    () => (session ? session.questions.filter((q) => answers[q.id]).length : 0),
    [session, answers],
  );

  // --- Gate: materi 100% + daftar hadir hari ini ---
  if (!flow.examUnlocked) {
    const reason = !flow.readingComplete
      ? 'Selesaikan seluruh materi (100%) terlebih dahulu.'
      : 'Isi Daftar Hadir hari ini terlebih dahulu.';
    const target = !flow.readingComplete ? ROUTES.materi : ROUTES.daftarHadir;
    return (
      <div className="space-y-6">
        <PageHeader title="Ujian" />
        <GateNotice
          title="Ujian masih terkunci"
          description={reason}
          actionLabel="Lanjutkan"
          onAction={() => navigate(target)}
        />
      </div>
    );
  }

  // --- Belum mulai: layar intro ---
  if (!session) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ujian" description="Uji pemahaman Anda terhadap materi." />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <FileQuestion className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Siap mengerjakan ujian?</p>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                {EXAM_QUESTION_COUNT} soal acak • waktu 15 menit • nilai kelulusan minimal 80.
                Bila belum lulus, Anda dapat mengulang dengan soal berbeda.
              </p>
            </div>
            <Button size="lg" onClick={begin}>
              Mulai Ujian
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- Sesi ujian berjalan ---
  const q = session.questions[current];
  const isLast = current === session.questions.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader title="Ujian" />
        <ExamTimer
          startedAt={session.startedAt}
          durationSec={session.durationSec}
          onExpire={() => handleSubmit(true)}
        />
      </div>

      <Card>
        <CardContent className="space-y-2 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              Soal {current + 1} dari {session.questions.length}
            </span>
            <span className="text-muted-foreground">{answeredCount} terjawab</span>
          </div>
          <Progress value={(answeredCount / session.questions.length) * 100} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base leading-relaxed">{q.questionText}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {q.options.map((opt) => {
            const selected = answers[q.id] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors',
                  selected
                    ? 'border-primary bg-accent'
                    : 'border-border hover:bg-muted',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    selected ? 'border-primary bg-primary' : 'border-muted-foreground/40',
                  )}
                >
                  {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                </span>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          Sebelumnya
        </Button>
        {isLast ? (
          <Button onClick={() => handleSubmit(false)}>Kumpulkan Jawaban</Button>
        ) : (
          <Button onClick={() => setCurrent((c) => c + 1)}>Berikutnya</Button>
        )}
      </div>
    </div>
  );
}
